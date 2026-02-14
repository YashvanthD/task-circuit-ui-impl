import React from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import StockForm from './forms/StockForm';

export default function StockFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = 'add'
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{mode === 'add' ? 'Add Fish Stock' : 'Edit Fish Stock'}</DialogTitle>
      <DialogContent>
        <StockForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
}
