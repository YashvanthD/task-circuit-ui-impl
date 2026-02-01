# Entity Schema Index

## Complete List of Entities

This file provides a quick index of all available entity schemas in this directory.

### Authentication & Access (3 files)
1. **auth.yaml** - Authentication entities (login, register, tokens, sessions)
2. **user.yaml** - User management (profiles, settings, permissions)
3. **company.yaml** - Company/organization management

### Fish Farming Core (4 files)
4. **farm.yaml** - Farm management
5. **pond.yaml** - Pond management and water quality
6. **species.yaml** - Fish species definitions
7. **stock.yaml** - Fish stock management

### Farming Activities (8 files)
8. **feeding.yaml** - Feeding records
9. **sampling.yaml** - Growth sampling records
10. **harvest.yaml** - Harvest records
11. **mortality.yaml** - Mortality tracking
12. **transfer.yaml** - Inter-pond transfers
13. **treatment.yaml** - Fish treatments and medications
14. **maintenance.yaml** - Pond maintenance records
15. **purchase.yaml** - Purchase and expense tracking

### Media Service (4 files)
16. **alert.yaml** - System alerts and warnings
17. **task.yaml** - Task management
18. **notification.yaml** - User notifications
19. **chat.yaml** - Chat conversations and messages

## Total: 19 Entity Schema Files

## Quick Reference

### Most Commonly Used Entities

**Fish Farming Flow:**
1. Farm → Pond → Species → Stock
2. Stock → Feeding, Sampling, Treatment
3. Stock → Harvest or Mortality

**User Flow:**
1. Register/Login (auth.yaml)
2. User Profile (user.yaml)
3. Manage Company (company.yaml)

**Operations Flow:**
1. Create Tasks (task.yaml)
2. Monitor Alerts (alert.yaml)
3. Track Activities (feeding, sampling, etc.)
4. Communicate (chat.yaml, notification.yaml)

## Schema Relationships

```
Company
  └── Users
  └── Farms
       └── Ponds
            └── Stocks (links to Species)
                 ├── Feedings
                 ├── Samplings
                 ├── Harvests
                 ├── Mortalities
                 ├── Transfers
                 └── Treatments
            └── Maintenance
       └── Purchases

Users
  ├── Notifications
  ├── Tasks
  ├── Alerts
  └── Chat (Messages & Conversations)
```

## File Formats

All entity files use YAML format and follow the OpenAPI 3.0 specification for schema definitions.

Each entity includes:
- Object type definitions
- Required fields
- Property specifications with types, formats, descriptions, and examples
- Enumerations for fixed value sets
- Default values where applicable

## Usage in API

These schemas map directly to API request/response payloads. Refer to:
- [API_HANDBOOK.md](../API_HANDBOOK.md) for detailed endpoint documentation
- [API_REFERENCE.md](../API_REFERENCE.md) for quick endpoint reference

---

**Last Updated:** January 31, 2026
