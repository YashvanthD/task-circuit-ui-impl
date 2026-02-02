# DataTable Component - Usage Guide

**Path:** `/src/components/common/DataTable.js`

A reusable table component with built-in pagination, row actions, and customizable columns.

---

## Features

### **Currently Implemented** ✅
- ✅ **Column Sorting** - Click headers to sort ascending/descending
- ✅ **Pagination** - Show limited rows, load more progressively  
- ✅ **Smooth Scrolling** - Custom scrollbar with smooth scroll behavior
- ✅ **Clickable Rows** - Row click handlers for edit forms
- ✅ **Smooth Hover Effects** - Professional animations and transitions
- ✅ **Row Actions** - Edit, delete, or custom actions per row
- ✅ **Custom Columns** - Flexible column definitions with custom renderers
- ✅ **Empty State** - Customizable empty message
- ✅ **Responsive** - Works on mobile and desktop
- ✅ **Theme Compatible** - Works with light and dark themes

### **Recommended Future Enhancements** 🔮
- 🔲 **Row Selection** - Checkbox selection for bulk actions
- 🔲 **Search/Filter** - Built-in search bar and column filters
- 🔲 **Column Visibility** - Show/hide columns toggle
- 🔲 **Column Resizing** - Drag column borders to resize
- 🔲 **Export Data** - Export to CSV, Excel, PDF
- 🔲 **Virtualization** - Virtual scrolling for 1000+ rows
- 🔲 **Grouping** - Group rows by column values
- 🔲 **Inline Editing** - Edit cells directly in table
- 🔲 **Loading State** - Skeleton loader while fetching data
- 🔲 **Row Expansion** - Expandable rows with nested content
- 🔲 **Dense Mode** - Compact row spacing toggle
- 🔲 **Frozen Columns** - Pin left/right columns
- 🔲 **Custom Footer** - Summary rows, totals, aggregations

---

## Basic Usage

```javascript
import { DataTable } from '../components/common';

function MyComponent() {
  const data = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
  ];

  const columns = [
    {
      id: 'name',
      label: 'Name',
      align: 'left',
      render: (row) => row.name,
    },
    {
      id: 'age',
      label: 'Age',
      align: 'right',
      render: (row) => `${row.age} years`,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      getRowKey={(row) => row.id}
    />
  );
}
```

