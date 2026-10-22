const P = {
  grid: <g><circle cx="7" cy="7" r="3.2" /><circle cx="17" cy="7" r="3.2" /><circle cx="7" cy="17" r="3.2" /><circle cx="17" cy="17" r="3.2" /></g>,
  news: <g><path d="M4 6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z" /><path d="M17 9h1.5A1.5 1.5 0 0 1 20 10.5V18a2 2 0 0 1-2 2" /><path d="M7.5 8.5h6M7.5 12h6M7.5 15.5h3" /></g>,
  events: <g><path d="M8.5 3.5h7v2.2a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1z" /><path d="M8.5 5H6.5A2 2 0 0 0 4.5 7v11.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><path d="M8.5 11h7M8.5 14.5h4" /></g>,
  calendar: <g><path d="M7 3v3M17 3v3M4 9h16" /><rect x="4" y="5" width="16" height="15.5" rx="2" /><path d="M8 13h8M8 16.5h5" /></g>,
  users: <g><circle cx="9" cy="8" r="3.4" /><path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" /><path d="M16 4.8a3.2 3.2 0 0 1 0 6M17.5 14.8c2.4.6 4 2.4 4 5.2" /></g>,
  stats: <g><path d="M12 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-5" /><path d="M8 17v-3M12 17v-6M16 17v-3" /><circle cx="18" cy="6" r="3" /></g>,
  settings: <g><circle cx="12" cy="12" r="3" /><path d="M12 2.5l1.6 2.3 2.8-.5.9 2.7 2.6 1.2-.5 2.8L21 12l-1.6 2 .5 2.8-2.6 1.2-.9 2.7-2.8-.5L12 21.5l-1.6-2.3-2.8.5-.9-2.7-2.6-1.2.5-2.8L3 12l1.6-2-.5-2.8 2.6-1.2.9-2.7 2.8.5z" /></g>,
  logout: <g><path d="M9 21H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h3" /><path d="M16 16l4-4-4-4M20 12H9" /></g>,
  bell: <g><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></g>,
  down: <path d="M6 9l6 6 6-6" />,
  left: <path d="M15 18l-6-6 6-6" />,
  right: <path d="M9 18l6-6-6-6" />,
  building: <g><path d="M3 21h18M5 21V9l7-5 7 5v12" /><path d="M9 21v-5h6v5M9 11h.01M12 11h.01M15 11h.01" /></g>,
  mega: <g><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" /><path d="M15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /></g>,
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  plus: <g><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M12 8v8M8 12h8" /></g>,
  search: <g><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></g>,
  sliders: <g><path d="M4 8h9M17 8h3M4 16h3M11 16h9" /><circle cx="15" cy="8" r="2" /><circle cx="9" cy="16" r="2" /></g>,
  lock: <g><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>,
  camera: <g><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></g>,
  shield: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />,
  pencil: <g><circle cx="12" cy="12" r="9" /><path d="M9 15l.6-2.6 5-5 2 2-5 5z" /></g>,
  clock: <g><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></g>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  link: <g><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" /></g>,
  list: <g><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></g>,
  upload: <g><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" /></g>,
  save: <g><path d="M5 3h12l4 4v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M7 3v6h10V3M7 21v-8h10v8" /></g>,
  send: <g><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4z" /></g>,
  laptop: <g><rect x="4" y="4.5" width="16" height="12" rx="1.5" /><path d="M2.5 20h19l-1.5-3.5h-16z" /></g>,
};

export const Icon = ({ n, s = 18, w = 1.6, c = 'currentColor' }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {P[n]}
  </svg>
);

export const Dots = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#27272a" aria-hidden="true" focusable="false">
    <circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" />
  </svg>
);

export const SortIcon = () => (
  <svg width="7" height="11" viewBox="0 0 7 11" fill="#6b7280" aria-hidden="true" focusable="false">
    <path d="M3.5 0L7 4H0zM3.5 11L0 7h7z" />
  </svg>
);

export const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
    <path d="M30 9.5A15 15 0 1 0 30 30.5" stroke="#4f46e5" strokeWidth="6.5" strokeLinecap="round" />
    <path d="M12.5 3.5C21 0 31 3 36 9" stroke="#4f46e5" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

export function Avatar({ size = 29, src }) {
  if (src) {
    return <img src={src} alt="" width={size} height={size} style={{ borderRadius: '50%', objectFit: 'cover', flex: 'none' }} />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ borderRadius: '50%', flex: 'none' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="avbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9b8a0" /><stop offset="1" stopColor="#a8715a" /></linearGradient>
      </defs>
      <rect width="64" height="64" fill="url(#avbg)" />
      <path d="M6 66c2-14 12-19 26-19s24 5 26 19z" fill="#4a3a36" />
      <ellipse cx="32" cy="29" rx="12" ry="14" fill="#c98f6f" />
      <path d="M19.5 26c-1-11 6-16 13-16 8 0 14 5 12 16-1-5-4-8-8-8-5 1-12 0-17 8z" fill="#2a1b17" />
      <path d="M26 36c4 3 8 3 12 0" stroke="#7a3f2d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
