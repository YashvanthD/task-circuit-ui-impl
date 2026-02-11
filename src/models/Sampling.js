/**
 * Sampling Model
 * Represents a fish sampling record with validation and data transformation
 *
 * @module models/Sampling
 */

import { BaseModel } from './BaseModel';

export class Sampling extends BaseModel {
  /**
   * Schema definition for Sampling
   */
  static get schema() {
    return {
      sampling_id: { type: 'string', aliases: ['samplingId', 'id'] },
      pond_id: { type: 'string', required: true, aliases: ['pondId', 'pond'] },
      stock_id: { type: 'string', aliases: ['stockId'] },
      species: { type: 'string', aliases: ['fish', 'speciesCode', 'species_code'] },

      // Date
      sample_date: { type: 'string', required: true, aliases: ['sampling_date', 'samplingDate', 'date'] },

      // Quantities
      sample_count: { type: 'number', aliases: ['sample_size', 'sampleSize', 'sampleCount', 'count'], default: 0 },
      total_count: { type: 'number', aliases: ['totalCount'], default: 0 },

      // Weights
      avg_weight_g: {
        type: 'number',
        aliases: ['avg_weight', 'avgWeight'],
        parse: (val, data) => {
          if (val !== undefined && val !== null) return Number(val);
          // Check for averageWeight (in kg)
          if (data.averageWeight !== undefined && data.averageWeight !== null) {
            return Number(data.averageWeight) * 1000;
          }
          return 0;
        }
      },
      min_weight_g: { type: 'number', aliases: ['minWeightG'] },
      max_weight_g: { type: 'number', aliases: ['maxWeightG'] },
      total_weight_g: { type: 'number', aliases: ['totalWeightG'] },

      // Growth metrics
      previous_avg_weight_g: { type: 'number', aliases: ['previousAvgWeightG'] },
      weight_gain_g: { type: 'number', aliases: ['weightGainG'] },
      growth_rate_g_per_day: { type: 'number', aliases: ['growthRateGPerDay'] },
      days_since_last_sampling: { type: 'number', aliases: ['daysSinceLastSampling'] },

      // Financials
      cost: { type: 'number', aliases: ['cost_amount', 'costAmount', 'fish_cost', 'fishCost'], default: 0 },
      cost_enabled: { type: 'boolean', aliases: ['costEnabled'], default: true },
      total_amount: { type: 'number', aliases: ['totalAmount', 'amount'], default: 0 },

      // Meta
      notes: { type: 'string', aliases: ['note'] },
      recorded_by: { type: 'string', aliases: ['recordedBy', 'recorded_by_userKey', 'recordedByUserKey'] },

      // Audit
      created_at: { type: 'string', aliases: ['createdAt'] },
      updated_at: { type: 'string', aliases: ['updatedAt'] }
    };
  }

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
   * Post-initialization hook
   */
  _postInit(data) {
     // Backward compatibility for aliased properties accessed directly
     if (!this.sampling_date) this.sampling_date = this.sample_date;
     if (!this.sample_size) this.sample_size = this.sample_count;
     if (!this.avg_weight) this.avg_weight = this.avg_weight_g;
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
