import { useEffect, useRef, useState } from 'react';
import { Avatar, Icon } from '../components/Icons.jsx';
import { SelectField, TextField } from '../components/Fields.jsx';
import SessionConfirm from '../components/SessionConfirm.jsx';
import { authApi } from '../../lib/api.js';
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
  const { institution, setInstitution, profile, toast } = useData();
  const initial = {
    ...institution,
    industry: institution.industry || 'Education',
    address: institution.address || '',
    contactEmail: institution.contactEmail || profile.email || '',
    phone: institution.phone || profile.phone || '',
    publisherName: institution.publisherName || `${institution.name} · ${institution.short}`,
    replyTo: institution.replyTo || profile.email || '',
    defaultAudience: institution.defaultAudience || 'Students',
    defaultPriority: institution.defaultPriority || 'Normal',
    requireUrgentApproval: institution.requireUrgentApproval ?? true,
  };
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.name.trim()) errs.name = 'Enter your institution’s name.';
    if (f.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contactEmail.trim())) errs.contactEmail = 'Enter a valid email address.';
    if (f.replyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.replyTo.trim())) errs.replyTo = 'Enter a valid email address.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setInstitution({
      ...f,
      name: f.name.trim(),
      industry: f.industry.trim(),
      address: f.address.trim(),
      contactEmail: f.contactEmail.trim(),
      phone: f.phone.trim(),
      publisherName: f.publisherName.trim(),
      replyTo: f.replyTo.trim(),
    });
    toast('Changes saved');
  };
  return (
    <form onSubmit={submit} noValidate>
      <h2>Institution Information</h2>
      <p className="sub">Manage your institution details.</p>
      <div className="grid2 institution-info">
        <TextField label="Institution Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} error={errors.name} />
        <TextField label="Industry" value={f.industry} onChange={(v) => setF({ ...f, industry: v })} />
        <TextField label="Address" full value={f.address} onChange={(v) => setF({ ...f, address: v })} />
        <TextField label="Primary Contact Email" type="email" value={f.contactEmail} onChange={(v) => setF({ ...f, contactEmail: v })} error={errors.contactEmail} />
        <TextField label="Phone Number" type="tel" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
      </div>

      <section className="institution-section">
        <h3>How your posts appear</h3>
        <TextField
          label="Publisher name"
          value={f.publisherName}
          onChange={(v) => setF({ ...f, publisherName: v })}
          hint="Appears on every post you publish, next to the Official badge."
        />
        <div className="institution-audience">
          <span>Audience</span>
          <div className="institution-preview">
            <span className="institution-official">Official</span>
            <span>{f.publisherName || 'Publisher name'} · Just now</span>
          </div>
        </div>
        <TextField
          label="Reply-to email"
          type="email"
          value={f.replyTo}
          onChange={(v) => setF({ ...f, replyTo: v })}
          error={errors.replyTo}
          hint="Students who reply to a notice reach this address."
        />
      </section>

      <section className="institution-section institution-defaults">
        <h3>Defaults for new announcements</h3>
        <div className="grid2">
          <SelectField
            label="Audience"
            value={f.defaultAudience}
            options={['Entire Institution', 'Students', 'Staff', 'FOCIT', 'Computer Science']}
            onChange={(v) => setF({ ...f, defaultAudience: v })}
          />
          <SelectField
            label="Priority"
            value={f.defaultPriority}
            options={['Normal', 'Important', 'Urgent']}
            onChange={(v) => setF({ ...f, defaultPriority: v })}
          />
        </div>
        <Switch
          on={f.requireUrgentApproval}
          set={(v) => setF({ ...f, requireUrgentApproval: v })}
          title="Ask another administrator to approve urgent notices"
          text="Urgent notices reach everyone targeted. A second check catches mistakes before they go out."
        />
      </section>
      <Actions onCancel={() => { setF(initial); setErrors({}); }} />
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
  const initial = {
    urgentAdmin: prefs.urgentAdmin ?? prefs.urgent ?? true,
    adminChanges: prefs.adminChanges ?? true,
    draftsReminder: prefs.draftsReminder ?? true,
    contentRemoved: prefs.contentRemoved ?? false,
    newDevice: prefs.newDevice ?? true,
    push: prefs.push ?? true,
  };
  const [n, setN] = useState(initial);
  return (
    <form onSubmit={(e) => { e.preventDefault(); setPrefs({ ...prefs, ...n, urgent: n.urgentAdmin }); toast('Preferences saved'); }}>
      <h2>Notification Preferences</h2>
      <p className="sub">Configure when and where you receive notifications.</p>
      <section className="notification-group">
        <h3>EMAIL NOTIFICATIONS</h3>
        <Switch on={n.urgentAdmin} set={(v) => setN({ ...n, urgentAdmin: v })} title="Urgent notices from other administrators" text="So you hear about a change before students ask you." />
        <Switch on={n.adminChanges} set={(v) => setN({ ...n, adminChanges: v })} title="Administrator added, removed or rescoped" text="Changes to who can publish for your institution." />
        <Switch on={n.draftsReminder} set={(v) => setN({ ...n, draftsReminder: v })} title="Drafts left unpublished for 2 days" text="A reminder for drafts you started." />
        <Switch on={n.contentRemoved} set={(v) => setN({ ...n, contentRemoved: v })} title="Campus Update takes down your content" text="Includes the reason. Email is always sent." />
        <Switch on={n.newDevice} set={(v) => setN({ ...n, newDevice: v })} title="Sign-in from a new device" text="Email is always sent." />
      </section>
      <section className="notification-group">
        <h3>IN-APP NOTIFICATIONS</h3>
        <Switch on={n.push} set={(v) => setN({ ...n, push: v })} title="Push Notifications" text="Show browser push notifications for urgent items." />
      </section>
      <div className="notification-actions">
        <button type="submit" className="btn btn-solid">Save Preferences</button>
      </div>
    </form>
  );
}

