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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0d253d]/40 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[85vh] bg-white border border-[#e3e8ee] rounded-2xl shadow-[0_20px_50px_rgba(0,55,112,0.2)] overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e3e8ee] bg-[#f6f9fc]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#533afd]/10 text-[#533afd] flex items-center justify-center shrink-0">
              <IconFile className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[#0d253d] truncate max-w-md" title={file.name}>
                {file.name}
              </h3>
              <p className="text-xs text-[#64748d] font-tabular">
                {file.pages} {lang === 'en' ? 'pages' : 'পৃষ্ঠা'} • {(file.file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={objectUrl}
              download={file.name}
              className="btn-stripe-secondary text-xs py-1.5"
              title={lang === 'en' ? 'Download PDF' : 'পিডিএফ ডাউনলোড করুন'}
            >
              <IconDownload className="w-3.5 h-3.5 text-[#533afd]" />
              <span>{lang === 'en' ? 'Download' : 'ডাউনলোড'}</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-[#64748d] hover:text-[#0d253d] hover:bg-slate-200/60 rounded-full transition-colors"
              aria-label="Close"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF viewer iframe */}
        <div className="flex-1 bg-slate-100 p-2 overflow-hidden">
          <iframe
            src={objectUrl}
            title={file.name}
            className="w-full h-full rounded-xl border border-[#e3e8ee] bg-white"
          />
        </div>
      </div>
    </div>
  );
}
