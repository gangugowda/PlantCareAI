import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  CloudOff,
  CloudSun,
  Command,
  Droplets,
  Images,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageCircle,
  Mic,
  Plus,
  ScanLine,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  X,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn, initials, timeAgo } from '../lib/utils'
import { Avatar, DeviceBadge, LanguageSelect, Logo, Modal, ThemeToggle, Toggle } from './ui'

const groups = [
  {
    label: 'Overview',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/plants', label: 'My plants', icon: Sprout },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Plant intelligence',
    links: [
      { to: '/assistant', label: 'AI Plant Assistant', icon: MessageCircle },
      { to: '/recommendations', label: 'AI recommendations', icon: Sparkles },
      { to: '/identify', label: 'Plant identification', icon: ScanLine },
      { to: '/calendar', label: 'Care calendar', icon: CalendarDays },
      { to: '/growth', label: 'Growth timeline', icon: Images },
    ],
  },
  {
    label: 'System',
    links: [
      { to: '/weather', label: 'Weather', icon: CloudSun },
      { to: '/water-health', label: 'Water & pump health', icon: Droplets },
      { to: '/family', label: 'Family access', icon: Users },
      { to: '/voice', label: 'Voice control', icon: Mic },
      { to: '/offline', label: 'Offline mode', icon: CloudOff },
      { to: '/settings', label: 'Settings', icon: Settings2 },
    ],
  },
]

const allLinks = groups.flatMap((group) => group.links)

