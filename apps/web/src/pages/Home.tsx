import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock3,
  CloudRain,
  Cpu,
  Droplets,
  Gauge,
  HeartHandshake,
  Leaf,
  LineChart,
  Play,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sprout,
  Sun,
  Timer,
  TrendingDown,
  Wifi,
  Zap,
} from 'lucide-react'
import {
  CapabilityPill,
  CTASection,
  DemoWaterWidget,
  HeroVisual,
  MetricStrip,
  SectionHead,
  TrustRow,
} from '../components/marketing'
import { ProgressRing, StatusDot } from '../components/ui'

const benefits = [
  {
    icon: Gauge,
    title: '24/7 plant monitoring',
    description: 'Soil moisture, reservoir and device health stay visible in one calm, clear dashboard.',
    tone: 'emerald',
  },
  {
    icon: Droplets,
    title: 'Automatic watering',
    description: 'The ESP32 waters only when the measured soil moisture falls below your plant-specific threshold.',
    tone: 'sky',
  },
  {
    icon: ShieldCheck,
    title: 'Overwatering protection',
    description: 'Maximum moisture bands, short watering pulses and cooldowns prevent soggy roots.',
    tone: 'forest',
  },
  {
    icon: Timer,
    title: 'Pump damage prevention',
    description: 'Runtime limits, dry-run lockout and low-water cut-off keep the pump safe.',
    tone: 'amber',
  },
  {
    icon: Smartphone,
    title: 'Remote monitoring',
    description: 'Check every plant, review history and water manually from anywhere with a connection.',
    tone: 'lime',
  },
  {
    icon: Sparkles,
    title: 'Plant-care intelligence',
    description: 'Recommendations explain thresholds and routines using species, readings and context.',
    tone: 'violet',
  },
]

const toneClasses: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  sky: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
  forest: 'bg-forest-50 text-forest-800 dark:bg-white/5 dark:text-lime-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  lime: 'bg-lime-100 text-forest-800 dark:bg-lime-300/10 dark:text-lime-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
}

const steps = [
  { number: '01', title: 'Sense', text: 'A calibrated soil moisture sensor reads the root zone every few seconds.', icon: Gauge },
  { number: '02', title: 'Decide', text: 'The ESP32 compares the reading with your threshold and every safety condition.', icon: Cpu },
  { number: '03', title: 'Water', text: 'A relay pulses the pump for a limited, plant-specific duration.', icon: Droplets },
  { number: '04', title: 'Learn', text: 'Readings, cycles and alerts sync to your dashboard when connectivity is available.', icon: LineChart },
]

const tech = [
  { name: 'ESP32', detail: 'Local decision engine', icon: Cpu },
  { name: 'Capacitive sensor', detail: 'Soil moisture telemetry', icon: Gauge },
  { name: 'Float / ultrasonic', detail: 'Reservoir level', icon: Droplets },
  { name: 'Relay + DC pump', detail: 'Safe watering pulse', icon: Zap },
  { name: 'OLED display', detail: 'Offline status mirror', icon: Smartphone },
  { name: 'MQTT / WebSocket', detail: 'Near-real-time sync', icon: Wifi },
]

