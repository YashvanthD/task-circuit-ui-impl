import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Stack,
  CircularProgress
} from '@mui/material';

import fishUtil from '../../../utils/fish';
import pondUtil from '../../../utils/pond';

export default function StockForm({
  initialData = {},
  onSubmit,
  onCancel,
  mode = 'add'
}) {
  const [formData, setFormData] = useState({
    species_id: '',
    pond_id: '',
    initial_count: '',
    initial_avg_weight_g: '',
    stocking_date: new Date().toISOString().split('T')[0],
    source: '',
    batch_number: '',
    notes: '',
    ...initialData
  });

  const [speciesList, setSpeciesList] = useState([]);
  const [pondList, setPondList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fishRes, pondRes] = await Promise.all([
          fishUtil.getFishList(),
          pondUtil.getPonds() // Updated method name
        ]);
        setSpeciesList(fishRes.data || []);
        setPondList(pondRes.data || []);
      } catch (err) {
        console.error('Failed to load form options', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Format date if needed, or pass as is
    onSubmit(formData).finally(() => setLoading(false));
  };

  return (
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Species"
              value={formData.species_id}
              onChange={(e) => handleChange('species_id', e.target.value)}
              disabled={mode === 'edit'} // Usually can't change species of existing stock
              required
            >
              {speciesList.map((species) => (
                <MenuItem key={species.id || species.species_id} value={species.id || species.species_id}>
                  {species.common_name} ({species.scientific_name})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Pond"
              value={formData.pond_id}
              onChange={(e) => handleChange('pond_id', e.target.value)}
              required
            >
              {pondList.map((pond) => (
                <MenuItem key={pond.id || pond.pond_id} value={pond.id || pond.pond_id}>
                  {pond.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Initial Count"
              type="number"
              value={formData.initial_count}
              onChange={(e) => handleChange('initial_count', e.target.value)}
              required
              disabled={mode === 'edit'} // Might be editable but usually fixed
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Initial Avg Weight (g)"
              type="number"
              value={formData.initial_avg_weight_g}
              onChange={(e) => handleChange('initial_avg_weight_g', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="Stocking Date"
              value={formData.stocking_date}
              onChange={(e) => handleChange('stocking_date', e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Batch Number"
              value={formData.batch_number}
              onChange={(e) => handleChange('batch_number', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Source"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {mode === 'add' ? 'Create Stock' : 'Update Stock'}
          </Button>
        </Stack>
      </form>
  );
}
