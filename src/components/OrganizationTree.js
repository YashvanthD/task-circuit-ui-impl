import React from 'react';

// Dynamic import of TreeView/TreeItem to avoid hard dependency on @mui/lab at module load
let TreeViewComp = null;
let TreeItemComp = null;
// prefer @mui/x-tree-view (new location), fall back to @mui/lab
try {
  // try top-level package
  // eslint-disable-next-line global-require
  const mod = require('@mui/x-tree-view');
  TreeViewComp = mod && (mod.TreeView || mod.default || mod);
  TreeItemComp = mod && (mod.TreeItem || (mod.default && mod.default.TreeItem));
} catch (e1) {
  try {
    // try direct path
    // eslint-disable-next-line global-require
    TreeViewComp = require('@mui/x-tree-view/TreeView').TreeView || require('@mui/x-tree-view/TreeView').default;
  } catch (e2) {
    try {
      // fallback to lab
      // eslint-disable-next-line global-require
      TreeViewComp = require('@mui/lab/TreeView').default;
      // eslint-disable-next-line global-require
      TreeItemComp = require('@mui/lab/TreeItem').default;
    } catch (e3) {
      // ignore — fallback UI will render
    }
  }
}

// If TreeItemComp still not set, try '@mui/x-tree-view/TreeItem' or '@mui/lab/TreeItem'
if (!TreeItemComp) {
  try {
    // eslint-disable-next-line global-require
    const t = require('@mui/x-tree-view/TreeItem');
    TreeItemComp = t && (t.TreeItem || t.default || t);
  } catch (e) {
    try {
      // eslint-disable-next-line global-require
      TreeItemComp = require('@mui/lab/TreeItem').default;
    } catch (e2) {
      // ignore
    }
  }
}

// Small icon placeholders (can be replaced by Material icons)
function MinusSquare() { return <span style={{display:'inline-block',width:14,height:14,background:'#ddd',textAlign:'center'}}>−</span>; }
function PlusSquare() { return <span style={{display:'inline-block',width:14,height:14,background:'#eee',textAlign:'center'}}>+</span>; }

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

  function renderNode(node) {
    if (!node) return null;
    const label = `${node.name}${node.title ? ` (${node.title})` : ''}`;
    const matches = !filter || label.toLowerCase().includes(filter.toLowerCase());

    // If node doesn't match, check children
    if (!matches && node.children && node.children.length > 0) {
      const childItems = node.children.map(c => renderNode(c)).filter(Boolean);
      if (childItems.length === 0) return null;
      if (TreeItemComp) {
        return (
          <TreeItemComp key={node.id} nodeId={String(node.id)} label={label}>
            {childItems}
          </TreeItemComp>
        );
      }
      return (
        <li key={node.id}>
          <strong>{label}</strong>
          <ul>{childItems}</ul>
        </li>
      );
    }

    if (!matches && (!node.children || node.children.length === 0)) return null;

    if (TreeItemComp) {
      return (
        <TreeItemComp key={node.id} nodeId={String(node.id)} label={label} onLabelClick={(e) => { e.preventDefault(); onSelect && onSelect(node); }}>
          {Array.isArray(node.children) ? node.children.map(c => renderNode(c)) : null}
        </TreeItemComp>
      );
    }

    return (
      <li key={node.id}>
        <span onClick={() => onSelect && onSelect(node)} style={{ cursor: 'pointer' }}>{label}</span>
        {Array.isArray(node.children) ? <ul>{node.children.map(c => renderNode(c))}</ul> : null}
      </li>
    );
  }

  // Collect all node ids to expand by default so the tree is visible
  function collectIds(n, out = []) {
    if (!n) return out;
    out.push(String(n.id));
    (n.children || []).forEach(c => collectIds(c, out));
    return out;
  }
  const defaultExpanded = collectIds(data, []);

  return (
    <div>
      {/* Fallback nested list - always rendered so tree is visible */}
      <div style={{ marginBottom: 8 }}>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {renderNode(data)}
        </ul>
      </div>

      {/* If TreeView is available, render it too for richer UI */}
      {TreeViewComp && TreeItemComp ? (
        <TreeViewComp
          defaultCollapseIcon={<MinusSquare />}
          defaultExpandIcon={<PlusSquare />}
          defaultExpanded={defaultExpanded}
        >
          {renderNode(data)}
        </TreeViewComp>
      ) : null}
    </div>
  );
}
