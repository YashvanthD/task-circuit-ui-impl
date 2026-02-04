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

    // Return a Proxy to allow flexible access (camelCase <-> snake_case)
    return new Proxy(this, {
      get(target, prop, receiver) {
        // 1. Return if property exists on target
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }

        // 2. Try converting camelCase to snake_case (e.g. accountKey -> account_key)
        if (typeof prop === 'string' && !prop.startsWith('_')) {
          const snake = prop.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          if (snake in target) {
            return Reflect.get(target, snake, receiver);
          }
        }

        return undefined;
      },

      set(target, prop, value, receiver) {
        // 1. Set if property exists on target
        if (prop in target) {
          return Reflect.set(target, prop, value, receiver);
        }

        // 2. Try converting camelCase to snake_case and set that instead
        if (typeof prop === 'string' && !prop.startsWith('_')) {
          const snake = prop.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          if (snake in target) {
            return Reflect.set(target, snake, value, receiver);
          }
        }

        // 3. Default set behavior
        return Reflect.set(target, prop, value, receiver);
      }
    });
  }

  /**
   * Convert to camelCase for frontend use
   * @returns {Object}
   */
  toCamelCase() {
    const obj = this.toJSON();
    return this._convertKeys(obj, this._toCamelCase);
  }

  /**
   * Convert array of data to list of model instances
   * @param {Array} list - List of data objects
   * @returns {Array<BaseModel>}
   */
  static toList(list) {
    if (!Array.isArray(list)) return [];
    // 'this' refers to the class constructor when called as static method
    return list.map(item => new this(item));
  }

  /**
   * Initialize model fields - override in subclasses
   * @private
   */
  _init(data) {
    const schema = this.constructor.schema;
    if (schema) {
      this._initFromSchema(data, schema);
    }
    this._postInit(data);
  }

  /**
   * Post-initialization hook
   * @param {Object} data
   */
  _postInit(data) {
    // Override in subclass for custom logic after schema init
  }

  /**
   * Initialize from static schema definition
   * @param {Object} data - Raw data
   * @param {Object} schema - Schema definition
   */
  _initFromSchema(data, schema) {
    for (const [key, config] of Object.entries(schema)) {
      // 1. Resolve value from aliases
      let value = data[key];
      if (value === undefined && config.aliases) {
        for (const alias of config.aliases) {
          if (data[alias] !== undefined) {
            value = data[alias];
            break;
          }
        }
      }

      // 2. Apply defaults
      if (value === undefined || value === null) {
        if (config.default !== undefined) {
          value = typeof config.default === 'function' ? config.default(data) : config.default;
        }
      }

      // 3. Type Coercion / Parsing
      if (value !== undefined && value !== null) {
        if (config.parse) {
          value = config.parse(value, data);
        } else {
          switch (config.type) {
            case 'boolean':
              value = Boolean(value);
              break;
            case 'number':
              value = Number(value);
              break;
            case 'string':
              value = String(value);
              break;
            case 'date':
              value = value instanceof Date ? value : new Date(value);
              break;
            default:
              // 'array', 'object', 'any' preserve value
              break;
          }
        }
      }

      // 4. Assign
      this[key] = value;
    }
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
    const schema = this.constructor.schema;
    if (schema) {
      this._validateFromSchema(schema);
    }
  }

  /**
   * Validate based on schema
   * @param {Object} schema
   */
  _validateFromSchema(schema) {
    for (const [key, config] of Object.entries(schema)) {
      const value = this[key];

      // Required check
      if (config.required) {
        if (value === undefined || value === null || value === '') {
          this._addError(key, config.errorMessage || `${this._toCamelCase(key)} is required`);
        }
      }

      // Custom validator
      if (config.validate && !config.validate(value, this)) {
        this._addError(key, config.errorMessage || `Invalid value for ${this._toCamelCase(key)}`);
      }
    }
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
