"""Create the preserved level-event ledger and optionally restore one audited event."""

import argparse
import json
import os
from datetime import date, datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, select

from models import HealthLevelEvent, HealthUser, db


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
    raise RuntimeError("DATABASE_URL must point to PostgreSQL or an explicitly allowed SQLite database")


def migrate(engine, restore_user_id=None, backup_dir=None):
    with engine.begin() as connection:
        db.metadata.create_all(bind=connection, tables=[HealthLevelEvent.__table__], checkfirst=True)
    inserted = False
    if restore_user_id is not None:
        from sqlalchemy.orm import Session

        with Session(engine) as session, session.begin():
            user = session.get(HealthUser, restore_user_id)
            if user is None:
                raise RuntimeError(f"HealthUser {restore_user_id} does not exist")
            existing_events = session.scalars(
                select(HealthLevelEvent).where(HealthLevelEvent.user_id == restore_user_id)
            ).all()
            if backup_dir:
                target_dir = Path(backup_dir)
                target_dir.mkdir(parents=True, exist_ok=True)
                timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
                backup_path = target_dir / f"level-history-user-{restore_user_id}-{timestamp}.json.bak"
                backup_path.write_text(
                    json.dumps(
                        {
                            "userId": user.id,
                            "nickname": user.nickname,
                            "weeklyWorkoutTarget": user.weekly_workout_target,
                            "weeklyTargetUpdatedAt": user.weekly_target_updated_at.isoformat() if user.weekly_target_updated_at else None,
                            "weeklyPenaltyCarryover": user.weekly_penalty_carryover,
                            "levelEvents": [
                                {
                                    "type": event.event_type,
                                    "date": event.event_date.isoformat(),
                                    "levelBefore": event.level_before,
                                    "levelAfter": event.level_after,
                                    "experienceDelta": event.experience_delta,
                                    "reason": event.reason,
                                    "sourceKey": event.source_key,
                                    "affectsCurrent": event.affects_current,
                                }
                                for event in existing_events
                            ],
                        },
                        ensure_ascii=False,
                        indent=2,
                    ),
                    encoding="utf-8",
                )
                print(f"Backup created: {backup_path}")
            source_key = "legacy-daily-penalty-2026-07-20-2026-07-25"
            existing = session.scalar(
                select(HealthLevelEvent).where(
                    HealthLevelEvent.user_id == restore_user_id,
                    HealthLevelEvent.source_key == source_key,
                )
            )
            if existing is None:
                session.add(
                    HealthLevelEvent(
                        user_id=restore_user_id,
                        event_type="level_down",
                        event_date=date(2026, 7, 26),
                        level_before=10,
                        level_after=4,
                        experience_delta=-6,
                        reason="운동 목표 미달",
                        source_key=source_key,
                        affects_current=False,
                    )
                )
                inserted = True
    with engine.connect() as connection:
        columns = {column["name"] for column in inspect(connection).get_columns("health_level_events")}
        count = connection.exec_driver_sql("SELECT COUNT(*) FROM health_level_events").scalar_one()
    expected = {column.name for column in HealthLevelEvent.__table__.columns}
    if not expected.issubset(columns):
        raise RuntimeError("health_level_events schema verification failed")
    print(f"health_level_events ready; rows={count}; restored={inserted}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-sqlite", action="store_true")
    parser.add_argument("--restore-user-id", type=int)
    parser.add_argument("--backup-dir")
    args = parser.parse_args()
    load_dotenv()
    url = normalize_database_url(os.getenv("DATABASE_URL"))
    if url.startswith("sqlite") and not args.allow_sqlite:
        raise RuntimeError("SQLite requires --allow-sqlite")
    migrate(create_engine(url), args.restore_user_id, args.backup_dir)


if __name__ == "__main__":
    main()
