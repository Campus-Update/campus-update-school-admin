import { useEffect, useState } from 'react'
import OverviewPage from './components/school/OverviewPage.jsx'
import PlaceholderPage from './components/school/PlaceholderPage.jsx'

const PAGES = ['news', 'events', 'calendar', 'users', 'stats', 'settings']

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

export default function App() {
  const [route, setRoute] = useState(fromHash)

  useEffect(() => {
    const onHash = () => setRoute(fromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = (id) => {
    if (PAGES.includes(id) || id === 'overview') window.location.hash = `/${id}`
  }

  if (route === 'overview') return <OverviewPage onNavigate={navigate} />
  const [title, subtitle] = TITLES[route]
  return <PlaceholderPage active={route} title={title} subtitle={subtitle} onNavigate={navigate} note={route === 'news' ? 'This screen is under construction by the News module owner.' : 'This screen is coming soon.'} />
}
