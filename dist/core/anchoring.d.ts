/**
 * Content Anchoring System
 *
 * Annotations are attached to specific lines, but lines shift when files
 * are edited. This module handles:
 *
 * 1. Creating anchors - Store context around the annotated position
 * 2. Relocating anchors - Find where an annotation moved to
 *
 * The algorithm uses surrounding text context to relocate annotations
 * even when line numbers change.
 */
import type { Anchor, Annotation } from './types.js';
/**
 * Create an anchor for a specific line in a file.
 *
 * @param content - The full file content
 * @param line - The line number (1-indexed)
 * @param endLine - Optional end line for multi-line selections
 */
export declare function createAnchor(content: string, line: number, endLine?: number): Anchor;
/**
 * Result of anchor relocation attempt.
 */
export interface RelocationResult {
    /** Whether the anchor was successfully relocated */
    found: boolean;
    /** The new line number (if found) */
    newLine?: number;
    /** The new end line (if multi-line and found) */
    newEndLine?: number;
    /** Confidence score (0-1) */
    confidence: number;
    /** Whether the content at the location changed */
    contentChanged: boolean;
}
/**
 * Try to relocate an anchor in updated file content.
 *
 * Strategy:
 * 1. First, check if original line still matches (fast path)
 * 2. Search nearby lines for context match
 * 3. Search entire file if nearby search fails
 *
 * @param anchor - The anchor to relocate
 * @param newContent - The updated file content
 */
export declare function relocateAnchor(anchor: Anchor, newContent: string): RelocationResult;
/**
 * Relocate all annotations in a file to their new positions.
 * Returns updated annotations with new line numbers.
 */
export declare function relocateAnnotations(annotations: Annotation[], newContent: string): Array<{
    annotation: Annotation;
    relocation: RelocationResult;
    updatedAnchor?: Anchor;
}>;
/**
 * Sync annotations with updated file content.
 * Updates anchor positions and detects orphaned annotations.
 */
export declare function syncAnnotations(annotations: Annotation[], newContent: string): {
    synced: Annotation[];
    orphaned: Annotation[];
};
