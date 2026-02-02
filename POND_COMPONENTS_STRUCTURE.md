# Pond Management - Component Structure & Architecture

**Date:** February 2, 2026  
**Status:** Component Planning Phase  
**Purpose:** Detailed breakdown of all reusable components for pond monitoring system  
**Related:** [Common Components Analysis](./COMMON_COMPONENTS_ANALYSIS.md) - Review existing common components

---

## 🔗 Prerequisites & Dependencies

### Required Common Components Analysis
**📄 See:** [COMMON_COMPONENTS_ANALYSIS.md](./COMMON_COMPONENTS_ANALYSIS.md)

**Summary of Findings:**
- ✅ **16+ common components ready to use** (BaseCard, FormContainer, DataTable, etc.)
- ❌ **Need to install Recharts** for charts/analytics (critical for pond monitoring)
- ❌ **Need to create 15+ new common components** (charts, enhanced UI, photo features)

**Action Required BEFORE Starting Pond Components:**
1. Install Recharts: `npm install recharts`
2. Create chart wrapper components (LineChart, BarChart, Sparkline)
3. Create enhanced components (MetricCard, TrendIndicator, ParameterIndicator)
4. Enhance FormFileUpload for camera access

**Dependencies Installation:**
```bash
# Required for analytics and trends
npm install recharts

# Optional but recommended for better dates
npm install @mui/x-date-pickers

# Optional for photo compression
npm install browser-image-compression
```

---

## 📋 Component Organization Strategy

### Component Categories
1. **Core Monitoring Components** - Daily operations (Priority 1)
2. **Data Display Components** - Information visualization (Priority 2)
3. **Form Components** - Data entry and management (Priority 3)
4. **IoT Device Components** - Device integration (Future/Phase 6)
5. **Shared/Common Components** - Cross-feature utilities

---

## 🎯 Priority 1: Core Monitoring Components

### 1. Pond Monitoring Components
**Location:** `src/components/pond/monitoring/`

#### 1.1 `PondMonitorCard.js` ⭐ PRIMARY
**Purpose:** Main card for daily pond monitoring  
**Props:**
```javascript
{
  pond: Pond,                    // Pond model instance
  health: PondHealth,            // Health status object
  currentStock: Stock,           // Current stock in pond
  lastWaterQuality: WaterQuality,// Latest WQ reading
  todaysTasks: Array<Task>,      // Daily task checklist
  onLogWQ: Function,             // Quick WQ log handler
  onFeed: Function,              // Quick feeding handler
  onViewDetails: Function,       // View full details
  onQuickLog: Function,          // Quick daily log
  priority: String               // urgent|attention|normal
}
```
**Features:**
- Alert banner if issues
- Stock summary
- WQ snapshot with status indicators
- Daily task checklist
- Quick action buttons
- Priority-based styling

**Dependencies:**
- `BaseCard` (common)
- `HealthStatusChip`
- `AlertBanner`
- `StockSummary`
- `WaterQualitySnapshot`
- `DailyTaskChecklist`
- `QuickActions`

---

#### 1.2 `HealthStatusChip.js` ⭐
**Purpose:** Visual health status indicator  
**Props:**
```javascript
{
  status: String,        // healthy|attention|critical|unknown
  size: String,          // small|medium|large
  showLabel: Boolean,    // Show text label
  showIcon: Boolean,     // Show emoji/icon
  onClick: Function      // Optional click handler
}
```
**Variants:**
- 🟢 Healthy (green)
- 🟡 Attention (yellow/warning)
- 🔴 Critical (red/error)
- ⚪ Unknown (grey)

**Dependencies:** None (standalone)

---

#### 1.3 `AlertBanner.js` ⭐
**Purpose:** Prominent issue/alert display  
**Props:**
```javascript
{
  issues: Array<String>, // List of issues
  severity: String,      // critical|warning|info
  onAction: Function,    // Primary action (e.g., "Fix Now")
  onDismiss: Function,   // Optional dismiss
  compact: Boolean       // Compact mode for cards
}
```
**Features:**
- Color-coded by severity
- Action button
- Dismissible option
- Icon + message

**Dependencies:** None (standalone)

---

#### 1.4 `DailyTaskChecklist.js` ⭐
**Purpose:** Show and track today's pond tasks  
**Props:**
```javascript
{
  tasks: Array<Task>,    // Task objects
  onComplete: Function,  // Mark task complete
  onTaskClick: Function, // Click to do task
  showProgress: Boolean, // Show progress bar
  compact: Boolean       // Compact view
}
```
**Task Object:**
```javascript
{
  id: String,
  type: String,          // wq_check|feeding|inspection|maintenance
  title: String,
  dueTime: String,       // HH:MM
  completed: Boolean,
  overdue: Boolean,
  priority: String       // high|medium|low
}
```

**Dependencies:**
- `TaskItem` (sub-component)
- `ProgressBar` (optional)

