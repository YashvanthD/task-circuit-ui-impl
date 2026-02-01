/**
 * Sampling Model
 * Represents a fish sampling record with validation and data transformation
 *
 * @module models/Sampling
 */

import { BaseModel } from './BaseModel';

export class Sampling extends BaseModel {
  /**
   * Default form values for creating a new sampling record
   */
  static getDefaultFormData() {
    return {
      pond_id: '',
      species: null,
      sample_date: new Date().toISOString().split('T')[0],
      sample_count: 5,
      total_count: 0,
      avg_weight: 100,
      cost: 0,
      cost_enabled: true,
      total_amount: 0,
      notes: '',
      recorded_by_userKey: '',
    };
  }

  /**
   * Initialize sampling fields
   * @private
   */
  _init(data) {
    this.sampling_id = data.sampling_id || data.samplingId || data.id || '';
    this.pond_id = data.pond_id || data.pondId || data.pond || '';
    this.stock_id = data.stock_id || data.stockId || '';

    this.species = data.species || data.fish || data.speciesCode || data.species_code || null;

    this.sample_date = data.sample_date || data.sampling_date || data.samplingDate || data.date || '';
    this.sampling_date = data.sample_date || data.sampling_date || data.samplingDate || data.date || '';

    this.sample_count = data.sample_count || data.sample_size || data.sampleSize || data.count || 0;
    this.sample_size = data.sample_count || data.sample_size || data.sampleSize || data.count || 0;
    this.total_count = data.total_count || data.totalCount || 0;

    this.avg_weight = data.avg_weight_g || data.avg_weight || this._parseWeight(data);
    this.avg_weight_g = data.avg_weight_g || data.avg_weight || this._parseWeight(data);
    this.min_weight_g = data.min_weight_g || data.minWeightG || null;
    this.max_weight_g = data.max_weight_g || data.maxWeightG || null;
    this.total_weight_g = data.total_weight_g || data.totalWeightG || null;

    this.previous_avg_weight_g = data.previous_avg_weight_g || data.previousAvgWeightG || null;
    this.weight_gain_g = data.weight_gain_g || data.weightGainG || null;
    this.growth_rate_g_per_day = data.growth_rate_g_per_day || data.growthRateGPerDay || null;
    this.days_since_last_sampling = data.days_since_last_sampling || data.daysSinceLastSampling || null;

    this.cost = data.cost || data.cost_amount || data.costAmount || data.fish_cost || data.fishCost || 0;
    this.cost_enabled = data.cost_enabled ?? data.costEnabled ?? true;
    this.total_amount = data.total_amount || data.totalAmount || data.amount || 0;

    this.notes = data.notes || data.note || '';
    this.recorded_by = data.recorded_by || data.recordedBy || data.recorded_by_userKey || data.recordedByUserKey || '';

    this.created_at = data.created_at || data.createdAt || '';
    this.updated_at = data.updated_at || data.updatedAt || '';
  }

  /**
   * Parse weight from various formats
   * @private
   */
  _parseWeight(data) {
    // Check for averageWeight (in kg)
    if (data.averageWeight !== undefined && data.averageWeight !== null) {
      return Number(data.averageWeight) * 1000; // Convert kg to grams
    }

    // Check for avg_weight (assume in grams)
    if (data.avg_weight !== undefined && data.avg_weight !== null) {
      return Number(data.avg_weight);
    }

    return 0;
  }

  /**
   * Validate sampling data
   * @private
   */
  _validate() {
    if (!this.pond_id) {
      this._addError('pond_id', 'Pond is required');
    }

    if (!this.sample_date) {
      this._addError('sample_date', 'Sample date is required');
    }

    if (this.sample_count < 0) {
      this._addError('sample_count', 'Sample count must be positive');
    }
  }

  /**
   * Convert to API payload format
   * @returns {Object}
   */
  toAPIPayload() {
    const payload = {
      pond_id: this.pond_id,
      sampling_date: this.sampling_date,
      sample_count: Number(this.sample_count),
      total_count: Number(this.total_count),
      avg_weight: Number(this.avg_weight),
      notes: this.notes || undefined,
    };

    if (this.stock_id) {
      payload.stock_id = this.stock_id;
    }

    if (this.species) {
      payload.species = typeof this.species === 'string' ? this.species :
                       (this.species.speciesCode || this.species.id || this.species);
    }

    if (this.cost_enabled) {
      payload.cost = Number(this.cost);
      payload.total_amount = Number(this.total_amount);
    }

    if (this.recorded_by) {
      payload.recorded_by_userKey = this.recorded_by;
    }

    return payload;
  }

  /**
   * Convert to form data format
   * @returns {Object}
   */
  toFormData() {
    return {
      pond_id: this.pond_id,
      species: this.species,
      sampling_date: this.sampling_date,
      sampling_count: this.sample_count,
      total_count: this.total_count,
      avg_weight: this.avg_weight,
      fish_cost: this.cost,
      cost_enabled: this.cost_enabled,
      total_amount: this.total_amount,
      notes: this.notes,
      recorded_by_userKey: this.recorded_by,
    };
  }

  /**
   * Format fish/species display
   * @returns {string}
   */
  formatFishDisplay() {
    const s = this.species;
    if (!s) return '';
    if (typeof s === 'string') return s;

    const common = s.commonName || s.common_name || s.label;
    const sci = s.scientificName || s.scientific_name;
    const id = s.speciesId || s.speciesCode || s.id;

    if (common && sci) return `${common} (${sci})`;
    if (common) return common + (id ? ` [${id}]` : '');
    return id || '';
  }

  /**
   * Format average weight for display
   * @returns {string}
   */
  formatAvgWeight() {
    if (this.avg_weight === null || this.avg_weight === undefined || this.avg_weight === '') {
      return '';
    }

    const num = Number(this.avg_weight);
    if (!Number.isFinite(num)) return String(this.avg_weight);

    // If less than 10g, show as grams
    if (num <= 10) {
      return `${(num * 1000).toFixed(0)} g`;
    }

    return `${num.toFixed(0)} g`;
  }

  /**
   * Get sampling ID
   * @returns {string}
   */
  getSamplingId() {
    return String(this.sampling_id || '');
  }

  /**
   * Convert sampling array to list of Sampling instances
   * @param {Array} samplingList - Array of sampling data
   * @returns {Array<Sampling>}
   */
  static toList(samplingList) {
    if (!Array.isArray(samplingList)) return [];
    return samplingList.map(data => new Sampling(data));
  }

  /**
   * Extract samplings from various API response formats
   * @param {Object} response - API response
   * @returns {Array<Sampling>}
   */
  static fromAPIResponse(response) {
    let data = [];

    if (Array.isArray(response)) {
      data = response;
    } else if (response?.data?.samplings) {
      data = response.data.samplings;
    } else if (response?.samplings) {
      data = response.samplings;
    } else if (response?.data) {
      data = Array.isArray(response.data) ? response.data : [response.data];
    }

    return Sampling.toList(data);
  }
}

export default Sampling;
