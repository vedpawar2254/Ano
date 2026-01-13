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
import { createHash } from 'node:crypto';
// ============================================
// Configuration
// ============================================
/**
 * How many context lines to store for anchor matching.
 * More lines = more accurate matching, but more storage.
 */
const CONTEXT_LINES = 2;
/**
 * Similarity threshold for fuzzy matching (0-1).
 * 1.0 = exact match only, 0.5 = 50% similarity required.
 */
const SIMILARITY_THRESHOLD = 0.6;
// ============================================
// Utility Functions
// ============================================
/**
 * Split file content into lines.
 */
function splitLines(content) {
    return content.split('\n');
}
/**
 * Get lines around a position.
 * Returns empty strings for out-of-bounds lines.
 */
function getContextLines(lines, lineNumber, count, direction) {
    const result = [];
    const index = lineNumber - 1; // Convert 1-indexed to 0-indexed
    for (let i = 1; i <= count; i++) {
        const targetIndex = direction === 'before' ? index - i : index + i;
        result.push(lines[targetIndex] || '');
    }
    return direction === 'before' ? result.reverse() : result;
}
/**
 * Hash a string for change detection.
 */
function hashString(str) {
    return createHash('sha256').update(str).digest('hex').slice(0, 12);
}
/**
 * Calculate similarity between two strings (0-1).
 * Uses Levenshtein distance normalized by max length.
 */
function calculateSimilarity(a, b) {
    if (a === b)
        return 1;
    if (a.length === 0 || b.length === 0)
        return 0;
    // Trim and normalize whitespace for comparison
    const normA = a.trim();
    const normB = b.trim();
    if (normA === normB)
        return 1;
    if (normA.length === 0 || normB.length === 0)
        return 0;
    // Simple character-based similarity
    const maxLen = Math.max(normA.length, normB.length);
    const distance = levenshteinDistance(normA, normB);
    return 1 - distance / maxLen;
}
/**
 * Calculate Levenshtein distance between two strings.
 */
function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j] + 1 // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}
// ============================================
// Anchor Creation
// ============================================
/**
 * Create an anchor for a specific line in a file.
 *
 * @param content - The full file content
 * @param line - The line number (1-indexed)
 * @param endLine - Optional end line for multi-line selections
 */
export function createAnchor(content, line, endLine) {
    const lines = splitLines(content);
    const targetLine = lines[line - 1] || '';
    // Get context lines
    const beforeLines = getContextLines(lines, line, CONTEXT_LINES, 'before');
    const afterLines = getContextLines(lines, endLine || line, CONTEXT_LINES, 'after');
    // Get the annotated content for hashing
    const annotatedLines = lines.slice(line - 1, (endLine || line));
    const annotatedContent = annotatedLines.join('\n');
    return {
        line,
        endLine,
        contextBefore: beforeLines.join('\n'),
        contextAfter: afterLines.join('\n'),
        contentHash: hashString(annotatedContent),
    };
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
export function relocateAnchor(anchor, newContent) {
    const lines = splitLines(newContent);
    // Fast path: check if original position still matches
    const originalMatch = checkPositionMatch(lines, anchor.line, anchor);
    if (originalMatch.score >= SIMILARITY_THRESHOLD) {
        return {
            found: true,
            newLine: anchor.line,
            newEndLine: anchor.endLine,
            confidence: originalMatch.score,
            contentChanged: originalMatch.contentChanged,
        };
    }
    // Search nearby lines first (within 20 lines)
    const searchRadius = 20;
    const nearbyResult = searchRange(lines, Math.max(1, anchor.line - searchRadius), Math.min(lines.length, anchor.line + searchRadius), anchor);
    if (nearbyResult.found) {
        return nearbyResult;
    }
    // Full file search as fallback
    return searchRange(lines, 1, lines.length, anchor);
}
/**
 * Check if a position matches the anchor's context.
 */
function checkPositionMatch(lines, lineNumber, anchor) {
    if (lineNumber < 1 || lineNumber > lines.length) {
        return { score: 0, contentChanged: true };
    }
    // Get context at this position
    const beforeLines = getContextLines(lines, lineNumber, CONTEXT_LINES, 'before');
    const afterLines = getContextLines(lines, lineNumber + (anchor.endLine ? anchor.endLine - anchor.line : 0), CONTEXT_LINES, 'after');
    const currentBefore = beforeLines.join('\n');
    const currentAfter = afterLines.join('\n');
    // Calculate similarity scores
    const beforeScore = calculateSimilarity(anchor.contextBefore, currentBefore);
    const afterScore = calculateSimilarity(anchor.contextAfter, currentAfter);
    // Weight before and after equally
    const contextScore = (beforeScore + afterScore) / 2;
    // Check if content changed
    const annotatedLines = lines.slice(lineNumber - 1, lineNumber + (anchor.endLine ? anchor.endLine - anchor.line : 0));
    const currentHash = hashString(annotatedLines.join('\n'));
    const contentChanged = currentHash !== anchor.contentHash;
    return { score: contextScore, contentChanged };
}
/**
 * Search a range of lines for the best anchor match.
 */
function searchRange(lines, startLine, endLine, anchor) {
    let bestMatch = {
        line: 0,
        score: 0,
        contentChanged: true,
    };
    for (let line = startLine; line <= endLine; line++) {
        const match = checkPositionMatch(lines, line, anchor);
        if (match.score > bestMatch.score) {
            bestMatch = {
                line,
                score: match.score,
                contentChanged: match.contentChanged,
            };
        }
    }
    if (bestMatch.score >= SIMILARITY_THRESHOLD) {
        const lineShift = bestMatch.line - anchor.line;
        return {
            found: true,
            newLine: bestMatch.line,
            newEndLine: anchor.endLine ? anchor.endLine + lineShift : undefined,
            confidence: bestMatch.score,
            contentChanged: bestMatch.contentChanged,
        };
    }
    return {
        found: false,
        confidence: bestMatch.score,
        contentChanged: true,
    };
}
// ============================================
// Bulk Relocation
// ============================================
/**
 * Relocate all annotations in a file to their new positions.
 * Returns updated annotations with new line numbers.
 */
export function relocateAnnotations(annotations, newContent) {
    return annotations.map((annotation) => {
        const relocation = relocateAnchor(annotation.anchor, newContent);
        let updatedAnchor;
        if (relocation.found && relocation.newLine) {
            // Create new anchor at the relocated position
            updatedAnchor = createAnchor(newContent, relocation.newLine, relocation.newEndLine);
        }
        return {
            annotation,
            relocation,
            updatedAnchor,
        };
    });
}
/**
 * Sync annotations with updated file content.
 * Updates anchor positions and detects orphaned annotations.
 */
export function syncAnnotations(annotations, newContent) {
    const results = relocateAnnotations(annotations, newContent);
    const synced = [];
    const orphaned = [];
    for (const result of results) {
        if (result.relocation.found && result.updatedAnchor) {
            // Update the annotation with new anchor
            synced.push({
                ...result.annotation,
                anchor: result.updatedAnchor,
            });
        }
        else {
            // Annotation couldn't be relocated
            orphaned.push(result.annotation);
        }
    }
    return { synced, orphaned };
}
