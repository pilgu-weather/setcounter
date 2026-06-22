# Set Counter

Flask and Neon PostgreSQL based workout tracker.

## Storage

The app requires `DATABASE_URL` and accepts PostgreSQL URLs only. There is no
SQLite fallback. Set Counter shares the existing Neon database used by the
World's End Cafe, but only creates or updates tables prefixed with `health_`.

Required Render environment variable:

```text
DATABASE_URL=<existing Neon pooled connection string>
```

Do not add a Render `databases:` block. In the Render dashboard, set
`DATABASE_URL` on the `set-counter` web service to the same Neon URL used by
the cafe service.

## Anonymous users

The browser creates a random `healthUserKey`, stores it in localStorage, and
sends it as `X-User-Key` with every workout API request. Database rows are
always filtered by the corresponding `health_users.id`.

Deleting site data/localStorage does not delete database records, but it does
remove the key needed to find them. A recovery URL in the form
`/main?user_key=<key>` restores that key on a device. Login or a dedicated
recovery-key screen can be added later without changing workout ownership.

The one-time SQLite migration user is marked as claimable. The first empty
device user that calls `/api/bootstrap` receives those migrated records in one
transaction; the marker is then removed so another device cannot claim them.

## Migration

The source export is stored under
`backups/health-migration-20260622-150103/`. The original Render SQLite is not
modified or deleted.

Run the migration only with the existing Neon URL:

```powershell
$env:DATABASE_URL = "<existing Neon DATABASE_URL>"
python migrate_health_data.py
```

The migration:

1. Reads the timestamped JSON backup.
2. Checks for incompatible or populated legacy `health_*` tables before writes.
3. Creates/upgrades only `health_*` tables.
4. Imports all workouts and sets in one PostgreSQL transaction.
5. Rolls back all target changes if any insert or validation fails.
6. Writes an ignored `migration-user-key.txt` and prints a recovery URL.

Re-running with the same migration key validates the existing import instead
of inserting duplicates.

## Verification

With `DATABASE_URL` set:

```powershell
python verify_health_app.py
```

The verifier creates an isolated temporary user, checks save/read/reconnect,
statistics, SOS, ownership isolation and delete, then removes its test data.
