/**
 * BaseModel - Foundation class for all data models
 * Provides validation, normalization, and serialization
 *
 * @module models/BaseModel
 */

export class BaseModel {
  /**
   * Create a model instance
   * @param {Object} data - Raw data to initialize model
   */
  constructor(data = {}) {
    this._raw = data;
    this._errors = [];
    this._init(data);
  }

  /**
   * Initialize model fields - override in subclasses
   * @private
   */
  _init(data) {
    // Override in subclass
  }

  /**
   * Get validation errors
   * @returns {Array<string>}
   */
  get errors() {
    return this._errors;
  }

  /**
   * Check if model is valid
   * @returns {boolean}
   */
  isValid() {
    this._errors = [];
    this._validate();
    return this._errors.length === 0;
  }

  /**
   * Validate model - override in subclasses
   * @private
   */
  _validate() {
    // Override in subclass
  }

  /**
   * Add validation error
   * @param {string} field - Field name
   * @param {string} message - Error message
   * @private
   */
  _addError(field, message) {
    this._errors.push({ field, message });
  }

  /**
   * Convert to plain object for API calls
   * @returns {Object}
   */
  toJSON() {
    const obj = {};
    for (const key in this) {
      if (key.startsWith('_')) continue; // Skip private properties
      obj[key] = this[key];
    }
    return obj;
  }

  /**
   * Convert to snake_case for backend
   * @returns {Object}
   */
  toSnakeCase() {
    const obj = this.toJSON();
    return this._convertKeys(obj, this._toSnakeCase);
  }

  /**
   * Get raw data
   * @returns {Object}
   */
  getRaw() {
    return this._raw;
  }

  /**
   * Convert string to snake_case
   * @private
   */
  _toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert string to camelCase
   * @private
   */
  _toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  /**
   * Recursively convert object keys
   * @private
   */
  _convertKeys(obj, converter) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this._convertKeys(item, converter));

    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = converter(key);
      converted[newKey] = this._convertKeys(value, converter);
    }
    return converted;
  }

  /**
   * Clone the model
   * @returns {BaseModel}
   */
  clone() {
    return new this.constructor(this.toJSON());
  }

  /**
   * Update model with new data
   * @param {Object} data - Data to update
   * @returns {this}
   */
  update(data) {
    this._init({ ...this.toJSON(), ...data });
    return this;
  }
}

export default BaseModel;
