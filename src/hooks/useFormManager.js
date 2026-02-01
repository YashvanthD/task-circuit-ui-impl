/**
 * React Hook for Form Manager
 * Provides a clean React interface to the FormManager
 *
 * @module hooks/useFormManager
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { FormManager } from '../utils/forms';

/**
 * Hook to use FormManager in React components
 * @param {string} formName - Unique form name
 * @param {object} initialData - Initial form data
 * @param {object} options - Form options
 * @returns {object} Form state and methods
 */
export function useFormManager(formName, initialData = {}, options = {}) {
  const formRef = useRef(null);
  const [, forceUpdate] = useState({});

  // Initialize form manager
  if (!formRef.current) {
    formRef.current = new FormManager(formName, initialData, options);
  }

  const form = formRef.current;

  // Subscribe to form changes
  useEffect(() => {
    const unsubscribers = [
      form.on('change', () => forceUpdate({})),
      form.on('dataSet', () => forceUpdate({})),
      form.on('validated', () => forceUpdate({})),
      form.on('error', () => forceUpdate({})),
      form.on('errors', () => forceUpdate({})),
      form.on('reset', () => forceUpdate({})),
      form.on('submitting', () => forceUpdate({})),
      form.on('submitted', () => forceUpdate({})),
      form.on('loadingStart', () => forceUpdate({})),
      form.on('loadingEnd', () => forceUpdate({})),
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [form]);

  // Memoized methods
  const setField = useCallback((field, value) => {
    form.setField(field, value);
  }, [form]);

  const getField = useCallback((field, defaultValue) => {
    return form.getField(field, defaultValue);
  }, [form]);

  const setData = useCallback((data, markAsTouched) => {
    form.setData(data, markAsTouched);
  }, [form]);

  const loadData = useCallback(async (loader) => {
    return await form.loadData(loader);
  }, [form]);

  const reset = useCallback(() => {
    form.reset();
  }, [form]);

  const validate = useCallback(() => {
    return form.validate();
  }, [form]);

  const submit = useCallback(async (submitter) => {
    return await form.submit(submitter);
  }, [form]);

  const touch = useCallback((field) => {
    form.touch(field);
  }, [form]);

  // Handler generators
  const handleChange = useCallback((field) => (event) => {
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value;
    setField(field, value);
  }, [setField]);

  const handleBlur = useCallback((field) => () => {
    touch(field);
  }, [touch]);

  const handleSubmit = useCallback((submitter) => async (event) => {
    if (event) event.preventDefault();
    return await submit(submitter);
  }, [submit]);

  return {
    // State
    data: form.getData(),
    errors: form.errors,
    touched: form.touched,
    loading: form.loading,
    submitting: form.submitting,
    submitError: form.submitError,
    isDirty: form.isDirty(),
    isValid: form.isValid(),

    // Methods
    setField,
    getField,
    setData,
    loadData,
    reset,
    validate,
    submit,
    touch,
    setError: form.setError.bind(form),
    setErrors: form.setErrors.bind(form),
    clearError: form.clearError.bind(form),
    clearErrors: form.clearErrors.bind(form),

    // Handler generators
    handleChange,
    handleBlur,
    handleSubmit,

    // Form manager instance (for advanced usage)
    form,
  };
}

/**
 * Hook for simple form state (without manager)
 * @param {object} initialValues - Initial form values
 * @returns {object} Form state and handlers
 */
export function useFormState(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setValue = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const setError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const touchField = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitting(false);
  }, [initialValues]);

  const handleChange = useCallback((field) => (event) => {
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value;
    setValue(field, value);
  }, [setValue]);

  const handleBlur = useCallback((field) => () => {
    touchField(field);
  }, [touchField]);

  return {
    values,
    errors,
    touched,
    submitting,
    setValue,
    setError,
    setErrors,
    touchField,
    setSubmitting,
    reset,
    handleChange,
    handleBlur,
  };
}

export default useFormManager;
