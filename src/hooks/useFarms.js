/**
 * useFarms Hook
 * Handles farm loading from storage and API
 *
 * @module hooks/useFarms
 */

import { useState, useEffect } from 'react';
import { getFarms as getStoredFarms } from '../services/farmStorage';
import { fetchFarms } from '../services/farmService';

/**
 * Hook to load and manage farms
 * Loads from storage first (instant), then syncs with API
 *
 * @param {Object} options - Options
 * @param {boolean} options.autoLoad - Auto-load farms on mount (default: true)
 * @param {boolean} options.autoSelectFirst - Auto-select first farm (default: false)
 * @returns {Object} { farms, loading, error, selectedFarmId, selectFarm, reload }
 */
export function useFarms(options = {}) {
  const { autoLoad = true, autoSelectFirst = false } = options;

  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFarmId, setSelectedFarmId] = useState('');

  const loadFarms = async () => {
    // Load from storage first (instant)
    const storedFarms = getStoredFarms();
    if (storedFarms.length > 0) {
      setFarms(storedFarms);

      if (autoSelectFirst && !selectedFarmId) {
        const firstFarmId = storedFarms[0].farm_id || storedFarms[0].id;
        setSelectedFarmId(firstFarmId);
      }
    }

    // Then fetch from API
    setLoading(true);
    setError(null);

    try {
      const apiFarms = await fetchFarms();
      setFarms(apiFarms);

      if (autoSelectFirst && !selectedFarmId && apiFarms.length > 0) {
        const firstFarmId = apiFarms[0].farm_id || apiFarms[0].id;
        setSelectedFarmId(firstFarmId);
      }
    } catch (err) {
      console.error('[useFarms] Failed to fetch farms:', err);
      setError(err.message || 'Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadFarms();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    farms,
    loading,
    error,
    selectedFarmId,
    selectFarm: setSelectedFarmId,
    reload: loadFarms
  };
}

export default useFarms;
