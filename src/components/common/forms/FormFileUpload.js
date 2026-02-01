/**
 * FormFileUpload Component
 * Reusable file/media upload field
 *
 * @module components/common/forms/FormFileUpload
 */

import React, { useRef } from 'react';
import { Grid, Box, Button, Typography, IconButton, Chip } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';

/**
 * FormFileUpload - File upload field with preview
 *
 * @param {Object} props
 * @param {number} props.xs - Grid cols on mobile (default: 12)
 * @param {number} props.sm - Grid cols on tablet (default: 6)
 * @param {string} props.label - Field label
 * @param {File|string} props.value - Selected file or URL
 * @param {Function} props.onChange - Change handler (file) => {}
 * @param {Function} props.onRemove - Remove handler
 * @param {string} props.accept - Accepted file types (e.g., "image/*")
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.helperText - Helper text
 * @param {boolean} props.showPreview - Show image preview (default: true)
 */
export default function FormFileUpload({
  xs = 12,
  sm = 6,
  md,
  lg,
  label,
  value,
  onChange,
  onRemove,
  accept = 'image/*',
  required = false,
  disabled = false,
  helperText,
  showPreview = true,
  ...rest
}) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && onChange) {
      onChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const previewUrl = value instanceof File ? URL.createObjectURL(value) : value;
  const fileName = value instanceof File ? value.name : typeof value === 'string' ? value.split('/').pop() : '';

  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg}>
      <Box sx={{ minWidth: { xs: '100%', sm: 180 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {label}
          {required && <span style={{ color: 'error.main' }}> *</span>}
        </Typography>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={disabled}
          {...rest}
        />

        {value ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {showPreview && previewUrl && accept.includes('image') && (
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  width: '100%',
                  maxWidth: 200,
                  height: 'auto',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider', // Theme-aware border
                }}
              />
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<ImageIcon />}
                label={fileName || 'File selected'}
                size="small"
                sx={{ flex: 1 }}
              />
              <IconButton onClick={handleRemove} size="small" color="error" disabled={disabled}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={handleClick}
            disabled={disabled}
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            Choose File
          </Button>
        )}

        {helperText && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {helperText}
          </Typography>
        )}
      </Box>
    </Grid>
  );
}
