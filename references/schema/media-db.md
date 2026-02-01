# Media Database Schema (media_db)

Database for real-time messaging, chat, notifications, alerts, and media management for the **Task-Circuit Platform**.

> **Note:** This is a **generic, domain-agnostic** database used by all Task-Circuit modules (grow_fin_server, grow_agri_server, grow_poultry_server, etc.)

---

## Important: Domain Alerts vs Platform Notifications

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│              DOMAIN ALERTS vs PLATFORM NOTIFICATIONS & ALERTS                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  OPTION 1: Domain-specific (Current - fish_db.alerts)                               │
│  ─────────────────────────────────────────────────────                               │
│  Each domain module stores its own alerts:                                          │
│  • fish_db.alerts     - Water quality, mortality, harvest                           │
│  • agri_db.alerts     - Soil, irrigation, pest                                      │
│  • poultry_db.alerts  - Temperature, feed, disease                                  │
│                                                                                      │
│  OPTION 2: Centralized (Recommended - media_db.alerts) ✅                           │
│  ─────────────────────────────────────────────────────                               │
│  All alerts in one place with domain context:                                       │
│  • media_db.alerts    - Generic alert system                                        │
│    └── domain: "fish" | "agri" | "poultry" | "dairy"                               │
│    └── source_db: "fish_db" | "agri_db" | etc.                                     │
│    └── entity_type: "pond" | "crop" | "shed" | etc.                                │
│                                                                                      │
│  FLOW (Centralized):                                                                │
│  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐                │
│  │  Domain Event  │  →   │  Alert Created │  →   │  Notification  │                │
│  │  (fish_db)     │      │  (media_db)    │      │  Sent          │                │
│  │                │      │                │      │                │                │
│  │  Low DO in     │      │  domain: fish  │      │  Push/Email/   │                │
│  │  Pond A1       │      │  type: low_do  │      │  SMS           │                │
│  └────────────────┘      └────────────────┘      └────────────────┘                │
│                                                                                      │
│  alerts       = WHAT happened (generic alert with domain context)                   │
│  notifications = HOW to notify users (delivery mechanism)                           │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              media_db PURPOSE                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. MESSAGING                                                                       │
│     • Direct messages (1:1)                                                         │
│     • Group chats                                                                   │
│     • Broadcast channels                                                            │
│     • Message history                                                               │
│                                                                                      │
│  2. CONVERSATIONS                                                                   │
│     • Conversation threads                                                          │
│     • Read receipts                                                                 │
│     • Typing indicators                                                             │
│     • Last seen                                                                     │
│                                                                                      │
│  3. MEDIA & FILES                                                                   │
│     • Image/video/audio storage                                                     │
│     • File attachments                                                              │
│     • Thumbnails                                                                    │
│                                                                                      │
│  4. NOTIFICATIONS                                                                   │
│     • Push notifications                                                            │
│     • In-app notifications                                                          │
│     • Notification preferences                                                      │
│                                                                                      │
│  5. PRESENCE & STATUS                                                               │
│     • Online/offline status                                                         │
│     • Custom status messages                                                        │
│     • Story/status updates                                                          │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              media_db ERD                                            │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                         ┌─────────────────┐                                         │
│                         │  CHAT_USERS     │                                         │
│                         │  (User settings)│                                         │
│                         └────────┬────────┘                                         │
│                                  │                                                   │
│            ┌─────────────────────┼─────────────────────┐                           │
│            │                     │                     │                           │
│            ▼                     ▼                     ▼                           │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐                 │
│   │ CONVERSATIONS   │   │    GROUPS       │   │   USER_STATUS   │                 │
│   │ (1:1 and group) │   │ (Group details) │   │ (Online/away)   │                 │
│   └────────┬────────┘   └────────┬────────┘   └─────────────────┘                 │
│            │                     │                                                  │
│            │      ┌──────────────┘                                                  │
│            │      │                                                                 │
│            ▼      ▼                                                                 │
│   ┌─────────────────┐                                                              │
│   │    MESSAGES     │◄─────────┐                                                   │
│   │ (Chat messages) │          │                                                   │
│   └────────┬────────┘          │                                                   │
│            │                   │                                                   │
│   ┌────────┴────────┐         │                                                   │
│   │                 │         │                                                   │
│   ▼                 ▼         │                                                   │
│ ┌───────────┐  ┌───────────┐  │  ┌─────────────────┐                             │
│ │  MEDIA    │  │ REACTIONS │  │  │  NOTIFICATIONS  │                             │
│ │ (Files)   │  │ (Emojis)  │  │  │  (Push/In-app)  │                             │
│ └───────────┘  └───────────┘  │  └─────────────────┘                             │
│                               │                                                   │
│                    ┌──────────┴──────────┐                                        │
│                    │                     │                                        │
│                    ▼                     ▼                                        │
│           ┌─────────────────┐   ┌─────────────────┐                              │
│           │ MESSAGE_STATUS  │   │   READ_RECEIPTS │                              │
│           │ (Delivery/Read) │   │   (Per user)    │                              │
│           └─────────────────┘   └─────────────────┘                              │
│                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Collection: chat_users

