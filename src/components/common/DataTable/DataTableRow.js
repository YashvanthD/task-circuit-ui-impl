/**
 * DataTableRow Component
 * Individual table row with selection, click, and actions
 */

import React from 'react';
import {
  TableRow,
  TableCell,
  Checkbox,
  IconButton,
  Box,
} from '@mui/material';

export default function DataTableRow({
  row,
  rowKey,
  columns,
  rowActions,
  selectable,
  selected,
  onSelect,
  clickableRows,
  onRowClick,
  index,
}) {
  const handleRowClick = () => {
    if (clickableRows && onRowClick) {
      onRowClick(row);
    }
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(row);
    }
  };

  return (
    <TableRow
      hover
      onClick={handleRowClick}
      selected={selected}
      sx={{
        cursor: clickableRows ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: clickableRows ? 'action.hover' : 'action.hover',
          transform: clickableRows ? 'scale(1.001)' : 'none',
          boxShadow: clickableRows ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
        },
      }}
    >
      {/* Selection checkbox */}
      {selectable && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={selected}
            onChange={handleCheckboxChange}
            inputProps={{ 'aria-label': `select row ${rowKey}` }}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
      )}

      {/* Data cells */}
      {columns.map((column) => (
        <TableCell
          key={`${rowKey}-${column.id}`}
          align={column.align || 'left'} // Default to 'left'
          sx={column.cellSx}
        >
          {column.render ? column.render(row, index) : row[column.id]}
        </TableCell>
      ))}

      {/* Actions */}
      {rowActions && rowActions.length > 0 && (
        <TableCell align="right">
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              justifyContent: 'flex-end',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {rowActions.map((action, actionIndex) => {
              const shouldShow = action.condition ? action.condition(row) : true;
              if (!shouldShow) return null;

              return (
                <IconButton
                  key={actionIndex}
                  size="small"
                  onClick={() => action.onClick && action.onClick(row)}
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
}
