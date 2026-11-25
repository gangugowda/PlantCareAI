import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Check,
  ChevronRight,
  Cpu,
  Database,
  Download,
  Droplets,
  Globe2,
  Gauge,
  KeyRound,
  LogOut,
  Moon,
  Palette,
  Power,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sun,
  Timer,
  Trash2,
  User,
  Waves,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn, downloadCsv } from '../lib/utils'
import { languageNames } from '../lib/i18n'
import { Avatar, InfoBanner, Modal, PageHeader, Toggle } from '../components/ui'
import type { Language, Theme } from '../lib/types'

type Tab = 'general' | 'watering' | 'safety' | 'device' | 'notifications' | 'account' | 'data'

const tabs: Array<{ value: Tab; label: string; icon: typeof User }> = [
  { value: 'general', label: 'General', icon: Palette },
  { value: 'watering', label: 'Moisture & watering', icon: Droplets },
  { value: 'safety', label: 'Pump safety', icon: ShieldCheck },
  { value: 'device', label: 'Device', icon: Cpu },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'account', label: 'Account', icon: User },
  { value: 'data', label: 'Data & demo', icon: Database },
]

const timezones = ['Asia/Colombo', 'Asia/Kolkata', 'Asia/Singapore', 'Europe/London', 'America/New_York', 'Australia/Sydney']

