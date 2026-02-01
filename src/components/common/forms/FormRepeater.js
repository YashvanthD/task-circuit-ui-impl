/**
 * FormRepeater Component
 * Reusable component for adding/removing multiple items (e.g., multiple fish entries)
 *
 * @module components/common/forms/FormRepeater
 */

import React from 'react';
import { Grid, Box, IconButton, Typography, Divider, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * FormRepeater - Repeatable form section for multiple items
 *
 * @param {Object} props
 * @param {string} props.label - Section label (e.g., "Fish Entries")
 * @param {Array} props.value - Array of items
 * @param {Function} props.onChange - Change handler (newArray) => {}
 * @param {Function} props.renderItem - Render function (item, index, handleChange) => ReactNode
 * @param {Function} props.getDefaultItem - Function to create new item
 * @param {number} props.minItems - Minimum number of items (default: 0)
 * @param {number} props.maxItems - Maximum number of items
 * @param {string} props.addButtonText - Add button text
 */
export default function FormRepeater({
  label,
  value = [],
  onChange,
  renderItem,
  getDefaultItem,
  minItems = 0,
  maxItems,
  addButtonText = 'Add Item',
}) {
  const handleAdd = () => {
    if (onChange && getDefaultItem && (!maxItems || value.length < maxItems)) {
      onChange([...value, getDefaultItem()]);
    }
  };

  const handleRemove = (index) => {
    if (onChange && value.length > minItems) {
      const newValue = value.filter((_, i) => i !== index);
      onChange(newValue);
    }
  };

  const handleItemChange = (index, updatedItem) => {
    if (onChange) {
      const newValue = value.map((item, i) => (i === index ? updatedItem : item));
      onChange(newValue);
    }
  };

  return (
    <Grid item xs={12}>
      {label && (
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
          {label}
        </Typography>
      )}

      {value.map((item, index) => (
        <Box
          key={index}
          sx={{
            mb: 3,
            p: 2,
            border: '1px solid',
            borderColor: 'divider', // Theme-aware border
            borderRadius: 1,
            position: 'relative',
            bgcolor: 'background.default', // Theme-aware background
          }}
        >
          {/* Delete button */}
          {value.length > minItems && (
            <IconButton
              onClick={() => handleRemove(index)}
              color="error"
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteIcon />
            </IconButton>
          )}

          {/* Item content */}
          <Box sx={{ pr: 5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Item #{index + 1}
            </Typography>
            {renderItem(item, index, (updatedItem) => handleItemChange(index, updatedItem))}
          </Box>
        </Box>
      ))}

      {/* Add button */}
      {(!maxItems || value.length < maxItems) && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ mt: value.length > 0 ? 2 : 0 }}
        >
          {addButtonText}
        </Button>
      )}
    </Grid>
  );
}