---

#### 1.5 `WaterQualitySnapshot.js` ⭐
**Purpose:** Compact WQ display for cards  
**Props:**
```javascript
{
  waterQuality: WaterQuality, // Latest WQ reading
  showTimestamp: Boolean,     // Show last checked time
  parameters: Array<String>,  // Which params to show
  compact: Boolean,           // Ultra-compact mode
  onClick: Function           // Click to see details
}
```
**Display:**
- Key parameters (pH, DO, Temp)
- Status indicators (✅/⚠️/❌)
- Last checked timestamp
- Overall status

**Dependencies:**
- `ParameterIndicator` (sub-component)

---

#### 1.6 `StockSummary.js` ⭐
**Purpose:** Brief stock info in pond card  
**Props:**
```javascript
{
  stock: Stock,          // Stock model instance
  showGrowth: Boolean,   // Show growth indicator
  compact: Boolean,      // Compact view
  onClick: Function      // Click for details
}
```
**Display:**
- Species name + icon
- Fish count
- Avg weight
- Days since stocking
- Growth indicator (optional)

**Dependencies:**
- `GrowthIndicator`

---

#### 1.7 `QuickActions.js`
**Purpose:** Quick action button bar  
**Props:**
```javascript
{
  actions: Array<Action>, // Action objects
  layout: String,         // horizontal|vertical|grid
  size: String,          // small|medium|large
  compact: Boolean
}
```
**Action Object:**
```javascript
{
  id: String,
  icon: String|Component,
  label: String,
  onClick: Function,
  disabled: Boolean,
  badge: String|Number    // Optional badge
}
```

**Dependencies:**
- `ActionButton` (common)

---

### 2. Dashboard Components
**Location:** `src/components/pond/dashboard/`

#### 2.1 `PondMonitoringDashboard.js`
**Purpose:** Main dashboard page container  
**Props:**
```javascript
{
  ponds: Array<Pond>,
  filters: Object,
  onFilterChange: Function,
  onPondClick: Function,
  loading: Boolean
}
```
**Features:**
- Statistics overview
- Filters and search
- Pond cards grid
- Quick actions bar
- Alert summary

**Dependencies:**
- `DashboardStats`
- `DashboardFilters`
- `PondMonitorCard` (multiple)
- `QuickActionsBar`

---

#### 2.2 `DashboardStats.js`
**Purpose:** Overview statistics cards  
**Props:**
```javascript
{
  stats: Object,         // Statistics object
  loading: Boolean
}
```
**Stats Display:**
- Total ponds
- Active ponds
- Needs attention count
- Today's tasks completion
- Overall health score

**Dependencies:**
- `StatCard` (sub-component)

---

#### 2.3 `DashboardFilters.js`
**Purpose:** Filter controls for dashboard  
**Props:**
```javascript
{
  filters: Object,
  onFilterChange: Function,
  availableFarms: Array<Farm>,
  quickFilters: Array<String>  // Preset filters
}
```
**Filters:**
- Farm dropdown
- Status dropdown
- Health filter
- Search box
- Quick filters (Needs Attention, Not Fed, etc.)

**Dependencies:**
- Form components (Select, SearchBox)

---

#### 2.4 `QuickActionsBar.js`
**Purpose:** Bottom/top action bar (always visible)  
**Props:**
```javascript
{
  actions: Array<Action>,
  position: String,      // top|bottom
  sticky: Boolean,       // Sticky positioning
  mobile: Boolean        // Mobile layout
}
```
**Common Actions:**
- Quick Daily Log
- Water Test
- Feed All
- Add Pond

**Dependencies:**
- `ActionButton` (common)

---

## 📝 Priority 2: Form Components (Daily Operations)

### 3. Quick Log Forms
**Location:** `src/components/pond/forms/quick/`

#### 3.1 `QuickDailyLogForm.js` ⭐⭐ MOST USED
**Purpose:** Fast daily pond check logging  
**Props:**
```javascript
{
  pond: Pond,
  onSubmit: Function,
  onCancel: Function,
  initialData: Object,
  offline: Boolean       // Offline mode indicator
}
```
**Sections:**
- Pond selector (if not pre-selected)
- Date/time (auto-filled)
- Quick action buttons
- Water quality (optional quick entry)
- Feeding (optional)
- Observations checkboxes
- Issues flagging
- Photo upload
- Notes

**Features:**
- Auto-save to localStorage
- Offline support
- Photo from camera
- Voice notes (future)
- One-tap quick actions
- Smart defaults

**Dependencies:**
- `FormContainer` (common)
- `QuickActionButtons`
- `WaterQualityQuickInput`
- `FeedingQuickInput`
- `ObservationChecklist`
- `IssueReporter`
- `PhotoUpload` (common)

---

