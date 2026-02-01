/**
 * Centralized Form Data Manager
 * Handles form state, validation, submission, and data loading
 * Provides a clean, consistent API for all forms
 *
 * @module utils/forms/formManager
 */

import { storageManager } from '../storage';

// ============================================================================
// Form Manager Class
// ============================================================================

export class FormManager {
  constructor(formName, initialData = {}, options = {}) {
    this.formName = formName;
    this.data = { ...initialData };
    this.initialData = { ...initialData };
    this.errors = {};
    this.touched = {};
    this.loading = false;
    this.submitting = false;
    this.submitError = null;
    this.options = {
      validateOnChange: true,
      validateOnBlur: true,
      resetAfterSubmit: false,
      cacheData: false,
      ...options,
    };
    this.validators = {};
    this.listeners = new Map();

    // Load from cache if enabled
    if (this.options.cacheData) {
      this.loadFromCache();
    }
  }

  // ==========================================================================
  // Data Methods
  // ==========================================================================

  /**
   * Set field value
   * @param {string} field - Field name
   * @param {any} value - Field value
   */
  setField(field, value) {
    this.data[field] = value;
    this.touched[field] = true;

    if (this.options.validateOnChange && this.validators[field]) {
      this.validateField(field);
    }

    if (this.options.cacheData) {
      this.saveToCache();
    }

    this.emit('change', { field, value });
  }

  /**
   * Set multiple fields at once
   * @param {object} fields - Object with field names as keys
   */
  setFields(fields) {
    Object.entries(fields).forEach(([field, value]) => {
      this.data[field] = value;
      this.touched[field] = true;
    });

    if (this.options.validateOnChange) {
      this.validate();
    }

    if (this.options.cacheData) {
      this.saveToCache();
    }

    this.emit('change', { fields });
  }

  /**
   * Get field value
   * @param {string} field - Field name
   * @param {any} [defaultValue=undefined] - Default value if field not set
   * @returns {any}
   */
  getField(field, defaultValue = undefined) {
    return this.data[field] !== undefined ? this.data[field] : defaultValue;
  }

  /**
   * Get all form data
   * @returns {object}
   */
  getData() {
    return { ...this.data };
  }

  /**
   * Set all form data
   * @param {object} data - Form data
   * @param {boolean} [markAsTouched=false] - Mark fields as touched
   */
  setData(data, markAsTouched = false) {
    this.data = { ...data };

    if (markAsTouched) {
      Object.keys(data).forEach(field => {
        this.touched[field] = true;
      });
    }

    if (this.options.cacheData) {
      this.saveToCache();
    }

    this.emit('dataSet', { data });
  }

  /**
   * Load data from API or source
   * @param {function} loader - Async function that returns data
   * @returns {Promise<object>}
   */
  async loadData(loader) {
    this.loading = true;
    this.emit('loadingStart');

    try {
      const data = await loader();
      this.setData(data);
      this.loading = false;
      this.emit('loadingEnd', { success: true, data });
      return data;
    } catch (error) {
      this.loading = false;
      this.emit('loadingEnd', { success: false, error });
      throw error;
    }
  }

  /**
   * Reset form to initial data
   */
  reset() {
    this.data = { ...this.initialData };
    this.errors = {};
    this.touched = {};
    this.submitError = null;

    if (this.options.cacheData) {
      this.clearCache();
    }

    this.emit('reset');
  }

  /**
   * Reset to new initial data
   * @param {object} data - New initial data
   */
  resetWith(data) {
    this.initialData = { ...data };
    this.reset();
  }

  /**
   * Check if form data has changed from initial
   * @returns {boolean}
   */
  isDirty() {
    return JSON.stringify(this.data) !== JSON.stringify(this.initialData);
  }

  // ==========================================================================
  // Validation Methods
  // ==========================================================================

  /**
   * Add validator for a field
   * @param {string} field - Field name
   * @param {function} validator - Validator function (returns error message or null)
   */
  addValidator(field, validator) {
    this.validators[field] = validator;
  }

  /**
   * Add multiple validators
   * @param {object} validators - Object with field names as keys and validator functions as values
   */
  addValidators(validators) {
    Object.entries(validators).forEach(([field, validator]) => {
      this.validators[field] = validator;
    });
  }

  /**
   * Validate a single field
   * @param {string} field - Field name
   * @returns {string|null} Error message or null
   */
  validateField(field) {
    const validator = this.validators[field];
    if (!validator) return null;

    const error = validator(this.data[field], this.data);

    if (error) {
      this.errors[field] = error;
    } else {
      delete this.errors[field];
    }

    this.emit('validated', { field, error });
    return error;
  }

  /**
   * Validate all fields
   * @returns {boolean} True if valid
   */
  validate() {
    this.errors = {};

    Object.keys(this.validators).forEach(field => {
      this.validateField(field);
    });

    const isValid = Object.keys(this.errors).length === 0;
    this.emit('validated', { isValid, errors: this.errors });
    return isValid;
  }

