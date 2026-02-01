// ============================================================================
// Fish Constants
// ============================================================================

export const FISH_STATUS = {
    HEALTHY: 'healthy',
    SICK: 'sick',
    QUARANTINE: 'quarantine',
    SOLD: 'sold',
};

export const FISH_STATUS_OPTIONS = [
    { value: FISH_STATUS.HEALTHY, label: 'Healthy' },
    { value: FISH_STATUS.SICK, label: 'Sick' },
    { value: FISH_STATUS.QUARANTINE, label: 'Quarantine' },
    { value: FISH_STATUS.SOLD, label: 'Sold' },
];

export const FISH_STATUS_CONFIG = {
    [FISH_STATUS.HEALTHY]: {
        bg: '#e8f5e9',
        color: '#388e3c',
        label: 'Healthy',
        icon: '🐟',
    },
    [FISH_STATUS.SICK]: {
        bg: '#ffebee',
        color: '#c62828',
        label: 'Sick',
        icon: '🤒',
    },
    [FISH_STATUS.QUARANTINE]: {
        bg: '#fff3e0',
        color: '#f57c00',
        label: 'Quarantine',
        icon: '🔒',
    },
    [FISH_STATUS.SOLD]: {
        bg: '#e3f2fd',
        color: '#1976d2',
        label: 'Sold',
        icon: '💰',
    },
};

export const INITIAL_FISH_FORM = {
    species: '',
    quantity: '',
    pond_id: '',
    status: FISH_STATUS.HEALTHY,
    purchase_date: '',
    notes: '',
};

