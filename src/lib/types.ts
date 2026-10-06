export interface Tender {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string;
}

export interface Requirement {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface RequirementsData {
  tender: Tender;
  requirements: Requirement[];
}

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  pages: number;
  hash: string;
  isDuplicate: boolean;
}

export type Status = 'Missing' | 'Expiry date needed' | 'Expired' | 'Not provided' | 'OK';

export type Language = 'en' | 'bn';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  uploadReq: string;
  uploadReqDesc: string;
  tenderDetails: string;
  id: string;
  title: string;
  entity: string;
  bidder: string;
  deadline: string;
  uploadFiles: string;
  uploadFilesDesc: string;
  filesUploaded: string;
  noFiles: string;
  pages: string;
  duplicate: string;
  remove: string;
  requiredDocs: string;
  mandatory: string;
  optional: string;
  expiryDate: string;
  selectFile: string;
  generateBtn: string;
  generating: string;
  downloadReady: string;
  blockedReasons: string;
  progress: string;
  completedDocs: string;
  coverPage: string;
  indexPage: string;
  dragDrop: string;
  orBrowse: string;
  resetAll: string;
  exportChecklist: string;
  status: Record<Status, string>;
}

export function getTranslations(lang: Language): Translations {
  if (lang === 'bn') {
    return {
      appTitle: 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার',
      appSubtitle: 'আপনার টেন্ডার জমাদানের নথি প্যাকেজ তৈরি করুন',
      uploadReq: 'requirements.json আপলোড করুন',
      uploadReqDesc: 'টেন্ডারের প্রয়োজনীয়তার ফাইল নির্বাচন করুন',
      tenderDetails: 'টেন্ডারের বিস্তারিত',
      id: 'টেন্ডার আইডি',
      title: 'শিরোনাম',
      entity: 'ক্রয়কারী প্রতিষ্ঠান',
      bidder: 'দরদাতা',
      deadline: 'জমাদানের শেষ সময়',
      uploadFiles: 'পিডিএফ ফাইল আপলোড করুন',
      uploadFilesDesc: 'পিডিএফ ফাইল টেনে আনুন অথবা ব্রাউজ করুন',
      filesUploaded: 'আপলোড করা ফাইল',
      noFiles: 'এখনো কোন ফাইল আপলোড করা হয়নি',
      pages: 'পৃষ্ঠা',
      duplicate: 'অনুলিপি',
      remove: 'সরান',
      requiredDocs: 'প্রয়োজনীয় কাগজপত্র',
      mandatory: 'বাধ্যতামূলক',
      optional: 'ঐচ্ছিক',
      expiryDate: 'মেয়াদ শেষ হওয়ার তারিখ',
      selectFile: '— একটি ফাইল নির্বাচন করুন —',
      generateBtn: 'প্যাকেজ তৈরি করুন',
      generating: 'তৈরি হচ্ছে...',
      downloadReady: 'ডাউনলোড প্রস্তুত!',
      blockedReasons: 'সমস্যা দূর করুন',
      progress: 'অগ্রগতি',
      completedDocs: 'সম্পন্ন',
      coverPage: 'প্রচ্ছদ পৃষ্ঠা',
      indexPage: 'সূচিপত্র',
      dragDrop: 'এখানে টেনে আনুন',
      orBrowse: 'অথবা ব্রাউজ করুন',
      resetAll: 'সব মুছুন',
      exportChecklist: 'চেকলিস্ট এক্সপোর্ট',
      status: {
        'Missing': 'অনুপস্থিত',
        'Expiry date needed': 'মেয়াদ শেষের তারিখ প্রয়োজন',
        'Expired': 'মেয়াদোত্তীর্ণ',
        'Not provided': 'দেওয়া হয়নি',
        'OK': 'ঠিক আছে',
      },
    };
  }

  return {
    appTitle: 'Tender Document Package Builder',
    appSubtitle: 'Build your tender submission document package',
    uploadReq: 'Upload requirements.json',
    uploadReqDesc: 'Select the tender requirements file to get started',
    tenderDetails: 'Tender Details',
    id: 'Tender ID',
    title: 'Title',
    entity: 'Procuring Entity',
    bidder: 'Bidder',
    deadline: 'Submission Deadline',
    uploadFiles: 'Upload PDF Files',
    uploadFilesDesc: 'Drag and drop PDF files or click to browse',
    filesUploaded: 'Uploaded Files',
    noFiles: 'No files uploaded yet',
    pages: 'pages',
    duplicate: 'Duplicate',
    remove: 'Remove',
    requiredDocs: 'Required Documents',
    mandatory: 'Mandatory',
    optional: 'Optional',
    expiryDate: 'Expiry Date',
    selectFile: '— Select a File —',
    generateBtn: 'Generate Package',
    generating: 'Generating...',
    downloadReady: 'Download Ready!',
    blockedReasons: 'Resolve Issues',
    progress: 'Progress',
    completedDocs: 'Completed',
    coverPage: 'Cover Page',
    indexPage: 'Index Page',
    dragDrop: 'Drop files here',
    orBrowse: 'or click to browse',
    resetAll: 'Reset All',
    exportChecklist: 'Export Checklist',
    status: {
      'Missing': 'Missing',
      'Expiry date needed': 'Expiry date needed',
      'Expired': 'Expired',
      'Not provided': 'Not provided',
      'OK': 'OK',
    },
  };
}
