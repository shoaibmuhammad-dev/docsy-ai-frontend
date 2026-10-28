// Client Component (interactive forgot password form with email validation and success confirmation)
"use client";

import React, { useActionState, useState } from "react";
import Link from "next/link";
import { forgotPasswordAction, AuthActionState } from "@/app/actions/auth";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiMail,
} from "react-icons/fi";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    initialState,
  );
  const [submittedEmail, setSubmittedEmail] = useState("");

  if (state.success) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <FiMail className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-zinc-900">
            Check your email
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
            We sent a password reset link to{" "}
            <span className="font-semibold text-zinc-900">
              {submittedEmail || "your email address"}
            </span>
            .
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-left text-xs text-zinc-500 space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-700 font-medium">
            <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ready to test the reset flow?</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Click below to proceed directly to the password update page.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <Link
            href={`/reset-password${submittedEmail ? `?email=${encodeURIComponent(submittedEmail)}` : ""}`}
            className="block w-full"
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              rightIcon={<FiArrowRight className="w-4 h-4" />}
            >
              Set new password
            </Button>
          </Link>

          <Link href="/login" className="block w-full">
            <Button variant="ghost" size="sm" className="w-full text-zinc-600">
              Return to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        setSubmittedEmail(((formData.get("email") as string) || "").trim());

        await formAction(formData);
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

      <Field
        label="Email address"
        name="email"
        type="email"
        placeholder="alex.morgan@company.com"
        autoComplete="email"
        required
        error={state.fieldErrors?.email?.[0]}
        // defaultValue="alex.morgan@company.com"
        hint="We'll send you an instant reset link to verify your identity."
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-2"
        isLoading={isPending}
        rightIcon={<FiArrowRight className="w-4 h-4" />}
      >
        Send reset link
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </form>
  );
}
