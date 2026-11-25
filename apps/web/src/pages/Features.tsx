import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  CalendarDays,
  CloudOff,
  CloudSun,
  Droplets,
  Gauge,
  Globe2,
  Hand,
  HeartPulse,
  History,
  Hourglass,
  Images,
  Languages,
  Layers,
  LockKeyhole,
  Mic,
  MonitorSmartphone,
  Moon,
  RadioTower,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sprout,
  Stethoscope,
  TimerReset,
  Users,
  Waves,
  Wifi,
} from 'lucide-react'
import { CTASection, SectionHead } from '../components/marketing'
import { StatusDot } from '../components/ui'

const coreFeatures = [
  { icon: Gauge, title: 'Live soil moisture', text: 'A calibrated moisture percentage with Dry, Moderate and Moist context.', tag: 'Monitoring' },
  { icon: Droplets, title: 'Automatic watering', text: 'Pulses the pump when moisture falls below your threshold.', tag: 'Automation' },
  { icon: Hand, title: 'Manual watering', text: 'A confirmation flow with a safe duration selector and live countdown.', tag: 'Control' },
  { icon: SlidersHorizontal, title: 'Adjustable threshold', text: 'Set a per-plant moisture trigger instead of a fixed schedule.', tag: 'Settings' },
  { icon: Waves, title: 'Water-level monitoring', text: 'Reservoir percentage, low-water warning and empty-state protection.', tag: 'Safety' },
  { icon: ShieldCheck, title: 'Pump protection', text: 'No dry runs, no indefinite pumping, and a clear safety lock state.', tag: 'Safety' },
  { icon: TimerReset, title: 'Maximum runtime', text: 'Every watering is capped by a configurable hardware-safe limit.', tag: 'Safety' },
  { icon: Hourglass, title: 'Cooldown between cycles', text: 'Prevents back-to-back watering and gives the soil time to equalise.', tag: 'Safety' },
  { icon: LockKeyhole, title: 'Low-water lockout', text: 'The pump is blocked when the reservoir is too low to run safely.', tag: 'Safety' },
  { icon: Activity, title: 'Sensor fault detection', text: 'Out-of-range readings and dropped sensors are surfaced, not hidden.', tag: 'Diagnostics' },
  { icon: RadioTower, title: 'Live device status', text: 'Online/offline, Wi-Fi signal, sensor health and last communication.', tag: 'Monitoring' },
  { icon: Wifi, title: 'Wireless dashboard', text: 'A responsive PWA mirrors telemetry from the ESP32 over your network.', tag: 'Connectivity' },
  { icon: MonitorSmartphone, title: 'OLED mirror', text: 'A visual copy of the physical display: moisture, pump, water and status.', tag: 'Device' },
  { icon: Bell, title: 'Watering notifications', text: 'Completion, low moisture, low reservoir and device alerts.', tag: 'Alerts' },
  { icon: History, title: 'Watering history', text: 'Cycles, duration, mode, status and estimated water use per event.', tag: 'Records' },
  { icon: Sprout, title: 'Multiple plants', text: 'A separate care profile for every plant, room and pot.', tag: 'Garden' },
  { icon: Layers, title: 'Sensor and pump zones', text: 'The data model supports shared pumps and multiple sensor zones.', tag: 'Scale' },
]