#### 3.2 `WaterQualityQuickLog.js` ⭐⭐
**Purpose:** Quick WQ entry with validation  
**Props:**
```javascript
{
  pond: Pond,
  onSubmit: Function,
  onCancel: Function,
  showAdvanced: Boolean,  // Show all parameters
  autoValidate: Boolean   // Real-time validation
}
```
**Fields:**
- Basic: Temperature, pH, DO (main 3)
- Advanced: NH3, NO2, NO3, Alkalinity, etc.
- Real-time status indicators
- Overall WQ status calculation

**Features:**
- Real-time validation (✅/⚠️/❌)
- Range indicators
- Auto-calculate overall status
- Photo upload option
- Quick save

**Dependencies:**
- `FormContainer` (common)
- `QuickWQInput` (custom input with validation)
- `WQOverallStatus`
- `ParameterRangeIndicator`

---

#### 3.3 `FeedingLogForm.js` ⭐⭐
**Purpose:** Quick feeding entry  
**Props:**
```javascript
{
  pond: Pond,
  stock: Stock,
  onSubmit: Function,
  onCancel: Function,
  recommendedAmount: Number  // Auto-calculated
}
```
**Fields:**
- Time slot selector (Morning/Afternoon/Evening)
- Amount (kg) with recommendation
- Feeding behavior checkboxes
- Notes (optional)
- Photo (optional)

**Features:**
- Pre-filled time slot based on time
- Recommended amount shown
- One-tap normal feeding
- Quick save

**Dependencies:**
- `FormContainer` (common)
- `TimeSlotSelector`
- `AmountInput` with recommendation

---

#### 3.4 `QuickActionButtons.js`
**Purpose:** One-tap action buttons for quick logs  
**Props:**
```javascript
{
  onQuickAction: Function,
  availableActions: Array<String>
}
```
**Actions:**
- ✅ Visual Check OK
- 🍽️ Fed - Normal Amount
- 💧 Water Looks Good
- 🌡️ Temp Normal
- 🐟 Fish Active
- 📸 Add Photo

**Dependencies:** None (standalone)

---

### 4. Management Forms
**Location:** `src/components/pond/forms/management/`

#### 4.1 `PondForm.js`
**Purpose:** Create/edit pond (full form)  
**Props:**
```javascript
{
  pond: Pond,            // For edit, null for create
  farms: Array<Farm>,    // Available farms
  mode: String,          // create|edit
  onSubmit: Function,
  onCancel: Function
}
```
**Sections:**
- Basic Information
- Dimensions
- Infrastructure
- Description

**Dependencies:**
- `FormContainer` (common)
- Form input components

---

#### 4.2 `WaterQualityForm.js`
**Purpose:** Detailed WQ entry (all parameters)  
**Props:**
```javascript
{
  pond: Pond,
  waterQuality: WaterQuality,  // For edit
  mode: String,                // create|edit
  onSubmit: Function,
  onCancel: Function
}
```
**Sections:**
- Basic Parameters
- Nitrogen Cycle
- Other Parameters
- Metadata

**Dependencies:**
- `FormContainer` (common)
- Advanced parameter inputs

---

#### 4.3 `MaintenanceLogForm.js`
**Purpose:** Log maintenance activities  
**Props:**
```javascript
{
  pond: Pond,
  onSubmit: Function,
  onCancel: Function
}
```
**Sections:**
- Maintenance type
- Date/time
- Details (type-specific)
- Cost tracking
- Materials used
- Notes

**Dependencies:**
- `FormContainer` (common)
- `MaterialsList` (dynamic array)
- `CostCalculator`

---

## 📊 Priority 3: Data Display Components

### 5. Detailed View Components
**Location:** `src/components/pond/detail/`

#### 5.1 `PondDetailedMonitor.js`
**Purpose:** Full pond monitoring view  
**Props:**
```javascript
{
  pond: Pond,
  onClose: Function,
  onEdit: Function,
  defaultTab: String
}
```
**Tabs:**
- Overview
- Daily Logs
- Water Quality
- Feeding
- Stock
- Maintenance
- Analytics

**Dependencies:**
- `TabbedView` (common)
- Tab-specific components below

---

#### 5.2 `PondOverviewTab.js`
**Purpose:** Overview tab content  
**Props:**
```javascript
{
  pond: Pond,
  health: PondHealth,
  currentStock: Stock,
  latestWQ: WaterQuality,
  todaysTasks: Array<Task>
}
```
**Sections:**
- Quick status summary
- Current stock details
- Water quality current
- Today's activity
- Quick stats

**Dependencies:**
- Multiple detail display components

---

#### 5.3 `DailyLogHistory.js`
**Purpose:** View past daily logs  
**Props:**
```javascript
{
  pondId: String,
  logs: Array<DailyLog>,
  onLoadMore: Function,
  onLogClick: Function
}
```
**Features:**
- Timeline view
- Filter by date range
- Search logs
- View photos
- Export

**Dependencies:**
- `DataTable` (common)
- `TimelineView`
- `PhotoGallery`

