export function formatDate(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleString();
}

export function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || val === '') return '';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercent(val) {
  if (val === null || val === undefined || val === '') return '';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return `${(n * 100).toFixed(1)}%`;
}

export function formatCurrency(val, currency = 'INR') {
  if (val === null || val === undefined || val === '') return '';
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return n.toLocaleString(undefined, { style: 'currency', currency });
}

export default { formatDate, formatNumber, formatPercent, formatCurrency };
