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
      className="stripe-card-dark p-6 sm:p-8 animate-fade-in"
      id="tender-details-section"
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-[#b9b9f9] flex items-center justify-center shrink-0 border border-white/15">
            <IconClipboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold text-white tracking-tight">
                {t.tenderDetails}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border font-tabular ${
                  isComplete
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
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
            <p className="text-xs text-slate-300/80 mt-0.5 font-light">{tender.title}</p>
          </div>
        </div>

        {/* Action buttons (Stripe Pill Button Hierarchy) */}
        <div className="flex flex-wrap items-center gap-2">
          {hasFiles && (
            <button
              onClick={onAutoMatch}
              className="btn-stripe-primary text-xs"
              id="auto-match-btn"
              title={lang === 'en' ? 'Smart Match uploaded files to documents' : 'আপলোডকৃত ফাইলগুলো স্বয়ংক্রিয়ভাবে মেলান'}
            >
              <IconSparkles className="w-3.5 h-3.5 text-white" />
              <span>{t.autoMatch}</span>
            </button>
          )}

          <button
            onClick={onExport}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/15 text-white border border-white/20 flex items-center gap-1.5 transition-all"
            id="export-csv-btn"
            title={lang === 'en' ? 'Download checklist report as CSV' : 'চেকলিস্ট রিপোর্ট CSV হিসেবে ডাউনলোড করুন'}
          >
            <IconDownload className="w-3.5 h-3.5 text-slate-300" />
            <span>{t.exportChecklist}</span>
          </button>

          <button
            onClick={onSaveWorkspace}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/15 text-white border border-white/20 flex items-center gap-1.5 transition-all"
            id="save-draft-btn"
            title={lang === 'en' ? 'Save current work to browser storage' : 'ব্রাউজারে খসড়া সংরক্ষণ করুন'}
          >
            <IconSave className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">{t.saveWorkspace}</span>
          </button>

          <button
            onClick={onReset}
            className="p-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 transition-all"
            id="reset-btn"
            title={lang === 'en' ? 'Reset and unload tender' : 'সব রিসেট করুন'}
          >
            <IconRotate className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tender Metadata Grid with Tabular Figures (tnum) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            {t.id}
          </div>
          <div className="text-sm font-semibold text-[#b9b9f9] font-tabular tracking-tight truncate" title={tender.tender_id}>
            {tender.tender_id}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            {t.entity}
          </div>
          <div className="text-sm font-medium text-white truncate font-light" title={tender.procuring_entity}>
            {tender.procuring_entity}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            {t.bidder}
          </div>
          <div className="text-sm font-medium text-white truncate font-light" title={tender.bidder}>
            {tender.bidder}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <IconClock className="w-3 h-3 text-amber-300" />
            {t.deadline}
          </div>
          <div className="text-sm font-semibold text-amber-300 font-tabular tracking-tight">
            {tender.submission_deadline}
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 font-light flex items-center gap-1.5">
            {t.progress}
          </span>
          <span className="font-semibold text-white font-tabular">
            <span className="text-emerald-400">{completedCount}</span>
            <span className="text-slate-400 font-light"> / {totalRequired} </span>
            <span className="text-slate-300">({percent}%)</span>
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isComplete
                ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                : 'bg-gradient-to-r from-[#533afd] via-[#8b5cf6] to-[#b9b9f9]'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
