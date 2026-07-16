import math
import os
import re
import base64
import json
import hmac
import secrets
from urllib import request as urlrequest
from urllib.error import URLError
from datetime import date, datetime, timedelta, timezone

from dotenv import load_dotenv
from flask import Flask, g, jsonify, redirect, render_template, request, send_from_directory, session
from sqlalchemy import func, inspect, select, text, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from werkzeug.security import check_password_hash, generate_password_hash

from models import (
    AuthAccount,
    HealthBoardComment,
    HealthBoardLike,
    HealthBoardPost,
    HealthBoardReport,
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
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
NICKNAME_PATTERN = re.compile(r"^[0-9A-Za-z가-힣_]{2,12}$")
NICKNAME_CHANGE_INTERVAL = timedelta(days=7)
FORBIDDEN_NICKNAME_WORDS = {
    "admin",
    "administrator",
    "setcounter",
    "운영자",
    "관리자",
    "씨발",
    "시발",
    "ㅅㅂ",
    "병신",
    "븅신",
    "개새",
    "새끼",
    "좆",
    "존나",
    "꺼져",
    "죽어",
    "자살",
    "느금",
    "애미",
    "애비",
    "보지",
    "자지",
}
MAX_EXERCISE_NAME_LENGTH = 120
MAX_MEMO_LENGTH = 500
MAX_SETS_PER_WORKOUT = 30
MAX_REPS_PER_SET = 1000
MAX_WEIGHT_KG = 2000
MAX_COMPLAINT_LENGTH = 1200
MAX_BOARD_POST_LENGTH = 180
MAX_BOARD_COMMENT_LENGTH = 120
MAX_BOARD_REPORT_LENGTH = 500
MAX_BOARD_POSTS_PER_PAGE = 50
CHEAT_WARNING_LIMIT = 2
CHEAT_PENALTY_THRESHOLD = 3
COMPLAINT_EMAIL = ""
REQUIRED_SCHEMA = {
    "auth_accounts": {
        "id",
        "email",
        "password_hash",
        "email_verified",
        "status",
        "provider",
        "provider_user_id",
        "created_at",
        "updated_at",
        "last_login_at",
    },
    "health_users": {
        "id",
        "user_key",
        "nickname",
        "nickname_updated_at",
        "created_at",
        "legacy_claimable",
        "account_id",
        "is_anonymous",
        "last_seen_at",
    },
    "health_exercises": {"id", "name", "created_at"},
    "health_workouts": {
        "id",
        "user_id",
        "workout_date",
        "created_at",
        "updated_at",
        "suspicion_score",
        "suspicion_flags",
    },
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
    "health_board_posts": {"id", "user_id", "level", "nickname", "content", "created_at"},
    "health_board_likes": {"id", "post_id", "user_id", "created_at"},
    "health_board_comments": {"id", "post_id", "user_id", "level", "nickname", "content", "created_at"},
    "health_board_reports": {"id", "reporter_user_id", "post_id", "comment_id", "reason", "created_at"},
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
        if os.environ.get("SETCOUNTER_ALLOW_LOCAL_SQLITE") == "1":
            return "sqlite:///" + os.path.join(BASE_DIR, "app.sqlite3").replace("\\", "/")
        raise RuntimeError("DATABASE_URL is required; SQLite fallback is disabled")
    if value.startswith("sqlite:///"):
        if os.environ.get("SETCOUNTER_ALLOW_LOCAL_SQLITE") == "1":
            return value
        raise RuntimeError("SQLite is allowed only for local preview")
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
                "Run the applicable explicit migration script before starting the app."
            )


def upgrade_schema():
    schema = inspect(db.engine)
    if "health_users" not in schema.get_table_names():
        return
    user_columns = {column["name"] for column in schema.get_columns("health_users")}
    workout_columns = {column["name"] for column in schema.get_columns("health_workouts")}
    with db.engine.begin() as connection:
        if "nickname" not in user_columns:
            connection.execute(text("ALTER TABLE health_users ADD COLUMN nickname VARCHAR(24)"))
        if "nickname_updated_at" not in user_columns:
            connection.execute(text("ALTER TABLE health_users ADD COLUMN nickname_updated_at TIMESTAMPTZ"))
        if "suspicion_score" not in workout_columns:
            connection.execute(
                text("ALTER TABLE health_workouts ADD COLUMN suspicion_score INTEGER NOT NULL DEFAULT 0")
            )
        if "suspicion_flags" not in workout_columns:
            connection.execute(
                text("ALTER TABLE health_workouts ADD COLUMN suspicion_flags TEXT NOT NULL DEFAULT '[]'")
            )
        if db.engine.url.get_backend_name() == "sqlite":
            connection.execute(
                text(
                    """
                    UPDATE health_users
                    SET nickname='테스트'
                    WHERE nickname IS NULL
                      AND (
                        EXISTS (SELECT 1 FROM health_workouts w WHERE w.user_id = health_users.id)
                        OR EXISTS (SELECT 1 FROM health_excuses e WHERE e.user_id = health_users.id)
                      )
                    """
                )
            )
        else:
            connection.execute(
                text(
                    """
                    UPDATE health_users u
                    SET nickname='테스트'
                    WHERE u.nickname IS NULL
                      AND (
                        EXISTS (SELECT 1 FROM health_workouts w WHERE w.user_id = u.id)
                        OR EXISTS (SELECT 1 FROM health_excuses e WHERE e.user_id = u.id)
                      )
                    """
                )
            )


def create_app():
    load_dotenv()
    secret_key = os.environ.get("SECRET_KEY", "").strip()
    if not secret_key:
        raise RuntimeError("SECRET_KEY is required")
    app = Flask(__name__)
    app.config.update(
        SECRET_KEY=secret_key,
        SQLALCHEMY_DATABASE_URI=normalize_database_url(os.environ.get("DATABASE_URL")),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SQLALCHEMY_ENGINE_OPTIONS={"pool_pre_ping": True, "pool_recycle": 300},
        TEMPLATES_AUTO_RELOAD=True,
        MAX_CONTENT_LENGTH=64 * 1024,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("SETCOUNTER_SESSION_COOKIE_SECURE") == "1",
    )
    app.jinja_env.auto_reload = True
    db.init_app(app)
    with app.app_context():
        # Existing databases must be changed by an explicit migration, never at app startup.
        if "health_users" not in inspect(db.engine).get_table_names():
            db.create_all()
        validate_schema()
    return app


app = create_app()


def utc_now():
    return datetime.now(timezone.utc)


def today_kst():
    return datetime.now(KST).date()


@app.after_request
def add_release_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=()",
    )
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self'; "
        "img-src 'self' data:; "
        "connect-src 'self'; "
        "manifest-src 'self'; "
        "worker-src 'self'; "
        "base-uri 'self'; "
        "frame-ancestors 'none'",
    )
    return response


