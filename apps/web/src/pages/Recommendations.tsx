import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock3,
  Droplets,
  Gauge,
  Leaf,
  ShieldCheck,
  Sparkles,
  Sprout,
  ThumbsDown,
  ThumbsUp,
  Timer,
  TrendingUp,
  Waves,
  X,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn, formatDate, moistureStatus } from '../lib/utils'
import { EmptyState, InfoBanner, PageHeader, ProgressRing, Tabs } from '../components/ui'

type Filter = 'pending' | 'accepted' | 'rejected' | 'all'

const confidenceTone = (value: number) =>
  value >= 88 ? 'text-emerald-700 dark:text-emerald-300' : value >= 78 ? 'text-sky-700 dark:text-sky-300' : 'text-amber-700 dark:text-amber-300'

export default function RecommendationsPage() {
  const { state, decideRecommendation } = useApp()
  const [filter, setFilter] = useState<Filter>('pending')

  const plantById = useMemo(
    () => Object.fromEntries(state.plants.map((plant) => [plant.id, plant])),
    [state.plants],
  )

  const counts = useMemo(
    () => ({
      pending: state.recommendations.filter((item) => item.status === 'pending').length,
      accepted: state.recommendations.filter((item) => item.status === 'accepted').length,
      rejected: state.recommendations.filter((item) => item.status === 'rejected').length,
      all: state.recommendations.length,
    }),
    [state.recommendations],
  )

  const visible = useMemo(() => {
    const list = filter === 'all' ? state.recommendations : state.recommendations.filter((item) => item.status === filter)
    return [...list].sort((a, b) => b.confidence - a.confidence)
  }, [state.recommendations, filter])

  const avgConfidence = state.recommendations.length
    ? Math.round(state.recommendations.reduce((sum, item) => sum + item.confidence, 0) / state.recommendations.length)
    : 0

  return (
    <div>
      <PageHeader
        eyebrow="Plant intelligence"
        title="AI recommendations"
        subtitle="Flora studies your live readings, pot size, soil mix and watering history — then proposes a safer care plan. Nothing changes until you approve it."
        icon={Sparkles}
        actions={
          <>
            <Link to="/assistant" className="btn-secondary">
              <Sparkles className="h-3.5 w-3.5" /> Ask Flora
            </Link>
            <Link to="/settings" className="btn-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Safety limits
            </Link>
          </>
        }
      />

      <div className="mb-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Awaiting review', value: counts.pending, note: 'require your approval', icon: Sparkles, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
          { label: 'Applied plans', value: counts.accepted, note: 'within safety limits', icon: BadgeCheck, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
          { label: 'Average confidence', value: `${avgConfidence}%`, note: 'demo model estimate', icon: Gauge, tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300' },
          { label: 'Plants covered', value: `${new Set(state.recommendations.map((item) => item.plantId)).size}/${state.plants.length}`, note: 'profiles with a proposal', icon: Sprout, tone: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300' },
        ].map((stat) => (
          <div key={stat.label} className="panel flex items-center gap-3 p-4">
            <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', stat.tone)}>
              <stat.icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="font-display text-xl font-bold tracking-[-0.04em] text-main">{stat.value}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
              <p className="text-[8px] text-muted/70">{stat.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'pending', label: 'Pending', count: counts.pending },
            { value: 'accepted', label: 'Accepted', count: counts.accepted },
            { value: 'rejected', label: 'Dismissed', count: counts.rejected },
            { value: 'all', label: 'All', count: counts.all },
          ]}
        />
        <p className="text-[10px] text-muted">
          Demo AI · estimates only · never bypasses hardware limits
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {visible.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Nothing here yet"
              description="When your sensors collect more readings, Flora will propose thresholds, watering pulses and frequencies here."
              action={<button type="button" onClick={() => setFilter('all')} className="btn-secondary">View all recommendations</button>}
            />
          ) : (
            visible.map((recommendation) => {
              const plant = plantById[recommendation.plantId]
              if (!plant) return null
              const currentStatus = moistureStatus(plant.moisture, plant.threshold, plant.maxMoisture)
              const pending = recommendation.status === 'pending'
              return (
                <article key={recommendation.id} className="panel overflow-hidden">
                  <div className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex items-center gap-3">
                      <img src={plant.image} alt={`${plant.name}, ${plant.species}`} className="h-12 w-12 rounded-2xl object-cover" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-base font-bold tracking-[-0.03em] text-main">{plant.name}</h2>
                          <span
                            className={cn(
                              'chip',
                              recommendation.status === 'accepted'
                                ? 'chip-green'
                                : recommendation.status === 'rejected'
                                  ? 'chip-neutral'
                                  : 'chip-amber',
                            )}
                          >
                            {recommendation.status === 'accepted' ? <Check className="h-3 w-3" /> : recommendation.status === 'rejected' ? <X className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                            {recommendation.status === 'accepted' ? 'Applied' : recommendation.status === 'rejected' ? 'Dismissed' : 'Pending review'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted">{plant.species} · {plant.room} · {plant.potSize}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:justify-end">
                      <div className="text-right">
                        <p className={cn('font-display text-lg font-extrabold tracking-[-0.04em]', confidenceTone(recommendation.confidence))}>
                          {recommendation.confidence}%
                        </p>
                        <p className="text-[8px] font-semibold uppercase tracking-wide text-muted">confidence</p>
                      </div>
                      <ProgressRing value={recommendation.confidence} size={46} stroke={5} color="var(--emerald)">
                        <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                      </ProgressRing>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      <div className="panel-soft p-3">
                        <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-muted"><Droplets className="h-3 w-3" /> Watering threshold</p>
                        <p className="mt-1.5 font-display text-lg font-bold text-main">{recommendation.threshold}%</p>
                        <p className="text-[9px] text-muted">current {plant.threshold}% · range {plant.minMoisture}–{plant.maxMoisture}%</p>
                      </div>
                      <div className="panel-soft p-3">
                        <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-muted"><Timer className="h-3 w-3" /> Pulse duration</p>
                        <p className="mt-1.5 font-display text-lg font-bold text-main">{recommendation.duration}s</p>
                        <p className="text-[9px] text-muted">capped at {state.settings.maxRuntime}s by hardware</p>
                      </div>
                      <div className="panel-soft p-3">
                        <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-muted"><TrendingUp className="h-3 w-3" /> Suggested frequency</p>
                        <p className="mt-1.5 font-display text-lg font-bold text-main">{recommendation.frequency}</p>
                        <p className="text-[9px] text-muted">sensor-triggered, not calendar-locked</p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl border border-line bg-surface-2 p-3.5">
                      <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-muted"><Leaf className="h-3 w-3" /> Why Flora suggests this</p>
                      <p className="text-[11.5px] leading-5 text-soft">{recommendation.rationale}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] text-muted">
                      <span className="chip-neutral"><Waves className="h-2.5 w-2.5" /> Live reading {plant.moisture}%</span>
                      <span className={cn('chip', currentStatus.tone === 'amber' ? 'chip-amber' : 'chip-green')}>{currentStatus.label}</span>
                      <span className="chip-neutral"><Clock3 className="h-2.5 w-2.5" /> Generated {formatDate(recommendation.createdAt)}</span>
                      <span className="chip-neutral">Demo model · not a guarantee</span>
                    </div>

                    {pending ? (
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                        <button
                          type="button"
                          onClick={() => decideRecommendation(recommendation.id, 'accepted')}
                          className="btn-primary"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" /> Apply within safety limits
                        </button>
                        <button
                          type="button"
                          onClick={() => decideRecommendation(recommendation.id, 'rejected')}
                          className="btn-secondary"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" /> Dismiss
                        </button>
                        <Link to={`/plants/${plant.id}`} className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:gap-1.5 dark:text-emerald-300">
                          Review plant <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-[10px] text-muted">
                        <span className={cn('chip', recommendation.status === 'accepted' ? 'chip-green' : 'chip-neutral')}>
                          {recommendation.status === 'accepted' ? <BadgeCheck className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {recommendation.status === 'accepted' ? 'Applied to plant profile' : 'Your existing settings were kept'}
                        </span>
                        <Link to={`/plants/${plant.id}`} className="ml-auto inline-flex items-center gap-1 font-bold text-emerald-700 hover:gap-1.5 dark:text-emerald-300">
                          View plant <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </article>
              )
            })
          )}
        </div>

        <aside className="space-y-4">
          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main">
              <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> Safety limits always win
            </h2>
            <p className="mt-1.5 text-[10.5px] leading-5 text-muted">
              Applying a recommendation can only change care targets. It cannot exceed the hardware envelope below.
            </p>
            <div className="mt-3 space-y-2">
              {[
                { label: 'Max pump runtime', value: `${state.settings.maxRuntime}s`, icon: Timer },
                { label: 'Cooldown after watering', value: `${state.settings.cooldownMinutes} min`, icon: Clock3 },
                { label: 'Max daily cycles', value: `${state.settings.maxDailyCycles}`, icon: Gauge },
                { label: 'Low-water lockout', value: state.settings.lowWaterLockout ? 'Armed at 12%' : 'Disabled', icon: Droplets },
                { label: 'Emergency shutdown', value: state.settings.emergencyShutdown ? 'Active' : 'Ready', icon: ShieldCheck },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2">
                  <span className="flex items-center gap-2 text-[10px] text-soft"><item.icon className="h-3 w-3 text-muted" /> {item.label}</span>
                  <span className="text-[10px] font-bold text-main">{item.value}</span>
                </div>
              ))}
            </div>
            <Link
              to="/settings"
              className="mt-3 block w-full text-center text-[9px] font-semibold text-muted transition hover:text-main"
            >
              Manage in Settings →
            </Link>
          </div>

          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main">
              <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> How this demo works
            </h2>
            <ol className="mt-3 space-y-3">
              {[
                'Reads the demo sensor history, pot size, soil mix and plant species.',
                'Estimates a safer moisture band and a short watering pulse.',
                'Explains the reasoning and shows a confidence score.',
                'Waits for your approval before touching plant settings.',
              ].map((step, index) => (
                <li key={step} className="flex gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{index + 1}</span>
                  <span className="text-[10.5px] leading-5 text-soft">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <InfoBanner icon={Sparkles} title="Not a real AI model" tone="warning">
            Recommendations are generated by local demo rules, not a trained model or live cloud service. Confidence scores are illustrative. Always check the soil yourself before changing a routine.
          </InfoBanner>
        </aside>
      </div>
    </div>
  )
}
