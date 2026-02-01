# WebSocket API Reference

**WebSocket URL:** `ws://localhost:8093/socket.io/`

**Transport:** `websocket` (Socket.IO v4)

**Authentication:** Pass JWT token as query parameter: `?token=YOUR_JWT_TOKEN`

---

## 🔌 Connection

### Connect
```javascript
const socket = io('http://localhost:8093', {
    query: { token: 'YOUR_JWT_TOKEN' },
    transports: ['websocket']
});
```

### Connection Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Server → Client | Connection established |
| `disconnect` | Server → Client | Connection closed |
| `error` | Server → Client | Error occurred |

**Response: `connect`**
```javascript
// Automatic - socket.id available
socket.on('connect', () => {
    console.log('Connected:', socket.id);
});
```

**Response: `error`**
```javascript
{
    "message": "Error description"
}
```

---

## 📢 Alerts WebSocket APIs

### Subscribe to Alerts

**Event:** `subscribe_alerts`

**Request:**
```javascript
socket.emit('subscribe_alerts', {});
```

**Response:** `subscribed`
```javascript
{
    "type": "alerts",
    "account_key": "503233758658"
}
```

### Create Alert

**Event:** `create_alert`

**Request:**
```javascript
socket.emit('create_alert', {
    "title": "High temperature alert",
    "message": "Pond 1 temperature is 32°C",
    "severity": "critical",
    "category": "water_quality"
});
```

**Response:** `alert_created`
```javascript
{
    "alert_id": "260131120000",
    "account_key": "503233758658",
    "title": "High temperature alert",
    "message": "Pond 1 temperature is 32°C",
    "severity": "critical",
    "category": "water_quality",
    "status": "active",
    "created_at": "2026-01-31T12:00:00.000000+00:00",
    "reminder_at": null,
    "reminder_count": 0
}
```

### Acknowledge Alert

**Event:** `acknowledge_alert`

**Request:**
```javascript
socket.emit('acknowledge_alert', {
    "alert_id": "260131120000"
});
```

**Response:** `alert_acknowledged`
```javascript
{
    "alert_id": "260131120000",
    "acknowledged_by": "503233930999"
}
```

### Resolve Alert

**Event:** `resolve_alert`

**Request:**
```javascript
socket.emit('resolve_alert', {
    "alert_id": "260131120000"
});
```

**Response:** `alert_resolved`
```javascript
{
    "alert_id": "260131120000",
    "resolved_by": "503233930999"
}
```

### Delete Alert

**Event:** `delete_alert`

**Request:**
```javascript
socket.emit('delete_alert', {
    "alert_id": "260131120000"
});
```

**Response:** `alert_deleted`
```javascript
{
    "alert_id": "260131120000"
}
```

---

## 📬 Notifications WebSocket APIs

### Subscribe to Notifications

**Event:** `subscribe_notifications`

**Request:**
```javascript
socket.emit('subscribe_notifications', {});
```

**Response:** `subscribed`
```javascript
{
    "type": "notifications",
    "user_key": "503233930999"
}
```

### Send Notification

**Event:** `send_notification`

**Request:**
```javascript
socket.emit('send_notification', {
    "title": "New task assigned",
    "message": "You have been assigned to feed pond 1",
    "type": "task",
    "priority": "high"
});
```

**Response:** `notification`
```javascript
{
    "notification_id": "260131120100",
    "account_key": "503233758658",
    "user_key": "503233930999",
    "title": "New task assigned",
    "message": "You have been assigned to feed pond 1",
    "notification_type": "task",
    "priority": "high",
    "is_read": false,
    "created_at": "2026-01-31T12:01:00.000000+00:00",
    "reminder_at": null
}
```

### Mark Notification as Read

**Event:** `mark_notification_read`

**Request:**
```javascript
socket.emit('mark_notification_read', {
    "notification_id": "260131120100"
});
```

**Response:** `notification_read`
```javascript
{
    "notification_id": "260131120100"
}
```

