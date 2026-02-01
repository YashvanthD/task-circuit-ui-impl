import {
    BASE_APP_PATH_USER_AI,
    BASE_APP_PATH_USER_CHAT,
    BASE_APP_PATH_USER_EXPENSES,
    BASE_APP_PATH_USER_REPORTS
} from "../../config";

export const dummyItems = [
    {
        key: 'reports-link',
        selector: `a[href="${BASE_APP_PATH_USER_REPORTS}"]`,
        text: 'New financial reports are available — review now.',
        type: 'next-action',
        link: BASE_APP_PATH_USER_REPORTS,
        severity: 'medium',
    },
    {
        key: 'expenses-link',
        selector: `a[href="${BASE_APP_PATH_USER_EXPENSES}"]`,
        text: 'Expense reports overdue — investigate immediately.',
        type: 'critical',
        link: BASE_APP_PATH_USER_EXPENSES,
        severity: 'high',
    },
    {
        key: 'ai-link',
        selector: `a[href="${BASE_APP_PATH_USER_AI}"]`,
        text: 'Open the AI chat assistant to ask for help.',
        type: 'next-action',
        link: BASE_APP_PATH_USER_AI,
        severity: 'low',
    },
    {
        key: 'inbox-sample',
        // fallback to page header if inbox link doesn't exist
        selector: 'h3',
        text: 'You have 3 unread messages. Open the chat to respond.',
        type: 'next-action',
        link: BASE_APP_PATH_USER_CHAT,
        severity: 'low',
    }
];
