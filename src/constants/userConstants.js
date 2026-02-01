
// ============================================================================
// User Role Constants
// ============================================================================

export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    OPERATOR: 'operator',
    VIEWER: 'viewer',
};

export const USER_ROLE_OPTIONS = [
    { value: USER_ROLES.ADMIN, label: 'Admin' },
    { value: USER_ROLES.MANAGER, label: 'Manager' },
    { value: USER_ROLES.OPERATOR, label: 'Operator' },
    { value: USER_ROLES.VIEWER, label: 'Viewer' },
];

export const USER_ROLE_CONFIG = {
    [USER_ROLES.ADMIN]: {
        bg: '#ffebee',
        color: '#c62828',
        label: 'Admin',
        icon: '👑',
    },
    [USER_ROLES.MANAGER]: {
        bg: '#e3f2fd',
        color: '#1565c0',
        label: 'Manager',
        icon: '📋',
    },
    [USER_ROLES.OPERATOR]: {
        bg: '#e8f5e9',
        color: '#2e7d32',
        label: 'Operator',
        icon: '🔧',
    },
    [USER_ROLES.VIEWER]: {
        bg: '#fafafa',
        color: '#616161',
        label: 'Viewer',
        icon: '👁️',
    },
};

export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
};

export const USER_STATUS_OPTIONS = [
    { value: USER_STATUS.ACTIVE, label: 'Active' },
    { value: USER_STATUS.INACTIVE, label: 'Inactive' },
    { value: USER_STATUS.PENDING, label: 'Pending' },
];

export const INITIAL_USER_FORM = {
    username: '',
    email: '',
    role: USER_ROLES.OPERATOR,
    status: USER_STATUS.ACTIVE,
    phone: '',
    department: '',
};

export const ROLE_LEVELS = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user',
    GUEST: 'guest',
};