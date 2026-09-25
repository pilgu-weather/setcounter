"""Explicit, time-limited read-only workout pairing. No sign-in session transfer."""
import hashlib
import hmac
from urllib.parse import urlsplit

from flask import jsonify, request
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired


def register_influence_pairing(app, db, User, current_user, csrf_check,
                               workout_query, load_workouts, to_log, profile, stats):
    def signer(kind):
        return URLSafeTimedSerializer(app.secret_key, salt="influence-" + kind + "-v1")

    def identity(user):
        material = user.account.password_hash if user.account else user.user_key
        digest = hashlib.sha256((str(user.account_id) + ":" + material).encode()).hexdigest()
        return {"uid": user.id, "version": digest, "scope": "workouts:read"}

    def resolve(token, kind, age):
        try:
            payload = signer(kind).loads(token, max_age=age)
            if payload.get("scope") != "workouts:read":
                return None
            user = db.session.get(User, payload.get("uid"))
            if not user or (user.account and user.account.status != "active"):
                return None
            if not hmac.compare_digest(str(payload.get("version", "")), identity(user)["version"]):
                return None
            return user
        except (BadSignature, SignatureExpired, TypeError, ValueError, AttributeError):
            return None

    def same_origin():
        origin = request.headers.get("Origin", "")
        return origin == request.host_url.rstrip("/") and request.is_json

    def reply(payload, status=200):
        response = jsonify(payload)
        response.status_code = status
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.post("/influence-api/pair")
    def influence_pair():
        if not same_origin():
            return reply({"error": "origin_required"}, 403)
        rejected = csrf_check()
        if rejected is not None:
            return rejected
        user = current_user()
        if user is None:
            return reply({"error": "login_required"}, 401)
        if not load_workouts(workout_query(user.id).limit(1)):
            return reply({"error": "no_workout_account"}, 409)
        invitation = signer("invite").dumps(identity(user))
        info = profile(user, stats(user.id))
        return reply({"path": "/static/influence/index.html#connect=" + invitation,
                      "nickname": info.get("nickname"), "level": info.get("level")})

    @app.post("/influence-api/claim")
    def influence_claim():
        if not same_origin():
            return reply({"error": "origin_required"}, 403)
        token = (request.get_json(silent=True) or {}).get("token", "")
        if not isinstance(token, str) or len(token) > 2048:
            return reply({"error": "invalid_link"}, 401)
        user = resolve(token, "invite", 24 * 3600)
        if not user:
            return reply({"error": "expired_link"}, 401)
        response = reply({"connected": True})
        response.set_cookie("influence_reader", signer("reader").dumps(identity(user)),
                            max_age=30 * 86400, secure=True, httponly=True,
                            samesite="Strict", path="/influence-api/")
        return response

    @app.get("/influence-api/workouts")
    def influence_workouts():
        user = resolve(request.cookies.get("influence_reader", ""), "reader", 30 * 86400)
        if not user:
            return reply({"error": "pairing_required"}, 401)
        info = profile(user, stats(user.id))
        logs = []
        for workout in load_workouts(workout_query(user.id)):
            log = to_log(workout)
            logs.append({"id": log["id"], "date": log["date"], "exercise": log["exercise"],
                         "setRows": [{"weightKg": s["weightKg"], "reps": s["reps"]}
                                     for s in log["setRows"]]})
        return reply({"profile": {k: info.get(k) for k in ("id", "nickname", "level")}, "logs": logs})

    @app.post("/influence-api/disconnect")
    def influence_disconnect():
        if not same_origin():
            return reply({"error": "origin_required"}, 403)
        response = reply({"connected": False})
        response.delete_cookie("influence_reader", path="/influence-api/", secure=True,
                               httponly=True, samesite="Strict")
        return response
