from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint


db = SQLAlchemy()


def utc_now():
    return datetime.now(timezone.utc)


class HealthUser(db.Model):
    __tablename__ = "health_users"

    id = db.Column(db.Integer, primary_key=True)
    user_key = db.Column(db.String(128), nullable=False, unique=True, index=True)
    nickname = db.Column(db.String(24))
    nickname_updated_at = db.Column(db.DateTime(timezone=True))
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    legacy_claimable = db.Column(db.Boolean, nullable=False, default=False)
    account_id = db.Column(
        db.Integer,
        db.ForeignKey("auth_accounts.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
        index=True,
    )
    is_anonymous = db.Column(db.Boolean, nullable=False, default=True)
    last_seen_at = db.Column(db.DateTime(timezone=True))

    account = db.relationship("AuthAccount", back_populates="health_user")

    workouts = db.relationship(
        "HealthWorkout",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    excuses = db.relationship(
        "HealthExcuse",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    board_posts = db.relationship(
        "HealthBoardPost",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    board_likes = db.relationship(
        "HealthBoardLike",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    board_comments = db.relationship(
        "HealthBoardComment",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class AuthAccount(db.Model):
    __tablename__ = "auth_accounts"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(320), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(512), nullable=False)
    email_verified = db.Column(db.Boolean, nullable=False, default=False)
    status = db.Column(db.String(32), nullable=False, default="active")
    provider = db.Column(db.String(32), nullable=False, default="local")
    provider_user_id = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = db.Column(
        db.DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )
    last_login_at = db.Column(db.DateTime(timezone=True))

    health_user = db.relationship("HealthUser", back_populates="account", uselist=False)


class HealthExercise(db.Model):
    __tablename__ = "health_exercises"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, unique=True, index=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)


class HealthWorkout(db.Model):
    __tablename__ = "health_workouts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("health_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    workout_date = db.Column(db.Date, nullable=False, index=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = db.Column(
        db.DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )
    suspicion_score = db.Column(db.Integer, nullable=False, default=0)
    suspicion_flags = db.Column(db.Text, nullable=False, default="[]")

    user = db.relationship("HealthUser", back_populates="workouts")
    sets = db.relationship(
        "HealthSet",
        back_populates="workout",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="HealthSet.set_index",
    )


class HealthSet(db.Model):
    __tablename__ = "health_sets"
    __table_args__ = (
        UniqueConstraint("workout_id", "set_index", name="uq_health_set_workout_index"),
    )

    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(
        db.Integer,
        db.ForeignKey("health_workouts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    exercise_id = db.Column(
        db.Integer,
        db.ForeignKey("health_exercises.id"),
        nullable=False,
        index=True,
    )
    set_index = db.Column(db.Integer, nullable=False)
    weight = db.Column(db.Numeric(10, 2), nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    memo = db.Column(db.Text, nullable=False, default="")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    workout = db.relationship("HealthWorkout", back_populates="sets")
    exercise = db.relationship("HealthExercise")


class HealthExcuse(db.Model):
    __tablename__ = "health_excuses"
    __table_args__ = (
        UniqueConstraint("user_id", "excuse_date", name="uq_health_excuse_user_date"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("health_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    excuse_date = db.Column(db.Date, nullable=False, index=True)
    excuse_text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    user = db.relationship("HealthUser", back_populates="excuses")


class HealthBoardPost(db.Model):
    __tablename__ = "health_board_posts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("health_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    level = db.Column(db.Integer, nullable=False, default=1)
    nickname = db.Column(db.String(24), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now, index=True)

    user = db.relationship("HealthUser", back_populates="board_posts")
    likes = db.relationship(
        "HealthBoardLike",
        back_populates="post",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    comments = db.relationship(
        "HealthBoardComment",
        back_populates="post",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class HealthBoardLike(db.Model):
    __tablename__ = "health_board_likes"
    __table_args__ = (UniqueConstraint("post_id", "user_id", name="uq_health_board_like_post_user"),)

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("health_board_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("health_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    post = db.relationship("HealthBoardPost", back_populates="likes")
    user = db.relationship("HealthUser", back_populates="board_likes")


class HealthBoardComment(db.Model):
    __tablename__ = "health_board_comments"

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("health_board_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("health_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    level = db.Column(db.Integer, nullable=False, default=1)
    nickname = db.Column(db.String(24), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now, index=True)

    post = db.relationship("HealthBoardPost", back_populates="comments")
    user = db.relationship("HealthUser", back_populates="board_comments")


class HealthBoardReport(db.Model):
    __tablename__ = "health_board_reports"

    id = db.Column(db.Integer, primary_key=True)
    reporter_user_id = db.Column(
        db.Integer,
        db.ForeignKey("health_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("health_board_posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    comment_id = db.Column(
        db.Integer,
        db.ForeignKey("health_board_comments.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    reason = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now, index=True)


class HealthPushConfig(db.Model):
    __tablename__ = "health_push_config"

    id = db.Column(db.Integer, primary_key=True)
    private_key = db.Column(db.Text, nullable=False)
    public_key = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)


class HealthPushSubscription(db.Model):
    __tablename__ = "health_push_subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("health_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    endpoint = db.Column(db.Text, nullable=False, unique=True)
    p256dh = db.Column(db.Text, nullable=False)
    auth = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = db.Column(
        db.DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )


class HealthReminderDispatch(db.Model):
    __tablename__ = "health_reminder_dispatches"

    id = db.Column(db.Integer, primary_key=True)
    reminder_date = db.Column(db.Date, nullable=False, unique=True)
    sent_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
