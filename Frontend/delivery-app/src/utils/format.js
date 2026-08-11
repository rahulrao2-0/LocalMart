const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrPrecise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ₹1,285 — or ₹1,285.50 when `precise`. */
export const formatCurrency = (value, { precise = false } = {}) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return precise ? inrPrecise.format(amount) : inr.format(amount);
};

/** Compact form for tight cards: ₹1.2L, ₹84.2k, ₹640. */
export const formatCompactCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  if (Math.abs(amount) >= 1e5) return `₹${(amount / 1e5).toFixed(1)}L`;
  if (Math.abs(amount) >= 1e3) return `₹${(amount / 1e3).toFixed(1)}k`;
  return `₹${Math.round(amount)}`;
};

export const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
};

/** "2 hours ago" style label, falling back to a date beyond a week. */
export const formatRelative = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return formatDate(value);
};

/** Masks all but the last four digits: +91 98450 ••••3 → +91 •••• 11223. */
export const maskPhone = (phone = '') => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `••••• ${digits.slice(-4)}`;
};

export const telHref = (phone = '') => `tel:${phone.replace(/[^\d+]/g, '')}`;
