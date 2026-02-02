/**
 * PhotoGallery - Grid view for photos with lightbox support
 */
import React, { useState } from 'react';
import { Box, ImageList, ImageListItem, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function PhotoGallery({ photos = [], cols = 3, rowHeight = 164 }) {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpen = (img) => {
    setSelectedImage(img);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <Box>
      <ImageList cols={cols} rowHeight={rowHeight}>
        {photos.map((item, index) => (
          <ImageListItem key={index} onClick={() => handleOpen(item)} sx={{ cursor: 'pointer' }}>
            <img
              src={`${item.url}?w=${rowHeight}&h=${rowHeight}&fit=crop&auto=format`}
              srcSet={`${item.url}?w=${rowHeight}&h=${rowHeight}&fit=crop&auto=format&dpr=2 2x`}
              alt={item.title || `Photo ${index + 1}`}
              loading="lazy"
              style={{ borderRadius: 8 }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Modal open={open} onClose={handleClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', outline: 'none' }}>
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', top: -40, right: 0, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}