---

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `columns` | `Array<Object>` | Column definitions (see Column Definition below) |
| `data` | `Array<Object>` | Data array to display |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialRowCount` | `number` | `3` | Initial number of rows to show |
| `loadMoreCount` | `number` | `10` | Number of rows to load per "Load More" |
| `showPagination` | `boolean` | `true` | Show pagination controls |
| `clickableRows` | `boolean` | `false` | **NEW:** Make rows clickable |
| `onRowClick` | `function` | - | **NEW:** Row click handler: `(row) => {}` |
| `enableSmoothScroll` | `boolean` | `true` | **NEW:** Enable smooth scrolling |
| `rowActions` | `Array<Object>` | `[]` | Row action buttons (see Row Actions below) |
| `getRowKey` | `function` | Uses index | Function to get unique key from row |
| `emptyMessage` | `string` | `'No data available'` | Message when no data |
| `stickyHeader` | `boolean` | `false` | Make table header sticky |
| `maxHeight` | `number` | `null` | Max height for table container (px) |
| `size` | `string` | `'small'` | Table size: `'small'` or `'medium'` |
| `onRowAction` | `function` | - | Callback for row actions: `(row, actionType) => {}` |
| `sx` | `Object` | `{}` | Additional MUI sx styles |

---

## Column Definition

Each column object in the `columns` array has:

```javascript
{
  id: 'columnId',           // Required: Unique column identifier
  label: 'Column Label',    // Required: Display label
  align: 'left',            // Optional: 'left' | 'center' | 'right'
  sortable: true,           // Optional: Enable sorting for this column
  sortKey: 'field_name',    // Optional: Field to sort by (defaults to id)
  render: (row, index) => {}, // Optional: Custom render function
  headerSx: {},             // Optional: Header cell styles
  cellSx: {},               // Optional: Body cell styles
}
```

### Example with Custom Render:

```javascript
const columns = [
  {
    id: 'date',
    label: 'Date',
    align: 'left',
    render: (row) => formatDate(row.created_at),
  },
  {
    id: 'status',
    label: 'Status',
    align: 'center',
    render: (row) => (
      <Chip 
        label={row.status} 
        color={row.status === 'active' ? 'success' : 'default'}
      />
    ),
  },
  {
    id: 'price',
    label: 'Price',
    align: 'right',
    render: (row) => `$${row.price.toFixed(2)}`,
    cellSx: { fontWeight: 'bold' },
  },
];
```

---

## Row Actions

Define actions that appear as icon buttons in the rightmost column:

```javascript
const rowActions = [
  {
    icon: <EditIcon fontSize="small" />,
    label: 'Edit',
    type: 'edit',
    onClick: (row) => handleEdit(row),
    color: 'primary',                    // Optional: button color
    condition: (row) => row.canEdit,     // Optional: show condition
  },
  {
    icon: <DeleteIcon fontSize="small" />,
    label: 'Delete',
    type: 'delete',
    onClick: (row) => handleDelete(row),
    color: 'error',
    condition: (row) => row.canDelete,
  },
];
```

### Action Properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `icon` | `ReactNode` | ✅ | Icon to display |
| `label` | `string` | ✅ | Tooltip text |
| `type` | `string` | ✅ | Action type identifier |
| `onClick` | `function` | ✅ | Click handler: `(row) => {}` |
| `color` | `string` | ❌ | MUI color: `'primary'`, `'error'`, etc. |
| `condition` | `function` | ❌ | Show condition: `(row) => boolean` |

---

## Complete Examples

### Example 1: Sampling History (StockCard)

```javascript
const tableColumns = [
  {
    id: 'date',
    label: 'Date',
    align: 'left',
    render: (sampling) => formatDate(sampling.sample_date),
  },
  {
    id: 'samples',
    label: 'Samples',
    align: 'right',
    render: (sampling) => formatCount(sampling.sample_count),
  },
  {
    id: 'avgWeight',
    label: 'Avg Weight',
    align: 'right',
    render: (sampling) => formatWeight(sampling.avg_weight_g),
  },
  {
    id: 'growth',
    label: 'Growth',
    align: 'right',
    render: (sampling) => {
      const growth = calculateGrowth(sampling);
      return (
        <Box 
          component="span" 
          sx={{ 
            color: growth >= 0 ? 'success.main' : 'error.main',
            fontWeight: 'bold',
          }}
        >
          {formatGrowth(growth)}
        </Box>
      );
    },
  },
];

const rowActions = [
  {
    icon: <EditIcon fontSize="small" />,
    label: 'Edit',
    type: 'edit',
    onClick: (sampling) => handleEditSampling(sampling),
  },
];

<DataTable
  columns={tableColumns}
  data={samplings}
  rowActions={rowActions}
  getRowKey={(sampling) => sampling.sampling_id}
  emptyMessage="No samplings recorded yet"
  initialRowCount={3}
  loadMoreCount={10}
  showPagination={true}
