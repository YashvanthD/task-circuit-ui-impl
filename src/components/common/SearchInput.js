/**
 * SearchInput Component
 * Reusable search input with icon.
 *
 * @module components/common/SearchInput
 */

import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

/**
 * SearchInput - Reusable search input
 *
 * @param {Object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.size - Size ('small' | 'medium')
 * @param {boolean} props.fullWidth - Full width mode
 * @param {number} props.minWidth - Minimum width
 * @param {number} props.maxWidth - Maximum width
 * @param {boolean} props.showClear - Show clear button when has value
 * @param {Function} props.onClear - Clear handler
 * @param {boolean} props.disabled - Disabled state
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
      placeholder={placeholder}
      size={size}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      sx={{
        minWidth,
        maxWidth,
        ...(fullWidth && { width: '100%', maxWidth: 'none' }),
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          backgroundColor: 'grey.50',
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: showClear && value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} edge="end">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
}