const advancedFeatures = [
  {
    icon: Bot,
    title: 'AI Plant Care Assistant',
    text: 'Ask about yellow leaves, watering, light, pests and nutrients. Chat history is saved in the browser.',
    status: 'Demo assistant',
    tone: 'green',
  },
  {
    icon: Sparkles,
    title: 'AI watering recommendations',
    text: 'Threshold and duration suggestions based on species, moisture history, pot and season.',
    status: 'Demo logic',
    tone: 'green',
  },
  {
    icon: ScanLine,
    title: 'Plant identification',
    text: 'Upload a photo for an illustrative species match and care profile.',
    status: 'AI API required',
    tone: 'amber',
  },
  {
    icon: CloudSun,
    title: 'Weather-aware watering',
    text: 'Temperature, humidity and rain context can suggest delaying a cycle.',
    status: 'API-ready preview',
    tone: 'amber',
  },
  {
    icon: Stethoscope,
    title: 'Plant health diagnosis',
    text: 'Symptom triage with clear language and next-step checks. Never a guaranteed diagnosis.',
    status: 'Demo guidance',
    tone: 'green',
  },
  {
    icon: Images,
    title: 'Growth photo timeline',
    text: 'Add dated photos, notes and heights, then compare early and recent growth.',
    status: 'Working in demo',
    tone: 'green',
  },
  {
    icon: CalendarDays,
    title: 'Plant care calendar',
    text: 'Watering, feeding, pruning, repotting and seasonal tasks in a monthly view.',
    status: 'Working in demo',
    tone: 'green',
  },
  {
    icon: Droplets,
    title: 'Water usage tracker',
    text: 'Estimated litres per cycle, plant and period. Actual flow needs extra hardware.',
    status: 'Estimated',
    tone: 'amber',
  },
  {
    icon: HeartPulse,
    title: 'Pump health monitoring',
    text: 'Runtime totals, cycle counts and unusual-activity warnings.',
    status: 'Demo telemetry',
    tone: 'green',
  },
  {
    icon: Users,
    title: 'Family access and roles',
    text: 'Owner, Caregiver and Viewer access with a clear permission matrix.',
    status: 'UI + local roles',
    tone: 'green',
  },
  {
    icon: Mic,
    title: 'Voice control',
    text: 'A prepared Google Assistant / Alexa command surface with auth and safety validation.',
    status: 'Integration preview',
    tone: 'blue',
  },
  {
    icon: CloudOff,
    title: 'Offline automatic watering',
    text: 'Threshold, runtime and safety continue on the ESP32 when Wi-Fi drops.',
    status: 'Hardware feature',
    tone: 'green',
  },
  {
    icon: Languages,
    title: 'Multi-language support',
    text: 'English, Sinhala and Tamil navigation with an extensible dictionary.',
    status: 'Working in demo',
    tone: 'green',
  },
  {
    icon: Moon,
    title: 'Dark mode',
    text: 'A full dark theme that respects the system and is remembered locally.',
    status: 'Working in demo',
    tone: 'green',
  },
  {
    icon: Smartphone,
    title: 'Progressive Web App',
    text: 'Installable app shell, manifest and offline cache.',
    status: 'Working in demo',
    tone: 'green',
  },
]

const statusTone: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  blue: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
}

const safetyFeatures = [
  { icon: TimerReset, title: 'Maximum pump runtime', text: 'The relay is forced off when the configured limit is reached.' },
  { icon: Hourglass, title: 'Cooldown enforcement', text: 'A configurable pause blocks manual and automatic cycles.' },
  { icon: Waves, title: 'Low-water lockout', text: 'No pump activation below the reservoir safety line.' },
  { icon: LockKeyhole, title: 'Emergency shutdown', text: 'A single control immediately disables watering until re-enabled.' },
  { icon: Activity, title: 'Daily cycle cap', text: 'Limits how many times the pump may run in 24 hours.' },
  { icon: ShieldCheck, title: 'Fail-safe sensor behaviour', text: 'When readings are invalid, the system defaults to no watering.' },
]

