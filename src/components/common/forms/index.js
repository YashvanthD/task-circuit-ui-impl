/**
 * Common Forms Module
 * Export shared/generic form components.
 *
 * @module components/common/forms
 */

export { default as RegisterCompanyForm } from './RegisterCompanyForm';

// Re-export TransformForm from pond/forms for backward compatibility
// TransformForm has been moved to components/pond/forms as it's part of pond activities
export { TransformForm } from '../../pond/forms';

// Note: FishForm has been moved to components/fish/forms
// Import it from there: import { FishForm } from '../fish/forms' or from '../fish'

