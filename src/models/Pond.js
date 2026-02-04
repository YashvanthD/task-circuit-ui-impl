/**
 * Pond Model
 * Represents a pond entity with validation and storage
 *
 * @module models/Pond
 */

import { BaseModel } from './BaseModel';

export class Pond extends BaseModel {
  /**
   * Default form values for creating a new pond
   * @param {Object} options - Options for default data
   * @param {string} options.farmId - Pre-selected farm ID
   * @param {Array} options.farms - Available farms list
   */
  static getDefaultFormData(options = {}) {
    const { farmId, farms } = options;

    // Auto-select farm: use provided farmId, or first available farm, or empty
    let defaultFarmId = '';
    if (farmId) {
      defaultFarmId = String(farmId);
    } else if (farms && Array.isArray(farms) && farms.length > 0) {
      // Use Farm model method to safely get first farm ID
      const Farm = require('./Farm').default || require('./Farm').Farm;
      defaultFarmId = Farm.getFirstFarmId ? Farm.getFirstFarmId(farms) :
                     (farms[0].getFarmId ? farms[0].getFarmId() : '');
    }

    return {
      farm_id: defaultFarmId,
      name: '',
      pond_type: 'earthen',
      area_sqm: '',
      depth_m: '',
      water_source: '',
      aeration_system: false,
      filtration_system: false,
      description: ''
    };
  }

  static get schema() {
    return {
      pond_id: { type: 'string', aliases: ['pondId', 'id'] },
      farm_id: { type: 'string', aliases: ['farmId'] },
      account_key: { type: 'string', aliases: ['accountKey'] },
      name: { type: 'string', default: '' },
      pond_type: { type: 'string', aliases: ['pondType'], default: 'earthen' },
      area_sqm: { type: 'number', aliases: ['areaSqm'] },
      depth_m: { type: 'number', aliases: ['depthM'] },
      capacity_liters: { type: 'number', aliases: ['capacityLiters'] },
      water_quality: {
        type: 'object',
        aliases: ['waterQuality'],
        default: {},
        parse: (val) => {
          const wq = val || {};
          return {
            ph: wq.ph || null,
            temperature: wq.temperature || null,
            dissolved_oxygen: wq.dissolved_oxygen || wq.dissolvedOxygen || null,
            ammonia: wq.ammonia || null,
            nitrite: wq.nitrite || null,
            turbidity: wq.turbidity || null,
            last_checked: wq.last_checked || wq.lastChecked || null
          };
        }
      },
      status: { type: 'string', default: 'empty' },
      current_stock_id: { type: 'string', aliases: ['currentStockId'] },
      water_source: { type: 'string', aliases: ['waterSource'] },
      aeration_system: { type: 'boolean', aliases: ['aerationSystem'], default: false },
      filtration_system: { type: 'boolean', aliases: ['filtrationSystem'], default: false },
      description: { type: 'string', default: '' },
      is_active: { type: 'boolean', aliases: ['isActive'], default: true },
      metadata: { type: 'object', default: {} },
      created_by: { type: 'string', aliases: ['createdBy'] },
      created_at: { type: 'string', aliases: ['createdAt'] },
      updated_at: { type: 'string', aliases: ['updatedAt'] },
    };
  }

  _postInit(data) {
    if (this.capacity_liters == null) {
      this.capacity_liters = this._calculateCapacity();
    }
  }

  /**
   * Calculate pond capacity
   * @private
   */
  _calculateCapacity() {
    if (this.area_sqm && this.depth_m) {
      return parseFloat(this.area_sqm) * parseFloat(this.depth_m) * 1000;
    }
    return null;
  }

  /**
   * Calculate capacity from form data
   * @param {Object} formData - Form data with area_sqm and depth_m
   * @returns {number|null}
   */
  static calculateCapacityFromForm(formData) {
    if (formData.area_sqm && formData.depth_m) {
      return parseFloat(formData.area_sqm) * parseFloat(formData.depth_m) * 1000;
    }
    return null;
  }

  /**
   * Validate pond data
   * @private
   */
  _validate() {
    if (!this.name || this.name.trim() === '') {
      this._addError('name', 'Pond name is required');
    }

    if (!this.farm_id) {
      this._addError('farm_id', 'Farm ID is required');
    }

    if (this.area_sqm !== null && this.area_sqm < 0) {
      this._addError('area_sqm', 'Area must be a positive number');
    }

    if (this.depth_m !== null && this.depth_m < 0) {
      this._addError('depth_m', 'Depth must be a positive number');
    }
  }

  /**
   * Convert to API payload format
   * @returns {Object}
   */
  toAPIPayload() {
    const payload = {
      farm_id: this.farm_id,
      name: this.name,
      pond_type: this.pond_type
    };

    if (this.area_sqm !== null) {
      payload.area_sqm = parseFloat(this.area_sqm);
    }

    if (this.depth_m !== null) {
      payload.depth_m = parseFloat(this.depth_m);
    }

    if (this.water_source) {
      payload.water_source = this.water_source;
    }

    payload.aeration_system = Boolean(this.aeration_system);
    payload.filtration_system = Boolean(this.filtration_system);

    if (this.description) {
      payload.description = this.description;
    }

    if (this.status && this.pond_id) {
      payload.status = this.status;
    }

    return payload;
  }

  /**
   * Create from form data
   * @param {Object} formData - Form data
   * @returns {Pond}
   */
  static fromFormData(formData) {
    return new Pond(formData);
  }

