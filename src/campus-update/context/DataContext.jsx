import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState } from '../lib/storage.js';
import { nextId } from '../lib/format.js';
import {
  DEFAULT_INSTITUTION, DEFAULT_PREFS, DEFAULT_PROFILE,
  makeAdmins, makeAlerts,
} from '../data/seed.js';
import { authApi, calendarApi, contentApi, departmentsApi, mediaApi, schoolsApi } from '../../lib/api.js';

const Ctx = createContext(null);
export const useData = () => useContext(Ctx);

const STATUS_TO_API = { Live: 'Published', Draft: 'Draft', Scheduled: 'Draft', Pending: 'PendingApproval', Rejected: 'Rejected' };
// Contract §4: Published→Live, PendingApproval→Pending; Archived rows are hidden (delete = archive).
const STATUS_FROM_API = (s) => (s === 'Published' ? 'Live' : s === 'PendingApproval' ? 'Pending' : s);
const calendarFromApi = (c) => ({
  id: c.id,
  title: c.title,
  body: '',
  createdAt: c.createdAt || null,
  date: (c.publishedAt || '').slice(0, 10),
  category: c.academicSession || 'General',
  imageUrl: c.imageUrl || null,
  status: c.status === 'Draft' ? 'Draft' : c.isOfficial ? 'Live' : 'Archived',
});

const fromApi = (it) => ({
  id: it.id,
  title: it.title,
  body: it.body || '',
  imageUrl: it.imageUrl || null,
  articleCategory: it.articleCategory || 'General',
  type: it.type,
  priority: it.urgency || 'Normal',
  source: it.sourceName || '—',
  audience: it.category || 'Entire institution',
  status: STATUS_FROM_API(it.status),
  createdAt: it.createdAt || null,
  updatedAt: it.updatedAt || it.publishedAt,
  publishedAt: it.publishedAt,
  scheduledFor: null,
  push: (it.notificationOpenCount || 0) > 0,
  reach: it.uniqueReachCount || 0,
  open: it.notificationOpenCount || 0,
  readSec: it.views || 0,
  when: (it.eventStartsAt || it.publishedAt || '').slice(0, 16),
  venue: it.eventLocation || it.category || '—',
  saved: it.views || 0,
  // Carry the real event/ad fields so edits round-trip them instead of wiping them.
  eventEndsAt: it.eventEndsAt || null,
  registrationUrl: it.registrationUrl || null,
  sponsorName: it.sponsorName || null,
  targetUrl: it.targetUrl || null,
});

