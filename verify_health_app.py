"""End-to-end API verification against DATABASE_URL with isolated test data."""

from uuid import uuid4

from sqlalchemy import delete

from app import app
from models import HealthExercise, HealthUser, db


def headers(user_key):
    return {"X-User-Key": user_key, "Content-Type": "application/json"}


def run():
    user_key = f"verify-{uuid4()}"
    other_key = f"verify-{uuid4()}"
    exercise = f"verification-{uuid4()}"
    workout_id = None
    with app.test_client() as client:
        try:
            payload = {
                "date": "2026-06-22",
                "exercise": exercise,
                "setWeights": [8, 16, 8],
                "setReps": [10, 8, 12],
                "targetSets": 3,
                "completedSets": 3,
                "notes": "verification",
            }
            saved = client.post("/api/logs", headers=headers(user_key), json=payload)
            assert saved.status_code == 201, saved.get_data(as_text=True)
            workout_id = saved.get_json()["id"]

            listed = client.get("/api/logs", headers=headers(user_key))
            assert listed.status_code == 200
            record = next(item for item in listed.get_json() if item["id"] == workout_id)
            assert record["setWeights"] == [8.0, 16.0, 8.0]
            assert record["setReps"] == [10, 8, 12]

            with app.test_client() as reconnected:
                persisted = reconnected.get("/api/logs", headers=headers(user_key)).get_json()
                assert any(item["id"] == workout_id for item in persisted)

            isolated = client.get("/api/logs", headers=headers(other_key)).get_json()
            assert not any(item["id"] == workout_id for item in isolated)

            stats = client.get("/api/stats", headers=headers(user_key))
            assert stats.status_code == 200
            assert stats.get_json()["totalVolume"] == 304.0

            excuse = client.post(
                "/api/excuses",
                headers=headers(user_key),
                json={"date": "2026-06-22", "reason": "verification"},
            )
            assert excuse.status_code == 201
            excuses = client.get("/api/excuses?month=2026-06", headers=headers(user_key)).get_json()
            assert any(item["reason"] == "verification" for item in excuses)

            removed = client.delete(f"/api/logs/{workout_id}", headers=headers(user_key))
            assert removed.status_code == 204
            assert not any(
                item["id"] == workout_id
                for item in client.get("/api/logs", headers=headers(user_key)).get_json()
            )
            workout_id = None
        finally:
            with app.app_context():
                db.session.rollback()
                db.session.execute(
                    delete(HealthUser).where(HealthUser.user_key.like("verify-%"))
                )
                db.session.execute(
                    delete(HealthExercise).where(HealthExercise.name.like("verification-%"))
                )
                db.session.commit()
    print("PASS: save, read, reconnect, isolation, stats, SOS, delete")


if __name__ == "__main__":
    run()