  /**
   * Check if form is valid
   * @returns {boolean}
   */
  isValid() {
    return Object.keys(this.errors).length === 0;
  }

  /**
   * Get field error
   * @param {string} field - Field name
   * @returns {string|null}
   */
  getError(field) {
    return this.errors[field] || null;
  }

  /**
   * Set field error
   * @param {string} field - Field name
   * @param {string} error - Error message
   */
  setError(field, error) {
    this.errors[field] = error;
    this.emit('error', { field, error });
  }

  /**
   * Set multiple errors
   * @param {object} errors - Object with field names as keys and error messages as values
   */
  setErrors(errors) {
    this.errors = { ...this.errors, ...errors };
    this.emit('errors', { errors });
  }

  /**
   * Clear field error
   * @param {string} field - Field name
   */
  clearError(field) {
    delete this.errors[field];
    this.emit('errorCleared', { field });
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = {};
    this.emit('errorsCleared');
  }

  // ==========================================================================
  // Submission Methods
  // ==========================================================================

  /**
   * Submit form
   * @param {function} submitter - Async function that submits the data
   * @returns {Promise<any>}
   */
  async submit(submitter) {
    // Validate first
    if (!this.validate()) {
      this.emit('submitFailed', { reason: 'validation', errors: this.errors });
      throw new Error('Form validation failed');
    }

    this.submitting = true;
    this.submitError = null;
    this.emit('submitting', { data: this.data });

    try {
      const result = await submitter(this.data);
      this.submitting = false;

      if (this.options.resetAfterSubmit) {
        this.reset();
      }

      this.emit('submitted', { success: true, result });
      return result;
    } catch (error) {
      this.submitting = false;
      this.submitError = error.message || 'Submission failed';
      this.emit('submitted', { success: false, error });
      throw error;
    }
  }

  // ==========================================================================
  // Field Touch Methods
  // ==========================================================================

  /**
   * Mark field as touched
   * @param {string} field - Field name
   */
  touch(field) {
    this.touched[field] = true;

    if (this.options.validateOnBlur && this.validators[field]) {
      this.validateField(field);
    }

    this.emit('touched', { field });
  }

  /**
   * Check if field is touched
   * @param {string} field - Field name
   * @returns {boolean}
   */
  isTouched(field) {
    return !!this.touched[field];
  }

  /**
   * Mark all fields as touched
   */
  touchAll() {
    Object.keys(this.data).forEach(field => {
      this.touched[field] = true;
    });
    this.emit('touchedAll');
  }

  // ==========================================================================
  // Cache Methods
  // ==========================================================================

  /**
   * Save form data to cache
   */
  saveToCache() {
    if (!this.options.cacheData) return;
    storageManager.set(`form_${this.formName}`, this.data);
  }

  /**
   * Load form data from cache
   */
  loadFromCache() {
    if (!this.options.cacheData) return;
    const cached = storageManager.get(`form_${this.formName}`);
    if (cached) {
      this.setData(cached);
    }
  }

  /**
   * Clear form data from cache
   */
  clearCache() {
    if (!this.options.cacheData) return;
    storageManager.remove(`form_${this.formName}`);
  }

  // ==========================================================================
  // Event System
  // ==========================================================================

  /**
   * Subscribe to form events
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      this.listeners.get(event).delete(callback);
    };
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[FormManager] Event listener error (${event}):`, error);
        }
      });
    }
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a form manager instance
 * @param {string} formName - Form name
 * @param {object} initialData - Initial form data
 * @param {object} options - Form options
 * @returns {FormManager}
 */
export function createFormManager(formName, initialData = {}, options = {}) {
  return new FormManager(formName, initialData, options);
}

/**
 * Common validators
 */
export const validators = {
  required: (message = 'This field is required') => (value) => {
    if (value === null || value === undefined || value === '') {
      return message;
    }
    return null;
  },

  email: (message = 'Invalid email address') => (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : message;
  },

  minLength: (min, message = `Minimum length is ${min} characters`) => (value) => {
    if (!value) return null;
    return value.length >= min ? null : message;
  },

  maxLength: (max, message = `Maximum length is ${max} characters`) => (value) => {
    if (!value) return null;
    return value.length <= max ? null : message;
  },

  pattern: (regex, message = 'Invalid format') => (value) => {
    if (!value) return null;
    return regex.test(value) ? null : message;
  },

  min: (min, message = `Value must be at least ${min}`) => (value) => {
    if (value === null || value === undefined) return null;
    return Number(value) >= min ? null : message;
  },

  max: (max, message = `Value must be at most ${max}`) => (value) => {
    if (value === null || value === undefined) return null;
    return Number(value) <= max ? null : message;
  },

  custom: (validatorFn, message = 'Invalid value') => (value, allData) => {
    return validatorFn(value, allData) ? null : message;
  },
};

export default FormManager;
