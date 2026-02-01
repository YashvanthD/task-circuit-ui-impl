# 📚 Complete Component Library - Usage Guide

**Last Updated:** February 1, 2026  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Form Components (9)](#form-components)
3. [UI Components (7)](#ui-components)
4. [State Components (13)](#state-components)
5. [Quick Reference](#quick-reference)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## 🎯 Overview

**Total Components:** 29 Production-Ready Components

### Component Categories

| Category | Count | Description |
|----------|-------|-------------|
| **Form Components** | 9 | Building forms (containers, fields, dropdowns, etc.) |
| **UI Components** | 7 | Core UI elements (buttons, cards, headers, etc.) |
| **State Components** | 13 | Loading, error, empty states, etc. |

### Key Features

- ✅ **Theme-Aware** - Perfect dark/light mode support
- ✅ **Responsive** - Mobile, tablet, desktop optimized
- ✅ **Centralized** - Consistent defaults, no repetitive styling
- ✅ **Accessible** - WCAG AA compliant
- ✅ **Type-Safe** - Full JSDoc documentation

---

## 📝 Form Components

### Import

```javascript
import {
  FormContainer,
  FormSection,
  FormField,
  FormDropdown,
  FormRadio,
  FormFileUpload,
  FormKeyValue,
  FormRepeater,
  FormActions
} from './components/common/forms';
```

---

### 1. FormContainer

**Purpose:** Wrapper for all forms with consistent Paper styling

**Props:**
- `title` (string) - Form title
- `maxWidth` (number) - Max width in px (default: 1000)
- `elevation` (number) - Paper elevation (default: 2)
- `onSubmit` (function) - Form submit handler

**Example:**
```javascript
<FormContainer title="Add New Fish" maxWidth={1200}>
  <Grid container spacing={3}>
    {/* Form content */}
  </Grid>
</FormContainer>
```

**Features:**
- Responsive padding (xs: 3, sm: 4, md: 5)
- Auto-centered with margins
- Theme-aware background
- Built-in form element

---

### 2. FormSection

**Purpose:** Section headers with visual separators

**Props:**
- `title` (string) - Section title
- `subtitle` (string) - Optional description
- `divider` (boolean) - Show bottom border (default: true)

**Example:**
```javascript
<FormSection 
  title="Basic Information"
  subtitle="Enter fish details"
>
  <FormField ... />
  <FormField ... />
</FormSection>
```

**Features:**
- Primary color borders
- Responsive spacing
- Clear visual hierarchy

---

### 3. FormField

**Purpose:** Text, number, date inputs with units

**Props:**
- `xs, sm, md, lg` (number) - Grid columns
- `label` (string) - Field label
- `value` (any) - Field value
- `onChange` (function) - Change handler
- `type` (string) - Input type (text, number, date)
- `unit` (string) - Unit to display (kg, m, ₹)
- `unitPosition` (string) - start or end (default: end)
- `required` (boolean) - Required field
- `multiline` (boolean) - Multiline text
- `rows` (number) - Rows for multiline
- `helperText` (string) - Helper text
- `inputProps` (object) - Additional props (min, max, step)

**Examples:**

```javascript
// Simple text field
<FormField
  label="Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
  xs={12} sm={6}
/>

// Number with unit
<FormField
  label="Weight"
  type="number"
  value={weight}
  onChange={(e) => setWeight(e.target.value)}
  unit="kg"
  inputProps={{ min: 0, step: 0.1 }}
  xs={12} sm={6}
/>

// Currency
<FormField
  label="Price"
  type="number"
  value={price}
  onChange={(e) => setPrice(e.target.value)}
  unit="₹"
  unitPosition="start"
  xs={12} sm={6}
/>

// Multiline
<FormField
  label="Notes"
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  multiline
  rows={4}
  xs={12}
/>
```

**Features:**
- Responsive min-width (xs: 100%, sm: 180px)
- Built-in unit support
- Helper text support

---

### 4. FormDropdown

**Purpose:** Dropdown/autocomplete with refresh option

**Props:**
- `xs, sm, md, lg` (number) - Grid columns
- `label` (string) - Field label
- `value` (any) - Selected value
- `onChange` (function) - Change handler (e, value) => {}
- `options` (array) - Array of options
- `getOptionLabel` (function) - Get label from option
- `multiple` (boolean) - Multi-select mode
- `required` (boolean) - Required field
- `loading` (boolean) - Loading state
- `onRefresh` (function) - Refresh callback
- `showRefresh` (boolean) - Show refresh button

**Example:**

```javascript
// Simple dropdown
<FormDropdown
  label="Status"
  value={status}
  onChange={(e, val) => setStatus(val)}
  options={['active', 'inactive', 'pending']}
/>

// Multi-select with refresh
<FormDropdown
  label="Ponds"
  value={selectedPonds}
  onChange={(e, val) => setSelectedPonds(val)}
  options={ponds}
  getOptionLabel={(opt) => opt.name}
  multiple
  loading={loadingPonds}
  onRefresh={loadPonds}
/>
```

**Features:**
- Chip rendering for multi-select
- Loading indicator
- Refresh button
- Theme-aware

---

### 5. FormRadio

**Purpose:** Radio button groups

**Props:**
- `xs, sm, md, lg` (number) - Grid columns
- `label` (string) - Field label
- `value` (any) - Selected value
- `onChange` (function) - Change handler
- `options` (array) - Array of {label, value} objects
- `row` (boolean) - Horizontal layout
- `required` (boolean) - Required field

**Example:**

```javascript
<FormRadio
  label="Gender"
  value={gender}
  onChange={(e, val) => setGender(val)}
  options={[
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' }
  ]}
  row
/>
```

---

### 6. FormFileUpload

**Purpose:** File upload with preview

**Props:**
- `xs, sm, md, lg` (number) - Grid columns
- `label` (string) - Field label
- `value` (File|string) - Selected file or URL
- `onChange` (function) - Change handler (file) => {}
- `onRemove` (function) - Remove handler
- `accept` (string) - File types (default: "image/*")
- `showPreview` (boolean) - Show preview (default: true)
- `required` (boolean) - Required field

**Example:**

```javascript
<FormFileUpload
  label="Fish Photo"
  value={photo}
  onChange={(file) => setPhoto(file)}
  onRemove={() => setPhoto(null)}
  accept="image/*"
  xs={12} sm={6}
/>
```

**Features:**
- Image preview
- Delete button
- File name display
- Theme-aware

---

### 7. FormKeyValue

**Purpose:** Dynamic key-value pair editor

**Props:**
- `label` (string) - Section label
- `value` (object) - Object of key-value pairs
- `onChange` (function) - Change handler (newObject) => {}
- `keyLabel` (string) - Key field label (default: "Key")
- `valueLabel` (string) - Value field label (default: "Value")

**Example:**

```javascript
<FormKeyValue
  label="Custom Metadata"
  value={metadata}
  onChange={(newMeta) => setMetadata(newMeta)}
  keyLabel="Property"
  valueLabel="Value"
/>

// User can add: { "water_temp": "25°C", "ph_level": "7.2" }
```

**Features:**
- Add/remove pairs dynamically
- Edit existing pairs
- Validation on keys

---

### 8. FormRepeater

**Purpose:** Repeatable form sections (add/remove multiple items)

**Props:**
- `label` (string) - Section label
- `value` (array) - Array of items
- `onChange` (function) - Change handler (newArray) => {}
- `renderItem` (function) - Render function (item, index, handleChange) => ReactNode
- `getDefaultItem` (function) - Create new item
- `minItems` (number) - Minimum items (default: 0)
- `maxItems` (number) - Maximum items
- `addButtonText` (string) - Add button text

**Example:**

```javascript
<FormRepeater
  label="Fish Entries"
  value={fishEntries}
  onChange={setFishEntries}
  getDefaultItem={() => ({ 
    type: '', 
    weight: '', 
    price: '' 
  })}
  minItems={1}
  maxItems={10}
  addButtonText="Add Fish Type"
  renderItem={(item, index, handleChange) => (
    <Grid container spacing={2}>
      <FormField
        label="Type"
        value={item.type}
        onChange={(e) => handleChange({
          ...item,
          type: e.target.value
        })}
        xs={12} sm={4}
      />
      <FormField
        label="Weight"
        type="number"
        value={item.weight}
        onChange={(e) => handleChange({
          ...item,
          weight: e.target.value
        })}
        unit="kg"
        xs={12} sm={4}
      />
      <FormField
        label="Price"
        type="number"
        value={item.price}
        onChange={(e) => handleChange({
          ...item,
          price: e.target.value
        })}
        unit="₹"
        unitPosition="start"
        xs={12} sm={4}
      />
    </Grid>
  )}
/>
```

**Features:**
- Add/remove items with + and - buttons
- Min/max items validation
- Bordered sections for clarity
- Item numbering

---

### 9. FormActions

**Purpose:** Submit/Cancel buttons

**Props:**
- `onSubmit` (function) - Submit handler
- `onCancel` (function) - Cancel handler
- `submitText` (string) - Submit text (default: "Submit")
- `cancelText` (string) - Cancel text (default: "Cancel")
- `loading` (boolean) - Loading state
- `disabled` (boolean) - Disabled state
- `showDivider` (boolean) - Show divider above (default: true)

**Example:**

```javascript
<FormActions
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  submitText="Create Fish"
  cancelText="Cancel"
  loading={isSubmitting}
/>
```

**Features:**
- Responsive layout (column on mobile, row on desktop)
- Loading state support
- Consistent spacing

---

## 🎨 UI Components

### Import

```javascript
import {
  ActionButton,
  SearchInput,
  BaseCard,
  StatusChip,
  PageHeader,
  DataGrid,
  FilterBar
} from './components/common';
```

---

### 1. ActionButton

**Purpose:** Enhanced action buttons with loading, icons, tooltips

**Props:**
- `children` (ReactNode) - Button text
- `icon` (ReactNode) - Button icon
- `tooltip` (string) - Tooltip text
- `onClick` (function) - Click handler
- `color` (string) - primary|secondary|error|warning|info|success
- `variant` (string) - contained|outlined|text (default: contained)
- `size` (string) - small|medium|large (default: medium)
- `loading` (boolean) - Loading state
- `disabled` (boolean) - Disabled state
- `iconOnly` (boolean) - Icon-only mode
- `fullWidth` (boolean) - Full width button
- `type` (string) - button|submit|reset (default: button)

**Examples:**

```javascript
// Regular button
<ActionButton
  icon={<AddIcon />}
  onClick={handleAdd}
  variant="contained"
  color="primary"
>
  Add Item
</ActionButton>

// Icon-only with tooltip
<ActionButton
  icon={<RefreshIcon />}
  onClick={handleRefresh}
  tooltip="Refresh data"
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

// Full width
<ActionButton
  fullWidth
  onClick={handleSave}
  color="success"
>
  Save Changes
</ActionButton>
```

**Features:**
- Responsive min-width (xs: 100px, sm: 120px)
- Better readability (textTransform: 'none')
- Theme-aware colors
- Loading spinner

---

### 2. SearchInput

**Purpose:** Search field with icon and clear button

**Props:**
- `value` (string) - Current value
- `onChange` (function) - Change handler (value) => {}
- `placeholder` (string) - Placeholder (default: "Search...")
- `label` (string) - Optional label
- `size` (string) - small|medium (default: small)
- `fullWidth` (boolean) - Full width mode
- `minWidth` (number) - Min width (default: 200)
- `maxWidth` (number) - Max width (default: 400)
- `showClear` (boolean) - Show clear button (default: true)
- `onClear` (function) - Clear callback
- `disabled` (boolean) - Disabled state

**Example:**

```javascript
<SearchInput
  value={searchTerm}
  onChange={(value) => setSearchTerm(value)}
  placeholder="Search fish..."
  label="Search"
  showClear
  onClear={() => console.log('Cleared')}
/>
```

**Features:**
- Search icon
- Clear button when has value
- Hover effects
- Responsive width

---

### 3. BaseCard

**Purpose:** Card component with header, body, footer

**Props:**
- `children` (ReactNode) - Card content
- `title` (string) - Card title
- `subtitle` (string) - Card subtitle
- `header` (ReactNode) - Custom header
- `headerAction` (ReactNode) - Header action (button, icon)
- `footer` (ReactNode) - Footer content
- `hoverable` (boolean) - Enable hover effect
- `clickable` (boolean) - Enable click effect
- `onClick` (function) - Click handler
- `elevation` (number) - Paper elevation (default: 2)
- `noPadding` (boolean) - Remove body padding
- `divider` (boolean) - Show divider after header

**Examples:**

```javascript
// Simple card
<BaseCard
  title="Fish Details"
  subtitle="Active since Jan 2026"
>
  Card content here
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
  Form fields
</BaseCard>

// Hoverable/Clickable card
<BaseCard
  title="Pond A"
  hoverable
  clickable
  onClick={() => navigate('/pond/a')}
>
  Pond details
</BaseCard>
```

**Features:**
- Responsive padding (xs: 2, sm: 2.5)
- Hover effects
- Theme-aware
- Flexible layout

---

### 4. StatusChip

**Purpose:** Status badges with 10 built-in presets

**Built-in Statuses:**
- `active`, `inactive`, `pending`, `completed`, `failed`
- `draft`, `success`, `error`, `warning`, `info`

**Props:**
- `status` (string) - Status value
- `config` (object) - Custom config {bg, color, label, icon}
- `label` (string) - Override label
- `size` (string) - small|medium (default: small)
- `variant` (string) - filled|outlined (default: filled)
- `showIcon` (boolean) - Show icon (default: true)

**Examples:**

```javascript
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
    label: 'Processing',
    bg: '#FF5722',
    color: '#fff',
    icon: <ProcessIcon />
  }}
/>

// Outlined variant
<StatusChip status="success" variant="outlined" />
```

**Features:**
- 10 built-in themes
- Icons included
- Theme-aware colors
- Customizable

---

### 5. PageHeader

**Purpose:** Page headers with title, breadcrumbs, actions

**Props:**
- `title` (string) - Page title
- `subtitle` (string) - Page description
- `breadcrumbs` (array) - [{label, href}]
- `icon` (ReactNode) - Title icon
- `actions` (ReactNode) - Action buttons
- `divider` (boolean) - Show divider (default: true)

**Examples:**

```javascript
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

**Features:**
- Responsive typography
- Breadcrumb navigation
- Action button support
- Theme-aware

---

### 6. DataGrid

**Purpose:** Grid/list layout with loading/error/empty states

**Props:**
- `items` (array) - Array of items
- `renderItem` (function) - (item, index) => ReactNode
- `getKey` (function) - (item, index) => string
- `loading` (boolean) - Loading state
- `error` (string|Error) - Error message
- `onRetry` (function) - Retry handler
- `compact` (boolean) - List mode instead of grid
- `spacing` (number) - Grid spacing (default: 3)
- `gridProps` (object) - {xs, sm, md, lg, xl} (default: {xs:12, sm:6, md:4, lg:3})
- `emptyIcon` (string) - Empty icon (default: 📭)
- `emptyTitle` (string) - Empty title
- `emptyMessage` (string) - Empty message
- `emptyActionLabel` (string) - Empty action button
- `onEmptyAction` (function) - Empty action handler
- `loadingMessage` (string) - Loading message
- `loadingVariant` (string) - circular|linear|skeleton (default: skeleton)

**Examples:**

```javascript
// Grid mode
<DataGrid
  items={fish}
  renderItem={(fish) => <FishCard fish={fish} />}
  loading={loading}
  error={error}
  onRetry={handleRetry}
  gridProps={{ xs: 12, sm: 6, md: 4, lg: 3 }}
  emptyTitle="No fish found"
  emptyMessage="Add your first fish to get started"
  emptyActionLabel="Add Fish"
  onEmptyAction={handleAdd}
/>

// Compact (list) mode
<DataGrid
  items={tasks}
  renderItem={(task) => <TaskRow task={task} />}
  compact
  spacing={2}
  loading={loading}
  loadingVariant="skeleton"
/>
```

**Features:**
- Built-in loading states
- Error handling with retry
- Empty state with actions
- Responsive grid

---

### 7. FilterBar

**Purpose:** Filter toolbar with search, filters, actions

**Props:**
- `searchTerm` (string) - Search value
- `onSearchChange` (function) - Search handler
- `searchPlaceholder` (string) - Placeholder
- `filters` (array) - Filter configs
- `dateRange` (object) - {start, end, onStartChange, onEndChange}
- `onAddNew` (function) - Add new handler
- `addLabel` (string) - Add button label
- `addIcon` (ReactNode) - Custom add icon
- `onRefresh` (function) - Refresh handler
- `loading` (boolean) - Loading state
- `extraActions` (ReactNode) - Extra buttons
- `showDivider` (boolean) - Show divider

**Example:**

```javascript
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
  onRefresh={handleRefresh}
  loading={loading}
  
  // Extra
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

**Features:**
- Search input
- Multiple filters
- Date range picker
- Add/Refresh buttons
- Responsive layout

---

## 📊 State Components

### Import

```javascript
import {
  LoadingState,
  EmptyState,
  ErrorState,
  ConfirmDialog
  // ...and more
} from './components/common';
```

### Available Components

1. **LoadingState** - Loading indicators (circular, linear, skeleton)
2. **EmptyState** - No data displays with actions
3. **ErrorState** - Error messages with retry
4. **ConfirmDialog** - Confirmation dialogs
5. **AlertPopup** - Alert notifications
6. **StatusChip** - Status badges (also in UI)
7. **StatCard** - Statistics cards
8. **BaseCard** - Card wrapper (also in UI)
9. **PageHeader** - Page headers (also in UI)
10. **DataGrid** - Data tables (also in UI)
11. **SearchInput** - Search fields (also in UI)
12. **FilterBar** - Filter toolbar (also in UI)
13. **ActionButton** - Action buttons (also in UI)

---

## 🚀 Quick Reference

### Complete Form Example

```javascript
import { Grid } from '@mui/material';
import {
  FormContainer,
  FormSection,
  FormField,
  FormDropdown,
  FormFileUpload,
  FormActions
} from './components/common/forms';

function AddFishForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    species: '',
    weight: '',
    ponds: [],
    photo: null
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <FormContainer title="Add New Fish" onSubmit={() => onSubmit(form)}>
      <Grid container spacing={3}>
        {/* Basic Info */}
        <FormSection title="Basic Information">
          <FormField
            label="Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            xs={12} sm={6}
          />
          <FormField
            label="Species"
            value={form.species}
            onChange={(e) => handleChange('species', e.target.value)}
            xs={12} sm={6}
          />
        </FormSection>

        {/* Measurements */}
        <FormSection title="Measurements">
          <FormField
            label="Weight"
            type="number"
            value={form.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            unit="kg"
            inputProps={{ min: 0, step: 0.1 }}
            xs={12} sm={6}
          />
        </FormSection>

        {/* Location */}
        <FormSection title="Location">
          <FormDropdown
            label="Ponds"
            value={form.ponds}
            onChange={(e, val) => handleChange('ponds', val)}
            options={ponds}
            getOptionLabel={(opt) => opt.name}
            multiple
          />
        </FormSection>

        {/* Photo */}
        <FormSection title="Photo">
          <FormFileUpload
            label="Fish Photo"
            value={form.photo}
            onChange={(file) => handleChange('photo', file)}
            onRemove={() => handleChange('photo', null)}
            xs={12} sm={6}
          />
        </FormSection>

        {/* Actions */}
        <FormActions
          submitText="Add Fish"
          onCancel={onCancel}
        />
      </Grid>
    </FormContainer>
  );
}
```

### Complete Page Example

```javascript
import {
  PageHeader,
  ActionButton,
  FilterBar,
  DataGrid
} from './components/common';

function FishListPage() {
  const [fish, setFish] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Fish Management"
        subtitle="Manage your fish inventory"
        actions={
          <ActionButton
            icon={<AddIcon />}
            onClick={() => navigate('/fish/add')}
          >
            Add Fish
          </ActionButton>
        }
      />

      {/* Filters */}
      <FilterBar
        searchTerm={search}
        onSearchChange={setSearch}
        filters={[{
          name: 'status',
          label: 'Status',
          value: status,
          onChange: setStatus,
          options: ['active', 'inactive']
        }]}
        onRefresh={loadFish}
        loading={loading}
      />

      {/* Data Grid */}
      <DataGrid
        items={fish}
        renderItem={(fish) => (
          <BaseCard
            title={fish.name}
            subtitle={fish.species}
            headerAction={<StatusChip status={fish.status} />}
            hoverable
          >
            <Typography>Weight: {fish.weight} kg</Typography>
          </BaseCard>
        )}
        loading={loading}
        gridProps={{ xs: 12, sm: 6, md: 4 }}
        emptyTitle="No fish found"
        emptyActionLabel="Add Fish"
        onEmptyAction={() => navigate('/fish/add')}
      />
    </>
  );
}
```

---

## ✅ Best Practices

### 1. Use Centralized Components
```javascript
// ❌ Don't
<Button sx={{ borderRadius: 2, minWidth: 120, ... }}>

// ✅ Do
<ActionButton>
```

### 2. Theme-Aware Colors
```javascript
// ❌ Don't
sx={{ bgcolor: '#fff', color: '#000' }}

// ✅ Do
sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
```

### 3. Responsive Grid
```javascript
// ❌ Don't
<Grid item xs={6}>

// ✅ Do
<FormField xs={12} sm={6} md={4}>
```

### 4. Helper Text
```javascript
// ❌ Don't
<FormField label="Email" />

// ✅ Do
<FormField
  label="Email"
  helperText="We'll never share your email"
/>
```

### 5. Loading States
```javascript
// ❌ Don't
<Button disabled={loading}>

// ✅ Do
<ActionButton loading={loading}>
```

### 6. Empty States with Actions
```javascript
// ❌ Don't
{items.length === 0 && <p>No items</p>}

// ✅ Do
<DataGrid
  items={items}
  emptyActionLabel="Add Item"
  onEmptyAction={handleAdd}
/>
```

### 7. Form Sections
```javascript
// ❌ Don't
<Typography variant="h6">Basic Info</Typography>
<FormField ... />

// ✅ Do
<FormSection title="Basic Info">
  <FormField ... />
</FormSection>
```

### 8. Status Display
```javascript
// ❌ Don't
<Chip label={status} />

// ✅ Do
<StatusChip status={status} />
```

### 9. Page Headers
```javascript
// ❌ Don't
<Typography variant="h4">Page Title</Typography>

// ✅ Do
<PageHeader title="Page Title" subtitle="Description" />
```

### 10. Filter Bars
```javascript
// ❌ Don't
<TextField placeholder="Search..." />
<Select options={...} />

// ✅ Do
<FilterBar
  searchTerm={search}
  onSearchChange={setSearch}
  filters={[...]}
/>
```

---

## 🎨 Theme Tokens Reference

| Token | Usage | Light | Dark |
|-------|-------|-------|------|
| `background.paper` | Cards, forms | White | Dark gray |
| `background.default` | Page background | Light gray | Darker gray |
| `text.primary` | Main text | Black | White |
| `text.secondary` | Helper text | Gray | Light gray |
| `primary.main` | Primary actions | Blue | Cyan |
| `success.main` | Success states | Green | Light green |
| `error.main` | Error states | Red | Light red |
| `warning.main` | Warning states | Orange | Light orange |
| `info.main` | Info states | Blue | Light blue |
| `divider` | Borders | Light gray | Dark gray |
| `action.hover` | Hover effects | Light gray | Dark gray |

---

## 📱 Responsive Breakpoints

```javascript
xs: 0px      // Mobile (< 600px)
sm: 600px    // Tablet (600-900px)
md: 900px    // Desktop (900-1200px)
lg: 1200px   // Large (1200-1536px)
xl: 1536px   // Extra large (> 1536px)
```

**Grid Defaults:**
- Mobile (xs): 12 columns (full width)
- Tablet (sm): 6 columns (half width)
- Desktop (md): 4 columns (1/3 width)
- Large (lg): 3 columns (1/4 width)

---

## 📊 Component Summary

### Form Components (9)
- FormContainer, FormSection, FormField
- FormDropdown, FormRadio, FormFileUpload
- FormKeyValue, FormRepeater, FormActions

### UI Components (7)
- ActionButton, SearchInput, BaseCard
- StatusChip, PageHeader, DataGrid, FilterBar

### State Components (13+)
- LoadingState, EmptyState, ErrorState
- ConfirmDialog, AlertPopup, and more

---

## 🎯 Getting Started

1. **Choose Components** - Select from 29 available components
2. **Import** - Import from common/forms or common
3. **Use Props** - All components have sensible defaults
4. **Customize** - Override with sx prop if needed
5. **Test Themes** - Toggle dark/light mode
6. **Check Mobile** - Test on different screen sizes

---

**Status:** ✅ Production Ready  
**Total Components:** 29  
**Theme Support:** ✅ Dark & Light  
**Responsive:** ✅ Mobile/Tablet/Desktop  
**Documented:** ✅ Complete Guide

---

**Ready to build amazing UIs!** 🚀
