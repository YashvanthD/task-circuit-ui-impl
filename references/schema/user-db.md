# User Database Schema (user_db)

Schema definitions for authentication and user management collections.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              user_db ERD                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                         ┌─────────────────┐                                         │
│                         │    COMPANIES    │                                         │
│                         │  (Organization) │                                         │
│                         │   account_key   │                                         │
│                         └────────┬────────┘                                         │
│                                  │                                                   │
│                                  │ 1:N                                               │
│                                  ▼                                                   │
│            ┌─────────────────────────────────────────────┐                          │
│            │              USERS_MAPPING                   │                          │
│            │  (account_key → [user_keys])                │                          │
│            └─────────────────────┬───────────────────────┘                          │
│                                  │                                                   │
│                                  │ references                                        │
│                                  ▼                                                   │
│                         ┌─────────────────┐                                         │
│                         │     USERS       │                                         │
│                         │    user_key     │                                         │
│                         └────────┬────────┘                                         │
│                                  │                                                   │
│                    ┌─────────────┴─────────────┐                                    │
│                    │                           │                                    │
│                    ▼                           ▼                                    │
│           ┌─────────────────┐         ┌─────────────────┐                          │
│           │  PERMISSIONS    │         │ REFRESH_TOKENS  │                          │
│           │   (per user)    │         │   (sessions)    │                          │
│           └─────────────────┘         └─────────────────┘                          │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Collection: users

User accounts and authentication data.

```json
{
  "_id": "ObjectId",
  "user_key": "string (12-digit) - PRIMARY KEY",
  "account_key": "string (12-digit) - REQUIRED (org reference)",
  
  "profile": {
    "first_name": "string - REQUIRED",
    "last_name": "string",
    "display_name": "string (full name)",
    "avatar_url": "string | null",
    "phone": "string",
    "phone_verified": "boolean"
  },
  
  "auth": {
    "email": "string - REQUIRED (unique, lowercase)",
    "email_verified": "boolean",
    "password_hash": "string (bcrypt)",
    "username": "string (unique, auto-generated)",
    "role": "enum: owner | admin | manager | worker | viewer",
    "last_login": "datetime",
    "login_count": "number",
    "failed_attempts": "number",
    "locked_until": "datetime | null"
  },
  
  "settings": {
    "language": "string (default: 'en')",
    "timezone": "string (default: 'Asia/Kolkata')",
    "date_format": "string (default: 'DD/MM/YYYY')",
    "notifications": {
      "email": "boolean",
      "push": "boolean",
      "sms": "boolean"
    }
  },
  
  "tokens": {
    "access_token_expiry": "number (seconds, default: 604800 = 7 days)",
    "refresh_token_expiry": "number (seconds, default: 2592000 = 30 days)"
  },
  
  "status": "enum: active | inactive | suspended | pending",
  "is_owner": "boolean (account owner)",
  
  "metadata": "object",
  "created_at": "datetime",
  "updated_at": "datetime",
  "created_by": "string (user_key who created)"
}
```

**Indexes:**
- `{ user_key: 1 }` - Unique
- `{ "auth.email": 1 }` - Unique, login lookup
- `{ "auth.username": 1 }` - Unique
- `{ account_key: 1, status: 1 }` - Org's users

---

## Collection: permissions

User permission grants (deny-first model).

```json
{
  "_id": "ObjectId",
  "user_key": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  
  "permissions": {
    "deny": [
      "string (permission codes)"
    ],
    "allow": [
      "string (permission codes)"
    ]
  },
  
  "role_permissions": "string (inherited role)",
  
  "effective_permissions": [
    "string (computed: role - deny + allow)"
  ],
  
  "updated_at": "datetime",
  "updated_by": "string"
}
```

**Permission Codes:**
```
# Farm Management
farms:read, farms:write, farms:delete

# Pond Management
ponds:read, ponds:write, ponds:delete

# Stock Operations
stocks:read, stocks:write, stocks:delete
feedings:read, feedings:write
samplings:read, samplings:write
harvests:read, harvests:write
mortalities:read, mortalities:write

# Financial
expenses:read, expenses:write
reports:read, reports:export

# Administration
users:read, users:write, users:delete
settings:read, settings:write
```

**Indexes:**
- `{ user_key: 1 }` - Unique
- `{ account_key: 1 }` - Org's permissions

---

## Collection: users_mapping

Maps organizations to their users.

```json
{
  "_id": "ObjectId",
  "account_key": "string - PRIMARY KEY",
  
  "owner_key": "string (user_key of owner)",
  
  "user_keys": [
    "string (user_key)"
  ],
  
  "user_count": "number",
  "max_users": "number (plan limit)",
  
  "roles_summary": {
    "owner": 1,
    "admin": "number",
    "manager": "number",
    "worker": "number",
    "viewer": "number"
  },
  
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ account_key: 1 }` - Unique

