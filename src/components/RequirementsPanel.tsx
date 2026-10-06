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
      className={`relative rounded-2xl p-5 border transition-all duration-300 ${
        blocks
          ? 'bg-rose-950/10 border-rose-500/25 shadow-sm shadow-rose-950/20'
          : status === 'OK'
          ? 'bg-slate-900/70 border-emerald-500/25 shadow-sm shadow-emerald-950/20'
          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700/80'
      }`}
      id={`req-${req.id}`}
    >
      {/* Top Header: Order, Title, Badges, Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
            {String(req.order).padStart(2, '0')}
          </span>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
              <span className="text-xs text-slate-400 font-normal">({secondaryTitle})</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  req.mandatory
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {req.mandatory ? t.mandatory : t.optional}
              </span>

              {req.has_expiry && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/20 flex items-center gap-1">
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-750 focus:border-indigo-500 text-slate-200 text-xs font-medium focus:outline-none transition-all cursor-pointer appearance-none"
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
                    className="bg-slate-900 text-slate-200"
                  >
                    {f.name} ({f.pages} {t.pages}){isUsedElsewhere ? ' [Used]' : ''}
                  </option>
                );
              })}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
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
                className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 border border-slate-700/80 flex items-center gap-1.5 text-xs transition-colors shrink-0"
                title={t.preview}
              >
                <IconEye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.preview}</span>
              </button>

              <button
                type="button"
                onClick={() => onMatch(req.id, '')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-colors shrink-0"
                title={lang === 'en' ? 'Unassign file' : 'ফাইল বাতিল করুন'}
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Expiry Date Section */}
        {req.has_expiry && matchedId && (
          <div className="pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-down">
            <div className="flex items-center gap-2">
              <label
                htmlFor={`expiry-${req.id}`}
                className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <IconClock className="w-3.5 h-3.5 text-amber-400" />
                {t.expiryDate}:
              </label>

              <input
                id={`expiry-${req.id}`}
                type="date"
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-400 text-xs font-mono text-slate-200 focus:outline-none transition-colors"
                value={expiryDates[req.id] || ''}
                onChange={(e) => onExpiryChange(req.id, e.target.value)}
              />
            </div>

            {submissionDeadline && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  {lang === 'en' ? 'Deadline:' : 'শেষ সময়:'} <span className="font-mono text-amber-300">{submissionDeadline}</span>
                </span>

                {submissionDeadline && !expiryDates[req.id] && (
                  <button
                    type="button"
                    onClick={() => onExpiryChange(req.id, submissionDeadline)}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors"
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
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <IconClipboard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              {t.requiredDocs}
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300">
                {statusList.length}
              </span>
            </h2>
          </div>
        </div>

        {availableFiles.length > 0 && (
          <button
            onClick={onAutoMatch}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
            id="panel-auto-match-btn"
          >
            <IconSparkles className="w-3.5 h-3.5" />
            <span>{t.autoMatch}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterAll} ({statusList.length})
          </button>

          <button
            onClick={() => setActiveTab('attention')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'attention'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterAttention} ({blockingCount})
          </button>

          <button
            onClick={() => setActiveTab('ready')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'ready'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterCompleted} ({readyCount})
          </button>

          <button
            onClick={() => setActiveTab('mandatory')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'mandatory'
                ? 'bg-slate-800 text-slate-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.mandatory} ({mandatoryCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-56 pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <IconX className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Requirement Cards List */}
      <div className="space-y-3" id="requirements-list">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-slate-800/40 bg-slate-950/20">
            <p className="text-xs text-slate-400">
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
