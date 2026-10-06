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
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-5 sm:p-6 shadow-xl flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <IconFile className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              {t.filesUploaded}
              {files.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300">
                  {files.length}
                </span>
              )}
            </h2>
            {files.length > 0 && (
              <p className="text-[11px] text-slate-400">
                {totalPages} {t.pages} total
                {duplicateCount > 0 && (
                  <span className="text-amber-400 ml-1.5 font-medium">
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
            className="text-[11px] font-medium text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
            title={lang === 'en' ? 'Remove all uploaded files' : 'সকল ফাইল মুছে ফেলুন'}
          >
            {lang === 'en' ? 'Clear All' : 'সব মুছুন'}
          </button>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`mt-4 rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-indigo-400 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/30 hover:bg-slate-950/50'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        id="pdf-drop-zone"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-2">
          <IconUpload className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-200">{t.dragDrop}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{t.orBrowse}</p>
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
      <div className="mt-4 space-y-2.5 flex-1 overflow-y-auto max-h-[500px] pr-1" id="file-list">
        {files.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-slate-800/40 bg-slate-950/20">
            <IconFile className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-xs text-slate-500">{t.noFiles}</p>
            <p className="text-[11px] text-slate-600 mt-1">
              {lang === 'en'
                ? 'Upload multiple PDF files to begin matching'
                : 'মেলানো শুরু করতে একাধিক পিডিএফ ফাইল আপলোড করুন'}
            </p>
          </div>
        ) : (
          files.map(f => (
            <div
              key={f.id}
              className={`group relative rounded-xl p-3 border transition-all duration-200 flex items-center justify-between gap-3 ${
                f.isDuplicate
                  ? 'bg-amber-950/15 border-amber-500/30 hover:border-amber-500/50'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-950/70'
              }`}
              id={`file-${f.id}`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    f.isDuplicate ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'
                  }`}
                >
                  <IconFile className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-semibold text-slate-200 truncate group-hover:text-white"
                    title={f.name}
                  >
                    {f.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {f.pages} {t.pages}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      • {(f.file.size / 1024).toFixed(0)} KB
                    </span>
                    {f.isDuplicate && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">
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
                  className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  title={t.preview}
                  id={`preview-file-${f.id}`}
                >
                  <IconEye className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onRemove(f.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
        <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-amber-300 text-[11px]">
          <IconAlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>
            {lang === 'en'
              ? 'Duplicate files detected by SHA-256 hash. Duplicate copies are restricted from being matched to different documents.'
              : 'অনুরূপ বিষয়বস্তুর ডুপ্লিকেট ফাইল শনাক্ত হয়েছে। এগুলো আলাদা ডকুমেন্টে মেলানো নিষিদ্ধ।'}
          </span>
        </div>
      )}
    </div>
  );
}