User-specific chat settings and preferences (extends user_db.users).

```json
{
  "_id": "ObjectId",
  "user_key": "string (12-digit) - PRIMARY KEY (from user_db)",
  "account_key": "string - REQUIRED",
  
  "profile": {
    "display_name": "string",
    "avatar_url": "string | null",
    "about": "string (status message, max 500 chars)",
    "phone": "string | null (for contact discovery)"
  },
  
  "privacy": {
    "last_seen": "enum: everyone | contacts | nobody",
    "profile_photo": "enum: everyone | contacts | nobody",
    "about": "enum: everyone | contacts | nobody",
    "read_receipts": "boolean (default: true)",
    "groups_add": "enum: everyone | contacts | nobody"
  },
  
  "notification_settings": {
    "push_enabled": "boolean",
    "sound_enabled": "boolean",
    "vibrate_enabled": "boolean",
    "preview_enabled": "boolean",
    "mute_all_until": "datetime | null",
    "quiet_hours": {
      "enabled": "boolean",
      "start_time": "string (HH:MM)",
      "end_time": "string (HH:MM)"
    }
  },
  
  "chat_settings": {
    "enter_sends_message": "boolean",
    "media_auto_download": {
      "wifi": "boolean",
      "mobile_data": "boolean",
      "roaming": "boolean"
    },
    "font_size": "enum: small | medium | large",
    "chat_wallpaper": "string | null (media_id)",
    "archive_on_mute": "boolean"
  },
  
  "blocked_users": ["string (user_keys)"],
  
  "contacts": [
    {
      "user_key": "string",
      "nickname": "string | null",
      "added_at": "datetime"
    }
  ],
  
  "device_tokens": [
    {
      "token": "string",
      "platform": "enum: ios | android | web",
      "device_id": "string",
      "last_active": "datetime"
    }
  ],
  
  "last_seen_at": "datetime",
  "is_online": "boolean",
  
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ user_key: 1 }` - Unique
- `{ account_key: 1 }` - Users by org
- `{ "profile.phone": 1 }` - Contact discovery
- `{ is_online: 1, last_seen_at: -1 }` - Online users

---

## Collection: conversations

Chat threads (1:1 or group references).

```json
{
  "_id": "ObjectId",
  "conversation_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "type": "enum: direct | group | channel | self",
  
  "participants": [
    {
      "user_key": "string",
      "role": "enum: member | admin | owner",
      "joined_at": "datetime",
      "added_by": "string | null",
      "nickname_in_group": "string | null"
    }
  ],
  
  "group_id": "string | null (if type=group, links to groups)",
  
  "last_message": {
    "message_id": "string",
    "content_preview": "string (truncated, max 100 chars)",
    "sender_key": "string",
    "sender_name": "string",
    "sent_at": "datetime",
    "type": "enum: text | image | video | audio | document | sticker | location"
  },
  
  "unread_counts": {
    "{user_key}": "number"
  },
  
  "muted_by": {
    "{user_key}": "datetime | null (mute until)"
  },
  
  "pinned_by": ["string (user_keys who pinned this)"],
  
  "archived_by": ["string (user_keys who archived this)"],
  
  "typing": {
    "{user_key}": "datetime (timestamp when started typing)"
  },
  
  "draft": {
    "{user_key}": {
      "content": "string",
      "updated_at": "datetime"
    }
  },
  
  "settings": {
    "disappearing_messages": {
      "enabled": "boolean",
      "duration_seconds": "number (24h, 7d, 90d)"
    }
  },
  
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ conversation_id: 1 }` - Unique
- `{ "participants.user_key": 1, updated_at: -1 }` - User's conversations
- `{ account_key: 1, updated_at: -1 }` - Org conversations
- `{ group_id: 1 }` - Group lookup

---

## Collection: groups

Group/channel details.

