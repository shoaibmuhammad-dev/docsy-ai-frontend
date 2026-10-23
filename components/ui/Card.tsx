// Server Component
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted';
}

export function Card({
  children,
  className = '',
  variant = 'default',
  ...props
}: CardProps) {
  const bg = variant === 'default' ? 'bg-white' : 'bg-zinc-50';

  return (
    <div
      className={`rounded-2xl border border-zinc-200 ${bg} text-zinc-900 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
