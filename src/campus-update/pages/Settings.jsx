import { useRef, useState } from 'react';
import { Avatar, Icon } from '../components/Icons.jsx';
import { TextField } from '../components/Fields.jsx';
import { useData } from '../context/DataContext.jsx';

const TABS = ['Profile', 'Institution', 'Notifications', 'Security'];

function Actions({ onCancel }) {
  return (
    <div className="actions">
      <button type="button" className="btn btn-line" onClick={onCancel}>Cancel</button>
      <button type="submit" className="btn btn-solid">Save Changes</button>
    </div>
  );
}

function ProfileTab() {
  const { profile, setProfile, toast } = useData();
  const [f, setF] = useState(profile);
  const [errors, setErrors] = useState({});
  const file = useRef(null);

  const pick = (e) => {
    const img = e.target.files?.[0];
    if (!img) return;
    if (!/^image\/(png|jpe?g|gif)$/.test(img.type)) return toast('Use a PNG, JPG or GIF image');
    if (img.size > 5 * 1024 * 1024) return toast('Image must be 5MB or smaller');
    const reader = new FileReader();
    reader.onload = () => setF((s) => ({ ...s, photo: reader.result }));
    reader.readAsDataURL(img);
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.first.trim()) errs.first = 'Enter your first name.';
    if (!f.last.trim()) errs.last = 'Enter your last name.';
    if (!/^\+?[\d\s()-]{7,20}$/.test(f.phone.trim())) errs.phone = 'Enter a valid phone number.';
    setErrors(errs);
    if (Object.keys(errs).length) return requestAnimationFrame(() => document.querySelector('.set-card [aria-invalid="true"]')?.focus());
    setProfile({ ...f, first: f.first.trim(), last: f.last.trim(), phone: f.phone.trim() });
    toast('Changes saved');
  };

  return (
    <form onSubmit={submit} noValidate>
      <h2>Profile Information</h2>
      <p className="sub">Update your personal details and role configurations.</p>
      <div className="photo">
        <button type="button" className="photo-c" aria-label="Change profile photo" onClick={() => file.current?.click()}>
          <Avatar size={66} src={f.photo} /><span className="cam"><Icon n="camera" s={15} w={1.7} /></span>
        </button>
        <input ref={file} type="file" accept="image/png,image/jpeg,image/gif" hidden onChange={pick} />
        <div><b>Profile Photo</b><small>PNG, JPG or GIF. Max 5MB.</small></div>
      </div>
      <div className="grid2">
        <TextField label="First Name" value={f.first} onChange={(v) => setF({ ...f, first: v })} error={errors.first} autoComplete="given-name" />
        <TextField label="Last Name" value={f.last} onChange={(v) => setF({ ...f, last: v })} error={errors.last} autoComplete="family-name" />
        <TextField label="Phone Number" type="tel" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} error={errors.phone} autoComplete="tel" />
        <TextField label="Email Address" value={f.email} disabled lock hint="Contact your institution to change this." />
        <TextField label="Role" value={f.role} disabled />
        <TextField label="Permission Level" value={f.permission} disabled />
        <TextField label="Department" value={f.department} disabled full />
      </div>
      <Actions onCancel={() => { setF(profile); setErrors({}); }} />
    </form>
  );
}

function InstitutionTab() {
  const { institution, setInstitution, toast } = useData();
  const [f, setF] = useState(institution);
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.name.trim()) errs.name = 'Enter your institution’s name.';
    if (!f.short.trim()) errs.short = 'Enter a short name.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setInstitution({ name: f.name.trim(), short: f.short.trim(), site: f.site.trim() });
    toast('Changes saved');
  };
  return (
    <form onSubmit={submit} noValidate>
      <h2>Institution</h2>
      <p className="sub">How your institution appears to students.</p>
      <div className="grid2" style={{ marginTop: 18 }}>
        <TextField label="Institution name" full value={f.name} onChange={(v) => setF({ ...f, name: v })} error={errors.name} />
        <TextField label="Short name" value={f.short} onChange={(v) => setF({ ...f, short: v })} error={errors.short} />
        <TextField label="Website" value={f.site} onChange={(v) => setF({ ...f, site: v })} />
      </div>
      <Actions onCancel={() => { setF(institution); setErrors({}); }} />
    </form>
  );
}

