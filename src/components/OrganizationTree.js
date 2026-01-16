/**
 * OrganizationTree Component
 * Displays a hierarchical tree of organization members.
 *
 * @module components/OrganizationTree
 */

import React from 'react';
import { Box, Typography, Paper, Avatar, Stack } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

/**
 * TreeNode - Recursive component for rendering tree nodes
 */
function TreeNode({ node, level = 0, onNodeClick }) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <Box sx={{ ml: level * 3 }}>
      <Paper
        elevation={1}
        onClick={() => onNodeClick?.(node)}
        sx={{
          p: 1.5,
          mb: 1,
          cursor: onNodeClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          transition: 'all 0.2s',
          '&:hover': onNodeClick
            ? { bgcolor: 'action.hover', transform: 'translateX(4px)' }
            : {},
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: level === 0 ? 'primary.main' : 'secondary.main',
          }}
        >
          {hasChildren ? <GroupIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {node.name || node.label || 'Unnamed'}
          </Typography>
          {node.role && (
            <Typography variant="caption" color="text.secondary">
              {node.role}
            </Typography>
          )}
          {node.email && (
            <Typography variant="caption" color="text.secondary" display="block">
              {node.email}
            </Typography>
          )}
        </Box>
        {node.value !== undefined && (
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {typeof node.value === 'number' ? `₹${node.value.toLocaleString()}` : node.value}
          </Typography>
        )}
      </Paper>

      {hasChildren && (
        <Box sx={{ borderLeft: '2px solid', borderColor: 'divider', ml: 2, pl: 1 }}>
          {node.children.map((child, index) => (
            <TreeNode
              key={child.id || child.key || index}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

/**
 * OrganizationTree - Main component
 *
 * @param {Object} props
 * @param {Object|Array} props.data - Tree data (single root or array of roots)
 * @param {Function} props.onNodeClick - Callback when a node is clicked
 * @param {string} props.title - Optional title
 */
export default function OrganizationTree({ data, onNodeClick, title }) {
  if (!data) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No organization data available</Typography>
      </Paper>
    );
  }

  const nodes = Array.isArray(data) ? data : [data];

  return (
    <Box>
      {title && (
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      <Stack spacing={1}>
        {nodes.map((node, index) => (
          <TreeNode
            key={node.id || node.key || index}
            node={node}
            level={0}
            onNodeClick={onNodeClick}
          />
        ))}
      </Stack>
    </Box>
  );
}

