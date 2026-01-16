/**
 * Components Index
 * Central export point for all components.
 *
 * @module components
 */

// ============================================================================
// NEW MODULAR COMPONENTS (Preferred - use these)
// ============================================================================

// Dashboard components
export * from './dashboard';

// Task components
export * from './tasks';

// Pond components (use PondCard, PondList, PondStats, etc. from here)
export * from './pond';

// User management components
export * from './users';

// Sampling components (use SamplingCard, SamplingList, SamplingStats from here)
export * from './sampling';

// Report components
export * from './reports';

// Expense components
export * from './expenses';

// Assistant components (new modular RoamingAssistant)
export * from './assistant';

// Common/shared components
export * from './common';

// ============================================================================
// LEGACY COMPONENTS (Still in use - will migrate to modular later)
// ============================================================================

export { default as TaskCard } from './TaskCard';
export { default as PondCard } from './PondCard';
export { default as RoamingAssistant } from './RoamingAssistant';
export { default as Fish } from './Fish';
export { default as Profile } from './Profile';
export { default as OrganizationTree } from './OrganizationTree';
