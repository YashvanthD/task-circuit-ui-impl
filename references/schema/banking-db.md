# Banking/Accountancy Database Schema (banking_db)

Schema definitions for financial management collections.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              banking_db ERD                                          │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                         ┌─────────────────┐                                         │
│                         │   CATEGORIES    │                                         │
│                         │  (Expense types)│                                         │
│                         └────────┬────────┘                                         │
│                                  │                                                   │
│                                  │ referenced_by                                     │
│                                  ▼                                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                 │
│  │    ACCOUNTS     │───►│  TRANSACTIONS   │◄───│    BUDGETS      │                 │
│  │  (Bank/Cash)    │    │   (Ledger)      │    │  (Spending plan)│                 │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                 │
│                                  │                                                   │
│                                  │                                                   │
│                                  ▼                                                   │
│                         ┌─────────────────┐                                         │
│                         │    PAYSLIPS     │                                         │
│                         │  (Salary/Wages) │                                         │
│                         └─────────────────┘                                         │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Collection: accounts

Financial accounts (bank, cash, etc.).

```json
{
  "_id": "ObjectId",
  "account_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "name": "string - REQUIRED (e.g., 'Main Bank Account')",
  "account_type": "enum: bank | cash | credit | wallet | other",
  
  "bank_details": {
    "bank_name": "string",
    "account_number": "string",
    "ifsc_code": "string",
    "branch": "string",
    "account_holder": "string"
  },
  
  "currency": "string (default: 'INR')",
  "opening_balance": "number",
  "current_balance": "number (updated with transactions)",
  
  "is_default": "boolean (default account for transactions)",
  "is_active": "boolean",
  
  "metadata": "object",
  "created_by": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ account_id: 1 }` - Unique
- `{ account_key: 1, is_active: 1 }` - Org's account_keys

---

## Collection: categories

Transaction categories and subcategories.

```json
{
  "_id": "ObjectId",
  "category_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "name": "string - REQUIRED",
  "type": "enum: income | expense",
  "parent_id": "string | null (for subcategories)",
  
  "icon": "string (icon name)",
  "color": "string (hex color)",
  
  "is_system": "boolean (default categories)",
  "is_active": "boolean",
  
  "budget_default": "number | null (monthly default)",
  
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Default Expense Categories:**
```
Feed
├── Floating Pellet
├── Sinking Pellet
└── Supplementary

Labor
├── Permanent Staff
├── Daily Wages
└── Contract

Seed/Fingerlings
Medicine/Treatment
Equipment
├── Aerator
├── Pump
└── Net

Utilities
├── Electricity
├── Fuel
└── Water

