/**
 * ActionButton Component
 * Reusable action button with consistent styling.
 *
 * @module components/common/ActionButton
 */

import React from 'react';
import { Button, IconButton, Tooltip, CircularProgress } from '@mui/material';

/**
 * ActionButton - Reusable action button
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button text
 * @param {React.ReactNode} props.icon - Button icon
 * @param {string} props.tooltip - Tooltip text
 * @param {Function} props.onClick - Click handler
 * @param {string} props.color - Button color
 * @param {string} props.variant - Button variant ('contained' | 'outlined' | 'text')
 * @param {string} props.size - Button size ('small' | 'medium' | 'large')
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.iconOnly - Icon-only mode
 * @param {boolean} props.fullWidth - Full width mode
 * @param {Object} props.sx - Additional sx styles
 */
export default function ActionButton({
  children,
  icon,
  tooltip,
  onClick,
  color = 'primary',
  variant = 'contained',
  size = 'medium',
  loading = false,
  disabled = false,
  iconOnly = false,
  fullWidth = false,
  sx = {},
}) {
  const isDisabled = disabled || loading;

  // Icon-only button
  if (iconOnly && icon) {
    const iconButton = (
      <IconButton
        onClick={onClick}
        color={color}
        size={size}
        disabled={isDisabled}
        sx={sx}
      >
        {loading ? <CircularProgress size={20} /> : icon}
      </IconButton>
    );

    if (tooltip) {
      return (
        <Tooltip title={tooltip}>
          <span>{iconButton}</span>
        </Tooltip>
      );
    }

    return iconButton;
  }

  // Regular button
  const button = (
    <Button
      onClick={onClick}
      variant={variant}
      color={color}
      size={size}
      disabled={isDisabled}
      fullWidth={fullWidth}
      startIcon={loading ? <CircularProgress size={16} /> : icon}
      sx={{
        borderRadius: 2,
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      {children}
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
}