export default function AppLayout() {
  const { state, user, theme, logout, markAllNotificationsRead, markNotificationRead } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const unread = state.notifications.filter((note) => !note.read).length
  const current = allLinks.find((link) => location.pathname === link.to || location.pathname.startsWith(`${link.to}/`))

  useEffect(() => {
    setMobileOpen(false)
    setNotificationsOpen(false)
    setProfileOpen(false)
    setSearchOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen, searchOpen])

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { links: allLinks.slice(0, 8), plants: state.plants.slice(0, 5) }
    return {
      links: allLinks.filter((link) => link.label.toLowerCase().includes(q)),
      plants: state.plants.filter((plant) => `${plant.name} ${plant.species} ${plant.room}`.toLowerCase().includes(q)),
    }
  }, [query, state.plants])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-line bg-[color:var(--surface)] px-3 py-5 lg:flex lg:flex-col">
        <div className="px-2">
          <Link to="/" aria-label="PlantCare AI home">
            <Logo />
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-line bg-surface-2 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-main">{state.device.name}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className={cn('h-1.5 w-1.5 rounded-full', state.device.online ? 'bg-emerald-500' : 'bg-amber-500')} />
              <p className="text-[10px] text-muted">{state.device.online ? 'Online · synced' : 'Offline · local mode'}</p>
            </div>
          </div>
        </div>

        <nav className="no-scrollbar mt-5 flex-1 overflow-y-auto pb-4" aria-label="Dashboard navigation">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-3 text-[9.5px] font-bold uppercase tracking-[0.18em] text-muted">{group.label}</p>
              <div className="space-y-0.5">
                {group.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}
                  >
                    <link.icon className="h-[17px] w-[17px] shrink-0 opacity-80" strokeWidth={1.9} />
                    <span className="truncate">{link.label}</span>
                    {link.to === '/assistant' && (
                      <span className="ml-auto rounded-full bg-lime-300 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-forest-950">AI</span>
                    )}
                    {link.to === '/offline' && !state.device.online && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="rounded-2xl bg-forest-900 p-3.5 text-white dark:bg-[#173026]">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-lime-300">
            <Sparkles className="h-3.5 w-3.5" />
            Grower Pro
          </div>
          <p className="mt-2 text-[11px] leading-5 text-white/75">AI recommendations, unlimited plants and advanced water reports.</p>
          <button type="button" onClick={() => navigate('/settings')} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/10 py-2 text-[11px] font-semibold text-white transition hover:bg-white/15">
            Manage plan
            <ChevronDown className="h-3 w-3 -rotate-90" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between px-2 text-[10px] text-muted">
          <span>v2.4.0 · PWA</span>
          <button type="button" className="inline-flex items-center gap-1 transition hover:text-main">
            <LifeBuoy className="h-3 w-3" /> Help
          </button>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-line bg-[color:color-mix(in_srgb,var(--bg)_90%,transparent)] backdrop-blur-xl">
          <div className="flex h-[66px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="icon-btn h-9 w-9 rounded-lg lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted">
                  <span>Workspace</span>
                  <span className="opacity-40">/</span>
                  <span className="truncate">{current?.label ?? 'Dashboard'}</span>
                </div>
                <p className="truncate font-display text-sm font-bold tracking-[-0.02em] text-main">{state.device.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden h-9 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-[11px] text-muted transition hover:bg-surface-2 md:flex"
              >
                <Search className="h-3.5 w-3.5" />
                Search anything
                <span className="ml-4 inline-flex items-center gap-0.5 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[9px] font-semibold">
                  <Command className="h-2.5 w-2.5" /> K
                </span>
              </button>
              <div className="hidden sm:block">
                <DeviceBadge online={state.device.online} compact />
              </div>
              <div className="relative">
                <button
                  type="button"
                  className="icon-btn h-9 w-9 rounded-lg"
                  aria-label={`Notifications (${unread} unread)`}
                  onClick={() => {
                    setNotificationsOpen((open) => !open)
                    setProfileOpen(false)
                  }}
                >
                  <Bell className="h-4 w-4" />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <>
                    <button type="button" className="fixed inset-0 z-30 cursor-default" aria-label="Close notifications" onClick={() => setNotificationsOpen(false)} />
                    <div className="absolute right-0 top-full z-40 mt-2 w-[min(370px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-float animate-fadeUp">
                      <div className="flex items-center justify-between border-b border-line px-4 py-3">
                        <div>
                          <p className="text-xs font-bold text-main">Notifications</p>
                          <p className="text-[10px] text-muted">{unread} unread updates</p>
                        </div>
                        <button type="button" onClick={markAllNotificationsRead} className="text-[10px] font-semibold text-emerald-700 hover:underline dark:text-emerald-300">
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-[360px] overflow-y-auto">
                        {state.notifications.length === 0 && (
                          <p className="px-4 py-10 text-center text-xs text-muted">No notifications right now.</p>
                        )}
                        {state.notifications.map((note) => (
                          <button
                            key={note.id}
                            type="button"
                            onClick={() => markNotificationRead(note.id)}
                            className={cn(
                              'flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition last:border-0 hover:bg-surface-2',
                              !note.read && 'bg-emerald-50/40 dark:bg-emerald-500/[0.04]',
                            )}
                          >
                            <span
                              className={cn(
                                'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg',
                                note.type === 'water'
                                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
                                  : note.type === 'safety'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
                              )}
                            >
                              {note.type === 'water' ? <Droplets className="h-3.5 w-3.5" /> : note.type === 'safety' ? <ShieldCheck className="h-3.5 w-3.5" /> : <Sprout className="h-3.5 w-3.5" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-start justify-between gap-2">
                                <span className="text-[11px] font-semibold text-main">{note.title}</span>
                                <span className="shrink-0 text-[9px] text-muted">{timeAgo(note.time)}</span>
                              </span>
                              <span className="mt-0.5 block text-[10px] leading-4 text-muted">{note.message}</span>
                            </span>
                            {!note.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
                          </button>
                        ))}
                      </div>
                      <button type="button" onClick={() => { setNotificationsOpen(false); navigate('/settings') }} className="flex w-full items-center justify-center gap-1 border-t border-line py-2.5 text-[10px] font-semibold text-muted transition hover:bg-surface-2 hover:text-main">
                        Manage notification preferences
                      </button>
                    </div>
                  </>
                )}
              </div>
              <ThemeToggle compact />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((open) => !open)
                    setNotificationsOpen(false)
                  }}
                  className="ml-0.5 flex items-center gap-2 rounded-xl border border-line bg-surface p-1 pr-2 transition hover:bg-surface-2"
                >
                  <Avatar initials={user?.avatar ?? 'NP'} size="sm" />
                  <span className="hidden max-w-24 truncate text-[11px] font-semibold text-main sm:block">{user?.name.split(' ')[0] ?? 'Guest'}</span>
                  <ChevronDown className="hidden h-3 w-3 text-muted sm:block" />
                </button>
                {profileOpen && (
                  <>
                    <button type="button" className="fixed inset-0 z-30 cursor-default" aria-label="Close profile menu" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-line bg-surface shadow-float animate-fadeUp">
                      <div className="border-b border-line p-4">
                        <p className="text-sm font-bold text-main">{user?.name}</p>
                        <p className="mt-0.5 truncate text-[11px] text-muted">{user?.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <Sparkles className="h-2.5 w-2.5" /> {user?.plan}
                        </div>
                      </div>
                      <div className="p-1.5">
                        <Link to="/profile" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-soft transition hover:bg-surface-2 hover:text-main">
                          <Users className="h-3.5 w-3.5" /> Profile
                        </Link>
                        <Link to="/settings" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-soft transition hover:bg-surface-2 hover:text-main">
                          <Settings2 className="h-3.5 w-3.5" /> Settings
                        </Link>
                        <Link to="/family" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-soft transition hover:bg-surface-2 hover:text-main">
                          <Users className="h-3.5 w-3.5" /> Family access
                        </Link>
                        <div className="my-1.5 h-px bg-[color:var(--line)]" />
                        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10">
                          <LogOut className="h-3.5 w-3.5" /> Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="pb-24 lg:pb-8">
          <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
        <div className="grid grid-cols-5">
          {[
            { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
            { to: '/plants', label: 'Plants', icon: Sprout },
            { to: '/assistant', label: 'Ask AI', icon: MessageCircle },
            { to: '/analytics', label: 'Insights', icon: BarChart3 },
            { to: '/settings', label: 'Settings', icon: Settings2 },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn('flex flex-col items-center gap-1 py-2.5 text-[9px] font-semibold transition', isActive ? 'text-emerald-700 dark:text-lime-300' : 'text-muted')
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button type="button" className="absolute inset-0 bg-forest-950/55 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[310px] overflow-y-auto border-r border-line bg-surface p-4 shadow-float animate-fadeIn">
            <div className="flex items-center justify-between px-1">
              <Logo />
              <button type="button" onClick={() => setMobileOpen(false)} className="icon-btn h-9 w-9 rounded-lg" aria-label="Close navigation">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface-2 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', state.device.online ? 'bg-emerald-500' : 'bg-amber-500')} />
                <span className="text-[10px] font-semibold text-soft">{state.device.online ? 'ESP32 online' : 'Offline · local mode'}</span>
              </div>
              <LanguageSelect compact />
            </div>
            <nav className="mt-5 pb-8">
              {groups.map((group) => (
                <div key={group.label} className="mb-4">
                  <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">{group.label}</p>
                  {group.links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) => cn('sidebar-link', isActive && 'sidebar-link-active')}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              ))}
              <button type="button" onClick={handleLogout} className="sidebar-link w-full text-red-600 dark:text-red-300">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </nav>
          </div>
        </div>
      )}

      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Search PlantCare AI" subtitle="Jump to a page or find one of your plants." size="md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages, plants, rooms…"
            className="input !pl-10"
            aria-label="Search PlantCare AI"
          />
        </div>
        <div className="mt-4 max-h-[48vh] overflow-y-auto">
          {searchResults.links.length > 0 && (
            <>
              <p className="stat-label mb-2 px-1">Pages</p>
              {searchResults.links.map((link) => (
                <Link key={link.to} to={link.to} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-soft"><link.icon className="h-3.5 w-3.5" /></span>
                  <span className="text-xs font-semibold text-main">{link.label}</span>
                </Link>
              ))}
            </>
          )}
          {searchResults.plants.length > 0 && (
            <>
              <p className="stat-label mb-2 mt-4 px-1">Plants</p>
              {searchResults.plants.map((plant) => (
                <Link key={plant.id} to={`/plants/${plant.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface-2">
                  <img src={plant.image} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-main">{plant.name} <span className="font-normal text-muted">· {plant.species}</span></span>
                    <span className="block text-[10px] text-muted">{plant.room} · {plant.moisture}% moisture</span>
                  </span>
                </Link>
              ))}
            </>
          )}
          {!searchResults.links.length && !searchResults.plants.length && (
            <p className="py-10 text-center text-xs text-muted">No matches. Try “settings” or “Monstera”.</p>
          )}
        </div>
      </Modal>
    </div>
  )
}