def parse_date(value):
    try:
        return date.fromisoformat(str(value)[:10])
    except (TypeError, ValueError):
        raise ValueError("date must use YYYY-MM-DD")


def request_anonymous_user():
    """Resolve only an unlinked legacy/anonymous user from the browser key."""
    if "anonymous_health_user" in g:
        return g.anonymous_health_user
    user_key = request.headers.get("X-User-Key", "").strip()
    if not USER_KEY_PATTERN.fullmatch(user_key):
        return None
    user = db.session.scalar(select(HealthUser).where(HealthUser.user_key == user_key))
    if user is not None and user.account_id is not None:
        # A key from an account-linked profile is never an authentication credential.
        return None
    if user is None:
        user = HealthUser(user_key=user_key, is_anonymous=True)
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            user = db.session.scalar(select(HealthUser).where(HealthUser.user_key == user_key))
            if user is not None and user.account_id is not None:
                return None
    g.anonymous_health_user = user
    return user


def get_current_health_user():
    """Resolve the signed-in account first, then an unlinked anonymous profile."""
    if "current_health_user" in g:
        return g.current_health_user
    account_id = session.get("account_id")
    if account_id is not None:
        try:
            account_id = int(account_id)
        except (TypeError, ValueError):
            session.clear()
            return None
        user = db.session.scalar(select(HealthUser).where(HealthUser.account_id == account_id))
        if user is None:
            session.clear()
            return None
        g.current_health_user = user
        return user
    user = request_anonymous_user()
    if user is not None:
        g.current_health_user = user
    return user


def request_user():
    """Compatibility wrapper while endpoint ownership moves to session-aware lookup."""
    return get_current_health_user()


def normalize_email(value):
    email = str(value or "").strip().lower()
    if not EMAIL_PATTERN.fullmatch(email) or len(email) > 320:
        raise ValueError("유효한 이메일 주소를 입력해주세요.")
    return email


def mask_email(email):
    local, _, domain = email.partition("@")
    visible = local[:1] if local else ""
    return f"{visible}{'*' * max(len(local) - 1, 1)}@{domain}"


def csrf_token_for_session():
    token = session.get("csrf_token")
    if not token:
        token = secrets.token_urlsafe(32)
        session["csrf_token"] = token
    return token


def require_auth_csrf():
    expected = session.get("csrf_token", "")
    supplied = request.headers.get("X-CSRF-Token", "")
    if not expected or not supplied or not hmac.compare_digest(expected, supplied):
        return jsonify({"error": "csrf_invalid"}), 403
    return None


