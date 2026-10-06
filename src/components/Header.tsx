'use client';

import React from 'react';
import { IconGlobe, IconLayers, IconStamp } from './icons';
import type { Language, Translations, Tender } from '@/lib/types';

interface HeaderProps {
  t: Translations;
  lang: Language;
  onToggleLang: () => void;
  tender: Tender | null;
  hasSeal: boolean;
  onOpenSealModal: () => void;
}

export default function Header({
  t,
  lang,
  onToggleLang,
  tender,
  hasSeal,
  onOpenSealModal,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#e3e8ee] px-6 py-3 transition-all shadow-[0_1px_3px_rgba(0,55,112,0.04)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Wordmark & Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#533afd] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(83,58,253,0.3)]">
            <IconLayers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-semibold text-[#0d253d] tracking-tight" id="app-title">
                {t.appTitle}
              </h1>
              {tender && (
                <span className="pill-tag-soft font-mono font-semibold" title="Tender ID">
                  {tender.tender_id}
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748d] hidden sm:block font-normal">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {tender && (
            <button
              onClick={onOpenSealModal}
              className={`btn-stripe-secondary text-xs ${
                hasSeal
                  ? 'border-[#533afd] text-[#533afd] bg-[#533afd]/5'
                  : ''
              }`}
              id="seal-modal-btn"
              title={lang === 'en' ? 'Manage Official Seal/Stamp' : 'অফিসিয়াল সিল পরিচালনা করুন'}
            >
              <IconStamp className="w-3.5 h-3.5 text-[#533afd]" />
              <span className="hidden sm:inline">{t.sealStamp}</span>
              {hasSeal && <span className="w-1.5 h-1.5 rounded-full bg-[#533afd] animate-pulse" />}
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="btn-stripe-secondary text-xs"
            id="lang-toggle"
            aria-label="Toggle language"
          >
            <IconGlobe className="w-3.5 h-3.5 text-[#533afd]" />
            <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
