/**
 * User Utilities
 * Re-exports all user-related utilities from modular sub-files.
 *
 * Structure:
 * - user/cache.js      - Cache utilities (localStorage)
 * - user/settings.js   - Settings (theme, notifications, timezone)
 * - user/profile.js    - Profile (get, update, photo)
 * - user/management.js - User CRUD (list, create, update, delete)
 *
 * @module utils/user
 */

// Re-export everything from the modular user/ directory
export * from './user/index';
export { default } from './user/index';
