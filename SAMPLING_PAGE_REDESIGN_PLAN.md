# Sampling Page Redesign Plan
**Date:** February 2, 2026  
**Objective:** Restructure Sampling Page to be stock-centric with user-friendly UI

---

## 📋 Current Problems

1. **Sampling page doesn't show stocks** - Users can't see what stocks are active
2. **No context** - Users don't know which pond/stock they're sampling
3. **Disconnected workflow** - Stock creation and sampling are separate
4. **Poor UX** - No visual relationship between stocks and samplings
5. **Missing stock management** - Can't view/manage stocks from sampling page

---

## 🎯 Goals

1. **Stock-Centric UI** - Show stocks as the primary entity
2. **Easy Sampling** - Quick access to add sampling for each stock
3. **Visual Context** - Clear pond → stock → sampling relationship
4. **Growth Tracking** - Show growth trends per stock
5. **Complete Workflow** - Add stock → Sample regularly → View history

---

## 🏗️ New Page Structure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  📊 Stocks & Sampling Management                                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  [Add New Stock] [Filter: All Stocks ▼] [Search...]                            │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ 📈 OVERVIEW STATS                                                         │  │
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │  Total Stocks: 5    Active: 4    Terminated: 1    Total Fish: 25,000     │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ 🐟 STOCK: Tilapia in Pond A                        Status: ● Active       │  │
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │ Stock ID: stock_123                    Stocked: Jan 15, 2026              │  │
│  │ Current Count: 5,000 fish             Avg Weight: 250g                    │  │
│  │ Initial Weight: 50g                   Days: 18                            │  │
│  │ Current Biomass: 1,250 kg             Growth Rate: 11g/day                │  │
│  │                                                                            │  │
│  │ ┌────────────────────────────────────────────────────────────────────┐   │  │
│  │ │ 📊 SAMPLING HISTORY (Last 5)                  [View All] [Add ➕]   │   │  │
│  │ ├────────────────────────────────────────────────────────────────────┤   │  │
│  │ │ Feb 01 │ 20 samples │ 250g avg │ +10g │ [Details] [Edit]           │   │  │
│  │ │ Jan 28 │ 20 samples │ 240g avg │ +15g │ [Details] [Edit]           │   │  │
│  │ │ Jan 25 │ 18 samples │ 225g avg │ +20g │ [Details] [Edit]           │   │  │
│  │ │ Jan 22 │ 22 samples │ 205g avg │ +18g │ [Details] [Edit]           │   │  │
│  │ │ Jan 19 │ 20 samples │ 187g avg │ +15g │ [Details] [Edit]           │   │  │
│  │ └────────────────────────────────────────────────────────────────────┘   │  │
│  │                                                                            │  │
│  │ [View Details] [Add Sampling] [Terminate Stock]                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ 🐟 STOCK: Catfish in Pond B                        Status: ● Active       │  │
│  ├──────────────────────────────────────────────────────────────────────────┤  │
│  │ ... (similar card) ...                                                    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Components Breakdown

### 1. **Page Header**
- Title: "Stocks & Sampling Management"
- Actions: 
  - [Add New Stock] button (primary)
  - Filter dropdown (All/Active/Terminated)
  - Search box (search by pond, species, stock ID)

### 2. **Overview Stats Bar**
- Total Stocks
- Active Stocks
- Terminated Stocks  
- Total Fish Count
- Total Biomass

### 3. **Stock Cards** (Primary Component)
Each card shows:
- **Header:**
  - Species name + Pond name
  - Status badge (Active/Terminated)
  
- **Stock Info Section:**
  - Stock ID
  - Stocking date
  - Current count
  - Average weight
  - Initial weight
  - Days since stocking
  - Current biomass (calculated)
  - Growth rate (calculated)

- **Sampling History Section:**
  - Mini table showing last 5 samplings
  - Columns: Date, Sample Count, Avg Weight, Growth, Actions
  - [View All] button to expand
  - [Add Sampling] quick action button

- **Actions:**
  - View Details (opens detailed view)
  - Add Sampling (opens sampling form)
  - Terminate Stock (for harvested stocks)

### 4. **Add Stock Dialog**
- Uses existing StockForm component
- Pre-fills farm_id from user context
- Shows pond selection
- Species selection
- Initial count and weight
- Source and cost details

