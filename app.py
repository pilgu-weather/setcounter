import math
import os
import re
import base64
import json
from datetime import date, datetime, timedelta, timezone

from dotenv import load_dotenv
from flask import Flask, g, jsonify, redirect, render_template, request, send_from_directory
from sqlalchemy import func, inspect, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from models import (
    HealthExercise,
    HealthExcuse,
    HealthPushConfig,
    HealthPushSubscription,
    HealthReminderDispatch,
    HealthSet,
    HealthUser,
    HealthWorkout,
    db,
)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USER_KEY_PATTERN = re.compile(r"^[A-Za-z0-9._:-]{16,128}$")
REQUIRED_SCHEMA = {
    "health_users": {"id", "user_key", "created_at", "legacy_claimable"},
    "health_exercises": {"id", "name", "created_at"},
    "health_workouts": {"id", "user_id", "workout_date", "created_at", "updated_at"},
    "health_sets": {
        "id",
        "workout_id",
        "exercise_id",
        "set_index",
        "weight",
        "reps",
        "memo",
        "created_at",
    },
    "health_excuses": {
        "id",
        "user_id",
        "excuse_date",
        "excuse_text",
        "created_at",
    },
    "health_push_config": {"id", "private_key", "public_key", "created_at"},
    "health_push_subscriptions": {
        "id",
        "user_id",
        "endpoint",
        "p256dh",
        "auth",
        "created_at",
        "updated_at",
    },
    "health_reminder_dispatches": {"id", "reminder_date", "sent_count", "created_at"},
}

KST = timezone(timedelta(hours=9))


def normalize_database_url(value):
    value = (value or "").strip()
    if not value:
        raise RuntimeError("DATABASE_URL is required; SQLite fallback is disabled")
    if value.startswith("postgres://"):
        value = "postgresql://" + value[len("postgres://") :]
    if value.startswith("postgresql+psycopg2://"):
        value = "postgresql://" + value[len("postgresql+psycopg2://") :]
    if value.startswith("postgresql+psycopg://"):
        return value
    if not value.startswith("postgresql://"):
        raise RuntimeError("DATABASE_URL must point to PostgreSQL")
    return "postgresql+psycopg://" + value[len("postgresql://") :]


def validate_schema():
    schema = inspect(db.engine)
    for table_name, required_columns in REQUIRED_SCHEMA.items():
        actual = {column["name"] for column in schema.get_columns(table_name)}
        missing = required_columns - actual
        if missing:
            raise RuntimeError(
                f"{table_name} schema is incompatible; missing: {', '.join(sorted(missing))}. "
                "Run migrate_health_data.py before starting the app."
            )


def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.update(
        SQLALCHEMY_DATABASE_URI=normalize_database_url(os.environ.get("DATABASE_URL")),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SQLALCHEMY_ENGINE_OPTIONS={"pool_pre_ping": True, "pool_recycle": 300},
    )
    db.init_app(app)
    with app.app_context():
        db.create_all()
        validate_schema()
    return app


app = create_app()


def utc_now():
    return datetime.now(timezone.utc)


def parse_date(value):
    try:
        return date.fromisoformat(str(value)[:10])
    except (TypeError, ValueError):
        raise ValueError("date must use YYYY-MM-DD")


def request_user():
    if "health_user" in g:
        return g.health_user
    user_key = request.headers.get("X-User-Key", "").strip()
    if not USER_KEY_PATTERN.fullmatch(user_key):
        return None
    user = db.session.scalar(select(HealthUser).where(HealthUser.user_key == user_key))
    if user is None:
        user = HealthUser(user_key=user_key)
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            user = db.session.scalar(select(HealthUser).where(HealthUser.user_key == user_key))
    g.health_user = user
    return user


@app.before_request
def require_api_user():
    public_api_paths = {"/api/storage", "/api/reminders/send"}
    if request.path.startswith("/api/") and request.path not in public_api_paths:
        if request_user() is None:
            return jsonify({"error": "valid X-User-Key header is required"}), 400


