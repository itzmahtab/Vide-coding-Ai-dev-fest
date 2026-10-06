import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { RequirementsData, Requirement, UploadedFile } from './types';

/**
 * Compute SHA-256 hash of a file for duplicate detection.
 */
export async function getFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get page count from a PDF file. Handles damaged/encrypted PDFs gracefully.
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch {
    throw new Error(`Failed to parse PDF: ${file.name}`);
  }
}

/**
 * Re-evaluate duplicate status across all files based on hash.
 */
export function recalcDuplicates(files: UploadedFile[]): UploadedFile[] {
  // Count how many files have each hash
  const hashCount = new Map<string, number>();
  for (const f of files) {
    hashCount.set(f.hash, (hashCount.get(f.hash) || 0) + 1);
  }
  // Mark as duplicate if hash appears more than once
  return files.map(f => ({
    ...f,
    isDuplicate: (hashCount.get(f.hash) || 0) > 1,
  }));
}

/**
 * Generate the final tender package PDF.
 *
 * Rules:
 * - Page 1: Cover page in English with tender info + included doc list
 * - Page 2: Index page showing page numbers where each doc starts (Bonus)
 * - Documents sorted by `order`, all pages included
 * - Footer on every page: "<tender_id> | Page X of Y"
 */
export async function generatePackagePdf(
  tenderData: RequirementsData,
  files: UploadedFile[],
  matches: Record<string, string>,
  sealImageBytes?: Uint8Array,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  type EmbeddedImage = Awaited<ReturnType<PDFDocument['embedPng']>>;

  let embeddedSeal: EmbeddedImage | null = null;
  if (sealImageBytes) {
    try {
      embeddedSeal = await pdfDoc.embedPng(sealImageBytes);
    } catch {
      try {
        embeddedSeal = await pdfDoc.embedJpg(sealImageBytes);
      } catch (e) {
        console.error('Failed to embed seal image', e);
      }
    }
  }

  // Collect docs to merge in order
  const docsToMerge: { req: Requirement; file: UploadedFile }[] = [];
  for (const req of tenderData.requirements) {
    const fileId = matches[req.id];
    if (fileId) {
      const file = files.find(f => f.id === fileId);
      if (file) {
        docsToMerge.push({ req, file });
      }
    }
  }

  // ======== COVER PAGE ========
  const coverWidth = 595.28; // A4
  const coverHeight = 841.89;
  const cover = pdfDoc.addPage([coverWidth, coverHeight]);

  let y = coverHeight - 80;
  const leftMargin = 60;
  const maxTextWidth = coverWidth - leftMargin * 2;

  // Title bar accent
  cover.drawRectangle({
    x: leftMargin,
    y: y + 5,
    width: maxTextWidth,
    height: 3,
    color: rgb(0.388, 0.4, 0.945), // indigo
  });

  y -= 30;
  cover.drawText('TENDER DOCUMENT PACKAGE', {
    x: leftMargin,
    y,
    size: 22,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  });

  y -= 40;

  // Helper to draw a labeled field
  const drawField = (label: string, value: string) => {
    cover.drawText(label, {
      x: leftMargin,
      y,
      size: 9,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.5),
    });
    y -= 16;
    cover.drawText(value, {
      x: leftMargin,
      y,
      size: 12,
      font,
      color: rgb(0.1, 0.1, 0.15),
    });
    y -= 24;
  };

  drawField('TENDER ID', tenderData.tender.tender_id);
  drawField('TITLE', tenderData.tender.title);
  drawField('PROCURING ENTITY', tenderData.tender.procuring_entity);
  drawField('BIDDER', tenderData.tender.bidder);
  drawField('SUBMISSION DEADLINE', tenderData.tender.submission_deadline);

  const now = new Date();
  const generatedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  drawField('PACKAGE GENERATED ON', generatedDate);

  // Divider
  y -= 10;
  cover.drawRectangle({
    x: leftMargin,
    y,
    width: maxTextWidth,
    height: 1,
    color: rgb(0.85, 0.85, 0.9),
  });
  y -= 30;

  // Included documents list
  cover.drawText('INCLUDED DOCUMENTS', {
    x: leftMargin,
    y,
    size: 11,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.25),
  });
  y -= 24;

  for (let i = 0; i < docsToMerge.length; i++) {
    const { req, file } = docsToMerge[i];
    const text = `${i + 1}. ${req.title_en} — ${file.name} (${file.pages} pages)`;
    cover.drawText(text, {
      x: leftMargin + 8,
      y,
      size: 10,
      font,
      color: rgb(0.25, 0.25, 0.3),
    });
    y -= 18;
    if (y < 80) break; // prevent overflow
  }

  // ======== INDEX PAGE (Bonus) ========
  const indexPage = pdfDoc.addPage([coverWidth, coverHeight]);
  let iy = coverHeight - 80;

  indexPage.drawText('DOCUMENT INDEX', {
    x: leftMargin,
    y: iy,
    size: 18,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.15),
  });
  iy -= 10;
  indexPage.drawRectangle({
    x: leftMargin,
    y: iy,
    width: maxTextWidth,
    height: 2,
    color: rgb(0.388, 0.4, 0.945),
  });
  iy -= 30;

  // Table header
  indexPage.drawText('#', { x: leftMargin, y: iy, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.5) });
  indexPage.drawText('Document', { x: leftMargin + 30, y: iy, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.5) });
  indexPage.drawText('Page', { x: coverWidth - leftMargin - 60, y: iy, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.5) });
  indexPage.drawText('Pages', { x: coverWidth - leftMargin - 20, y: iy, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.5) });
  iy -= 6;
  indexPage.drawRectangle({ x: leftMargin, y: iy, width: maxTextWidth, height: 0.5, color: rgb(0.8, 0.8, 0.85) });
  iy -= 18;

  // ======== MERGE DOCUMENT PAGES ========
  // Each source page is placed on a slightly taller page so that a reserved
  // empty band exists at the bottom — the footer sits inside that band and
  // can never overlap the source document's content.
  const sealH = embeddedSeal ? embeddedSeal.height * 0.25 : 0;
  const FOOTER_BAND = embeddedSeal ? Math.min(Math.max(28, sealH + 14), 90) : 28;
  const mergedEntries: { title: string; startPage: number; pages: number }[] = [];
  let nextPageNumber = 3; // cover = page 1, index = page 2

  for (const { req, file } of docsToMerge) {
    try {
      const buffer = await file.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const srcPages = srcDoc.getPages();
      const embeddedPages = await pdfDoc.embedPages(srcPages);

      for (let i = 0; i < srcPages.length; i++) {
        const { width: sw, height: sh } = srcPages[i].getSize();
        const page = pdfDoc.addPage([sw, sh + FOOTER_BAND]);
        page.drawPage(embeddedPages[i], { x: 0, y: FOOTER_BAND });
      }

      // Only pages that actually merged are counted, so the index page
      // numbers and "Page X of Y" stay correct even if a damaged file
      // had to be skipped.
      mergedEntries.push({
        title: req.title_en,
        startPage: nextPageNumber,
        pages: srcPages.length,
      });
      nextPageNumber += srcPages.length;
    } catch (err) {
      console.error(`Failed to merge ${file.name}:`, err);
    }
  }

  // ======== INDEX ROWS ========
  for (let i = 0; i < mergedEntries.length; i++) {
    const entry = mergedEntries[i];
    indexPage.drawText(`${i + 1}`, { x: leftMargin + 4, y: iy, size: 10, font, color: rgb(0.3, 0.3, 0.35) });
    indexPage.drawText(entry.title, { x: leftMargin + 30, y: iy, size: 10, font, color: rgb(0.15, 0.15, 0.2) });
    indexPage.drawText(`${entry.startPage}`, { x: coverWidth - leftMargin - 52, y: iy, size: 10, font, color: rgb(0.3, 0.3, 0.35) });
    indexPage.drawText(`${entry.pages}`, { x: coverWidth - leftMargin - 12, y: iy, size: 10, font, color: rgb(0.3, 0.3, 0.35) });
    iy -= 20;
    if (iy < 80) break;
  }

  // ======== ADD FOOTERS & SEALS ========
  const totalPages = pdfDoc.getPageCount();
  const allPages = pdfDoc.getPages();

  for (let i = 0; i < totalPages; i++) {
    const page = allPages[i];
    const { width: pw } = page.getSize();
    const footerText = `${tenderData.tender.tender_id} | Page ${i + 1} of ${totalPages}`;
    const textWidth = font.widthOfTextAtSize(footerText, 9);

    // Optional Seal/Signature stamp
    if (embeddedSeal) {
      const sealDims = embeddedSeal.scale(0.25);
      page.drawImage(embeddedSeal, {
        x: pw - sealDims.width - 30,
        y: 35,
        width: sealDims.width,
        height: sealDims.height,
      });
    }

    // Semi-transparent footer background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pw,
      height: 28,
      color: rgb(0.97, 0.97, 0.98),
    });

    page.drawRectangle({
      x: 0,
      y: 28,
      width: pw,
      height: 0.5,
      color: rgb(0.88, 0.88, 0.9),
    });

    page.drawText(footerText, {
      x: (pw - textWidth) / 2,
      y: 10,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.45),
    });
  }

  return pdfDoc.save();
}

