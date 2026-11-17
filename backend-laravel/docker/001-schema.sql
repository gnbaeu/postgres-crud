CREATE ROLE gnwaa_app_runtime LOGIN PASSWORD 'local-development-only';
-- Fresh development schema only. The migration runner refuses any target
-- except a local database named gnwaa_dev. This SQL is prepared, not executed.
CREATE SCHEMA gnwaa_app;

CREATE TABLE gnwaa_app.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE gnwaa_app.accounts (
  account_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner', 'member')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounts_email_normalized CHECK (email = lower(btrim(email))),
  CONSTRAINT accounts_password_hash_nonempty CHECK (length(password_hash) > 0)
);

CREATE UNIQUE INDEX accounts_email_lower_uidx
  ON gnwaa_app.accounts (lower(email));
CREATE UNIQUE INDEX accounts_single_owner_uidx
  ON gnwaa_app.accounts ((role))
  WHERE role = 'owner';

CREATE TABLE gnwaa_app.customer_records (
  customer_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name text NOT NULL CHECK (length(btrim(first_name)) > 0),
  last_name text NOT NULL CHECK (length(btrim(last_name)) > 0),
  email text,
  store_id integer NOT NULL CHECK (store_id > 0),
  address_id integer NOT NULL CHECK (address_id > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_records_email_length CHECK (email IS NULL OR length(email) <= 254)
);

CREATE INDEX customer_records_name_idx
  ON gnwaa_app.customer_records (lower(last_name), lower(first_name), customer_id);

CREATE TABLE gnwaa_app.site_content (
  content_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL CHECK (slug IN ('home', 'about')),
  locale text NOT NULL CHECK (locale IN ('mn', 'en')),
  heading text NOT NULL CHECK (length(btrim(heading)) BETWEEN 1 AND 240),
  description text NOT NULL CHECK (length(btrim(description)) BETWEEN 1 AND 2000),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, locale)
);

-- connect-pg-simple uses this table for server-side session data.
CREATE TABLE gnwaa_app.user_sessions (
  sid varchar NOT NULL COLLATE "default" PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

CREATE INDEX user_sessions_expire_idx ON gnwaa_app.user_sessions (expire);

-- Login throttling stores only a keyed hash of the client address, never the
-- raw IP address. Old rows are periodically pruned by the API process.
CREATE TABLE gnwaa_app.login_attempt_limits (
  key_hash char(64) PRIMARY KEY,
  hit_count integer NOT NULL CHECK (hit_count > 0),
  reset_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX login_attempt_limits_reset_idx
  ON gnwaa_app.login_attempt_limits (reset_at);

-- The API role is a non-superuser LOGIN role, separate from the migration and
-- owner-bootstrap connections. It must not inherit elevated role privileges.
DO $runtime_role_guard$
DECLARE
  runtime_oid oid;
BEGIN
  SELECT oid INTO runtime_oid
    FROM pg_roles
   WHERE rolname = 'gnwaa_app_runtime'
     AND rolcanlogin
     AND NOT rolsuper
     AND NOT rolcreatedb
     AND NOT rolcreaterole
     AND NOT rolreplication
     AND NOT rolbypassrls;
  IF runtime_oid IS NULL THEN
    RAISE EXCEPTION 'Create a least-privilege LOGIN role named gnwaa_app_runtime before applying this migration';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_auth_members WHERE member = runtime_oid) THEN
    RAISE EXCEPTION 'gnwaa_app_runtime must not inherit privileges through role membership';
  END IF;
END;
$runtime_role_guard$;

REVOKE ALL ON SCHEMA gnwaa_app FROM PUBLIC, gnwaa_app_runtime;
DO $clear_default_acls$
DECLARE
  existing_role record;
BEGIN
  -- Remove any cluster default ACLs or old Supabase client grants from this
  -- newly created app schema only. Global defaults and role memberships stay
  -- untouched.
  FOR existing_role IN
    SELECT rolname
      FROM pg_roles
     WHERE oid <> (SELECT oid FROM pg_roles WHERE rolname = current_user)
       AND rolname <> 'gnwaa_app_runtime'
       AND rolname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('REVOKE ALL ON SCHEMA gnwaa_app FROM %I', existing_role.rolname);
    EXECUTE format('REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA gnwaa_app FROM %I', existing_role.rolname);
    EXECUTE format('REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA gnwaa_app FROM %I', existing_role.rolname);
  END LOOP;
END;
$clear_default_acls$;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA gnwaa_app FROM PUBLIC, gnwaa_app_runtime;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA gnwaa_app FROM PUBLIC, gnwaa_app_runtime;
GRANT USAGE ON SCHEMA gnwaa_app TO gnwaa_app_runtime;

GRANT SELECT (account_id, email, password_hash, role, is_active)
  ON gnwaa_app.accounts TO gnwaa_app_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON gnwaa_app.customer_records TO gnwaa_app_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON gnwaa_app.site_content TO gnwaa_app_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON gnwaa_app.user_sessions TO gnwaa_app_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON gnwaa_app.login_attempt_limits TO gnwaa_app_runtime;

GRANT USAGE ON SEQUENCE
  gnwaa_app.customer_records_customer_id_seq,
  gnwaa_app.site_content_content_id_seq
TO gnwaa_app_runtime;

INSERT INTO gnwaa_app.schema_migrations (version)
VALUES ('001_initial_schema');

CREATE TABLE gnwaa_app.laravel_sessions (id varchar(255) PRIMARY KEY,user_id bigint NULL,ip_address varchar(45) NULL,user_agent text NULL,payload text NOT NULL,last_activity integer NOT NULL);
CREATE INDEX laravel_sessions_activity_idx ON gnwaa_app.laravel_sessions(last_activity);
GRANT SELECT,INSERT,UPDATE,DELETE ON gnwaa_app.laravel_sessions TO gnwaa_app_runtime;
