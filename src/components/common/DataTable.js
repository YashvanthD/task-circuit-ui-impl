/**
 * DataTable Component
 * Reusable table component with pagination, sorting, and actions
 *
 * @module components/common/DataTable
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  TableSortLabel,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import ActionButton from './ActionButton';

/**
 * DataTable - Flexible table with pagination, sorting, and actions
 *
 * @param {Object} props
 * @param {Array} props.columns - Column definitions [{ id, label, align, render, sortable, sortKey }]
 * @param {Array} props.data - Data array
 * @param {number} props.initialRowCount - Initial number of rows to show (default: 3)
 * @param {number} props.loadMoreCount - Number of rows to load per "Load More" (default: 10)
 * @param {Function} props.onRowAction - Optional row action callback (row, actionType) => {}
 * @param {Function} props.onRowClick - Optional row click callback (row) => {}
 * @param {Array} props.rowActions - Optional row actions [{ icon, label, onClick, condition }]
 * @param {Function} props.getRowKey - Function to get unique key from row (default: uses index)
 * @param {string} props.emptyMessage - Message when no data (default: "No data available")
 * @param {boolean} props.showPagination - Show pagination controls (default: true)
 * @param {boolean} props.stickyHeader - Sticky table header (default: false)
 * @param {number} props.maxHeight - Max height for table container (default: null)
 * @param {string} props.size - Table size: "small" | "medium" (default: "small")
 * @param {boolean} props.enableSmoothScroll - Enable smooth scrolling (default: true)
 * @param {boolean} props.clickableRows - Make rows clickable (default: false)
 * @param {Object} props.sx - Additional styles
 */
export default function DataTable({
  columns = [],
  data = [],
  initialRowCount = 3,
  loadMoreCount = 10,
  onRowAction,
  onRowClick,
  rowActions = [],
  getRowKey,
  emptyMessage = 'No data available',
  showPagination = true,
  stickyHeader = false,
  maxHeight = null,
  size = 'small',
  enableSmoothScroll = true,
  clickableRows = false,
  sx = {},
}) {
  const [visibleCount, setVisibleCount] = useState(initialRowCount);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sort data based on current sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      // Find the column config
      const column = columns.find(col => col.id === sortConfig.key);
      const sortKey = column?.sortKey || sortConfig.key;

      // Get values to compare
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      // Handle nested properties (e.g., "user.name")
      if (sortKey.includes('.')) {
        aVal = sortKey.split('.').reduce((obj, key) => obj?.[key], a);
        bVal = sortKey.split('.').reduce((obj, key) => obj?.[key], b);
      }

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Compare values
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortConfig, columns]);

  const displayData = sortedData.slice(0, visibleCount);
  const hasMoreRows = sortedData.length > visibleCount;
  const canShowLess = visibleCount > initialRowCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + loadMoreCount, sortedData.length));
  };

  const handleShowLess = () => {
    setVisibleCount(initialRowCount);
  };

  const handleRowAction = (row, action) => {
    if (action.onClick) {
      action.onClick(row);
    }
    if (onRowAction) {
      onRowAction(row, action.type);
    }
  };

  const handleSort = (columnId) => {
    setSortConfig(prev => ({
      key: columnId,
      direction: prev.key === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleRowClick = (row) => {
    if (clickableRows && onRowClick) {
      onRowClick(row);
    }
  };

  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3, bgcolor: 'background.default', borderRadius: 1, ...sx }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={sx}>
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
        <Table size={size} stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 'bold',
                    ...column.headerSx,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortConfig.key === column.id}
                      direction={sortConfig.key === column.id ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {rowActions.length > 0 && (
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.map((row, index) => {
              const rowKey = getRowKey ? getRowKey(row) : index;

              return (
                <TableRow
                  key={rowKey}
                  hover
                  onClick={() => handleRowClick(row)}
                  sx={{
                    cursor: clickableRows ? 'pointer' : 'default',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: clickableRows
                        ? 'action.hover'
                        : 'action.hover',
                      transform: clickableRows ? 'scale(1.001)' : 'none',
                      boxShadow: clickableRows
                        ? '0 2px 8px rgba(0,0,0,0.1)'
                        : 'none',
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${rowKey}-${column.id}`}
                      align={column.align || 'left'}
                      sx={column.cellSx}
                    >
                      {column.render ? column.render(row, index) : row[column.id]}
                    </TableCell>
                  ))}
                  {rowActions.length > 0 && (
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          justifyContent: 'flex-end',
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking actions
                      >
                        {rowActions.map((action, actionIndex) => {
                          // Check if action should be shown for this row
                          const shouldShow = action.condition ? action.condition(row) : true;

                          if (!shouldShow) return null;

                          return (
                            <IconButton
                              key={actionIndex}
                              size="small"
                              onClick={() => handleRowAction(row, action)}
                              title={action.label}
                              color={action.color || 'default'}
                              sx={{
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                },
                              }}
                            >
                              {action.icon}
                            </IconButton>
                          );
                        })}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      {showPagination && (sortedData.length > initialRowCount) && (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
          {canShowLess && (
            <ActionButton
              size="small"
              variant="text"
              onClick={handleShowLess}
              icon={<ExpandLessIcon />}
            >
              Show Less
            </ActionButton>
          )}
          {hasMoreRows && (
            <ActionButton
              size="small"
              variant="text"
              onClick={handleLoadMore}
              icon={<ExpandMoreIcon />}
            >
              Load More ({Math.min(loadMoreCount, sortedData.length - visibleCount)} more)
            </ActionButton>
          )}
        </Box>
      )}
    </Box>
  );
}