### 5. **Add Sampling Dialog**
- **Context Display:**
  - Shows stock info at top (Species, Pond, Current avg weight)
  
- **Form Fields:**
  - Sampling date (default: today)
  - Sample count (number of fish sampled)
  - Total weight OR average weight
  - Min/Max weight (optional)
  - Notes
  - Recorded by (auto-filled with current user)

- **Auto-calculations:**
  - If total weight entered → calculate avg
  - If avg weight entered → calculate total
  - Show growth vs previous sampling

### 6. **Stock Details View** (Expandable/Modal)
- Full stock information
- Complete sampling history table
- Growth chart (line graph showing weight over time)
- Activity timeline
- Edit/Terminate actions

---

## 📊 Data Flow

```
User Journey 1: Add New Stock
┌──────────────────────────────────────────────────────────────┐
│ 1. Click "Add New Stock"                                     │
│ 2. Fill Stock Form (pond, species, count, weight, date)     │
│ 3. Submit → API: POST /api/fish/stocks                       │
│ 4. Success → Refresh stocks list                             │
│ 5. New stock card appears at top                             │
└──────────────────────────────────────────────────────────────┘

User Journey 2: Add Sampling
┌──────────────────────────────────────────────────────────────┐
│ 1. Click "Add Sampling" on stock card                        │
│ 2. Form pre-filled with stock_id, current context           │
│ 3. Enter: sample count, weight measurements                  │
│ 4. Submit → API: POST /api/samplings                         │
│ 5. Success → Refresh stock (updates avg weight)              │
│ 6. New sampling appears in history                           │
│ 7. Growth indicator updates                                  │
└──────────────────────────────────────────────────────────────┘

User Journey 3: View Growth Trend
┌──────────────────────────────────────────────────────────────┐
│ 1. Click "View Details" on stock card                        │
│ 2. Modal/Page opens with full history                        │
│ 3. Chart shows weight progression over time                  │
│ 4. Table shows all samplings                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Phase 1: Data & Services
- [x] Stock model (already created)
- [x] Sampling model (already created)
- [x] Stock service (already created)
- [ ] Update sampling service to include stock context
- [ ] Add stock summary API call
- [ ] Add growth calculation utilities

### Phase 2: Components
- [ ] **StockCard** component
  - Props: stock, samplings, onAddSampling, onViewDetails
  - Shows stock info + mini sampling history
  
- [ ] **StockOverviewStats** component
  - Aggregates stock data
  - Shows total counts
  
- [ ] **SamplingHistoryTable** component
  - Reusable table for samplings
  - Works in mini mode (5 rows) and full mode (all rows)
  
- [ ] **AddSamplingDialog** component
  - Form for adding sampling
  - Pre-filled with stock context
  - Auto-calculations

- [ ] **StockDetailsModal** component
  - Full stock information
  - Growth chart
  - Complete history

### Phase 3: Page Restructure
- [ ] Refactor SamplingPage.js
  - Change from sampling-centric to stock-centric
  - Load stocks instead of samplings as primary data
  - For each stock, load recent samplings
  - Implement filters and search

### Phase 4: Utilities
- [ ] **Growth Calculations:**
  - `calculateGrowthRate(samplings)` - g/day
  - `calculateBiomass(count, avgWeight)` - kg
  - `getDaysSinceStocking(stockingDate)` - days
  
- [ ] **Data Formatters:**
  - `formatWeight(grams)` - "250g" or "1.25kg"
  - `formatCount(number)` - "5,000"
  - `formatGrowth(current, previous)` - "+10g"

---

## 📁 File Structure

```
src/
├── components/
│   ├── stock/
│   │   ├── StockCard.js                    ✨ NEW
│   │   ├── StockOverviewStats.js           ✨ NEW
│   │   ├── StockDetailsModal.js            ✨ NEW
│   │   └── forms/
│   │       └── StockForm.js                ✅ EXISTS
│   │
│   └── sampling/
│       ├── SamplingHistoryTable.js         ✨ NEW
│       ├── AddSamplingDialog.js            ✨ NEW
│       └── forms/
│           └── SamplingForm.js             ✅ EXISTS (refactor)
│
├── pages/
│   └── user/
│       └── SamplingPage.js                 🔄 REFACTOR
│
├── utils/
│   ├── stockCalculations.js               ✨ NEW
│   └── formatters.js                       ✨ NEW (or add to existing)
│
└── services/
    ├── stockService.js                     ✅ EXISTS
    └── samplingService.js                  🔄 UPDATE
