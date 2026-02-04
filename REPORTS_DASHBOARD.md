# Reports Dashboard Implementation

## Overview

The Reports Dashboard is a fully configurable, dynamic reports system with real API integration. Users can add, remove, and configure widgets to create personalized report views.

## Features

### 1. Dynamic Widget System
- **Add Widgets**: Click "Add Widget" to add new charts, tables, or summaries
- **Remove Widgets**: Each widget has a menu with remove option
- **Configure Widgets**: Edit widget settings like title, data source, and display options
- **Show/Hide Widgets**: Toggle widget visibility without removing them

### 2. Widget Types Available
- **Bar Chart**: Compare values across categories
- **Line Chart**: Show trends over time
- **Data Table**: Display detailed data with sorting, pagination, and export
- **Summary Stats**: Key metrics at a glance (total, count, average)
- **Stat Cards**: Quick overview stats (displayed in separate container)

### 3. Layout Structure
The dashboard is organized into distinct sections for better visibility:

1. **Quick Overview Section** - Displays stat cards in a dedicated Paper container at the top
2. **Report Widgets Section** - Contains all charts, tables, and summaries in a separate grid below

### 3. Data Sources
Reports can pull data from:
- Samplings
- Harvests
- Feedings
- Mortalities
- Expenses
- Purchases
- Transfers
- Treatments
- Maintenance

### 4. Filtering
- **Date Range**: Filter by start and end date
- **Report Type**: Daily, Weekly, Monthly, Quarterly, Annual, Custom
- **Category**: Production, Financial, Inventory, Operations
- **Active Filters**: Shown as chips with quick remove

### 5. Settings Panel
- Toggle widget visibility
- Toggle filter visibility
- Reset dashboard to defaults

### 6. Persistence
- Widget configuration saved to localStorage
- Filter visibility preferences saved
- Survives browser refresh

## File Structure

```
src/
├── api/
│   └── reports.js              # API functions for fetching report data
├── contexts/
│   └── ReportContext.js        # State management for reports
├── components/
│   └── reports/
│       ├── widgets/
│       │   ├── index.js
│       │   ├── WidgetContainer.js    # Base widget wrapper
│       │   ├── ChartWidget.js        # Bar & Line charts
│       │   ├── TableWidget.js        # DataTable integration
│       │   ├── SummaryWidget.js      # Summary statistics
│       │   ├── AddWidgetDialog.js    # Add new widget wizard
│       │   └── WidgetConfigDialog.js # Edit widget settings
│       └── index.js            # Exports all report components
└── pages/
    └── user/
        └── ReportsPage.js      # Main reports dashboard page
```

## Usage

### Basic Setup
The ReportsPage automatically wraps itself with the ReportProvider:

```jsx
import ReportsPage from './pages/user/ReportsPage';

// In your routes
<Route path="/reports" element={<ReportsPage />} />
```

### Adding Custom Widgets Programmatically

```jsx
import { useReportContext, WIDGET_TYPES, DATA_SOURCES } from './contexts/ReportContext';

function MyComponent() {
  const { addWidget } = useReportContext();
  
  const handleAddChart = () => {
    addWidget({
      type: WIDGET_TYPES.BAR_CHART,
      title: 'My Custom Chart',
      dataSource: DATA_SOURCES.HARVESTS,
      config: {
        xKey: 'pond_name',
        bars: [{ key: 'total_weight', name: 'Weight' }],
      },
      size: { cols: 6, rows: 2 },
    });
  };
}
```

### Using ReportsAPI Directly

```jsx
import reportsApi, { aggregateByDate } from './api/reports';

async function fetchData() {
  const samplings = await reportsApi.fetchSamplings({
    start_date: '2026-01-01',
    end_date: '2026-02-01',
  });
  
  const chartData = aggregateByDate(samplings, 'created_at');
}
```

## Widget Configuration Options

### Chart Widgets
```javascript
{
  type: WIDGET_TYPES.BAR_CHART | WIDGET_TYPES.LINE_CHART,
  title: 'Chart Title',
  dataSource: DATA_SOURCES.SAMPLINGS,
  config: {
    xKey: 'date',           // X-axis field
    bars/lines: [{
      key: 'value',
      name: 'Display Name',
      color: '#4caf50',
    }],
    height: 250,
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    stacked: false,         // For bar charts only
  },
  size: { cols: 6, rows: 2 },
}
```

