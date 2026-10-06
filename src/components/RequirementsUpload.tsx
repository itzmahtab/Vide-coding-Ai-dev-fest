'use client';

import React, { useRef, useState } from 'react';
import { IconUpload, IconFile, IconSparkles, IconCheck } from './icons';
import type { Translations } from '@/lib/types';

interface RequirementsUploadProps {
  t: Translations;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadSample: () => void;
}

export default function RequirementsUpload({
  t,
  onUpload,
  onLoadSample,
}: RequirementsUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && inputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      inputRef.current.files = dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      inputRef.current.dispatchEvent(event);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 animate-fade-in">
      {/* Hero Header with Stripe thin-weight (300) display typography */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 pill-tag-soft mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#533afd] animate-pulse" />
          Tender Document Infrastructure • T-2026
        </div>
        <h2 className="text-4xl sm:text-5xl font-light text-[#0d253d] tracking-[-0.04em] leading-[1.1]">
          {t.uploadReq}
        </h2>
        <p className="text-[#64748d] text-base sm:text-lg mt-3 max-w-xl mx-auto font-light leading-relaxed">
          {t.uploadReqDesc}
        </p>
      </div>

      {/* Main Upload Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`stripe-card p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 border-2 ${
          isDragOver
            ? 'border-[#533afd] bg-[#533afd]/[0.02] shadow-[0_8px_30px_rgba(83,58,253,0.12)] scale-[1.01]'
            : 'border-dashed border-[#a8c3de] hover:border-[#533afd] hover:bg-[#f6f9fc]/60'
        }`}
        id="requirements-drop-zone"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#533afd]/10 text-[#533afd] flex items-center justify-center mx-auto mb-5 transition-transform duration-200 group-hover:scale-105">
          <IconUpload className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-medium text-[#0d253d] mb-1 tracking-tight">
          {t.dragDrop}
        </h3>
        <p className="text-sm text-[#64748d] mb-6 font-normal">
          {t.orBrowse} <span className="font-mono text-xs bg-[#f6f9fc] px-1.5 py-0.5 rounded border border-[#e3e8ee]">requirements.json</span>
        </p>

        {/* Primary CTA: Single Indigo Pill Button */}
        <div className="btn-stripe-primary text-sm py-2.5 px-6">
          <IconFile className="w-4 h-4" />
          <span>{t.uploadReq}</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          onChange={onUpload}
          className="hidden"
          id="req-file-input"
        />
      </div>

      {/* Quick 1-Click Demo Loader */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs text-[#64748d] font-normal">Or explore instantly with preconfigured data:</span>
        <button
          onClick={onLoadSample}
          type="button"
          className="btn-stripe-secondary text-xs"
          id="load-sample-btn"
        >
          <IconSparkles className="w-3.5 h-3.5 text-[#533afd]" />
          <span>{t.loadSample} (sample-pack)</span>
        </button>
      </div>

      {/* Value Badges */}
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#e3e8ee] shadow-[0_1px_3px_rgba(0,55,112,0.04)] text-center">
          <div className="text-xs font-medium text-[#0d253d] flex items-center justify-center gap-1.5">
            <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
            Duplicate Detection
          </div>
          <div className="text-[11px] text-[#64748d] mt-1 font-mono">SHA-256 Crypto Verified</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#e3e8ee] shadow-[0_1px_3px_rgba(0,55,112,0.04)] text-center">
          <div className="text-xs font-medium text-[#0d253d] flex items-center justify-center gap-1.5">
            <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
            Expiry Auditing
          </div>
          <div className="text-[11px] text-[#64748d] mt-1 font-mono">Automatic Date Check</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#e3e8ee] shadow-[0_1px_3px_rgba(0,55,112,0.04)] text-center">
          <div className="text-xs font-medium text-[#0d253d] flex items-center justify-center gap-1.5">
            <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
            Zero-Backend Privacy
          </div>
          <div className="text-[11px] text-[#64748d] mt-1 font-mono">100% Client-Side Merging</div>
        </div>
      </div>
    </div>
  );
}