```

---

## 🎯 Key Features

### 1. **Real-time Growth Tracking**
- Show growth rate per day
- Visual indicators: 
  - 🟢 Good growth (>5g/day)
  - 🟡 Moderate (2-5g/day)
  - 🔴 Slow (<2g/day)

### 2. **Smart Defaults**
- When adding sampling, pre-fill with stock context
- Auto-calculate averages
- Suggest sample size based on stock count

### 3. **Validation & Warnings**
- Warn if sampling shows negative growth
- Alert if too much time since last sampling
- Validate that sample count < total count

### 4. **Mobile Responsive**
- Cards stack vertically on mobile
- Collapsible sections
- Touch-friendly buttons

### 5. **Quick Actions**
- One-click "Add Sampling" from stock card
- Inline edit for recent samplings
- Quick filters (Today, This Week, This Month)

---

## 📈 Success Metrics

1. **User can add a stock in <30 seconds**
2. **User can record sampling in <20 seconds**
3. **User can see growth trend immediately**
4. **Zero confusion about which stock to sample**
5. **All data visible without scrolling (on desktop)**

---

## 🚀 Implementation Order

### Day 1: Foundation
1. Create utility functions (calculations, formatters)
2. Update Stock model with calculation methods
3. Create StockCard component (basic version)
4. Create StockOverviewStats component

### Day 2: Core Components
1. Create SamplingHistoryTable component
2. Create AddSamplingDialog component
3. Update StockForm (ensure farm_id handling)
4. Test components in isolation

### Day 3: Page Integration
1. Refactor SamplingPage
2. Integrate StockCard with data
3. Add filters and search
4. Test complete workflow

### Day 4: Polish & Details
1. Create StockDetailsModal
2. Add growth charts
3. Mobile responsiveness
4. Error handling and edge cases

### Day 5: Testing & Refinement
1. End-to-end testing
2. Performance optimization
3. UX refinements
4. Documentation

---

## 🎨 Design Notes

### Color Scheme
- **Active stocks:** Blue accent (#2196F3)
- **Terminated stocks:** Gray (#757575)
- **Positive growth:** Green (#4CAF50)
- **Negative growth:** Red (#F44336)
- **Warning:** Orange (#FF9800)

### Typography
- Stock names: Bold, 18px
- Metrics: Medium, 14px
- Labels: Regular, 12px, Gray

### Spacing
- Card padding: 16px
- Section gap: 12px
- Button margin: 8px

### Interactions
- Hover: Slight elevation on cards
- Click: Ripple effect
- Loading: Skeleton screens

---

## ⚠️ Edge Cases to Handle

1. **Stock with no samplings** - Show "No samplings yet" with CTA
2. **Negative growth** - Highlight in red, suggest investigation
3. **Very old stock** - Show age warning
4. **Terminated stock** - Read-only, no sampling allowed
5. **Empty state** - Show helpful message: "Add your first stock to begin"
6. **API errors** - Graceful degradation, show cached data
7. **Concurrent edits** - Optimistic updates with rollback

---

## 🔐 Permissions

- **Owner/Manager:** Full access (add, edit, delete, terminate)
- **Worker:** Can add samplings only
- **Viewer:** Read-only

---

## 📱 Mobile Considerations

- Simplified stock cards (fewer details)
- Bottom sheet for forms instead of modals
- Swipe actions for quick sampling
- Pull to refresh
- Offline support (cache stocks locally)

---

## 🎯 Next Steps

1. **Review & Approve this plan**
2. **Create utility functions first** (foundation)
3. **Build components incrementally** (bottom-up)
4. **Test each component** before integration
5. **Refactor page last** (top-down)
6. **Polish and optimize**

---

**This plan transforms the Sampling page from a disconnected list into a comprehensive stock management and growth tracking system!** 🚀
