'use client';

import React, { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge';
import {
  IconClipboard,
  IconClock,
  IconEye,
  IconX,
  IconSearch,
  IconSparkles,
} from './icons';
import type { Language, Requirement, Status, Translations, UploadedFile } from '@/lib/types';

export interface StatusEntry {
  req: Requirement;
  status: Status;
  blocks: boolean;
}

interface RequirementsPanelProps {
  statusList: StatusEntry[];
  t: Translations;
  lang: Language;
  matches: Record<string, string>;
  availableFiles: UploadedFile[];
  matchedFileIds: Set<string>;
  expiryDates: Record<string, string>;
  submissionDeadline?: string;
  onMatch: (reqId: string, fileId: string) => void;
  onExpiryChange: (reqId: string, date: string) => void;
  onPreviewFile: (file: UploadedFile) => void;
  onAutoMatch: () => void;
}

function RequirementCard({
  entry,
  t,
  lang,
  matches,
  availableFiles,
  matchedFileIds,
  expiryDates,
  submissionDeadline,
  onMatch,
  onExpiryChange,
  onPreviewFile,
}: {
  entry: StatusEntry;
  t: Translations;
  lang: Language;
  matches: Record<string, string>;
  availableFiles: UploadedFile[];
  matchedFileIds: Set<string>;
  expiryDates: Record<string, string>;
  submissionDeadline?: string;
  onMatch: (reqId: string, fileId: string) => void;
  onExpiryChange: (reqId: string, date: string) => void;
  onPreviewFile: (file: UploadedFile) => void;
}) {
  const { req, status, blocks } = entry;
  const title = lang === 'en' ? req.title_en : req.title_bn;
  const secondaryTitle = lang === 'en' ? req.title_bn : req.title_en;
  const matchedId = matches[req.id];
  const matchedFile = matchedId ? availableFiles.find(f => f.id === matchedId) : null;

  return (
    <div
      className={`stripe-card p-5 transition-all duration-200 ${
        blocks
          ? 'border-rose-200/90 bg-rose-50/[0.15]'
          : status === 'OK'
          ? 'border-emerald-200/90 bg-emerald-50/[0.15]'
          : 'bg-white'
      }`}
      id={`req-${req.id}`}
    >
      {/* Top Header: Order, Title, Badges, Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-lg bg-[#f6f9fc] border border-[#e3e8ee] text-[#0d253d] text-xs font-tabular font-semibold flex items-center justify-center shrink-0 mt-0.5">
            {String(req.order).padStart(2, '0')}
          </span>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-[#0d253d] tracking-tight">{title}</h3>
              <span className="text-xs text-[#64748d] font-normal">({secondaryTitle})</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  req.mandatory
                    ? 'pill-tag-ruby'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {req.mandatory ? t.mandatory : t.optional}
              </span>

              {req.has_expiry && (
                <span className="pill-tag-lemon text-[10px]">
                  <IconClock className="w-2.5 h-2.5" />
                  {lang === 'en' ? 'Requires Expiry Date' : 'মেয়াদ আবশ্যক'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="self-start sm:self-center shrink-0">
          <StatusBadge status={status} t={t} />
        </div>
      </div>

      {/* Matching Dropdown & File Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              className="stripe-select w-full pr-8 cursor-pointer"
              value={matchedId || ''}
              onChange={(e) => onMatch(req.id, e.target.value)}
              id={`match-select-${req.id}`}
            >
              <option value="">{t.selectFile}</option>
              {availableFiles.map(f => {
                const isSelectedHere = matchedId === f.id;
                const isUsedElsewhere = matchedFileIds.has(f.id) && !isSelectedHere;
                return (
                  <option
                    key={f.id}
                    value={f.id}
                    disabled={isUsedElsewhere}
                  >
                    {f.name} ({f.pages} {t.pages}){isUsedElsewhere ? ' [Used]' : ''}
                  </option>
                );
              })}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#64748d]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {matchedFile && (
            <>
              <button
                type="button"
                onClick={() => onPreviewFile(matchedFile)}
                className="btn-stripe-secondary text-xs shrink-0 py-2"
                title={t.preview}
              >
                <IconEye className="w-3.5 h-3.5 text-[#533afd]" />
                <span className="hidden sm:inline">{t.preview}</span>
              </button>

              <button
                type="button"
                onClick={() => onMatch(req.id, '')}
                className="p-2 rounded-full border border-[#e3e8ee] text-[#64748d] hover:text-[#ea2261] hover:bg-rose-50 transition-colors shrink-0"
                title={lang === 'en' ? 'Unassign file' : 'ফাইল বাতিল করুন'}
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Expiry Date Section */}
        {req.has_expiry && matchedId && (
          <div className="pt-3 border-t border-[#e3e8ee] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-down">
            <div className="flex items-center gap-2">
              <label
                htmlFor={`expiry-${req.id}`}
                className="text-xs font-medium text-[#0d253d] flex items-center gap-1.5"
              >
                <IconClock className="w-3.5 h-3.5 text-[#9b6829]" />
                {t.expiryDate}:
              </label>

              <input
                id={`expiry-${req.id}`}
                type="date"
                className="stripe-input text-xs font-tabular"
                value={expiryDates[req.id] || ''}
                onChange={(e) => onExpiryChange(req.id, e.target.value)}
              />
            </div>

            {submissionDeadline && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#64748d]">
                  {lang === 'en' ? 'Deadline:' : 'শেষ সময়:'} <span className="font-tabular font-medium text-[#0d253d]">{submissionDeadline}</span>
                </span>

                {submissionDeadline && !expiryDates[req.id] && (
                  <button
                    type="button"
                    onClick={() => onExpiryChange(req.id, submissionDeadline)}
                    className="pill-tag-soft text-[10px] cursor-pointer hover:bg-[#b9b9f9]/50 transition-colors"
                    title={lang === 'en' ? 'Quick set to tender deadline' : 'ডেডলাইন অনুযায়ী সেট করুন'}
                  >
                    {lang === 'en' ? 'Use Deadline' : 'ডেডলাইন দিন'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RequirementsPanel(props: RequirementsPanelProps) {
  const {
    statusList,
    t,
    lang,
    matches,
    availableFiles,
    matchedFileIds,
    expiryDates,
    submissionDeadline,
    onMatch,
    onExpiryChange,
    onPreviewFile,
    onAutoMatch,
  } = props;

  const [activeTab, setActiveTab] = useState<'all' | 'attention' | 'ready' | 'mandatory'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredList = useMemo(() => {
    return statusList.filter(entry => {
      // Tab filter
      if (activeTab === 'attention' && !entry.blocks) return false;
      if (activeTab === 'ready' && entry.status !== 'OK') return false;
      if (activeTab === 'mandatory' && !entry.req.mandatory) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const enMatch = entry.req.title_en.toLowerCase().includes(query);
        const bnMatch = entry.req.title_bn.toLowerCase().includes(query);
        const idMatch = entry.req.id.toLowerCase().includes(query);
        if (!enMatch && !bnMatch && !idMatch) return false;
      }

      return true;
    });
  }, [statusList, activeTab, searchQuery]);

  const blockingCount = statusList.filter(s => s.blocks).length;
  const readyCount = statusList.filter(s => s.status === 'OK').length;
  const mandatoryCount = statusList.filter(s => s.req.mandatory).length;

  return (
    <div className="space-y-4">
      {/* Panel Top Bar: Title & Auto-Match */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#533afd]/10 text-[#533afd] flex items-center justify-center">
            <IconClipboard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#0d253d] tracking-tight flex items-center gap-2">
              {t.requiredDocs}
              <span className="pill-tag-soft font-tabular">
                {statusList.length}
              </span>
            </h2>
          </div>
        </div>

        {availableFiles.length > 0 && (
          <button
            onClick={onAutoMatch}
            className="btn-stripe-primary text-xs self-start sm:self-auto"
            id="panel-auto-match-btn"
          >
            <IconSparkles className="w-3.5 h-3.5" />
            <span>{t.autoMatch}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar (Pill Group per DESIGN.md) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white border border-[#e3e8ee] overflow-x-auto shadow-[0_1px_2px_rgba(0,55,112,0.04)]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#533afd] text-white shadow-[0_1px_3px_rgba(83,58,253,0.3)]'
                : 'text-[#64748d] hover:text-[#0d253d]'
            }`}
          >
            {t.filterAll} ({statusList.length})
          </button>

          <button
            onClick={() => setActiveTab('attention')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'attention'
                ? 'bg-[#ea2261] text-white shadow-[0_1px_3px_rgba(234,34,97,0.3)]'
                : 'text-[#64748d] hover:text-[#0d253d]'
            }`}
          >
            {t.filterAttention} ({blockingCount})
          </button>

          <button
            onClick={() => setActiveTab('ready')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'ready'
                ? 'bg-emerald-600 text-white shadow-[0_1px_3px_rgba(5,150,105,0.3)]'
                : 'text-[#64748d] hover:text-[#0d253d]'
            }`}
          >
            {t.filterCompleted} ({readyCount})
          </button>

          <button
            onClick={() => setActiveTab('mandatory')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'mandatory'
                ? 'bg-[#0d253d] text-white'
                : 'text-[#64748d] hover:text-[#0d253d]'
            }`}
          >
            {t.mandatory} ({mandatoryCount})
          </button>
        </div>

        {/* Search Input with Stripe input token */}
        <div className="relative">
          <IconSearch className="w-3.5 h-3.5 text-[#64748d] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="stripe-input w-full sm:w-56 pl-8 pr-7 py-1.5 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748d] hover:text-[#0d253d]"
            >
              <IconX className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Requirement Cards List */}
      <div className="space-y-3" id="requirements-list">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-[#e3e8ee] bg-[#f6f9fc]/40">
            <p className="text-xs text-[#64748d]">
              {lang === 'en'
                ? 'No document requirements match the selected filter.'
                : 'নির্বাচিত ফিল্টারের সাথে কোন নথি মেলেনি।'}
            </p>
          </div>
        ) : (
          filteredList.map((entry) => (
            <RequirementCard
              key={entry.req.id}
              entry={entry}
              t={t}
              lang={lang}
              matches={matches}
              availableFiles={availableFiles}
              matchedFileIds={matchedFileIds}
              expiryDates={expiryDates}
              submissionDeadline={submissionDeadline}
              onMatch={onMatch}
              onExpiryChange={onExpiryChange}
              onPreviewFile={onPreviewFile}
            />
          ))
        )}
      </div>
    </div>
  );
}
