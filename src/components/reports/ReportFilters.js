/**
 * ReportFilters Component
 * Filter controls for report list.
 *
 * @module components/reports/ReportFilters
 */

import React from 'react';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';

import { REPORT_TYPE_OPTIONS, REPORT_CATEGORY_OPTIONS } from '../../constants';

/**
 * ReportFilters - Filter controls for report list.
 *
 * @param {Object} props
 * @param {string} props.typeFilter - Current type filter
 * @param {Function} props.onTypeChange - Type filter change handler
 * @param {string} props.categoryFilter - Current category filter
 * @param {Function} props.onCategoryChange - Category filter change handler
 * @param {string} props.startDate - Start date filter
 * @param {Function} props.onStartDateChange - Start date change handler
 * @param {string} props.endDate - End date filter
 * @param {Function} props.onEndDateChange - End date change handler
 * @param {Function} props.onGenerate - Generate report handler
 * @param {Function} props.onExport - Export all handler
 */
export default function ReportFilters({
  typeFilter = 'all',
  onTypeChange,
  categoryFilter = 'all',
  onCategoryChange,
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  onGenerate,
  onExport,
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', md: 'center' }}
      flexWrap="wrap"
      sx={{ mb: 3 }}
    >
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Report Type</InputLabel>
        <Select
          value={typeFilter}
          label="Report Type"
          onChange={(e) => onTypeChange?.(e.target.value)}
        >
          <MenuItem value="all">All Types</MenuItem>
          {REPORT_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={categoryFilter}
          label="Category"
          onChange={(e) => onCategoryChange?.(e.target.value)}
        >
          <MenuItem value="all">All Categories</MenuItem>
          {REPORT_CATEGORY_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.icon} {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Start Date"
        type="date"
        size="small"
        value={startDate}
        onChange={(e) => onStartDateChange?.(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 150 }}
      />

      <TextField
        label="End Date"
        type="date"
        size="small"
        value={endDate}
        onChange={(e) => onEndDateChange?.(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 150 }}
      />

      <Stack direction="row" spacing={1}>
        {onGenerate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onGenerate}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Generate Report
          </Button>
        )}

        {onExport && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Export
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

