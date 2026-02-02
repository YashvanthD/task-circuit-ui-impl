/**
 * DataTableHeader Component
 * Table header with sorting, selection, and column controls
 */

import React from 'react';
import {
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Checkbox,
} from '@mui/material';

export default function DataTableHeader({
  columns,
  sortConfig,
  onSort,
  selectable,
  selectedCount,
  totalCount,
  onSelectAll,
  showActions,
}) {
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <TableHead>
      <TableRow>
        {/* Selection checkbox column */}
        {selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={someSelected}
              checked={allSelected}
              onChange={onSelectAll}
              inputProps={{ 'aria-label': 'select all rows' }}
            />
          </TableCell>
        )}

        {/* Data columns */}
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.align || 'left'} // Default to 'left'
            sx={{
              fontWeight: 'bold',
              ...column.headerSx,
            }}
          >
            {column.sortable ? (
              <TableSortLabel
                active={sortConfig.key === column.id}
                direction={sortConfig.key === column.id ? sortConfig.direction : 'asc'}
                onClick={() => onSort(column.id)}
              >
                {column.label}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}

        {/* Actions column */}
        {showActions && (
          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
            Actions
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
}
