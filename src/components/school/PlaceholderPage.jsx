import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function PlaceholderPage({ active, title, subtitle, note, onNavigate }) {
  const [navOpen, setNavOpen] = useState(false)
  return (
    <div className="min-h-screen w-full bg-[#F4F4F6] p-3 md:p-[27px]">
      <div className="flex gap-4 md:gap-6">
        <Sidebar active={active} onNavigate={onNavigate} open={navOpen} onClose={() => setNavOpen(false)} />
        <main className="flex min-w-0 flex-1 flex-col gap-4 md:gap-6">
          <Topbar title={title} subtitle={subtitle} onMenu={() => setNavOpen(true)} />
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-[#E7E7EA] bg-white px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEEDFD]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="#8B87F3" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19V9m8 10V5m8 14v-7" />
              </svg>
            </span>
            <p className="text-lg font-semibold leading-6 text-[#17171B]">{title}</p>
            <p className="max-w-[420px] text-sm leading-5 text-[#6E6E73]">{note}</p>
          </div>
        </main>
      </div>
    </div>
  )
}
