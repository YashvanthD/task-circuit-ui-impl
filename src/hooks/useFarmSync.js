/**
 * useFarmSync Hook
 * Automatically syncs farms from API to storage when user logs in
 *
 * @module hooks/useFarmSync
 */

import { useEffect } from 'react';
import { apiFetch } from '../api';
import { API_FISH } from '../api';
import { syncFarmsFromAPI } from '../services/farmStorage';

/**
 * Hook to sync farms from API to localStorage
 * Call this in your App component or after login
 *
 * @param {boolean} isAuthenticated - Whether user is authenticated
 */
export function useFarmSync(isAuthenticated) {
  useEffect(() => {
    if (!isAuthenticated) return;

    const syncFarms = async () => {
      try {
        const res = await apiFetch(API_FISH.FARMS);
        const data = await res.json();

        // Handle multiple possible response structures
        let farmsList = [];
        if (data.farms && Array.isArray(data.farms)) {
          farmsList = data.farms;
        } else if (data.success && data.data) {
          farmsList = Array.isArray(data.data) ? data.data : [data.data];
        } else if (Array.isArray(data)) {
          farmsList = data;
        }

        if (farmsList.length > 0) {
          syncFarmsFromAPI(farmsList);
          console.log('[useFarmSync] Synced', farmsList.length, 'farms to storage');
        }
      } catch (error) {
        console.error('[useFarmSync] Failed to sync farms:', error);
      }
    };

    syncFarms();
  }, [isAuthenticated]);
}

export default useFarmSync;
