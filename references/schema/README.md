# Database Schema Documentation

Comprehensive schema definitions for all databases and collections.

---

## Documentation Structure

```
docs/schema/
├── README.md                    ← This file (overview)
├── user-db.md                   ← Auth & user collections
├── fish-db.md                   ← Fish farm collections
├── banking-db.md                ← Accountancy collections
├── ai-db.md                     ← AI/ML learning collections
├── media-db.md                  ← Messaging & notifications
├── diagrams/
│   ├── erd-overview.md          ← Entity relationship diagrams
│   ├── erd-fish-db.md           ← Fish DB ERD
│   └── data-flow.md             ← Data flow diagrams
└── indexes/
    └── index-strategy.md        ← Indexing documentation
```

---

## Database Overview

| Database | Service | Purpose | Collections |
|----------|---------|---------|-------------|
| user_db | tc_auth_service | Authentication & users | 5 |
| fish_db | grow_fin_server | Fish farm operations | 15+ |
| banking_db | tc_accountancy_service | Financial management | 5 |
| ai_db | tc_ai_service | AI usage, predictions, learning | 10 |
| media_db | tc_media_service | Messaging, chat, notifications | 12 |

---

## Quick Schema Reference

### user_db Collections

| Collection | Primary Key | Description |
|------------|-------------|-------------|
| users | user_key | User accounts |
| permissions | user_key | User permissions |
| users_mapping | account_key | Org-to-users mapping |
| companies | account_key | Organization profiles |
| refresh_tokens | token_id | JWT refresh tokens |

### fish_db Collections

| Collection | Primary Key | Description |
|------------|-------------|-------------|
| farms | farm_id | Farm locations |
| ponds | pond_id | Fish ponds |
| species | species_id | Fish species catalog |
| stocks | stock_id | Fish batches |
| feedings | feeding_id | Feeding records |
| samplings | sampling_id | Growth samples |
| harvests | harvest_id | Harvest records |
| mortalities | mortality_id | Death records |
| purchases | purchase_id | Fish purchases |
| transfers | transfer_id | Fish transfers |
| maintenances | maintenance_id | Pond maintenance |
| treatments | treatment_id | Medical treatments |
| expenses | expense_id | Cost tracking |
| activity_logs | log_id | Audit trail |
| schedules | schedule_id | Task schedules |

### banking_db Collections

| Collection | Primary Key | Description |
|------------|-------------|-------------|
| accounts | account_id | Financial accounts |
| transactions | transaction_id | Money movements |
| categories | category_id | Transaction categories |
| payslips | payslip_id | Salary records |
| budgets | budget_id | Budget plans |

### ai_db Collections

| Collection | Primary Key | Description |
|------------|-------------|-------------|
| ai_models | model_id | AI model configurations |
| ai_requests | request_id | Every AI API call |
| ai_predictions | prediction_id | Predictions with context |
| ai_outcomes | outcome_id | Actual results (ground truth) |
| ai_feedback | feedback_id | User feedback on AI |
| ai_conversations | conversation_id | Chat/conversation history |
| ai_learning | learning_id | Learned patterns |
| ai_embeddings | embedding_id | Vector embeddings |
| ai_usage_summary | summary_id | Aggregated usage stats |
| ai_prompts | prompt_id | Prompt templates |

### media_db Collections

| Collection | Primary Key | Description |
|------------|-------------|-------------|
| chat_users | user_key | User chat settings & privacy |
| conversations | conversation_id | Chat threads (1:1, groups) |
| groups | group_id | Group/channel details |
| messages | message_id | Chat messages |
| media_files | media_id | File storage metadata |
| notifications | notification_id | Push/in-app delivery (messages, alerts, tasks) |
| alerts | alert_id | **Generic domain alerts (fish, agri, poultry, etc.)** |
| tasks | task_id | **Generic task management (Jira-like)** |
| user_status | user_key | Online/offline presence |
| stories | story_id | 24-hour status updates |
| calls | call_id | Voice/video call logs |
| message_search | search_id | Full-text search index |
| stickers | sticker_id | Sticker packs |
| chat_settings | settings_id | Org-level chat settings |

---

## Common Field Patterns

### Identification Fields

```json
{
  "{entity}_id": "string (12-digit numeric)",
  "account_key": "string (12-digit numeric)",
  "farm_id": "string (parent reference)",
  "pond_id": "string (parent reference)"
}
```

### Timestamp Fields

```json
{
  "created_at": "datetime (ISO 8601)",
  "updated_at": "datetime (ISO 8601)",
  "created_by": "string (user_key)"
}
```

### Status Fields

```json
{
  "status": "enum (entity-specific values)",
  "is_active": "boolean"
}
```

---

## Key Generation

All primary keys are **12-digit numeric strings**:

```python
def generate_key(length=12):
    """Generate unpredictable numeric key."""
    first = random.randint(1, 9)  # Non-zero first
    rest = ''.join([str(random.randint(0, 9)) for _ in range(length - 1)])
    return str(first) + rest

# Examples:
# user_key:    "847293651047"
# account_key: "293847562910"
# farm_id:     "583920174628"
```

**Benefits:**
- Unpredictable (no sequential patterns)
- Fast numeric indexing in MongoDB
- Consistent length
- No prefixes (security)

---

## Multi-Tenancy

Every collection (except global catalogs) includes `account_key`:

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                              TENANT ISOLATION                                       │
├────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  Rule: ALL queries MUST include account_key filter                                 │
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                               │  │
│  │  // CORRECT - Always filter by account_key                                   │  │
│  │  db.stocks.find({ account_key: user.account_key, status: 'active' })        │  │
│  │                                                                               │  │
│  │  // WRONG - Never query without account_key                                  │  │
│  │  db.stocks.find({ status: 'active' })  // ❌ Security risk!                  │  │
│  │                                                                               │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Relationships

### Parent-Child (1:N)

```
Farm (1) ───────► Pond (N)
Pond (1) ───────► Stock (N)
Stock (1) ──────► Feeding (N)
Stock (1) ──────► Sampling (N)
Stock (1) ──────► Harvest (N)
```

### Reference

```
Stock ──────────► Species (reference by species_id)
Expense ────────► Stock/Pond/Farm (reference by entity_id)
Activity ───────► Any entity (reference by entity_id + entity_type)
```

---

## Schema Files Location

JSON schema files are located in:

```
grow_fin_server/
└── grow_fin_server/
    └── schema/
        ├── dbs.json           ← Database configuration
        └── fish_db.json       ← Collection schemas

tc_auth_service/
└── tc_auth_service/
    └── schema/
        ├── dbs.json
        └── user_db.json

tc_accountancy_service/
└── tc_accountancy_service/
    └── schema/
        ├── dbs.json
        └── banking_db.json
```
