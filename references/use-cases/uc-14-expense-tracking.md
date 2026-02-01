# UC-14: Expense Tracking

**Category:** Financial  
**Actors:** Farm Manager  
**Precondition:** Farm exists

---

## Overview

Recording and tracking expenses with auto-expense from operations.

---

## Expense Categories

| Category | Subcategories |
|----------|---------------|
| feed | floating_pellet, sinking_pellet, supplementary |
| seed | fingerlings, fry, juveniles |
| labor | permanent, daily_wage, contract |
| medicine | antibiotics, probiotics, vitamins |
| chemicals | lime, fertilizer, disinfectant |
| equipment | aerator, pump, net |
| utilities | electricity, fuel, diesel |
| maintenance | repair, servicing |
| transport | fish_transport, feed_transport |
| other | miscellaneous |

---

## Auto-Expense Triggers

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           AUTO-EXPENSE TRIGGERS                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐                │
│  │   Feeding      │      │   Treatment    │      │  Maintenance   │                │
│  │   created      │      │   created      │      │   created      │                │
│  │   (cost > 0)   │      │   (cost > 0)   │      │   (cost > 0)   │                │
│  └───────┬────────┘      └───────┬────────┘      └───────┬────────┘                │
│          │                       │                       │                          │
│          └───────────────────────┼───────────────────────┘                          │
│                                  │                                                   │
│                                  ▼                                                   │
│                    ┌──────────────────────────┐                                     │
│                    │    Auto-Create Expense   │                                     │
│                    │                          │                                     │
│                    │  source_type = operation │                                     │
│                    │  source_id = record_id   │                                     │
│                    └──────────────────────────┘                                     │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## API Request

```http
POST /api/fish/expenses
Content-Type: application/json

{
  "farm_id": "123456789012",
  "pond_id": "222222222222",
  "stock_id": "444444444444",
  "expense_date": "2026-02-15",
  "category": "feed",
  "subcategory": "floating_pellet",
  "description": "Feed purchase - Growel 32%",
  "quantity": 500,
  "unit": "kg",
  "unit_price": 50,
  "amount": 25000,
  "vendor": "Growel Feed Mills",
  "invoice_number": "GF-2026-1234",
  "payment_status": "paid"
}
```

---

## Profitability Calculation

```
Stock Profitability:
─────────────────────

Revenue = Σ(harvest.quantity_kg × harvest.price_per_kg)
Expenses = Σ(expenses where stock_id = this_stock)
Profit = Revenue - Expenses
ROI = (Profit / Expenses) × 100
Cost per kg = Expenses / Total Harvest (kg)
```

---

## Collections Affected

| Collection | Action | Details |
|------------|--------|---------|
| expenses | INSERT | New expense record |
| activity_logs | INSERT | Action: "expense" |

---

## Acceptance Criteria

- [ ] Expense record created
- [ ] Can query by category, entity, date range
- [ ] Expense summary by category
- [ ] Stock profitability calculates correctly
- [ ] Auto-expense from operations works