def get_user_data_summary(user):
    """Count meaningful user-owned data without treating an empty profile as a conflict."""
    workout_count = db.session.scalar(
        select(func.count()).select_from(HealthWorkout).where(HealthWorkout.user_id == user.id)
    ) or 0
    set_count = db.session.scalar(
        select(func.count())
        .select_from(HealthSet)
        .join(HealthWorkout, HealthSet.workout_id == HealthWorkout.id)
        .where(HealthWorkout.user_id == user.id)
    ) or 0
    excuse_count = db.session.scalar(
        select(func.count()).select_from(HealthExcuse).where(HealthExcuse.user_id == user.id)
    ) or 0
    post_count = db.session.scalar(
        select(func.count()).select_from(HealthBoardPost).where(HealthBoardPost.user_id == user.id)
    ) or 0
    comment_count = db.session.scalar(
        select(func.count()).select_from(HealthBoardComment).where(HealthBoardComment.user_id == user.id)
    ) or 0
    like_count = db.session.scalar(
        select(func.count()).select_from(HealthBoardLike).where(HealthBoardLike.user_id == user.id)
    ) or 0
    has_profile_activity = bool(user.nickname and user.nickname_updated_at)
    has_data = any((workout_count, set_count, excuse_count, post_count, comment_count, like_count, has_profile_activity))
    return {
        "workoutCount": workout_count,
        "setCount": set_count,
        "excuseCount": excuse_count,
        "postCount": post_count,
        "commentCount": comment_count,
        "likeCount": like_count,
        "hasProfileActivity": has_profile_activity,
        "hasData": has_data,
    }


def nickname_available_at(user):
    if not user.nickname or user.nickname_updated_at is None:
        return None
    updated_at = user.nickname_updated_at
    if updated_at.tzinfo is None:
        updated_at = updated_at.replace(tzinfo=timezone.utc)
    return updated_at + NICKNAME_CHANGE_INTERVAL


def validate_nickname(value):
    nickname = str(value or "").strip()
    compact = re.sub(r"\s+", "", nickname)
    if nickname != compact:
        raise ValueError("닉네임에는 공백을 넣을 수 없습니다")
    if not NICKNAME_PATTERN.fullmatch(nickname):
        raise ValueError("닉네임은 한글, 영문, 숫자, _ 조합 2~12자로 입력하세요")
    lowered = nickname.lower()
    for word in FORBIDDEN_NICKNAME_WORDS:
        if word in lowered:
            raise ValueError("사용할 수 없는 단어가 포함되어 있습니다")
    return nickname


def profile_to_dict(user, stats=None):
    available_at = nickname_available_at(user)
    now = utc_now()
    can_change = not user.nickname or available_at is None or now >= available_at
    return {
        "nickname": user.nickname,
        "nicknameRequired": not bool(user.nickname),
        "canChangeNickname": can_change,
        "nextNicknameChangeAt": (
            available_at.isoformat().replace("+00:00", "Z")
            if available_at and not can_change
            else None
        ),
        "level": stats["level"] if stats else None,
    }


def send_discord_message(lines):
    webhook_url = os.environ.get("DISCORD_COMPLAINT_WEBHOOK_URL", "").strip()
    if not webhook_url:
        raise RuntimeError("DISCORD_COMPLAINT_WEBHOOK_URL is not configured")
    payload = {"content": "\n".join(lines)}
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    request_data = urlrequest.Request(
        webhook_url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlrequest.urlopen(request_data, timeout=5) as response:
            if response.status >= 400:
                raise RuntimeError(f"Discord webhook failed with {response.status}")
    except URLError as error:
        raise RuntimeError("Discord webhook request failed") from error


def send_discord_complaint(user, message, stats, category="complaint"):
    nickname = user.nickname or "닉네임 없음"
    title = "Set Counter 피드백 접수" if category == "feedback" else "Set Counter 이의제기 접수"
    send_discord_message(
        [
            title,
            f"닉네임: {nickname}",
            f"레벨: {stats.get('level')}",
            f"부정 페널티: {stats.get('cheatPenalty', 0)}",
            f"의심 기록 수: {stats.get('cheatSuspicionCount', 0)}",
            f"사용자 ID: {user.id}",
            f"내용: {message}",
        ]
    )


def send_discord_board_report(user, post, comment, reason):
    nickname = user.nickname or "닉네임 없음"
    lines = [
        "Set Counter 게시판 신고 접수",
        f"신고자: {nickname} (user_id={user.id})",
        f"게시글 ID: {post.id}",
        f"게시글 작성자: {post.nickname} / LV.{post.level}",
        f"게시글 내용: {post.content}",
    ]
    if comment is not None:
        lines.extend(
            [
                f"댓글 ID: {comment.id}",
                f"댓글 작성자: {comment.nickname} / LV.{comment.level}",
                f"댓글 내용: {comment.content}",
            ]
        )
    lines.append(f"신고 사유: {reason}")
    send_discord_message(lines)


@app.before_request
def require_api_user():
    public_api_paths = {
        "/api/storage",
        "/api/reminders/send",
        "/api/auth/status",
        "/api/auth/register",
        "/api/auth/login",
        "/api/auth/logout",
    }
    if request.path.startswith("/api/") and request.path not in public_api_paths:
        if get_current_health_user() is None:
            return jsonify({"error": "authentication or a valid anonymous X-User-Key is required"}), 401


@app.errorhandler(413)
def request_too_large(_error):
    return jsonify({"error": "request body is too large"}), 413


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


def parsed_suspicion_flags(value):
    try:
        flags = json.loads(value or "[]")
        return flags if isinstance(flags, list) else []
    except (TypeError, ValueError):
        return []


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
        "suspicionScore": workout.suspicion_score or 0,
        "suspicionFlags": parsed_suspicion_flags(workout.suspicion_flags),
        "createdAt": workout.created_at.isoformat().replace("+00:00", "Z"),
    }