```json
{
  "_id": "ObjectId",
  "group_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  "conversation_id": "string - REQUIRED (links to conversations)",
  
  "type": "enum: group | channel | broadcast",
  
  "info": {
    "name": "string - REQUIRED",
    "description": "string | null",
    "icon_url": "string | null",
    "invite_link": "string | null (unique invite code)",
    "invite_link_enabled": "boolean"
  },
  
  "settings": {
    "only_admins_can_send": "boolean (for channels)",
    "only_admins_can_edit": "boolean",
    "only_admins_can_add_members": "boolean",
    "approval_required": "boolean (join requests need approval)",
    "max_members": "number (default: 256, channels: unlimited)"
  },
  
  "members": {
    "count": "number",
    "admins": ["string (user_keys)"],
    "owner_key": "string"
  },
  
  "pinned_messages": ["string (message_ids)"],
  
  "join_requests": [
    {
      "user_key": "string",
      "requested_at": "datetime",
      "message": "string | null"
    }
  ],
  
  "banned_users": [
    {
      "user_key": "string",
      "banned_at": "datetime",
      "banned_by": "string",
      "reason": "string | null"
    }
  ],
  
  "created_by": "string (user_key)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ group_id: 1 }` - Unique
- `{ account_key: 1 }` - Org groups
- `{ "info.invite_link": 1 }` - Invite link lookup
- `{ conversation_id: 1 }` - Conversation link

---

## Collection: messages

Individual chat messages.

```json
{
  "_id": "ObjectId",
  "message_id": "string (12-digit) - PRIMARY KEY",
  "conversation_id": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  
  "sender": {
    "user_key": "string",
    "display_name": "string (at time of sending)",
    "avatar_url": "string | null"
  },
  
  "content": {
    "type": "enum: text | image | video | audio | voice | document | sticker | gif | location | contact | poll | system",
    "text": "string | null",
    "caption": "string | null (for media)",
    "formatted_text": {
      "bold": [[0, 5], [10, 15]],
      "italic": [[20, 25]],
      "code": [],
      "link": [{"start": 30, "end": 40, "url": "https://..."}],
      "mention": [{"start": 0, "end": 5, "user_key": "..."}]
    }
  },
  
  "media": {
    "media_id": "string | null",
    "url": "string | null",
    "thumbnail_url": "string | null",
    "mime_type": "string | null",
    "file_name": "string | null",
    "file_size": "number | null (bytes)",
    "duration": "number | null (seconds for audio/video)",
    "dimensions": {
      "width": "number",
      "height": "number"
    }
  },
  
  "location": {
    "latitude": "number | null",
    "longitude": "number | null",
    "name": "string | null",
    "address": "string | null",
    "live_until": "datetime | null (for live location)"
  },
  
  "contact": {
    "name": "string | null",
    "phone": "string | null",
    "user_key": "string | null"
  },
  
  "poll": {
    "question": "string | null",
    "options": [
      {
        "id": "string",
        "text": "string",
        "votes": ["string (user_keys)"]
      }
    ],
    "multiple_choice": "boolean",
    "anonymous": "boolean",
    "closed": "boolean"
  },
  
  "reply_to": {
    "message_id": "string | null",
    "sender_key": "string | null",
    "content_preview": "string | null"
  },
  
  "forwarded_from": {
    "original_message_id": "string | null",
    "original_sender_name": "string | null",
    "forward_count": "number"
  },
  
  "reactions": [
    {
      "emoji": "string",
      "user_keys": ["string"],
      "count": "number"
    }
  ],
  
  "mentions": ["string (user_keys mentioned)"],
  
  "status": "enum: sending | sent | delivered | read | failed",
  
  "delivery_status": {
    "{user_key}": {
      "delivered_at": "datetime | null",
      "read_at": "datetime | null"
    }
  },
  
  "edited": {
    "is_edited": "boolean",
    "edited_at": "datetime | null",
    "original_content": "string | null"
  },
  
  "deleted": {
    "is_deleted": "boolean",
    "deleted_at": "datetime | null",
    "deleted_for": "enum: self | everyone | null"
  },
  
  "expires_at": "datetime | null (disappearing messages)",
  
  "metadata": {
    "client_message_id": "string (for deduplication)",
    "platform": "enum: ios | android | web",
    "app_version": "string"
  },
  
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ message_id: 1 }` - Unique
- `{ conversation_id: 1, created_at: -1 }` - Message history
- `{ conversation_id: 1, "sender.user_key": 1 }` - Sender's messages
- `{ "metadata.client_message_id": 1 }` - Deduplication
- `{ account_key: 1, "content.type": 1 }` - Media search
- `{ expires_at: 1 }` - TTL for disappearing messages

---

## Collection: media_files

Media and file attachments storage metadata.

