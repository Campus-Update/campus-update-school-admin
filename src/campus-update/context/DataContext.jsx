import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState } from '../lib/storage.js';
import { nextId } from '../lib/format.js';
import {
  DEFAULT_INSTITUTION, DEFAULT_PREFS, DEFAULT_PROFILE,
  makeAdmins, makeAlerts,
} from '../data/seed.js';
import { authApi, calendarApi, contentApi, schoolsApi } from '../../lib/api.js';

const Ctx = createContext(null);
export const useData = () => useContext(Ctx);

const STATUS_TO_API = { Live: 'Published', Draft: 'Draft', Scheduled: 'Scheduled' };
const STATUS_FROM_API = (s) => (s === 'Published' ? 'Live' : s);

const fromApi = (it) => ({
  id: it.id,
  title: it.title,
  body: it.body || '',
  type: it.type,
  priority: it.urgency || 'Normal',
  source: it.sourceName || '—',
  audience: it.category || 'All students',
  status: STATUS_FROM_API(it.status),
  updatedAt: it.publishedAt,
  publishedAt: it.publishedAt,
  scheduledFor: null,
  push: (it.notificationOpenCount || 0) > 0,
  reach: it.uniqueReachCount || 0,
  open: it.notificationOpenCount || 0,
  readSec: it.views || 0,
  when: (it.publishedAt || '').slice(0, 16),
  venue: it.category || '—',
  saved: it.views || 0,
});

const toApi = (r, withType) => {
  const body = {
    title: r.title,
    body: r.body || r.title,
    summary: null,
    urgency: r.priority || 'Normal',
    sourceName: r.source && r.source !== '—' ? r.source : 'Institution',
    sourceType: 'Official',
    category: r.audience || null,
    eventStartsAt: r.when ? new Date(r.when).toISOString() : null,
    eventEndsAt: null,
    eventLocation: r.venue && r.venue !== '—' ? r.venue : null,
    registrationUrl: null,
    sponsorName: null,
    targetUrl: null,
    audiences: [],
  };
  if (withType) body.type = r.type || 'News';
  return body;
};

function useLocalCollection(key, seed) {
  const [rows, setRows] = usePersistentState(key, seed);
  return useMemo(
    () => ({
      rows,
      add: (item) => setRows((r) => [{ ...item, id: nextId(r) }, ...r]),
      update: (id, patch) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x))),
      remove: (id) => setRows((r) => r.filter((x) => x.id !== id)),
    }),
    [rows, setRows],
  );
}

