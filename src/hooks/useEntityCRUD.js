/**
 * useEntityCRUD Hook
 * Reusable hook for common CRUD operations
 * Eliminates boilerplate in page components
 *
 * @module hooks/useEntityCRUD
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for entity CRUD operations
 *
 * @param {Object} service - Service object with fetch, create, update, delete methods
 * @param {Object} options - Configuration options
 * @param {boolean} options.loadOnMount - Load data on mount (default: true)
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onSuccess - Success callback
 * @returns {Object} CRUD state and methods
 *
 * @example
 * const fish = useEntityCRUD(fishService, {
 *   onError: (err) => toast.error(err.message)
 * });
 *
 * // In component
 * <DataGrid
 *   items={fish.items}
 *   loading={fish.loading}
 *   error={fish.error}
 *   onRefresh={fish.reload}
 * />
 */
export function useEntityCRUD(service, options = {}) {
  const {
    loadOnMount = true,
    onError,
    onSuccess
  } = options;

  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load/Fetch
  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.fetch(force);
      setItems(data);
      return { success: true, data };
    } catch (err) {
      setError(err);
      onError?.(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [service, onError]);

  // Create
  const create = useCallback(async (formData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await service.create(formData);
      await load(); // Refresh list
      onSuccess?.('created', result);
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      onError?.(err);
      return { success: false, error: err };
    } finally {
      setSubmitting(false);
    }
  }, [service, load, onSuccess, onError]);

  // Update
  const update = useCallback(async (id, formData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await service.update(id, formData);
      await load(); // Refresh list
      onSuccess?.('updated', result);
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      onError?.(err);
      return { success: false, error: err };
    } finally {
      setSubmitting(false);
    }
  }, [service, load, onSuccess, onError]);

  // Delete
  const remove = useCallback(async (id) => {
    setSubmitting(true);
    setError(null);
    try {
      await service.delete(id);
      await load(); // Refresh list
      onSuccess?.('deleted', id);
      return { success: true };
    } catch (err) {
      setError(err);
      onError?.(err);
      return { success: false, error: err };
    } finally {
      setSubmitting(false);
    }
  }, [service, load, onSuccess, onError]);

  // Load on mount
  useEffect(() => {
    if (loadOnMount) {
      load();
    }
  }, [loadOnMount, load]);

  return {
    // State
    items,
    loading,
    error,
    submitting,

    // Methods
    reload: load,
    create,
    update,
    remove,

    // Helpers
    setItems,
    clearError: () => setError(null),
  };
}

/**
 * Hook for single entity operations
 * Used for detail pages
 *
 * @param {Object} service - Service object
 * @param {string} id - Entity ID
 * @param {Object} options - Configuration options
 * @returns {Object} Entity state and methods
 */
export function useEntity(service, id, options = {}) {
  const { onError, onSuccess } = options;

  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load entity
  const load = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await service.fetchById(id);
      setEntity(data);
      return { success: true, data };
    } catch (err) {
      setError(err);
      onError?.(err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [service, id, onError]);

  // Update entity
  const update = useCallback(async (formData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await service.update(id, formData);
      setEntity(result);
      onSuccess?.('updated', result);
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      onError?.(err);
      return { success: false, error: err };
    } finally {
      setSubmitting(false);
    }
  }, [service, id, onSuccess, onError]);

  // Delete entity
  const remove = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      await service.delete(id);
      onSuccess?.('deleted', id);
      return { success: true };
    } catch (err) {
      setError(err);
      onError?.(err);
      return { success: false, error: err };
    } finally {
      setSubmitting(false);
    }
  }, [service, id, onSuccess, onError]);

  // Load on mount or ID change
  useEffect(() => {
    load();
  }, [load]);

  return {
    entity,
    loading,
    error,
    submitting,
    reload: load,
    update,
    remove,
  };
}
