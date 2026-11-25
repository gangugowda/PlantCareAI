import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BatteryCharging,
  Check,
  Cloud,
  Droplets,
  Gauge,
  Leaf,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  Waves,
  Wifi,
  Zap,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { ProgressRing, StatusDot, Toggle } from './ui'

export function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'left',
  light = false,
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: string
  align?: 'left' | 'center'
  light?: boolean
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && (
        <div className={cn('mb-4', align === 'center' && 'flex justify-center')}>
          <span className={light ? 'eyebrow-dark' : 'eyebrow'}>
            <Sparkles className="h-3 w-3" />
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className={cn('section-title text-balance', light && 'text-white')}>{title}</h2>
      {lead && <p className={cn('section-lead mt-4 text-pretty', light && 'text-white/75')}>{lead}</p>}
    </div>
  )
}

export function DemoWaterWidget({ compact = false }: { compact?: boolean }) {
  const [moisture, setMoisture] = useState(64)
  const [pump, setPump] = useState<'OFF' | 'ON' | 'COOLING'>('OFF')
  const [remaining, setRemaining] = useState(0)
  const [auto, setAuto] = useState(true)
  const [reservoir, setReservoir] = useState(68)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMoisture((value) => Math.max(52, Math.min(70, value + (Math.random() > 0.55 ? -1 : 0.45))))
    }, 5000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (pump !== 'ON') return
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setPump('COOLING')
          setMoisture((current) => Math.min(88, current + 6))
          setReservoir((current) => Math.max(0, current - 1))
          window.setTimeout(() => setPump('OFF'), 4500)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [pump])

  const start = () => {
    if (pump !== 'OFF') return
    setPump('ON')
    setRemaining(8)
  }

  return (
    <div className={cn('relative overflow-hidden rounded-[26px] bg-forest-950 text-white shadow-float', compact ? 'p-5' : 'p-5 sm:p-6')}>
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-lime-300/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-lime-300 text-forest-950">
              <Leaf className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-lime-300">Live system</p>
              <p className="text-[11px] font-semibold text-white/80">Moss · Monstera</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[9px] font-semibold text-white/70">
            <StatusDot tone="green" pulse /> ESP32 connected
          </span>
        </div>

        <div className="mt-5 grid grid-cols-[auto_1fr] items-center gap-5">
          <ProgressRing value={moisture} size={112} stroke={9} color="#C9F27B" track="rgba(255,255,255,.08)">
            <div>
              <p className="font-display text-2xl font-extrabold tracking-[-0.05em] text-white">{Math.round(moisture)}%</p>
              <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-white/70">moisture</p>
            </div>
          </ProgressRing>
          <div className="space-y-2.5">
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-white/70"><Waves className="h-3 w-3" /> Pump</span>
                <span className={cn('text-[10px] font-bold', pump === 'ON' ? 'text-lime-300' : pump === 'COOLING' ? 'text-amber-300' : 'text-white/75')}>
                  {pump === 'ON' ? `WATERING ${remaining}s` : pump === 'COOLING' ? 'COOLING' : 'STANDBY'}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={cn('h-full rounded-full transition-all duration-1000', pump === 'ON' ? 'bg-lime-300' : 'bg-emerald-400/60')} style={{ width: pump === 'ON' ? `${(remaining / 8) * 100}%` : '100%' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5">
                <p className="flex items-center gap-1 text-[9px] text-white/70"><Droplets className="h-2.5 w-2.5" /> Reservoir</p>
                <p className="mt-1 text-xs font-bold text-white/85">{reservoir}% <span className="text-[8px] font-normal text-emerald-300">Good</span></p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5">
                <p className="flex items-center gap-1 text-[9px] text-white/70"><Cloud className="h-2.5 w-2.5" /> Weather</p>
                <p className="mt-1 text-xs font-bold text-white/85">28° <span className="text-[8px] font-normal text-white/70">No rain</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
          <div className="flex items-center gap-2">
            {auto ? <Play className="h-3.5 w-3.5 text-lime-300" /> : <Pause className="h-3.5 w-3.5 text-white/70" />}
            <span className="text-[10px] font-medium text-white/65">Automatic watering</span>
          </div>
          <Toggle checked={auto} onChange={setAuto} label="Toggle demo automatic watering" />
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={start}
            disabled={pump !== 'OFF'}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-bold transition',
              pump === 'ON' ? 'bg-lime-300 text-forest-950' : pump === 'COOLING' ? 'bg-amber-300/20 text-amber-200' : 'bg-lime-300 text-forest-950 hover:bg-lime-200',
            )}
          >
            <Droplets className="h-3.5 w-3.5" />
            {pump === 'ON' ? `Watering · ${remaining}s` : pump === 'COOLING' ? 'Cooling down' : 'Water now (demo)'}
          </button>
          <span className="grid place-items-center rounded-xl border border-white/10 px-3 text-[9px] font-medium text-white/70">Safety on</span>
        </div>
        <p className="mt-2 text-center text-[8px] font-medium uppercase tracking-[0.1em] text-white/65">Interactive preview · simulated telemetry</p>
      </div>
    </div>
  )
}

