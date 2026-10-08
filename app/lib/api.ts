const TOKEN_KEY = "ricemania.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Attach the stored bearer token. */
  auth?: boolean;
  signal?: AbortSignal;
}

/**
 * Thin wrapper over the /api routes. Every endpoint answers with
 * `{ success, message, ...payload }`, so failures are unwrapped into
 * ApiError here and callers only deal with the payload.
 */
export async function api<T = unknown>(
  path: string,
  { method = "GET", body, auth = false, signal }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {};

  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    throw new ApiError("Can't reach the kitchen. Check your connection.", 0);
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = await res.json();
  } catch {
    // A non-JSON body (proxy error page, 502, ...) — fall through to the
    // status-based message below.
  }

  if (!res.ok || payload.success === false) {
    const message =
      typeof payload.message === "string"
        ? payload.message
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return payload as T;
}

/** Multipart upload — Content-Type is set by the browser, not by us. */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const token = getToken();
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok || payload.success === false) {
    throw new ApiError(payload.message ?? "Upload failed", res.status);
  }

  return payload.url as string;
}