```json
{
  "_id": "ObjectId",
  "media_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  "uploaded_by": "string (user_key)",
  
  "file": {
    "original_name": "string",
    "stored_name": "string (UUID)",
    "mime_type": "string",
    "size_bytes": "number",
    "extension": "string"
  },
  
  "storage": {
    "provider": "enum: s3 | gcs | azure | local",
    "bucket": "string",
    "path": "string",
    "url": "string",
    "cdn_url": "string | null"
  },
  
  "media_type": "enum: image | video | audio | document | sticker | gif | avatar | group_icon",
  
  "image_info": {
    "width": "number | null",
    "height": "number | null",
    "thumbnail_url": "string | null",
    "blurhash": "string | null (placeholder)"
  },
  
  "video_info": {
    "width": "number | null",
    "height": "number | null",
    "duration_seconds": "number | null",
    "thumbnail_url": "string | null",
    "codec": "string | null"
  },
  
  "audio_info": {
    "duration_seconds": "number | null",
    "waveform": "[number] | null (for voice messages)",
    "transcription": "string | null"
  },
  
  "usage": {
    "message_ids": ["string (messages using this media)"],
    "use_count": "number"
  },
  
  "encryption": {
    "encrypted": "boolean",
    "key_id": "string | null"
  },
  
  "status": "enum: uploading | processing | ready | failed | deleted",
  
  "created_at": "datetime",
  "expires_at": "datetime | null"
}
```

**Indexes:**
- `{ media_id: 1 }` - Unique
- `{ account_key: 1, media_type: 1 }` - Media by type
- `{ uploaded_by: 1, created_at: -1 }` - User's uploads
- `{ status: 1, expires_at: 1 }` - Cleanup

---

## Collection: notifications

Push and in-app notifications.

```json
{
  "_id": "ObjectId",
  "notification_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  "user_key": "string - REQUIRED (recipient)",
  
  "type": "enum: message | mention | reaction | group_invite | group_join | system | alert | task | reminder",
  
  "title": "string",
  "body": "string",
  "icon_url": "string | null",
  
  "data": {
    "conversation_id": "string | null",
    "message_id": "string | null",
    "group_id": "string | null",
    "sender_key": "string | null",
    "sender_name": "string | null",
    "deep_link": "string | null"
  },
  
  "priority": "enum: low | normal | high | urgent",
  
  "delivery": {
    "channels": ["enum: push | in_app | email | sms"],
    "push_sent": "boolean",
    "push_sent_at": "datetime | null",
    "push_received": "boolean",
    "push_clicked": "boolean"
  },
  
  "status": "enum: pending | sent | read | dismissed | failed",
  "is_read": "boolean",
  "read_at": "datetime | null",
  
  "created_at": "datetime",
  "expires_at": "datetime | null"
}
```

**Indexes:**
- `{ notification_id: 1 }` - Unique
- `{ user_key: 1, is_read: 1, created_at: -1 }` - User's notifications
- `{ user_key: 1, type: 1 }` - By type
- `{ status: 1, created_at: 1 }` - Pending delivery

---

## Collection: alerts

Generic alert system for all Task-Circuit domains.

```json
{
  "_id": "ObjectId",
  "alert_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "domain": {
    "module": "enum: fish | agri | poultry | dairy | general",
    "source_db": "string (e.g., 'fish_db', 'agri_db')",
    "source_collection": "string | null (e.g., 'ponds', 'crops')"
  },
  
  "alert_type": "string - REQUIRED (e.g., 'low_do', 'high_mortality', 'pest_detected')",
  "category": "enum: water_quality | environment | health | equipment | inventory | schedule | financial | security | system",
  "severity": "enum: critical | warning | info",
  
  "title": "string",
  "message": "string",
  "icon": "string | null (emoji or icon name)",
  
  "trigger": {
    "entity_type": "string (e.g., 'pond', 'crop', 'shed', 'equipment')",
    "entity_id": "string",
    "entity_name": "string",
    "parameter": "string | null (e.g., 'dissolved_oxygen', 'temperature')",
    "condition": "enum: above | below | equals | not_equals | change",
    "threshold": "number | string | null",
    "actual_value": "number | string | null",
    "unit": "string | null (e.g., 'mg/L', '°C', '%')"
  },
  
  "context": {
    "farm_id": "string | null",
    "farm_name": "string | null",
    "location": "string | null",
    "additional_data": "object | null (domain-specific data)"
  },
  
  "status": "enum: new | acknowledged | snoozed | assigned | in_progress | resolved | dismissed | auto_resolved",
  "is_read": "boolean",
  "read_by": ["string (user_keys who read)"],
  
  "assignment": {
    "assigned_to": "string | null (user_key)",
    "assigned_to_name": "string | null",
    "assigned_by": "string | null (user_key)",
    "assigned_at": "datetime | null",
    "priority": "enum: critical | high | medium | low",
    "due_date": "datetime | null",
    "linked_task_id": "string | null"
  },
  
  "snooze": {
    "is_snoozed": "boolean",
    "snoozed_by": "string | null",
    "remind_at": "datetime | null",
    "snooze_count": "number",
    "snooze_reason": "string | null",
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
    "resolved_by": "string | null (user_key)",
    "resolution_type": "enum: manual | auto | dismissed | timeout | null",
    "resolution_notes": "string | null",
    "root_cause": "string | null",
    "action_taken": "string | null"
  },
  
  "escalation": {
    "is_escalated": "boolean",
    "escalated_at": "datetime | null",
    "escalated_to": "string | null (user_key or role)",
    "escalation_level": "number (1, 2, 3...)",
    "escalation_reason": "string | null"
  },
  
  "notifications_sent": [
    {
      "notification_id": "string",
      "channel": "enum: push | email | sms | in_app",
      "sent_at": "datetime",
      "recipient_key": "string"
    }
  ],
  
  "related_alerts": ["string (alert_ids of related alerts)"],
  
  "tags": ["string (custom tags)"],
  
  "metadata": {
    "source": "enum: sensor | system | user | ai | scheduled",
    "confidence": "number | null (0-1 for AI-generated alerts)",
    "recurrence_count": "number (how many times this alert occurred)",
    "first_occurrence": "datetime | null",
    "auto_resolve_at": "datetime | null"
  },
  
  "created_at": "datetime",
  "updated_at": "datetime",
  "acknowledged_at": "datetime | null"
}
```

