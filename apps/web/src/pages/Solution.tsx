import { Link } from 'react-router-dom'
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Cpu,
  Droplets,
  Gauge,
  Leaf,
  MonitorSmartphone,
  Radio,
  ShieldCheck,
  Smartphone,
  Waves,
  Wifi,
  Zap,
} from 'lucide-react'
import { CTASection, SectionHead } from '../components/marketing'

const pillars = [
  {
    letter: 'S',
    title: 'Sense',
    subtitle: 'Know the root zone',
    text: 'A capacitive soil moisture sensor continuously samples the soil. A water-level sensor watches the reservoir, so the system knows both what the plant needs and what is available.',
    icon: Gauge,
    points: ['Calibrated soil reading', 'Water-level awareness', 'Sensor health checks'],
    tone: 'from-[#0E3D2E] to-[#1B5A42] text-lime-300',
  },
  {
    letter: 'W',
    title: 'Water',
    subtitle: 'Act only when needed',
    text: 'When moisture falls below the plant-specific threshold, the ESP32 activates a relay and the pump for a short, controlled pulse. No fixed weekly schedule. No guesswork.',
    icon: Droplets,
    points: ['Plant-specific threshold', 'Short watering pulses', 'Automatic or manual'],
    tone: 'from-[#0C5C47] to-[#0F8060] text-emerald-100',
  },
  {
    letter: 'P',
    title: 'Protect',
    subtitle: 'Safety before action',
    text: 'Every watering decision runs through safety checks: maximum runtime, cooldown, daily cycle cap, low-water lockout and emergency stop. Safety limits live on the device.',
    icon: ShieldCheck,
    points: ['Dry-run lockout', 'Runtime + cooldown', 'Offline safety'],
    tone: 'from-[#70550C] to-[#A47C16] text-amber-100',
  },
  {
    letter: 'M',
    title: 'Monitor',
    subtitle: 'Clarity wherever you are',
    text: 'The OLED shows status on the device. The web dashboard mirrors it live over Wi-Fi, records history, and sends notifications when something needs your attention.',
    icon: MonitorSmartphone,
    points: ['OLED status mirror', 'Live dashboard', 'Alerts + history'],
    tone: 'from-[#1E4A61] to-[#2E6F8D] text-sky-100',
  },
]

const sensors = [
  { icon: Gauge, name: 'Soil moisture sensor', detail: 'Analog → calibrated %' },
  { icon: Waves, name: 'Water-level sensor', detail: 'Reservoir state' },
  { icon: Zap, name: 'Pump feedback', detail: 'Runtime & fault checks' },
]

const outputs = [
  { icon: Smartphone, name: 'OLED display', detail: 'On-device status' },
  { icon: Wifi, name: 'Wi-Fi + MQTT', detail: 'Cloud sync' },
  { icon: MonitorSmartphone, name: 'Web dashboard', detail: 'Live mirror' },
  { icon: BellRing, name: 'Notifications', detail: 'Alerts & warnings' },
]

