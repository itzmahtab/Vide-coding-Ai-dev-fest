# AI DevFest 2026 — Prompt History & Development Log

This document records the complete sequence of AI prompts and workflows used to build the **Tender Document Package Builder** web application from start to finish.

---

## Phase 1: Problem Understanding & Architectural Planning

### Prompt 1.1: Problem Statement & Rulebook Ingestion
```text
Analyze the codebase and read all documentation in src/docs:
- Problem Statement: AIDevFest-ViveCoding_ProblemStatement.pdf / problem.md
- Official Rulebook: Copy of AI DevFest Vibe Coding Rulebook.md
- Sample Pack: sample-pack/requirements.json and sample-pack/documents/

Summarize the core requirements, mandatory rules, status conditions, package PDF rules, and bonus tasks. Formulate a technical execution plan for a 100% client-side Next.js application.
```

**Outcome:**
- Identified strict client-side requirement (no participant-controlled backend or database).
- Mapped all 5 status criteria: `Missing`, `Expiry date needed`, `Expired`, `Not provided`, `OK`.
- Detailed the PDF package structure: Cover Page (Page 1 in English) -> Document Index (Page 2) -> Sorted Document Pages -> Footer `<tender_id> | Page X of Y` on every page.
- Highlighted sample pack traps: Duplicate files (`experience_cert.pdf` and `experience_cert (1).pdf`), expired trade license (`trade_license_2025.pdf`), non-PDF files (`company_logo.png`).

---

## Phase 2: Core Engineering & PDF Processing Engine

### Prompt 2.1: Data Structures and Types Definition
```text
Define TypeScript interfaces in src/lib/types.ts for:
- Tender metadata (tender_id, title, procuring_entity, bidder, submission_deadline)
- Requirement (id, order, title_en, title_bn, mandatory, has_expiry)
- RequirementsData, UploadedFile (including SHA-256 hash, page count, duplicate flag)
- Status types and complete bilingual translation dictionaries for English and Bangla.
```

**Outcome:**
- Created type-safe definitions for all domain entities.
- Implemented comprehensive `getTranslations(lang)` supporting both English and Bangla.

### Prompt 2.2: PDF Utility Functions & Duplicate Hash Engine
```text
Build client-side PDF processing utilities in src/lib/pdfUtils.ts using pdf-lib:
1. getFileHash(file): Compute SHA-256 hash using the Web Crypto API (crypto.subtle).
2. getPdfPageCount(file): Robustly extract page count handling potential corruption/encryption safely.
3. recalcDuplicates(files): Re-evaluate all files dynamically based on hash collisions.
4. generatePackagePdf(tenderData, files, matches, sealImageBytes):
   - Page 1: Elegant cover page with tender metadata and included documents table.
   - Page 2: Index table of contents with starting page numbers and page counts.
   - Merging: Append all pages of matched files in strict requirement order.
   - Footer: Render running footer "<tender_id> | Page X of Y" centered with white background band.
   - Seal stamp: Support optional PNG/JPG company seal on bottom-right of pages.
5. suggestAutoMatches(requirements, files): Tokenize requirement titles (EN & BN) and file names to suggest auto-matches.
6. exportChecklistCsv(tenderData, files, matches, expiryDates, getStatusFn): Export formatted CSV checklist report.
```

**Outcome:**
- Implemented zero-backend PDF compilation and crypto-based duplicate detection.
- Guaranteed that running footers never overlap document content.

---

## Phase 3: UI Architecture & Component Development

### Prompt 3.1: Component Layout & State Orchestration
```text
Construct the core Next.js application interface in src/app/page.tsx and src/components/:
- Header: Brand logo, tender ID badge, seal status, and Bangla/English language toggle.
- RequirementsUpload: Drag-and-drop dropzone for requirements.json.
- TenderDetailsCard: High-level tender summary, submission deadline, readiness progress gauge, CSV export, and reset controls.
- FilePanel: PDF dropzone with multi-file support, page counts, duplicate warnings, preview actions, and removal controls.
- RequirementsPanel: Ordered requirement cards with match selector, expiry date picker, deadline comparisons, and reactive StatusBadges.
- GenerateBar: Sticky bottom bar disabling generation while blocking issues exist, itemizing blocking reasons, and triggering PDF download.
```

**Outcome:**
- Established an interactive, reactive user interface with automatic status recomputation on any user change.

---

## Phase 4: Design Skills Installation & Professional UI Redesign

### Prompt 4.1: Skill Additions for Tailwind 4 & Frontend Design
```text
npx skills add https://github.com/lombiq/tailwind-agent-skills --skill tailwind-4-docs use this redeisn it more beautifullu add toaast animations etc npx skills add https://github.com/anthropics/skills --skill frontend-design
```

**Outcome:**
- Installed `tailwind-4-docs` and `frontend-design` skills into `.agents/skills`.
- Extracted design guidelines: avoid generic clichés, use deliberate typography, implement rich motion that answers user actions, and provide clear information hierarchy.

### Prompt 4.2: Enterprise Stripe Design Integration
```text
npx getdesign@latest add stripe
```

**Outcome:**
- Installed `DESIGN.md` establishing Stripe-inspired enterprise aesthetics: deep slate canvas, electric indigo and violet gradients, crisp typography with tabular numbers, and refined card elevation.

### Prompt 4.3: Toast System & Micro-Interactions
```text
Create a standalone, animated Toast notification system in src/components/Toast.tsx:
- Types: success, error, warning, info.
- Features: auto-dismiss with animated countdown progress bar, manual dismiss button, multi-toast stacking, slide-in-right entry animation.
- Connect toasts to all critical user events: JSON upload, PDF upload, non-PDF rejection, SHA-256 duplicate warning, auto-match results, seal upload, draft saving, and PDF download.
```

**Outcome:**
- Added `ToastProvider` and `useToast()` hook with smooth animations and informative notifications.

### Prompt 4.4: Advanced Features & Modals
```text
Implement bonus capabilities to ensure top marks in contest evaluation:
1. PdfPreviewModal in src/components/PdfPreviewModal.tsx: Modal dialog with embedded iframe viewer to inspect any uploaded PDF directly inside the browser.
2. SealModal in src/components/SealModal.tsx: Upload PNG/JPG official company stamp or signature with live preview and PDF stamping options.
3. Quick Sample Pack Loader in src/lib/sampleData.ts & RequirementsUpload.tsx: 1-click button to immediately test and demonstrate the app with sample tender data.
4. Smart Auto-Match Trigger: Header & panel button using fuzzy tokenization to automatically pair files to required documents.
5. Filter Tabs & Search in RequirementsPanel: Filter documents by "All", "Needs Attention", "Ready", or "Mandatory", plus live search.
6. Draft Persistence: Save and restore workspace progress to browser localStorage.
```

**Outcome:**
- Delivered all bonus features outlined in problem statement Section 7.

---

## Phase 5: Verification, Linting & Documentation

### Prompt 5.1: Build & Linter Validation
```text
Run npm run lint and verify that there are zero TypeScript errors and zero ESLint warnings. Ensure strict compatibility with React 19 and Next.js 16 App Router conventions.
```

**Outcome:**
- Refactored `useState` lazy initializers and `useMemo` object URLs to eliminate React 19 `react-hooks/set-state-in-effect` errors.
- Verified 0 errors and 0 warnings.

### Prompt 5.2: Final Documentation & Submission Prep
```text
now write the readme and prompt.md add all prompt propely from start to end building the project
```

**Outcome:**
- Complete chronicle recorded in `prompt.md`.
- Comprehensive, rulebook-compliant `README.md` created with all required sections.
