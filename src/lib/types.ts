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
