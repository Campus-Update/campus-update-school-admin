const S = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }

export const LogoMark = ({ className = 'h-[38px] w-8' }) => (
  <svg viewBox="0 0 32 38" className={className} aria-hidden="true">
    <path
      d="M20.6 13.4c-1.5-1.4-3.4-2.2-5.5-2.1-4.2.1-7.6 3.6-7.6 7.9 0 4.3 3.4 7.8 7.6 7.9 2.1.1 4-.7 5.5-2.1"
      fill="none"
      stroke="#4F46E5"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    <path d="M4 2.5h24a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4Z" fill="#4F46E5" />
  </svg>
)

export const UniversityIcon = ({ className = 'h-[18px] w-[18px]' }) => (
  <svg viewBox="0 0 18 18" className={className} stroke="#A5B4FC" strokeWidth="1.125" {...S} aria-hidden="true">
    <path d="M1.5 16h15M2.5 12.5h12M5 9.5V6.8L8.5 3l3.5 3.8v2.7M8 5.5h1.5M9 7.5v.5" />
  </svg>
)

export const DashboardIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="4" />
    <circle cx="15.5" cy="8.5" r="4" />
    <circle cx="15.5" cy="15.5" r="4" />
    <circle cx="8.5" cy="15.5" r="4" />
  </svg>
)

export const NewsIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <path d="M19.5 8.5v10a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1M19.5 8.5h-2a1 1 0 0 0-1 1v7.5a1.5 1.5 0 0 0 3 0v-7Z" />
    <path d="M8 8.5h5.5M8 12.5h5.5M8 16.5h3.5" />
  </svg>
)

export const NoteIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <path d="M10 4.5h9a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 19 19.5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5h1" />
    <path d="M8 3.5h4v3H8zM9.5 10.5h4M9.5 14h4" />
  </svg>
)

export const UserGroupIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <circle cx="9.5" cy="7.5" r="2.5" />
    <circle cx="15.5" cy="7.5" r="2.5" />
    <path d="M4.5 15.5c.7-2 2.7-3.2 5-3.2 1.5 0 2.9.5 3.9 1.4M13.5 17.5c.5-2.1 2.1-3.5 4-3.5 1.4 0 2.7.8 3.5 2M6.5 17.5c.6-1.3 1.7-2.1 3-2.1s2.4.8 3 2.1" />
  </svg>
)

export const AnalyticsIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 14.5v-3M12 14.5V9.5M15.5 14.5v-2" />
  </svg>
)

export const SettingsIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12a7 7 0 0 0-.14-1.4l2.1-1.63-2-3.47-2.48 1a7 7 0 0 0-2.42-1.4L13.7 2.5h-3.4l-.36 2.6a7 7 0 0 0-2.42 1.4l-2.48-1-2 3.47 2.1 1.63a7 7 0 0 0 0 2.8l-2.1 1.63 2 3.47 2.48-1a7 7 0 0 0 2.42 1.4l.36 2.6h3.4l.36-2.6a7 7 0 0 0 2.42-1.4l2.48 1 2-3.47-2.1-1.63c.1-.46.14-.93.14-1.4Z" />
  </svg>
)

export const LogoutIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <path d="M13 4.5H6A1.5 1.5 0 0 0 4.5 6v12A1.5 1.5 0 0 0 6 19.5h7M10 12h10.5M17 8.5l3.5 3.5-3.5 3.5" />
  </svg>
)

export const BellIcon = ({ className = 'h-7 w-7', stroke = '#454545' }) => (
  <svg viewBox="0 0 29 29" className={className} stroke={stroke} strokeWidth="1.84" {...S} aria-hidden="true">
    <path d="M22.5 19.5H6.5c2-2 2.6-4.7 2.6-7.6a5.4 5.4 0 0 1 10.8 0c0 2.9.6 5.6 2.6 7.6ZM11.5 23a3 3 0 0 0 6 0" />
  </svg>
)

export const ChevronDown = ({ className = 'h-7 w-7', stroke = '#525252' }) => (
  <svg viewBox="0 0 27 27" className={className} stroke={stroke} strokeWidth="1.7" {...S} aria-hidden="true">
    <path d="M7 10.5l6.5 6 6.5-6" />
  </svg>
)

