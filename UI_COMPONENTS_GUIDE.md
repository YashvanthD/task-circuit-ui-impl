# ✅ Centralized UI Components - Complete Guide

## 🎯 Overview

All existing UI components have been updated with:
- ✅ **Theme-Aware Colors** - Perfect dark/light mode support
- ✅ **Responsive Design** - Mobile, tablet, desktop optimized
- ✅ **Centralized Defaults** - Consistent styling across the app
- ✅ **MUI Best Practices** - Following Material Design guidelines
- ✅ **No Breaking Changes** - Backward compatible

---

## 📦 Updated Components

### **1. ActionButton** - Enhanced Action Buttons
**Location:** `/src/components/common/ActionButton.js`

**What Changed:**
- ✅ Added responsive `minWidth` (xs: 100px, sm: 120px)
- ✅ Better `textTransform: 'none'` for readability
- ✅ Theme-aware icon button colors
- ✅ Added `type` prop (button|submit|reset)
- ✅ Improved loading state visibility

**Usage:**
```javascript
import { ActionButton } from '../components/common';

// Regular button
<ActionButton
  icon={<AddIcon />}
  onClick={handleAdd}
  variant="contained"
  color="primary"
>
  Add Item
</ActionButton>

// Icon-only button
<ActionButton
  icon={<RefreshIcon />}
  onClick={handleRefresh}
  tooltip="Refresh"
  iconOnly
  variant="outlined"
/>

// Loading state
<ActionButton
  loading={isSubmitting}
  onClick={handleSubmit}
  type="submit"
>
  Submit
</ActionButton>
```

**Props:**
- `children` - Button text
- `icon` - Button icon (React element)
- `tooltip` - Tooltip text
- `onClick` - Click handler
- `color` - primary|secondary|error|warning|info|success (default: primary)
- `variant` - contained|outlined|text (default: contained)
- `size` - small|medium|large (default: medium)
- `loading` - Show loading spinner
- `disabled` - Disabled state
- `iconOnly` - Icon-only mode
- `fullWidth` - Full width button
- `type` - button|submit|reset (default: button)
- `sx` - Custom styles

---

### **2. SearchInput** - Enhanced Search Field
**Location:** `/src/components/common/SearchInput.js`

**What Changed:**
- ✅ Added `label` prop for better accessibility
- ✅ Hover effect with `bgcolor: 'action.hover'`
- ✅ Responsive width (100% on mobile, configurable on desktop)
- ✅ Theme-aware icon colors
- ✅ Better clear button placement

**Usage:**
```javascript
import { SearchInput } from '../components/common';

<SearchInput
  value={searchTerm}
  onChange={(value) => setSearchTerm(value)}
  placeholder="Search items..."
  label="Search"
  showClear
  onClear={() => console.log('Cleared')}
/>
```

**Props:**
- `value` - Current value
- `onChange` - Change handler (value) => {}
- `placeholder` - Placeholder text (default: "Search...")
- `label` - Optional label
- `size` - small|medium (default: small)
- `fullWidth` - Full width mode
- `minWidth` - Min width (default: 200)
- `maxWidth` - Max width (default: 400)
- `showClear` - Show clear button (default: true)
- `onClear` - Clear callback
- `disabled` - Disabled state
- `sx` - Custom styles

---

### **3. BaseCard** - Enhanced Card Component
**Location:** `/src/components/common/BaseCard.js`

**What Changed:**
- ✅ Added `headerAction` prop for buttons/icons in header
- ✅ Added `noPadding` prop to remove body padding
- ✅ Added `divider` prop to show divider after header
- ✅ Responsive padding (xs: 2, sm: 2.5)
- ✅ Better hover/click effects
- ✅ Theme-aware backgrounds

