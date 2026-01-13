/**
 * Team Configuration Management
 *
 * Handles reading/writing team config from .ano/config.json
 * Advisory enforcement - shows warnings but doesn't block.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { TeamConfig, TeamMember, TeamRole } from './types.js';

// Default config file location
const CONFIG_DIR = '.ano';
const CONFIG_FILE = 'config.json';

/**
 * Get the path to the team config file
 */
export function getConfigPath(projectRoot: string = process.cwd()): string {
  return join(projectRoot, CONFIG_DIR, CONFIG_FILE);
}

/**
 * Get the .ano directory path
 */
export function getConfigDir(projectRoot: string = process.cwd()): string {
  return join(projectRoot, CONFIG_DIR);
}

/**
 * Default team configuration
 */
export function createDefaultConfig(projectName?: string): TeamConfig {
  return {
    version: '1.0',
    projectName,
    members: [],
    roles: {
      lead: { canOverride: true, weight: 2 },
      reviewer: { canOverride: false, weight: 1 },
    },
    requirements: {
      minApprovals: 1,
    },
  };
}

/**
 * Read team config from disk
 * Returns null if no config exists
 */
export async function readTeamConfig(
  projectRoot: string = process.cwd()
): Promise<TeamConfig | null> {
  const configPath = getConfigPath(projectRoot);

  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content) as TeamConfig;
  } catch {
    return null;
  }
}

/**
 * Write team config to disk
 */
export async function writeTeamConfig(
  config: TeamConfig,
  projectRoot: string = process.cwd()
): Promise<void> {
  const configDir = getConfigDir(projectRoot);
  const configPath = getConfigPath(projectRoot);

  // Ensure .ano directory exists
  if (!existsSync(configDir)) {
    await mkdir(configDir, { recursive: true });
  }

  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
}

/**
 * Initialize team config (create if doesn't exist)
 * Returns true if created, false if already exists
 */
export async function initTeamConfig(
  projectName?: string,
  projectRoot: string = process.cwd()
): Promise<boolean> {
  const existing = await readTeamConfig(projectRoot);

  if (existing) {
    return false; // Already exists
  }

  const config = createDefaultConfig(projectName);
  await writeTeamConfig(config, projectRoot);
  return true;
}

/**
 * Add a member to the team
 */
export async function addTeamMember(
  member: TeamMember,
  projectRoot: string = process.cwd()
): Promise<{ added: boolean; reason?: string }> {
  let config = await readTeamConfig(projectRoot);

  if (!config) {
    // Auto-init if no config
    config = createDefaultConfig();
  }

  // Check if member already exists (by email)
  const existing = config.members.find(
    (m) => m.email.toLowerCase() === member.email.toLowerCase()
  );

  if (existing) {
    return { added: false, reason: 'Member with this email already exists' };
  }

  // Validate role exists
  if (!config.roles[member.role]) {
    return {
      added: false,
      reason: `Unknown role: ${member.role}. Available: ${Object.keys(config.roles).join(', ')}`,
    };
  }

  config.members.push(member);
  await writeTeamConfig(config, projectRoot);

  return { added: true };
}

/**
 * Remove a member from the team (by email)
 */
export async function removeTeamMember(
  email: string,
  projectRoot: string = process.cwd()
): Promise<{ removed: boolean; reason?: string }> {
  const config = await readTeamConfig(projectRoot);

  if (!config) {
    return { removed: false, reason: 'No team config found. Run: ano team init' };
  }

  const index = config.members.findIndex(
    (m) => m.email.toLowerCase() === email.toLowerCase()
  );

  if (index === -1) {
    return { removed: false, reason: 'Member not found' };
  }

  config.members.splice(index, 1);
  await writeTeamConfig(config, projectRoot);

  return { removed: true };
}

/**
 * Find a team member by email
 */
export async function findTeamMember(
  email: string,
  projectRoot: string = process.cwd()
): Promise<TeamMember | null> {
  const config = await readTeamConfig(projectRoot);

  if (!config) {
    return null;
  }

  return (
    config.members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    ) || null
  );
}

/**
 * Check if an email belongs to a team member
 * Returns member info and their role permissions
 */
export async function checkTeamMembership(
  email: string,
  projectRoot: string = process.cwd()
): Promise<{
  isMember: boolean;
  member?: TeamMember;
  role?: TeamRole;
}> {
  const config = await readTeamConfig(projectRoot);

  if (!config) {
    return { isMember: false };
  }

  const member = config.members.find(
    (m) => m.email.toLowerCase() === email.toLowerCase()
  );

  if (!member) {
    return { isMember: false };
  }

  const role = config.roles[member.role];

  return {
    isMember: true,
    member,
    role,
  };
}

/**
 * Add a new role to the config
 */
export async function addTeamRole(
  roleName: string,
  role: TeamRole,
  projectRoot: string = process.cwd()
): Promise<{ added: boolean; reason?: string }> {
  const config = await readTeamConfig(projectRoot);

  if (!config) {
    return { added: false, reason: 'No team config found. Run: ano team init' };
  }

  if (config.roles[roleName]) {
    return { added: false, reason: 'Role already exists' };
  }

  config.roles[roleName] = role;
  await writeTeamConfig(config, projectRoot);

  return { added: true };
}

/**
 * Update approval requirements
 */
export async function setRequirements(
  requirements: Partial<TeamConfig['requirements']>,
  projectRoot: string = process.cwd()
): Promise<void> {
  const config = await readTeamConfig(projectRoot);

  if (!config) {
    throw new Error('No team config found. Run: ano team init');
  }

  config.requirements = { ...config.requirements, ...requirements };
  await writeTeamConfig(config, projectRoot);
}

/**
 * Get formatted team member status for an approver
 * Used in check/approve commands for advisory display
 */
export async function getApproverStatus(
  email: string,
  projectRoot: string = process.cwd()
): Promise<string> {
  const { isMember, member, role } = await checkTeamMembership(email, projectRoot);

  if (!isMember) {
    return '(not in team)';
  }

  const roleInfo = role?.canOverride ? `${member!.role}, can override` : member!.role;
  return `(${roleInfo})`;
}
