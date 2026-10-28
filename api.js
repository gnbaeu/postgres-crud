let csrfToken = null;
let csrfRequest = null;

export function resetCsrfToken() {
  csrfToken = null;
  csrfRequest = null;
}

async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  if (!csrfRequest) {
    csrfRequest = fetch("/api/auth/csrf-token", { credentials: "include" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || typeof payload.csrfToken !== "string") {
          throw new Error(payload.error || "Could not start a secure session.");
        }
        csrfToken = payload.csrfToken;
        return csrfToken;
      })
      .finally(() => { csrfRequest = null; });
  }
  return csrfRequest;
}

export async function requestJson(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  const request = { ...options, method, headers, credentials: "include" };
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    request.body = JSON.stringify(options.body);
  }
  if (!new Set(["GET", "HEAD", "OPTIONS"]).has(method)) {
    headers.set("X-CSRF-Token", await getCsrfToken());
  }

  let response;
  try {
    response = await fetch(`/api${path}`, request);
  } catch {
    throw Object.assign(new Error("The GNWAA API could not be reached."), { status: 0 });
  }
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path.startsWith("/admin/")) {
      window.dispatchEvent(new Event("gnwaa:session-expired"));
    }
    throw Object.assign(new Error(payload.error || "The request could not be completed."), {
      status: response.status,
      payload
    });
  }
  return payload;
}
