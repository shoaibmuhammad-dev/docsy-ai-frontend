// Client Component (toast notification system with context and hook)
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export type ToastType = 'info' | 'success' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'info', title, description }: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);

      // Auto dismiss
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white border border-zinc-200 rounded-xl shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && (
                <FiCheckCircle className="w-4 h-4 text-emerald-600" />
              )}
              {t.type === 'error' && (
                <FiAlertCircle className="w-4 h-4 text-red-600" />
              )}
              {t.type === 'info' && (
                <FiInfo className="w-4 h-4 text-indigo-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900">{t.title}</p>
              {t.description && (
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600"
              aria-label="Dismiss toast"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
