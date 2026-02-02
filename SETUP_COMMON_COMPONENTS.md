# Quick Setup Guide - Common Components for Pond Monitoring

**Date:** February 2, 2026  
**Purpose:** Step-by-step guide to set up required common components  
**Estimated Time:** 2-3 hours

---

## 🚀 Quick Start Checklist

### Step 1: Install Required Dependencies (5 minutes)

```bash
# Navigate to project directory
cd /Users/ydevaraju/PycharmProjects/PythonProject1/ui/task-circuit-ui-impl

# Install Recharts (REQUIRED for analytics/charts)
npm install recharts

# Optional: Install MUI X Date Pickers for advanced date handling
npm install @mui/x-date-pickers

# Optional: Install image compression for photo uploads
npm install browser-image-compression
```

**Verify Installation:**
```bash
# Check package.json includes recharts
cat package.json | grep recharts
```

---

### Step 2: Create Folder Structure (2 minutes)

```bash
# Create new directories for common components
mkdir -p src/components/common/charts
mkdir -p src/components/common/enhanced
mkdir -p src/components/common/timeline
mkdir -p src/components/common/calendar
mkdir -p src/components/common/gallery
```

**Expected Structure:**
```
src/components/common/
├── charts/           # NEW - Chart components
├── enhanced/         # NEW - Enhanced UI components
├── timeline/         # NEW - Timeline components
├── calendar/         # NEW - Calendar components
├── gallery/          # NEW - Photo gallery
├── forms/            # EXISTING
├── BaseCard.js       # EXISTING
├── StatCard.js       # EXISTING
└── ...               # Other existing components
```

---

### Step 3: Create Chart Components (30-45 minutes)

#### 3.1 Create ChartContainer.js
**File:** `src/components/common/charts/ChartContainer.js`

```javascript
/**
 * ChartContainer - Wrapper for all charts with common features
 * Provides consistent theming, responsive behavior, loading states
 */
import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function ChartContainer({
  title,
  subtitle,
  children,
  loading = false,
  height = 300,
  error = null,
  actions,
  sx = {},
}) {
  const theme = useTheme();

  if (loading) {
    return (
      <Paper sx={{ p: 3, height, display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, height, display: 'flex', alignItems: 'center', justifyContent: 'center', ...sx }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 'auto', ...sx }}>
      {(title || actions) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            {title && <Typography variant="h6">{title}</Typography>}
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
          </Box>
          {actions && <Box>{actions}</Box>}
        </Box>
      )}
      <Box sx={{ height }}>
        {children}
      </Box>
    </Paper>
  );
}
```

#### 3.2 Create LineChart.js
**File:** `src/components/common/charts/LineChart.js`

```javascript
/**
 * LineChart - Reusable line chart component
 * Wrapper around Recharts with theme support
 */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function LineChart({
  data,
  xKey = 'name',
  lines = [],
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  height = 300,
}) {
  const theme = useTheme();

  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.palette.divider}
          />
        )}
        <XAxis
          dataKey={xKey}
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '12px' }}
        />
        {showTooltip && (
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
            }}
          />
        )}
        {showLegend && <Legend />}
        {lines.map((line, index) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name || line.key}
            stroke={line.color || defaultColors[index % defaultColors.length]}
            strokeWidth={2}
            dot={line.showDots !== false}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
```

#### 3.3 Create BarChart.js
**File:** `src/components/common/charts/BarChart.js`

```javascript
/**
 * BarChart - Reusable bar chart component
 */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function BarChart({
  data,
  xKey = 'name',
  bars = [],
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  height = 300,
  stacked = false,
}) {
  const theme = useTheme();

  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.palette.divider}
          />
        )}
        <XAxis
          dataKey={xKey}
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '12px' }}
        />
        {showTooltip && (
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
            }}
          />
        )}
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name || bar.key}
            fill={bar.color || defaultColors[index % defaultColors.length]}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
```

#### 3.4 Create Sparkline.js
**File:** `src/components/common/charts/Sparkline.js`

```javascript
/**
 * Sparkline - Mini trend chart for cards
 */
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({
  data,
  dataKey = 'value',
  color,
  height = 40,
  width = 100,
}) {
  const theme = useTheme();
  const lineColor = color || theme.palette.primary.main;

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

#### 3.5 Create charts/index.js
**File:** `src/components/common/charts/index.js`

```javascript
/**
 * Charts Module
 * Reusable chart components with theme support
 */
