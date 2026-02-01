# UC-13: Task Scheduling & Management

**Category:** Planning  
**Actors:** Farm Manager, Workers  
**Precondition:** Farm/Pond exists

---

## Overview

Full task management system with scheduling, assignments, reminders, and Jira-like workflow.

---

## Task Management Features

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           TASK MANAGEMENT SYSTEM                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                              TASK/SCHEDULE                                    │   │
│  │                                                                               │   │
│  │  ┌───────────────────────────────────────────────────────────────────────┐  │   │
│  │  │                                                                        │  │   │
│  │  │  ASSIGNMENT                    WORKFLOW                   REMINDERS   │  │   │
│  │  │  ──────────                    ────────                   ─────────   │  │   │
│  │  │                                                                        │  │   │
│  │  │  • Reporter (creator)          • Status tracking          • Snooze    │  │   │
│  │  │  • Assignee (worker)           • Transitions              • 30 min    │  │   │
│  │  │  • Watchers (observers)        • Comments                 • 1 hour    │  │   │
│  │  │  • Priority                    • History                  • Custom    │  │   │
│  │  │                                • Due dates                            │  │   │
│  │  │                                                                        │  │   │
│  │  └───────────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                               │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Task Types

| Type | Category | Examples |
|------|----------|----------|
| `scheduled_task` | Recurring | Water quality test, feeding |
| `one_time_task` | Ad-hoc | Equipment repair, net fix |
| `alert_task` | From alert | Low DO response |
| `follow_up_task` | From another task | Treatment follow-up |

---

## Task Workflow (Jira-like)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           TASK STATUS WORKFLOW                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                                ┌──────────┐                                         │
│                     ┌──────────│   TODO   │──────────┐                             │
│                     │          │          │          │                             │
│                     │          └────┬─────┘          │                             │
│                     │               │ Start          │                             │
│                     │               ▼                │                             │
│                     │          ┌──────────┐          │                             │
│           Blocked   │          │   IN     │          │ Cancel                      │
│                     │◄─────────│ PROGRESS │──────────┤                             │
│                     │          └────┬─────┘          │                             │
│                     │               │ Complete       │                             │
│                     │               ▼                │                             │
│                     │          ┌──────────┐          │                             │
│                     │          │  REVIEW  │          │ (Optional)                  │
│                     │          └────┬─────┘          │                             │
│                     │               │ Approve        │                             │
│                     │               ▼                ▼                             │
│                     │          ┌──────────┐    ┌──────────┐                        │
│                     └─────────►│   DONE   │    │ CANCELLED│                        │
│                                │          │    │          │                        │
│                                └──────────┘    └──────────┘                        │
│                                                                                      │
│  ───────────────────────────────────────────────────────────────────────────────    │
│                                                                                      │
│  STATUS CODES:                                                                      │
│  todo, in_progress, blocked, review, done, cancelled                               │
│                                                                                      │
│  TRANSITIONS:                                                                       │
│  todo → in_progress (Start Work)                                                   │
│  in_progress → blocked (Block)                                                     │
│  in_progress → review (Submit for Review)                                          │
│  in_progress → done (Complete)                                                     │
│  blocked → in_progress (Unblock)                                                   │
│  review → done (Approve)                                                           │
│  review → in_progress (Reject/Request Changes)                                     │
│  any → cancelled (Cancel)                                                          │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Assignment Model

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           TASK ASSIGNMENT MODEL                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                │  │
│  │   REPORTER                          ASSIGNEE                                  │  │
│  │   ────────                          ────────                                  │  │
│  │   • Who created the task            • Who is responsible                      │  │
│  │   • Can edit, cancel                • Can update status                       │  │
│  │   • Gets notified on completion     • Gets reminders                         │  │
│  │                                                                                │  │
│  │   WATCHERS                          APPROVER (optional)                       │  │
│  │   ────────                          ────────                                  │  │
│  │   • Get notifications               • Reviews completed work                  │  │
│  │   • Read-only access                • Can approve/reject                      │  │
│  │   • Can comment                     • Usually manager/supervisor              │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  Example:                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Task: "Check aerator in Pond A1"                                            │   │
│  │                                                                               │   │
│  │  Reporter:  Manager Ramesh (created the task)                                │   │
│  │  Assignee:  Worker Suresh (will do the work)                                 │   │
│  │  Watchers:  [Owner Kumar, Supervisor Mohan]                                  │   │
│  │  Approver:  Manager Ramesh (verifies completion)                             │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Reminder System

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           REMINDER / SNOOZE SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  When user receives alert/notification:                                             │
│                                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                              │   │
│  │   🔔 Alert: Low DO in Pond A1 (4.2 mg/L)                                    │   │
│  │                                                                              │   │
│  │   [View] [Acknowledge] [Remind Later ▼]                                     │   │
│  │                                                                              │   │
│  │   ┌─────────────────────────────┐                                           │   │
│  │   │  Remind Later Options:      │                                           │   │
│  │   │                             │                                           │   │
│  │   │  ⏰ In 15 minutes           │                                           │   │
│  │   │  ⏰ In 30 minutes           │                                           │   │
│  │   │  ⏰ In 1 hour               │                                           │   │
│  │   │  ⏰ In 2 hours              │                                           │   │
│  │   │  ⏰ Tomorrow morning (9 AM) │                                           │   │
│  │   │  ⏰ Custom time...          │                                           │   │
│  │   │                             │                                           │   │
│  │   └─────────────────────────────┘                                           │   │
│  │                                                                              │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                      │
│  ───────────────────────────────────────────────────────────────────────────────    │
│                                                                                      │
│  REMINDER FLOW:                                                                     │
│                                                                                      │
│  User clicks "Remind in 30 min"                                                    │
│       │                                                                              │
│       ▼                                                                              │
│  Alert status = "snoozed"                                                          │
│  remind_at = now + 30 minutes                                                       │
│       │                                                                              │
│       ▼                                                                              │
│  [After 30 minutes - Background job]                                               │
│       │                                                                              │
│       ▼                                                                              │
│  Re-send notification to user                                                       │
│  Alert status = "unread"                                                           │
│  snooze_count += 1                                                                 │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## API: Create Task