---

#### 5.4 `WaterQualityTrendChart.js`
**Purpose:** WQ parameter trends  
**Props:**
```javascript
{
  pondId: String,
  waterQuality: Array<WaterQuality>,
  parameters: Array<String>,
  timeRange: String,        // 7d|30d|90d|custom
  onRangeChange: Function
}
```
**Features:**
- Multi-parameter charts
- Threshold lines
- Zoom/pan
- Export chart
- Toggle parameters

**Dependencies:**
- Chart library (Chart.js or Recharts)
- `ParameterSelector`
- `TimeRangeSelector`

---

#### 5.5 `FeedingScheduleCalendar.js`
**Purpose:** Calendar view of feeding  
**Props:**
```javascript
{
  pondId: String,
  feedings: Array<Feeding>,
  schedule: Object,
  onDateClick: Function,
  onFeedingClick: Function
}
```
**Features:**
- Calendar view
- Feeding markers
- Schedule overlay
- Miss indicators
- Weekly summary

**Dependencies:**
- Calendar component
- `FeedingMarker`

---

#### 5.6 `GrowthIndicator.js`
**Purpose:** Visual growth status  
**Props:**
```javascript
{
  stock: Stock,
  targetGrowth: Number,
  currentGrowth: Number,
  size: String,          // small|medium|large
  showDetails: Boolean
}
```
**Display:**
- Progress bar
- Status icon (🟢 on track | 🟡 slow | 🔴 very slow)
- Percentage
- Details (optional)

**Dependencies:** None (standalone)

---

#### 5.7 `PondAnalyticsDashboard.js`
**Purpose:** Performance analytics  
**Props:**
```javascript
{
  pond: Pond,
  timeRange: String,
  analytics: Object
}
```
**Metrics:**
- Utilization rate
- Production history
- Water quality score
- Feeding efficiency (FCR)
- Maintenance frequency
- Cost analysis

**Dependencies:**
- Chart components
- `MetricCard`
- `TrendIndicator`

---

### 6. List & Table Components
**Location:** `src/components/pond/list/`

#### 6.1 `PondListView.js`
**Purpose:** Alternative list view (vs cards)  
**Props:**
```javascript
{
  ponds: Array<Pond>,
  onPondClick: Function,
  sortBy: String,
  sortOrder: String
}
```
**Features:**
- Compact list
- Sortable columns
- Quick actions per row
- Health indicators

**Dependencies:**
- `DataTable` (common)
- Custom row renderer

---

#### 6.2 `WaterQualityHistoryTable.js`
**Purpose:** WQ readings table  
**Props:**
```javascript
{
  waterQuality: Array<WaterQuality>,
  onRowClick: Function,
  onEdit: Function,
  onDelete: Function
}
```
**Features:**
- Sortable columns
- Parameter highlighting
- Status indicators
- Export

**Dependencies:**
- `DataTable` (common)
- Custom cell renderers

---

#### 6.3 `MaintenanceHistoryTable.js`
**Purpose:** Maintenance records table  
**Props:**
```javascript
{
  maintenance: Array<Maintenance>,
  onRowClick: Function,
  onEdit: Function
}
```
**Features:**
- Type filtering
- Cost summary
- Next due date
- Export

**Dependencies:**
- `DataTable` (common)

---

## 🔌 Priority 4: IoT Device Components (Future)

### 7. Device Management Components
**Location:** `src/components/device/`

#### 7.1 `DeviceStatusCard.js`
**Purpose:** Show all devices for a pond  
**Props:**
```javascript
{
  pondId: String,
  devices: Array<Device>,
  onDeviceClick: Function,
  onAddDevice: Function,
  compact: Boolean
}
```
**Features:**
- Device list
- Status indicators
- Battery/signal levels
- Quick actions

**Dependencies:**
- `DeviceListItem`
- `DeviceHealthIndicator`

---

#### 7.2 `DeviceListItem.js`
**Purpose:** Individual device in list  
**Props:**
```javascript
{
  device: Device,
  onClick: Function,
  onConfigure: Function,
  showDetails: Boolean
}
```
**Display:**
- Device name/type
- Status (🟢/🔴/🟡)
- Battery level
- Signal strength
- Last reading time
- Quick actions

**Dependencies:**
- `BatteryIndicator`
- `SignalStrengthIndicator`
- `DeviceTypeIcon`

---

#### 7.3 `DeviceHealthDashboard.js`
**Purpose:** Overall device health  
**Props:**
```javascript
{
  devices: Array<Device>,
  timeRange: String
}
```
**Metrics:**
- Healthy devices
- Offline devices
- Low battery count
- Uptime percentage
- Data quality score

**Dependencies:**
- `StatCard`
- Chart components

---