**Usage:**
```javascript
import { BaseCard } from '../components/common';

// Simple card
<BaseCard
  title="Card Title"
  subtitle="Card description"
>
  Card content goes here
</BaseCard>

// Card with header action
<BaseCard
  title="Settings"
  headerAction={
    <IconButton><EditIcon /></IconButton>
  }
  divider
>
  Settings content
</BaseCard>

// Card with footer
<BaseCard
  title="Item Details"
  footer={
    <ActionButton fullWidth>Save Changes</ActionButton>
  }
>
  Form fields here
</BaseCard>

// Hoverable card
<BaseCard
  title="Product"
  hoverable
  clickable
  onClick={() => console.log('Clicked')}
>
  Product details
</BaseCard>
```

**Props:**
- `children` - Card content
- `title` - Card title
- `subtitle` - Card subtitle
- `header` - Custom header (overrides title/subtitle)
- `headerAction` - Action in header (button, icon)
- `footer` - Footer content
- `hoverable` - Enable hover effect
- `clickable` - Enable click effect
- `onClick` - Click handler
- `elevation` - Paper elevation (default: 2)
- `noPadding` - Remove body padding
- `divider` - Show divider after header
- `sx` - Custom styles

---

### **4. StatusChip** - Enhanced Status Badges
**Location:** `/src/components/common/StatusChip.js`

**What Changed:**
- ✅ **10 Built-in Status Presets** with icons
- ✅ Theme-aware colors (success.main, error.main, etc.)
- ✅ Icon support with proper sizing
- ✅ Better padding and font weight
- ✅ `showIcon` prop to toggle icons

**Built-in Statuses:**
```javascript
active, inactive, pending, completed, failed, 
draft, success, error, warning, info
```

**Usage:**
```javascript
import { StatusChip } from '../components/common';

// Built-in status
<StatusChip status="active" />
<StatusChip status="pending" />
<StatusChip status="error" />

// Without icon
<StatusChip status="active" showIcon={false} />

// Custom status
<StatusChip
  status="custom"
  config={{
    label: 'Custom Status',
    bg: '#FF5722',
    color: '#fff',
    icon: <CustomIcon />
  }}
/>

// Outlined variant
<StatusChip status="success" variant="outlined" />
```

**Props:**
- `status` - Status value (active|inactive|pending|etc.)
- `config` - Custom config { bg, color, label, icon }
- `label` - Override label
- `size` - small|medium (default: small)
- `variant` - filled|outlined (default: filled)
- `showIcon` - Show icon (default: true)
- `sx` - Custom styles

---

### **5. PageHeader** - Enhanced Page Headers
**Location:** `/src/components/common/PageHeader.js`

**What Changed:**
- ✅ Better responsive typography (xs: 1.5rem, sm: 2rem)
- ✅ Improved breadcrumbs styling with hover effects
- ✅ Proper spacing between elements
- ✅ `divider` prop to add bottom divider
- ✅ Icon support with primary color
- ✅ Better action button alignment

**Usage:**
```javascript
import { PageHeader, ActionButton } from '../components/common';

// Simple header
<PageHeader
  title="Dashboard"
  subtitle="Welcome back!"
/>

// With breadcrumbs
<PageHeader
  title="Pond Details"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Ponds', href: '/ponds' },
    { label: 'Pond A' }
  ]}
/>

// With actions
<PageHeader
  title="Fish Management"
  subtitle="Manage your fish inventory"
  icon={<FishIcon />}
  actions={
    <>
      <ActionButton
        icon={<RefreshIcon />}
        onClick={handleRefresh}
        variant="outlined"
        iconOnly
      />
      <ActionButton
        icon={<AddIcon />}
        onClick={handleAdd}
      >
        Add Fish
      </ActionButton>
    </>
  }
  divider
/>
```

**Props:**
- `title` - Page title (required)
- `subtitle` - Page subtitle/description
- `breadcrumbs` - Array of { label, href }
- `icon` - Title icon
- `actions` - Action buttons (React node)
- `divider` - Show divider below (default: true)
- `sx` - Custom styles

