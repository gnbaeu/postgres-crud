# GNWAA Laravel API (local migration)

Laravel 13 / PHP 8.5, PostgreSQL 17. Vanilla JS/Vite and `api.js` are unchanged.

## Run local development

PowerShell from repository root:

```powershell
$env:GNWAA_LARAVEL_APP_KEY = 'base64:' + [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$env:GNWAA_LOCAL_POSTGRES_ADMIN_PASSWORD = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$env:GNWAA_LOCAL_POSTGRES_APP_PASSWORD = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
docker compose -f backend-laravel/compose.yaml up -d --build
$env:GNWAA_API_BACKEND = 'laravel'
npm run dev -- --host 127.0.0.1 --port 5175
```

Keep the key stable in your local secret manager between restarts. Generating a new key invalidates Laravel sessions. Docker requires generated local passwords through environment variables and exposes the database only on loopback. The image uses an unprivileged application user and PHP development server, not a production server.

API: http://127.0.0.1:3002, database: 127.0.0.1:55433 (`gnwaa_laravel_dev`). This is a separate Docker volume/network from Express on 3001/55432. Initial SQL runs only for an empty new volume and retains all Express schema constraints and least-privilege grants. Do not remove the volume to update code.

## Rollback

Unset `GNWAA_API_BACKEND` (or set `express`) and restart Vite; the default target remains 3001. Existing Express files, sessions and database are unchanged. Laravel uses a separate encrypted HttpOnly `gnwaa_laravel` cookie and `gnwaa_app.laravel_sessions` table: sessions are intentionally not interoperable. Switching backend requires login again. No data copy or destructive rollback is needed for existing-schema deployment.

## Existing database adoption (prepared, not run)

Existing `gnwaa_app.accounts`, `customer_records`, `site_content`, `login_attempt_limits` are used directly. IDs remain JSON strings; timestamps preserve millisecond response precision except content version tokens, which retain PostgreSQL microseconds. Slugs home/about and CMS locales mn/en match Express; public UI Japanese remains frontend-owned.

Review a backup and connection target before an authorized migration. Use an owner/migration connection, never the runtime role, and ONLY the additive path:

```text
php artisan migrate --path=database/gnwaa-migrations
```

Do not run the scaffold migrations in `database/migrations`; they are unrelated Laravel sample users/cache/jobs tables. The additive migration creates only the separate Laravel session table/index and runtime grant. Its down method refuses destructive rollback. No existing database migration has been executed. Production migration and traffic cutover remain separate work.

## API contract

- GET /healthz
- GET /api/auth/csrf-token, GET /api/auth/me
- POST /api/auth/login, POST /api/auth/logout
- GET /api/content, GET /api/content/{slug}
- GET/POST /api/admin/customers
- GET/PATCH/DELETE /api/admin/customers/{id}
- GET/POST /api/admin/content
- PATCH/DELETE /api/admin/content/{id}
- POST /api/admin/content/bulk

Public content only exposes published records; locale fallback is mn. Customer list returns data/page/pageSize/total with Express limits and ILIKE search. Invalid input is 400 `{error:...}`, never Laravel 422. Unknown fields are rejected. Content bulk uses one transaction with conditional version updates, preserving 409 and rollback. No signup/owner bootstrap HTTP endpoint exists.

## Security mapping

Native password_verify accepts existing bcrypt hashes; passwords are not trimmed and enforce the 72-byte bcrypt limit. Sessions regenerate on login, idle timeout is 8h, absolute authentication timeout is 12h; active status and owner role are re-read per protected request. Login limiter is an atomic PostgreSQL upsert, keyed by HMAC of client address (8 attempts/15min); success clears its key. CSRF is the existing session token + X-CSRF-Token contract, including on login/logout, with explicit exact-origin checks. Laravel default CSRF middleware is replaced, not disabled without replacement. Sessions are HttpOnly, host-only, SameSite=Lax by default, Secure in production, and use a __Host- prefix there. SameSite=None without Secure is rejected. Proxy headers are not trusted by default; configure a reviewed trusted proxy policy before production proxy deployment. Security responses/logs omit SQL, credentials and request bodies. Private API responses use no-store.

## Tests

```powershell
cd backend-laravel
composer test
composer validate --no-check-publish
cd ..
$env:GNWAA_LOCAL_POSTGRES_ADMIN_PASSWORD='local-development-admin-only'
node backend-laravel/tests/contract.mjs
npm run check
npm run build
```

Contract tests connect ONLY to the dedicated local 55433 database, insert random owner/member fixtures, compare real Express and Laravel request outcomes and remove their fixtures. They require the local database to have no owner/content fixtures; do not point them at a working database. The login-limit test can require a 15-minute cooldown if an earlier run failed before cleanup. The test covers CRUD, public/draft filtering, CSRF/origin, role checks, session rotation, 409 stale tokens, bulk rollback and rate limit. Feature tests run without a database; PostgreSQL behavior is tested by the contract script. Host PHP currently lacks pdo_pgsql, so DB-backed execution uses Docker.

Production deployment, existing production data adoption, real reverse-proxy TLS validation and production performance testing are NOT performed.
