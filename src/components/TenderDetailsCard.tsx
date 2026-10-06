'use client';

import React from 'react';
import {
  IconClipboard,
  IconDownload,
  IconRotate,
  IconSparkles,
  IconClock,
  IconCheck,
  IconSave,
} from './icons';
import type { Tender, Translations, Language } from '@/lib/types';

interface TenderDetailsCardProps {
  tender: Tender;
  t: Translations;
  lang: Language;
  completedCount: number;
  totalRequired: number;
  onExport: () => void;
  onReset: () => void;
  onAutoMatch: () => void;
  onSaveWorkspace: () => void;
  hasFiles: boolean;
}

export default function TenderDetailsCard({
  tender,
  t,
  lang,
  completedCount,
  totalRequired,
  onExport,
  onReset,
  onAutoMatch,
  onSaveWorkspace,
  hasFiles,
}: TenderDetailsCardProps) {
  const percent = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0;
  const isComplete = percent === 100;

  return (
    <div
      className="rounded-3xl bg-slate-900/70 border border-slate-800/90 backdrop-blur-xl p-6 sm:p-7 shadow-xl shadow-black/20 animate-fade-in"
      id="tender-details-section"
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <IconClipboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {t.tenderDetails}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isComplete
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                {isComplete ? (
                  <span className="flex items-center gap-1">
                    <IconCheck className="w-3 h-3" /> Ready to Package
                  </span>
                ) : (
                  `${percent}% Configured`
                )}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{tender.title}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {hasFiles && (
            <button
              onClick={onAutoMatch}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              id="auto-match-btn"
              title={lang === 'en' ? 'Smart Match uploaded files to documents' : 'আপলোডকৃত ফাইলগুলো স্বয়ংক্রিয়ভাবে মেলান'}
            >
              <IconSparkles className="w-3.5 h-3.5" />
              <span>{t.autoMatch}</span>
            </button>
          )}

          <button
            onClick={onExport}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 hover:border-slate-600 flex items-center gap-1.5 transition-all"
            id="export-csv-btn"
            title={lang === 'en' ? 'Download checklist report as CSV' : 'চেকলিস্ট রিপোর্ট CSV হিসেবে ডাউনলোড করুন'}
          >
            <IconDownload className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.exportChecklist}</span>
          </button>

          <button
            onClick={onSaveWorkspace}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 hover:border-slate-600 flex items-center gap-1.5 transition-all"
            id="save-draft-btn"
            title={lang === 'en' ? 'Save current work to browser storage' : 'ব্রাউজারে খসড়া সংরক্ষণ করুন'}
          >
            <IconSave className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{t.saveWorkspace}</span>
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-xl text-xs font-medium bg-slate-800/40 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all"
            id="reset-btn"
            title={lang === 'en' ? 'Reset and unload tender' : 'সব রিসেট করুন'}
          >
            <IconRotate className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tender Metadata Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-5">
        <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/70">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {t.id}
          </div>
          <div className="text-sm font-bold font-mono text-indigo-300 truncate" title={tender.tender_id}>
            {tender.tender_id}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/70">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {t.entity}
          </div>
          <div className="text-sm font-medium text-slate-200 truncate" title={tender.procuring_entity}>
            {tender.procuring_entity}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/70">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {t.bidder}
          </div>
          <div className="text-sm font-medium text-slate-200 truncate" title={tender.bidder}>
            {tender.bidder}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/70">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <IconClock className="w-3 h-3 text-amber-400" />
            {t.deadline}
          </div>
          <div className="text-sm font-semibold text-amber-300 font-mono">
            {tender.submission_deadline}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5 pt-4 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            {t.progress}
          </span>
          <span className="font-semibold text-white">
            <span className="text-emerald-400 font-bold">{completedCount}</span>
            <span className="text-slate-500"> / {totalRequired} </span>
            <span className="text-slate-400">({percent}%)</span>
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isComplete
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