def get_vapid_config():
    config = db.session.get(HealthPushConfig, 1)
    if config is not None:
        if config.private_key.startswith("-----BEGIN"):
            from cryptography.hazmat.primitives import serialization

            private_key = serialization.load_pem_private_key(
                config.private_key.encode("ascii"), password=None
            )
            private_value = private_key.private_numbers().private_value.to_bytes(32, "big")
            config.private_key = (
                base64.urlsafe_b64encode(private_value).rstrip(b"=").decode("ascii")
            )
            db.session.commit()
        return config
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric import ec

    private_key = ec.generate_private_key(ec.SECP256R1())
    private_value = private_key.private_numbers().private_value.to_bytes(32, "big")
    public_bytes = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint,
    )
    config = HealthPushConfig(
        id=1,
        private_key=base64.urlsafe_b64encode(private_value).rstrip(b"=").decode("ascii"),
        public_key=base64.urlsafe_b64encode(public_bytes).rstrip(b"=").decode("ascii"),
    )
    db.session.add(config)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        config = db.session.get(HealthPushConfig, 1)
    return config


def push_payload():
    return json.dumps(
        {
            "title": "Set Counter",
            "body": "오전 11시입니다. 오늘 운동 기록할 시간입니다.",
            "url": "/main",
        },
        ensure_ascii=False,
    )


def send_push(subscription, config, sender=None):
    if sender is None:
        from pywebpush import webpush

        sender = webpush
    return sender(
        subscription_info={
            "endpoint": subscription.endpoint,
            "keys": {"p256dh": subscription.p256dh, "auth": subscription.auth},
        },
        data=push_payload(),
        vapid_private_key=config.private_key,
        vapid_claims={"sub": "https://setcounter.onrender.com"},
    )


def deliver_reminders(now=None, sender=None):
    now = now or datetime.now(KST)
    if now.astimezone(KST).hour != 11:
        return {"status": "outside_window", "sent": 0}
    reminder_date = now.astimezone(KST).date()
    existing = db.session.scalar(
        select(HealthReminderDispatch).where(
            HealthReminderDispatch.reminder_date == reminder_date
        )
    )
    if existing is not None:
        return {"status": "already_sent", "sent": existing.sent_count}
    config = get_vapid_config()
    dispatch = HealthReminderDispatch(reminder_date=reminder_date, sent_count=0)
    db.session.add(dispatch)
    try:
        db.session.flush()
    except IntegrityError:
        db.session.rollback()
        return {"status": "already_sent", "sent": 0}
    subscriptions = db.session.scalars(select(HealthPushSubscription)).all()
    expired_ids = []
    sent = 0
    transient_failures = 0
    for subscription in subscriptions:
        try:
            send_push(subscription, config, sender=sender)
            sent += 1
        except Exception as error:
            app.logger.exception("Daily push delivery failed")
            status_code = getattr(getattr(error, "response", None), "status_code", None)
            if status_code in {404, 410}:
                expired_ids.append(subscription.id)
            else:
                transient_failures += 1
    if transient_failures and not sent:
        db.session.rollback()
        raise RuntimeError("all push deliveries failed; dispatch was rolled back")
    for subscription_id in expired_ids:
        subscription = db.session.get(HealthPushSubscription, subscription_id)
        if subscription is not None:
            db.session.delete(subscription)
    dispatch.sent_count = sent
    db.session.commit()
    return {
        "status": "sent",
        "sent": sent,
        "expired": len(expired_ids),
        "failed": transient_failures,
    }


def workout_query(user_id):
    return (
        select(HealthWorkout)
        .where(HealthWorkout.user_id == user_id)
        .options(joinedload(HealthWorkout.sets).joinedload(HealthSet.exercise))
    )


def load_workouts(query):
    return db.session.execute(query).unique().scalars().all()


