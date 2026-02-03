/**
 * PondCard Component
 * Reusable pond card with responsive design for mobile and desktop.
 *
 * @module components/PondCard
 */

import React, { useState } from 'react';
import {
  Paper, Typography, Button, Stack, Chip, IconButton, Box, Avatar, Tooltip,
  Collapse, Divider, useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import ScienceIcon from '@mui/icons-material/Science';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import UpdateIcon from '@mui/icons-material/Update';
import SetMealIcon from '@mui/icons-material/SetMeal';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import WaterIcon from '@mui/icons-material/Water';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useNavigate } from 'react-router-dom';
import { USER_ROUTES } from '../config';

// ============================================================================
// Constants
// ============================================================================

const POND_TYPE_CONFIG = {
  freshwater: { color: '#2196f3', bg: '#e3f2fd', icon: '🐟' },
  saltwater: { color: '#00bcd4', bg: '#e0f7fa', icon: '🦐' },
  brackish: { color: '#009688', bg: '#e0f2f1', icon: '🐠' },
  default: { color: '#607d8b', bg: '#eceff1', icon: '💧' },
};

const HEALTH_STATUS = {
  good: { color: '#4caf50', bg: '#e8f5e9', label: 'Healthy' },
  warning: { color: '#ff9800', bg: '#fff3e0', label: 'Warning' },
  critical: { color: '#f44336', bg: '#ffebee', label: 'Critical' },
  unknown: { color: '#9e9e9e', bg: '#fafafa', label: 'Unknown' },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format currency value
 */
function formatCurrency(value, currency = '₹') {
  if (value === null || value === undefined) return '--';
  const num = Number(value);
  if (isNaN(num)) return '--';
  return `${currency}${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

/**
 * Format number with optional decimals
 */
function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return '--';
  const num = Number(value);
  if (isNaN(num)) return '--';
  return num.toLocaleString('en-IN', { maximumFractionDigits: decimals });
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return '--';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  } catch {
    return dateStr;
  }
}

/**
 * Format weight (grams to kg if >= 1000)
 */
function formatWeight(grams) {
  if (grams === null || grams === undefined) return '--';
  const num = Number(grams);
  if (isNaN(num) || num === 0) return '--';
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}kg`;
  }
  return `${Math.round(num)}g`;
}

/**
 * Get pond health status based on parameters
 */
function getPondHealth(pond) {
  const ph = Number(pond.ph);
  const temp = Number(pond.temperature);

  // Check for critical conditions
  if (ph && (ph < 6 || ph > 9)) return 'critical';
  if (temp && (temp < 15 || temp > 35)) return 'critical';

  // Check for warning conditions
  if (ph && (ph < 6.5 || ph > 8.5)) return 'warning';
  if (temp && (temp < 20 || temp > 30)) return 'warning';

  // If we have data and it's in range
  if (ph || temp) return 'good';

  return 'unknown';
}

/**
 * Get pond type config
 */
function getPondTypeConfig(type) {
  const key = (type || '').toLowerCase();
  return POND_TYPE_CONFIG[key] || POND_TYPE_CONFIG.default;
}

// ============================================================================
// Stock Table Component
// ============================================================================