def excuse_to_dict(excuse):
    return {
        "id": excuse.id,
        "date": excuse.excuse_date.isoformat(),
        "reason": excuse.excuse_text,
        "createdAt": excuse.created_at.isoformat().replace("+00:00", "Z"),
    }


def board_comment_to_dict(comment):
    return {
        "id": comment.id,
        "postId": comment.post_id,
        "level": comment.level,
        "nickname": comment.nickname,
        "author": f"{comment.level} {comment.nickname}",
        "content": comment.content,
        "createdAt": comment.created_at.isoformat().replace("+00:00", "Z"),
    }


def board_post_to_dict(post, current_user_id=None, like_counts=None, comments_by_post=None, liked_post_ids=None):
    like_counts = like_counts or {}
    comments_by_post = comments_by_post or {}
    liked_post_ids = liked_post_ids or set()
    comments = comments_by_post.get(post.id, [])
    return {
        "id": post.id,
        "level": post.level,
        "nickname": post.nickname,
        "author": f"{post.level} {post.nickname}",
        "content": post.content,
        "createdAt": post.created_at.isoformat().replace("+00:00", "Z"),
        "likeCount": like_counts.get(post.id, 0),
        "likedByMe": post.id in liked_post_ids,
        "commentCount": len(comments),
        "comments": [board_comment_to_dict(comment) for comment in comments],
    }


def load_board_post_dicts(user_id, sort="latest"):
    posts = db.session.scalars(
        select(HealthBoardPost).order_by(HealthBoardPost.created_at.desc()).limit(MAX_BOARD_POSTS_PER_PAGE)
    ).all()
    post_ids = [post.id for post in posts]
    like_counts = {}
    comments_by_post = {}
    liked_post_ids = set()
    if post_ids:
        like_rows = db.session.execute(
            select(HealthBoardLike.post_id, func.count(HealthBoardLike.id))
            .where(HealthBoardLike.post_id.in_(post_ids))
            .group_by(HealthBoardLike.post_id)
        ).all()
        like_counts = {post_id: count for post_id, count in like_rows}
        liked_post_ids = {
            row[0]
            for row in db.session.execute(
                select(HealthBoardLike.post_id).where(
                    HealthBoardLike.post_id.in_(post_ids),
                    HealthBoardLike.user_id == user_id,
                )
            ).all()
        }
        comments = db.session.scalars(
            select(HealthBoardComment)
            .where(HealthBoardComment.post_id.in_(post_ids))
            .order_by(HealthBoardComment.created_at.asc())
        ).all()
        for comment in comments:
            comments_by_post.setdefault(comment.post_id, []).append(comment)
    if sort == "popular":
        posts.sort(
            key=lambda post: (
                like_counts.get(post.id, 0) * 2 + len(comments_by_post.get(post.id, [])),
                post.created_at,
            ),
            reverse=True,
        )
    return [
        board_post_to_dict(
            post,
            current_user_id=user_id,
            like_counts=like_counts,
            comments_by_post=comments_by_post,
            liked_post_ids=liked_post_ids,
        )
        for post in posts
    ]


