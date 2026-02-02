# DataTable - Feature Enable/Disable Guide

**Quick Reference:** How to enable features in DataTable component

---

## 🎯 Default Behavior (All Features OFF)

```javascript
<DataTable
  columns={columns}
  data={data}
  getRowKey={(row) => row.id}
/>
```

**Result:**
- ❌ No toolbar
- ❌ No selection checkboxes
- ❌ No dense mode toggle
- ❌ No bulk actions
- ✅ Just a clean, simple table

---

## ✅ Feature Flags

### **1. Loading State**

**Default:** `false` (disabled)

```javascript
<DataTable
  loading={isLoading}  // ← Enable loading skeleton
  // ... other props
/>
```

**When enabled:**
- Shows skeleton rows with shimmer animation
- Hides actual table content
- Professional loading UX

---

### **2. Row Selection**

**Default:** `false` (disabled)

```javascript
<DataTable
  selectable={true}  // ← Enable checkboxes
  // ... other props
/>
```

**When enabled:**
- Adds checkbox column
- "Select All" in header
- Toolbar appears with selection count
- Can use with `bulkActions`

**Controlled mode:**
```javascript
const [selected, setSelected] = useState([]);

<DataTable
  selectable={true}
  selectedRows={selected}
  onSelectionChange={setSelected}
/>
```

---

### **3. Dense Mode Toggle**

**Default:** `false` (disabled, no toggle button shown)

```javascript
<DataTable
  showDenseToggle={true}  // ← Enable dense mode toggle button
  // ... other props
/>
```

**When enabled:**
- Shows toggle button in toolbar
- Users can switch between normal/compact view
- Toolbar appears (even without selection)

**Controlled mode:**
```javascript
const [dense, setDense] = useState(false);

<DataTable
  showDenseToggle={true}
  denseMode={dense}
  onDenseModeChange={setDense}
/>
```

---

### **4. Bulk Actions**

**Default:** `[]` (no bulk actions)

```javascript
const bulkActions = [
  {
    label: 'Delete Selected',
    icon: <DeleteIcon />,
    onClick: () => handleBulkDelete(selectedRows),
    color: 'error',
  },
  {
    label: 'Export Selected',
    icon: <DownloadIcon />,
    onClick: () => handleExport(selectedRows),
  },
];

<DataTable
  selectable={true}  // ← Required for bulk actions
  bulkActions={bulkActions}
/>
```

**When enabled:**
- Bulk action buttons appear in toolbar when rows selected
- Each action gets selected rows

---

### **5. Error State**

**Default:** `null` (no error)

```javascript
<DataTable
  error={error}       // ← Pass error object/string
  onRetry={refetch}   // ← Retry callback
/>
```

**When enabled:**
- Shows error alert
- Displays "Retry" button if `onRetry` provided
- Hides table

---

### **6. Empty State**

**Default:** Shows "No data available"

```javascript
<DataTable
  data={[]}  // Empty array
  emptyMessage="No users found"
  emptyAction={
    <Button onClick={handleAddUser}>
      Add First User
    </Button>
  }
/>
```

**When data is empty:**
- Shows custom message
- Shows optional action button

---

### **7. Clickable Rows**

**Default:** `false` (disabled)

```javascript
<DataTable
  clickableRows={true}
  onRowClick={(row) => openEditForm(row)}
/>
```

**When enabled:**
- Cursor changes to pointer
- Row lifts slightly on hover
- Click handler fires (except when clicking actions)

---

### **8. Sorting**

**Default:** Enabled if column has `sortable: true`

```javascript
const columns = [
  {
    id: 'name',
    label: 'Name',
    sortable: true,  // ← Enable sorting for this column
    sortKey: 'name', // Field to sort by (optional, defaults to id)
  },
];
```

**When enabled:**
- Click header to sort
- Arrow indicators
- Toggle ASC/DESC

---

### **9. Pagination**

**Default:** `true` (enabled)

```javascript
<DataTable
  showPagination={false}  // ← Disable pagination
  // ... or customize:
  initialRowCount={5}     // Show 5 rows initially
  loadMoreCount={20}      // Load 20 more per click
/>
```

**When enabled:**
- "Load More" button
- "Show Less" button
- Progressive loading

---

### **10. Row Actions**

**Default:** `[]` (no row actions)

```javascript
const rowActions = [
  {
    icon: <EditIcon fontSize="small" />,
    label: 'Edit',
    onClick: (row) => handleEdit(row),
  },
  {
    icon: <DeleteIcon fontSize="small" />,
    label: 'Delete',
    onClick: (row) => handleDelete(row),
    color: 'error',
    condition: (row) => row.canDelete,  // Conditional display
  },
];

<DataTable
  rowActions={rowActions}
/>
```

