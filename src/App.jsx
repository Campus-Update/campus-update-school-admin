import { useEffect, useState } from 'react'
import LoginPage from './components/school/LoginPage.jsx'
import OverviewPage from './components/school/OverviewPage.jsx'
import ModulePage from './components/school/ModulePage.jsx'
import { DataProvider } from './campus-update/context/DataContext.jsx'
import { clearAuth, getAuth } from './lib/api.js'
import NewsPage from './campus-update/pages/News.jsx'
import EventsPage from './campus-update/pages/Events.jsx'
import CalendarPage from './campus-update/pages/Calendar.jsx'
import UsersPage from './campus-update/pages/Users.jsx'
import StatisticsPage from './campus-update/pages/Statistics.jsx'
import SettingsPage from './campus-update/pages/Settings.jsx'

const PAGES = ['news', 'events', 'calendar', 'users', 'stats', 'settings']

const PAGE_COMPONENTS = {
  news: NewsPage,
  events: EventsPage,
  calendar: CalendarPage,
  users: UsersPage,
  stats: StatisticsPage,
  settings: SettingsPage,
}

const TITLES = {
  news: ['News Announcements', 'Publish official announcements, research updates, and campus stories.'],
  events: ['Events', 'Schedule and manage academic events.'],
  calendar: ['Calendar', 'The institution calendar at a glance.'],
  users: ['User Management', 'Manage students, staff and admin accounts.'],
  stats: ['Statistics', 'Institution performance and reach.'],
  settings: ['Settings', 'Institution and account configuration.'],
}

const fromHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '')
  return PAGES.includes(h) ? h : 'overview'
}

function SchoolAdminApp({ onLogout }) {
  const [route, setRoute] = useState(fromHash)

  useEffect(() => {
    const onHash = () => setRoute(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = (id) => {
    if (PAGES.includes(id) || id === 'overview') window.location.hash = `/${id}`
  }

  if (route === 'overview') return <OverviewPage onNavigate={navigate} onLogout={onLogout} />
  const [title, subtitle] = TITLES[route]
  const Page = PAGE_COMPONENTS[route]
  return (
    <ModulePage active={route} title={title} subtitle={subtitle} onNavigate={navigate} onLogout={onLogout}>
      <Page />
    </ModulePage>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(() => !!getAuth())
  if (!authed) return <LoginPage onLoggedIn={() => setAuthed(true)} />
  const logout = () => {
    clearAuth()
    setAuthed(false)
  }
  return (
    <DataProvider>
      <SchoolAdminApp onLogout={logout} />
    </DataProvider>
  )
}
