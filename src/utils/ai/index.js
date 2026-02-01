// Dummy AI utilities and demo data for the roaming assistant.
// This file provides a small set of "important items" and a helper to
// annotate existing DOM elements with data-next-action / data-critical
// attributes so the roaming assistant can discover them during scans.

import {dummyItems} from "./mock_data";

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