def workout_to_log(workout):
    rows = sorted(workout.sets, key=lambda item: item.set_index)
    set_rows = [
        {
            "set": item.set_index,
            "weightKg": float(item.weight),
            "reps": item.reps,
            "volume": float(item.weight) * item.reps,
        }
        for item in rows
    ]
    exercise = rows[0].exercise.name if rows else ""
    set_reps = [row["reps"] for row in set_rows]
    set_weights = [row["weightKg"] for row in set_rows]
    return {
        "id": workout.id,
        "date": workout.workout_date.isoformat(),
        "exercise": exercise,
        "weightKg": set_weights[-1] if set_weights else 0,
        "reps": max(set_reps, default=0),
        "setReps": set_reps,
        "setWeights": set_weights,
        "setRows": set_rows,
        "totalReps": sum(set_reps),
        "volume": sum(row["volume"] for row in set_rows),
        "targetSets": len(set_rows),
        "completedSets": len(set_rows),
        "notes": rows[0].memo if rows else "",
        "createdAt": workout.created_at.isoformat().replace("+00:00", "Z"),
    }


def excuse_to_dict(excuse):
    return {
        "id": excuse.id,
        "date": excuse.excuse_date.isoformat(),
        "reason": excuse.excuse_text,
        "createdAt": excuse.created_at.isoformat().replace("+00:00", "Z"),
    }


def iso_date_range(start_key, end_key):
    current = date.fromisoformat(start_key)
    end = date.fromisoformat(end_key)
    while current <= end:
        yield current.isoformat()
        current += timedelta(days=1)


def daily_challenge_penalty(logs, excuse_dates):
    if not logs:
        return {"penalty": 0, "failedDates": [], "passedDates": []}
    first_date = min(log["date"] for log in logs)
    last_checked = (date.today() - timedelta(days=1)).isoformat()
    if first_date > last_checked:
        return {"penalty": 0, "failedDates": [], "passedDates": []}
    logs_by_date = {}
    for log in logs:
        logs_by_date.setdefault(log["date"], []).append(log)
    previous_by_exercise = {}
    failed_dates = []
    passed_dates = []
    for day_key in iso_date_range(first_date, last_checked):
        day_passed = False
        for log in sorted(logs_by_date.get(day_key, []), key=lambda item: item["createdAt"]):
            previous_volume = previous_by_exercise.get(log["exercise"])
            if previous_volume is None or log["volume"] >= previous_volume:
                day_passed = True
            previous_by_exercise[log["exercise"]] = log["volume"]
        if day_passed:
            passed_dates.append(day_key)
        elif day_key not in excuse_dates:
            failed_dates.append(day_key)
    return {"penalty": len(failed_dates), "failedDates": failed_dates, "passedDates": passed_dates}


def stats_from_logs(logs, excuse_dates):
    previous_by_exercise = {}
    level_changes = ups = downs = 0
    for log in logs:
        previous = previous_by_exercise.get(log["exercise"])
        if previous is not None:
            if log["volume"] > previous:
                level_changes += 1
                ups += 1
            elif log["volume"] < previous:
                level_changes -= 1
                downs += 1
        previous_by_exercise[log["exercise"]] = log["volume"]
    challenge = daily_challenge_penalty(logs, excuse_dates)
    return {
        "level": max(level_changes + 1 - challenge["penalty"], 1),
        "rule": "previous_record_delta_with_daily_challenge",
        "levelUps": ups,
        "levelDowns": downs,
        "dailyPenalty": challenge["penalty"],
        "failedDates": challenge["failedDates"],
        "passedDates": challenge["passedDates"],
        "trackedExercises": len(previous_by_exercise),
        "totalRecords": len(logs),
        "totalVolume": sum(log["volume"] for log in logs),
        "totalReps": sum(log["totalReps"] for log in logs),
        "totalSets": sum(log["completedSets"] for log in logs),
        "progressPercent": 100 if logs else 0,
        "latestRecords": [
            {"exercise": exercise, "volume": volume}
            for exercise, volume in sorted(previous_by_exercise.items())
        ],
    }


def volume_stats(user_id):
    workouts = load_workouts(
        workout_query(user_id).order_by(
            HealthWorkout.workout_date.asc(),
            HealthWorkout.created_at.asc(),
            HealthWorkout.id.asc(),
        )
    )
    logs = [workout_to_log(workout) for workout in workouts]
    excuses = db.session.scalars(select(HealthExcuse).where(HealthExcuse.user_id == user_id)).all()
    return stats_from_logs(logs, {item.excuse_date.isoformat() for item in excuses})