export function TrustRow({ light = false }: { light?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <div className="flex -space-x-2">
        {['/plants/snake.jpg', '/plants/aloe.jpg', '/plants/pothos2.jpg', '/plants/peace-lily.jpg'].map((src) => (
          <img key={src} src={src} alt="" className={cn('h-8 w-8 rounded-full border-2 object-cover', light ? 'border-forest-950' : 'border-[color:var(--bg)]')} />
        ))}
      </div>
      <div>
        <p className={cn('text-xs font-semibold', light ? 'text-white/80' : 'text-soft')}>Loved by plant people</p>
        <p className={cn('text-[10px]', light ? 'text-white/70' : 'text-muted')}>4.9/5 from sample beta feedback</p>
      </div>
      <span className={cn('hidden h-7 w-px sm:block', light ? 'bg-white/10' : 'bg-[color:var(--line)]')} />
      <div className="flex items-center gap-2">
        <span className={cn('grid h-7 w-7 place-items-center rounded-lg', light ? 'bg-white/10 text-lime-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300')}>
          <ShieldCheck className="h-3.5 w-3.5" />
        </span>
        <p className={cn('text-[10px] leading-4', light ? 'text-white/70' : 'text-muted')}>
          Safety-first hardware<br /><span className={light ? 'text-white/75' : 'text-soft'}>Offline watering ready</span>
        </p>
      </div>
    </div>
  )
}

export function CapabilityPill({ icon: Icon, label }: { icon: typeof Leaf; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[10px] font-semibold text-soft shadow-sm">
      <Icon className="h-3 w-3 text-emerald-700 dark:text-emerald-300" />
      {label}
    </span>
  )
}