  /**
   * Get display name
   * @returns {string}
   */
  getDisplayName() {
    return this.name || 'Unnamed Pond';
  }

  /**
   * Get capacity in liters
   * @returns {number|null}
   */
  getCapacity() {
    return this._calculateCapacity();
  }

  /**
   * Check if pond has active stock
   * @returns {boolean}
   */
  hasActiveStock() {
    return this.status === 'stocked' && this.current_stock_id !== null;
  }

  /**
   * Get status display
   * @returns {string}
   */
  getStatusDisplay() {
    const statusMap = {
      'empty': 'Empty',
      'preparing': 'Preparing',
      'stocking': 'Stocking',
      'stocked': 'Stocked',
      'harvesting': 'Harvesting',
      'maintenance': 'Maintenance',
      'inactive': 'Inactive'
    };
    return statusMap[this.status] || this.status;
  }

  /**
   * Create dropdown label for pond
   * @param {Object} options - Label options
   * @param {boolean} options.showId - Include pond ID (default: true)
   * @param {boolean} options.showFarm - Include farm ID (default: false)
   * @param {boolean} options.showType - Include pond type (default: false)
   * @param {boolean} options.showStatus - Include status (default: false)
   * @param {boolean} options.showArea - Include area (default: false)
   * @param {string} options.delimiter - Separator between parts (default: " | ")
   * @returns {string}
   */
  getDropdownLabel(options = {}) {
    const {
      showId = true,
      showFarm = false,
      showType = false,
      showStatus = false,
      showArea = false,
      delimiter = ' | '
    } = options;

    const parts = [];

    // Always include name first
    parts.push(this.name || 'Unnamed Pond');

    if (showId && this.pond_id) {
      parts.push(this.pond_id);
    }

    if (showFarm && this.farm_id) {
      parts.push(`Farm: ${this.farm_id}`);
    }

    if (showType && this.pond_type) {
      parts.push(this.pond_type);
    }

    if (showStatus && this.status) {
      parts.push(this.getStatusDisplay());
    }

    if (showArea && this.area_sqm) {
      parts.push(`${this.area_sqm}m²`);
    }

    return parts.join(delimiter);
  }

  /**
   * Convert pond array to dropdown options
s   * @param {Array<Pond>} ponds - Array of pond instances or plain objects
   * @param {Object} labelOptions - Options for label formatting
   * @returns {Array<Object>} Array of {id, label, raw} objects
   */
  static toDropdownOptions(ponds, labelOptions = {}) {
    if (!Array.isArray(ponds)) return [];

    return ponds.map(pond => {
      // If it's already a Pond instance, use getDropdownLabel
      if (pond instanceof Pond) {
        const label = pond.getDropdownLabel(labelOptions);

        // Get ID - handle empty strings properly
        // Check if direct property exists and is not empty string
        let pondId = (pond.pond_id && pond.pond_id !== '') ? pond.pond_id :
                     (pond.id && pond.id !== '') ? pond.id : '';

        // If still empty, check _raw
        if (!pondId || pondId === '') {
          pondId = pond._raw?.pond_id || pond._raw?.pondId || pond._raw?.id || '';
        }

        return {
          id: pondId,
          pond_id: pondId,
          label: label,
          raw: pond
        };
      }

      // For plain objects, manually build label
      const {
        showId = true,
        showFarm = false,
        showType = false,
        showStatus = false,
        showArea = false,
        delimiter = ' | '
      } = labelOptions;

      const parts = [];
      parts.push(pond.name || 'Unnamed Pond');

      if (showId && pond.pond_id) {
        parts.push(pond.pond_id);
      }

      if (showFarm && pond.farm_id) {
        parts.push(`Farm: ${pond.farm_id}`);
      }

      if (showType && pond.pond_type) {
        parts.push(pond.pond_type);
      }

      if (showStatus && pond.status) {
        const statusMap = {
          'empty': 'Empty',
          'preparing': 'Preparing',
          'stocking': 'Stocking',
          'stocked': 'Stocked',
          'harvesting': 'Harvesting',
          'maintenance': 'Maintenance',
          'inactive': 'Inactive'
        };
        parts.push(statusMap[pond.status] || pond.status);
      }

      if (showArea && pond.area_sqm) {
        parts.push(`${pond.area_sqm}m²`);
      }

      const finalLabel = parts.join(delimiter);

      return {
        id: pond.pond_id || pond.pondId || pond.id,
        pond_id: pond.pond_id || pond.pondId || pond.id,
        label: finalLabel,
        raw: pond
      };
    });
  }

  /**
   * Convert pond array to list of Pond instances
   * @param {Array} pondList - Array of pond data
   * @returns {Array<Pond>}
   */
  static toList(pondList) {
    if (!Array.isArray(pondList)) return [];
    return pondList.map(data => new Pond(data));
  }

  /**
   * Extract ponds from various API response formats
   * @param {Object} response - API response
   * @returns {Array<Pond>}
   */
  static fromAPIResponse(response) {
    let data = [];

    if (Array.isArray(response)) {
      data = response;
    } else if (response?.data?.ponds) {
      data = response.data.ponds;
    } else if (response?.ponds) {
      data = response.ponds;
    } else if (response?.data) {
      data = Array.isArray(response.data) ? response.data : [response.data];
    }

    return Pond.toList(data);
  }
}

export default Pond;
