# UC-15: Alerts, Notifications & Reminders

**Category:** Monitoring  
**Actors:** System, Farm Manager, Workers  
**Precondition:** Thresholds configured

---

## Overview

Comprehensive alert system with notifications, reminders, snooze functionality, and assignment tracking.

---

## Alert Features

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ALERT & NOTIFICATION SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                              │   │
│  │   ALERTS                          NOTIFICATIONS                             │   │
│  │   ──────                          ─────────────                             │   │
│  │   • System-generated              • Alert-based                             │   │
│  │   • Threshold triggers            • Task-based                              │   │
│  │   • Auto-detect issues            • User mentions                           │   │
│  │                                   • System announcements                    │   │
│  │                                                                              │   │
│  │   REMINDERS                       ASSIGNMENT                                │   │
│  │   ─────────                       ──────────                                │   │
│  │   • Snooze alerts                 • Assign to user                          │   │
│  │   • Custom remind time            • Track responsibility                    │   │
│  │   • Recurring reminders           • Escalate if needed                      │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Alert Types

| Alert Type | Trigger | Severity | Auto-Assignee |
|------------|---------|----------|---------------|
| high_mortality | > 2% in 24 hours | Critical | Pond Manager |
| low_dissolved_oxygen | < 4 mg/L | Critical | Pond Manager |
| high_ammonia | > 0.5 mg/L | Warning | Pond Manager |
| ph_out_of_range | < 6.5 or > 9.0 | Warning | Pond Manager |
| high_temperature | > 35°C | Warning | Pond Manager |
| scheduled_activity_due | Task due date | Info | Task Assignee |
| scheduled_activity_overdue | Task overdue | Warning | Task Assignee + Reporter |
| withdrawal_period_ending | 3 days before end | Info | Farm Manager |
| harvest_ready | Weight >= market size | Info | Farm Manager |
| abnormal_growth | < 50% expected | Warning | Farm Manager |
| low_feed_stock | Below reorder level | Warning | Inventory Manager |
| equipment_issue | Sensor/device offline | Warning | Maintenance |

---

