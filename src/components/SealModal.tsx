'use client';

import React, { useRef } from 'react';
import { IconStamp, IconX, IconUpload, IconCheck } from './icons';
import type { Language } from '@/lib/types';

interface SealModalProps {
  isOpen: boolean;
  onClose: () => void;
  sealImage: { name: string; dataUrl: string; bytes: Uint8Array } | null;
  onUploadSeal: (file: File) => void;
  onRemoveSeal: () => void;
  lang: Language;
}

export default function SealModal({
  isOpen,
  onClose,
  sealImage,
  onUploadSeal,
  onRemoveSeal,
  lang,
}: SealModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadSeal(file);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <IconStamp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {lang === 'en' ? 'Official Seal & Signature Stamp' : 'অফিসিয়াল সিল ও স্বাক্ষর'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'en'
                  ? 'Attach an authentic stamp/seal (PNG) onto the generated PDF'
                  : 'তৈরিকৃত প্যাকেজে সংযুক্ত করার জন্য অফিসিয়াল সিল (PNG) আপলোড করুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-5">
          {sealImage ? (
            <div className="flex flex-col items-center p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
              <div className="relative p-2 bg-slate-950/60 rounded-xl border border-slate-800 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sealImage.dataUrl}
                  alt="Seal Preview"
                  className="max-h-36 max-w-full object-contain filter drop-shadow-md"
                />
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  <IconCheck className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Seal Active & Configured' : 'সিল সক্রিয় করা হয়েছে'}
                </div>
                <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">{sealImage.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'en'
                    ? 'Will be stamped on bottom-right of every page'
                    : 'প্রতিটি পৃষ্ঠার নিচের ডান কোণায় সিল যুক্ত হবে'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  {lang === 'en' ? 'Replace Image' : 'ছবি পরিবর্তন করুন'}
                </button>
                <button
                  type="button"
                  onClick={onRemoveSeal}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                >
                  {lang === 'en' ? 'Remove Seal' : 'সিল মুছে ফেলুন'}
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-purple-400/60 rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-800/20 hover:bg-purple-500/5 group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 flex items-center justify-center mx-auto mb-3 transition-transform">
                <IconUpload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {lang === 'en' ? 'Click to upload Seal / Signature (PNG/JPG)' : 'সিল বা স্বাক্ষর ছবি নির্বাচন করুন (PNG/JPG)'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'en'
                  ? 'Transparent PNG recommended for best visual quality'
                  : 'স্বচ্ছ ব্যাকগ্রাউন্ড যুক্ত PNG ছবি সবচেয়ে ভালো দেখায়'}
              </p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            {lang === 'en' ? 'Done' : 'সম্পন্ন'}
          </button>
        </div>
      </div>
    </div>
  );
}
