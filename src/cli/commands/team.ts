/**
 * ano team commands
 *
 * Manage team configuration for collaborative reviews.
 *
 * Usage:
 *   ano team init [name]           Initialize team config
 *   ano team add <email> [options] Add a team member
 *   ano team remove <email>        Remove a team member
 *   ano team list                  List team members
 *   ano team roles                 List available roles
 */

import { Command } from 'commander';
import chalk from 'chalk';
import {
  readTeamConfig,
  initTeamConfig,
  addTeamMember,
  removeTeamMember,
  getConfigPath,
} from '../../core/team.js';
import { getGitIdentity } from '../../core/config.js';

// Create the team command group
export const teamCommand = new Command('team')
  .description('Manage team configuration');

// ============================================
// team init
// ============================================
teamCommand
  .command('init')
  .description('Initialize team configuration')
  .argument('[name]', 'Project name')
  .option('--add-me', 'Add yourself as the first member')
  .action(async (name: string | undefined, options: { addMe: boolean }) => {
    const created = await initTeamConfig(name);

    if (created) {
      console.log(chalk.green('Created .ano/config.json'));

      if (name) {
        console.log(chalk.dim(`  Project: ${name}`));
      }

      // Optionally add current user
      if (options.addMe) {
        const git = await getGitIdentity();
        if (git) {
          await addTeamMember({
            name: git.name,
            email: git.email,
            role: 'lead',
          });
          console.log(chalk.dim(`  Added: ${git.name} <${git.email}> as lead`));
        }
      }

      console.log();
      console.log('Next steps:');
      console.log(chalk.dim('  ano team add alice@example.com --name Alice --role reviewer'));
      console.log(chalk.dim('  ano team list'));
    } else {
      console.log(chalk.yellow('Team config already exists'));
      console.log(chalk.dim(`  ${getConfigPath()}`));
    }
  });

// ============================================
// team add
// ============================================
teamCommand
  .command('add')
  .description('Add a team member')
  .argument('<email>', 'Member email (matches git identity)')
  .option('-n, --name <name>', 'Display name', 'Unknown')
  .option('-r, --role <role>', 'Role (lead, reviewer, etc)', 'reviewer')
  .action(async (email: string, options: { name: string; role: string }) => {
    const result = await addTeamMember({
      name: options.name,
      email,
      role: options.role,
    });

    if (result.added) {
      console.log(chalk.green('Added team member'));
      console.log(chalk.dim(`  ${options.name} <${email}>`));
      console.log(chalk.dim(`  Role: ${options.role}`));
    } else {
      console.error(chalk.red('Failed to add member'));
      console.error(chalk.dim(`  ${result.reason}`));
      process.exit(1);
    }
  });

// ============================================
// team remove
// ============================================
teamCommand
  .command('remove')
  .description('Remove a team member')
  .argument('<email>', 'Member email to remove')
  .action(async (email: string) => {
    const result = await removeTeamMember(email);

    if (result.removed) {
      console.log(chalk.green('Removed team member'));
      console.log(chalk.dim(`  ${email}`));
    } else {
      console.error(chalk.red('Failed to remove member'));
      console.error(chalk.dim(`  ${result.reason}`));
      process.exit(1);
    }
  });

// ============================================
// team list
// ============================================
teamCommand
  .command('list')
  .description('List team members')
  .option('--json', 'Output as JSON')
  .action(async (options: { json: boolean }) => {
    const config = await readTeamConfig();

    if (!config) {
      console.log(chalk.yellow('No team config found'));
      console.log(chalk.dim('  Run: ano team init'));
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(config, null, 2));
      return;
    }

    // Header
    console.log();
    if (config.projectName) {
      console.log(chalk.bold(`  ${config.projectName}`));
    } else {
      console.log(chalk.bold('  Team Configuration'));
    }
    console.log();

    // Members
    if (config.members.length === 0) {
      console.log(chalk.dim('  No members yet'));
      console.log(chalk.dim('  Run: ano team add <email> --name "Name" --role reviewer'));
    } else {
      console.log('  Members:');
      for (const member of config.members) {
        const role = config.roles[member.role];
        const override = role?.canOverride ? chalk.yellow(' [can override]') : '';
        console.log(`    ${member.name} <${chalk.dim(member.email)}>`);
        console.log(`      ${chalk.cyan(member.role)}${override}`);
      }
    }

    // Requirements
    console.log();
    console.log('  Requirements:');
    console.log(`    Min approvals: ${config.requirements.minApprovals}`);
    if (config.requirements.minWeight) {
      console.log(`    Min weight: ${config.requirements.minWeight}`);
    }
    if (config.requirements.requiredRoles?.length) {
      console.log(`    Required roles: ${config.requirements.requiredRoles.join(', ')}`);
    }

    console.log();
  });

// ============================================
// team roles
// ============================================
teamCommand
  .command('roles')
  .description('List available roles')
  .action(async () => {
    const config = await readTeamConfig();

    if (!config) {
      console.log(chalk.yellow('No team config found'));
      console.log(chalk.dim('  Run: ano team init'));
      return;
    }

    console.log();
    console.log('  Available Roles:');
    console.log();

    for (const [name, role] of Object.entries(config.roles)) {
      const override = role.canOverride
        ? chalk.yellow('can override')
        : chalk.dim('cannot override');
      console.log(`    ${chalk.bold(name)}`);
      console.log(`      Weight: ${role.weight}, ${override}`);
    }

    console.log();
    console.log(chalk.dim('  To add a custom role, edit .ano/config.json'));
    console.log();
  });
