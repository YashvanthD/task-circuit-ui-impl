/**
 * CategoryCard Component
 * Displays an expense category with count and total.
 *
 * @module components/expenses/CategoryCard
 */

import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import { formatCurrency } from '../../utils/helpers/formatters';

/**
 * CategoryCard - Clickable category card.
 *
 * @param {Object} props
 * @param {string} props.name - Category name
 * @param {string} props.icon - Category icon
 * @param {number} props.count - Number of items
 * @param {number} props.total - Total amount
 * @param {Function} props.onClick - Click handler
 */
export default function CategoryCard({
  name,
  icon = '📦',
  count = 0,
  total = 0,
  onClick,
}) {
  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography sx={{ fontSize: '2rem' }}>{icon}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {name}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Chip label={`${count} items`} size="small" />
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                {formatCurrency(total)}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

