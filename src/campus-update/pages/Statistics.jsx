import { useMemo } from 'react';
import DataTable from '../components/DataTable.jsx';
import { PushPill } from '../components/Pills.jsx';
import { useData } from '../context/DataContext.jsx';
import { fmtDuration, fmtNum } from '../lib/format.js';

const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
const pct = (n) => (n == null ? '—' : `${n}%`);

export default function Statistics() {
  const { content } = useData();

  const { openRate, urgentRate, ranked } = useMemo(() => {
    const live = content.rows.filter((c) => c.status === 'Live');
    const pushed = live.filter((c) => c.push);
    const sorted = [...live].sort((a, b) => b.open - a.open);
    const ranked = sorted.length <= 5 ? sorted : [...sorted.slice(0, 3), ...sorted.slice(-2)];
    return {
      openRate: avg(pushed.map((c) => c.open)),
      urgentRate: avg(pushed.filter((c) => c.priority === 'Urgent').map((c) => c.open)),
      ranked,
    };
  }, [content.rows]);

  // Live computations from real content rows; metrics with no backend endpoint show —.
  const medianPublish = useMemo(() => {
    const secs = content.rows
      .filter((c) => c.createdAt && c.publishedAt)
      .map((c) => (new Date(c.publishedAt) - new Date(c.createdAt)) / 1000)
      .filter((n) => n >= 0)
      .sort((a, b) => a - b);
    if (!secs.length) return null;
    return secs[Math.floor(secs.length / 2)];
  }, [content.rows]);
  const dailyActive = useMemo(() => {
    const days = [...Array(7)].map((_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000);
      const key = d.toISOString().slice(0, 10);
      return [d.toLocaleDateString('en-GB', { weekday: 'short' }), content.rows.filter((c) => (c.publishedAt || '').slice(0, 10) === key).length];
    });
    return days;
  }, [content.rows]);
  const max = Math.max(1, ...dailyActive.map(([, n]) => n));

  const columns = [
    { key: 'title', label: 'Content', sort: true, render: (r) => (<><a className="cell-link" href="#/news">{r.title}</a><span className="cell-sub">{r.type}</span></>) },
    { key: 'audience', label: 'Audience', sort: true },
    { key: 'reach', label: 'Reach', sort: true, render: (r) => fmtNum(r.reach) },
    { key: 'open', label: 'Opened', sort: true, render: (r) => `${r.open}%` },
    { key: 'push', label: 'Push', sort: true, sortValue: (r) => (r.push ? 1 : 0), render: (r) => <PushPill sent={r.push} /> },
  ];

  return (
    <div>
      <div className="stats4" style={{ marginTop: 2 }}>
        <div className="stat"><h3>Notification open rate</h3><div className="v">{pct(openRate)}</div><div className="s" style={{ color: '#18181b' }}>Urgent notices: {pct(urgentRate)}</div></div>
        <div className="stat"><h3>Weekly active students</h3><div className="v">—</div><div className="s">No backend endpoint yet</div></div>
        <div className="stat"><h3>Median publish time</h3><div className="v">{medianPublish == null ? '—' : fmtDuration(Math.round(medianPublish)).replace(/ 0s$/, '')}</div><div className="s">Draft to live</div></div>
        <div className="stat"><h3>Calendar opens</h3><div className="v">—</div><div className="s">No backend endpoint yet</div></div>
      </div>

      <div className="box chart" style={{ border: 0, marginTop: 24 }}>
        <div className="box-h" style={{ marginBottom: 0 }}><h3 style={{ fontSize: 16 }}>Daily active students</h3><span className="muted-text">Last 7 days</span></div>
        <ul className="bars" aria-label="Daily active students for the last 7 days">
          {dailyActive.map(([d, n]) => (
            <li className="bar" key={d} title={`${d}: ${fmtNum(n)} students`}>
              <div style={{ height: `${Math.max(8, Math.round((n / max) * 145))}px` }} />
              <span>{d}<span className="sr-only">: {fmtNum(n)} students</span></span>
            </li>
          ))}
        </ul>
      </div>

      <div className="box" style={{ marginTop: 22, padding: '16px 16px 14px', borderRadius: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 500, margin: '2px 0 14px' }}>Best and worst performing</h3>
        <DataTable caption="Best and worst performing content" columns={columns} rows={ranked} pager={false} />
      </div>
    </div>
  );
}
