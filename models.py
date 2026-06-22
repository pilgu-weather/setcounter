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
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

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
