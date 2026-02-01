
// ============================================================================
// Pond Constants
// ============================================================================

const POND_STATUS_KEYS = {
    EMPTY: 'empty',
    PREPARING: 'preparing',
    STOCKING: 'stocking',
    INACTIVE: 'inactive',
    STOCKED: 'stocked',
    HARVESTING: 'harvesting',
    MAINTENANCE: 'maintenance',
    ACTIVE: 'active'
}

 export const POND_STATUS = [
    { value: 'empty', label: 'Empty', description: 'Pond is empty and ready for stocking' },
    { value: 'preparing', label: 'Preparing', description: 'Pond is being prepared for stocking' },
    {value : 'stocking', label: 'Stocking', description: 'Pond is being stocked with fish' },
    {value: 'inactive', label: 'Inactive', description: 'Pond is not in use' },
    { value: 'stocked', label: 'Stocked', description: 'Pond has active fish stock' },
    { value: 'harvesting', label: 'Harvesting', description: 'Fish are being harvested' },
    { value: 'maintenance', label: 'Maintenance', description: 'Pond is under maintenance' },
     {value: 'active', label: 'Active', description: 'Pond is active and operational' }
];

export const POND_STATUS_CONFIG = {
    [POND_STATUS_KEYS.ACTIVE]: {
        bg: '#e8f5e9',
        color: '#388e3c',
        borderColor: '#81c784',
        label: 'Active',
        icon: '🐟',
    },
    [POND_STATUS_KEYS.INACTIVE]: {
        bg: '#fafafa',
        color: '#757575',
        borderColor: '#bdbdbd',
        label: 'Inactive',
        icon: '⏸️',
    },
    [POND_STATUS_KEYS.MAINTENANCE]: {
        bg: '#fff3e0',
        color: '#f57c00',
        borderColor: '#ffb74d',
        label: 'Maintenance',
        icon: '🔧',
    },
    [POND_STATUS_KEYS.HARVESTING]: {
        bg: '#e3f2fd',
        color: '#1976d2',
        borderColor: '#64b5f6',
        label: 'Harvesting',
        icon: '🎣',
    },
};

export const INITIAL_POND_FORM = {
    name: '',
    size: '',
    location: '',
    status: POND_STATUS.ACTIVE,
    fish_type: '',
    fish_count: '',
    start_date: '',
    notes: '',
};

export const POND_TYPES = [
    { value: 'earthen', label: 'Earthen' },
    { value: 'concrete', label: 'Concrete' },
    { value: 'liner', label: 'Liner' },
    { value: 'tank', label: 'Tank' },
    { value: 'cage', label: 'Cage' },
    { value: 'raceway', label: 'Raceway' }
];

export const FISH_WATER_SOURCES = [
    { value: 'river', label: 'River' },
    { value: 'bore_well', label: 'Bore Well' },
    { value: 'canal', label: 'Canal' },
    { value: 'rain', label: 'Rain Water' },
    { value: 'mixed', label: 'Mixed' }
];
