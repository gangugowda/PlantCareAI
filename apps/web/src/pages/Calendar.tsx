import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplets,
  Leaf,
  Plus,
  Scissors,
  Sprout,
  Trash2,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn, formatDate } from '../lib/utils'
import { PageHeader, Tabs } from '../components/ui'
import type { CareTask } from '../lib/types'

const typeMeta: Record<CareTask['type'], { icon: typeof Droplets; tone: string; dot: string }> = {
  Watering: { icon: Droplets, tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300', dot: 'bg-sky-500' },
  Fertilizing: { icon: Sprout, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300', dot: 'bg-emerald-500' },
  Pruning: { icon: Scissors, tone: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300', dot: 'bg-violet-500' },
  Repotting: { icon: Leaf, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300', dot: 'bg-amber-500' },
  'Pest inspection': { icon: Leaf, tone: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300', dot: 'bg-rose-500' },
  Seasonal: { icon: CalendarDays, tone: 'bg-lime-100 text-forest-800 dark:bg-lime-300/10 dark:text-lime-300', dot: 'bg-lime-500' },
}

const taskTypes = Object.keys(typeMeta) as CareTask['type'][]

const toKey = (date: Date) => {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)

export default function CalendarPage() {
  const { state, addTask, deleteTask, addCareTaskComplete, notify } = useApp()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => toKey(new Date()))
  const [filter, setFilter] = useState<'upcoming' | 'all' | 'completed'>('upcoming')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: 'Watering' as CareTask['type'],
    plantId: state.plants[0]?.id ?? '',
    date: toKey(new Date()),
    time: '09:00',
    notes: '',
  })

  const todayKey = toKey(new Date())

  const tasksByDate = useMemo(() => {
    const map: Record<string, CareTask[]> = {}
    state.careTasks.forEach((task) => {
      map[task.date] = [...(map[task.date] ?? []), task]
    })
    return map
  }, [state.careTasks])

  const cells = useMemo(() => {
    const first = startOfMonth(month)
    const leading = first.getDay()
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const result: Array<{ key: string; day: number; inMonth: boolean } | null> = []
    for (let i = 0; i < leading; i += 1) result.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push({ key: toKey(new Date(month.getFullYear(), month.getMonth(), day)), day, inMonth: true })
    }
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [month])

  const selectedTasks = (tasksByDate[selectedDate] ?? []).sort((a, b) => a.time.localeCompare(b.time))

  const listTasks = useMemo(() => {
    const list = state.careTasks.filter((task) => {
      if (filter === 'completed') return task.completed
      if (filter === 'upcoming') return !task.completed
      return true
    })
    return list.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  }, [state.careTasks, filter])

  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndKey = toKey(weekEnd)
  const stats = {
    today: state.careTasks.filter((task) => task.date === todayKey && !task.completed).length,
    week: state.careTasks.filter((task) => !task.completed && task.date >= todayKey && task.date <= weekEndKey).length,
    overdue: state.careTasks.filter((task) => !task.completed && task.date < todayKey).length,
    done: state.careTasks.filter((task) => task.completed).length,
  }

  const openAdd = (date = selectedDate) => {
    setForm({
      title: '',
      type: 'Watering',
      plantId: state.plants[0]?.id ?? '',
      date,
      time: '09:00',
      notes: '',
    })
    setModalOpen(true)
  }

  const submit = () => {
    if (!form.title.trim()) return notify('Give the task a short title.', 'warning')
    if (!form.plantId) return notify('Choose a plant for this task.', 'warning')
    addTask({ ...form, title: form.title.trim(), completed: false })
    setModalOpen(false)
  }

  const monthLabel = month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div>
      <PageHeader
        eyebrow="Plant intelligence"
        title="Care calendar"
        subtitle="Plan watering, feeding, pruning and inspections. Automatic watering still runs on sensor readings — calendar tasks are reminders, not hardware overrides."
        icon={CalendarDays}
        actions={
          <button type="button" onClick={() => openAdd()} className="btn-primary">
            <Plus className="h-4 w-4" /> Add care task
          </button>
        }
      />

      <div className="mb-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Due today', value: stats.today, note: 'open tasks', tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300', icon: CalendarDays },
          { label: 'Next 7 days', value: stats.week, note: 'planned care', tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300', icon: Clock3 },
          { label: 'Overdue', value: stats.overdue, note: 'reschedule or complete', tone: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300', icon: Leaf },
          { label: 'Completed', value: stats.done, note: 'all time in demo', tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300', icon: Check },
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

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <section className="panel p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold tracking-[-0.03em] text-main">{monthLabel}</h2>
              <p className="text-[10px] text-muted">{state.careTasks.length} tasks in this workspace</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="icon-btn h-8 w-8 rounded-lg" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => { setMonth(startOfMonth(new Date())); setSelectedDate(todayKey) }} className="rounded-lg border border-line px-2.5 py-1.5 text-[10px] font-semibold text-soft transition hover:bg-surface-2">Today</button>
              <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="icon-btn h-8 w-8 rounded-lg" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="pb-1 text-center text-[9px] font-bold uppercase tracking-wide text-muted">{day}</div>
            ))}
            {cells.map((cell, index) => {
              if (!cell) return <div key={`blank-${index}`} className="min-h-[62px] rounded-xl" />
              const tasks = tasksByDate[cell.key] ?? []
              const isToday = cell.key === todayKey
              const isSelected = cell.key === selectedDate
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => setSelectedDate(cell.key)}
                  className={cn(
                    'min-h-[62px] rounded-xl border p-1.5 text-left transition sm:min-h-[74px]',
                    isSelected
                      ? 'border-emerald-400 bg-emerald-50/70 dark:border-emerald-500/40 dark:bg-emerald-500/10'
                      : 'border-line bg-surface hover:bg-surface-2',
                  )}
                >
                  <span className={cn('grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold', isToday ? 'bg-forest-900 text-white dark:bg-lime-300 dark:text-forest-950' : 'text-soft')}>{cell.day}</span>
                  <span className="mt-1 flex flex-wrap gap-0.5">
                    {tasks.slice(0, 3).map((task) => (
                      <span key={task.id} className={cn('h-1.5 w-1.5 rounded-full', task.completed ? 'bg-slate-300 dark:bg-white/20' : typeMeta[task.type].dot)} />
                    ))}
                    {tasks.length > 3 && <span className="text-[7px] font-bold text-muted">+{tasks.length - 3}</span>}
                  </span>
                  {tasks.length > 0 && (
                    <span className="mt-0.5 hidden truncate text-[7.5px] text-muted sm:block">{tasks[0].title}</span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-muted">Legend</span>
            {taskTypes.map((type) => (
              <span key={type} className="inline-flex items-center gap-1 text-[8px] text-muted"><span className={cn('h-1.5 w-1.5 rounded-full', typeMeta[type].dot)} /> {type}</span>
            ))}
          </div>
        </section>

        <section className="panel flex flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold tracking-[-0.03em] text-main">{formatDate(selectedDate, { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
              <p className="text-[10px] text-muted">{selectedTasks.length ? `${selectedTasks.length} care task${selectedTasks.length > 1 ? 's' : ''}` : 'No care tasks scheduled'}</p>
            </div>
            <button type="button" onClick={() => openAdd(selectedDate)} className="icon-btn h-8 w-8 rounded-lg" aria-label="Add task on this date"><Plus className="h-4 w-4" /></button>
          </div>

          <div className="mt-4 flex-1 space-y-2">
            {selectedTasks.length === 0 ? (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface-2 px-5 text-center">
                <CalendarDays className="h-7 w-7 text-muted" />
                <p className="mt-2 text-[11px] font-semibold text-main">Nothing planned</p>
                <p className="mt-0.5 text-[9.5px] leading-4 text-muted">Add a reminder for this day. Sensor-based automatic watering stays independent.</p>
                <button type="button" onClick={() => openAdd(selectedDate)} className="btn-secondary mt-3 !py-1.5 !text-[10px]">Add task</button>
              </div>
            ) : (
              selectedTasks.map((task) => {
                const plant = state.plants.find((item) => item.id === task.plantId)
                const meta = typeMeta[task.type]
                return (
                  <div key={task.id} className={cn('rounded-2xl border p-3 transition', task.completed ? 'border-line bg-surface-2 opacity-70' : 'border-line bg-surface')}>
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => addCareTaskComplete(task.id)}
                        aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`}
                        className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition', task.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line-strong bg-surface hover:border-emerald-400')}
                      >
                        {task.completed && <Check className="h-3 w-3" strokeWidth={3} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-[11px] font-bold text-main', task.completed && 'line-through')}>{task.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px] text-muted">
                          <span className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold', meta.tone)}><meta.icon className="h-2.5 w-2.5" /> {task.type}</span>
                          <span className="inline-flex items-center gap-1"><Clock3 className="h-2.5 w-2.5" /> {task.time}</span>
                          {plant && <span>· {plant.name}</span>}
                        </div>
                        {task.notes && <p className="mt-1.5 text-[9.5px] leading-4 text-muted">{task.notes}</p>}
                      </div>
                      <button type="button" onClick={() => deleteTask(task.id)} className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" aria-label={`Delete ${task.title}`}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>

      <section className="panel mt-4 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="font-display text-sm font-bold text-main">All care tasks</h2>
            <p className="text-[10px] text-muted">Completed tasks are saved in your demo workspace.</p>
          </div>
          <Tabs
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'completed', label: 'Completed' },
              { value: 'all', label: 'All' },
            ]}
          />
        </div>
        <div className="divide-y divide-[color:var(--line)]">
          {listTasks.length === 0 && <p className="px-5 py-10 text-center text-[11px] text-muted">No tasks in this view.</p>}
          {listTasks.map((task) => {
            const plant = state.plants.find((item) => item.id === task.plantId)
            const meta = typeMeta[task.type]
            return (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', meta.tone)}><meta.icon className="h-3.5 w-3.5" /></span>
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-[11px] font-semibold text-main', task.completed && 'line-through opacity-60')}>{task.title}</p>
                  <p className="text-[9px] text-muted">{task.type} · {plant?.name ?? 'Plant'} · {formatDate(task.date, { day: 'numeric', month: 'short' })} at {task.time}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addCareTaskComplete(task.id)}
                  className={cn('chip shrink-0', task.completed ? 'chip-green' : 'chip-neutral')}
                >
                  {task.completed ? <><Check className="h-2.5 w-2.5" /> Done</> : 'Mark done'}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-5">
          <button type="button" aria-label="Close" onClick={() => setModalOpen(false)} className="absolute inset-0 bg-[#07150f]/55 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-lg rounded-t-3xl border border-line bg-surface p-5 shadow-float animate-fadeUp sm:rounded-3xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-main">Add care task</h2>
                <p className="mt-0.5 text-[10.5px] text-muted">A reminder for you — not a pump command.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="icon-btn h-8 w-8 rounded-lg" aria-label="Close">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label" htmlFor="task-title">Task title</label>
                <input id="task-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Inspect Monstera for pests" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="task-type">Type</label>
                  <select id="task-type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as CareTask['type'] })} className="select">
                    {taskTypes.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="task-plant">Plant</label>
                  <select id="task-plant" value={form.plantId} onChange={(event) => setForm({ ...form, plantId: event.target.value })} className="select">
                    {state.plants.map((plant) => <option key={plant.id} value={plant.id}>{plant.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="task-date">Date</label>
                  <input id="task-date" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="task-time">Time</label>
                  <input id="task-time" type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="task-notes">Notes <span className="font-normal text-muted">(optional)</span></label>
                <textarea id="task-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="textarea !min-h-[80px]" placeholder="What should you check or do?" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={submit} className="btn-primary"><Plus className="h-4 w-4" /> Add task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
