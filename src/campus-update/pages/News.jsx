import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import DataTable from '../components/DataTable.jsx';
import RowMenu from '../components/RowMenu.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ItemDetailsDialog from '../components/ItemDetailsDialog.jsx';
import { StatusPill, TypePill } from '../components/Pills.jsx';
import ContentCell, { openOf, reachOf } from '../components/ContentCell.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useData } from '../context/DataContext.jsx';
import { AUDIENCES, CONTENT_TYPES, STATUSES } from '../data/metrics.js';

const ARTICLE_CATEGORIES = ['General', 'Campus', 'Weather', 'Archived'];
const ARTICLE_PRIORITIES = ['Normal', 'Important', 'Urgent'];

function ArticleDropdown({ label, value, options, onChange }) {
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

  const focusOption = (index) => {
    optionRefs.current[index]?.focus();
  };
  const handleTriggerKeyDown = (event) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    setOpen(true);
    requestAnimationFrame(() => focusOption(event.key === 'ArrowDown' ? 0 : options.length - 1));
  };
  const handleOptionKeyDown = (event, index) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusOption((index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusOption(event.key === 'Home' ? 0 : options.length - 1);
    }
  };

  return (
    <div
      className="article-field article-select-field"
      ref={rootRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <span>{label}</span>
      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        className="article-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{value}</span>
        <Icon n="down" s={16} />
      </button>
      {open && (
        <div id={`${id}-options`} className="article-select-menu" role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <button
              key={option}
              ref={(element) => { optionRefs.current[index] = element; }}
              type="button"
              role="option"
              aria-selected={value === option}
              className="article-select-option"
              onClick={() => {
                onChange(option);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleEditor({ item, onBack, onSave }) {
  const { audienceOptions } = useData();
  const editing = !!item;
  const [article, setArticle] = useState(() => item ? ({
    ...item,
    articleCategory: item.articleCategory || ARTICLE_CATEGORIES[0],
    priority: item.priority || 'Normal',
    audience: item.audience || 'Entire institution',
    push: item.push ? 'Standard' : 'Off',
    body: item.body || '',
  }) : ({
    title: '',
    articleCategory: ARTICLE_CATEGORIES[0],
    priority: 'Normal',
    audience: 'Entire institution',
    push: 'Standard',
    body: '',
  }));
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
    const selected = article.body.slice(start, end);
    const replacement = `${before}${selected || 'text'}${after}`;
    setArticle((current) => ({ ...current, body: current.body.slice(0, start) + replacement + current.body.slice(end) }));
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + before.length, start + before.length + (selected || 'text').length);
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
    if (article.title.trim().length < 3) {
      setError('Enter an article headline of at least 3 characters.');
      return;
    }
    if (!editing && !article.body.trim()) {
      setError('Write the article body before saving.');
      bodyRef.current?.focus();
      return;
    }
    setError('');
    setSaving(true);
    const saved = await onSave({
      ...article,
      title: article.title.trim(),
      articleCategory: article.articleCategory,
      type: article.type || 'News',
      priority: article.priority,
      audience: article.audience,
      push: article.push !== 'Off',
      body: article.body.trim(),
      status: action === 'approval' ? 'Pending' : (item?.status || 'Draft'),
      source: article.source || 'Institution',
    });
    setSaving(false);
    if (saved) onBack();
  };

  return (
    <form className="article-editor" onSubmit={submit} noValidate>
      <button type="button" className="article-back" onClick={onBack}>
        <Icon n="left" s={16} w={1.8} /> Back to News
      </button>
      <h2>{editing ? 'Edit Article' : 'Post New Article'}</h2>
      <div className="article-fields">
        <label className="article-field article-field-full">
          <span>Article Headline</span>
          <input
            autoFocus
            value={article.title}
            onChange={(event) => setArticle((current) => ({ ...current, title: event.target.value }))}
            placeholder="Enter compelling headline..."
            aria-invalid={!!error && article.title.trim().length < 3}
          />
        </label>
        <ArticleDropdown
          label="Category"
          value={article.articleCategory}
          options={ARTICLE_CATEGORIES}
          onChange={(articleCategory) => setArticle((current) => ({ ...current, articleCategory }))}
        />
        <ArticleDropdown
          label="Priority"
          value={article.priority}
          options={ARTICLE_PRIORITIES}
          onChange={(priority) => setArticle((current) => ({ ...current, priority }))}
        />
        <label className="article-field">
          <span>Audience</span>
          <select value={article.audience} onChange={(event) => setArticle((current) => ({ ...current, audience: event.target.value }))}>
            {(audienceOptions.length ? audienceOptions.map((o) => o.label) : AUDIENCES).map((audience) => <option key={audience}>{audience}</option>)}
          </select>
        </label>
        <label className="article-field">
          <span>Push notification</span>
          <select value={article.push} onChange={(event) => setArticle((current) => ({ ...current, push: event.target.value }))}>
            <option>Standard</option>
            <option>Off</option>
          </select>
        </label>
      </div>

      <div className="article-content">
        <div className="article-field article-body-field">
          <label htmlFor="article-body">Article Body</label>
          <div className="article-body">
            <div className="article-format" role="toolbar" aria-label="Article formatting">
              <button type="button" aria-label="Bold" onClick={() => format('**')}><b>B</b></button>
              <button type="button" aria-label="Italic" onClick={() => format('*')}><i>I</i></button>
              <button type="button" aria-label="Insert link" onClick={() => format('[', '](https://)')}><Icon n="link" s={15} /></button>
              <button type="button" aria-label="Bulleted list" onClick={() => format('- ', '')}><Icon n="list" s={16} /></button>
            </div>
            <textarea
              id="article-body"
              ref={bodyRef}
              rows={7}
              value={article.body}
              onChange={(event) => setArticle((current) => ({ ...current, body: event.target.value }))}
              placeholder="Write full story here..."
              aria-invalid={!!error && !article.body.trim()}
            />
          </div>
        </div>
        <div className="article-upload">
          <input ref={imageRef} type="file" accept="image/jpeg,image/png" onChange={pickImage} hidden />
          {image ? (
            <div className="article-image-preview">
              <img src={image.src} alt="Selected article" />
              <span>{image.name}</span>
              <button type="button" onClick={() => { setImage(null); imageRef.current.value = ''; }}>Remove image</button>
            </div>
          ) : item?.imageUrl ? (
            <div className="article-image-preview">
              <img src={item.imageUrl} alt="Article" />
              <button type="button" onClick={() => setArticle((current) => ({ ...current, imageUrl: null }))}>Remove image</button>
            </div>
          ) : (
            <button type="button" className="article-upload-prompt" onClick={() => imageRef.current?.click()}>
              <span className="article-upload-icon"><Icon n="upload" s={19} /></span>
              <b>Upload your image here</b>
              <small>Supports JPG or PNG. Max file size 5MB.</small>
            </button>
          )}
        </div>
      </div>
      {error && <p className="article-error" role="alert">{error}</p>}
      <div className="article-actions">
        <button type="submit" name="action" value="draft" className="btn btn-line" disabled={saving}>
          {editing ? 'Save Changes' : 'Save Draft'} <Icon n="save" s={15} />
        </button>
        <button type="submit" name="action" value="approval" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : editing ? 'Save & Submit for Review' : 'Review & Publish News'} <Icon n="send" s={16} />
        </button>
      </div>
    </form>
  );
}

export default function News() {
  const { content, toast } = useData();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [del, setDel] = useState(null);
  const [viewing, setViewing] = useState(null);
  const tools = useRef(null);

  useEffect(() => {
    if (!filterOpen) return;
    const away = (e) => { if (tools.current && !tools.current.contains(e.target)) setFilterOpen(false); };
    const esc = (e) => e.key === 'Escape' && setFilterOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [filterOpen]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return content.rows
      .filter((r) => (status === 'All' || r.status === status) && (type === 'All' || r.type === type))
      .filter((r) => !needle || [r.title, r.type, r.audience, r.source].join(' ').toLowerCase().includes(needle))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [content.rows, q, status, type]);

  const filtered = q || status !== 'All' || type !== 'All';
  const clear = () => { setQ(''); setStatus('All'); setType('All'); };

  // Contract §4: school admins submit Draft→PendingApproval; publishing is SuperAdmin.
  const submitForApproval = (r) => {
    const now = new Date().toISOString();
    content.update(r.id, { status: 'Pending', updatedAt: now });
    toast('Submitted for approval');
  };

  const columns = [
    { key: 'title', label: 'Content', sort: true, render: (r) => <ContentCell item={r} /> },
    { key: 'type', label: 'Type', sort: true, render: (r) => <TypePill type={r.type} priority={r.priority} /> },
    { key: 'audience', label: 'Audience', sort: true },
    { key: 'reach', label: 'Reach', sort: true, render: reachOf },
    { key: 'open', label: 'Opened', sort: true, render: openOf },
    { key: 'status', label: 'Status', sort: true, render: (r) => <StatusPill status={r.status} /> },
    {
      key: 'action', label: 'Action',
      render: (r) => (
        <RowMenu label={r.title} items={[
          { label: 'View Details', icon: 'eye', dividerAfter: true, run: () => setViewing(r) },
          ...(r.status === 'Live' ? [] : [{ label: 'Edit', icon: 'edit', run: () => setEditing(r) }]), // contract §9: Published is read-only
          ...(r.status === 'Draft' ? [{ label: 'Publish', icon: 'send', run: () => submitForApproval(r) }] : []),
          { label: 'Delete', icon: 'trash', run: () => setDel(r) },
        ]} />
      ),
    },
  ];

  const add = <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}><Icon n="plus" s={20} w={1.5} />New news article</button>;

  if (creating || editing) {
    return (
      <ArticleEditor
        item={editing}
        onBack={() => { setCreating(false); setEditing(null); }}
        onSave={async (data) => {
          const saved = editing
            ? await content.update(editing.id, data)
            : await content.add(data);
          if (saved) toast(editing ? 'Changes saved' : data.status === 'Pending' ? 'Submitted for approval' : 'Draft saved');
          return saved;
        }}
      />
    );
  }

  return (
    <div>
      <div className="note"><span><b>The list API returns published items only (contract §8).</b> Drafts and pending items are safe on the server but hidden here after a reload until backend includes own unpublished items in the list.</span></div>
      <div className="toolbar" style={{ alignItems: 'center' }}>
        <div className="left-tools" ref={tools}>
          <label className="search">
            <Icon n="search" s={20} w={1.5} />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by content, type or audience" aria-label="Search by content, type or audience" />
          </label>
          <button type="button" className={'filter-btn' + (status !== 'All' || type !== 'All' ? ' active' : '')} aria-expanded={filterOpen} aria-haspopup="true" onClick={() => setFilterOpen((o) => !o)}>
            <Icon n="sliders" s={20} w={1.5} />Filter
          </button>
          {filterOpen && (
            <div className="pop filters" role="group" aria-label="Filter news">
              <p>Status</p>
              {['All', ...STATUSES].map((s) => <button key={s} type="button" aria-pressed={status === s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>{s === 'All' ? 'All statuses' : s}</button>)}
              <p>Type</p>
              {['All', ...CONTENT_TYPES].map((t) => <button key={t} type="button" aria-pressed={type === t} className={type === t ? 'on' : ''} onClick={() => setType(t)}>{t === 'All' ? 'All types' : t}</button>)}
            </div>
          )}
        </div>
        {add}
      </div>

      <DataTable
        caption="News and announcements"
        columns={columns}
        rows={rows}
        empty={
          filtered ? (
            <EmptyState title="No results" text="Nothing matches your search or filters." action={<button type="button" className="btn btn-line" onClick={clear}>Clear search and filters</button>} />
          ) : (
            <EmptyState title="No news yet" text="Publish your first article to reach students." action={add} />
          )
        }
      />

      {del && <ConfirmDialog title="Delete this item?" text={`“${del.title}” will be removed for everyone. This can’t be undone.`} confirmLabel="Delete" danger onConfirm={() => { content.remove(del.id); toast('Deleted'); }} onClose={() => setDel(null)} />}
      {viewing && <ItemDetailsDialog item={viewing} fields={[
        { label: 'Category', value: viewing.articleCategory || viewing.type },
        { label: 'Priority', value: viewing.priority },
        { label: 'Audience', value: viewing.audience },
        { label: 'Push notification', value: viewing.push ? 'On' : 'Off' },
        { label: 'Status', value: viewing.status },
      ]} placeholderIcon="news" onClose={() => setViewing(null)} />}
    </div>
  );
}