### Mark All Notifications as Read

**Event:** `mark_all_notifications_read`

**Request:**
```javascript
socket.emit('mark_all_notifications_read', {});
```

**Response:** `all_notifications_read`
```javascript
{
    "count": 5
}
```

### Delete Notification

**Event:** `delete_notification`

**Request:**
```javascript
socket.emit('delete_notification', {
    "notification_id": "260131120100"
});
```

**Response:** `notification_deleted`
```javascript
{
    "notification_id": "260131120100"
}
```

---

## ✅ Tasks WebSocket APIs

### Subscribe to Tasks

**Event:** `subscribe_tasks`

**Request:**
```javascript
socket.emit('subscribe_tasks', {});
```

**Response:** `subscribed`
```javascript
{
    "type": "tasks",
    "account_key": "503233758658"
}
```

### Create Task

**Event:** `create_task`

**Request:**
```javascript
socket.emit('create_task', {
    "title": "Feed pond 1",
    "description": "Morning feed - 5kg pellets",
    "priority": "high",
    "assigned_to": "503233930999",
    "due_date": "2026-02-01"
});
```

**Response:** `task_created`
```javascript
{
    "task_id": "260131120200",
    "account_key": "503233758658",
    "title": "Feed pond 1",
    "description": "Morning feed - 5kg pellets",
    "priority": "high",
    "status": "pending",
    "assigned_to": "503233930999",
    "due_date": "2026-02-01",
    "created_at": "2026-01-31T12:02:00.000000+00:00",
    "reminder_at": null
}
```

### Update Task

**Event:** `update_task`

**Request:**
```javascript
socket.emit('update_task', {
    "task_id": "260131120200",
    "status": "in_progress",
    "priority": "urgent"
});
```

**Response:** `task_updated`
```javascript
{
    "task_id": "260131120200",
    "status": "in_progress",
    "priority": "urgent"
}
```

### Complete Task

**Event:** `complete_task`

**Request:**
```javascript
socket.emit('complete_task', {
    "task_id": "260131120200"
});
```

**Response:** `task_completed`
```javascript
{
    "task_id": "260131120200",
    "completed_by": "503233930999",
    "completed_at": "2026-01-31T12:05:00.000000+00:00"
}
```

### Delete Task

**Event:** `delete_task`

**Request:**
```javascript
socket.emit('delete_task', {
    "task_id": "260131120200"
});
```

**Response:** `task_deleted`
```javascript
{
    "task_id": "260131120200"
}
```

---

## 💬 Chat WebSocket APIs

### Subscribe to Chat

**Event:** `subscribe_chat`

**Request:**
```javascript
socket.emit('subscribe_chat', {});
```

**Response:** `subscribed`
```javascript
{
    "type": "chat",
    "user_key": "503233930999"
}
```

### Send Message

**Event:** `send_message`

**Request:**
```javascript
socket.emit('send_message', {
    "conversation_id": "260131015857",
    "content": "Hello, how are you?",
    "type": "text"
});
```

**Response:** `message`
```javascript
{
    "message_id": "260131120300",
    "conversation_id": "260131015857",
    "sender_key": "503233930999",
    "content": "Hello, how are you?",
    "type": "text",
    "created_at": "2026-01-31T12:03:00.000000+00:00",
    "is_read": false,
    "is_deleted": false
}
```

### Mark Message as Read

**Event:** `mark_message_read`

**Request:**
```javascript
socket.emit('mark_message_read', {
    "message_id": "260131120300"
});
```

**Response:** `message_read`
```javascript
{
    "message_id": "260131120300",
    "conversation_id": "260131015857"
}
```

### Delete Message

**Event:** `delete_message`

**Request:**
```javascript
socket.emit('delete_message', {
    "message_id": "260131120300",
    "delete_for": "me"  // or "all"
});
```

**Response:** `message_deleted`
```javascript
{
    "message_id": "260131120300",
    "deleted_for": "me"
}
```

### Typing Indicator

**Event:** `typing`

