"""One-time, idempotent schema migration for anonymous-to-account auth support.

Run this intentionally against the target database before deploying the auth build.
SQLite is supported only when --allow-sqlite is supplied for local development.
"""

import argparse
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text

from models import AuthAccount, AuthRateLimit


COUNT_TABLES = (
    "health_users",
    "health_workouts",
    "health_sets",
    "health_excuses",
    "health_board_posts",
    "health_board_likes",
    "health_board_comments",
    "health_board_reports",
)


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


def table_counts(connection):
    tables = set(inspect(connection).get_table_names())
    return {
        table: connection.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar_one()
        for table in COUNT_TABLES
        if table in tables
    }


def sample_user_counts(connection):
    tables = set(inspect(connection).get_table_names())
    if "health_users" not in tables:
        return []
    workout_count = (
        "(SELECT COUNT(*) FROM health_workouts w WHERE w.user_id = u.id)"
        if "health_workouts" in tables
        else "0"
    )
    excuse_count = (
        "(SELECT COUNT(*) FROM health_excuses e WHERE e.user_id = u.id)"
        if "health_excuses" in tables
        else "0"
    )
    post_count = (
        "(SELECT COUNT(*) FROM health_board_posts p WHERE p.user_id = u.id)"
        if "health_board_posts" in tables
        else "0"
    )
    return connection.execute(
        text(
            f"""
            SELECT u.id,
                   {workout_count} AS workouts,
                   {excuse_count} AS excuses,
                   {post_count} AS posts
            FROM health_users u
            ORDER BY u.id
            LIMIT 10
            """
        )
    ).mappings().all()


def add_column_if_missing(connection, table_name, column_name, definition):
    columns = {item["name"] for item in inspect(connection).get_columns(table_name)}
    if column_name not in columns:
        connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {definition}"))


def migrate(engine):
    backend = engine.url.get_backend_name()
    with engine.begin() as connection:
        before_counts = table_counts(connection)
        before_samples = sample_user_counts(connection)
        print("Before counts:", before_counts)
        print("Before sample users:", before_samples)

        AuthAccount.__table__.create(bind=connection, checkfirst=True)
        AuthRateLimit.__table__.create(bind=connection, checkfirst=True)
        connection.execute(
            text("CREATE INDEX IF NOT EXISTS ix_auth_rate_limits_updated_at ON auth_rate_limits(updated_at)")
        )
        add_column_if_missing(connection, "health_users", "account_id", "account_id INTEGER")
        add_column_if_missing(connection, "health_users", "is_anonymous", "is_anonymous BOOLEAN NOT NULL DEFAULT 1")
        timestamp_type = "TIMESTAMPTZ" if backend == "postgresql" else "DATETIME"
        add_column_if_missing(connection, "health_users", "last_seen_at", f"last_seen_at {timestamp_type}")
        connection.execute(text("UPDATE health_users SET is_anonymous = 1 WHERE account_id IS NULL"))
        connection.execute(
            text("CREATE UNIQUE INDEX IF NOT EXISTS uq_health_users_account_id ON health_users(account_id)")
        )
        if backend == "postgresql":
            connection.execute(
                text(
                    """
                    DO $$
                    BEGIN
                      IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint WHERE conname = 'fk_health_users_account_id'
                      ) THEN
                        ALTER TABLE health_users
                          ADD CONSTRAINT fk_health_users_account_id
                          FOREIGN KEY (account_id) REFERENCES auth_accounts(id) ON DELETE SET NULL;
                      END IF;
                    END $$;
                    """
                )
            )

        after_counts = table_counts(connection)
        after_samples = sample_user_counts(connection)
        if before_counts != after_counts or before_samples != after_samples:
            raise RuntimeError("auth migration changed existing user-owned data counts")
        print("After counts:", after_counts)
        print("After sample users:", after_samples)
        print("Auth schema migration completed without changing user-owned data.")


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
    if database_url.startswith("sqlite:///"):
        normalized = database_url
    else:
        normalized = normalize_database_url(database_url)
    migrate(create_engine(normalized, future=True))


if __name__ == "__main__":
    main()