export function CTASection() {
  return (
    <section className="container-wrap py-16 lg:py-24">
      <div className="relative overflow-hidden rounded-[32px] bg-forest-950 px-6 py-14 text-center shadow-float sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-[0.07]" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <span className="eyebrow-dark">
            <Sparkles className="h-3 w-3" /> Start growing smarter
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.045em] text-white sm:text-5xl">
            Give every plant a <span className="font-serif font-normal italic text-lime-300">healthier</span> tomorrow.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            Set up your garden in minutes. Explore the full interactive demo, or create a workspace for your own plants and sensors.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/signup" className="btn-lime !px-6 !py-3">
              Create your workspace <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login?demo=1" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              <Play className="h-3.5 w-3.5" /> Explore live demo
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-medium text-white/70">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3 text-lime-300" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3 text-lime-300" /> Demo data clearly labelled</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3 text-lime-300" /> Offline-safe by design</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function MetricStrip() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-[color:var(--line)] sm:grid-cols-4">
      {[
        { value: '24/7', label: 'monitoring', icon: Gauge },
        { value: '5', label: 'sensor safety checks', icon: ShieldCheck },
        { value: '<12s', label: 'typical watering pulse', icon: Zap },
        { value: '100%', label: 'offline pump safety', icon: BatteryCharging },
      ].map((item) => (
        <div key={item.label} className="bg-surface px-4 py-4 text-center">
          <item.icon className="mx-auto mb-2 h-4 w-4 text-emerald-700 dark:text-emerald-300" />
          <p className="font-display text-xl font-bold tracking-[-0.04em] text-main">{item.value}</p>
          <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.11em] text-muted">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[530px]">
      <div className="pointer-events-none absolute -left-12 top-12 h-48 w-48 rounded-full bg-lime-300/30 blur-3xl dark:bg-lime-300/10" />
      <div className="pointer-events-none absolute -right-10 bottom-8 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -left-4 top-20 hidden h-14 w-14 rounded-2xl border border-line bg-surface/80 shadow-soft backdrop-blur sm:grid sm:place-items-center lg:-left-7">
        <Wifi className="h-5 w-5 text-emerald-700" />
      </div>
      <div className="relative overflow-hidden rounded-[46%_46%_24px_24px/34%_34%_24px_24px] border border-white/50 bg-[#E8F0E3] shadow-float dark:border-white/10 dark:bg-[#1B372A]">
        <div className="aspect-[4/5]">
          <img src="/plants/monstera.jpg" alt="Healthy Monstera deliciosa in a white pot held by hands, ready for smart plant care" className="h-full w-full object-cover object-center" />
        </div>
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-forest-950/25 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/30 bg-white/70 px-2.5 py-1 text-[9px] font-bold text-forest-950 backdrop-blur">
          <StatusDot tone="green" pulse /> LIVE SENSOR
        </div>
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-forest-950/80 p-3.5 text-white shadow-float backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-lime-300 text-forest-950"><Leaf className="h-4 w-4" /></span>
              <div>
                <p className="text-[10px] font-bold text-white">Moss · Monstera</p>
                <p className="text-[8px] text-white/70">Living room · Sensor SM-01</p>
              </div>
            </div>
            <span className="chip bg-lime-300/15 text-[9px] text-lime-300">Thriving</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { icon: Droplets, label: 'Moisture', value: '64%' },
              { icon: Waves, label: 'Pump', value: 'Off' },
              { icon: Cloud, label: 'Water', value: '68%' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white/[0.08] px-2 py-1.5">
                <p className="flex items-center gap-1 text-[7.5px] text-white/70"><stat.icon className="h-2.5 w-2.5" />{stat.label}</p>
                <p className="mt-0.5 text-[11px] font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -right-3 top-24 w-[144px] rounded-2xl border border-line bg-surface p-3 shadow-float backdrop-blur sm:-right-8">
        <div className="flex items-center justify-between">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-muted">Auto watering</p>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
        <p className="mt-1.5 font-display text-base font-bold tracking-[-0.03em] text-main">Armed</p>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-surface-2 px-2 py-1.5">
          <span className="text-[8px] text-muted">Threshold</span>
          <span className="text-[9px] font-bold text-main">45%</span>
        </div>
      </div>

      <div className="absolute -bottom-4 right-4 hidden items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 shadow-float sm:flex lg:-right-10">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"><Droplets className="h-3.5 w-3.5" /></span>
        <div>
          <p className="text-[8px] text-muted">Water saved this week</p>
          <p className="text-[11px] font-bold text-main">3.8 L <span className="text-[8px] font-medium text-emerald-700">estimated</span></p>
        </div>
      </div>

      <div className="absolute -left-6 bottom-28 hidden rounded-xl border border-line bg-surface px-3 py-2 shadow-soft backdrop-blur sm:block">
        <div className="flex items-center gap-1.5">
          <StatusDot tone="green" />
          <p className="text-[9px] font-semibold text-main">Device online</p>
        </div>
        <p className="mt-0.5 text-[8px] text-muted">Last sync · just now</p>
      </div>
    </div>
  )
}
