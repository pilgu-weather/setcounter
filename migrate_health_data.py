"""Import the timestamped Render SQLite export into the shared Neon database.

Only health_* tables are touched. PostgreSQL DDL and data writes run in one
transaction, so a failure rolls back the entire target migration.
"""

import argparse
import hashlib
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv
from sqlalchemy import create_engine, text


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_BACKUP = BASE_DIR / "backups" / "health-migration-20260622-150103"
USER_KEY_PATTERN = re.compile(r"^[A-Za-z0-9._:-]{16,128}$")
REQUIRED_COLUMNS = {
    "health_users": {"id", "user_key", "created_at", "legacy_claimable"},
    "health_exercises": {"id", "name", "created_at"},
    "health_workouts": {"id", "user_id", "workout_date", "created_at", "updated_at"},
    "health_sets": {
        "id", "workout_id", "exercise_id", "set_index", "weight", "reps", "memo", "created_at"
    },
    "health_excuses": {"id", "user_id", "excuse_date", "excuse_text", "created_at"},
}


def database_url():
    value = os.environ.get("DATABASE_URL", "").strip()
    if not value:
        raise SystemExit("DATABASE_URL is required; SQLite fallback is disabled")
    if value.startswith("postgres://"):
        value = "postgresql://" + value[len("postgres://") :]
    if value.startswith("postgresql+psycopg2://"):
        value = "postgresql://" + value[len("postgresql+psycopg2://") :]
    if value.startswith("postgresql://"):
        value = "postgresql+psycopg://" + value[len("postgresql://") :]
    if not value.startswith("postgresql+psycopg://"):
        raise SystemExit("DATABASE_URL must point to PostgreSQL")
    return value


def load_verified_backup(backup_dir):
    manifest = json.loads((backup_dir / "manifest.json").read_text(encoding="utf-8"))
    payloads = {}
    for filename, expected_hash in manifest["sha256"].items():
        payload = (backup_dir / filename).read_bytes()
        actual_hash = hashlib.sha256(payload).hexdigest()
        if actual_hash != expected_hash:
            raise RuntimeError(f"backup checksum mismatch: {filename}")
        payloads[filename] = json.loads(payload.decode("utf-8"))
    if len(payloads["workout_logs.json"]) != manifest["workout_log_count"]:
        raise RuntimeError("backup workout count does not match manifest")
    if len(payloads["workout_excuses.json"]) != manifest["workout_excuse_count"]:
        raise RuntimeError("backup excuse count does not match manifest")
    return payloads["workout_logs.json"], payloads["workout_excuses.json"]


def table_exists(connection, table_name):
    return bool(
        connection.scalar(
            text(
                "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
                "WHERE table_schema='public' AND table_name=:name)"
            ),
            {"name": table_name},
        )
    )


def columns(connection, table_name):
    return set(
        connection.scalars(
            text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema='public' AND table_name=:name"
            ),
            {"name": table_name},
        )
    )


def count_rows(connection, table_name):
    if not table_exists(connection, table_name):
        return 0
    return connection.scalar(text(f'SELECT COUNT(*) FROM "{table_name}"'))


