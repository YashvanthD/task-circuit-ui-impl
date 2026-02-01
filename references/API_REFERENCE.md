# API Quick Reference

**Base URL:** `http://localhost:8093`

---

## 🔐 Authentication APIs (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user account |
| POST | `/api/auth/login` | Login with email and password |
| POST | `/api/auth/logout` | Logout and invalidate token |
| POST | `/api/auth/validate` | Validate JWT token |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/password/change` | Change password (requires auth) |
| POST | `/api/auth/password/forgot` | Request password reset email |
| POST | `/api/auth/password/reset` | Reset password with token |
| GET  | `/api/auth/token` | Get current token info (requires auth) |
| GET  | `/api/auth/sessions` | List active sessions (requires auth) |
| DELETE | `/api/auth/sessions/{session_key}` | Revoke specific session (requires auth) |

---

## 👤 User Management APIs (`/api/user`)

**All endpoints require authentication**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user` | Create new user (invite to organization, admin only) |
| GET | `/api/user/me` | Get current user profile |
| PUT | `/api/user/me` | Update current user |
| GET | `/api/user/settings` | Get current user settings |
| PUT | `/api/user/settings` | Update current user settings |
| GET | `/api/user/profile` | Get current user profile details |
| PUT | `/api/user/profile` | Update current user profile |
| GET | `/api/user/auth` | Get current user auth info |
| PUT | `/api/user/auth` | Update auth settings (MFA, username) |
| GET | `/api/user/auth/token-settings` | Get token expiry settings |
| PUT | `/api/user/auth/token-settings` | Update token expiry settings |
| GET | `/api/user/permissions` | Get current user permissions |
| PUT | `/api/user/permissions` | Update current user permissions |
| GET | `/api/user/{user_key}` | Get specific user (admin) |
| PUT | `/api/user/{user_key}` | Update specific user (admin) |
| DELETE | `/api/user/{user_key}` | Deactivate user (admin) |
| GET | `/api/user/{user_key}/settings` | Get user settings (admin) |
| PUT | `/api/user/{user_key}/settings` | Update user settings (admin) |
| GET | `/api/user/{user_key}/profile` | Get user profile (admin) |
| PUT | `/api/user/{user_key}/profile` | Update user profile (admin) |
| GET | `/api/user/{user_key}/permissions` | Get user permissions (admin) |
| PUT | `/api/user/{user_key}/permissions` | Update user permissions (admin) |
| GET | `/api/users/list` | List all users in organization |

---

## 🏢 Company APIs (`/api/company`)

**All endpoints require authentication**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/company/profile` | Get company profile |
| PUT | `/api/company/profile` | Update company profile |

---

## 🐟 Fish Farming APIs (`/api/fish`)

**All endpoints require authentication**

### Farms

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/farms` | List all farms |
| POST | `/api/fish/farms` | Create new farm |
| GET | `/api/fish/farms/{farm_id}` | Get farm details |
| PUT | `/api/fish/farms/{farm_id}` | Update farm |
| DELETE | `/api/fish/farms/{farm_id}` | Delete farm |
| GET | `/api/fish/farms/{farm_id}/ponds` | Get all ponds in farm |

### Ponds

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/ponds` | List all ponds |
| POST | `/api/fish/ponds` | Create new pond |
| GET | `/api/fish/ponds/{pond_id}` | Get pond details |
| PUT | `/api/fish/ponds/{pond_id}` | Update pond |
| DELETE | `/api/fish/ponds/{pond_id}` | Delete pond |
| GET | `/api/fish/ponds/{pond_id}/water-quality` | Get pond water quality data |
| GET | `/api/fish/ponds/{pond_id}/stock` | Get current stock in pond |

### Species

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/species` | List all species |
| POST | `/api/fish/species` | Create new species |
| GET | `/api/fish/species/{species_id}` | Get species details |
| PUT | `/api/fish/species/{species_id}` | Update species |
| DELETE | `/api/fish/species/{species_id}` | Delete species |

### Stocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/stocks` | List all stocks |
| POST | `/api/fish/stocks` | Create new stock |
| GET | `/api/fish/stocks/{stock_id}` | Get stock details |
| PUT | `/api/fish/stocks/{stock_id}` | Update stock |
| POST | `/api/fish/stocks/{stock_id}/terminate` | Terminate/close stock |
| GET | `/api/fish/stocks/{stock_id}/summary` | Get stock summary & statistics |

### Feedings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/feedings` | List feeding records |
| POST | `/api/fish/feedings` | Record new feeding |
| GET | `/api/fish/feedings/{feeding_id}` | Get feeding details |
| PUT | `/api/fish/feedings/{feeding_id}` | Update feeding record |
| DELETE | `/api/fish/feedings/{feeding_id}` | Delete feeding record |

### Samplings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/samplings` | List sampling records |
| POST | `/api/fish/samplings` | Record new sampling |
| GET | `/api/fish/samplings/{sampling_id}` | Get sampling details |
| PUT | `/api/fish/samplings/{sampling_id}` | Update sampling record |
| DELETE | `/api/fish/samplings/{sampling_id}` | Delete sampling record |

### Harvests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/harvests` | List harvest records |
| POST | `/api/fish/harvests` | Record new harvest |
| GET | `/api/fish/harvests/{harvest_id}` | Get harvest details |
| PUT | `/api/fish/harvests/{harvest_id}` | Update harvest record |
| DELETE | `/api/fish/harvests/{harvest_id}` | Delete harvest record |

