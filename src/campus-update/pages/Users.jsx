import { useEffect, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import DataTable from '../components/DataTable.jsx';
import RowMenu from '../components/RowMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { StatusPill } from '../components/Pills.jsx';
import { AdminModal, AdminSuccessModal } from '../components/forms.jsx';
import { AdminDetailsDialog, DeactivateAdminDialog, SuspendAdminDialog } from '../components/AdminActionDialogs.jsx';
import { useData } from '../context/DataContext.jsx';
import { adminsApi } from '../../lib/api.js';
import { initials, relativeTime } from '../lib/format.js';


function DelegatedAdmins() {
  const { profile, toast } = useData();
  const [rows, setRows] = useState(null);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'NewsAdmin' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const load = () => { if (profile.institutionId) adminsApi.list(profile.institutionId).then((r) => setRows(Array.isArray(r) ? r : r?.items || [])).catch(() => setRows([])); else setRows([]); };
  useEffect(() => { load(); }, [profile.institutionId]);
  const create = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await adminsApi.create({ ...f, institutionId: profile.institutionId }); toast('Delegated admin created.'); setOpen(false); setF({ email: '', password: '', firstName: '', lastName: '', role: 'NewsAdmin' }); load(); }
    catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  const toggle = async (r) => {
    try { await adminsApi.update(r.id, { isActive: r.isActive === false }); toast(r.isActive === false ? 'Admin reactivated.' : 'Admin deactivated.'); load(); }
    catch (e2) { toast(`Update failed: ${e2.message}`); }
  };
  if (!rows) return null;
  return (
    <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center justify-between">
        <div><b className="text-sm">Delegated admins ({rows.length})</b><p className="text-xs text-[#6B7280]">Contract §17: you provision NewsAdmin and CalendarAdmin accounts for your institution.</p></div>
        <button type="button" className="btn btn-solid" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Add delegated admin'}</button>
      </div>
      {open && (
        <form onSubmit={create} className="mt-3 grid gap-2 sm:grid-cols-2">
          <input className="h-9 rounded-lg border border-[#D1D5DC] px-3 text-sm" placeholder="First name" required value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} />
          <input className="h-9 rounded-lg border border-[#D1D5DC] px-3 text-sm" placeholder="Last name" required value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} />
          <input className="h-9 rounded-lg border border-[#D1D5DC] px-3 text-sm" type="email" placeholder="Email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <input className="h-9 rounded-lg border border-[#D1D5DC] px-3 text-sm" type="password" placeholder="Password (12+ chars)" required minLength={12} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          <select className="h-9 rounded-lg border border-[#D1D5DC] px-3 text-sm" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
            <option value="NewsAdmin">News administrator</option>
            <option value="CalendarAdmin">Calendar administrator</option>
          </select>
          <button type="submit" className="btn btn-solid" disabled={busy}>{busy ? 'Creating…' : 'Create admin'}</button>
          {err && <p className="text-xs text-red-600 sm:col-span-2">{err}</p>}
        </form>
      )}
      {rows.map((r) => (
        <div key={r.id} className="mt-2 flex items-center justify-between rounded-lg border border-[#E5E7EB] p-2">
          <div className="text-sm"><b>{r.firstName} {r.lastName}</b> <span className="ml-2 text-xs text-[#6B7280]">{r.email} · {r.role}</span></div>
          <button type="button" className="btn btn-line" onClick={() => toggle(r)}>{r.isActive === false ? 'Reactivate' : 'Deactivate'}</button>
        </div>
      ))}
    </div>
  );
}

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
      <DelegatedAdmins />
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
