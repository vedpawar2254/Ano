/**
 * Ano Core Types
 *
 * These types define the structure of annotation data.
 * The sidecar file (*.annotations.json) follows this schema.
 */

// ============================================
// Annotation Types (Templates)
// ============================================

/**
 * The type/category of an annotation.
 * Each has a specific meaning for reviewers:
 * - concern: Risk or issue identified
 * - question: Clarification needed
 * - suggestion: Improvement idea
 * - blocker: Must resolve before proceeding
 */
export type AnnotationType = 'concern' | 'question' | 'suggestion' | 'blocker';

/**
 * Status of an annotation
 * - open: Needs attention
 * - resolved: Addressed and closed
 */
export type AnnotationStatus = 'open' | 'resolved';

/**
 * Status of an approval
 * - pending: Not yet reviewed
 * - approved: Signed off
 * - changes_requested: Needs changes before approval
 */
export type ApprovalStatus = 'pending' | 'approved' | 'changes_requested';

// ============================================
// Anchoring (Position Tracking)
// ============================================

/**
 * Anchor stores context around an annotation's position.
 * When lines shift (edits above), we use this context to
 * relocate the annotation to its new position.
 */
export interface Anchor {
  /** Original line number (1-indexed) */
  line: number;

  /** Optional end line for multi-line selections */
  endLine?: number;

  /** Text content of the line before the annotated section */
  contextBefore: string;

  /** Text content of the line after the annotated section */
  contextAfter: string;

  /** Hash of the annotated content for change detection */
  contentHash: string;
}

// ============================================
// Reply (Threaded Discussion)
// ============================================

/**
 * A reply to an annotation, enabling threaded discussions.
 */
export interface Reply {
  /** Unique identifier for the reply */
  id: string;

  /** Who wrote this reply */
  author: string;

  /** When the reply was created */
  timestamp: string;

  /** The reply content */
  content: string;
}

// ============================================
// Annotation
// ============================================

/**
 * A single annotation on a file.
 * This is the core unit - a comment attached to a specific location.
 */
export interface Annotation {
  /** Unique identifier (UUID) */
  id: string;

  /** Position tracking - survives line changes */
  anchor: Anchor;

  /** Type of annotation (concern, question, etc.) */
  type: AnnotationType;

  /** Who created this annotation */
  author: string;

  /** ISO timestamp of creation */
  timestamp: string;

  /** The annotation content/message */
  content: string;

  /** Current status */
  status: AnnotationStatus;

  /** Threaded replies */
  replies: Reply[];
}

// ============================================
// Approval
// ============================================

/**
 * An approval/sign-off from a team member.
 */
export interface Approval {
  /** Who is approving */
  author: string;

  /** Their role/title (e.g., "Tech Lead") */
  title?: string;

  /** Approval status */
  status: ApprovalStatus;

  /** When they approved/reviewed */
  timestamp: string;

  /** Optional comment with the approval */
  comment?: string;
}

// ============================================
// Annotation File (Sidecar)
// ============================================

/**
 * The complete annotation file structure.
 * Stored as: <filename>.annotations.json
 *
 * Example: plan.md -> plan.md.annotations.json
 */
export interface AnnotationFile {
  /** Schema version for future compatibility */
  version: string;

  /** The file being annotated (relative path) */
  file: string;

  /** Hash of the file content when annotations were last synced */
  fileHash: string;

  /** All annotations on this file */
  annotations: Annotation[];

  /** Team approvals */
  approvals: Approval[];
}

// ============================================
// Team Configuration
// ============================================

/**
 * A team member in the config
 */
export interface TeamMember {
  /** Display name */
  name: string;

  /** Email (used to match git identity) */
  email: string;

  /** Role in the team */
  role: string;
}

/**
 * Role definition with permissions
 */
export interface TeamRole {
  /** Can this role override approval checks? */
  canOverride: boolean;

  /** Weight of approval (e.g., lead = 2, reviewer = 1) */
  weight: number;
}

/**
 * Approval requirements for the project
 */
export interface ApprovalRequirements {
  /** Minimum number of approvals needed */
  minApprovals: number;

  /** Minimum total weight needed (optional) */
  minWeight?: number;

  /** Specific roles that must approve (optional) */
  requiredRoles?: string[];

  /** Specific titles that must approve (optional, e.g., "Tech Lead", "Security") */
  requiredTitles?: string[];
}

/**
 * Team configuration stored in .ano/config.json
 */
export interface TeamConfig {
  /** Config schema version */
  version: string;

  /** Project name (optional) */
  projectName?: string;

  /** Team members */
  members: TeamMember[];

  /** Role definitions */
  roles: Record<string, TeamRole>;

  /** Approval requirements */
  requirements: ApprovalRequirements;
}

// ============================================
// Utility Types
// ============================================

/**
 * Options for creating a new annotation
 */
export interface CreateAnnotationOptions {
  file: string;
  line: number;
  endLine?: number;
  type: AnnotationType;
  author: string;
  content: string;
}

/**
 * Filter options for listing annotations
 */
export interface AnnotationFilter {
  file?: string;
  type?: AnnotationType;
  status?: AnnotationStatus;
  author?: string;
}
