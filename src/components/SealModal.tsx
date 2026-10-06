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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d253d]/40 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white border border-[#e3e8ee] rounded-2xl shadow-[0_20px_50px_rgba(0,55,112,0.2)] p-6 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#e3e8ee]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#533afd]/10 text-[#533afd] flex items-center justify-center">
              <IconStamp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#0d253d]">
                {lang === 'en' ? 'Official Seal & Signature Stamp' : 'অফিসিয়াল সিল ও স্বাক্ষর'}
              </h3>
              <p className="text-xs text-[#64748d]">
                {lang === 'en'
                  ? 'Attach an authentic stamp/seal (PNG) onto the generated PDF'
                  : 'তৈরিকৃত প্যাকেজে সংযুক্ত করার জন্য অফিসিয়াল সিল (PNG) আপলোড করুন'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748d] hover:text-[#0d253d] hover:bg-slate-100 rounded-full transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 space-y-5">
          {sealImage ? (
            <div className="flex flex-col items-center p-6 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-4">
              <div className="relative p-3 bg-white rounded-xl border border-[#e3e8ee] shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sealImage.dataUrl}
                  alt="Seal Preview"
                  className="max-h-36 max-w-full object-contain filter drop-shadow-sm"
                />
              </div>

              <div className="text-center">
                <div className="pill-tag-emerald">
                  <IconCheck className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'Seal Active & Configured' : 'সিল সক্রিয় করা হয়েছে'}
                </div>
                <p className="text-xs text-[#0d253d] font-medium mt-1.5 truncate max-w-xs">{sealImage.name}</p>
                <p className="text-[11px] text-[#64748d] mt-0.5">
                  {lang === 'en'
                    ? 'Will be stamped on bottom-right of every page'
                    : 'প্রতিটি পৃষ্ঠার নিচের ডান কোণায় সিল যুক্ত হবে'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="btn-stripe-secondary text-xs"
                >
                  {lang === 'en' ? 'Replace Image' : 'ছবি পরিবর্তন করুন'}
                </button>
                <button
                  type="button"
                  onClick={onRemoveSeal}
                  className="btn-stripe-ghost text-xs text-[#ea2261] hover:text-[#ea2261] hover:bg-rose-50"
                >
                  {lang === 'en' ? 'Remove Seal' : 'সিল মুছে ফেলুন'}
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-[#e3e8ee] hover:border-[#533afd] rounded-xl p-8 text-center cursor-pointer transition-all bg-[#f6f9fc]/50 hover:bg-[#f6f9fc]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#533afd]/10 text-[#533afd] flex items-center justify-center mx-auto mb-3">
                <IconUpload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#0d253d]">
                {lang === 'en' ? 'Click to upload Seal / Signature (PNG/JPG)' : 'সিল বা স্বাক্ষর ছবি নির্বাচন করুন (PNG/JPG)'}
              </p>
              <p className="text-xs text-[#64748d] mt-1">
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

        <div className="flex justify-end pt-3 border-t border-[#e3e8ee]">
          <button
            onClick={onClose}
            className="btn-stripe-primary text-xs py-2 px-6"
          >
            {lang === 'en' ? 'Done' : 'সম্পন্ন'}
          </button>
        </div>
      </div>
    </div>
  );
}
