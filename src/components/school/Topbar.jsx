import { useEffect, useState } from 'react';
import { useData } from '../../campus-update/context/DataContext.jsx'
import { BellIcon, ChevronDown } from './Icons.jsx';
import { notificationsApi } from '../../lib/api.js';
import { relativeTime } from '../../campus-update/lib/format.js'

export default function Topbar({
  title = 'Overview',
  subtitle = 'Manage operations, users, and system configuration.',
  onMenu,
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const openNotifs = () => {
    notificationsApi.list().then((r) => setRows(Array.isArray(r) ? r : [])).catch(() => setRows([]));
  };
  const unread = rows.filter((n) => !n.readAt && !n.acknowledgedAt).length;
  const markAllRead = () => {
    Promise.all(rows.map((n) => notificationsApi.read(n.id).catch(() => {}))).then(() => openNotifs());
  };
  useEffect(() => { openNotifs(); }, []);
  useEffect(() => { if (notifOpen) openNotifs(); }, [notifOpen]);
  const { profile } = useData()
  return (
    <header className="flex items-center justify-between gap-3 rounded-[10px] bg-white/60 px-4 py-3 md:px-[50px]">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white lg:hidden"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" stroke="#454545" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <path d="M3 5.5h14M3 10h14M3 14.5h14" />
          </svg>
        </button>
        <div className="flex min-w-0 flex-col gap-1 md:gap-2.5">
          <h1 className="truncate text-xl font-medium leading-[26px] tracking-[-0.5px] text-[#2D2D2D] md:text-2xl">
            {title}
          </h1>
          <p className="truncate text-sm leading-[17px] text-[#6E6E6E] md:text-base">{subtitle}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 md:gap-[31px]">
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setNotifOpen((o) => !o)}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white md:h-[54px] md:w-[54px]"
          >
            <BellIcon className="h-6 w-6" />
            {unread > 0 && <span className="absolute right-[7px] top-[7px] h-2.5 w-2.5 rounded-full bg-[#D85A30]" />}
          </button>
          {notifOpen && (
            <div className="absolute right-0 z-40 mt-2 flex w-[320px] flex-col gap-2 rounded-[10px] border border-[#E5E7EB] bg-white p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#17171B]">Notifications</p>
                {rows.length > 0 && (
                  <button type="button" className="text-xs font-medium text-[#4F46E5]" onClick={markAllRead}>Mark all read</button>
                )}
              </div>
              {rows.length === 0 ? (
                <p className="py-3 text-center text-sm text-[#6B7280]">No notifications yet.</p>
              ) : (
                rows.slice(0, 8).map((n) => (
                  <div key={n.id} className="flex flex-col gap-0.5 rounded-lg bg-[#FAFAFB] px-3 py-2">
                    <span className="text-sm font-medium leading-4 text-[#17171B]">{n.title}</span>
                    <span className="text-xs leading-3.5 text-[#9CA3AF]">{relativeTime(n.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative">
        <button
          type="button"
          className="flex items-center gap-3 rounded-full border border-[#E5E7EB] bg-white py-1.5 pl-1.5 pr-2 md:py-[13px] md:pl-[26px] md:pr-4"
          onClick={() => setMenuOpen((o) => !o)}>
          <img
            src={profile?.profileImageUrl || '/images/avatar-john.png'}
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover md:h-[42px] md:w-[42px]"
          />
          <span className="hidden flex-col gap-1 text-left sm:flex">
            <span className="text-base font-semibold leading-[17px] text-[#2D2D2D]">{`${profile.first} ${profile.last}`.trim() || 'School Admin'}</span>
            <span className="text-[13px] leading-[14px] text-[#6B7280]">{profile.role}</span>
          </span>
          <ChevronDown className="hidden h-5 w-5 md:block md:h-[27px] md:w-[27px]" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-40 mt-2 flex w-56 flex-col gap-1 rounded-[10px] border border-[#E5E7EB] bg-white p-2 shadow-lg">
            <button type="button" className="rounded-lg px-3 py-2 text-left text-sm text-[#344054] hover:bg-[#F4F4F6]" onClick={() => { setMenuOpen(false); onNavigate?.('settings'); }}>Profile settings</button>
            <button type="button" className="rounded-lg px-3 py-2 text-left text-sm text-[#D92D20] hover:bg-[#FEE4E2]" onClick={() => { localStorage.clear(); window.location.hash = '#/'; window.location.reload(); }}>Log out</button>
          </div>
        )}
        </div>
      </div>
    </header>
  )
}
