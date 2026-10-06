'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { IconCheck, IconAlertTriangle, IconX } from './icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const { id, type, title, message, duration = 4000 } = toast;

  const typeConfig: Record<
    ToastType,
    { border: string; bg: string; iconBg: string; text: string; icon: React.ReactNode }
  > = {
    success: {
      border: 'border-emerald-500/40 shadow-emerald-500/10',
      bg: 'bg-slate-900/95',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      text: 'text-emerald-300',
      icon: <IconCheck className="w-4 h-4" />,
    },
    error: {
      border: 'border-rose-500/40 shadow-rose-500/10',
      bg: 'bg-slate-900/95',
      iconBg: 'bg-rose-500/20 text-rose-400',
      text: 'text-rose-300',
      icon: <IconX className="w-4 h-4" />,
    },
    warning: {
      border: 'border-amber-500/40 shadow-amber-500/10',
      bg: 'bg-slate-900/95',
      iconBg: 'bg-amber-500/20 text-amber-400',
      text: 'text-amber-300',
      icon: <IconAlertTriangle className="w-4 h-4" />,
    },
    info: {
      border: 'border-indigo-500/40 shadow-indigo-500/10',
      bg: 'bg-slate-900/95',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
      text: 'text-indigo-300',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
    },
  };

  const cfg = typeConfig[type];

  return (
    <div
      role="alert"
      className={`relative overflow-hidden pointer-events-auto rounded-xl p-4 shadow-xl backdrop-blur-xl border ${cfg.border} ${cfg.bg} flex items-start gap-3 transition-all duration-300 animate-slide-in-right hover:translate-x-[-2px]`}
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <h4 className={`text-sm font-semibold tracking-tight ${cfg.text}`}>{title}</h4>
        {message && <p className="text-xs text-slate-300/90 mt-0.5 leading-relaxed break-words">{message}</p>}
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors shrink-0"
        aria-label="Close notification"
      >
        <IconX className="w-3.5 h-3.5" />
      </button>

      {/* Progress timer bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-700/50 overflow-hidden"
      >
        <div
          className={`h-full ${
            type === 'success'
              ? 'bg-emerald-400'
              : type === 'error'
              ? 'bg-rose-400'
              : type === 'warning'
              ? 'bg-amber-400'
              : 'bg-indigo-400'
          }`}
          style={{
            animation: `toastCountdown ${duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4500 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts(prev => [...prev.slice(-4), newToast]); // keep last 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container floating at top right */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
      >
        {toasts.map(toast => (
          <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
