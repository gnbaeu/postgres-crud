import assert from "node:assert/strict";
import { validateClientEnvironment } from "./env-safety.js";
assert.equal(validateClientEnvironment({}), true, "Frontend needs no provider environment");
assert.equal(validateClientEnvironment({VITE_APP_LABEL:"GNWAA"}), true);
for (const name of ["DATABASE_URL", "POSTGRES_PASSWORD", "SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_JWT_SECRET", "VITE_SESSION_SECRET", "VITE_ACCESS_TOKEN", "VITE_DATABASE_URL", "VITE_SUPABASE_SECRET_KEY"]) {
  assert.throws(()=>validateClientEnvironment({[name]:"test-only-sentinel"}), error=>error.message.includes(name) && error.message.includes("value was not printed") && !error.message.includes("test-only-sentinel"));
}
const payload=Buffer.from(JSON.stringify({role:"service_role"})).toString("base64url");
for(const value of ["sb_secret_test-only-sentinel", "sb_service_role_test-only-sentinel", "header."+payload+".signature"]){
  assert.throws(()=>validateClientEnvironment({VITE_PUBLIC_KEY:value}),/server credential; its value was not printed/);
}
console.log("Environment safety passed: no required frontend variables; database/session/provider secrets remain blocked without exposing values.");
