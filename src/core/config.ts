/**
 * Configuration Management
 *
 * Handles user identity and settings.
 * Uses git config for identity - no login required.
 */

import { execSync } from 'node:child_process';
import { readFile, writeFile, access } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

// ============================================
// Types
// ============================================

export interface UserConfig {
  /** User's display name */
  name: string;

  /** User's email */
  email: string;

  /** Optional title/role (e.g., "Tech Lead") */
  title?: string;
}

export interface AnoConfig {
  /** User identity */
  user: UserConfig;

  /** Default annotation type when not specified */
  defaultType?: 'concern' | 'question' | 'suggestion' | 'blocker';
}

// ============================================
// Git Identity
// ============================================

/**
 * Get user identity from git config.
 * Falls back to system username if git not configured.
 */
export function getGitIdentity(): UserConfig {
  try {
    const name = execSync('git config user.name', { encoding: 'utf-8' }).trim();
    const email = execSync('git config user.email', { encoding: 'utf-8' }).trim();

    if (name && email) {
      return { name, email };
    }
  } catch {
    // Git not available or not configured
  }

  // Fallback to system username
  const username = process.env.USER || process.env.USERNAME || 'anonymous';
  return {
    name: username,
    email: `${username}@localhost`,
  };
}

// ============================================
// Config File Management
// ============================================

const CONFIG_FILENAME = '.anorc.json';

/**
 * Get the path to the global config file.
 */
function getGlobalConfigPath(): string {
  return join(homedir(), CONFIG_FILENAME);
}

/**
 * Get the path to the local (project) config file.
 */
function getLocalConfigPath(): string {
  return join(process.cwd(), CONFIG_FILENAME);
}

/**
 * Check if a config file exists at the given path.
 */
async function configExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a config file.
 */
async function readConfigFile(path: string): Promise<AnoConfig | null> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as AnoConfig;
  } catch {
    return null;
  }
}

/**
 * Write a config file.
 */
async function writeConfigFile(path: string, config: AnoConfig): Promise<void> {
  const content = JSON.stringify(config, null, 2);
  await writeFile(path, content, 'utf-8');
}

// ============================================
// Public API
// ============================================

/**
 * Get the current configuration.
 * Priority: local config > global config > git identity
 */
export async function getConfig(): Promise<AnoConfig> {
  // Try local config first
  const localPath = getLocalConfigPath();
  if (await configExists(localPath)) {
    const local = await readConfigFile(localPath);
    if (local) return local;
  }

  // Try global config
  const globalPath = getGlobalConfigPath();
  if (await configExists(globalPath)) {
    const global = await readConfigFile(globalPath);
    if (global) return global;
  }

  // Fall back to git identity
  return {
    user: getGitIdentity(),
  };
}

/**
 * Get just the user identity (convenience function).
 */
export async function getUser(): Promise<UserConfig> {
  const config = await getConfig();
  return config.user;
}

/**
 * Get the author string for annotations.
 * Format: "Name <email>"
 */
export async function getAuthorString(): Promise<string> {
  const user = await getUser();
  return user.name;
}

/**
 * Save configuration to the global config file.
 */
export async function saveGlobalConfig(config: AnoConfig): Promise<void> {
  await writeConfigFile(getGlobalConfigPath(), config);
}

/**
 * Save configuration to the local (project) config file.
 */
export async function saveLocalConfig(config: AnoConfig): Promise<void> {
  await writeConfigFile(getLocalConfigPath(), config);
}

/**
 * Initialize config from git identity.
 * Optionally set a title.
 */
export async function initConfigFromGit(
  title?: string,
  saveGlobally: boolean = true
): Promise<AnoConfig> {
  const user = getGitIdentity();
  if (title) {
    user.title = title;
  }

  const config: AnoConfig = { user };

  if (saveGlobally) {
    await saveGlobalConfig(config);
  }

  return config;
}
