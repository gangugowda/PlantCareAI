import { Link } from 'react-router-dom'
import {
  AlarmClock,
  ArrowRight,
  CalendarX,
  Droplets,
  Gauge,
  HeartCrack,
  Leaf,
  Luggage,
  ShieldAlert,
  TimerOff,
  Waves,
} from 'lucide-react'
import { CTASection, SectionHead } from '../components/marketing'

const problems = [
  {
    icon: AlarmClock,
    title: 'Forgetting to water',
    text: 'A busy week turns into a dry root ball before the first drooping leaf appears. By then, the plant is already under stress.',
    label: 'Inconsistent routine',
  },
  {
    icon: Droplets,
    title: 'Overwatering and underwatering',
    text: 'Both look like “sad plant”. Without a moisture reading, it is hard to know which direction to correct.',
    label: 'Opposite mistakes',
  },
  {
    icon: CalendarX,
    title: 'Busy schedules',
    text: 'Work, study and travel push plant care to the bottom of the list. Fixed reminders rarely match what the soil actually needs.',
    label: 'No spare time',
  },
  {
    icon: Luggage,
    title: 'Travelling or away',
    text: 'A weekend away can become a week. Most houseplants cannot call a neighbour or ask for a smaller drink.',
    label: 'Away from home',
  },
  {
    icon: Leaf,
    title: 'Different plant needs',
    text: 'A snake plant and a peace lily should not share a watering day. Species, pot size and soil all change the requirement.',
    label: 'One-size fails',
  },
  {
    icon: Gauge,
    title: 'Manual soil checking',
    text: 'Finger tests are inconsistent and invasive. The surface can look dry while the root zone is still saturated.',
    label: 'Hard to measure',
  },
  {
    icon: TimerOff,
    title: 'Pump damage',
    text: 'A pump left running or asked to run dry can overheat, clog or fail. Good automation needs hard safety limits.',
    label: 'Equipment risk',
  },
  {
    icon: Waves,
    title: 'Wasting water',
    text: 'Overwatering wastes water and nutrients, creates runoff and can harm the plant — all while feeling like care.',
    label: 'Wasted resource',
  },
]