def claim_legacy_records(user):
    legacy = db.session.scalar(
        select(HealthUser)
        .where(HealthUser.legacy_claimable.is_(True))
        .with_for_update()
    )
    if legacy is None:
        return False
    if legacy.id == user.id:
        legacy.legacy_claimable = False
        db.session.commit()
        return True
    current_workouts = db.session.scalar(
        select(func.count()).select_from(HealthWorkout).where(HealthWorkout.user_id == user.id)
    )
    current_excuses = db.session.scalar(
        select(func.count()).select_from(HealthExcuse).where(HealthExcuse.user_id == user.id)
    )
    if current_workouts or current_excuses:
        return False
    db.session.execute(
        update(HealthWorkout).where(HealthWorkout.user_id == legacy.id).values(user_id=user.id)
    )
    db.session.execute(
        update(HealthExcuse).where(HealthExcuse.user_id == legacy.id).values(user_id=user.id)
    )
    legacy.legacy_claimable = False
    db.session.delete(legacy)
    db.session.commit()
    return True


@app.route("/")
def index():
    return redirect("/main")


@app.route("/main")
def main():
    return render_template("main.html")


@app.route("/service-worker.js")
def service_worker():
    response = send_from_directory(BASE_DIR + "/static", "service-worker.js", mimetype="application/javascript")
    response.headers["Service-Worker-Allowed"] = "/"
    response.headers["Cache-Control"] = "no-cache"
    return response


@app.route("/healthz")
def healthz():
    db.session.execute(select(1))
    return "ok", 200


@app.route("/api/logs", methods=["GET"])
def list_logs():
    user = request_user()
    query = workout_query(user.id)
    month = request.args.get("month", "").strip()
    if month:
        try:
            start = date.fromisoformat(f"{month}-01")
            end = date(start.year + (start.month == 12), (start.month % 12) + 1, 1)
        except ValueError:
            return jsonify({"error": "month must use YYYY-MM"}), 400
        query = query.where(HealthWorkout.workout_date >= start, HealthWorkout.workout_date < end)
    workouts = load_workouts(
        query.order_by(HealthWorkout.workout_date.desc(), HealthWorkout.id.desc())
    )
    return jsonify([workout_to_log(workout) for workout in workouts])


@app.route("/api/logs/day", methods=["GET"])
def list_day_logs():
    user = request_user()
    try:
        day = parse_date(request.args.get("date") or date.today().isoformat())
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    workouts = load_workouts(
        workout_query(user.id)
        .where(HealthWorkout.workout_date == day)
        .order_by(HealthWorkout.created_at.desc(), HealthWorkout.id.desc())
    )
    return jsonify([workout_to_log(workout) for workout in workouts])


@app.route("/api/logs/latest", methods=["GET"])
def latest_log():
    user = request_user()
    exercise = request.args.get("exercise", "").strip()
    if not exercise:
        return jsonify(None)
    query = (
        workout_query(user.id)
        .join(HealthSet, HealthSet.workout_id == HealthWorkout.id)
        .join(HealthExercise, HealthExercise.id == HealthSet.exercise_id)
        .where(HealthExercise.name == exercise)
    )
    before = request.args.get("before", "").strip()
    if before:
        try:
            query = query.where(HealthWorkout.workout_date < parse_date(before))
        except ValueError as error:
            return jsonify({"error": str(error)}), 400
    workout = db.session.execute(
        query.order_by(
            HealthWorkout.workout_date.desc(),
            HealthWorkout.created_at.desc(),
            HealthWorkout.id.desc(),
        ).limit(1)
    ).unique().scalars().first()
    return jsonify(workout_to_log(workout) if workout else None)


@app.route("/api/stats", methods=["GET"])
def stats():
    return jsonify(volume_stats(request_user().id))


