# Data Models

**Location:** `src/models/`

JavaScript classes that represent backend entities with validation, normalization, and helper methods.

## Overview

All models extend `BaseModel` and provide:
- ✅ **Field normalization** - Handles both snake_case and camelCase
- ✅ **Validation** - Built-in validation rules
- ✅ **Helper methods** - Useful utilities for each entity type
- ✅ **Serialization** - Easy conversion to/from API format

## Available Models

### 1. User
```javascript
import { User } from './models';

const user = new User(apiResponse);

// Access properties
console.log(user.user_key);
console.log(user.email);
console.log(user.display_name);

// Helper methods
user.isAdmin();              // Check if admin
user.hasRole('manager');     // Check specific role
user.getDisplayName();       // Get display name with fallback
user.getInitials();          // Get initials for avatar
user.getAvatarUrl();         // Get avatar URL or placeholder

// Validation
if (user.isValid()) {
  // Use the user
} else {
  console.log(user.errors);
}

// Convert to API format
const apiData = user.toSnakeCase();
```

### 2. Task
```javascript
import { Task } from './models';

const task = new Task(apiResponse);

// Properties
task.task_id
task.title
task.status       // 'pending', 'inprogress', 'completed', 'cancelled'
task.priority     // 'low', 'normal', 'high', 'urgent', 'critical'

// Helper methods
task.isOverdue();            // Check if past due date
task.isCompleted();          // Check if status is completed
task.isPending();            // Check if status is pending
task.getPriorityLevel();     // Get priority as number (1-5)
task.getPriorityColor();     // Get color for priority
task.getStatusColor();       // Get color for status

// Actions
task.markCompleted(userKey); // Mark as completed
task.markInProgress();       // Mark as in progress
task.cancel();               // Cancel task
```

### 3. Notification
```javascript
import { Notification } from './models';

const notification = new Notification(apiResponse);

// Properties
notification.notification_id
notification.title
notification.message
notification.type      // 'info', 'success', 'warning', 'error', 'critical'
notification.read

// Helper methods
notification.isUnread();         // Check if unread
notification.getTypeIcon();      // Get icon name
notification.getTypeColor();     // Get color
notification.getTypeBgColor();   // Get background color
notification.getTimeAgo();       // Get "5m ago" string

// Actions
notification.markAsRead();       // Mark as read
```

### 4. Alert
```javascript
import { Alert } from './models';

const alert = new Alert(apiResponse);

// Properties
alert.alert_id
alert.title
alert.severity     // 'low', 'medium', 'high', 'critical'
alert.acknowledged

// Helper methods
alert.isUnacknowledged();    // Check if needs acknowledgment
alert.getSeverityColor();    // Get color for severity
alert.getSeverityLevel();    // Get severity as number (1-4)
alert.getSourceIcon();       // Get icon for source
alert.getTimeAgo();          // Get time string

// Actions
alert.acknowledge(userKey);  // Acknowledge alert
```

### 5. Message
```javascript
import { Message } from './models';

const message = new Message(apiResponse);

// Properties
message.message_id
message.content
message.sender_key
message.receivers
message.status     // 'sending', 'sent', 'delivered', 'read', 'failed'

// Helper methods
message.isOwn(currentUserKey);       // Check if from current user
message.isIncoming(currentUserKey);  // Check if incoming
message.isDelivered();               // Check if delivered
message.isRead();                    // Check if read
message.getStatusIcon();             // Get status icon
message.getStatusColor();            // Get status color
message.getTimeAgo();                // Get time string

// Actions
message.markDeliveredTo(userKey);    // Mark as delivered
message.markReadBy(userKey);         // Mark as read
message.addReaction(emoji, userKey); // Add reaction
```

### 6. Conversation
```javascript
import { Conversation } from './models';

const conversation = new Conversation(apiResponse);

// Properties
conversation.conversation_id
conversation.conversation_type  // 'direct' or 'group'
conversation.participants
conversation.unread_count

// Helper methods
conversation.isDirect();                      // Check if 1-on-1
conversation.isGroup();                       // Check if group
conversation.hasUnread();                     // Check unread messages
conversation.getDisplayName(currentUserKey);  // Get conversation name
conversation.getOtherParticipant(userKey);    // Get other user (direct only)
conversation.getLastMessagePreview();         // Get last message text
conversation.getLastActivityTime();           // Get "5m ago" string

// Actions
conversation.pin();        // Pin conversation
conversation.unpin();      // Unpin
conversation.mute();       // Mute notifications
conversation.unmute();     // Unmute
conversation.clearUnread();// Clear unread count
```

