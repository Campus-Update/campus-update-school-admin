import { useState } from 'react'
import { useData } from '../../campus-update/context/DataContext.jsx'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function ModulePage({ active, title, subtitle, onNavigate, onLogout, children }) {
  const [navOpen, setNavOpen] = useState(false)
  const { toastMsg } = useData()

  return (
    <div className="min-h-screen w-full bg-[#F4F4F6] p-3 md:p-[27px]">
      <div className="flex gap-4 md:gap-6">
        <Sidebar active={active} onNavigate={onNavigate} onLogout={onLogout} open={navOpen} onClose={() => setNavOpen(false)} />
        <main className="flex min-w-0 flex-1 flex-col gap-4 md:gap-6">
          <Topbar title={title} subtitle={subtitle} onMenu={() => setNavOpen(true)} />
          <div className="source-page">
            <section className="panel">{children}</section>
          </div>
        </main>
      </div>
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </div>
  )
}
