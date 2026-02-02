import { useState, useCallback } from 'react';

/**
 * useViewNavigation Hook
 * Manages an internal history stack for in-page navigation (e.g., switches between dashboard, forms, and details)
 *
 * @param {string} initialView - The starting view name (default: 'dashboard')
 * @returns {Object} Navigation state and functions
 */
export function useViewNavigation(initialView = 'dashboard') {
  const [history, setHistory] = useState([initialView]);
  const [selectedData, setSelectedData] = useState(null);

  const currentView = history[history.length - 1];

  /**
   * Navigate to a new view
   * @param {string} view - Target view name
   * @param {any} data - Optional data associated with the view (e.g., selected entity)
   */
  const navigateTo = useCallback((view, data = null) => {
    setHistory(prev => [...prev, view]);
    if (data !== null) {
      setSelectedData(data);
    }
  }, []);

  /**
   * Go back to the previous view in history
   */
  const goBack = useCallback(() => {
    setHistory(prev => {
      if (prev.length <= 1) return prev; // Cannot go back further than initial
      const newHistory = [...prev];
      newHistory.pop();
      return newHistory;
    });
  }, []);

  /**
   * Reset to initial view and clear history
   */
  const resetTo = useCallback((view = initialView) => {
    setHistory([view]);
    setSelectedData(null);
  }, [initialView]);

  return {
    currentView,
    history,
    selectedData,
    setSelectedData,
    navigateTo,
    goBack,
    resetTo,
    isRoot: history.length <= 1
  };
}
