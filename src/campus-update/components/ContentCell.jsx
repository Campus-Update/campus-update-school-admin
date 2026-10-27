import { fmtShort, relativeTime } from '../lib/format.js';

export function contentSub(item) {
  const parts = [item.source];
  if (item.priority !== 'Normal' && item.status === 'Live') parts.push(item.priority);
  if (item.status === 'Scheduled') parts.push(`Goes live ${fmtShort(item.scheduledFor)}`);
  else parts.push(relativeTime(item.updatedAt));
  if (item.status === 'Live' && item.push) parts.push('push sent');
  return parts.join(' · ');
}

export default function ContentCell({ item }) {
  return (
    <>
      <a className="cell-link" href="#/news">{item.title}</a>
      <span className="cell-sub">{contentSub(item)}</span>
    </>
  );
}

export const reachOf = (r) => (r.status === 'Live' ? r.reach.toLocaleString('en-US') : '—');
export const openOf = (r) => (r.status === 'Live' ? `${r.open}%` : '—');
