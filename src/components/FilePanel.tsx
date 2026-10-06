'use client';

import React, { useRef } from 'react';
import {
  IconFile,
  IconUpload,
  IconCopy,
  IconTrash,
  IconEye,
  IconAlertTriangle,
} from './icons';
import type { UploadedFile, Translations, Language } from '@/lib/types';

interface FilePanelProps {
  files: UploadedFile[];
  t: Translations;
  lang: Language;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (fileId: string) => void;
  onClearAll: () => void;
  onPreview: (file: UploadedFile) => void;
}

export default function FilePanel({
  files,
  t,
  lang,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onPick,
  onRemove,
  onClearAll,
  onPreview,
}: FilePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const totalPages = files.reduce((acc, f) => acc + (f.pages || 0), 0);
  const duplicateCount = files.filter(f => f.isDuplicate).length;

  return (
    <div className="stripe-card p-6 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#533afd]/10 text-[#533afd] flex items-center justify-center">
            <IconFile className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#0d253d] tracking-tight flex items-center gap-2">
              {t.filesUploaded}
              {files.length > 0 && (
                <span className="pill-tag-soft font-tabular">
                  {files.length}
                </span>
              )}
            </h2>
            {files.length > 0 && (
              <p className="text-[11px] text-[#64748d] font-tabular">
                {totalPages} {t.pages} total
                {duplicateCount > 0 && (
                  <span className="text-[#ea2261] ml-1.5 font-medium">
                    • {duplicateCount} {duplicateCount === 1 ? 'duplicate' : 'duplicates'}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[11px] font-medium text-[#64748d] hover:text-[#ea2261] px-2.5 py-1 rounded-full hover:bg-rose-50 transition-colors"
            title={lang === 'en' ? 'Remove all uploaded files' : 'সকল ফাইল মুছে ফেলুন'}
          >
            {lang === 'en' ? 'Clear All' : 'সব মুছুন'}
          </button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`mt-4 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-[#533afd] bg-[#533afd]/[0.03] shadow-[0_4px_16px_rgba(83,58,253,0.1)]'
            : 'border-[#e3e8ee] hover:border-[#a8c3de] bg-[#f6f9fc]/50 hover:bg-[#f6f9fc]'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        id="pdf-drop-zone"
      >
        <div className="w-9 h-9 rounded-xl bg-white text-[#533afd] border border-[#e3e8ee] shadow-[0_1px_3px_rgba(0,55,112,0.06)] flex items-center justify-center mx-auto mb-2">
          <IconUpload className="w-4 h-4" />
        </div>
        <p className="text-xs font-medium text-[#0d253d]">{t.dragDrop}</p>
        <p className="text-[11px] text-[#64748d] mt-0.5">{t.orBrowse}</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={onPick}
          className="hidden"
          id="pdf-file-input"
        />
      </div>

      {/* File List */}
      <div className="mt-4 space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1" id="file-list">
        {files.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-[#e3e8ee] bg-[#f6f9fc]/40">
            <IconFile className="w-7 h-7 text-[#64748d]/40 mx-auto mb-2" />
            <p className="text-xs text-[#64748d]">{t.noFiles}</p>
            <p className="text-[11px] text-[#64748d]/80 mt-1">
              {lang === 'en'
                ? 'Upload multiple PDF files to begin matching'
                : 'মেলানো শুরু করতে একাধিক পিডিএফ ফাইল আপলোড করুন'}
            </p>
          </div>
        ) : (
          files.map(f => (
            <div
              key={f.id}
              className={`group relative rounded-xl p-3 border transition-all duration-150 flex items-center justify-between gap-3 ${
                f.isDuplicate
                  ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                  : 'bg-white border-[#e3e8ee] hover:border-[#a8c3de] shadow-[0_1px_2px_rgba(0,55,112,0.04)]'
              }`}
              id={`file-${f.id}`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    f.isDuplicate ? 'bg-[#ea2261]/10 text-[#ea2261]' : 'bg-[#533afd]/10 text-[#533afd]'
                  }`}
                >
                  <IconFile className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-medium text-[#0d253d] truncate group-hover:text-[#533afd]"
                    title={f.name}
                  >
                    {f.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[#64748d] font-tabular">
                      {f.pages} {t.pages}
                    </span>
                    <span className="text-[10px] text-[#64748d]/80 font-tabular">
                      • {(f.file.size / 1024).toFixed(0)} KB
                    </span>
                    {f.isDuplicate && (
                      <span className="pill-tag-ruby text-[9px] py-0 px-1.5 font-bold">
                        <IconCopy className="w-2.5 h-2.5" />
                        {t.duplicate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onPreview(f)}
                  className="p-1.5 text-[#64748d] hover:text-[#533afd] hover:bg-[#533afd]/10 rounded-lg transition-colors"
                  title={t.preview}
                  id={`preview-file-${f.id}`}
                >
                  <IconEye className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onRemove(f.id)}
                  className="p-1.5 text-[#64748d] hover:text-[#ea2261] hover:bg-rose-50 rounded-lg transition-colors"
                  title={t.remove}
                  id={`remove-file-${f.id}`}
                >
                  <IconTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {duplicateCount > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-[#ea2261] text-xs">
          <IconAlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#ea2261]" />
          <span className="leading-snug">
            {lang === 'en'
              ? 'Duplicate files detected via SHA-256 hash. Duplicate copies cannot be assigned to different requirements.'
              : 'অনুরূপ বিষয়বস্তুর ডুপ্লিকেট ফাইল শনাক্ত হয়েছে। এগুলো আলাদা ডকুমেন্টে মেলানো নিষিদ্ধ।'}
          </span>
        </div>
      )}
    </div>
  );
}
