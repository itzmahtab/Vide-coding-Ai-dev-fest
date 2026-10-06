import React, { ReactNode } from 'react';
import { IconAlertTriangle, IconCheck, IconClock, IconX } from './icons';
import type { Status, Translations } from '@/lib/types';

interface StatusBadgeProps {
  status: Status;
  t: Translations;
}

export default function StatusBadge({ status, t }: StatusBadgeProps) {
  const config: Record<
    Status,
    { badgeClass: string; dotClass: string; icon: ReactNode }
  > = {
    OK: {
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      dotClass: 'bg-emerald-400',
      icon: <IconCheck className="w-3.5 h-3.5 text-emerald-400" />,
    },
    Missing: {
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
      dotClass: 'bg-rose-400 animate-pulse',
      icon: <IconX className="w-3.5 h-3.5 text-rose-400" />,
    },
    Expired: {
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
      dotClass: 'bg-rose-400 animate-pulse',
      icon: <IconAlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
    },
    'Expiry date needed': {
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      dotClass: 'bg-amber-400 animate-pulse',
      icon: <IconClock className="w-3.5 h-3.5 text-amber-400" />,
    },
    'Not provided': {
      badgeClass: 'bg-slate-800/60 text-slate-400 border-slate-700/60',
      dotClass: 'bg-slate-500',
      icon: <span className="text-xs">—</span>,
    },
  };

  const c = config[status] || config['Not provided'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.badgeClass} shadow-xs backdrop-blur-xs transition-all`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dotClass}`} />
      {c.icon}
      <span>{t.status[status]}</span>
    </span>
  );
}
