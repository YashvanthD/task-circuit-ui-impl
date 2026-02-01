# Entity Schemas

This directory contains YAML schema definitions for all entities in the Grow Fin Server API.

## Overview

Entity schemas define the structure, types, and validation rules for all data objects used across the system. These schemas follow OpenAPI/Swagger specification format and can be referenced in API documentation.

## Entity Categories

### Authentication & User Management
- **auth.yaml** - Authentication-related entities (login, register, tokens, sessions)
- **user.yaml** - User profiles, settings, permissions
- **company.yaml** - Company/organization profiles

### Fish Farming Operations
- **farm.yaml** - Fish farm entities
- **pond.yaml** - Pond entities and water quality data
- **species.yaml** - Fish species information
- **stock.yaml** - Fish stock management

### Farming Activities
- **feeding.yaml** - Feeding records
- **sampling.yaml** - Fish sampling records
- **harvest.yaml** - Harvest records
- **mortality.yaml** - Mortality tracking
- **transfer.yaml** - Inter-pond transfers
- **treatment.yaml** - Fish treatment records
- **maintenance.yaml** - Pond maintenance records
- **purchase.yaml** - Purchase tracking

### Media Service
- **alert.yaml** - System alerts and warnings
- **task.yaml** - Task management
- **notification.yaml** - User notifications
- **chat.yaml** - Chat conversations and messages

## Usage

### In API Documentation

Reference these schemas in your OpenAPI/Swagger documentation:

```yaml
components:
  schemas:
    User:
      $ref: './entities/user.yaml#/User'
    Farm:
      $ref: './entities/farm.yaml#/Farm'
```

### In Code

These schemas can be used for:
- API request/response validation
- Database model definitions
- Client-side TypeScript interfaces generation
- API documentation generation

## Schema Structure

Each entity file contains:

1. **Main Entity Definition**: The primary object structure
2. **Required Fields**: Fields that must be present
3. **Properties**: All available fields with:
   - Type information
   - Format specifications
   - Descriptions
   - Example values
   - Enums (where applicable)
   - Default values (where applicable)

## Common Field Types

- `string`: Text data
- `integer`: Whole numbers
- `number` (format: double): Decimal numbers
- `boolean`: True/false values
- `array`: List of items
- `object`: Nested structures

## Common Formats

- `date`: ISO 8601 date (YYYY-MM-DD)
- `date-time`: ISO 8601 datetime (YYYY-MM-DDTHH:MM:SSZ)
- `email`: Valid email address
- `uri`: Valid URI/URL
- `password`: Password field (masked in UIs)

## Validation

All schemas include:
- Required field specifications
- Data type enforcement
- Enum constraints for fixed values
- Example values for documentation

## Maintenance

When adding new entities or modifying existing ones:

1. Update the corresponding YAML file
2. Ensure all required fields are specified
3. Include descriptions for all properties
4. Add example values
5. Update this README if adding new entity files
6. Regenerate API documentation if needed

## Related Documentation

- [API Handbook](../API_HANDBOOK.md) - Complete API reference with request/response examples
- [API Reference](../API_REFERENCE.md) - Quick API endpoint reference
- [Swagger UI](http://localhost:8093/swagger) - Interactive API documentation

---

**Last Updated:** January 31, 2026