**When enabled:**
- Action buttons in last column
- Hover effects
- Conditional display per row

---

### **11. Export to PDF/CSV** ✨

**Default:** `false` (disabled)

```javascript
<DataTable
  exportable={true}  // ← Enable export button
  exportFormats={['pdf', 'csv']}  // ← Choose formats
  exportFilename="my-data"  // ← Custom filename
  // ... other props
/>
```

**When enabled:**
- Export button appears at bottom center
- Click to export as PDF or CSV
- If only one format, exports directly
- If multiple formats, shows dropdown menu

**Export Options:**
```javascript
// PDF only
<DataTable
  exportable={true}
  exportFormats={['pdf']}
  exportFilename="users-report"
/>

// CSV only
<DataTable
  exportable={true}
  exportFormats={['csv']}
  exportFilename="users-data"
/>

// Both (shows dropdown menu)
<DataTable
  exportable={true}
  exportFormats={['pdf', 'csv']}
  exportFilename="users"
/>

// Export button position (left, center, right)
<DataTable
  exportable={true}
  exportPosition="right"  // ← Position on right
/>

<DataTable
  exportable={true}
  exportPosition="left"   // ← Position on left
/>

<DataTable
  exportable={true}
  exportPosition="center" // ← Default: center
/>
```

**How it works:**
- **PDF:** Opens browser print dialog with formatted table
- **CSV:** Downloads CSV file with all data
- **Filename:** Automatically adds .pdf or .csv extension
- **Data:** Exports all sorted data (not just visible rows)
- **Position:** Button can be left, center, or right aligned

---

### **12. Column Text Alignment**

**Default:** `'left'` for all columns

```javascript
const columns = [
  {
    id: 'name',
    label: 'Name',
    align: 'left',  // ← Default: left-aligned
    render: (row) => row.name,
  },
  {
    id: 'count',
    label: 'Count',
    align: 'right', // ← Numbers: right-aligned
    render: (row) => row.count,
  },
  {
    id: 'status',
    label: 'Status',
    align: 'center', // ← Center-aligned
    render: (row) => <Chip label={row.status} />,
  },
];
```

**Alignment Options:**
- `'left'` - Default for text fields
- `'right'` - Best for numbers, dates
- `'center'` - For icons, badges, status

**Best Practices:**
```javascript
// Text fields - left align
{ id: 'name', label: 'Name', align: 'left' }

// Numbers/measurements - right align
{ id: 'weight', label: 'Weight', align: 'right' }
{ id: 'count', label: 'Count', align: 'right' }
{ id: 'price', label: 'Price', align: 'right' }

// Icons/status - center align
{ id: 'status', label: 'Status', align: 'center' }
{ id: 'verified', label: 'Verified', align: 'center' }
```

---

## 📊 Feature Combinations

### **Minimal Table (No Toolbar)**
```javascript
<DataTable
  columns={columns}
  data={data}
  // No toolbar appears - clean table
/>
```

### **Table with Just Row Actions**
```javascript
<DataTable
  columns={columns}
  data={data}
  rowActions={[...]}  // No toolbar, just action buttons
/>
```

### **Table with Selection (Toolbar Appears)**
```javascript
<DataTable
  selectable={true}  // Toolbar shows when rows selected
  bulkActions={[...]}
/>
```

### **Table with Dense Toggle (Toolbar Always Shows)**
```javascript
<DataTable
  showDenseToggle={true}  // Toolbar always visible
/>
```

### **Table with Export Button**
```javascript
<DataTable
  exportable={true}  // Export button at bottom
  exportFormats={['pdf', 'csv']}
  exportFilename="data-export"
/>
```

### **Full Featured Table**
```javascript
<DataTable
  // Data
  columns={columns}
  data={data}
  loading={isLoading}
  error={error}
  onRetry={refetch}
  
  // Selection
  selectable={true}
  selectedRows={selected}
  onSelectionChange={setSelected}
  bulkActions={bulkActions}
  
  // Display
  showDenseToggle={true}
  denseMode={dense}
  onDenseModeChange={setDense}
  clickableRows={true}
  onRowClick={handleRowClick}
  
  // Row Actions
  rowActions={rowActions}
  
  // Pagination
  initialRowCount={10}
  loadMoreCount={20}
  
  // Export
  exportable={true}
  exportFormats={['pdf', 'csv']}
  exportFilename="data-export"
  
  // Misc
  getRowKey={(row) => row.id}
  emptyMessage="No data found"
/>
```

