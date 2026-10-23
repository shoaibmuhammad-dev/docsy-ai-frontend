// Client Component (interactive field with password visibility toggle)
'use client';

import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, type = 'text', id, className = '', wrapperClassName = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`space-y-1.5 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={computedType}
            className={`w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 transition-colors ${
              error
                ? 'border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500'
                : 'border-zinc-200 focus-visible:border-indigo-600 focus-visible:ring-indigo-600'
            } ${isPassword ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600 font-medium" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p className="text-xs text-zinc-500">{hint}</p>
        )}
      </div>
    );
  }
);

Field.displayName = 'Field';
