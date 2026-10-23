// Server Component
import React from 'react';
import { DocumentStatus } from '@/lib/types';
import { FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface BadgeProps {
  status?: DocumentStatus | 'neutral';
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export function Badge({
  status = 'neutral',
  children,
  className = '',
  showIcon = true,
}: BadgeProps) {
  const styles = {
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    processing: 'bg-amber-50 text-amber-700 border-amber-200/80',
    failed: 'bg-red-50 text-red-700 border-red-200/80',
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  };

  const icons = {
    ready: <FiCheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />,
    processing: (
      <FiClock className="w-3 h-3 text-amber-600 shrink-0 animate-spin motion-reduce:animate-none" />
    ),
    failed: <FiAlertCircle className="w-3 h-3 text-red-600 shrink-0" />,
    neutral: null,
  };

  const defaultLabels = {
    ready: 'Ready',
    processing: 'Processing',
    failed: 'Failed',
    neutral: '',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]} ${className}`}
    >
      {showIcon && icons[status]}
      <span>{children || defaultLabels[status]}</span>
    </span>
  );
}
