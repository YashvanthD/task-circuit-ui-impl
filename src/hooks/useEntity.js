/**
 * React Hooks for Entity Manager
 * Provides easy access to entity data in React components
 *
 * @module hooks/useEntity
 */

import { useState, useEffect, useCallback } from 'react';
import { entityManager } from '../utils/entities/entityManager';

/**
 * Hook for fetching and managing entity list data
 * @param {string} entityType - Entity type (e.g., 'farms', 'ponds', 'tasks')
 * @param {object} options - Options
 * @param {boolean} options.autoLoad - Auto-load on mount
 * @param {object} options.params - Query parameters
 * @returns {object} { data, loading, error, refresh, clearCache }
 */
export function useEntityList(entityType, options = {}) {
  const { autoLoad = true, params = {} } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get method name (e.g., 'getFarms', 'getPonds')
  const methodName = `get${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`;

  const load = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const method = entityManager[methodName];
      if (!method) {
        throw new Error(`Unknown entity type: ${entityType}`);
      }

      const result = await method.call(entityManager, params, forceRefresh);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to load data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityType, methodName, params]);

  const refresh = useCallback(() => {
    return load(true);
  }, [load]);

  const clearCache = useCallback(() => {
    entityManager.clearEntityCache(entityType);
  }, [entityType]);

  useEffect(() => {
    if (autoLoad) {
      load();
    }

    // Subscribe to entity events
    const unsubscribeLoaded = entityManager.on(`${entityType}:loaded`, (newData) => {
      setData(newData);
      setLoading(false);
    });

    const unsubscribeError = entityManager.on(`${entityType}:error`, (err) => {
      setError(err.message || 'Error loading data');
      setLoading(false);
    });

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
    };
  }, [entityType, autoLoad, load]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
  };
}

/**
 * Hook for fetching and managing single entity data
 * @param {string} entityType - Entity type (e.g., 'farm', 'pond', 'task')
 * @param {string} entityId - Entity ID
 * @param {object} options - Options
 * @param {boolean} options.autoLoad - Auto-load on mount
 * @returns {object} { data, loading, error, refresh }
 */
export function useEntity(entityType, entityId, options = {}) {
  const { autoLoad = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get method name (e.g., 'getFarm', 'getPond')
  const methodName = `get${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`;

  const load = useCallback(async () => {
    if (!entityId) return null;

    setLoading(true);
    setError(null);

    try {
      const method = entityManager[methodName];
      if (!method) {
        throw new Error(`Unknown entity type: ${entityType}`);
      }

      const result = await method.call(entityManager, entityId);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to load data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, methodName]);

  const refresh = useCallback(() => {
    return load();
  }, [load]);

  useEffect(() => {
    if (autoLoad && entityId) {
      load();
    }
  }, [autoLoad, entityId, load]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

/**
 * Convenience hooks for specific entities
 */

export function useFarms(options) {
  return useEntityList('farms', options);
}

export function usePonds(options) {
  return useEntityList('ponds', options);
}

export function useSpecies(options) {
  return useEntityList('species', options);
}

export function useStocks(options) {
  return useEntityList('stocks', options);
}

export function useFeedings(options) {
  return useEntityList('feedings', options);
}

export function useSamplings(options) {
  return useEntityList('samplings', options);
}

export function useHarvests(options) {
  return useEntityList('harvests', options);
}

export function useMortalities(options) {
  return useEntityList('mortalities', options);
}

export function useTransfers(options) {
  return useEntityList('transfers', options);
}

export function useTreatments(options) {
  return useEntityList('treatments', options);
}

export function useMaintenance(options) {
  return useEntityList('maintenance', options);
}

export function usePurchases(options) {
  return useEntityList('purchases', options);
}

export function useAlerts(options) {
  return useEntityList('alerts', options);
}

export function useTasks(options) {
  return useEntityList('tasks', options);
}

export function useNotifications(options) {
  return useEntityList('notifications', options);
}

export function useConversations(options) {
  return useEntityList('conversations', options);
}

export function useUsers(options) {
  return useEntityList('users', options);
}
