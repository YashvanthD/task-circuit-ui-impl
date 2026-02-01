/**
 * Stock Model
 * Represents a fish stock record with validation and data transformation
 *
 * @module models/Stock
 */

import { BaseModel } from './BaseModel';

export class Stock extends BaseModel {
  /**
   * Default form values for creating a new stock
   */
  static getDefaultFormData() {
    return {
      pond_id: '',
      species_id: '',
      initial_count: '',
      initial_avg_weight_g: '',
      stocking_date: new Date().toISOString().split('T')[0],
      source: '',
      source_contact: '',
      cost_per_unit: '',
      total_cost: '',
      batch_number: '',
      notes: '',
    };
  }

  /**
   * Initialize stock fields
   * @private
   */
  _init(data) {
    // IDs (handle both snake_case and camelCase)
    this.stock_id = data.stock_id || data.stockId || data.id || '';
    this.pond_id = data.pond_id || data.pondId || '';
    this.farm_id = data.farm_id || data.farmId || '';
    this.species_id = data.species_id || data.speciesId || '';
    this.account_key = data.account_key || data.accountKey || '';

    // Species name (if included in response) - handle both snake_case and camelCase
    this.species_name = data.species_name || data.speciesName ||
                       data.species?.common_name || data.species?.commonName ||
                       data.species?.name || '';

    // Pond name (if included in response)
    this.pond_name = data.pond_name || data.pondName ||
                    data.pond?.name || '';

    // Quantities (handle both snake_case and camelCase)
    this.initial_count = data.initial_count || data.initialCount || data.quantity || 0;
    this.current_count = data.current_count || data.currentCount || this.initial_count;
    this.initial_avg_weight_g = data.initial_avg_weight_g || data.initialAvgWeightG || data.avg_weight_g || data.avgWeightG || 0;

    // Dates (handle both snake_case and camelCase)
    this.stocking_date = data.stocking_date || data.stockingDate || '';
    this.termination_date = data.termination_date || data.terminationDate || null;

    // Source
    this.source = data.source || '';
    this.source_contact = data.source_contact || data.sourceContact || '';

    // Cost (handle both snake_case and camelCase)
    this.cost_per_unit = data.cost_per_unit || data.costPerUnit || 0;
    this.total_cost = data.total_cost || data.totalCost || 0;

    // Batch and metadata (handle both snake_case and camelCase)
    this.batch_number = data.batch_number || data.batchNumber || '';
    this.notes = data.notes || '';
    this.status = data.status || 'active';

    // Species name (if included in response)
    this.species_name = data.species_name || data.speciesName || '';

    // Timestamps (handle both snake_case and camelCase)
    this.created_at = data.created_at || data.createdAt || '';
    this.updated_at = data.updated_at || data.updatedAt || '';
    this.created_by = data.created_by || data.createdBy || '';
  }

  /**
   * Validate stock data
   * @private
   */
  _validate() {
    if (!this.pond_id) {
      this._addError('pond_id', 'Pond is required');
    }

    if (!this.species_id) {
      this._addError('species_id', 'Species is required');
    }

    if (!this.initial_count || this.initial_count <= 0) {
      this._addError('initial_count', 'Initial count must be greater than 0');
    }

    if (!this.stocking_date) {
      this._addError('stocking_date', 'Stocking date is required');
    }
  }

  /**
   * Convert to API payload format
   * @returns {Object}
   */
  toAPIPayload() {
    const payload = {
      pond_id: this.pond_id,
      species_id: this.species_id,
      initial_count: Number(this.initial_count),
      stocking_date: this.stocking_date,
    };

    if (this.initial_avg_weight_g) {
      payload.initial_avg_weight_g = Number(this.initial_avg_weight_g);
    }

    if (this.source) {
      payload.source = this.source;
    }

    if (this.source_contact) {
      payload.source_contact = this.source_contact;
    }

    if (this.cost_per_unit) {
      payload.cost_per_unit = Number(this.cost_per_unit);
    }

    if (this.total_cost) {
      payload.total_cost = Number(this.total_cost);
    }

    if (this.batch_number) {
      payload.batch_number = this.batch_number;
    }

    if (this.notes) {
      payload.notes = this.notes;
    }

    return payload;
  }

