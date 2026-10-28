"use server";

import { redirect } from "next/navigation";
import { signup, login, forgotPassword, resetPassword } from "@/lib/api";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { ApiError } from "@/lib/types";

export interface AuthActionState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";

  try {
    const { token } = await login(email, password);
    await setSessionCookie(token);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return {
        error: err.message,
        fieldErrors: err.fieldErrors,
      };
    }
    return { error: "An unexpected error occurred. Please try again." };
  }

  // redirect() works by throwing, so it stays outside the try/catch
  redirect("/documents");
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = (formData.get("name") as string) || "";
  const email = (formData.get("email") as string) || "";
  const password = (formData.get("password") as string) || "";

  try {
    const { token } = await signup(name, email, password);
    await setSessionCookie(token);
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return {
        error: err.message,
        fieldErrors: err.fieldErrors,
      };
    }
    return { error: "An unexpected error occurred. Please try again." };
  }

  redirect("/documents");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = (formData.get("email") as string) || "";

  try {
    await forgotPassword(email.trim().toLowerCase());

    return {
      success: true,
    };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return {
        error: err.message,
        fieldErrors: err.fieldErrors,
      };
    }

    return {
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const token = (formData.get("token") as string) || "";
  const password = (formData.get("password") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match.",
      fieldErrors: {
        confirmPassword: ["Passwords do not match."],
      },
    };
  }

  try {
    await resetPassword(token, password);

    return {
      success: true,
    };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return {
        error: err.message,
        fieldErrors: err.fieldErrors,
      };
    }

    return {
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
