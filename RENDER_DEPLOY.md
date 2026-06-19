# Render deploy

1. Push this folder to GitHub.
2. In Render, create a new Web Service or Blueprint.
3. Use:
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`
   - Health check path: `/healthz`

Notes:
- `render.yaml` is already configured for Blueprint deploy.
- The Blueprint creates a free Render Postgres database named `set-counter-db`.
- `DATABASE_URL` is injected automatically, so records survive normal redeploys.
- Local development still uses `app.sqlite3` when `DATABASE_URL` is not set.
