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
      className="sticky bottom-4 z-30 rounded-2xl bg-white/95 border border-[#e3e8ee] backdrop-blur-xl p-5 sm:p-6 shadow-[0_12px_32px_rgba(0,55,112,0.12),0_2px_6px_rgba(0,55,112,0.06)] transition-all duration-200 animate-fade-in"
      id="generate-section"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left Status Area */}
        <div className="flex-1 min-w-0">
          {!canGenerate ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ea2261]/10 text-[#ea2261] flex items-center justify-center shrink-0">
                  <IconAlertTriangle className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-semibold text-[#0d253d]">
                  {t.blockedReasons} ({blockingReasons.length})
                </h3>
              </div>

              {blockingReasons.length > 0 && (
                <div className="pl-8 text-xs text-[#64748d] space-y-1">
                  {(showAllReasons ? blockingReasons : blockingReasons.slice(0, 2)).map(
                    (reason, idx) => (
                      <p key={idx} className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ea2261] shrink-0" />
                        <span>{reason}</span>
                      </p>
                    )
                  )}

                  {blockingReasons.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setShowAllReasons(prev => !prev)}
                      className="text-[11px] font-semibold text-[#533afd] hover:underline transition-colors cursor-pointer mt-1"
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
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(16,185,129,0.2)]">
                <IconCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0d253d]">
                  {lang === 'en' ? 'Tender Package Ready for Compilation' : 'টেন্ডার প্যাকেজ তৈরির জন্য সম্পূর্ণ প্রস্তুত'}
                </h3>
                <p className="text-xs text-[#64748d]">
                  {lang === 'en'
                    ? 'All mandatory requirements satisfied and verified against deadline.'
                    : 'সবগুলো বাধ্যতামূলক নথিপত্র সফলভাবে যাচাই করা হয়েছে।'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right CTA Button: Stripe Single Primary Indigo Pill */}
        <div className="shrink-0 flex items-center">
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            id="generate-btn"
            className="btn-stripe-primary py-3 px-8 text-sm"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
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
