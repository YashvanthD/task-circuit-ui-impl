/**
 * ActionButton Component
 * Centralized, reusable action button with consistent styling
 * Theme-aware, responsive, and follows MUI best practices
 *
 * @module components/common/ActionButton
 */

import React from 'react';
import { Button, IconButton, Tooltip, CircularProgress } from '@mui/material';

/**
 * ActionButton - Reusable action button with best practices
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button text
 * @param {React.ReactNode} props.icon - Button icon
 * @param {string} props.tooltip - Tooltip text
 * @param {Function} props.onClick - Click handler
 * @param {string} props.color - Button color (primary|secondary|error|warning|info|success)
 * @param {string} props.variant - Button variant ('contained'|'outlined'|'text')
 * @param {string} props.size - Button size ('small'|'medium'|'large')
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.iconOnly - Icon-only mode
 * @param {boolean} props.fullWidth - Full width mode
 * @param {string} props.type - Button type (button|submit|reset)
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
  type = 'button',
  sx = {},
  ...rest
}) {
  const isDisabled = disabled || loading;

  // Default responsive button styles
  const defaultSx = {
    minWidth: fullWidth ? '100%' : { xs: iconOnly ? 'auto' : 100, sm: iconOnly ? 'auto' : 120 },
    textTransform: 'none', // Better readability
    fontWeight: 600,
    ...sx,
  };

  // Icon-only button
  if (iconOnly && icon) {
    const iconButton = (
      <IconButton
        onClick={onClick}
        color={color}
        size={size}
        disabled={isDisabled}
        type={type}
        sx={{
          bgcolor: variant === 'contained' ? `${color}.main` : 'transparent',
          color: variant === 'contained' ? `${color}.contrastText` : `${color}.main`,
          '&:hover': variant === 'contained' ? {
            bgcolor: `${color}.dark`,
          } : {},
          ...sx,
        }}
        {...rest}
      >
        {loading ? <CircularProgress size={20} color="inherit" /> : icon}
      </IconButton>
    );

    return tooltip ? (
      <Tooltip title={tooltip} arrow>
        <span>{iconButton}</span>
      </Tooltip>
    ) : iconButton;
  }

  // Regular button
  const button = (
    <Button
      onClick={onClick}
      color={color}
      variant={variant}
      size={size}
      disabled={isDisabled}
      fullWidth={fullWidth}
      type={type}
      startIcon={!loading && icon ? icon : undefined}
      sx={defaultSx}
      {...rest}
    >
      {loading ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        children
      )}
    </Button>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow>
      <span>{button}</span>
    </Tooltip>
  ) : button;
}