  /**
   * Get stock ID
   * @returns {string}
   */
  getStockId() {
    return String(this.stock_id || '');
  }

  /**
   * Check if stock is active
   * @returns {boolean}
   */
  isActive() {
    return this.status === 'active' && !this.termination_date;
  }

  /**
   * Calculate current biomass (in kg)
   * @param {number} currentAvgWeight - Current average weight in grams
   * @returns {number}
   */
  getCurrentBiomass(currentAvgWeight = null) {
    if (!this.current_count) return 0;
    const avgWeight = currentAvgWeight || this.initial_avg_weight_g || 0;
    if (!avgWeight) return 0;
    return (this.current_count * avgWeight) / 1000; // Convert to kg
  }

  /**
   * Get display name (species name + stock ID)
   * @returns {string}
   */
  getDisplayName() {
    if (this.species_name) {
      return `${this.species_name} (${this.stock_id})`;
    }
    return this.stock_id || 'Unknown Stock';
  }

  /**
   * Calculate days since stocking
   * @returns {number}
   */
  getDaysSinceStocking() {
    if (!this.stocking_date) return 0;
    const stockDate = new Date(this.stocking_date);
    const today = new Date();
    const diffTime = Math.abs(today - stockDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate survival rate percentage
   * @returns {number}
   */
  getSurvivalRate() {
    if (!this.initial_count || this.initial_count === 0) return 0;
    return (this.current_count / this.initial_count) * 100;
  }

  /**
   * Calculate mortality count
   * @returns {number}
   */
  getMortalityCount() {
    return this.initial_count - this.current_count;
  }

  /**
   * Calculate growth from initial to current weight
   * @param {number} currentAvgWeight - Current average weight in grams
   * @returns {number} Total growth in grams
   */
  getTotalGrowth(currentAvgWeight) {
    if (currentAvgWeight === null || currentAvgWeight === undefined) return 0;
    const initialWeight = this.initial_avg_weight_g || 0;
    return currentAvgWeight - initialWeight;
  }

  /**
   * Calculate average growth rate based on current weight
   * @param {number} currentAvgWeight - Current average weight in grams
   * @returns {number} Growth rate in g/day
   */
  getAverageGrowthRate(currentAvgWeight) {
    const days = this.getDaysSinceStocking();
    if (!days || days === 0) return 0;

    const totalGrowth = this.getTotalGrowth(currentAvgWeight);
    return totalGrowth / days;
  }

  /**
   * Get growth status based on growth rate
   * @param {number} growthRate - Growth rate in g/day
   * @returns {Object} Status with color and label
   */
  getGrowthStatus(growthRate) {
    if (growthRate >= 5) {
      return { color: 'success', label: 'Excellent', icon: '🟢' };
    } else if (growthRate >= 2) {
      return { color: 'warning', label: 'Moderate', icon: '🟡' };
    } else if (growthRate >= 0) {
      return { color: 'info', label: 'Slow', icon: '🔵' };
    } else {
      return { color: 'error', label: 'Declining', icon: '🔴' };
    }
  }

  /**
   * Calculate projected harvest date based on target weight
   * @param {number} currentAvgWeight - Current average weight in grams
   * @param {number} targetWeight - Target harvest weight in grams
   * @returns {Date|null}
   */
  getProjectedHarvestDate(currentAvgWeight, targetWeight = 1000) {
    const growthRate = this.getAverageGrowthRate(currentAvgWeight);
    if (!growthRate || growthRate <= 0) return null;

    const weightToGain = targetWeight - currentAvgWeight;
    if (weightToGain <= 0) return new Date(); // Already at target

    const daysNeeded = Math.ceil(weightToGain / growthRate);
    const harvestDate = new Date();
    harvestDate.setDate(harvestDate.getDate() + daysNeeded);

    return harvestDate;
  }

  /**
   * Get stock analytics summary
   * @param {number} currentAvgWeight - Current average weight in grams
   * @param {Array} samplings - Array of sampling records
   * @returns {Object} Analytics summary
   */
  getAnalytics(currentAvgWeight, samplings = []) {
    // Use provided current weight or fall back to initial weight
    const avgWeight = currentAvgWeight || this.initial_avg_weight_g || 0;

    const days = this.getDaysSinceStocking();
    const biomass = this.getCurrentBiomass(avgWeight); // Pass current weight
    const totalGrowth = this.getTotalGrowth(avgWeight);
    const growthRate = this.getAverageGrowthRate(avgWeight);
    const growthStatus = this.getGrowthStatus(growthRate);
    const survivalRate = this.getSurvivalRate();
    const mortalityCount = this.getMortalityCount();

    return {
      days,
      biomass,
      currentAvgWeight: avgWeight,
      growthRate,
      growthStatus,
      survivalRate,
      mortalityCount,
      totalGrowth,
      samplingCount: samplings.length,
      lastSamplingDate: samplings.length > 0 ? (samplings[0].sample_date || samplings[0].sampling_date) : null,
    };
  }

  /**
   * Create dropdown label for stock
   * @param {Object} options - Label options
   * @param {boolean} options.showId - Include stock ID (default: true)
   * @param {boolean} options.showPond - Include pond ID (default: false)
   * @param {boolean} options.showDate - Include stocking date (default: false)
   * @param {boolean} options.showCount - Include fish count (default: false)
   * @param {boolean} options.showStatus - Include status (default: false)
   * @param {string} options.delimiter - Separator between parts (default: " | ")
   * @returns {string}
   */
  getDropdownLabel(options = {}) {
    const {
      showId = true,
      showPond = false,
      showDate = false,
      showCount = false,
      showStatus = false,
      delimiter = ' | '
    } = options;

    const parts = [];

    // Always include species name first
    parts.push(this.species_name || 'Unknown Species');

    if (showId && this.stock_id) {
      parts.push(this.stock_id);
    }

    if (showPond && this.pond_id) {
      parts.push(`Pond: ${this.pond_id}`);
    }

    if (showDate && this.stocking_date) {
      parts.push(this.stocking_date);
    }

    if (showCount && this.current_count) {
      parts.push(`${this.current_count} fish`);
    }

    if (showStatus && this.status) {
      parts.push(this.status);
    }

    return parts.join(delimiter);
  }

  /**
   * Convert stock array to dropdown options
   * @param {Array<Stock>} stockList - Array of stock instances
   * @param {Object} labelOptions - Options for label formatting
   * @returns {Array<Object>} Array of {id, stock_id, label, raw} objects
   */
  static toDropdownOptions(stockList, labelOptions = {}) {
    if (!Array.isArray(stockList)) return [];

    return stockList.map(stock => ({
      id: stock.stock_id || stock.id,
      stock_id: stock.stock_id || stock.id,
      label: stock instanceof Stock
        ? stock.getDropdownLabel(labelOptions)
        : (stock.species_name || stock.stock_id || 'Unknown Stock'),
      raw: stock
    }));
  }

  /**
   * Convert stock array to list of Stock instances
   * @param {Array} stockList - Array of stock data
   * @returns {Array<Stock>}
   */
  static toList(stockList) {
    if (!Array.isArray(stockList)) return [];
    return stockList.map(data => new Stock(data));
  }

  /**
   * Extract stocks from various API response formats
   * @param {Object} response - API response
   * @returns {Array<Stock>}
   */
  static fromAPIResponse(response) {
    let data = [];

    if (Array.isArray(response)) {
      data = response;
    } else if (response?.data?.stocks) {
      data = response.data.stocks;
    } else if (response?.stocks) {
      data = response.stocks;
    } else if (response?.data) {
      data = Array.isArray(response.data) ? response.data : [response.data];
    }

    return Stock.toList(data);
  }

  /**
   * Create termination payload
   * @param {string} terminationDate - Date of termination
   * @param {string} reason - Reason for termination
   * @returns {Object}
   */
  static createTerminationPayload(terminationDate, reason) {
    return {
      termination_date: terminationDate,
      reason: reason || 'Harvested',
    };
  }
}

export default Stock;
