
// ============================================================================
// Task Status Constants
// ============================================================================

/**
 * Task status values.
 */
export const TASK_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'inprogress',
    COMPLETED: 'completed',
    WONT_DO: 'wontdo',
    RESOLVE: 'resolve',
};


export const STATUS_OPTIONS = [
    { value: TASK_STATUS.PENDING, label: 'Pending' },
    { value: TASK_STATUS.IN_PROGRESS, label: 'In Progress' },
    { value: TASK_STATUS.COMPLETED, label: 'Completed' },
];

export const STATUS_CONFIG = {
    [TASK_STATUS.PENDING]: {
        bg: '#fff8e1',
        color: '#f57c00',
        borderColor: '#ffb74d',
        label: 'Pending',
        icon: '⏳',
    },
    [TASK_STATUS.IN_PROGRESS]: {
        bg: '#e3f2fd',
        color: '#1976d2',
        borderColor: '#64b5f6',
        label: 'In Progress',
        icon: '🔄',
    },
    [TASK_STATUS.COMPLETED]: {
        bg: '#e8f5e9',
        color: '#388e3c',
        borderColor: '#81c784',
        label: 'Completed',
        icon: '✅',
    },
};

// ============================================================================
// Task Priority Constants
// ============================================================================

export const PRIORITY_OPTIONS = [1, 2, 3, 4, 5];

export const PRIORITY_CONFIG = {
    1: { label: 'Critical', color: 'error', bg: '#ffebee' },
    2: { label: 'High', color: 'warning', bg: '#fff3e0' },
    3: { label: 'Medium', color: 'info', bg: '#e3f2fd' },
    4: { label: 'Low', color: 'success', bg: '#e8f5e9' },
    5: { label: 'Normal', color: 'default', bg: '#fafafa' },
};


// ============================================================================
// Form Initial States
// ============================================================================

export const INITIAL_TASK_FORM = {
    title: '',
    description: '',
    status: TASK_STATUS.PENDING,
    priority: '3',
    assigned_to: '',
    end_date: '',
    task_date: '',
    notes: '',
};



/**
 * Task priority levels (1 = highest, 5 = lowest).
 */
export const TASK_PRIORITY = {
    HIGH: 1,
    CRITICAL: 2,
    MEDIUM: 3,
    LOW: 4,
    NORMAL: 5,
};

export const PRIORITY_COLORS = {
    1: { border: '#f44336', shadow: '#f44336' },
    2: { border: '#ff7961', shadow: '#ff7961' },
    3: { border: '#ff9800', shadow: '#ff9800' },
    4: { border: '#ffeb3b', shadow: '#ffeb3b' },
    5: { border: '#4caf50', shadow: '#4caf50' },
};

