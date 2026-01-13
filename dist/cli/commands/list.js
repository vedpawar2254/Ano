/**
 * ano list command
 *
 * List annotations for a file.
 *
 * Usage:
 *   ano list <file> [options]
 *
 * Examples:
 *   ano list plan.md
 *   ano list plan.md --status open
 *   ano list plan.md --type concern
 *   ano list plan.md --author ved
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { listAnnotations, getApprovals } from '../../core/annotations.js';
// Create the command
export const listCommand = new Command('list')
    .description('List annotations for a file')
    .argument('<file>', 'File to list annotations for')
    .option('-s, --status <status>', 'Filter by status: open, resolved')
    .option('-t, --type <type>', 'Filter by type: concern, question, suggestion, blocker')
    .option('-a, --author <author>', 'Filter by author')
    .option('--json', 'Output as JSON')
    .action(async (file, options) => {
    try {
        const filePath = resolve(file);
        // Build filter
        const filter = {};
        if (options.status) {
            filter.status = options.status;
        }
        if (options.type) {
            filter.type = options.type;
        }
        if (options.author) {
            filter.author = options.author;
        }
        // Get annotations and approvals
        const annotations = await listAnnotations(filePath, filter);
        const approvals = await getApprovals(filePath);
        // JSON output
        if (options.json) {
            console.log(JSON.stringify({ annotations, approvals }, null, 2));
            return;
        }
        // Human-readable output
        printHeader(file, annotations, approvals);
        printApprovals(approvals);
        printAnnotations(annotations);
    }
    catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
    }
});
/**
 * Print the header with summary.
 */
function printHeader(file, annotations, approvals) {
    const open = annotations.filter(a => a.status === 'open').length;
    const resolved = annotations.filter(a => a.status === 'resolved').length;
    const approved = approvals.filter(a => a.status === 'approved').length;
    console.log();
    console.log(chalk.bold(`  ${file}`));
    console.log(chalk.dim(`  ${open} open, ${resolved} resolved, ${approved} approvals`));
    console.log();
}
/**
 * Print approvals section.
 */
function printApprovals(approvals) {
    if (approvals.length === 0)
        return;
    console.log(chalk.bold('  Approvals'));
    console.log();
    for (const approval of approvals) {
        const icon = approval.status === 'approved'
            ? chalk.green('✓')
            : approval.status === 'changes_requested'
                ? chalk.red('✗')
                : chalk.dim('○');
        const title = approval.title ? chalk.dim(` (${approval.title})`) : '';
        console.log(`  ${icon} ${approval.author}${title}`);
    }
    console.log();
}
/**
 * Print annotations list.
 */
function printAnnotations(annotations) {
    if (annotations.length === 0) {
        console.log(chalk.dim('  No annotations found'));
        console.log();
        return;
    }
    console.log(chalk.bold('  Annotations'));
    console.log();
    for (const annotation of annotations) {
        printAnnotation(annotation);
    }
}
/**
 * Print a single annotation.
 */
function printAnnotation(annotation) {
    const { anchor, type, author, content, status, id, replies } = annotation;
    // Status icon
    const statusIcon = status === 'open' ? chalk.yellow('●') : chalk.dim('○');
    // Type badge
    const typeBadge = formatTypeBadge(type);
    // Line reference
    const lineRef = anchor.endLine
        ? `L${anchor.line}-${anchor.endLine}`
        : `L${anchor.line}`;
    // Short ID
    const shortId = chalk.dim(`#${id.slice(0, 8)}`);
    // Print annotation
    console.log(`  ${statusIcon} ${typeBadge} ${chalk.cyan(lineRef)} ${shortId}`);
    console.log(`    ${chalk.bold(author)}: ${content}`);
    // Print replies
    if (replies.length > 0) {
        for (const reply of replies) {
            console.log(`    ${chalk.dim('└─')} ${reply.author}: ${reply.content}`);
        }
    }
    console.log();
}
/**
 * Format annotation type as colored badge.
 */
function formatTypeBadge(type) {
    switch (type) {
        case 'concern':
            return chalk.bgYellow.black(' concern ');
        case 'question':
            return chalk.bgBlue.white(' question ');
        case 'suggestion':
            return chalk.bgGreen.black(' suggestion ');
        case 'blocker':
            return chalk.bgRed.white(' blocker ');
        default:
            return type;
    }
}
