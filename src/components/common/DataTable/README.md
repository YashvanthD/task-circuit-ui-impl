# DataTable Component - Directory Structure

**Path:** `/src/components/common/DataTable/`

A modular, enterprise-ready data table component with sub-components.

---

## 📁 Directory Structure

```
DataTable/
├── index.js                    # Main DataTable component (orchestrator)
├── DataTableHeader.js          # Table header with sorting & selection
├── DataTableRow.js             # Individual table row component
├── DataTableToolbar.js         # Toolbar with selection info & bulk actions
├── DataTablePagination.js      # Pagination controls (Load More/Show Less)
├── DataTableLoading.js         # Skeleton loading state
├── DataTableEmptyState.js      # Empty state display
└── DataTableErrorState.js      # Error state with retry
```

---

## 🎯 Component Responsibilities

### **`index.js`** - Main Component (Orchestrator)
- Manages overall state (selection, sorting, pagination, dense mode)
- Coordinates sub-components
- Handles data processing and filtering
- Exports the main DataTable component

**Role:** Controller & State Manager

---

### **`DataTableHeader.js`** - Table Header
**Responsibilities:**
- Render column headers
- Sort indicators (arrows)
- "Select All" checkbox
- Actions column header

**Props:**
- `columns` - Column definitions
- `sortConfig` - Current sort state
- `onSort` - Sort handler
- `selectable` - Show select all checkbox
- `selectedCount` / `totalCount` - Selection state
- `onSelectAll` - Select all handler

---

### **`DataTableRow.js`** - Table Row
**Responsibilities:**
- Render individual data row
- Selection checkbox
- Click handling
- Row actions (edit, delete, etc.)
- Hover effects

**Props:**
- `row` - Row data
- `columns` - Column definitions
- `rowActions` - Action buttons
- `selectable` - Show checkbox
- `selected` - Is row selected
- `onSelect` - Selection handler
- `clickableRows` - Enable row click
- `onRowClick` - Click handler

---

### **`DataTableToolbar.js`** - Toolbar
**Responsibilities:**
- Show selection count
- Render bulk action buttons
- Dense mode toggle button
- Clear selection button

**Props:**
- `selectedCount` / `totalCount` - Selection info
- `bulkActions` - Bulk action buttons
- `denseMode` - Current dense mode state
- `onDenseModeToggle` - Toggle handler
- `onClearSelection` - Clear handler

---

### **`DataTablePagination.js`** - Pagination Controls
**Responsibilities:**
- "Load More" button
- "Show Less" button
- Show count of remaining rows

**Props:**
- `visibleCount` - Currently visible rows
- `totalCount` - Total rows
- `initialRowCount` - Initial display count
- `loadMoreCount` - Rows per load
- `onLoadMore` / `onShowLess` - Handlers

---

### **`DataTableLoading.js`** - Loading State
**Responsibilities:**
- Render skeleton rows
- Shimmer animation
- Match table structure

**Props:**
- `columns` - Column definitions
- `rowCount` - Number of skeleton rows
- `selectable` - Show checkbox skeletons
- `showActions` - Show action skeletons

---

### **`DataTableEmptyState.js`** - Empty State
**Responsibilities:**
- Show message when no data
- Render optional action button

**Props:**
- `message` - Empty message
- `action` - Optional action button/component

---

### **`DataTableErrorState.js`** - Error State
**Responsibilities:**
- Display error message
- Retry button

**Props:**
- `error` - Error object or string
- `onRetry` - Retry handler

---

## 🎨 Usage Example

### **Basic Table (Minimal)**
```javascript
import { DataTable } from '../components/common';

// Simplest usage - just columns and data
<DataTable
  columns={columns}
  data={users}
  getRowKey={(user) => user.id}
/>
// No toolbar, no selection, no dense toggle - clean and simple
```

### **With Loading State**
```javascript
<DataTable
  columns={columns}
  data={users}
  loading={isLoading}  // ← Opt-in: Show skeleton loader
  getRowKey={(user) => user.id}
/>
```

### **With Selection & Bulk Actions**
```javascript
<DataTable
  columns={columns}
  data={users}
  selectable={true}  // ← Opt-in: Enable checkboxes
  bulkActions={bulkActions}  // ← Bulk action buttons
  getRowKey={(user) => user.id}
/>
```

### **With Dense Mode Toggle**
```javascript
<DataTable
  columns={columns}
  data={users}
  showDenseToggle={true}  // ← Opt-in: Show dense mode toggle button
  getRowKey={(user) => user.id}
/>
```

