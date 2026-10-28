const forbiddenServerVariables = new Set([
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "DATABASE_URL",
  "POSTGRES_PASSWORD"
]);

function isPublishableKey(value) {
  if (value.startsWith("sb_publishable_")) return true;
  if (/^sb_(secret|service_role)_/.test(value)) return false;

  const parts = value.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return payload.role === "anon";
  } catch {
    return false;
  }
}

export function validateClientEnvironment(env) {
  for (const name of forbiddenServerVariables) {
    if (env[name]) {
      throw new Error(`${name} must not be configured in this browser project. Its value was not printed.`);
    }
  }

  const sensitiveClientVariable = Object.keys(env).find((name) =>
    name.startsWith("VITE_") && /secret|service.?role|password|jwt|token|database.?url|connection.?string/i.test(name)
  );
  if (sensitiveClientVariable) {
    throw new Error(`${sensitiveClientVariable} looks sensitive and cannot be exposed to browser code. Its value was not printed.`);
  }

  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
  if (publishableKey && !isPublishableKey(publishableKey)) {
    throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY is not a recognized public key. Use an sb_publishable key or legacy anon key; the value was not printed.");
  }

  return true;
}