export const ChevronRight = ({ className = 'h-6 w-6', stroke = '#555555' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <path d="M9.5 6l6 6-6 6" />
  </svg>
)

export const ClipboardIcon = ({ className = 'h-7 w-7', stroke = '#4F46E5' }) => (
  <svg viewBox="0 0 28 28" className={className} stroke={stroke} strokeWidth="2" {...S} aria-hidden="true">
    <rect x="5.5" y="4.5" width="17" height="20" rx="2.5" />
    <path d="M10 4.5V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v.5" />
  </svg>
)

export const ActivityIcon = ({ className = 'h-7 w-7', stroke = '#4F46E5' }) => (
  <svg viewBox="0 0 28 28" className={className} stroke={stroke} strokeWidth="2" {...S} aria-hidden="true">
    <path d="M2.5 14h6l3.5-8 4 16 3.5-8h6" />
  </svg>
)

export const CalendarIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
    <path d="M3.5 10.5h17M8 3.5v4M16 3.5v4" />
  </svg>
)

export const MegaphoneIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <path d="M3.5 10v4a1 1 0 0 0 1 1H7l4.5 4a1 1 0 0 0 1.5-.87V5.87A1 1 0 0 0 11.5 5L7 9H4.5a1 1 0 0 0-1 1ZM17 9.5a4 4 0 0 1 0 5M19.5 7.5a7 7 0 0 1 0 9" />
  </svg>
)

export const SchoolsIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <path d="M3.5 20.5h17M5 20.5V9l7-5 7 5v11.5M9.5 20.5v-6h5v6" />
  </svg>
)

export const ShieldUserIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <path d="M12 2.5 4.5 5.5v6c0 5 3.2 8.4 7.5 10 4.3-1.6 7.5-5 7.5-10v-6L12 2.5Z" />
    <circle cx="12" cy="10" r="2.5" />
    <path d="M8.5 16c.7-1.7 2-2.6 3.5-2.6s2.8.9 3.5 2.6" />
  </svg>
)

export const UsersIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <circle cx="9" cy="8" r="3" />
    <path d="M4 19c.8-3 2.7-4.5 5-4.5s4.2 1.5 5 4.5M15.5 5.5a3 3 0 0 1 0 5M17 14.7c1.5.6 2.6 2 3 4.3" />
  </svg>
)

