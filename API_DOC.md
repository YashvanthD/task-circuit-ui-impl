# Task Circuit API Documentation (December 2025)

This document provides up-to-date API endpoint references, example curl requests, and expected responses for the Task Circuit project. Keep this file updated alongside COPILOT_INSTRUCTIONS.md.

---

## Authentication

### Login
**Endpoint:**
```
POST /auth/login
```
**Curl Example:**
```
curl --location 'http://localhost:8001/auth/login' \
  --header 'Content-Type: application/json' \
  --data '{ "username": "user1", "password": "password1" }'
```
**Response:**
```
{
  "access_token": "...",
  "refresh_token": "...",
  "success": true,
  "user": { ... },
  ...other fields...
}
```

### Validate Access Token
**Endpoint:**
```
POST /auth/validate
```
**Curl Example:**
```
curl --location 'http://localhost:8001/auth/validate' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <access_token>'
```
**Response:**
```
{
  "success": true,
  "expiry": 1764852429
}
```

### Refresh Access Token
**Endpoint:**
```
POST /auth/token
```
**Curl Example:**
```
curl --location 'http://localhost:8001/auth/token' \
  --header 'Content-Type: application/json' \
  --data '{ "type": "refresh_token", "token": "<refresh_token>", "expires_in": 3600 }'
```
**Response:**
```
{
  "access_token": "...",
  "expires_in": 3600,
  "success": true
}
```

---

## User Endpoints

### Get User Info
**Endpoint:**
```
GET /user/me
```
**Curl Example:**
```
curl --location 'http://localhost:8001/user/me' \
  --header 'Authorization: Bearer <access_token>'
```
**Response:**
```
{
  "success": true,
  "user": { ... }
}
```

### User Dashboard
**Endpoint:**
```
GET /user/dashboard
```
**Curl Example:**
```
curl --location 'http://localhost:8001/user/dashboard' \
  --header 'Authorization: Bearer <access_token>'
```
**Response:**
```
{
  "success": true,
  ...dashboard data...
}
```

---

## Task Endpoints

### Get All Tasks
**Endpoint:**
```
GET /task/
```
**Curl Example:**
```
curl --location 'http://localhost:8001/task/' \
  --header 'Authorization: Bearer <access_token>'
```
**Response:**
```
{
  "success": true,
  "tasks": [ ... ]
}
```

### Update Task
**Endpoint:**
```
PUT /task/{task_id}
```
**Curl Example:**
```
curl --location --request PUT 'http://localhost:8001/task/<task_id>' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <access_token>' \
  --data '{ "status": "completed" }'
```
**Response:**
```
{
  "success": true,
  "task": { ...updated task... }
}
```

---

## Notes
- Always use the access_token for authentication in the Authorization header.
- Never use refresh_token for endpoint authentication; only for token refresh.
- Refer to COPILOT_INSTRUCTIONS.md for implementation details and best practices.
- Update this file whenever endpoints, request/response formats, or authentication logic change.

