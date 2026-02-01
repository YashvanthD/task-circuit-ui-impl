
// ============================================================================
// Sampling Constants
// ============================================================================

export const SAMPLING_STATUS = {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

export const SAMPLING_STATUS_OPTIONS = [
    { value: SAMPLING_STATUS.SCHEDULED, label: 'Scheduled' },
    { value: SAMPLING_STATUS.IN_PROGRESS, label: 'In Progress' },
    { value: SAMPLING_STATUS.COMPLETED, label: 'Completed' },
    { value: SAMPLING_STATUS.CANCELLED, label: 'Cancelled' },
];

export const SAMPLING_STATUS_CONFIG = {
    [SAMPLING_STATUS.SCHEDULED]: {
        bg: '#fff8e1',
        color: '#f57c00',
        label: 'Scheduled',
        icon: '📅',
    },
    [SAMPLING_STATUS.IN_PROGRESS]: {
        bg: '#e3f2fd',
        color: '#1976d2',
        label: 'In Progress',
        icon: '🔬',
    },
    [SAMPLING_STATUS.COMPLETED]: {
        bg: '#e8f5e9',
        color: '#388e3c',
        label: 'Completed',
        icon: '✅',
    },
    [SAMPLING_STATUS.CANCELLED]: {
        bg: '#ffebee',
        color: '#c62828',
        label: 'Cancelled',
        icon: '❌',
    },
};

export const INITIAL_SAMPLING_FORM = {
    pond_id: '',
    scheduled_date: '',
    sample_type: '',
    notes: '',
    status: SAMPLING_STATUS.SCHEDULED,
};
