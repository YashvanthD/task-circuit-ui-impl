/**
 * AssistantFab Component
 * Floating action button for the assistant.
 *
 * @module components/assistant/AssistantFab
 */

import React from 'react';
import { Fab, Badge, Tooltip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Z_INDEX, TRANSITION_MS } from './constants';

// Tooltip props to ensure tooltips appear above everything
const tooltipSlotProps = {
  popper: {
    sx: {
      zIndex: Z_INDEX.controlPanel + 10,
    },
  },
};

/**
 * AssistantFab - The main floating button for the assistant
 *
 * @param {Object} props
 * @param {Object} props.position - { left, top } or { right, bottom } position
 * @param {boolean} props.isDragging - Whether currently being dragged
 * @param {boolean} props.paused - Whether assistant is paused
 * @param {boolean} props.hasAlert - Whether there's an active alert
 * @param {boolean} props.isListening - Whether mic is active
 * @param {boolean} props.isSpeaking - Whether TTS is active
 * @param {boolean} props.pinnedBottomRight - Whether pinned to bottom-right
 * @param {Function} props.onMouseDown - Drag start handler
 * @param {Function} props.onMouseEnter - Hover start handler
 * @param {Function} props.onMouseLeave - Hover end handler
 * @param {Function} props.onClick - Click handler
 */
export default function AssistantFab({
  position,
  isDragging = false,
  paused = false,
  hasAlert = false,
  isListening = false,
  isSpeaking = false,
  pinnedBottomRight = false,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  const getColor = () => {
    if (isListening) return 'error';
    if (isSpeaking) return 'secondary';
    if (paused) return 'default';
    return 'primary';
  };

  // Build position styles based on whether it's bottom-right pinned
  const positionStyles = pinnedBottomRight
    ? {
        right: position.right || 20,
        bottom: position.bottom || 20,
        left: 'auto',
        top: 'auto',
      }
    : {
        left: position.left,
        top: position.top,
      };

  return (
    <Tooltip title={paused ? 'Assistant paused' : 'AI Assistant'} placement="right" slotProps={tooltipSlotProps}>
      <Fab
        color={getColor()}
        size="medium"
        sx={{
          position: 'fixed',
          ...positionStyles,
          zIndex: Z_INDEX.fab,
          transition: isDragging ? 'none' : `all ${TRANSITION_MS}ms ease-in-out`,
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: paused ? 0.6 : 1,
          boxShadow: isListening
            ? '0 0 0 4px rgba(244, 67, 54, 0.3)'
            : isSpeaking
            ? '0 0 0 4px rgba(156, 39, 176, 0.3)'
            : 3,
          '&:hover': {
            transform: isDragging ? 'none' : 'scale(1.1)',
          },
          animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
          '@keyframes pulse': {
            '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)' },
            '70%': { boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)' },
            '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' },
          },
        }}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <Badge
          color="error"
          variant="dot"
          invisible={!hasAlert}
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <SmartToyIcon />
        </Badge>
      </Fab>
    </Tooltip>
  );
}