**Indexes:**
- `{ alert_id: 1 }` - Unique
- `{ account_key: 1, status: 1, created_at: -1 }` - Alert list
- `{ account_key: 1, "domain.module": 1, status: 1 }` - Domain alerts
- `{ account_key: 1, severity: 1, status: 1 }` - Critical alerts
- `{ account_key: 1, is_read: 1 }` - Unread alerts
- `{ "trigger.entity_type": 1, "trigger.entity_id": 1 }` - Entity alerts
- `{ "assignment.assigned_to": 1, status: 1 }` - Assigned alerts
- `{ "snooze.remind_at": 1 }` - Snooze processing
- `{ "metadata.auto_resolve_at": 1 }` - Auto-resolve processing

---

## Collection: tasks

Generic task management system (Jira-like) for all domains.

```json
{
  "_id": "ObjectId",
  "task_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "domain": {
    "module": "enum: fish | agri | poultry | dairy | general",
    "source_db": "string | null",
    "linked_entity_type": "string | null",
    "linked_entity_id": "string | null"
  },
  
  "title": "string - REQUIRED",
  "description": "string | null",
  
  "type": "enum: task | bug | issue | maintenance | inspection | routine | emergency",
  "category": "string | null (e.g., 'feeding', 'maintenance', 'harvest')",
  
  "status": "enum: todo | in_progress | blocked | review | done | cancelled",
  "priority": "enum: critical | high | medium | low",
  
  "assignee": {
    "user_key": "string | null",
    "user_name": "string | null",
    "assigned_at": "datetime | null"
  },
  
  "reporter": {
    "user_key": "string",
    "user_name": "string",
    "reported_at": "datetime"
  },
  
  "watchers": ["string (user_keys)"],
  
  "dates": {
    "due_date": "datetime | null",
    "start_date": "datetime | null",
    "completed_at": "datetime | null",
    "estimated_hours": "number | null",
    "actual_hours": "number | null"
  },
  
  "location": {
    "farm_id": "string | null",
    "farm_name": "string | null",
    "specific_location": "string | null (e.g., 'Pond A1', 'Field 3')"
  },
  
  "linked_alert_id": "string | null",
  "parent_task_id": "string | null (for subtasks)",
  "subtask_ids": ["string"],
  
  "checklist": [
    {
      "item_id": "string",
      "text": "string",
      "is_completed": "boolean",
      "completed_by": "string | null",
      "completed_at": "datetime | null"
    }
  ],
  
  "attachments": [
    {
      "media_id": "string",
      "file_name": "string",
      "file_type": "string",
      "uploaded_by": "string",
      "uploaded_at": "datetime"
    }
  ],
  
  "comments": [
    {
      "comment_id": "string",
      "user_key": "string",
      "user_name": "string",
      "content": "string",
      "created_at": "datetime",
      "edited_at": "datetime | null"
    }
  ],
  
  "activity_log": [
    {
      "action": "string (e.g., 'status_changed', 'assigned', 'commented')",
      "user_key": "string",
      "user_name": "string",
      "old_value": "string | null",
      "new_value": "string | null",
      "timestamp": "datetime"
    }
  ],
  
  "reminders": [
    {
      "remind_at": "datetime",
      "remind_to": ["string (user_keys)"],
      "message": "string | null",
      "sent": "boolean"
    }
  ],
  
  "recurrence": {
    "is_recurring": "boolean",
    "pattern": "enum: daily | weekly | monthly | custom | null",
    "interval": "number | null",
    "days_of_week": ["number (0-6)"] ,
    "end_date": "datetime | null",
    "next_occurrence": "datetime | null"
  },
  
  "tags": ["string"],
  
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ task_id: 1 }` - Unique
- `{ account_key: 1, status: 1, "dates.due_date": 1 }` - Task list
- `{ account_key: 1, "assignee.user_key": 1, status: 1 }` - My tasks
- `{ account_key: 1, "domain.module": 1, status: 1 }` - Domain tasks
- `{ linked_alert_id: 1 }` - Alert-linked tasks
- `{ parent_task_id: 1 }` - Subtasks
- `{ "recurrence.next_occurrence": 1 }` - Recurring tasks

