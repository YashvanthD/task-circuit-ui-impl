/**
 * AssistantHand Component
 * Animated pointing hand for the assistant.
 *
 * @module components/assistant/AssistantHand
 */

import React from 'react';
import { Box } from '@mui/material';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { Z_INDEX, TRANSITION_MS, HAND_ROTATE_OFFSET } from './constants';

/**
 * Calculate hand style based on assistant and target positions
 * @param {Object} fabPosition - { left, top } position of assistant fab
 * @param {HTMLElement} targetElement - Target element to point at
 * @returns {Object|null} Style object or null if no hand should show
 */
export function computeHandStyle(fabPosition, targetElement) {
  if (!fabPosition || !targetElement) return null;

  try {
    const fabCenterX = fabPosition.left + 28;
    const fabCenterY = fabPosition.top + 28;

    const targetRect = targetElement.getBoundingClientRect();
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    // Calculate angle from fab to target
    const deltaX = targetCenterX - fabCenterX;
    const deltaY = targetCenterY - fabCenterY;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + HAND_ROTATE_OFFSET;

    // Calculate distance
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Position hand at edge of fab, pointing toward target
    const handDistance = Math.min(40, distance * 0.3);
    const handX = fabCenterX + Math.cos((angle - HAND_ROTATE_OFFSET) * (Math.PI / 180)) * handDistance;
    const handY = fabCenterY + Math.sin((angle - HAND_ROTATE_OFFSET) * (Math.PI / 180)) * handDistance;

    return {
      left: handX - 12,
      top: handY - 12,
      rotation: angle,
      moveDistance: Math.min(8, distance * 0.05),
    };
  } catch (e) {
    return null;
  }
}

/**
 * AssistantHand - Animated pointing hand
 *
 * @param {Object} props
 * @param {Object} props.style - Hand style { left, top, rotation, moveDistance }
 * @param {boolean} props.visible - Whether hand is visible
 */
export default function AssistantHand({ style, visible }) {
  if (!visible || !style) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        left: style.left,
        top: style.top,
        zIndex: Z_INDEX.hand,
        pointerEvents: 'none',
        transition: `all ${TRANSITION_MS}ms ease-in-out`,
        transform: `rotate(${style.rotation}deg)`,
        '--ra-hand-move': `${style.moveDistance}px`,
        animation: 'ra-hand-point 1s ease-in-out infinite',
      }}
    >
      <TouchAppIcon
        sx={{
          fontSize: 24,
          color: 'primary.main',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      />
    </Box>
  );
}

