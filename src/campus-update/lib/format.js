const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const pad = (n) => String(n).padStart(2, '0');

/** Parses ISO strings, "YYYY-MM-DD" (as local date) and "YYYY-MM-DDTHH:mm" (as local time). */
export function toDate(v) {
  if (v instanceof Date) return v;
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(v);
}

/** "18 Sep" */
export const fmtShort = (v) => {
  const d = toDate(v);
  return `${pad(d.getDate())} ${MON[d.getMonth()]}`;
};
/** "8 May 2026" */
export const fmtDate = (v) => {
  const d = toDate(v);
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
};
/** "8 May 2026, 10:00am" */
export const fmtDateTime = (v) => {
  const d = toDate(v);
  const h = d.getHours();
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}, ${h % 12 || 12}:${pad(d.getMinutes())}${h < 12 ? 'am' : 'pm'}`;
};
/** "Sun, 11 Oct 2026" */
export const fmtToday = (v = new Date()) => {
  const d = toDate(v);
  return `${WD[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
};

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** "59 min ago", "2 hours ago", "Yesterday", "12 days ago", then "25 Sep" for older dates. */
export function relativeTime(v, now = Date.now()) {
  if (!v) return 'Never';
  const d = toDate(v);
  const min = Math.floor((now - d.getTime()) / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${plural(hours, 'hour')} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const sameYear = d.getFullYear() === new Date(now).getFullYear();
  return sameYear ? fmtShort(d).replace(/^0/, '') : fmtDate(d);
}

export const greeting = (hour = new Date().getHours()) =>
  hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

/** "Dr. O. Eboreime" -> "OE", "Registrar's Office" -> "RO", "M. Athar" -> "MA" */
export function initials(name = '') {
  const parts = name
    .split(/\s+/)
    .map((p) => p.replace(/[^A-Za-z]/g, ''))
    .filter((p) => p && !/^(dr|prof|mr|mrs|ms|engr)$/i.test(p));
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

/** 102 -> "1m 42s" */
export function fmtDuration(sec) {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m ? `${m}m ${s}s` : `${s}s`;
}

export const fmtNum = (n) => Number(n).toLocaleString('en-US');
export const pluralize = plural;
export const nextId = (rows) => rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
