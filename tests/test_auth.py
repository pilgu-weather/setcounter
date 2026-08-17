import os
import secrets
import tempfile
import unittest
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

from sqlalchemy import create_engine, func, inspect, select, text
from sqlalchemy.exc import IntegrityError

TEST_DB = Path(tempfile.gettempdir()) / "setcounter-auth-tests.sqlite3"
if TEST_DB.exists():
    TEST_DB.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB.as_posix()}"
os.environ["SETCOUNTER_ALLOW_LOCAL_SQLITE"] = "1"
os.environ["SECRET_KEY"] = secrets.token_urlsafe(48)

from app import (
    REQUIRED_SCHEMA,
    account_for_auth_identity,
    app,
    breakthrough_rate_for_level,
    db,
    level_for_experience,
    stats_from_logs,
    start_of_week,
    volume_stats,
    weekly_challenge_penalty,
)
from migrate_auth_data import migrate
from migrate_level_events import migrate as migrate_level_events
from models import (
    AuthAccount,
    AuthIdentity,
    AuthRateLimit,
    HealthBoardComment,
    HealthBoardBlock,
    HealthBoardLike,
    HealthBoardPost,
    HealthBoardReport,
    HealthExcuse,
    HealthExercise,
    HealthLevelEvent,
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
            json={"exercise": exercise_name, "date": "2026-07-16", "weightKg": 40, "reps": 10, "completedSets": 2, "restSeconds": 75},
        )
        self.assertEqual(response.status_code, 201, response.get_json())

    def user_for_key(self, user_key):
        with app.app_context():
            return db.session.query(HealthUser).filter_by(user_key=user_key).one()

    @staticmethod
    def user_owned_snapshot(user_id):
        """Return stable IDs and ownership links for every user-owned table."""
        workouts = db.session.query(HealthWorkout).filter_by(user_id=user_id).order_by(HealthWorkout.id).all()
        workout_ids = [row.id for row in workouts]
        return {
            "workouts": [(row.id, row.user_id, row.workout_date, row.rest_seconds) for row in workouts],
            "sets": [
                (row.id, row.workout_id, row.exercise_id, row.set_index, float(row.weight), row.reps)
                for row in db.session.query(HealthSet)
                .filter(HealthSet.workout_id.in_(workout_ids or [-1]))
                .order_by(HealthSet.id)
            ],
            "excuses": [
                (row.id, row.user_id, row.excuse_date, row.excuse_text)
                for row in db.session.query(HealthExcuse).filter_by(user_id=user_id).order_by(HealthExcuse.id)
            ],
            "levelEvents": [
                (row.id, row.user_id, row.event_type, row.experience_delta, row.source_key)
                for row in db.session.query(HealthLevelEvent).filter_by(user_id=user_id).order_by(HealthLevelEvent.id)
            ],
            "posts": [
                (row.id, row.user_id, row.level, row.nickname, row.content)
                for row in db.session.query(HealthBoardPost).filter_by(user_id=user_id).order_by(HealthBoardPost.id)
            ],
            "likes": [
                (row.id, row.post_id, row.user_id)
                for row in db.session.query(HealthBoardLike).filter_by(user_id=user_id).order_by(HealthBoardLike.id)
            ],
            "comments": [
                (row.id, row.post_id, row.user_id, row.level, row.nickname, row.content)
                for row in db.session.query(HealthBoardComment).filter_by(user_id=user_id).order_by(HealthBoardComment.id)
            ],
            "reports": [
                (row.id, row.reporter_user_id, row.post_id, row.comment_id, row.reason)
                for row in db.session.query(HealthBoardReport)
                .filter_by(reporter_user_id=user_id)
                .order_by(HealthBoardReport.id)
            ],
            "blocks": [
                (row.id, row.blocker_user_id, row.blocked_user_id)
                for row in db.session.query(HealthBoardBlock)
                .filter_by(blocker_user_id=user_id)
                .order_by(HealthBoardBlock.id)
            ],
            "pushSubscriptions": [
                (row.id, row.user_id, row.endpoint, row.p256dh, row.auth)
                for row in db.session.query(HealthPushSubscription)
                .filter_by(user_id=user_id)
                .order_by(HealthPushSubscription.id)
            ],
        }

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
                "privacyAccepted": True,
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
            self.assertTrue({"account_id", "is_anonymous", "last_seen_at", "gender"}.issubset(columns))
            user = connection.execute(text("SELECT id, account_id, is_anonymous FROM health_users WHERE id = 17")).mappings().one()
            self.assertEqual(user["id"], 17)
            self.assertIsNone(user["account_id"])
            self.assertTrue(user["is_anonymous"])
            self.assertEqual(connection.execute(text("SELECT COUNT(*) FROM health_workouts")).scalar_one(), 1)
            self.assertEqual(connection.execute(text("SELECT COUNT(*) FROM health_sets")).scalar_one(), 1)

    def test_migration_backfills_one_local_identity_per_existing_account(self):
        legacy_path = Path(tempfile.gettempdir()) / "setcounter-auth-identity-legacy.sqlite3"
        if legacy_path.exists():
            legacy_path.unlink()
        engine = create_engine(f"sqlite:///{legacy_path.as_posix()}", future=True)
        with engine.begin() as connection:
            connection.execute(
                text(
                    """
                    CREATE TABLE auth_accounts (
                        id INTEGER PRIMARY KEY,
                        email VARCHAR(320) UNIQUE NOT NULL,
                        password_hash VARCHAR(512) NOT NULL,
                        email_verified BOOLEAN NOT NULL DEFAULT 0,
                        status VARCHAR(32) NOT NULL DEFAULT 'active',
                        provider VARCHAR(32) NOT NULL DEFAULT 'local',
                        provider_user_id VARCHAR(255),
                        created_at DATETIME NOT NULL,
                        updated_at DATETIME NOT NULL,
                        last_login_at DATETIME
                    )
                    """
                )
            )
            connection.execute(
                text(
                    """
                    INSERT INTO auth_accounts (
                        id, email, password_hash, email_verified, status,
                        provider, created_at, updated_at
                    ) VALUES (
                        7, 'legacy@example.test', 'legacy-hash', 0, 'active',
                        'local', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                    """
                )
            )
        migrate(engine)
        migrate(engine)
        with engine.connect() as connection:
            identities = connection.execute(
                text(
                    """
                    SELECT account_id, provider, provider_user_id, provider_email
                    FROM auth_identities
                    """
                )
            ).mappings().all()
            self.assertEqual(len(identities), 1)
            self.assertEqual(identities[0]["account_id"], 7)
            self.assertEqual(identities[0]["provider"], "local")
            self.assertEqual(identities[0]["provider_user_id"], "legacy@example.test")
            self.assertEqual(identities[0]["provider_email"], "legacy@example.test")
            consent = connection.execute(
                text(
                    """
                    SELECT terms_version, terms_accepted_at, privacy_version, privacy_accepted_at
                    FROM auth_accounts WHERE id = 7
                    """
                )
            ).mappings().one()
            self.assertEqual(consent["terms_version"], "2026-07-31")
            self.assertEqual(consent["privacy_version"], "2026-08-01")
            self.assertIsNotNone(consent["terms_accepted_at"])
            self.assertIsNotNone(consent["privacy_accepted_at"])

    def test_preserved_level_down_history_does_not_change_current_progress(self):
        with app.app_context():
            user = HealthUser(user_key="preserved-level-event-user", is_anonymous=True)
            db.session.add(user)
            db.session.commit()
            before = volume_stats(user.id)
            db.session.add(
                HealthLevelEvent(
                    user_id=user.id,
                    event_type="level_down",
                    event_date=date(2026, 7, 26),
                    level_before=10,
                    level_after=4,
                    experience_delta=-6,
                    reason="운동 목표 미달",
                    source_key="test-preserved-level-down",
                    affects_current=False,
                )
            )
            db.session.commit()
            after = volume_stats(user.id)

            self.assertEqual(after["level"], before["level"])
            self.assertEqual(after["experience"], before["experience"])
            self.assertEqual(after["levelDowns"], 6)
            self.assertEqual(after["recordedLevelDowns"], 6)
            self.assertEqual(after["levelHistory"][0]["levelBefore"], 10)
            self.assertEqual(after["levelHistory"][0]["levelAfter"], 4)
            self.assertTrue(after["levelHistory"][0]["preserved"])

    def test_level_event_migration_is_idempotent(self):
        migration_path = Path(tempfile.gettempdir()) / "setcounter-level-events.sqlite3"
        if migration_path.exists():
            migration_path.unlink()
        engine = create_engine(f"sqlite:///{migration_path.as_posix()}", future=True)
        db.metadata.create_all(engine)
        with engine.begin() as connection:
            connection.execute(
                text(
                    "INSERT INTO health_users (id, user_key, created_at, legacy_claimable, is_anonymous, weekly_penalty_carryover) "
                    "VALUES (8, 'level-event-migration-user', CURRENT_TIMESTAMP, 0, 1, 0)"
                )
            )
        migrate_level_events(engine, 8)
        migrate_level_events(engine, 8)
        with engine.connect() as connection:
            self.assertEqual(connection.execute(text("SELECT COUNT(*) FROM health_level_events")).scalar_one(), 1)

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
            self.assertEqual(user.weekly_workout_target, 3)
            self.assertIsNotNone(user.weekly_target_updated_at)
            self.assertGreater(user.weekly_penalty_carryover, 0)
            self.assertEqual(db.session.query(HealthWorkout).filter_by(user_id=before_id).count(), 1)
            identity = db.session.query(AuthIdentity).filter_by(account_id=user.account_id).one()
            account = db.session.get(AuthAccount, user.account_id)
            self.assertEqual(identity.provider, "local")
            self.assertEqual(identity.provider_user_id, account.email)

    def test_register_preserves_every_guest_owned_record_and_profile_field(self):
        key = "anonymous-full-link-key-0001"
        profile = self.client.post(
            "/api/profile",
            headers=self.csrf_headers(self.client, key),
            json={"nickname": "연동검증"},
        )
        self.assertEqual(profile.status_code, 200, profile.get_json())
        workout = self.client.post(
            "/api/logs",
            headers=self.csrf_headers(self.client, key),
            json={
                "exercise": "Romanian Deadlift",
                "date": "2026-08-01",
                "setWeights": [40, 45],
                "setReps": [10, 8],
                "completedSets": 2,
                "restSeconds": 100,
            },
        )
        self.assertEqual(workout.status_code, 201, workout.get_json())
        excuse = self.client.post(
            "/api/excuses",
            headers=self.csrf_headers(self.client, key),
            json={"date": "2026-08-02", "reason": "야근"},
        )
        self.assertEqual(excuse.status_code, 201, excuse.get_json())
        own_post = self.client.post(
            "/api/board/posts",
            headers=self.csrf_headers(self.client, key),
            json={"content": "게스트 기록 연동 검증"},
        )
        self.assertEqual(own_post.status_code, 201, own_post.get_json())

        with app.app_context():
            guest = db.session.query(HealthUser).filter_by(user_key=key).one()
            other = HealthUser(user_key="full-link-other-user-0001", nickname="상대사용자", is_anonymous=True)
            db.session.add(other)
            db.session.flush()
            other_post = HealthBoardPost(
                user_id=other.id,
                level=1,
                nickname="상대사용자",
                content="상대 게시글",
            )
            db.session.add(other_post)
            db.session.add(
                HealthLevelEvent(
                    user_id=guest.id,
                    event_type="level_up",
                    event_date=date(2026, 8, 1),
                    level_before=1,
                    level_after=2,
                    experience_delta=100,
                    reason="첫 운동",
                    source_key="full-link-level-event",
                    affects_current=True,
                )
            )
            db.session.commit()
            guest_id = guest.id
            other_id = other.id
            other_post_id = other_post.id

        liked = self.client.post(
            f"/api/board/posts/{other_post_id}/like",
            headers=self.csrf_headers(self.client, key),
        )
        self.assertEqual(liked.status_code, 200, liked.get_json())
        commented = self.client.post(
            f"/api/board/posts/{other_post_id}/comments",
            headers=self.csrf_headers(self.client, key),
            json={"content": "게스트 댓글"},
        )
        self.assertEqual(commented.status_code, 200, commented.get_json())
        with patch("app.send_discord_board_report"):
            reported = self.client.post(
                "/api/board/reports",
                headers=self.csrf_headers(self.client, key),
                json={"postId": other_post_id, "reason": "연동 검증 신고"},
            )
        self.assertEqual(reported.status_code, 200, reported.get_json())
        blocked = self.client.post(
            f"/api/board/users/{other_id}/block",
            headers=self.csrf_headers(self.client, key),
        )
        self.assertEqual(blocked.status_code, 200, blocked.get_json())
        subscribed = self.client.post(
            "/api/push/subscribe",
            headers=self.csrf_headers(self.client, key),
            json={
                "endpoint": "https://push.example/full-link",
                "keys": {"p256dh": "full-link-public", "auth": "full-link-auth"},
            },
        )
        self.assertEqual(subscribed.status_code, 201, subscribed.get_json())

        before_bootstrap = self.client.get("/api/bootstrap", headers=self.headers(key))
        self.assertEqual(before_bootstrap.status_code, 200, before_bootstrap.get_json())
        with app.app_context():
            guest = db.session.get(HealthUser, guest_id)
            before_profile = (guest.id, guest.user_key, guest.nickname, guest.nickname_updated_at)
            before_owned = self.user_owned_snapshot(guest_id)
            before_counts = {
                model.__tablename__: db.session.query(model).count()
                for model in (
                    HealthUser,
                    AuthAccount,
                    AuthIdentity,
                    HealthWorkout,
                    HealthSet,
                    HealthExcuse,
                    HealthLevelEvent,
                    HealthBoardPost,
                    HealthBoardLike,
                    HealthBoardComment,
                    HealthBoardReport,
                    HealthBoardBlock,
                    HealthPushSubscription,
                )
            }

        registered = self.register(key)
        self.assertEqual(registered.status_code, 201, registered.get_json())
        self.assertEqual(registered.get_json()["healthUserId"], guest_id)
        after_bootstrap = self.client.get("/api/bootstrap")
        self.assertEqual(after_bootstrap.status_code, 200, after_bootstrap.get_json())

        with app.app_context():
            linked = db.session.get(HealthUser, guest_id)
            self.assertEqual(
                (linked.id, linked.user_key, linked.nickname, linked.nickname_updated_at),
                before_profile,
            )
            self.assertFalse(linked.is_anonymous)
            self.assertIsNotNone(linked.account_id)
            self.assertEqual(self.user_owned_snapshot(guest_id), before_owned)
            after_counts = {
                model.__tablename__: db.session.query(model).count()
                for model in (
                    HealthUser,
                    AuthAccount,
                    AuthIdentity,
                    HealthWorkout,
                    HealthSet,
                    HealthExcuse,
                    HealthLevelEvent,
                    HealthBoardPost,
                    HealthBoardLike,
                    HealthBoardComment,
                    HealthBoardReport,
                    HealthBoardBlock,
                    HealthPushSubscription,
                )
            }
            self.assertEqual(after_counts["health_users"], before_counts["health_users"])
            self.assertEqual(after_counts["auth_accounts"], before_counts["auth_accounts"] + 1)
            self.assertEqual(after_counts["auth_identities"], before_counts["auth_identities"] + 1)
            for table in before_counts.keys() - {"auth_accounts", "auth_identities"}:
                self.assertEqual(after_counts[table], before_counts[table], table)

        before_data = before_bootstrap.get_json()
        after_data = after_bootstrap.get_json()
        self.assertEqual(after_data["profile"]["id"], before_data["profile"]["id"])
        self.assertEqual(after_data["profile"]["nickname"], before_data["profile"]["nickname"])
        self.assertEqual(after_data["logs"], before_data["logs"])
        self.assertEqual(after_data["excuses"], before_data["excuses"])
        self.assertEqual(after_data["stats"]["totalVolume"], before_data["stats"]["totalVolume"])
        self.assertEqual(after_data["stats"]["totalSets"], before_data["stats"]["totalSets"])

    def test_one_account_can_link_multiple_unique_login_identities(self):
        key = "anonymous-multi-identity-0001"
        response = self.register(key)
        self.assertEqual(response.status_code, 201, response.get_json())
        with app.app_context():
            user = self.user_for_key(key)
            db.session.add_all(
                [
                    AuthIdentity(
                        account_id=user.account_id,
                        provider="google",
                        provider_user_id="google-user-1001",
                        provider_email="athlete@gmail.test",
                        email_verified=True,
                    ),
                    AuthIdentity(
                        account_id=user.account_id,
                        provider="kakao",
                        provider_user_id="kakao-user-2001",
                    ),
                    AuthIdentity(
                        account_id=user.account_id,
                        provider="naver",
                        provider_user_id="naver-user-3001",
                    ),
                ]
            )
            db.session.commit()
            self.assertEqual(db.session.query(AuthIdentity).filter_by(account_id=user.account_id).count(), 4)
            self.assertEqual(account_for_auth_identity("google", "google-user-1001").id, user.account_id)
            self.assertIsNone(account_for_auth_identity("google", "athlete@gmail.test"))

    def test_provider_identity_cannot_be_linked_to_two_accounts(self):
        first_key = "anonymous-provider-owner-0001"
        second_key = "anonymous-provider-owner-0002"
        first = self.register(first_key)
        self.assertEqual(first.status_code, 201, first.get_json())
        self.client.post("/api/auth/logout", headers=self.csrf_headers(self.client))
        second = self.register(second_key)
        self.assertEqual(second.status_code, 201, second.get_json())
        with app.app_context():
            first_user = self.user_for_key(first_key)
            second_user = self.user_for_key(second_key)
            db.session.add(
                AuthIdentity(
                    account_id=first_user.account_id,
                    provider="google",
                    provider_user_id="shared-provider-user",
                )
            )
            db.session.commit()
            db.session.add(
                AuthIdentity(
                    account_id=second_user.account_id,
                    provider="google",
                    provider_user_id="shared-provider-user",
                )
            )
            with self.assertRaises(IntegrityError):
                db.session.commit()
            db.session.rollback()

    def test_weekly_goal_allows_four_rest_days_after_three_workout_days(self):
        result = weekly_challenge_penalty(
            [{"date": day} for day in ("2026-07-13", "2026-07-15", "2026-07-18")],
            set(),
            target=3,
            started_on=date(2026, 7, 6),
            as_of=date(2026, 7, 20),
        )
        self.assertEqual(result["penalty"], 0)
        self.assertEqual(result["failedWeeks"], [])

    def test_weekly_goal_penalizes_only_missing_sessions_in_completed_weeks(self):
        result = weekly_challenge_penalty(
            [{"date": day} for day in ("2026-07-13", "2026-07-15")],
            set(),
            target=3,
            started_on=date(2026, 7, 6),
            as_of=date(2026, 7, 20),
        )
        self.assertEqual(result["penalty"], 1)
        self.assertEqual(result["failedWeeks"][0]["missing"], 1)

    def test_weekly_goal_penalty_scales_with_every_missing_session(self):
        week_start = date(2026, 7, 13)
        started_on = date(2026, 7, 6)
        as_of = date(2026, 7, 20)

        for completed, expected_penalty in ((2, 1), (1, 2), (0, 3)):
            with self.subTest(completed=completed):
                logs = [
                    {"date": (week_start + timedelta(days=offset)).isoformat()}
                    for offset in range(completed)
                ]
                result = weekly_challenge_penalty(
                    logs,
                    set(),
                    target=3,
                    started_on=started_on,
                    as_of=as_of,
                )

                self.assertEqual(result["penalty"], expected_penalty)
                self.assertEqual(result["failedWeeks"][0]["missing"], expected_penalty)

    def test_weekly_goal_uses_sos_reason_for_current_week_progress(self):
        today = date(2026, 7, 16)
        week_start = start_of_week(today)
        workout_days = [week_start.isoformat(), (week_start + timedelta(days=1)).isoformat()]
        sos_day = (week_start + timedelta(days=2)).isoformat()
        with patch("app.today_kst", return_value=today):
            result = stats_from_logs(
                [
                    {
                        "date": day,
                        "exercise": "Squat",
                        "createdAt": f"{day}T01:00:00+00:00",
                        "volume": 100,
                        "totalReps": 10,
                        "completedSets": 1,
                    }
                    for day in workout_days
                ],
                {sos_day},
                {sos_day: "야근"},
                weekly_target=3,
                weekly_target_started_on=week_start,
            )
        self.assertEqual(result["weeklyWorkoutCompleted"], 2)
        self.assertEqual(result["weeklyWorkoutRemaining"], 0)
        self.assertEqual(result["weeklyRecoveryNotes"], [{"date": sos_day, "reason": "야근"}])

    def test_weekly_goal_is_login_only_and_can_be_changed(self):
        key = "weekly-goal-key-0001"
        anonymous = self.client.post(
            "/api/profile/weekly-goal",
            headers=self.csrf_headers(self.client, key),
            json={"target": 4},
        )
        self.assertEqual(anonymous.status_code, 401)

        registered = self.register(key)
        self.assertEqual(registered.status_code, 201, registered.get_json())
        bootstrap = self.client.get("/api/bootstrap", headers=self.headers(key))
        self.assertEqual(bootstrap.status_code, 200, bootstrap.get_json())
        self.assertEqual(bootstrap.get_json()["profile"]["weeklyWorkoutTarget"], 3)

        changed = self.client.post(
            "/api/profile/weekly-goal",
            headers=self.csrf_headers(self.client, key),
            json={"target": 4},
        )
        self.assertEqual(changed.status_code, 200, changed.get_json())
        self.assertEqual(changed.get_json()["profile"]["weeklyWorkoutTarget"], 4)
        with app.app_context():
            user = db.session.query(HealthUser).filter_by(user_key=key).one()
            self.assertEqual(user.weekly_workout_target, 4)

    def test_weekly_goal_change_preserves_existing_penalty_carryover(self):
        key = "weekly-carryover-key-0001"
        registered = self.register(key)
        self.assertEqual(registered.status_code, 201, registered.get_json())
        with app.app_context():
            user = db.session.query(HealthUser).filter_by(user_key=key).one()
            user.weekly_penalty_carryover = 2
            db.session.commit()

        changed = self.client.post(
            "/api/profile/weekly-goal",
            headers=self.csrf_headers(self.client, key),
            json={"target": 5},
        )
        self.assertEqual(changed.status_code, 200, changed.get_json())
        self.assertEqual(changed.get_json()["stats"]["attendancePenaltyCarryover"], 2)
        with app.app_context():
            user = db.session.query(HealthUser).filter_by(user_key=key).one()
            self.assertEqual(user.weekly_penalty_carryover, 2)

    def test_auth_status_issues_csrf_and_register_requires_it(self):
        key = "csrf-register-key-0001"
        email = self.email("csrf")
        missing = self.client.post(
            "/api/auth/register",
            headers=self.headers(key),
            json={"email": email, "password": self.password, "passwordConfirm": self.password, "termsAccepted": True, "privacyAccepted": True},
        )
        self.assertEqual(missing.status_code, 403)
        token = self.client.get("/api/auth/status", headers=self.headers(key)).get_json()["csrfToken"]
        registered = self.client.post(
            "/api/auth/register",
            headers={**self.headers(key), "X-CSRF-Token": token},
            json={"email": email, "password": self.password, "passwordConfirm": self.password, "termsAccepted": True, "privacyAccepted": True},
        )
        self.assertEqual(registered.status_code, 201, registered.get_json())

    def test_register_requires_terms_and_privacy_consent_separately(self):
        key = "registration-consent-key-0001"
        base_payload = {
            "email": self.email("consent"),
            "password": self.password,
            "passwordConfirm": self.password,
        }
        missing_terms = self.client.post(
            "/api/auth/register",
            headers=self.csrf_headers(self.client, key),
            json={**base_payload, "privacyAccepted": True},
        )
        self.assertEqual(missing_terms.status_code, 400)
        self.assertEqual(missing_terms.get_json()["error"], "terms_required")

        missing_privacy = self.client.post(
            "/api/auth/register",
            headers=self.csrf_headers(self.client, key),
            json={**base_payload, "termsAccepted": True},
        )
        self.assertEqual(missing_privacy.status_code, 400)
        self.assertEqual(missing_privacy.get_json()["error"], "privacy_consent_required")

        with app.app_context():
            self.assertEqual(db.session.query(AuthAccount).filter_by(email=base_payload["email"]).count(), 0)

    def test_registration_records_policy_consent_versions_and_timestamp(self):
        key = "registration-consent-audit-key-0001"
        email = self.email("consent-audit")
        response = self.register(key, email)
        self.assertEqual(response.status_code, 201, response.get_json())
        with app.app_context():
            account = db.session.query(AuthAccount).filter_by(email=email).one()
            self.assertEqual(account.terms_version, "2026-08-12")
            self.assertEqual(account.privacy_version, "2026-08-12")
            self.assertIsNotNone(account.terms_accepted_at)
            self.assertIsNotNone(account.privacy_accepted_at)

    def test_auth_status_exposes_operator_role_without_disabling_account(self):
        key = "operator-role-key-0001"
        email = self.email("operator")
        response = self.register(key, email)
        self.assertEqual(response.status_code, 201, response.get_json())
        with app.app_context():
            account = db.session.query(AuthAccount).filter_by(email=email).one()
            account.role = "operator"
            db.session.commit()

        status = self.client.get("/api/auth/status")
        self.assertEqual(status.status_code, 200)
        self.assertTrue(status.get_json()["authenticated"])
        self.assertEqual(status.get_json()["role"], "operator")

    def test_account_linked_key_cannot_access_data_without_session(self):
        key = "anonymous-key-security-0001"
        self.create_workout(key)
        self.assertEqual(self.register(key).status_code, 201)
        anonymous_client = app.test_client()
        response = anonymous_client.get("/api/logs", headers=self.headers(key))
        self.assertEqual(response.status_code, 401)
        self.assertEqual(self.client.get("/api/logs", headers=self.headers(key)).status_code, 200)

    def test_suspended_account_invalidates_existing_session_and_hides_data(self):
        user_key = "suspended-account-key-0001"
        email = self.email("suspended")
        self.create_workout(user_key)
        self.assertEqual(self.register(user_key, email).status_code, 201)

        with app.app_context():
            account = db.session.scalar(select(AuthAccount).where(AuthAccount.email == email))
            account.status = "suspended"
            db.session.commit()

        status = self.client.get("/api/auth/status")
        self.assertEqual(status.status_code, 200)
        self.assertFalse(status.get_json()["authenticated"])

        bootstrap = self.client.get("/api/bootstrap", headers=self.headers(user_key))
        self.assertEqual(bootstrap.status_code, 401)
        self.assertNotIn("workouts", bootstrap.get_json())

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

    def test_user_can_explicitly_choose_existing_account_records_after_conflict(self):
        account_key = "account-preferred-records-key-0001"
        email = self.email("preferred-records")
        self.create_workout(account_key, exercise_name="Bench Press")
        self.assertEqual(self.register(account_key, email).status_code, 201)

        anonymous_client = app.test_client()
        anonymous_key = "device-preferred-records-key-0001"
        created = anonymous_client.post(
            "/api/logs",
            headers=self.csrf_headers(anonymous_client, anonymous_key),
            json={"exercise": "Squat", "date": "2026-07-16", "weight": 30, "reps": 8, "completedSets": 2},
        )
        self.assertEqual(created.status_code, 201, created.get_json())

        blocked = anonymous_client.post(
            "/api/auth/login",
            headers=self.csrf_headers(anonymous_client, anonymous_key),
            json={"email": email, "password": self.password},
        )
        self.assertEqual(blocked.status_code, 409, blocked.get_json())

        login = anonymous_client.post(
            "/api/auth/login",
            headers=self.csrf_headers(anonymous_client, anonymous_key),
            json={"email": email, "password": self.password, "preferAccountRecords": True},
        )
        self.assertEqual(login.status_code, 200, login.get_json())
        account_logs = anonymous_client.get("/api/logs").get_json()
        self.assertEqual(["Bench Press"], [log["exercise"] for log in account_logs])
        with app.app_context():
            guest = db.session.query(HealthUser).filter_by(user_key=anonymous_key).one()
            self.assertTrue(guest.is_anonymous)
            self.assertEqual(HealthWorkout.query.filter_by(user_id=guest.id).count(), 1)

    def test_login_conflict_detects_all_ancillary_guest_owned_data(self):
        account_key = "account-ancillary-conflict-0001"
        email = self.email("ancillary-conflict")
        self.create_workout(account_key)
        self.assertEqual(self.register(account_key, email).status_code, 201)

        anonymous_client = app.test_client()
        anonymous_key = "device-ancillary-conflict-0001"
        status = anonymous_client.get("/api/auth/status", headers=self.headers(anonymous_key))
        self.assertEqual(status.status_code, 200, status.get_json())
        with app.app_context():
            guest = db.session.query(HealthUser).filter_by(user_key=anonymous_key).one()
            target = HealthUser(user_key="ancillary-conflict-target-0001", is_anonymous=True)
            db.session.add(target)
            db.session.flush()
            target_post = HealthBoardPost(
                user_id=target.id,
                level=1,
                nickname="대상사용자",
                content="충돌 판정 대상 게시글",
            )
            db.session.add(target_post)
            db.session.flush()
            db.session.add_all(
                [
                    HealthLevelEvent(
                        user_id=guest.id,
                        event_type="level_up",
                        event_date=date(2026, 8, 1),
                        level_before=1,
                        level_after=2,
                        experience_delta=100,
                        reason="게스트 경험치",
                        source_key="ancillary-conflict-level",
                        affects_current=True,
                    ),
                    HealthBoardReport(
                        reporter_user_id=guest.id,
                        post_id=target_post.id,
                        reason="게스트 신고",
                    ),
                    HealthBoardBlock(blocker_user_id=guest.id, blocked_user_id=target.id),
                    HealthPushSubscription(
                        user_id=guest.id,
                        endpoint="https://push.example/ancillary-conflict",
                        p256dh="ancillary-public",
                        auth="ancillary-auth",
                    ),
                ]
            )
            db.session.commit()
            guest_id = guest.id

        response = anonymous_client.post(
            "/api/auth/login",
            headers=self.csrf_headers(anonymous_client, anonymous_key),
            json={"email": email, "password": self.password},
        )
        self.assertEqual(response.status_code, 409, response.get_json())
        summary = response.get_json()["anonymousSummary"]
        self.assertEqual(summary["levelEventCount"], 1)
        self.assertEqual(summary["reportCount"], 1)
        self.assertEqual(summary["blockCount"], 1)
        self.assertEqual(summary["pushSubscriptionCount"], 1)
        self.assertTrue(summary["hasData"])
        self.assertFalse(anonymous_client.get("/api/auth/status", headers=self.headers(anonymous_key)).get_json()["authenticated"])
        with app.app_context():
            guest = db.session.get(HealthUser, guest_id)
            self.assertTrue(guest.is_anonymous)
            self.assertIsNone(guest.account_id)
            self.assertEqual(len(self.user_owned_snapshot(guest_id)["levelEvents"]), 1)
            self.assertEqual(len(self.user_owned_snapshot(guest_id)["reports"]), 1)
            self.assertEqual(len(self.user_owned_snapshot(guest_id)["blocks"]), 1)
            self.assertEqual(len(self.user_owned_snapshot(guest_id)["pushSubscriptions"]), 1)

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

    def test_guest_profile_only_does_not_block_existing_account_login(self):
        account_key = "account-profile-login-key-0001"
        email = self.email("profile-only")
        self.create_workout(account_key)
        self.assertEqual(self.register(account_key, email).status_code, 201)

        client = app.test_client()
        guest_key = "profile-only-guest-key-0001"
        status = client.get("/api/auth/status", headers=self.headers(guest_key))
        self.assertEqual(status.status_code, 200, status.get_json())
        with app.app_context():
            guest = db.session.query(HealthUser).filter_by(user_key=guest_key).one()
            guest.nickname = "게스트닉네임"
            guest.nickname_updated_at = datetime.now(timezone.utc)
            guest.gender = "male"
            db.session.commit()

        response = client.post(
            "/api/auth/login",
            headers=self.csrf_headers(client, guest_key),
            json={"email": email, "password": self.password},
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertTrue(response.get_json()["authenticated"])
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
            json={"email": email.upper(), "password": self.password, "passwordConfirm": self.password, "termsAccepted": True, "privacyAccepted": True},
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

    def test_nickname_moderation_blocks_abuse_hate_impersonation_and_evasion(self):
        blocked_nicknames = (
            "씨_발",
            "ss1bal",
            "F_U_C_K",
            "m0therfucker",
            "니애미",
            "일_베",
            "워마드",
            "한남충",
            "짱깨",
            "ret4rd",
            "박정희",
            "이재명",
            "admin운동",
        )
        for index, nickname in enumerate(blocked_nicknames):
            key = f"nickname-moderation-{index:02d}-key"
            response = self.client.post(
                "/api/profile",
                headers=self.csrf_headers(self.client, key),
                json={"nickname": nickname},
            )
            self.assertEqual(response.status_code, 400, (nickname, response.get_json()))
            self.assertIn("사용할 수 없는", response.get_json()["error"])
            with app.app_context():
                self.assertIsNone(self.user_for_key(key).nickname)

    def test_nickname_moderation_does_not_block_normal_names(self):
        for index, nickname in enumerate(("운동친구", "클래식맨", "StrongKim", "헬스99")):
            key = f"nickname-safe-{index:02d}-key"
            response = self.client.post(
                "/api/profile",
                headers=self.csrf_headers(self.client, key),
                json={"nickname": nickname},
            )
            self.assertEqual(response.status_code, 200, (nickname, response.get_json()))
            self.assertEqual(response.get_json()["nickname"], nickname)

    def test_existing_legacy_nickname_can_be_kept_when_only_gender_changes(self):
        key = "nickname-legacy-gender-key-0001"
        self.client.get("/api/profile", headers=self.headers(key))
        with app.app_context():
            user = db.session.query(HealthUser).filter_by(user_key=key).one()
            user.nickname = "운영자"
            db.session.commit()
        response = self.client.post(
            "/api/profile",
            headers=self.csrf_headers(self.client, key),
            json={"nickname": "운영자", "gender": "male"},
        )
        self.assertEqual(response.status_code, 200, response.get_json())
        self.assertEqual(response.get_json()["nickname"], "운영자")
        self.assertEqual(response.get_json()["gender"], "male")

    def test_guest_profile_stores_gender_for_workout_prescriptions(self):
        key = "profile-gender-key-0001"
        initial = self.client.get("/api/profile", headers=self.headers(key))
        self.assertEqual(initial.status_code, 200, initial.get_json())
        self.assertTrue(initial.get_json()["genderRequired"])

        saved = self.client.post(
            "/api/profile",
            headers=self.csrf_headers(self.client, key),
            json={"nickname": "운동친구", "gender": "female"},
        )
        self.assertEqual(saved.status_code, 200, saved.get_json())
        self.assertEqual(saved.get_json()["gender"], "female")
        self.assertFalse(saved.get_json()["genderRequired"])
        with app.app_context():
            self.assertEqual(self.user_for_key(key).gender, "female")

        invalid = self.client.post(
            "/api/profile",
            headers=self.csrf_headers(self.client, key),
            json={"nickname": "운동친구", "gender": "unknown"},
        )
        self.assertEqual(invalid.status_code, 400)

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

        privacy_html = app.test_client().get("/privacy").get_data(as_text=True)
        for disclosure in (
            "주간 운동 목표",
            "세트 간 휴식시간",
            "익명 기록 삭제",
            "쿠키와 기기 저장소",
            "동의 거부 권리",
            "North Star Labs",
            "싱가포르 리전",
            "최대 7일",
        ):
            self.assertIn(disclosure, privacy_html)

    def test_release_security_headers_cover_https_and_form_boundaries(self):
        with app.test_client() as client:
            response = client.get("/privacy")
            csp = response.headers["Content-Security-Policy"]
            self.assertIn("object-src 'none'", csp)
            self.assertIn("form-action 'self'", csp)
            self.assertNotIn("Strict-Transport-Security", response.headers)

            original = app.config["SESSION_COOKIE_SECURE"]
            app.config["SESSION_COOKIE_SECURE"] = True
            try:
                secure_response = client.get("/privacy")
            finally:
                app.config["SESSION_COOKIE_SECURE"] = original
            self.assertEqual(
                secure_response.headers["Strict-Transport-Security"],
                "max-age=31536000; includeSubDomains",
            )

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
                "restSeconds": 105,
            },
        )
        self.assertEqual(created.status_code, 201, created.get_json())
        created_log = created.get_json()
        self.assertEqual(created_log["setWeights"], [17.0, 18.0, 19.0])
        self.assertEqual(created_log["setReps"], [10, 10, 12])
        self.assertEqual(created_log["volume"], 578.0)
        self.assertEqual(created_log["restSeconds"], 105)

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
        self.assertEqual(latest.get_json()["restSeconds"], 105)
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

    def test_bodyweight_zero_weight_round_trip(self):
        key = "bodyweight-round-trip-key-0001"
        created = self.client.post(
            "/api/logs",
            headers=self.csrf_headers(self.client, key),
            json={
                "exercise": "Push-Up",
                "date": "2026-07-22",
                "weightKg": 0,
                "setWeights": [0, 0, 0],
                "setReps": [12, 10, 8],
                "completedSets": 3,
            },
        )
        self.assertEqual(created.status_code, 201, created.get_json())
        created_log = created.get_json()
        self.assertEqual(created_log["weightKg"], 0.0)
        self.assertEqual(created_log["setWeights"], [0.0, 0.0, 0.0])
        self.assertEqual(created_log["volume"], 0.0)

        latest = self.client.get(
            "/api/logs/latest?exercise=Push-Up", headers=self.headers(key)
        )
        self.assertEqual(latest.status_code, 200, latest.get_json())
        self.assertEqual(latest.get_json()["setWeights"], [0.0, 0.0, 0.0])

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
        self.assertTrue(baseline.get_json()["leveledUp"])
        self.assertTrue(baseline.get_json()["firstWorkoutBonus"])
        self.assertEqual(baseline.get_json()["levelBefore"], 1)
        self.assertEqual(baseline.get_json()["levelAfter"], 2)

        personal_best = save(11)
        self.assertEqual(personal_best.status_code, 201, personal_best.get_json())
        self.assertTrue(personal_best.get_json()["leveledUp"])
        self.assertFalse(personal_best.get_json()["firstWorkoutBonus"])
        self.assertEqual(personal_best.get_json()["levelBefore"], 2)
        self.assertEqual(personal_best.get_json()["levelAfter"], 3)

        lower_record = save(9)
        self.assertEqual(lower_record.status_code, 201, lower_record.get_json())
        self.assertTrue(lower_record.get_json()["leveledDown"])
        self.assertTrue(lower_record.get_json()["experienceReduced"])
        self.assertEqual(lower_record.get_json()["levelBefore"], 3)
        self.assertEqual(lower_record.get_json()["levelAfter"], 2)
        self.assertEqual(lower_record.get_json()["experienceBefore"], 2)
        self.assertEqual(lower_record.get_json()["experienceAfter"], 1)

        stats = self.client.get("/api/stats", headers=self.headers(key))
        self.assertEqual(stats.status_code, 200, stats.get_json())
        history = stats.get_json()["levelHistory"]
        self.assertEqual(len(history), 3)
        self.assertEqual(stats.get_json()["level"], 2)
        self.assertEqual(stats.get_json()["levelDowns"], 1)
        self.assertEqual(stats.get_json()["experienceDowns"], 1)
        self.assertEqual(history[0]["type"], "level_down")
        self.assertEqual(history[0]["levelBefore"], 3)
        self.assertEqual(history[0]["levelAfter"], 2)
        self.assertEqual(history[0]["experienceDelta"], -1)
        self.assertEqual(history[0]["reason"], "이전 기록보다 낮은 운동량")
        self.assertEqual(history[1]["type"], "level_up")
        self.assertEqual(history[1]["exercise"], "Bench Press")
        self.assertEqual(history[1]["reason"], "신기록 달성")
        self.assertEqual(history[1]["date"], workout_date)
        self.assertEqual(history[2]["exercise"], "첫 운동 기록")
        self.assertFalse(history[2]["preserved"])
        with app.app_context():
            bonuses = db.session.scalars(
                select(HealthLevelEvent).where(
                    HealthLevelEvent.source_key == "first-workout-bonus"
                )
            ).all()
            self.assertEqual(len(bonuses), 1)

    def test_cumulative_volume_milestone_awards_experience_once(self):
        key = "volume-milestone-key-0001"
        workout_date = date.today().isoformat()
        response = self.client.post(
            "/api/logs",
            headers=self.csrf_headers(self.client, key),
            json={
                "exercise": "Deadlift",
                "date": workout_date,
                "setWeights": [500, 500],
                "setReps": [10, 10],
                "completedSets": 2,
            },
        )
        self.assertEqual(response.status_code, 201, response.get_json())
        payload = response.get_json()
        self.assertEqual(payload["volumeMilestones"], [10_000])
        self.assertEqual(payload["volumeBonusExperience"], 1)
        self.assertEqual(payload["levelUpReason"], "volume_milestone")
        self.assertEqual(payload["levelBefore"], 1)
        self.assertEqual(payload["levelAfter"], 3)

        with app.app_context():
            user = db.session.scalar(select(HealthUser).where(HealthUser.user_key == key))
            bonuses = db.session.scalars(
                select(HealthLevelEvent).where(
                    HealthLevelEvent.user_id == user.id,
                    HealthLevelEvent.source_key == "volume-milestone-10000",
                )
            ).all()
            self.assertEqual(len(bonuses), 1)
            self.assertEqual(bonuses[0].reason, "누적 볼륨 10,000kg 달성")
            self.assertEqual(bonuses[0].experience_delta, 1)

        milestone_history = self.client.get("/api/stats", headers=self.headers(key)).get_json()["levelHistory"]
        milestone_event = next(item for item in milestone_history if item.get("sourceKey") == "volume-milestone-10000")
        self.assertEqual(milestone_event["reason"], "누적 볼륨 10,000kg 달성")

        follow_up = self.client.post(
            "/api/logs",
            headers=self.csrf_headers(self.client, key),
            json={
                "exercise": "Push-Up",
                "date": workout_date,
                "setWeights": [0],
                "setReps": [10],
                "completedSets": 1,
            },
        )
        self.assertEqual(follow_up.status_code, 201, follow_up.get_json())
        self.assertEqual(follow_up.get_json()["volumeMilestones"], [])
        with app.app_context():
            self.assertEqual(
                db.session.scalar(
                    select(func.count()).select_from(HealthLevelEvent).where(
                        HealthLevelEvent.source_key == "volume-milestone-10000"
                    )
                ),
                1,
            )

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

    def test_experience_gain_is_recorded_even_when_level_is_maintained(self):
        logs = [
            {
                "exercise": "Bench Press",
                "date": "2026-07-26",
                "createdAt": "2026-07-26T00:00:00+00:00",
                "volume": 100,
                "totalReps": 10,
                "completedSets": 1,
                "suspicionScore": 0,
            },
            {
                "exercise": "Bench Press",
                "date": "2026-07-27",
                "createdAt": "2026-07-27T00:00:00+00:00",
                "volume": 110,
                "totalReps": 10,
                "completedSets": 1,
                "suspicionScore": 0,
            },
        ]

        stats = stats_from_logs(
            logs,
            set(),
            weekly_target=3,
            weekly_target_started_on=date.today(),
            starting_experience=19.1,
        )

        self.assertEqual(stats["level"], 20)
        self.assertEqual(stats["levelHistory"][0]["type"], "experience_up")
        self.assertEqual(stats["levelHistory"][0]["reason"], "신기록 달성")
        self.assertEqual(stats["levelHistory"][0]["levelBefore"], 20)
        self.assertEqual(stats["levelHistory"][0]["levelAfter"], 20)
        self.assertAlmostEqual(stats["levelHistory"][0]["experienceDelta"], 0.5, places=2)

    def test_breakthrough_after_penalty_advances_from_current_level_only(self):
        workout_date = date.today().isoformat()
        logs = [
            {
                "exercise": "Bench Press",
                "date": workout_date,
                "createdAt": f"2026-07-28T01:{index:02d}:00+00:00",
                "volume": 100 + index,
                "totalReps": 10,
                "completedSets": 1,
                "suspicionScore": 0,
            }
            for index in range(11)
        ]
        before = stats_from_logs(
            logs,
            set(),
            weekly_target=3,
            weekly_target_started_on=date.today(),
            attendance_penalty_carryover=6,
        )
        self.assertEqual(before["level"], 4)
        self.assertAlmostEqual(before["experience"], 3.7, places=2)

        logs.append(
            {
                "exercise": "Bench Press",
                "date": workout_date,
                "createdAt": "2026-07-28T02:00:00+00:00",
                "volume": 111,
                "totalReps": 10,
                "completedSets": 1,
                "suspicionScore": 0,
            }
        )
        after = stats_from_logs(
            logs,
            set(),
            weekly_target=3,
            weekly_target_started_on=date.today(),
            attendance_penalty_carryover=6,
        )
        self.assertEqual(after["level"], 5)
        self.assertLessEqual(after["level"] - before["level"], 1)
        self.assertAlmostEqual(after["experience"], 4.4, places=2)

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
        self.assertAlmostEqual(before["experience"], 9.7, places=2)

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
        self.assertAlmostEqual(after["levelHistory"][0]["experienceDelta"], -0.7, places=2)

    def test_breakthrough_experience_schedule_matches_confirmed_balance(self):
        expected_rates = {
            1: 1.0,
            9: 1.0,
            10: 0.7,
            14: 0.7,
            15: 0.6,
            19: 0.6,
            20: 0.5,
            29: 0.5,
            30: 0.4,
            39: 0.4,
            40: 0.3,
            49: 0.3,
            50: 0.25,
            59: 0.25,
            60: 0.2,
            69: 0.2,
            70: 0.15,
            79: 0.15,
            80: 0.1,
            89: 0.1,
            90: 0.05,
            99: 0.05,
        }
        for level, expected_rate in expected_rates.items():
            with self.subTest(level=level):
                self.assertEqual(breakthrough_rate_for_level(level), expected_rate)

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

    def test_board_block_hides_posts_and_comments_and_can_be_reversed(self):
        author_key = "block-author-key-0001"
        reader_key = "block-reader-key-0001"
        third_key = "block-third-key-0001"
        for key, nickname in ((author_key, "작성자"), (reader_key, "독자"), (third_key, "댓글러")):
            response = self.client.post(
                "/api/profile",
                headers=self.csrf_headers(self.client, key),
                json={"nickname": nickname},
            )
            self.assertEqual(response.status_code, 200, response.get_json())

        post = self.client.post(
            "/api/board/posts",
            headers=self.csrf_headers(self.client, author_key),
            json={"content": "차단 검증 게시글"},
        )
        post_id = post.get_json()["id"]
        comment = self.client.post(
            f"/api/board/posts/{post_id}/comments",
            headers=self.csrf_headers(self.client, third_key),
            json={"content": "차단 검증 댓글"},
        )
        self.assertEqual(comment.status_code, 200, comment.get_json())

        with app.app_context():
            author_id = db.session.query(HealthUser).filter_by(user_key=author_key).one().id
            third_id = db.session.query(HealthUser).filter_by(user_key=third_key).one().id

        blocked_author = self.client.post(
            f"/api/board/users/{author_id}/block",
            headers=self.csrf_headers(self.client, reader_key),
        )
        self.assertEqual(blocked_author.status_code, 200, blocked_author.get_json())
        self.assertEqual(blocked_author.get_json()["posts"], [])

        unblocked = self.client.delete(
            f"/api/board/users/{author_id}/block",
            headers=self.csrf_headers(self.client, reader_key),
        )
        self.assertEqual(unblocked.status_code, 200, unblocked.get_json())
        blocked_commenter = self.client.post(
            f"/api/board/users/{third_id}/block",
            headers=self.csrf_headers(self.client, reader_key),
        )
        self.assertEqual(blocked_commenter.status_code, 200, blocked_commenter.get_json())
        rows = blocked_commenter.get_json()["posts"]
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["comments"], [])

        blocks = self.client.get("/api/board/blocks", headers=self.headers(reader_key))
        self.assertEqual(blocks.status_code, 200, blocks.get_json())
        self.assertEqual(blocks.get_json()[0]["nickname"], "댓글러")
        with app.app_context():
            self.assertEqual(db.session.query(HealthBoardBlock).count(), 1)

    def test_board_user_cannot_block_self(self):
        user_key = "block-self-key-0001"
        self.client.get("/api/bootstrap", headers=self.headers(user_key))
        with app.app_context():
            user_id = db.session.query(HealthUser).filter_by(user_key=user_key).one().id
        response = self.client.post(
            f"/api/board/users/{user_id}/block",
            headers=self.csrf_headers(self.client, user_key),
        )
        self.assertEqual(response.status_code, 400, response.get_json())
        self.assertEqual(response.get_json()["error"], "cannot_block_self")

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
