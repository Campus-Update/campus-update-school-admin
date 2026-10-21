import { Icon } from './Icons.jsx';

/** Live / Draft / Scheduled for content, Active / Suspended for administrators. */
export function StatusPill({ status }) {
  if (status === 'Draft')
    return <span className="pill draft"><Icon n="pencil" s={15} w={1.4} />Draft</span>;
  if (status === 'Scheduled')
    return <span className="pill sched"><Icon n="clock" s={15} w={1.4} />Scheduled</span>;
  if (status === 'Pending')
    return <span className="pill sched"><Icon n="clock" s={15} w={1.4} />Pending approval</span>;
  if (status === 'Rejected')
    return <span className="pill warn"><i />Rejected</span>;
  if (status === 'Suspended')
    return <span className="pill warn"><i />Suspended</span>;
  return <span className="pill ok"><i />{status}</span>;
}

/** The label is always the content type; the dot colour carries priority. */
export function TypePill({ type, priority }) {
  const cls = priority === 'Urgent' ? 'urgent' : priority === 'Important' ? 'important' : type === 'Announcement' ? 'normal' : 'neutral';
  return <span className={'pill ' + cls}><i />{type}</span>;
}

export const ScopePill = ({ type }) => (
  <span className="pill out"><Icon n="shield" s={15} w={1.5} />{type}</span>
);

export const PushPill = ({ sent }) =>
  sent ? <span className="pill ok"><i />Sent</span> : <span className="muted-text">Not sent</span>;
