'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  getFileHash,
  getPdfPageCount,
  recalcDuplicates,
  generatePackagePdf,
  exportChecklistCsv,
  suggestAutoMatches,
} from '@/lib/pdfUtils';
import {
  Requirement,
  RequirementsData,
  UploadedFile,
  Status,
  Language,
  getTranslations,
} from '@/lib/types';
import { SAMPLE_REQUIREMENTS_DATA } from '@/lib/sampleData';
import { parseISO, isBefore, startOfDay } from 'date-fns';
import Header from '@/components/Header';
import RequirementsUpload from '@/components/RequirementsUpload';
import TenderDetailsCard from '@/components/TenderDetailsCard';
import FilePanel from '@/components/FilePanel';
import RequirementsPanel, { StatusEntry } from '@/components/RequirementsPanel';
import GenerateBar from '@/components/GenerateBar';
import PdfPreviewModal from '@/components/PdfPreviewModal';
import SealModal from '@/components/SealModal';
import { ToastProvider, useToast } from '@/components/Toast';

const STORAGE_KEY = 'vc_tender_draft_v1';

function HomeContent() {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lang === 'bn' || parsed.lang === 'en') return parsed.lang;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const [tenderData, setTenderData] = useState<RequirementsData | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tenderData?.tender) return parsed.tenderData;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [files, setFiles] = useState<UploadedFile[]>([]);

  const [matches, setMatches] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.matches) return parsed.matches;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [expiryDates, setExpiryDates] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.expiryDates) return parsed.expiryDates;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Modal states
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [isSealModalOpen, setIsSealModalOpen] = useState(false);
  const [sealImage, setSealImage] = useState<{
    name: string;
    dataUrl: string;
    bytes: Uint8Array;
  } | null>(null);

  const { showToast } = useToast();
  const t = getTranslations(lang);

  // ─── Save Draft to LocalStorage ───
  const handleSaveWorkspace = () => {
    if (!tenderData) return;
    try {
      const dataToSave = {
        tenderData,
        matches,
        expiryDates,
        lang,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      showToast({
        type: 'success',
        title: lang === 'en' ? 'Draft Saved' : 'খসড়া সংরক্ষিত হয়েছে',
        message:
          lang === 'en'
            ? 'Your matches and expiry dates are stored safely in local browser storage.'
            : 'আপনার ম্যাচিং এবং মেয়াদের তথ্য ব্রাউজার মেমোরিতে সংরক্ষিত হয়েছে।',
      });
    } catch {
      showToast({
        type: 'error',
        title: lang === 'en' ? 'Save Failed' : 'সংরক্ষণ ব্যর্থ',
        message: lang === 'en' ? 'Could not save to browser storage.' : 'ব্রাউজারে সংরক্ষণ করা যায়নি।',
      });
    }
  };

  // ─── Load Bundled Sample Data ───
  const handleLoadSamplePack = () => {
    const data = JSON.parse(JSON.stringify(SAMPLE_REQUIREMENTS_DATA));
    data.requirements.sort((a: Requirement, b: Requirement) => a.order - b.order);
    setTenderData(data);
    setMatches({});
    setExpiryDates({});
    showToast({
      type: 'success',
      title: lang === 'en' ? 'Sample Pack Loaded' : 'নমুনা ডেটা লোড হয়েছে',
      message: `${data.tender.title} (${data.requirements.length} requirements)`,
    });
  };

  // ─── Requirements JSON Upload ───
  const handleReqUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.tender && data.requirements && Array.isArray(data.requirements)) {
          data.requirements.sort((a: Requirement, b: Requirement) => a.order - b.order);
          setTenderData(data);
          setMatches({});
          setExpiryDates({});
          setFiles([]);
          showToast({
            type: 'success',
            title: lang === 'en' ? 'Requirements Loaded' : 'প্রয়োজনীয়তা লোড হয়েছে',
            message: `${data.tender.title} • ${data.requirements.length} ${
              lang === 'en' ? 'documents specified' : 'টি নথি নির্দিষ্ট করা হয়েছে'
            }`,
          });
        } else {
          showToast({
            type: 'error',
            title: lang === 'en' ? 'Invalid JSON Format' : 'ভুল JSON ফরম্যাট',
            message:
              lang === 'en'
                ? 'Missing "tender" or "requirements" array in JSON.'
                : '"tender" বা "requirements" অংশ পাওয়া যায়নি।',
          });
        }
      } catch {
        showToast({
          type: 'error',
          title: lang === 'en' ? 'Parsing Error' : 'পার্সিং ত্রুটি',
          message: lang === 'en' ? 'Failed to parse JSON file.' : 'JSON ফাইল পড়া সম্ভব হয়নি।',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ─── PDF File Upload ───
  const processFiles = useCallback(
    async (newFiles: File[]) => {
      let addedCount = 0;
      let duplicateAlertTriggered = false;

      for (const file of newFiles) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          showToast({
            type: 'error',
            title: lang === 'en' ? 'Invalid File Rejected' : 'ফাইল বাতিল হয়েছে',
            message: `"${file.name}" ${
              lang === 'en'
                ? 'is not a PDF. Only PDF files are supported.'
                : 'পিডিএফ নয়। শুধুমাত্র পিডিএফ অনুমোদিত।'
            }`,
          });
          continue;
        }

        try {
          const hash = await getFileHash(file);
          const pages = await getPdfPageCount(file);

          setFiles(prev => {
            const updated = [
              ...prev,
              {
                id: crypto.randomUUID
                  ? crypto.randomUUID()
                  : Math.random().toString(36).substring(2, 10),
                file,
                name: file.name,
                pages,
                hash,
                isDuplicate: false,
              },
            ];
            const recalculated = recalcDuplicates(updated);

            // Check if this newly added file triggered duplicates
            const hasDupes = recalculated.some(f => f.isDuplicate);
            if (hasDupes && !duplicateAlertTriggered) {
              duplicateAlertTriggered = true;
              setTimeout(() => {
                showToast({
                  type: 'warning',
                  title: lang === 'en' ? 'Duplicate Detected' : 'অনুলিপি শনাক্ত হয়েছে',
                  message:
                    lang === 'en'
                      ? `Identical SHA-256 hash found. Duplicate copies cannot be matched to different requirements.`
                      : 'একই বিষয়বস্তুর ডুপ্লিকেট ফাইল পাওয়া গেছে। এগুলো একাধিক নথিতে যুক্ত করা যাবে না।',
                });
              }, 400);
            }

            return recalculated;
          });

          addedCount++;
        } catch {
          showToast({
            type: 'error',
            title: lang === 'en' ? 'Corrupted File' : 'ত্রুটিযুক্ত ফাইল',
            message: `"${file.name}" ${
              lang === 'en'
                ? 'could not be read. It may be password-protected or damaged.'
                : 'পড়া সম্ভব হয়নি। ফাইলটি পাসওয়ার্ডযুক্ত বা ক্ষতিগ্রস্ত হতে পারে।'
            }`,
          });
        }
      }

      if (addedCount > 0) {
        showToast({
          type: 'success',
          title: lang === 'en' ? 'Files Uploaded' : 'ফাইল আপলোড হয়েছে',
          message: `${addedCount} ${
            lang === 'en'
              ? addedCount === 1
                ? 'PDF file added'
                : 'PDF files added'
              : 'টি পিডিএফ সফলভাবে যোগ হয়েছে'
          }`,
        });
      }
    },
    [lang, showToast]
  );

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

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      await processFiles(droppedFiles);
    },
    [processFiles]
  );

  // ─── Remove File ───
  const removeFile = useCallback(
    (fileId: string) => {
      setFiles(prev => recalcDuplicates(prev.filter(f => f.id !== fileId)));
      setMatches(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(reqId => {
          if (next[reqId] === fileId) delete next[reqId];
        });
        return next;
      });
      showToast({
        type: 'info',
        title: lang === 'en' ? 'File Removed' : 'ফাইল মুছে ফেলা হয়েছে',
      });
    },
    [lang, showToast]
  );

  const handleClearAllFiles = () => {
    setFiles([]);
    setMatches({});
    showToast({
      type: 'info',
      title: lang === 'en' ? 'All Files Cleared' : 'সকল ফাইল মুছে ফেলা হয়েছে',
    });
  };

  // ─── Official Seal Management ───
  const handleUploadSeal = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSealImage({
          name: file.name,
          dataUrl: e.target?.result as string,
          bytes,
        });
        showToast({
          type: 'success',
          title: lang === 'en' ? 'Seal Attached' : 'অফিসিয়াল সিল সংযুক্ত হয়েছে',
          message: `"${file.name}" ${
            lang === 'en'
              ? 'will be stamped on bottom-right of package pages.'
              : 'প্যাকেজের প্রতিটি পৃষ্ঠার নিচে স্ট্যাম্প করা হবে।'
          }`,
        });
      };
      reader.readAsDataURL(file);
    } catch {
      showToast({
        type: 'error',
        title: lang === 'en' ? 'Seal Upload Failed' : 'সিল আপলোড ব্যর্থ',
        message: lang === 'en' ? 'Could not process image file.' : 'ছবি প্রসেস করা সম্ভব হয়নি।',
      });
    }
  };

  const handleRemoveSeal = () => {
    setSealImage(null);
    showToast({
      type: 'info',
      title: lang === 'en' ? 'Seal Removed' : 'সিল অপসারণ করা হয়েছে',
    });
  };

  // ─── Smart Auto-Match Bonus Feature ───
  const handleAutoMatch = () => {
    if (!tenderData || files.length === 0) return;

    const suggestions = suggestAutoMatches(tenderData.requirements, files);
    const count = Object.keys(suggestions).length;

    if (count > 0) {
      setMatches(prev => ({
        ...prev,
        ...suggestions,
      }));
      showToast({
        type: 'success',
        title: lang === 'en' ? 'Smart Auto-Match Complete' : 'স্বয়ংক্রিয় ম্যাচ সম্পন্ন',
        message:
          lang === 'en'
            ? `Successfully matched ${count} document${count > 1 ? 's' : ''} based on file names!`
            : `${count} টি ফাইল সফলভাবে তাদের সংশ্লিষ্ট নথির সাথে মেলানো হয়েছে!`,
      });
    } else {
      showToast({
        type: 'info',
        title: lang === 'en' ? 'No New Matches' : 'কোন নতুন মিল পাওয়া যায়নি',
        message:
          lang === 'en'
            ? 'Could not confidently match remaining files. Please select them manually.'
            : 'বাকি ফাইলগুলোর নাম অনুযায়ী মিল পাওয়া যায়নি। ম্যানুয়ালি নির্বাচন করুন।',
      });
    }
  };

  // ─── Status Computation ───
  const getStatus = useCallback(
    (req: Requirement): { status: Status; blocks: boolean } => {
      const matchedFileId = matches[req.id];

      if (!matchedFileId) {
        if (req.mandatory) return { status: 'Missing', blocks: true };
        return { status: 'Not provided', blocks: false };
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
    },
    [matches, expiryDates, tenderData]
  );

  // ─── Derived State ───
  const matchedFileIds = useMemo(() => new Set(Object.values(matches)), [matches]);

  // Duplicates must never match different documents (problem §4.6): only the
  // first copy of each identical-content group stays selectable. The extra
  // copies remain visible (and flagged) but cannot be chosen.
  const availableFiles = useMemo(() => {
    const seen = new Set<string>();
    return files.filter(f => {
      if (seen.has(f.hash)) return false;
      seen.add(f.hash);
      return true;
    });
  }, [files]);

  const statusList = useMemo<StatusEntry[]>(() => {
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
    [statusList]
  );

  const totalRequired = useMemo(() => statusList.length, [statusList]);

  const blockingReasons = useMemo(() => {
    return statusList
      .filter(s => s.blocks)
      .map(s => {
        const title = lang === 'en' ? s.req.title_en : s.req.title_bn;
        return `${title}: ${t.status[s.status]}`;
      });
  }, [statusList, lang, t]);

  // ─── Match handler ───
  const handleMatch = (reqId: string, fileId: string) => {
    setMatches(prev => {
      const next = { ...prev };
      if (fileId) {
        // One file can only serve one document
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

  const handleExpiryChange = useCallback((reqId: string, date: string) => {
    setExpiryDates(prev => ({ ...prev, [reqId]: date }));
  }, []);

  // ─── Generate Package ───
  const handleGenerate = async () => {
    if (!tenderData || !canGenerate) return;
    setIsGenerating(true);
    showToast({
      type: 'info',
      title: lang === 'en' ? 'Compiling PDF Package' : 'পিডিএফ প্যাকেজ তৈরি হচ্ছে',
      message:
        lang === 'en'
          ? 'Generating cover page, table of contents index, footers, and merging documents...'
          : 'প্রচ্ছদ, সূচিপত্র, পৃষ্ঠা নম্বর ও সিল যুক্ত করে ফাইলগুলো জোড়া লাগানো হচ্ছে...',
      duration: 3500,
    });

    try {
      const pdfBytes = await generatePackagePdf(
        tenderData,
        files,
        matches,
        sealImage?.bytes
      );
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tenderData.tender.tender_id}_Package.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        title: lang === 'en' ? 'Package Downloaded' : 'প্যাকেজ ডাউনলোড সম্পন্ন',
        message: `${tenderData.tender.tender_id}_Package.pdf`,
        duration: 6000,
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: lang === 'en' ? 'Package Generation Failed' : 'প্যাকেজ তৈরিতে ত্রুটি',
        message:
          lang === 'en'
            ? 'An error occurred while compiling the PDF. Check console for details.'
            : 'পিডিএফ তৈরির সময় সমস্যা হয়েছে। কনসোল দেখুন।',
      });
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
      req => getStatus(req).status
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

    showToast({
      type: 'success',
      title: lang === 'en' ? 'Checklist Exported' : 'চেকলিস্ট এক্সপোর্ট সম্পন্ন',
      message: `${tenderData.tender.tender_id}_Checklist.csv`,
    });
  };

  const handleReset = () => {
    setTenderData(null);
    setFiles([]);
    setMatches({});
    setExpiryDates({});
    setSealImage(null);
    localStorage.removeItem(STORAGE_KEY);
    showToast({
      type: 'info',
      title: lang === 'en' ? 'Workspace Reset' : 'ওয়ার্কস্পেস রিসেট করা হয়েছে',
    });
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${lang === 'bn' ? 'font-bn' : ''}`}>
      <Header
        t={t}
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'bn' : 'en')}
        tender={tenderData?.tender || null}
        hasSeal={!!sealImage}
        onOpenSealModal={() => setIsSealModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!tenderData ? (
          <RequirementsUpload
            t={t}
            onUpload={handleReqUpload}
            onLoadSample={handleLoadSamplePack}
          />
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Tender Overview Card */}
            <TenderDetailsCard
              tender={tenderData.tender}
              t={t}
              lang={lang}
              completedCount={completedCount}
              totalRequired={totalRequired}
              onExport={handleExportChecklist}
              onReset={handleReset}
              onAutoMatch={handleAutoMatch}
              onSaveWorkspace={handleSaveWorkspace}
              hasFiles={files.length > 0}
            />

            {/* Two-Column Grid: Files & Requirements */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5">
                <FilePanel
                  files={files}
                  t={t}
                  lang={lang}
                  isDragOver={isDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onPick={handlePdfUpload}
                  onRemove={removeFile}
                  onClearAll={handleClearAllFiles}
                  onPreview={file => setPreviewFile(file)}
                />
              </div>

              <div className="lg:col-span-7">
                <RequirementsPanel
                  statusList={statusList}
                  t={t}
                  lang={lang}
                  matches={matches}
                  availableFiles={availableFiles}
                  matchedFileIds={matchedFileIds}
                  expiryDates={expiryDates}
                  submissionDeadline={tenderData.tender.submission_deadline}
                  onMatch={handleMatch}
                  onExpiryChange={handleExpiryChange}
                  onPreviewFile={file => setPreviewFile(file)}
                  onAutoMatch={handleAutoMatch}
                />
              </div>
            </div>

            {/* Sticky Action Footer */}
            <GenerateBar
              canGenerate={canGenerate}
              isGenerating={isGenerating}
              blockingReasons={blockingReasons}
              t={t}
              lang={lang}
              onGenerate={handleGenerate}
            />
          </div>
        )}
      </main>

      {/* PDF Document Preview Modal */}
      <PdfPreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        lang={lang}
      />

      {/* Official Seal / Signature Modal */}
      <SealModal
        isOpen={isSealModalOpen}
        onClose={() => setIsSealModalOpen(false)}
        sealImage={sealImage}
        onUploadSeal={handleUploadSeal}
        onRemoveSeal={handleRemoveSeal}
        lang={lang}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  );
}
