# Fish Database Schema (fish_db)

Complete schema definitions for fish farm management collections.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              fish_db ERD                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                              ┌─────────────┐                                        │
│                              │  SPECIES    │                                        │
│                              │ (Catalog)   │                                        │
│                              └──────┬──────┘                                        │
│                                     │                                                │
│                                     │ referenced_by                                  │
│                                     ▼                                                │
│  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐               │
│  │   FARMS     │──────────►│   PONDS     │──────────►│   STOCKS    │               │
│  │   1         │   has_many│   N         │   has_many│   N         │               │
│  └─────────────┘           └─────────────┘           └──────┬──────┘               │
│                                   │                         │                       │
│                                   │                         │ has_many             │
│                                   │                         │                       │
│                            ┌──────┴──────┐    ┌─────────────┼─────────────┐        │
│                            │             │    │             │             │        │
│                            ▼             │    ▼             ▼             ▼        │
│                     ┌───────────┐        │ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│                     │MAINTENANCE│        │ │ FEEDINGS │ │SAMPLINGS │ │ HARVESTS │ │
│                     └───────────┘        │ └──────────┘ └──────────┘ └──────────┘ │
│                     ┌───────────┐        │ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│                     │ TREATMENT │        │ │MORTALITY │ │ PURCHASE │ │ TRANSFER │ │
│                     └───────────┘        │ └──────────┘ └──────────┘ └──────────┘ │
│                                          │                                          │
│                            ┌─────────────┴─────────────┐                           │
│                            │                           │                           │
│                            ▼                           ▼                           │
│                     ┌───────────┐               ┌───────────┐                      │
│                     │ EXPENSES  │               │ ACTIVITY  │                      │
│                     │ (any ref) │               │   LOGS    │                      │
│                     └───────────┘               └───────────┘                      │
│                                                                                      │
│  Legend:                                                                            │
│  ───────► has_many (1:N)                                                            │
│  - - - -► references                                                                │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Collection: farms

Physical farm/site locations.

```json
{
  "_id": "ObjectId",
  "farm_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string (12-digit) - REQUIRED",
  "name": "string - REQUIRED",
  "location": {
    "address": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "pincode": "string",
    "coordinates": {
      "lat": "number",
      "lng": "number"
    }
  },
  "area_acres": "number",
  "water_source": "enum: river | bore_well | canal | rain | mixed",
  "pond_count": "number (derived)",
  "is_active": "boolean (default: true)",
  "metadata": "object (flexible)",
  "created_by": "string (user_key)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ farm_id: 1 }` - Unique
- `{ account_key: 1, is_active: 1 }` - List farms

---

## Collection: ponds

Fish ponds within farms.

```json
{
  "_id": "ObjectId",
  "pond_id": "string (12-digit) - PRIMARY KEY",
  "farm_id": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  "name": "string - REQUIRED",
  "pond_type": "enum: earthen | concrete | liner | tank | cage | raceway",
  "area_sqm": "number",
  "depth_m": "number",
  "capacity_liters": "number (calculated: area × depth × 1000)",
  "water_quality": {
    "ph": "number (4.0-10.0)",
    "temperature": "number (°C)",
    "dissolved_oxygen": "number (mg/L)",
    "ammonia": "number (mg/L)",
    "nitrite": "number (mg/L)",
    "turbidity": "number (NTU)",
    "last_checked": "datetime"
  },
  "status": "enum: empty | preparing | stocked | harvesting | maintenance",
  "current_stock_id": "string | null",
  "is_active": "boolean (default: true)",
  "metadata": "object",
  "created_by": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Status Transitions:**
```
empty ───► preparing ───► stocked ───► harvesting ───► empty
              │                            │
              └──────► maintenance ◄───────┘
