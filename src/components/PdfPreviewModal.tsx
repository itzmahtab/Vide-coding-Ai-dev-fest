'use client';

import React, { useEffect, useMemo } from 'react';
import { IconX, IconDownload, IconFile } from './icons';
import type { UploadedFile } from '@/lib/types';

interface PdfPreviewModalProps {
  file: UploadedFile | null;
  onClose: () => void;
  lang: 'en' | 'bn';
}

export default function PdfPreviewModal({ file, onClose, lang }: PdfPreviewModalProps) {
  const objectUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file.file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    if (!file) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [file, onClose]);

  if (!file || !objectUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <IconFile className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white truncate max-w-md" title={file.name}>
                {file.name}
              </h3>
              <p className="text-xs text-slate-400">
                {file.pages} {lang === 'en' ? 'pages' : 'পৃষ্ঠা'} • {(file.file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={objectUrl}
              download={file.name}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title={lang === 'en' ? 'Download PDF' : 'পিডিএফ ডাউনলোড করুন'}
            >
              <IconDownload className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Download' : 'ডাউনলোড'}</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF viewer iframe */}
        <div className="flex-1 bg-slate-950 p-2 overflow-hidden">
          <iframe
            src={objectUrl}
            title={file.name}
            className="w-full h-full rounded-xl border border-slate-800 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