## Alert Lifecycle with Snooze

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ALERT LIFECYCLE                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                                ┌───────────┐                                        │
│                                │  CREATED  │                                        │
│                                │  (unread) │                                        │
│                                └─────┬─────┘                                        │
│                                      │                                               │
│               ┌──────────────────────┼──────────────────────┐                       │
│               │                      │                      │                       │
│               ▼                      ▼                      ▼                       │
│        ┌───────────┐          ┌───────────┐          ┌───────────┐                 │
│        │   READ    │          │  SNOOZED  │          │  ASSIGNED │                 │
│        │           │          │           │          │           │                 │
│        │  Viewed   │          │ Remind    │          │ Delegated │                 │
│        │  by user  │          │ later     │          │ to user   │                 │
│        └─────┬─────┘          └─────┬─────┘          └─────┬─────┘                 │
│              │                      │                      │                       │
│              │               [After snooze time]           │                       │
│              │                      │                      │                       │
│              │                      ▼                      │                       │
│              │               ┌───────────┐                 │                       │
│              │               │ RE-NOTIFY │─────────────────┤                       │
│              │               │           │                 │                       │
│              │               │ unread    │                 │                       │
│              │               │ again     │                 │                       │
│              │               └─────┬─────┘                 │                       │
│              │                     │                       │                       │
│              └─────────────────────┼───────────────────────┘                       │
│                                    │                                                │
│                                    ▼                                                │
│                             ┌───────────┐                                          │
│                             │ RESOLVED  │                                          │
│                             │           │                                          │
│                             │ Issue     │                                          │
│                             │ addressed │                                          │
│                             └───────────┘                                          │
│                                                                                      │
│  STATUS: unread → read → snoozed → unread → resolved                               │
│          unread → assigned → in_progress → resolved                                │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Snooze / Remind Later

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           SNOOZE / REMIND LATER                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                              │   │
│  │   🔔 ALERT: Low DO in Pond A1 (4.2 mg/L)                         2 min ago │   │
│  │                                                                              │   │
│  │   Dissolved oxygen has dropped below threshold.                             │   │
│  │   Recommended: Turn on aerators immediately.                                │   │
│  │                                                                              │   │
│  │   ┌─────────────────────────────────────────────────────────────────────┐  │   │
│  │   │                                                                      │  │   │
│  │   │  [👁️ View]  [✓ Acknowledge]  [👤 Assign]  [⏰ Remind Later ▼]      │  │   │
│  │   │                                                                      │  │   │
│  │   │             ┌──────────────────────────────┐                        │  │   │
│  │   │             │                              │                        │  │   │
│  │   │             │  ⏰ In 15 minutes            │                        │  │   │
│  │   │             │  ⏰ In 30 minutes            │                        │  │   │
│  │   │             │  ⏰ In 1 hour                │                        │  │   │
│  │   │             │  ⏰ In 2 hours               │                        │  │   │
│  │   │             │  ⏰ In 4 hours               │                        │  │   │
│  │   │             │  ⏰ Tomorrow morning (9 AM)  │                        │  │   │
│  │   │             │  ⏰ Tomorrow evening (6 PM)  │                        │  │   │
│  │   │             │  ─────────────────────────── │                        │  │   │
│  │   │             │  📅 Custom date & time...    │                        │  │   │
│  │   │             │                              │                        │  │   │
│  │   │             └──────────────────────────────┘                        │  │   │
│  │   │                                                                      │  │   │
│  │   └─────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  SNOOZE OPTIONS:                                                                    │
│                                                                                      │
│  | Option             | Duration      | Use Case                    |               │
│  |--------------------|---------------|-----------------------------│               │
│  | 15_minutes         | +15 min       | Quick break                 |               │
│  | 30_minutes         | +30 min       | Short delay                 |               │
│  | 1_hour             | +1 hour       | Busy with other task        |               │
│  | 2_hours            | +2 hours      | Will address after lunch    |               │
│  | 4_hours            | +4 hours      | Later in the day            |               │
│  | tomorrow_morning   | Next 9:00 AM  | Will handle tomorrow        |               │
│  | tomorrow_evening   | Next 6:00 PM  | End of day tomorrow         |               │
│  | custom             | User picks    | Specific time needed        |               │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Alert Assignment

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ALERT ASSIGNMENT                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  User clicks "Assign" on alert:                                                     │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                              │   │
│  │   Assign Alert To:                                                          │   │
│  │                                                                              │   │
│  │   ┌─────────────────────────────────────────────────────────────────────┐  │   │
│  │   │  🔍 Search team members...                                          │  │   │
│  │   └─────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                              │   │
│  │   Recent / Suggested:                                                       │   │
│  │   ┌─────────────────────────────────────────────────────────────────────┐  │   │
│  │   │  👤 Suresh (Pond Worker)      - Usually handles Pond A1             │  │   │
│  │   │  👤 Ramesh (Manager)          - Your supervisor                     │  │   │
│  │   │  👤 Kumar (Maintenance)       - Equipment specialist                │  │   │
│  │   └─────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                              │   │
│  │   Message (optional):                                                       │   │
│  │   ┌─────────────────────────────────────────────────────────────────────┐  │   │
│  │   │  Please check the aerator, seems to be underperforming              │  │   │
│  │   └─────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                              │   │
│  │   Priority: [● High] [○ Medium] [○ Low]                                   │   │
│  │                                                                              │   │
│  │   Due by: [Today 5:00 PM ▼]                                               │   │
│  │                                                                              │   │
│  │   [Cancel]                                              [Assign & Notify]  │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ASSIGNMENT CREATES:                                                                │
│  • Task linked to alert                                                             │
│  • Notification to assignee                                                         │
│  • Alert status = "assigned"                                                        │
│  • Tracks who assigned (reporter) and who is responsible (assignee)                 │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Alert Schema

