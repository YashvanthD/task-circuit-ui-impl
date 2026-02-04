/**
 * Farm Model
 * Represents a farm entity with validation and storage
 *
 * @module models/Farm
 */

import { BaseModel } from './BaseModel';

export class Farm extends BaseModel {
  /**
   * Default form values for creating a new farm
   */
  static getDefaultFormData() {
    return {
      name: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      latitude: '',
      longitude: '',
      area_acres: '',
      water_source: ''
    };
  }

  static get schema() {
    return {
      farm_id: { type: 'string', aliases: ['farmId', 'id'] },
      account_key: { type: 'string', aliases: ['accountKey'] },
      name: {
        type: 'string',
        required: true,
        errorMessage: 'Farm name is required',
        default: ''
      },
      location: {
        type: 'object',
        default: {},
        parse: (val, data) => {
          const loc = val || {};
          const coords = loc.coordinates || {};
          return {
            address: loc.address || data.address || '',
            city: loc.city || data.city || '',
            state: loc.state || data.state || '',
            country: loc.country || data.country || 'India',
            pincode: loc.pincode || data.pincode || '',
            coordinates: {
              lat: coords.lat !== undefined ? coords.lat : (data.latitude || null),
              lng: coords.lng !== undefined ? coords.lng : (data.longitude || null)
            }
          };
        }
      },
      area_acres: {
        type: 'number',
        aliases: ['areaAcres'],
        validate: (val) => val === undefined || val === null || val >= 0,
        errorMessage: 'Area must be a positive number'
      },
      water_source: { type: 'string', aliases: ['waterSource'], default: '' },
      pond_count: { type: 'number', aliases: ['pondCount'], default: 0 },
      is_active: { type: 'boolean', aliases: ['isActive'], default: true },
      metadata: { type: 'object', default: {} },
      created_by: { type: 'string', aliases: ['createdBy'], default: '' },
      created_at: { type: 'string', aliases: ['createdAt'], default: '' },
      updated_at: { type: 'string', aliases: ['updatedAt'], default: '' },
    };
  }

  /**
   * Validate farm data
   * @private
   */
  _validate() {
    super._validate();

    // Validate coordinates if provided
    if (this.location?.coordinates?.lat !== null) {
      const lat = parseFloat(this.location.coordinates.lat);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        this._addError('latitude', 'Latitude must be between -90 and 90');
      }
    }

    if (this.location?.coordinates?.lng !== null) {
      const lng = parseFloat(this.location.coordinates.lng);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        this._addError('longitude', 'Longitude must be between -180 and 180');
      }
    }
  }


  /**
   * Convert to API payload format
   * @returns {Object}
   */
  toAPIPayload() {
    const payload = {
      name: this.name
    };

    // Add location if any field is filled
    if (this.location.address || this.location.city || this.location.state ||
        this.location.country || this.location.pincode ||
        this.location.coordinates.lat || this.location.coordinates.lng) {

      payload.location = {
        address: this.location.address || undefined,
        city: this.location.city || undefined,
        state: this.location.state || undefined,
        country: this.location.country || undefined,
        pincode: this.location.pincode || undefined
      };

      if (this.location.coordinates.lat && this.location.coordinates.lng) {
        payload.location.coordinates = {
          lat: parseFloat(this.location.coordinates.lat),
          lng: parseFloat(this.location.coordinates.lng)
        };
      }
    }

    if (this.area_acres) {
      payload.area_acres = parseFloat(this.area_acres);
    }

    if (this.water_source) {
      payload.water_source = this.water_source;
    }

    return payload;
  }

  /**
   * Create from form data
   * @param {Object} formData - Form data
   * @returns {Farm}
   */
  static fromFormData(formData) {
    return new Farm({
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode,
      latitude: formData.latitude,
      longitude: formData.longitude,
      area_acres: formData.area_acres,
      water_source: formData.water_source
    });
  }

  /**
   * Get farm ID safely (handles both direct property and _raw)
   * @returns {string}
   */
  getFarmId() {
    return String(this.farm_id || this._raw?.farm_id || this.id || this._raw?.id || '');
  }

  /**
   * Get farm name safely
   * @returns {string}
   */
  getFarmName() {
    return this.name || this._raw?.name || 'Unnamed Farm';
  }

  /**
   * Check if farm has a valid ID
   * @returns {boolean}
   */
  hasValidId() {
    const id = this.getFarmId();
    return id !== '' && id !== 'undefined' && id !== 'null';
  }

  /**
   * Convert farm to option format for dropdowns
   * @returns {Object}
   */
  toOption() {
    return {
      id: this.getFarmId(),
      label: this.getFarmName(),
      value: this.getFarmId()
    };
  }

  /**
   * Get first farm ID from a list of farms
   * @param {Farm[]} farms - Array of Farm instances
   * @returns {string}
   */
  static getFirstFarmId(farms) {
    if (!Array.isArray(farms) || farms.length === 0) {
      return '';
    }
    return farms[0].getFarmId();
  }

  /**
   * Convert farms array to dropdown options
   * @param {Farm[]} farms - Array of Farm instances
   * @returns {Array<{id: string, label: string, value: string}>}
   */
  static toOptions(farms) {
    if (!Array.isArray(farms)) return [];
    return farms.map(farm => farm.toOption());
  }

  /**
   * Get display name
   * @returns {string}
   */
  getDisplayName() {
    return this.getFarmName();
  }

  /**
   * Get location string
   * @returns {string}
   */
  getLocationString() {
    const parts = [
      this.location.city,
      this.location.state,
      this.location.country
    ].filter(Boolean);
    return parts.join(', ') || 'Location not specified';
  }
}

export default Farm;
