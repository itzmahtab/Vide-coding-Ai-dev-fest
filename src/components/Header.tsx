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
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <IconLayers className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight" id="app-title">
                {t.appTitle}
              </h1>
              {tender && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {tender.tender_id}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2.5">
          {tender && (
            <button
              onClick={onOpenSealModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                hasSeal
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 shadow-sm shadow-purple-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              id="seal-modal-btn"
              title={lang === 'en' ? 'Manage Official Seal/Stamp' : 'অফিসিয়াল সিল পরিচালনা করুন'}
            >
              <IconStamp className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">{t.sealStamp}</span>
              {hasSeal && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
            id="lang-toggle"
            aria-label="Toggle language"
          >
            <IconGlobe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