def suspicious_training_flags(candidate, previous_logs):
    flags = []
    previous_same = [log for log in previous_logs if log["exercise"] == candidate["exercise"]]
    previous = previous_same[-1] if previous_same else None
    if previous and previous["volume"] > 0 and candidate["volume"] >= previous["volume"] * 2:
        flags.append("previous_volume_doubled")
    if previous:
        previous_max_weight = max(previous["setWeights"], default=0)
        candidate_max_weight = max(candidate["setWeights"], default=0)
        if (
            previous_max_weight > 0
            and candidate_max_weight >= previous_max_weight * 1.75
            and candidate_max_weight - previous_max_weight >= 16
        ):
            flags.append("weight_spike")
    daily_totals = {}
    for log in previous_logs:
        daily_totals[log["date"]] = daily_totals.get(log["date"], 0) + log["volume"]
    previous_day_totals = [volume for day, volume in daily_totals.items() if day < candidate["date"]]
    if len(previous_day_totals) >= 3:
        average_daily = sum(previous_day_totals) / len(previous_day_totals)
        candidate_day_total = daily_totals.get(candidate["date"], 0) + candidate["volume"]
        if average_daily > 0 and candidate_day_total >= average_daily * 3 and candidate_day_total >= average_daily + 1000:
            flags.append("daily_volume_outlier")
    if (
        candidate["completedSets"] > 12
        or candidate["totalReps"] > 300
        or max(candidate["setReps"], default=0) > 100
    ):
        flags.append("extreme_sets_or_reps")
    return flags


def cheat_penalty_from_logs(logs):
    suspicious_count = sum(1 for log in logs if log.get("suspicionScore", 0) > 0)
    return suspicious_count if suspicious_count >= CHEAT_PENALTY_THRESHOLD else 0


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
    last_checked = (datetime.now(KST).date() - timedelta(days=1)).isoformat()
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


def breakthrough_rate_for_level(level):
    if level >= 90:
        return 0.05
    if level >= 80:
        return 0.1
    if level >= 70:
        return 0.16
    if level >= 60:
        return 0.25
    if level >= 50:
        return 0.35
    if level >= 40:
        return 0.5
    if level >= 30:
        return 0.65
    if level >= 20:
        return 0.8
    if level >= 15:
        return 0.85
    if level >= 10:
        return 0.9
    return 1


