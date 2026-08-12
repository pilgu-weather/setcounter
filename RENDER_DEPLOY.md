# Render deploy

1. Push this repository to GitHub.
2. In Render, create or connect the `setcounter` Web Service.
3. Use:
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`
   - Health check path: `/healthz`
   - Python version: `3.11.9`
   - Instance type: `Starter`

## Required environment

Set `DATABASE_URL` on the web service to the production PostgreSQL URL.

Set `SECRET_KEY` to a long random value. Production also requires secure
cookies and proxy handling, which `render.yaml` enables with
`SETCOUNTER_SESSION_COOKIE_SECURE=1` and `SETCOUNTER_TRUST_PROXY=1`.

Set `REMINDER_CRON_TOKEN` to a long random value and add the same value to the
GitHub repository secret named `REMINDER_CRON_TOKEN`.

Do not create a new Render PostgreSQL database for this app. `render.yaml`
declares `DATABASE_URL` with `sync: false` and does not contain a `databases:`
block.

Set `DISCORD_COMPLAINT_WEBHOOK_URL` and
`ANDROID_SHA256_CERT_FINGERPRINT` in the Render dashboard. These values are
intentionally not stored in Git.

The app intentionally fails startup when `DATABASE_URL` is missing or does not
point to PostgreSQL. There is no SQLite fallback in production or development.

## Schema

The service only owns tables prefixed with `health_`. Run
`migrate_health_data.py` with the Neon URL before first production use or after
schema changes that require DDL.
