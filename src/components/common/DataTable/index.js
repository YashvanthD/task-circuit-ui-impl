/**
 * DataTable Component
 * Enterprise-ready table with sorting, selection, loading states, and actions
 *
 * @module components/common/DataTable
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableContainer,
} from '@mui/material';

// Sub-components
import DataTableHeader from './DataTableHeader';
import DataTableRow from './DataTableRow';
import DataTableToolbar from './DataTableToolbar';
import DataTablePagination from './DataTablePagination';
import DataTableLoading from './DataTableLoading';
import DataTableEmptyState from './DataTableEmptyState';
import DataTableErrorState from './DataTableErrorState';
import DataTableExport from './DataTableExport';

/**
 * DataTable - Full-featured data table component
 *
 * @param {Object} props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Data array
 * @param {boolean} props.loading - Loading state
 * @param {Error|string} props.error - Error state
 * @param {Function} props.onRetry - Retry callback for errors
 * @param {boolean} props.selectable - Enable row selection
 * @param {Array} props.selectedRows - Controlled selected rows
 * @param {Function} props.onSelectionChange - Selection change callback
 * @param {Array} props.bulkActions - Bulk action buttons
 * @param {boolean} props.denseMode - Dense spacing mode
 * @param {Function} props.onDenseModeChange - Dense mode toggle callback
 * @param {boolean} props.clickableRows - Make rows clickable
 * @param {Function} props.onRowClick - Row click callback
 * @param {Array} props.rowActions - Row action buttons
 * @param {Function} props.getRowKey - Get unique key from row
 * @param {string} props.emptyMessage - Empty state message
 * @param {ReactNode} props.emptyAction - Empty state action button
 * @param {boolean} props.showPagination - Show pagination controls
 * @param {number} props.initialRowCount - Initial rows to show
 * @param {number} props.loadMoreCount - Rows to load per click
 * @param {boolean} props.stickyHeader - Sticky table header
 * @param {number} props.maxHeight - Max table height
 * @param {string} props.size - Table size
 * @param {boolean} props.enableSmoothScroll - Smooth scrolling
 * @param {Object} props.sx - Additional styles
 */