```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Check aerator in Pond A1",
  "description": "Aerator making unusual noise, needs inspection",
  "task_type": "one_time_task",
  "priority": "high",
  "due_date": "2026-01-25",
  "due_time": "10:00",
  
  "assignment": {
    "reporter_key": "847293651047",
    "assignee_key": "938475610293",
    "watcher_keys": ["293847561029", "847261930475"],
    "approver_key": "847293651047"
  },
  
  "context": {
    "pond_id": "222222222222",
    "farm_id": "111111111111"
  },
  
  "requires_approval": true,
  
  "reminder_settings": {
    "remind_before_minutes": [60, 15],
    "escalate_if_overdue": true,
    "escalate_to_key": "847293651047"
  }
}
```

---

## API: Snooze/Remind Later

```http
POST /api/tasks/{task_id}/snooze
Content-Type: application/json

{
  "snooze_option": "30_minutes"
}
```

OR with custom time:

```http
POST /api/tasks/{task_id}/snooze
Content-Type: application/json

{
  "snooze_option": "custom",
  "remind_at": "2026-01-25T14:30:00Z"
}
```

**Snooze Options:**
- `15_minutes`
- `30_minutes`
- `1_hour`
- `2_hours`
- `tomorrow_morning` (9 AM next day)
- `custom` (requires `remind_at`)

---

## API: Transition Status

```http
POST /api/tasks/{task_id}/transition
Content-Type: application/json

{
  "to_status": "in_progress",
  "comment": "Starting work on this now"
}
```

---

## API: Add Comment

```http
POST /api/tasks/{task_id}/comments
Content-Type: application/json

{
  "text": "Found the issue - motor bearing needs replacement",
  "attachments": ["attachment_id_1"]
}
```

---

## Task Schema

