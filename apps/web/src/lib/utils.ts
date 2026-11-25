export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const value = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-GB', opts ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(value)
}

export function formatTime(date: string | Date) {
  const value = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(value)
}

export function timeAgo(date: string | Date) {
  const value = typeof date === 'string' ? new Date(date).getTime() : date.getTime()
  const diff = Date.now() - value
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(new Date(value), { day: 'numeric', month: 'short' })
}

export function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'goodMorning'
  if (hour < 18) return 'goodAfternoon'
  return 'goodEvening'
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function moistureStatus(value: number, threshold: number, max = 80) {
  if (value < threshold) return { label: 'Dry', tone: 'amber' as const }
  if (value > max + 5) return { label: 'Very wet', tone: 'blue' as const }
  if (value < threshold + 8) return { label: 'Almost dry', tone: 'amber' as const }
  return { label: 'Moist', tone: 'green' as const }
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
  const csv = [headers.map(escape).join(','), ...rows.map((row) => headers.map((header) => escape(row[header] ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

const day = 86_400_000

export function makeMoistureSeries(range: '24h' | '7d' | '30d' | 'custom', baseline = 62) {
  const points =
    range === '24h' ? 24 : range === '7d' ? 14 : range === '30d' ? 30 : 20
  const labels =
    range === '24h'
      ? Array.from({ length: points }, (_, index) => `${String(index).padStart(2, '0')}:00`)
      : Array.from({ length: points }, (_, index) => {
          const d = new Date(Date.now() - (points - 1 - index) * day)
          return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`
        })

  return labels.map((label, index) => {
    const wave = Math.sin(index / 2.3) * 5 + Math.cos(index / 4.5) * 3
    const drift = range === '30d' ? index * 0.05 : range === '7d' ? index * 0.18 : 0
    const moisture = Math.round(clamp(baseline - 7 + wave + drift, 28, 82))
    return {
      label,
      moisture,
      threshold: 45,
      pump: moisture < 46 && index % 6 === 2 ? 18 : 0,
    }
  })
}

export function makeWaterSeries(range: '24h' | '7d' | '30d' | 'custom') {
  const buckets =
    range === '24h'
      ? ['00', '04', '08', '12', '16', '20']
      : range === '7d'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['W1', 'W2', 'W3', 'W4']
  return buckets.map((bucket, index) => ({
    label: bucket,
    liters: Number((0.22 + ((index * 7) % 9) * 0.07).toFixed(2)),
    cycles: 1 + ((index * 3) % 4),
  }))
}