const testimonials = [
  {
    quote: 'I stopped guessing with my Monstera. The dashboard shows exactly when it is drying out, and the pump does the rest while I am at work.',
    name: 'Amaya R.',
    role: 'Beta tester · Colombo',
    plant: 'Monstera parent',
    image: '/plants/monstera.jpg',
  },
  {
    quote: 'The safety limits sold me. It refuses to water when the reservoir is low, and the cooldown means I cannot accidentally flood a pot.',
    name: 'Daniel K.',
    role: 'Beta tester · Melbourne',
    plant: '12 indoor plants',
    image: '/plants/snake.jpg',
  },
  {
    quote: 'My aloe needed the opposite care from my peace lily. Having a separate threshold for each zone made plant care feel genuinely personal.',
    name: 'Rashmi S.',
    role: 'Beta tester · Kandy',
    plant: 'Mixed collection',
    image: '/plants/aloe.jpg',
  },
]

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-gradient-to-b from-[#EDF5E8] via-[#F4F8F0] to-transparent dark:from-[#0C2118] dark:via-[#0A1B14] dark:to-transparent" />
        <div className="pointer-events-none absolute left-0 top-24 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-lime-300/20 blur-3xl" />
        <div className="container-wrap relative grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="relative">
            <div className="reveal inline-flex items-center gap-2 rounded-full border border-forest-200/70 bg-white/70 py-1.5 pl-1.5 pr-3 text-[10px] font-bold text-forest-800 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-lime-200">
              <span className="rounded-full bg-forest-900 px-2 py-1 text-[9px] uppercase tracking-[0.13em] text-lime-300 dark:bg-lime-300 dark:text-forest-950">IoT + AI</span>
              Built for real plants, real pots, real life
            </div>
            <h1 className="reveal reveal-delay-1 mt-6 font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.055em] text-main sm:text-[58px] lg:text-[66px]">
              Smart monitoring.
              <br />
              <span className="font-serif font-normal italic tracking-[-0.03em] text-emerald-700 dark:text-lime-300">Healthier plants.</span>
            </h1>
            <p className="reveal reveal-delay-2 mt-5 max-w-xl text-[15px] leading-7 text-soft sm:text-[17px] sm:leading-8">
              Your plants deserve intelligent care. Monitor soil moisture, automate watering, prevent overwatering, and manage your plants from anywhere.
            </p>
            <div className="reveal reveal-delay-2 mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/login?demo=1" className="btn-primary !px-6 !py-3.5 text-[15px]">
                Explore dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/signup" className="btn-secondary !px-6 !py-3.5 text-[15px]">
                <Sprout className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                Get started
              </Link>
            </div>
            <div className="reveal reveal-delay-3 mt-8">
              <TrustRow />
            </div>
            <div className="mt-8 hidden max-w-xl flex-wrap gap-2 sm:flex">
              <CapabilityPill icon={ShieldCheck} label="Pump safety" />
              <CapabilityPill icon={Wifi} label="ESP32 ready" />
              <CapabilityPill icon={CloudRain} label="Weather-aware" />
              <CapabilityPill icon={Bot} label="AI care guidance" />
            </div>
          </div>
          <div className="reveal reveal-delay-2 relative">
            <HeroVisual />
          </div>
        </div>
        <div className="container-wrap relative pb-12">
          <div className="flex flex-col items-center gap-6 border-y border-line py-7 sm:flex-row sm:justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">A practical stack for thoughtful growing</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 grayscale">
              {['ESP32', 'Capacitive sensing', 'MQTT', 'React', 'Open graph API'].map((item) => (
                <span key={item} className="font-display text-xs font-bold tracking-[-0.02em] text-soft">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-wrap py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[.95fr_1.05fr] lg:gap-20">
          <div className="relative order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-[28px] border border-line">
              <img src="/plants/hero7.jpg" alt="Plant caregiver tending to a collection of healthy indoor plants" className="aspect-[4/5] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-forest-950/75 p-4 text-white backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-lime-300">Plant care, not plant anxiety</p>
                <p className="mt-1.5 text-sm font-medium leading-6">“A quick glance tells me who needs attention. The system handles the routine.”</p>
              </div>
            </div>
            <div className="absolute -right-4 top-8 w-40 rounded-2xl border border-line bg-surface p-3.5 shadow-float sm:-right-8">
              <div className="flex items-center gap-1.5">
                <StatusDot tone="green" pulse />
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-300">Hydration check</p>
              </div>
              <div className="mt-2 space-y-2">
                {[
                  { name: 'Moss', value: 64 },
                  { name: 'Sage', value: 38 },
                  { name: 'Lucky', value: 58 },
                ].map((plant) => (
                  <div key={plant.name}>
                    <div className="flex items-center justify-between text-[8px] text-muted"><span>{plant.name}</span><span>{plant.value}%</span></div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${plant.value}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -left-3 bottom-24 hidden rounded-xl border border-line bg-surface px-3 py-2 shadow-soft sm:block">
              <p className="text-[8px] text-muted">Overwatering blocked</p>
              <p className="mt-0.5 text-[10px] font-bold text-main">Safety limit active</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <SectionHead
              eyebrow="Why smart care"
              title={<>Plants can’t tell you when they’re <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">thirsty.</span> PlantCare AI can.</>}
              lead="Traditional plant care is a mix of guesswork, busy schedules and conflicting advice. PlantCare AI turns living conditions into a clear signal — then acts only when it is safe."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Clock3, title: 'Life gets busy', text: 'A plant can decline long before you notice a drooping leaf.' },
                { icon: TrendingDown, title: 'More plants die from overwatering', text: 'Good intentions plus poor drainage are a common combination.' },
                { icon: RefreshCw, title: 'Every plant is different', text: 'A Monstera, aloe and peace lily should not share one schedule.' },
                { icon: HeartHandshake, title: 'Care should feel calm', text: 'Clear readings and gentle automation replace constant worry.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-line bg-surface p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><item.icon className="h-4 w-4" /></span>
                  <p className="mt-3 text-xs font-bold text-main">{item.title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-muted">{item.text}</p>
                </div>
              ))}
            </div>
            <Link to="/problem" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 transition hover:gap-2.5 dark:text-emerald-300">
              Explore the problem <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-forest-950 py-16 text-white lg:py-24">
        <div className="pointer-events-none absolute left-1/4 top-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="container-wrap relative grid items-center gap-12 lg:grid-cols-[1fr_.95fr] lg:gap-20">
          <div>
            <SectionHead
              light
              eyebrow="A living dashboard"
              title={<>See what your plant feels, <span className="font-serif font-normal italic text-lime-300">in real time.</span></>}
              lead="Every card is grounded in a real sensor reading. Thresholds, pump protection and reservoir state are visible at a glance — no technical guesswork required."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Moisture with context', text: 'Dry, moderate or moist — not just a number.' },
                { title: 'Pump safety states', text: 'ON, OFF, cooling, locked or fault.' },
                { title: 'Reservoir awareness', text: 'Low-water lockout before the pump runs dry.' },
                { title: 'Honest device status', text: 'Last sync and offline state are always clear.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime-300" />
                  <div>
                    <p className="text-[11px] font-semibold text-white/85">{item.title}</p>
                    <p className="mt-0.5 text-[10px] leading-5 text-white/70">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/login?demo=1" className="btn-lime">
                Try the interactive demo <Play className="h-3.5 w-3.5" />
              </Link>
              <Link to="/how-it-works" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                How it works <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <DemoWaterWidget />
        </div>
      </section>

      <section className="container-wrap py-16 lg:py-24">
        <SectionHead
          align="center"
          eyebrow="Care that works quietly"
          title={<>Everything a plant needs. <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">Nothing it doesn’t.</span></>}
          lead="From the first dry day to a pump safety lock, PlantCare AI gives you the useful visibility without turning plant care into a second job."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div key={benefit.title} className="card-hover group rounded-3xl border border-line bg-surface p-5 shadow-card">
              <div className="flex items-start justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${toneClasses[benefit.tone]}`}>
                  <benefit.icon className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold text-muted/50">0{index + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-base font-bold tracking-[-0.025em] text-main">{benefit.title}</h3>
              <p className="mt-2 text-[12px] leading-6 text-muted">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-wrap pb-16 lg:pb-24">
        <div className="overflow-hidden rounded-[32px] border border-line bg-surface shadow-card">
          <div className="grid lg:grid-cols-[.7fr_1.3fr]">
            <div className="flex flex-col justify-center bg-[#EAF3E4] p-7 dark:bg-[#12281E] sm:p-10">
              <span className="eyebrow w-fit">
                <LineChart className="h-3 w-3" /> Demonstration data
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.045em] text-main sm:text-4xl">
                Small improvements add up.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                These sample figures show how a connected garden could look. Your live workspace uses simulated telemetry until a real ESP32 is paired.
              </p>
              <div className="mt-6">
                <MetricStrip />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-px bg-[color:var(--line)]">
              {[
                { value: '12,480', label: 'watering cycles', sub: 'across demo gardens', icon: Droplets },
                { value: '3,240', label: 'plants monitored', sub: 'sample workspace', icon: Leaf },
                { value: '18.6k L', label: 'water saved', sub: 'estimated demo total', icon: CloudRain },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col justify-center bg-surface p-5 text-center sm:p-8">
                  <stat.icon className="mx-auto h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                  <p className="mt-4 font-display text-2xl font-extrabold tracking-[-0.05em] text-main sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-semibold text-soft">{stat.label}</p>
                  <p className="mt-0.5 text-[9px] text-muted">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3 text-[9px] text-muted">
            <span>Sample metrics for presentation. Not a live user count.</span>
            <span className="inline-flex items-center gap-1"><StatusDot tone="amber" /> Demonstration data</span>
          </div>
        </div>
      </section>

      <section className="container-wrap pb-16 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative overflow-hidden rounded-[28px] border border-line bg-[#DDEBD5] p-7 dark:bg-[#152D22] sm:p-10">
            <div className="relative z-10 max-w-md">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-forest-800 dark:text-lime-300/80">The old way</span>
              <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-[-0.04em] text-main sm:text-3xl">Watering by memory is a coin toss.</h2>
              <div className="mt-6 space-y-3">
                {['“Did I water this on Tuesday or Wednesday?”', 'A fixed weekly schedule for five very different plants.', 'A full reservoir and a dry pot — or a flooded saucer.', 'Coming home to a plant that quietly gave up.'].map((text) => (
                  <div key={text} className="flex items-start gap-3 rounded-xl bg-white/45 px-3.5 py-3 text-[11px] leading-5 text-forest-900 dark:bg-white/[0.05] dark:text-white/65">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
            <Leaf className="absolute -bottom-10 -right-8 h-56 w-56 rotate-12 text-forest-900/5 dark:text-white/5" />
          </div>
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-7 dark:border-emerald-500/20 dark:bg-emerald-500/[0.06] sm:p-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">The PlantCare way</span>
            <h2 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-[-0.04em] text-main sm:text-3xl">Measured care, every single day.</h2>
            <div className="mt-6 space-y-3">
              {['Soil moisture is measured, not guessed.', 'Each plant has its own threshold and watering pulse.', 'The pump stops safely if the reservoir is low.', 'Your dashboard tells the truth, even when offline.'].map((text) => (
                <div key={text} className="flex items-start gap-3 rounded-xl bg-white/70 px-3.5 py-3 text-[11px] leading-5 text-forest-900 dark:bg-white/[0.07] dark:text-white/75">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-300" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#EEF5E9] py-16 dark:bg-[#0C1F17] lg:py-24">
        <div className="container-wrap">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHead
              eyebrow="How it works"
              title={<>Four moves. <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">One healthier plant.</span></>}
              lead="The intelligence lives at the edge. Even when your Wi-Fi disappears, the ESP32 continues to make safe, local decisions."
            />
            <Link to="/how-it-works" className="btn-secondary w-fit shrink-0">
              Full 9-step process <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="relative rounded-2xl border border-line bg-surface p-5 shadow-card">
                {index < steps.length - 1 && (
                  <div className="absolute -right-2.5 top-10 z-10 hidden h-5 w-5 items-center justify-center rounded-full border border-line bg-surface text-muted lg:grid">
                    <ArrowRight className="h-2.5 w-2.5" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-900 text-lime-300 dark:bg-lime-300 dark:text-forest-950"><step.icon className="h-4.5 w-4.5" /></span>
                  <span className="font-display text-xs font-bold text-muted/40">{step.number}</span>
                </div>
                <h3 className="mt-4 font-display text-sm font-bold text-main">{step.title}</h3>
                <p className="mt-1.5 text-[11px] leading-5 text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wrap py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHead
              eyebrow="Built on real hardware"
              title={<>A system you can <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">open, repair and trust.</span></>}
              lead="PlantCare AI is designed as a practical reference architecture: familiar components, clear wiring and safety decisions that happen on the device."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {['ESP32', 'Capacitive soil sensor', 'Water-level sensor', 'Relay module', 'DC pump', 'OLED', 'Wi-Fi'].map((tag) => (
                <span key={tag} className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[10px] font-semibold text-soft">{tag}</span>
              ))}
            </div>
            <Link to="/solution" className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:gap-2.5 dark:text-emerald-300">
              View system architecture <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tech.map((item) => (
              <div key={item.name} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-emerald-700 dark:text-emerald-300"><item.icon className="h-4.5 w-4.5" /></span>
                <div>
                  <p className="text-xs font-bold text-main">{item.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wrap pb-16 lg:pb-24">
        <SectionHead
          align="center"
          eyebrow="Sample beta feedback"
          title={<>Made for people who <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">care.</span></>}
          lead="Illustrative testimonials from our design research. Names and quotes are sample content."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className="flex flex-col rounded-3xl border border-line bg-surface p-5 shadow-card">
              <div className="flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, index) => <span key={index} className="text-sm">★</span>)}
              </div>
              <blockquote className="mt-4 flex-1 text-[12px] leading-6 text-soft">“{testimonial.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <img src={testimonial.image} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-main">{testimonial.name}</p>
                  <p className="text-[9px] text-muted">{testimonial.role} · {testimonial.plant}</p>
                </div>
                <span className="ml-auto rounded-full bg-surface-2 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-muted">Sample</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <CTASection />
    </div>
  )
}
