import { useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import DataTable from '../components/DataTable.jsx';
import RowMenu from '../components/RowMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ScopePill, StatusPill } from '../components/Pills.jsx';
import { EventModal } from '../components/forms.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useData } from '../context/DataContext.jsx';
import { fmtDateTime, fmtNum, toDate } from '../lib/format.js';

export default function Events() {
  const { events, toast } = useData();
  const [modal, setModal] = useState(null);
  const [del, setDel] = useState(null);

  const rows = [...events.rows].sort((a, b) => toDate(a.when) - toDate(b.when));
  const sub = (e) => (e.type === 'Promoted' ? 'Placed by Campus Update · not yours to edit' : e.status === 'Live' ? `Saved by ${fmtNum(e.saved)} students` : 'Not visible to students yet');

  const columns = [
    { key: 'title', label: 'Event', sort: true, render: (r) => (<><span className="cell-link">{r.title}</span><span className="cell-sub">{sub(r)}</span></>) },
    { key: 'when', label: 'When', sort: true, sortValue: (r) => toDate(r.when).getTime(), render: (r) => fmtDateTime(r.when) },
    { key: 'venue', label: 'Venue', sort: true },
    { key: 'type', label: 'Type', sort: true, render: (r) => <ScopePill type={r.type} /> },
    { key: 'status', label: 'Status', sort: true, render: (r) => <StatusPill status={r.status} /> },
    {
      key: 'action', label: 'Action',
      render: (r) => (
        <RowMenu label={r.title} items={r.type === 'Promoted'
          ? [{ label: 'Not yours to edit', disabled: true }]
          : [{ label: 'Edit', run: () => setModal({ item: r }) }, { label: 'Delete', danger: true, run: () => setDel(r) }]} />
      ),
    },
  ];

  const add = <button type="button" className="btn btn-primary" onClick={() => setModal({})}><Icon n="plus" s={20} w={1.5} />New event</button>;

  return (
    <div>
      <div className="toolbar">
        <div className="note"><span><b>Official events are free to publish.</b> External organizers cannot submit here — they contact Campus Update directly, and their events appear to students marked as promoted.</span></div>
        {add}
      </div>
      <DataTable caption="Events" columns={columns} rows={rows} empty={<EmptyState title="No events yet" text="Create an official event for students to save." action={add} />} />
      {modal && (
        <EventModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal.item) events.update(modal.item.id, data); else events.add(data);
            toast(modal.item ? 'Changes saved' : 'Event created');
            setModal(null);
          }}
        />
      )}
      {del && <ConfirmDialog title="Delete this event?" text={`“${del.title}” will be removed from students’ events. This can’t be undone.`} confirmLabel="Delete" danger onConfirm={() => { events.remove(del.id); toast('Deleted'); }} onClose={() => setDel(null)} />}
    </div>
  );
}
