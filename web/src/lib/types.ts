// Types matching the core Ano types

export type AnnotationType = 'concern' | 'question' | 'suggestion' | 'blocker';
export type AnnotationStatus = 'open' | 'resolved';
export type ApprovalStatus = 'pending' | 'approved' | 'changes_requested';

export interface Anchor {
  line: number;
  endLine?: number;
  contextBefore: string;
  contextAfter: string;
  contentHash: string;
}

export interface Reply {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

export interface Annotation {
  id: string;
  anchor: Anchor;
  type: AnnotationType;
  author: string;
  timestamp: string;
  content: string;
  status: AnnotationStatus;
  replies: Reply[];
}

export interface Approval {
  author: string;
  title?: string;
  status: ApprovalStatus;
  timestamp: string;
  comment?: string;
}

export interface AnnotationFile {
  version: string;
  file: string;
  fileHash: string;
  annotations: Annotation[];
  approvals: Approval[];
}
