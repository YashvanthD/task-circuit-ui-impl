// Dummy AI utilities and demo data for the roaming assistant.
// This file provides a small set of "important items" and a helper to
// annotate existing DOM elements with data-next-action / data-critical
// attributes so the roaming assistant can discover them during scans.

export const dummyItems = [
  {
    key: 'reports-link',
    selector: 'a[href="/taskcircuit/user/reports"]',
    text: 'New financial reports are available — review now.',
    type: 'next-action',
    link: '/taskcircuit/user/reports',
    severity: 'medium',
  },
  {
    key: 'expenses-link',
    selector: 'a[href="/taskcircuit/user/expenses"]',
    text: 'Expense reports overdue — investigate immediately.',
    type: 'critical',
    link: '/taskcircuit/user/expenses',
    severity: 'high',
  },
  {
    key: 'ai-link',
    selector: 'a[href="/taskcircuit/user/ai"]',
    text: 'Open the AI chat assistant to ask for help.',
    type: 'next-action',
    link: '/taskcircuit/user/ai',
    severity: 'low',
  },
  {
    key: 'inbox-sample',
    // fallback to page header if inbox link doesn't exist
    selector: 'h3',
    text: 'You have 3 unread messages. Open the chat to respond.',
    type: 'next-action',
    link: '/taskcircuit/user/chat',
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

