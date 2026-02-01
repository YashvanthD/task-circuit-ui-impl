# UC-01: Initial Setup

**Category:** Setup  
**Priority:** First step before any operations  
**Actors:** Farm Owner, Administrator

---

## Overview

Initial system configuration including creating farms, ponds, and species catalog.

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              INITIAL SETUP FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  Step 1              Step 2              Step 3              Step 4                 │
│  ──────              ──────              ──────              ──────                 │
│                                                                                      │
│  ┌─────────┐        ┌─────────┐        ┌─────────┐        ┌─────────┐              │
│  │ Create  │   ──►  │ Create  │   ──►  │  Add    │   ──►  │  Ready  │              │
│  │  Farm   │        │  Ponds  │        │ Species │        │ to Stock│              │
│  └─────────┘        └─────────┘        └─────────┘        └─────────┘              │
│       │                  │                  │                                        │
│       ▼                  ▼                  ▼                                        │
│  ┌─────────┐        ┌─────────┐        ┌─────────┐                                  │
│  │ farms   │        │ ponds   │        │ species │                                  │
│  │collection│       │collection│       │collection│                                 │
│  └─────────┘        └─────────┘        └─────────┘                                  │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1.1 Create Farm

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CREATE FARM FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────┐                                                                   │
│  │    User      │                                                                   │
│  │   Request    │                                                                   │
│  │              │                                                                   │
│  │ POST /farms  │                                                                   │
│  │ {            │                                                                   │
│  │   name,      │                                                                   │
│  │   location   │                                                                   │
│  │ }            │                                                                   │
│  └──────┬───────┘                                                                   │
│         │                                                                            │
│         ▼                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                           FarmService.create()                                │   │
│  │                                                                               │   │
│  │  1. Validate input                                                           │   │
│  │  2. Generate farm_id (12-digit)                                              │   │
│  │  3. Add account_key from context                                                 │   │
│  │  4. Set status = "active"                                                    │   │
│  │  5. Set created_at timestamp                                                 │   │
│  └───────────────────────────────────┬──────────────────────────────────────────┘   │
│                                      │                                               │
│         ┌────────────────────────────┴────────────────────────────┐                 │
│         │                                                         │                 │
│         ▼                                                         ▼                 │
│  ┌──────────────┐                                          ┌──────────────┐        │
│  │    farms     │                                          │ activity_logs│        │
│  │  collection  │                                          │  collection  │        │
│  │              │                                          │              │        │
│  │  INSERT      │                                          │  INSERT      │        │
│  │  farm doc    │                                          │  "Created    │        │
│  │              │                                          │   farm"      │        │
│  └──────────────┘                                          └──────────────┘        │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### API Request

```http
POST /api/fish/farms
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "Green Valley Farm",
  "location": {
    "address": "123 Farm Road, Village",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "country": "India",
    "pincode": "600001",
    "latitude": 13.0827,
    "longitude": 80.2707
  },
  "area_acres": 10.5,
  "contact_name": "John Doe",
  "contact_phone": "9876543210"
}
```

### API Response

```json
{
  "success": true,
  "data": {
    "farm_id": "123456789012",
    "account_key": "111111111111",
    "name": "Green Valley Farm",
    "location": { ... },
    "status": "active",
    "ponds_count": 0,
    "created_at": "2026-01-25T10:00:00Z"
  }
}
```

### Collections Affected

| Collection | Action | Details |
|------------|--------|---------|
| farms | INSERT | New farm document |
| activity_logs | INSERT | Action: "create", entity: "farm" |

---

