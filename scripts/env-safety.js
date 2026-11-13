const forbiddenServerVariables = new Set([
  "SUPABASE_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "DATABASE_URL",
  "POSTGRES_PASSWORD"
]);

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

  // Reject server credential values even when disguised under a harmless VITE_ name.
  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith("VITE_") || typeof value !== "string") continue;
    let serverToken = /^(?:sb_secret_|sb_service_role_)/.test(value);
    const parts = value.split(".");
    if (parts.length === 3) {
      try { serverToken ||= JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")).role === "service_role"; } catch {}
    }
    if (serverToken) throw new Error(name + " contains a server credential; its value was not printed.");
  }

  return true;
}
