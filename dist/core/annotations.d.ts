/**
 * Annotation File Operations
 *
 * Handles reading, writing, and managing annotation sidecar files.
 * Sidecar files are stored as: <filename>.annotations.json
 */
import type { AnnotationFile, Annotation, CreateAnnotationOptions, AnnotationFilter, Approval, ApprovalStatus, Reply } from './types.js';
/**
 * Get the annotation sidecar file path for a source file.
 * Example: "plan.md" -> "plan.md.annotations.json"
 */
export declare function getAnnotationFilePath(sourceFilePath: string): string;
/**
 * Check if an annotation file exists for a source file.
 */
export declare function annotationFileExists(sourceFilePath: string): Promise<boolean>;
/**
 * Create a hash of file content for change detection.
 * Uses SHA-256, truncated for readability.
 */
export declare function hashContent(content: string): string;
/**
 * Read an annotation file. Returns null if it doesn't exist.
 */
export declare function readAnnotationFile(sourceFilePath: string): Promise<AnnotationFile | null>;
/**
 * Write an annotation file.
 */
export declare function writeAnnotationFile(sourceFilePath: string, data: AnnotationFile): Promise<void>;
/**
 * Create a new, empty annotation file for a source file.
 */
export declare function createAnnotationFile(sourceFilePath: string): Promise<AnnotationFile>;
/**
 * Get or create an annotation file for a source file.
 */
export declare function getOrCreateAnnotationFile(sourceFilePath: string): Promise<AnnotationFile>;
/**
 * Add a new annotation to a file.
 * Automatically creates the anchor with surrounding context.
 */
export declare function addAnnotation(options: CreateAnnotationOptions): Promise<Annotation>;
/**
 * Get a specific annotation by ID.
 */
export declare function getAnnotation(sourceFilePath: string, annotationId: string): Promise<Annotation | null>;
/**
 * List annotations with optional filtering.
 */
export declare function listAnnotations(sourceFilePath: string, filter?: AnnotationFilter): Promise<Annotation[]>;
/**
 * Resolve (close) an annotation.
 */
export declare function resolveAnnotation(sourceFilePath: string, annotationId: string): Promise<boolean>;
/**
 * Reopen a resolved annotation.
 */
export declare function reopenAnnotation(sourceFilePath: string, annotationId: string): Promise<boolean>;
/**
 * Delete an annotation.
 */
export declare function deleteAnnotation(sourceFilePath: string, annotationId: string): Promise<boolean>;
/**
 * Add a reply to an annotation.
 */
export declare function addReply(sourceFilePath: string, annotationId: string, author: string, content: string): Promise<Reply | null>;
/**
 * Add or update an approval.
 */
export declare function setApproval(sourceFilePath: string, author: string, status: ApprovalStatus, title?: string, comment?: string): Promise<Approval>;
/**
 * Get all approvals for a file.
 */
export declare function getApprovals(sourceFilePath: string): Promise<Approval[]>;
/**
 * Check if a file has required approvals.
 * @param requiredCount - Minimum number of approvals needed
 */
export declare function hasRequiredApprovals(sourceFilePath: string, requiredCount?: number): Promise<boolean>;
