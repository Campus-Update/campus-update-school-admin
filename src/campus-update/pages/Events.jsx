import { useRef, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import DataTable from '../components/DataTable.jsx';
import RowMenu from '../components/RowMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ItemDetailsDialog from '../components/ItemDetailsDialog.jsx';
import { ScopePill, StatusPill } from '../components/Pills.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useData } from '../context/DataContext.jsx';
import { fmtDateTime, fmtNum, toDate } from '../lib/format.js';

const eventDetailDate = (value, options) => {
  const date = toDate(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(undefined, options).format(date);
};

function EventEditor({ item, onBack, onSave }) {
  const editing = !!item;
  const [event, setEvent] = useState({
    title: item?.title || '',
    date: item?.when?.slice(0, 10) || '',
    time: item?.when?.slice(11, 16) || '',
    venue: item?.venue || '',
    body: item?.body || '',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const bodyRef = useRef(null);
  const imageRef = useRef(null);

  const format = (before, after = before) => {
    const input = bodyRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = event.body.slice(start, end);
    const replacement = `${before}${selected || 'text'}${after}`;
    setEvent((current) => ({ ...current, body: current.body.slice(0, start) + replacement + current.body.slice(end) }));
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + before.length, start + before.length + (selected || 'text').length);
    });
  };

  const pickImage = (inputEvent) => {
    const file = inputEvent.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Choose a JPG or PNG image.');
      inputEvent.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.');
      inputEvent.target.value = '';
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => setImage({ name: file.name, src: reader.result });
    reader.onerror = () => setError('Could not read this image. Try another file.');
    reader.readAsDataURL(file);
  };

  const submit = async (submitEvent) => {
    submitEvent.preventDefault();
    const action = submitEvent.nativeEvent.submitter?.value;

    if (event.title.trim().length < 3) {
      setError('Enter an event headline of at least 3 characters.');
      return;
    }
    if (!event.date) {
      setError('Choose the event date.');
      return;
    }
    if (!event.time) {
      setError('Choose the event time.');
      return;
    }
    if (!event.venue.trim()) {
      setError('Enter the event venue.');
      return;
    }
    if (!editing && !event.body.trim()) {
      setError('Write the event details before saving.');
      bodyRef.current?.focus();
      return;
    }

    setError('');
    setSaving(true);
    const saved = await onSave({
      ...item,
      title: event.title.trim(),
      venue: event.venue.trim(),
      when: `${event.date}T${event.time}`,
      body: event.body.trim(),
      type: item?.type || 'Official',
      status: action === 'approval' ? 'Pending' : editing ? item.status : 'Draft',
    });
    setSaving(false);
    if (saved !== false) onBack();
  };

  return (
    <form className="event-editor" onSubmit={submit} noValidate>
      <button type="button" className="event-back" onClick={onBack}><Icon n="left" s={16} w={1.8} /> Back to Events</button>
      <h2>{editing ? 'Edit Event' : 'Post New Event'}</h2>
      <div className="event-fields">
        <label className="event-field event-field-full">
          <span>Event Headline</span>
          <input
            autoFocus
            value={event.title}
            onChange={(e) => setEvent((current) => ({ ...current, title: e.target.value }))}
            placeholder="Enter compelling headline..."
            aria-invalid={!!error && event.title.trim().length < 3}
          />
        </label>

        <label className="event-field">
          <span>Date</span>
          <div className="event-input-wrap">
            <input type="date" value={event.date} onChange={(e) => setEvent((current) => ({ ...current, date: e.target.value }))} aria-invalid={!!error && !event.date} />
            <Icon n="calendar" s={16} w={1.7} c="#6b7280" />
          </div>
        </label>

        <label className="event-field">
          <span>Time</span>
          <div className="event-input-wrap">
            <input type="time" value={event.time} onChange={(e) => setEvent((current) => ({ ...current, time: e.target.value }))} aria-invalid={!!error && !event.time} />
            <Icon n="clock" s={16} w={1.7} c="#6b7280" />
          </div>
        </label>

        <label className="event-field event-field-full">
          <span>Venue</span>
          <input
            value={event.venue}
            onChange={(e) => setEvent((current) => ({ ...current, venue: e.target.value }))}
            placeholder="Main Auditorium"
            aria-invalid={!!error && !event.venue.trim()}
          />
        </label>
      </div>

      <div className="event-content">
        <div className="event-field event-body-field">
          <label htmlFor="event-body">Event Body</label>
          <div className="event-body">
            <div className="event-format" role="toolbar" aria-label="Event formatting">
              <button type="button" aria-label="Bold" onClick={() => format('**')}><b>B</b></button>
              <button type="button" aria-label="Italic" onClick={() => format('*')}><i>I</i></button>
              <button type="button" aria-label="Insert link" onClick={() => format('[', '](https://)')}><Icon n="link" s={15} /></button>
              <button type="button" aria-label="Bulleted list" onClick={() => format('- ', '')}><Icon n="list" s={16} /></button>
            </div>
            <textarea
              id="event-body"
              ref={bodyRef}
              rows={7}
              value={event.body}
              onChange={(e) => setEvent((current) => ({ ...current, body: e.target.value }))}
              placeholder="Write the full details of the event here..."
              aria-invalid={!!error && !event.body.trim()}
            />
          </div>
        </div>

        <div className="event-upload">
          <input ref={imageRef} type="file" accept="image/jpeg,image/png" onChange={pickImage} hidden />
          {image ? (
            <div className="event-image-preview">
              <img src={image.src} alt="Selected event" />
              <span>{image.name}</span>
              <button type="button" onClick={() => { setImage(null); imageRef.current.value = ''; }}>Remove image</button>
            </div>
          ) : item?.imageUrl ? (
            <div className="event-image-preview">
              <img src={item.imageUrl} alt="Event" />
            </div>
          ) : (
            <button type="button" className="event-upload-prompt" onClick={() => imageRef.current?.click()}>
              <span className="event-upload-icon"><Icon n="upload" s={19} /></span>
              <b>Upload your image here</b>
              <small>Supports JPG or PNG. Max file size 5MB.</small>
            </button>
          )}
        </div>
      </div>

      {error && <p className="event-error" role="alert">{error}</p>}

      <div className="event-actions">
        <button type="submit" name="action" value="draft" className="btn btn-line" disabled={saving}>{editing ? 'Save Changes' : 'Save Draft'} <Icon n="save" s={15} /></button>
        <button type="submit" name="action" value="approval" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save & Submit for Review' : 'Review & Publish Events'} <Icon n="send" s={16} /></button>
      </div>
    </form>
  );
}

export default function Events() {
  const { events, toast } = useData();
  const [del, setDel] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const rows = [...events.rows].sort((a, b) => toDate(a.when) - toDate(b.when));
  const sub = (e) => (e.type === 'Promoted' ? 'Placed by Campus Update · not yours to edit' : e.status === 'Live' ? `Saved by ${fmtNum(e.saved)} students` : 'Not visible to students yet');
  const submitForApproval = (event) => {
    events.update(event.id, { status: 'Pending' });
    toast('Submitted for approval');
  };

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
          : [
            { label: 'View Details', icon: 'eye', dividerAfter: true, run: () => setViewing(r) },
            ...(r.status === 'Live' ? [] : [{ label: 'Edit', icon: 'edit', run: () => setEditing(r) }]), // contract §9: Published is read-only
            ...(r.status === 'Draft' ? [{ label: 'Publish', icon: 'send', run: () => submitForApproval(r) }] : []),
            { label: 'Delete', icon: 'trash', run: () => setDel(r) },
          ]} />
      ),
    },
  ];

  const add = <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><Icon n="plus" s={20} w={1.5} />New event</button>;

  if (creating || editing) {
    return (
      <EventEditor
        item={editing}
        onBack={() => { setCreating(false); setEditing(null); }}
        onSave={async (data) => {
          const saved = editing
            ? await events.update(editing.id, data)
            : await events.add({ ...data, type: 'Official' });
          if (saved !== false) toast(editing ? 'Changes saved' : data.status === 'Pending' ? 'Submitted for approval' : 'Draft saved');
          return saved;
        }}
      />
    );
  }

  return (
    <div>
      <div className="toolbar">
        <div className="note"><span><b>Official events are free to publish.</b> External organizers cannot submit here — they contact Campus Update directly, and their events appear to students marked as promoted.</span></div>
        {add}
      </div>
      <DataTable caption="Events" columns={columns} rows={rows} empty={<EmptyState title="No events yet" text="Create an official event for students to save." action={add} />} />
      {del && <ConfirmDialog title="Delete this event?" text={`“${del.title}” will be removed from students’ events. This can’t be undone.`} confirmLabel="Delete" danger onConfirm={() => { events.remove(del.id); toast('Deleted'); }} onClose={() => setDel(null)} />}
      {viewing && <ItemDetailsDialog item={viewing} fields={[
        { label: 'Date', value: eventDetailDate(viewing.when, { month: 'numeric', day: 'numeric', year: 'numeric' }) },
        { label: 'Time', value: eventDetailDate(viewing.when, { hour: 'numeric', minute: '2-digit' }).toUpperCase() },
        { label: 'Status', value: viewing.status },
        { label: 'Venue', value: viewing.venue },
      ]} placeholderIcon="events" onClose={() => setViewing(null)} />}
    </div>
  );
}