export { default as ChartContainer } from './ChartContainer';
export { default as LineChart } from './LineChart';
export { default as BarChart } from './BarChart';
export { default as Sparkline } from './Sparkline';
```

---

### Step 4: Create Enhanced Components (30-45 minutes)

#### 4.1 Create TrendIndicator.js
**File:** `src/components/common/enhanced/TrendIndicator.js`

```javascript
/**
 * TrendIndicator - Shows trend direction with arrow and percentage
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

export default function TrendIndicator({
  trend = 'stable', // up|down|stable
  value,
  inverted = false, // If true, down is good (e.g., mortality)
  size = 'small',
  showIcon = true,
  showValue = true,
}) {
  const getColor = () => {
    if (trend === 'stable') return 'text.secondary';
    
    const isPositive = trend === 'up';
    const shouldBeGreen = inverted ? !isPositive : isPositive;
    
    return shouldBeGreen ? 'success.main' : 'error.main';
  };

  const getIcon = () => {
    const iconProps = { fontSize: size, sx: { color: getColor() } };
    
    if (trend === 'up') return <TrendingUpIcon {...iconProps} />;
    if (trend === 'down') return <TrendingDownIcon {...iconProps} />;
    return <TrendingFlatIcon {...iconProps} />;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {showIcon && getIcon()}
      {showValue && value !== undefined && (
        <Typography variant="caption" sx={{ color: getColor(), fontWeight: 600 }}>
          {value > 0 ? '+' : ''}{value}%
        </Typography>
      )}
    </Box>
  );
}
```

#### 4.2 Create ProgressBar.js
**File:** `src/components/common/enhanced/ProgressBar.js`

```javascript
/**
 * ProgressBar - Styled progress bar
 */
import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

export default function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'primary',
  height = 8,
  sx = {},
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {(label || showValue) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          {label && <Typography variant="caption">{label}</Typography>}
          {showValue && (
            <Typography variant="caption" fontWeight={600}>
              {value}/{max}
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={percentage}
        color={color}
        sx={{
          height,
          borderRadius: 1,
          bgcolor: 'action.hover',
        }}
      />
    </Box>
  );
}
```

#### 4.3 Create ParameterIndicator.js
**File:** `src/components/common/enhanced/ParameterIndicator.js`

```javascript
/**
 * ParameterIndicator - Water quality parameter with status
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

export default function ParameterIndicator({
  parameter,
  value,
  unit,
  status = 'optimal', // optimal|acceptable|critical
  size = 'medium',
  showIcon = true,
  showRange = false,
  range,
}) {
  const getStatusIcon = () => {
    const iconSize = size === 'small' ? 16 : 20;
    
    if (status === 'optimal') {
      return <CheckCircleIcon sx={{ fontSize: iconSize, color: 'success.main' }} />;
    }
    if (status === 'acceptable') {
      return <WarningIcon sx={{ fontSize: iconSize, color: 'warning.main' }} />;
    }
    return <ErrorIcon sx={{ fontSize: iconSize, color: 'error.main' }} />;
  };

  const getStatusColor = () => {
    if (status === 'optimal') return 'success.main';
    if (status === 'acceptable') return 'warning.main';
    return 'error.main';
  };

  const fontSize = size === 'small' ? 'caption' : 'body2';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {showIcon && getStatusIcon()}
      <Box>
        <Typography variant={fontSize} sx={{ fontWeight: 600 }}>
          {value !== null && value !== undefined ? `${value}${unit || ''}` : '-'}
        </Typography>
        {parameter && (
          <Typography variant="caption" color="text.secondary">
            {parameter}
          </Typography>
        )}
        {showRange && range && (
          <Typography variant="caption" color="text.secondary">
            ({range[0]}-{range[1]})
          </Typography>
        )}
      </Box>
    </Box>
  );
}
```

#### 4.4 Create HealthStatusChip.js
**File:** `src/components/common/enhanced/HealthStatusChip.js`

```javascript
/**
 * HealthStatusChip - Pond/Stock health status indicator
 */
import React from 'react';
import { Chip } from '@mui/material';

export default function HealthStatusChip({
  status = 'unknown', // healthy|attention|critical|unknown
  size = 'small',
  showLabel = true,
  showIcon = true,
  onClick,
}) {
  const statusConfig = {
    healthy: {
      label: 'Healthy',
      icon: '🟢',
      color: 'success',
    },
    attention: {
      label: 'Needs Attention',
      icon: '🟡',
      color: 'warning',
    },
    critical: {
      label: 'Critical',
      icon: '🔴',
      color: 'error',
    },
    unknown: {
      label: 'Unknown',
      icon: '⚪',
      color: 'default',
    },
  };

  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <Chip
      label={`${showIcon ? config.icon + ' ' : ''}${showLabel ? config.label : ''}`}
      color={config.color}
      size={size}
      onClick={onClick}
    />
  );
}
```

#### 4.5 Create enhanced/index.js
**File:** `src/components/common/enhanced/index.js`

```javascript
/**
 * Enhanced UI Components
 */