export default function SettingsPage() {
  const {
    state,
    user,
    updateSettings,
    updateNotificationSettings,
    updatePlant,
    setDeviceOnline,
    updateDevice,
    setTheme,
    setLanguage,
    setAutoWatering,
    resetDemo,
    logout,
    notify,
  } = useApp()
  const [tab, setTab] = useState<Tab>('general')
  const [resetOpen, setResetOpen] = useState(false)
  const [deviceForm, setDeviceForm] = useState({ name: state.device.name, ip: state.device.ip, wifi: state.device.wifi })
  const [safety, setSafety] = useState({
    defaultThreshold: state.settings.defaultThreshold,
    maxRuntime: state.settings.maxRuntime,
    cooldownMinutes: state.settings.cooldownMinutes,
    maxDailyCycles: state.settings.maxDailyCycles,
  })

  useEffect(() => {
    setSafety({
      defaultThreshold: state.settings.defaultThreshold,
      maxRuntime: state.settings.maxRuntime,
      cooldownMinutes: state.settings.cooldownMinutes,
      maxDailyCycles: state.settings.maxDailyCycles,
    })
  }, [state.settings.defaultThreshold, state.settings.maxRuntime, state.settings.cooldownMinutes, state.settings.maxDailyCycles])

  const autoCount = state.plants.filter((plant) => plant.autoWater).length
  const unread = state.notifications.filter((note) => !note.read).length
  const activeNotifications = Object.values(state.settings.notifications).filter(Boolean).length

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), user, state }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `plantcare-demo-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    notify('Demo workspace exported as JSON.')
  }

  const exportWatering = () => {
    downloadCsv(
      'plantcare-watering-history.csv',
      state.wateringEvents.map((event) => ({
        plant: state.plants.find((plant) => plant.id === event.plantId)?.name ?? event.plantId,
        date: event.date,
        seconds: event.durationSec,
        liters: event.liters,
        mode: event.mode,
        status: event.status,
      })),
    )
    notify('Watering history exported as CSV.')
  }

  const saveDevice = () => {
    updateDevice({ name: deviceForm.name.trim() || state.device.name, ip: deviceForm.ip.trim(), wifi: deviceForm.wifi.trim() })
    notify('Device details updated.')
  }

  const dirtySafety = useMemo(
    () =>
      safety.defaultThreshold !== state.settings.defaultThreshold ||
      safety.maxRuntime !== state.settings.maxRuntime ||
      safety.cooldownMinutes !== state.settings.cooldownMinutes ||
      safety.maxDailyCycles !== state.settings.maxDailyCycles,
    [safety, state.settings],
  )

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Settings"
        subtitle="Care defaults, pump safety, device details, notifications, language and your demo account — all in one place."
        icon={ShieldCheck}
        actions={
          <Link to="/profile" className="btn-secondary">
            <User className="h-3.5 w-3.5" /> Open profile
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
        <aside className="panel h-max p-2 lg:sticky lg:top-[82px]">
          <nav aria-label="Settings sections" className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
            {tabs.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTab(item.value)}
                className={cn(
                  'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition lg:w-full',
                  tab === item.value ? 'bg-forest-900 text-white dark:bg-lime-300 dark:text-forest-950' : 'text-soft hover:bg-surface-2 hover:text-main',
                )}
              >
                <item.icon className="h-3.5 w-3.5" /> {item.label}
                <ChevronRight className={cn('ml-auto hidden h-3 w-3 lg:block', tab === item.value ? 'opacity-70' : 'opacity-30')} />
              </button>
            ))}
          </nav>
          <div className="mt-2 hidden rounded-xl bg-surface-2 p-3 lg:block">
            <p className="text-[9px] font-bold uppercase tracking-wide text-muted">Workspace</p>
            <p className="mt-1 text-[10px] font-semibold text-main">{state.device.name}</p>
            <p className="text-[9px] text-muted">{state.plants.length} plants · {autoCount} auto</p>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          {tab === 'general' && (
            <>
              <section className="panel p-4 sm:p-5">
                <h2 className="font-display text-base font-bold text-main">Appearance</h2>
                <p className="mt-0.5 text-[10px] text-muted">Theme is saved for this browser and applies to every page.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {([
                    { value: 'light', label: 'Light', description: 'Off-white and forest green', icon: Sun },
                    { value: 'dark', label: 'Dark', description: 'Deep green, lime accents', icon: Moon },
                  ] as Array<{ value: Theme; label: string; description: string; icon: typeof Sun }>).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        'flex items-start gap-3 rounded-2xl border p-3.5 text-left transition',
                        state.settings.theme === option.value ? 'border-emerald-400 bg-emerald-50/60 dark:border-emerald-500/40 dark:bg-emerald-500/10' : 'border-line bg-surface hover:bg-surface-2',
                      )}
                    >
                      <span className={cn('grid h-9 w-9 place-items-center rounded-xl', option.value === 'light' ? 'bg-amber-100 text-amber-700' : 'bg-forest-900 text-lime-300')}><option.icon className="h-4 w-4" /></span>
                      <span className="flex-1">
                        <span className="flex items-center justify-between text-[11px] font-bold text-main">{option.label} {state.settings.theme === option.value && <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />}</span>
                        <span className="mt-0.5 block text-[9px] text-muted">{option.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel p-4 sm:p-5">
                <h2 className="font-display text-base font-bold text-main">Language & region</h2>
                <p className="mt-0.5 text-[10px] text-muted">Demo localization: a few dashboard labels switch language; navigation and long-form content stay in English.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="settings-language">Language</label>
                    <select id="settings-language" value={state.settings.language} onChange={(event) => setLanguage(event.target.value as Language)} className="select">
                      {(Object.keys(languageNames) as Language[]).map((code) => <option key={code} value={code}>{languageNames[code]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="settings-timezone">Timezone</label>
                    <select id="settings-timezone" value={state.settings.timezone} onChange={(event) => updateSettings({ timezone: event.target.value })} className="select">
                      {timezones.map((zone) => <option key={zone} value={zone}>{zone.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="settings-temp">Temperature</label>
                    <select id="settings-temp" value={state.settings.temperatureUnit} onChange={(event) => updateSettings({ temperatureUnit: event.target.value as 'C' | 'F' })} className="select">
                      <option value="C">Celsius (°C)</option>
                      <option value="F">Fahrenheit (°F)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="settings-water">Water volume</label>
                    <select id="settings-water" value={state.settings.waterUnit} onChange={(event) => updateSettings({ waterUnit: event.target.value as 'L' | 'gal' })} className="select">
                      <option value="L">Litres (L)</option>
                      <option value="gal">Gallons (gal)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-[9px] text-muted">
                  <Globe2 className="h-3 w-3" /> {languageNames[state.settings.language]} · {state.settings.timezone} · {state.settings.temperatureUnit === 'C' ? 'Metric' : 'Imperial'}
                </div>
              </section>

              <section className="panel p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-main">Automatic watering</h2>
                    <p className="mt-0.5 text-[10px] text-muted">Global arm switch. Per-plant auto toggles are managed under Moisture & watering.</p>
                  </div>
                  <Toggle checked={state.autoWatering} onChange={setAutoWatering} label="Automatic watering" />
                </div>
                <div className="mt-3 rounded-xl bg-surface-2 p-3 text-[9.5px] leading-4.5 text-muted">
                  Automatic watering only starts when a sensor reading crosses that plant's threshold. Every pulse still respects runtime, cooldown, daily-cycle and reservoir limits.
                </div>
              </section>
            </>
          )}

          {tab === 'watering' && (
            <>
              <section className="panel p-4 sm:p-5">
                <h2 className="font-display text-base font-bold text-main">Per-plant automatic watering</h2>
                <p className="mt-0.5 text-[10px] text-muted">Turning a plant off does not change its threshold — it only stops automatic pulses for that plant.</p>
                <div className="mt-4 divide-y divide-[color:var(--line)]">
                  {state.plants.map((plant) => (
                    <div key={plant.id} className="flex items-center gap-3 py-3">
                      <img src={plant.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-main">{plant.name}</p>
                        <p className="text-[9px] text-muted">{plant.species} · threshold {plant.threshold}% · {plant.wateringDuration}s pulse</p>
                      </div>
                      <span className={cn('chip hidden sm:inline-flex', plant.moisture <= plant.threshold ? 'chip-amber' : 'chip-green')}>{plant.moisture}%</span>
                      <Toggle checked={plant.autoWater} onChange={(value) => updatePlant({ ...plant, autoWater: value })} label={`Automatic watering for ${plant.name}`} />
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel p-4 sm:p-5">
                <h2 className="font-display text-base font-bold text-main">Moisture defaults</h2>
                <p className="mt-0.5 text-[10px] text-muted">Used as a starting threshold for new plants. Existing plants keep their own values.</p>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="label !mb-0" htmlFor="default-threshold">Default threshold</label>
                    <span className="text-[11px] font-bold text-main">{safety.defaultThreshold}%</span>
                  </div>
                  <input
                    id="default-threshold"
                    type="range"
                    min={15}
                    max={70}
                    value={safety.defaultThreshold}
                    onChange={(event) => setSafety({ ...safety, defaultThreshold: Number(event.target.value) })}
                    className="range"
                    style={{ ['--range-progress' as string]: `${((safety.defaultThreshold - 15) / 55) * 100}%` }}
                  />
                  <div className="mt-1 flex justify-between text-[8px] text-muted"><span>15% · dry-loving</span><span>70% · moisture-loving</span></div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {state.plants.map((plant) => (
                    <div key={plant.id} className="rounded-xl border border-line p-2.5">
                      <p className="text-[9px] font-bold text-main">{plant.name}</p>
                      <p className="text-[8px] text-muted">ideal {plant.minMoisture}–{plant.maxMoisture}%</p>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${plant.moisture}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex justify-end">
                <button type="button" onClick={() => updateSettings(safety)} disabled={!dirtySafety} className="btn-primary">
                  <Save className="h-4 w-4" /> Save moisture defaults
                </button>
              </div>
            </>
          )}

          {tab === 'safety' && (
            <>
              <InfoBanner icon={ShieldAlert} title="Hardware protections apply to manual and automatic watering" tone="warning">
                These limits are enforced in the app before any pump command. The ESP32 should enforce the same limits locally. Lower values are safer; do not raise runtime without checking your pump and tubing.
              </InfoBanner>

              <section className="panel p-4 sm:p-5">
                <h2 className="font-display text-base font-bold text-main">Pump runtime & cooldown</h2>
                <div className="mt-4 space-y-5">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="label !mb-0" htmlFor="max-runtime"><Timer className="mr-1 inline h-3 w-3" /> Maximum pump runtime</label>
                      <span className="text-[11px] font-bold text-main">{safety.maxRuntime}s</span>
                    </div>
                    <input id="max-runtime" type="range" min={5} max={30} value={safety.maxRuntime} onChange={(event) => setSafety({ ...safety, maxRuntime: Number(event.target.value) })} className="range" style={{ ['--range-progress' as string]: `${((safety.maxRuntime - 5) / 25) * 100}%` }} />
                    <div className="mt-1 flex justify-between text-[8px] text-muted"><span>5s · very cautious</span><span>30s · maximum</span></div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="label !mb-0" htmlFor="cooldown"><Gauge className="mr-1 inline h-3 w-3" /> Cooldown after watering</label>
                      <span className="text-[11px] font-bold text-main">{safety.cooldownMinutes} min</span>
                    </div>
                    <input id="cooldown" type="range" min={5} max={60} step={5} value={safety.cooldownMinutes} onChange={(event) => setSafety({ ...safety, cooldownMinutes: Number(event.target.value) })} className="range" style={{ ['--range-progress' as string]: `${((safety.cooldownMinutes - 5) / 55) * 100}%` }} />
                    <div className="mt-1 flex justify-between text-[8px] text-muted"><span>5 min</span><span>60 min</span></div>
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="label !mb-0" htmlFor="daily-cycles"><Waves className="mr-1 inline h-3 w-3" /> Maximum watering cycles per day</label>
                      <span className="text-[11px] font-bold text-main">{safety.maxDailyCycles}</span>
                    </div>
                    <input id="daily-cycles" type="range" min={1} max={16} value={safety.maxDailyCycles} onChange={(event) => setSafety({ ...safety, maxDailyCycles: Number(event.target.value) })} className="range" style={{ ['--range-progress' as string]: `${((safety.maxDailyCycles - 1) / 15) * 100}%` }} />
                    <div className="mt-1 flex justify-between text-[8px] text-muted"><span>1 cycle</span><span>16 cycles</span></div>
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <button type="button" onClick={() => updateSettings(safety)} disabled={!dirtySafety} className="btn-primary"><Save className="h-4 w-4" /> Save safety limits</button>
                </div>
              </section>

              <section className="panel p-4 sm:p-5">
                <h2 className="font-display text-base font-bold text-main">Safety interlocks</h2>
                <div className="mt-4 space-y-2">
                  {[
                    { key: 'lowWaterLockout' as const, title: 'Low-water lockout', detail: 'Block pump starts when the reservoir is below 12%.', icon: Droplets, value: state.settings.lowWaterLockout },
                    { key: 'emergencyShutdown' as const, title: 'Emergency shutdown', detail: 'Immediately block all manual and automatic pump starts.', icon: Power, value: state.settings.emergencyShutdown },
                  ].map((item) => (
                    <div key={item.key} className={cn('flex items-center gap-3 rounded-2xl border p-3.5', item.value ? 'border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/10' : 'border-line bg-surface')}>
                      <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', item.value ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-surface-2 text-muted')}><item.icon className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-main">{item.title}</p>
                        <p className="text-[9px] leading-4 text-muted">{item.detail}</p>
                      </div>
                      <Toggle checked={item.value} onChange={(value) => updateSettings({ [item.key]: value })} label={item.title} />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4">
                  {[
                    { label: 'Runtime cap', value: `${state.settings.maxRuntime}s` },
                    { label: 'Cooldown', value: `${state.settings.cooldownMinutes}m` },
                    { label: 'Daily cap', value: `${state.settings.maxDailyCycles}` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-surface-2 p-2.5 text-center">
                      <p className="font-display text-sm font-bold text-main">{item.value}</p>
                      <p className="text-[8px] uppercase tracking-wide text-muted">{item.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {tab === 'device' && (
            <>
              <section className="panel p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-main">Controller</h2>
                    <p className="text-[10px] text-muted">{state.device.id} · firmware {state.device.firmware}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('chip', state.device.online ? 'chip-green' : 'chip-amber')}>{state.device.online ? 'Online' : 'Offline'}</span>
                    <Toggle checked={state.device.online} onChange={setDeviceOnline} label="Device online" />
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="device-name">Device name</label>
                    <input id="device-name" value={deviceForm.name} onChange={(event) => setDeviceForm({ ...deviceForm, name: event.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label" htmlFor="device-ip">Local IP address</label>
                    <input id="device-ip" value={deviceForm.ip} onChange={(event) => setDeviceForm({ ...deviceForm, ip: event.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label" htmlFor="device-wifi">Wi-Fi network</label>
                    <input id="device-wifi" value={deviceForm.wifi} onChange={(event) => setDeviceForm({ ...deviceForm, wifi: event.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="label">Pairing status</label>
                    <div className="input flex items-center justify-between">
                      <span>{state.device.pairing}</span>
                      <span className="chip-green">Paired</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={saveDevice} className="btn-primary"><Save className="h-4 w-4" /> Save device details</button>
                </div>
              </section>

              <section className="panel p-4 sm:p-5">
                <h2 className="font-display text-base font-bold text-main">Sensor & connectivity</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    { label: 'Wi-Fi signal', value: `${state.device.wifiStrength}%`, ok: state.device.wifiStrength > 40 },
                    { label: 'Soil sensor', value: state.device.sensorHealth, ok: state.device.sensorHealth === 'Healthy' },
                    { label: 'Reservoir', value: `${Math.round(state.device.reservoir)}%`, ok: state.device.reservoir >= 12 },
                    { label: 'Offline autonomy', value: state.device.offlineAutonomy ? 'Enabled' : 'Disabled', ok: state.device.offlineAutonomy },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5">
                      <span className="text-[10px] text-muted">{item.label}</span>
                      <span className={cn('text-[10px] font-bold', item.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300')}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-line p-3 text-[9px] leading-4 text-muted">
                  Pairing, firmware updates and Wi-Fi provisioning require real ESP32 hardware. This panel edits demo values only.
                </div>
              </section>
            </>
          )}

          {tab === 'notifications' && (
            <section className="panel p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-bold text-main">Notification preferences</h2>
                  <p className="text-[10px] text-muted">{activeNotifications} of 6 alert types enabled · {unread} unread now</p>
                </div>
                <span className="chip-neutral"><Bell className="h-2.5 w-2.5" /> Demo alerts</span>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { key: 'lowMoisture' as const, title: 'Low soil moisture', detail: 'When a plant reaches its watering threshold.', icon: Droplets },
                  { key: 'wateringComplete' as const, title: 'Watering completed', detail: 'After a manual or automatic pulse finishes.', icon: Check },
                  { key: 'lowReservoir' as const, title: 'Low reservoir', detail: 'When the tank drops below 30%.', icon: Waves },
                  { key: 'pumpWarning' as const, title: 'Pump warnings', detail: 'Cooldown, runtime cap or fault conditions.', icon: ShieldAlert },
                  { key: 'sensorFault' as const, title: 'Sensor faults', detail: 'Unusual or missing moisture readings.', icon: Gauge },
                  { key: 'deviceOffline' as const, title: 'Device offline', detail: 'When the ESP32 stops reporting.', icon: Cpu },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-3 rounded-2xl border border-line p-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-soft"><item.icon className="h-3.5 w-3.5" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10.5px] font-semibold text-main">{item.title}</p>
                      <p className="text-[9px] leading-4 text-muted">{item.detail}</p>
                    </div>
                    <Toggle checked={state.settings.notifications[item.key]} onChange={(value) => updateNotificationSettings({ [item.key]: value })} label={item.title} />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => updateNotificationSettings({ lowMoisture: true, wateringComplete: true, lowReservoir: true, pumpWarning: true, sensorFault: true, deviceOffline: true })} className="btn-secondary !py-1.5 !text-[10px]">Enable all</button>
                <button type="button" onClick={() => updateNotificationSettings({ lowMoisture: false, wateringComplete: false, lowReservoir: false, pumpWarning: false, sensorFault: false, deviceOffline: false })} className="btn-secondary !py-1.5 !text-[10px]">Pause all</button>
              </div>
              <p className="mt-3 text-[9px] leading-4 text-muted">Push notifications require a production service worker with a push server and user permission. In this demo, alerts appear inside the app only.</p>
            </section>
          )}

          {tab === 'account' && (
            <>
              <section className="panel p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <Avatar initials={user?.avatar ?? 'NP'} size="lg" />
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-bold text-main">{user?.name ?? 'Guest'}</h2>
                    <p className="truncate text-[10px] text-muted">{user?.email}</p>
                    <span className="mt-1 inline-flex chip-green">{user?.plan ?? 'Home'} plan</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Link to="/profile" className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-[10px] font-semibold text-soft transition hover:bg-surface-2"><User className="h-3.5 w-3.5" /> Edit profile</Link>
                  <Link to="/forgot-password" className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-[10px] font-semibold text-soft transition hover:bg-surface-2"><KeyRound className="h-3.5 w-3.5" /> Reset password</Link>
                </div>
                <p className="mt-3 rounded-xl bg-surface-2 p-3 text-[9px] leading-4 text-muted">
                  This is a local demo account. Credentials are stored in this browser only and are not protected by a real server. Do not reuse a real password.
                </p>
              </section>

              <section className="panel p-4 sm:p-5">
                <h2 className="font-display text-base font-bold text-main">Session</h2>
                <p className="mt-0.5 text-[10px] text-muted">You are signed in as {user?.email}.</p>
                <button type="button" onClick={logout} className="btn-secondary mt-3 !text-red-600 dark:!text-red-300"><LogOut className="h-4 w-4" /> Log out</button>
              </section>
            </>
          )}

          {tab === 'data' && (
            <>
              <section className="panel p-4 sm:p-5">
                <h2 className="font-display text-base font-bold text-main">Export your demo data</h2>
                <p className="mt-0.5 text-[10px] text-muted">Downloads include plants, settings, watering history and care tasks.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={exportJson} className="btn-primary"><Download className="h-4 w-4" /> Export JSON</button>
                  <button type="button" onClick={exportWatering} className="btn-secondary"><Download className="h-4 w-4" /> Watering CSV</button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { label: 'Plants', value: state.plants.length },
                    { label: 'Watering events', value: state.wateringEvents.length },
                    { label: 'Care tasks', value: state.careTasks.length },
                    { label: 'Growth entries', value: state.growthEntries.length },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-surface-2 p-2.5 text-center">
                      <p className="font-display text-sm font-bold text-main">{item.value}</p>
                      <p className="text-[8px] uppercase tracking-wide text-muted">{item.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel p-4 sm:p-5">
                <h2 className="font-display text-base font-bold text-main">Demo data</h2>
                <p className="mt-0.5 text-[10px] text-muted">Reset restores the sample garden, settings and history for this account.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setResetOpen(true)} className="btn-secondary"><RotateCcw className="h-4 w-4" /> Reset demo workspace</button>
                  <Link to="/offline" className="btn-secondary"><Smartphone className="h-4 w-4" /> Offline & PWA</Link>
                </div>
              </section>

              <section className="panel border-red-200 p-4 dark:border-red-500/20 sm:p-5">
                <h2 className="flex items-center gap-2 font-display text-base font-bold text-red-700 dark:text-red-300"><ShieldAlert className="h-4 w-4" /> Danger zone</h2>
                <p className="mt-1 text-[10px] leading-4 text-muted">Resetting cannot be undone. Export first if you want to keep your demo notes.</p>
                <button type="button" onClick={() => setResetOpen(true)} className="btn-danger mt-3"><Trash2 className="h-4 w-4" /> Reset all demo data</button>
              </section>

              <InfoBanner icon={Database} title="Where data lives" tone="info">
                Everything is stored in your browser's localStorage under this account. Clearing site data, using private mode or switching browsers will lose the demo workspace.
              </InfoBanner>
            </>
          )}
        </div>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset demo workspace?"
        subtitle="This restores the original sample plants, readings, tasks, recommendations and settings for this account."
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setResetOpen(false)} className="btn-secondary">Cancel</button>
            <button type="button" onClick={() => { resetDemo(); setResetOpen(false) }} className="btn-danger"><RotateCcw className="h-4 w-4" /> Reset workspace</button>
          </>
        }
      >
        <div className="rounded-xl bg-red-50 p-3 text-[10px] leading-5 text-red-800 dark:bg-red-500/10 dark:text-red-200">
          Your added plants, notes, growth entries and family invitations will be replaced by the demo seed data.
        </div>
      </Modal>
    </div>
  )
}
