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
      badgeClass: 'pill-tag-emerald',
      dotClass: 'bg-emerald-500',
      icon: <IconCheck className="w-3 h-3 text-emerald-600" />,
    },
    Missing: {
      badgeClass: 'pill-tag-ruby',
      dotClass: 'bg-[#ea2261] animate-pulse',
      icon: <IconX className="w-3 h-3 text-[#ea2261]" />,
    },
    Expired: {
      badgeClass: 'pill-tag-ruby',
      dotClass: 'bg-[#ea2261] animate-pulse',
      icon: <IconAlertTriangle className="w-3 h-3 text-[#ea2261]" />,
    },
    'Expiry date needed': {
      badgeClass: 'pill-tag-lemon',
      dotClass: 'bg-[#9b6829] animate-pulse',
      icon: <IconClock className="w-3 h-3 text-[#9b6829]" />,
    },
    'Not provided': {
      badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
      dotClass: 'bg-slate-400',
      icon: <span className="text-[10px]">—</span>,
    },
  };

  const c = config[status] || config['Not provided'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${c.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dotClass}`} />
      {c.icon}
      <span>{t.status[status]}</span>
    </span>
  );
}
