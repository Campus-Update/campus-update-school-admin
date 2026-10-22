import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import {
  MegaphoneIcon,
  UserGroupIcon,
  NewsIcon,
  ClipboardIcon,
  ChevronRight,
  ActivityIcon,
} from './Icons.jsx'
import { useData } from '../../campus-update/context/DataContext.jsx'
import { relativeTime } from '../../campus-update/lib/format.js'

const TYPE_STYLES = {
  Urgent: { text: '#C2410C', bg: '#FFF1E7', dot: '#EA580C' },
  Important: { text: '#0F7B5F', bg: '#E6F6F0', dot: '#10B981' },
  News: { text: '#344054', bg: '#EEF0F3', dot: '#344054' },
  Events: { text: '#344054', bg: '#EEF0F3', dot: '#344054' },
  Normal: { text: '#4F46E5', bg: '#EEEDFD', dot: '#6366F1' },
}

function TypePill({ type }) {
  const s = TYPE_STYLES[type] || TYPE_STYLES.News
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-[5px] text-[13px] font-medium leading-4" style={{ color: s.text, backgroundColor: s.bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {type}
    </span>
  )
}

const TH = ({ children, sort = false, className = '' }) => (
  <th className={`h-10 whitespace-nowrap bg-[#F9FAFB] px-4 py-3 text-left text-[11px] font-semibold uppercase leading-3 tracking-[0.5px] text-[#6B7280] ${className}`}>
    <span className="inline-flex items-center gap-1">
      {children}
      {sort && (
        <svg viewBox="0 0 12 12" className="h-3 w-3" stroke="#9CA3AF" strokeWidth="1.2" fill="none" strokeLinecap="round">
          <path d="M3.5 5 6 2.5 8.5 5M3.5 7 6 9.5 8.5 7" />
        </svg>
      )}
    </span>
  </th>
)

