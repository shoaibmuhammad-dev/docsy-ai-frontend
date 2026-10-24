import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "session_token";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // keep in sync with JWT_EXPIRES_IN on the API (7d)

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

// Only checks that a session cookie EXISTS (fast, no API call). The real check
// happens when the API is asked who the user is: getCurrentUser() in lib/api.ts
// redirects to /session/expired if the token is rejected.
export async function hasValidSession(): Promise<boolean> {
  return Boolean(await getSessionToken());
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true, // JavaScript in the browser can never read it
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
