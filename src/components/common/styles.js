/**
 * Common Styles and Theme Constants
 * Centralized styling for consistent UI across the application.
 *
 * @module components/common/styles
 */

// ============================================================================
// Color Palette
// ============================================================================

export const COLORS = {
  // Primary
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  // Secondary
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  // Status colors
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    bg: '#e8f5e9',
  },
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
    bg: '#fff3e0',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    bg: '#ffebee',
  },
  info: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    bg: '#e3f2fd',
  },
  // Neutral
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// ============================================================================
// Spacing
// ============================================================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ============================================================================
// Border Radius
// ============================================================================

export const BORDER_RADIUS = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: '50%',
};

// ============================================================================
// Shadows
// ============================================================================

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.15)',
};

// ============================================================================
// Common Component Styles
// ============================================================================

export const cardStyles = {
  base: {
    borderRadius: BORDER_RADIUS.lg,
    transition: 'all 0.2s ease-in-out',
  },
  hoverable: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 6,
    },
  },
  clickable: {
    cursor: 'pointer',
    '&:hover': {
      boxShadow: 4,
    },
  },
};

export const inputStyles = {
  base: {
    '& .MuiOutlinedInput-root': {
      borderRadius: BORDER_RADIUS.md,
    },
  },
  search: {
    '& .MuiOutlinedInput-root': {
      borderRadius: BORDER_RADIUS.lg,
      backgroundColor: COLORS.grey[50],
    },
  },
};

export const buttonStyles = {
  rounded: {
    borderRadius: BORDER_RADIUS.lg,
  },
  pill: {
    borderRadius: 20,
  },
};

export const chipStyles = {
  status: {
    fontWeight: 600,
    '& .MuiChip-label': { px: 1 },
  },
};

// ============================================================================
// Layout Styles
// ============================================================================

export const containerStyles = {
  page: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: { xs: 2, sm: 3, md: 4 },
  },
  section: {
    marginBottom: 3,
  },
};

export const flexStyles = {
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  between: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  start: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  end: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
};

// ============================================================================
// Animation Keyframes
// ============================================================================

export const animations = {
  fadeIn: {
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    animation: 'fadeIn 0.3s ease-in-out',
  },
  slideUp: {
    '@keyframes slideUp': {
      from: { transform: 'translateY(10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    animation: 'slideUp 0.3s ease-in-out',
  },
  pulse: {
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)' },
    },
    animation: 'pulse 1s ease-in-out infinite',
  },
};