---

## 🎨 Visual Guide

### **No Features Enabled:**
```
┌──────────┬──────────┬──────────┐
│ Name     │ Email    │ Role     │
├──────────┼──────────┼──────────┤
│ John     │ j@e.com  │ Admin    │
│ Jane     │ ja@e.com │ User     │
└──────────┴──────────┴──────────┘
[Load More]
```

### **With Selection Enabled:**
```
┌────────────────────────────────┐
│ 2 selected  [Delete] [Export]  │  ← Toolbar
├───┬──────────┬──────────┬──────┤
│ ☑ │ Name     │ Email    │ Role │
├───┼──────────┼──────────┼──────┤
│ ☑ │ John     │ j@e.com  │ Admin│
│ ☐ │ Jane     │ ja@e.com │ User │
└───┴──────────┴──────────┴──────┘
```

### **With Dense Toggle Enabled:**
```
┌────────────────────────────────┐
│ 10 rows              [⊟] [⊞]  │  ← Toolbar (always visible)
├──────────┬──────────┬──────────┤
│ Name     │ Email    │ Role     │
├──────────┼──────────┼──────────┤
│ John     │ j@e.com  │ Admin    │
└──────────┴──────────┴──────────┘
```

### **With Row Actions:**
```
┌──────────┬──────────┬──────────┬─────────┐
│ Name     │ Email    │ Role     │ Actions │
├──────────┼──────────┼──────────┼─────────┤
│ John     │ j@e.com  │ Admin    │ ✎ 🗑    │  ← Edit/Delete icons
└──────────┴──────────┴──────────┴─────────┘
```

### **With Export Button:**
```
┌──────────┬──────────┬──────────┐
│ Name     │ Email    │ Role     │
├──────────┼──────────┼──────────┤
│ John     │ j@e.com  │ Admin    │
│ Jane     │ ja@e.com │ User     │
└──────────┴──────────┴──────────┘
[Load More]

// Position: left
[Export ▼]

// Position: center (default)
        [Export ▼]

// Position: right
                    [Export ▼]
```

### **Column Alignment:**
```
┌──────────┬──────────┬──────────┐
│ Name     │    Count │  Status  │  ← Headers aligned
├──────────┼──────────┼──────────┤
│ John     │       25 │  Active  │  ← left, right, center
│ Jane     │      142 │  Active  │
└──────────┴──────────┴──────────┘
```

---

## ⚡ Quick Decision Tree

**Need loading state?**  
→ Add `loading={isLoading}`

**Need bulk operations?**  
→ Add `selectable={true}` + `bulkActions={[...]}`

**Want users to toggle compact view?**  
→ Add `showDenseToggle={true}`

**Need per-row actions?**  
→ Add `rowActions={[...]}`

**Want clickable rows?**  
→ Add `clickableRows={true}` + `onRowClick={fn}`

**Need error handling?**  
→ Add `error={error}` + `onRetry={fn}`

**Need to export data?**  
→ Add `exportable={true}` + `exportFormats={['pdf', 'csv']}`

**All features off?**  
→ Just pass `columns` and `data` - that's it!

---

## 🎯 Default Values Summary

| Feature | Default | Prop to Enable |
|---------|---------|----------------|
| **Loading State** | `false` | `loading={true}` |
| **Selection** | `false` | `selectable={true}` |
| **Dense Toggle** | `false` | `showDenseToggle={true}` |
| **Bulk Actions** | `[]` | `bulkActions={[...]}` |
| **Row Actions** | `[]` | `rowActions={[...]}` |
| **Clickable Rows** | `false` | `clickableRows={true}` |
| **Pagination** | `true` | `showPagination={false}` to disable |
| **Error State** | `null` | `error={error}` |
| **Export** | `false` | `exportable={true}` + `exportFormats={['pdf','csv']}` |
| **Export Position** | `'center'` | `exportPosition='left'` or `'right'` or `'center'` |
| **Column Align** | `'left'` | Set in column: `align: 'left'` \| `'center'` \| `'right'` |
| **Sticky Header** | `false` | `stickyHeader={true}` |
| **Smooth Scroll** | `true` | `enableSmoothScroll={false}` to disable |

---

## ✅ Best Practices

1. **Start minimal** - Only enable features you need
2. **Progressive enhancement** - Add features as requirements grow
3. **Controlled vs Uncontrolled** - Use controlled mode for external state management
4. **Performance** - Disable features you don't use to reduce bundle size
5. **UX** - Don't overwhelm users with too many features at once

---

**Remember: All features are opt-in by default. The table is clean and simple until you enable specific features!** 🎉