#### 7.4 `RealTimeDataStream.js`
**Purpose:** Live sensor data display  
**Props:**
```javascript
{
  deviceId: String,
  parameter: String,
  timeWindow: Number,    // Minutes
  onAlert: Function
}
```
**Features:**
- Real-time chart
- WebSocket connection
- Alert thresholds
- Auto-refresh

**Dependencies:**
- Chart library
- WebSocket service

---

#### 7.5 `DeviceConfigForm.js`
**Purpose:** Configure device settings  
**Props:**
```javascript
{
  device: Device,
  onSubmit: Function,
  onCancel: Function
}
```
**Settings:**
- Reading interval
- Alert thresholds
- Calibration
- Network settings

**Dependencies:**
- `FormContainer` (common)

---

#### 7.6 `AutomationRuleCard.js`
**Purpose:** Display automation rule  
**Props:**
```javascript
{
  rule: AutomationRule,
  onEdit: Function,
  onToggle: Function,
  onDelete: Function
}
```
**Display:**
- Rule name
- Trigger conditions
- Actions
- Enabled status
- Last triggered

**Dependencies:**
- `RuleTriggerDisplay`
- `RuleActionDisplay`

---

#### 7.7 `AutomationRuleForm.js`
**Purpose:** Create/edit automation rules  
**Props:**
```javascript
{
  rule: AutomationRule,
  devices: Array<Device>,
  onSubmit: Function,
  onCancel: Function
}
```
**Sections:**
- Rule name
- Trigger configuration
- Action configuration
- Schedule
- Notifications

**Dependencies:**
- `FormContainer` (common)
- `TriggerBuilder`
- `ActionBuilder`

---

## 🧩 Priority 5: Shared/Utility Components

### 8. Common UI Components
**Location:** `src/components/pond/shared/`

#### 8.1 `ParameterIndicator.js`
**Purpose:** WQ parameter with status  
**Props:**
```javascript
{
  parameter: String,     // ph|temperature|do|etc
  value: Number,
  unit: String,
  status: String,        // optimal|acceptable|critical
  showRange: Boolean,
  size: String
}
```
**Display:**
- Value + unit
- Status icon (✅/⚠️/❌)
- Range indicator (optional)
- Color coding

**Dependencies:** None (standalone)

---

#### 8.2 `ParameterRangeIndicator.js`
**Purpose:** Visual range indicator  
**Props:**
```javascript
{
  value: Number,
  min: Number,
  max: Number,
  optimal: [Number, Number],
  showValue: Boolean
}
```
**Display:**
- Visual bar
- Value position
- Color zones
- Optimal range highlight

**Dependencies:** None (standalone)

---

#### 8.3 `TimeSlotSelector.js`
**Purpose:** Select feeding time slot  
**Props:**
```javascript
{
  value: String,
  onChange: Function,
  slots: Array<String>,  // Custom slots
  showIcons: Boolean
}
```
**Slots:**
- Morning (☀️)
- Afternoon (🌤️)
- Evening (🌙)
- Custom

**Dependencies:** None (standalone)

---

#### 8.4 `PondSelector.js`
**Purpose:** Select pond from list  
**Props:**
```javascript
{
  ponds: Array<Pond>,
  value: String,
  onChange: Function,
  filter: Function,      // Filter ponds
  showStatus: Boolean,   // Show pond status
  groupByFarm: Boolean
}
```
**Features:**
- Searchable dropdown
- Status indicators
- Farm grouping
- Quick filters

**Dependencies:**
- Enhanced Select component

---

#### 8.5 `PhotoUpload.js` (Already exists in common)
**Enhancement needed:**
```javascript
{
  onUpload: Function,
  multiple: Boolean,
  fromCamera: Boolean,   // Direct camera access
  maxSize: Number,
  preview: Boolean,
  offline: Boolean       // Offline support
}
```

---

#### 8.6 `TaskItem.js`
**Purpose:** Single task in checklist  
**Props:**
```javascript
{
  task: Task,
  onComplete: Function,
  onClick: Function,
  showTime: Boolean,
  compact: Boolean
}
```
**Display:**
- Checkbox
- Task title
- Due time
- Status (✅/❌/⏰)
- Overdue indicator

**Dependencies:** None (standalone)

---

#### 8.7 `MetricCard.js`
**Purpose:** Display single metric  
**Props:**
```javascript
{
  label: String,
  value: Number|String,
  unit: String,
  icon: String|Component,
  trend: String,         // up|down|stable
  trendValue: Number,
  color: String,
  onClick: Function
}
```
**Display:**
- Icon
- Label
- Value + unit
- Trend indicator
- Change percentage

**Dependencies:**
- `TrendIndicator`

---

#### 8.8 `TrendIndicator.js`
**Purpose:** Show trend direction  
**Props:**
```javascript
{
  trend: String,         // up|down|stable
  value: Number,         // Percentage change
  inverted: Boolean,     // Down is good (e.g., mortality)
  size: String
}
```
**Display:**
- Arrow (↑/↓/→)
- Percentage
- Color (green/red based on inverted)

