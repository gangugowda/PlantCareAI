import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSun,
  Droplets,
  Gauge,
  Leaf,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Sun,
  Thermometer,
  Umbrella,
  Waves,
  Wind,
  ArrowRight,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn } from '../lib/utils'
import { InfoBanner, PageHeader, Toggle } from '../components/ui'

type CityKey = 'Colombo' | 'Kandy' | 'Galle' | 'Nuwara Eliya'

const cities: Record<CityKey, { temp: number; humidity: number; rain: number; wind: number; condition: string; note: string }> = {
  Colombo: { temp: 29, humidity: 60, rain: 35, wind: 12, condition: 'Warm & humid', note: 'Coastal humidity keeps soil from drying quickly.' },
  Kandy: { temp: 26, humidity: 72, rain: 55, wind: 8, condition: 'Humid with showers', note: 'Hill-country showers slow evaporation in the afternoon.' },
  Galle: { temp: 30, humidity: 68, rain: 48, wind: 16, condition: 'Breezy & damp', note: 'Sea breeze increases surface drying on exposed balconies.' },
  'Nuwara Eliya': { temp: 19, humidity: 78, rain: 62, wind: 10, condition: 'Cool & misty', note: 'Cool air means plants drink much less than in Colombo.' },
}

const forecast = [
  { day: 'Mon', icon: CloudSun, high: 30, low: 24, rain: 20, label: 'Partly cloudy' },
  { day: 'Tue', icon: CloudRain, high: 28, low: 23, rain: 70, label: 'Showers' },
  { day: 'Wed', icon: CloudDrizzle, high: 27, low: 23, rain: 55, label: 'Light rain' },
  { day: 'Thu', icon: CloudSun, high: 29, low: 24, rain: 30, label: 'Humid sun' },
  { day: 'Fri', icon: Sun, high: 31, low: 25, rain: 10, label: 'Sunny' },
  { day: 'Sat', icon: CloudSun, high: 30, low: 25, rain: 25, label: 'Warm' },
  { day: 'Sun', icon: Cloud, high: 28, low: 23, rain: 40, label: 'Cloudy' },
]

const rainfall = [
  { day: 'Mon', mm: 2 }, { day: 'Tue', mm: 14 }, { day: 'Wed', mm: 9 },
  { day: 'Thu', mm: 3 }, { day: 'Fri', mm: 0 }, { day: 'Sat', mm: 1 }, { day: 'Sun', mm: 6 },
]

