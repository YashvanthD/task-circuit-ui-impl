import React, { useState } from 'react';
import { Card, Typography, Stack, Avatar, Box, CardActionArea, Button, IconButton, Collapse, Divider, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { getCardFields, resolveFieldValue } from '../types/fields';
import { formatDate, formatNumber, formatCurrency } from '../utils/formatters';

/**
 * Pond card with an expenses overview, stacks breakdown and basic fields.
 * Props:
 * - initialData: raw pond object
 * - onOpen, onDailyUpdate, onEdit, onDelete
 */
export default function Pond({ initialData = {}, onOpen, onDailyUpdate, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const fields = getCardFields('pond');

  const formatDisplay = (val) => {
    if (val === undefined || val === null || val === '') return '--';
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (Array.isArray(val)) return val.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
    if (typeof val === 'object') {
      if (val.address && typeof val.address === 'string') return val.address;
      if (val.name && typeof val.name === 'string') return val.name;
      if (val.latitude && val.longitude) return `${val.latitude}, ${val.longitude}`;
      try { const s = JSON.stringify(val); return s.length > 80 ? s.slice(0,80) + '…' : s; } catch (e) { return '--'; }
    }
    return '--';
  };

  const get = (key) => resolveFieldValue(fields.find(f => f.key === key) || {}, initialData);

  const farmName = get('farm_name') || 'Pond';
  const pondId = get('pond_id') || '';
  const altId = initialData.id || initialData.pondId || '';
  const location = formatDisplay(get('pond_location'));
  const area = formatDisplay(get('pond_area'));
  const type = formatDisplay(get('pond_type'));
  const temp = formatDisplay(get('temperature'));
  const ph = formatDisplay(get('ph'));
  const last = get('lastMaintenance') || get('createdAt') || '';

  // overview numeric fields (parser ensures defaults 0 already)
  const pondCost = initialData.pond_cost ?? get('pond_cost') ?? 0;
  const totalExpenses = initialData.total_expenses ?? get('total_expenses') ?? 0;
  const stockValue = initialData.current_stock_value ?? get('current_stock_value') ?? 0;

  // Stack breakdown: prefer normalized currentStock (array) or parse pond_stack string fallback
  const currentStock = initialData.currentStock || initialData.current_stock || initialData.currentStockValue || [];
  const stockArray = Array.isArray(currentStock) ? currentStock : (initialData.currentStock || initialData.current_stock || []);

  // Build stack entries: species, count, avg weight
  const stackEntries = (Array.isArray(stockArray) && stockArray.length > 0)
    ? stockArray.map(s => {
      const species = s.species || s.name || s.type || 'Unknown';
      const count = Number(s.count || s.number || s.quantity || 0) || 0;
      const avgw = s.average_weight || s.avg_weight || s.avgWeight || s.avg || s.weight || null;
      const unitPrice = Number(s.unit_price || s.price || s.avg_price || s.avgPrice || 0) || 0;
      const subtotal = count * unitPrice;
      return { species, count, avgw, unitPrice, subtotal };
    })
    : // fallback: parse pond_stack string into simple entries
      (initialData.pond_stack ? initialData.pond_stack.split(',').map(t => ({ species: t.trim(), count: 0, avgw: '-', unitPrice: 0, subtotal: 0 })) : []);

  const toggleExpanded = (e) => { e && e.stopPropagation(); setExpanded(v => !v); };

  const expenseSignPositive = (val) => Number(val) >= 0;

  return (
    <Card variant="outlined" sx={{ mb: 1, p: 0, minHeight: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'box-shadow 200ms ease', '&:hover': { boxShadow: 6 } }}>
      <CardActionArea onClick={() => onOpen && onOpen(initialData)} sx={{ display: 'flex', alignItems: 'flex-start', p: 2 }}>
        <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>{(farmName || 'P').toString().slice(0,1)}</Avatar>

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="caption" color="text.secondary">Same__</Typography>
              <Typography variant="h6" sx={{ mt: 0.5 }}>{farmName}</Typography>
              {/* Show either id or pond id if they are the same; if both present and different, show both */}
              {altId && pondId ? (
                altId === pondId ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>ID: {altId}</Typography>
                ) : (
                  <>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Id: {altId}</Typography>
                    <Typography variant="caption" color="text.secondary">Pond ID: {pondId}</Typography>
                  </>
                )
              ) : (
                // show whichever exists
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{altId ? `ID: ${altId}` : (pondId ? `Pond ID: ${pondId}` : '')}</Typography>
              )}
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formatCurrency(totalExpenses)}</Typography>
              <Typography variant="caption" color="text.secondary">Total expenses</Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 1 }} />

          {/* Expenses summary row with expand */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">Expenses (total)</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                {expenseSignPositive(totalExpenses) ? (
                  <ArrowUpwardIcon sx={{ color: 'success.main', fontSize: 18 }} />
                ) : (
                  <ArrowDownwardIcon sx={{ color: 'error.main', fontSize: 18 }} />
                )}
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: expenseSignPositive(totalExpenses) ? 'success.main' : 'error.main' }}>{formatCurrency(totalExpenses)}</Typography>
                <Tooltip title="Expand details">
                  <IconButton component="span" size="small" onClick={toggleExpanded} aria-label="Expand details"><ExpandMoreIcon /></IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">Pond cost</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(pondCost)}</Typography>
            </Box>
          </Stack>

          <Collapse in={expanded} timeout="auto" unmountOnExit onClick={(e) => e.stopPropagation()}>
            <Box sx={{ mt: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
              <Stack spacing={1}>
                <Typography variant="body2">Pond cost: {formatCurrency(pondCost)}</Typography>
                {/* If there are detailed expenses array, render them */}
                {Array.isArray(initialData.expenses) && initialData.expenses.length > 0 ? (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Expense items</Typography>
                    {initialData.expenses.map((it, i) => (
                      <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2">{it.name || it.desc || it.description || `Item ${i+1}`}</Typography>
                        <Typography variant="body2">{formatCurrency(it.amount || it.value || 0)}</Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2">No detailed expense items</Typography>
                )}
              </Stack>
            </Box>
          </Collapse>

          <Divider sx={{ my: 1 }} />

          {/* Stacks section: total fish count and total cost, and a table of fish rows */}
          {(() => {
            const totalFishCount = stackEntries.reduce((acc, e) => acc + (Number(e.count) || 0), 0);
            const computedTotalFishCost = stackEntries.reduce((acc, e) => acc + (Number(e.subtotal) || 0), 0);
            // prefer API-provided totals if available; otherwise use computed subtotal; fallback to stockValue or 0
            const totalFishCost = (initialData.total_fish_cost ?? initialData.totalFishCost ?? initialData.totalFishValue ?? computedTotalFishCost ?? stockValue ?? 0);
            return (
              <Box sx={{ mt: 1, mb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">Stack - {totalFishCount}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(totalFishCost)}</Typography>
                </Stack>

                <Box sx={{ mt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  {/* Header row */}
                  <Box sx={{ display: 'flex', py: 1, pt: 1 }}>
                    <Box sx={{ flex: 3 }}><Typography variant="caption" color="text.secondary">Fish</Typography></Box>
                    <Box sx={{ flex: 2, textAlign: 'right' }}><Typography variant="caption" color="text.secondary">Avg weight</Typography></Box>
                    <Box sx={{ flex: 1, textAlign: 'right' }}><Typography variant="caption" color="text.secondary">Count</Typography></Box>
                    <Box sx={{ flex: 2, textAlign: 'right' }}><Typography variant="caption" color="text.secondary">Value</Typography></Box>
                  </Box>
                  {stackEntries.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>No stock data</Typography>
                  ) : (
                    stackEntries.map((s, idx) => (
                      <Box key={idx} sx={{ display: 'flex', py: 0.5, alignItems: 'center' }}>
                        <Box sx={{ flex: 3 }}><Typography variant="body2">{s.species}</Typography></Box>
                        <Box sx={{ flex: 2, textAlign: 'right' }}><Typography variant="body2">{s.avgw && s.avgw !== '-' ? `${formatNumber(s.avgw, 2)} g` : '--'}</Typography></Box>
                        <Box sx={{ flex: 1, textAlign: 'right' }}><Typography variant="body2">{s.count}</Typography></Box>
                        <Box sx={{ flex: 2, textAlign: 'right' }}><Typography variant="body2">{formatCurrency(s.subtotal)}</Typography></Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            );
          })()}

          {/* Form-like compact area */}
           <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
             <Box sx={{ minWidth: 160 }}>
               <Typography variant="caption" color="text.secondary">Location</Typography>
               <Typography variant="body2" sx={{ fontWeight: 600 }}>{location}</Typography>
             </Box>
             <Box sx={{ minWidth: 120 }}>
               <Typography variant="caption" color="text.secondary">Area</Typography>
               <Typography variant="body2" sx={{ fontWeight: 600 }}>{area}</Typography>
             </Box>
             <Box sx={{ minWidth: 120 }}>
               <Typography variant="caption" color="text.secondary">Type</Typography>
               <Typography variant="body2" sx={{ fontWeight: 600 }}>{type}</Typography>
             </Box>
             <Box sx={{ minWidth: 120 }}>
               <Typography variant="caption" color="text.secondary">Temperature</Typography>
               <Typography variant="body2" sx={{ fontWeight: 600 }}>{temp !== '--' ? `${formatNumber(temp,1)}°C` : '--'}</Typography>
             </Box>
             <Box sx={{ minWidth: 120 }}>
               <Typography variant="caption" color="text.secondary">pH</Typography>
               <Typography variant="body2" sx={{ fontWeight: 600 }}>{ph}</Typography>
             </Box>
           </Stack>

         </Box>
       </CardActionArea>

       <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <Typography variant="caption" color="text.secondary">Last: {last ? formatDate(last) : '--'}</Typography>
         <Box>
           <Button size="small" variant="outlined" color="info" sx={{ mr: 1 }} onClick={(e) => { e.stopPropagation(); onDailyUpdate && onDailyUpdate(initialData); }}>Daily Update</Button>
           {onEdit ? (
             <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(initialData); }} aria-label="edit">
               <EditIcon fontSize="small" />
             </IconButton>
           ) : null}
           {onDelete ? (
             <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete && onDelete(initialData); }} aria-label="delete">
               <DeleteIcon fontSize="small" />
             </IconButton>
           ) : null}
         </Box>
       </Box>
     </Card>
   );
 }
