/**
 * FilterSelect Component
 * Reusable dropdown filter component.
 *
 * @module components/common/FilterSelect
 */

import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

/**
 * FilterSelect - Reusable filter dropdown
 *
 * @param {Object} props
 * @param {string} props.label - Label for the select
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Array of { value, label, icon? }
 * @param {string} props.allLabel - Label for "all" option (default: "All")
 * @param {boolean} props.showAll - Whether to show "All" option (default: true)
 * @param {string} props.size - Size ('small' | 'medium')
 * @param {number} props.minWidth - Minimum width
 * @param {boolean} props.fullWidth - Full width mode
 * @param {boolean} props.disabled - Disabled state
 */
export default function FilterSelect({
  label,
  value = 'all',
  onChange,
  options = [],
  allLabel = 'All',
  showAll = true,
  size = 'small',
  minWidth = 130,
  fullWidth = false,
  disabled = false,
}) {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <FormControl
      size={size}
      sx={{ minWidth, ...(fullWidth && { width: '100%' }) }}
      disabled={disabled}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={handleChange}
      >
        {showAll && (
          <MenuItem value="all">
            {allLabel} {label}
          </MenuItem>
        )}
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.icon && <span style={{ marginRight: 8 }}>{opt.icon}</span>}
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

