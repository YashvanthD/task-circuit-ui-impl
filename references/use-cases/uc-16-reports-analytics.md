# UC-16: Reports & Analytics

**Category:** Analytics  
**Actors:** Farm Manager, Owner  
**Precondition:** Data exists

---

## Overview

Generating reports and analytical insights from operational data.

---

## Report Types

| Report | Description | API Endpoint |
|--------|-------------|--------------|
| Growth Chart | Weight over time | `/reports/growth/:stock_id` |
| FCR Report | Feed conversion ratio | `/reports/fcr/:stock_id` |
| Mortality Report | Death analysis | `/reports/mortality` |
| Monthly Summary | Monthly metrics | `/reports/monthly` |
| Yearly Summary | Annual metrics | `/reports/yearly` |
| Stock Cycle | Full cycle analysis | `/reports/stock/:stock_id` |
| Profitability | P&L analysis | `/reports/profitability` |
| Golden Batch | Compare vs best | `/reports/golden-batch/:stock_id` |

---

## Dashboard Summary

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD DATA                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  GET /api/fish/summary                                                              │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                              │    │
│  │  FARMS: 3       PONDS: 25        ACTIVE STOCKS: 15       FISH: 150,000      │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │                                                                              │    │
│  │  MTD METRICS                          YTD METRICS                           │    │
│  │  ────────────                          ────────────                          │    │
│  │  Harvest: 5,000 kg                    Harvest: 50,000 kg                    │    │
│  │  Revenue: ₹7.5L                       Revenue: ₹75L                         │    │
│  │  Feed Used: 10,000 kg                 Expenses: ₹50L                        │    │
│  │  Mortality: 500                       Profit: ₹25L                          │    │
│  │                                                                              │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │                                                                              │    │
│  │  ALERTS: 5 unread (1 critical)        SCHEDULES: 10 due today, 2 overdue   │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Growth Chart Data

```json
GET /api/fish/reports/growth/444444444444

{
  "stock_id": "444444444444",
  "species": "Rohu",
  "data_points": [
    { "date": "2026-01-01", "day": 0, "avg_weight_g": 10 },
    { "date": "2026-01-15", "day": 14, "avg_weight_g": 50 },
    { "date": "2026-02-01", "day": 31, "avg_weight_g": 100 },
    { "date": "2026-02-15", "day": 45, "avg_weight_g": 150 },
    { "date": "2026-03-01", "day": 59, "avg_weight_g": 200 }
  ],
  "expected_curve": [
    { "day": 0, "expected_weight_g": 10 },
    { "day": 30, "expected_weight_g": 80 },
    { "day": 60, "expected_weight_g": 180 }
  ],
  "analysis": {
    "growth_rate_g_per_day": 3.2,
    "expected_growth_rate": 3.0,
    "performance": "above_average"
  }
}
```

---

## Export Formats

| Format | Endpoint Parameter |
|--------|-------------------|
| JSON | Default |
| Excel | `?format=xlsx` |
| PDF | `?format=pdf` |
| CSV | `?format=csv` |

---

## API Endpoints

```http
GET /api/fish/summary                     # Org summary
GET /api/fish/farms/:id/summary           # Farm summary
GET /api/fish/ponds/:id/summary           # Pond summary
GET /api/fish/reports/growth/:stock_id    # Growth chart
GET /api/fish/reports/fcr/:stock_id       # FCR report
GET /api/fish/reports/mortality           # Mortality analysis
GET /api/fish/reports/monthly             # Monthly report
GET /api/fish/reports/export?format=xlsx  # Export
```

---

## Acceptance Criteria

- [ ] Dashboard summary endpoint works
- [ ] Growth chart shows data points
- [ ] FCR calculated correctly
- [ ] Monthly/yearly reports generate
- [ ] Export to Excel/PDF works
- [ ] Query filters work (date range, entity)
