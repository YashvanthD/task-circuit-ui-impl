// Dummy AI utilities and demo data for the roaming assistant.
// This file provides a small set of "important items" and a helper to
// annotate existing DOM elements with data-next-action / data-critical
// attributes so the roaming assistant can discover them during scans.

import {
  BASE_APP_PATH_USER_REPORTS,
  BASE_APP_PATH_USER_EXPENSES,
  BASE_APP_PATH_USER_AI,
  BASE_APP_PATH_USER_CHAT
} from '../../config';

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

export function getImportantItems() {
  return dummyItems;
}

// Annotate DOM elements that match the selectors provided in dummyItems.
// For each match we set either data-next-action or data-critical.
// Returns number of elements annotated.
export function annotateImportantItems() {
  if (typeof document === 'undefined') return 0;
  let count = 0;
  for (const item of dummyItems) {
    try {
      const el = document.querySelector(item.selector);
      if (el) {
        if (item.type === 'critical') {
          el.setAttribute('data-critical', item.text);
        } else {
          el.setAttribute('data-next-action', item.text);
        }
        // add a data-alert attribute for high severity so assistant shows badge
        if (item.severity === 'high') el.setAttribute('data-alert', '1');
        // attach a data-link so the assistant or tooltip can use it
        if (item.link) el.setAttribute('data-assistant-link', item.link);
        count += 1;
      }
    } catch (e) {
      // ignore selector errors
      // eslint-disable-next-line no-console
      console.warn('annotateImportantItems failed for', item.selector, e);
    }
  }
  return count;
}