---

### **6. DataGrid** - Enhanced Data Display
**Location:** `/src/components/common/DataGrid.js`

**What Changed:**
- ✅ Better empty state handling with action support
- ✅ Configurable loading variant (circular|linear|skeleton)
- ✅ Grid props with xl breakpoint support
- ✅ Error object support (not just strings)
- ✅ Default skeleton loading for better UX

**Usage:**
```javascript
import { DataGrid } from '../components/common';

// Grid mode
<DataGrid
  items={items}
  renderItem={(item) => <ItemCard item={item} />}
  loading={loading}
  error={error}
  onRetry={handleRetry}
  gridProps={{ xs: 12, sm: 6, md: 4, lg: 3 }}
  emptyTitle="No items found"
  emptyMessage="Try adjusting your filters"
  emptyActionLabel="Reset Filters"
  onEmptyAction={handleResetFilters}
/>

// Compact (list) mode
<DataGrid
  items={items}
  renderItem={(item) => <ItemRow item={item} />}
  compact
  spacing={2}
  loading={loading}
  loadingVariant="skeleton"
/>
```

**Props:**
- `items` - Array of items
- `renderItem` - Render function (item, index) => ReactNode
- `getKey` - Key extractor (item, index) => string
- `loading` - Loading state
- `error` - Error message or Error object
- `onRetry` - Retry handler
- `compact` - List mode instead of grid
- `spacing` - Grid/Stack spacing (default: 3)
- `gridProps` - { xs, sm, md, lg, xl } (default: { xs:12, sm:6, md:4, lg:3 })
- `emptyIcon` - Empty state icon (default: 📭)
- `emptyTitle` - Empty state title
- `emptyMessage` - Empty state message
- `emptyActionLabel` - Empty action button label
- `onEmptyAction` - Empty action handler
- `loadingMessage` - Loading message
- `loadingVariant` - circular|linear|skeleton (default: skeleton)
- `sx` - Custom styles

---

### **7. FilterBar** - Enhanced Filter Toolbar
**Location:** `/src/components/common/FilterBar.js`

**What Changed:**
- ✅ Better responsive layout (column on mobile, row on desktop)
- ✅ Proper spacing and alignment
- ✅ `showDivider` prop for visual separation
- ✅ Custom `addIcon` support
- ✅ Improved action button grouping

**Usage:**
```javascript
import { FilterBar } from '../components/common';

<FilterBar
  // Search
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Search fish..."
  
  // Filters
  filters={[
    {
      name: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: ['active', 'inactive']
    },
    {
      name: 'pond',
      label: 'Pond',
      value: pondFilter,
      onChange: setPondFilter,
      options: ponds
    }
  ]}
  
  // Date range
  dateRange={{
    start: startDate,
    end: endDate,
    onStartChange: setStartDate,
    onEndChange: setEndDate
  }}
  
  // Actions
  onAddNew={handleAdd}
  addLabel="Add Fish"
  addIcon={<AddIcon />}
  onRefresh={handleRefresh}
  loading={loading}
  
  // Extra actions
  extraActions={
    <ActionButton
      icon={<ExportIcon />}
      onClick={handleExport}
      variant="outlined"
    >
      Export
    </ActionButton>
  }
  
  showDivider
/>
```

**Props:**
- `searchTerm` - Search value
- `onSearchChange` - Search handler
- `searchPlaceholder` - Search placeholder
- `filters` - Array of filter configs
- `dateRange` - { start, end, onStartChange, onEndChange }
- `onAddNew` - Add new handler
- `addLabel` - Add button label (default: "Add New")
- `addIcon` - Custom add icon
- `onRefresh` - Refresh handler
- `loading` - Loading state
- `extraActions` - Extra action buttons
- `showDivider` - Show bottom divider
- `sx` - Custom styles

---

## 🎨 Theme Support