def stats_from_logs(logs, excuse_dates):
    previous_by_exercise = {}
    xp = 0.0
    ups = downs = 0
    for log in logs:
        previous = previous_by_exercise.get(log["exercise"])
        if previous is not None:
            if log["volume"] > previous:
                current_level = max(math.floor(xp) + 1, 1)
                if current_level >= 20:
                    xp += 0.8
                elif current_level >= 15:
                    xp += 0.85
                elif current_level >= 10:
                    xp += 0.9
                else:
                    xp += 1
                ups += 1
            elif log["volume"] < previous:
                xp -= 1
                downs += 1
        previous_by_exercise[log["exercise"]] = log["volume"]
    challenge = daily_challenge_penalty(logs, excuse_dates)
    suspicious_count = sum(1 for log in logs if log.get("suspicionScore", 0) > 0)
    cheat_penalty = cheat_penalty_from_logs(logs)
    total_penalty = challenge["penalty"] + cheat_penalty
    total_xp = max(xp - total_penalty, 0)
    if total_xp >= 98:
        level = 99
        progress = 1
    else:
        level = max(math.floor(total_xp) + 1, 1)
        progress = total_xp - math.floor(total_xp)
    return {
        "level": level,
        "rule": "weighted_previous_record_delta_with_daily_challenge_and_cheat_guard",
        "levelUps": ups,
        "levelDowns": downs,
        "experience": round(total_xp, 2),
        "experiencePercent": round(progress * 100, 1),
        "nextBreakthroughRate": breakthrough_rate_for_level(level),
        "dailyPenalty": challenge["penalty"],
        "cheatWarnings": min(suspicious_count, CHEAT_WARNING_LIMIT),
        "cheatSuspicionCount": suspicious_count,
        "cheatPenalty": cheat_penalty,
        "cheatPenaltyThreshold": CHEAT_PENALTY_THRESHOLD,
        "complaintEmail": COMPLAINT_EMAIL,
        "failedDates": challenge["failedDates"],
        "passedDates": challenge["passedDates"],
        "trackedExercises": len(previous_by_exercise),
        "totalRecords": len(logs),
        "totalVolume": sum(log["volume"] for log in logs),
        "totalReps": sum(log["totalReps"] for log in logs),
        "totalSets": sum(log["completedSets"] for log in logs),
        "progressPercent": round(progress * 100, 1) if logs else 0,
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
    # This is a one-time recovery path for the pre-account anonymous import only.
    # It must never transfer data into an account-linked profile.
    if user.account_id is not None or not user.is_anonymous:
        return False
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
        day = parse_date(request.args.get("date") or today_kst().isoformat())
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


@app.route("/api/profile", methods=["GET"])
def get_profile():
    user = request_user()
    return jsonify(profile_to_dict(user, volume_stats(user.id)))


@app.route("/api/profile", methods=["POST"])
def update_profile():
    user = request_user()
    payload = request.get_json(silent=True) or {}
    try:
        nickname = validate_nickname(payload.get("nickname"))
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    if nickname == user.nickname:
        return jsonify(profile_to_dict(user, volume_stats(user.id)))
    available_at = nickname_available_at(user)
    now = utc_now()
    if user.nickname and available_at is not None and now < available_at:
        return jsonify(
            {
                "error": "닉네임은 7일에 한 번만 변경할 수 있습니다",
                "nextNicknameChangeAt": available_at.isoformat().replace("+00:00", "Z"),
            }
        ), 429
    user.nickname = nickname
    user.nickname_updated_at = now
    db.session.commit()
    return jsonify(profile_to_dict(user, volume_stats(user.id)))


@app.route("/api/auth/status", methods=["GET"])
def auth_status():
    csrf_token = csrf_token_for_session()
    account_id = session.get("account_id")
    if account_id is not None:
        user = get_current_health_user()
        if user is not None and user.account is not None:
            return jsonify(
                {
                    "authenticated": True,
                    "anonymous": False,
                    "accountLinked": True,
                    "emailMasked": mask_email(user.account.email),
                    "hasAnonymousData": False,
                    "csrfToken": csrf_token,
                }
            )
    anonymous_user = request_anonymous_user()
    summary = get_user_data_summary(anonymous_user) if anonymous_user is not None else {"hasData": False}
    return jsonify(
        {
            "authenticated": False,
            "anonymous": True,
            "accountLinked": False,
            "emailMasked": None,
            "hasAnonymousData": summary["hasData"],
            "csrfToken": csrf_token,
        }
    )


@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    csrf_error = require_auth_csrf()
    if csrf_error:
        return csrf_error
    if session.get("account_id") is not None:
        return jsonify({"error": "already_authenticated"}), 409
    anonymous_user = request_anonymous_user()
    if anonymous_user is None:
        return jsonify({"error": "anonymous_user_required"}), 401
    payload = request.get_json(silent=True) or {}
    try:
        email = normalize_email(payload.get("email"))
    except ValueError as error:
        return jsonify({"error": "invalid_email", "message": str(error)}), 400
    password = str(payload.get("password") or "")
    password_confirm = str(payload.get("passwordConfirm") or "")
    if len(password) < 8:
        return jsonify({"error": "password_too_short"}), 400
    if password != password_confirm:
        return jsonify({"error": "password_confirmation_mismatch"}), 400
    if payload.get("termsAccepted") is not True:
        return jsonify({"error": "terms_required"}), 400
    if db.session.scalar(select(AuthAccount.id).where(AuthAccount.email == email)) is not None:
        return jsonify({"error": "email_already_registered"}), 409

    account = AuthAccount(email=email, password_hash=generate_password_hash(password))
    try:
        # One commit keeps account creation and the existing anonymous profile link atomic.
        db.session.add(account)
        anonymous_user.account = account
        anonymous_user.is_anonymous = False
        anonymous_user.last_seen_at = utc_now()
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "email_already_registered"}), 409
    except Exception:
        db.session.rollback()
        raise
    session.clear()
    session["account_id"] = account.id
    g.current_health_user = anonymous_user
    return jsonify(
        {
            "authenticated": True,
            "anonymous": False,
            "accountLinked": True,
            "emailMasked": mask_email(account.email),
            "healthUserId": anonymous_user.id,
        }
    ), 201


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    csrf_error = require_auth_csrf()
    if csrf_error:
        return csrf_error
    if session.get("account_id") is not None:
        return jsonify({"error": "already_authenticated"}), 409
    payload = request.get_json(silent=True) or {}
    try:
        email = normalize_email(payload.get("email"))
    except ValueError:
        return jsonify({"error": "invalid_credentials", "message": "Email or password is incorrect."}), 401
    password = str(payload.get("password") or "")
    account = db.session.scalar(select(AuthAccount).where(AuthAccount.email == email))
    if account is None or account.status != "active" or not check_password_hash(account.password_hash, password):
        return jsonify({"error": "invalid_credentials", "message": "Email or password is incorrect."}), 401
    account_user = db.session.scalar(select(HealthUser).where(HealthUser.account_id == account.id))
    if account_user is None:
        return jsonify({"error": "account_profile_missing"}), 409
    anonymous_user = request_anonymous_user()
    anonymous_summary = get_user_data_summary(anonymous_user) if anonymous_user is not None else {"hasData": False}
    account_summary = get_user_data_summary(account_user)
    if anonymous_user is not None and anonymous_user.id != account_user.id and anonymous_summary["hasData"] and account_summary["hasData"]:
        return jsonify(
            {
                "error": "anonymous_data_conflict",
                "message": "Current device has anonymous records.",
                "anonymousSummary": anonymous_summary,
                "accountSummary": account_summary,
            }
        ), 409
    account.last_login_at = utc_now()
    account_user.last_seen_at = utc_now()
    db.session.commit()
    session.clear()
    session["account_id"] = account.id
    g.current_health_user = account_user
    return jsonify(
        {
            "authenticated": True,
            "anonymous": False,
            "accountLinked": True,
            "emailMasked": mask_email(account.email),
            "healthUserId": account_user.id,
        }
    )


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    csrf_error = require_auth_csrf()
    if csrf_error:
        return csrf_error
    session.clear()
    return jsonify({"success": True, "requiresNewAnonymousKey": True})