```

**Indexes:**
- `{ pond_id: 1 }` - Unique
- `{ farm_id: 1, is_active: 1 }` - Farm's ponds
- `{ account_key: 1, status: 1 }` - Status queries

---

## Collection: species

Fish species catalog.

```json
{
  "_id": "ObjectId",
  "species_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  "name": "string - REQUIRED (e.g., 'Rohu')",
  "scientific_name": "string (e.g., 'Labeo rohita')",
  "local_name": "string",
  "category": "enum: freshwater | marine | brackish",
  "growth_rate": "enum: slow | medium | fast",
  "optimal_temp_min": "number (°C)",
  "optimal_temp_max": "number (°C)",
  "market_size_kg": "number (typical harvest weight)",
  "growth_duration_days": "number (to market size)",
  "feed_conversion_ratio": "number (expected FCR)",
  "is_active": "boolean",
  "metadata": "object",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ species_id: 1 }` - Unique
- `{ account_key: 1, is_active: 1 }` - Active species

---

## Collection: stocks

Fish batches/inventory in ponds.

```json
{
  "_id": "ObjectId",
  "stock_id": "string (12-digit) - PRIMARY KEY",
  "pond_id": "string - REQUIRED",
  "farm_id": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  "species_id": "string - REQUIRED",
  "species_name": "string (denormalized)",
  
  "stocking_date": "string (YYYY-MM-DD)",
  "initial_count": "number - REQUIRED",
  "initial_avg_weight_g": "number (grams)",
  
  "current_count": "number (tracks changes)",
  "current_avg_weight_g": "number (from samplings)",
  "total_biomass_kg": "number (count × avg_weight / 1000)",
  
  "mortality_count": "number (accumulated deaths)",
  "harvest_count": "number (accumulated harvests)",
  "purchase_count": "number (accumulated purchases)",
  "transfer_in_count": "number",
  "transfer_out_count": "number",
  
  "source": "string (supplier name)",
  "cost_per_unit": "number",
  "total_cost": "number",
  
  "expected_harvest_date": "string (YYYY-MM-DD)",
  "actual_harvest_date": "string | null",
  
  "status": "enum: active | harvested | terminated | transferred",
  
  "is_under_treatment": "boolean",
  "withdrawal_until": "datetime | null (harvest restriction)",
  
  "notes": "string",
  "metadata": "object",
  "created_by": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Count Tracking:**
```
current_count = initial_count 
              + purchase_count 
              + transfer_in_count
              - mortality_count 
              - harvest_count 
              - transfer_out_count
```

**Indexes:**
- `{ stock_id: 1 }` - Unique
- `{ pond_id: 1, status: 1 }` - Pond's stocks
- `{ account_key: 1, status: 1, created_at: -1 }` - Active stocks

---

## Collection: feedings

Daily feeding records.

```json
{
  "_id": "ObjectId",
  "feeding_id": "string (12-digit) - PRIMARY KEY",
  "stock_id": "string - REQUIRED",
  "pond_id": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  
  "feed_date": "string (YYYY-MM-DD)",
  "feed_time": "enum: morning | afternoon | evening | night",
  
  "feed_type": "string (e.g., 'floating_pellet_28')",
  "feed_brand": "string",
  "quantity_kg": "number - REQUIRED",
  "cost_per_kg": "number",
  "total_cost": "number",
  
  "feeding_method": "enum: manual | automatic | broadcast",
  "response": "enum: good | moderate | poor | none",
  "weather": "enum: sunny | cloudy | rainy | windy",
  
  "notes": "string",
  "created_by": "string",
  "created_at": "datetime"
}
```

**Indexes:**
- `{ feeding_id: 1 }` - Unique
- `{ stock_id: 1, feed_date: -1 }` - Stock feeding history
- `{ account_key: 1, feed_date: -1 }` - Daily feeding report

---

## Collection: samplings

Growth measurement records.

```json
{
  "_id": "ObjectId",
  "sampling_id": "string (12-digit) - PRIMARY KEY",
  "stock_id": "string - REQUIRED",
  "pond_id": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  
  "sampling_date": "string (YYYY-MM-DD)",
  "sample_count": "number (fish sampled)",
  "total_weight_g": "number",
  "avg_weight_g": "number (calculated)",
  "min_weight_g": "number",
  "max_weight_g": "number",
  "avg_length_cm": "number",
  
  "previous_avg_weight_g": "number",
  "weight_gain_g": "number (since last sampling)",
  "growth_rate_g_per_day": "number",
  "days_since_last_sampling": "number",
  
  "condition_factor": "number (K = W / L³ × 100)",
  "health_status": "enum: excellent | good | fair | poor",
  
  "notes": "string",
  "created_by": "string",
  "created_at": "datetime"
}
```

**Note:** Sampling does NOT change fish count!

**Indexes:**
- `{ sampling_id: 1 }` - Unique
- `{ stock_id: 1, sampling_date: -1 }` - Growth history

---

## Collection: harvests

Harvest/sale records.

```json
{
  "_id": "ObjectId",
  "harvest_id": "string (12-digit) - PRIMARY KEY",
  "stock_id": "string - REQUIRED",
  "pond_id": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  
  "harvest_date": "string (YYYY-MM-DD)",
  "harvest_type": "enum: partial | full",
  
  "count": "number (fish harvested)",
  "quantity_kg": "number",
  "avg_weight_g": "number",
  
  "price_per_kg": "number",
  "total_value": "number",
  
  "buyer_id": "string | null",
  "buyer_name": "string",
  
  "gate_pass_id": "string | null",
  "vehicle_number": "string",
  
  "shrinkage_kg": "number (weight loss in transport)",
  "final_weight_kg": "number (at weighbridge)",
  
  "notes": "string",
  "created_by": "string",
  "created_at": "datetime"
}
```

**Impact:** Decreases `stock.current_count`

**Indexes:**
- `{ harvest_id: 1 }` - Unique
- `{ stock_id: 1, harvest_date: -1 }` - Stock's harvests
- `{ account_key: 1, harvest_date: -1 }` - Harvest report

---

## Collection: mortalities

Fish death records.

```json
{
  "_id": "ObjectId",
  "mortality_id": "string (12-digit) - PRIMARY KEY",
  "stock_id": "string - REQUIRED",
  "pond_id": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  
  "mortality_date": "string (YYYY-MM-DD)",
  "count": "number - REQUIRED",
  "estimated_weight_kg": "number",
  
  "cause": "enum: disease | water_quality | predator | handling | weather | unknown",
  "symptoms": "string",
  
  "disposal_method": "enum: buried | burned | removed | composted",
  
  "notes": "string",
  "created_by": "string",
  "created_at": "datetime"
}
```

**Impact:** 
- Decreases `stock.current_count`
- Increases `stock.mortality_count`

**Indexes:**
- `{ mortality_id: 1 }` - Unique
- `{ stock_id: 1, mortality_date: -1 }` - Mortality history

---

## Collection: activity_logs

Audit trail for all operations.

```json
{
  "_id": "ObjectId",
  "log_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "action": "string (e.g., 'stock_added', 'feeding_recorded')",
  "category": "enum: stock | feeding | harvest | mortality | system",
  
  "entity_type": "string (e.g., 'stock', 'pond')",
  "entity_id": "string",
  
  "details": "object (action-specific data)",
  "message": "string (human-readable)",
  
  "performed_by": "string (user_key)",
  "performed_by_name": "string",
  
  "ip_address": "string",
  "user_agent": "string",
  
  "created_at": "datetime"
}
```

**Indexes:**
- `{ log_id: 1 }` - Unique
- `{ account_key: 1, created_at: -1 }` - Activity timeline
- `{ account_key: 1, entity_type: 1, entity_id: 1 }` - Entity history

---

## Related Collections (in media_db)

For cross-domain reusability, the following are managed by **tc_media_service** in `media_db`:

| Collection | Description | Link |
|------------|-------------|------|
| alerts | Generic alerts (water quality, mortality, etc.) | [media-db.md](./media-db.md#collection-alerts) |
| tasks | Jira-like task management | [media-db.md](./media-db.md#collection-tasks) |
| notifications | Push/in-app notifications | [media-db.md](./media-db.md#collection-notifications) |

