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
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Tender Package Builder • T-2026
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {t.uploadReq}
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-lg mx-auto">
          {t.uploadReqDesc}
        </p>
      </div>

      {/* Main Dropzone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative group rounded-3xl p-10 sm:p-12 text-center cursor-pointer transition-all duration-300 border-2 border-dashed backdrop-blur-xl ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/30 scale-[1.01] shadow-2xl shadow-indigo-500/20'
            : 'border-slate-800 bg-slate-900/60 hover:border-indigo-500/50 hover:bg-slate-900/80 shadow-xl'
        }`}
        id="requirements-drop-zone"
      >
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
          <IconUpload className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-semibold text-white mb-1">
          {t.dragDrop}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {t.orBrowse} (.json)
        </p>

        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 group-hover:shadow-indigo-600/40 transition-all">
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

      {/* Quick Demo Option */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs text-slate-500">Or try right away with:</span>
        <button
          onClick={onLoadSample}
          type="button"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 hover:border-indigo-500/50 flex items-center gap-2 transition-all shadow-sm"
          id="load-sample-btn"
        >
          <IconSparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t.loadSample} (sample-pack)</span>
        </button>
      </div>

      {/* Feature Pills */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center">
          <div className="text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5">
            <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
            Duplicate Detection
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">SHA-256 Verified</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center">
          <div className="text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5">
            <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
            Expiry Auditing
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Deadline Validation</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center col-span-2 sm:col-span-1">
          <div className="text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5">
            <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
            Auto-Matching
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Fuzzy Name Tokenizer</div>
        </div>
      </div>
    </div>
  );
}
