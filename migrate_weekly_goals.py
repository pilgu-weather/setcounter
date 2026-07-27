"""Add account-only weekly workout goals without changing user-owned records."""

import argparse
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text


def normalize_database_url(value):
    value = (value or "").strip()
    if value.startswith("postgres://"):
        value = "postgresql://" + value[len("postgres://") :]
    if value.startswith("postgresql+psycopg2://"):
        value = "postgresql://" + value[len("postgresql+psycopg2://") :]
    if value.startswith("postgresql://"):
        return "postgresql+psycopg://" + value[len("postgresql://") :]
    if value.startswith("postgresql+psycopg://") or value.startswith("sqlite:///"):
        return value
    raise RuntimeError("DATABASE_URL must point to PostgreSQL")


def add_column_if_missing(connection, column_name, definition):
    columns = {item["name"] for item in inspect(connection).get_columns("health_users")}
    if column_name not in columns:
        connection.execute(text(f"ALTER TABLE health_users ADD COLUMN {definition}"))


def migrate(engine):
    backend = engine.url.get_backend_name()
    timestamp_type = "TIMESTAMPTZ" if backend == "postgresql" else "DATETIME"
    with engine.begin() as connection:
        before_counts = {
            table: connection.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one()
            for table in ("health_users", "health_workouts", "health_sets", "health_excuses")
        }
        add_column_if_missing(connection, "weekly_workout_target", "weekly_workout_target INTEGER")
        add_column_if_missing(
            connection,
            "weekly_target_updated_at",
            f"weekly_target_updated_at {timestamp_type}",
        )
        connection.execute(
            text(
                """
                UPDATE health_users
                   SET weekly_workout_target = 3,
                       weekly_target_updated_at = CURRENT_TIMESTAMP
                 WHERE account_id IS NOT NULL
                   AND weekly_workout_target IS NULL
                """
            )
        )
        after_counts = {
            table: connection.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one()
            for table in before_counts
        }
        if before_counts != after_counts:
            raise RuntimeError("weekly goal migration changed user-owned record counts")
        print("Weekly workout goal migration completed.")
        print("Record counts preserved:", after_counts)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--database-url", default="")
    parser.add_argument("--allow-sqlite", action="store_true")
    args = parser.parse_args()
    load_dotenv()
    database_url = args.database_url or os.environ.get("DATABASE_URL", "")
    if not database_url:
        raise RuntimeError("DATABASE_URL or --database-url is required")
    if database_url.startswith("sqlite:///") and not args.allow_sqlite:
        raise RuntimeError("SQLite is allowed only with --allow-sqlite for local development")
    migrate(create_engine(normalize_database_url(database_url), future=True))


if __name__ == "__main__":
    main()
