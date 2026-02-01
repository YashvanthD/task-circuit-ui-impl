# UC-10: Water Quality Monitoring

**Category:** Monitoring  
**Actors:** Worker, Farm Manager, IoT Sensors  
**Precondition:** Pond exists

---

## Overview

Recording water quality parameters. **Does NOT change fish count.**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           WATER QUALITY OVERVIEW                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ⚠️ Water quality does NOT change fish count                                        │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐    │
│  │                         WATER QUALITY PARAMETERS                             │    │
│  ├─────────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                              │    │
│  │  Parameter          Value      Ideal Range      Status                      │    │
│  │  ─────────          ─────      ───────────      ──────                      │    │
│  │  pH                 7.2        6.5 - 8.5        ✅ Normal                   │    │
│  │  Dissolved Oxygen   5.5 mg/L   > 5 mg/L         ✅ Normal                   │    │
│  │  Temperature        28°C       25 - 32°C        ✅ Normal                   │    │
│  │  Ammonia            0.8 mg/L   < 0.5 mg/L       ⚠️ Warning                  │    │
│  │  Nitrite            0.2 mg/L   < 0.5 mg/L       ✅ Normal                   │    │
│  │  Turbidity          25 NTU     < 30 NTU         ✅ Normal                   │    │
│  │                                                                              │    │
│  │  ─────────────────────────────────────────────────────────────────────────  │    │
│  │  WQI Score: 72/100 (Good)                                                   │    │
│  │                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Recording Methods

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           WATER QUALITY INPUT METHODS                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐             │
│  │    MANUAL       │      │   HANDHELD      │      │  IoT SENSORS    │             │
│  │    ENTRY        │      │   DEVICE        │      │  (Phase 12)     │             │
│  ├─────────────────┤      ├─────────────────┤      ├─────────────────┤             │
│  │                 │      │                 │      │                 │             │
│  │  User enters    │      │  Device syncs   │      │  Auto-collect   │             │
│  │  readings via   │      │  via Bluetooth  │      │  every 1 min    │             │
│  │  mobile app     │      │  or USB         │      │  via MQTT       │             │
│  │                 │      │                 │      │                 │             │
│  │  PUT /ponds/:id │      │  PUT /ponds/:id │      │  POST /iot/     │             │
│  │  /water-quality │      │  /water-quality │      │  readings       │             │
│  │                 │      │                 │      │                 │             │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘             │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## API Request

```http
PUT /api/fish/ponds/222222222222/water-quality
Content-Type: application/json

{
  "reading_date": "2026-02-15",
  "reading_time": "08:00",
  "ph": 7.2,
  "dissolved_oxygen": 5.5,
  "temperature": 28,
  "ammonia": 0.8,
  "nitrite": 0.2,
  "turbidity": 25,
  "alkalinity": 120,
  "hardness": 150,
  "notes": "Morning reading"
}
```

---

## Water Quality Thresholds

| Parameter | Ideal | Warning | Critical |
|-----------|-------|---------|----------|
| pH | 7.0-7.5 | 6.5-9.0 | <6.5 or >9.0 |
| Dissolved Oxygen | >6 mg/L | 4-6 mg/L | <4 mg/L |
| Temperature | 28-30°C | 25-32°C | >35°C |
| Ammonia | <0.02 mg/L | 0.02-0.5 mg/L | >0.5 mg/L |
| Nitrite | <0.1 mg/L | 0.1-0.5 mg/L | >0.5 mg/L |

---

## Alert Triggers

```
IF dissolved_oxygen < 4 mg/L
  → CREATE ALERT: "low_dissolved_oxygen", severity: "critical"
  → RECOMMENDATION: "Turn on aerators immediately"

IF ammonia > 0.5 mg/L
  → CREATE ALERT: "high_ammonia", severity: "warning"
  → RECOMMENDATION: "Partial water change recommended"

IF ph < 6.5 OR ph > 9.0
  → CREATE ALERT: "ph_out_of_range", severity: "warning"
  → RECOMMENDATION: "Apply lime to adjust pH"
```

---

## Collections Affected

| Collection | Action | Details |
|------------|--------|---------|
| ponds | UPDATE | water_quality embedded document |
| activity_logs | INSERT | Action: "water_quality_update" |
| alerts | INSERT (conditional) | If parameters out of range |

---

## Acceptance Criteria

- [ ] Water quality stored in pond document
- [ ] Activity log created
- [ ] Alerts triggered for out-of-range values
- [ ] WQI score calculated (Phase 8)
- [ ] Fish count NOT changed
