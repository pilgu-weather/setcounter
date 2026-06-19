import json
import math
import os
import sqlite3
from datetime import date, datetime

from flask import Flask, g, jsonify, redirect, render_template, request


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(BASE_DIR, "app.sqlite3"))
DATABASE_URL = os.environ.get("DATABASE_URL", "")
IS_POSTGRES = DATABASE_URL.startswith(("postgres://", "postgresql://"))

app = Flask(__name__)


def get_db():
    if "db" not in g:
        if IS_POSTGRES:
            import psycopg
            from psycopg.rows import dict_row

            g.db = psycopg.connect(DATABASE_URL, row_factory=dict_row)
        else:
            g.db = sqlite3.connect(DB_PATH)
            g.db.row_factory = sqlite3.Row
    return g.db


def db_execute(query, params=()):
    if IS_POSTGRES:
        query = query.replace("?", "%s")
    return get_db().execute(query, params)


@app.teardown_appcontext
def close_db(_error):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    if IS_POSTGRES:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS workout_logs (
                id SERIAL PRIMARY KEY,
                workout_date TEXT NOT NULL,
                exercise TEXT NOT NULL,
                weight_kg DOUBLE PRECISION NOT NULL DEFAULT 0,
                reps INTEGER NOT NULL DEFAULT 0,
                set_reps TEXT NOT NULL DEFAULT '[]',
                set_weights TEXT NOT NULL DEFAULT '[]',
                target_sets INTEGER NOT NULL DEFAULT 1,
                completed_sets INTEGER NOT NULL DEFAULT 0,
                notes TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            )
            """
        )
        columns = {
            row["column_name"]
            for row in db.execute(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'workout_logs'
                """
            ).fetchall()
        }
    else:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS workout_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                workout_date TEXT NOT NULL,
                exercise TEXT NOT NULL,
                weight_kg REAL NOT NULL DEFAULT 0,
                reps INTEGER NOT NULL DEFAULT 0,
                set_reps TEXT NOT NULL DEFAULT '[]',
                set_weights TEXT NOT NULL DEFAULT '[]',
                target_sets INTEGER NOT NULL DEFAULT 1,
                completed_sets INTEGER NOT NULL DEFAULT 0,
                notes TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            )
            """
        )
        columns = {
            row["name"]
            for row in db.execute("PRAGMA table_info(workout_logs)").fetchall()
        }
    if "reps" not in columns:
        db.execute("ALTER TABLE workout_logs ADD COLUMN reps INTEGER NOT NULL DEFAULT 0")
    if "set_reps" not in columns:
        db.execute("ALTER TABLE workout_logs ADD COLUMN set_reps TEXT NOT NULL DEFAULT '[]'")
    if "set_weights" not in columns:
        db.execute("ALTER TABLE workout_logs ADD COLUMN set_weights TEXT NOT NULL DEFAULT '[]'")
    db.commit()


@app.before_request
def ensure_db():
    init_db()


def parse_set_reps(value, fallback_reps=0, fallback_sets=0):
    try:
        reps = json.loads(value or "[]")
    except json.JSONDecodeError:
        reps = []
    reps = [max(int(rep), 0) for rep in reps if str(rep).strip() != ""]
    if not reps and fallback_reps and fallback_sets:
        reps = [int(fallback_reps)] * int(fallback_sets)
    return reps


def parse_set_weights(value, fallback_weight=0, fallback_sets=0):
    try:
        weights = json.loads(value or "[]")
    except json.JSONDecodeError:
        weights = []
    weights = [max(float(weight), 0) for weight in weights if str(weight).strip() != ""]
    if not weights and fallback_weight and fallback_sets:
        weights = [float(fallback_weight)] * int(fallback_sets)
    return weights


def row_to_log(row):
    set_reps = parse_set_reps(row["set_reps"], row["reps"], row["completed_sets"])
    set_weights = parse_set_weights(
        row["set_weights"], row["weight_kg"], len(set_reps)
    )
    if len(set_weights) < len(set_reps):
        set_weights.extend([row["weight_kg"]] * (len(set_reps) - len(set_weights)))
    set_rows = [
        {
            "set": index + 1,
            "weightKg": set_weights[index],
            "reps": reps,
            "volume": set_weights[index] * reps,
        }
        for index, reps in enumerate(set_reps)
    ]
    total_reps = sum(set_reps)
    volume = sum(row["volume"] for row in set_rows)
    return {
        "id": row["id"],
        "date": row["workout_date"],
        "exercise": row["exercise"],
        "weightKg": row["weight_kg"],
        "reps": row["reps"],
        "setReps": set_reps,
        "setWeights": set_weights[: len(set_reps)],
        "setRows": set_rows,
        "totalReps": total_reps,
        "volume": volume,
        "targetSets": row["target_sets"],
        "completedSets": row["completed_sets"],
        "notes": row["notes"],
        "createdAt": row["created_at"],
    }


def volume_stats():
    rows = db_execute(
        "SELECT * FROM workout_logs ORDER BY created_at ASC, id ASC"
    ).fetchall()
    logs = [row_to_log(row) for row in rows]
    total_volume = sum(log["volume"] for log in logs)
    total_reps = sum(log["totalReps"] for log in logs)
    total_sets = sum(log["completedSets"] for log in logs)
    previous_by_exercise = {}
    level_changes = 0
    ups = 0
    downs = 0

    for log in logs:
        exercise = log["exercise"]
        volume = log["volume"]
        previous_volume = previous_by_exercise.get(exercise)
        if previous_volume is None:
            previous_by_exercise[exercise] = volume
            continue
        if volume > previous_volume:
            level_changes += 1
            ups += 1
        elif volume < previous_volume:
            level_changes -= 1
            downs += 1
        previous_by_exercise[exercise] = volume

    level = max(level_changes + 1, 1)
    return {
        "level": level,
        "rule": "previous_record_delta",
        "levelUps": ups,
        "levelDowns": downs,
        "trackedExercises": len(previous_by_exercise),
        "totalRecords": len(logs),
        "totalVolume": total_volume,
        "totalReps": total_reps,
        "totalSets": total_sets,
        "progressPercent": 100 if logs else 0,
        "latestRecords": [
            {"exercise": exercise, "volume": volume}
            for exercise, volume in sorted(previous_by_exercise.items())
        ],
    }


@app.route("/")
def index():
    return redirect("/main")


@app.route("/main")
def main():
    return render_template("main.html")


@app.route("/healthz")
def healthz():
    return "ok", 200


@app.route("/api/logs", methods=["GET"])
def list_logs():
    month = request.args.get("month", "")
    params = []
    where = ""
    if month:
        where = "WHERE workout_date LIKE ?"
        params.append(f"{month}-%")

    rows = db_execute(
        f"""
        SELECT *
        FROM workout_logs
        {where}
        ORDER BY workout_date DESC, id DESC
        """,
        params,
    ).fetchall()
    return jsonify([row_to_log(row) for row in rows])


@app.route("/api/logs/latest", methods=["GET"])
def latest_log():
    exercise = request.args.get("exercise", "").strip()
    if not exercise:
        return jsonify(None)

    row = db_execute(
        """
        SELECT *
        FROM workout_logs
        WHERE exercise = ?
        ORDER BY workout_date DESC, id DESC
        LIMIT 1
        """,
        (exercise,),
    ).fetchone()
    return jsonify(row_to_log(row) if row else None)


@app.route("/api/stats", methods=["GET"])
def stats():
    return jsonify(volume_stats())


@app.route("/api/logs", methods=["POST"])
def create_log():
    payload = request.get_json(silent=True) or {}
    exercise = str(payload.get("exercise", "")).strip()
    if not exercise:
        return jsonify({"error": "exercise is required"}), 400

    try:
        raw_weight_kg = max(float(payload.get("weightKg", 8)), 8)
        weight_kg = max(math.floor(raw_weight_kg / 8 + 0.5) * 8, 8)
        target_sets = max(int(payload.get("targetSets", 1)), 1)
        raw_set_reps = payload.get("setReps", [])
        raw_set_weights = payload.get("setWeights", [])
        if not isinstance(raw_set_reps, list):
            raw_set_reps = []
        if not isinstance(raw_set_weights, list):
            raw_set_weights = []
        set_reps = [max(int(rep), 0) for rep in raw_set_reps if str(rep).strip() != ""]
        set_weights = [
            max(math.floor(max(float(weight), 8) / 8 + 0.5) * 8, 8)
            for weight in raw_set_weights
            if str(weight).strip() != ""
        ]
        if not set_reps:
            reps = max(int(payload.get("reps", 0)), 0)
            completed_sets = max(int(payload.get("completedSets", target_sets)), 0)
            set_reps = [reps] * min(completed_sets, target_sets) if reps else []
        if len(set_weights) < len(set_reps):
            set_weights.extend([weight_kg] * (len(set_reps) - len(set_weights)))
        set_weights = set_weights[: len(set_reps)]
        if set_weights:
            weight_kg = set_weights[-1]
        reps = max(set_reps) if set_reps else 0
        completed_sets = len(set_reps)
    except (TypeError, ValueError):
        return jsonify({"error": "weightKg, setReps, targetSets, and completedSets must be numbers"}), 400

    workout_date = str(payload.get("date") or date.today().isoformat())[:10]
    notes = str(payload.get("notes", "")).strip()
    created_at = datetime.utcnow().isoformat(timespec="seconds") + "Z"

    insert_params = (
        workout_date,
        exercise,
        weight_kg,
        reps,
        json.dumps(set_reps, ensure_ascii=False),
        json.dumps(set_weights, ensure_ascii=False),
        target_sets,
        completed_sets,
        notes,
        created_at,
    )
    if IS_POSTGRES:
        cursor = db_execute(
            """
            INSERT INTO workout_logs (
                workout_date, exercise, weight_kg, reps, set_reps, set_weights, target_sets,
                completed_sets, notes, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id
            """,
            insert_params,
        )
        log_id = cursor.fetchone()["id"]
    else:
        cursor = db_execute(
            """
            INSERT INTO workout_logs (
                workout_date, exercise, weight_kg, reps, set_reps, set_weights, target_sets,
                completed_sets, notes, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            insert_params,
        )
        log_id = cursor.lastrowid
    get_db().commit()
    row = db_execute("SELECT * FROM workout_logs WHERE id = ?", (log_id,)).fetchone()
    return jsonify(row_to_log(row)), 201


@app.route("/api/logs/<int:log_id>", methods=["DELETE"])
def delete_log(log_id):
    cursor = db_execute("DELETE FROM workout_logs WHERE id = ?", (log_id,))
    get_db().commit()
    if cursor.rowcount == 0:
        return jsonify({"error": "not found"}), 404
    return "", 204


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG") == "1"
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=debug,
        use_reloader=debug,
    )