**Dependencies:** None (standalone)

---

#### 8.9 `ObservationChecklist.js`
**Purpose:** Quick observation checkboxes  
**Props:**
```javascript
{
  values: Object,
  onChange: Function,
  categories: Array<String>
}
```
**Categories:**
- Fish Activity (Normal/Sluggish/Aggressive)
- Water Color (Clear/Cloudy/Green/Brown)
- Smell (Normal/Bad)
- Visibility (Good/Poor)

**Dependencies:** None (standalone)

---

#### 8.10 `IssueReporter.js`
**Purpose:** Flag issues in forms  
**Props:**
```javascript
{
  onReport: Function,
  issueTypes: Array<String>,
  severity: String,
  showPhoto: Boolean
}
```
**Issue Types:**
- Disease spotted
- Dead fish
- Equipment failure
- Water quality issue
- Other

**Dependencies:**
- `PhotoUpload`

---

## 📂 Folder Structure

```
src/components/pond/
├── monitoring/                    # Priority 1: Daily Monitoring
│   ├── PondMonitorCard.js        ⭐⭐⭐
│   ├── HealthStatusChip.js       ⭐⭐⭐
│   ├── AlertBanner.js            ⭐⭐⭐
│   ├── DailyTaskChecklist.js     ⭐⭐⭐
│   ├── WaterQualitySnapshot.js   ⭐⭐
│   ├── StockSummary.js           ⭐⭐
│   ├── QuickActions.js           ⭐⭐
│   └── index.js
│
├── dashboard/                     # Dashboard Components
│   ├── PondMonitoringDashboard.js
│   ├── DashboardStats.js
│   ├── DashboardFilters.js
│   ├── QuickActionsBar.js
│   └── index.js
│
├── forms/                         # Form Components
│   ├── quick/                     # Quick entry forms
│   │   ├── QuickDailyLogForm.js  ⭐⭐⭐
│   │   ├── WaterQualityQuickLog.js ⭐⭐⭐
│   │   ├── FeedingLogForm.js     ⭐⭐⭐
│   │   ├── QuickActionButtons.js ⭐⭐
│   │   └── index.js
│   │
│   ├── management/                # Full management forms
│   │   ├── PondForm.js
│   │   ├── WaterQualityForm.js
│   │   ├── MaintenanceLogForm.js
│   │   └── index.js
│   │
│   └── index.js
│
├── detail/                        # Detailed view components
│   ├── PondDetailedMonitor.js
│   ├── PondOverviewTab.js
│   ├── DailyLogHistory.js
│   ├── WaterQualityTrendChart.js
│   ├── FeedingScheduleCalendar.js
│   ├── GrowthIndicator.js
│   ├── PondAnalyticsDashboard.js
│   └── index.js
│
├── list/                          # List/Table components
│   ├── PondListView.js
│   ├── WaterQualityHistoryTable.js
│   ├── MaintenanceHistoryTable.js
│   └── index.js
│
├── shared/                        # Shared utilities
│   ├── ParameterIndicator.js
│   ├── ParameterRangeIndicator.js
│   ├── TimeSlotSelector.js
│   ├── PondSelector.js
│   ├── TaskItem.js
│   ├── MetricCard.js
│   ├── TrendIndicator.js
│   ├── ObservationChecklist.js
│   ├── IssueReporter.js
│   └── index.js
│
└── index.js                       # Main pond components export

src/components/device/             # IoT Device Components (Future)
├── DeviceStatusCard.js
├── DeviceListItem.js
├── DeviceHealthDashboard.js
├── RealTimeDataStream.js
├── DeviceConfigForm.js
├── AutomationRuleCard.js
├── AutomationRuleForm.js
├── shared/
│   ├── BatteryIndicator.js
│   ├── SignalStrengthIndicator.js
│   ├── DeviceTypeIcon.js
│   └── index.js
└── index.js

src/components/common/             # Already existing common components
├── BaseCard.js                    ✅ Exists
├── FormContainer.js               ✅ Exists
├── DataTable/                     ✅ Exists
├── ActionButton.js                ✅ Exists
├── StatusChip.js                  ✅ Exists
└── ...
```

---

## 📊 Component Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                  COMPONENT HIERARCHY                         │
└─────────────────────────────────────────────────────────────┘

PondMonitoringDashboard
├── DashboardStats
│   └── StatCard (shared)
├── DashboardFilters
│   ├── Select (common)
│   └── SearchBox (common)
├── PondMonitorCard ⭐
│   ├── BaseCard (common)
│   ├── HealthStatusChip
│   ├── AlertBanner
│   ├── StockSummary
│   │   └── GrowthIndicator
│   ├── WaterQualitySnapshot
│   │   └── ParameterIndicator
│   ├── DailyTaskChecklist
│   │   └── TaskItem
│   └── QuickActions
│       └── ActionButton (common)
└── QuickActionsBar
    └── ActionButton (common)

