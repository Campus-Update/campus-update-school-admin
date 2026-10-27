import { useState } from 'react';
import { Icon } from './Icons.jsx';
import { Modal } from './Modal.jsx';

const displayDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

function AdminDetails({ item }) {
  const fields = [
    ['Name', item.name],
    ['Email', item.email],
    ['Role', item.role],
    ['Scope', item.scope],
    ['Status', item.status],
    ['Added on', displayDate(item.createdAt)],
    ...(item.deactivationReason ? [['Deactivation reason', item.deactivationReason]] : []),
  ];
  return (
    <dl className="admin-details-list">
      {fields.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd className={label === 'Status' ? `admin-status-${item.status.toLowerCase()}` : ''}>{value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AdminDetailsDialog({ item, onClose, onDeactivate }) {
  return (
    <Modal title="Administrator Details" onClose={onClose} size="admin-details">
      <div className="modal-b admin-details-body">
        <AdminDetails item={item} />
      </div>
      <div className="modal-f admin-details-actions">
        <button type="button" className="btn btn-line" onClick={onClose}>Cancel</button>
        {item.status !== 'Deactivated' && (
          <button type="button" className="btn btn-danger" onClick={onDeactivate}>Deactivate administrator</button>
        )}
      </div>
    </Modal>
  );
}

export function DeactivateAdminDialog({ item, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!reason.trim()) {
      setError('Enter a reason for deactivation.');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <Modal title="Deactivate Account?" onClose={onClose} size="admin-deactivate">
      <form onSubmit={submit} noValidate>
        <div className="modal-b admin-deactivate-body">
          <p className="admin-confirm-copy">
            Are you sure you want to deactivate <b>{item.name}</b>? They will lose access to the platform immediately, but their data will be preserved.
          </p>
          <AdminDetails item={item} />
          <label className="admin-reason-label" htmlFor="deactivation-reason">Reason for Deactivation *</label>
          <textarea
            id="deactivation-reason"
            value={reason}
            onChange={(event) => { setReason(event.target.value); setError(''); }}
            placeholder="Enter reason for deactivation..."
            aria-invalid={!!error}
            aria-describedby={error ? 'deactivation-reason-error' : undefined}
          />
          {error && <p id="deactivation-reason-error" className="err" role="alert">{error}</p>}
        </div>
        <div className="modal-f admin-deactivate-actions">
          <button type="button" className="btn btn-line" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-danger"><Icon n="deactivate" s={15} />Deactivate Administrator</button>
        </div>
      </form>
    </Modal>
  );
}

export function SuspendAdminDialog({ item, onClose, onConfirm }) {
  const [confirmation, setConfirmation] = useState('');
  const isConfirmed = confirmation === 'SUSPEND';

  return (
    <Modal title="Suspend Account" onClose={onClose} size="admin-suspend">
      <form onSubmit={(event) => { event.preventDefault(); if (isConfirmed) onConfirm(); }} noValidate>
        <div className="modal-b admin-suspend-body">
          <p className="admin-confirm-copy">
            Suspending <b>{item.name}</b> will immediately block their access. Their account and activity history are preserved, and an administrator can reactivate them later.
          </p>
          <div className="admin-warning"><Icon n="warning" s={16} />Access will be blocked until the account is activated again.</div>
          <label className="admin-reason-label" htmlFor="suspend-confirmation">Type SUSPEND to confirm *</label>
          <input
            id="suspend-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <div className="modal-f admin-suspend-actions">
          <button type="button" className="btn btn-line" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-danger" disabled={!isConfirmed}>
            <Icon n="pause" s={15} />Suspend Administrator
          </button>
        </div>
      </form>
    </Modal>
  );
}