/**
 * Suggest auto matches for requirements based on file names (Bonus Task).
 */
export function suggestAutoMatches(
  requirements: Requirement[],
  files: UploadedFile[],
): Record<string, string> {
  const matches: Record<string, string> = {};
  const usedFileIds = new Set<string>();

  // Filter out duplicates
  const validFiles = files.filter(f => !f.isDuplicate);

  for (const req of requirements) {
    const reqTokens = [
      ...req.title_en.toLowerCase().split(/[\s_\-\.\(\)]+/),
      ...req.title_bn.toLowerCase().split(/[\s_\-\.\(\)]+/),
      req.id.toLowerCase(),
    ].filter(t => t.length > 2);

    let bestFileId: string | null = null;
    let highestScore = 0;

    for (const f of validFiles) {
      if (usedFileIds.has(f.id)) continue;

      const fileName = f.name.toLowerCase();
      let score = 0;

      for (const token of reqTokens) {
        if (fileName.includes(token)) {
          score += token.length;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestFileId = f.id;
      }
    }

    if (bestFileId && highestScore > 0) {
      matches[req.id] = bestFileId;
      usedFileIds.add(bestFileId);
    }
  }

  return matches;
}


/**
 * Export checklist as CSV (Bonus feature).
 */
export function exportChecklistCsv(
  tenderData: RequirementsData,
  files: UploadedFile[],
  matches: Record<string, string>,
  expiryDates: Record<string, string>,
  getStatusFn: (req: Requirement) => string,
): string {
  const rows = [['Document', 'File Name', 'Pages', 'Expiry Date', 'Status']];

  for (const req of tenderData.requirements) {
    const fileId = matches[req.id];
    const file = fileId ? files.find(f => f.id === fileId) : undefined;
    rows.push([
      req.title_en,
      file?.name || '',
      file ? String(file.pages) : '',
      expiryDates[req.id] || '',
      getStatusFn(req),
    ]);
  }

  return rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
}