@app.route("/api/bootstrap", methods=["GET"])
def bootstrap():
    user = request_user()
    claimed = claim_legacy_records(user)
    workouts = load_workouts(
        workout_query(user.id).order_by(
            HealthWorkout.workout_date.asc(),
            HealthWorkout.created_at.asc(),
            HealthWorkout.id.asc(),
        )
    )
    logs = [workout_to_log(workout) for workout in workouts]
    excuses = db.session.scalars(
        select(HealthExcuse)
        .where(HealthExcuse.user_id == user.id)
        .order_by(HealthExcuse.excuse_date.asc())
    ).all()
    excuse_rows = [excuse_to_dict(item) for item in excuses]
    month = request.args.get("month", "").strip()
    month_logs = [item for item in logs if not month or item["date"].startswith(f"{month}-")]
    month_excuses = [
        item for item in excuse_rows if not month or item["date"].startswith(f"{month}-")
    ]
    before = None
    before_value = request.args.get("before", "").strip()
    if before_value:
        try:
            before = parse_date(before_value).isoformat()
        except ValueError as error:
            return jsonify({"error": str(error)}), 400
    latest_by_exercise = {}
    for item in logs:
        if before is not None and item["date"] >= before:
            continue
        latest_by_exercise[item["exercise"]] = item
    return jsonify(
        {
            "claimedLegacy": claimed,
            "logs": list(reversed(month_logs)),
            "excuses": list(reversed(month_excuses)),
            "latestByExercise": latest_by_exercise,
            "stats": stats_from_logs(logs, {item["date"] for item in excuse_rows}),
        }
    )


@app.route("/api/storage", methods=["GET"])
def storage_status():
    return jsonify({"backend": "postgres", "persistent": True, "render": bool(os.environ.get("RENDER"))})


@app.route("/api/push/vapid-public-key", methods=["GET"])
def vapid_public_key():
    return jsonify({"publicKey": get_vapid_config().public_key})


@app.route("/api/push/subscribe", methods=["POST"])
def subscribe_push():
    user = request_user()
    payload = request.get_json(silent=True) or {}
    endpoint = str(payload.get("endpoint", "")).strip()
    keys = payload.get("keys") or {}
    p256dh = str(keys.get("p256dh", "")).strip()
    auth = str(keys.get("auth", "")).strip()
    if not endpoint or not p256dh or not auth:
        return jsonify({"error": "valid push subscription is required"}), 400
    subscription = db.session.scalar(
        select(HealthPushSubscription).where(HealthPushSubscription.endpoint == endpoint)
    )
    if subscription is None:
        subscription = HealthPushSubscription(endpoint=endpoint)
        db.session.add(subscription)
    subscription.user_id = user.id
    subscription.p256dh = p256dh
    subscription.auth = auth
    subscription.updated_at = utc_now()
    db.session.commit()
    return jsonify({"subscribed": True}), 201


@app.route("/api/push/unsubscribe", methods=["POST"])
def unsubscribe_push():
    user = request_user()
    payload = request.get_json(silent=True) or {}
    endpoint = str(payload.get("endpoint", "")).strip()
    subscription = db.session.scalar(
        select(HealthPushSubscription).where(
            HealthPushSubscription.user_id == user.id,
            HealthPushSubscription.endpoint == endpoint,
        )
    )
    if subscription is not None:
        db.session.delete(subscription)
        db.session.commit()
    return "", 204


@app.route("/api/push/test", methods=["POST"])
def test_push():
    user = request_user()
    subscriptions = db.session.scalars(
        select(HealthPushSubscription).where(HealthPushSubscription.user_id == user.id)
    ).all()
    config = get_vapid_config()
    sent = 0
    error_type = None
    for subscription in subscriptions:
        try:
            send_push(subscription, config)
            sent += 1
        except Exception as error:
            app.logger.exception("Test push delivery failed")
            error_type = type(error).__name__
    if subscriptions and not sent:
        return jsonify(
            {
                "error": "테스트 푸시 전송에 실패했습니다.",
                "errorType": error_type,
                "sent": 0,
            }
        ), 502
    return jsonify({"sent": sent})


@app.route("/api/reminders/send", methods=["POST"])
def send_daily_reminders():
    return jsonify(deliver_reminders())


