import React, { useMemo, useState } from 'react';
import { Paper, Typography, Grid, Card, CardActionArea, CardContent, Stack, TextField, IconButton, Box, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/ReceiptLong';
import { useNavigate } from 'react-router-dom';
import data from '../../data/expenses.json';
import { loadVisibleCategories, renderHighlighted as highlightParts, formatCurrency, getDummyPayslips } from '../../utils/expenses';
import { loadUserFromLocalStorage } from '../../utils';
import { is_admin } from '../../utils';
import Button from '@mui/material/Button';
import {
    BASE_APP_PATH_USER_EXPENSES,
    BASE_APP_PATH_USER_EXPENSES_COMPANY_ACCOUNT,
    BASE_APP_PATH_USER_EXPENSES_MY_ACCOUNT, BASE_APP_PATH_USER_EXPENSES_PASSBOOK
} from "../../config";

export default function ExpensesPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  // categories list is available from data but we compute visible counts via helpers

  const currentUser = loadUserFromLocalStorage();
  const payslipCount = React.useMemo(() => {
    try {
      const uid = (currentUser && (currentUser.user || currentUser).id) || (currentUser && currentUser.id) || null;
      if (!uid) return 0;
      const slips = getDummyPayslips(uid) || [];
      return slips.length;
    } catch (e) { return 0; }
  }, [currentUser]);
  const results = useMemo(() => loadVisibleCategories(data, currentUser, q), [currentUser, q]);
  const visibleAll = useMemo(() => loadVisibleCategories(data, currentUser, ''), [currentUser]);
  const userIsAdmin = is_admin(currentUser);

  return (
    <Paper sx={{ p: 4, maxWidth: 1200, margin: '24px auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <div>
          <Typography variant="h4">Expenses</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>Browse and manage expense categories and types. Click a card to view its types.</Typography>
        </div>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search categories, types, sub-types"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <IconButton aria-label="search categories" onClick={() => { /* noop; filter applies live */ }}>
              <SearchIcon />
            </IconButton>
          </Box>
          <Chip label={q ? `Showing ${results.length} of ${visibleAll.length} categories` : `Total categories: ${visibleAll.length}`} color="primary" />
        </Box>
      </Box>

      {/* My Account section (visible to all) */}
      <Box sx={{ mb: 3 }}>
        <Card variant="outlined">
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">My Account</Typography>
              <Typography variant="body2" color="text.secondary">View your personal account details and payslips.</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button variant="contained" onClick={() => navigate(BASE_APP_PATH_USER_EXPENSES_MY_ACCOUNT)}>Open My Account</Button>
              <Chip label={`${payslipCount} payslips`} size="small" color={payslipCount>0? 'primary' : 'default'} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Admin-only analysis container */}
      {userIsAdmin && (
        <Box sx={{ mb: 3 }}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">Organization Analysis</Typography>
                <Typography variant="body2" color="text.secondary">High-level financial snapshot (admin only)</Typography>
                <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                  <Box>
                    <Typography variant="subtitle2">Total amount invested</Typography>
                    <Typography variant="h6">₹{formatCurrency(0)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Total profit</Typography>
                    <Typography variant="h6">₹{formatCurrency(0)}</Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button variant="contained" onClick={() => navigate(BASE_APP_PATH_USER_EXPENSES_COMPANY_ACCOUNT)}>{(loadUserFromLocalStorage() || {}).companyName || 'Company'} Account</Button>
                <Button variant="outlined" onClick={() => navigate(BASE_APP_PATH_USER_EXPENSES_PASSBOOK)}>Passbook</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      <Grid container spacing={3}>
        {results.map(({ cat, typeCount, matchedTypes, categoryMatch }) => {
          const types = data[cat] || {};
          const totalSpent = 0; // placeholder

          // Build a small preview list: ONLY show preview when searching; highlight matches
          const qq = (q || '').toString().trim();
          let preview = null;
          if (qq) {
            if (categoryMatch && matchedTypes.length === 0) {
              // category matched but no specific type matched -> show first 3 types as context (highlight query inside them if present)
              preview = Object.keys(types).slice(0, 3);
            } else {
              // map matched types to strings including matched subtypes count
              preview = matchedTypes.slice(0, 5).map(t => {
                if (t.matchedSubtypes && t.matchedSubtypes.length > 0) return `${t.name} (${t.matchedSubtypes.length} sub)`;
                return t.name;
              });
            }
          }

          return (
            <Grid key={cat} item xs={12} sm={6} md={4} lg={3}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardActionArea onClick={() => navigate(`${BASE_APP_PATH_USER_EXPENSES}/${encodeURIComponent(cat)}`)} sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Stack alignItems="center" justifyContent="center" sx={{ width: 72 }}>
                      <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    </Stack>
                    <Stack sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">{cat}</Typography>
                        <Chip label={`${typeCount} types`} size="small" />
                      </Box>

                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>Total spent: ₹{formatCurrency(totalSpent)}</Typography>
                      <Typography variant="caption" color="text.secondary">Last updated: --</Typography>

                      <Box sx={{ mt: 1 }}>
                        {preview ? (
                          <Typography variant="caption" color="text.secondary">Matches: {preview.map((p, i) => (
                            <span key={i}>
                              {i > 0 ? ', ' : ''}
                              {(() => {
                                const parts = highlightParts(p, qq);
                                if (!parts || typeof parts === 'string') return parts;
                                return (<span>{parts.before}<span style={{ backgroundColor: 'rgba(255,235,59,0.4)', fontWeight: 600 }}>{parts.match}</span>{parts.after}</span>);
                              })()}
                            </span>
                          ))}</Typography>
                        ) : null}
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}

        {results.length === 0 && (
          <Grid item xs={12}>
            <Typography variant="body2">No categories match your search.</Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
