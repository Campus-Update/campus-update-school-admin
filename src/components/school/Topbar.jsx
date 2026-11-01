import { useEffect, useRef, useState } from 'react'
import { useData } from '../../campus-update/context/DataContext.jsx'
import SessionConfirm from '../../campus-update/components/SessionConfirm.jsx'
import { BellIcon, ChevronDown } from './Icons.jsx'

export default function Topbar({
  title = 'Overview',
  subtitle = 'Manage operations, users, and system configuration.',
  onMenu,
  onNavigate,
  onLogout,
}) {
  const { profile } = useData()
  const [profileOpen, setProfileOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <>
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
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => onNavigate?.('notifications')}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white md:h-[54px] md:w-[54px]"
        >
          <BellIcon className="h-6 w-6" />
          <span className="absolute right-[7px] top-[7px] h-2.5 w-2.5 rounded-full bg-[#D85A30]" />
        </button>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            aria-label="Profile menu"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-3 rounded-full border border-[#E5E7EB] bg-white py-1.5 pl-1.5 pr-2 md:py-[13px] md:pl-[26px] md:pr-4"
          >
            <img
              src="/images/avatar-john.png"
              alt=""
              className="h-9 w-9 rounded-full object-cover md:h-[42px] md:w-[42px]"
            />
            <span className="hidden flex-col gap-1 text-left sm:flex">
              <span className="text-base font-semibold leading-[17px] text-[#2D2D2D]">{`${profile.first} ${profile.last}`.trim() || 'School Admin'}</span>
              <span className="text-[13px] leading-[14px] text-[#6B7280]">{profile.role}</span>
            </span>
            <ChevronDown className="hidden h-5 w-5 md:block md:h-[27px] md:w-[27px]" />
          </button>
          {profileOpen && (
            <div role="menu" className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-lg">
              <button
                type="button"
                role="menuitem"
                onClick={() => { setProfileOpen(false); onNavigate?.('settings') }}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#2D2D2D] hover:bg-[#F4F4F6]"
              >
                Profile &amp; settings
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setProfileOpen(false); setConfirmLogout(true) }}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#DC2626] hover:bg-[#FEF2F2]"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    {confirmLogout && (
      <div className="source-page">
        <SessionConfirm
          type="single"
          device="this device"
          onClose={() => setConfirmLogout(false)}
          onConfirm={() => { setConfirmLogout(false); onLogout?.() }}
        />
      </div>
    )}
    </>
  )
}