## 1.2 Create Ponds

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CREATE POND FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────┐                                                                   │
│  │    User      │                                                                   │
│  │   Request    │                                                                   │
│  │              │                                                                   │
│  │ POST /ponds  │                                                                   │
│  │ {            │                                                                   │
│  │   farm_id,   │                                                                   │
│  │   name,      │                                                                   │
│  │   area_sqm   │                                                                   │
│  │ }            │                                                                   │
│  └──────┬───────┘                                                                   │
│         │                                                                            │
│         ▼                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                           PondService.create()                                │   │
│  │                                                                               │   │
│  │  1. Validate farm exists and belongs to org                                  │   │
│  │  2. Generate pond_id (12-digit)                                              │   │
│  │  3. Set status = "empty"                                                     │   │
│  │  4. Set current_stock_id = null                                              │   │
│  │  5. Initialize water_quality = {}                                            │   │
│  └───────────────────────────────────┬──────────────────────────────────────────┘   │
│                                      │                                               │
│         ┌────────────────────────────┼────────────────────────────┐                 │
│         │                            │                            │                 │
│         ▼                            ▼                            ▼                 │
│  ┌──────────────┐            ┌──────────────┐            ┌──────────────┐          │
│  │    ponds     │            │    farms     │            │ activity_logs│          │
│  │  collection  │            │  collection  │            │  collection  │          │
│  │              │            │              │            │              │          │
│  │  INSERT      │            │  UPDATE      │            │  INSERT      │          │
│  │  pond doc    │            │  ponds_count │            │  "Created    │          │
│  │  status:     │            │  +1          │            │   pond"      │          │
│  │  "empty"     │            │              │            │              │          │
│  └──────────────┘            └──────────────┘            └──────────────┘          │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Pond Status States

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              POND STATUS LIFECYCLE                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│     ┌──────────┐                                                                    │
│     │  empty   │◄──────────────────────────────────────────────┐                   │
│     │          │                                                │                   │
│     └────┬─────┘                                                │                   │
│          │ Stock fish                                           │ Full harvest      │
│          ▼                                                      │                   │
│     ┌──────────┐         ┌──────────┐         ┌──────────┐     │                   │
│     │ preparing│────────►│ stocked  │────────►│harvesting│─────┘                   │
│     │          │         │          │         │          │                         │
│     └──────────┘         └────┬─────┘         └──────────┘                         │
│                               │                                                     │
│                               │ Maintenance needed                                  │
│                               ▼                                                     │
│                          ┌──────────┐                                              │
│                          │maintenance│                                              │
│                          │          │                                              │
│                          └──────────┘                                              │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### API Request

```http
POST /api/fish/ponds
Content-Type: application/json

{
  "farm_id": "123456789012",
  "name": "Pond A1",
  "area_sqm": 1000,
  "depth_m": 1.5,
  "pond_type": "earthen",
  "water_source": "borewell"
}
```

### Collections Affected

| Collection | Action | Details |
|------------|--------|---------|
| ponds | INSERT | New pond with status="empty" |
| farms | UPDATE | Increment ponds_count |
| activity_logs | INSERT | Action: "create", entity: "pond" |

---

## 1.3 Add Species to Catalog

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              ADD SPECIES FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌──────────────┐                                                                   │
│  │    User      │                                                                   │
│  │   Request    │                                                                   │
│  │              │                                                                   │
│  │POST /species │                                                                   │
│  │ {            │                                                                   │
│  │   name,      │                                                                   │
│  │   local_name │                                                                   │
│  │ }            │                                                                   │
│  └──────┬───────┘                                                                   │
│         │                                                                            │
│         ▼                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                         SpeciesService.create()                               │   │
│  │                                                                               │   │
│  │  1. Check for duplicate (same name in org)                                   │   │
│  │  2. Generate species_id                                                      │   │
│  │  3. Set default growth parameters if not provided                            │   │
│  │  4. Set is_active = true                                                     │   │
│  └───────────────────────────────────┬──────────────────────────────────────────┘   │
│                                      │                                               │
│         ┌────────────────────────────┴────────────────────────────┐                 │
│         │                                                         │                 │
│         ▼                                                         ▼                 │
│  ┌──────────────┐                                          ┌──────────────┐        │
│  │   species    │                                          │ activity_logs│        │
│  │  collection  │                                          │  collection  │        │
│  │              │                                          │              │        │
│  │  INSERT      │                                          │  INSERT      │        │
│  │  species doc │                                          │  "Added      │        │
│  │              │                                          │   species"   │        │
│  └──────────────┘                                          └──────────────┘        │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Common Fish Species

| Species | Local Name (Tamil) | Market Size (kg) | Growth Days |
|---------|-------------------|------------------|-------------|
| Rohu | Kannadi Kendai | 0.8 - 1.2 | 180 - 240 |
| Catla | Thoppu Kendai | 1.0 - 1.5 | 180 - 240 |
| Mrigal | Mrigal | 0.5 - 0.8 | 150 - 200 |
| Tilapia | Tilapia | 0.3 - 0.5 | 120 - 150 |
| Pangasius | Pangasius | 0.8 - 1.2 | 150 - 180 |

### API Request

```http
POST /api/fish/species
Content-Type: application/json

{
  "name": "Rohu",
  "scientific_name": "Labeo rohita",
  "local_name": "Kannadi Kendai",
  "category": "carp",
  "growth_params": {
    "expected_growth_rate_g_per_day": 5,
    "market_size_kg": 1.0,
    "typical_cycle_days": 180
  }
}
```

### Collections Affected

| Collection | Action | Details |
|------------|--------|---------|
| species | INSERT | New species document |
| activity_logs | INSERT | Action: "create", entity: "species" |

---

## Acceptance Criteria

- [ ] Farm can be created with location details
- [ ] Multiple ponds can be created under a farm
- [ ] Pond status is "empty" on creation
- [ ] Species can be added to catalog
- [ ] All operations create activity logs
- [ ] Validation errors return helpful messages
