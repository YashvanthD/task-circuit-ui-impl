/**
 * Common Forms Module
 * Export shared/generic form components.
 *
 * @module components/common/forms
 */

// ============================================================================
// Reusable Form Components (NEW - Use these for building all forms)
// ============================================================================
export { default as FormContainer } from './FormContainer';
export { default as FormSection } from './FormSection';
export { default as FormField } from './FormField';
export { default as FormDropdown } from './FormDropdown';
export { default as FormRadio } from './FormRadio';
export { default as FormFileUpload } from './FormFileUpload';
export { default as FormKeyValue } from './FormKeyValue';
export { default as FormRepeater } from './FormRepeater';
export { default as FormActions } from './FormActions';

// ============================================================================
// Legacy/Specific Forms
// ============================================================================
export { default as RegisterCompanyForm } from './RegisterCompanyForm';

// Re-export TransformForm from pond/forms for backward compatibility
// TransformForm has been moved to components/pond/forms as it's part of pond activities
export { TransformForm } from '../../pond/forms';

// Note: FishForm has been moved to components/fish/forms
// Import it from there: import { FishForm } from '../fish/forms' or from '../fish'

