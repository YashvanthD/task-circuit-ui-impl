/**
 * FormRadio Component
 * Reusable radio button group
 *
 * @module components/common/forms/FormRadio
 */

import React from 'react';
import {
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material';

/**
 * FormRadio - Radio button group
 *
 * @param {Object} props
 * @param {number} props.xs - Grid cols on mobile (default: 12)
 * @param {number} props.sm - Grid cols on tablet (default: 6)
 * @param {string} props.label - Field label
 * @param {*} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Array of {label, value} objects
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.helperText - Helper text
 * @param {string} props.row - Horizontal layout (default: false)
 */
export default function FormRadio({
  xs = 12,
  sm = 6,
  md,
  lg,
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  helperText,
  row = false,
  ...rest
}) {
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg}>
      <FormControl component="fieldset" required={required} disabled={disabled} fullWidth>
        <FormLabel component="legend">{label}</FormLabel>
        <RadioGroup
          value={value}
          onChange={(e) => onChange && onChange(e, e.target.value)}
          row={row}
          {...rest}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              label={option.label}
            />
          ))}
        </RadioGroup>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </Grid>
  );
}
