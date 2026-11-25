import { useMemo, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  CalendarDays,
  Camera,
  ImagePlus,
  Images,
  Leaf,
  Plus,
  Ruler,
  Sparkles,
  TrendingUp,
  UploadCloud,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn, formatDate } from '../lib/utils'
import { EmptyState, PageHeader } from '../components/ui'
import type { GrowthEntry } from '../lib/types'

const toKey = (date: Date) => {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export default function GrowthPage() {
  const { state, activePlantId, setActivePlantId, addGrowthEntry, notify } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ date: toKey(new Date()), heightCm: '', note: '', image: '' })
  const fileRef = useRef<HTMLInputElement>(null)

  const plant = state.plants.find((item) => item.id === activePlantId) ?? state.plants[0]
  const entries = useMemo(
    () =>
      state.growthEntries
        .filter((entry) => entry.plantId === plant?.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [state.growthEntries, plant?.id],
  )

  const chartData = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)).map((entry) => ({
      date: formatDate(entry.date, { day: 'numeric', month: 'short' }),
      height: entry.heightCm,
    })),
    [entries],
  )

  const first = entries[entries.length - 1]
  const latest = entries[0]
  const totalGrowth = first && latest ? latest.heightCm - first.heightCm : 0
  const daysTracked = first ? Math.max(1, Math.round((Date.now() - new Date(first.date).getTime()) / 86_400_000)) : 0

  const readFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return notify('Please choose an image file.', 'warning')
    if (file.size > 4 * 1024 * 1024) return notify('Keep demo photos under 4 MB.', 'warning')
    const reader = new FileReader()
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  const submit = () => {
    if (!plant) return
    const height = Number(form.heightCm)
    if (!height || height <= 0) return notify('Enter the current height in centimetres.', 'warning')
    if (!form.note.trim()) return notify('Add a short note about what changed.', 'warning')
    const entry: Omit<GrowthEntry, 'id'> = {
      plantId: plant.id,
      date: form.date,
      note: form.note.trim(),
      image: form.image || plant.image,
      heightCm: height,
    }
    addGrowthEntry(entry)
    setModalOpen(false)
    setForm({ date: toKey(new Date()), heightCm: '', note: '', image: '' })
  }

  if (!plant) {
    return (
      <div>
        <PageHeader eyebrow="Plant intelligence" title="Growth timeline" subtitle="Track height, leaves and photos over time." icon={Images} />
        <EmptyState icon={Leaf} title="Add a plant first" description="Growth entries are linked to a plant in your garden." />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Plant intelligence"
        title="Growth timeline"
        subtitle="A visual record of height, new leaves and milestones. Photos and notes stay in your local demo workspace."
        icon={Images}
        actions={
          <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add growth entry
          </button>
        }
      />

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {state.plants.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActivePlantId(item.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition',
              item.id === plant.id
                ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200'
                : 'border-line bg-surface text-soft hover:bg-surface-2',
            )}
          >
            <img src={item.image} alt="" className="h-6 w-6 rounded-md object-cover" />
            {item.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="panel overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3">
                <img src={plant.image} alt={`${plant.name}, ${plant.species}`} className="h-12 w-12 rounded-2xl object-cover" />
                <div>
                  <h2 className="font-display text-base font-bold tracking-[-0.03em] text-main">{plant.name}</h2>
                  <p className="text-[10px] italic text-muted">{plant.species} · {plant.room}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center sm:text-right">
                  <p className="font-display text-lg font-extrabold tracking-[-0.04em] text-main">{latest?.heightCm ?? '—'}<span className="text-[10px] font-semibold text-muted">cm</span></p>
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-muted">current height</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="font-display text-lg font-extrabold tracking-[-0.04em] text-emerald-700 dark:text-emerald-300">+{Math.max(0, totalGrowth)}<span className="text-[10px] font-semibold text-muted">cm</span></p>
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-muted">total growth</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="font-display text-lg font-extrabold tracking-[-0.04em] text-main">{entries.length}</p>
                  <p className="text-[8px] font-semibold uppercase tracking-wide text-muted">entries</p>
                </div>
              </div>
            </div>

            {chartData.length > 1 ? (
              <div className="h-[230px] p-3 sm:p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="var(--emerald)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} unit="cm" width={52} />
                    <Tooltip formatter={(value: any) => [`${value} cm`, 'Height']} />
                    <Area type="monotone" dataKey="height" stroke="var(--emerald)" strokeWidth={2.5} fill="url(#growthFill)" dot={{ r: 3, fill: 'var(--emerald)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <Ruler className="mx-auto h-6 w-6 text-muted" />
                <p className="mt-2 text-[11px] font-semibold text-main">Add two entries to see a growth curve</p>
                <p className="text-[9.5px] text-muted">Height measurements appear here as a chart.</p>
              </div>
            )}

            <div className="grid grid-cols-3 divide-x divide-[color:var(--line)] border-t border-line bg-surface-2">
              {[
                { label: 'Tracking since', value: first ? formatDate(first.date, { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                { label: 'Days tracked', value: `${daysTracked} days` },
                { label: 'Avg. growth', value: daysTracked ? `${(Math.max(0, totalGrowth) / Math.max(1, daysTracked / 30)).toFixed(1)} cm/mo` : '—' },
              ].map((stat) => (
                <div key={stat.label} className="p-3 text-center">
                  <p className="text-[10px] font-bold text-main">{stat.value}</p>
                  <p className="text-[8px] uppercase tracking-wide text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {entries.length === 0 ? (
            <EmptyState
              icon={Camera}
              title={`No growth entries for ${plant.name} yet`}
              description="Add a photo, height and a short note to start the timeline."
              action={<button type="button" onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add first entry</button>}
            />
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <article key={entry.id} className="panel overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-52 sm:shrink-0">
                      <img src={entry.image} alt={`${plant.name} on ${formatDate(entry.date)}`} className="h-44 w-full object-cover sm:h-full" />
                      <span className="absolute left-2.5 top-2.5 chip bg-forest-950/60 text-white backdrop-blur">{index === 0 ? 'Latest' : `Entry ${entries.length - index}`}</span>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="chip-green"><TrendingUp className="h-2.5 w-2.5" /> {entry.heightCm} cm</span>
                        <span className="chip-neutral"><CalendarDays className="h-2.5 w-2.5" /> {formatDate(entry.date)}</span>
                        {index < entries.length - 1 && (
                          <span className="chip-blue">+{Math.max(0, entry.heightCm - entries[index + 1].heightCm)} cm since previous</span>
                        )}
                      </div>
                      <p className="mt-2.5 text-[12px] leading-5 text-soft">{entry.note}</p>
                      <div className="mt-3 flex items-center gap-2 border-t border-line pt-2.5 text-[9px] text-muted">
                        <Leaf className="h-3 w-3" />
                        {plant.species} · {plant.potSize}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main">
              <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> Milestones
            </h2>
            <div className="mt-3 space-y-3">
              {[
                { label: 'First entry', done: entries.length > 0, detail: first ? formatDate(first.date) : 'Not yet' },
                { label: 'Reached 50 cm', done: entries.some((entry) => entry.heightCm >= 50), detail: latest ? `${latest.heightCm} cm now` : '—' },
                { label: 'Three check-ins', done: entries.length >= 3, detail: `${entries.length} of 3 entries` },
                { label: 'Six months tracked', done: daysTracked >= 180, detail: `${daysTracked} days` },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-bold', item.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-surface-2 text-muted')}>
                    {item.done ? '✓' : '·'}
                  </span>
                  <div>
                    <p className="text-[10.5px] font-semibold text-main">{item.label}</p>
                    <p className="text-[9px] text-muted">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-4">
            <h2 className="font-display text-sm font-bold text-main">Photo tips</h2>
            <ul className="mt-2.5 space-y-2">
              {[
                'Use the same angle and distance each time.',
                'Include a ruler or a known object for scale.',
                'Shoot in soft daylight, not direct sun.',
                'Note new leaves, fenestrations or flowers.',
              ].map((tip) => (
                <li key={tip} className="flex gap-2 text-[10px] leading-4 text-soft">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[10px] leading-5 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
            Growth photos are demo data stored in your browser. They are not analysed automatically, and height is entered by you.
          </div>
        </aside>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-5">
          <button type="button" aria-label="Close" onClick={() => setModalOpen(false)} className="absolute inset-0 bg-[#07150f]/55 backdrop-blur-sm" />
          <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 shadow-float animate-fadeUp sm:rounded-3xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-main">Add growth entry</h2>
                <p className="mt-0.5 text-[10.5px] text-muted">For {plant.name} · {plant.species}</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="icon-btn h-8 w-8 rounded-lg" aria-label="Close">×</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Photo <span className="font-normal text-muted">(optional)</span></label>
                {form.image ? (
                  <div className="relative overflow-hidden rounded-2xl border border-line">
                    <img src={form.image} alt="Growth entry preview" className="aspect-[16/9] w-full object-cover" />
                    <button type="button" onClick={() => setForm({ ...form, image: '' })} className="absolute right-2 top-2 rounded-lg bg-forest-950/60 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur">Remove</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-surface-2 px-4 py-7 text-center transition hover:border-emerald-400">
                    <UploadCloud className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
                    <span className="mt-2 text-[10.5px] font-semibold text-main">Upload a photo</span>
                    <span className="text-[9px] text-muted">JPG or PNG · up to 4 MB</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => readFile(event.target.files?.[0])} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="growth-date">Date</label>
                  <input id="growth-date" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="growth-height">Height (cm)</label>
                  <input id="growth-height" type="number" min={1} value={form.heightCm} onChange={(event) => setForm({ ...form, heightCm: event.target.value })} placeholder="e.g. 68" className="input" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="growth-note">What changed?</label>
                <textarea id="growth-note" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className="textarea !min-h-[90px]" placeholder="New leaf, taller stem, repotted, moved to a brighter spot…" />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={submit} className="btn-primary"><ImagePlus className="h-4 w-4" /> Save entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