export default function WeatherPage() {
  const { state } = useApp()
  const [city, setCity] = useState<CityKey>('Colombo')
  const [useWeather, setUseWeather] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('just now')

  const current = cities[city]

  const plantInsights = useMemo(
    () =>
      state.plants.map((plant) => {
        const dry = plant.moisture <= plant.threshold
        const highHumidity = current.humidity >= 65
        const recommendation = dry
          ? 'Sensor is already below threshold — the normal safety-gated watering rule still applies.'
          : highHumidity
            ? 'Humidity is high. Holding off is usually safer; let the sensor, not the forecast, decide.'
            : 'Warm conditions may dry the pot faster. Flora may suggest a slightly earlier review — still sensor-led.'
        return { plant, dry, recommendation }
      }),
    [state.plants, current.humidity],
  )

  const dryCount = plantInsights.filter((item) => item.dry).length

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Weather-aware watering"
        subtitle="Local weather context can help you plan, but it never overrides live soil sensors or pump safety rules."
        icon={CloudSun}
        actions={
          <button
            type="button"
            onClick={() => setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
            className="btn-secondary"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh demo forecast
          </button>
        }
      />

      <InfoBanner icon={ShieldCheck} title="Weather is context, not control" tone="warning">
        In this demo, weather data is sample data for {city}. Weather-aware suggestions only appear as advice — the ESP32 still waters from real sensor readings, and all runtime, cooldown and reservoir protections stay active. Live weather and a physical rain sensor would require API/hardware integration.
      </InfoBanner>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <section className="relative overflow-hidden rounded-3xl bg-forest-900 p-5 text-white shadow-float dark:bg-[#0f2c21] sm:p-6">
          <div className="dot-pattern pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-lime-300">
                  <MapPin className="h-3.5 w-3.5" /> {city}, Sri Lanka
                </div>
                <p className="mt-1 text-[10px] text-white/75">Demo weather · updated {lastUpdated}</p>
              </div>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value as CityKey)}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white outline-none backdrop-blur"
                aria-label="Demo weather city"
              >
                {(Object.keys(cities) as CityKey[]).map((item) => (
                  <option key={item} value={item} className="text-forest-950">{item}</option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-start">
                  <span className="font-display text-[64px] font-extrabold leading-none tracking-[-0.06em]">{current.temp}</span>
                  <span className="mt-1 font-display text-2xl font-bold">°C</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-lime-200">{current.condition}</p>
                <p className="mt-1 max-w-xs text-[11px] leading-5 text-white/75">{current.note}</p>
              </div>
              <CloudSun className="h-20 w-20 text-lime-300/90" strokeWidth={1.2} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Humidity', value: `${current.humidity}%`, icon: Droplets },
                { label: 'Rain chance', value: `${current.rain}%`, icon: Umbrella },
                { label: 'Wind', value: `${current.wind} km/h`, icon: Wind },
                { label: 'Soil sensors', value: `${state.plants.length} live`, icon: Waves },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
                  <item.icon className="h-4 w-4 text-lime-300" />
                  <p className="mt-2 text-sm font-bold">{item.value}</p>
                  <p className="text-[9px] text-white/75">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-main">7-day demo forecast</h2>
            <span className="chip-neutral">Sample data</span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {forecast.map((day) => (
              <div key={day.day} className="rounded-2xl border border-line bg-surface-2 p-2 text-center">
                <p className="text-[9px] font-bold uppercase tracking-wide text-muted">{day.day}</p>
                <day.icon className="mx-auto mt-1.5 h-5 w-5 text-sky-500 dark:text-sky-300" />
                <p className="mt-1.5 text-[10px] font-bold text-main">{day.high}°</p>
                <p className="text-[9px] text-muted">{day.low}°</p>
                <p className="mt-0.5 text-[8px] text-sky-700 dark:text-sky-300">{day.rain}%</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="stat-label">Rainfall this week</p>
              <p className="text-[9px] text-muted">{rainfall.reduce((sum, item) => sum + item.mm, 0)} mm · demo</p>
            </div>
            <div className="flex h-24 items-end gap-2">
              {rainfall.map((item) => (
                <div key={item.day} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-20 w-full items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-sky-500/70 to-sky-300 transition-all dark:from-sky-400/60 dark:to-sky-200/80"
                      style={{ height: `${Math.max(4, (item.mm / 14) * 100)}%` }}
                      title={`${item.mm} mm`}
                    />
                  </div>
                  <span className="text-[8px] font-semibold text-muted">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-surface-2 p-3">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-main">Use weather in AI suggestions</p>
              <p className="mt-0.5 text-[9px] leading-4 text-muted">Advice only. Hardware safety and sensor triggers are unaffected.</p>
            </div>
            <Toggle checked={useWeather} onChange={setUseWeather} label="Use weather in AI suggestions" />
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
            <div>
              <h2 className="font-display text-sm font-bold text-main">Plant-by-plant guidance</h2>
              <p className="text-[10px] text-muted">Live sensor readings are shown first; weather is secondary.</p>
            </div>
            <span className={cn('chip', dryCount ? 'chip-amber' : 'chip-green')}>
              {dryCount ? `${dryCount} below threshold` : 'All within range'}
            </span>
          </div>
          <div className="divide-y divide-[color:var(--line)]">
            {plantInsights.map(({ plant, dry, recommendation }) => (
              <div key={plant.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                <img src={plant.image} alt={`${plant.name}, ${plant.species}`} className="h-12 w-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[12px] font-bold text-main">{plant.name}</p>
                    <span className={cn('chip', dry ? 'chip-amber' : 'chip-green')}>{plant.moisture}% moisture</span>
                    <span className="text-[9px] text-muted">threshold {plant.threshold}%</span>
                  </div>
                  <p className="mt-1 text-[10px] leading-4.5 text-muted">{recommendation}</p>
                </div>
                <Link to={`/plants/${plant.id}`} className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-emerald-700 hover:gap-1.5 dark:text-emerald-300">
                  Open <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main">
              <Gauge className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> Weather vs sensor priority
            </h2>
            <ol className="mt-3 space-y-2.5">
              {[
                { icon: Waves, title: '1. Live soil sensor', body: 'Primary trigger for every watering decision.' },
                { icon: ShieldCheck, title: '2. Hardware safety', body: 'Runtime cap, cooldown, reservoir lockout, daily cycles.' },
                { icon: CloudSun, title: '3. Weather context', body: 'Only adjusts human-facing advice and estimates.' },
              ].map((item) => (
                <li key={item.title} className="flex gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-soft"><item.icon className="h-3.5 w-3.5" /></span>
                  <div>
                    <p className="text-[10.5px] font-bold text-main">{item.title}</p>
                    <p className="text-[9.5px] leading-4 text-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main">
              <Thermometer className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> Evaporation estimate
            </h2>
            <p className="mt-1 text-[10px] leading-4 text-muted">Demo estimate from temperature and humidity — not a calibrated evapotranspiration model.</p>
            <div className="mt-3 space-y-2">
              {state.plants.slice(0, 4).map((plant) => {
                const factor = Math.round((current.temp / 30) * (100 - current.humidity) * 0.22)
                return (
                  <div key={plant.id}>
                    <div className="mb-1 flex items-center justify-between text-[9px]">
                      <span className="font-semibold text-soft">{plant.name}</span>
                      <span className="text-muted">{factor}% / day</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                      <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-500" style={{ width: `${Math.min(100, factor * 1.6)}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <InfoBanner icon={Sprout} title="Seasonal note" tone="info">
            Sri Lanka's monsoon months can change how quickly pots dry. Keep the sensor in the root zone and adjust the threshold — not the maximum pump runtime.
          </InfoBanner>
        </aside>
      </div>
    </div>
  )
}