function StockTable({ stock = [], onViewStock }) {
  if (!stock || stock.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1, textAlign: 'center' }}>
        No stock data available
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ flex: 2 }}><Typography variant="caption" fontWeight={600}>Species</Typography></Box>
        <Box sx={{ flex: 1, textAlign: 'right' }}><Typography variant="caption" fontWeight={600}>Count</Typography></Box>
        <Box sx={{ flex: 1, textAlign: 'right' }}><Typography variant="caption" fontWeight={600}>Avg Wt</Typography></Box>
        <Box sx={{ flex: 1.5, textAlign: 'right' }}><Typography variant="caption" fontWeight={600}>Value</Typography></Box>
      </Box>
      {/* Rows */}
      {stock.map((item, idx) => {
        const species = item.species || item.name || item.type || 'Unknown';
        const count = Number(item.count || item.number || item.quantity || 0);
        const avgWeight = item.average_weight || item.avg_weight || item.avgWeight;
        const price = Number(item.unit_price || item.price || 0);
        const value = count * price;
        const stockId = item.stock_id || item.id;

        return (
          <Box
            key={idx}
            onClick={() => {
               if (onViewStock && stockId) {
                 onViewStock(stockId);
               }
            }}
            sx={{
              display: 'flex',
              py: 0.75,
              alignItems: 'center',
              cursor: (onViewStock && stockId) ? 'pointer' : 'default',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Box sx={{ flex: 2 }}>
              <Typography variant="body2" noWrap>{species}</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              <Typography variant="body2">{formatNumber(count)}</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              <Typography variant="body2">{formatWeight(avgWeight)}</Typography>
            </Box>
            <Box sx={{ flex: 1.5, textAlign: 'right' }}>
              <Typography variant="body2" fontWeight={500}>{formatCurrency(value)}</Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ============================================================================
// PondDetailDialog - Mobile friendly detail view
// ============================================================================

function PondDetailDialog({
  open,
  onClose,
  pond,
  onEdit,
  onDelete,
  onDailyUpdate,
  onViewStock,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!pond) return null;

  // Extract pond data with fallbacks
  const name = pond.farm_name || pond.name || pond.pond_name || 'Pond';
  const id = pond.pond_id || pond.id || '';
  const location = pond.pond_location || pond.location || '';
  const area = pond.pond_area || pond.area || '';
  const type = pond.pond_type || pond.type || '';
  const temp = pond.temperature;
  const ph = pond.ph;
  const do_level = pond.dissolved_oxygen || pond.do_level || pond.do;
  const salinity = pond.salinity;
  const depth = pond.depth || pond.pond_depth;
  const lastUpdate = pond.last_update || pond.lastMaintenance || pond.updatedAt || pond.createdAt;
  const createdAt = pond.createdAt || pond.created_at;
  const notes = pond.notes || pond.description || '';

  // Financial data
  const totalExpenses = Number(pond.total_expenses || 0);
  const pondCost = Number(pond.pond_cost || 0);
  const stockValue = Number(pond.current_stock_value || pond.stock_value || 0);
  const feedCost = Number(pond.feed_cost || pond.feeding_cost || 0);
  const laborCost = Number(pond.labor_cost || 0);

  // Stock data
  const stock = pond.currentStock || pond.current_stock || [];
  const totalFish = Array.isArray(stock) ? stock.reduce((acc, s) => acc + Number(s.count || 0), 0) : 0;
  const totalWeight = Array.isArray(stock) ? stock.reduce((acc, s) => {
    const count = Number(s.count || 0);
    const avgWeight = Number(s.average_weight || s.avg_weight || 0);
    return acc + (count * avgWeight);
  }, 0) : 0;

  const typeConfig = getPondTypeConfig(type);
  const health = getPondHealth(pond);
  const healthConfig = HEALTH_STATUS[health];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 3 }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${typeConfig.bg} 0%, white 100%)`,
          borderBottom: `3px solid ${typeConfig.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'white', color: typeConfig.color, fontSize: '1.5rem', boxShadow: 2 }}>
            {typeConfig.icon}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip
                label={type || 'Pond'}
                size="small"
                sx={{ bgcolor: typeConfig.color, color: 'white', fontWeight: 600, height: 20, fontSize: '0.65rem' }}
              />
              <Chip
                label={healthConfig.label}
                size="small"
                sx={{ bgcolor: healthConfig.bg, color: healthConfig.color, height: 20, fontSize: '0.65rem' }}
              />
            </Stack>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Financial Summary Banner */}
        <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} justifyContent="space-around" divider={<Divider orientation="vertical" flexItem />}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Total Expenses</Typography>
              <Typography variant="h6" fontWeight={700} color="error.main">{formatCurrency(totalExpenses)}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Stock Value</Typography>
              <Typography variant="h6" fontWeight={700} color="success.main">{formatCurrency(stockValue)}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Net</Typography>
              <Typography variant="h6" fontWeight={700} color="info.main">{formatCurrency(stockValue - totalExpenses)}</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Details Section */}
        <Box sx={{ p: 2 }}>
          <Stack spacing={2.5}>
            {/* Location & Area */}
            <Stack direction="row" spacing={3}>
              {location && (
                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ flex: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 20, color: 'error.main', mt: 0.25 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Location</Typography>
                    <Typography variant="body1" fontWeight={500}>{location}</Typography>
                  </Box>
                </Stack>
              )}
              {area && (
                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ flex: 1 }}>
                  <SquareFootIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.25 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Area</Typography>
                    <Typography variant="body1" fontWeight={500}>{formatNumber(area)} sq.m</Typography>
                  </Box>
                </Stack>
              )}
            </Stack>

            <Divider />

            {/* Water Parameters */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <WaterIcon sx={{ fontSize: 18, color: 'info.main' }} />
                <Typography variant="subtitle2" fontWeight={600}>Water Parameters</Typography>
              </Stack>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', minWidth: 80, flex: 1, borderColor: temp && (temp < 20 || temp > 30) ? 'warning.main' : 'divider' }}>
                  <ThermostatIcon sx={{ fontSize: 20, color: temp && (temp < 20 || temp > 30) ? 'warning.main' : 'info.main' }} />
                  <Typography variant="body1" fontWeight={600}>{temp ? `${formatNumber(temp, 1)}°C` : '--'}</Typography>
                  <Typography variant="caption" color="text.secondary">Temp</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', minWidth: 80, flex: 1, borderColor: ph && (ph < 6.5 || ph > 8.5) ? 'warning.main' : 'divider' }}>
                  <ScienceIcon sx={{ fontSize: 20, color: ph && (ph < 6.5 || ph > 8.5) ? 'warning.main' : 'success.main' }} />
                  <Typography variant="body1" fontWeight={600}>{ph ? formatNumber(ph, 1) : '--'}</Typography>
                  <Typography variant="caption" color="text.secondary">pH</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', minWidth: 80, flex: 1 }}>
                  <Typography sx={{ fontSize: 20 }}>🫧</Typography>
                  <Typography variant="body1" fontWeight={600}>{do_level ? formatNumber(do_level, 1) : '--'}</Typography>
                  <Typography variant="caption" color="text.secondary">DO</Typography>
                </Paper>
              </Stack>
            </Box>

            <Divider />

            {/* Stock Summary */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <SetMealIcon sx={{ fontSize: 18, color: 'info.main' }} />
                <Typography variant="subtitle2" fontWeight={600}>Stock Summary</Typography>
                <Chip label={`${formatNumber(totalFish)} fish`} size="small" color="info" sx={{ height: 20 }} />
                <Chip label={formatWeight(totalWeight)} size="small" color="success" sx={{ height: 20 }} />
              </Stack>
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                <StockTable stock={stock} onViewStock={(id) => {
                  if (onViewStock) {
                    onViewStock(id);
                    onClose();
                  }
                }} />
              </Paper>
            </Box>

            <Divider />

            {/* Cost Breakdown */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <AttachMoneyIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                <Typography variant="subtitle2" fontWeight={600}>Cost Breakdown</Typography>
              </Stack>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'warning.lighter' }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Pond Setup:</Typography>
                    <Typography variant="body2" fontWeight={500}>{formatCurrency(pondCost)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Feed Cost:</Typography>
                    <Typography variant="body2" fontWeight={500}>{formatCurrency(feedCost)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Labor Cost:</Typography>
                    <Typography variant="body2" fontWeight={500}>{formatCurrency(laborCost)}</Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={700}>Total:</Typography>
                    <Typography variant="body2" fontWeight={700} color="error.main">{formatCurrency(totalExpenses)}</Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Box>

            {/* Notes */}
            {notes && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>📝 Notes</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{notes}</Typography>
                  </Paper>
                </Box>
              </>
            )}

            {/* Timestamps */}
            <Box sx={{ pt: 1 }}>
              <Stack direction="row" spacing={2}>
                <Typography variant="caption" color="text.disabled">
                  Updated: {formatDate(lastUpdate)}
                </Typography>
                {createdAt && (
                  <Typography variant="caption" color="text.disabled">
                    Created: {formatDate(createdAt)}
                  </Typography>
                )}
              </Stack>
              <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                ID: {id || 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', gap: 1, flexWrap: 'wrap' }}>
        {onDailyUpdate && (
          <Button
            variant="contained"
            color="info"
            startIcon={<UpdateIcon />}
            onClick={() => { onDailyUpdate(pond); onClose(); }}
            sx={{ flex: isMobile ? 1 : 'auto' }}
          >
            Daily Update
          </Button>
        )}
        {onEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => { onEdit(pond); onClose(); }}
            sx={{ flex: isMobile ? 1 : 'auto' }}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => { onDelete(pond); onClose(); }}
            sx={{ flex: isMobile ? 1 : 'auto' }}
          >
            Delete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// PondCard Component
// ============================================================================

/**
 * PondCard - A reusable pond card component
 *
 * @param {object} props
 * @param {object} props.pond - Pond data object
 * @param {function} props.onOpen - Callback when card is clicked
 * @param {function} props.onEdit - Callback when edit is clicked
 * @param {function} props.onDelete - Callback when delete is clicked
 * @param {function} props.onDailyUpdate - Callback when daily update is clicked
 * @param {boolean} props.compact - Enable compact/mobile view
 */
export default function PondCard({
  pond = {},
  onOpen,
  onEdit,
  onDelete,
  onDailyUpdate,
  compact = false,
  expanded: initialExpanded = false,
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(initialExpanded);
  const [detailOpen, setDetailOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isCompact = compact || isMobile;

  // Extract pond data with fallbacks
  const name = pond.farm_name || pond.name || pond.pond_name || 'Pond';
  const id = pond.pond_id || pond.id || '';
  const location = pond.pond_location || pond.location || '';
  const area = pond.pond_area || pond.area || '';
  const type = pond.pond_type || pond.type || '';
  const temp = pond.temperature;
  const ph = pond.ph;
  const do_level = pond.dissolved_oxygen || pond.do_level || pond.do;
  const salinity = pond.salinity;
  const depth = pond.depth || pond.pond_depth;
  const lastUpdate = pond.last_update || pond.lastMaintenance || pond.updatedAt || pond.createdAt;
  const createdAt = pond.createdAt || pond.created_at;
  const notes = pond.notes || pond.description || '';

  // Financial data
  const totalExpenses = Number(pond.total_expenses || 0);
  const pondCost = Number(pond.pond_cost || 0);
  const stockValue = Number(pond.current_stock_value || pond.stock_value || 0);
  const feedCost = Number(pond.feed_cost || pond.feeding_cost || 0);
  const laborCost = Number(pond.labor_cost || 0);

  // Stock data
  const stock = pond.currentStock || pond.current_stock || [];
  const totalFish = Array.isArray(stock) ? stock.reduce((acc, s) => acc + Number(s.count || 0), 0) : 0;
  const totalWeight = Array.isArray(stock) ? stock.reduce((acc, s) => {
    const count = Number(s.count || 0);
    const avgWeight = Number(s.average_weight || s.avg_weight || 0);
    return acc + (count * avgWeight);
  }, 0) : 0;

  // Derived values
  const typeConfig = getPondTypeConfig(type);
  const health = getPondHealth(pond);
  const healthConfig = HEALTH_STATUS[health];

  const handleCardClick = () => {
    if (isMobile || isCompact) {
      setDetailOpen(true);
    } else if (onOpen) {
      onOpen(pond);
    }
  };

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleViewStock = (stockId) => {
    if (stockId) {
      navigate(`${USER_ROUTES.SAMPLING_AND_STOCKS}?stock=${stockId}`);
    }
  };

  // Compact view for mobile/list - Enhanced with more info
  if (isCompact) {
    return (
      <>
        <Paper
          elevation={1}
          onClick={handleCardClick}
          sx={{
            p: 2,
            borderRadius: 2,
            borderLeft: `4px solid ${typeConfig.color}`,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            transition: 'all 0.2s',
            '&:hover': { boxShadow: 3 },
            '&:active': { transform: 'scale(0.98)' },
          }}
        >
          {/* Top Row: Avatar + Name + Health */}
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {/* Avatar */}
            <Avatar sx={{ width: 44, height: 44, bgcolor: typeConfig.bg, color: typeConfig.color, fontSize: '1.25rem' }}>
              {typeConfig.icon}
            </Avatar>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight={600} noWrap>{name}</Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                <Chip label={healthConfig.label} size="small" sx={{ bgcolor: healthConfig.bg, color: healthConfig.color, height: 18, fontSize: '0.6rem' }} />
                <Chip label={type || 'Pond'} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
              </Stack>
            </Box>

            {/* Quick Stats */}
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" fontWeight={600} color="info.main">🐟 {formatNumber(totalFish)}</Typography>
              <Typography variant="caption" color="text.secondary">{formatCurrency(stockValue)}</Typography>
            </Box>
          </Stack>

          {/* Middle Row: Key Info */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ pl: 0.5 }}>
            {/* Location */}
            {location && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {location}
                </Typography>
              </Stack>
            )}

            {/* Temperature */}
            {temp && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ThermostatIcon sx={{ fontSize: 14, color: temp && (temp < 20 || temp > 30) ? 'warning.main' : 'text.secondary' }} />
                <Typography variant="caption">{formatNumber(temp, 1)}°C</Typography>
              </Stack>
            )}

            {/* pH */}
            {ph && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ScienceIcon sx={{ fontSize: 14, color: ph && (ph < 6.5 || ph > 8.5) ? 'warning.main' : 'text.secondary' }} />
                <Typography variant="caption">pH {formatNumber(ph, 1)}</Typography>
              </Stack>
            )}

            {/* Expenses */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="caption" color="error.main">{formatCurrency(totalExpenses)}</Typography>
            </Stack>
          </Stack>

          {/* Bottom Row: Actions */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
            {onDailyUpdate && (
              <Button
                variant="contained"
                size="small"
                color="info"
                startIcon={<UpdateIcon />}
                onClick={(e) => { e.stopPropagation(); onDailyUpdate(pond); }}
                sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.7rem', py: 0.5 }}
              >
                Update
              </Button>
            )}
            {onEdit && (
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(pond); }}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Paper>

        {/* Detail Dialog for mobile */}
        <PondDetailDialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          pond={pond}
          onEdit={onEdit}
          onDelete={onDelete}
          onDailyUpdate={onDailyUpdate}
          onViewStock={handleViewStock}
        />
      </>
    );
  }

  // Full card view - Rich detailed view for desktop
  return (
    <Paper
      elevation={3}
      onClick={handleCardClick}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        cursor: onOpen ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 8,
        },
      }}
    >
      {/* Header Bar */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          background: `linear-gradient(135deg, ${typeConfig.bg} 0%, white 100%)`,
          borderBottom: `3px solid ${typeConfig.color}`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'white',
                color: typeConfig.color,
                fontSize: '1.75rem',
                boxShadow: 2,
                border: `2px solid ${typeConfig.color}`,
              }}
            >
              {typeConfig.icon}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>{name}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Chip
                  label={type || 'Pond'}
                  size="small"
                  sx={{ bgcolor: typeConfig.color, color: 'white', fontWeight: 600, fontSize: '0.7rem' }}
                />
                <Typography variant="caption" color="text.secondary">ID: {id || 'N/A'}</Typography>
              </Stack>
            </Box>
          </Stack>
          <Stack alignItems="flex-end" spacing={0.5}>
            <Chip
              label={healthConfig.label}
              size="small"
              icon={health === 'critical' ? <span>⚠️</span> : health === 'good' ? <span>✓</span> : undefined}
              sx={{
                bgcolor: healthConfig.bg,
                color: healthConfig.color,
                fontWeight: 700,
                fontSize: '0.75rem',
                px: 1,
              }}
            />
            {location && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150 }}>
                  {location}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Financial Stats Row */}
      <Box sx={{ px: 2, py: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-around" alignItems="center" divider={<Divider orientation="vertical" flexItem />}>
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant="h5" fontWeight={700} color="error.main">{formatCurrency(totalExpenses)}</Typography>
            <Typography variant="caption" color="text.secondary">Total Expenses</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant="h5" fontWeight={700} color="success.main">{formatCurrency(stockValue)}</Typography>
            <Typography variant="caption" color="text.secondary">Stock Value</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant="h5" fontWeight={700} color="info.main">{formatCurrency(stockValue - totalExpenses)}</Typography>
            <Typography variant="caption" color="text.secondary">Net Value</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Water Parameters Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            💧 Water Parameters
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            {/* Temperature */}
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderColor: temp && (temp < 20 || temp > 30) ? 'warning.main' : 'divider' }}>
              <ThermostatIcon sx={{ fontSize: 24, color: temp && (temp < 20 || temp > 30) ? 'warning.main' : 'info.main', mb: 0.5 }} />
              <Typography variant="h6" fontWeight={600}>{temp ? `${formatNumber(temp, 1)}°C` : '--'}</Typography>
              <Typography variant="caption" color="text.secondary">Temperature</Typography>
            </Paper>

            {/* pH */}
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderColor: ph && (ph < 6.5 || ph > 8.5) ? 'warning.main' : 'divider' }}>
              <ScienceIcon sx={{ fontSize: 24, color: ph && (ph < 6.5 || ph > 8.5) ? 'warning.main' : 'success.main', mb: 0.5 }} />
              <Typography variant="h6" fontWeight={600}>{ph ? formatNumber(ph, 1) : '--'}</Typography>
              <Typography variant="caption" color="text.secondary">pH Level</Typography>
            </Paper>

            {/* DO Level */}
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 24, mb: 0.5 }}>🫧</Typography>
              <Typography variant="h6" fontWeight={600}>{do_level ? `${formatNumber(do_level, 1)}` : '--'}</Typography>
              <Typography variant="caption" color="text.secondary">DO (mg/L)</Typography>
            </Paper>

            {/* Area */}
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
              <SquareFootIcon sx={{ fontSize: 24, color: 'text.secondary', mb: 0.5 }} />
              <Typography variant="h6" fontWeight={600}>{area ? formatNumber(area) : '--'}</Typography>
              <Typography variant="caption" color="text.secondary">Area (sq.m)</Typography>
            </Paper>
          </Box>
        </Box>

        {/* Stock Summary Section */}
        <Box>
          <Button
            fullWidth
            size="small"
            onClick={handleToggleExpand}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ justifyContent: 'space-between', textTransform: 'none', color: 'text.secondary', mb: 1 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                🐟 Stock Summary
              </Typography>
              <Chip
                icon={<SetMealIcon sx={{ fontSize: 14 }} />}
                label={`${formatNumber(totalFish)} fish`}
                size="small"
                color="info"
                variant="outlined"
                sx={{ height: 22 }}
              />
              <Chip
                label={`${formatWeight(totalWeight)}`}
                size="small"
                color="success"
                variant="outlined"
                sx={{ height: 22 }}
              />
            </Stack>
          </Button>

          <Collapse in={expanded}>
            {/* Stock Table */}
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover', mb: 1.5 }}>
              <StockTable stock={stock} onViewStock={handleViewStock} />
            </Paper>

            {/* Cost Breakdown */}
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              💰 Cost Breakdown
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'warning.light' }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Pond Setup Cost:</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatCurrency(pondCost)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Feed Cost:</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatCurrency(feedCost)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Labor Cost:</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatCurrency(laborCost)}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700}>Total Expenses:</Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main">{formatCurrency(totalExpenses)}</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Collapse>
        </Box>

        {/* Notes if available */}
        {notes && (
          <Box sx={{ mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              📝 {notes.length > 100 ? notes.slice(0, 100) + '...' : notes}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Action Footer */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.02))'
            : 'linear-gradient(to right, #f8f9fa, #fff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Timestamps */}
        <Stack spacing={0.25}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">
              Updated: {formatDate(lastUpdate)}
            </Typography>
          </Stack>
          {createdAt && (
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
              Created: {formatDate(createdAt)}
            </Typography>
          )}
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          {onDailyUpdate && (
            <Button
              variant="contained"
              size="small"
              color="info"
              startIcon={<UpdateIcon />}
              onClick={(e) => { e.stopPropagation(); onDailyUpdate(pond); }}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
            >
              Daily Update
            </Button>
          )}
          {onEdit && (
            <Tooltip title="Edit Pond">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => { e.stopPropagation(); onEdit(pond); }}
                sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete Pond">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => { e.stopPropagation(); onDelete(pond); }}
                sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  POND_TYPE_CONFIG,
  HEALTH_STATUS,
  formatCurrency,
  formatNumber,
  formatDate,
  formatWeight,
  getPondHealth,
  getPondTypeConfig,
};

