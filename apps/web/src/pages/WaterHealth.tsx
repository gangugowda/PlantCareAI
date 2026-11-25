import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  Check,
  Clock3,
  Cpu,
  Droplets,
  Gauge,
  Play,
  Power,
  RefreshCw,
  ShieldCheck,
  Timer,
  Waves,
  Wrench,
  Zap,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn, formatDate, timeAgo } from '../lib/utils'
import { PageHeader, ProgressRing, PumpBadge, Toggle } from '../components/ui'

const checklist = [
  { id: 'tubing', label: 'Inspect tubing for kinks or leaks', cadence: 'Weekly' },
  { id: 'filter', label: 'Rinse the inline filter', cadence: 'Monthly' },
  { id: 'reservoir', label: 'Refill and clean the reservoir', cadence: 'When below 25%' },
  { id: 'sensor', label: 'Wipe soil sensor and check seating', cadence: 'Monthly' },
  { id: 'nozzle', label: 'Clear the drip nozzle', cadence: 'Monthly' },
]

export default function WaterHealthPage() {
  const { state, activePlant, manualWater, stopPump, updateDevice, updateSettings, addActivity, notify } = useApp()
  const [checked, setChecked] = useState<string[]>(['tubing'])
  const [refilling, setRefilling] = useState(false)

  const reservoir = state.device.reservoir
  const reservoirTone = reservoir < 15 ? 'red' : reservoir < 30 ? 'amber' : 'green'
  const reservoirColor = reservoirTone === 'red' ? 'var(--danger)' : reservoirTone === 'amber' ? 'var(--amber)' : 'var(--emerald)'

  const usage = useMemo(() => {
    const buckets = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      const key = date.toISOString().slice(0, 10)
      const liters = state.wateringEvents
        .filter((event) => event.date.slice(0, 10) === key)
        .reduce((sum, event) => sum + event.liters, 0)
      return { day: date.toLocaleDateString('en', { weekday: 'short' }), liters: Number(liters.toFixed(2)) }
    })
    return buckets
  }, [state.wateringEvents])

  const weekTotal = usage.reduce((sum, item) => sum + item.liters, 0)
  const capacityLiters = 3.2
  const remainingLiters = Number(((reservoir / 100) * capacityLiters).toFixed(2))
  const estimatedDays = weekTotal > 0 ? Math.round((remainingLiters / (weekTotal / 7)) * 10) / 10 : null

  const safetyEvents = state.activities.filter((item) => ['safety', 'reservoir', 'device'].includes(item.type)).slice(0, 8)

  const refill = () => {
    setRefilling(true)
    window.setTimeout(() => {
      updateDevice({ reservoir: 100 })
      addActivity({ type: 'reservoir', title: 'Reservoir refilled', detail: 'Demo reservoir restored to 100%. Low-water lockout cleared.' })
      setRefilling(false)
      notify('Reservoir refilled to 100%. Low-water lockout cleared.')
    }, 700)
  }

  const toggleCheck = (id: string) => {
    setChecked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  const runTest = () => {
    if (!activePlant) return
    manualWater(activePlant.id, 5)
  }

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Water & pump health"
        subtitle="Reservoir, pump runtime, cooldowns and safety interlocks. Manual and automatic watering share exactly the same protections."
        icon={Droplets}
        actions={
          <>
            <button type="button" onClick={refill} disabled={refilling} className="btn-secondary">
              <RefreshCw className={cn('h-3.5 w-3.5', refilling && 'animate-spin')} /> {refilling ? 'Refilling…' : 'Refill reservoir'}
            </button>
            <button type="button" onClick={stopPump} disabled={state.pump.status !== 'ON'} className="btn-danger">
              <Power className="h-3.5 w-3.5" /> Emergency stop
            </button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        <section className="panel p-4 sm:p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProgressRing value={reservoir} size={150} stroke={11} color={reservoirColor}>
              <div>
                <p className="font-display text-3xl font-extrabold tracking-[-0.05em] text-main">{Math.round(reservoir)}%</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-muted">reservoir</p>
              </div>
            </ProgressRing>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-base font-bold text-main">Water reservoir</h2>
                <span className={cn('chip', reservoirTone === 'green' ? 'chip-green' : reservoirTone === 'amber' ? 'chip-amber' : 'chip-red')}>
                  {reservoirTone === 'green' ? 'Healthy level' : reservoirTone === 'amber' ? 'Top up soon' : 'Low — lockout zone'}
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-4 text-muted">
                Estimated {remainingLiters} L of {capacityLiters} L remaining.
                {estimatedDays !== null ? ` About ${estimatedDays} days at this week's demo usage.` : ' Usage estimate builds after watering events.'}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
                <div className={cn('h-full rounded-full transition-all duration-700', reservoirTone === 'green' ? 'bg-emerald-500' : reservoirTone === 'amber' ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${reservoir}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[8px] font-semibold text-muted">
                <span>0%</span>
                <span className={reservoir < 12 ? 'text-red-500' : ''}>12% low-water lockout</span>
                <span>100%</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-surface-2 p-2.5">
                  <p className="text-[8px] uppercase tracking-wide text-muted">Water used this week</p>
                  <p className="font-display text-sm font-bold text-main">{weekTotal.toFixed(2)} L</p>
                </div>
                <div className="rounded-xl bg-surface-2 p-2.5">
                  <p className="text-[8px] uppercase tracking-wide text-muted">Low-water lockout</p>
                  <p className={cn('text-[10px] font-bold', state.settings.lowWaterLockout ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300')}>
                    {state.settings.lowWaterLockout ? 'Armed below 12%' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="stat-label">Water use · last 7 days</p>
              <span className="text-[9px] text-muted">from demo watering events</span>
            </div>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usage} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} unit="L" width={46} />
                  <Tooltip formatter={(value: any) => [`${value} L`, 'Water']} />
                  <Bar dataKey="liters" fill="var(--emerald)" radius={[6, 6, 0, 0]} maxBarSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-main">Pump status</h2>
              <p className="text-[10px] text-muted">{state.device.name} · {state.device.id}</p>
            </div>
            <PumpBadge status={state.pump.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-surface-2 p-3">
              <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-muted"><Timer className="h-3 w-3" /> Runtime remaining</p>
              <p className="mt-1 font-display text-xl font-bold text-main">{state.pump.status === 'ON' ? `${state.pump.remaining}s` : '—'}</p>
              <p className="text-[8px] text-muted">hard cap {state.settings.maxRuntime}s</p>
            </div>
            <div className="rounded-2xl bg-surface-2 p-3">
              <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-muted"><Clock3 className="h-3 w-3" /> Cooldown</p>
              <p className="mt-1 font-display text-xl font-bold text-main">{state.pump.cooldownRemaining > 0 ? `${state.pump.cooldownRemaining}s` : 'Ready'}</p>
              <p className="text-[8px] text-muted">{state.pump.cooldownRemaining > 0 ? 'safety timer active' : 'no pending cooldown'}</p>
            </div>
            <div className="rounded-2xl bg-surface-2 p-3">
              <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-muted"><Gauge className="h-3 w-3" /> Cycles today</p>
              <p className="mt-1 font-display text-xl font-bold text-main">{state.pump.dailyCycles}<span className="text-[10px] font-semibold text-muted">/{state.settings.maxDailyCycles}</span></p>
              <p className="text-[8px] text-muted">daily cap</p>
            </div>
            <div className="rounded-2xl bg-surface-2 p-3">
              <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-muted"><Activity className="h-3 w-3" /> Mode</p>
              <p className="mt-1 font-display text-xl font-bold capitalize text-main">{state.pump.mode ?? 'Idle'}</p>
              <p className="text-[8px] text-muted">{state.autoWatering ? 'auto armed' : 'auto paused'}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-line p-3.5">
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-main"><ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" /> Interlocks</p>
            <div className="mt-2 grid gap-1.5">
              {[
                { label: 'Device online', ok: state.device.online, detail: 'Required for app commands' },
                { label: 'Emergency shutdown off', ok: !state.settings.emergencyShutdown, detail: 'Blocks all pump starts' },
                { label: 'Reservoir above 12%', ok: !state.settings.lowWaterLockout || reservoir >= 12, detail: 'Low-water protection' },
                { label: 'Daily cycle limit available', ok: state.pump.dailyCycles < state.settings.maxDailyCycles, detail: `${state.pump.dailyCycles}/${state.settings.maxDailyCycles} used` },
                { label: 'Pump not cooling', ok: state.pump.status !== 'COOLING', detail: `${state.pump.cooldownRemaining}s remaining` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2 text-[9px]">
                  <span className="flex items-center gap-1.5 text-soft"><span className={cn('h-1.5 w-1.5 rounded-full', item.ok ? 'bg-emerald-500' : 'bg-red-500')} /> {item.label}</span>
                  <span className={cn('font-semibold', item.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-300')}>{item.ok ? 'Pass' : 'Blocked'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={runTest} disabled={!activePlant || state.pump.status !== 'OFF'} className="btn-primary flex-1">
              <Play className="h-4 w-4" /> Run 5s test pulse
            </button>
            <button type="button" onClick={() => updateSettings({ emergencyShutdown: !state.settings.emergencyShutdown })} className={cn('flex-1', state.settings.emergencyShutdown ? 'btn-secondary' : 'btn-secondary')}>
              {state.settings.emergencyShutdown ? <Zap className="h-4 w-4" /> : <Power className="h-4 w-4" />}
              {state.settings.emergencyShutdown ? 'Clear shutdown' : 'Arm shutdown'}
            </button>
          </div>
          <p className="mt-2 text-[8.5px] leading-4 text-muted">The test pulse uses the same checks as manual watering and is capped by hardware settings.</p>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_340px]">
        <section className="panel p-4">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main"><Cpu className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> Device & sensor health</h2>
          <div className="mt-3 space-y-2">
            {[
              { label: 'Controller', value: 'ESP32 · Paired', ok: true },
              { label: 'Firmware', value: state.device.firmware, ok: true },
              { label: 'Wi-Fi signal', value: `${state.device.wifiStrength}% · ${state.device.wifi}`, ok: state.device.wifiStrength > 40 },
              { label: 'Soil sensor', value: state.device.sensorHealth, ok: state.device.sensorHealth === 'Healthy' },
              { label: 'Last seen', value: timeAgo(state.device.lastSeen), ok: state.device.online },
              { label: 'IP address', value: state.device.ip, ok: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 px-3 py-2">
                <span className="text-[9.5px] text-muted">{item.label}</span>
                <span className={cn('text-[9.5px] font-semibold', item.ok ? 'text-main' : 'text-amber-700 dark:text-amber-300')}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-line p-3">
            <div>
              <p className="text-[10px] font-bold text-main">Emergency shutdown</p>
              <p className="text-[8.5px] text-muted">Blocks manual and automatic pump starts.</p>
            </div>
            <Toggle checked={state.settings.emergencyShutdown} onChange={(value) => updateSettings({ emergencyShutdown: value })} label="Emergency shutdown" />
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main"><Wrench className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> Maintenance checklist</h2>
          <p className="mt-1 text-[9.5px] text-muted">Demo checklist — ticking items is stored for this session only.</p>
          <div className="mt-3 space-y-1.5">
            {checklist.map((item) => {
              const done = checked.includes(item.id)
              return (
                <button key={item.id} type="button" onClick={() => toggleCheck(item.id)} className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-surface-2">
                  <span className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-md border transition', done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line-strong bg-surface')}>
                    {done && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-[10px] font-semibold', done ? 'text-muted line-through' : 'text-main')}>{item.label}</span>
                    <span className="block text-[8px] text-muted">{item.cadence}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 rounded-xl bg-surface-2 p-2.5 text-[8.5px] leading-4 text-muted">
            A real installation should also check backflow prevention and confirm the pump is rated for the head height.
          </p>
        </section>

        <aside className="space-y-4">
          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main"><AlertTriangle className="h-4 w-4 text-amber-500" /> Safety & device log</h2>
            <div className="mt-3 space-y-3">
              {safetyEvents.length === 0 && <p className="text-[10px] text-muted">No safety events yet.</p>}
              {safetyEvents.map((event) => (
                <div key={event.id} className="flex gap-2.5">
                  <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', event.type === 'safety' ? 'bg-amber-500' : event.type === 'reservoir' ? 'bg-sky-500' : 'bg-emerald-500')} />
                  <div>
                    <p className="text-[9.5px] font-semibold text-main">{event.title}</p>
                    <p className="text-[8.5px] leading-4 text-muted">{event.detail}</p>
                    <p className="text-[8px] text-muted/70">{formatDate(event.timestamp, { day: 'numeric', month: 'short' })} · {timeAgo(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-200"><Waves className="h-3.5 w-3.5" /> ESP32 stays in control</p>
            <p className="mt-1 text-[9px] leading-4.5 text-emerald-900/80 dark:text-emerald-100/80">
              If Wi-Fi or the website goes down, local automatic watering and hardware safety continue on the controller. The app is a monitoring and approval layer, not the safety system.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
