/**
 * Pond Forms Integration Example
 *
 * This file demonstrates how to use the optimized pond forms.
 * Copy these examples to your actual pages/components as needed.
 */

import React, { useState } from 'react';
import { Box, Button, Stack, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { AddPondForm, UpdatePondForm, WaterQualityForm } from './index';

/**
 * Example 1: Create New Pond
 */
export function CreatePondExample({ farmId }) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (pond) => {
    console.log('Pond created:', pond);
    setOpen(false);
    // Refresh pond list, navigate to pond details, etc.
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Add New Pond
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Pond</DialogTitle>
        <DialogContent>
          <AddPondForm
            farmId={farmId}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Example 2: Update Pond Details
 */
export function EditPondExample({ pondId, currentPond }) {
  const [editMode, setEditMode] = useState(false);

  const handleUpdate = (updatedPond) => {
    console.log('Pond updated:', updatedPond);
    setEditMode(false);
    // Refresh pond data
  };

  return (
    <>
      {!editMode ? (
        <Button variant="outlined" onClick={() => setEditMode(true)}>
          Edit Pond
        </Button>
      ) : (
        <UpdatePondForm
          pondId={pondId}
          initialData={currentPond} // Optional - will auto-fetch if not provided
          onSuccess={handleUpdate}
          onCancel={() => setEditMode(false)}
        />
      )}
    </>
  );
}

/**
 * Example 3: Record Water Quality
 */
export function WaterQualityExample({ pondId }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSuccess = () => {
    console.log('Water quality updated');
    setModalOpen(false);
    // Refresh water quality data
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={() => setModalOpen(true)}>
        Record Water Quality
      </Button>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Water Quality Monitoring</DialogTitle>
        <DialogContent>
          <WaterQualityForm
            pondId={pondId}
            onSuccess={handleSuccess}
            onCancel={() => setModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Example 4: Complete Pond Setup Flow
 */
export function PondSetupFlow({ farmId }) {
  const [step, setStep] = useState('create'); // create -> water-quality -> complete
  const [pondId, setPondId] = useState(null);

  const handlePondCreated = (pond) => {
    setPondId(pond.pond_id);
    setStep('water-quality');
  };

  const handleWaterQualityRecorded = () => {
    setStep('complete');
    // Proceed to stocking or other operations
  };

  return (
    <Box sx={{ p: 3 }}>
      {step === 'create' && (
        <AddPondForm farmId={farmId} onSuccess={handlePondCreated} />
      )}

      {step === 'water-quality' && (
        <WaterQualityForm
          pondId={pondId}
          onSuccess={handleWaterQualityRecorded}
          onCancel={() => setStep('complete')}
        />
      )}

      {step === 'complete' && (
        <Box textAlign="center">
          <h2>Pond Setup Complete! 🎉</h2>
          <p>Your pond is ready for stocking.</p>
        </Box>
      )}
    </Box>
  );
}

/**
 * Example 5: Inline Pond Creation in Page
 */
export function InlinePondForm({ farmId, onPondCreated }) {
  return (
    <Box>
      <AddPondForm
        farmId={farmId}
        onSuccess={onPondCreated}
        // No onCancel - always visible
      />
    </Box>
  );
}
