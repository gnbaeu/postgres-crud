import assert from "node:assert/strict";
import { validateClientEnvironment } from "./env-safety.js";

assert.equal(validateClientEnvironment({
  VITE_SUPABASE_URL: "https://project.example.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_value"
}), true);

assert.throws(
  () => validateClientEnvironment({ VITE_SUPABASE_SECRET_KEY: "test-only-sentinel" }),
  /VITE_SUPABASE_SECRET_KEY.*value was not printed/
);

assert.throws(
  () => validateClientEnvironment({ SUPABASE_SERVICE_ROLE_KEY: "test-only-sentinel" }),
  /SUPABASE_SERVICE_ROLE_KEY.*value was not printed/
);

const legacyAnonPayload = Buffer.from(JSON.stringify({ role: "anon" })).toString("base64url");
assert.equal(validateClientEnvironment({ VITE_SUPABASE_PUBLISHABLE_KEY: `header.${legacyAnonPayload}.signature` }), true);

const serviceRolePayload = Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url");
assert.throws(
  () => validateClientEnvironment({ VITE_SUPABASE_PUBLISHABLE_KEY: `header.${serviceRolePayload}.signature` }),
  /not a recognized public key.*value was not printed/
);

process.stdout.write("Environment safety checks passed. No key values were displayed.\n");
