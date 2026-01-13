/**
 * Configuration Management
 *
 * Handles user identity and settings.
 * Uses git config for identity - no login required.
 */
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
/**
 * Get user identity from git config.
 * Falls back to system username if git not configured.
 */
export declare function getGitIdentity(): UserConfig;
/**
 * Get the current configuration.
 * Priority: local config > global config > git identity
 */
export declare function getConfig(): Promise<AnoConfig>;
/**
 * Get just the user identity (convenience function).
 */
export declare function getUser(): Promise<UserConfig>;
/**
 * Get the author string for annotations.
 * Format: "Name <email>"
 */
export declare function getAuthorString(): Promise<string>;
/**
 * Save configuration to the global config file.
 */
export declare function saveGlobalConfig(config: AnoConfig): Promise<void>;
/**
 * Save configuration to the local (project) config file.
 */
export declare function saveLocalConfig(config: AnoConfig): Promise<void>;
/**
 * Initialize config from git identity.
 * Optionally set a title.
 */
export declare function initConfigFromGit(title?: string, saveGlobally?: boolean): Promise<AnoConfig>;
