import { useEffect, useState } from 'react'
import {
  Check,
  Cloud,
  CloudOff,
  Cpu,
  Database,
  Download,
  HardDrive,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn, formatDate, timeAgo } from '../lib/utils'
import { InfoBanner, PageHeader, Toggle } from '../components/ui'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function OfflinePage() {
  const { state, setDeviceOnline, notify } = useApp()
  const [online, setOnline] = useState(() => navigator.onLine)
  const [swReady, setSwReady] = useState(false)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [storage, setStorage] = useState<{ used: number; quota: number } | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(state.lastSynced)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => setSwReady(Boolean(registration)))
    }
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then((estimate) => setStorage({ used: estimate.usage ?? 0, quota: estimate.quota ?? 0 }))
    }
    const handler = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    const installedHandler = () => setInstalled(true)
    window.addEventListener('appinstalled', installedHandler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const install = async () => {
    if (!installEvent) return notify('Use your browser menu → “Install app” to add PlantCare AI.', 'info')
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') {
      setInstalled(true)
      notify('PlantCare AI installed as a PWA.')
    }
    setInstallEvent(null)
  }

  const syncNow = () => {
    setSyncing(true)
    window.setTimeout(() => {
      setSyncing(false)
      setLastSync(new Date().toISOString())
      notify('Demo sync complete. Local readings merged into the workspace.', 'success')
    }, 1200)
  }

  const usedMb = storage ? (storage.used / (1024 * 1024)).toFixed(1) : '—'
  const quotaMb = storage ? (storage.quota / (1024 * 1024)).toFixed(0) : '—'
  const pendingActions = state.device.online ? 0 : 3

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Offline mode"
        subtitle="The app shell, your plant profiles and care history stay available without a connection. The ESP32 keeps watering safely on its own."
        icon={CloudOff}
        actions={
          <button type="button" onClick={syncNow} disabled={syncing} className="btn-primary">
            <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} /> {syncing ? 'Syncing…' : 'Sync now'}
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className={cn('relative overflow-hidden rounded-3xl border p-5 sm:p-6', online ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10' : 'border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/10')}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-2xl', online ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white')}>
                  {online ? <Wifi className="h-6 w-6" /> : <WifiOff className="h-6 w-6" />}
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold tracking-[-0.03em] text-main">{online ? 'You are online' : 'You are offline'}</h2>
                  <p className="mt-0.5 max-w-md text-[10.5px] leading-5 text-muted">
                    {online
                      ? 'Live demo telemetry is simulated locally. Plant data is stored in your browser and remains readable if the connection drops.'
                      : 'The demo keeps working from cached data. Commands that need the device will queue until it reconnects.'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="chip-neutral"><Cloud className="h-2.5 w-2.5" /> Browser {online ? 'online' : 'offline'}</span>
                    <span className="chip-neutral"><Cpu className="h-2.5 w-2.5" /> Device {state.device.online ? 'online' : 'offline'}</span>
                    <span className="chip-neutral">Last sync {timeAgo(lastSync)}</span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <span className={cn('chip', swReady ? 'chip-green' : 'chip-amber')}>
                  {swReady ? <><Check className="h-2.5 w-2.5" /> Service worker ready</> : 'Service worker pending'}
                </span>
                <span className={cn('chip', installed ? 'chip-green' : 'chip-neutral')}>
                  {installed ? 'Installed app' : 'Browser tab'}
                </span>
              </div>
            </div>
          </section>

          <section className="panel p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-sm font-bold text-main">Device connection</h2>
                <p className="text-[10px] text-muted">Simulate the ESP32 dropping off the network.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('chip', state.device.online ? 'chip-green' : 'chip-amber')}>{state.device.online ? 'Device online' : 'Device offline'}</span>
                <Toggle checked={state.device.online} onChange={setDeviceOnline} label="Simulate device online" />
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { label: 'Local watering', value: state.device.offlineAutonomy ? 'Continues on ESP32' : 'Stops with Wi-Fi', ok: state.device.offlineAutonomy, icon: Zap },
                { label: 'App commands', value: state.device.online ? 'Available' : 'Queued locally', ok: state.device.online, icon: Cloud },
                { label: 'Sensor history', value: 'Buffered on device', ok: true, icon: Database },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-line bg-surface-2 p-3">
                  <item.icon className={cn('h-4 w-4', item.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300')} />
                  <p className="mt-2 text-[10px] font-bold text-main">{item.label}</p>
                  <p className="text-[9px] text-muted">{item.value}</p>
                </div>
              ))}
            </div>

            {!state.device.online && (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4.5 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                Manual watering is blocked while the device is offline. The ESP32's own schedule and hardware safety continue independently. When the device reconnects, buffered readings merge into the history.
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
              <div>
                <p className="text-[10px] font-bold text-main">Pending sync queue</p>
                <p className="text-[9px] text-muted">{pendingActions ? `${pendingActions} demo actions waiting` : 'Nothing waiting to sync'}</p>
              </div>
              <button type="button" onClick={syncNow} disabled={syncing || state.device.online} className="btn-secondary !py-1.5 !text-[10px]">
                <RefreshCw className={cn('h-3 w-3', syncing && 'animate-spin')} /> {state.device.online ? 'Up to date' : 'Flush queue'}
              </button>
            </div>
          </section>

          <section className="panel p-4 sm:p-5">
            <h2 className="font-display text-sm font-bold text-main">What works offline</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                { label: 'App shell & navigation', ok: true },
                { label: 'Plant profiles & care notes', ok: true },
                { label: 'Cached watering history', ok: true },
                { label: 'Settings & language choice', ok: true },
                { label: 'Live cloud AI responses', ok: false },
                { label: 'New device commands', ok: false },
                { label: 'ESP32 local watering', ok: true },
                { label: 'Hardware safety limits', ok: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                  <span className={cn('grid h-4 w-4 place-items-center rounded-full text-white', item.ok ? 'bg-emerald-500' : 'bg-slate-400')}>
                    {item.ok ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <CloudOff className="h-2.5 w-2.5" />}
                  </span>
                  <span className="text-[10px] text-soft">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[9px] leading-4 text-muted">
              This is a frontend PWA demo: cached pages and local browser storage only. A production build would add a background sync queue, conflict resolution and server-side device authentication.
            </p>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main"><Smartphone className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> Install as an app</h2>
            <p className="mt-1.5 text-[9.5px] leading-4.5 text-muted">Add PlantCare AI to your home screen for a full-screen, app-like experience with cached assets.</p>
            <button type="button" onClick={install} disabled={installed} className="btn-primary mt-3 w-full">
              <Download className="h-4 w-4" /> {installed ? 'Already installed' : 'Install PlantCare AI'}
            </button>
            <p className="mt-2 text-[8.5px] leading-4 text-muted">If the install prompt is unavailable, use your browser's “Install” or “Add to Home Screen” menu.</p>
          </div>

          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main"><HardDrive className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> Local storage</h2>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted">Approx. used</span>
                <span className="font-bold text-main">{usedMb} MB</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: storage && storage.quota ? `${Math.min(100, (storage.used / storage.quota) * 100)}%` : '12%' }} />
              </div>
              <div className="mt-1 flex justify-between text-[8px] text-muted">
                <span>Workspace data</span>
                <span>Quota {quotaMb} MB</span>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                { label: 'Plant & care data', value: 'localStorage' },
                { label: 'Session & auth', value: 'localStorage / sessionStorage' },
                { label: 'Offline shell', value: swReady ? 'Service worker' : 'Not registered yet' },
                { label: 'Photos', value: 'Demo assets + data URLs' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-[9px]">
                  <span className="text-muted">{row.label}</span>
                  <span className="font-semibold text-soft">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-forest-900 p-4 text-white dark:bg-[#173026]">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-lime-300"><Cpu className="h-3.5 w-3.5" /> ESP32 autonomy</p>
            <p className="mt-2 text-[9.5px] leading-4.5 text-white/65">
              Even with no Wi-Fi and no website, the controller reads the soil sensor, applies the configured threshold and enforces max runtime, cooldown and low-water protection locally.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[8.5px] text-white/70">
              <ShieldCheck className="h-3 w-3" /> Website is monitoring + approval, not the safety layer.
            </div>
          </div>

          <InfoBanner icon={Cloud} title="Demo limitation" tone="info">
            Offline caching depends on your browser and the service worker being registered after a production build. The Vite dev server may not cache every asset.
          </InfoBanner>
        </aside>
      </div>

      <section className="panel mt-4 overflow-hidden">
        <div className="border-b border-line px-4 py-3 sm:px-5">
          <h2 className="font-display text-sm font-bold text-main">Sync & device timeline</h2>
          <p className="text-[10px] text-muted">From your demo activity log</p>
        </div>
        <div className="divide-y divide-[color:var(--line)]">
          {state.activities
            .filter((activity) => ['device', 'sensor', 'safety', 'reservoir'].includes(activity.type))
            .slice(0, 6)
            .map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 px-4 py-3 sm:px-5">
                <span className={cn('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg', activity.type === 'device' ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300')}>
                  {activity.type === 'device' ? <Wifi className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-main">{activity.title}</p>
                  <p className="text-[9px] leading-4 text-muted">{activity.detail}</p>
                </div>
                <span className="shrink-0 text-[8px] text-muted">{formatDate(activity.timestamp, { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
