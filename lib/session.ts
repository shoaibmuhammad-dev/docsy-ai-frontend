import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'session_token';
export const MOCK_TOKEN_VALUE = 'mock-token';

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function hasValidSession(): Promise<boolean> {
  const token = await getSessionToken();
  return Boolean(token && token === MOCK_TOKEN_VALUE);
}

export async function setSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, MOCK_TOKEN_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
