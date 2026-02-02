/**
 * Pond Forms Module
 * Export all pond-related form components.
 *
 * @module components/pond/forms
 */

// Core pond forms aligned with backend schema
export { default as AddPondForm } from './AddPondForm';
export { default as UpdatePondForm } from './UpdatePondForm';
export { default as WaterQualityForm } from './WaterQualityForm';

// Legacy forms (for backward compatibility)
export { default as PondForm } from './PondForm';
export { default as PondDailyUpdateForm } from './PondDailyUpdateForm';
export { default as TransformForm } from './TransformForm';

// New Quick Forms
export * from './quick';
