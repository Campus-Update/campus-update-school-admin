import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import DataTable from '../components/DataTable.jsx';
import { calendarApi } from '../../lib/api.js';
import RowMenu from '../components/RowMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ItemDetailsDialog from '../components/ItemDetailsDialog.jsx';
import { StatusPill } from '../components/Pills.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useData } from '../context/DataContext.jsx';
import { CATEGORIES } from '../data/metrics.js';
import { fmtShort, toDate } from '../lib/format.js';

function CategoryDropdown({ value, onChange }) {
  const id = useId();
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [open]);

  const focusOption = (index) => optionRefs.current[index]?.focus();
  const handleTriggerKeyDown = (event) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusOption(event.key === 'ArrowDown' ? 0 : CATEGORIES.length - 1));
    }
  };
  const handleOptionKeyDown = (event, index) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusOption((index + (event.key === 'ArrowDown' ? 1 : -1) + CATEGORIES.length) % CATEGORIES.length);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusOption(event.key === 'Home' ? 0 : CATEGORIES.length - 1);
    }
  };

  return (
    <div
      className="schedule-field schedule-select-field"
      ref={rootRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <span>Category</span>
      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        className="schedule-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{value === 'Public Holiday' ? 'Public holiday' : value}</span>
        <Icon n="down" s={16} />
      </button>
      {open && (
        <div id={`${id}-options`} className="schedule-select-menu" role="listbox" aria-label="Category">
          {CATEGORIES.map((category, index) => (
            <button
              key={category}
              ref={(element) => { optionRefs.current[index] = element; }}
              type="button"
              role="option"
              aria-selected={value === category}
              className="schedule-select-option"
              onClick={() => {
                onChange(category);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
            >
              {category === 'Public Holiday' ? 'Public holiday' : category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleEditor({ item, onBack, onSave }) {
  const editing = !!item;
  const [schedule, setSchedule] = useState({
    title: item?.title || '',
    date: item?.date || '',
    category: item?.category || 'Academic Session',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const action = event.nativeEvent.submitter?.value;
    if (schedule.title.trim().length < 3) {
      setError('Enter a schedule headline of at least 3 characters.');
      return;
    }
    if (!schedule.date) {
      setError('Choose the schedule date.');
      return;
    }
    setError('');
    setSaving(true);
    const saved = await onSave({
      ...item,
      ...schedule,
      title: schedule.title.trim(),
      status: action === 'approval' ? 'Live' : editing ? item.status : 'Draft',
      imageFile: schedule.imageFile || null,
    });
    setSaving(false);
    if (saved !== false) onBack();
  };

  return (
    <form className="schedule-editor" onSubmit={submit} noValidate>
      <button type="button" className="schedule-back" onClick={onBack}><Icon n="left" s={16} w={1.8} /> Back to Calendar</button>
      <h2>{editing ? 'Edit Schedule' : 'Post New Schedule'}</h2>
      <div className="schedule-fields">
        <label className="schedule-field schedule-field-full">
          <span>Schedule Headline</span>
          <input
            autoFocus
            value={schedule.title}
            onChange={(event) => setSchedule((current) => ({ ...current, title: event.target.value }))}
            placeholder="Enter compelling headline..."
            aria-invalid={!!error && schedule.title.trim().length < 3}
          />
        </label>
        <label className="schedule-field">
          <span>Date</span>
          <div className="schedule-input-wrap">
            <input type="date" value={schedule.date} onChange={(event) => setSchedule((current) => ({ ...current, date: event.target.value }))} aria-invalid={!!error && !schedule.date} />
            <Icon n="calendar" s={16} w={1.7} c="#6b7280" />
          </div>
        </label>

        <CategoryDropdown
          value={schedule.category}
          onChange={(category) => setSchedule((current) => ({ ...current, category }))}
        />
        <label className="schedule-field schedule-field-full">
          <span>Calendar image (JPG/PNG — required before publishing)</span>
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={(event) => setSchedule((current) => ({ ...current, imageFile: event.target.files?.[0] || null }))}
          />
          {schedule.imageFile ? (
            <span className="muted-text">{schedule.imageFile.name}</span>
          ) : editing && item?.imageUrl ? (
            <span className="muted-text">Current image kept unless you pick a new one.</span>
          ) : null}
        </label>
      </div>

      {error && <p className="schedule-error" role="alert">{error}</p>}
      <div className="schedule-actions">
        <button type="submit" name="action" value="draft" className="btn btn-line" disabled={saving}>{editing ? 'Save Changes' : 'Save Draft'} <Icon n="save" s={15} /></button>
        <button type="submit" name="action" value="approval" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save & Publish Calendar' : 'Review & Publish Calendar'} <Icon n="send" s={16} /></button>
      </div>
    </form>
  );
}


function CalendarApprovals() {
  const { toast } = useData();
  const [rows, setRows] = useState(null);
  const [rejectFor, setRejectFor] = useState(null);
  const [reason, setReason] = useState('');
  const load = () => calendarApi.manage().then((r) => setRows((Array.isArray(r) ? r : r?.items || []).filter((c) => c.status === 'PendingApproval'))).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const decide = async (id, ok, why) => {
    try {
      if (ok) await calendarApi.publish(id); else await calendarApi.reject(id, why);
      toast(ok ? 'Calendar published to the campus.' : 'Calendar rejected.');
      setRejectFor(null); setReason(''); load();
    } catch (e) { toast(`Action failed: ${e.message}`); }
  };
  if (!rows || rows.length === 0) return null;
  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <b className="text-sm">Calendars waiting for your decision ({rows.length})</b>
      <p className="mb-3 text-xs text-[#6B7280]">Contract §17: drafts submitted by calendar admins need your publish or reject (with reason).</p>
      {rows.map((c) => (
        <div key={c.id} className="mb-2 rounded-lg border border-amber-200 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><b className="text-sm">{c.title}</b> <span className="ml-2 text-xs text-[#6B7280]">{c.academicSession}</span></div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-solid" onClick={() => decide(c.id, true)}>Publish</button>
              <button type="button" className="btn btn-line" onClick={() => { setRejectFor(rejectFor === c.id ? null : c.id); setReason(''); }}>Reject</button>
            </div>
          </div>
          {rejectFor === c.id && (
            <div className="mt-2 flex gap-2">
              <input className="h-9 flex-1 rounded-lg border border-[#D1D5DC] px-3 text-sm" placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
              <button type="button" className="btn btn-danger" disabled={reason.trim().length < 3} onClick={() => decide(c.id, false, reason.trim())}>Confirm reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Calendar() {
  const { calendar, institution, toast } = useData();
  const [del, setDel] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
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
          { label: 'View Details', icon: 'eye', dividerAfter: true, run: () => setViewing(r) },
          ...(r.status === 'Draft' ? [
            { label: 'Edit', icon: 'edit', run: () => setEditing(r) },
            { label: 'Submit for approval', icon: 'send', run: () => calendar.submitRow(r.id) },
            { label: 'Delete', icon: 'trash', run: () => setDel(r) },
          ] : []),
          ...(r.status === 'Live' ? [
            { label: 'Unpublish', icon: 'edit', run: () => calendar.unpublish(r.id) },
            { label: 'Delete', icon: 'trash', run: () => setDel(r) },
          ] : []),
        ]} />
      ),
    },
  ];

  const add = <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><Icon n="plus" s={20} w={1.5} />Add schedule</button>;

  if (creating || editing) {
    return (
      <ScheduleEditor
        item={editing}
        onBack={() => { setCreating(false); setEditing(null); }}
        onSave={async (data) => {
          const saved = editing
            ? await calendar.update(editing.id, data)
            : await calendar.add(data);
          if (saved !== false) toast(data.status === 'Draft' ? 'Draft saved' : editing ? 'Changes saved' : 'Schedule published');
          return saved;
        }}
      />
    );
  }

  return (
    <div>
      <div className="toolbar">
        <div className="note"><span><b>Calendar dates are institutional.</b> Only administrators at {institution.name} can add or change these. Students can read them but never edit.</span></div>
        {calendar.error && <div className="note"><span><b>Could not load calendars from the staging API.</b> Refresh the page or try again shortly.</span></div>}
        {add}
      </div>
      <CalendarApprovals />
      <DataTable caption="Academic calendar" columns={columns} rows={rows} empty={<EmptyState title="No dates yet" text="Add the first date for this academic session." action={add} />} />
      {del && <ConfirmDialog title="Delete this draft?" text={`“${del.title}” will be permanently removed.`} confirmLabel="Delete" danger onConfirm={async () => { if (await calendar.remove(del.id)) toast('Draft deleted'); setDel(null); }} onClose={() => setDel(null)} />}
      {viewing && <ItemDetailsDialog item={viewing} fields={[
        { label: 'Date', value: viewing.date ? new Intl.DateTimeFormat(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' }).format(toDate(viewing.date)) : '—' },
        { label: 'Status', value: viewing.status },
        { label: 'Category', value: viewing.category },
      ]} placeholderIcon="calendar" onClose={() => setViewing(null)} />}
    </div>
  );
}
