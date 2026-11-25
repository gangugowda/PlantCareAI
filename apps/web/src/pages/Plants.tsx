import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  Filter,
  Gauge,
  Grid2X2,
  LayoutList,
  Leaf,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sprout,
  Trash2,
  Waves,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn, formatDate, moistureStatus, timeAgo } from '../lib/utils'
import PlantModal from '../components/PlantModal'
import { EmptyState, Modal, PageHeader, StatusDot } from '../components/ui'
import type { Plant } from '../lib/types'

export default function PlantsPage() {
  const { state, setActivePlantId, deletePlant } = useApp()
  const [search, setSearch] = useState('')
  const [room, setRoom] = useState('All rooms')
  const [health, setHealth] = useState('All health')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Plant | undefined>()
  const [deleting, setDeleting] = useState<Plant | undefined>()
  const navigate = useNavigate()

  const rooms = ['All rooms', ...Array.from(new Set(state.plants.map((plant) => plant.room)))]
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return state.plants.filter((plant) => {
      if (room !== 'All rooms' && plant.room !== room) return false
      if (health !== 'All health' && plant.health !== health) return false
      if (query && !`${plant.name} ${plant.species} ${plant.room} ${plant.soilType}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [state.plants, search, room, health])

  const avg = state.plants.length ? Math.round(state.plants.reduce((sum, plant) => sum + plant.moisture, 0) / state.plants.length) : 0
  const attention = state.plants.filter((plant) => plant.health === 'Needs attention' || plant.moisture <= plant.threshold).length
  const autoCount = state.plants.filter((plant) => plant.autoWater).length

  const openDetails = (plant: Plant) => {
    setActivePlantId(plant.id)
    navigate(`/plants/${plant.id}`)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Your garden"
        title="My plants"
        subtitle="Every plant has its own care profile, moisture range, sensor and watering zone."
        icon={Sprout}
        actions={
          <>
            <button type="button" onClick={() => { setEditing(undefined); setModalOpen(true) }} className="btn-primary">
              <Plus className="h-4 w-4" /> Add new plant
            </button>
          </>
        }
      />

      <div className="mb-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Plants in garden', value: state.plants.length, note: `${new Set(state.plants.map((plant) => plant.room)).size} rooms`, icon: Leaf, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
          { label: 'Average moisture', value: `${avg}%`, note: 'across all sensors', icon: Gauge, tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' },
          { label: 'Need attention', value: attention, note: attention ? 'review care notes' : 'all within range', icon: ShieldCheck, tone: attention ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300' },
          { label: 'Auto watering on', value: `${autoCount}/${state.plants.length}`, note: 'global arm state applies', icon: Droplets, tone: 'bg-lime-100 text-forest-800 dark:bg-lime-300/10 dark:text-lime-300' },
        ].map((stat) => (
          <div key={stat.label} className="panel flex items-center gap-3 p-4">
            <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', stat.tone)}><stat.icon className="h-4.5 w-4.5" /></span>
            <div>
              <p className="font-display text-xl font-bold tracking-[-0.04em] text-main">{stat.value}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
              <p className="text-[8px] text-muted/70">{stat.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="panel mb-4 p-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, species, room or soil…" aria-label="Search plants" className="input !pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <select value={room} onChange={(event) => setRoom(event.target.value)} className="select !w-auto !pl-8 !pr-8 text-xs" aria-label="Filter by room">
                {rooms.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <select value={health} onChange={(event) => setHealth(event.target.value)} className="select !w-auto text-xs" aria-label="Filter by health">
              {['All health', 'Thriving', 'Healthy', 'Needs attention'].map((item) => <option key={item}>{item}</option>)}
            </select>
            <div className="flex rounded-xl border border-line bg-surface-2 p-1">
              <button type="button" onClick={() => setView('grid')} className={cn('grid h-7 w-7 place-items-center rounded-lg transition', view === 'grid' ? 'bg-surface text-main shadow-sm' : 'text-muted')} aria-label="Grid view"><Grid2X2 className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => setView('list')} className={cn('grid h-7 w-7 place-items-center rounded-lg transition', view === 'list' ? 'bg-surface text-main shadow-sm' : 'text-muted')} aria-label="List view"><LayoutList className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No plants match"
          description="Try a broader search or add a new plant to your garden."
          action={<button type="button" onClick={() => { setSearch(''); setRoom('All rooms'); setHealth('All health') }} className="btn-secondary">Clear filters</button>}
        />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((plant) => {
            const status = moistureStatus(plant.moisture, plant.threshold, plant.maxMoisture)
            return (
              <article key={plant.id} className="card-hover group overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={plant.image} alt={`${plant.name}, ${plant.species}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/65 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    <span className={cn('chip', plant.health === 'Needs attention' ? 'chip-amber' : 'chip-green')}>
                      <StatusDot tone={plant.health === 'Needs attention' ? 'amber' : 'green'} /> {plant.health}
                    </span>
                    {plant.autoWater && <span className="chip bg-white/80 text-forest-900 backdrop-blur"><Droplets className="h-2.5 w-2.5" /> Auto</span>}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <h2 className="font-display text-lg font-bold tracking-[-0.03em]">{plant.name}</h2>
                      <p className="text-[10px] text-white/65">{plant.species}</p>
                    </div>
                    <button type="button" onClick={(event) => { event.stopPropagation(); setEditing(plant); setModalOpen(true) }} className="grid h-8 w-8 place-items-center rounded-lg border border-white/20 bg-forest-950/40 backdrop-blur transition hover:bg-forest-950/65" aria-label={`Edit ${plant.name}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-[9px] text-muted">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {plant.room}</span>
                    <span>{plant.potSize}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-end justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-2xl font-extrabold tracking-[-0.04em] text-main">{plant.moisture}%</span>
                        <span className={cn('text-[9px] font-semibold', status.tone === 'amber' ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300')}>{status.label}</span>
                      </div>
                      <span className="text-[8px] text-muted">threshold {plant.threshold}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div className={cn('h-full rounded-full transition-all', status.tone === 'amber' ? 'bg-amber-400' : 'bg-emerald-500')} style={{ width: `${plant.moisture}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <div className="flex items-center gap-2 text-[8px] text-muted">
                      <span>{plant.sensorId}</span>
                      <span className="h-2.5 w-px bg-line" />
                      <span>{plant.pumpId}</span>
                      <span className="h-2.5 w-px bg-line" />
                      <span>{timeAgo(plant.lastWatered)}</span>
                    </div>
                    <button type="button" onClick={() => openDetails(plant)} className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 transition hover:gap-1.5 dark:text-emerald-300">
                      Details <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead>
                <tr className="border-b border-line bg-surface-2">
                  {['Plant', 'Location', 'Moisture', 'Threshold', 'Auto', 'Last watered', ''].map((head) => (
                    <th key={head} className="px-4 py-3 text-[9px] font-bold uppercase tracking-[0.1em] text-muted">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((plant) => {
                  const status = moistureStatus(plant.moisture, plant.threshold, plant.maxMoisture)
                  return (
                    <tr key={plant.id} className="table-row group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={plant.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                          <div>
                            <p className="text-[11px] font-bold text-main">{plant.name}</p>
                            <p className="text-[9px] text-muted">{plant.species}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-soft">{plant.room}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold tabular-nums text-main">{plant.moisture}%</span>
                          <span className={cn('text-[8px]', status.tone === 'amber' ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300')}>{status.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[10px] tabular-nums text-soft">{plant.threshold}%</td>
                      <td className="px-4 py-3"><span className={cn('rounded-full px-2 py-1 text-[8px] font-semibold', plant.autoWater ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-surface-2 text-muted')}>{plant.autoWater ? 'On' : 'Off'}</span></td>
                      <td className="px-4 py-3 text-[9px] text-muted">{timeAgo(plant.lastWatered)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => openDetails(plant)} className="grid h-7 w-7 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-main" aria-label={`View ${plant.name}`}><ArrowRight className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => { setEditing(plant); setModalOpen(true) }} className="grid h-7 w-7 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-main" aria-label={`Edit ${plant.name}`}><Pencil className="h-3.5 w-3.5" /></button>
                          <button type="button" onClick={() => setDeleting(plant)} className="grid h-7 w-7 place-items-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" aria-label={`Delete ${plant.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PlantModal open={modalOpen} onClose={() => setModalOpen(false)} plant={editing} />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(undefined)}
        title={`Delete ${deleting?.name ?? 'plant'}?`}
        subtitle="This removes the plant from your demo workspace. Sensor and watering history stay in the event log."
        size="sm"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setDeleting(undefined)}>Keep plant</button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                if (deleting) deletePlant(deleting.id)
                setDeleting(undefined)
              }}
            >
              <Trash2 className="h-4 w-4" /> Delete plant
            </button>
          </>
        }
      >
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-3 text-[10px] leading-5 text-red-800 dark:bg-red-500/10 dark:text-red-200">
          <Trash2 className="h-4 w-4 shrink-0" />
          This action cannot be undone in the demo. You can reset demo data from Settings.
        </div>
      </Modal>
    </div>
  )
}