## Usage Examples

### Example 1: Display User List
```javascript
import { User } from './models';

async function loadUsers() {
  const response = await fetch('/api/users');
  const data = await response.json();
  
  // Convert raw data to User models
  const users = data.map(userData => new User(userData));
  
  // Use helper methods
  users.forEach(user => {
    console.log(user.getDisplayName());
    console.log(user.getAvatarUrl());
    if (user.isAdmin()) {
      console.log('This user is an admin');
    }
  });
}
```

### Example 2: Validate Before Saving
```javascript
import { Task } from './models';

function saveTask(formData) {
  const task = new Task(formData);
  
  if (!task.isValid()) {
    // Show validation errors
    task.errors.forEach(err => {
      console.error(`${err.field}: ${err.message}`);
    });
    return;
  }
  
  // Convert to backend format and save
  const apiData = task.toSnakeCase();
  await fetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(apiData)
  });
}
```

### Example 3: Update Model
```javascript
import { Notification } from './models';

const notification = new Notification(apiData);

// Mark as read
notification.markAsRead();

// Update via API
const updated = notification.toSnakeCase();
await fetch(`/api/notifications/${notification.notification_id}`, {
  method: 'PUT',
  body: JSON.stringify(updated)
});
```

### Example 4: Display Chat Messages
```javascript
import { Message } from './models';

function renderMessages(rawMessages, currentUserKey) {
  const messages = rawMessages.map(m => new Message(m));
  
  return messages.map(message => ({
    id: message.message_id,
    content: message.content,
    isOwn: message.isOwn(currentUserKey),
    status: message.getStatusIcon(),
    statusColor: message.getStatusColor(),
    time: message.getTimeAgo(),
    delivered: message.isDelivered(),
    read: message.isRead()
  }));
}
```

## Benefits

### 1. Type Safety (via JSDoc)
```javascript
/**
 * @param {User} user
 */
function displayUser(user) {
  // IDE will autocomplete user properties
  console.log(user.getDisplayName());
}
```

### 2. Consistent Data Handling
```javascript
// No more manual field checking
const userName = data.display_name || data.displayName || data.name || 'Unknown';

// Use model instead
const user = new User(data);
const userName = user.getDisplayName(); // ✅
```

### 3. Validation
```javascript
const task = new Task(formData);
if (task.isValid()) {
  await saveTask(task);
} else {
  showErrors(task.errors);
}
```

### 4. Helper Methods
```javascript
// Instead of complex logic
if (task.status === 'completed' || task.status === 'cancelled') {
  // ...
}

// Use helper
if (task.isCompleted()) {
  // ...
}
```

## Best Practices

1. **Always use models for API responses**
   ```javascript
   const users = apiResponse.map(u => new User(u));
   ```

2. **Validate before saving**
   ```javascript
   if (!model.isValid()) {
     return showErrors(model.errors);
   }
   ```

3. **Use helper methods**
   ```javascript
   user.isAdmin()           // ✅ Good
   user.role === 'admin'    // ❌ Avoid
   ```

4. **Convert to API format**
   ```javascript
   const apiData = model.toSnakeCase();  // For backend
   ```

## Adding New Models

1. Create new file in `src/models/YourModel.js`
2. Extend `BaseModel`
3. Implement `_init()` for field mapping
4. Implement `_validate()` for validation rules
5. Add helper methods
6. Export from `src/models/index.js`

```javascript
import { BaseModel } from './BaseModel';

export class YourModel extends BaseModel {
  _init(data) {
    this.id = data.id || null;
    this.name = data.name || '';
  }
  
  _validate() {
    if (!this.name) {
      this._addError('name', 'Name is required');
    }
  }
  
  // Helper methods
  getSomething() {
    return this.name.toUpperCase();
  }
}
```

## Summary

✅ **Use models** for all entity data  
✅ **Validate** before saving  
✅ **Use helpers** instead of manual checks  
✅ **Convert** to snake_case for backend  
✅ **Extend** BaseModel for new entities  

Models make your code cleaner, safer, and easier to maintain!
