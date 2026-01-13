/**
 * ano approve command
 *
 * Add your approval to a file.
 *
 * Usage:
 *   ano approve <file> [options]
 *
 * Examples:
 *   ano approve plan.md
 *   ano approve plan.md --title "Tech Lead"
 *   ano approve plan.md --request-changes -m "Need more tests"
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'node:path';
import { setApproval, getApprovals } from '../../core/annotations.js';
import { getAuthorString, getUser } from '../../core/config.js';
// Create the command
export const approveCommand = new Command('approve')
    .description('Approve a file or request changes')
    .argument('<file>', 'File to approve')
    .option('-t, --title <title>', 'Your title/role (e.g., "Tech Lead")')
    .option('-m, --message <message>', 'Comment with your approval')
    .option('-r, --request-changes', 'Request changes instead of approving')
    .option('-c, --check [count]', 'Check if file has required approvals')
    .action(async (file, options) => {
    try {
        const filePath = resolve(file);
        // Check mode: just verify approvals
        if (options.check !== undefined) {
            const requiredCount = typeof options.check === 'string'
                ? parseInt(options.check, 10)
                : 1;
            await checkApprovals(filePath, requiredCount);
            return;
        }
        // Get user info
        const author = await getAuthorString();
        const user = await getUser();
        const title = options.title || user.title;
        // Determine status
        const status = options.requestChanges
            ? 'changes_requested'
            : 'approved';
        // Set approval
        const approval = await setApproval(filePath, author, status, title, options.message);
        // Output
        if (status === 'approved') {
            console.log(chalk.green('✓ Approved'));
        }
        else {
            console.log(chalk.yellow('⚠ Changes requested'));
        }
        console.log();
        console.log(`  ${chalk.bold('File:')}   ${file}`);
        console.log(`  ${chalk.bold('Author:')} ${author}${title ? chalk.dim(` (${title})`) : ''}`);
        if (options.message) {
            console.log(`  ${chalk.bold('Comment:')} ${options.message}`);
        }
        // Show approval summary
        console.log();
        const allApprovals = await getApprovals(filePath);
        const approvedCount = allApprovals.filter(a => a.status === 'approved').length;
        const changesCount = allApprovals.filter(a => a.status === 'changes_requested').length;
        console.log(chalk.dim(`  Total: ${approvedCount} approved, ${changesCount} changes requested`));
    }
    catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
    }
});
/**
 * Check if a file has required approvals.
 */
async function checkApprovals(filePath, requiredCount) {
    const approvals = await getApprovals(filePath);
    const approvedCount = approvals.filter(a => a.status === 'approved').length;
    const hasEnough = approvedCount >= requiredCount;
    if (hasEnough) {
        console.log(chalk.green(`✓ ${approvedCount}/${requiredCount} approvals received`));
    }
    else {
        console.log(chalk.red(`✗ ${approvedCount}/${requiredCount} approvals (need ${requiredCount - approvedCount} more)`));
        process.exit(1);
    }
    // List approvers
    if (approvals.length > 0) {
        console.log();
        for (const approval of approvals) {
            const icon = approval.status === 'approved'
                ? chalk.green('✓')
                : chalk.red('✗');
            const title = approval.title ? chalk.dim(` (${approval.title})`) : '';
            console.log(`  ${icon} ${approval.author}${title}`);
        }
    }
}