@app.route("/api/excuses", methods=["GET"])
def list_excuses():
    user = request_user()
    query = select(HealthExcuse).where(HealthExcuse.user_id == user.id)
    month = request.args.get("month", "").strip()
    if month:
        try:
            start = date.fromisoformat(f"{month}-01")
            end = date(start.year + (start.month == 12), (start.month % 12) + 1, 1)
        except ValueError:
            return jsonify({"error": "month must use YYYY-MM"}), 400
        query = query.where(HealthExcuse.excuse_date >= start, HealthExcuse.excuse_date < end)
    excuses = db.session.scalars(query.order_by(HealthExcuse.excuse_date.desc())).all()
    return jsonify([excuse_to_dict(item) for item in excuses])


@app.route("/api/excuses", methods=["POST"])
def create_excuse():
    user = request_user()
    payload = request.get_json(silent=True) or {}
    reason = str(payload.get("reason", "")).strip()
    if not reason:
        return jsonify({"error": "reason is required"}), 400
    try:
        excuse_date = parse_date(payload.get("date") or date.today().isoformat())
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    excuse = db.session.scalar(
        select(HealthExcuse).where(
            HealthExcuse.user_id == user.id, HealthExcuse.excuse_date == excuse_date
        )
    )
    if excuse is None:
        excuse = HealthExcuse(user_id=user.id, excuse_date=excuse_date)
        db.session.add(excuse)
    excuse.excuse_text = reason
    excuse.created_at = utc_now()
    db.session.commit()
    return jsonify(excuse_to_dict(excuse)), 201


def normalized_set_data(payload, exercise):
    step = 4 if exercise == "중량가방 푸쉬업" else 8
    raw_weight = max(float(payload.get("weightKg", step)), step)
    fallback_weight = max(math.floor(raw_weight / step + 0.5) * step, step)
    raw_reps = payload.get("setReps", [])
    raw_weights = payload.get("setWeights", [])
    if not isinstance(raw_reps, list) or not isinstance(raw_weights, list):
        raise ValueError
    reps = [max(int(value), 0) for value in raw_reps if str(value).strip()]
    weights = [
        max(math.floor(max(float(value), step) / step + 0.5) * step, step)
        for value in raw_weights
        if str(value).strip()
    ]
    if not reps:
        fallback_reps = max(int(payload.get("reps", 0)), 0)
        completed = max(int(payload.get("completedSets", payload.get("targetSets", 1))), 0)
        reps = [fallback_reps] * completed if fallback_reps else []
    if len(weights) < len(reps):
        weights.extend([fallback_weight] * (len(reps) - len(weights)))
    if not reps:
        raise ValueError
    return list(zip(weights[: len(reps)], reps))


@app.route("/api/logs", methods=["POST"])
def create_log():
    user = request_user()
    payload = request.get_json(silent=True) or {}
    exercise_name = str(payload.get("exercise", "")).strip()
    if not exercise_name:
        return jsonify({"error": "exercise is required"}), 400
    try:
        workout_date = parse_date(payload.get("date") or date.today().isoformat())
        set_data = normalized_set_data(payload, exercise_name)
    except (TypeError, ValueError):
        return jsonify({"error": "valid date, weight, reps, and completed sets are required"}), 400
    exercise = db.session.scalar(select(HealthExercise).where(HealthExercise.name == exercise_name))
    if exercise is None:
        exercise = HealthExercise(name=exercise_name)
        db.session.add(exercise)
        db.session.flush()
    workout = HealthWorkout(user_id=user.id, workout_date=workout_date)
    db.session.add(workout)
    db.session.flush()
    memo = str(payload.get("notes", "")).strip()
    for index, (weight, reps) in enumerate(set_data, start=1):
        workout.sets.append(
            HealthSet(exercise_id=exercise.id, set_index=index, weight=weight, reps=reps, memo=memo)
        )
    db.session.commit()
    return jsonify(workout_to_log(workout)), 201


@app.route("/api/logs/<int:log_id>", methods=["DELETE"])
def delete_log(log_id):
    user = request_user()
    workout = db.session.scalar(
        select(HealthWorkout).where(HealthWorkout.id == log_id, HealthWorkout.user_id == user.id)
    )
    if workout is None:
        return jsonify({"error": "not found"}), 404
    db.session.delete(workout)
    db.session.commit()
    return "", 204


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
