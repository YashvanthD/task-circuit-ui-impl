/**
 * TableWidget Component
 * Renders a data table within a widget container using DataTable.
 *
 * @module components/reports/widgets/TableWidget
 */

import React, { useMemo } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import DataTable from '../../common/DataTable';
import WidgetContainer from './WidgetContainer';

/**
 * Default column formatters
 */
const formatters = {
  currency: (value) => value != null ? `$${parseFloat(value).toLocaleString()}` : '-',
  number: (value) => value != null ? parseFloat(value).toLocaleString() : '-',
  date: (value) => value ? new Date(value).toLocaleDateString() : '-',
  datetime: (value) => value ? new Date(value).toLocaleString() : '-',
  status: (value) => {
    const statusColors = {
      active: 'success',
      pending: 'warning',
      completed: 'info',
      cancelled: 'error',
      draft: 'default',
    };
    return <Chip label={value || 'Unknown'} size="small" color={statusColors[value?.toLowerCase()] || 'default'} />;
  },
  percentage: (value) => value != null ? `${parseFloat(value).toFixed(1)}%` : '-',
};

/**
 * TableWidget - Data table widget with DataTable integration
 *
 * @param {Object} props
 * @param {string} props.title - Widget title
 * @param {Array} props.data - Table data
 * @param {Array} props.columns - Column definitions
 * @param {Object} props.config - Table configuration
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRemove - Remove callback
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onRefresh - Refresh callback
 * @param {Function} props.onRowClick - Row click handler
 */
export default function TableWidget({
  title,
  subtitle,
  data = [],
  columns: propColumns,
  config = {},
  loading = false,
  onRemove,
  onEdit,
  onRefresh,
  onHide,
  onRowClick,
  rowActions = [],
  sx = {},
}) {
  // Process columns with formatters
  const columns = useMemo(() => {
    if (!propColumns || propColumns.length === 0) {
      // Auto-generate columns from first data item
      if (data && data.length > 0) {
        return Object.keys(data[0]).slice(0, 6).map(key => ({
          id: key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        }));
      }
      return [];
    }

    return propColumns.map(col => {
      const formatter = col.format && formatters[col.format];
      return {
        ...col,
        render: col.render || (formatter
          ? (row) => formatter(row[col.id])
          : (row) => {
              const value = row[col.id];
              if (value === null || value === undefined) return '-';
              if (typeof value === 'boolean') return value ? 'Yes' : 'No';
              return String(value);
            }
        ),
      };
    });
  }, [propColumns, data]);

  // Get unique key function
  const getRowKey = useMemo(() => {
    return config.rowKey
      ? (row) => row[config.rowKey]
      : (row) => row.id || row.key || JSON.stringify(row);
  }, [config.rowKey]);

  return (
    <WidgetContainer
      title={title}
      subtitle={subtitle}
      loading={loading}
      onRemove={onRemove}
      onEdit={onEdit}
      onRefresh={onRefresh}
      onHide={onHide}
      collapsible={config.collapsible !== false}
      sx={sx}
    >
      {data && data.length > 0 ? (
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          selectable={config.selectable || false}
          clickableRows={!!onRowClick}
          onRowClick={onRowClick}
          rowActions={rowActions}
          getRowKey={getRowKey}
          emptyMessage={config.emptyMessage || 'No data available'}
          showPagination={config.showPagination !== false}
          initialRowCount={config.initialRowCount || 5}
          loadMoreCount={config.loadMoreCount || 10}
          exportable={config.exportable || false}
          exportFilename={config.exportFilename || title?.toLowerCase().replace(/\s+/g, '_') || 'report'}
          size={config.dense ? 'small' : 'medium'}
          maxHeight={config.maxHeight || 400}
          stickyHeader={config.stickyHeader !== false}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="text.secondary">
            {config.emptyMessage || 'No data available'}
          </Typography>
        </Box>
      )}
    </WidgetContainer>
  );
}