export default function FeaturesPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F1F7EC] via-[#F7F9F4] to-[#EAF3E4] dark:from-[#0C2118] dark:via-[#081711] dark:to-[#0F251B]" />
        <div className="container-wrap relative py-14 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow"><Sparkles className="h-3 w-3" /> Capabilities, clearly labelled</span>
            <h1 className="mt-5 font-display text-[40px] font-extrabold leading-[1.03] tracking-[-0.055em] text-main sm:text-[56px]">
              Serious plant care,<br /><span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">without the black box.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-soft sm:text-base sm:leading-8">
              Every feature below states what it does and how it is implemented. Core controls work in the interactive demo. Integrations requiring an external API, account or extra hardware are labelled as such.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2 text-[9px] font-semibold">
              <span className="chip-green"><StatusDot tone="green" /> Working in demo</span>
              <span className="chip-amber"><StatusDot tone="amber" /> API or setup needed</span>
              <span className="chip-blue"><StatusDot tone="blue" /> Integration preview</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wrap py-16 lg:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <SectionHead
            eyebrow="Core features"
            title={<>The essentials, <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">done properly.</span></>}
            lead="Seventeen connected capabilities covering monitoring, watering, protection, history and device management."
          />
          <span className="chip-neutral shrink-0"><StatusDot tone="green" /> Interactive demo</span>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coreFeatures.map((feature, index) => (
            <article key={feature.title} className="card-hover group rounded-2xl border border-line bg-surface p-4 shadow-card">
              <div className="flex items-start justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-forest-900 group-hover:text-lime-300 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <feature.icon className="h-4 w-4" />
                </span>
                <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-muted/40">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <h3 className="mt-3.5 text-[12px] font-bold text-main">{feature.title}</h3>
              <p className="mt-1.5 text-[10.5px] leading-5 text-muted">{feature.text}</p>
              <span className="mt-3 inline-flex rounded-md bg-surface-2 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-muted">{feature.tag}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-forest-950 py-16 text-white lg:py-24">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-[0.06]" />
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="container-wrap relative">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
            <div>
              <span className="eyebrow-dark"><ShieldCheck className="h-3 w-3" /> Safety spotlight</span>
              <h2 className="mt-5 font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-4xl">
                The pump should never be the smartest thing in the room.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/75">
                PlantCare AI treats hardware protection as a core feature. Safety checks run before, during and after every watering — and they stay active when the internet does not.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-lime-300 text-forest-950"><ShieldCheck className="h-4 w-4" /></span>
                  <div>
                    <p className="text-[11px] font-bold">Local safety, always on</p>
                    <p className="text-[9px] text-white/70">ESP32 decision layer · no cloud dependency</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {['Runtime cap', 'Cooldown', 'Low-water lockout', 'Cycle limit'].map((item) => (
                    <span key={item} className="rounded-lg bg-white/[0.06] px-2.5 py-2 text-[9px] font-medium text-white/65">✓ {item}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {safetyFeatures.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <feature.icon className="h-4 w-4 text-lime-300" />
                  <p className="mt-3 text-[11px] font-bold text-white/90">{feature.title}</p>
                  <p className="mt-1 text-[10px] leading-5 text-white/70">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-wrap py-16 lg:py-24">
        <SectionHead
          align="center"
          eyebrow="Advanced capabilities"
          title={<>Where plant care <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">gets more intelligent.</span></>}
          lead="Some of these are fully interactive in the demo. Others are clearly marked because they require an AI key, weather API, voice integration or additional flow hardware."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {advancedFeatures.map((feature) => (
            <article key={feature.title} className="card-hover flex flex-col rounded-2xl border border-line bg-surface p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-2 text-emerald-700 dark:text-emerald-300"><feature.icon className="h-4 w-4" /></span>
                <span className={`rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] ${statusTone[feature.tone]}`}>{feature.status}</span>
              </div>
              <h3 className="mt-3.5 text-[12px] font-bold text-main">{feature.title}</h3>
              <p className="mt-1.5 flex-1 text-[10.5px] leading-5 text-muted">{feature.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-line bg-surface-2 p-4 text-[10px] leading-5 text-muted sm:flex-row sm:items-center">
          <span className="inline-flex items-start gap-2">
            <Globe2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-300" />
            Integrations are presented as a product roadmap, not as active third-party connections in this demo.
          </span>
          <Link to="/solution" className="btn-secondary !px-3 !py-2 !text-[10px]">See what is built-in <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </section>

      <CTASection />
    </div>
  )
}