All components use theme-aware colors:

| Token | Usage | Light Mode | Dark Mode |
|-------|-------|------------|-----------|
| `background.paper` | Card backgrounds | White | Dark gray |
| `background.default` | Section backgrounds | Light gray | Darker gray |
| `text.primary` | Main text | Black | White |
| `text.secondary` | Helper text | Gray | Light gray |
| `primary.main` | Primary actions | Blue | Cyan |
| `success.main` | Success states | Green | Light green |
| `error.main` | Error states | Red | Light red |
| `warning.main` | Warning states | Orange | Light orange |
| `info.main` | Info states | Blue | Light blue |
| `divider` | Borders | Light gray | Dark gray |
| `action.hover` | Hover states | Light gray | Dark gray |

---

## 📱 Responsive Breakpoints

All components use consistent breakpoints:

```javascript
xs: 0px      // Mobile (< 600px)
sm: 600px    // Tablet (600-900px)
md: 900px    // Desktop (900-1200px)
lg: 1200px   // Large (1200-1536px)
xl: 1536px   // Extra large (> 1536px)
```

**Default Grid Behavior:**
- Mobile (xs): Full width (12 columns)
- Tablet (sm): Half width (6 columns)
- Desktop (md): 1/3 width (4 columns)
- Large (lg): 1/4 width (3 columns)

---

## ✅ Best Practices

1. **Always use theme tokens** - Never hardcode colors
2. **Test in both themes** - Toggle dark/light mode
3. **Use responsive props** - { xs, sm, md, lg }
4. **Provide helper text** - Guide users
5. **Handle loading states** - Use ActionButton loading prop
6. **Show empty states** - Use DataGrid empty props
7. **Use proper icons** - MUI icons for consistency
8. **Add tooltips** - For icon-only buttons
9. **Group related actions** - Use FilterBar
10. **Keep spacing consistent** - Use spacing prop (default: 2-3)

---

## 🚀 Migration Guide

### **Before (Old Component):**
```javascript
// Old - Hardcoded styles
<Button
  variant="contained"
  onClick={handleClick}
  sx={{
    borderRadius: 2,
    textTransform: 'capitalize',
    minWidth: 120
  }}
>
  Click Me
</Button>
```

### **After (New Component):**
```javascript
// New - Using ActionButton with defaults
<ActionButton onClick={handleClick}>
  Click Me
</ActionButton>
// Automatically gets:
// - Responsive minWidth
// - textTransform: 'none'
// - Theme-aware colors
// - Loading state support
```

---

## 📊 Summary

### **Components Updated:**
- ✅ ActionButton - Enhanced buttons
- ✅ SearchInput - Enhanced search
- ✅ BaseCard - Enhanced cards
- ✅ StatusChip - 10 built-in statuses
- ✅ PageHeader - Enhanced headers
- ✅ DataGrid - Better data display
- ✅ FilterBar - Enhanced filters

### **Features Added:**
- ✅ Theme-aware colors (dark/light mode)
- ✅ Responsive defaults
- ✅ Better prop support
- ✅ Improved accessibility
- ✅ Consistent spacing
- ✅ Loading states
- ✅ Empty states
- ✅ Error handling

### **Benefits:**
- ✅ **Consistent UI** - Same look across the app
- ✅ **Less Code** - Default styles built-in
- ✅ **Better UX** - Responsive, accessible, theme-aware
- ✅ **Easy Maintenance** - Centralized components
- ✅ **Future-Proof** - Following MUI best practices

---

## 📖 Additional Resources

- **Form Components:** `/FORM_COMPONENTS_GUIDE.md`
- **Common Components:** `/src/components/common/`
- **MUI Documentation:** https://mui.com
- **Theme Configuration:** Check your theme provider

---

**Status:** ✅ **PRODUCTION READY**  
**Last Updated:** February 1, 2026  
**Components Updated:** 7 Core UI Components
