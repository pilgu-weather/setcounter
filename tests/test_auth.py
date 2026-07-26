import os
import secrets
import tempfile
import unittest
import uuid
from datetime import date
from pathlib import Path
from unittest.mock import patch

from sqlalchemy import create_engine, inspect, text

TEST_DB = Path(tempfile.gettempdir()) / "setcounter-auth-tests.sqlite3"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB.as_posix()}"
os.environ["SETCOUNTER_ALLOW_LOCAL_SQLITE"] = "1"
os.environ["SECRET_KEY"] = secrets.token_urlsafe(48)

from app import REQUIRED_SCHEMA, app, db, level_for_experience, stats_from_logs
from migrate_auth_data import migrate
from models import (
    AuthAccount,
    AuthRateLimit,
    HealthBoardComment,
    HealthBoardLike,
    HealthBoardPost,
    HealthBoardReport,
    HealthExcuse,
    HealthExercise,
    HealthPushSubscription,
    HealthPushConfig,
    HealthSet,
    HealthUser,
    HealthWorkout,
)


class AuthSystemTestCase(unittest.TestCase):
    def setUp(self):
        with app.app_context():
            db.drop_all()
            db.create_all()
        self.client = app.test_client()
        self.password = f"test-{secrets.token_urlsafe(18)}"

    @staticmethod
    def email(label):
        return f"{label}-{uuid.uuid4().hex}@example.test"

    @staticmethod
    def headers(user_key):
        return {"X-User-Key": user_key}

    def csrf_headers(self, client, user_key=None):
        headers = self.headers(user_key) if user_key else {}
        status = client.get("/api/auth/status", headers=headers)
        self.assertEqual(status.status_code, 200)
        headers["X-CSRF-Token"] = status.get_json()["csrfToken"]
        return headers

    def create_workout(self, user_key, exercise_name="Bench Press"):
        response = self.client.post(
            "/api/logs",
            headers=self.csrf_headers(self.client, user_key),
            json={"exercise": exercise_name, "date": "2026-07-16", "weightKg": 40, "reps": 10, "completedSets": 2},
        )
        self.assertEqual(response.status_code, 201, response.get_json())

    def user_for_key(self, user_key):
        with app.app_context():
            return db.session.query(HealthUser).filter_by(user_key=user_key).one()

    def register(self, user_key, email=None, password=None):
        email = email or self.email("member")
        password = password or self.password
        return self.client.post(
            "/api/auth/register",
            headers=self.csrf_headers(self.client, user_key),
            json={
                "email": email,
                "password": password,
                "passwordConfirm": password,
                "termsAccepted": True,
            },
        )

    def test_legacy_anonymous_data_survives_migration(self):
        legacy_path = Path(tempfile.gettempdir()) / "setcounter-auth-legacy.sqlite3"
        if legacy_path.exists():
            legacy_path.unlink()
        engine = create_engine(f"sqlite:///{legacy_path.as_posix()}", future=True)
        with engine.begin() as connection:
            connection.execute(text("CREATE TABLE health_users (id INTEGER PRIMARY KEY, user_key VARCHAR(128) UNIQUE NOT NULL, nickname VARCHAR(24), nickname_updated_at DATETIME, created_at DATETIME NOT NULL, legacy_claimable BOOLEAN NOT NULL DEFAULT 0)"))
            connection.execute(text("CREATE TABLE health_workouts (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, workout_date DATE NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, suspicion_score INTEGER NOT NULL DEFAULT 0, suspicion_flags TEXT NOT NULL DEFAULT '[]')"))
            connection.execute(text("CREATE TABLE health_sets (id INTEGER PRIMARY KEY, workout_id INTEGER NOT NULL, exercise_id INTEGER NOT NULL, set_index INTEGER NOT NULL, weight NUMERIC NOT NULL, reps INTEGER NOT NULL, memo TEXT NOT NULL DEFAULT '', created_at DATETIME NOT NULL)"))
            connection.execute(text("CREATE TABLE health_excuses (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, excuse_date DATE NOT NULL, excuse_text TEXT NOT NULL, created_at DATETIME NOT NULL)"))
            connection.execute(text("INSERT INTO health_users (id, user_key, created_at) VALUES (17, 'legacy-anonymous-key-0001', CURRENT_TIMESTAMP)"))
            connection.execute(text("INSERT INTO health_workouts (id, user_id, workout_date, created_at, updated_at) VALUES (1, 17, '2026-07-16', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"))
            connection.execute(text("INSERT INTO health_sets (id, workout_id, exercise_id, set_index, weight, reps, created_at) VALUES (1, 1, 1, 1, 40, 10, CURRENT_TIMESTAMP)"))
        migrate(engine)
        migrate(engine)
        with engine.connect() as connection:
            self.assertTrue(set(REQUIRED_SCHEMA).issubset(inspect(connection).get_table_names()))
            columns = {column["name"] for column in inspect(connection).get_columns("health_users")}
            self.assertTrue({"account_id", "is_anonymous", "last_seen_at"}.issubset(columns))
            user = connection.execute(text("SELECT id, account_id, is_anonymous FROM health_users WHERE id = 17")).mappings().one()
            self.assertEqual(user["id"], 17)
            self.assertIsNone(user["account_id"])
            self.assertTrue(user["is_anonymous"])
            self.assertEqual(connection.execute(text("SELECT COUNT(*) FROM health_workouts")).scalar_one(), 1)
            self.assertEqual(connection.execute(text("SELECT COUNT(*) FROM health_sets")).scalar_one(), 1)

    def test_register_links_existing_anonymous_user_without_moving_records(self):
        key = "anonymous-register-key-0001"
        self.create_workout(key)
        before_id = self.user_for_key(key).id
        response = self.register(key)
        self.assertEqual(response.status_code, 201, response.get_json())
        with app.app_context():
            user = self.user_for_key(key)
            self.assertEqual(user.id, before_id)
            self.assertFalse(user.is_anonymous)
            self.assertIsNotNone(user.account_id)
            self.assertEqual(db.session.query(HealthWorkout).filter_by(user_id=before_id).count(), 1)

    def test_auth_status_issues_csrf_and_register_requires_it(self):
        key = "csrf-register-key-0001"
        email = self.email("csrf")
        missing = self.client.post(
            "/api/auth/register",
            headers=self.headers(key),
            json={"email": email, "password": self.password, "passwordConfirm": self.password, "termsAccepted": True},
        )
        self.assertEqual(missing.status_code, 403)
        token = self.client.get("/api/auth/status", headers=self.headers(key)).get_json()["csrfToken"]
        registered = self.client.post(
            "/api/auth/register",
            headers={**self.headers(key), "X-CSRF-Token": token},
            json={"email": email, "password": self.password, "passwordConfirm": self.password, "termsAccepted": True},
        )
        self.assertEqual(registered.status_code, 201, registered.get_json())

    def test_account_linked_key_cannot_access_data_without_session(self):
        key = "anonymous-key-security-0001"
        self.create_workout(key)
        self.assertEqual(self.register(key).status_code, 201)
        anonymous_client = app.test_client()
        response = anonymous_client.get("/api/logs", headers=self.headers(key))
        self.assertEqual(response.status_code, 401)
        self.assertEqual(self.client.get("/api/logs", headers=self.headers(key)).status_code, 200)

    def test_login_from_other_browser_reads_same_account_data(self):
        key = "anonymous-login-key-0001"
        email = self.email("login")
        self.create_workout(key)
        self.assertEqual(self.register(key, email).status_code, 201)
        other_client = app.test_client()
        login = other_client.post("/api/auth/login", headers=self.csrf_headers(other_client), json={"email": email.upper(), "password": self.password})
        self.assertEqual(login.status_code, 200, login.get_json())
        logs = other_client.get("/api/logs")
        self.assertEqual(logs.status_code, 200)
        self.assertEqual(len(logs.get_json()), 1)

    def test_login_conflict_preserves_both_users_and_does_not_create_session(self):
        account_key = "account-conflict-key-0001"
        email = self.email("conflict")
        self.create_workout(account_key)
        self.assertEqual(self.register(account_key, email).status_code, 201)
        anonymous_client = app.test_client()
        anonymous_key = "device-conflict-key-0001"
        create = anonymous_client.post(
            "/api/logs",
            headers=self.csrf_headers(anonymous_client, anonymous_key),
            json={"exercise": "Squat", "date": "2026-07-16", "weight": 30, "reps": 8, "completedSets": 2},
        )
        self.assertEqual(create.status_code, 201)
        response = anonymous_client.post(
            "/api/auth/login",
            headers=self.csrf_headers(anonymous_client, anonymous_key),
            json={"email": email, "password": self.password},
        )
        self.assertEqual(response.status_code, 409)
        body = response.get_json()
        self.assertEqual(body["error"], "anonymous_data_conflict")
        self.assertEqual(body["anonymousSummary"]["workoutCount"], 1)
        self.assertEqual(body["accountSummary"]["workoutCount"], 1)
        self.assertEqual(anonymous_client.get("/api/logs", headers=self.headers(anonymous_key)).status_code, 200)

    def test_empty_anonymous_user_can_log_in(self):
        account_key = "account-empty-login-key-0001"
        email = self.email("empty")
        self.create_workout(account_key)
        self.assertEqual(self.register(account_key, email).status_code, 201)
        client = app.test_client()
        response = client.post(
            "/api/auth/login",
            headers=self.csrf_headers(client, "empty-anonymous-key-0001"),
            json={"email": email, "password": self.password},
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(len(client.get("/api/logs").get_json()), 1)

    def test_logout_clears_session_without_exposing_account_data(self):
        key = "logout-key-00001"
        self.create_workout(key)
        registered = self.register(key, self.email("logout"))
        self.assertEqual(registered.status_code, 201)
        session_cookie = registered.headers.get("Set-Cookie", "")
        self.assertIn("HttpOnly", session_cookie)
        self.assertIn("SameSite=Lax", session_cookie)
        self.assertIn("Expires=", session_cookie)
        response = self.client.post("/api/auth/logout", headers=self.csrf_headers(self.client))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["requiresNewAnonymousKey"])
        status = self.client.get("/api/auth/status", headers=self.headers(key)).get_json()
        self.assertFalse(status["authenticated"])
        self.assertEqual(self.client.get("/api/logs", headers=self.headers(key)).status_code, 401)

    def test_account_deletion_removes_account_and_all_user_owned_data(self):
        key = "delete-account-key-0001"
        email = self.email("delete")
        self.create_workout(key)
        self.assertEqual(self.register(key, email).status_code, 201)
        with app.app_context():
            user = db.session.query(HealthUser).filter_by(user_key=key).one()
            post = HealthBoardPost(user_id=user.id, level=3, nickname="삭제테스트", content="삭제될 게시글")
            db.session.add(post)
            db.session.flush()
            comment = HealthBoardComment(user_id=user.id, post_id=post.id, level=3, nickname="삭제테스트", content="삭제될 댓글")
            db.session.add(comment)
            db.session.flush()
            db.session.add(HealthBoardLike(user_id=user.id, post_id=post.id))
            db.session.add(HealthBoardReport(reporter_user_id=user.id, post_id=post.id, comment_id=comment.id, reason="삭제 테스트"))
            db.session.add(HealthExcuse(user_id=user.id, excuse_date=date(2026, 7, 17), excuse_text="회복"))
            db.session.add(HealthPushSubscription(user_id=user.id, endpoint=f"https://push.example/{uuid.uuid4().hex}", p256dh="key", auth="auth"))
            db.session.commit()

        wrong = self.client.post(
            "/api/auth/delete-account",
            headers=self.csrf_headers(self.client),
            json={"password": "not-the-password"},
        )
        self.assertEqual(wrong.status_code, 401)
        deleted = self.client.post(
            "/api/auth/delete-account",
            headers=self.csrf_headers(self.client),
            json={"password": self.password},
        )
        self.assertEqual(deleted.status_code, 200, deleted.get_json())
        self.assertTrue(deleted.get_json()["requiresNewAnonymousKey"])
        with app.app_context():
            for model in (
                AuthAccount,
                HealthUser,
                HealthWorkout,
                HealthSet,
                HealthExcuse,
                HealthBoardPost,
                HealthBoardComment,
                HealthBoardLike,
                HealthBoardReport,
                HealthPushSubscription,
            ):
                self.assertEqual(db.session.query(model).count(), 0, model.__name__)

    def test_public_account_deletion_page_deletes_without_installed_app(self):
        key = "public-delete-key-0001"
        email = self.email("public-delete")
        self.assertEqual(self.register(key, email).status_code, 201)
        client = app.test_client()
        page = client.get("/account-deletion")
        self.assertEqual(page.status_code, 200)
        with client.session_transaction() as browser_session:
            csrf_token = browser_session["csrf_token"]
        response = client.post(
            "/account-deletion",
            data={"csrf_token": csrf_token, "email": email, "password": self.password},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("계정 삭제가 완료되었습니다", response.get_data(as_text=True))
        with app.app_context():
            self.assertEqual(db.session.query(AuthAccount).count(), 0)
            self.assertEqual(db.session.query(HealthUser).count(), 0)

    def test_duplicate_email_does_not_damage_existing_account_or_user(self):
        first_key = "duplicate-first-key-0001"
        email = self.email("duplicate")
        self.assertEqual(self.register(first_key, email).status_code, 201)
        second_client = app.test_client()
        second_key = "duplicate-second-key-0001"
        response = second_client.post(
            "/api/auth/register",
            headers=self.csrf_headers(second_client, second_key),
            json={"email": email.upper(), "password": self.password, "passwordConfirm": self.password, "termsAccepted": True},
        )
        self.assertEqual(response.status_code, 409)
        with app.app_context():
            self.assertEqual(db.session.query(AuthAccount).filter_by(email=email).count(), 1)
            second_user = self.user_for_key(second_key)
            self.assertIsNone(second_user.account_id)
            self.assertTrue(second_user.is_anonymous)

    def test_register_failure_rolls_back_account_and_profile_link(self):
        key = "transaction-rollback-key-0001"
        email = self.email("rollback")
        self.create_workout(key)
        with patch.object(db.session, "commit", side_effect=[None, RuntimeError("forced failure")]):
            response = self.register(key, email)
        self.assertEqual(response.status_code, 500)
        with app.app_context():
            self.assertEqual(db.session.query(AuthAccount).filter_by(email=email).count(), 0)
            user = self.user_for_key(key)
            self.assertIsNone(user.account_id)
            self.assertTrue(user.is_anonymous)

    def test_csrf_protects_regular_state_changes(self):
        key = "csrf-regular-api-key-0001"
        blocked = self.client.post(
            "/api/logs",
            headers=self.headers(key),
            json={"exercise": "Bench Press", "date": "2026-07-16", "weight": 40, "reps": 10, "completedSets": 2},
        )
        self.assertEqual(blocked.status_code, 403)
        self.create_workout(key)
        with app.app_context():
            log_id = db.session.query(HealthWorkout.id).one()[0]
        deleted = self.client.delete(f"/api/logs/{log_id}", headers=self.csrf_headers(self.client, key))
        self.assertEqual(deleted.status_code, 204)

    def test_korean_nickname_is_accepted(self):
        key = "korean-nickname-key-0001"
        response = self.client.post(
            "/api/profile",
            headers=self.csrf_headers(self.client, key),
            json={"nickname": "운동친구"},
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(response.get_json()["nickname"], "운동친구")

    def test_login_rate_limit_blocks_repeated_invalid_passwords(self):
        key = "rate-limit-account-key-0001"
        email = self.email("rate-limit")
        self.create_workout(key)
        self.assertEqual(self.register(key, email).status_code, 201)
        client = app.test_client()
        wrong_password = f"wrong-{secrets.token_urlsafe(18)}"
        for _ in range(8):
            response = client.post(
                "/api/auth/login",
                headers=self.csrf_headers(client),
                json={"email": email, "password": wrong_password},
            )
            self.assertEqual(response.status_code, 401)
        blocked = client.post(
            "/api/auth/login",
            headers=self.csrf_headers(client),
            json={"email": email, "password": self.password},
        )
        self.assertEqual(blocked.status_code, 429)
        self.assertEqual(blocked.get_json()["error"], "auth_rate_limited")
        with app.app_context():
            self.assertGreaterEqual(db.session.query(AuthRateLimit).count(), 2)

    def test_public_legal_pages_are_available_without_authentication(self):
        for path, heading in (
            ("/privacy", "개인정보 처리방침"),
            ("/terms", "이용약관"),
            ("/account-deletion", "Set Counter 계정 삭제"),
        ):
            response = app.test_client().get(path)
            self.assertEqual(response.status_code, 200, path)
            self.assertIn(heading, response.get_data(as_text=True))

    def test_assetlinks_uses_configured_play_signing_fingerprints(self):
        fingerprints = "AA:BB:CC:DD,11:22:33:44"
        with patch.dict(os.environ, {"ANDROID_SHA256_CERT_FINGERPRINT": fingerprints}):
            response = self.client.get("/.well-known/assetlinks.json")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload[0]["target"]["package_name"], "com.setcounter.app")
        self.assertEqual(
            payload[0]["target"]["sha256_cert_fingerprints"],
            ["AA:BB:CC:DD", "11:22:33:44"],
        )

    def test_recording_data_round_trip_and_user_isolation(self):
        key = "record-round-trip-key-0001"
        other_key = "record-round-trip-key-0002"
        profile = self.client.post(
            "/api/profile",
            headers=self.csrf_headers(self.client, key),
            json={"nickname": "기록검증"},
        )
        self.assertEqual(profile.status_code, 200, profile.get_json())

        created = self.client.post(
            "/api/logs",
            headers=self.csrf_headers(self.client, key),
            json={
                "exercise": "Bench Press",
                "date": "2026-07-20",
                "weightKg": 17,
                "reps": 10,
                "completedSets": 3,
                "setWeights": [17, 18, 19],
                "setReps": [10, 10, 12],
            },
        )
        self.assertEqual(created.status_code, 201, created.get_json())
        created_log = created.get_json()
        self.assertEqual(created_log["setWeights"], [17.0, 18.0, 19.0])
        self.assertEqual(created_log["setReps"], [10, 10, 12])
        self.assertEqual(created_log["volume"], 578.0)

        excuse_headers = self.csrf_headers(self.client, key)
        first_excuse = self.client.post(
            "/api/excuses",
            headers=excuse_headers,
            json={"date": "2026-07-21", "reason": "회복 필요"},
        )
        self.assertEqual(first_excuse.status_code, 201, first_excuse.get_json())
        updated_excuse = self.client.post(
            "/api/excuses",
            headers=excuse_headers,
            json={"date": "2026-07-21", "reason": "몸살"},
        )
        self.assertEqual(updated_excuse.status_code, 201, updated_excuse.get_json())

        day_logs = self.client.get("/api/logs/day?date=2026-07-20", headers=self.headers(key))
        month_logs = self.client.get("/api/logs?month=2026-07", headers=self.headers(key))
        latest = self.client.get(
            "/api/logs/latest?exercise=Bench%20Press", headers=self.headers(key)
        )
        stats = self.client.get("/api/stats", headers=self.headers(key))
        bootstrap = self.client.get("/api/bootstrap?month=2026-07", headers=self.headers(key))
        for response in (day_logs, month_logs, latest, stats, bootstrap):
            self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(len(day_logs.get_json()), 1)
        self.assertEqual(len(month_logs.get_json()), 1)
        self.assertEqual(latest.get_json()["id"], created_log["id"])
        self.assertEqual(stats.get_json()["totalVolume"], 578.0)
        self.assertEqual(stats.get_json()["totalReps"], 32)
        self.assertEqual(stats.get_json()["totalSets"], 3)
        self.assertEqual(stats.get_json()["totalRecords"], 1)
        bootstrap_data = bootstrap.get_json()
        self.assertEqual(bootstrap_data["profile"]["nickname"], "기록검증")
        self.assertEqual(bootstrap_data["latestByExercise"]["Bench Press"]["id"], created_log["id"])
        self.assertEqual(len(bootstrap_data["excuses"]), 1)
        self.assertEqual(bootstrap_data["excuses"][0]["reason"], "몸살")

        with app.app_context():
            user = db.session.query(HealthUser).filter_by(user_key=key).one()
            workout = db.session.get(HealthWorkout, created_log["id"])
            self.assertEqual(workout.user_id, user.id)
            self.assertEqual(db.session.query(HealthExercise).filter_by(name="Bench Press").count(), 1)
            self.assertEqual(
                [float(row.weight) for row in db.session.query(HealthSet).order_by(HealthSet.set_index)],
                [17.0, 18.0, 19.0],
            )
            self.assertEqual(db.session.query(HealthExcuse).filter_by(user_id=user.id).count(), 1)

        other_bootstrap = self.client.get("/api/bootstrap?month=2026-07", headers=self.headers(other_key))
        self.assertEqual(other_bootstrap.status_code, 200)
        self.assertEqual(other_bootstrap.get_json()["logs"], [])
        self.assertEqual(other_bootstrap.get_json()["excuses"], [])
        forbidden_delete = self.client.delete(
            f"/api/logs/{created_log['id']}",
            headers=self.csrf_headers(self.client, other_key),
        )
        self.assertEqual(forbidden_delete.status_code, 404)
        deleted = self.client.delete(
            f"/api/logs/{created_log['id']}", headers=self.csrf_headers(self.client, key)
        )
        self.assertEqual(deleted.status_code, 204)
        with app.app_context():
            self.assertEqual(db.session.query(HealthWorkout).count(), 0)
            self.assertEqual(db.session.query(HealthSet).count(), 0)

    def test_level_history_deducts_latest_experience_and_recalculates_level(self):
        key = "level-history-key-0001"
        workout_date = date.today().isoformat()

        def save(weight):
            return self.client.post(
                "/api/logs",
                headers=self.csrf_headers(self.client, key),
                json={
                    "exercise": "Bench Press",
                    "date": workout_date,
                    "weightKg": weight,
                    "setWeights": [weight, weight],
                    "setReps": [10, 10],
                    "completedSets": 2,
                },
            )

        baseline = save(10)
        self.assertEqual(baseline.status_code, 201, baseline.get_json())
        self.assertFalse(baseline.get_json()["leveledUp"])
        self.assertEqual(baseline.get_json()["levelBefore"], 1)
        self.assertEqual(baseline.get_json()["levelAfter"], 1)

        personal_best = save(11)
        self.assertEqual(personal_best.status_code, 201, personal_best.get_json())
        self.assertTrue(personal_best.get_json()["leveledUp"])
        self.assertEqual(personal_best.get_json()["levelBefore"], 1)
        self.assertEqual(personal_best.get_json()["levelAfter"], 2)

        lower_record = save(9)
        self.assertEqual(lower_record.status_code, 201, lower_record.get_json())
        self.assertTrue(lower_record.get_json()["leveledDown"])
        self.assertTrue(lower_record.get_json()["experienceReduced"])
        self.assertEqual(lower_record.get_json()["levelBefore"], 2)
        self.assertEqual(lower_record.get_json()["levelAfter"], 1)
        self.assertEqual(lower_record.get_json()["experienceBefore"], 1)
        self.assertEqual(lower_record.get_json()["experienceAfter"], 0)

        stats = self.client.get("/api/stats", headers=self.headers(key))
        self.assertEqual(stats.status_code, 200, stats.get_json())
        history = stats.get_json()["levelHistory"]
        self.assertEqual(len(history), 2)
        self.assertEqual(stats.get_json()["level"], 1)
        self.assertEqual(stats.get_json()["levelDowns"], 1)
        self.assertEqual(stats.get_json()["experienceDowns"], 1)
        self.assertEqual(history[0]["type"], "level_down")
        self.assertEqual(history[0]["levelBefore"], 2)
        self.assertEqual(history[0]["levelAfter"], 1)
        self.assertEqual(history[0]["experienceDelta"], -1)
        self.assertEqual(history[1]["type"], "level_up")
        self.assertEqual(history[1]["exercise"], "Bench Press")
        self.assertEqual(history[1]["date"], workout_date)

    def test_high_level_loss_removes_latest_fractional_award_and_recalculates_level(self):
        workout_date = date.today().isoformat()
        logs = []
        for index in range(32):
            logs.append(
                {
                    "exercise": "Bench Press",
                    "date": workout_date,
                    "createdAt": f"2026-07-26T00:{index:02d}:00+00:00",
                    "volume": 100 + index,
                    "totalReps": 10,
                    "completedSets": 1,
                    "suspicionScore": 0,
                }
            )

        before_last_gain = stats_from_logs(logs[:-1], set())
        before = stats_from_logs(logs, set())
        self.assertGreaterEqual(before["level"], 20)
        latest_award = before["experience"] - before_last_gain["experience"]
        logs.append(
            {
                "exercise": "Bench Press",
                "date": workout_date,
                "createdAt": "2026-07-26T01:00:00+00:00",
                "volume": 100,
                "totalReps": 10,
                "completedSets": 1,
                "suspicionScore": 0,
            }
        )

        after = stats_from_logs(logs, set())
        self.assertAlmostEqual(after["experience"], before["experience"] - latest_award, places=2)
        self.assertEqual(after["level"], level_for_experience(after["experience"]))
        expected_type = "level_down" if after["level"] < before["level"] else "experience_down"
        self.assertEqual(after["levelHistory"][0]["type"], expected_type)
        self.assertEqual(after["levelDowns"], 1 if after["level"] < before["level"] else 0)
        self.assertAlmostEqual(after["levelHistory"][0]["experienceDelta"], -latest_award, places=2)

    def test_experience_loss_keeps_level_when_xp_remains_above_level_floor(self):
        workout_date = date.today().isoformat()
        logs = [
            {
                "exercise": "Squat",
                "date": workout_date,
                "createdAt": f"2026-07-26T02:{index:02d}:00+00:00",
                "volume": 100 + index,
                "totalReps": 10,
                "completedSets": 1,
                "suspicionScore": 0,
            }
            for index in range(11)
        ]
        before_last_gain = stats_from_logs(logs[:-1], set())
        before = stats_from_logs(logs, set())
        self.assertEqual(before_last_gain["level"], 10)
        self.assertEqual(before["level"], 10)
        self.assertAlmostEqual(before["experience"], 9.9, places=2)

        logs.append(
            {
                "exercise": "Squat",
                "date": workout_date,
                "createdAt": "2026-07-26T03:00:00+00:00",
                "volume": 50,
                "totalReps": 10,
                "completedSets": 1,
                "suspicionScore": 0,
            }
        )
        after = stats_from_logs(logs, set())
        self.assertEqual(after["level"], 10)
        self.assertAlmostEqual(after["experience"], 9, places=2)
        self.assertEqual(after["levelDowns"], 0)
        self.assertEqual(after["levelHistory"][0]["type"], "experience_down")
        self.assertAlmostEqual(after["levelHistory"][0]["experienceDelta"], -0.9, places=2)

    def test_board_and_push_records_keep_user_ownership(self):
        author_key = "board-author-key-0001"
        reader_key = "board-reader-key-0001"
        for key, nickname in ((author_key, "작성자"), (reader_key, "독자")):
            response = self.client.post(
                "/api/profile",
                headers=self.csrf_headers(self.client, key),
                json={"nickname": nickname},
            )
            self.assertEqual(response.status_code, 200, response.get_json())

        post_response = self.client.post(
            "/api/board/posts",
            headers=self.csrf_headers(self.client, author_key),
            json={"content": "오늘 운동 완료"},
        )
        self.assertEqual(post_response.status_code, 201, post_response.get_json())
        post_id = post_response.get_json()["id"]
        liked = self.client.post(
            f"/api/board/posts/{post_id}/like",
            headers=self.csrf_headers(self.client, reader_key),
        )
        self.assertEqual(liked.status_code, 200, liked.get_json())
        commented = self.client.post(
            f"/api/board/posts/{post_id}/comments",
            headers=self.csrf_headers(self.client, reader_key),
            json={"content": "좋은 기록입니다"},
        )
        self.assertEqual(commented.status_code, 200, commented.get_json())
        comment_id = commented.get_json()[0]["comments"][0]["id"]
        with patch("app.send_discord_board_report"):
            reported = self.client.post(
                "/api/board/reports",
                headers=self.csrf_headers(self.client, reader_key),
                json={"postId": post_id, "commentId": comment_id, "reason": "검증 신고"},
            )
        self.assertEqual(reported.status_code, 200, reported.get_json())
        self.assertTrue(reported.get_json()["notificationDelivered"])

        endpoint = f"https://push.example/{uuid.uuid4().hex}"
        subscribed = self.client.post(
            "/api/push/subscribe",
            headers=self.csrf_headers(self.client, reader_key),
            json={"endpoint": endpoint, "keys": {"p256dh": "public-key", "auth": "auth-key"}},
        )
        self.assertEqual(subscribed.status_code, 201, subscribed.get_json())
        self.assertEqual(
            self.client.post(
                "/api/push/unsubscribe",
                headers=self.csrf_headers(self.client, author_key),
                json={"endpoint": endpoint},
            ).status_code,
            204,
        )

        board = self.client.get("/api/board/posts", headers=self.headers(reader_key))
        self.assertEqual(board.status_code, 200)
        row = board.get_json()[0]
        self.assertTrue(row["likedByMe"])
        self.assertEqual(row["likeCount"], 1)
        self.assertEqual(len(row["comments"]), 1)
        with app.app_context():
            author = db.session.query(HealthUser).filter_by(user_key=author_key).one()
            reader = db.session.query(HealthUser).filter_by(user_key=reader_key).one()
            self.assertEqual(db.session.get(HealthBoardPost, post_id).user_id, author.id)
            self.assertEqual(db.session.query(HealthBoardLike).one().user_id, reader.id)
            self.assertEqual(db.session.query(HealthBoardComment).one().user_id, reader.id)
            self.assertEqual(db.session.query(HealthBoardReport).one().reporter_user_id, reader.id)
            self.assertEqual(db.session.query(HealthPushSubscription).one().user_id, reader.id)

        unsubscribed = self.client.post(
            "/api/push/unsubscribe",
            headers=self.csrf_headers(self.client, reader_key),
            json={"endpoint": endpoint},
        )
        self.assertEqual(unsubscribed.status_code, 204)
        with app.app_context():
            self.assertEqual(db.session.query(HealthPushSubscription).count(), 0)

    def test_board_report_remains_successful_when_notification_fails(self):
        author_key = "report-author-key-0001"
        reporter_key = "report-reader-key-0001"
        post = self.client.post(
            "/api/board/posts",
            headers=self.csrf_headers(self.client, author_key),
            json={"content": "신고 저장 검증"},
        )
        self.assertEqual(post.status_code, 201, post.get_json())
        with patch("app.send_discord_board_report", side_effect=RuntimeError("delivery failed")):
            response = self.client.post(
                "/api/board/reports",
                headers=self.csrf_headers(self.client, reporter_key),
                json={"postId": post.get_json()["id"], "reason": "외부 알림 실패 검증"},
            )
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertTrue(response.get_json()["ok"])
        self.assertFalse(response.get_json()["notificationDelivered"])
        with app.app_context():
            self.assertEqual(db.session.query(HealthBoardReport).count(), 1)

    def test_storage_status_reports_the_active_database_backend(self):
        response = self.client.get("/api/storage")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["backend"], "sqlite")
        self.assertTrue(response.get_json()["persistent"])

    def test_vapid_public_key_is_persisted_once(self):
        key = "push-config-key-0001"
        first = self.client.get("/api/push/vapid-public-key", headers=self.headers(key))
        second = self.client.get("/api/push/vapid-public-key", headers=self.headers(key))
        self.assertEqual(first.status_code, 200, first.get_json())
        self.assertEqual(second.status_code, 200, second.get_json())
        self.assertEqual(first.get_json()["publicKey"], second.get_json()["publicKey"])
        with app.app_context():
            self.assertEqual(db.session.query(HealthPushConfig).count(), 1)


if __name__ == "__main__":
    unittest.main()
