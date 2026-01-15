/**
 * Target Scanning Hook
 * Custom hook for scanning DOM for assistant targets.
 *
 * @module components/assistant/hooks/useTargetScanning
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { SCAN_INTERVAL } from '../constants';

/**
 * Collect targets from DOM
 * @returns {Array} Array of target elements
 */
function collectTargetsFromDOM() {
  const targets = [];

  // Collect elements with data-critical attribute
  const criticalElements = document.querySelectorAll('[data-critical]');
  criticalElements.forEach((el) => {
    targets.push({
      element: el,
      priority: parseInt(el.dataset.critical, 10) || 1,
      type: 'critical',
      info: el.dataset.info || el.innerText?.slice(0, 50),
    });
  });

  // Collect elements with data-next-action attribute
  const actionElements = document.querySelectorAll('[data-next-action]');
  actionElements.forEach((el) => {
    targets.push({
      element: el,
      priority: parseInt(el.dataset.priority, 10) || 5,
      type: 'action',
      info: el.dataset.nextAction || el.innerText?.slice(0, 50),
    });
  });

  // Collect elements with data-assistant-target attribute
  const assistantTargets = document.querySelectorAll('[data-assistant-target]');
  assistantTargets.forEach((el) => {
    targets.push({
      element: el,
      priority: parseInt(el.dataset.priority, 10) || 3,
      type: 'target',
      info: el.dataset.assistantTarget || el.innerText?.slice(0, 50),
    });
  });

  // Sort by priority (lower = higher priority)
  targets.sort((a, b) => a.priority - b.priority);

  return targets;
}

/**
 * Check if element is visible in viewport
 * @param {HTMLElement} element
 * @returns {boolean}
 */
function isElementVisible(element) {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth &&
    rect.width > 0 &&
    rect.height > 0
  );
}

/**
 * useTargetScanning - Hook for scanning DOM for targets
 *
 * @param {Object} options
 * @param {boolean} options.enabled - Whether scanning is enabled
 * @param {boolean} options.paused - Whether scanning is paused
 * @param {number} options.interval - Scan interval in ms
 * @returns {Object} Targets and navigation functions
 */
export default function useTargetScanning({
  enabled = true,
  paused = false,
  interval = SCAN_INTERVAL,
} = {}) {
  const [targets, setTargets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTarget, setCurrentTarget] = useState(null);
  const targetsRef = useRef([]);
  const scanTimerRef = useRef(null);

  // Scan for targets
  const scanTargets = useCallback(() => {
    if (!enabled || paused) return;

    const newTargets = collectTargetsFromDOM();
    targetsRef.current = newTargets;
    setTargets(newTargets);

    // If we have targets and no current target, select first
    if (newTargets.length > 0 && currentIndex === -1) {
      setCurrentIndex(0);
      setCurrentTarget(newTargets[0]);
    }
  }, [enabled, paused, currentIndex]);

  // Navigate to next target
  const nextTarget = useCallback(() => {
    const allTargets = targetsRef.current;
    if (allTargets.length === 0) return null;

    const newIndex = (currentIndex + 1) % allTargets.length;
    setCurrentIndex(newIndex);
    setCurrentTarget(allTargets[newIndex]);
    return allTargets[newIndex];
  }, [currentIndex]);

  // Navigate to previous target
  const prevTarget = useCallback(() => {
    const allTargets = targetsRef.current;
    if (allTargets.length === 0) return null;

    const newIndex = currentIndex <= 0 ? allTargets.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setCurrentTarget(allTargets[newIndex]);
    return allTargets[newIndex];
  }, [currentIndex]);

  // Go to specific target
  const goToTarget = useCallback((index) => {
    const allTargets = targetsRef.current;
    if (index < 0 || index >= allTargets.length) return null;

    setCurrentIndex(index);
    setCurrentTarget(allTargets[index]);
    return allTargets[index];
  }, []);

  // Clear current target
  const clearTarget = useCallback(() => {
    setCurrentIndex(-1);
    setCurrentTarget(null);
  }, []);

  // Get visible targets only
  const getVisibleTargets = useCallback(() => {
    return targetsRef.current.filter((t) => isElementVisible(t.element));
  }, []);

  // Setup scanning interval
  useEffect(() => {
    if (!enabled) return;

    // Initial scan
    scanTargets();

    // Setup interval
    scanTimerRef.current = setInterval(scanTargets, interval);

    return () => {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
      }
    };
  }, [enabled, interval, scanTargets]);

  // Re-scan when paused state changes
  useEffect(() => {
    if (!paused && enabled) {
      scanTargets();
    }
  }, [paused, enabled, scanTargets]);

  return {
    targets,
    currentTarget,
    currentIndex,
    totalTargets: targets.length,
    nextTarget,
    prevTarget,
    goToTarget,
    clearTarget,
    scanTargets,
    getVisibleTargets,
    hasTargets: targets.length > 0,
  };
}

