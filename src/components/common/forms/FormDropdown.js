/**
 * FormDropdown Component
 * Reusable dropdown/autocomplete with refresh option
 *
 * @module components/common/forms/FormDropdown
 */

import React from 'react';
import {
  Grid,
  TextField,
  Autocomplete,
  Box,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * FormDropdown - Dropdown field with optional refresh button
 *
 * @param {Object} props
 * @param {number} props.xs - Grid cols on mobile (default: 12)
 * @param {number} props.sm - Grid cols on tablet (default: 6)
 * @param {number} props.md - Grid cols on desktop
 * @param {number} props.lg - Grid cols on large desktop
 * @param {string} props.label - Field label
 * @param {*} props.value - Selected value
 * @param {Function} props.onChange - Change handler (e, value) => {}
 * @param {Array} props.options - Array of options
 * @param {Function} props.getOptionLabel - Get label from option
 * @param {boolean} props.multiple - Multi-select mode
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRefresh - Refresh callback
 * @param {boolean} props.showRefresh - Show refresh button (default: true if onRefresh provided)
 */
export default function FormDropdown({
  xs = 12,
  sm = 6,
  md,
  lg,
  label,
  value,
  onChange,
  options = [],
  getOptionLabel,
  multiple = false,
  required = false,
  disabled = false,
  helperText,
  loading = false,
  onRefresh,
  showRefresh = true,
  ...rest
}) {
  const hasRefresh = onRefresh && showRefresh;

  return (
    <Grid item xs={12}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Autocomplete
            multiple={multiple}
            options={options}
            getOptionLabel={getOptionLabel || ((opt) => opt.label || opt.name || String(opt))}
            value={value}
            onChange={onChange}
            loading={loading}
            disabled={disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                required={required}
                helperText={helperText}
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderTags={
              multiple
                ? (value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={getOptionLabel ? getOptionLabel(option) : (option.label || option.name || String(option))}
                        size="small"
                        {...getTagProps({ index })}
                        key={option.id || option.value || index}
                      />
                    ))
                : undefined
            }
            sx={{ minWidth: { xs: '100%', sm: 250 } }}
            {...rest}
          />
        </Box>
        {hasRefresh && (
          <IconButton
            onClick={onRefresh}
            disabled={loading || disabled}
            sx={{ mt: 0.5 }}
            title="Reload options"
          >
            <RefreshIcon />
          </IconButton>
        )}
      </Box>
    </Grid>
  );
}
