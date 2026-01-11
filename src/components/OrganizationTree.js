import React from 'react';

/**
 * OrganizationTree component - TEMPORARILY SIMPLIFIED
 * TODO: Re-enable @mui/x-tree-view when package issues are resolved
 *
 * This component was using @mui/x-tree-view which has module resolution issues.
 * For now, using simple HTML nested lists as a fallback.
 */

const DEFAULT_TREE = {
  id: 'root',
  name: 'Demo Company',
  title: 'Root',
  children: [
    { id: 'admin-1', name: 'Alice Admin', title: 'Admin', children: [
      { id: 'mgr-1', name: 'Mark Manager', title: 'Manager', children: [
        { id: 'u1', name: 'Uma User', title: 'User' },
        { id: 'u2', name: 'Usha User', title: 'User' }
      ]}
    ]}
  ]
};

export default function OrganizationTree({ treeData, filter = '', onSelect }) {
  const data = treeData || DEFAULT_TREE;

  // Simple nested list rendering without @mui/x-tree-view dependency
  function renderNode(node) {
    if (!node) return null;
    const label = `${node.name}${node.title ? ` (${node.title})` : ''}`;
    const matches = !filter || label.toLowerCase().includes(filter.toLowerCase());

    // If node doesn't match, check children
    if (!matches && node.children && node.children.length > 0) {
      const childItems = node.children.map(c => renderNode(c)).filter(Boolean);
      if (childItems.length === 0) return null;
      return (
        <li key={node.id}>
          <strong>{label}</strong>
          <ul>{childItems}</ul>
        </li>
      );
    }

    if (!matches && (!node.children || node.children.length === 0)) return null;

    return (
      <li key={node.id}>
        <span onClick={() => onSelect && onSelect(node)} style={{ cursor: 'pointer' }}>{label}</span>
        {Array.isArray(node.children) ? <ul>{node.children.map(c => renderNode(c))}</ul> : null}
      </li>
    );
  }

  return (
    <div>
      {/* Simple nested list - TODO: restore TreeView when @mui/x-tree-view package issues are fixed */}
      <div style={{ marginBottom: 8 }}>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {renderNode(data)}
        </ul>
      </div>
    </div>
  );
}
