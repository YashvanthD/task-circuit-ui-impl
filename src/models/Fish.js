/**
 * Fish Model
 * Represents a fish/species entity with validation and storage
 *
 * @module models/Fish
 */

import { BaseModel } from './BaseModel';

export class Fish extends BaseModel {
  /**
   * Default form values for creating a new fish record
   */
  static getDefaultFormData() {
    return {
      common_name: '',
      scientific_name: '',
      local_name: '',
      count: '',
      average_weight: '',
      min_weight: '',
      max_weight: '',
      ponds: [],
      capture_date: '',
      stock_date: '',
      status: 'active',
      source: '',
      notes: '',
      price_per_kg: ''
    };
  }

  /**
   * Initialize fish fields
   * @private
   */
  _init(data) {
    // Handle both old fish_id and new species_id (snake_case and camelCase)
    this.fish_id = data.species_id || data.speciesId || data.fish_id || data.fishId || data.id || '';
    this.species_id = data.species_id || data.speciesId || data.fish_id || data.fishId || data.id || '';
    this.account_key = data.account_key || data.accountKey || '';

    // Names (snake_case and camelCase)
    this.common_name = data.common_name || data.commonName || data.name || '';
    this.scientific_name = data.scientific_name || data.scientificName || '';
    this.local_name = data.local_name || data.localName || '';
    this.category = data.category || '';
    this.species_name = this.common_name || this.scientific_name || this.local_name;

    // Quantities and measurements (snake_case and camelCase)
    this.count = data.count || data.total_count || data.totalCount || 0;
    this.average_weight = data.average_weight || data.averageWeight || data.avg_weight || data.avgWeight || 0;
    this.min_weight = data.min_weight || data.minWeight || 0;
    this.max_weight = data.max_weight || data.maxWeight || 0;

    // Location
    this.ponds = data.ponds || [];

    // Dates (snake_case and camelCase)
    this.capture_date = data.capture_date || data.captureDate || '';
    this.stock_date = data.stock_date || data.stockDate || '';

    // Status and source
    this.status = data.status || 'active';
    this.source = data.source || '';
    this.notes = data.notes || '';

    // Pricing (snake_case and camelCase)
    this.price_per_kg = data.price_per_kg || data.pricePerKg || 0;

    // Custom fields (snake_case and camelCase)
    this.custom_fields = data.custom_fields || data.customFields || {};

    // Metadata (snake_case and camelCase)
    this.is_active = data.is_active !== undefined ? data.is_active :
                     data.isActive !== undefined ? data.isActive : true;
    this.metadata = data.metadata || {};
    this.created_by = data.created_by || data.createdBy || '';
    this.created_at = data.created_at || data.createdAt || '';
    this.updated_at = data.updated_at || data.updatedAt || '';
  }

  /**
   * Validate fish data
   * @private
   */
  _validate() {
    if (!this.common_name || this.common_name.trim() === '') {
      this._addError('common_name', 'Common name is required');
    }

    if (this.count !== null && this.count < 0) {
      this._addError('count', 'Count must be a positive number');
    }

    if (this.average_weight !== null && this.average_weight < 0) {
      this._addError('average_weight', 'Average weight must be positive');
    }
  }

  /**
   * Convert to API payload format
   * @returns {Object}
   */
  toAPIPayload() {
    const payload = {
      common_name: this.common_name,
      scientific_name: this.scientific_name || undefined,
      local_name: this.local_name || undefined
    };

    if (this.count) {
      payload.count = Number(this.count);
    }

    if (this.average_weight) {
      payload.average_weight = Number(this.average_weight);
    }

    if (this.min_weight) {
      payload.min_weight = Number(this.min_weight);
    }

    if (this.max_weight) {
      payload.max_weight = Number(this.max_weight);
    }

    if (this.ponds && this.ponds.length > 0) {
      payload.ponds = this.ponds.map(p => typeof p === 'object' ? (p.id || p.pond_id) : p);
    }

    if (this.capture_date) {
      payload.capture_date = this.capture_date;
    }

    if (this.stock_date) {
      payload.stock_date = this.stock_date;
    }

    if (this.status) {
      payload.status = this.status;
    }

    if (this.source) {
      payload.source = this.source;
    }

    if (this.notes) {
      payload.notes = this.notes;
    }

    if (this.price_per_kg) {
      payload.price_per_kg = Number(this.price_per_kg);
    }

    if (this.custom_fields && Object.keys(this.custom_fields).length > 0) {
      payload.custom_fields = this.custom_fields;
    }

    return payload;
  }

  /**
   * Create from form data
   * @param {Object} formData - Form data
   * @returns {Fish}
   */
  static fromFormData(formData) {
    return new Fish(formData);
  }

  /**
   * Get fish ID safely (handles both species_id and fish_id)
   * @returns {string}
   */
  getFishId() {
    return String(
      this.species_id ||
      this.fish_id ||
      this._raw?.species_id ||
      this._raw?.fish_id ||
      this.id ||
      this._raw?.id ||
      ''
    );
  }

  /**
   * Get fish name safely
   * @returns {string}
   */
  getFishName() {
    return this.common_name || this._raw?.common_name || this.name || this._raw?.name || 'Unnamed Fish';
  }

  /**
   * Check if fish has a valid ID
   * @returns {boolean}
   */
  hasValidId() {
    const id = this.getFishId();
    return id !== '' && id !== 'undefined' && id !== 'null';
  }

