'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  getFileHash,
  getPdfPageCount,
  recalcDuplicates,
  generatePackagePdf,
  exportChecklistCsv,
  suggestAutoMatches,
} from '@/lib/pdfUtils';
import {
  Tender,
  Requirement,
  RequirementsData,
  UploadedFile,
  Status,
  Language,
  getTranslations,
} from '@/lib/types';
import { parseISO, isBefore, startOfDay } from 'date-fns';

// ─────────────────────────────────────────────────
// SVG Icon Components (inline to avoid extra deps)
// ─────────────────────────────────────────────────

function IconUpload({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconFile({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconCheck({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconAlertTriangle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconClock({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconDownload({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconClipboard({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function IconLayers({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconCopy({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconGlobe({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────

export default function Home() {
  const [lang, setLang] = useState<Language>('en');
  const [tenderData, setTenderData] = useState<RequirementsData | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({}); // reqId -> fileId
  const [expiryDates, setExpiryDates] = useState<Record<string, string>>({}); // reqId -> YYYY-MM-DD
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sealBytes, setSealBytes] = useState<Uint8Array | undefined>(undefined);
  const [sealFileName, setSealFileName] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const sealInputRef = useRef<HTMLInputElement>(null);

  const t = getTranslations(lang);

  // ─── Auto Match Handler ───
  const handleAutoMatch = useCallback(() => {
    if (!tenderData || files.length === 0) return;
    const suggested = suggestAutoMatches(tenderData.requirements, files);
    setMatches(prev => ({ ...prev, ...suggested }));
  }, [tenderData, files]);

  // ─── Seal Image Upload ───
  const handleSealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      setSealBytes(new Uint8Array(buffer));
      setSealFileName(file.name);
    } catch {
      alert('Failed to read seal image.');
    }
    e.target.value = '';
  };

  // ─── Requirements JSON Upload ───
  const handleReqUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.tender && data.requirements) {
          data.requirements.sort((a: Requirement, b: Requirement) => a.order - b.order);
          setTenderData(data);
          setMatches({});
          setExpiryDates({});
          setFiles([]);
        } else {
          alert('Invalid requirements.json format — missing "tender" or "requirements".');
        }
      } catch {
        alert('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ─── PDF File Upload ───
  const processFiles = useCallback(async (newFiles: File[]) => {
    for (const file of newFiles) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert(`"${file.name}" is not a PDF file and was skipped.`);
        continue;
      }

      try {
        const hash = await getFileHash(file);
        const pages = await getPdfPageCount(file);

        setFiles(prev => {
          const updated = [
            ...prev,
            {
              id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10),
              file,
              name: file.name,
              pages,
              hash,
              isDuplicate: false,
            },
          ];
          return recalcDuplicates(updated);
        });
      } catch {
        alert(`Failed to read "${file.name}". It may be damaged or password-protected.`);
      }
    }
  }, []);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = '';
    await processFiles(selected);
  };

  // ─── Drag & Drop ───
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  }, [processFiles]);

  // ─── Remove File ───
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => recalcDuplicates(prev.filter(f => f.id !== fileId)));
    setMatches(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(reqId => {
        if (next[reqId] === fileId) delete next[reqId];
      });
      return next;
    });
  }, []);

  // ─── Status Computation ───
  const getStatus = useCallback((req: Requirement): { status: Status; blocks: boolean } => {
    const matchedFileId = matches[req.id];

    if (!matchedFileId) {
      if (req.mandatory) return { status: 'Missing', blocks: true };
      return { status: 'Not provided', blocks: false };
    }

    // Check if matched file is a duplicate
    const matchedFile = files.find(f => f.id === matchedFileId);
    if (matchedFile?.isDuplicate) {
      // Duplicate files should not be matched — treat as missing
      // But per spec: "Do not allow them to be matched to different documents"
      // We still show the match but it's flagged
    }

    if (req.has_expiry) {
      const dateStr = expiryDates[req.id];
      if (!dateStr) return { status: 'Expiry date needed', blocks: true };

      if (tenderData?.tender.submission_deadline) {
        const expiry = startOfDay(parseISO(dateStr));
        const deadline = startOfDay(parseISO(tenderData.tender.submission_deadline));
        if (isBefore(expiry, deadline)) {
          return { status: 'Expired', blocks: true };
        }
      }
    }

    return { status: 'OK', blocks: false };
  }, [matches, expiryDates, files, tenderData]);

  // ─── Derived State ───
  const matchedFileIds = useMemo(() => new Set(Object.values(matches)), [matches]);

  // Files available for matching: non-duplicate files only
  const availableFiles = useMemo(() => files.filter(f => !f.isDuplicate), [files]);

  const statusList = useMemo(() => {
    if (!tenderData) return [];
    return tenderData.requirements.map(req => ({
      req,
      ...getStatus(req),
    }));
  }, [tenderData, getStatus]);

  const canGenerate = useMemo(() => {
    return statusList.length > 0 && statusList.every(s => !s.blocks);
  }, [statusList]);

  const completedCount = useMemo(
    () => statusList.filter(s => s.status === 'OK').length,
    [statusList],
  );

  const totalRequired = useMemo(
    () => statusList.length,
    [statusList],
  );

  const blockingReasons = useMemo(() => {
    return statusList
      .filter(s => s.blocks)
      .map(s => {
        const title = lang === 'en' ? s.req.title_en : s.req.title_bn;
        return `${title}: ${t.status[s.status]}`;
      });
  }, [statusList, lang, t]);

  // ─── Generate Package ───
  const handleGenerate = async () => {
    if (!tenderData || !canGenerate) return;
    setIsGenerating(true);
    try {
      const pdfBytes = await generatePackagePdf(tenderData, files, matches, sealBytes);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tenderData.tender.tender_id}_Package.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error generating package. See console for details.');
    }
    setIsGenerating(false);
  };

  // ─── Export Checklist (Bonus) ───
  const handleExportChecklist = () => {
    if (!tenderData) return;
    const csv = exportChecklistCsv(
      tenderData,
      files,
      matches,
      expiryDates,
      (req) => getStatus(req).status,
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tenderData.tender.tender_id}_Checklist.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ─── Status Badge Renderer ───
  const StatusBadge = ({ status }: { status: Status }) => {
    const config: Record<Status, { className: string; icon: React.ReactNode }> = {
      'OK': { className: 'status-badge status-ok', icon: <IconCheck /> },
      'Missing': { className: 'status-badge status-missing', icon: <IconX /> },
      'Expired': { className: 'status-badge status-expired', icon: <IconAlertTriangle /> },
      'Expiry date needed': { className: 'status-badge status-expiry-needed', icon: <IconClock /> },
      'Not provided': { className: 'status-badge status-not-provided', icon: <span>—</span> },
    };
    const c = config[status];
    return (
      <span className={c.className}>
        {c.icon}
        {t.status[status]}
      </span>
    );
  };

  // ─── Match handler ───
  const handleMatch = (reqId: string, fileId: string) => {
    setMatches(prev => {
      const next = { ...prev };
      if (fileId) {
        // Remove this file from any other match
        Object.keys(next).forEach(k => {
          if (next[k] === fileId) delete next[k];
        });
        next[reqId] = fileId;
      } else {
        delete next[reqId];
      }
      return next;
    });
  };

  // ────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────

  return (
    <div className={`min-h-screen ${lang === 'bn' ? 'font-bn' : ''}`}>

      {/* ===== HEADER ===== */}
      <header className="app-header px-6 py-5 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <IconLayers className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight" id="app-title">
                {t.appTitle}
              </h1>
              <p className="text-xs text-indigo-200 opacity-70">{t.appSubtitle}</p>
            </div>
          </div>

          <button
            className="btn-lang flex items-center gap-2"
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            id="lang-toggle"
          >
            <IconGlobe />
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ─── Upload Requirements (Initial State) ─── */}
        {!tenderData ? (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <div className="glass-card-static p-16 text-center max-w-xl mx-auto mt-16">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center animate-float" style={{ background: 'rgba(99,102,241,0.12)' }}>
                <IconUpload className="text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{t.uploadReq}</h2>
              <p className="text-sm text-slate-400 mb-8">{t.uploadReqDesc}</p>
              <label className="btn-primary inline-flex items-center gap-2 cursor-pointer text-base px-8 py-3" id="upload-req-btn">
                <IconUpload />
                {t.uploadReq}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleReqUpload}
                  className="hidden"
                  id="req-file-input"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* ─── Tender Details Card ─── */}
            <div className="glass-card-static p-6 animate-fade-in" id="tender-details-section">
              <div className="flex items-center justify-between mb-5">
                <h2 className="section-title">
                  <span className="icon">
                    <IconClipboard />
                  </span>
                  {t.tenderDetails}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <label className="btn-ghost cursor-pointer inline-flex items-center gap-1" id="seal-upload-btn">
                    <span>{sealFileName ? `✓ ${sealFileName}` : (lang === 'en' ? '+ Add Seal/Stamp' : '+ সিল/স্বাক্ষর যোগ করুন')}</span>
                    <input
                      ref={sealInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleSealUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    className="btn-ghost"
                    onClick={handleExportChecklist}
                    id="export-csv-btn"
                  >
                    <svg className="inline mr-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    {t.exportChecklist}
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      setTenderData(null);
                      setFiles([]);
                      setMatches({});
                      setExpiryDates({});
                      setSealBytes(undefined);
                      setSealFileName(null);
                    }}
                    id="reset-btn"
                  >
                    {t.resetAll}
                  </button>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">{t.id}</div>
                  <div className="info-value" style={{ color: '#a5b4fc', fontFamily: 'monospace' }}>
                    {tenderData.tender.tender_id}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">{t.title}</div>
                  <div className="info-value">{tenderData.tender.title}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">{t.entity}</div>
                  <div className="info-value">{tenderData.tender.procuring_entity}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">{t.bidder}</div>
                  <div className="info-value">{tenderData.tender.bidder}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">{t.deadline}</div>
                  <div className="info-value" style={{ color: '#fbbf24' }}>
                    {tenderData.tender.submission_deadline}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">{t.progress}</div>
                  <div className="info-value">
                    <span style={{ color: '#34d399' }}>{completedCount}</span>
                    <span className="text-slate-500"> / {totalRequired} </span>
                    <span className="text-xs text-slate-500">{t.completedDocs}</span>
                  </div>
                  <div className="progress-bar mt-2">
                    <div
                      className="progress-fill"
                      style={{ width: totalRequired > 0 ? `${(completedCount / totalRequired) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Two-Column Layout ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

              {/* ─── LEFT: Uploaded Files ─── */}
              <div className="lg:col-span-2 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                <div className="flex items-center justify-between">
                  <h2 className="section-title">
                    <span className="icon">
                      <IconFile />
                    </span>
                    {t.filesUploaded}
                    {files.length > 0 && <span className="section-count">{files.length}</span>}
                  </h2>
                </div>

                {/* Drop Zone */}
                <div
                  className={`drop-zone ${isDragOver ? 'active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => pdfInputRef.current?.click()}
                  id="pdf-drop-zone"
                >
                  <IconUpload className="mx-auto mb-3 text-indigo-400 opacity-60" />
                  <p className="text-sm font-medium text-slate-300">{t.dragDrop}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.orBrowse}</p>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="pdf-file-input"
                  />
                </div>

                {/* File List */}
                <div className="space-y-2" id="file-list">
                  {files.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">{t.noFiles}</p>
                  ) : (
                    files.map((f, i) => (
                      <div
                        key={f.id}
                        className={`file-card ${f.isDuplicate ? 'duplicate' : ''}`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                        id={`file-${f.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <IconFile className={f.isDuplicate ? 'text-red-400 flex-shrink-0' : 'text-indigo-400 flex-shrink-0'} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" title={f.name}>
                              {f.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                {f.pages} {t.pages}
                              </span>
                              {f.isDuplicate && (
                                <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                                  <IconCopy />
                                  {t.duplicate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          className="btn-danger-ghost flex-shrink-0"
                          onClick={() => removeFile(f.id)}
                          id={`remove-file-${f.id}`}
                        >
                          {t.remove}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ─── RIGHT: Required Documents ─── */}
              <div className="lg:col-span-3 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <div className="flex items-center justify-between">
                  <h2 className="section-title">
                    <span className="icon">
                      <IconClipboard />
                    </span>
                    {t.requiredDocs}
                    <span className="section-count">{totalRequired}</span>
                  </h2>
                  <button
                    className="btn-ghost text-xs"
                    onClick={handleAutoMatch}
                    disabled={files.length === 0}
                    id="auto-match-btn"
                  >
                    ⚡ {lang === 'en' ? 'Auto Match Files' : 'স্বয়ংক্রিয় মিলকরণ'}
                  </button>
                </div>

                <div className="space-y-3" id="requirements-list">
                  {statusList.map(({ req, status, blocks }, i) => {
                    const title = lang === 'en' ? req.title_en : req.title_bn;
                    const matchedId = matches[req.id];

                    return (
                      <div
                        key={req.id}
                        className={`req-card ${blocks ? 'blocking' : status === 'OK' ? 'ok' : ''}`}
                        style={{ animationDelay: `${i * 0.06}s` }}
                        id={`req-${req.id}`}
                      >
                        {/* Top row: Title + Status */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-slate-500">{String(req.order).padStart(2, '0')}</span>
                              <h3 className="text-sm font-semibold text-white">{title}</h3>
                            </div>
                            <span className={req.mandatory ? 'tag-mandatory' : 'tag-optional'}>
                              {req.mandatory ? t.mandatory : t.optional}
                              {req.has_expiry && (
                                <span className="ml-1 opacity-60">• {lang === 'en' ? 'has expiry' : 'মেয়াদ আছে'}</span>
                              )}
                            </span>
                          </div>
                          <StatusBadge status={status} />
                        </div>

                        {/* File Selector */}
                        <select
                          className="select-field"
                          value={matchedId || ''}
                          onChange={(e) => handleMatch(req.id, e.target.value)}
                          id={`match-select-${req.id}`}
                        >
                          <option value="">{t.selectFile}</option>
                          {availableFiles.map(f => (
                            <option
                              key={f.id}
                              value={f.id}
                              disabled={matchedFileIds.has(f.id) && matches[req.id] !== f.id}
                            >
                              {f.name} ({f.pages} {t.pages})
                            </option>
                          ))}
                        </select>

                        {/* Expiry Date Input */}
                        {req.has_expiry && matchedId && (
                          <div className="flex items-center gap-3 mt-3 animate-slide-down">
                            <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <IconClock />
                              {t.expiryDate}
                            </label>
                            <input
                              type="date"
                              className="date-field"
                              value={expiryDates[req.id] || ''}
                              onChange={(e) =>
                                setExpiryDates(prev => ({ ...prev, [req.id]: e.target.value }))
                              }
                              id={`expiry-${req.id}`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ─── Footer / Generate Bar ─── */}
            <div className="footer-bar rounded-2xl mt-8 animate-fade-in" id="generate-section">
              <div className="flex-1">
                {!canGenerate && blockingReasons.length > 0 && (
                  <div className="text-xs text-red-400 space-y-0.5">
                    <p className="font-semibold text-red-300 mb-1 flex items-center gap-1">
                      <IconAlertTriangle />
                      {t.blockedReasons} ({blockingReasons.length})
                    </p>
                    {blockingReasons.slice(0, 3).map((r, i) => (
                      <p key={i} className="text-slate-500">• {r}</p>
                    ))}
                    {blockingReasons.length > 3 && (
                      <p className="text-slate-600">+ {blockingReasons.length - 3} more...</p>
                    )}
                  </div>
                )}
                {canGenerate && (
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <IconCheck />
                    {lang === 'en' ? 'All documents ready. You can generate the package.' : 'সব নথি প্রস্তুত। প্যাকেজ তৈরি করুন।'}
                  </p>
                )}
              </div>

              <button
                className="btn-success flex items-center gap-3"
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                id="generate-btn"
              >
                {isGenerating ? (
                  <>
                    <span className="spinner" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <IconDownload />
                    {t.generateBtn}
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
