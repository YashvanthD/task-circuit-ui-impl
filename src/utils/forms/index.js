/**
 * Forms Module Index
 * Export centralized form utilities
 *
 * @module utils/forms
 */

import { FormManager, createFormManager, validators } from './formManager';

// Re-export FormManager, createFormManager, and validators
export { FormManager, createFormManager, validators };

// Re-export validators for convenience
export const required = validators?.required;
export const email = validators?.email;
export const minLength = validators?.minLength;
export const maxLength = validators?.maxLength;
export const pattern = validators?.pattern;
export const min = validators?.min;
export const max = validators?.max;
export const custom = validators?.custom;
