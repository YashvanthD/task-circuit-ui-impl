
// ============================================================================
// Expense Constants
// ============================================================================

export const EXPENSE_CATEGORIES = {
    FEED: 'feed',
    EQUIPMENT: 'equipment',
    LABOR: 'labor',
    UTILITIES: 'utilities',
    MAINTENANCE: 'maintenance',
    OTHER: 'other',
};

export const EXPENSE_CATEGORY_OPTIONS = [
    { value: EXPENSE_CATEGORIES.FEED, label: 'Feed', icon: '🍚' },
    { value: EXPENSE_CATEGORIES.EQUIPMENT, label: 'Equipment', icon: '🔧' },
    { value: EXPENSE_CATEGORIES.LABOR, label: 'Labor', icon: '👷' },
    { value: EXPENSE_CATEGORIES.UTILITIES, label: 'Utilities', icon: '💡' },
    { value: EXPENSE_CATEGORIES.MAINTENANCE, label: 'Maintenance', icon: '🛠️' },
    { value: EXPENSE_CATEGORIES.OTHER, label: 'Other', icon: '📦' },
];

export const EXPENSE_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PAID: 'paid',
};

export const EXPENSE_STATUS_OPTIONS = [
    { value: EXPENSE_STATUS.PENDING, label: 'Pending' },
    { value: EXPENSE_STATUS.APPROVED, label: 'Approved' },
    { value: EXPENSE_STATUS.REJECTED, label: 'Rejected' },
    { value: EXPENSE_STATUS.PAID, label: 'Paid' },
];

export const INITIAL_EXPENSE_FORM = {
    title: '',
    category: EXPENSE_CATEGORIES.OTHER,
    amount: '',
    date: '',
    description: '',
    status: EXPENSE_STATUS.PENDING,
};