export { default as TrendIndicator } from './TrendIndicator';
export { default as ProgressBar } from './ProgressBar';
export { default as ParameterIndicator } from './ParameterIndicator';
export { default as HealthStatusChip } from './HealthStatusChip';
```

---

### Step 5: Update Common Components Index (5 minutes)

**File:** `src/components/common/index.js`

Add these lines:

```javascript
// ... existing exports ...

// ============================================================================
// NEW ADDITIONS - Charts & Analytics
// ============================================================================
export * from './charts';

// ============================================================================
// NEW ADDITIONS - Enhanced Components
// ============================================================================
export * from './enhanced';
```

---

### Step 6: Test Installation (10 minutes)

Create a test file to verify everything works:

**File:** `src/components/common/__tests__/ChartsTest.js`

```javascript
import React from 'react';
import { LineChart, BarChart, Sparkline } from '../charts';
import { TrendIndicator, ParameterIndicator, HealthStatusChip } from '../enhanced';

// Test data
const testData = [
  { name: 'Jan', value: 30 },
  { name: 'Feb', value: 40 },
  { name: 'Mar', value: 35 },
];

export default function ChartsTest() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Charts Test</h2>
      
      <h3>LineChart</h3>
      <LineChart
        data={testData}
        lines={[{ key: 'value', name: 'Value', color: '#1976d2' }]}
        height={200}
      />
      
      <h3>BarChart</h3>
      <BarChart
        data={testData}
        bars={[{ key: 'value', name: 'Value' }]}
        height={200}
      />
      
      <h3>Sparkline</h3>
      <Sparkline data={testData} />
      
      <h3>TrendIndicator</h3>
      <TrendIndicator trend="up" value={5} />
      
      <h3>ParameterIndicator</h3>
      <ParameterIndicator
        parameter="pH"
        value={7.2}
        unit=""
        status="optimal"
      />
      
      <h3>HealthStatusChip</h3>
      <HealthStatusChip status="healthy" />
    </div>
  );
}
```

Run your app and navigate to the test component to verify all components render correctly.

---

## ✅ Verification Checklist

After completing all steps:

- [ ] Recharts installed (`npm list recharts`)
- [ ] Folder structure created
- [ ] ChartContainer.js created and working
- [ ] LineChart.js created and working
- [ ] BarChart.js created and working
- [ ] Sparkline.js created and working
- [ ] TrendIndicator.js created and working
- [ ] ProgressBar.js created and working
- [ ] ParameterIndicator.js created and working
- [ ] HealthStatusChip.js created and working
- [ ] All exports added to index.js
- [ ] Test component renders without errors
- [ ] Components work in both light and dark mode

---

## 🎯 Next Steps After Setup

Once all common components are ready:

1. ✅ Start creating pond-specific components
2. ✅ Use these common components as building blocks
3. ✅ Follow the pond components structure document
4. ✅ Begin with Priority 1 components (monitoring)

---

## 🆘 Troubleshooting

### Issue: Recharts not rendering

**Solution:** Make sure you have proper width/height set
```javascript
<ResponsiveContainer width="100%" height={300}>
  {/* Chart here */}
</ResponsiveContainer>
```

### Issue: Theme not applying

**Solution:** Make sure component is wrapped in ThemeProvider
```javascript
import { ThemeProvider } from '@mui/material/styles';
// Your app should already have this
```

### Issue: Import errors

**Solution:** Check index.js exports are correct
```javascript
// Make sure all exports are present in:
// src/components/common/charts/index.js
// src/components/common/enhanced/index.js
// src/components/common/index.js
```

---

**Created by:** GitHub Copilot  
**Last Updated:** February 2, 2026  
**Estimated Setup Time:** 2-3 hours  
**Status:** Ready to Execute
