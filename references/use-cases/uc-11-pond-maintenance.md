# UC-11: Pond Maintenance

**Category:** Maintenance  
**Actors:** Worker, Farm Manager  
**Precondition:** Pond exists

---

## Overview

Recording pond maintenance activities. **Does NOT change fish count.**

---

## Maintenance Types

| Type | Description | Typical Frequency |
|------|-------------|-------------------|
| water_change | Partial water replacement | Weekly-Monthly |
| cleaning | Remove debris, algae | Monthly |
| aeration | Aerator service | As needed |
| net_repair | Repair nets/cages | As needed |
| embankment | Embankment repair | Seasonal |
| equipment | Equipment maintenance | As needed |
| liming | Lime application | After harvest |
| fertilization | Pond fertilization | Before stocking |

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           MAINTENANCE FLOW                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  POST /maintenances ──► Validate ──► Create Record ──► Log Activity                 │
│                                              │                                       │
│                                              ▼                                       │
│                                   ┌──────────────────┐                              │
│                                   │ If cost provided │                              │
│                                   │ Create Expense   │                              │
│                                   │ (Phase 6)        │                              │
│                                   └──────────────────┘                              │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## API Request

```http
POST /api/fish/maintenances
Content-Type: application/json

{
  "pond_id": "222222222222",
  "maintenance_date": "2026-02-20",
  "type": "water_change",
  "water_change_percent": 30,
  "water_source": "borewell",
  "labor_hours": 2,
  "labor_count": 2,
  "materials_used": [
    { "name": "Diesel", "quantity": 5, "unit": "liters", "cost": 500 }
  ],
  "total_cost": 700,
  "performed_by": "Ramesh",
  "notes": "Routine water change"
}
```

---

## Collections Affected

| Collection | Action | Details |
|------------|--------|---------|
| maintenances | INSERT | New maintenance record |
| expenses | INSERT (optional) | Auto-create expense if cost provided |
| activity_logs | INSERT | Action: "maintenance" |

---

## Acceptance Criteria

- [ ] Maintenance record created
- [ ] Activity log created
- [ ] Expense auto-created if cost provided
- [ ] Fish count NOT changed
