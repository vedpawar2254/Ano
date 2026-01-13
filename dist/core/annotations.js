/**
 * Annotation File Operations
 *
 * Handles reading, writing, and managing annotation sidecar files.
 * Sidecar files are stored as: <filename>.annotations.json
 */
import { readFile, writeFile, access } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { createAnchor } from './anchoring.js';
// ============================================
// Constants
// ============================================
const ANNOTATION_FILE_SUFFIX = '.annotations.json';
const SCHEMA_VERSION = '1.0';
// ============================================
// File Path Utilities
// ============================================
/**
 * Get the annotation sidecar file path for a source file.
 * Example: "plan.md" -> "plan.md.annotations.json"
 */
export function getAnnotationFilePath(sourceFilePath) {
    return sourceFilePath + ANNOTATION_FILE_SUFFIX;
}
/**
 * Check if an annotation file exists for a source file.
 */
export async function annotationFileExists(sourceFilePath) {
    const annotationPath = getAnnotationFilePath(sourceFilePath);
    try {
        await access(annotationPath);
        return true;
    }
    catch {
        return false;
    }
}
// ============================================
// Hashing Utilities
// ============================================
/**
 * Create a hash of file content for change detection.
 * Uses SHA-256, truncated for readability.
 */
export function hashContent(content) {
    return createHash('sha256').update(content).digest('hex').slice(0, 12);
}
// ============================================
// Read/Write Operations
// ============================================
/**
 * Read an annotation file. Returns null if it doesn't exist.
 */
