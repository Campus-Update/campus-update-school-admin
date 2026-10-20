import { useState } from 'react';
import { FormModal } from './Modal.jsx';
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
export function AdminModal({ item, existing, onClose, onSave }) {
  const editing = !!item;
  const { v, set, errors, submit } = useFormState(
    item || { name: '', email: '', role: ROLES[2], scope: '', status: 'Active', lastActive: null },
    (s) => clean({
      name: s.name.trim().length < 2 ? 'Enter the administrator’s name.' : undefined,
      email: !isEmail(s.email.trim())
        ? 'Enter a valid email address.'
        : existing.some((a) => a.id !== item?.id && a.email.toLowerCase() === s.email.trim().toLowerCase())
          ? 'An administrator with this email already exists.'
          : undefined,
      scope: !s.scope.trim() ? 'Describe what this administrator can publish.' : undefined,
    }),
    (s) => onSave({ ...s, name: s.name.trim(), email: s.email.trim(), scope: s.scope.trim() }),
  );
  return (
    <FormModal title={editing ? 'Edit administrator' : 'Add new administrator'} onClose={onClose} onSubmit={submit} submitLabel={editing ? 'Save changes' : 'Add administrator'}>
      <div className="grid2">
        <TextField label="Name" full value={v.name} onChange={(x) => set({ name: x })} error={errors.name} />
        <TextField label="Email address" type="email" full value={v.email} onChange={(x) => set({ email: x })} error={errors.email} autoComplete="off" />
        <SelectField label="Role" value={v.role} options={ROLES} onChange={(x) => set({ role: x })} />
        <SelectField label="Status" value={v.status} options={['Active', 'Suspended']} onChange={(x) => set({ status: x })} />
        <TextField label="Scope" full value={v.scope} placeholder="FOCIT · news and announcements" onChange={(x) => set({ scope: x })} error={errors.scope} hint="Where and what they can publish." />
      </div>
    </FormModal>
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
