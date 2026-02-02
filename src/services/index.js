/**
 * Services Index
 * Centralized export for all service modules
 *
 * @module services
 */

// Services (API layer)
export * from './farmService';
export * from './pondService';
export * from './fishService';
export * from './userService';
export * from './stockService';
export * from './monitoringService';

// Note: Storage layers are imported directly where needed to avoid conflicts
// Import from './farmStorage', './pondStorage', etc. directly in your components