@app.route("/api/complaints", methods=["POST"])
def create_complaint():
    user = request_user()
    payload = request.get_json(silent=True) or {}
    message = str(payload.get("message", "")).strip()
    category = str(payload.get("category", "complaint")).strip().lower()
    if category not in {"complaint", "feedback"}:
        return jsonify({"error": "invalid complaint category"}), 400
    if not message:
        return jsonify({"error": "complaint message is required"}), 400
    if len(message) > MAX_COMPLAINT_LENGTH:
        return jsonify({"error": "complaint message is too long"}), 400
    stats_data = volume_stats(user.id)
    try:
        send_discord_complaint(user, message, stats_data, category)
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 503
    return jsonify({"ok": True})


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
    stats_data = stats_from_logs(logs, {item["date"] for item in excuse_rows})
    return jsonify(
        {
            "claimedLegacy": claimed,
            "logs": list(reversed(month_logs)),
            "excuses": list(reversed(month_excuses)),
            "latestByExercise": latest_by_exercise,
            "stats": stats_data,
            "profile": profile_to_dict(user, stats_data),
            "boardPosts": load_board_post_dicts(user.id),
        }
    )


@app.route("/api/board/posts", methods=["GET"])
def list_board_posts():
    user = request_user()
    sort = request.args.get("sort", "latest").strip()
    return jsonify(load_board_post_dicts(user.id, sort="popular" if sort == "popular" else "latest"))


