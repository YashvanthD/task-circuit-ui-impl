/**
 * Fish Utilities
 * Re-exports all fish-related utilities from modular sub-files.
 *
 * Structure:
 * - fish/cache.js - Cache utilities (localStorage)
 * - fish/api.js   - API operations (CRUD)
 *
 * @module utils/fish
 */

// Re-export everything from the modular fish/ directory
export * from './fish/index';
export { default } from './fish/index';