export default function SolutionPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line bg-[#0E3D2E] text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <div className="pointer-events-none absolute -right-40 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[420px] w-[420px] rounded-full bg-lime-300/10 blur-3xl" />
        <div className="container-wrap relative grid gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-24">
          <div>
            <span className="eyebrow-dark"><Leaf className="h-3 w-3" /> The PlantCare AI solution</span>
            <h1 className="mt-5 max-w-2xl font-display text-[40px] font-extrabold leading-[1.02] tracking-[-0.055em] sm:text-[56px]">
              One quiet system.<br />
              <span className="font-serif font-normal italic text-lime-300">Four essential jobs.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/75 sm:text-base sm:leading-8">
              PlantCare AI closes the loop between sensing, deciding, watering and explaining. It is a complete plant-care system — not a sensor alone, and not a dashboard pretending to control hardware.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/how-it-works" className="btn-lime">See the full process <ArrowRight className="h-3.5 w-3.5" /></Link>
              <Link to="/login?demo=1" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Explore the dashboard
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-white/70">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-lime-300" /> Sensor-driven decisions</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-lime-300" /> Local safety logic</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-lime-300" /> Works offline</span>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/70">Decision preview</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-300/15 px-2 py-1 text-[9px] font-semibold text-lime-300"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> Safe to water</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: 'Soil moisture', value: '38%', note: 'Below 45% threshold', warn: true },
                  { label: 'Reservoir', value: '68%', note: 'Above 12% lockout' },
                  { label: 'Pump runtime', value: '0 / 15s', note: 'Within safety limit' },
                  { label: 'Cooldown', value: 'Ready', note: 'No recent cycle' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[8px] uppercase tracking-[0.12em] text-white/70">{item.label}</p>
                    <p className={`mt-1 text-lg font-bold tracking-[-0.03em] ${item.warn ? 'text-amber-300' : 'text-white'}`}>{item.value}</p>
                    <p className="mt-0.5 text-[8px] text-white/70">{item.note}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-lime-300 p-3 text-forest-950">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-forest-950/10"><Droplets className="h-4 w-4" /></span>
                <div>
                  <p className="text-[10px] font-extrabold">Water Moss for 12 seconds</p>
                  <p className="text-[8px] font-medium text-forest-900">All 5 safety checks passed · pump pulse</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-center text-[8px] uppercase tracking-[0.12em] text-white/65">Illustrative decision flow</p>
          </div>
        </div>
      </section>

      <section className="container-wrap py-16 lg:py-24">
        <SectionHead
          align="center"
          eyebrow="Sense · Water · Protect · Monitor"
          title={<>A complete loop, <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">not four disconnected features.</span></>}
          lead="The four functions reinforce each other. A sensor reading is only useful if a safe action follows it, and an action is only trustworthy if you can see what happened."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
              <div className={`flex items-start justify-between bg-gradient-to-br ${pillar.tone} p-5`}>
                <div>
                  <p className="font-display text-[42px] font-extrabold leading-none opacity-25">{pillar.letter}</p>
                  <h2 className="mt-1 font-display text-xl font-bold tracking-[-0.035em]">{pillar.title}</h2>
                  <p className="mt-1 text-[11px] opacity-65">{pillar.subtitle}</p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><pillar.icon className="h-5 w-5" /></span>
              </div>
              <div className="p-5">
                <p className="text-[12px] leading-6 text-soft">{pillar.text}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {pillar.points.map((point) => (
                    <span key={point} className="rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-[9px] font-semibold text-soft">{point}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-[#EEF5E9] py-16 dark:bg-[#0C1F17] lg:py-24">
        <div className="container-wrap">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHead
              eyebrow="System architecture"
              title={<>How the pieces <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">talk to each other.</span></>}
              lead="Sensors feed the ESP32. The microcontroller decides, checks safety, and controls a relay. Status is mirrored locally and over Wi-Fi."
            />
            <div className="flex gap-2 text-[9px] font-semibold">
              <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-muted">Signal path</span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">Control path</span>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
              <div>
                <p className="stat-label mb-3">Inputs</p>
                <div className="space-y-2.5">
                  {sensors.map((sensor) => (
                    <div key={sensor.name} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-emerald-700 shadow-sm dark:text-emerald-300"><sensor.icon className="h-4 w-4" /></span>
                      <div>
                        <p className="text-[10px] font-bold text-main">{sensor.name}</p>
                        <p className="text-[8px] text-muted">{sensor.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <p className="stat-label mb-3">Core decision loop</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative rounded-2xl border border-forest-300 bg-forest-900 p-4 text-white dark:border-lime-300/30">
                    <div className="flex items-center justify-between">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime-300 text-forest-950"><Cpu className="h-4 w-4" /></span>
                      <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-lime-300">Step 1</span>
                    </div>
                    <p className="mt-3 text-xs font-bold">ESP32 microcontroller</p>
                    <p className="mt-1 text-[9px] leading-4 text-white/70">Reads sensors, applies local rules, exposes device status.</p>
                  </div>
                  <div className="relative rounded-2xl border border-line bg-surface-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"><ShieldCheck className="h-4 w-4" /></span>
                      <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-muted">Step 2</span>
                    </div>
                    <p className="mt-3 text-xs font-bold text-main">Decision & safety checks</p>
                    <p className="mt-1 text-[9px] leading-4 text-muted">Moisture threshold, reservoir, max runtime, cooldown, daily cap.</p>
                  </div>
                  <div className="relative rounded-2xl border border-line bg-surface-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"><Zap className="h-4 w-4" /></span>
                      <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-muted">Step 3</span>
                    </div>
                    <p className="mt-3 text-xs font-bold text-main">Relay activation</p>
                    <p className="mt-1 text-[9px] leading-4 text-muted">A safe, isolated switch turns the pump on for a limited pulse.</p>
                  </div>
                  <div className="relative rounded-2xl border border-line bg-surface-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><Droplets className="h-4 w-4" /></span>
                      <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-muted">Step 4</span>
                    </div>
                    <p className="mt-3 text-xs font-bold text-main">Water pump → plant</p>
                    <p className="mt-1 text-[9px] leading-4 text-muted">Delivers water to the root zone, then stops and cools down.</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-[9px] font-semibold text-muted">
                  <ArrowDown className="h-3.5 w-3.5 text-emerald-500" />
                  Safety boundaries remain active offline and cannot be bypassed by AI
                  <ArrowDown className="h-3.5 w-3.5 text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface-2 p-4">
              <p className="stat-label mb-3">Also connected to the ESP32</p>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {outputs.map((output) => (
                  <div key={output.name} className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><output.icon className="h-4 w-4" /></span>
                    <div>
                      <p className="text-[10px] font-bold text-main">{output.name}</p>
                      <p className="text-[8px] text-muted">{output.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[9px] text-muted">Concept architecture. Actual pin assignments and enclosure design depend on your build.</p>
        </div>
      </section>

      <section className="container-wrap py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
          <div>
            <SectionHead
              eyebrow="Safety is a feature"
              title={<>Watering is easy. <span className="font-serif font-normal italic text-emerald-700 dark:text-lime-300">Safe watering is the product.</span></>}
              lead="Automation without limits is a liability. PlantCare AI treats pump protection as a first-class part of the system design."
            />
            <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-main"><ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> Local safety lattice</div>
              <div className="mt-4 space-y-3">
                {[
                  ['Reservoir too low', 'Pump locked until refill'],
                  ['Runtime exceeded', 'Relay forced off'],
                  ['Cooldown active', 'Manual and auto blocked'],
                  ['Device offline', 'Local rules continue'],
                  ['Sensor fault', 'Fail-safe, no watering'],
                ].map(([condition, action]) => (
                  <div key={condition} className="flex items-center justify-between gap-3 border-b border-line pb-2.5 last:border-0 last:pb-0">
                    <span className="text-[10px] text-muted">{condition}</span>
                    <span className="text-[9px] font-semibold text-soft">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Wifi, title: 'Edge-first watering', text: 'Thresholds and safety live on the ESP32, so Wi-Fi is a convenience — not a dependency.' },
              { icon: Radio, title: 'Near-real-time telemetry', text: 'WebSocket or MQTT can stream readings to the dashboard when connectivity is available.' },
              { icon: BellRing, title: 'Explainable alerts', text: 'Low reservoir, sensor fault, device offline and pump warnings are clearly stated.' },
              { icon: MonitorSmartphone, title: 'OLED + web mirror', text: 'The same state appears on the physical display and in the browser interface.' },
              { icon: Gauge, title: 'Per-plant thresholds', text: 'Multiple plants and zones can have independent moisture ranges and pump safety.' },
              { icon: Leaf, title: 'Human override', text: 'Manual watering stays available when safe, with immediate emergency stop.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-2 text-emerald-700 dark:text-emerald-300"><item.icon className="h-4 w-4" /></span>
                <p className="mt-3 text-xs font-bold text-main">{item.title}</p>
                <p className="mt-1 text-[10px] leading-5 text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  )
}