---

## Collection: companies

Organization/company profiles.

```json
{
  "_id": "ObjectId",
  "account_key": "string - PRIMARY KEY",
  "company_id": "string (12-digit) - UNIQUE",
  "owner_key": "string (user_key)",
  
  "profile": {
    "name": "string - REQUIRED",
    "legal_name": "string",
    "registration_number": "string",
    "tax_id": "string (GST/VAT)",
    "industry": "string",
    "logo_url": "string | null"
  },
  
  "contact": {
    "email": "string",
    "phone": "string",
    "website": "string",
    "address": {
      "line1": "string",
      "line2": "string",
      "city": "string",
      "state": "string",
      "country": "string",
      "pincode": "string"
    }
  },
  
  "settings": {
    "timezone": "string",
    "currency": "string (default: 'INR')",
    "date_format": "string",
    "fiscal_year_start": "string (MM-DD)"
  },
  
  "subscription": {
    "plan": "enum: free | basic | pro | enterprise",
    "status": "enum: active | trial | expired | cancelled",
    "trial_ends_at": "datetime | null",
    "current_period_end": "datetime"
  },
  
  "limits": {
    "max_users": "number",
    "max_farms": "number",
    "max_ponds": "number",
    "storage_gb": "number"
  },
  
  "status": "enum: active | inactive | suspended",
  
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ account_key: 1 }` - Unique
- `{ company_id: 1 }` - Unique
- `{ owner_key: 1 }` - Owner's companies

---

## Collection: refresh_tokens

JWT refresh token storage for session management.

```json
{
  "_id": "ObjectId",
  "token_id": "string - PRIMARY KEY",
  "user_key": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  
  "token_hash": "string (hashed token)",
  
  "device_info": {
    "user_agent": "string",
    "ip_address": "string",
    "device_type": "enum: web | mobile | desktop | api",
    "device_name": "string"
  },
  
  "issued_at": "datetime",
  "expires_at": "datetime",
  "last_used_at": "datetime",
  
  "is_revoked": "boolean (default: false)",
  "revoked_at": "datetime | null",
  "revoked_reason": "string | null"
}
```

**Indexes:**
- `{ token_id: 1 }` - Unique
- `{ user_key: 1 }` - User's sessions
- `{ expires_at: 1 }` - TTL index for auto-cleanup
- `{ token_hash: 1 }` - Token lookup

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AUTH FLOW                                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. LOGIN                                                                           │
│     POST /api/auth/login                                                            │
│     { email, password }                                                             │
│           │                                                                          │
│           ▼                                                                          │
│     Validate credentials                                                            │
│           │                                                                          │
│           ▼                                                                          │
│     Generate tokens:                                                                │
│     - Access Token (JWT, 7 days)                                                    │
│     - Refresh Token (random, 30 days)                                               │
│           │                                                                          │
│           ▼                                                                          │
│     Store refresh_token in DB                                                       │
│           │                                                                          │
│           ▼                                                                          │
│     Return { access_token, refresh_token, user }                                    │
│                                                                                      │
│  2. AUTHENTICATED REQUEST                                                           │
│     GET /api/fish/stocks                                                            │
│     Authorization: Bearer <access_token>                                            │
│           │                                                                          │
│           ▼                                                                          │
│     Validate JWT                                                                    │
│     Extract user_key, account_key                                                   │
│     Check permissions                                                               │
│           │                                                                          │
│           ▼                                                                          │
│     Process request                                                                 │
│                                                                                      │
│  3. REFRESH                                                                         │
│     POST /api/auth/refresh                                                          │
│     { refresh_token }                                                               │
│           │                                                                          │
│           ▼                                                                          │
│     Validate refresh_token in DB                                                    │
│     Check not revoked, not expired                                                  │
│           │                                                                          │
│           ▼                                                                          │
│     Generate new access_token                                                       │
│     Optionally rotate refresh_token                                                 │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Role Hierarchy

```
owner (100)
  └── admin (80)
        └── manager (60)
              └── worker (40)
                    └── viewer (20)
```

| Role | Can Create Users | Can Edit Settings | Can Delete Data | Can View Reports |
|------|------------------|-------------------|-----------------|------------------|
| owner | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ (except owner) | ✅ | ✅ | ✅ |
| manager | ✅ (workers only) | ❌ | ❌ | ✅ |
| worker | ❌ | ❌ | ❌ | Limited |
| viewer | ❌ | ❌ | ❌ | ✅ |
