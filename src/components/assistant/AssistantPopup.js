/**
 * AssistantPopup Component
 * Popup message display for the assistant.
 *
 * @module components/assistant/AssistantPopup
 */

import React from 'react';
import { Paper, Typography, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Z_INDEX, TRANSITION_MS } from './constants';

/**
 * AssistantPopup - Popup message display
 *
 * @param {Object} props
 * @param {boolean} props.visible - Whether popup is visible
 * @param {string} props.text - Popup text
 * @param {Object} props.position - { left, top } position
 * @param {string} props.placement - Popup placement ('top' | 'bottom' | 'left' | 'right')
 * @param {Function} props.onClose - Close handler
 */
export default function AssistantPopup({
  visible,
  text,
  position,
  placement = 'top',
  onClose,
}) {
  if (!visible || !text) return null;

  const getPlacementStyles = () => {
    switch (placement) {
      case 'bottom':
        return { top: position.top + 70, left: position.left - 50 };
      case 'left':
        return { top: position.top, left: position.left - 200 };
      case 'right':
        return { top: position.top, left: position.left + 70 };
      default: // top
        return { top: position.top - 80, left: position.left - 50 };
    }
  };

  const placementStyles = getPlacementStyles();

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        ...placementStyles,
        zIndex: Z_INDEX.popup,
        p: 1.5,
        pr: 4,
        borderRadius: 2,
        maxWidth: 280,
        minWidth: 150,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'primary.light',
        transition: `opacity ${TRANSITION_MS / 2}ms, transform ${TRANSITION_MS / 2}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.9)',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 12,
          height: 12,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'primary.light',
          borderRight: 'none',
          borderTop: 'none',
          transform: 'rotate(45deg)',
          ...(placement === 'top'
            ? { bottom: -7, left: 60 }
            : placement === 'bottom'
            ? { top: -7, left: 60, transform: 'rotate(-135deg)' }
            : placement === 'left'
            ? { right: -7, top: 20, transform: 'rotate(-45deg)' }
            : { left: -7, top: 20, transform: 'rotate(135deg)' }),
        },
      }}
    >
      <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
        {text}
      </Typography>
      {onClose && (
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            padding: 0.5,
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}
    </Paper>
  );
}

