import "server-only";
import { getSessionToken } from "@/lib/session";

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown; // a plain object is sent as JSON, a FormData is sent as multipart
  auth?: boolean; // attach the session token (default: true)
}

// Calls the Express API from the Next.js server. The token lives in an
// httpOnly cookie, is read here on the server and sent as a Bearer header, so
// the browser never sees it and the API needs no cookie handling or CORS.
export async function apiFetch<T>(
  path: string,
  { method = "GET", body, auth = true }: ApiOptions = {},
): Promise<T> {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) {
    throw new Error("API_URL is not set. Add it to .env.local");
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const isFormData = body instanceof FormData;

  // For FormData, fetch sets Content-Type itself (it must include the boundary)
  if (body !== undefined && !isFormData)
    headers["Content-Type"] = "application/json";

  if (auth) {
    const token = await getSessionToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    console.error(`[api] ${method} ${path} failed:`, error);
    throw new ApiRequestError(
      "Could not reach the server. Please try again",
      503,
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // The API sends { success: false, error: "..." } (or "message")
    throw new ApiRequestError(
      payload?.error ?? payload?.message ?? "Something went wrong",
      response.status,
    );
  }

  return (payload?.data ?? payload) as T;
}