**Request:**
```javascript
socket.emit('typing', {
    "conversation_id": "260131015857",
    "is_typing": true
});
```

**Response:** `user_typing`
```javascript
{
    "conversation_id": "260131015857",
    "user_key": "503233930999",
    "name": "Yash",
    "is_typing": true
}
```

### Create Conversation

**Event:** `create_conversation`

**Request:**
```javascript
socket.emit('create_conversation', {
    "participant_keys": ["503233930999", "503244567890"],
    "name": "Project Discussion"  // Optional
});
```

**Response:** `conversation_created`
```javascript
{
    "conversation_id": "260131120400",
    "participants": ["503233930999", "503244567890"],
    "name": "Project Discussion",
    "created_at": "2026-01-31T12:04:00.000000+00:00"
}
```

---

## 📊 Real-time Events

### Broadcasting

All WebSocket events are broadcast to relevant rooms:

**Alerts:**
- Room: `alerts_{account_key}` - All users in the same account
- Room: `alerts` - Global alerts room

**Notifications:**
- Room: `notifications_{user_key}` - Specific user only

**Tasks:**
- Room: `tasks_{account_key}` - All users in the same account
- Room: `tasks_{assigned_to}` - Assigned user

**Chat:**
- Room: `conversation_{conversation_id}` - All participants in conversation

---

## ⚠️ Error Handling

**All errors are sent via `error` event:**

```javascript
socket.on('error', (data) => {
    console.error('WebSocket Error:', data.message);
});
```

**Error Response Format:**
```javascript
{
    "message": "Error description"
}
```

**Common Errors:**
- `"Not authenticated"` - Invalid or missing token
- `"Missing {field}"` - Required field not provided
- `"{Service} not available"` - Service initialization issue
- `"{Entity} not found"` - Requested entity doesn't exist

---

## 🔄 Auto-Sync Example

**Complete workflow for real-time alerts:**

```javascript
// 1. Connect
const socket = io('http://localhost:8093', {
    query: { token: myToken },
    transports: ['websocket']
});

// 2. Subscribe to alerts
socket.on('connect', () => {
    socket.emit('subscribe_alerts', {});
});

// 3. Listen for new alerts
socket.on('alert_created', (alert) => {
    console.log('New alert:', alert);
    // Update UI automatically
    updateAlertsUI(alert);
});

// 4. Listen for alert updates
socket.on('alert_acknowledged', (data) => {
    console.log('Alert acknowledged:', data.alert_id);
    // Update UI automatically
});

socket.on('alert_resolved', (data) => {
    console.log('Alert resolved:', data.alert_id);
    // Update UI automatically
});

// 5. Create alert (all subscribed clients will receive it)
socket.emit('create_alert', {
    title: 'Temperature Alert',
    message: 'High temperature detected',
    severity: 'critical'
});
```

---

## 📝 Notes

- All timestamps are in UTC ISO format
- All IDs are 12-digit strings (format: YYMMDDHHmmSS)
- User must be authenticated with valid JWT token
- Events are broadcast to all relevant subscribers automatically
- Connection automatically handles reconnection on disconnect
- Use `socket.connected` to check connection status

---

## 🚀 Quick Start

```javascript
// Initialize connection
const socket = io('http://localhost:8093', {
    query: { token: localStorage.getItem('access_token') },
    transports: ['websocket']
});

// Setup event listeners
socket.on('connect', () => {
    console.log('✅ Connected');
    socket.emit('subscribe_alerts', {});
    socket.emit('subscribe_notifications', {});
    socket.emit('subscribe_tasks', {});
    socket.emit('subscribe_chat', {});
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected');
});

socket.on('error', (err) => {
    console.error('Error:', err.message);
});

// Listen to real-time updates
socket.on('alert_created', (data) => console.log('Alert:', data));
socket.on('notification', (data) => console.log('Notification:', data));
socket.on('task_created', (data) => console.log('Task:', data));
socket.on('message', (data) => console.log('Message:', data));
```
