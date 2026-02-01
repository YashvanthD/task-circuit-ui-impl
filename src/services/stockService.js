/**
 * Stock Service
 * Handles fish stock-related API calls
 *
 * @module services/stockService
 */

import { apiFetch } from '../api';
import { API_FISH } from '../api/constants';
import fishUtil from '../utils/fish';

/**
 * Fetch all stocks from API with species details
 * @param {Object} params - Query parameters (e.g., status, pond_id)
 * @returns {Promise<Array>}
 */
export async function fetchStocks(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await apiFetch(`${API_FISH.STOCKS}${qs ? '?' + qs : ''}`);
    const data = await res.json();

    // Handle multiple possible response structures
    let stocksList = [];
    if (data.stocks && Array.isArray(data.stocks)) {
      stocksList = data.stocks;
    } else if (data.success && data.data && data.data.stocks) {
      stocksList = data.data.stocks;
    } else if (data.success && data.data) {
      stocksList = Array.isArray(data.data) ? data.data : [data.data];
    } else if (Array.isArray(data)) {
      stocksList = data;
    }

    // Fetch species data to enrich stocks
    try {
      const speciesRes = await fishUtil.getFishList();
      const speciesList = speciesRes?.data || [];

      // Create a map of species by ID for quick lookup
      const speciesMap = {};
      speciesList.forEach(species => {
        const id = species.species_id || species.id;
        if (id) {
          speciesMap[id] = species;
        }
      });

      // Enrich stocks with species name
      stocksList = stocksList.map(stock => {
        const speciesId = stock.species_id || stock.speciesId;
        const species = speciesMap[speciesId];

        return {
          ...stock,
          species_name: species?.common_name || species?.name || stock.species_name || '',
          species: species,
        };
      });
    } catch (speciesError) {
      console.warn('[stockService] Failed to fetch species details:', speciesError);
      // Continue without species enrichment
    }

    return stocksList;
  } catch (error) {
    console.error('[stockService] Failed to fetch stocks:', error);
    throw error;
  }
}

/**
 * Get a single stock by ID
 * @param {string} stockId - Stock ID
 * @returns {Promise<Object>}
 */
export async function getStockById(stockId) {
  try {
    const res = await apiFetch(API_FISH.STOCK_DETAIL(stockId));
    const data = await res.json();

    if (data.success && data.data) {
      return data.data.stock || data.data;
    }
    return data;
  } catch (error) {
    console.error('[stockService] Failed to fetch stock:', error);
    throw error;
  }
}

/**
 * Create a new stock
 * @param {Object} stockData - Stock data
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function createStock(stockData) {
  try {
    const res = await apiFetch(API_FISH.STOCKS_CREATE, {
      method: 'POST',
      body: JSON.stringify(stockData),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return { success: true, data: data.data };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to create stock'
      };
    }
  } catch (err) {
    console.error('[stockService] Failed to create stock:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Update a stock
 * @param {string} stockId - Stock ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function updateStock(stockId, updates) {
  try {
    const res = await apiFetch(API_FISH.STOCK_UPDATE(stockId), {
      method: 'PUT',
      body: JSON.stringify(updates),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return { success: true, data: data.data };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to update stock'
      };
    }
  } catch (err) {
    console.error('[stockService] Failed to update stock:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Terminate a stock
 * @param {string} stockId - Stock ID
 * @param {Object} terminationData - Termination details
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function terminateStock(stockId, terminationData) {
  try {
    const res = await apiFetch(API_FISH.STOCK_TERMINATE(stockId), {
      method: 'POST',
      body: JSON.stringify(terminationData),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: data.error || data.message || 'Failed to terminate stock'
      };
    }
  } catch (err) {
    console.error('[stockService] Failed to terminate stock:', err);
    return {
      success: false,
      error: 'Network error: ' + err.message
    };
  }
}

/**
 * Get stock summary
 * @param {string} stockId - Stock ID
 * @returns {Promise<Object>}
 */
export async function getStockSummary(stockId) {
  try {
    const res = await apiFetch(API_FISH.STOCK_SUMMARY(stockId));
    const data = await res.json();

    if (data.success && data.data) {
      return data.data.summary || data.data;
    }
    return data;
  } catch (error) {
    console.error('[stockService] Failed to fetch stock summary:', error);
    throw error;
  }
}

export default {
  fetchStocks,
  getStockById,
  createStock,
  updateStock,
  terminateStock,
  getStockSummary,
};