QuickDailyLogForm ⭐
├── FormContainer (common)
├── QuickActionButtons
├── WaterQualityQuickLog
│   ├── QuickWQInput
│   ├── ParameterRangeIndicator
│   └── WQOverallStatus
├── FeedingLogForm
│   ├── TimeSlotSelector
│   └── AmountInput
├── ObservationChecklist
├── IssueReporter
│   └── PhotoUpload (common)
└── PhotoUpload (common)

PondDetailedMonitor
├── TabbedView (common)
├── PondOverviewTab
├── DailyLogHistory
│   ├── DataTable (common)
│   ├── TimelineView
│   └── PhotoGallery
├── WaterQualityTrendChart
│   └── Chart library
├── FeedingScheduleCalendar
│   └── Calendar component
├── GrowthIndicator
└── PondAnalyticsDashboard
    ├── MetricCard
    ├── TrendIndicator
    └── Charts

DeviceStatusCard (Future)
├── DeviceListItem
│   ├── BatteryIndicator
│   ├── SignalStrengthIndicator
│   └── DeviceTypeIcon
└── DeviceHealthIndicator
```

---

## 🎯 Component Creation Priority

### Phase 1: Core Monitoring (Week 1) 🔥
**Must have for daily operations**

1. ✅ `HealthStatusChip` - Simple, no dependencies
2. ✅ `ParameterIndicator` - Simple, reusable
3. ✅ `TaskItem` - Simple task display
4. ✅ `AlertBanner` - Important for issues
5. ✅ `GrowthIndicator` - Stock growth status
6. ✅ `WaterQualitySnapshot` - Uses ParameterIndicator
7. ✅ `StockSummary` - Uses GrowthIndicator
8. ✅ `DailyTaskChecklist` - Uses TaskItem
9. ✅ `QuickActions` - Uses ActionButton
10. ✅ `PondMonitorCard` - Combines above components ⭐

### Phase 2: Quick Forms (Week 1) 🔥
**Essential for data entry**

11. ✅ `QuickActionButtons` - One-tap actions
12. ✅ `TimeSlotSelector` - Feeding times
13. ✅ `ObservationChecklist` - Quick observations
14. ✅ `IssueReporter` - Flag issues
15. ✅ `ParameterRangeIndicator` - WQ validation
16. ✅ `WaterQualityQuickLog` - Quick WQ entry ⭐
17. ✅ `FeedingLogForm` - Feeding entry ⭐
18. ✅ `QuickDailyLogForm` - Main daily log ⭐⭐⭐

### Phase 3: Dashboard (Week 2)
**Visual overview**

19. ✅ `MetricCard` - Reusable metric display
20. ✅ `TrendIndicator` - Show trends
21. ✅ `DashboardStats` - Uses MetricCard
22. ✅ `DashboardFilters` - Filter controls
23. ✅ `QuickActionsBar` - Bottom action bar
24. ✅ `PondMonitoringDashboard` - Main dashboard ⭐

### Phase 4: Detailed Views (Week 2-3)
**Deep dive features**

25. ✅ `PondOverviewTab` - Overview content
26. ✅ `DailyLogHistory` - Log history
27. ✅ `WaterQualityTrendChart` - WQ trends
28. ✅ `FeedingScheduleCalendar` - Feeding calendar
29. ✅ `PondAnalyticsDashboard` - Analytics
30. ✅ `PondDetailedMonitor` - Full detailed view ⭐

### Phase 5: Management (Week 3)
**Admin features**

31. ✅ `PondSelector` - Select pond dropdown
32. ✅ `PondForm` - Create/edit pond
33. ✅ `WaterQualityForm` - Full WQ form
34. ✅ `MaintenanceLogForm` - Maintenance logging
35. ✅ `PondListView` - Alternative list view
36. ✅ `WaterQualityHistoryTable` - WQ table
37. ✅ `MaintenanceHistoryTable` - Maintenance table

### Phase 6: IoT Integration (Future - Week 4+)
**Advanced automation**

38. ✅ `BatteryIndicator` - Battery level
39. ✅ `SignalStrengthIndicator` - Signal strength
40. ✅ `DeviceTypeIcon` - Device icons
41. ✅ `DeviceListItem` - Device in list
42. ✅ `DeviceHealthDashboard` - Device health
43. ✅ `DeviceStatusCard` - All devices for pond
44. ✅ `RealTimeDataStream` - Live sensor data
45. ✅ `DeviceConfigForm` - Configure device
46. ✅ `AutomationRuleCard` - Automation rule display
47. ✅ `AutomationRuleForm` - Create automation

---

## 🔄 Component Reusability Matrix

| Component | Used In | Reusable | Standalone |
|-----------|---------|----------|------------|
| HealthStatusChip | PondCard, Lists, Dashboards | ✅ High | ✅ Yes |
| ParameterIndicator | WQ Snapshot, WQ Forms, Charts | ✅ High | ✅ Yes |
| TaskItem | Task Checklist, Timeline | ✅ Medium | ✅ Yes |
| AlertBanner | Cards, Dashboard, Detail View | ✅ High | ✅ Yes |
| GrowthIndicator | Stock Summary, Analytics | ✅ Medium | ✅ Yes |
| MetricCard | Dashboard, Analytics | ✅ High | ✅ Yes |
| TrendIndicator | Analytics, Metrics | ✅ High | ✅ Yes |
| QuickActions | Cards, Forms, Dashboard | ✅ High | ✅ Yes |
| PondMonitorCard | Dashboard, Lists | ✅ Medium | ❌ No |
| QuickDailyLogForm | Modal, Page | ✅ Low | ❌ No |
| DeviceListItem | Device Cards, Lists | ✅ Medium | ✅ Yes |
| AutomationRuleCard | Device Settings, Dashboard | ✅ Medium | ❌ No |

---

## 📋 Component Props Standards

### Standard Prop Patterns

#### 1. Data Props
```javascript
// Model instances (use models)
pond: Pond
stock: Stock
waterQuality: WaterQuality
device: Device