function StatCard({ title, value, sub, hero = false }) {
  if (hero) {
    return (
      <div className="flex flex-col gap-6 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#312E81] px-6 py-6 text-white md:px-7 md:py-7">
        <p className="text-base font-medium leading-[18px] md:text-lg">{title}</p>
        <div className="flex flex-col gap-3">
          <p className="text-4xl font-medium leading-[41px]">{value}</p>
          <p className="flex items-center gap-2 text-sm leading-[15px] text-white/90">
            <svg viewBox="0 0 16 16" className="h-4 w-4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12.5 6.5 8l2.8 2.8L14 5.5M14 9.5v-4h-4" />
            </svg>
            {sub}
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-[#E7E7EA] bg-white px-6 py-6 md:px-7 md:py-7">
      <p className="text-base font-medium leading-[18px] text-[#17171B] md:text-lg">{title}</p>
      <div className="flex flex-col gap-3">
        <p className="text-4xl font-medium leading-[41px] text-[#17171B]">{value}</p>
        <p className="text-sm leading-[15px] text-[#6E6E73]">{sub}</p>
      </div>
    </div>
  )
}

const QUICK_ACTIONS = [
  { title: 'New Article', sub: 'Draft a standard news post', icon: NewsIcon, bg: '#EEEDFD', stroke: '#4F46E5' },
  { title: 'Schedule Event', sub: 'Add to university calendar', icon: ClipboardIcon, bg: '#EEEDFD', stroke: '#4F46E5' },
  { title: 'Manage News Announcement', sub: 'Create and manage alerts', icon: MegaphoneIcon, bg: '#FDECEC', stroke: '#DC2626' },
  { title: 'View Users', sub: 'Manage system users', icon: UserGroupIcon, bg: '#E6F6F0', stroke: '#0F7B5F' },
]

function ModuleThumb({ from, to }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 11.5 6 7l3 3 5-5.5M2 13.5h12" />
      </svg>
    </span>
  )
}

function ModuleCard({ dot, title, children }) {
  return (
    <div className="flex flex-col gap-4 rounded-[10px] border border-[#E7E7EA] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold leading-4 text-[#17171B]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
          {title}
        </span>
        <button type="button" className="text-[13px] font-semibold leading-4 text-[#4F46E5]">View all</button>
      </div>
      {children}
    </div>
  )
}

function EmptyBox({ title }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-[10px] border border-[#E7E7EA] bg-[#FAFAFB] px-6 py-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEEDFD]">
        <ActivityIcon className="h-6 w-6" stroke="#8B87F3" />
      </span>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-lg font-semibold leading-6 text-[#17171B]">{title}</p>
        <p className="text-[13px] leading-4 text-[#9CA3AF]">All caught up!</p>
      </div>
    </div>
  )
}

export default function OverviewPage({ onNavigate, onLogout }) {
  const { content, events, alerts } = useData()
  const ACTIVITY = content.rows.slice(0, 5).map((r) => ({
    title: r.title,
    meta: `${r.source} · ${relativeTime(r.updatedAt)}${r.push ? ' · push sent' : ''}`,
    type: r.priority !== 'Normal' ? r.priority : r.type === 'Event' ? 'Events' : r.type,
    audience: r.audience,
    reach: String(r.reach),
    opened: `${r.open}%`,
  }))
  const month = new Date().toISOString().slice(0, 7)
  const publishedRows = content.rows.filter((r) => (r.publishedAt || '').slice(0, 7) === month)
  const countType = (t) => publishedRows.filter((r) => r.type === t).length
  const [navOpen, setNavOpen] = useState(false)
  const hasActivity = ACTIVITY.length > 0

  return (
    <div className="min-h-screen w-full bg-[#F4F4F6] p-3 md:p-[27px]">
      <div className="flex gap-4 md:gap-6">
        <Sidebar active="overview" onNavigate={onNavigate} onLogout={onLogout} open={navOpen} onClose={() => setNavOpen(false)} />

        <main className="flex min-w-0 flex-1 flex-col gap-4 md:gap-6">
          <Topbar title="Overview" subtitle="Manage operations, users, and system configuration." onMenu={() => setNavOpen(true)} />

          {/* Greeting + emergency alert */}
          <div className="flex flex-col gap-4 md:gap-5">
            <span className="w-fit rounded-[10px] border border-[#E7E7EA] bg-white px-4 py-2.5 text-sm font-medium leading-4 text-[#17171B]">
              Mon, 25 Aug 2025
            </span>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-col gap-1.5">
                <h2 className="text-xl font-medium leading-[26px] text-[#17171B] md:text-2xl">Good morning, John.</h2>
                <p className="text-sm leading-[17px] text-[#6E6E73]">Here's what is happening across Campus Update today.</p>
              </div>
              <button
                type="button"
                className="flex h-[50px] w-full shrink-0 items-center justify-center gap-3 rounded-[10px] bg-gradient-to-b from-[#C4271C] to-[#7E150C] px-6 text-sm font-semibold leading-4 text-white hover:opacity-95 md:w-auto"
              >
                <MegaphoneIcon className="h-5 w-5" stroke="#fff" />
                Broadcast Emergency Alert
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
            <StatCard hero title="Registered students" value="08" sub="+96 this week" />
            <StatCard title="Registered staff" value="30" sub="+3 this week" />
            <StatCard title="Published this month" value={String(publishedRows.length).padStart(2, '0')} sub={`${countType('News')} news · ${countType('Announcement')} announcements · ${countType('Event')} events`} />
            <StatCard title="Median time to read" value="N0.00" sub="From publish to first open" />
          </div>

          {/* Activity + quick actions */}
          <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-3">
            <section className="flex flex-col gap-5 rounded-xl border border-[#E7E7EA] bg-white p-4 md:p-6 xl:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold leading-6 text-[#17171B]">Recent Activity</h3>
                <button type="button" className="h-11 rounded-[10px] bg-[#4F46E5] px-6 text-sm font-semibold leading-4 text-white hover:bg-[#4338CA]">
                  View all
                </button>
              </div>
              {hasActivity ? (
                <div className="overflow-x-auto rounded-[10px] border border-[#EDEDF0]">
                  <table className="w-full min-w-[760px] table-fixed border-collapse">
                    <thead>
                      <tr>
                        <TH sort className="w-[36%]">CONTENT</TH>
                        <TH sort className="w-[13%]">TYPE</TH>
                        <TH sort className="w-[20%]">AUDIENCE</TH>
                        <TH sort className="w-[10%]">REACH</TH>
                        <TH sort className="w-[11%]">OPENED</TH>
                        <TH className="w-[10%]">ACTION</TH>
                      </tr>
                    </thead>
                    <tbody>
                      {ACTIVITY.map((r, i) => (
                        <tr key={i} className={`border-t border-[#EDEDF0] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFB]'}`}>
                          <td className="w-[38%] px-4 py-4">
                            <button type="button" className="block truncate text-left text-[15px] font-semibold leading-5 text-[#4F46E5] hover:underline">
                              {r.title}
                            </button>
                            <span className="mt-1 block truncate text-[13px] leading-4 text-[#7B77F0]">{r.meta}</span>
                          </td>
                          <td className="w-[13%] px-4 py-4"><TypePill type={r.type} /></td>
                          <td className="w-[21%] px-4 py-4 text-[13px] leading-4 text-[#3F3F46]">{r.audience}</td>
                          <td className="w-[9%] px-4 py-4 text-[13px] font-medium leading-4 text-[#17171B]">{r.reach}</td>
                          <td className="w-[9%] px-4 py-4 text-[13px] leading-4 text-[#3F3F46]">{r.opened}</td>
                          <td className="w-[10%] px-4 py-4">
                            <button type="button" aria-label="Row actions" className="text-[#6B7280] hover:text-[#17171B]">•••</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyBox title="No recent activity" />
              )}
            </section>

            <section className="flex flex-col gap-5 rounded-xl border border-[#E7E7EA] bg-white p-4 md:p-6">
              <h3 className="text-lg font-semibold leading-6 text-[#17171B]">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                {QUICK_ACTIONS.map((a) => {
                  const Icon = a.icon
                  return (
                    <button key={a.title} type="button" className="flex items-center gap-4 rounded-[10px] px-2 py-3 text-left hover:bg-[#FAFAFB]">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px]" style={{ backgroundColor: a.bg }}>
                        <Icon className="h-5 w-5" stroke={a.stroke} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-sm font-semibold leading-4 text-[#17171B]">{a.title}</span>
                        <span className="truncate text-[13px] leading-4 text-[#9CA3AF]">{a.sub}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0" stroke="#52525B" />
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Overview modules */}
          <section className="flex flex-col gap-5 rounded-xl border border-[#E7E7EA] bg-white p-4 md:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold leading-6 text-[#17171B]">Overview Modules</h3>
              <button type="button" className="text-[13px] font-medium leading-4 text-[#4F46E5]">Real-time Firestore sync</button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
              <ModuleCard dot="#10B981" title="News Feed">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <ModuleThumb from="#7C3AED" to="#F472B6" />
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-sm font-medium leading-4 text-[#17171B]">{content.rows[0]?.title || 'No news yet'}</span>
                      <span className="truncate text-xs leading-3.5 text-[#9CA3AF]">{content.rows[0] ? `${(content.rows[0].publishedAt || '').slice(0, 10)} • ${content.rows[0].type}` : 'Publish your first post'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ModuleThumb from="#7C3AED" to="#F472B6" />
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-sm font-medium leading-4 text-[#17171B]">{content.rows[1]?.title || '—'}</span>
                      <span className="truncate text-xs leading-3.5 text-[#9CA3AF]">{content.rows[1] ? `${(content.rows[1].publishedAt || '').slice(0, 10)} • ${content.rows[1].type}` : '—'}</span>
                    </span>
                  </div>
                </div>
              </ModuleCard>

              <ModuleCard dot="#F59E0B" title="Academic Events">
                <div className="flex items-center justify-between gap-3 rounded-[10px] bg-[#FAFAFB] px-4 py-3">
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm font-medium leading-4 text-[#17171B]">{events.rows[0]?.title || 'No events yet'}</span>
                    <span className="truncate text-xs leading-3.5 text-[#9CA3AF]">{events.rows[0] ? `${(events.rows[0].when || '').replace('T', ' @ ')} ${events.rows[0].venue !== '—' ? events.rows[0].venue : ''}`.trim() : 'Schedule your first event'}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E6F6F0] px-3 py-[5px] text-[13px] font-medium leading-4 text-[#0F7B5F]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    Standard
                  </span>
                </div>
              </ModuleCard>

              <ModuleCard dot="#3B82F6" title="Emergency Broadcast">
                <div className="flex items-center justify-between gap-3 rounded-[10px] bg-[#FAFAFB] px-4 py-3">
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-sm font-medium leading-4 text-[#17171B]">{alerts.rows[0]?.title || 'No alerts'}</span>
                    <span className="truncate text-xs leading-3.5 text-[#9CA3AF]">{alerts.rows[0]?.message || 'Emergency broadcasts appear here.'}</span>
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDECEC]">
                    <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                  </span>
                </div>
              </ModuleCard>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
