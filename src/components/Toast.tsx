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
    { border: string; iconBg: string; text: string; icon: React.ReactNode; barBg: string }
  > = {
    success: {
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
      text: 'text-emerald-900',
      barBg: 'bg-emerald-500',
      icon: <IconCheck className="w-4 h-4" />,
    },
    error: {
      border: 'border-rose-200',
      iconBg: 'bg-rose-50 text-[#ea2261]',
      text: 'text-rose-900',
      barBg: 'bg-[#ea2261]',
      icon: <IconX className="w-4 h-4" />,
    },
    warning: {
      border: 'border-amber-200',
      iconBg: 'bg-amber-50 text-[#9b6829]',
      text: 'text-amber-900',
      barBg: 'bg-[#9b6829]',
      icon: <IconAlertTriangle className="w-4 h-4" />,
    },
    info: {
      border: 'border-indigo-100',
      iconBg: 'bg-[#533afd]/10 text-[#533afd]',
      text: 'text-[#0d253d]',
      barBg: 'bg-[#533afd]',
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
      className={`relative overflow-hidden pointer-events-auto rounded-xl p-4 bg-white border ${cfg.border} shadow-[0_8px_24px_rgba(0,55,112,0.12),0_2px_6px_rgba(0,55,112,0.04)] flex items-start gap-3 transition-all duration-200 animate-slide-in-right hover:translate-x-[-2px]`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
        {cfg.icon}
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <h4 className={`text-sm font-semibold tracking-tight ${cfg.text}`}>{title}</h4>
        {message && <p className="text-xs text-[#64748d] mt-0.5 leading-relaxed break-words">{message}</p>}
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="text-[#64748d] hover:text-[#0d253d] p-1 rounded-md transition-colors shrink-0"
        aria-label="Close notification"
      >
        <IconX className="w-3.5 h-3.5" />
      </button>

      {/* Progress timer bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 overflow-hidden">
        <div
          className={`h-full ${cfg.barBg}`}
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