---

## Collection: user_status

Online/offline presence and status updates.

```json
{
  "_id": "ObjectId",
  "user_key": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  
  "presence": {
    "status": "enum: online | away | busy | offline",
    "last_seen_at": "datetime",
    "status_text": "string | null (custom status)",
    "status_emoji": "string | null"
  },
  
  "activity": {
    "currently_typing_in": "string | null (conversation_id)",
    "typing_started_at": "datetime | null",
    "currently_viewing": "string | null (conversation_id)"
  },
  
  "story": {
    "has_story": "boolean",
    "story_count": "number",
    "last_story_at": "datetime | null"
  },
  
  "connections": {
    "active_devices": [
      {
        "device_id": "string",
        "platform": "enum: ios | android | web",
        "connected_at": "datetime",
        "ip_address": "string | null"
      }
    ]
  },
  
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ user_key: 1 }` - Unique
- `{ account_key: 1, "presence.status": 1 }` - Online users
- `{ "presence.last_seen_at": -1 }` - Recent activity

---

## Collection: stories

Story/status updates (24-hour posts).

```json
{
  "_id": "ObjectId",
  "story_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED",
  "user_key": "string - REQUIRED",
  
  "content": {
    "type": "enum: image | video | text",
    "media_id": "string | null",
    "media_url": "string | null",
    "text": "string | null",
    "background_color": "string | null",
    "font_style": "string | null"
  },
  
  "caption": "string | null",
  
  "privacy": {
    "visibility": "enum: everyone | contacts | selected | except",
    "allowed_users": ["string (user_keys) | null"],
    "excluded_users": ["string (user_keys) | null"]
  },
  
  "viewers": [
    {
      "user_key": "string",
      "viewed_at": "datetime"
    }
  ],
  
  "reactions": [
    {
      "user_key": "string",
      "emoji": "string",
      "reacted_at": "datetime"
    }
  ],
  
  "replies": [
    {
      "message_id": "string",
      "user_key": "string",
      "content": "string",
      "replied_at": "datetime"
    }
  ],
  
  "view_count": "number",
  
  "created_at": "datetime",
  "expires_at": "datetime (24 hours from created_at)"
}
```

**Indexes:**
- `{ story_id: 1 }` - Unique
- `{ user_key: 1, created_at: -1 }` - User's stories
- `{ account_key: 1, expires_at: 1 }` - Active stories
- `{ expires_at: 1 }` - TTL cleanup

---

## Collection: calls

Voice/video call logs.

```json
{
  "_id": "ObjectId",
  "call_id": "string (12-digit) - PRIMARY KEY",
  "conversation_id": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  
  "type": "enum: voice | video | group_voice | group_video",
  
  "initiator": {
    "user_key": "string",
    "display_name": "string"
  },
  
  "participants": [
    {
      "user_key": "string",
      "display_name": "string",
      "joined_at": "datetime | null",
      "left_at": "datetime | null",
      "status": "enum: invited | ringing | joined | declined | missed | busy"
    }
  ],
  
  "status": "enum: initiated | ringing | ongoing | completed | missed | declined | failed",
  
  "duration": {
    "started_at": "datetime | null",
    "ended_at": "datetime | null",
    "duration_seconds": "number | null"
  },
  
  "quality": {
    "avg_bitrate": "number | null",
    "packet_loss": "number | null",
    "codec": "string | null"
  },
  
  "recording": {
    "enabled": "boolean",
    "media_id": "string | null"
  },
  
  "created_at": "datetime"
}
```

**Indexes:**
- `{ call_id: 1 }` - Unique
- `{ conversation_id: 1, created_at: -1 }` - Call history
- `{ "participants.user_key": 1, created_at: -1 }` - User's calls

---

## Collection: message_search

Full-text search index for messages.