const toApi = (r, withType, institutionId, audienceOpts) => {
  // Map the selected audience label to its real academic-structure ids (GET /departments tree).
  const opt = (audienceOpts || []).find((o) => o.label === (r.audience || 'Entire institution')) || {};
  const body = {
    title: r.title,
    body: r.body || r.title,
    articleCategory: r.articleCategory || null,
    summary: null,
    urgency: r.priority || 'Normal',
    sourceName: r.source && r.source !== '—' ? r.source : 'Institution',
    sourceType: 'Official',
    category: r.audience || null,
    eventStartsAt: r.when ? new Date(r.when).toISOString() : null,
    eventEndsAt: r.eventEndsAt || null,
    eventLocation: r.venue && r.venue !== '—' ? r.venue : null,
    registrationUrl: r.registrationUrl || null,
    sponsorName: r.sponsorName || null,
    targetUrl: r.targetUrl || null,
    // Contract §9: audiences needs at least one entry; ids come from the picked audience.
    audiences: institutionId
      ? [{ institutionId, facultyId: opt.facultyId || null, departmentId: opt.departmentId || null, programmeId: opt.programmeId || null, academicLevelId: opt.academicLevelId || null }]
      : [],
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
  const [audienceOptions, setAudienceOptions] = useState([]);
  const audienceRef = useRef([]);
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
        // Real academic tree → flat audience options (faculties → departments → programmes → levels).
        departmentsApi
          .list()
          .then((depts) => {
            const opts = [{ label: 'Entire institution' }];
            const seenFac = new Set();
            (Array.isArray(depts) ? depts : []).forEach((d) => {
              if (d.facultyName && !seenFac.has(d.facultyId)) { seenFac.add(d.facultyId); opts.push({ label: d.facultyName, facultyId: d.facultyId }); }
              opts.push({ label: d.name, facultyId: d.facultyId, departmentId: d.id });
              (d.programmes || []).forEach((pr) => {
                opts.push({ label: pr.name, facultyId: d.facultyId, departmentId: d.id, programmeId: pr.id });
                (pr.levels || []).forEach((l) => opts.push({ label: `${pr.name} · ${l.name}`, facultyId: d.facultyId, departmentId: d.id, programmeId: pr.id, academicLevelId: l.id }));
              });
            });
            const uniq = opts.filter((o, i) => opts.findIndex((x) => x.label === o.label) === i);
            setAudienceOptions(uniq);
            audienceRef.current = uniq;
          })
          .catch((e) => toast(`Audience options failed to load: ${e.message}`));
        if (p.institutionId) {
          calendarApi.manage(p.institutionId)
            .then((rows) => {
              setCalendarRows((Array.isArray(rows) ? rows : []).map(calendarFromApi));
              setCalendarError(false);
            })
            .catch(() => { setCalendarRows([]); setCalendarError(true); });
        }
        setPrefsState((prev) => ({
          ...prev,
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
              if (s) {
                setInstitution((prev) => ({
                  ...prev,
                  name: s.name,
                  short: s.acronym || s.name.slice(0, 8).toUpperCase(),
                  site: s.slug || prev.site,
                }));
              }
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
      setPrefsState((prev) => ({ ...prev, ...f }));
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
        .catch((e) => {
          toast(`Preferences saved on this device, but could not sync: ${e.message}`);
        });
    },
    [setPrefsState, toast],
  );

  const content = useMemo(
    () => ({
      rows: items.filter((r) => r.type !== 'Advertisement' && r.status !== 'Archived'),
      error: contentError,
      add: (r) =>
        contentApi
          .create(toApi({ ...r, type: r.type || 'News' }, true, acadRef.current.institutionId, audienceRef.current))
          .then(async (created) => {
            if (r.imageFile) {
              const form = new FormData();
              form.append('file', r.imageFile);
              await mediaApi.content(created.id, form).catch((e) => toast(`Alert saved, but image upload failed: ${e.message}`));
            }
            const requestedStatus = STATUS_TO_API[r.status] || 'Draft';
            const applyStatus = requestedStatus === 'Draft'
              ? Promise.resolve()
              : contentApi.setStatus(created.id, requestedStatus);
            return applyStatus.then(() => {
              setItems((c) => [fromApi({ ...created, status: requestedStatus }), ...c]);
              return true;
            });
          })
          .catch((e) => {
            toast(`Could not save: ${e.message}`);
            return false;
          }),
      update: (id, patch) => {
        const prev = items.find((x) => x.id === id);
        const next = { ...prev, ...patch };
        setItems((c) => c.map((x) => (x.id === id ? next : x)));
        return contentApi
          .update(id, toApi(next, false, acadRef.current.institutionId, audienceRef.current))
          .then(() => (patch.status && patch.status !== prev?.status ? contentApi.setStatus(id, STATUS_TO_API[patch.status] || patch.status) : null))
          .then(() => true)
          .catch((e) => {
            toast(`Save failed: ${e.message}`);
            loadContent(); // revert optimistic row to server truth
            return false;
          });
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
      add: async (r) => {
        const institutionId = acadRef.current.institutionId;
        if (!institutionId) { toast('Your account is not linked to an institution.'); return false; }
        const status = r.status === 'Draft' ? 'Draft' : 'Published';
        const publishedAt = new Date(`${r.date}T08:00:00Z`).toISOString();
        try {
          let saved;
          if (r.imageFile) {
            const form = new FormData();
            form.append('institutionId', institutionId);
            form.append('title', r.title);
            form.append('academicSession', r.category || 'General');
            form.append('status', status);
            form.append('publishedAt', publishedAt);
            form.append('file', r.imageFile);
            saved = await calendarApi.upload(form);
          } else {
            saved = await calendarApi.create({ institutionId, title: r.title, academicSession: r.category || 'General', imageUrl: '', publishedAt, isOfficial: status === 'Published', status });
          }
          setCalendarRows((rows) => [calendarFromApi(saved), ...rows]);
          return true;
        } catch (e) { toast(`Calendar save failed: ${e.message}`); return false; }
      },
      update: async (id, patch) => {
        const row = calendarRows.find((x) => x.id === id);
        if (!row) return false;
        const institutionId = acadRef.current.institutionId;
        const status = patch.status === 'Draft' ? 'Draft' : 'Published';
        const body = {
          institutionId,
          title: patch.title ?? row.title,
          academicSession: (patch.category ?? row.category) || 'General',
          imageUrl: row.imageUrl || '',
          publishedAt: new Date(`${patch.date ?? row.date}T08:00:00Z`).toISOString(),
          isOfficial: status === 'Published',
          status,
        };
        try {
          let saved;
          if (patch.imageFile) {
            const form = new FormData();
            form.append('institutionId', institutionId);
            form.append('title', body.title);
            form.append('academicSession', body.academicSession);
            form.append('status', status);
            form.append('publishedAt', body.publishedAt);
            form.append('calendarId', id);
            form.append('file', patch.imageFile);
            saved = await calendarApi.upload(form);
          } else if (row.status === 'Draft' && status === 'Published') {
            await calendarApi.update(id, body);
            saved = await calendarApi.publish(id);
          } else {
            saved = await calendarApi.update(id, body);
          }
          if (patch.imageFile && saved.id !== id) await calendarApi.remove(id);
          setCalendarRows((rows) => rows.map((x) => x.id === id ? calendarFromApi(saved) : x));
          return true;
        } catch (e) { toast(`Calendar save failed: ${e.message}`); return false; }
      },
      remove: async (id) => {
        try {
          await calendarApi.remove(id).catch(async (e) => {
            // Published calendars reject DELETE (409): move back to Draft first, then delete.
            if (e && e.status === 409) {
              const row = calendarRows.find((x) => x.id === id);
              await calendarApi.update(id, { institutionId: acadRef.current.institutionId, title: row?.title || '', academicSession: row?.category || 'General', imageUrl: row?.imageUrl || '', publishedAt: new Date().toISOString(), isOfficial: false, status: 'Draft' });
              await calendarApi.remove(id);
            } else throw e;
          });
          setCalendarRows((rows) => rows.filter((x) => x.id !== id));
          return true;
        } catch (e) { toast(`Draft delete failed: ${e.message}`); return false; }
      },
    }),
    [calendarRows, calendarError, toast],
  );

  const value = {
    content, events, calendar, admins, alerts, audienceOptions,
    profile, setProfile, institution, setInstitution, prefs, setPrefs,
    toast, toastMsg,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
