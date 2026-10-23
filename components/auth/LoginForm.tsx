// Client Component (interactive login form with action state and validation)
'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, AuthActionState } from '@/app/actions/auth';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { FiAlertCircle, FiArrowRight } from 'react-icons/fi';

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

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
        label="Email address"
        name="email"
        type="email"
        placeholder="alex.morgan@company.com"
        autoComplete="email"
        required
        error={state.fieldErrors?.email?.[0]}
        defaultValue="alex.morgan@company.com"
      />

      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password?.[0]}
        defaultValue="password123"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full mt-2"
        isLoading={isPending}
        rightIcon={<FiArrowRight className="w-4 h-4" />}
      >
        Sign in
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>
    </form>
  );
}