// Arrays (use models)
ponds: Array<Pond>
tasks: Array<Task>
```

#### 2. Callback Props
```javascript
// Event handlers (always optional)
onClick?: Function
onChange?: Function
onSubmit?: Function
onCancel?: Function
onDelete?: Function

// Specific handlers
onPondSelect?: (pond: Pond) => void
onTaskComplete?: (taskId: string) => void
```

#### 3. Display Props
```javascript
// Size variants
size?: 'small' | 'medium' | 'large'

// Layout variants
variant?: 'default' | 'compact' | 'detailed'
layout?: 'horizontal' | 'vertical' | 'grid'

// Visibility toggles
show{Feature}?: boolean
hide{Feature}?: boolean
```

#### 4. State Props
```javascript
// Loading states
loading?: boolean
disabled?: boolean
readOnly?: boolean

// Selection states
selected?: boolean
active?: boolean
expanded?: boolean
```

#### 5. Style Props
```javascript
// MUI standard
sx?: object
className?: string

// Custom styling
color?: string
theme?: 'light' | 'dark'
```

---

## ✅ Component Testing Strategy

### Unit Tests (Each Component)
- Render without props (with defaults)
- Render with all props
- Event handlers work
- Conditional rendering
- Accessibility (a11y)

### Integration Tests (Component Groups)
- Form submission flows
- Data flow through components
- Parent-child communication
- State management

### E2E Tests (User Flows)
- Complete daily log workflow
- Dashboard to detail view
- Offline sync
- Photo upload

---

## 📝 Documentation Requirements

Each component should have:

1. **JSDoc Comments**
```javascript
/**
 * PondMonitorCard - Daily pond monitoring card
 * 
 * @component
 * @example
 * <PondMonitorCard
 *   pond={pondInstance}
 *   health={healthStatus}
 *   onLogWQ={handleLogWQ}
 * />
 */
```

2. **PropTypes or TypeScript**
```javascript
PondMonitorCard.propTypes = {
  pond: PropTypes.instanceOf(Pond).isRequired,
  health: PropTypes.object.isRequired,
  onLogWQ: PropTypes.func
};
```

3. **Default Props**
```javascript
PondMonitorCard.defaultProps = {
  priority: 'normal',
  showTasks: true,
  compact: false
};
```

4. **Usage Examples in Storybook** (Future)

---

## 🎨 Styling Standards

### Theme-aware Components
All components must support:
- ✅ Light mode
- ✅ Dark mode
- ✅ High contrast mode (accessibility)

### Responsive Breakpoints
```javascript
xs: 0px      // Mobile portrait
sm: 600px    // Mobile landscape
md: 900px    // Tablet
lg: 1200px   // Desktop
xl: 1536px   // Large desktop
```

### Touch Targets (Mobile)
- Minimum: 44x44px
- Recommended: 48x48px
- Spacing: 8px minimum

### Color Palette
```javascript
// Status colors
healthy: theme.palette.success.main
attention: theme.palette.warning.main
critical: theme.palette.error.main
unknown: theme.palette.grey[400]

// Functional colors
primary: theme.palette.primary.main
secondary: theme.palette.secondary.main
background: theme.palette.background.default
```

---

## 🚀 Next Steps

1. **Review this component structure** ✅ (Current)
2. **Approve component list and priorities**
3. **Start Phase 1 implementation**
   - Create simple standalone components first
   - Build up to complex composite components
4. **Implement Phase 2-5** in sequence
5. **Plan Phase 6 (IoT)** when ready

---

**Created by:** GitHub Copilot  
**Last Updated:** February 2, 2026  
**Version:** 1.0  
**Total Components:** 47 (37 core + 10 IoT)