/>
```

### Example 2: User List with Actions

```javascript
const columns = [
  {
    id: 'name',
    label: 'Name',
    render: (user) => (
      <Box>
        <Typography variant="body2">{user.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {user.email}
        </Typography>
      </Box>
    ),
  },
  {
    id: 'role',
    label: 'Role',
    align: 'center',
    render: (user) => <StatusChip status={user.role} />,
  },
  {
    id: 'lastSeen',
    label: 'Last Seen',
    align: 'right',
    render: (user) => formatDate(user.last_seen_at),
  },
];

const actions = [
  {
    icon: <EditIcon fontSize="small" />,
    label: 'Edit',
    type: 'edit',
    onClick: (user) => openEditDialog(user),
    condition: (user) => user.can_edit,
  },
  {
    icon: <DeleteIcon fontSize="small" />,
    label: 'Delete',
    type: 'delete',
    onClick: (user) => handleDelete(user),
    color: 'error',
    condition: (user) => user.can_delete,
  },
];

<DataTable
  columns={columns}
  data={users}
  rowActions={actions}
  getRowKey={(user) => user.user_id}
  emptyMessage="No users found"
  initialRowCount={5}
  loadMoreCount={20}
/>
```

### Example 3: Scrollable Table with Sticky Header

```javascript
<DataTable
  columns={columns}
  data={largeDataset}
  stickyHeader={true}
  maxHeight={400}
  showPagination={false}
  size="small"
  sx={{ border: 1, borderColor: 'divider' }}
/>
```

---

## Pagination Behavior

1. **Initial Load:** Shows `initialRowCount` rows (default: 3)
2. **Load More:** Clicking "Load More" adds `loadMoreCount` rows (default: 10)
3. **Show Less:** Resets to showing `initialRowCount` rows
4. **Auto-hide:** Pagination controls hidden when:
   - `showPagination={false}`
   - Total rows ≤ `initialRowCount`

### Pagination Flow Example:

```
Total: 35 rows
Initial: 3 rows shown
↓ Click "Load More (10 more)"
13 rows shown
↓ Click "Load More (10 more)"
23 rows shown
↓ Click "Load More (10 more)"
33 rows shown
↓ Click "Load More (2 more)"
35 rows shown (all)
↓ Click "Show Less"
3 rows shown
```

---

## Styling

### Custom Table Styles

```javascript
<DataTable
  columns={columns}
  data={data}
  sx={{
    border: 2,
    borderColor: 'primary.main',
    borderRadius: 2,
    '& .MuiTableCell-head': {
      backgroundColor: 'primary.light',
      fontWeight: 'bold',
    },
  }}
/>
```

### Custom Column Styles

```javascript
const columns = [
  {
    id: 'highlight',
    label: 'Important',
    headerSx: {
      backgroundColor: 'warning.light',
    },
    cellSx: {
      fontWeight: 'bold',
      color: 'error.main',
    },
    render: (row) => row.important_value,
  },
];
```

---

## Tips & Best Practices

### 1. **Always provide `getRowKey`**
```javascript
// ✅ Good
<DataTable getRowKey={(row) => row.id} />

// ❌ Bad (uses index, causes re-render issues)
<DataTable />
```

### 2. **Sort data before passing to table**
```javascript
// ✅ Sort data first
const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
<DataTable data={sortedData} />
```

### 3. **Use conditional row actions**
```javascript
// Only show delete for inactive users
{
  icon: <DeleteIcon />,
  label: 'Delete',
  onClick: handleDelete,
  condition: (user) => !user.is_active,
}
```

### 4. **Optimize renders with useMemo**
```javascript
const columns = useMemo(() => [
  { id: 'name', label: 'Name', render: (row) => row.name },
  // ... more columns
], []);

const actions = useMemo(() => [
  { icon: <EditIcon />, label: 'Edit', onClick: handleEdit },
], [handleEdit]);
```

---

## Accessibility

- ✅ Semantic HTML table structure
- ✅ Proper header associations
- ✅ Icon button titles for screen readers
- ✅ Hover states for interactive elements

---

## Theme Compatibility

The DataTable works seamlessly with both light and dark themes:

- Uses `background.default` for empty state
- Uses theme colors for text and borders
- Hover states adapt to theme
- StatusChip colors work in both themes

---

## When to Use

✅ **Use DataTable when:**
- Displaying tabular data with pagination
- Need row actions (edit, delete, etc.)
- Want consistent table styling
- Need progressive loading of data

❌ **Don't use when:**
- Simple 2-3 row table without actions
- Need complex nested headers
- Need client-side sorting/filtering (use DataGrid instead)
- Need cell editing

---

## Related Components

- `BaseCard` - Card wrapper for tables
- `ActionButton` - Buttons used in pagination
- `StatusChip` - For status columns
- `FormContainer` - For forms with tables

---

## Version History

- **v1.0.0** - Initial release with pagination and row actions
- Created: February 2, 2026