### Mortalities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/mortalities` | List mortality records |
| POST | `/api/fish/mortalities` | Record new mortality |
| GET | `/api/fish/mortalities/{mortality_id}` | Get mortality details |
| PUT | `/api/fish/mortalities/{mortality_id}` | Update mortality record |
| DELETE | `/api/fish/mortalities/{mortality_id}` | Delete mortality record |

### Purchases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/purchases` | List purchase records |
| POST | `/api/fish/purchases` | Record new purchase |
| GET | `/api/fish/purchases/{purchase_id}` | Get purchase details |
| PUT | `/api/fish/purchases/{purchase_id}` | Update purchase record |
| DELETE | `/api/fish/purchases/{purchase_id}` | Delete purchase record |

### Transfers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/transfers` | List transfer records |
| POST | `/api/fish/transfers` | Record new transfer |
| GET | `/api/fish/transfers/{transfer_id}` | Get transfer details |
| PUT | `/api/fish/transfers/{transfer_id}` | Update transfer record |
| DELETE | `/api/fish/transfers/{transfer_id}` | Delete transfer record |

### Maintenance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/maintenance` | List maintenance records |
| POST | `/api/fish/maintenance` | Record pond maintenance (manual/IoT) |
| GET | `/api/fish/maintenance/{maintenance_id}` | Get maintenance details |
| PUT | `/api/fish/maintenance/{maintenance_id}` | Update maintenance record |
| DELETE | `/api/fish/maintenance/{maintenance_id}` | Delete maintenance record |

### Treatments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/treatments` | List treatment records |
| POST | `/api/fish/treatments` | Record fish treatment (manual/AI) |
| GET | `/api/fish/treatments/{treatment_id}` | Get treatment details |
| PUT | `/api/fish/treatments/{treatment_id}` | Update treatment record |
| DELETE | `/api/fish/treatments/{treatment_id}` | Delete treatment record |
| GET | `/api/fish/treatments/withdrawal-status/{stock_id}` | Check if stock can be harvested |

### Activity Log

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fish/activity` | Get activity log for entities |

---

## 📢 Media Service APIs

**All endpoints require authentication**

### Alerts (`/api/alerts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List all alerts (with reminder_info) |
| POST | `/api/alerts` | Create new alert (supports reminder_at) |
| GET | `/api/alerts/{alert_id}` | Get alert details (with reminder_info) |
| PUT | `/api/alerts/{alert_id}` | Update alert (supports reminder_at) |
| DELETE | `/api/alerts/{alert_id}` | Delete alert |
| PUT | `/api/alerts/{alert_id}/acknowledge` | Acknowledge alert |
| PUT | `/api/alerts/{alert_id}/resolve` | Resolve alert |
| GET | `/api/alerts/stats` | Get alert statistics |


### Tasks (`/api/tasks`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks (with reminder_info) |
| POST | `/api/tasks` | Create new task (supports reminder_at) |
| GET | `/api/tasks/{task_id}` | Get task details (with reminder_info) |
| PUT | `/api/tasks/{task_id}` | Update task (supports reminder_at) |
| DELETE | `/api/tasks/{task_id}` | Delete task |
| PUT | `/api/tasks/{task_id}/complete` | Mark task as complete |
| GET | `/api/tasks/my/pending` | Get my pending tasks |


### Notifications (`/api/notifications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List all notifications (with reminder_info) |
| POST | `/api/notifications` | Create notification (supports reminder_at) |
| GET | `/api/notifications/{notification_id}` | Get notification details (with reminder_info) |
| PUT | `/api/notifications/{notification_id}` | Update notification (supports reminder_at) |
| DELETE | `/api/notifications/{notification_id}` | Delete notification |
| PUT | `/api/notifications/{notification_id}/read` | Mark notification as read |
| PUT | `/api/notifications/read-all` | Mark all notifications as read |
| GET | `/api/notifications/unread-count` | Get unread notification count |

### Chat (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations` | List all conversations |
| POST | `/api/chat/conversations` | Create new conversation |
| GET | `/api/chat/conversations/{conversation_id}` | Get conversation details |
| PUT | `/api/chat/conversations/{conversation_id}` | Update conversation |
| DELETE | `/api/chat/conversations/{conversation_id}` | Delete conversation |
| GET | `/api/chat/messages` | List messages |
| POST | `/api/chat/messages` | Send new message |
| GET | `/api/chat/messages/{conversation_id}` | Get conversation messages |
| GET | `/api/chat/conversations/{conversation_id}/unread-count` | Get unread message count |

---

## 🔑 Authentication

**Public endpoints (no auth required):**
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/password/forgot`
- POST `/api/auth/password/reset`

**All other endpoints require:**
```
Authorization: Bearer {your_access_token}
```

---

## 📊 HTTP Status Codes

- **200 OK** - Successful GET/PUT/PATCH
- **201 Created** - Successful POST
- **400 Bad Request** - Invalid data
- **401 Unauthorized** - Missing/invalid auth
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Server Error** - Internal error

---

## 🧪 Testing

**Swagger UI:** http://localhost:8093/swagger

**Health Check:** http://localhost:8093/health

**Quick Test:**
```bash
# 1. Login
curl -X POST http://localhost:8093/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# 2. Use token
curl http://localhost:8093/api/user/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Last Updated:** January 28, 2026
