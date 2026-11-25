import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CloudRain,
  CloudSun,
  Cpu,
  Droplets,
  Gauge,
  Leaf,
  LockKeyhole,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  TimerReset,
  Waves,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApp } from '../lib/store'
import { cn, formatDate, formatTime, greeting, makeMoistureSeries, moistureStatus, timeAgo } from '../lib/utils'
import { Avatar, DeviceBadge, Modal, ProgressRing, StatusDot, Toggle, WaterLevel } from '../components/ui'
import OLEDMirror from '../components/OLEDMirror'

const activityIcon = {
  watering: Droplets,
  moisture: Gauge,
  reservoir: Waves,
  device: Wifi,
  sensor: Activity,
  safety: ShieldCheck,
  care: Leaf,
}

const activityTone = {
  watering: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
  moisture: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  reservoir: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  device: 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300',
  sensor: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  safety: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  care: 'bg-lime-100 text-forest-800 dark:bg-lime-300/10 dark:text-lime-300',
}

function CardHeader({ icon: Icon, title, subtitle, action, tone = 'emerald' }: { icon: typeof Gauge; title: string; subtitle?: string; action?: React.ReactNode; tone?: 'emerald' | 'sky' | 'amber' | 'forest' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    forest: 'bg-forest-50 text-forest-800 dark:bg-white/5 dark:text-lime-300',
  }
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className={cn('grid h-9 w-9 place-items-center rounded-xl', tones[tone])}><Icon className="h-4 w-4" /></span>
        <div>
          <p className="text-xs font-bold text-main">{title}</p>
          {subtitle && <p className="mt-0.5 text-[9px] text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

function formatCountdown(seconds: number) {
  const safe = Math.max(0, seconds)
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${minns(mins)}:${String(secs).padStart(2, '0')}`
}

function minns(mins: number) {
  return String(mins).padStart(2, '0')
}

export default function DashboardPage() {
  const { state, user, activePlant, activePlantId, setActivePlantId, t, updatePlant, setAutoWatering, toggleAutoWatering, manualWater, stopPump, notify, addCareTaskComplete, theme } = useApp()
  const [now, setNow] = useState(new Date())
  const [threshold, setThreshold] = useState(activePlant?.threshold ?? 45)
  const [manualOpen, setManualOpen] = useState(false)
  const [duration, setDuration] = useState(activePlant?.wateringDuration ?? 10)
  const [showAllActivity, setShowAllActivity] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!activePlant) return
    setThreshold(activePlant.threshold)
    setDuration(Math.min(activePlant.wateringDuration, state.settings.maxRuntime))
  }, [activePlantId, activePlant?.threshold, activePlant?.wateringDuration, state.settings.maxRuntime])

  const chartData = useMemo(
    () => makeMoistureSeries('24h', activePlant?.moisture ?? 62).map((point) => ({ ...point, threshold: activePlant?.threshold ?? 45 })),
    [activePlant?.moisture, activePlant?.threshold],
  )

  if (!activePlant) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface p-12 text-center">
        <Sprout className="h-10 w-10 text-emerald-700" />
        <h1 className="mt-4 font-display text-2xl font-bold text-main">Your garden is empty</h1>
        <p className="mt-2 text-sm text-muted">Add a plant to start monitoring moisture and watering.</p>
        <Link to="/plants" className="btn-primary mt-5"><Plus className="h-4 w-4" /> Add your first plant</Link>
      </div>
    )
  }

  const status = moistureStatus(activePlant.moisture, activePlant.threshold, activePlant.maxMoisture)
  const pump = state.pump
  const isWatering = pump.status === 'ON'
  const isCooling = pump.status === 'COOLING'
  const cooldown = pump.cooldownRemaining
  const activeEvents = state.wateringEvents.filter((event) => event.plantId === activePlant.id).slice(0, 5)
  const nextTasks = state.careTasks.filter((task) => !task.completed).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3)
  const nextCondition = !state.autoWatering
    ? 'Paused — enable to arm automatic watering'
    : activePlant.moisture <= activePlant.threshold
      ? 'Moisture at threshold — eligible for a pulse'
      : `Waiting for moisture to reach ${activePlant.threshold}%`
  const safetyBlockers = [
    !state.device.online && 'Device is offline',
    state.settings.emergencyShutdown && 'Emergency shutdown is active',
    pump.status === 'ON' && 'Pump is already running',
    pump.status === 'COOLING' && 'Pump cooldown is active',
    state.device.reservoir < 12 && state.settings.lowWaterLockout && 'Reservoir is too low',
    pump.dailyCycles >= state.settings.maxDailyCycles && 'Daily watering limit reached',
  ].filter(Boolean) as string[]
  const canWater = safetyBlockers.length === 0
  const avgMoisture = Math.round(state.plants.reduce((sum, plant) => sum + plant.moisture, 0) / state.plants.length)
  const needingCare = state.plants.filter((plant) => plant.moisture < plant.threshold || plant.health === 'Needs attention').length
  const unread = state.notifications.filter((note) => !note.read).length

  const saveThreshold = () => {
    updatePlant({ ...activePlant, threshold })
  }

  const openManual = () => {
    setDuration(Math.min(activePlant.wateringDuration, state.settings.maxRuntime))
    setManualOpen(true)
  }

  const startWatering = () => {
    const result = manualWater(activePlant.id, duration)
    if (!result.ok) notify(result.message, 'error')
    else setManualOpen(false)
  }

  const userName = user?.name.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-5">
      {!state.device.online && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200 sm:flex-row sm:items-center">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 dark:bg-amber-500/15"><WifiOff className="h-4 w-4" /></span>
          <div className="flex-1">
            <p className="text-xs font-bold">Device offline — showing last known state</p>
            <p className="mt-0.5 text-[10px] leading-5 opacity-75">Local automatic watering and hardware safety continue on the ESP32. Last sync {timeAgo(state.lastSynced)}.</p>
          </div>
          <Link to="/offline" className="shrink-0 text-[10px] font-bold underline underline-offset-2">Offline details</Link>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
              <StatusDot tone={state.device.online ? 'green' : 'amber'} pulse={state.device.online} />
              {state.device.online ? 'Live garden' : 'Last known state'}
            </span>
            <span className="text-[10px] text-muted">{formatDate(now, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <span className="text-[10px] text-muted/40">·</span>
            <span className="text-[10px] font-semibold tabular-nums text-soft">{formatTime(now)}</span>
          </div>
          <h1 className="mt-2 font-display text-[28px] font-extrabold tracking-[-0.045em] text-main sm:text-[34px]">
            {t(greeting()).replace('!', '')}, {userName}.
          </h1>
          <p className="mt-1 text-sm text-muted">
            {needingCare > 0 ? `${needingCare} plant${needingCare > 1 ? 's' : ''} could use a closer look. ` : 'Everything looks calm. '}
            <span className="text-soft">Average garden moisture is {avgMoisture}%.</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 sm:flex">
            <CloudSun className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-[10px] font-bold text-main">29°C · Colombo</p>
              <p className="text-[8px] text-muted">Humid · 60% · demo weather</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate('/plants')} className="btn-secondary !py-2.5"><Plus className="h-3.5 w-3.5" /> Add plant</button>
          <button type="button" onClick={openManual} disabled={!canWater} className="btn-primary !py-2.5"><Droplets className="h-3.5 w-3.5" /> Water now</button>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {state.plants.map((plant) => {
          const plantStatus = moistureStatus(plant.moisture, plant.threshold, plant.maxMoisture)
          const active = plant.id === activePlantId
          return (
            <button
              key={plant.id}
              type="button"
              onClick={() => setActivePlantId(plant.id)}
              className={cn(
                'group flex min-w-[190px] items-center gap-2.5 rounded-2xl border p-2.5 text-left transition-all duration-200',
                active
                  ? 'border-forest-900 bg-forest-900 text-white shadow-soft dark:border-lime-300/60 dark:bg-lime-300 dark:text-forest-950'
                  : 'border-line bg-surface hover:-translate-y-0.5 hover:border-forest-300 hover:shadow-sm',
              )}
            >
              <img src={plant.image} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className={cn('truncate text-[11px] font-bold', active ? '' : 'text-main')}>{plant.name}</p>
                  {plant.health === 'Needs attention' && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', active ? 'bg-amber-300' : 'bg-amber-500')} />}
                </div>
                <p className={cn('truncate text-[8px]', active ? 'opacity-55' : 'text-muted')}>{plant.room} · {plant.species}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={cn('text-[9px] font-bold', active ? 'opacity-85' : 'text-soft')}>{plant.moisture}%</span>
                  <span className={cn('text-[8px]', active ? 'opacity-80' : plantStatus.tone === 'amber' ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300')}>{plantStatus.label}</span>
                </div>
              </div>
            </button>
          )
        })}
        <button type="button" onClick={() => navigate('/plants')} className="flex min-w-[132px] items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line bg-transparent p-3 text-[10px] font-semibold text-muted transition hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700">
          <Plus className="h-3.5 w-3.5" /> New plant
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="panel relative overflow-hidden p-5">
          <CardHeader icon={Gauge} title={t('soilMoisture')} subtitle={`${activePlant.name} · ${activePlant.room}`} action={<span className={cn('chip', status.tone === 'amber' ? 'chip-amber' : status.tone === 'blue' ? 'chip-blue' : 'chip-green')}>{status.label}</span>} />
          <div className="mt-4 flex items-center gap-4">
            <ProgressRing
              value={activePlant.moisture}
              size={104}
              stroke={9}
              color={status.tone === 'amber' ? '#d69a29' : status.tone === 'blue' ? '#3c7d9b' : 'var(--emerald)'}
            >
              <div>
                <p className="font-display text-[23px] font-extrabold tracking-[-0.05em] text-main">{activePlant.moisture}%</p>
                <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-muted">current</p>
              </div>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted">Threshold</span>
                <span className="font-bold text-main">{activePlant.threshold}%</span>
              </div>
              <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3">
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-600" style={{ width: `${activePlant.moisture}%` }} />
                <span className="absolute top-0 h-full w-0.5 bg-forest-900 dark:bg-white" style={{ left: `${activePlant.threshold}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-[8px] text-muted">
                <span>{activePlant.minMoisture}% min</span>
                <span>{activePlant.maxMoisture}% max</span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-muted">
                <ArrowDown className="h-3 w-3 text-amber-500" />
                {activePlant.threshold - activePlant.moisture > 0 ? `${activePlant.threshold - activePlant.moisture}% above threshold` : `${activePlant.moisture - activePlant.threshold}% above threshold`}
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <CardHeader
            icon={Zap}
            title={t('pumpStatus')}
            subtitle="Hardware safety enforced"
            tone="sky"
            action={<button type="button" onClick={() => navigate('/settings')} className="text-muted transition hover:text-main" aria-label="Pump settings"><MoreHorizontal className="h-4 w-4" /></button>}
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={cn('relative grid h-10 w-10 place-items-center rounded-xl', isWatering ? 'bg-emerald-500 text-white' : isCooling ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-surface-2 text-soft')}>
                  {isWatering && <span className="absolute inset-0 animate-ping rounded-xl bg-emerald-500/25" />}
                  <Waves className="relative h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="font-display text-lg font-extrabold tracking-[-0.03em] text-main">{isWatering ? 'Watering' : isCooling ? 'Cooling' : 'Standby'}</p>
                  <p className="text-[9px] text-muted">
                    {isWatering ? `${pump.mode === 'manual' ? 'Manual' : 'Auto'} pulse · ${pump.remaining}s left` : isCooling ? `Cooldown · ${formatCountdown(cooldown)}` : `Last cycle ${timeAgo(activePlant.lastWatered)}`}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[9px] text-muted">
                <StatusDot tone={isWatering ? 'green' : isCooling ? 'amber' : 'gray'} pulse={isWatering} />
                {pump.dailyCycles}/{state.settings.maxDailyCycles} cycles today
              </div>
            </div>
            {isWatering ? (
              <button type="button" onClick={stopPump} className="btn-danger !px-3 !py-2 !text-[10px]">Stop</button>
            ) : (
              <button type="button" onClick={openManual} disabled={!canWater} className="btn-secondary !px-3 !py-2 !text-[10px]"><Play className="h-3 w-3" /> Run</button>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-surface-2 px-2.5 py-2">
              <p className="text-[8px] text-muted">Max runtime</p>
              <p className="text-[10px] font-bold text-main">{state.settings.maxRuntime}s</p>
            </div>
            <div className="rounded-lg bg-surface-2 px-2.5 py-2">
              <p className="text-[8px] text-muted">Safety lock</p>
              <p className={cn('text-[10px] font-bold', canWater ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300')}>{canWater ? 'Clear' : 'Blocked'}</p>
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <CardHeader icon={Waves} title={t('waterReservoir')} subtitle="Shared water tank" tone="sky" action={<span className={cn('chip', state.device.reservoir < 30 ? 'chip-amber' : 'chip-green')}>{state.device.reservoir < 30 ? 'Low' : 'Good'}</span>} />
          <div className="mt-4 flex items-center gap-4">
            <div className="relative h-[88px] w-[64px] shrink-0 overflow-hidden rounded-xl border-2 border-sky-200/70 bg-sky-50/50 p-1 dark:border-sky-500/20 dark:bg-sky-500/5">
              <div className="absolute inset-x-1 bottom-1 rounded-lg bg-gradient-to-t from-sky-500/80 to-sky-300/70 transition-all duration-700" style={{ height: `calc(${state.device.reservoir}% - 8px)` }} />
              <div className="absolute left-0 right-0 top-[32%] border-t border-dashed border-sky-400/50" />
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white mix-blend-difference">{Math.round(state.device.reservoir)}%</span>
            </div>
            <div className="flex-1">
              <p className="font-display text-2xl font-extrabold tracking-[-0.04em] text-main">{state.device.reservoir}%</p>
              <p className="mt-0.5 text-[9px] text-muted">≈ {Number((state.device.reservoir * 0.038).toFixed(1))} L usable</p>
              <WaterLevel value={state.device.reservoir} />
              <p className={cn('mt-2.5 text-[9px] font-semibold', state.device.reservoir < 30 ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300')}>
                {state.device.reservoir < 12 ? 'Empty · pump locked' : state.device.reservoir < 30 ? 'Low · refill soon' : 'Water available'}
              </p>
              <p className="mt-1 text-[8px] text-muted">Sensor B-02 · demo capacity 3.8 L</p>
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <CardHeader icon={Cpu} title={t('deviceStatus')} subtitle={state.device.name} tone="forest" action={<DeviceBadge online={state.device.online} compact />} />
          <div className="mt-4 space-y-2.5">
            {[
              { icon: Wifi, label: 'Wi-Fi network', value: state.device.online ? state.device.wifi : 'Reconnecting', accent: state.device.online },
              { icon: Activity, label: 'Sensor health', value: state.device.sensorHealth, accent: state.device.sensorHealth === 'Healthy' },
              { icon: RefreshCw, label: 'Last communication', value: timeAgo(state.lastSynced), accent: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[9px] text-muted"><item.icon className="h-3 w-3" />{item.label}</span>
                <span className={cn('max-w-[120px] truncate text-[9px] font-semibold', item.accent ? 'text-main' : 'text-amber-700 dark:text-amber-300')}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3 text-[8px] text-muted">
            <span>{state.device.id}</span>
            <span className="font-semibold text-soft">{state.device.firmware}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <div className="panel h-full p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><Play className="h-4 w-4" /></span>
                  <div>
                    <p className="text-xs font-bold text-main">{t('automaticWatering')}</p>
                    <p className="text-[9px] text-muted">Plant-specific moisture trigger</p>
                  </div>
                </div>
              </div>
              <Toggle checked={state.autoWatering} onChange={setAutoWatering} label="Toggle automatic watering" />
            </div>
            <div className={cn('mt-4 rounded-xl border px-3 py-2.5', state.autoWatering ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/[0.07]' : 'border-line bg-surface-2')}>
              <div className="flex items-center gap-2">
                <StatusDot tone={state.autoWatering ? 'green' : 'gray'} pulse={state.autoWatering} />
                <p className="text-[10px] font-bold text-main">{state.autoWatering ? 'Armed and watching' : 'Paused'}</p>
              </div>
              <p className="mt-1 text-[9px] leading-4 text-muted">{nextCondition}</p>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-soft">Moisture threshold for {activePlant.name}</label>
                <span className="rounded-md bg-surface-2 px-2 py-1 text-[10px] font-bold text-main">{threshold}%</span>
              </div>
              <input
                type="range"
                min={activePlant.minMoisture}
                max={activePlant.maxMoisture - 5}
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
                className="range mt-3"
                style={{ '--range-progress': `${((threshold - activePlant.minMoisture) / (activePlant.maxMoisture - 5 - activePlant.minMoisture)) * 100}%` } as React.CSSProperties}
                aria-label="Moisture threshold"
              />
              <div className="mt-2 flex items-center justify-between text-[8px] text-muted">
                <span>{activePlant.minMoisture}%</span>
                <span>Safety range</span>
                <span>{activePlant.maxMoisture}%</span>
              </div>
              {threshold !== activePlant.threshold && (
                <button type="button" onClick={saveThreshold} className="mt-3 w-full rounded-lg bg-forest-900 py-2 text-[10px] font-bold text-white transition hover:bg-forest-800 dark:bg-lime-300 dark:text-forest-950">
                  Save threshold · {threshold}%
                </button>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5 text-[9px]">
              <span className="flex items-center gap-1.5 text-muted"><TimerReset className="h-3 w-3" /> Cooldown</span>
              <span className="font-semibold text-main">{state.settings.cooldownMinutes} min</span>
              <span className="text-muted/40">·</span>
              <span className="flex items-center gap-1.5 text-muted"><ShieldCheck className="h-3 w-3" /> Max {state.settings.maxRuntime}s</span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-forest-900 via-forest-800 to-[#0A2B1F] p-5 text-white shadow-float dark:from-[#173026] dark:via-[#12281E] dark:to-[#0C1F17]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-lime-300/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-lime-300"><Droplets className="h-4 w-4" /></span>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-1 text-[8px] font-semibold text-white/75">Safety-gated</span>
              </div>
              <p className="mt-4 text-sm font-bold">{t('manualWatering')}</p>
              <p className="mt-1 text-[10px] leading-5 text-white/70">A short manual pulse. Same runtime, reservoir and cooldown protections apply.</p>

              {isWatering ? (
                <div className="mt-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 text-center">
                    <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-lime-300">Watering {activePlant.name}</p>
                    <p className="mt-1 font-display text-3xl font-extrabold tabular-nums tracking-[-0.05em]">{formatCountdown(pump.remaining)}</p>
                    <div className="mx-auto mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-lime-300 transition-all duration-1000" style={{ width: `${(pump.remaining / Math.max(1, activePlant.wateringDuration)) * 100}%` }} />
                    </div>
                  </div>
                  <button type="button" onClick={stopPump} className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-500 py-2.5 text-[10px] font-bold text-white transition hover:bg-red-600"><Pause className="h-3 w-3" /> Emergency stop</button>
                </div>
              ) : (
                <div className="mt-auto pt-4">
                  {!canWater ? (
                    <div className="rounded-xl border border-amber-300/20 bg-amber-400/10 p-2.5">
                      <p className="flex items-center gap-1.5 text-[9px] font-bold text-amber-300"><LockKeyhole className="h-3 w-3" /> Watering blocked</p>
                      <p className="mt-1 text-[8px] leading-4 text-white/70">{safetyBlockers[0]}. Resolve it in Settings.</p>
                    </div>
                  ) : (
                    <button type="button" onClick={openManual} className="btn-lime w-full !py-2.5 !text-[10px]"><Droplets className="h-3.5 w-3.5" /> Water {activePlant.name} now</button>
                  )}
                  <p className="mt-2 text-center text-[8px] text-white/65">Max {state.settings.maxRuntime}s · confirmation required</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="panel flex h-full flex-col p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-main">{t('oledMirror')}</p>
                <p className="mt-0.5 text-[9px] text-muted">Physical display · mirrored</p>
              </div>
              <span className="chip-neutral">I²C</span>
            </div>
            <div className="mt-4 flex-1">
              <OLEDMirror plant={activePlant} pump={pump} device={state.device} />
            </div>
            <p className="mt-2 text-center text-[8px] text-muted">The same status is visible on the ESP32 OLED.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <div className="panel p-5 xl:col-span-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold text-main">Moisture trend · last 24 hours</p>
              <p className="mt-0.5 text-[9px] text-muted">{activePlant.name} · threshold {activePlant.threshold}% · simulated telemetry</p>
            </div>
            <Link to="/analytics" className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:gap-1.5 dark:text-emerald-300">Open analytics <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="mt-4 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 6, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="moistureFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10a36d" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#10a36d" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} interval={3} />
                <YAxis axisLine={false} tickLine={false} domain={[20, 90]} tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 11, boxShadow: 'var(--shadow)' }}
                  labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
                  itemStyle={{ color: 'var(--emerald)' }}
                  formatter={(value) => [`${value}%`, 'Moisture']}
                />
                <ReferenceLine y={activePlant.threshold} stroke="#d69a29" strokeDasharray="5 4" strokeWidth={1.5} label={{ value: `Threshold ${activePlant.threshold}%`, position: 'insideTopRight', fill: '#b07b1d', fontSize: 9 }} />
                <Area type="monotone" dataKey="moisture" stroke="#10a36d" strokeWidth={2.3} fill="url(#moistureFill)" dot={false} activeDot={{ r: 4, fill: '#10a36d', stroke: 'var(--surface)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5 xl:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-main">Care calendar</p>
              <p className="mt-0.5 text-[9px] text-muted">Next tasks for your garden</p>
            </div>
            <Link to="/calendar" className="icon-btn h-8 w-8 rounded-lg" aria-label="Open care calendar"><CalendarDays className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-4 space-y-2">
            {nextTasks.map((task) => {
              const plant = state.plants.find((item) => item.id === task.plantId)
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => addCareTaskComplete(task.id)}
                  className="group flex w-full items-start gap-2.5 rounded-xl border border-line bg-surface-2 p-2.5 text-left transition hover:border-emerald-300"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-line bg-surface text-transparent transition group-hover:border-emerald-400 group-hover:text-emerald-700"><Check className="h-2.5 w-2.5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[10px] font-semibold text-main">{task.title}</span>
                    <span className="mt-0.5 block text-[8px] text-muted">{plant?.name ?? 'Garden'} · {formatDate(task.date, { day: 'numeric', month: 'short' })} · {task.type}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <Link to="/calendar" className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-dashed border-line py-2 text-[9px] font-semibold text-muted transition hover:border-emerald-300 hover:text-emerald-700">
            <Plus className="h-3 w-3" /> Add a care task
          </Link>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-12">
        <div className="panel p-5 xl:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-main">{t('recentActivity')}</p>
              <p className="mt-0.5 text-[9px] text-muted">Device and garden events</p>
            </div>
            <button type="button" onClick={() => setShowAllActivity((value) => !value)} className="text-[10px] font-semibold text-muted transition hover:text-main">{showAllActivity ? 'Show less' : t('viewAll')}</button>
          </div>
          <div className="mt-3">
            {(showAllActivity ? state.activities : state.activities.slice(0, 5)).map((activity, index) => {
              const Icon = activityIcon[activity.type]
              return (
                <div key={activity.id} className="relative flex gap-3 pb-3.5 last:pb-0">
                  {index < (showAllActivity ? state.activities.length : Math.min(5, state.activities.length)) - 1 && <span className="absolute left-[15px] top-8 h-full w-px bg-line" />}
                  <span className={cn('relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-lg', activityTone[activity.type])}><Icon className="h-3.5 w-3.5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[10px] font-semibold text-main">{activity.title}</p>
                      <span className="shrink-0 text-[8px] text-muted">{timeAgo(activity.timestamp)}</span>
                    </div>
                    <p className="mt-0.5 text-[9px] leading-4 text-muted">{activity.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="panel p-5 xl:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-main">Watering history</p>
              <p className="mt-0.5 text-[9px] text-muted">{activePlant.name} · recent cycles</p>
            </div>
            <span className="chip-neutral">{activeEvents.length} shown</span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="pb-2 text-[8px] font-bold uppercase tracking-wide text-muted">Date</th>
                  <th className="pb-2 text-[8px] font-bold uppercase tracking-wide text-muted">Mode</th>
                  <th className="pb-2 text-right text-[8px] font-bold uppercase tracking-wide text-muted">Duration</th>
                  <th className="pb-2 text-right text-[8px] font-bold uppercase tracking-wide text-muted">Est. water</th>
                </tr>
              </thead>
              <tbody>
                {activeEvents.map((event) => (
                  <tr key={event.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 text-[9px] font-medium text-main">{formatDate(event.date, { day: 'numeric', month: 'short' })}</td>
                    <td className="py-2.5"><span className={cn('rounded-md px-1.5 py-0.5 text-[8px] font-semibold', event.mode === 'auto' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300')}>{event.mode}</span></td>
                    <td className="py-2.5 text-right text-[9px] tabular-nums text-soft">{event.durationSec}s</td>
                    <td className="py-2.5 text-right text-[9px] tabular-nums text-soft">{event.liters} L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 rounded-lg bg-surface-2 px-2.5 py-2 text-[8px] leading-4 text-muted">
            Water volume is estimated from pump runtime. Add a flow sensor for measured usage.
          </p>
        </div>
      </div>

      <Modal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        title={isWatering ? `Watering ${activePlant.name}` : `Water ${activePlant.name} manually`}
        subtitle={isWatering ? 'The pump is running. You can stop it at any time.' : 'Manual watering uses the same hardware safety protections as automatic watering.'}
        size="md"
      >
        {isWatering ? (
          <div>
            <div className="rounded-2xl bg-forest-950 p-6 text-center text-white">
              <div className="relative mx-auto grid h-24 w-24 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/15" />
                <span className="absolute inset-2 rounded-full border border-lime-300/30" />
                <Droplets className="h-8 w-8 text-lime-300" />
              </div>
              <p className="mt-3 text-sm font-semibold text-white/75">Watering in progress</p>
              <p className="mt-1 font-display text-5xl font-extrabold tabular-nums tracking-[-0.06em]">{formatCountdown(pump.remaining)}</p>
              <div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-lime-300 transition-all duration-1000" style={{ width: `${(pump.remaining / Math.max(1, duration)) * 100}%` }} />
              </div>
              <p className="mt-3 text-[10px] text-white/70">Reservoir {state.device.reservoir}% · pump safety active</p>
            </div>
            <button type="button" onClick={() => { stopPump(); }} className="btn-danger mt-4 w-full !py-3"><Pause className="h-4 w-4" /> Emergency stop pump</button>
            <button type="button" onClick={() => setManualOpen(false)} className="btn-ghost mt-2 w-full">Close and monitor on dashboard</button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3">
              <img src={activePlant.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="text-xs font-bold text-main">{activePlant.name}</p>
                <p className="text-[10px] text-muted">{activePlant.species} · {activePlant.moisture}% moisture</p>
              </div>
              <span className={cn('chip', status.tone === 'amber' ? 'chip-amber' : 'chip-green')}>{status.label}</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label !mb-0">Watering duration</label>
                <span className="text-[11px] font-bold text-main">{duration} seconds</span>
              </div>
              <div className="mt-2.5 grid grid-cols-4 gap-2">
                {[4, 6, 8, 10, 12, 15].filter((value) => value <= state.settings.maxRuntime).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDuration(value)}
                    className={cn(
                      'rounded-xl border py-2.5 text-[11px] font-bold transition',
                      duration === value ? 'border-forest-900 bg-forest-900 text-white dark:border-lime-300 dark:bg-lime-300 dark:text-forest-950' : 'border-line bg-surface text-soft hover:border-emerald-300',
                    )}
                  >
                    {value}s
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[9px] leading-4 text-muted">Recommended for this plant: {Math.min(activePlant.wateringDuration, state.settings.maxRuntime)}s. Hardware maximum: {state.settings.maxRuntime}s.</p>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-semibold text-soft">Safety checks</p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {[
                  { label: 'Device online', ok: state.device.online },
                  { label: `Reservoir ${state.device.reservoir}%`, ok: !state.settings.lowWaterLockout || state.device.reservoir >= 12 },
                  { label: pump.status === 'COOLING' ? `Cooldown active · ${formatCountdown(cooldown)}` : 'No active cooldown', ok: pump.status !== 'COOLING' },
                  { label: `Cycle limit ${pump.dailyCycles}/${state.settings.maxDailyCycles}`, ok: pump.dailyCycles < state.settings.maxDailyCycles },
                  { label: 'Emergency stop off', ok: !state.settings.emergencyShutdown },
                  { label: `Runtime ≤ ${state.settings.maxRuntime}s`, ok: duration <= state.settings.maxRuntime },
                ].map((check) => (
                  <div key={check.label} className={cn('flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[9px]', check.ok ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300')}>
                    {check.ok ? <Check className="h-3 w-3" /> : <LockKeyhole className="h-3 w-3" />}
                    {check.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-5 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
              <p className="font-semibold">Your water, your call.</p>
              <p className="mt-0.5 opacity-80">Manual watering is simulated in this demo. A real ESP32 should verify its own reservoir and pump state before energising the relay.</p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setManualOpen(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={startWatering} disabled={!canWater} className="btn-primary"><Droplets className="h-4 w-4" /> Start watering · {duration}s</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
