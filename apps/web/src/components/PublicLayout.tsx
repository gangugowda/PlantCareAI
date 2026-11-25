import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Cpu,
  LayoutDashboard,
  Leaf,
  Mail,
  Menu,
  MessageCircle,
  Settings2,
  ShieldCheck,
  Sprout,
  X,
  BarChart3,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn } from '../lib/utils'
import { Avatar, LanguageSelect, Logo, ThemeToggle } from './ui'

const marketingLinks = [
  { to: '/', label: 'Home' },
  { to: '/problem', label: 'Problem' },
  { to: '/solution', label: 'Solution' },
  { to: '/features', label: 'Features' },
  { to: '/how-it-works', label: 'How it works' },
]

const platformLinks = [
  { to: '/dashboard', label: 'Dashboard', description: 'Live plant telemetry and controls', icon: LayoutDashboard },
  { to: '/plants', label: 'My plants', description: 'Manage every plant and zone', icon: Sprout },
  { to: '/analytics', label: 'Analytics', description: 'Trends, water use and reports', icon: BarChart3 },
  { to: '/assistant', label: 'AI Plant Assistant', description: 'Ask Flora about plant health', icon: MessageCircle },
  { to: '/settings', label: 'Settings', description: 'Safety, device and preferences', icon: Settings2 },
]

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

