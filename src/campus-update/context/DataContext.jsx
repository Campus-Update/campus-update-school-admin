import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { usePersistentState } from '../lib/storage.js';
import { nextId } from '../lib/format.js';
import {
  DEFAULT_INSTITUTION, DEFAULT_PREFS, DEFAULT_PROFILE,
  makeAdmins, makeAlerts, makeCalendar, makeContent, makeEvents,
} from '../data/seed.js';

const Ctx = createContext(null);
export const useData = () => useContext(Ctx);

function useCollection(key, seed) {
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

export function DataProvider({ children }) {
  const content = useCollection('content', makeContent);
  const events = useCollection('events', makeEvents);
  const calendar = useCollection('calendar', makeCalendar);
  const admins = useCollection('admins', makeAdmins);
  const alerts = useCollection('alerts', makeAlerts);
  const [profile, setProfile] = usePersistentState('profile', DEFAULT_PROFILE);
  const [institution, setInstitution] = usePersistentState('institution', DEFAULT_INSTITUTION);
  const [prefs, setPrefs] = usePersistentState('prefs', DEFAULT_PREFS);

  const [toastMsg, setToastMsg] = useState('');
  const timer = useRef();
  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(''), 2400);
  }, []);

  const value = { content, events, calendar, admins, alerts, profile, setProfile, institution, setInstitution, prefs, setPrefs, toast, toastMsg };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
