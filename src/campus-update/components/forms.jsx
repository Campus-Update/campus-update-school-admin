import { useState } from 'react';
import { FormModal, Modal } from './Modal.jsx';
import { AreaField, CheckField, SelectField, StatusField, TextField } from './Fields.jsx';
import { AUDIENCES, CATEGORIES, CONTENT_TYPES, PRIORITIES, ROLES } from '../data/metrics.js';
import { isEmail } from '../lib/format.js';

const focusFirstError = () =>
  requestAnimationFrame(() => document.querySelector('.modal [aria-invalid="true"]')?.focus());

function useFormState(initial, validate, onValid) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (patch) => setV((s) => ({ ...s, ...patch }));
  const submit = (e) => {
    e.preventDefault();
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError();
    onValid(v);
  };
  return { v, set, errors, submit };
}

const scheduleError = (v) => (v.status === 'Scheduled' && !v.scheduledFor ? 'Choose when this should go live.' : undefined);
const clean = (errs) => Object.fromEntries(Object.entries(errs).filter(([, m]) => m));

/* ---------- News / announcements ---------- */
export function ContentModal({ item, onClose, onSave }) {
  const editing = !!item;
  const { v, set, errors, submit } = useFormState(
    item || { title: '', type: 'News', priority: 'Normal', source: 'FOCIT Comms', audience: AUDIENCES[0], status: 'Draft', scheduledFor: '', push: false },
    (s) => clean({
      title: s.title.trim().length < 3 ? 'Enter a title of at least 3 characters.' : undefined,
      source: !s.source.trim() ? 'Enter who is publishing this.' : undefined,
      scheduledFor: scheduleError(s),
    }),
    (s) => {
      const now = new Date().toISOString();
      const goingLive = s.status === 'Live' && !s.publishedAt;
      onSave({
        ...s,
        title: s.title.trim(),
        source: s.source.trim(),
        scheduledFor: s.status === 'Scheduled' ? s.scheduledFor : null,
        updatedAt: now,
        publishedAt: goingLive ? now : s.publishedAt ?? null,
        reach: s.reach ?? 0, open: s.open ?? 0, readSec: s.readSec ?? 0,
      });
    },
  );
  return (
    <FormModal title={editing ? 'Edit news item' : 'New news article'} onClose={onClose} onSubmit={submit} submitLabel={editing ? 'Save changes' : 'Create'}>
      <div className="grid2">
        <TextField label="Title" full value={v.title} onChange={(x) => set({ title: x })} error={errors.title} />
        <SelectField label="Type" value={v.type} options={CONTENT_TYPES} onChange={(x) => set({ type: x })} />
        <SelectField label="Priority" value={v.priority} options={PRIORITIES} onChange={(x) => set({ priority: x })} />
        <SelectField label="Audience" value={v.audience} options={AUDIENCES.includes(v.audience) ? AUDIENCES : [v.audience, ...AUDIENCES]} onChange={(x) => set({ audience: x })} />
        <TextField label="Published by" value={v.source} onChange={(x) => set({ source: x })} error={errors.source} />
        <StatusField status={v.status} scheduledFor={v.scheduledFor} onChange={set} error={errors.scheduledFor} />
        <CheckField label="Send a push notification" hint="Students get an alert when this goes live." checked={v.push} onChange={(x) => set({ push: x })} />
      </div>
    </FormModal>
  );
}

/* ---------- Events ---------- */
export function EventModal({ item, onClose, onSave }) {
  const editing = !!item;
  const { v, set, errors, submit } = useFormState(
    item || { title: '', when: '', venue: '', status: 'Draft', scheduledFor: '' },
    (s) => clean({
      title: s.title.trim().length < 3 ? 'Enter an event name of at least 3 characters.' : undefined,
      when: !s.when ? 'Choose the date and time of the event.' : undefined,
      venue: !s.venue.trim() ? 'Enter where the event will take place.' : undefined,
      scheduledFor: scheduleError(s),
    }),
    (s) => onSave({ ...s, title: s.title.trim(), venue: s.venue.trim(), type: 'Official', scheduledFor: s.status === 'Scheduled' ? s.scheduledFor : null, saved: s.saved ?? 0 }),
  );
  return (
    <FormModal title={editing ? 'Edit event' : 'New event'} onClose={onClose} onSubmit={submit} submitLabel={editing ? 'Save changes' : 'Create'}>
      <div className="grid2">
        <TextField label="Event name" full value={v.title} onChange={(x) => set({ title: x })} error={errors.title} />
        <TextField label="Date and time" type="datetime-local" value={v.when} onChange={(x) => set({ when: x })} error={errors.when} />
        <TextField label="Venue" value={v.venue} onChange={(x) => set({ venue: x })} error={errors.venue} />
        <StatusField status={v.status} scheduledFor={v.scheduledFor} onChange={set} error={errors.scheduledFor} />
      </div>
    </FormModal>
  );
}

/* ---------- Calendar ---------- */
export function CalendarModal({ item, onClose, onSave }) {
  const editing = !!item;
  const { v, set, errors, submit } = useFormState(
    item || { title: '', date: '', category: CATEGORIES[0], status: 'Draft', scheduledFor: '' },
    (s) => clean({
      title: s.title.trim().length < 3 ? 'Enter a title of at least 3 characters.' : undefined,
      date: !s.date ? 'Choose a date.' : undefined,
      scheduledFor: scheduleError(s),
    }),
    (s) => onSave({ ...s, title: s.title.trim(), scheduledFor: s.status === 'Scheduled' ? s.scheduledFor : null }),
  );
  return (
    <FormModal title={editing ? 'Edit schedule' : 'Add schedule'} onClose={onClose} onSubmit={submit} submitLabel={editing ? 'Save changes' : 'Add schedule'}>
      <div className="grid2">
        <TextField label="Title" full value={v.title} onChange={(x) => set({ title: x })} error={errors.title} />
        <TextField label="Date" type="date" value={v.date} onChange={(x) => set({ date: x })} error={errors.date} />
        <SelectField label="Category" value={v.category} options={CATEGORIES} onChange={(x) => set({ category: x })} />
        <StatusField status={v.status} scheduledFor={v.scheduledFor} onChange={set} error={errors.scheduledFor} />
      </div>
    </FormModal>
  );
}

