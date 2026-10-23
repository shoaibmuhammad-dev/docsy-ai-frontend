// Server Component
import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50">
      {icon ? (
        <div className="mb-4 text-zinc-400">{icon}</div>
      ) : (
        <div className="w-14 h-14 mb-4 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
          <svg
            className="w-7 h-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
      )}
      <h3 className="text-sm font-semibold text-zinc-900 mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
