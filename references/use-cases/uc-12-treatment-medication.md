# UC-12: Treatment & Medication

**Category:** Health  
**Actors:** Farm Manager, Veterinarian  
**Precondition:** Stock exists and is active

---

## Overview

Recording medical treatments. **Does NOT change fish count**, but may set withdrawal period.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           TREATMENT FLOW                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Treatment recorded                                                                 │
│        │                                                                             │
│        ▼                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │ If withdrawal_days > 0:                                                       │   │
│  │   • Stock.withdrawal_until = end_date + withdrawal_days                      │   │
│  │   • Stock.is_under_treatment = true                                          │   │
│  │   • ⚠️ HARVEST BLOCKED until withdrawal_until                                │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                             │
│        ▼                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │ If follow_up_required:                                                        │   │
│  │   • Create scheduled follow-up (Phase 7)                                     │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Treatment Types

| Type | Description | Typical Withdrawal |
|------|-------------|-------------------|
| medication | Antibiotics | 7-21 days |
| salt | Salt treatment | 0 days |
| lime | Lime application | 0 days |
| probiotics | Probiotics | 0 days |
| disinfection | Disinfection | 3-7 days |
| parasite | Anti-parasitic | 7-14 days |
| fungal | Anti-fungal | 7-14 days |
| vitamin | Vitamins | 0 days |

---

## API Request

```http
POST /api/fish/treatments
Content-Type: application/json

{
  "pond_id": "222222222222",
  "stock_id": "444444444444",
  "treatment_date": "2026-03-01",
  "type": "medication",
  "medicine_name": "Oxytetracycline",
  "brand": "TetraMed",
  "dosage": 100,
  "dosage_unit": "mg/kg",
  "application_method": "feed_mix",
  "duration_days": 7,
  "end_date": "2026-03-08",
  "withdrawal_days": 14,
  "withdrawal_until": "2026-03-22",
  "reason": "Suspected bacterial infection",
  "symptoms_observed": "Red spots, lethargy",
  "total_cost": 5000,
  "veterinarian": "Dr. Kumar",
  "follow_up_required": true,
  "follow_up_date": "2026-03-10"
}
```

---

## Withdrawal Period Impact

```
Treatment: March 1, 2026
Duration: 7 days
Withdrawal: 14 days

Timeline:
─────────────────────────────────────────────────────────────────────
  Mar 1          Mar 8          Mar 22
    │              │              │
    │  Treatment   │  Withdrawal  │  Safe to
    │  Period      │  Period      │  Harvest
    ├──────────────┼──────────────┤
    │ ⚠️ NO HARVEST ALLOWED      │  ✅ OK
─────────────────────────────────────────────────────────────────────
```

---

## Collections Affected

| Collection | Action | Details |
|------------|--------|---------|
| treatments | INSERT | New treatment record |
| stocks | UPDATE | is_under_treatment, withdrawal_until |
| schedules | INSERT (optional) | Follow-up schedule |
| expenses | INSERT (optional) | Auto-create expense |
| activity_logs | INSERT | Action: "treatment" |

---

## Acceptance Criteria

- [ ] Treatment record created
- [ ] Stock.withdrawal_until set if applicable
- [ ] Follow-up schedule created if requested
- [ ] Expense auto-created if cost provided
- [ ] Harvest blocked during withdrawal
- [ ] Fish count NOT changed
