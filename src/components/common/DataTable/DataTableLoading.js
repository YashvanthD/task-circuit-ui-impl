/**
 * DataTableLoading Component
 * Skeleton loading state for table
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Box,
} from '@mui/material';

export default function DataTableLoading({
  columns,
  rowCount = 5,
  size = 'small',
  selectable,
  showActions,
}) {
  return (
    <TableContainer>
      <Table size={size}>
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox">
                <Skeleton variant="rectangular" width={20} height={20} />
              </TableCell>
            )}
            {columns.map((column, index) => (
              <TableCell key={index} align={column.align || 'left'}>
                <Skeleton variant="text" width="80%" />
              </TableCell>
            ))}
            {showActions && (
              <TableCell align="right">
                <Skeleton variant="text" width={60} />
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {selectable && (
                <TableCell padding="checkbox">
                  <Skeleton variant="rectangular" width={20} height={20} />
                </TableCell>
              )}
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} align={column.align || 'left'}>
                  <Skeleton
                    variant="text"
                    width={colIndex % 2 === 0 ? '70%' : '50%'}
                    animation="wave"
                  />
                </TableCell>
              ))}
              {showActions && (
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
