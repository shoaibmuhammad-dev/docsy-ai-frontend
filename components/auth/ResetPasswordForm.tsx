// Client Component (interactive reset password form with new and repeat inputs and matching validation)
"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { resetPasswordAction, AuthActionState } from "@/app/actions/auth";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiLock,
} from "react-icons/fi";

const initialState: AuthActionState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  const [password, setNewPassword] = useState("");
  const [confirmPassword, setRepeatPassword] = useState("");
  const [clientMatchError, setClientMatchError] = useState<string | null>(null);

  const handleRepeatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRepeatPassword(val);
    if (password && val && password !== val) {
      setClientMatchError("Passwords do not match");
    } else {
      setClientMatchError(null);
    }
  };

  const handleNewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
    if (confirmPassword && val && confirmPassword !== val) {
      setClientMatchError("Passwords do not match");
    } else {
      setClientMatchError(null);
    }
  };

  if (state.success) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <FiCheckCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-zinc-900">
            Password updated successfully
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
            Your new password has been set. You can now use it to sign in to
            your account.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/login" className="block w-full">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={<FiArrowRight className="w-4 h-4" />}
            >
              Sign in now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        const p1 = (formData.get("password") as string) || "";
        const p2 = (formData.get("confirmPassword") as string) || "";
        if (p1 !== p2) {
          setClientMatchError("Passwords do not match");
          return;
        }
        formAction(formData);
      }}
      className="space-y-4"
    >
      {state.error && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700"
        >
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{state.error}</span>
        </div>
      )}

      <input type="hidden" name="token" value={token} />

      {/* New password input */}
      <Field
        label="New Password"
        name="password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        value={password}
        onChange={handleNewChange}
        error={state.fieldErrors?.password?.[0]}
        hint="Must be between 8 and 72 characters."
      />

      {/* Repeat password input */}
      <Field
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={handleRepeatChange}
        error={clientMatchError || state.fieldErrors?.confirmPassword?.[0]}
        hint="Re-type your new password to verify."
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-2"
        isLoading={isPending}
        disabled={Boolean(clientMatchError)}
        leftIcon={<FiLock className="w-4 h-4" />}
      >
        Update password
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          Cancel and return to sign in
        </Link>
      </div>
    </form>
  );
}