/* ---------- Administrators ---------- */
export function AdminModal({ item, existing, institutionName, onClose, onSave }) {
  const editing = !!item;
  const [firstName = '', ...lastNameParts] = (item?.name || '').split(/\s+/);
  const { v, set, errors, submit } = useFormState(
    item ? {
      firstName,
      lastName: lastNameParts.join(' '),
      email: item.email,
      role: item.role,
      scope: item.scope,
      status: item.status,
      lastActive: item.lastActive,
    } : { firstName: '', lastName: '', email: '', role: '', scope: '', status: 'Active', lastActive: null },
    (s) => clean({
      firstName: s.firstName.trim().length < 1 ? 'Enter the administrator’s first name.' : undefined,
      lastName: s.lastName.trim().length < 1 ? 'Enter the administrator’s last name.' : undefined,
      email: !isEmail(s.email.trim())
        ? 'Enter a valid email address.'
        : existing.some((a) => a.id !== item?.id && a.email.toLowerCase() === s.email.trim().toLowerCase())
          ? 'An administrator with this email already exists.'
          : undefined,
      role: !s.role ? 'Select an administrator role.' : undefined,
    }),
    (s) => onSave({
      name: `${s.firstName.trim()} ${s.lastName.trim()}`,
      email: s.email.trim(),
      role: s.role,
      scope: s.scope.trim(),
      status: s.status,
      lastActive: s.lastActive,
    }),
  );
  return (
    <FormModal title={editing ? 'Edit Administrator' : 'Add administrator'} onClose={onClose} onSubmit={submit} submitLabel={editing ? 'Save Changes' : 'Add administrator'} size={editing ? 'admin-edit' : 'admin'}>
      <p className="admin-modal-subtitle">
        {editing ? 'Update administrator details' : `They can publish only for ${institutionName}.`}
      </p>
      <div className="grid2 admin-form-grid">
        <TextField label="Full name *" value={v.firstName} placeholder="e.g. Aisha" autoComplete="given-name" onChange={(x) => set({ firstName: x })} error={errors.firstName} />
        <TextField label="Last Name *" value={v.lastName} placeholder="e.g. Bello" autoComplete="family-name" onChange={(x) => set({ lastName: x })} error={errors.lastName} />
        <TextField label="Email Address *" type="email" full value={v.email} placeholder="Enter email address" onChange={(x) => set({ email: x })} error={errors.email} autoComplete="off" />
        <SelectField label="Role *" full value={v.role} options={ROLES} placeholder="Select a role" onChange={(x) => set({ role: x })} error={errors.role} />
        <TextField label="Scope" full value={v.scope} placeholder="e.g FOCIT" onChange={(x) => set({ scope: x })} hint="What this administrator is allowed to publish, and to whom." />
      </div>
    </FormModal>
  );
}

export function AdminSuccessModal({ item, onClose }) {
  const addedOn = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(item.createdAt));

  return (
    <Modal title="Administrator Added Successfully" onClose={onClose} size="admin-success" hideHeader>
      <div className="admin-success">
        <div className="admin-success-mark"><Icon n="check" s={44} w={2.5} /></div>
        <h2>Administrator Added Successfully</h2>
        <p className="admin-success-copy">
          {item.name} has been added to this device’s administrator list. Invitation email delivery isn’t available in this build.
        </p>
        <dl className="admin-success-details">
          <div><dt>Name</dt><dd>{item.name}</dd></div>
          <div><dt>Email</dt><dd>{item.email}</dd></div>
          <div><dt>Role</dt><dd>{item.role.replace(/\b\w/g, (letter) => letter.toUpperCase())}</dd></div>
          <div><dt>Status</dt><dd className="admin-success-active">{item.status}</dd></div>
          <div><dt>Added on</dt><dd>{addedOn}</dd></div>
        </dl>
        <div className="admin-success-actions">
          <button type="button" className="btn btn-line" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Back to user management</button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Emergency alert ---------- */
export function AlertModal({ onClose, onSave }) {
  const { v, set, errors, submit } = useFormState(
    { title: '', message: '' },
    (s) => clean({
      title: s.title.trim().length < 3 ? 'Enter a short alert title.' : undefined,
      message: s.message.trim().length < 10 ? 'Write what students need to do (at least 10 characters).' : undefined,
    }),
    (s) => onSave({ title: s.title.trim(), message: s.message.trim(), sentAt: new Date().toISOString() }),
  );
  return (
    <FormModal title="Broadcast emergency alert" onClose={onClose} onSubmit={submit} submitLabel="Broadcast alert">
      <p className="confirm-text" style={{ marginBottom: 14 }}>This sends a high-priority notification to every registered student and staff member.</p>
      <div className="grid2">
        <TextField label="Alert title" full value={v.title} onChange={(x) => set({ title: x })} error={errors.title} />
        <AreaField label="Message" value={v.message} onChange={(x) => set({ message: x })} error={errors.message} />
      </div>
    </FormModal>
  );
}
