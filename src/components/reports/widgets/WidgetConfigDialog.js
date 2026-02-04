/**
 * WidgetConfigDialog Component
 * Dialog for configuring/editing existing widgets.
 *
 * @module components/reports/widgets/WidgetConfigDialog
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Slider,
  Divider,
} from '@mui/material';
import { WIDGET_TYPES, DATA_SOURCES } from '../../../contexts/ReportContext';

const DATA_SOURCE_OPTIONS = [
  { value: DATA_SOURCES.SAMPLINGS, label: 'Samplings' },
  { value: DATA_SOURCES.HARVESTS, label: 'Harvests' },
  { value: DATA_SOURCES.FEEDINGS, label: 'Feedings' },
  { value: DATA_SOURCES.MORTALITIES, label: 'Mortalities' },
  { value: DATA_SOURCES.EXPENSES, label: 'Expenses' },
  { value: DATA_SOURCES.PURCHASES, label: 'Purchases' },
  { value: DATA_SOURCES.TRANSFERS, label: 'Transfers' },
  { value: DATA_SOURCES.TREATMENTS, label: 'Treatments' },
  { value: DATA_SOURCES.MAINTENANCE, label: 'Maintenance' },
];

/**
 * WidgetConfigDialog - Dialog for editing widget configuration
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close callback
 * @param {Object} props.widget - Widget to edit
 * @param {Function} props.onSave - Save callback (receives updated widget)
 */
export default function WidgetConfigDialog({ open, onClose, widget, onSave }) {
  const [config, setConfig] = useState({
    title: '',
    subtitle: '',
    dataSource: null,
    size: { cols: 6, rows: 2 },
    config: {},
  });

  useEffect(() => {
    if (widget) {
      setConfig({
        title: widget.title || '',
        subtitle: widget.subtitle || '',
        dataSource: widget.dataSource || null,
        size: widget.size || { cols: 6, rows: 2 },
        config: widget.config || {},
      });
    }
  }, [widget]);

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      config: { ...prev.config, [field]: value },
    }));
  };

  const handleSave = () => {
    onSave({
      ...widget,
      ...config,
    });
    onClose();
  };

  const renderChartConfig = () => {
    if (widget?.type === WIDGET_TYPES.BAR_CHART || widget?.type === WIDGET_TYPES.LINE_CHART) {
      return (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Chart Settings</Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>X-Axis Field</InputLabel>
            <Select
              value={config.config.xKey || 'name'}
              label="X-Axis Field"
              onChange={(e) => handleConfigChange('xKey', e.target.value)}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="pond_name">Pond Name</MenuItem>
              <MenuItem value="category">Category</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={config.config.showGrid !== false}
                onChange={(e) => handleConfigChange('showGrid', e.target.checked)}
              />
            }
            label="Show Grid Lines"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.config.showLegend !== false}
                onChange={(e) => handleConfigChange('showLegend', e.target.checked)}
              />
            }
            label="Show Legend"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.config.showTooltip !== false}
                onChange={(e) => handleConfigChange('showTooltip', e.target.checked)}
              />
            }
            label="Show Tooltip"
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>Chart Height</Typography>
            <Slider
              value={config.config.height || 250}
              onChange={(e, value) => handleConfigChange('height', value)}
              min={150}
              max={500}
              step={50}
              marks
              valueLabelDisplay="auto"
            />
          </Box>
        </>
      );
    }
    return null;
  };

  const renderTableConfig = () => {
    if (widget?.type === WIDGET_TYPES.TABLE) {
      return (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Table Settings</Typography>

          <FormControlLabel
            control={
              <Switch
                checked={config.config.selectable || false}
                onChange={(e) => handleConfigChange('selectable', e.target.checked)}
              />
            }
            label="Enable Row Selection"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.config.exportable || false}
                onChange={(e) => handleConfigChange('exportable', e.target.checked)}
              />
            }
            label="Enable Export"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.config.showPagination !== false}
                onChange={(e) => handleConfigChange('showPagination', e.target.checked)}
              />
            }
            label="Show Pagination"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.config.dense || false}
                onChange={(e) => handleConfigChange('dense', e.target.checked)}
              />
            }
            label="Dense Mode"
          />

          <TextField
            label="Rows Per Page"
            type="number"
            value={config.config.initialRowCount || 5}
            onChange={(e) => handleConfigChange('initialRowCount', parseInt(e.target.value) || 5)}
            fullWidth
            sx={{ mt: 2 }}
            slotProps={{ htmlInput: { min: 1, max: 50 } }}
          />
        </>
      );
    }
    return null;
  };

  const renderSummaryConfig = () => {
    if (widget?.type === WIDGET_TYPES.SUMMARY) {
      return (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Summary Settings</Typography>

          <FormControlLabel
            control={
              <Switch
                checked={config.config.showTotal !== false}
                onChange={(e) => handleConfigChange('showTotal', e.target.checked)}
              />
            }
            label="Show Total"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.config.showCount !== false}
                onChange={(e) => handleConfigChange('showCount', e.target.checked)}
              />
            }
            label="Show Count"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.config.showAverage !== false}
                onChange={(e) => handleConfigChange('showAverage', e.target.checked)}
              />
            }
            label="Show Average"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.config.showMin === true}
                onChange={(e) => handleConfigChange('showMin', e.target.checked)}
              />
            }
            label="Show Minimum"
          />
          <FormControlLabel
            control={
              <Switch
                checked={config.config.showMax === true}
                onChange={(e) => handleConfigChange('showMax', e.target.checked)}
              />
            }
            label="Show Maximum"
          />
        </>
      );
    }
    return null;
  };

  if (!widget) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configure Widget</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Widget Title"
            value={config.title}
            onChange={(e) => handleChange('title', e.target.value)}
            fullWidth
          />
          <TextField
            label="Subtitle (optional)"
            value={config.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Data Source</InputLabel>
            <Select
              value={config.dataSource || ''}
              label="Data Source"
              onChange={(e) => handleChange('dataSource', e.target.value)}
            >
              {DATA_SOURCE_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="body2" gutterBottom>Widget Width (columns)</Typography>
            <Slider
              value={config.size.cols}
              onChange={(e, value) => handleChange('size', { ...config.size, cols: value })}
              min={3}
              max={12}
              step={3}
              marks={[
                { value: 3, label: '3' },
                { value: 6, label: '6' },
                { value: 9, label: '9' },
                { value: 12, label: '12' },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>

          {renderChartConfig()}
          {renderTableConfig()}
          {renderSummaryConfig()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
