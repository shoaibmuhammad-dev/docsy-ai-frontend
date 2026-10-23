// Server Component
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className = '', label = 'Loading...' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5 border-[2px]',
    md: 'w-4 h-4 border-2',
    lg: 'w-6 h-6 border-[2.5px]',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]} ${className}`}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
