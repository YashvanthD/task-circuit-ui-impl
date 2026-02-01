/**
 * FormField Component
 * Reusable form field wrapper with consistent sizing and responsive behavior
 *
 * @module components/common/forms/FormField
 */

import React from 'react';
import { Grid, TextField, InputAdornment, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * FormField - Wrapper for form inputs with responsive grid
 *
 * @param {Object} props
 * @param {number} props.xs - Grid cols on mobile (default: 12)
 * @param {number} props.sm - Grid cols on tablet (default: 6)
 * @param {number} props.md - Grid cols on desktop
 * @param {number} props.lg - Grid cols on large desktop
 * @param {string} props.label - Field label
 * @param {string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.type - Input type (text, number, date, etc.)
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.multiline - Multiline text
 * @param {number} props.rows - Rows for multiline
 * @param {string} props.unit - Unit to show (e.g., "kg", "m", "₹")
 * @param {string} props.unitPosition - "start" or "end" (default: "end")
 * @param {Function} props.onRefresh - Optional refresh button callback
 * @param {Object} props.inputProps - Additional input props
 */
export default function FormField({
  xs = 12,
  sm = 6,
  md,
  lg,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  helperText,
  required = false,
  disabled = false,
  multiline = false,
  rows = 1,
  unit,
  unitPosition = 'end',
  onRefresh,
  inputProps,
  ...rest
}) {
  const adornment = unit ? (
    <InputAdornment position={unitPosition}>{unit}</InputAdornment>
  ) : null;

  const refreshAdornment = onRefresh ? (
    <InputAdornment position="end">
      <IconButton onClick={onRefresh} size="small" edge="end">
        <RefreshIcon />
      </IconButton>
    </InputAdornment>
  ) : null;

  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg}>
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        helperText={helperText}
        required={required}
        disabled={disabled}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        fullWidth
        InputProps={{
          startAdornment: unitPosition === 'start' ? adornment : undefined,
          endAdornment: unitPosition === 'end' ? (adornment || refreshAdornment) : refreshAdornment,
        }}
        inputProps={inputProps}
        sx={{
          minWidth: { xs: '100%', sm: 180 },
        }}
        {...rest}
      />
    </Grid>
  );
}
