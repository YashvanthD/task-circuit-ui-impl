/**
 * FormPhotoUpload - Enhanced photo upload with camera support
 */
import React, { useRef, useState } from 'react';
import { Grid, Box, Typography, Button, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';

export default function FormPhotoUpload({
  xs = 12,
  sm = 6,
  label = 'Photos',
  value = [], // Array of files or URLs
  onChange,
  maxPhotos = 3,
  disabled = false,
  helperText,
}) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && onChange) {
      // Append new files to existing value
      const newPhotos = [...(Array.isArray(value) ? value : []), ...files].slice(0, maxPhotos);
      onChange(newPhotos);
    }
  };

  const handleRemove = (index) => {
    if (onChange) {
      const newPhotos = [...(Array.isArray(value) ? value : [])];
      newPhotos.splice(index, 1);
      onChange(newPhotos);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const currentPhotos = Array.isArray(value) ? value : [];

  return (
    <Grid item xs={xs} sm={sm}>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {label} ({currentPhotos.length}/{maxPhotos})
        </Typography>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={disabled || currentPhotos.length >= maxPhotos}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {currentPhotos.map((photo, index) => {
            const previewUrl = photo instanceof File ? URL.createObjectURL(photo) : photo;
            return (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid #eee'
                }}
              >
                <img
                  src={previewUrl}
                  alt={`Photo ${index}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemove(index)}
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                    p: 0.5
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}

          {currentPhotos.length < maxPhotos && (
            <Button
              variant="outlined"
              onClick={handleClick}
              disabled={disabled}
              sx={{
                width: 100,
                height: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                borderStyle: 'dashed',
                color: 'text.secondary'
              }}
            >
              <AddAPhotoIcon />
              <Typography variant="caption">Add Photo</Typography>
            </Button>
          )}
        </Box>
        {helperText && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {helperText}
          </Typography>
        )}
      </Box>
    </Grid>
  );
}
