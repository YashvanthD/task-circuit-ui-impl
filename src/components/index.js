/**
 * Components Index
 * Central export point for all components.
 *
 * @module components
 */

// Dashboard components
export * from './dashboard';

// Task components
export * from './tasks';

// Pond components
export * from './pond';

// User management components
export * from './users';

// Sampling components
export * from './sampling';

// Report components
export * from './reports';

// Expense components
export * from './expenses';

// Assistant components
export * from './assistant';

// Common components
export * from './common';

// Legacy single-file components (for backward compatibility)
export { default as TaskCardLegacy } from './TaskCard';
export { default as PondCardLegacy } from './PondCard';
export { default as RoamingAssistantLegacy } from './RoamingAssistant';


