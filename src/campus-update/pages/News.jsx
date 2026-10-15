import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import DataTable from '../components/DataTable.jsx';
import RowMenu from '../components/RowMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { StatusPill, TypePill } from '../components/Pills.jsx';
import ContentCell, { openOf, reachOf } from '../components/ContentCell.jsx';
import { ContentModal } from '../components/forms.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useData } from '../context/DataContext.jsx';
import { CONTENT_TYPES, STATUSES } from '../data/metrics.js';

export default function News() {
  const { content, toast } = useData();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [modal, setModal] = useState(null); // { item? }
  const [del, setDel] = useState(null);
  const tools = useRef(null);

  useEffect(() => {
    if (!filterOpen) return;
    const away = (e) => { if (tools.current && !tools.current.contains(e.target)) setFilterOpen(false); };
    const esc = (e) => e.key === 'Escape' && setFilterOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [filterOpen]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return content.rows
      .filter((r) => (status === 'All' || r.status === status) && (type === 'All' || r.type === type))
      .filter((r) => !needle || [r.title, r.type, r.audience, r.source].join(' ').toLowerCase().includes(needle))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [content.rows, q, status, type]);

  const filtered = q || status !== 'All' || type !== 'All';
  const clear = () => { setQ(''); setStatus('All'); setType('All'); };

  const toggleLive = (r) => {
    const now = new Date().toISOString();
    if (r.status === 'Live') content.update(r.id, { status: 'Draft', updatedAt: now });
    else content.update(r.id, { status: 'Live', updatedAt: now, publishedAt: r.publishedAt || now, scheduledFor: null });
    toast(r.status === 'Live' ? 'Moved to drafts' : 'Published');
  };

  const columns = [
    { key: 'title', label: 'Content', sort: true, render: (r) => <ContentCell item={r} /> },
    { key: 'type', label: 'Type', sort: true, render: (r) => <TypePill type={r.type} priority={r.priority} /> },
    { key: 'audience', label: 'Audience', sort: true },
    { key: 'reach', label: 'Reach', sort: true, render: reachOf },
    { key: 'open', label: 'Opened', sort: true, render: openOf },
    { key: 'status', label: 'Status', sort: true, render: (r) => <StatusPill status={r.status} /> },
    {
      key: 'action', label: 'Action',
      render: (r) => (
        <RowMenu label={r.title} items={[
          { label: 'Edit', run: () => setModal({ item: r }) },
          { label: r.status === 'Live' ? 'Unpublish' : 'Publish now', run: () => toggleLive(r) },
          { label: 'Delete', danger: true, run: () => setDel(r) },
        ]} />
      ),
    },
  ];

  const add = <button type="button" className="btn btn-primary" onClick={() => setModal({})}><Icon n="plus" s={20} w={1.5} />New news article</button>;

  return (
    <div>
      <div className="toolbar" style={{ alignItems: 'center' }}>
        <div className="left-tools" ref={tools}>
          <label className="search">
            <Icon n="search" s={20} w={1.5} />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by content, type or audience" aria-label="Search by content, type or audience" />
          </label>
          <button type="button" className={'filter-btn' + (status !== 'All' || type !== 'All' ? ' active' : '')} aria-expanded={filterOpen} aria-haspopup="true" onClick={() => setFilterOpen((o) => !o)}>
            <Icon n="sliders" s={20} w={1.5} />Filter
          </button>
          {filterOpen && (
            <div className="pop filters" role="group" aria-label="Filter news">
              <p>Status</p>
              {['All', ...STATUSES].map((s) => <button key={s} type="button" aria-pressed={status === s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>{s === 'All' ? 'All statuses' : s}</button>)}
              <p>Type</p>
              {['All', ...CONTENT_TYPES].map((t) => <button key={t} type="button" aria-pressed={type === t} className={type === t ? 'on' : ''} onClick={() => setType(t)}>{t === 'All' ? 'All types' : t}</button>)}
            </div>
          )}
        </div>
        {add}
      </div>

      <DataTable
        caption="News and announcements"
        columns={columns}
        rows={rows}
        empty={
          filtered ? (
            <EmptyState title="No results" text="Nothing matches your search or filters." action={<button type="button" className="btn btn-line" onClick={clear}>Clear search and filters</button>} />
          ) : (
            <EmptyState title="No news yet" text="Publish your first article to reach students." action={add} />
          )
        }
      />

      {modal && (
        <ContentModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal.item) content.update(modal.item.id, data); else content.add(data);
            toast(modal.item ? 'Changes saved' : data.status === 'Live' ? 'Published' : 'Saved');
            setModal(null);
          }}
        />
      )}
      {del && <ConfirmDialog title="Delete this item?" text={`“${del.title}” will be removed for everyone. This can’t be undone.`} confirmLabel="Delete" danger onConfirm={() => { content.remove(del.id); toast('Deleted'); }} onClose={() => setDel(null)} />}
    </div>
  );
}
