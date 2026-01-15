/**
 * ExpenseSummary Component
 * Displays expense summary by category.
 *
 * @module components/expenses/ExpenseSummary
 */

import React, { useMemo } from 'react';
import { Grid, Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { formatCurrency } from '../../utils/helpers/formatters';
import { EXPENSE_CATEGORY_OPTIONS } from '../../constants';

/**
 * ExpenseSummary - Displays expense totals by category.
 *
 * @param {Object} props
 * @param {Array} props.expenses - List of expenses
 * @param {string} props.title - Summary title
 */
export default function ExpenseSummary({ expenses = [], title = 'Expense Summary' }) {
  const summary = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const byCategory = {};
    expenses.forEach((e) => {
      const cat = e.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = 0;
      byCategory[cat] += Number(e.amount) || 0;
    });

    return { total, byCategory, count: expenses.length };
  }, [expenses]);

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={6} sm={4}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Expenses
              </Typography>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                {formatCurrency(summary.total)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.count} transactions
              </Typography>
            </Box>
          </Grid>

          {EXPENSE_CATEGORY_OPTIONS.map((cat) => {
            const amount = summary.byCategory[cat.value] || 0;
            if (amount === 0) return null;

            return (
              <Grid item xs={6} sm={4} md={2} key={cat.value}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography>{cat.icon}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cat.label}
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(amount)}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}

