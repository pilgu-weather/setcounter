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

from app import app, db
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
            json={"exercise": exercise_name, "date": "2026-07-16", "weight": 40, "reps": 10, "completedSets": 2},
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


if __name__ == "__main__":
    unittest.main()