const ROLE_LABEL = { SchoolAdmin: 'Institution administrator', InstitutionAdmin: 'Institution administrator', Staff: 'Staff', SuperAdmin: 'Platform administrator' };

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [contentError, setContentError] = useState('');
  const [calendarRows, setCalendarRows] = useState([]);
  const [calendarError, setCalendarError] = useState(false);
  const admins = useLocalCollection('admins', makeAdmins);
  const alerts = useLocalCollection('alerts', makeAlerts);
  const [profile, setProfileState] = usePersistentState('profile', DEFAULT_PROFILE);
  const [institution, setInstitution] = usePersistentState('institution', DEFAULT_INSTITUTION);
  const [prefs, setPrefsState] = usePersistentState('prefs', DEFAULT_PREFS);

  const acadRef = useRef({});
  const [toastMsg, setToastMsg] = useState('');
  const timer = useRef();
  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(''), 2400);
  }, []);

  const loadContent = useCallback(() => {
    contentApi
      .list({ pageSize: 200 })
      .then((rows) => {
        setItems((Array.isArray(rows) ? rows : []).map(fromApi));
        setContentError('');
      })
      .catch((e) => setContentError(e.message));
  }, []);

  useEffect(() => {
    loadContent();
    calendarApi
      .list()
      .then((rows) =>
        setCalendarRows(
          (Array.isArray(rows) ? rows : []).map((c) => ({
            id: c.id,
            title: c.title,
            date: (c.publishedAt || '').slice(0, 10),
            category: c.academicSession || 'General',
            status: 'Live',
          })),
        ),
      )
      .catch((e) => {
        // Contract §10: 404 means no calendar yet (clean empty state); any other status is a server fault.
        if (e && e.status === 404) {
          setCalendarRows([]);
          setCalendarError(false);
        } else {
          setCalendarRows([]);
          setCalendarError(true);
        }
      });
    authApi
      .profile()
      .then((p) => {
        setProfileState((prev) => ({
          ...prev,
          first: p.firstName || prev.first,
          last: p.lastName || prev.last,
          email: p.email || prev.email,
          role: ROLE_LABEL[p.role] || prev.role,
        }));
        acadRef.current = {
          institutionId: p.institutionId,
          eventsEnabled: p.eventsEnabled,
          advertisementsEnabled: p.advertisementsEnabled,
        };
        setPrefsState((prev) => ({
          push: p.pushNotificationsEnabled ?? prev.push,
          email: p.newsEnabled ?? prev.email,
          urgent: p.announcementsEnabled ?? prev.urgent,
          digest: p.allCampusFeed ?? prev.digest,
        }));
        if (p.institutionId) {
          schoolsApi
            .list()
            .then((list) => {
              const s = (Array.isArray(list) ? list : []).find((x) => x.id === p.institutionId);
              if (s) setInstitution({ name: s.name, short: s.acronym || s.name.slice(0, 8).toUpperCase(), site: s.slug || '' });
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setProfile = useCallback(
    (f) => {
      setProfileState(f);
      authApi.updateProfile({ firstName: f.first, lastName: f.last, matriculationOrStaffNumber: null }).catch(() => {});
    },
    [setProfileState],
  );

  const setPrefs = useCallback(
    (f) => {
      setPrefsState(f);
      const base = acadRef.current;
      if (!base.institutionId) return;
      authApi
        .updateAcademicSettings({
          institutionId: base.institutionId,
          facultyId: null,
          departmentId: null,
          programmeId: null,
          academicLevelId: null,
          newsEnabled: !!f.email,
          announcementsEnabled: !!f.urgent,
          eventsEnabled: base.eventsEnabled ?? true,
          advertisementsEnabled: base.advertisementsEnabled ?? true,
          pushNotificationsEnabled: !!f.push,
          allCampusFeed: !!f.digest,
        })
        .catch(() => {});
    },
    [setPrefsState],
  );

  const content = useMemo(
    () => ({
      rows: items.filter((r) => r.type !== 'Advertisement'),
      error: contentError,
      add: (r) =>
        contentApi
          .create(toApi({ ...r, type: r.type || 'News' }, true))
          .then((created) => setItems((c) => [fromApi(created), ...c]))
          .catch((e) => toast(`Could not save: ${e.message}`)),
      update: (id, patch) => {
        const prev = items.find((x) => x.id === id);
        const next = { ...prev, ...patch };
        setItems((c) => c.map((x) => (x.id === id ? next : x)));
        return contentApi
          .update(id, toApi(next, false))
          .then(() => (patch.status && patch.status !== prev?.status ? contentApi.setStatus(id, STATUS_TO_API[patch.status] || patch.status) : null))
          .catch((e) => toast(`Save failed: ${e.message}`));
      },
      remove: (id) =>
        contentApi
          .remove(id)
          .then(() => setItems((c) => c.filter((x) => x.id !== id)))
          .catch((e) => toast(`Delete failed: ${e.message}`)),
    }),
    [items, contentError, toast],
  );

  const events = useMemo(
    () => ({
      rows: items.filter((r) => r.type === 'Event'),
      error: contentError,
      add: (r) => content.add({ ...r, type: 'Event' }),
      update: (id, patch) => content.update(id, patch),
      remove: (id) => content.remove(id),
    }),
    [items, content, contentError],
  );

  const calendar = useMemo(
    () => ({
      rows: calendarRows,
      error: calendarError,
      add: (r) => {
        const row = { ...r, id: r.id || `cal-${Date.now()}` };
        setCalendarRows((c) => [row, ...c]);
        return calendarApi
          .create({ institutionId: null, title: r.title, academicSession: r.category || 'General', imageUrl: 'https://campus-update.example/calendars/placeholder.png', publishedAt: new Date(`${r.date}T08:00:00Z`).toISOString(), isOfficial: true })
          .catch(() => toast('Calendar API unavailable — saved on this device only.'));
      },
      update: (id, patch) => {
        setCalendarRows((c) => c.map((x) => (x.id === id ? { ...x, ...patch } : x)));
        const row = calendarRows.find((x) => x.id === id);
        if (row && String(row.id).length > 12) {
          return calendarApi.update(id, { institutionId: null, title: (patch.title ?? row.title), academicSession: (patch.category ?? row.category) || 'General', imageUrl: 'https://campus-update.example/calendars/placeholder.png', publishedAt: new Date(`${patch.date ?? row.date}T08:00:00Z`).toISOString(), isOfficial: true }).catch(() => toast('Calendar API unavailable — saved on this device only.'));
        }
        return Promise.resolve();
      },
      remove: (id) => {
        setCalendarRows((c) => c.filter((x) => x.id !== id));
        if (String(id).length > 12) return calendarApi.remove(id).catch(() => {});
        return Promise.resolve();
      },
    }),
    [calendarRows, calendarError, toast],
  );

  const value = {
    content, events, calendar, admins, alerts,
    profile, setProfile, institution, setInstitution, prefs, setPrefs,
    toast, toastMsg,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
