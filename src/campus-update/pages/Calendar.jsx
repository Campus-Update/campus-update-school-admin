import { useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import DataTable from '../components/DataTable.jsx';
import RowMenu from '../components/RowMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { StatusPill } from '../components/Pills.jsx';
import { CalendarModal } from '../components/forms.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useData } from '../context/DataContext.jsx';
import { fmtShort, toDate } from '../lib/format.js';

export default function Calendar() {
  const { calendar, institution, toast } = useData();
  const [modal, setModal] = useState(null);
  const [del, setDel] = useState(null);
  const rows = [...calendar.rows].sort((a, b) => toDate(a.date) - toDate(b.date));

  const columns = [
    { key: 'date', label: 'Date', sort: true, sortValue: (r) => toDate(r.date).getTime(), render: (r) => fmtShort(r.date) },
    { key: 'title', label: 'Title', sort: true, render: (r) => <strong>{r.title}</strong> },
    { key: 'category', label: 'Category', sort: true, render: (r) => <span className="pill cat">{r.category}</span> },
    { key: 'status', label: 'Status', sort: true, render: (r) => <StatusPill status={r.status} /> },
    {
      key: 'action', label: 'Action',
      render: (r) => (
        <RowMenu label={r.title} items={[
          { label: 'Edit', run: () => setModal({ item: r }) },
          { label: r.status === 'Live' ? 'Unpublish' : 'Publish now', run: () => { calendar.update(r.id, { status: r.status === 'Live' ? 'Draft' : 'Live', scheduledFor: null }); toast(r.status === 'Live' ? 'Moved to drafts' : 'Published'); } },
          { label: 'Delete', danger: true, run: () => setDel(r) },
        ]} />
      ),
    },
  ];

  const add = <button type="button" className="btn btn-primary" onClick={() => setModal({})}><Icon n="plus" s={20} w={1.5} />Add schedule</button>;

  return (
    <div>
      <div className="toolbar">
        <div className="note"><span><b>Calendar dates are institutional.</b> Only administrators at {institution.name} can add or change these. Students can read them but never edit.</span></div>
        {add}
      </div>
      <DataTable caption="Academic calendar" columns={columns} rows={rows} empty={<EmptyState title="No dates yet" text="Add the first date for this academic session." action={add} />} />
      {modal && (
        <CalendarModal
          item={modal.item}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal.item) calendar.update(modal.item.id, data); else calendar.add(data);
            toast(modal.item ? 'Changes saved' : 'Schedule added');
            setModal(null);
          }}
        />
      )}
      {del && <ConfirmDialog title="Delete this date?" text={`“${del.title}” will be removed from the academic calendar.`} confirmLabel="Delete" danger onConfirm={() => { calendar.remove(del.id); toast('Deleted'); }} onClose={() => setDel(null)} />}
    </div>
  );
}
