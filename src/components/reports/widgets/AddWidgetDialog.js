/**
 * AddWidgetDialog Component
 * Dialog for adding new widgets to the report dashboard.
 *
 * @module components/reports/widgets/AddWidgetDialog
 */

import React, { useState } from 'react';
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
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { WIDGET_TYPES, DATA_SOURCES } from '../../../contexts/ReportContext';

const WIDGET_OPTIONS = [
  {
    type: WIDGET_TYPES.BAR_CHART,
    label: 'Bar Chart',
    description: 'Compare values across categories',
    icon: <BarChartIcon sx={{ fontSize: 48 }} />,
  },
  {
    type: WIDGET_TYPES.LINE_CHART,
    label: 'Line Chart',
    description: 'Show trends over time',
    icon: <ShowChartIcon sx={{ fontSize: 48 }} />,
  },
  {
    type: WIDGET_TYPES.PIE_CHART,
    label: 'Pie Chart',
    description: 'Show proportions of a whole',
    icon: <PieChartIcon sx={{ fontSize: 48 }} />,
  },
  {
    type: WIDGET_TYPES.TABLE,
    label: 'Data Table',
    description: 'Display detailed data in rows',
    icon: <TableChartIcon sx={{ fontSize: 48 }} />,
  },
  {
    type: WIDGET_TYPES.SUMMARY,
    label: 'Summary Stats',
    description: 'Key metrics at a glance',
    icon: <SummarizeIcon sx={{ fontSize: 48 }} />,
  },
];

const DATA_SOURCE_OPTIONS = [
  { value: DATA_SOURCES.SAMPLINGS, label: 'Samplings', description: 'Fish sampling data' },
  { value: DATA_SOURCES.HARVESTS, label: 'Harvests', description: 'Harvest records' },
  { value: DATA_SOURCES.FEEDINGS, label: 'Feedings', description: 'Feeding logs' },
  { value: DATA_SOURCES.MORTALITIES, label: 'Mortalities', description: 'Mortality records' },
  { value: DATA_SOURCES.EXPENSES, label: 'Expenses', description: 'Financial expenses' },
  { value: DATA_SOURCES.PURCHASES, label: 'Purchases', description: 'Purchase orders' },
  { value: DATA_SOURCES.TRANSFERS, label: 'Transfers', description: 'Stock transfers' },
  { value: DATA_SOURCES.TREATMENTS, label: 'Treatments', description: 'Treatment records' },
  { value: DATA_SOURCES.MAINTENANCE, label: 'Maintenance', description: 'Maintenance logs' },
];

const steps = ['Select Widget Type', 'Choose Data Source', 'Configure Widget'];

/**
 * AddWidgetDialog - Dialog for adding new widgets
 *
 * @param {Object} props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onAdd - Add widget callback (receives widget config)
 */
export default function AddWidgetDialog({ open, onClose, onAdd }) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [widgetConfig, setWidgetConfig] = useState({
    title: '',
    xKey: 'name',
    valueKey: 'value',
  });

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedType(null);
    setSelectedDataSource(null);
    setWidgetConfig({ title: '', xKey: 'name', valueKey: 'value' });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleAdd = () => {
    const widget = {
      type: selectedType,
      dataSource: selectedDataSource,
      title: widgetConfig.title || `${DATA_SOURCE_OPTIONS.find(d => d.value === selectedDataSource)?.label || 'New'} ${WIDGET_OPTIONS.find(w => w.type === selectedType)?.label || 'Widget'}`,
      config: {
        xKey: widgetConfig.xKey,
        bars: selectedType === WIDGET_TYPES.BAR_CHART ? [{ key: widgetConfig.valueKey, name: 'Value' }] : undefined,
        lines: selectedType === WIDGET_TYPES.LINE_CHART ? [{ key: widgetConfig.valueKey, name: 'Value' }] : undefined,
      },
      size: { cols: selectedType === WIDGET_TYPES.TABLE ? 12 : 6, rows: 2 },
    };
    onAdd(widget);
    handleClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            {WIDGET_OPTIONS.map(option => (
              <Grid item xs={12} sm={6} md={4} key={option.type}>
                <Card
                  variant={selectedType === option.type ? 'outlined' : 'elevation'}
                  sx={{
                    border: selectedType === option.type ? 2 : 1,
                    borderColor: selectedType === option.type ? 'primary.main' : 'divider',
                    transition: 'all 0.2s',
                  }}
                >
                  <CardActionArea onClick={() => setSelectedType(option.type)}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <Box sx={{ color: selectedType === option.type ? 'primary.main' : 'text.secondary', mb: 1 }}>
                        {option.icon}
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {option.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            {DATA_SOURCE_OPTIONS.map(option => (
              <Grid item xs={12} sm={6} key={option.value}>
                <Card
                  variant={selectedDataSource === option.value ? 'outlined' : 'elevation'}
                  sx={{
                    border: selectedDataSource === option.value ? 2 : 1,
                    borderColor: selectedDataSource === option.value ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedDataSource(option.value)}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {option.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              label="Widget Title"
              value={widgetConfig.title}
              onChange={(e) => setWidgetConfig(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              placeholder={`${DATA_SOURCE_OPTIONS.find(d => d.value === selectedDataSource)?.label || ''} ${WIDGET_OPTIONS.find(w => w.type === selectedType)?.label || ''}`}
            />
            {(selectedType === WIDGET_TYPES.BAR_CHART || selectedType === WIDGET_TYPES.LINE_CHART) && (
              <>
                <FormControl fullWidth>
                  <InputLabel>X-Axis Field</InputLabel>
                  <Select
                    value={widgetConfig.xKey}
                    label="X-Axis Field"
                    onChange={(e) => setWidgetConfig(prev => ({ ...prev, xKey: e.target.value }))}
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="pond_name">Pond Name</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="species_name">Species</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Value Field</InputLabel>
                  <Select
                    value={widgetConfig.valueKey}
                    label="Value Field"
                    onChange={(e) => setWidgetConfig(prev => ({ ...prev, valueKey: e.target.value }))}
                  >
                    <MenuItem value="value">Value</MenuItem>
                    <MenuItem value="count">Count</MenuItem>
                    <MenuItem value="amount">Amount</MenuItem>
                    <MenuItem value="weight">Weight</MenuItem>
                    <MenuItem value="quantity">Quantity</MenuItem>
                    <MenuItem value="total">Total</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return selectedType !== null;
      case 1:
        return selectedDataSource !== null;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Widget</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ py: 3 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 2 }}>
          {renderStepContent()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>Back</Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained" disabled={!canProceed()}>
            Next
          </Button>
        ) : (
          <Button onClick={handleAdd} variant="contained" color="primary">
            Add Widget
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