  /**
   * Get display name
   * @returns {string}
   */
  getDisplayName() {
    const commonName = this.getFishName();
    const scientificName = this.scientific_name || this._raw?.scientific_name;
    return scientificName ? `${commonName} (${scientificName})` : commonName;
  }

  /**
   * Convert fish to option format for dropdowns
   * @returns {Object}
   */
  toOption() {
    return {
      id: this.getFishId(),
      label: this.getDisplayName(),
      value: this.getFishId()
    };
  }

  /**
   * Get total weight
   * @returns {number}
   */
  getTotalWeight() {
    return this.count * this.average_weight;
  }

  /**
   * Get status display
   * @returns {string}
   */
  getStatusDisplay() {
    const statusMap = {
      'active': 'Active',
      'inactive': 'Inactive',
      'harvested': 'Harvested',
      'sold': 'Sold'
    };
    return statusMap[this.status] || this.status;
  }

  /**
   * Create dropdown label for fish/species
   * @param {Object} options - Label options
   * @param {boolean} options.showScientific - Include scientific name (default: true)
   * @param {boolean} options.showId - Include species ID (default: false)
   * @param {boolean} options.showLocal - Include local name (default: false)
   * @param {boolean} options.showCategory - Include category (default: false)
   * @param {string} options.delimiter - Separator between parts (default: " | ")
   * @returns {string}
   */
  getDropdownLabel(options = {}) {
    const {
      showScientific = true,
      showId = false,
      showLocal = false,
      showCategory = false,
      delimiter = ' | '
    } = options;

    const parts = [];

    // Always include common name first
    parts.push(this.common_name || 'Unnamed Species');

    if (showScientific && this.scientific_name) {
      parts.push(this.scientific_name);
    }

    if (showLocal && this.local_name) {
      parts.push(this.local_name);
    }

    if (showId && (this.species_id || this.fish_id)) {
      parts.push(this.species_id || this.fish_id);
    }

    if (showCategory && this.category) {
      parts.push(this.category);
    }

    return parts.join(delimiter);
  }

  /**
   * Convert fish array to dropdown options with flexible labeling
   * @param {Array<Fish>} fishList - Array of fish instances or plain objects
   * @param {Object} labelOptions - Options for label formatting
   * @returns {Array<Object>} Array of {id, species_id, label, raw} objects
   */
  static toDropdownOptions(fishList, labelOptions = {}) {
    if (!Array.isArray(fishList)) return [];

    return fishList.map(fish => {
      // If it's already a Fish instance, use getDropdownLabel
      if (fish instanceof Fish) {
        // Get ID - handle empty strings properly
        // Check if direct property exists and is not empty string
        let fishId = (fish.species_id && fish.species_id !== '') ? fish.species_id :
                     (fish.fish_id && fish.fish_id !== '') ? fish.fish_id :
                     (fish.id && fish.id !== '') ? fish.id : '';

        // If still empty, check _raw
        if (!fishId || fishId === '') {
          fishId = fish._raw?.species_id || fish._raw?.speciesId || fish._raw?.fish_id || fish._raw?.fishId || fish._raw?.id || '';
        }

        return {
          id: fishId,
          species_id: fishId,
          label: fish.getDropdownLabel(labelOptions),
          raw: fish
        };
      }

      // For plain objects, manually build label
      const {
        showScientific = true,
        showId = false,
        showLocal = false,
        showCategory = false,
        delimiter = ' | '
      } = labelOptions;

      const parts = [];
      parts.push(fish.common_name || fish.name || 'Unnamed Species');

      if (showScientific && fish.scientific_name) {
        parts.push(fish.scientific_name);
      }

      if (showLocal && fish.local_name) {
        parts.push(fish.local_name);
      }

      if (showId && (fish.species_id || fish.fish_id)) {
        parts.push(fish.species_id || fish.fish_id);
      }

      if (showCategory && fish.category) {
        parts.push(fish.category);
      }

      return {
        id: fish.species_id || fish.speciesId || fish.fish_id || fish.fishId || fish.id,
        species_id: fish.species_id || fish.speciesId || fish.fish_id || fish.fishId || fish.id,
        label: parts.join(delimiter),
        raw: fish
      };
    });
  }

  /**
   * Convert fish array to dropdown options
   * @param {Fish[]} fishList - Array of Fish instances
   * @returns {Array<{id: string, label: string, value: string}>}
   */
  static toOptions(fishList) {
    if (!Array.isArray(fishList)) return [];
    return fishList.map(fish => fish.toOption());
  }

  /**
   * Convert fish array to list of Fish instances
   * @param {Array} fishList - Array of fish data
   * @returns {Array<Fish>}
   */
  static toList(fishList) {
    if (!Array.isArray(fishList)) return [];
    return fishList.map(data => new Fish(data));
  }

  /**
   * Extract fish from various API response formats
   * @param {Object} response - API response
   * @returns {Array<Fish>}
   */
  static fromAPIResponse(response) {
    let data = [];

    if (Array.isArray(response)) {
      data = response;
    } else if (response?.data?.species) {
      data = response.data.species;
    } else if (response?.species) {
      data = response.species;
    } else if (response?.data?.fish) {
      data = response.data.fish;
    } else if (response?.fish) {
      data = response.fish;
    } else if (response?.data) {
      data = Array.isArray(response.data) ? response.data : [response.data];
    }

    return Fish.toList(data);
  }
}

export default Fish;