```json
{
  "_id": "ObjectId",
  "search_id": "string (12-digit) - PRIMARY KEY",
  "message_id": "string - REQUIRED",
  "conversation_id": "string - REQUIRED",
  "account_key": "string - REQUIRED",
  
  "searchable_text": "string (normalized, lowercase)",
  "sender_key": "string",
  "content_type": "string",
  
  "created_at": "datetime"
}
```

**Indexes:**
- `{ search_id: 1 }` - Unique
- `{ account_key: 1, searchable_text: "text" }` - Full-text search
- `{ conversation_id: 1, searchable_text: "text" }` - Search in conversation

---

## Collection: stickers

Sticker packs and individual stickers.

```json
{
  "_id": "ObjectId",
  "sticker_id": "string (12-digit) - PRIMARY KEY",
  "pack_id": "string - REQUIRED",
  
  "pack_info": {
    "name": "string",
    "publisher": "string",
    "icon_url": "string",
    "is_official": "boolean",
    "is_animated": "boolean"
  },
  
  "sticker": {
    "emoji": "string (associated emoji)",
    "url": "string",
    "thumbnail_url": "string",
    "width": "number",
    "height": "number"
  },
  
  "usage_count": "number",
  
  "created_at": "datetime"
}
```

**Indexes:**
- `{ sticker_id: 1 }` - Unique
- `{ pack_id: 1 }` - Stickers in pack
- `{ "sticker.emoji": 1 }` - Emoji search

---

## Collection: chat_settings

Organization-level chat settings.

```json
{
  "_id": "ObjectId",
  "settings_id": "string (12-digit) - PRIMARY KEY",
  "account_key": "string - REQUIRED (unique)",
  
  "features": {
    "direct_messages_enabled": "boolean",
    "group_chats_enabled": "boolean",
    "channels_enabled": "boolean",
    "voice_calls_enabled": "boolean",
    "video_calls_enabled": "boolean",
    "file_sharing_enabled": "boolean",
    "stories_enabled": "boolean"
  },
  
  "limits": {
    "max_group_size": "number (default: 256)",
    "max_file_size_mb": "number (default: 100)",
    "max_message_length": "number (default: 4096)",
    "message_retention_days": "number | null (null = forever)"
  },
  
  "moderation": {
    "content_filter_enabled": "boolean",
    "profanity_filter_enabled": "boolean",
    "link_preview_enabled": "boolean",
    "external_links_allowed": "boolean"
  },
  
  "defaults": {
    "new_user_can_message": "boolean",
    "read_receipts_default": "boolean",
    "disappearing_messages_default": "number | null (seconds)"
  },
  
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Indexes:**
- `{ settings_id: 1 }` - Unique
- `{ account_key: 1 }` - Unique

---

## Real-time Events (WebSocket)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           WEBSOCKET EVENTS                                           │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  CLIENT → SERVER:                                                                   │
│  ─────────────────                                                                  │
│  • message.send           - Send new message                                        │
│  • message.edit           - Edit message                                            │
│  • message.delete         - Delete message                                          │
│  • message.react          - Add reaction                                            │
│  • typing.start           - Started typing                                          │
│  • typing.stop            - Stopped typing                                          │
│  • presence.update        - Update online status                                    │
│  • conversation.read      - Mark as read                                            │
│  • call.initiate          - Start call                                              │
│  • call.accept            - Accept call                                             │
│  • call.reject            - Reject call                                             │
│  • call.end               - End call                                                │
│                                                                                      │
│  SERVER → CLIENT:                                                                   │
│  ─────────────────                                                                  │
│  • message.new            - New message received                                    │
│  • message.updated        - Message edited                                          │
│  • message.deleted        - Message deleted                                         │
│  • message.reaction       - Reaction added/removed                                  │
│  • typing.indicator       - Someone typing                                          │
│  • presence.changed       - User online/offline                                     │
│  • delivery.status        - Message delivered/read                                  │
│  • call.incoming          - Incoming call                                           │
│  • call.status            - Call status change                                      │
│  • notification.new       - New notification                                        │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations` | List conversations |
| POST | `/api/chat/conversations` | Create conversation (DM or group) |
| GET | `/api/chat/conversations/:id` | Get conversation details |
| DELETE | `/api/chat/conversations/:id` | Delete/leave conversation |
| GET | `/api/chat/conversations/:id/messages` | Get message history |
| POST | `/api/chat/conversations/:id/messages` | Send message |
| PUT | `/api/chat/messages/:id` | Edit message |
| DELETE | `/api/chat/messages/:id` | Delete message |
| POST | `/api/chat/messages/:id/react` | Add reaction |
| POST | `/api/chat/conversations/:id/read` | Mark as read |
| POST | `/api/chat/conversations/:id/typing` | Typing indicator |

### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/groups` | Create group |
| GET | `/api/chat/groups/:id` | Get group details |
| PUT | `/api/chat/groups/:id` | Update group |
| DELETE | `/api/chat/groups/:id` | Delete group |
| POST | `/api/chat/groups/:id/members` | Add members |
| DELETE | `/api/chat/groups/:id/members/:user` | Remove member |
| PUT | `/api/chat/groups/:id/members/:user/role` | Change role |
| POST | `/api/chat/groups/:id/leave` | Leave group |
| GET | `/api/chat/groups/join/:invite` | Join via invite link |

### Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/media/upload` | Upload media |
| GET | `/api/chat/media/:id` | Get media |
| DELETE | `/api/chat/media/:id` | Delete media |

### User Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/settings` | Get chat settings |
| PUT | `/api/chat/settings` | Update settings |
| PUT | `/api/chat/settings/privacy` | Update privacy |
| PUT | `/api/chat/settings/notifications` | Update notifications |
| POST | `/api/chat/users/block/:user` | Block user |
| DELETE | `/api/chat/users/block/:user` | Unblock user |

### Calls

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/calls` | Initiate call |
| GET | `/api/chat/calls/:id` | Get call details |
| POST | `/api/chat/calls/:id/accept` | Accept call |
| POST | `/api/chat/calls/:id/reject` | Reject call |
| POST | `/api/chat/calls/:id/end` | End call |
| GET | `/api/chat/calls/history` | Call history |

### Stories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/stories` | Get stories feed |
| POST | `/api/chat/stories` | Post story |
| GET | `/api/chat/stories/:id` | Get story |
| DELETE | `/api/chat/stories/:id` | Delete story |
| POST | `/api/chat/stories/:id/view` | Mark as viewed |
| POST | `/api/chat/stories/:id/react` | React to story |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/search` | Search messages |
| GET | `/api/chat/search/conversations` | Search conversations |
| GET | `/api/chat/search/media` | Search media |

---

## Collection Summary

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| `chat_users` | User chat settings | Privacy, notifications, blocked users |
| `conversations` | Chat threads | 1:1, groups, last message, unread counts |
| `groups` | Group details | Members, admins, settings, invite links |
| `messages` | Chat messages | Text, media, reactions, replies, delivery status |
| `media_files` | File storage | Images, videos, documents, thumbnails |
| `notifications` | Push/in-app delivery | Message alerts, mentions, system notifications |
| `alerts` | Domain alerts | Generic alerts for all modules (fish, agri, poultry) |
| `tasks` | Task management | Jira-like tasks, assignments, checklists, recurring |
| `user_status` | Presence | Online/offline, typing, last seen |
| `stories` | Status updates | 24-hour posts, viewers, reactions |
| `calls` | Voice/video calls | Call logs, duration, participants |
| `message_search` | Full-text search | Indexed message content |
| `stickers` | Sticker packs | Animated stickers, emoji mapping |
| `chat_settings` | Org settings | Features, limits, moderation |

**Total Collections: 14**

---

## Domain Support

This database supports multiple Task-Circuit domains:

| Domain | Module | Example Alert Types | Example Tasks |
|--------|--------|---------------------|---------------|
| **Fish Farming** | `fish` | Low DO, high mortality, pH alert | Feed fish, clean pond, harvest |
| **Agriculture** | `agri` | Soil moisture, pest detected, frost warning | Irrigate field, apply fertilizer, harvest crop |
| **Poultry** | `poultry` | Temperature alert, low feed, disease | Feed birds, clean shed, collect eggs |
| **Dairy** | `dairy` | Milk quality, health alert, feed low | Milk cows, clean equipment, veterinary check |
| **General** | `general` | Equipment failure, security alert | Maintenance, inspection, admin |

---

## Benefits

| Feature | Implementation |
|---------|----------------|
| **Real-time messaging** | WebSocket + message collection |
| **Read receipts** | delivery_status per user |
| **Typing indicators** | user_status.activity |
| **Message reactions** | reactions array on messages |
| **Reply threads** | reply_to reference |
| **Forwarding** | forwarded_from tracking |
| **Media sharing** | media_files + CDN |
| **Voice/video calls** | calls collection + WebRTC |
| **Stories** | 24h TTL stories collection |
| **Search** | Full-text search index |
| **Privacy controls** | chat_users.privacy settings |
| **Disappearing messages** | expires_at with TTL |
| **Domain-agnostic alerts** | alerts with domain context |
| **Unified task management** | tasks across all modules |
| **Multi-module support** | Single DB for all Task-Circuit spokes |