export const EyeIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const ListIcon = ({ className = 'h-6 w-6', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12M3.5 6.5h.01M3.5 12h.01M3.5 17.5h.01" />
  </svg>
)

export const SearchIcon = ({ className = 'h-4 w-4', stroke = '#6B7280' }) => (
  <svg viewBox="0 0 16 16" className={className} stroke={stroke} strokeWidth="1.5" {...S} aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" />
    <path d="m10.5 10.5 3 3" />
  </svg>
)

export const SortIcon = ({ className = 'h-3 w-3', stroke = '#9CA3AF' }) => (
  <svg viewBox="0 0 12 12" className={className} stroke={stroke} strokeWidth="1.2" {...S} aria-hidden="true">
    <path d="M6 2.5v7M3.5 5 6 2.5 8.5 5M3.5 7 6 9.5 8.5 7" />
  </svg>
)

export const WarningIcon = ({ className = 'h-7 w-7', stroke = '#D85A30' }) => (
  <svg viewBox="0 0 28 28" className={className} stroke={stroke} strokeWidth="2" {...S} aria-hidden="true">
    <path d="M14 3.5 25.5 23.5H2.5L14 3.5ZM14 11v5M14 19.5v.5" />
  </svg>
)

export const TrashIcon = ({ className = 'h-7 w-7', stroke = '#DC2626' }) => (
  <svg viewBox="0 0 28 28" className={className} stroke={stroke} strokeWidth="2" {...S} aria-hidden="true">
    <path d="M5 8h18M11 8V5.5A1.5 1.5 0 0 1 12.5 4h3A1.5 1.5 0 0 1 17 5.5V8M8 8l1 15a2 2 0 0 0 2 1.8h6A2 2 0 0 0 19 23l1-15M12 12.5v7M16 12.5v7" />
  </svg>
)

export const SealCheckIcon = ({ className = 'h-24 w-24' }) => (
  <svg viewBox="0 0 96 96" className={className} fill="none" aria-hidden="true">
    <path
      d="M48 6l8.5 6.2 10.4-1.8 4.6 9.5 9.5 4.6-1.8 10.4L66 48l6.2 8.5 1.8 10.4-9.5 4.6-4.6 9.5-10.4-1.8L48 86l-8.5-6.2-10.4 1.8-4.6-9.5-9.5-4.6 1.8-10.4L22 48l-6.2-8.5-1.8-10.4 9.5-4.6 4.6-9.5 10.4 1.8L48 6Z"
      fill="#BBF7D0"
    />
    <path d="M34 48.5 44 58l18-19" stroke="#047857" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const PlusIcon = ({ className = 'h-5 w-5', stroke = 'currentColor' }) => (
  <svg viewBox="0 0 20 20" className={className} stroke={stroke} strokeWidth="1.8" {...S} aria-hidden="true">
    <path d="M10 4v12M4 10h12" />
  </svg>
)

export const CloseIcon = ({ className = 'h-5 w-5', stroke = '#6B7280' }) => (
  <svg viewBox="0 0 20 20" className={className} stroke={stroke} strokeWidth="1.6" {...S} aria-hidden="true">
    <path d="m5 5 10 10M15 5 5 15" />
  </svg>
)

export const ViewSmIcon = ({ className = 'h-4 w-4', stroke = '#667085' }) => (
  <svg viewBox="0 0 16 16" className={className} stroke={stroke} strokeWidth="1.3" {...S} aria-hidden="true">
    <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" />
    <circle cx="8" cy="8" r="2" />
  </svg>
)

export const AssignIcon = ({ className = 'h-4 w-4', stroke = '#667085' }) => (
  <svg viewBox="0 0 16 16" className={className} stroke={stroke} strokeWidth="1.3" {...S} aria-hidden="true">
    <rect x="2" y="3" width="12" height="10" rx="1.5" />
    <circle cx="6" cy="7" r="1.5" />
    <path d="M4 11c.4-1.2 1.1-1.8 2-1.8S7.6 9.8 8 11M10 6.5h2.5M10 9.5h2.5" />
  </svg>
)

export const OctagonPauseIcon = ({ className = 'h-4 w-4', stroke = '#667085' }) => (
  <svg viewBox="0 0 16 16" className={className} stroke={stroke} strokeWidth="1.3" {...S} aria-hidden="true">
    <path d="M5.2 1.8h5.6L14.2 5.2v5.6l-3.4 3.4H5.2L1.8 10.8V5.2L5.2 1.8Z" />
    <path d="M6.5 5.8v4.4M9.5 5.8v4.4" />
  </svg>
)

export const PowerOffIcon = ({ className = 'h-4 w-4', stroke = '#667085' }) => (
  <svg viewBox="0 0 16 16" className={className} stroke={stroke} strokeWidth="1.3" {...S} aria-hidden="true">
    <path d="M8 1.8v6M11.5 3.6a5.5 5.5 0 1 1-7 0" />
  </svg>
)

export const EditSmIcon = ({ className = 'h-4 w-4', stroke = '#667085' }) => (
  <svg viewBox="0 0 16 16" className={className} stroke={stroke} strokeWidth="1.3" {...S} aria-hidden="true">
    <path d="m10.8 2.6 2.6 2.6L6 12.6l-3.2.6.6-3.2 7.4-7.4ZM9.5 3.9l2.6 2.6" />
  </svg>
)

export const OctagonPauseLg = ({ className = 'h-8 w-8', stroke = '#D85A30' }) => (
  <svg viewBox="0 0 32 32" className={className} stroke={stroke} strokeWidth="2" {...S} aria-hidden="true">
    <path d="M10.4 3.6h11.2l6.8 6.8v11.2l-6.8 6.8H10.4l-6.8-6.8V10.4l6.8-6.8Z" />
    <path d="M13 11.6v8.8M19 11.6v8.8" />
  </svg>
)