def prepare_schema(connection):
    if table_exists(connection, "health_users"):
        user_columns = columns(connection, "health_users")
        if "legacy_claimable" not in user_columns:
            connection.execute(
                text(
                    "ALTER TABLE health_users ADD COLUMN legacy_claimable "
                    "BOOLEAN NOT NULL DEFAULT FALSE"
                )
            )
    protected_tables = ("health_users", "health_workouts", "health_sets", "health_excuses")
    populated = {name: count_rows(connection, name) for name in protected_tables}
    if any(populated.values()):
        return False

    connection.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS health_users (
                id SERIAL PRIMARY KEY,
                user_key VARCHAR(128) NOT NULL UNIQUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                legacy_claimable BOOLEAN NOT NULL DEFAULT FALSE
            )
            """
        )
    )
    connection.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS health_exercises (
                id SERIAL PRIMARY KEY,
                name VARCHAR(120) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )
    duplicate = connection.execute(
        text("SELECT name FROM health_exercises GROUP BY name HAVING COUNT(*) > 1 LIMIT 1")
    ).first()
    if duplicate:
        raise RuntimeError("health_exercises contains duplicate names; migration aborted")
    connection.execute(
        text("CREATE UNIQUE INDEX IF NOT EXISTS ix_health_exercises_name ON health_exercises (name)")
    )
    connection.execute(
        text(
            "ALTER TABLE health_exercises ALTER COLUMN created_at "
            "SET DEFAULT CURRENT_TIMESTAMP"
        )
    )

    connection.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS health_workouts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES health_users(id) ON DELETE CASCADE,
                workout_date DATE NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )
    workout_columns = columns(connection, "health_workouts")
    if "updated_at" not in workout_columns:
        connection.execute(
            text("ALTER TABLE health_workouts ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP")
        )
    foreign_keys = connection.execute(
        text(
            """
            SELECT constraint_name
            FROM information_schema.constraint_column_usage
            WHERE table_schema='public' AND table_name <> 'health_users'
              AND column_name='id' AND constraint_name IN (
                SELECT constraint_name FROM information_schema.key_column_usage
                WHERE table_schema='public' AND table_name='health_workouts' AND column_name='user_id'
              )
            """
        )
    ).all()
    for (constraint_name,) in foreign_keys:
        connection.execute(text(f'ALTER TABLE health_workouts DROP CONSTRAINT "{constraint_name}"'))
    correct_fk = connection.scalar(
        text(
            """
            SELECT EXISTS (
                SELECT 1 FROM pg_constraint c
                JOIN pg_class source ON source.oid=c.conrelid
                JOIN pg_class target ON target.oid=c.confrelid
                WHERE c.contype='f' AND source.relname='health_workouts'
                  AND target.relname='health_users'
            )
            """
        )
    )
    if not correct_fk:
        connection.execute(
            text(
                "ALTER TABLE health_workouts ADD CONSTRAINT fk_health_workouts_user "
                "FOREIGN KEY (user_id) REFERENCES health_users(id) ON DELETE CASCADE"
            )
        )

    connection.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS health_sets (
                id SERIAL PRIMARY KEY,
                workout_id INTEGER NOT NULL REFERENCES health_workouts(id) ON DELETE CASCADE,
                exercise_id INTEGER NOT NULL REFERENCES health_exercises(id),
                set_index INTEGER NOT NULL,
                weight NUMERIC(10, 2) NOT NULL,
                reps INTEGER NOT NULL,
                memo TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uq_health_set_workout_index UNIQUE (workout_id, set_index)
            )
            """
        )
    )
    set_columns = columns(connection, "health_sets")
    if "set_number" in set_columns and "set_index" not in set_columns:
        connection.execute(text("ALTER TABLE health_sets RENAME COLUMN set_number TO set_index"))
        set_columns.remove("set_number")
        set_columns.add("set_index")
    if "set_index" not in set_columns:
        connection.execute(text("ALTER TABLE health_sets ADD COLUMN set_index INTEGER NOT NULL"))
    if "memo" not in set_columns:
        connection.execute(text("ALTER TABLE health_sets ADD COLUMN memo TEXT NOT NULL DEFAULT ''"))
    connection.execute(text("ALTER TABLE health_sets ALTER COLUMN weight SET NOT NULL"))
    connection.execute(text("ALTER TABLE health_sets ALTER COLUMN reps SET NOT NULL"))
    connection.execute(
        text(
            "CREATE UNIQUE INDEX IF NOT EXISTS uq_health_set_workout_index "
            "ON health_sets (workout_id, set_index)"
        )
    )

    connection.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS health_excuses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES health_users(id) ON DELETE CASCADE,
                excuse_date DATE NOT NULL,
                excuse_text TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uq_health_excuse_user_date UNIQUE (user_id, excuse_date)
            )
            """
        )
    )
    return True


def parse_timestamp(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def load_or_create_user_key(backup_dir):
    key_path = backup_dir / "migration-user-key.txt"
    configured = os.environ.get("HEALTH_MIGRATION_USER_KEY", "").strip()
    if configured:
        value = configured
    elif key_path.exists():
        value = key_path.read_text(encoding="utf-8").strip()
    else:
        value = str(uuid4())
        key_path.write_text(value + "\n", encoding="utf-8")
    if not USER_KEY_PATTERN.fullmatch(value):
        raise RuntimeError("HEALTH_MIGRATION_USER_KEY must be 16-128 safe characters")
    return value, key_path


def assert_target_schema(connection):
    for table_name, required in REQUIRED_COLUMNS.items():
        if not table_exists(connection, table_name):
            raise RuntimeError(f"populated legacy target is missing {table_name}; migration aborted")
        missing = required - columns(connection, table_name)
        if missing:
            raise RuntimeError(
                f"populated legacy {table_name} is incompatible; missing {', '.join(sorted(missing))}"
            )


def verify_import(connection, user_id, source_logs):
    workout_count = connection.scalar(
        text("SELECT COUNT(*) FROM health_workouts WHERE user_id=:user_id"), {"user_id": user_id}
    )
    set_count = connection.scalar(
        text(
            "SELECT COUNT(*) FROM health_sets s JOIN health_workouts w ON w.id=s.workout_id "
            "WHERE w.user_id=:user_id"
        ),
        {"user_id": user_id},
    )
    exercise_count = connection.scalar(
        text(
            "SELECT COUNT(DISTINCT e.name) FROM health_exercises e "
            "JOIN health_sets s ON s.exercise_id=e.id "
            "JOIN health_workouts w ON w.id=s.workout_id WHERE w.user_id=:user_id"
        ),
        {"user_id": user_id},
    )
    expected_sets = sum(len(item["set_reps"]) for item in source_logs)
    expected_exercises = len({item["exercise"] for item in source_logs})
    if (workout_count, set_count, exercise_count) != (
        len(source_logs),
        expected_sets,
        expected_exercises,
    ):
        raise RuntimeError(
            f"verification failed: workouts={workout_count}, sets={set_count}, exercises={exercise_count}"
        )
    target_rows = connection.execute(
        text(
            """
            SELECT w.created_at, e.name, s.set_index, s.weight, s.reps
            FROM health_workouts w
            JOIN health_sets s ON s.workout_id=w.id
            JOIN health_exercises e ON e.id=s.exercise_id
            WHERE w.user_id=:user_id
            ORDER BY w.created_at, s.set_index
            """
        ),
        {"user_id": user_id},
    ).all()
    expected = sorted(
        (
            parse_timestamp(log["created_at"]),
            log["exercise"],
            index,
            float(weight),
            int(reps),
        )
        for log in source_logs
        for index, (weight, reps) in enumerate(
            zip(log["set_weights"], log["set_reps"]), start=1
        )
    )
    actual = sorted(
        (created_at, name, set_index, float(weight), reps)
        for created_at, name, set_index, weight, reps in target_rows
    )
    if actual != expected:
        raise RuntimeError("set-level weight/reps verification failed")

    def canonical(rows):
        normalized = [
            [
                created_at.astimezone(timezone.utc).isoformat(),
                name,
                int(set_index),
                f"{float(weight):.2f}",
                int(reps),
            ]
            for created_at, name, set_index, weight, reps in rows
        ]
        payload = json.dumps(normalized, ensure_ascii=False, separators=(",", ":"))
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    source_checksum = canonical(expected)
    target_checksum = canonical(actual)
    if source_checksum != target_checksum:
        raise RuntimeError("source and Neon checksums differ")
    return workout_count, set_count, exercise_count, target_checksum


def migrate(backup_dir, app_url):
    source_logs, source_excuses = load_verified_backup(backup_dir)
    user_key, key_path = load_or_create_user_key(backup_dir)
    engine = create_engine(database_url(), pool_pre_ping=True)
    with engine.begin() as connection:
        empty_target = prepare_schema(connection)
        if not empty_target:
            assert_target_schema(connection)
        user_id = connection.scalar(
            text("SELECT id FROM health_users WHERE user_key=:key"), {"key": user_key}
        )
        if user_id is not None:
            counts = verify_import(connection, user_id, source_logs)
            connection.execute(
                text("UPDATE health_users SET legacy_claimable=TRUE WHERE id=:user_id"),
                {"user_id": user_id},
            )
            print(
                f"Already migrated and verified: workouts={counts[0]}, sets={counts[1]}, "
                f"exercises={counts[2]}, checksum={counts[3]}"
            )
            return
        if not empty_target:
            raise RuntimeError("health target tables already contain data; migration aborted before writes")
        user_id = connection.scalar(
            text(
                "INSERT INTO health_users (user_key, legacy_claimable) "
                "VALUES (:key, TRUE) RETURNING id"
            ),
            {"key": user_key},
        )
        exercise_ids = {}
        for name in sorted({item["exercise"] for item in source_logs}):
            exercise_ids[name] = connection.scalar(
                text(
                    "INSERT INTO health_exercises (name, created_at) VALUES (:name, CURRENT_TIMESTAMP) "
                    "ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id"
                ),
                {"name": name},
            )
        for log in sorted(source_logs, key=lambda item: item["created_at"]):
            created_at = parse_timestamp(log["created_at"])
            workout_id = connection.scalar(
                text(
                    "INSERT INTO health_workouts (user_id, workout_date, created_at, updated_at) "
                    "VALUES (:user_id, :workout_date, :created_at, :created_at) RETURNING id"
                ),
                {
                    "user_id": user_id,
                    "workout_date": log["workout_date"],
                    "created_at": created_at,
                },
            )
            for index, (weight, reps) in enumerate(
                zip(log["set_weights"], log["set_reps"]), start=1
            ):
                connection.execute(
                    text(
                        "INSERT INTO health_sets "
                        "(workout_id, exercise_id, set_index, weight, reps, memo, created_at) "
                        "VALUES (:workout_id, :exercise_id, :set_index, :weight, :reps, :memo, :created_at)"
                    ),
                    {
                        "workout_id": workout_id,
                        "exercise_id": exercise_ids[log["exercise"]],
                        "set_index": index,
                        "weight": weight,
                        "reps": reps,
                        "memo": log.get("notes", ""),
                        "created_at": created_at,
                    },
                )
        for excuse in source_excuses:
            connection.execute(
                text(
                    "INSERT INTO health_excuses (user_id, excuse_date, excuse_text, created_at) "
                    "VALUES (:user_id, :date, :text, :created_at)"
                ),
                {
                    "user_id": user_id,
                    "date": excuse["date"],
                    "text": excuse["reason"],
                    "created_at": parse_timestamp(excuse["createdAt"]),
                },
            )
        counts = verify_import(connection, user_id, source_logs)
    print(
        f"Migration committed: workouts={counts[0]}, sets={counts[1]}, "
        f"exercises={counts[2]}, checksum={counts[3]}"
    )
    print(f"Migration user key saved: {key_path.relative_to(BASE_DIR)}")
    print(f"Recovery URL: {app_url.rstrip('/')}/main?user_key={user_key}")


def main():
    load_dotenv()
    parser = argparse.ArgumentParser()
    parser.add_argument("--backup-dir", type=Path, default=DEFAULT_BACKUP)
    parser.add_argument("--app-url", default="https://setcounter.onrender.com")
    args = parser.parse_args()
    if not args.backup_dir.is_dir():
        raise SystemExit(f"backup directory not found: {args.backup_dir}")
    migrate(args.backup_dir, args.app_url)


if __name__ == "__main__":
    main()