### Table Widgets
```javascript
{
  type: WIDGET_TYPES.TABLE,
  title: 'Table Title',
  dataSource: DATA_SOURCES.EXPENSES,
  config: {
    columns: [
      { id: 'description', label: 'Description' },
      { id: 'amount', label: 'Amount', format: 'currency', align: 'right' },
      { id: 'created_at', label: 'Date', format: 'date' },
    ],
    selectable: false,
    exportable: true,
    showPagination: true,
    initialRowCount: 5,
    dense: false,
  },
  size: { cols: 12, rows: 2 },
}
```

### Summary Widgets
```javascript
{
  type: WIDGET_TYPES.SUMMARY,
  title: 'Summary Title',
  dataSource: DATA_SOURCES.MORTALITIES,
  config: {
    valueField: 'count',
    showTotal: true,
    showCount: true,
    showAverage: true,
    showMin: false,
    showMax: false,
    totalFormat: 'number',   // 'number' | 'currency' | 'percentage'
  },
  size: { cols: 6, rows: 2 },
}
```

## Column Format Types

For table columns, available formats:
- `currency` - Displays as $1,234.56
- `number` - Displays with commas (1,234)
- `date` - Short date format
- `datetime` - Date and time
- `status` - Colored chip
- `percentage` - Displays as 12.3%

## API Reference

### reportsApi

| Function | Description | Parameters |
|----------|-------------|------------|
| `fetchSamplings(params)` | Fetch sampling records | `{ start_date, end_date, pond_id }` |
| `fetchHarvests(params)` | Fetch harvest records | `{ start_date, end_date, pond_id }` |
| `fetchFeedings(params)` | Fetch feeding logs | `{ start_date, end_date, pond_id }` |
| `fetchMortalities(params)` | Fetch mortality records | `{ start_date, end_date, pond_id }` |
| `fetchExpenses(params)` | Fetch expense records | `{ start_date, end_date, pond_id }` |
| `fetchPurchases(params)` | Fetch purchase orders | `{ start_date, end_date, pond_id }` |
| `fetchTransfers(params)` | Fetch stock transfers | `{ start_date, end_date, pond_id }` |
| `fetchTreatments(params)` | Fetch treatment records | `{ start_date, end_date, pond_id }` |
| `fetchMaintenance(params)` | Fetch maintenance logs | `{ start_date, end_date, pond_id }` |

### Helper Functions

| Function | Description |
|----------|-------------|
| `aggregateByDate(data, dateField, valueField, aggregation)` | Group data by date |
| `aggregateByCategory(data, categoryField, valueField)` | Group data by category |
| `calculateSummary(data, valueField)` | Calculate statistics (total, count, avg, min, max) |

## ReportContext API

### State
- `widgets` - All widget configurations
- `visibleWidgets` - Only visible widgets, sorted by order
- `filters` - Current filter values
- `filterVisibility` - Which filters are shown
- `dataCache` - Cached API data by source
- `loadingState` - Loading state by source

### Actions
- `addWidget(config)` - Add new widget
- `removeWidget(id)` - Remove widget
- `updateWidget(id, updates)` - Update widget configuration
- `toggleWidgetVisibility(id)` - Show/hide widget
- `reorderWidgets(from, to)` - Reorder widgets
- `resetWidgets()` - Reset to defaults
- `updateFilter(key, value)` - Update filter value
- `resetFilters()` - Clear all filters
- `toggleFilterVisibility(key)` - Show/hide filter
- `setDataForSource(source, data)` - Cache data
- `clearDataCache()` - Clear all cached data

## Future Enhancements

1. **Drag-and-drop** - Reorder widgets by dragging
2. **Saved Layouts** - Save/load dashboard configurations
3. **Export Dashboard** - Export entire dashboard as PDF
4. **Scheduled Reports** - Auto-generate reports on schedule
5. **Custom Queries** - Build custom data queries
6. **Sharing** - Share dashboard configurations with other users