```json
{
  "alert_id": "string (12-digit)",
  "account_key": "string",
  
  "alert_type": "string",
  "severity": "enum: critical | warning | info",
  "title": "string",
  "message": "string",
  
  "trigger": {
    "entity_type": "string (pond, stock, farm, device)",
    "entity_id": "string",
    "entity_name": "string",
    "parameter": "string (dissolved_oxygen, ammonia, etc.)",
    "threshold": "number",
    "actual_value": "number",
    "comparison": "enum: above | below | equals"
  },
  
  "status": "enum: unread | read | snoozed | assigned | in_progress | resolved | dismissed",
  "is_read": "boolean",
  
  "assignment": {
    "assigned_to": "string (user_key) | null",
    "assigned_to_name": "string | null",
    "assigned_by": "string (user_key) | null",
    "assigned_by_name": "string | null",
    "assigned_at": "datetime | null",
    "assignment_message": "string | null",
    "priority": "enum: critical | high | medium | low",
    "due_date": "datetime | null",
    "linked_task_id": "string | null"
  },
  
  "snooze": {
    "is_snoozed": "boolean",
    "snoozed_by": "string | null",
    "snoozed_at": "datetime | null",
    "remind_at": "datetime | null",
    "snooze_count": "number",
    "snooze_history": [
      {
        "snoozed_at": "datetime",
        "remind_at": "datetime",
        "snoozed_by": "string"
      }
    ]
  },
  
  "resolution": {
    "resolved": "boolean",
    "resolved_at": "datetime | null",
    "resolved_by": "string | null",
    "resolution_notes": "string | null",
    "auto_resolved": "boolean"
  },
  
  "notifications_sent": [
    {
      "channel": "enum: push | email | sms | websocket",
      "sent_at": "datetime",
      "sent_to": "string"
    }
  ],
  
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## API: Snooze Alert

```http
POST /api/alerts/{alert_id}/snooze
Content-Type: application/json

{
  "snooze_option": "1_hour"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alert_id": "123456789012",
    "status": "snoozed",
    "remind_at": "2026-01-25T11:30:00Z",
    "snooze_count": 1
  }
}
```

---

## API: Custom Snooze

```http
POST /api/alerts/{alert_id}/snooze
Content-Type: application/json

{
  "snooze_option": "custom",
  "remind_at": "2026-01-25T14:00:00Z"
}
```

---

## API: Assign Alert

```http
POST /api/alerts/{alert_id}/assign
Content-Type: application/json

{
  "assign_to": "938475610293",
  "message": "Please check the aerator and report back",
  "priority": "high",
  "due_date": "2026-01-25T17:00:00Z",
  "create_task": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alert_id": "123456789012",
    "status": "assigned",
    "assignment": {
      "assigned_to": "938475610293",
      "assigned_to_name": "Suresh Kumar"
    },
    "linked_task_id": "987654321098"
  }
}
```

---

## API: Resolve Alert

```http
POST /api/alerts/{alert_id}/resolve
Content-Type: application/json

{
  "resolution_notes": "Aerator fixed, DO levels recovering"
}
```

---

## API Endpoints

```http
# Alerts
GET    /api/alerts                       # List all alerts
GET    /api/alerts/unread                # Unread alerts only
GET    /api/alerts/unread/count          # Badge count
GET    /api/alerts/{id}                  # Get alert details

# Alert Actions
PUT    /api/alerts/{id}/read             # Mark as read
POST   /api/alerts/{id}/snooze           # Snooze/remind later
POST   /api/alerts/{id}/assign           # Assign to user
POST   /api/alerts/{id}/resolve          # Resolve alert
POST   /api/alerts/{id}/dismiss          # Dismiss without resolving

# My Alerts
GET    /api/alerts/assigned-to-me        # Alerts assigned to me
GET    /api/alerts/created-by-me         # Alerts I created tasks from

# Configuration
GET    /api/alerts/thresholds            # List thresholds
PUT    /api/alerts/thresholds/{type}     # Update threshold
```

---

## Background Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `process_snoozed_alerts` | Every 1 min | Re-notify snoozed alerts |
| `check_alert_thresholds` | Every 5 min | Check all thresholds |
| `escalate_overdue_alerts` | Every 15 min | Escalate unhandled critical alerts |
| `auto_resolve_alerts` | Every 30 min | Resolve alerts where condition cleared |

---

## Notification Channels

| Channel | Use Case | Delivery |
|---------|----------|----------|
| WebSocket | Real-time in-app | Immediate |
| Push | Mobile app | Immediate |
| Email | Non-urgent, records | Batched or immediate |
| SMS | Critical only | Immediate |

---

## Collections Affected

| Collection | Action | Details |
|------------|--------|---------|
| alerts | INSERT/UPDATE | Alert records |
| tasks | INSERT | When assigned with task |
| notifications | INSERT | Each notification sent |
| activity_logs | INSERT | All actions logged |

---

## Acceptance Criteria

- [ ] Alerts generated on threshold breach
- [ ] Snooze with preset options works
- [ ] Custom snooze time works
- [ ] Snoozed alerts re-notify at remind_at
- [ ] Snooze count tracked
- [ ] Alerts can be assigned to users
- [ ] Assignment creates linked task
- [ ] Assigned user notified
- [ ] Resolution notes captured
- [ ] Critical alerts escalate if unhandled