export async function readAnnotationFile(sourceFilePath) {
    const annotationPath = getAnnotationFilePath(sourceFilePath);
    try {
        const content = await readFile(annotationPath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        // File doesn't exist or is invalid
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
/**
 * Write an annotation file.
 */
export async function writeAnnotationFile(sourceFilePath, data) {
    const annotationPath = getAnnotationFilePath(sourceFilePath);
    const content = JSON.stringify(data, null, 2);
    await writeFile(annotationPath, content, 'utf-8');
}
/**
 * Create a new, empty annotation file for a source file.
 */
export async function createAnnotationFile(sourceFilePath) {
    // Read source file to get hash
    const sourceContent = await readFile(sourceFilePath, 'utf-8');
    const fileHash = hashContent(sourceContent);
    const annotationFile = {
        version: SCHEMA_VERSION,
        file: sourceFilePath,
        fileHash,
        annotations: [],
        approvals: [],
    };
    await writeAnnotationFile(sourceFilePath, annotationFile);
    return annotationFile;
}
/**
 * Get or create an annotation file for a source file.
 */
export async function getOrCreateAnnotationFile(sourceFilePath) {
    const existing = await readAnnotationFile(sourceFilePath);
    if (existing) {
        return existing;
    }
    return createAnnotationFile(sourceFilePath);
}
// ============================================
// Annotation CRUD Operations
// ============================================
/**
 * Add a new annotation to a file.
 * Automatically creates the anchor with surrounding context.
 */
export async function addAnnotation(options) {
    const { file, line, endLine, type, author, content } = options;
    // Read source file to create anchor
    const sourceContent = await readFile(file, 'utf-8');
    const anchor = createAnchor(sourceContent, line, endLine);
    // Create the annotation
    const annotation = {
        id: randomUUID(),
        anchor,
        type,
        author,
        timestamp: new Date().toISOString(),
        content,
        status: 'open',
        replies: [],
    };
    // Add to annotation file
    const annotationFile = await getOrCreateAnnotationFile(file);
    annotationFile.annotations.push(annotation);
    await writeAnnotationFile(file, annotationFile);
    return annotation;
}
/**
 * Get a specific annotation by ID.
 */
export async function getAnnotation(sourceFilePath, annotationId) {
    const annotationFile = await readAnnotationFile(sourceFilePath);
    if (!annotationFile)
        return null;
    return annotationFile.annotations.find((a) => a.id === annotationId) || null;
}
/**
 * List annotations with optional filtering.
 */
export async function listAnnotations(sourceFilePath, filter) {
    const annotationFile = await readAnnotationFile(sourceFilePath);
    if (!annotationFile)
        return [];
    let annotations = annotationFile.annotations;
    if (filter) {
        if (filter.type) {
            annotations = annotations.filter((a) => a.type === filter.type);
        }
        if (filter.status) {
            annotations = annotations.filter((a) => a.status === filter.status);
        }
        if (filter.author) {
            annotations = annotations.filter((a) => a.author === filter.author);
        }
    }
    return annotations;
}
/**
 * Resolve (close) an annotation.
 */
export async function resolveAnnotation(sourceFilePath, annotationId) {
    const annotationFile = await readAnnotationFile(sourceFilePath);
    if (!annotationFile)
        return false;
    const annotation = annotationFile.annotations.find((a) => a.id === annotationId);
    if (!annotation)
        return false;
    annotation.status = 'resolved';
    await writeAnnotationFile(sourceFilePath, annotationFile);
    return true;
}
/**
 * Reopen a resolved annotation.
 */
export async function reopenAnnotation(sourceFilePath, annotationId) {
    const annotationFile = await readAnnotationFile(sourceFilePath);
    if (!annotationFile)
        return false;
    const annotation = annotationFile.annotations.find((a) => a.id === annotationId);
    if (!annotation)
        return false;
    annotation.status = 'open';
    await writeAnnotationFile(sourceFilePath, annotationFile);
    return true;
}
/**
 * Delete an annotation.
 */
export async function deleteAnnotation(sourceFilePath, annotationId) {
    const annotationFile = await readAnnotationFile(sourceFilePath);
    if (!annotationFile)
        return false;
    const index = annotationFile.annotations.findIndex((a) => a.id === annotationId);
    if (index === -1)
        return false;
    annotationFile.annotations.splice(index, 1);
    await writeAnnotationFile(sourceFilePath, annotationFile);
    return true;
}
/**
 * Add a reply to an annotation.
 */
export async function addReply(sourceFilePath, annotationId, author, content) {
    const annotationFile = await readAnnotationFile(sourceFilePath);
    if (!annotationFile)
        return null;
    const annotation = annotationFile.annotations.find((a) => a.id === annotationId);
    if (!annotation)
        return null;
    const reply = {
        id: randomUUID(),
        author,
        timestamp: new Date().toISOString(),
        content,
    };
    annotation.replies.push(reply);
    await writeAnnotationFile(sourceFilePath, annotationFile);
    return reply;
}
// ============================================
// Approval Operations
// ============================================
/**
 * Add or update an approval.
 */
export async function setApproval(sourceFilePath, author, status, title, comment) {
    const annotationFile = await getOrCreateAnnotationFile(sourceFilePath);
    // Find existing approval from this author
    const existingIndex = annotationFile.approvals.findIndex((a) => a.author === author);
    const approval = {
        author,
        title,
        status,
        timestamp: new Date().toISOString(),
        comment,
    };
    if (existingIndex >= 0) {
        annotationFile.approvals[existingIndex] = approval;
    }
    else {
        annotationFile.approvals.push(approval);
    }
    await writeAnnotationFile(sourceFilePath, annotationFile);
    return approval;
}
/**
 * Get all approvals for a file.
 */
export async function getApprovals(sourceFilePath) {
    const annotationFile = await readAnnotationFile(sourceFilePath);
    return annotationFile?.approvals || [];
}
/**
 * Check if a file has required approvals.
 * @param requiredCount - Minimum number of approvals needed
 */
export async function hasRequiredApprovals(sourceFilePath, requiredCount = 1) {
    const approvals = await getApprovals(sourceFilePath);
    const approvedCount = approvals.filter((a) => a.status === 'approved').length;
    return approvedCount >= requiredCount;
}
