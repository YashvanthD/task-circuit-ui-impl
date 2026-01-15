/**
 * Assistant Position Hook
 * Custom hook for managing assistant position and dragging.
 *
 * @module components/assistant/hooks/useAssistantPosition
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { INITIAL_POSITION } from '../constants';

/**
 * useAssistantPosition - Hook for assistant position management
 *
 * @param {Object} options
 * @param {Object} options.initialPosition - Initial position { left, top }
 * @returns {Object} Position state and handlers
 */
export default function useAssistantPosition({
  initialPosition = INITIAL_POSITION,
} = {}) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const positionRef = useRef(position);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Update ref when position changes
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Set position safely (updates both state and ref)
  const setPositionSafe = useCallback((updater) => {
    setPosition((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      positionRef.current = next;
      return next;
    });
  }, []);

  // Move to specific position
  const moveTo = useCallback(
    (left, top) => {
      // Ensure position stays within viewport
      const maxLeft = window.innerWidth - 56;
      const maxTop = window.innerHeight - 56;
      setPositionSafe({
        left: Math.max(0, Math.min(left, maxLeft)),
        top: Math.max(0, Math.min(top, maxTop)),
      });
    },
    [setPositionSafe]
  );

  // Move to element
  const moveToElement = useCallback(
    (element) => {
      if (!element) return;

      try {
        const rect = element.getBoundingClientRect();
        const targetLeft = rect.left + rect.width / 2 - 28;
        const targetTop = rect.top - 60;

        moveTo(targetLeft, targetTop);
      } catch (e) {
        console.warn('Failed to move to element', e);
      }
    },
    [moveTo]
  );

  // Random roam (move to random visible position)
  const randomRoam = useCallback(() => {
    const maxLeft = window.innerWidth - 100;
    const maxTop = window.innerHeight - 100;
    const newLeft = Math.max(20, Math.random() * maxLeft);
    const newTop = Math.max(60, Math.random() * maxTop);
    moveTo(newLeft, newTop);
  }, [moveTo]);

  // Start drag
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);

    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    dragStartRef.current = { x: clientX, y: clientY };
    dragOffsetRef.current = {
      x: clientX - positionRef.current.left,
      y: clientY - positionRef.current.top,
    };
  }, []);

  // Handle drag move
  const handleDragMove = useCallback(
    (e) => {
      if (!isDragging) return;

      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const newLeft = clientX - dragOffsetRef.current.x;
      const newTop = clientY - dragOffsetRef.current.y;

      moveTo(newLeft, newTop);
    },
    [isDragging, moveTo]
  );

  // End drag
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Setup global drag listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);

      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  return {
    position,
    positionRef,
    isDragging,
    setPosition: setPositionSafe,
    moveTo,
    moveToElement,
    randomRoam,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}

