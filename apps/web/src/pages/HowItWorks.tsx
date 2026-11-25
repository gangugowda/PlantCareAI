import { Link } from 'react-router-dom'
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  CloudOff,
  Cpu,
  Droplets,
  Gauge,
  LockKeyhole,
  MonitorSmartphone,
  Play,
  ShieldCheck,
  Timer,
  Waves,
  Wifi,
} from 'lucide-react'
import { CTASection, SectionHead } from '../components/marketing'
import { StatusDot } from '../components/ui'

const steps = [
  {
    number: '01',
    title: 'Measure the soil',
    text: 'A capacitive soil moisture sensor samples the root zone. The raw analog value is calibrated to a percentage, avoiding guesswork from the surface.',
    icon: Gauge,
    detail: 'Sensor reading → calibrated moisture %',
    tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  {
    number: '02',
    title: 'ESP32 receives the reading',
    text: 'The microcontroller reads the sensor, filters noisy samples and updates the current plant state locally.',
    icon: Cpu,
    detail: 'Local processing · no cloud needed',
    tone: 'bg-forest-50 text-forest-800 dark:bg-white/5 dark:text-lime-300',
  },
  {
    number: '03',
    title: 'Compare with the threshold',
    text: 'Each plant has its own minimum moisture threshold. The ESP32 asks: is this plant actually dry enough to need water?',
    icon: Waves,
    detail: 'Plant-specific threshold · e.g. 45%',
    tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
  },
  {
    number: '04',
    title: 'Run the safety checks',
    text: 'Before the relay moves, the system confirms reservoir level, max runtime, cooldown, daily cycle cap, sensor health and emergency shutdown.',
    icon: ShieldCheck,
    detail: '6 conditions · fail-safe if uncertain',
    tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  },
  {
    number: '05',
    title: 'Activate the relay',
    text: 'Only when every condition is safe does the ESP32 trigger the relay module, which isolates the low-voltage control from the pump circuit.',
    icon: LockKeyhole,
    detail: 'One safe control pulse',
    tone: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  },
  {
    number: '06',
    title: 'Water for a limited pulse',
    text: 'The pump runs for a short, configured duration — for example 12 seconds. The hard runtime limit is enforced independently of the website.',
    icon: Droplets,
    detail: 'Timer enforced on hardware',
    tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
  },
  {
    number: '07',
    title: 'Update the OLED',
    text: 'The physical display mirrors the essential state: plant name, moisture, pump status, water level and system health.',
    icon: MonitorSmartphone,
    detail: 'Local status · visible in person',
    tone: 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-200',
  },
  {
    number: '08',
    title: 'Sync over Wi-Fi',
    text: 'When a connection is available, readings, cycles and safety events travel to the dashboard through WebSocket or MQTT.',
    icon: Wifi,
    detail: 'Near-real-time dashboard',
    tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  {
    number: '09',
    title: 'Monitor and get notified',
    text: 'See live moisture, review history and receive alerts for low water, sensor faults or offline status. Manual watering stays available when safe.',
    icon: BellRing,
    detail: 'Clarity from anywhere',
    tone: 'bg-lime-100 text-forest-800 dark:bg-lime-300/10 dark:text-lime-300',
  },
]

export default function HowItWorksPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#EEF5E8] to-[#F7F9F4] dark:from-[#0C2118] dark:to-[#081711]" />
        <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-lime-300/20 blur-3xl" />
        <div className="container-wrap relative grid gap-10 py-14 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-20">
          <div>
            <span className="eyebrow"><Cpu className="h-3 w-3" /> From soil to screen</span>
            <h1 className="mt-5 max-w-2xl font-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.055em] text-main sm:text-[56px]">
              Nine steps. Less than a minute. <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">Every time.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-soft sm:text-base sm:leading-8">
              From the first sensor sample to the notification on your phone, here is exactly what happens — and where safety checks intervene.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#process" className="btn-primary">Follow the process <ArrowDown className="h-4 w-4" /></a>
              <Link to="/login?demo=1" className="btn-secondary"><Play className="h-3.5 w-3.5" /> Try the demo</Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl border border-line bg-surface p-5 shadow-float">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-forest-900 text-lime-300 dark:bg-lime-300 dark:text-forest-950"><Droplets className="h-4 w-4" /></span>
                  <div>
                    <p className="text-[10px] font-bold text-main">Watering decision</p>
                    <p className="text-[8px] text-muted">Moss · Monstera · 09:42</p>
                  </div>
                </div>
                <span className="chip-green"><StatusDot tone="green" /> Safe</span>
              </div>
              <div className="relative mt-4 space-y-0">
                {[
                  { label: 'Moisture', value: '38%', note: 'threshold 45%', pass: true },
                  { label: 'Reservoir', value: '68%', note: 'above 12%', pass: true },
                  { label: 'Cooldown', value: 'Ready', note: 'no recent pulse', pass: true },
                  { label: 'Runtime', value: '0 / 15s', note: 'within limit', pass: true },
                  { label: 'Sensor', value: 'Healthy', note: 'stable reading', pass: true },
                ].map((item, index) => (
                  <div key={item.label} className="relative flex items-center gap-3 pb-4 last:pb-0">
                    {index < 4 && <span className="absolute left-[11px] top-6 h-full w-px bg-line" />}
                    <span className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <span className="text-[8px] font-bold">✓</span>
                    </span>
                    <span className="flex flex-1 items-center justify-between gap-2">
                      <span>
                        <span className="block text-[10px] font-semibold text-main">{item.label}</span>
                        <span className="block text-[8px] text-muted">{item.note}</span>
                      </span>
                      <span className="text-[10px] font-bold text-soft">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-lime-300 px-3 py-2.5 text-forest-950">
                <Timer className="h-4 w-4" />
                <p className="text-[10px] font-bold">Pulse pump for 12 seconds</p>
                <ArrowRight className="ml-auto h-3.5 w-3.5" />
              </div>
            </div>
            <p className="mt-3 text-center text-[8px] uppercase tracking-[0.12em] text-muted">Illustrative decision trace · not live hardware</p>
          </div>
        </div>
      </section>

      <section id="process" className="container-wrap py-16 lg:py-24">
        <SectionHead
          align="center"
          eyebrow="The full process"
          title={<>A transparent chain of <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">cause and effect.</span></>}
          lead="Each step has one clear responsibility. If a condition fails, the system stops rather than guessing."
        />
        <div className="relative mt-12">
          <div className="absolute bottom-0 left-[19px] top-0 w-px bg-line md:left-1/2 md:-translate-x-1/2" />
          <div className="space-y-5">
            {steps.map((step, index) => (
              <div key={step.number} className={`relative grid gap-4 md:grid-cols-[1fr_60px_1fr] md:items-center ${index % 2 === 1 ? 'md:[&>*:first-child]:col-start-3' : ''}`}>
                <div className={`ml-12 md:ml-0 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                  <div className="inline-block w-full rounded-2xl border border-line bg-surface p-5 text-left shadow-card">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`grid h-9 w-9 place-items-center rounded-xl ${step.tone}`}><step.icon className="h-4 w-4" /></span>
                      <span className="font-display text-[11px] font-bold text-muted/40">STEP {step.number}</span>
                    </div>
                    <h2 className="mt-3 font-display text-sm font-bold tracking-[-0.02em] text-main">{step.title}</h2>
                    <p className="mt-1.5 text-[11px] leading-5 text-muted">{step.text}</p>
                    <span className="mt-3 inline-flex rounded-md bg-surface-2 px-2 py-1 text-[8px] font-semibold text-muted">{step.detail}</span>
                  </div>
                </div>
                <div className="absolute left-0 top-5 z-10 grid h-10 w-10 place-items-center rounded-full border-4 border-[color:var(--bg)] bg-forest-900 text-[9px] font-bold text-lime-300 dark:bg-lime-300 dark:text-forest-950 md:static md:justify-self-center">
                  {step.number}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-forest-950 py-16 text-white lg:py-24">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="container-wrap relative grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <span className="eyebrow-dark"><CloudOff className="h-3 w-3" /> When the Wi-Fi disappears</span>
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-4xl">
              The internet is optional. <span className="font-serif font-normal italic text-lime-300">Watering is not.</span>
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/75">
              PlantCare AI is designed as an edge-first system. The settings that matter live on the ESP32 itself. If the router goes down, the device keeps monitoring soil and watering safely within the same local limits.
            </p>
            <div className="mt-6 space-y-3">
              {[
                { title: 'Local rules keep running', text: 'Threshold, max runtime, cooldown, low-water lockout and daily cycle cap are stored on-device.' },
                { title: 'Dashboard tells the truth', text: 'The website switches to an Offline state and shows the last successful update instead of fake live data.' },
                { title: 'History catches up later', text: 'Stored events sync when the device reconnects; no silent gaps in the activity record.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-lime-300/15 text-lime-300"><span className="text-[9px] font-bold">✓</span></span>
                  <div>
                    <p className="text-[11px] font-semibold text-white/85">{item.title}</p>
                    <p className="mt-0.5 text-[10px] leading-5 text-white/70">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/offline" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-lime-300 hover:gap-2.5">
              Explore offline mode <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-400/15 text-amber-300"><CloudOff className="h-4 w-4" /></span>
                <div>
                  <p className="text-[10px] font-bold">Guest Wi-Fi unavailable</p>
                  <p className="text-[8px] text-white/70">Last successful sync · 12 minutes ago</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-400/15 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-amber-300">Offline</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: 'Local auto watering', value: 'Active', good: true },
                { label: 'Pump safety', value: 'Active', good: true },
                { label: 'Dashboard telemetry', value: 'Paused', good: false },
                { label: 'History sync', value: 'Queued', good: false },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.05] p-3">
                  <p className="text-[8px] text-white/70">{item.label}</p>
                  <p className={`mt-1 text-xs font-bold ${item.good ? 'text-lime-300' : 'text-amber-300'}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-3">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-white/65">ESP32 local state</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div><p className="text-[7px] text-white/65">Threshold</p><p className="text-[10px] font-bold text-white/75">45%</p></div>
                <div><p className="text-[7px] text-white/65">Max runtime</p><p className="text-[10px] font-bold text-white/75">15s</p></div>
                <div><p className="text-[7px] text-white/65">Cooldown</p><p className="text-[10px] font-bold text-white/75">20m</p></div>
              </div>
            </div>
            <p className="mt-3 text-center text-[8px] text-white/70">Illustrative offline status</p>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  )
}
