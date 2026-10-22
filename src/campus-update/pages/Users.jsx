import { useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import DataTable from '../components/DataTable.jsx';
import RowMenu from '../components/RowMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { StatusPill } from '../components/Pills.jsx';
import { AdminModal, AdminSuccessModal } from '../components/forms.jsx';
import { AdminDetailsDialog, DeactivateAdminDialog, SuspendAdminDialog } from '../components/AdminActionDialogs.jsx';
import { useData } from '../context/DataContext.jsx';
import { initials, relativeTime } from '../lib/format.js';

export default function Users() {
  const { admins, institution, toast } = useData();
  const [modal, setModal] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deactivating, setDeactivating] = useState(null);
  const [suspending, setSuspending] = useState(null);

  const activate = (admin) => {
    admins.update(admin.id, {
      status: 'Active',
      activatedAt: new Date().toISOString(),
    });
    toast('Administrator activated');
  };

  const deactivate = (admin, reason) => {
    admins.update(admin.id, {
      status: 'Deactivated',
      deactivatedAt: new Date().toISOString(),
      deactivationReason: reason,
    });
    setDeactivating(null);
    toast('Administrator deactivated');
  };

  const suspend = (admin) => {
    admins.update(admin.id, {
      status: 'Suspended',
      suspendedAt: new Date().toISOString(),
    });
    setSuspending(null);
    toast('Administrator suspended');
  };

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
          { label: 'View Details', icon: 'eye', dividerAfter: true, run: () => setViewing(r) },
          { label: 'Edit Administrator', icon: 'edit', run: () => setModal({ item: r }) },
          ...(r.status === 'Active'
            ? [{ label: 'Suspend User', icon: 'pause', danger: true, run: () => setSuspending(r) }]
            : [{ label: 'Activate', icon: 'power', variant: 'success', run: () => activate(r) }]),
          ...(r.status === 'Deactivated' ? [] : [{ label: 'Deactivate User', icon: 'deactivate', danger: true, run: () => setDeactivating(r) }]),
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
        modal.success
          ? <AdminSuccessModal item={modal.success} onClose={() => setModal(null)} />
          : <AdminModal
            item={modal.item}
            existing={admins.rows}
            institutionName={institution.name}
            onClose={() => setModal(null)}
            onSave={(data) => {
              if (modal.item) {
                admins.update(modal.item.id, data);
                toast('Changes saved');
                setModal(null);
                return;
              }
              const created = { ...data, status: 'Active', lastActive: null, createdAt: new Date().toISOString() };
              admins.add(created);
              setModal({ success: created });
            }}
          />
      )}
      {viewing && (
        <AdminDetailsDialog
          item={viewing}
          onClose={() => setViewing(null)}
          onDeactivate={() => { setViewing(null); setDeactivating(viewing); }}
        />
      )}
      {deactivating && (
        <DeactivateAdminDialog
          item={deactivating}
          onClose={() => setDeactivating(null)}
          onConfirm={(reason) => deactivate(deactivating, reason)}
        />
      )}
      {suspending && (
        <SuspendAdminDialog
          item={suspending}
          onClose={() => setSuspending(null)}
          onConfirm={() => suspend(suspending)}
        />
      )}
    </div>
  );
}
