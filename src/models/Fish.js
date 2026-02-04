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

  static get schema() {
    return {
      // IDs
      fish_id: { type: 'string', aliases: ['species_id', 'speciesId', 'fishId', 'id', '_id'] },
      species_id: { type: 'string', aliases: ['fish_id', 'fishId', 'id'] },
      account_key: { type: 'string', aliases: ['accountKey'] },

      // Names
      common_name: {
        type: 'string',
        required: true,
        errorMessage: 'Common name is required',
        aliases: ['commonName', 'name'],
        default: ''
      },
      scientific_name: { type: 'string', aliases: ['scientificName'], default: '' },
      local_name: { type: 'string', aliases: ['localName'], default: '' },
      category: { type: 'string', default: '' },

      // Quantities
      count: {
        type: 'number',
        aliases: ['total_count', 'totalCount'],
        default: 0,
        validate: (val) => val === undefined || val === null || val >= 0,
        errorMessage: 'Count must be a positive number'
      },
      average_weight: {
        type: 'number',
        aliases: ['averageWeight', 'avg_weight', 'avgWeight'],
        default: 0,
        validate: (val) => val === undefined || val === null || val >= 0,
        errorMessage: 'Average weight must be positive'
      },
      min_weight: { type: 'number', aliases: ['minWeight'], default: 0 },
      max_weight: { type: 'number', aliases: ['maxWeight'], default: 0 },

      // Location
      ponds: { type: 'array', default: [] },

      // Dates
      capture_date: { type: 'string', aliases: ['captureDate'], default: '' },
      stock_date: { type: 'string', aliases: ['stockDate'], default: '' },

      // Status & Source
      status: { type: 'string', default: 'active' },
      source: { type: 'string', default: '' },
      notes: { type: 'string', default: '' },

      // Pricing
      price_per_kg: { type: 'number', aliases: ['pricePerKg'], default: 0 },

      // Meta
      custom_fields: { type: 'object', aliases: ['customFields'], default: {} },
      is_active: { type: 'boolean', aliases: ['isActive'], default: true },
      metadata: { type: 'object', default: {} },
      created_by: { type: 'string', aliases: ['createdBy'], default: '' },
      created_at: { type: 'string', aliases: ['createdAt'], default: '' },
      updated_at: { type: 'string', aliases: ['updatedAt'], default: '' },
    };
  }

  /**
   * Post-init hook to derive species_name
   */
  _postInit() {
    this.species_name = this.common_name || this.scientific_name || this.local_name;
    // ensure IDs are synced
    if (!this.fish_id && this.species_id) this.fish_id = this.species_id;
    if (!this.species_id && this.fish_id) this.species_id = this.fish_id;
  }

  /**
   * Validate - handled by schema now, but keeping custom override if needed
   * @private
   */
  _validate() {
    super._validate();
  }

  /**
   * Convert to API payload format
   * @returns {Object}
   */
  toAPIPayload() {
    const payload = {
      name: this.common_name, // Backend requires 'name'
      common_name: this.common_name,
      scientific_name: this.scientific_name || undefined,
      local_name: this.local_name || undefined
    };

    if (this.category) {
      payload.category = this.category;
    }

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