const Switch = ({ on, set, title, text }) => (
  <div className="row-sw">
    <div><b>{title}</b><small>{text}</small></div>
    <button type="button" className={'sw' + (on ? ' on' : '')} role="switch" aria-checked={on} aria-label={title} onClick={() => set(!on)} />
  </div>
);

function NotificationsTab() {
  const { prefs, setPrefs, toast } = useData();
  const [n, setN] = useState(prefs);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setPrefs(n); toast('Changes saved'); }}>
      <h2>Notifications</h2>
      <p className="sub">Choose how Campus Update reaches you.</p>
      <div style={{ marginTop: 10 }}>
        <Switch on={n.push} set={(v) => setN({ ...n, push: v })} title="Push notifications" text="Get alerts when content you published goes live." />
        <Switch on={n.email} set={(v) => setN({ ...n, email: v })} title="Email notifications" text="Receive activity updates by email." />
        <Switch on={n.urgent} set={(v) => setN({ ...n, urgent: v })} title="Urgent notices" text="Always notify me about urgent announcements." />
        <Switch on={n.digest} set={(v) => setN({ ...n, digest: v })} title="Weekly digest" text="A summary of reach and engagement every Monday." />
      </div>
      <Actions onCancel={() => setN(prefs)} />
    </form>
  );
}

function SecurityTab() {
  const { toast } = useData();
  const empty = { cur: '', next: '', rep: '' };
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.cur) errs.cur = 'Enter your current password.';
    if (f.next.length < 8) errs.next = 'Use at least 8 characters.';
    if (f.rep !== f.next) errs.rep = 'Passwords don’t match.';
    setErrors(errs);
    if (Object.keys(errs).length) return requestAnimationFrame(() => document.querySelector('.set-card [aria-invalid="true"]')?.focus());
    setF(empty);
    toast('Password updated');
  };
  return (
    <form onSubmit={submit} noValidate>
      <h2>Security</h2>
      <p className="sub">Update your password to keep your account safe.</p>
      <div className="grid2" style={{ marginTop: 18 }}>
        <TextField label="Current password" type="password" full value={f.cur} onChange={(v) => setF({ ...f, cur: v })} error={errors.cur} autoComplete="current-password" />
        <TextField label="New password" type="password" value={f.next} onChange={(v) => setF({ ...f, next: v })} error={errors.next} autoComplete="new-password" />
        <TextField label="Confirm new password" type="password" value={f.rep} onChange={(v) => setF({ ...f, rep: v })} error={errors.rep} autoComplete="new-password" />
      </div>
      <Actions onCancel={() => { setF(empty); setErrors({}); }} />
    </form>
  );
}

export default function Settings() {
  const [tab, setTab] = useState('Profile');
  const onKey = (e) => {
    const i = TABS.indexOf(tab);
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = TABS[(i + step + TABS.length) % TABS.length];
    setTab(next);
    document.getElementById('tab-' + next)?.focus();
  };
  return (
    <div className="set-wrap">
      <div className="set-tabs" role="tablist" aria-label="Settings sections" aria-orientation="vertical" onKeyDown={onKey}>
        {TABS.map((t) => (
          <button key={t} id={'tab-' + t} type="button" role="tab" aria-selected={tab === t} aria-controls="settings-panel" tabIndex={tab === t ? 0 : -1} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="set-card" id="settings-panel" role="tabpanel" aria-labelledby={'tab-' + tab}>
        {tab === 'Profile' && <ProfileTab />}
        {tab === 'Institution' && <InstitutionTab />}
        {tab === 'Notifications' && <NotificationsTab />}
        {tab === 'Security' && <SecurityTab />}
      </div>
    </div>
  );
}