export default function DataTable({
  // Data props
  columns = [],
  data = [],
  loading = false,
  error = null,
  onRetry,

  // Selection props
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  bulkActions = [],

  // Display props
  denseMode: controlledDenseMode,
  onDenseModeChange,
  showDenseToggle = false, // ← Disabled by default, opt-in
  clickableRows = false,
  onRowClick,
  rowActions = [],
  getRowKey,

  // Empty state props
  emptyMessage = 'No data available',
  emptyAction,

  // Export props
  exportable = false,
  exportFormats = ['pdf', 'csv'],
  exportFilename = 'table-export',
  exportPosition = 'center', // 'left' | 'center' | 'right'

  // Pagination props
  showPagination = true,
  initialRowCount = 3,
  loadMoreCount = 10,

  // Layout props
  stickyHeader = false,
  maxHeight = null,
  size = 'small',
  enableSmoothScroll = true,
  sx = {},
}) {
  // Internal state
  const [visibleCount, setVisibleCount] = useState(initialRowCount);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [internalDenseMode, setInternalDenseMode] = useState(false);
  const [internalSelectedRows, setInternalSelectedRows] = useState([]);

  // Use controlled or uncontrolled dense mode
  const denseMode = controlledDenseMode !== undefined ? controlledDenseMode : internalDenseMode;
  const setDenseMode = onDenseModeChange || setInternalDenseMode;

  // Use controlled or uncontrolled selection
  const selected = selectable && selectedRows.length > 0 ? selectedRows : internalSelectedRows;
  const setSelected = onSelectionChange || setInternalSelectedRows;

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const column = columns.find(col => col.id === sortConfig.key);
      const sortKey = column?.sortKey || sortConfig.key;

      let aVal = a[sortKey];
      let bVal = b[sortKey];

      // Handle nested properties
      if (sortKey.includes('.')) {
        aVal = sortKey.split('.').reduce((obj, key) => obj?.[key], a);
        bVal = sortKey.split('.').reduce((obj, key) => obj?.[key], b);
      }

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // String comparison (case-insensitive)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, columns]);

  // Paginated data
  const displayData = sortedData.slice(0, visibleCount);

  // Selection helpers
  const isRowSelected = (row) => {
    const key = getRowKey ? getRowKey(row) : JSON.stringify(row);
    return selected.some(selectedRow => {
      const selectedKey = getRowKey ? getRowKey(selectedRow) : JSON.stringify(selectedRow);
      return key === selectedKey;
    });
  };

  const handleSelectAll = () => {
    if (selected.length === sortedData.length) {
      setSelected([]);
    } else {
      setSelected(sortedData);
    }
  };

  const handleSelectRow = (row) => {
    const key = getRowKey ? getRowKey(row) : JSON.stringify(row);
    const isSelected = isRowSelected(row);

    if (isSelected) {
      setSelected(selected.filter(selectedRow => {
        const selectedKey = getRowKey ? getRowKey(selectedRow) : JSON.stringify(selectedRow);
        return key !== selectedKey;
      }));
    } else {
      setSelected([...selected, row]);
    }
  };

  const handleSort = (columnId) => {
    setSortConfig(prev => ({
      key: columnId,
      direction: prev.key === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + loadMoreCount, sortedData.length));
  };

  const handleShowLess = () => {
    setVisibleCount(initialRowCount);
  };

  const handleDenseModeToggle = () => {
    setDenseMode(!denseMode);
  };

  const handleClearSelection = () => {
    setSelected([]);
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={sx}>
        <DataTableLoading
          columns={columns}
          rowCount={initialRowCount}
          size={denseMode ? 'small' : size}
          selectable={selectable}
          showActions={rowActions.length > 0}
        />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={sx}>
        <DataTableErrorState error={error} onRetry={onRetry} />
      </Box>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Box sx={sx}>
        <DataTableEmptyState message={emptyMessage} action={emptyAction} />
      </Box>
    );
  }

  return (
    <Box sx={sx}>
      {/* Toolbar */}
      <DataTableToolbar
        selectedCount={selected.length}
        totalCount={sortedData.length}
        bulkActions={bulkActions}
        denseMode={denseMode}
        onDenseModeToggle={handleDenseModeToggle}
        showDenseToggle={showDenseToggle}
        onClearSelection={handleClearSelection}
      />

      {/* Table */}
      <TableContainer
        sx={{
          maxHeight,
          scrollBehavior: enableSmoothScroll ? 'smooth' : 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'background.default',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'divider',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'text.secondary',
            },
          },
        }}
      >
        <Table size={denseMode ? 'small' : size} stickyHeader={stickyHeader}>
          <DataTableHeader
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            selectable={selectable}
            selectedCount={selected.length}
            totalCount={sortedData.length}
            onSelectAll={handleSelectAll}
            showActions={rowActions.length > 0}
          />
          <TableBody>
            {displayData.map((row, index) => {
              const rowKey = getRowKey ? getRowKey(row) : index;
              const rowSelected = isRowSelected(row);

              return (
                <DataTableRow
                  key={rowKey}
                  row={row}
                  rowKey={rowKey}
                  columns={columns}
                  rowActions={rowActions}
                  selectable={selectable}
                  selected={rowSelected}
                  onSelect={handleSelectRow}
                  clickableRows={clickableRows}
                  onRowClick={onRowClick}
                  index={index}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <DataTablePagination
        visibleCount={visibleCount}
        totalCount={sortedData.length}
        initialRowCount={initialRowCount}
        loadMoreCount={loadMoreCount}
        onLoadMore={handleLoadMore}
        onShowLess={handleShowLess}
        showPagination={showPagination}
      />

      {/* Export Button */}
      {exportable && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: exportPosition === 'left' ? 'flex-start' :
                           exportPosition === 'right' ? 'flex-end' :
                           'center',
            mt: 2
          }}
        >
          <DataTableExport
            data={sortedData}
            columns={columns}
            filename={exportFilename}
            formats={exportFormats}
          />
        </Box>
      )}
    </Box>
  );
}