export default function PublicLayout() {
  const { user, notify } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [platformOpen, setPlatformOpen] = useState(false)
  const [email, setEmail] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const scrolled = useScrolled()

  useEffect(() => {
    setMobileOpen(false)
    setPlatformOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const subscribe = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.includes('@')) {
      notify('Enter a valid email address.', 'warning')
      return
    }
    setEmail('')
    notify('You are on the list. Demo only — no email was sent.', 'info')
  }

  return (
    <div className="min-h-screen bg-[color:var(--bg)]">
      <div className="relative z-50 hidden border-b border-white/10 bg-forest-950 py-2 text-center text-[11px] font-medium text-white/70 sm:block">
        <span className="inline-flex items-center gap-2">
          <span className="chip bg-lime-300 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-forest-950">New</span>
          Offline-first watering: your ESP32 keeps caring even when Wi-Fi drops.
          <Link to="/offline" className="inline-flex items-center gap-0.5 font-semibold text-lime-300 hover:underline">
            See how it works <ChevronRight className="h-3 w-3" />
          </Link>
        </span>
      </div>

      <header
        className={cn(
          'sticky top-0 z-40 border-b transition-all duration-300',
          scrolled ? 'border-line bg-[color:color-mix(in_srgb,var(--bg)_88%,transparent)] shadow-[0_10px_30px_-24px_rgba(14,61,46,.4)] backdrop-blur-xl' : 'border-transparent bg-transparent',
        )}
      >
        <div className="container-wrap flex h-[68px] items-center justify-between gap-4">
          <Link to="/" aria-label="PlantCare AI home" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            {marketingLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn('public-link', isActive && 'public-link-active')}
              >
                {link.label}
              </NavLink>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setPlatformOpen(true)}
              onMouseLeave={() => setPlatformOpen(false)}
            >
              <button
                type="button"
                className={cn('public-link inline-flex items-center gap-1', platformOpen && 'public-link-active')}
                onClick={() => setPlatformOpen((open) => !open)}
                aria-expanded={platformOpen}
              >
                Platform
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', platformOpen && 'rotate-180')} />
              </button>
              {platformOpen && (
                <div className="absolute left-1/2 top-full w-[340px] -translate-x-1/2 pt-4">
                  <div className="overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-float">
                    {platformLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-surface-2"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 transition group-hover:bg-forest-900 group-hover:text-lime-300 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <link.icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-[13px] font-semibold text-main">{link.label}</span>
                          <span className="block text-[11px] leading-4 text-muted">{link.description}</span>
                        </span>
                        <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted opacity-0 transition group-hover:opacity-100" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSelect compact />
            <ThemeToggle compact />
            {user ? (
              <Link to="/dashboard" className="btn-primary hidden !px-4 sm:inline-flex">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost hidden sm:inline-flex">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary hidden !px-4 sm:inline-flex">
                  Get started
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
            <button
              type="button"
              className="icon-btn lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button type="button" className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-surface p-5 shadow-float animate-fadeIn">
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <button type="button" className="icon-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="stat-label mb-3">Explore</p>
            <nav className="space-y-1">
              {marketingLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition',
                      isActive ? 'bg-forest-900 text-white dark:bg-lime-300 dark:text-forest-950' : 'text-soft hover:bg-surface-2',
                    )
                  }
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </NavLink>
              ))}
            </nav>
            <div className="divider my-6" />
            <p className="stat-label mb-3">Platform</p>
            <nav className="space-y-1">
              {platformLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                      isActive ? 'bg-forest-900 text-white dark:bg-lime-300 dark:text-forest-950' : 'text-soft hover:bg-surface-2',
                    )
                  }
                >
                  <link.icon className="h-4 w-4 opacity-60" />
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-8 space-y-2">
              {user ? (
                <>
                  <div className="mb-3 flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                    <Avatar initials={user.avatar} />
                    <div>
                      <p className="text-sm font-semibold text-main">{user.name}</p>
                      <p className="text-xs text-muted">{user.plan} workspace</p>
                    </div>
                  </div>
                  <button type="button" className="btn-primary w-full" onClick={() => navigate('/dashboard')}>
                    Open dashboard
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn-primary w-full">
                    Create free account
                  </Link>
                  <Link to="/login" className="btn-secondary w-full">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <main>
        <Outlet />
      </main>

      <footer className="relative overflow-hidden bg-forest-950 text-white">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-52 left-1/4 h-[420px] w-[420px] rounded-full bg-lime-300/5 blur-3xl" />
        <div className="container-wrap relative py-14 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <Logo light />
              <p className="mt-5 max-w-md text-[15px] leading-7 text-white/60">
                Intelligent plant care for people who love plants but not the guesswork. Sense, water, protect and monitor — with hardware safety that keeps working offline.
              </p>
              <form onSubmit={subscribe} className="mt-6 flex max-w-md gap-2">
                <div className="relative min-w-0 flex-1">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email for plant-care notes"
                    aria-label="Email address"
                    className="h-11 w-full rounded-xl border border-white/15 bg-white/[0.06] pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/70 focus:border-lime-300/60"
                  />
                </div>
                <button type="submit" className="btn-lime h-11 shrink-0">
                  Subscribe
                </button>
              </form>
              <p className="mt-2 text-[10px] text-white/70">Demo newsletter form. No email is stored or sent.</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {['ESP32', 'MQTT-ready', 'Offline-first', 'PWA'].map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-white/75">
                    <Cpu className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime-300">Explore</h3>
                <ul className="mt-4 space-y-2.5 text-[13px] text-white/75">
                  {marketingLinks.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime-300">Platform</h3>
                <ul className="mt-4 space-y-2.5 text-[13px] text-white/75">
                  {platformLinks.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime-300">More</h3>
                <ul className="mt-4 space-y-2.5 text-[13px] text-white/75">
                  <li><Link to="/weather" className="transition hover:text-white">Weather-aware care</Link></li>
                  <li><Link to="/identify" className="transition hover:text-white">Identify a plant</Link></li>
                  <li><Link to="/family" className="transition hover:text-white">Family access</Link></li>
                  <li><Link to="/voice" className="transition hover:text-white">Voice control</Link></li>
                  <li><Link to="/offline" className="transition hover:text-white">Offline mode</Link></li>
                  <li><Link to="/calendar" className="transition hover:text-white">Care calendar</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-5 border-t border-white/10 pt-7 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'Hardware safety first', text: 'Runtime, cooldown and low-water limits stay on the ESP32.' },
              { icon: Leaf, title: 'Nature-led design', text: 'Built around real plant-care needs, not sensor dashboards alone.' },
              { icon: Cpu, title: 'ESP32 + sensors', text: 'A practical, repairable reference architecture.' },
              { icon: MessageCircle, title: 'Honest AI', text: 'Clear about what is guidance, estimate or integration preview.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-lime-300">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-white/85">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-5 text-white/70">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-[11px] text-white/70 sm:flex-row">
            <p>© 2026 PlantCare AI. Concept project — demo data and simulated device events are labelled.</p>
            <div className="flex flex-wrap gap-5">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Accessibility</span>
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> All systems demo-ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
