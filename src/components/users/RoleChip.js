/**
 * RoleChip Component
 * Displays a role with appropriate styling.
 *
 * @module components/users/RoleChip
 */

import React from 'react';
import { Chip } from '@mui/material';
import { getUserRoleConfig } from '../../utils/helpers/users';

/**
 * RoleChip - Styled chip for user roles.
 *
 * @param {Object} props
 * @param {string} props.role - User role
 * @param {string} props.size - Chip size ('small' | 'medium')
 */
export default function RoleChip({ role, size = 'small' }) {
  const config = getUserRoleConfig(role);

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        '& .MuiChip-label': { px: 1 },
      }}
      icon={<span style={{ fontSize: '0.8rem', marginLeft: 8 }}>{config.icon}</span>}
    />
  );
}

