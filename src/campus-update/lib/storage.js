import { useEffect, useState } from 'react';

const PREFIX = 'campus-update:v1:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full: keep working in memory */
  }
}

export function clearAll() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/** useState that survives reloads. `init` may be a value or a function. */
export function usePersistentState(key, init) {
  const [value, setValue] = useState(() => {
    const stored = load(key, undefined);
    return stored !== undefined ? stored : typeof init === 'function' ? init() : init;
  });
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue];
}
