'use server';

import { redirect } from 'next/navigation';
import { signup, login } from '@/lib/api';
import { setSessionCookie, clearSessionCookie } from '@/lib/session';
import { ApiError } from '@/lib/types';

export interface AuthActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get('email') as string) || '';
  const password = (formData.get('password') as string) || '';

  try {
    await login(email, password);
    await setSessionCookie();
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return {
        error: err.message,
        fieldErrors: err.fieldErrors,
      };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }

  redirect('/documents');
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const name = (formData.get('name') as string) || '';
  const email = (formData.get('email') as string) || '';
  const password = (formData.get('password') as string) || '';

  try {
    await signup(name, email, password);
    await setSessionCookie();
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return {
        error: err.message,
        fieldErrors: err.fieldErrors,
      };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }

  redirect('/documents');
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect('/login');
}