### **With Export Button**
```javascript
<DataTable
  columns={columns}
  data={users}
  exportable={true}  // Export button at bottom
  exportFormats={['pdf', 'csv']}
  exportFilename="users-export"
  exportPosition="right"  // Position: 'left' | 'center' | 'right'
  getRowKey={(user) => user.id}
/>
```

### **With Custom Column Alignment**
```javascript
const columns = [
  {
    id: 'name',
    label: 'Name',
    align: 'left',  // Default
    render: (row) => row.name,
  },
  {
    id: 'age',
    label: 'Age',
    align: 'right',  // Numbers right-aligned
    render: (row) => row.age,
  },
  {
    id: 'status',
    label: 'Status',
    align: 'center',  // Center-aligned
    render: (row) => <Chip label={row.status} />,
  },
];

<DataTable columns={columns} data={users} />
```

### **All Features Enabled**
```javascript
<DataTable
  columns={columns}
  data={users}
  loading={isLoading}
  error={error}
  onRetry={refetch}
  selectable={true}  // ← Enable selection
  bulkActions={bulkActions}  // ← Bulk actions
  showDenseToggle={true}  // ← Enable dense toggle
  denseMode={denseMode}
  onDenseModeChange={setDenseMode}
  getRowKey={(user) => user.id}
/>
```

---

## ✅ Benefits of Directory Structure

### **1. Modularity**
- Each component has a single responsibility
- Easy to test individual components
- Reusable sub-components

### **2. Maintainability**
- Smaller, focused files (50-150 lines each)
- Easy to locate specific functionality
- Clear component boundaries

### **3. Scalability**
- Easy to add new features
- Can extend individual components
- Clear where to add new functionality

### **4. Readability**
- Self-documenting structure
- Easy for new developers to understand
- Logical organization

### **5. Testing**
- Test each component independently
- Mock sub-components easily
- Better test coverage

---

## 🔧 Adding New Features

### **Example: Add Search Feature**

1. **Create new component:**
   ```
   DataTable/DataTableSearch.js
   ```

2. **Implement search logic:**
   ```javascript
   export default function DataTableSearch({ onSearch, placeholder }) {
     return (
       <TextField
         placeholder={placeholder}
         onChange={(e) => onSearch(e.target.value)}
         // ...
       />
     );
   }
   ```

3. **Import in `index.js`:**
   ```javascript
   import DataTableSearch from './DataTableSearch';
   ```

4. **Use in main component:**
   ```javascript
   {searchable && (
     <DataTableSearch
       onSearch={handleSearch}
       placeholder={searchPlaceholder}
     />
   )}
   ```

---

## 📊 Component Size Comparison

### **Before (Monolithic):**
- `DataTable.js` - **314 lines** ❌
- Hard to navigate
- Mixed concerns
- Difficult to test

### **After (Modular):**
- `index.js` - **~320 lines** (orchestration)
- `DataTableHeader.js` - **~70 lines**
- `DataTableRow.js` - **~110 lines**
- `DataTableToolbar.js` - **~80 lines**
- `DataTablePagination.js` - **~50 lines**
- `DataTableLoading.js` - **~70 lines**
- `DataTableEmptyState.js` - **~25 lines**
- `DataTableErrorState.js` - **~30 lines**

**Total:** ~755 lines across 8 files ✅
- **But:** Each file is focused and manageable
- **Plus:** More features (loading, error, selection, dense mode)
- **Better:** Organization and maintainability

---

## 🎯 Key Principles

1. **Single Responsibility:** Each component does one thing well
2. **Composition:** Main component composes sub-components
3. **Controlled/Uncontrolled:** Support both patterns
4. **Prop Drilling Minimized:** Pass only what's needed
5. **State Management:** Centralized in main component
6. **Presentation vs Logic:** Separate concerns clearly

---

## 🚀 Future Enhancements

To add new features, create new sub-components:

- `DataTableSearch.js` - Search functionality
- `DataTableFilter.js` - Column filters
- `DataTableExport.js` - Export buttons
- `DataTableColumnToggle.js` - Show/hide columns
- `DataTableFooter.js` - Summary/totals
- etc.

---

## 📚 Related Documentation

- `DATATABLE_USAGE.md` - Full usage guide
- `DATATABLE_ENHANCED_FEATURES.md` - Feature documentation
- `DATATABLE_WHAT_WE_CAN_ADD.md` - Enhancement proposals

---

**The directory structure makes the DataTable component professional, maintainable, and ready for enterprise use!** 🎉
