# Tender Document Package Builder — AI DevFest 2026

A modern, 100% client-side web application designed to help procurement and office staff assemble, validate, and compile tender submission documents into one complete, strictly verified, and ordered PDF package.

---

## 1. Participant & Submission Details

- **Participant Name:** Mahtab Uddin Mahi
- **GitHub Repository:** [https://github.com/itzmahtab/Vide-coding-Ai-dev-fest](https://github.com/itzmahtab/Vide-coding-Ai-dev-fest)
- **Live Public Website (HTTPS):** [https://tender-document-builder.vercel.app](https://tender-document-builder.vercel.app) *(or your deployed Vercel / Cloudflare Pages URL)*
- **Eligible Commit Hash:** *(Refer to latest commit ID)*

---

## 2. Problem Statement Overview

In commercial and government tenders, bidders must submit a strictly ordered set of mandatory and optional documents (trade license, tax certificates, bank solvency, technical proposals, etc.). In real life, manual package preparation suffers from frequent errors: missing mandatory documents, expired licenses, duplicate file attachments, and misordered pages.

**This application solves the problem with a zero-backend, browser-only workbench** that performs:
1. Requirements validation against deadline dates.
2. Real-time SHA-256 duplicate detection to catch identical content under different filenames.
3. Instant document status auditing (`Missing`, `Expiry date needed`, `Expired`, `Not provided`, `OK`).
4. Full client-side compilation of a single PDF package containing an English cover page, an index page showing exact starting page numbers, ordered documents, running footers, and optional authentic seal stamping.
5. 100% bilingual UI in both English and Bangla.

---

## 3. How to Run Locally

### Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm, pnpm, or yarn
- Modern web browser (Google Chrome recommended)

### Installation & Execution

```bash
# 1. Clone the repository
git clone https://github.com/itzmahtab/Vide-coding-Ai-dev-fest.git
cd Vide-coding-Ai-dev-fest

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Linting

```bash
# Validate TypeScript and ESLint rules
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 4. Main Tasks Implemented (Problem Statement §4)

- [x] **4.1 Load the list:** Parses `requirements.json`, sorting document requirements by `order` and displaying tender metadata (Tender ID, Procuring Entity, Bidder, Submission Deadline).
- [x] **4.2 Upload files:** Supports drag-and-drop and batch uploading of multiple PDF files. Reads page counts and rejects non-PDF files with clear error toast notifications.
- [x] **4.3 Match files:** Allows 1-to-1 matching between uploaded files and required documents. Prevents one file from serving multiple documents simultaneously.
- [x] **4.4 Enter expiry dates:** For documents with `has_expiry = true`, provides date input and visual cues relative to the tender submission deadline.
- [x] **4.5 Check everything (Status Rules §5):** Computes reactive statuses instantaneously:
  - `Missing`: Mandatory document with no matched file (Blocks package).
  - `Expiry date needed`: Matched document requires expiry date, but none entered (Blocks package).
  - `Expired`: Document expiry date is strictly before submission deadline (Blocks package). Same-day expiry is accepted as OK per §5.
  - `Not provided`: Optional document without an attached file (Does not block).
  - `OK`: Document satisfied and valid through submission deadline (Does not block).
- [x] **4.6 Find duplicates:** Computes SHA-256 hashes of all uploaded files. Files with identical content (even with different names) are flagged with warning badges and restricted from being matched to different documents.
- [x] **4.7 Make the package:** The "Generate Package" button remains disabled with an expandable list of blocking reasons until all issues are resolved. When ready, compiles the complete package.
- [x] **4.8 Download:** Automatically downloads the final PDF as `<tender_id>_Package.pdf` (e.g. `T-2026-0417_Package.pdf`).
- [x] **4.9 Two languages (English & Bangla):** Complete, fluent bilingual interface across all titles, badges, prompts, date pickers, and toast notifications.

---

## 5. Bonus Tasks Implemented (Problem Statement §7)

- [x] **Document Index Page (§7):** Generates an index page immediately following the cover page, detailing the exact starting page number and page count for every included document.
- [x] **Seal or Signature Stamp (§7):** Users can upload a PNG/JPG official company stamp or signature. The image is previewed in a modal and stamped on the bottom-right of every package page.
- [x] **Export Checklist as CSV (§7):** One-click export downloading `<tender_id>_Checklist.csv` containing Document title, File name, Page count, Expiry Date, and Status.
- [x] **Save and Reopen Workspace (§7):** Persists draft configuration (matches, expiry dates, tender info) to browser `localStorage` with save and restore actions.
- [x] **Smart Auto-Match (§7):** "⚡ Smart Auto-Match" algorithm uses fuzzy keyword tokenization on filenames and English/Bangla requirement titles to match files in one click.
- [x] **In-App PDF Document Preview:** Eye icon on file items opens a glassmorphic preview modal embedding the PDF in an iframe viewer.
- [x] **Safe Handling of Bad Files (§7):** Damaged or encrypted PDFs are caught with descriptive error toasts rather than crashing the application.
- [x] **1-Click Sample Pack Loader:** Quick demo button on the upload screen preloads sample tender requirements for instant evaluation.
- [x] **Interactive Toast Notification System:** Custom animated toast notifications for all system events (duplicate warnings, rejections, auto-matches, downloads).

---

## 6. PDF Package Compliance (Section 6)

1. **Page 1 — Cover Page (English):**
   - Tender ID, Title, Procuring Entity, Bidder Name, Submission Deadline, Package Generation Date.
   - Clean, ordered table of included documents with individual page counts.
2. **Page 2 — Document Index:**
   - Detailed index table showing starting page numbers and total pages for each document.
3. **Document Pages:**
   - Merged in strict `order` sequence, preserving all original pages.
4. **Running Footer:**
   - Every page contains `<tender_id> | Page X of Y` centered at the bottom on a subtle protective background band to prevent obscuring document text.

---

## 7. Known Problems / Limitations

- In accordance with contest rule §5.1, the application is strictly frontend-only; refreshing the page without saving the draft to `localStorage` will reset unsaved in-memory file handles.
- Very large PDF merges (over 100MB) depend on available browser memory in Chrome.

---

## 8. AI Tools Used

- **Google Antigravity IDE (Agentic Pair Programming)**
- **Gemini & Claude Advanced Models**
- **Skills CLI Tools:**
  - `tailwind-4-docs` (Tailwind CSS v4 reference & best practices)
  - `frontend-design` (Editorial design guidelines & aesthetics)
  - `getdesign` (Stripe-inspired enterprise tokens and design hierarchy)

---

## 9. Most Useful Prompt

```text
npx skills add https://github.com/lombiq/tailwind-agent-skills --skill tailwind-4-docs use this redeisn it more beautifullu add toaast animations etc npx skills add https://github.com/anthropics/skills --skill frontend-design
```

*Why it was most useful:*  
This prompt connected high-grade design and Tailwind CSS v4 patterns directly into the development workflow, enabling us to transcend generic template layouts and build an enterprise procurement tool with smooth toast notifications, glassmorphism, fluid micro-interactions, and visual status auditing.

---

## 10. Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime & UI:** React 19, TypeScript
- **Styling:** Tailwind CSS v4, Custom CSS Design Tokens
- **PDF Manipulation:** `pdf-lib` (Client-side load, copyPages, drawText, drawImage, save)
- **Date Handling:** `date-fns` (ISO parsing, startOfDay comparison)
- **Icons:** Optimized inline SVG iconography
- **Typography:** Inter & Noto Sans Bengali (Google Fonts)

---

## 11. License

MIT License — see [LICENSE](file:///c:/Users/Administrator/Downloads/vc/LICENSE) for details.
