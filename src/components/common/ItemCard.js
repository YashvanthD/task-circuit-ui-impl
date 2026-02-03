/**
 * ItemCard Component
 * A reusable card component with "Compact" (list item) and "Full" (grid card) variants.
 * Features a colored accent/border/gradient theme.
 *
 * @module components/common/ItemCard
 */

import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';

/**
 * ItemCard
 *
 * @param {Object} props
 * @param {string} props.title - Main title
 * @param {string} props.subtitle - Secondary text
 * @param {React.ReactNode} props.icon - Icon element
 * @param {string} props.color - Theme color (hex or MUI color)
 * @param {string|React.ReactNode} props.status - Status text (for Chip) or custom element
 * @param {string} props.statusColor - Text color for status chip (defaults to theme color)
 * @param {boolean} props.compact - If true, renders horizontal list style. False = vertical card.
 * @param {React.ReactNode} props.actions - Action buttons (IconButton etc.)
 * @param {Function} props.onClick - Click handler for main card
 * @param {React.ReactNode} props.children - Custom content body (full mode)
 * @param {string} props.summary - Quick text summary (full mode helper)
 * @param {number} props.elevation - Paper elevation
 */
export default function ItemCard({
  title,
  subtitle,
  icon,
  color = '#757575',
  status,
  statusColor,
  compact = false,
  actions,
  onClick,
  children,
  summary,
  elevation = undefined,
}) {

  // ----------------------------------------------------------------------
  // COMPACT VARIANT (List Item Style)
  // ----------------------------------------------------------------------
  if (compact) {
    return (
      <Paper
        elevation={elevation ?? 1}
        onClick={onClick}
        sx={{
          p: 2,
          borderRadius: 2,
          borderLeft: `4px solid ${color}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          transition: 'box-shadow 0.2s',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': { boxShadow: onClick ? 3 : undefined },
        }}
      >
        {/* Helper: Icon Box */}
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: color.startsWith('#') ? `${color}22` : `${color}.light` /* simple opacity fallback */,
              background: color.startsWith('#') ? `${color}22` : undefined, // fallback for non-hex
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            {icon}
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>

        {/* Status/Tag in compact mode? Maybe just text or omit.
            User request emphasizes "cards", usually full mode.
            But let's support actions here. */}

        {status && typeof status === 'string' && (
           <Chip label={status} size="small" variant="outlined" sx={{ color: color, borderColor: color, height: 24 }} />
        )}

        {actions && (
          <Stack direction="row" spacing={0.5}>
            {actions}
          </Stack>
        )}
      </Paper>
    );
  }

  // ----------------------------------------------------------------------
  // FULL VARIANT (Grid Card Style)
  // ----------------------------------------------------------------------
  // Gradient generation only works reliably with Hex or RGB colors for this simple impl.
  // We assume color is hex or we stick to a simple alpha logic.
  const headerBg = color.startsWith('#')
    ? `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`
    : 'rgba(0,0,0,0.04)'; // Fallback

  return (
    <Paper
      elevation={elevation ?? 2}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : undefined,
          boxShadow: 6,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: headerBg,
          borderBottom: `3px solid ${color}`,
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon && <Box sx={{ color: color, display: 'flex' }}>{icon}</Box>}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Stack>

        {status && (
          typeof status === 'string' ? (
            <Chip
              label={status}
              size="small"
              sx={{
                bgcolor: 'background.paper',
                color: statusColor || color,
                fontWeight: 600
              }}
            />
          ) : status
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        )}

        {children}

        {summary && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {summary}
          </Typography>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Footer Actions */}
        {actions && (
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            {actions}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}
