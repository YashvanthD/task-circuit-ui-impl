
// ============================================================================
// Report Constants
// ============================================================================

export const REPORT_TYPES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    ANNUAL: 'annual',
    CUSTOM: 'custom',
};

export const REPORT_TYPE_OPTIONS = [
    { value: REPORT_TYPES.DAILY, label: 'Daily Report' },
    { value: REPORT_TYPES.WEEKLY, label: 'Weekly Report' },
    { value: REPORT_TYPES.MONTHLY, label: 'Monthly Report' },
    { value: REPORT_TYPES.QUARTERLY, label: 'Quarterly Report' },
    { value: REPORT_TYPES.ANNUAL, label: 'Annual Report' },
    { value: REPORT_TYPES.CUSTOM, label: 'Custom Range' },
];

export const REPORT_CATEGORIES = {
    PRODUCTION: 'production',
    FINANCIAL: 'financial',
    INVENTORY: 'inventory',
    OPERATIONS: 'operations',
};

export const REPORT_CATEGORY_OPTIONS = [
    { value: REPORT_CATEGORIES.PRODUCTION, label: 'Production', icon: '📊' },
    { value: REPORT_CATEGORIES.FINANCIAL, label: 'Financial', icon: '💰' },
    { value: REPORT_CATEGORIES.INVENTORY, label: 'Inventory', icon: '📦' },
    { value: REPORT_CATEGORIES.OPERATIONS, label: 'Operations', icon: '⚙️' },
];
