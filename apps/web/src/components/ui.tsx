import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  ChevronDown,
  Droplets,
  Leaf,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { languageNames } from '../lib/i18n'
import type { Language, PumpStatus } from '../lib/types'
import { useApp } from '../lib/store'

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          'relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl shadow-sm',
          light ? 'bg-lime-300 text-forest-950' : 'bg-forest-900 text-lime-300 dark:bg-lime-300 dark:text-forest-950',
        )}
      >
        <Leaf className="h-[19px] w-[19px]" strokeWidth={2.4} />
        <span className="absolute -bottom-2 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400/40" />
      </span>
      {!compact && (
        <span className={cn('font-display text-[17px] font-extrabold tracking-[-0.04em]', light ? 'text-white' : 'text-main')}>
          PlantCare <span className={light ? 'text-lime-300' : 'text-emerald-700 dark:text-lime-300'}>AI</span>
        </span>
      )}
    </span>
  )
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useApp()
  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      className={cn('icon-btn', compact && 'h-9 w-9 rounded-lg')}
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useApp()
  return (
    <div className="relative">
      <select
        aria-label="Language"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className={cn(
          'cursor-pointer appearance-none rounded-xl border border-line bg-transparent py-2 pl-3 pr-8 text-xs font-semibold outline-none transition hover:bg-black/[0.03] dark:hover:bg-white/[0.04]',
          compact ? 'h-9' : 'h-10',
        )}
        style={{ color: 'var(--text-soft)' }}
      >
        {(Object.keys(languageNames) as Language[]).map((code) => (
          <option key={code} value={code} className="bg-surface text-main">
            {languageNames[code]}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus-visible:outline-offset-4 disabled:opacity-40',
        checked ? 'bg-emerald-500' : 'bg-[color:var(--line-strong)]',
      )}
    >
      <span
        className={cn(
          'absolute h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-300',
          checked ? 'translate-x-[23px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  )
}

export function ProgressRing({
  value,
  size = 132,
  stroke = 10,
  color = 'var(--emerald)',
  track = 'var(--surface-3)',
  children,
  className,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  children?: ReactNode
  className?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference
  return (
    <div className={cn('relative inline-grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

export function MiniSparkline({
  values,
  color = 'var(--emerald)',
  width = 120,
  height = 40,
  fill = true,
}: {
  values: number[]
  color?: string
  width?: number
  height?: number
  fill?: boolean
}) {
  const id = useId().replaceAll(':', '')
  if (!values.length) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const points = values.map((value, index) => {
    const x = (index / Math.max(1, values.length - 1)) * width
    const y = height - 4 - ((value - min) / range) * (height - 10)
    return [x, y] as const
  })
  const path = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  const area = `${path} L ${width} ${height} L 0 ${height} Z`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#spark-${id})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.8" fill={color} />
    </svg>
  )
}

export function StatusDot({ tone = 'green', pulse = false }: { tone?: 'green' | 'amber' | 'red' | 'blue' | 'gray'; pulse?: boolean }) {
  const colors = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-sky-500',
    gray: 'bg-slate-400',
  }
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {pulse && <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', colors[tone])} />}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', colors[tone])} />
    </span>
  )
}

export function PumpBadge({ status, className }: { status: PumpStatus; className?: string }) {
  const map: Record<PumpStatus, { label: string; className: string; dot: 'green' | 'amber' | 'red' | 'blue' | 'gray' }> = {
    OFF: { label: 'Pump off', className: 'chip-neutral', dot: 'gray' },
    ON: { label: 'Pumping', className: 'chip-green', dot: 'green' },
    COOLING: { label: 'Cooling down', className: 'chip-amber', dot: 'amber' },
    LOCKED: { label: 'Safety locked', className: 'chip-red', dot: 'red' },
    FAULT: { label: 'Fault', className: 'chip-red', dot: 'red' },
  }
  const config = map[status]
  return (
    <span className={cn(config.className, className)}>
      <StatusDot tone={config.dot} pulse={status === 'ON'} />
      {config.label}
    </span>
  )
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    window.setTimeout(() => ref.current?.focus(), 20)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null
  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-5">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-[#07150f]/55 backdrop-blur-sm"
      />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 shadow-float outline-none animate-fadeUp sm:rounded-3xl sm:p-6',
          widths[size],
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold tracking-[-0.03em] text-main">{title}</h2>
            {subtitle && <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="icon-btn h-9 w-9 shrink-0 rounded-lg" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-line pt-5">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  icon: Icon,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.045em] text-main sm:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: Array<{ value: T; label: string; count?: number }>
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div className={cn('no-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface-2 p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition',
            value === tab.value
              ? 'bg-surface text-main shadow-sm'
              : 'text-muted hover:text-main',
          )}
        >
          {tab.label}
          {typeof tab.count === 'number' && <span className="ml-1.5 opacity-60">{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-surface-2 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            value === option.value ? 'bg-surface text-main shadow-sm' : 'text-muted hover:text-main',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface-2 px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface text-emerald-700 shadow-sm dark:text-emerald-300">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-base font-bold text-main">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function InfoBanner({
  icon: Icon,
  title,
  children,
  tone = 'info',
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
  tone?: 'info' | 'warning' | 'success'
}) {
  const tones = {
    info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-100',
    warning: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100',
  }
  return (
    <div className={cn('flex items-start gap-3 rounded-2xl border p-4', tones[tone])}>
      <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <div className="mt-1 text-xs leading-5 opacity-80">{children}</div>
      </div>
    </div>
  )
}

export function Avatar({ initials, size = 'md', image }: { initials: string; size?: 'sm' | 'md' | 'lg'; image?: string }) {
  const sizes = { sm: 'h-8 w-8 text-[10px]', md: 'h-10 w-10 text-xs', lg: 'h-14 w-14 text-base' }
  if (image) {
    return <img src={image} alt="" className={cn('rounded-full object-cover', sizes[size])} />
  }
  return (
    <span className={cn('inline-grid shrink-0 place-items-center rounded-full bg-forest-900 font-bold text-lime-200 dark:bg-lime-300 dark:text-forest-950', sizes[size])}>
      {initials}
    </span>
  )
}

export function DeviceBadge({ online, compact = false }: { online: boolean; compact?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
        online
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
      )}
    >
      {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {online ? (compact ? 'Online' : 'Device online') : compact ? 'Offline' : 'Device offline'}
    </span>
  )
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-soft">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-forest-950 px-2.5 py-1.5 text-[11px] font-medium leading-4 text-white opacity-0 shadow-lg transition group-hover:opacity-100">
        {text}
      </span>
    </span>
  )
}

export function WaterLevel({ value, compact = false }: { value: number; compact?: boolean }) {
  const tone = value < 15 ? 'red' : value < 30 ? 'amber' : 'green'
  const color = { red: 'bg-red-500', amber: 'bg-amber-500', green: 'bg-emerald-500' }[tone]
  return (
    <div className={cn('flex items-center gap-2', compact ? 'w-24' : 'w-full')}>
      <div className={cn('h-1.5 flex-1 overflow-hidden rounded-full', compact ? 'w-16' : '')} style={{ background: 'var(--surface-3)' }}>
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] font-bold tabular-nums text-soft">{Math.round(value)}%</span>
    </div>
  )
}

export function RelativeTime({ date }: { date: string }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return <span>Just now</span>
  if (mins < 60) return <span>{mins}m ago</span>
  const hours = Math.floor(mins / 60)
  if (hours < 24) return <span>{hours}h ago</span>
  return <span>{Math.floor(hours / 24)}d ago</span>
}

export function DropletStat({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
      <Droplets className="h-3.5 w-3.5" />
      {value}%
    </span>
  )
}