export default function ProblemPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#EDF5E7] via-[#F7F9F4] to-[#E7F1E0] dark:from-[#0C2118] dark:via-[#081711] dark:to-[#10281D]" />
        <div className="container-wrap relative grid gap-10 py-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-20">
          <div>
            <span className="eyebrow"><HeartCrack className="h-3 w-3" /> The everyday plant care problem</span>
            <h1 className="mt-5 max-w-2xl font-display text-[40px] font-extrabold leading-[1.03] tracking-[-0.055em] text-main sm:text-[54px]">
              Most plants don’t need more attention. They need <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">better timing.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-soft sm:text-base sm:leading-8">
              Plant care fails quietly. A missed watering, a well-meaning top-up, an empty reservoir — small errors compound until a healthy plant is suddenly in trouble.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/solution" className="btn-primary !px-5 !py-3">See how PlantCare solves it <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/features" className="btn-secondary !px-5 !py-3">Browse features</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-muted">
              <span className="inline-flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Overwatering is a leading houseplant risk</span>
              <span className="inline-flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5 text-sky-500" /> Every plant has its own moisture range</span>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[28px] border border-line shadow-float">
              <img src="/plants/garden.jpg" alt="Hands planting a small plant into fresh soil" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-line bg-surface p-4 shadow-float backdrop-blur sm:left-8 sm:right-8">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"><HeartCrack className="h-5 w-5" /></span>
                <div>
                  <p className="text-xs font-bold text-main">The gap is information</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-muted">Not love. Not effort. Just a reliable signal and a safe action.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wrap py-16 lg:py-24">
        <SectionHead
          align="center"
          eyebrow="Eight familiar frustrations"
          title={<>If any of these sound like your week, <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">you’re in the right place.</span></>}
          lead="These are the problems PlantCare AI was designed around — not abstract technology looking for a use."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem, index) => (
            <article key={problem.title} className="card-hover relative flex flex-col rounded-3xl border border-line bg-surface p-5 shadow-card">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <problem.icon className="h-5 w-5" />
                </span>
                <span className="font-display text-[11px] font-bold text-muted/35">0{index + 1}</span>
              </div>
              <h2 className="mt-5 font-display text-sm font-bold tracking-[-0.02em] text-main">{problem.title}</h2>
              <p className="mt-2 flex-1 text-[11px] leading-5 text-muted">{problem.text}</p>
              <span className="mt-4 w-fit rounded-full bg-surface-2 px-2.5 py-1 text-[9px] font-semibold text-muted">{problem.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#EEF5E9] py-16 dark:bg-[#0C1F17] lg:py-20">
        <div className="container-wrap grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <span className="eyebrow"><Droplets className="h-3 w-3" /> The hidden cost</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.045em] text-main sm:text-4xl">Every plant has a narrow comfort zone.</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Too dry, roots cannot absorb nutrients. Too wet, roots are deprived of oxygen. The useful window is often smaller than a calendar reminder assumes.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Underwatered', value: 'Crisp edges', note: 'Leaf tips dry, soil pulls away from the pot, new growth slows.', tone: 'border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/[0.07]' },
              { label: 'Balanced', value: 'Resilient', note: 'Even colour, firm stems, consistent new growth and healthy roots.', tone: 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/[0.07]' },
              { label: 'Overwatered', value: 'Suffocating', note: 'Yellow lower leaves, soggy soil, fungus gnats and root rot risk.', tone: 'border-sky-200 bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/[0.07]' },
            ].map((item) => (
              <div key={item.label} className={`rounded-2xl border p-5 ${item.tone}`}>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted">{item.label}</p>
                <p className="mt-2 font-display text-lg font-bold tracking-[-0.03em] text-main">{item.value}</p>
                <p className="mt-2 text-[10px] leading-5 text-soft">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wrap py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative order-2 overflow-hidden rounded-[28px] border border-line bg-surface p-6 lg:order-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">A week without care</p>
                <p className="mt-1 font-display text-xl font-bold text-main">Moisture drift</p>
              </div>
              <span className="chip-amber">Illustrative</span>
            </div>
            <div className="mt-8 grid h-48 grid-cols-7 items-end gap-2">
              {[68, 61, 54, 46, 38, 31, 24].map((value, index) => (
                <div key={index} className="flex h-full flex-col justify-end">
                  <div className="relative w-full overflow-hidden rounded-t-lg bg-surface-2">
                    <div className={`w-full rounded-t-lg ${value <= 32 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ height: `${value * 2.1}px` }} />
                  </div>
                  <p className="mt-1.5 text-center text-[8px] font-semibold text-muted">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-[10px] leading-5 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              A Monstera drops from comfortable to stressed in roughly five dry days. PlantCare intervenes at the configured threshold instead.
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionHead
              eyebrow="From friction to ease"
              title={<>The problem isn’t that you don’t care. <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">It’s everything else.</span></>}
              lead="PlantCare AI removes the repetitive decisions while keeping you informed. You stay in control; the system handles measurement, timing and the boring parts."
            />
            <div className="mt-6 space-y-4">
              {[
                { old: 'Check every plant by hand', next: 'One glance at live moisture, reservoir and pump state.' },
                { old: 'Guess a watering duration', next: 'A short, safe pulse matched to the plant and pot.' },
                { old: 'Remember to stop the pump', next: 'Hard runtime and cooldown limits protect the hardware.' },
                { old: 'Wonder whether it watered', next: 'A complete history with estimated water use.' },
              ].map((item) => (
                <div key={item.old} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <p className="text-[11px] leading-5 text-muted line-through decoration-red-300/70">{item.old}</p>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />
                  <p className="text-[11px] font-semibold leading-5 text-soft">{item.next}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  )
}
