/**
 * FormKeyValue Component
 * Reusable key-value pair manager (for metadata, custom fields, etc.)
 *
 * @module components/common/forms/FormKeyValue
 */

import React, { useState } from 'react';
import { Grid, Box, TextField, IconButton, Typography, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * FormKeyValue - Dynamic key-value pair editor
 *
 * @param {Object} props
 * @param {string} props.label - Section label
 * @param {Object} props.value - Object of key-value pairs
 * @param {Function} props.onChange - Change handler (newObject) => {}
 * @param {string} props.keyLabel - Label for key field (default: "Key")
 * @param {string} props.valueLabel - Label for value field (default: "Value")
 * @param {string} props.addButtonText - Add button text (default: "Add Field")
 */
export default function FormKeyValue({
  label = 'Custom Fields',
  value = {},
  onChange,
  keyLabel = 'Key',
  valueLabel = 'Value',
  addButtonText = 'Add Field',
}) {
  const [newField, setNewField] = useState({ key: '', value: '' });

  const handleAdd = () => {
    if (newField.key.trim() && onChange) {
      onChange({
        ...value,
        [newField.key.trim()]: newField.value,
      });
      setNewField({ key: '', value: '' });
    }
  };

  const handleRemove = (key) => {
    if (onChange) {
      const { [key]: removed, ...rest } = value;
      onChange(rest);
    }
  };

  const handleUpdate = (key, newValue) => {
    if (onChange) {
      onChange({
        ...value,
        [key]: newValue,
      });
    }
  };

  return (
    <Grid item xs={12}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
        {label}
      </Typography>

      <Stack spacing={2}>
        {/* Existing key-value pairs */}
        {Object.entries(value).map(([key, val]) => (
          <Box key={key} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label={keyLabel}
              value={key}
              disabled
              size="small"
              sx={{ flex: 1, minWidth: 120 }}
            />
            <TextField
              label={valueLabel}
              value={val}
              onChange={(e) => handleUpdate(key, e.target.value)}
              size="small"
              sx={{ flex: 2, minWidth: 200 }}
            />
            <IconButton onClick={() => handleRemove(key)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        {/* New field input */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            label={`New ${keyLabel}`}
            value={newField.key}
            onChange={(e) => setNewField((prev) => ({ ...prev, key: e.target.value }))}
            size="small"
            sx={{ flex: 1, minWidth: 120 }}
            placeholder="Enter field name"
          />
          <TextField
            label={`New ${valueLabel}`}
            value={newField.value}
            onChange={(e) => setNewField((prev) => ({ ...prev, value: e.target.value }))}
            size="small"
            sx={{ flex: 2, minWidth: 200 }}
            placeholder="Enter value"
          />
          <IconButton
            onClick={handleAdd}
            color="primary"
            disabled={!newField.key.trim()}
            size="small"
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Stack>
    </Grid>
  );
}