```json
{
  "task_id": "string (12-digit)",
  "account_key": "string",
  
  "title": "string",
  "description": "string",
  "task_type": "enum: scheduled_task | one_time_task | alert_task | follow_up_task",
  
  "status": "enum: todo | in_progress | blocked | review | done | cancelled",
  "priority": "enum: critical | high | medium | low",
  
  "assignment": {
    "reporter_key": "string (who created)",
    "assignee_key": "string (who does the work)",
    "watcher_keys": ["string (observers)"],
    "approver_key": "string | null"
  },
  
  "dates": {
    "due_date": "datetime",
    "start_date": "datetime | null",
    "completed_at": "datetime | null",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  
  "scheduling": {
    "is_recurring": "boolean",
    "frequency": "enum: once | daily | weekly | bi_weekly | monthly | custom",
    "frequency_days": "number | null",
    "next_due": "datetime | null"
  },
  
  "reminder": {
    "is_snoozed": "boolean",
    "remind_at": "datetime | null",
    "snooze_count": "number",
    "last_snoozed_at": "datetime | null",
    "remind_before_minutes": "[number]"
  },
  
  "context": {
    "entity_type": "string | null (pond, stock, farm)",
    "entity_id": "string | null",
    "pond_id": "string | null",
    "farm_id": "string | null",
    "source_alert_id": "string | null",
    "parent_task_id": "string | null"
  },
  
  "workflow": {
    "requires_approval": "boolean",
    "approved_by": "string | null",
    "approved_at": "datetime | null",
    "rejection_reason": "string | null"
  },
  
  "escalation": {
    "escalate_if_overdue": "boolean",
    "escalate_to_key": "string | null",
    "escalated": "boolean",
    "escalated_at": "datetime | null"
  },
  
  "comments": [
    {
      "comment_id": "string",
      "user_key": "string",
      "user_name": "string",
      "text": "string",
      "attachments": ["string"],
      "created_at": "datetime"
    }
  ],
  
  "history": [
    {
      "action": "string (created, status_changed, assigned, commented)",
      "from_value": "string | null",
      "to_value": "string | null",
      "user_key": "string",
      "timestamp": "datetime"
    }
  ]
}
```

---

## Notification Triggers

| Event | Notify |
|-------|--------|
| Task created | Assignee, Watchers |
| Task assigned/reassigned | New Assignee |
| Status changed | Reporter, Watchers |
| Comment added | Reporter, Assignee, Watchers |
| Due date approaching | Assignee |
| Task overdue | Assignee, Reporter |
| Escalated | Escalation target |
| Approved/Rejected | Assignee |
| Reminder (snoozed) | User who snoozed |

---

## API Endpoints Summary

```http
# Tasks CRUD
POST   /api/tasks                        # Create task
GET    /api/tasks                        # List tasks (with filters)
GET    /api/tasks/{id}                   # Get task details
PUT    /api/tasks/{id}                   # Update task
DELETE /api/tasks/{id}                   # Delete task

# Task Actions
POST   /api/tasks/{id}/transition        # Change status
POST   /api/tasks/{id}/assign            # Assign/reassign
POST   /api/tasks/{id}/snooze            # Snooze/remind later
POST   /api/tasks/{id}/comments          # Add comment
POST   /api/tasks/{id}/watch             # Add watcher
DELETE /api/tasks/{id}/watch             # Remove watcher

# My Tasks
GET    /api/tasks/assigned-to-me         # Tasks assigned to current user
GET    /api/tasks/reported-by-me         # Tasks I created
GET    /api/tasks/watching               # Tasks I'm watching

# Filters
GET    /api/tasks?status=todo,in_progress
GET    /api/tasks?assignee={user_key}
GET    /api/tasks?priority=critical,high
GET    /api/tasks?due_before=2026-01-30
GET    /api/tasks?pond_id={pond_id}
```

---

## Collections Affected

| Collection | Action | Details |
|------------|--------|---------|
| tasks | INSERT/UPDATE | Task records |
| activity_logs | INSERT | All actions logged |
| notifications | INSERT | On events |

---

## Acceptance Criteria

- [ ] Tasks can be created with assignment
- [ ] Reporter, assignee, watchers work correctly
- [ ] Status workflow with transitions
- [ ] Snooze/remind later works
- [ ] Comments with history
- [ ] Recurring tasks auto-generate
- [ ] Overdue escalation works
- [ ] Approval workflow functional
