import {
  LogoMark,
  UniversityIcon,
  DashboardIcon,
  NewsIcon,
  ClipboardIcon,
  CalendarIcon,
  UserGroupIcon,
  AnalyticsIcon,
  SettingsIcon,
  LogoutIcon,
} from './Icons.jsx'

const PUBLISHING = [
  { id: 'overview', icon: DashboardIcon, label: 'Overview' },
  { id: 'news', icon: NewsIcon, label: 'News' },
  { id: 'events', icon: ClipboardIcon, label: 'Events' },
  { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
]

const INSTITUTION = [
  { id: 'users', icon: UserGroupIcon, label: 'User Management' },
  { id: 'stats', icon: AnalyticsIcon, label: 'Statistics' },
]

function NavItem({ item, active, onNavigate, onClose }) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={() => {
        onNavigate?.(item.id)
        onClose?.()
      }}
      className={`flex h-[46px] w-full items-center gap-4 rounded-[10px] px-5 text-[15px] leading-[18px] ${
        active
          ? 'bg-[#EEEDFD] font-semibold text-[#4F46E5]'
          : 'font-normal text-[#3F3F46] hover:bg-[#F4F4F6]'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" stroke={active ? '#4F46E5' : '#52525B'} />
      {item.label}
    </button>
  )
}

export default function Sidebar({ active = 'overview', onNavigate, open = false, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 -translate-x-full flex-col bg-white px-4 py-6 transition-transform lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : ''
        }`}
      >
        <div className="flex items-center gap-3 px-2">
          <LogoMark className="h-9 w-8" />
          <span className="text-xl font-bold tracking-[-0.3px] text-[#17171B]">Campus Update</span>
        </div>

        <div className="mt-7 rounded-2xl bg-[#17133B] p-3">
          <div className="flex items-center gap-3 rounded-[10px] bg-[#4F46E5] px-4 py-3">
            <UniversityIcon className="h-5 w-5 shrink-0" stroke="#fff" />
            <span className="flex min-w-0 flex-col gap-0.5 text-left">
              <span className="text-[11px] leading-3 text-white/70">Publishing as</span>
              <span className="truncate text-sm font-semibold leading-4 text-white">Osun State University</span>
            </span>
          </div>
        </div>

        <p className="mt-7 px-2 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#9CA3AF]">Publishing</p>
        <nav className="mt-3 flex flex-col gap-1.5">
          {PUBLISHING.map((i) => (
            <NavItem key={i.id} item={i} active={active === i.id} onNavigate={onNavigate} onClose={onClose} />
          ))}
        </nav>

        <p className="mt-7 px-2 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#9CA3AF]">Institution</p>
        <nav className="mt-3 flex flex-col gap-1.5">
          {INSTITUTION.map((i) => (
            <NavItem key={i.id} item={i} active={active === i.id} onNavigate={onNavigate} onClose={onClose} />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1.5 pt-8">
          <button
            type="button"
            onClick={() => onNavigate?.('settings')}
            className="flex h-[46px] w-full items-center gap-4 rounded-[10px] px-5 text-[15px] leading-[18px] text-[#3F3F46] hover:bg-[#F4F4F6]"
          >
            <SettingsIcon className="h-5 w-5" stroke="#52525B" />
            Settings
          </button>
          <button
            type="button"
            className="flex h-[46px] w-full items-center gap-4 rounded-[10px] px-5 text-[15px] leading-[18px] text-[#DC2626] hover:bg-[#FEF2F2]"
          >
            <LogoutIcon className="h-5 w-5" stroke="#DC2626" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
