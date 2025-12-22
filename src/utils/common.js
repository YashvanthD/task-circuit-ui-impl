// Common/shared utility functions

/**
 * Map task status to a color variant name (for MUI components).
 */
export function getNextActionColor(status) {
  switch (status) {
    case 'pending':
      return 'primary';
    case 'inprogress':
      return 'success';
    case 'completed':
      return 'success';
    case 'wontdo':
      return 'warning';
    case 'resolve':
      return 'orange';
    default:
      return 'default';
  }
}

/**
 * Get inline style for task priority and status (card border/shadow).
 * Shared between TasksPage and DashboardPage.
 */
export function getPriorityStyle(priority, status = null) {
  if (status === 'completed') {
    return { border: '1.5px solid #4caf50', boxShadow: '0 0 4px #4caf50' };
  }
  switch (priority) {
    case 1:
      return { border: '1.5px solid #f44336', boxShadow: '0 0 4px #f44336' };
    case 2:
      return { border: '1.5px solid #ff7961', boxShadow: '0 0 4px #ff7961' };
    case 3:
      return { border: '1.5px solid #ff9800', boxShadow: '0 0 4px #ff9800' };
    case 4:
      return { border: '1.5px solid #ffeb3b', boxShadow: '0 0 4px #ffeb3b' };
    case 5:
      return { border: '1.5px solid #4caf50', boxShadow: '0 0 4px #4caf50' };
    default:
      return { border: '1px solid #e0e0e0' };
  }
}

/**
 * Get human-readable priority label.
 */
export function getPriorityLabel(priority) {
  switch (priority) {
    case 1:
      return 'High';
    case 2:
      return 'Critical';
    case 3:
      return 'Medium';
    case 4:
      return 'Low';
    case 5:
      return 'Normal';
    default:
      return 'Unknown';
  }
}

/**
 * Get MUI color name for priority chips.
 */
export function getPriorityColor(priority) {
  switch (priority) {
    case 1:
      return 'error';
    case 2:
      return 'warning';
    case 3:
      return 'info';
    case 4:
      return 'success';
    case 5:
      return 'default';
    default:
      return 'default';
  }
}
