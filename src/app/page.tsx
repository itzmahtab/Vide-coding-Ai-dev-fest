'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { getFileHash, getPdfPageCount } from '@/lib/pdfUtils';
import { Tender, Requirement, RequirementsData, UploadedFile, Status } from '@/lib/types';
import { parseISO, isBefore, startOfDay, format } from 'date-fns';
import { PDFDocument, rgb } from 'pdf-lib';

export default function Home() {
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [tenderData, setTenderData] = useState<RequirementsData | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({}); // reqId -> fileId
  const [expiryDates, setExpiryDates] = useState<Record<string, string>>({}); // reqId -> YYYY-MM-DD
  const [isGenerating, setIsGenerating] = useState(false);

  // Translations
  const t = {
    appTitle: lang === 'en' ? 'Tender Document Package Builder' : 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার',
    uploadReq: lang === 'en' ? 'Upload requirements.json' : 'requirements.json আপলোড করুন',
    tenderDetails: lang === 'en' ? 'Tender Details' : 'টেন্ডারের বিস্তারিত',
    id: lang === 'en' ? 'Tender ID:' : 'টেন্ডার আইডি:',
    title: lang === 'en' ? 'Title:' : 'শিরোনাম:',
    entity: lang === 'en' ? 'Entity:' : 'প্রতিষ্ঠান:',
    bidder: lang === 'en' ? 'Bidder:' : 'দরদাতা:',
    deadline: lang === 'en' ? 'Submission Deadline:' : 'জমাদানের শেষ সময়:',
    uploadFiles: lang === 'en' ? 'Upload PDF Files' : 'পিডিএফ ফাইল আপলোড করুন',
    filesUploaded: lang === 'en' ? 'Files Uploaded' : 'ফাইল আপলোড হয়েছে',
    pages: lang === 'en' ? 'pages' : 'পৃষ্ঠা',
    duplicate: lang === 'en' ? '(Duplicate)' : '(অনুলিপি)',
    remove: lang === 'en' ? 'Remove' : 'সরান',
    requiredDocs: lang === 'en' ? 'Required Documents' : 'প্রয়োজনীয় কাগজপত্র',
    mandatory: lang === 'en' ? 'Mandatory' : 'বাধ্যতামূলক',
    optional: lang === 'en' ? 'Optional' : 'ঐচ্ছিক',
    expiryDate: lang === 'en' ? 'Expiry Date:' : 'মেয়াদ শেষ হওয়ার তারিখ:',
    selectFile: lang === 'en' ? '-- Select a File --' : '-- একটি ফাইল নির্বাচন করুন --',
    generateBtn: lang === 'en' ? 'Generate Package' : 'প্যাকেজ তৈরি করুন',
    generating: lang === 'en' ? 'Generating...' : 'তৈরি হচ্ছে...',
    status: {
      'Missing': lang === 'en' ? 'Missing' : 'অনুপস্থিত',
      'Expiry date needed': lang === 'en' ? 'Expiry date needed' : 'মেয়াদ শেষ হওয়ার তারিখ প্রয়োজন',
      'Expired': lang === 'en' ? 'Expired' : 'মেয়াদোত্তীর্ণ',
      'Not provided': lang === 'en' ? 'Not provided' : 'দেওয়া হয়নি',
      'OK': lang === 'en' ? 'OK' : 'ঠিক আছে',
    }
  };

  const handleReqUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tender && data.requirements) {
          // sort requirements by order
          data.requirements.sort((a: Requirement, b: Requirement) => a.order - b.order);
          setTenderData(data);
          setMatches({});
          setExpiryDates({});
          setFiles([]);
        } else {
          alert('Invalid requirements.json format.');
        }
      } catch (err) {
        alert('Error parsing JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    e.target.value = ''; // reset

    for (const file of newFiles) {
      if (file.type !== 'application/pdf') {
        alert(`${file.name} is not a PDF.`);
        continue;
      }
      if (files.length >= 30) {
        alert('Maximum 30 files allowed.');
        break;
      }

      try {
        const hash = await getFileHash(file);
        const pages = await getPdfPageCount(file);
        
        setFiles(prev => {
          const isDup = prev.some(f => f.hash === hash);
          return [...prev, {
            id: Math.random().toString(36).substring(7),
            file,
            name: file.name,
            pages,
            hash,
            isDuplicate: isDup
          }];
        });
      } catch (err) {
        alert(`Failed to read ${file.name}`);
      }
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    // Remove from matches
    setMatches(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(reqId => {
        if (next[reqId] === fileId) delete next[reqId];
      });
      return next;
    });
    // re-eval duplicates
    setFiles(prev => {
      const seen = new Set<string>();
      return prev.map(f => {
        if (seen.has(f.hash)) {
          return { ...f, isDuplicate: true };
        } else {
          seen.add(f.hash);
          return { ...f, isDuplicate: false };
        }
      });
    });
  };

  const getStatus = (req: Requirement): { status: Status, blocks: boolean } => {
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
  };

  const matchedFileIds = Object.values(matches);
  const availableFiles = files.filter(f => !f.isDuplicate);

  const canGenerate = useMemo(() => {
    if (!tenderData) return false;
    for (const req of tenderData.requirements) {
      if (getStatus(req).blocks) return false;
    }
    return true;
  }, [tenderData, matches, expiryDates, files]);

  const generatePackage = async () => {
    if (!tenderData) return;
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      
      // Page 1: Cover Page
      const cover = pdfDoc.addPage();
      const { width, height } = cover.getSize();
      let y = height - 50;
      
      const drawText = (text: string, size = 12) => {
        cover.drawText(text, { x: 50, y, size, color: rgb(0,0,0) });
        y -= (size + 10);
      };

      drawText('Tender Document Package', 24);
      y -= 20;
      drawText(`Tender ID: ${tenderData.tender.tender_id}`);
      drawText(`Title: ${tenderData.tender.title}`);
      drawText(`Procuring Entity: ${tenderData.tender.procuring_entity}`);
      drawText(`Bidder: ${tenderData.tender.bidder}`);
      drawText(`Submission Deadline: ${tenderData.tender.submission_deadline}`);
      drawText(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
      y -= 20;
      
      drawText('Included Documents:', 16);
      
      // Add matched documents
      const docsToMerge: { req: Requirement, file: UploadedFile }[] = [];
      
      for (const req of tenderData.requirements) {
        const fileId = matches[req.id];
        if (fileId) {
          const file = files.find(f => f.id === fileId);
          if (file) {
            drawText(`- ${req.title_en} (${file.name})`);
            docsToMerge.push({ req, file });
          }
        }
      }

      // Merge PDFs
      for (const { file } of docsToMerge) {
        const buffer = await file.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const copiedPages = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach(p => pdfDoc.addPage(p));
      }

      // Add Footer
      const totalPages = pdfDoc.getPageCount();
      const pages = pdfDoc.getPages();
      
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width } = page.getSize();
        const footerText = `${tenderData.tender.tender_id} | Page ${i + 1} of ${totalPages}`;
        page.drawText(footerText, {
          x: width / 2 - 50,
          y: 20,
          size: 10,
          color: rgb(0.5, 0.5, 0.5)
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
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
      alert('Error generating package.');
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t.appTitle}</h1>
          <button 
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors"
          >
            {lang === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Step 1: Load Requirements */}
          {!tenderData ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block">
                {t.uploadReq}
                <input type="file" accept=".json" onChange={handleReqUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <>
              {/* Tender Details */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">{t.tenderDetails}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">{t.id}</span> {tenderData.tender.tender_id}</div>
                  <div><span className="font-medium">{t.deadline}</span> {tenderData.tender.submission_deadline}</div>
                  <div><span className="font-medium">{t.title}</span> {tenderData.tender.title}</div>
                  <div><span className="font-medium">{t.entity}</span> {tenderData.tender.procuring_entity}</div>
                  <div className="col-span-2"><span className="font-medium">{t.bidder}</span> {tenderData.tender.bidder}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Upload & Files */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">{t.filesUploaded}</h2>
                  <label className="block w-full text-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="text-blue-600 font-medium">{t.uploadFiles}</span>
                    <input type="file" accept=".pdf" multiple onChange={handlePdfUpload} className="hidden" />
                  </label>
                  
                  <div className="space-y-2">
                    {files.map(f => (
                      <div key={f.id} className={`flex items-center justify-between p-3 rounded-lg border ${f.isDuplicate ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                        <div className="truncate max-w-[200px]" title={f.name}>
                          <span className="font-medium text-sm">{f.name}</span>
                          <div className="text-xs text-gray-500">{f.pages} {t.pages} {f.isDuplicate && <span className="text-red-500 font-bold">{t.duplicate}</span>}</div>
                        </div>
                        <button onClick={() => removeFile(f.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">{t.remove}</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">{t.requiredDocs}</h2>
                  <div className="space-y-4">
                    {tenderData.requirements.map(req => {
                      const { status, blocks } = getStatus(req);
                      const title = lang === 'en' ? req.title_en : req.title_bn;
                      
                      return (
                        <div key={req.id} className={`p-4 rounded-xl border ${blocks ? 'border-red-300 bg-red-50/30' : 'border-green-300 bg-green-50/30'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-semibold">{title}</div>
                              <div className="text-xs text-gray-500">
                                {req.mandatory ? t.mandatory : t.optional}
                              </div>
                            </div>
                            <div className={`text-xs font-bold px-2 py-1 rounded-full ${blocks ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {t.status[status]}
                            </div>
                          </div>

                          <select 
                            className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-2 p-2 border"
                            value={matches[req.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setMatches(prev => {
                                const next = { ...prev };
                                if (val) {
                                  // remove if mapped elsewhere
                                  Object.keys(next).forEach(k => {
                                    if (next[k] === val) delete next[k];
                                  });
                                  next[req.id] = val;
                                } else {
                                  delete next[req.id];
                                }
                                return next;
                              });
                            }}
                          >
                            <option value="">{t.selectFile}</option>
                            {availableFiles.map(f => (
                              <option key={f.id} value={f.id} disabled={matchedFileIds.includes(f.id) && matches[req.id] !== f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>

                          {req.has_expiry && matches[req.id] && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm font-medium">{t.expiryDate}</span>
                              <input 
                                type="date"
                                className="border border-gray-300 rounded-md p-1 text-sm focus:border-blue-500 focus:ring-blue-500"
                                value={expiryDates[req.id] || ''}
                                onChange={(e) => setExpiryDates(prev => ({ ...prev, [req.id]: e.target.value }))}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* Footer Generate */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <button
                  onClick={generatePackage}
                  disabled={!canGenerate || isGenerating}
                  className={`px-8 py-4 rounded-xl font-bold text-lg text-white transition-all ${!canGenerate || isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'}`}
                >
                  {isGenerating ? t.generating : t.generateBtn}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
