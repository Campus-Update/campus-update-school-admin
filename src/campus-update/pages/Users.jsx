import { useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import DataTable from '../components/DataTable.jsx';
import RowMenu from '../components/RowMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { StatusPill } from '../components/Pills.jsx';
import { AdminModal } from '../components/forms.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useData } from '../context/DataContext.jsx';
import { initials, relativeTime } from '../lib/format.js';

export default function Users() {
  const { admins, toast } = useData();
  const [modal, setModal] = useState(null);
  const [del, setDel] = useState(null);

  const columns = [
    { key: 'name', label: 'Administrator', sort: true, render: (r) => (
      <div className="adm"><span className="avatar-i" aria-hidden="true">{initials(r.name)}</span><div><b>{r.name}</b><small>{r.email}</small></div></div>
    ) },
    { key: 'role', label: 'Role', sort: true },
    { key: 'scope', label: 'Scope', sort: true },
    { key: 'status', label: 'Status', sort: true, render: (r) => <StatusPill status={r.status} /> },
    { key: 'lastActive', label: 'Last active', sort: true, sortValue: (r) => (r.lastActive ? new Date(r.lastActive).getTime() : 0), render: (r) => relativeTime(r.lastActive) },
    {
      key: 'action', label: 'Action',
      render: (r) => (
        <RowMenu label={r.name} items={[
          { label: 'Edit', run: () => setModal({ item: r }) },
          { label: r.status === 'Active' ? 'Suspend' : 'Reactivate', run: () => { admins.update(r.id, { status: r.status === 'Active' ? 'Suspended' : 'Active' }); toast(r.status === 'Active' ? 'Administrator suspended' : 'Administrator reactivated'); } },
          { label: 'Remove', danger: true, run: () => setDel(r) },
        ]} />
      ),
    },
  ];

  const add = <button type="button" className="btn btn-primary" onClick={() => setModal({})}><Icon n="plus" s={20} w={1.5} />Add new administrator</button>;

  return (
    <div>
      <div className="toolbar">
        <div className="note"><span><b>Publishing rights are scoped.</b> A department administrator can only reach their own department. Nobody at a school can publish to another institution.</span></div>
        <div className="note"><span><b>Administrators are provisioned by the Campus Update platform team.</b> Contract §11 makes admin creation and listing SuperAdmin-only, so this list stays on this device by design.</span></div>
        {add}
      </div>
      <DataTable caption="Administrators" columns={columns} rows={admins.rows} empty={<EmptyState title="No administrators" text="Add someone who can publish on behalf of your institution." action={add} />} />
      {modal && (
        <AdminModal
          item={modal.item}
          existing={admins.rows}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal.item) admins.update(modal.item.id, data); else admins.add(data);
            toast(modal.item ? 'Changes saved' : 'Administrator added');
            setModal(null);
          }}
        />
      )}
      {del && <ConfirmDialog title="Remove this administrator?" text={`${del.name} will no longer be able to publish for your institution.`} confirmLabel="Remove" danger onConfirm={() => { admins.remove(del.id); toast('Administrator removed'); }} onClose={() => setDel(null)} />}
    </div>
  );
}
