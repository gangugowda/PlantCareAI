import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  CalendarRange,
  CheckCircle2,
  Cpu,
  Droplets,
  Gauge,
  Info,
  Leaf,
  LineChart as LineChartIcon,
  ShieldCheck,
  TrendingUp,
  Waves,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApp } from '../lib/store'
import { downloadCsv, formatDate, makeMoistureSeries, makeWaterSeries } from '../lib/utils'
import { PageHeader, Segmented, StatusDot } from '../components/ui'
import { cn } from '../lib/utils'

type Range = '24h' | '7d' | '30d' | 'custom'
const rangeLabels: Record<Range, string> = { '24h': 'Last 24 hours', '7d': 'Last 7 days', '30d': 'Last 30 days', custom: 'Custom range' }
const plantColors = ['#10a36d', '#4b9e7c', '#84b84c', '#c9a227', '#6d9bc3']

function ChartTooltip({ active, payload, label, unit = '%' }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-float">
      <p className="text-[10px] font-bold text-main">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="mt-0.5 flex items-center gap-1.5 text-[9px] text-muted">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
          {item.name}: <span className="font-semibold text-soft">{item.value}{unit}</span>
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { state, activePlant } = useApp()
  const [range, setRange] = useState<Range>('7d')
  const [customStart, setCustomStart] = useState(() => new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10))
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().slice(0, 10))

  const moistureData = useMemo(() => {
    const baseline = activePlant?.moisture ?? 62
    const base = makeMoistureSeries(range, baseline)
    return base.map((point, index) => ({
      ...point,
      second: Math.max(20, point.moisture - 4 + Math.sin(index) * 2),
      threshold: activePlant?.threshold ?? 45,
    }))
  }, [range, activePlant?.moisture, activePlant?.threshold])

  const dailyWater = useMemo(() => {
    const base = makeWaterSeries(range)
    return base.map((point) => ({ ...point, efficiency: 84 + ((point.cycles * 3) % 12) }))
  }, [range])

  const filteredEvents = useMemo(() => {
    const now = Date.now()
    const ms = range === '24h' ? 86400000 : range === '7d' ? 7 * 86400000 : 30 * 86400000
    if (range === 'custom') {
      const start = new Date(customStart).setHours(0, 0, 0, 0)
      const end = new Date(customEnd).setHours(23, 59, 59, 999)
      return state.wateringEvents.filter((event) => {
        const time = new Date(event.date).getTime()
        return time >= start && time <= end
      })
    }
    return state.wateringEvents.filter((event) => new Date(event.date).getTime() >= now - ms)
  }, [state.wateringEvents, range, customStart, customEnd])

  const waterPerPlant = useMemo(() => {
    return state.plants.map((plant, index) => {
      const events = filteredEvents.filter((event) => event.plantId === plant.id)
      return {
        name: plant.name,
        species: plant.species,
        liters: Number(events.reduce((sum, event) => sum + event.liters, 0).toFixed(2)),
        cycles: events.length,
        color: plantColors[index % plantColors.length],
        image: plant.image,
      }
    }).sort((a, b) => b.liters - a.liters)
  }, [state.plants, filteredEvents])

  const totalWater = Number(filteredEvents.reduce((sum, event) => sum + event.liters, 0).toFixed(2))
  const avgMoisture = Math.round(moistureData.reduce((sum, point) => sum + point.moisture, 0) / Math.max(1, moistureData.length))
  const totalRuntime = filteredEvents.reduce((sum, event) => sum + event.durationSec, 0)
  const avgEfficiency = Math.round(dailyWater.reduce((sum, point) => sum + point.efficiency, 0) / Math.max(1, dailyWater.length))
  const pumpTone = totalRuntime > 120 ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'

  const exportEvents = () => {
    downloadCsv(
      `plantcare-watering-${range}-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredEvents.map((event) => ({
        date: event.date,
        plant: state.plants.find((plant) => plant.id === event.plantId)?.name ?? event.plantId,
        mode: event.mode,
        duration_seconds: event.durationSec,
        estimated_liters: event.liters,
        status: event.status,
      })),
    )
  }

  const exportMoisture = () => {
    downloadCsv(
      `plantcare-moisture-${range}-${new Date().toISOString().slice(0, 10)}.csv`,
      moistureData.map((point) => ({
        period: point.label,
        moisture_percent: point.moisture,
        threshold_percent: point.threshold,
      })),
    )
  }

  const anomalies = [
    { time: 'Today · 03:12', sensor: 'SM-03', type: 'Brief reading spike', severity: 'Low', detail: 'Reading rose from 27% to 58% for one sample, then recovered.' },
    { time: 'Yesterday · 18:44', sensor: 'SM-01', type: 'Sampling gap', severity: 'Low', detail: 'No reading for 2 minutes during Wi-Fi reconnect. Local pump safety unaffected.' },
    { time: 'Mon · 09:05', sensor: 'SM-05', type: 'High moisture variance', severity: 'Medium', detail: 'Variance exceeded 8% over 10 minutes; sensor remains within calibration.' },
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Garden intelligence"
        title="Analytics"
        subtitle="Understand moisture patterns, watering frequency and estimated water use across your garden."
        icon={BarChart3}
        actions={
          <>
            <button type="button" onClick={exportEvents} className="btn-secondary"><ArrowDownToLine className="h-3.5 w-3.5" /> Export CSV</button>
            <Link to="/water-health" className="btn-primary"><Droplets className="h-3.5 w-3.5" /> Pump health</Link>
          </>
        }
      />

      <div className="panel mb-4 flex flex-col gap-3 p-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted"><CalendarRange className="h-3.5 w-3.5" /> Date range</span>
          {(Object.keys(rangeLabels) as Range[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={cn('rounded-lg px-3 py-1.5 text-[10px] font-semibold transition', range === item ? 'bg-forest-900 text-white dark:bg-lime-300 dark:text-forest-950' : 'border border-line bg-surface text-muted hover:text-main')}
            >
              {rangeLabels[item]}
            </button>
          ))}
        </div>
        {range === 'custom' ? (
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="input !w-auto !py-1.5 !text-[10px]" aria-label="Custom start date" />
            <span className="text-[10px] text-muted">to</span>
            <input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="input !w-auto !py-1.5 !text-[10px]" aria-label="Custom end date" />
          </div>
        ) : (
          <span className="text-[9px] text-muted">Showing simulated telemetry · {rangeLabels[range].toLowerCase()}</span>
        )}
      </div>

      <div className="mb-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Average moisture', value: `${avgMoisture}%`, note: 'within active range', icon: Gauge, tone: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Watering cycles', value: filteredEvents.length, note: `${rangeLabels[range]}`, icon: Droplets, tone: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10' },
          { label: 'Pump runtime', value: `${totalRuntime}s`, note: 'total estimated', icon: Zap, tone: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10' },
          { label: 'Estimated water', value: `${totalWater} L`, note: 'from pump runtime', icon: Waves, tone: 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Watering efficiency', value: `${avgEfficiency}%`, note: 'demo score', icon: TrendingUp, tone: 'text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="panel p-4">
            <div className="flex items-start justify-between">
              <span className={cn('grid h-8 w-8 place-items-center rounded-lg', stat.tone)}><stat.icon className="h-4 w-4" /></span>
              <span className="text-[8px] font-bold uppercase tracking-wide text-muted/50">Demo</span>
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold tracking-[-0.045em] text-main">{stat.value}</p>
            <p className="text-[9px] font-semibold text-soft">{stat.label}</p>
            <p className="mt-0.5 text-[8px] text-muted">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="panel p-5 xl:col-span-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold text-main">Soil moisture trend</p>
              <p className="mt-0.5 text-[9px] text-muted">{activePlant?.name ?? 'All plants'} · sensor {activePlant?.sensorId} · simulated</p>
            </div>
            <div className="flex items-center gap-3 text-[9px] text-muted">
              <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-emerald-500" /> Moisture</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 border-t border-dashed border-amber-500" /> Threshold</span>
            </div>
          </div>
          <div className="mt-5 h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moistureData} margin={{ top: 10, right: 8, left: -26, bottom: 0 }}>
                <defs>
                  <linearGradient id="anaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10a36d" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#10a36d" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} domain={[20, 90]} tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={activePlant?.maxMoisture ?? 75} stroke="#3c7d9b" strokeDasharray="3 4" strokeOpacity={0.5} />
                <ReferenceLine y={activePlant?.threshold ?? 45} stroke="#d69a29" strokeDasharray="5 4" strokeWidth={1.5} label={{ value: 'threshold', position: 'insideTopRight', fill: '#b07b1d', fontSize: 9 }} />
                <Area type="monotone" dataKey="moisture" name="Moisture" stroke="#10a36d" strokeWidth={2.4} fill="url(#anaFill)" dot={false} />
                <Area type="monotone" dataKey="second" name="Last period" stroke="#82b89f" strokeWidth={1.3} strokeDasharray="4 4" fill="none" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="chip-green"><StatusDot tone="green" /> {moistureData.length} samples</span>
            <span className="chip-amber"><StatusDot tone="amber" /> {moistureData.filter((point) => point.moisture < point.threshold).length} below threshold</span>
            <span className="chip-neutral">Simulated telemetry</span>
          </div>
        </div>

        <div className="panel p-5 xl:col-span-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-main">Water use by plant</p>
              <p className="mt-0.5 text-[9px] text-muted">Estimated from pump runtime</p>
            </div>
            <span className="chip-neutral">{filteredEvents.length} cycles</span>
          </div>
          <div className="mx-auto mt-2 h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={waterPerPlant.filter((item) => item.liters > 0)} dataKey="liters" nameKey="name" cx="50%" cy="48%" innerRadius={54} outerRadius={82} paddingAngle={3} strokeWidth={0}>
                  {waterPerPlant.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip unit=" L" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="relative -mt-[148px] mb-[110px] text-center">
            <p className="font-display text-2xl font-extrabold tracking-[-0.04em] text-main">{totalWater} L</p>
            <p className="text-[8px] uppercase tracking-wide text-muted">estimated total</p>
          </div>
          <div className="space-y-1.5">
            {waterPerPlant.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-[9px]">
                <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                <span className="flex-1 text-soft">{item.name}</span>
                <span className="font-semibold text-main">{item.liters} L</span>
                <span className="w-8 text-right text-muted">{item.cycles}×</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5 xl:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-main">Daily watering frequency</p>
              <p className="mt-0.5 text-[9px] text-muted">Cycles and estimated litres per period</p>
            </div>
            <button type="button" onClick={exportMoisture} className="inline-flex items-center gap-1 text-[9px] font-semibold text-muted hover:text-main"><ArrowDownToLine className="h-3 w-3" /> CSV</button>
          </div>
          <div className="mt-5 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyWater} margin={{ top: 5, right: 5, left: -30, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickFormatter={(value) => `${value}L`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar yAxisId="left" dataKey="cycles" name="Cycles" fill="#10a36d" radius={[5, 5, 0, 0]} maxBarSize={22} />
                <Bar yAxisId="right" dataKey="liters" name="Water" fill="#c9f27b" radius={[5, 5, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5 xl:col-span-5">
          <p className="text-xs font-bold text-main">Water usage comparison</p>
          <p className="mt-0.5 text-[9px] text-muted">Estimated weekly use per plant</p>
          <div className="mt-4 space-y-3">
            {waterPerPlant.map((item) => {
              const max = Math.max(...waterPerPlant.map((entry) => entry.liters), 0.1)
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="flex items-center gap-2 text-soft"><img src={item.image} alt="" className="h-5 w-5 rounded-md object-cover" />{item.name}</span>
                    <span className="font-semibold text-main">{item.liters} L</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(item.liters / max) * 100}%`, background: item.color }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 rounded-lg bg-surface-2 p-2.5 text-[8px] leading-4 text-muted">No flow sensor is configured. Litres are estimated from pump runtime × assumed flow rate. Add a flow meter for measured usage.</div>
        </div>

        <div className="panel p-5 xl:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-main">Sensor anomalies</p>
              <p className="mt-0.5 text-[9px] text-muted">Validation flags from demo telemetry</p>
            </div>
            <span className="chip-amber"><AlertTriangle className="h-2.5 w-2.5" /> 3 flags</span>
          </div>
          <div className="mt-3 space-y-2">
            {anomalies.map((anomaly) => (
              <div key={anomaly.time} className="flex items-start gap-3 rounded-xl border border-line p-3">
                <span className={cn('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg', anomaly.severity === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-surface-2 text-muted')}><Activity className="h-3.5 w-3.5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="text-[10px] font-semibold text-main">{anomaly.type}</p>
                    <span className="text-[8px] text-muted">{anomaly.time}</span>
                  </div>
                  <p className="mt-0.5 text-[9px] leading-4 text-muted">{anomaly.detail}</p>
                  <span className="mt-1 inline-flex text-[8px] font-semibold text-soft">{anomaly.sensor} · {anomaly.severity} severity</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5 xl:col-span-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-main">Watering efficiency</p>
              <p className="mt-0.5 text-[9px] text-muted">Demo score based on safety + timing</p>
            </div>
            <span className="chip-green"><StatusDot tone="green" /> Good</span>
          </div>
          <div className="mt-5 flex items-center justify-center">
            <div className="relative grid h-36 w-36 place-items-center rounded-full" style={{ background: `conic-gradient(#10a36d ${avgEfficiency * 3.6}deg, var(--surface-3) 0deg)` }}>
              <div className="grid h-[118px] w-[118px] place-items-center rounded-full bg-surface text-center">
                <div>
                  <p className="font-display text-3xl font-extrabold tracking-[-0.05em] text-main">{avgEfficiency}%</p>
                  <p className="text-[8px] font-bold uppercase tracking-wide text-muted">efficiency</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {[
              { label: 'Threshold accuracy', value: 94 },
              { label: 'Runtime efficiency', value: 89 },
              { label: 'Watering timing', value: 87 },
              { label: 'Safety compliance', value: 100 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-[8px]"><span className="text-muted">{item.label}</span><span className="font-semibold text-soft">{item.value}%</span></div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5 xl:col-span-12">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold text-main">Device activity</p>
              <p className="mt-0.5 text-[9px] text-muted">Readings, sync events, pump cycles and safety checks</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="chip-neutral"><Cpu className="h-2.5 w-2.5" /> ESP32 v2.4.1</span>
              <span className="chip-green"><CheckCircle2 className="h-2.5 w-2.5" /> 99.2% uptime</span>
              <span className="chip-neutral"><ShieldCheck className="h-2.5 w-2.5" /> 0 safety bypasses</span>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Sensor samples', value: '8,640', note: 'last 30 days · simulated' },
              { label: 'Successful syncs', value: '99.8%', note: '2 reconnect events' },
              { label: 'Pump activations', value: String(state.pump.dailyCycles + filteredEvents.length), note: 'current + history' },
              { label: 'Safety interventions', value: '4', note: 'all resolved safely' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-line bg-surface-2 p-3">
                <p className="font-display text-lg font-bold text-main">{item.value}</p>
                <p className="text-[9px] font-semibold text-soft">{item.label}</p>
                <p className="mt-0.5 text-[8px] text-muted">{item.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-line bg-surface-2 p-3 text-[9px] leading-5 text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Analytics are generated from the seeded demo workspace and local interactions. Actual readings require a connected ESP32 and backend sync. CSV exports contain the current simulated range.
          </div>
        </div>
      </div>
    </div>
  )
}
