/**
 * Custom React Hooks
 * Reusable hooks to simplify UI components.
 *
 * @module hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// useAsync - Generic async data fetching hook
// ============================================================================

/**
 * Hook for managing async operations with loading, error, and data states.
 * @param {function} asyncFn - Async function to execute
 * @param {boolean} immediate - Whether to execute immediately on mount
 * @returns {object} { data, loading, error, execute, reset }
 *
 * @example
 * const { data: tasks, loading, error, execute: refetch } = useAsync(fetchAllTasks, true);
 */
export function useAsync(asyncFn, immediate = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      if (mountedRef.current) {
        setData(result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'An error occurred');
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [asyncFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) {
      execute();
    }
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, execute, reset, setData };
}

// ============================================================================
// useDialog - Dialog state management hook
// ============================================================================

/**
 * Hook for managing dialog open/close state with optional data.
 * @param {*} initialData - Initial data when dialog opens
 * @returns {object} { open, data, openDialog, closeDialog, setData }
 *
 * @example
 * const { open, data, openDialog, closeDialog } = useDialog();
 * <Button onClick={() => openDialog(item)}>Edit</Button>
 * <Dialog open={open} onClose={closeDialog}>...</Dialog>
 */
export function useDialog(initialData = null) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(initialData);

  const openDialog = useCallback((newData = null) => {
    setData(newData);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setData(null);
  }, []);

  return { open, data, openDialog, closeDialog, setData };
}

// ============================================================================
// useForm - Form state management hook
// ============================================================================

/**
 * Hook for managing form state with validation.
 * @param {object} initialValues - Initial form values
 * @param {function} validate - Optional validation function
 * @returns {object} { values, errors, handleChange, handleSubmit, reset, setValues, setFieldValue }
 *
 * @example
 * const { values, handleChange, handleSubmit, errors } = useForm(
 *   { title: '', description: '' },
 *   (values) => values.title ? null : { title: 'Required' }
 * );
 */
export function useForm(initialValues = {}, validate = null) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setValues(prev => ({ ...prev, [name]: newValue }));
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((onSubmit) => (e) => {
    e?.preventDefault();

    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return false;
      }
    }

    setErrors({});
    onSubmit(values);
    return true;
  }, [values, validate]);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setFieldValue,
    setErrors,
  };
}

// ============================================================================
// useFilter - List filtering hook
// ============================================================================

/**
 * Hook for filtering and searching lists.
 * @param {Array} items - Items to filter
 * @param {object} options - Filter options { searchFields, initialFilter }
 * @returns {object} { filtered, searchTerm, setSearchTerm, filter, setFilter }
 *
 * @example
 * const { filtered, searchTerm, setSearchTerm } = useFilter(tasks, {
 *   searchFields: ['title', 'description', 'task_id']
 * });
 */
export function useFilter(items = [], options = {}) {
  const { searchFields = [], initialFilter = {} } = options;
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(initialFilter);

  const filtered = items.filter(item => {
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = searchFields.some(field => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(term);
      });
      if (!matchesSearch) return false;
    }

    // Apply filters
    for (const [key, value] of Object.entries(filter)) {
      if (value === 'all' || value === '' || value === null || value === undefined) continue;
      if (item[key] !== value) return false;
    }

    return true;
  });

  return { filtered, searchTerm, setSearchTerm, filter, setFilter };
}

// ============================================================================
// useSnackbar - Snackbar/notification hook
// ============================================================================

/**
 * Hook for managing snackbar notifications.
 * @returns {object} { snack, showSnack, hideSnack }
 *
 * @example
 * const { snack, showSnack, hideSnack } = useSnackbar();
 * showSnack('User saved!', 'success');
 */
export function useSnackbar() {
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  const showSnack = useCallback((message, severity = 'info') => {
    setSnack({ open: true, message, severity });
  }, []);

  const hideSnack = useCallback((event, reason) => {
    if (reason === 'clickaway') return;
    setSnack(prev => ({ ...prev, open: false }));
  }, []);

  return { snack, showSnack, hideSnack };
}

// ============================================================================
// useConfirmDialog - Confirmation dialog hook
// ============================================================================

/**
 * Hook for managing confirmation dialogs.
 * @returns {object} { confirmOpen, itemToConfirm, openConfirm, closeConfirm, confirm }
 *
 * @example
 * const { confirmOpen, itemToConfirm, openConfirm, closeConfirm, confirm } = useConfirmDialog();
 * <Button onClick={() => openConfirm(user)}>Delete</Button>
 * <ConfirmDialog
 *   open={confirmOpen}
 *   onConfirm={() => confirm(handleDelete)}
 *   onCancel={closeConfirm}
 * />
 */
export function useConfirmDialog() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToConfirm, setItemToConfirm] = useState(null);

  const openConfirm = useCallback((item) => {
    setItemToConfirm(item);
    setConfirmOpen(true);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setItemToConfirm(null);
  }, []);

  const confirm = useCallback(async (action) => {
    if (itemToConfirm && action) {
      await action(itemToConfirm);
    }
    closeConfirm();
  }, [itemToConfirm, closeConfirm]);

  return { confirmOpen, itemToConfirm, openConfirm, closeConfirm, confirm };
}

// ============================================================================
// usePagination - Pagination hook
// ============================================================================

/**
 * Hook for managing pagination.
 * @param {Array} items - Items to paginate
 * @param {number} itemsPerPage - Items per page
 * @returns {object} { page, setPage, pageCount, paginatedItems, nextPage, prevPage }
 */
export function usePagination(items = [], itemsPerPage = 10) {
  const [page, setPage] = useState(0);

  const pageCount = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = items.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  const nextPage = useCallback(() => {
    setPage(p => Math.min(p + 1, pageCount - 1));
  }, [pageCount]);

  const prevPage = useCallback(() => {
    setPage(p => Math.max(p - 1, 0));
  }, []);

  // Reset to first page when items change
  useEffect(() => {
    setPage(0);
  }, [items.length]);

  return { page, setPage, pageCount, paginatedItems, nextPage, prevPage };
}

// ============================================================================
// useLocalStorage - Local storage hook
// ============================================================================

/**
 * Hook for syncing state with localStorage.
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @returns {[*, function]} [value, setValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('useLocalStorage error:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// ============================================================================
// useMounted - Track component mount state
// ============================================================================

/**
 * Hook to track if component is mounted (for async safety).
 * @returns {object} ref with current = true/false
 */
export function useMounted() {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}

// ============================================================================
// WebSocket Hooks
// ============================================================================

export {
  useWebSocketConnection,
  useWebSocketEvent,
  useNotificationWebSocket,
  useAlertWebSocket,
  useDataStreamWebSocket,
} from './useWebSocket';

