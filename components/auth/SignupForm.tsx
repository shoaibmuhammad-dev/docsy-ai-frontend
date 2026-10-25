// Client Component (interactive signup form with action state and password hint)
"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { signupAction, AuthActionState } from "@/app/actions/auth";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";

const initialState: AuthActionState = {};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
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
        label="Full Name"
        name="name"
        type="text"
        placeholder="Alex Morgan"
        autoComplete="name"
        required
        error={state.fieldErrors?.name?.[0]}
        // defaultValue=""
      />

      <Field
        label="Work Email"
        name="email"
        type="email"
        placeholder="alex.morgan@company.com"
        autoComplete="email"
        required
        error={state.fieldErrors?.email?.[0]}
        // defaultValue="alex.morgan@company.com"
      />

      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="Create password"
        autoComplete="new-password"
        required
        hint="Must be between 8 and 72 characters"
        error={state.fieldErrors?.password?.[0]}
        // defaultValue="securePassword123"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-2"
        isLoading={isPending}
        rightIcon={<FiArrowRight className="w-4 h-4" />}
      >
        Create free account
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
