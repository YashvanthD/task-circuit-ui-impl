/**
 * ExpenseList Component
 * Renders a list of expense cards.
 *
 * @module components/expenses/ExpenseList
 */

import React from 'react';
import { Grid, Typography, CircularProgress, Stack } from '@mui/material';
import ExpenseCard from './ExpenseCard';

/**
 * ExpenseList - Renders a list of expenses.
 *
 * @param {Object} props
 * @param {Array} props.expenses - List of expenses
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {boolean} props.compact - Compact view mode
 */
export default function ExpenseList({
  expenses = [],
  loading = false,
  onEdit,
  onDelete,
  compact = false,
}) {
  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Loading expenses...
        </Typography>
      </Stack>
    );
  }

  if (expenses.length === 0) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          💰
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No expenses found.
        </Typography>
      </Stack>
    );
  }

  if (compact) {
    return (
      <Stack spacing={2}>
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.expense_id || expense.id}
            expense={expense}
            onEdit={onEdit}
            onDelete={onDelete}
            compact
          />
        ))}
      </Stack>
    );
  }

  return (
    <Grid container spacing={3}>
      {expenses.map((expense) => (
        <Grid item xs={12} sm={6} md={4} key={expense.expense_id || expense.id}>
          <ExpenseCard
            expense={expense}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Grid>
      ))}
    </Grid>
  );
}

