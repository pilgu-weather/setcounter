"""One-time, idempotent schema migration for anonymous-to-account auth support.

Run this intentionally against the target database before deploying the auth build.
SQLite is supported only when --allow-sqlite is supplied for local development.
"""

import argparse
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text

from models import db


COUNT_TABLES = (
    "health_users",
    "auth_accounts",
    "health_workouts",
    "health_sets",
    "health_excuses",
    "health_board_posts",
    "health_board_likes",
    "health_board_comments",
    "health_board_reports",
)


def backfill_auth_identities(connection):
    tables = set(inspect(connection).get_table_names())
    if not {"auth_accounts", "auth_identities"}.issubset(tables):
        return 0

    accounts = connection.execute(
        text(
            """
            SELECT id, email, email_verified, provider, provider_user_id, last_login_at
            FROM auth_accounts
            ORDER BY id
            """
        )
    ).mappings()
    inserted = 0
    for account in accounts:
        provider = str(account["provider"] or "local").strip().lower()
        provider_user_id = str(account["provider_user_id"] or "").strip()
        if not provider_user_id:
            provider_user_id = account["email"] if provider == "local" else f"legacy-account:{account['id']}"

        existing_for_account = connection.execute(
            text(
                """
                SELECT id FROM auth_identities
                WHERE account_id = :account_id AND provider = :provider
                """
            ),
            {"account_id": account["id"], "provider": provider},
        ).scalar_one_or_none()
        if existing_for_account is not None:
            continue

        conflicting_account = connection.execute(
            text(
                """
                SELECT account_id FROM auth_identities
                WHERE provider = :provider AND provider_user_id = :provider_user_id
                """
            ),
            {"provider": provider, "provider_user_id": provider_user_id},
        ).scalar_one_or_none()
        if conflicting_account is not None and conflicting_account != account["id"]:
            raise RuntimeError("provider identity is already linked to another account")

        connection.execute(
            text(
                """
                INSERT INTO auth_identities (
                    account_id, provider, provider_user_id, provider_email,
                    email_verified, created_at, updated_at, last_login_at
                ) VALUES (
                    :account_id, :provider, :provider_user_id, :provider_email,
                    :email_verified, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, :last_login_at
                )
                """
            ),
            {
                "account_id": account["id"],
                "provider": provider,
                "provider_user_id": provider_user_id,
                "provider_email": account["email"],
                "email_verified": bool(account["email_verified"]),
                "last_login_at": account["last_login_at"],
            },
        )
        inserted += 1
    return inserted


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

        # Add every model table that is absent without modifying existing tables or rows.
        db.metadata.create_all(bind=connection, checkfirst=True)
        identity_count_before = connection.execute(text("SELECT COUNT(*) FROM auth_identities")).scalar_one()
        identities_added = backfill_auth_identities(connection)
        identity_count_after = connection.execute(text("SELECT COUNT(*) FROM auth_identities")).scalar_one()
        if identity_count_after != identity_count_before + identities_added:
            raise RuntimeError("auth identity backfill count mismatch")
        connection.execute(
            text("CREATE INDEX IF NOT EXISTS ix_auth_rate_limits_updated_at ON auth_rate_limits(updated_at)")
        )
        add_column_if_missing(connection, "health_users", "account_id", "account_id INTEGER")
        add_column_if_missing(connection, "health_users", "is_anonymous", "is_anonymous BOOLEAN NOT NULL DEFAULT TRUE")
        timestamp_type = "TIMESTAMPTZ" if backend == "postgresql" else "DATETIME"
        add_column_if_missing(connection, "health_users", "last_seen_at", f"last_seen_at {timestamp_type}")
        add_column_if_missing(connection, "health_users", "gender", "gender VARCHAR(16)")
        add_column_if_missing(connection, "auth_accounts", "terms_version", "terms_version VARCHAR(32)")
        add_column_if_missing(connection, "auth_accounts", "terms_accepted_at", f"terms_accepted_at {timestamp_type}")
        add_column_if_missing(connection, "auth_accounts", "privacy_version", "privacy_version VARCHAR(32)")
        add_column_if_missing(connection, "auth_accounts", "privacy_accepted_at", f"privacy_accepted_at {timestamp_type}")
        connection.execute(
            text(
                """
                UPDATE auth_accounts
                SET terms_version = COALESCE(terms_version, '2026-07-31'),
                    terms_accepted_at = COALESCE(terms_accepted_at, created_at),
                    privacy_version = COALESCE(privacy_version, '2026-08-01'),
                    privacy_accepted_at = COALESCE(privacy_accepted_at, created_at)
                WHERE terms_version IS NULL
                   OR terms_accepted_at IS NULL
                   OR privacy_version IS NULL
                   OR privacy_accepted_at IS NULL
                """
            )
        )
        connection.execute(text("UPDATE health_users SET is_anonymous = TRUE WHERE account_id IS NULL"))
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

        all_after_counts = table_counts(connection)
        after_counts = {table: all_after_counts[table] for table in before_counts}
        after_samples = sample_user_counts(connection)
        if before_counts != after_counts or before_samples != after_samples:
            raise RuntimeError("auth migration changed existing user-owned data counts")
        print("After counts:", after_counts)
        print("After sample users:", after_samples)
        print("Auth identities added:", identities_added)
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
