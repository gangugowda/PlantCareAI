import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Droplets,
  Gauge,
  Info,
  Leaf,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  ShieldCheck,
  Sprout,
  Sun,
  Trash2,
  Waves,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApp } from '../lib/store'
import { cn, formatDate, makeMoistureSeries, moistureStatus, timeAgo } from '../lib/utils'
import PlantModal from '../components/PlantModal'
import { Modal, PageHeader, ProgressRing, StatusDot } from '../components/ui'

export default function PlantDetailPage() {
  const { id } = useParams()
  const { state, setActivePlantId, deletePlant, updatePlant, notify } = useApp()
  const plant = state.plants.find((item) => item.id === id)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (plant) setActivePlantId(plant.id)
  }, [plant?.id, setActivePlantId])

  const chartData = useMemo(
    () => makeMoistureSeries('7d', plant?.moisture ?? 60).map((point) => ({ ...point, threshold: plant?.threshold ?? 45 })),
    [plant?.moisture, plant?.threshold],
  )

  if (!plant) {
    return (
      <div className="panel flex flex-col items-center justify-center p-14 text-center">
        <Sprout className="h-10 w-10 text-emerald-700" />
        <h1 className="mt-4 font-display text-2xl font-bold text-main">Plant not found</h1>
        <p className="mt-2 text-sm text-muted">It may have been removed from this demo workspace.</p>
        <Link to="/plants" className="btn-primary mt-5">Back to My Plants</Link>
      </div>
    )
  }

  const status = moistureStatus(plant.moisture, plant.threshold, plant.maxMoisture)
  const events = state.wateringEvents.filter((event) => event.plantId === plant.id).slice(0, 8)
  const tasks = state.careTasks.filter((task) => task.plantId === plant.id)
  const growth = state.growthEntries.filter((entry) => entry.plantId === plant.id).sort((a, b) => b.date.localeCompare(a.date))
  const canWater = state.device.online && state.pump.status === 'OFF' && !state.settings.emergencyShutdown && state.device.reservoir >= 12

  const remove = () => {
    deletePlant(plant.id)
    navigate('/plants')
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-[10px] text-muted">
        <Link to="/plants" className="inline-flex items-center gap-1 font-semibold transition hover:text-main"><ArrowLeft className="h-3 w-3" /> My plants</Link>
        <span className="opacity-40">/</span>
        <span>{plant.name}</span>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <div className="relative h-[240px] sm:h-[290px]">
          <img src={plant.image} alt={`${plant.name}, ${plant.species}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-end sm:p-7">
            <div className="text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('chip', plant.health === 'Needs attention' ? 'chip-amber' : 'chip-green')}><StatusDot tone={plant.health === 'Needs attention' ? 'amber' : 'green'} /> {plant.health}</span>
                {plant.autoWater && <span className="chip bg-white/10 text-white backdrop-blur"><Droplets className="h-2.5 w-2.5" /> Auto watering</span>}
              </div>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">{plant.name}</h1>
              <p className="mt-1 text-sm italic text-white/75">{plant.species}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-white/75">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {plant.room}</span>
                <span className="inline-flex items-center gap-1"><Sun className="h-3 w-3" /> {plant.light}</span>
                <span className="inline-flex items-center gap-1"><Leaf className="h-3 w-3" /> {plant.potSize}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-[11px] font-semibold text-white backdrop-blur transition hover:bg-white/20"><Pencil className="h-3.5 w-3.5" /> Edit</button>
              <button type="button" onClick={() => navigate('/dashboard')} disabled={!canWater} className="inline-flex items-center gap-1.5 rounded-xl bg-lime-300 px-3.5 py-2.5 text-[11px] font-bold text-forest-950 transition hover:bg-lime-200 disabled:opacity-40"><Droplets className="h-3.5 w-3.5" /> Water now</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="panel flex items-center gap-4 p-4">
          <ProgressRing value={plant.moisture} size={76} stroke={7} color={status.tone === 'amber' ? '#d69a29' : 'var(--emerald)'}>
            <span className="font-display text-lg font-extrabold text-main">{plant.moisture}%</span>
          </ProgressRing>
          <div>
            <p className="stat-label">Soil moisture</p>
            <p className="mt-1 text-sm font-bold text-main">{status.label}</p>
            <p className="text-[9px] text-muted">Threshold {plant.threshold}%</p>
          </div>
        </div>
        <div className="panel flex items-center gap-3 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"><Waves className="h-5 w-5" /></span>
          <div>
            <p className="stat-label">Pump zone</p>
            <p className="mt-1 text-sm font-bold text-main">{plant.pumpId}</p>
            <p className="text-[9px] text-muted">{state.pump.status === 'ON' && state.pump.plantId === plant.id ? 'Watering now' : state.pump.status === 'COOLING' ? 'Cooling down' : 'Ready'}</p>
          </div>
        </div>
        <div className="panel flex items-center gap-3 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><Gauge className="h-5 w-5" /></span>
          <div>
            <p className="stat-label">Sensor</p>
            <p className="mt-1 text-sm font-bold text-main">{plant.sensorId}</p>
            <p className="text-[9px] text-muted">Health · {state.device.sensorHealth}</p>
          </div>
        </div>
        <div className="panel flex items-center gap-3 p-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"><CalendarDays className="h-5 w-5" /></span>
          <div>
            <p className="stat-label">Last watered</p>
            <p className="mt-1 text-sm font-bold text-main">{timeAgo(plant.lastWatered)}</p>
            <p className="text-[9px] text-muted">{formatDate(plant.lastWatered)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-main">Moisture history · 7 days</p>
                <p className="mt-0.5 text-[9px] text-muted">Simulated readings with threshold {plant.threshold}%</p>
              </div>
              <Link to="/analytics" className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Analytics <ArrowRight className="h-3 w-3" /></Link>
            </div>
            <div className="mt-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 5, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="plantFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10a36d" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#10a36d" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} interval={1} />
                  <YAxis axisLine={false} tickLine={false} domain={[20, 90]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 11 }} formatter={(value) => [`${value}%`, 'Moisture']} />
                  <ReferenceLine y={plant.threshold} stroke="#d69a29" strokeDasharray="5 4" />
                  <Area type="monotone" dataKey="moisture" stroke="#10a36d" strokeWidth={2.2} fill="url(#plantFill)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-main">Watering history</p>
                <p className="mt-0.5 text-[9px] text-muted">Estimated water based on pump runtime</p>
              </div>
              <span className="chip-neutral">{events.length} events</span>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left">
                <thead>
                  <tr className="border-b border-line">
                    {['Date', 'Time', 'Mode', 'Duration', 'Est. water', 'Status'].map((head) => <th key={head} className="pb-2 text-[8px] font-bold uppercase tracking-wide text-muted">{head}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-line last:border-0">
                      <td className="py-2.5 text-[9px] font-medium text-main">{formatDate(event.date, { day: 'numeric', month: 'short' })}</td>
                      <td className="py-2.5 text-[9px] text-muted">{new Date(event.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-2.5"><span className={cn('rounded-md px-1.5 py-0.5 text-[8px] font-semibold', event.mode === 'auto' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300')}>{event.mode}</span></td>
                      <td className="py-2.5 text-[9px] tabular-nums text-soft">{event.durationSec}s</td>
                      <td className="py-2.5 text-[9px] tabular-nums text-soft">{event.liters} L</td>
                      <td className="py-2.5 text-[9px] font-medium text-emerald-700 dark:text-emerald-300">{event.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel p-5">
            <p className="text-xs font-bold text-main">Care notes</p>
            <p className="mt-2 rounded-xl bg-surface-2 p-3.5 text-[11px] leading-6 text-soft">{plant.notes || 'No care notes yet. Add light, feeding or repotting details.'}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Soil', value: plant.soilType },
                { label: 'Pot', value: plant.potSize },
                { label: 'Watering pulse', value: `${plant.wateringDuration}s` },
                { label: 'Safe range', value: `${plant.minMoisture}–${plant.maxMoisture}%` },
                { label: 'Threshold', value: `${plant.threshold}%` },
                { label: 'Added', value: formatDate(plant.createdAt, { month: 'short', year: 'numeric' }) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-line p-2.5">
                  <p className="text-[8px] uppercase tracking-wide text-muted">{item.label}</p>
                  <p className="mt-1 text-[10px] font-semibold text-main">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 xl:col-span-4">
          <div className="panel p-5">
            <p className="text-xs font-bold text-main">Care schedule</p>
            <div className="mt-3 space-y-2">
              {tasks.length === 0 && <p className="rounded-lg bg-surface-2 p-3 text-[10px] text-muted">No tasks scheduled for this plant.</p>}
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2.5 rounded-xl border border-line p-2.5">
                  <span className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', task.completed ? 'bg-emerald-500' : 'bg-amber-400')} />
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-[10px] font-semibold', task.completed ? 'text-muted line-through' : 'text-main')}>{task.title}</p>
                    <p className="mt-0.5 text-[8px] text-muted">{formatDate(task.date, { day: 'numeric', month: 'short' })} · {task.time} · {task.type}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/calendar" className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-dashed border-line py-2 text-[9px] font-semibold text-muted transition hover:border-emerald-300 hover:text-emerald-700"><Plus className="h-3 w-3" /> Add care task</Link>
          </div>

          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-main">Growth timeline</p>
              <Link to="/growth" className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300">View all</Link>
            </div>
            {growth.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-line p-4 text-center">
                <p className="text-[10px] text-muted">No growth photos yet.</p>
                <Link to="/growth" className="mt-2 inline-flex text-[9px] font-bold text-emerald-700 dark:text-emerald-300">Add first photo</Link>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {growth.slice(0, 2).map((entry) => (
                  <div key={entry.id} className="flex gap-2.5 rounded-xl border border-line p-2">
                    <img src={entry.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="text-[9px] font-bold text-main">{formatDate(entry.date, { day: 'numeric', month: 'short' })}</p>
                      <p className="mt-0.5 text-[8px] leading-4 text-muted">{entry.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-forest-950 p-5 text-white dark:bg-[#173026]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-lime-300"><MessageCircle className="h-4 w-4" /></span>
            <p className="mt-3 text-xs font-bold">Ask Flora about {plant.name}</p>
            <p className="mt-1 text-[10px] leading-5 text-white/70">Get general guidance using this plant's care profile and live moisture.</p>
            <Link to="/assistant" className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-lime-300">Open AI assistant <ArrowRight className="h-3 w-3" /></Link>
          </div>

          <div className="panel flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-bold text-main">Plant actions</p>
              <p className="mt-0.5 text-[8px] text-muted">Edit details or remove this plant.</p>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => setEditOpen(true)} className="icon-btn h-8 w-8 rounded-lg" aria-label="Edit plant"><Pencil className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => setDeleteOpen(true)} className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" aria-label="Delete plant"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      </div>

      <PlantModal open={editOpen} onClose={() => setEditOpen(false)} plant={plant} />
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`Delete ${plant.name}?`}
        subtitle="This removes the plant and its place on the dashboard."
        size="sm"
        footer={<><button type="button" className="btn-secondary" onClick={() => setDeleteOpen(false)}>Cancel</button><button type="button" className="btn-danger" onClick={remove}><Trash2 className="h-4 w-4" /> Delete</button></>}
      >
        <p className="rounded-xl bg-red-50 p-3 text-[10px] leading-5 text-red-800 dark:bg-red-500/10 dark:text-red-200">Watering history remains in the activity log for auditability. This cannot be undone.</p>
      </Modal>
    </div>
  )
}
