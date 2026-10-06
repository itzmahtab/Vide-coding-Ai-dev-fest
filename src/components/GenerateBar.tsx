'use client';

import React, { useState } from 'react';
import { IconAlertTriangle, IconCheck, IconDownload } from './icons';
import type { Language, Translations } from '@/lib/types';

interface GenerateBarProps {
  canGenerate: boolean;
  isGenerating: boolean;
  blockingReasons: string[];
  t: Translations;
  lang: Language;
  onGenerate: () => void;
}

export default function GenerateBar({
  canGenerate,
  isGenerating,
  blockingReasons,
  t,
  lang,
  onGenerate,
}: GenerateBarProps) {
  const [showAllReasons, setShowAllReasons] = useState(false);

  return (
    <div
      className="sticky bottom-4 z-30 rounded-3xl bg-slate-950/90 border border-slate-800/90 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl shadow-black/50 transition-all duration-300 animate-fade-in"
      id="generate-section"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left Status Area */}
        <div className="flex-1 min-w-0">
          {!canGenerate ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <IconAlertTriangle className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-bold text-rose-300">
                  {t.blockedReasons} ({blockingReasons.length})
                </h3>
              </div>

              {blockingReasons.length > 0 && (
                <div className="pl-8 text-xs text-slate-400 space-y-1">
                  {(showAllReasons ? blockingReasons : blockingReasons.slice(0, 2)).map(
                    (reason, idx) => (
                      <p key={idx} className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80 shrink-0" />
                        <span>{reason}</span>
                      </p>
                    )
                  )}

                  {blockingReasons.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setShowAllReasons(prev => !prev)}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors cursor-pointer mt-1"
                    >
                      {showAllReasons
                        ? lang === 'en'
                          ? 'Show fewer issues'
                          : 'কম সমস্যা দেখান'
                        : lang === 'en'
                        ? `+ View all ${blockingReasons.length} blocking issues`
                        : `+ আরও ${blockingReasons.length - 2} টি সমস্যা দেখুন`}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <IconCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-300">
                  {lang === 'en' ? 'Tender Package Ready for Compilation' : 'টেন্ডার প্যাকেজ তৈরির জন্য সম্পূর্ণ প্রস্তুত'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'en'
                    ? 'All mandatory requirements satisfied and verified against deadline.'
                    : 'সবগুলো বাধ্যতামূলক নথিপত্র সফলভাবে যাচাই করা হয়েছে।'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right CTA Button */}
        <div className="shrink-0 flex items-center">
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            id="generate-btn"
            className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 ${
              canGenerate && !isGenerating
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin shrink-0" />
                <span>{t.generating}</span>
              </>
            ) : (
              <>
                <IconDownload className="w-4 h-4 shrink-0" />
                <span>{t.generateBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