Maintenance
Transport
Other
```

**Indexes:**
- `{ category_id: 1 }` - Unique
- `{ account_key: 1, type: 1 }` - Categories by type

---

## Collection: transactions

All financial transactions (ledger).

```json
{
  "_id": "ObjectId",
  "transaction_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "type": "enum: income | expense | transfer",
  "category_id": "string",
  "category_name": "string (denormalized)",
  
  "amount": "number - REQUIRED (positive value)",
  "currency": "string",
  
  "account_id": "string (from account)",
  "to_account_id": "string | null (for transfers)",
  
  "date": "string (YYYY-MM-DD)",
  "description": "string",
  
  "reference": {
    "type": "enum: manual | feeding | harvest | purchase | payslip | other",
    "entity_type": "string | null (e.g., 'stock', 'pond')",
    "entity_id": "string | null",
    "source_id": "string | null (feeding_id, harvest_id, etc.)"
  },
  
  "vendor": {
    "name": "string",
    "contact": "string"
  },
  
  "invoice": {
    "number": "string",
    "date": "string",
    "attachment_url": "string | null"
  },
  
  "payment": {
    "method": "enum: cash | bank_transfer | upi | cheque | credit | other",
    "status": "enum: paid | pending | partial | cancelled",
    "due_date": "string | null"
  },
  
  "tags": ["string"],
  
  "notes": "string",
  "created_by": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ transaction_id: 1 }` - Unique
- `{ account_key: 1, date: -1 }` - Transaction timeline
- `{ account_key: 1, category_id: 1, date: -1 }` - Category report
- `{ account_key: 1, account_id: 1, date: -1 }` - Account statement
- `{ "reference.entity_id": 1, "reference.entity_type": 1 }` - Entity expenses

---

## Collection: payslips

Salary and wage records.

```json
{
  "_id": "ObjectId",
  "payslip_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "employee": {
    "user_key": "string | null (if registered user)",
    "name": "string - REQUIRED",
    "employee_id": "string",
    "designation": "string",
    "department": "string"
  },
  
  "pay_period": {
    "type": "enum: monthly | weekly | daily",
    "start_date": "string (YYYY-MM-DD)",
    "end_date": "string (YYYY-MM-DD)"
  },
  
  "earnings": {
    "basic_salary": "number",
    "overtime_hours": "number",
    "overtime_amount": "number",
    "bonus": "number",
    "allowances": {
      "hra": "number",
      "transport": "number",
      "food": "number",
      "other": "number"
    },
    "total_earnings": "number"
  },
  
  "deductions": {
    "pf": "number",
    "esi": "number",
    "tax": "number",
    "advances": "number",
    "other": "number",
    "total_deductions": "number"
  },
  
  "net_pay": "number (earnings - deductions)",
  
  "payment": {
    "date": "string (YYYY-MM-DD)",
    "method": "enum: cash | bank_transfer | upi | cheque",
    "account_id": "string (source account)",
    "transaction_id": "string | null (linked transaction)",
    "status": "enum: paid | pending | partial"
  },
  
  "notes": "string",
  "created_by": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ payslip_id: 1 }` - Unique
- `{ account_key: 1, "pay_period.end_date": -1 }` - Payroll history
- `{ account_key: 1, "employee.user_key": 1 }` - Employee's payslips

---

## Collection: budgets

Spending plans and tracking.

```json
{
  "_id": "ObjectId",
  "budget_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "name": "string - REQUIRED (e.g., 'Monthly Operations')",
  
  "period": {
    "type": "enum: monthly | quarterly | yearly | custom",
    "start_date": "string (YYYY-MM-DD)",
    "end_date": "string (YYYY-MM-DD)"
  },
  
  "total_budget": "number",
  
  "allocations": [
    {
      "category_id": "string",
      "category_name": "string",
      "budgeted_amount": "number",
      "spent_amount": "number (calculated)",
      "remaining": "number (calculated)",
      "percent_used": "number"
    }
  ],
  
  "summary": {
    "total_budgeted": "number",
    "total_spent": "number",
    "total_remaining": "number",
    "percent_used": "number"
  },
  
  "alerts": {
    "warn_at_percent": "number (default: 80)",
    "critical_at_percent": "number (default: 100)"
  },
  
  "is_active": "boolean",
  "created_by": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ budget_id: 1 }` - Unique
- `{ account_key: 1, is_active: 1 }` - Active budgets

---

## Integration with Fish Operations

Auto-create transactions from fish operations:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         AUTO EXPENSE CREATION                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Feeding recorded (cost > 0)                                                        │
│       │                                                                              │
│       ▼                                                                              │
│  Create transaction:                                                                │
│  {                                                                                  │
│    type: "expense",                                                                 │
│    category: "Feed",                                                                │
│    amount: feeding.total_cost,                                                      │
│    reference: {                                                                     │
│      type: "feeding",                                                               │
│      entity_type: "stock",                                                          │
│      entity_id: feeding.stock_id,                                                   │
│      source_id: feeding.feeding_id                                                  │
│    }                                                                                │
│  }                                                                                  │
│                                                                                      │
│  ───────────────────────────────────────────────────────────────────────────────    │
│                                                                                      │
│  Harvest recorded                                                                   │
│       │                                                                              │
│       ▼                                                                              │
│  Create transaction:                                                                │
│  {                                                                                  │
│    type: "income",                                                                  │
│    category: "Fish Sales",                                                          │
│    amount: harvest.total_value,                                                     │
│    reference: {                                                                     │
│      type: "harvest",                                                               │
│      entity_type: "stock",                                                          │
│      entity_id: harvest.stock_id,                                                   │
│      source_id: harvest.harvest_id                                                  │
│    }                                                                                │
│  }                                                                                  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Financial Reports

### Profitability by Stock

```javascript
// Aggregate expenses by stock
db.transactions.aggregate([
  { $match: { 
      account_key: "...", 
      "reference.entity_type": "stock",
      "reference.entity_id": "stock_id"
  }},
  { $group: {
      _id: "$type",
      total: { $sum: "$amount" }
  }}
])

// Result:
// { _id: "expense", total: 250000 }
// { _id: "income", total: 400000 }
// Profit = 400000 - 250000 = 150000
```

### Monthly Summary

```javascript
// Monthly expense breakdown
db.transactions.aggregate([
  { $match: { 
      account_key: "...",
      type: "expense",
      date: { $gte: "2026-01-01", $lte: "2026-01-31" }
  }},
  { $group: {
      _id: "$category_name",
      total: { $sum: "$amount" },
      count: { $sum: 1 }
  }},
  { $sort: { total: -1 }}
])
```