@app.route("/api/board/posts", methods=["POST"])
def create_board_post():
    user = request_user()
    payload = request.get_json(silent=True) or {}
    content = str(payload.get("content", "")).strip()
    if not content:
        return jsonify({"error": "board post content is required"}), 400
    if len(content) > MAX_BOARD_POST_LENGTH:
        return jsonify({"error": "board post content is too long"}), 400
    stats_data = volume_stats(user.id)
    post = HealthBoardPost(
        user_id=user.id,
        level=stats_data["level"],
        nickname=user.nickname or "닉네임",
        content=content,
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(load_board_post_dicts(user.id)[0]), 201


@app.route("/api/board/posts/<int:post_id>/like", methods=["POST"])
def toggle_board_like(post_id):
    user = request_user()
    post = db.session.get(HealthBoardPost, post_id)
    if post is None:
        return jsonify({"error": "board post not found"}), 404
    existing = db.session.scalar(
        select(HealthBoardLike).where(
            HealthBoardLike.post_id == post_id,
            HealthBoardLike.user_id == user.id,
        )
    )
    if existing is None:
        db.session.add(HealthBoardLike(post_id=post_id, user_id=user.id))
    else:
        db.session.delete(existing)
    db.session.commit()
    return jsonify(load_board_post_dicts(user.id))


@app.route("/api/board/posts/<int:post_id>/comments", methods=["POST"])
def create_board_comment(post_id):
    user = request_user()
    post = db.session.get(HealthBoardPost, post_id)
    if post is None:
        return jsonify({"error": "board post not found"}), 404
    payload = request.get_json(silent=True) or {}
    content = str(payload.get("content", "")).strip()
    if not content:
        return jsonify({"error": "comment content is required"}), 400
    if len(content) > MAX_BOARD_COMMENT_LENGTH:
        return jsonify({"error": "comment content is too long"}), 400
    stats_data = volume_stats(user.id)
    db.session.add(
        HealthBoardComment(
            post_id=post_id,
            user_id=user.id,
            level=stats_data["level"],
            nickname=user.nickname or "닉네임",
            content=content,
        )
    )
    db.session.commit()
    return jsonify(load_board_post_dicts(user.id))


@app.route("/api/board/reports", methods=["POST"])
def report_board_content():
    user = request_user()
    payload = request.get_json(silent=True) or {}
    post_id = payload.get("postId")
    comment_id = payload.get("commentId")
    reason = str(payload.get("reason", "")).strip() or "비상식적인 게시글/댓글"
    if len(reason) > MAX_BOARD_REPORT_LENGTH:
        return jsonify({"error": "report reason is too long"}), 400
    post = db.session.get(HealthBoardPost, post_id)
    if post is None:
        return jsonify({"error": "board post not found"}), 404
    comment = None
    if comment_id:
        comment = db.session.get(HealthBoardComment, comment_id)
        if comment is None or comment.post_id != post.id:
            return jsonify({"error": "board comment not found"}), 404
    report = HealthBoardReport(
        reporter_user_id=user.id,
        post_id=post.id,
        comment_id=comment.id if comment else None,
        reason=reason,
    )
    db.session.add(report)
    db.session.commit()
    try:
        send_discord_board_report(user, post, comment, reason)
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 502
    return jsonify({"ok": True})


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
    cron_token = os.environ.get("REMINDER_CRON_TOKEN", "").strip()
    if cron_token and request.headers.get("X-Cron-Token", "") != cron_token:
        return jsonify({"error": "forbidden"}), 403
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
    reason = str(payload.get("reason", "")).strip()[:MAX_MEMO_LENGTH]
    if not reason:
        return jsonify({"error": "reason is required"}), 400
    try:
        excuse_date = parse_date(payload.get("date") or today_kst().isoformat())
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
    raw_weight = min(max(float(payload.get("weightKg", step)), step), MAX_WEIGHT_KG)
    fallback_weight = max(math.floor(raw_weight / step + 0.5) * step, step)
    raw_reps = payload.get("setReps", [])
    raw_weights = payload.get("setWeights", [])
    if not isinstance(raw_reps, list) or not isinstance(raw_weights, list):
        raise ValueError
    if len(raw_reps) > MAX_SETS_PER_WORKOUT or len(raw_weights) > MAX_SETS_PER_WORKOUT:
        raise ValueError
    reps = [
        min(max(int(value), 0), MAX_REPS_PER_SET)
        for value in raw_reps
        if str(value).strip()
    ]
    weights = [
        max(math.floor(min(max(float(value), step), MAX_WEIGHT_KG) / step + 0.5) * step, step)
        for value in raw_weights
        if str(value).strip()
    ]
    if not reps:
        fallback_reps = min(max(int(payload.get("reps", 0)), 0), MAX_REPS_PER_SET)
        completed = min(
            max(int(payload.get("completedSets", payload.get("targetSets", 1))), 0),
            MAX_SETS_PER_WORKOUT,
        )
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
    if len(exercise_name) > MAX_EXERCISE_NAME_LENGTH:
        return jsonify({"error": "exercise is too long"}), 400
    try:
        workout_date = parse_date(payload.get("date") or today_kst().isoformat())
        set_data = normalized_set_data(payload, exercise_name)
    except (TypeError, ValueError):
        return jsonify({"error": "valid date, weight, reps, and completed sets are required"}), 400
    existing_logs = [
        workout_to_log(workout)
        for workout in load_workouts(
            workout_query(user.id).order_by(
                HealthWorkout.workout_date.asc(),
                HealthWorkout.created_at.asc(),
                HealthWorkout.id.asc(),
            )
        )
    ]
    candidate_log = {
        "date": workout_date.isoformat(),
        "exercise": exercise_name,
        "setWeights": [weight for weight, _reps in set_data],
        "setReps": [reps for _weight, reps in set_data],
        "totalReps": sum(reps for _weight, reps in set_data),
        "volume": sum(weight * reps for weight, reps in set_data),
        "completedSets": len(set_data),
    }
    comparable_logs = [log for log in existing_logs if log["date"] <= candidate_log["date"]]
    suspicion_flags = suspicious_training_flags(candidate_log, comparable_logs)
    exercise = db.session.scalar(select(HealthExercise).where(HealthExercise.name == exercise_name))
    if exercise is None:
        exercise = HealthExercise(name=exercise_name)
        db.session.add(exercise)
        db.session.flush()
    workout = HealthWorkout(
        user_id=user.id,
        workout_date=workout_date,
        suspicion_score=len(suspicion_flags),
        suspicion_flags=json.dumps(suspicion_flags, ensure_ascii=False),
    )
    db.session.add(workout)
    db.session.flush()
    memo = str(payload.get("notes", "")).strip()[:MAX_MEMO_LENGTH]
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
