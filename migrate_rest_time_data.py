import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text


def normalized_database_url(value):
    value = (value or "").strip()
    if not value:
        raise RuntimeError("DATABASE_URL is required")
    if value.startswith("postgres://"):
        value = "postgresql://" + value[len("postgres://") :]
    if value.startswith("postgresql+psycopg2://"):
        value = "postgresql://" + value[len("postgresql+psycopg2://") :]
    if value.startswith("postgresql://"):
        return "postgresql+psycopg://" + value[len("postgresql://") :]
    return value


def migrate(database_url):
    engine = create_engine(normalized_database_url(database_url), pool_pre_ping=True)
    schema = inspect(engine)
    if "health_workouts" not in schema.get_table_names():
        raise RuntimeError("health_workouts table does not exist")
    columns = {column["name"] for column in schema.get_columns("health_workouts")}
    changed = "rest_seconds" not in columns
    if changed:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE health_workouts ADD COLUMN rest_seconds INTEGER NOT NULL DEFAULT 90")
            )
    verified = {column["name"] for column in inspect(engine).get_columns("health_workouts")}
    if "rest_seconds" not in verified:
        raise RuntimeError("rest_seconds migration verification failed")
    engine.dispose()
    return changed


if __name__ == "__main__":
    load_dotenv()
    database_url = os.environ.get("DATABASE_URL", "").strip()
    if not database_url.startswith("sqlite:///") and os.environ.get("SETCOUNTER_ALLOW_REMOTE_MIGRATION") != "1":
        raise RuntimeError("Remote migration requires SETCOUNTER_ALLOW_REMOTE_MIGRATION=1")
    was_changed = migrate(database_url)
    print("Workout rest-time migration completed." if was_changed else "Workout rest-time migration already applied.")
