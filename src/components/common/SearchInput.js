/**
 * SearchInput Component
 * Centralized, reusable search input with consistent styling
 * Theme-aware, responsive, and follows MUI best practices
 *
 * @module components/common/SearchInput
 */

import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

/**
 * SearchInput - Reusable search input with best practices
 *
 * @param {Object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.size - Size ('small'|'medium')
 * @param {boolean} props.fullWidth - Full width mode
 * @param {number} props.minWidth - Minimum width (default: 200)
 * @param {number} props.maxWidth - Maximum width (default: 400)
 * @param {boolean} props.showClear - Show clear button when has value (default: true)
 * @param {Function} props.onClear - Clear handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.label - Optional label
 * @param {Object} props.sx - Additional sx styles
 */
export default function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search...',
  size = 'small',
  fullWidth = false,
  minWidth = 200,
  maxWidth = 400,
  showClear = true,
  onClear,
  disabled = false,
  label,
  sx = {},
  ...rest
}) {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  const handleClear = () => {
    onChange?.('');
    onClear?.();
  };

  return (
    <TextField
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      label={label}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'text.secondary' }} />
          </InputAdornment>
        ),
        endAdornment: showClear && value ? (
          <InputAdornment position="end">
            <IconButton
              onClick={handleClear}
              size="small"
              edge="end"
              aria-label="clear search"
              sx={{ color: 'text.secondary' }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      sx={{
        minWidth: fullWidth ? '100%' : { xs: '100%', sm: minWidth },
        maxWidth: fullWidth ? '100%' : maxWidth,
        bgcolor: 'background.paper',
        '& .MuiOutlinedInput-root': {
          '&:hover': {
            bgcolor: 'action.hover',
          },
        },
        ...sx,
      }}
      {...rest}
    />
  );
}

