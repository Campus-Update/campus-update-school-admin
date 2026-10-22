import { useRef, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import DataTable from '../components/DataTable.jsx';
import RowMenu from '../components/RowMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ItemDetailsDialog from '../components/ItemDetailsDialog.jsx';
import { StatusPill } from '../components/Pills.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useData } from '../context/DataContext.jsx';
import { fmtShort, toDate } from '../lib/format.js';

function ScheduleEditor({ item, onBack, onSave }) {
  const editing = !!item;
  const [schedule, setSchedule] = useState({
    title: item?.title || '',
    date: item?.date || '',
    category: item?.category || 'Academic Session',
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
    const selected = schedule.body.slice(start, end);
    const text = selected || 'text';
    const replacement = `${before}${text}${after}`;
    setSchedule((current) => ({ ...current, body: current.body.slice(0, start) + replacement + current.body.slice(end) }));
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + before.length, start + before.length + text.length);
    });
  };

  const pickImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Choose a JPG or PNG image.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.');
      event.target.value = '';
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => setImage({ name: file.name, src: reader.result });
    reader.onerror = () => setError('Could not read this image. Try another file.');
    reader.readAsDataURL(file);
  };

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
    if (!editing && !schedule.body.trim()) {
      setError('Write the schedule details before saving.');
      bodyRef.current?.focus();
      return;
    }

    setError('');
    setSaving(true);
    const saved = await onSave({
      ...item,
      ...schedule,
      title: schedule.title.trim(),
      body: schedule.body.trim(),
      status: action === 'approval' ? 'Live' : editing ? item.status : 'Draft',
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
        <label className="schedule-field">
          <span>Category</span>
          <select value={schedule.category} onChange={(event) => setSchedule((current) => ({ ...current, category: event.target.value }))}>
            {['Academic Session', 'Registration', 'Ceremony', 'Examinations', 'Public Holiday'].map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
      </div>

      <div className="schedule-content">
        <div className="schedule-field schedule-body-field">
          <label htmlFor="schedule-body">Schedule Body</label>
          <div className="schedule-body">
            <div className="schedule-format" role="toolbar" aria-label="Schedule formatting">
              <button type="button" aria-label="Bold" onClick={() => format('**')}><b>B</b></button>
              <button type="button" aria-label="Italic" onClick={() => format('*')}><i>I</i></button>
              <button type="button" aria-label="Insert link" onClick={() => format('[', '](https://)')}><Icon n="link" s={15} /></button>
              <button type="button" aria-label="Bulleted list" onClick={() => format('- ', '')}><Icon n="list" s={16} /></button>
            </div>
            <textarea
              id="schedule-body"
              ref={bodyRef}
              rows={7}
              value={schedule.body}
              onChange={(event) => setSchedule((current) => ({ ...current, body: event.target.value }))}
              placeholder="Write the full details of the schedule here..."
              aria-invalid={!!error && !schedule.body.trim()}
            />
          </div>
        </div>
        <div className="schedule-upload">
          <input ref={imageRef} type="file" accept="image/jpeg,image/png" onChange={pickImage} hidden />
          {image ? (
            <div className="schedule-image-preview">
              <img src={image.src} alt="Selected schedule" />
              <span>{image.name}</span>
              <button type="button" onClick={() => { setImage(null); imageRef.current.value = ''; }}>Remove image</button>
            </div>
          ) : item?.imageUrl ? (
            <div className="schedule-image-preview">
              <img src={item.imageUrl} alt="Schedule" />
            </div>
          ) : (
            <button type="button" className="schedule-upload-prompt" onClick={() => imageRef.current?.click()}>
              <span className="schedule-upload-icon"><Icon n="upload" s={19} /></span>
              <b>Upload your image here</b>
              <small>Supports JPG or PNG. Max file size 5MB.</small>
            </button>
          )}
        </div>
      </div>

      {error && <p className="schedule-error" role="alert">{error}</p>}
      <div className="schedule-actions">
        <button type="submit" name="action" value="draft" className="btn btn-line" disabled={saving}>{editing ? 'Save Changes' : 'Save Draft'} <Icon n="save" s={15} /></button>
        <button type="submit" name="action" value="approval" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save & Publish Calendar' : 'Review & Publish Calendar'} <Icon n="send" s={16} /></button>
      </div>
    </form>
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
          { label: 'Edit', icon: 'edit', run: () => setEditing(r) },
          ...(r.status === 'Draft' ? [{ label: 'Publish', icon: 'send', run: () => { calendar.update(r.id, { status: 'Live', scheduledFor: null }); toast('Published'); } }] : []),
          { label: 'Delete', icon: 'trash', run: () => setDel(r) },
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
          if (data.status === 'Draft' && !editing) toast('Draft kept for this session; calendar drafts are not supported by the API.');
          else if (saved !== false) toast(editing ? 'Changes saved' : 'Schedule published');
          return saved;
        }}
      />
    );
  }

  return (
    <div>
      <div className="toolbar">
        <div className="note"><span><b>Calendar dates are institutional.</b> Only administrators at {institution.name} can add or change these. Students can read them but never edit.</span></div>
        {calendar.error && <div className="note"><span><b>Calendar service is returning server errors on staging (contract §10 says 200/404).</b> Dates you add are kept on this device until the endpoint recovers; reported to backend with traceIds.</span></div>}
        {add}
      </div>
      <DataTable caption="Academic calendar" columns={columns} rows={rows} empty={<EmptyState title="No dates yet" text="Add the first date for this academic session." action={add} />} />
      {del && <ConfirmDialog title="Delete this date?" text={`“${del.title}” will be removed from the academic calendar.`} confirmLabel="Delete" danger onConfirm={() => { calendar.remove(del.id); toast('Deleted'); }} onClose={() => setDel(null)} />}
      {viewing && <ItemDetailsDialog item={viewing} fields={[
        { label: 'Date', value: viewing.date ? new Intl.DateTimeFormat(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' }).format(toDate(viewing.date)) : '—' },
        { label: 'Status', value: viewing.status },
        { label: 'Category', value: viewing.category },
      ]} placeholderIcon="calendar" onClose={() => setViewing(null)} />}
    </div>
  );
}