function SecurityTab() {
  const { toast, profile } = useData();
  const empty = { cur: '', next: '', rep: '' };
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sessions, setSessions] = useState([]);
  const [sessionsError, setSessionsError] = useState('');
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let active = true;
    authApi.sessions()
      .then((result) => {
        const list = Array.isArray(result) ? result : result?.sessions;
        if (!Array.isArray(list)) throw new Error('The sessions response was not in the expected format.');
        if (active) {
          setSessions(list.map((session, index) => ({
            ...session,
            id: session.id ?? session.sessionId ?? `session-${index}`,
            device: session.deviceName || session.device || [session.browser, session.platform].filter(Boolean).join(' on ') || 'Active device',
            location: session.location || session.city || 'Unknown location',
            lastActive: session.lastActive || session.lastUsedAt || session.createdAt || '',
            current: Boolean(session.isCurrent || session.current),
          })));
          setSessionsError('');
        }
      })
      .catch((error) => {
        if (active) setSessionsError(`Could not load login activity: ${error.message}`);
      })
      .finally(() => {
        if (active) setSessionsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!f.cur) errs.cur = 'Enter your current password.';
    if (f.next.length < 8 || !/[A-Z]/.test(f.next) || !/\d/.test(f.next) || !/[^A-Za-z0-9]/.test(f.next)) {
      errs.next = 'Use at least 8 characters, including one uppercase letter, one number and one special character.';
    }
    if (f.rep !== f.next) errs.rep = 'Passwords don’t match.';
    setErrors(errs);
    if (Object.keys(errs).length) return requestAnimationFrame(() => document.querySelector('.set-card [aria-invalid="true"]')?.focus());
    setSavingPassword(true);
    try {
      await authApi.changePassword({ currentPassword: f.cur, newPassword: f.next });
      setF(empty);
      setErrors({});
      toast('Password updated');
    } catch (error) {
      setErrors({ cur: error.message });
    } finally {
      setSavingPassword(false);
    }
  };
  const handleSessionConfirm = () => {
    setConfirm(null);
    toast('Remote session sign-out is not available yet.');
  };

  return (
    <>
      <form onSubmit={submit} noValidate className="security-password">
        <h2>Change Password</h2>
        <p className="sub">Ensure your account is using a long, random password to stay secure.</p>
        <div className="grid2 security-fields">
          <TextField label="Current Password" type="password" full value={f.cur} onChange={(v) => setF({ ...f, cur: v })} error={errors.cur} autoComplete="current-password" />
          <TextField label="New Password" type="password" value={f.next} onChange={(v) => setF({ ...f, next: v })} error={errors.next} autoComplete="new-password" />
          <TextField label="Confirm New Password" type="password" value={f.rep} onChange={(v) => setF({ ...f, rep: v })} error={errors.rep} autoComplete="new-password" />
        </div>
        <p className="security-hint">Must be at least 8 characters with one uppercase, one number, and one special character.</p>
        <button type="submit" className="btn btn-solid" disabled={savingPassword}>{savingPassword ? 'Updating…' : 'Update Password'}</button>
      </form>

      <section className="login-activity">
        <h2>Login Activity</h2>
        <p className="sub">Recent login sessions for {`${profile.first} ${profile.last}`.trim()}.</p>
        {sessionsLoading && <p className="session-status">Loading sessions…</p>}
        {sessionsError && <p className="session-error" role="alert">{sessionsError}</p>}
        {!sessionsLoading && !sessionsError && sessions.length === 0 && <p className="session-status">No active sessions found.</p>}
        {!sessionsError && sessions.map((session) => (
          <div className="session-row" key={session.id}>
            <span className="session-device-icon"><Icon n="laptop" s={17} /></span>
            <div className="session-description">
              <b>{session.device} · {session.location}</b>
              <small>{formatSessionActivity(session.lastActive)}</small>
            </div>
            {session.current
              ? <span className="session-current">Current Session</span>
              : <button type="button" className="session-signout" onClick={() => setConfirm({ type: 'single', device: `${session.device} · ${session.location}` })}>Sign Out</button>}
          </div>
        ))}
        <button type="button" className="session-signout-all" onClick={() => setConfirm({ type: 'all' })}>Sign Out All Other Sessions</button>
      </section>
      {confirm && (
        <div className="source-page">
          <SessionConfirm
          type={confirm.type}
          device={confirm.device}
          sessions={sessions}
          onClose={() => setConfirm(null)}
          onConfirm={handleSessionConfirm}
          />
        </div>
      )}
    </>
  );
}

function formatSessionActivity(value) {
  if (!value) return 'Recently active';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
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
