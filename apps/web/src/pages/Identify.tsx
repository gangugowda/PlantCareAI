import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  Droplets,
  ImagePlus,
  Leaf,
  Loader2,
  ScanLine,
  Sparkles,
  Sprout,
  Sun,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn } from '../lib/utils'
import { plantImages } from '../lib/seed'
import { InfoBanner, PageHeader } from '../components/ui'

interface Candidate {
  species: string
  common: string
  confidence: number
  family: string
  light: string
  water: string
  threshold: number
  maxMoisture: number
  minMoisture: number
  duration: number
  room: string
  image: string
  traits: string[]
  note: string
}

const candidates: Candidate[] = [
  {
    species: 'Monstera deliciosa',
    common: 'Monstera',
    confidence: 92,
    family: 'Araceae',
    light: 'Bright indirect',
    water: 'Water when top 3–5 cm is dry',
    threshold: 45,
    maxMoisture: 75,
    minMoisture: 40,
    duration: 12,
    room: 'Living Room',
    image: plantImages.monstera,
    traits: ['Fenestrated leaves', 'Heart-shaped juvenile leaves', 'Climbing growth habit'],
    note: 'Large split leaves and aerial roots are strong visual cues. Leaf shape alone cannot confirm a cultivar.',
  },
  {
    species: 'Epipremnum aureum',
    common: 'Golden Pothos',
    confidence: 84,
    family: 'Araceae',
    light: 'Medium indirect',
    water: 'Let the top layer dry between waterings',
    threshold: 40,
    maxMoisture: 68,
    minMoisture: 35,
    duration: 10,
    room: 'Kitchen',
    image: plantImages.money,
    traits: ['Trailing vines', 'Heart-shaped leaves', 'Variegated cream and green'],
    note: 'Very similar to other Epipremnum species. Variegation pattern varies with light.',
  },
  {
    species: 'Spathiphyllum wallisii',
    common: 'Peace Lily',
    confidence: 78,
    family: 'Araceae',
    light: 'Medium indirect',
    water: 'Keep evenly moist, never soggy',
    threshold: 55,
    maxMoisture: 80,
    minMoisture: 50,
    duration: 9,
    room: 'Bathroom',
    image: plantImages.peace,
    traits: ['Dark glossy leaves', 'White spathe flowers', 'Clumping habit'],
    note: 'Flowers make identification easier; without a spathe, other aroids can look similar.',
  },
  {
    species: 'Sansevieria trifasciata',
    common: 'Snake Plant',
    confidence: 74,
    family: 'Asparagaceae',
    light: 'Low to bright indirect',
    water: 'Water sparingly; let soil dry deeply',
    threshold: 28,
    maxMoisture: 45,
    minMoisture: 20,
    duration: 8,
    room: 'Bedroom',
    image: plantImages.snake,
    traits: ['Upright sword leaves', 'Banded grey-green pattern', 'Very drought tolerant'],
    note: 'Leaf banding and upright form are distinctive, but light levels change colour intensity.',
  },
]

export default function IdentifyPage() {
  const { addPlant, notify } = useApp()
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [stage, setStage] = useState<'idle' | 'scanning' | 'done'>('idle')
  const [selected, setSelected] = useState(0)
  const [added, setAdded] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = preview ? candidates : []

  const readFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return notify('Please choose an image file.', 'warning')
    if (file.size > 4 * 1024 * 1024) return notify('Keep demo images under 4 MB.', 'warning')
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(String(reader.result))
      setFileName(file.name)
      setStage('idle')
      setSelected(0)
      setAdded([])
    }
    reader.readAsDataURL(file)
  }

  const analyse = () => {
    if (!preview) return
    setStage('scanning')
    window.setTimeout(() => setStage('done'), 1500)
  }

  const useSample = (candidate: Candidate) => {
    setPreview(candidate.image)
    setFileName(`${candidate.common.toLowerCase().replaceAll(' ', '-')}-sample.jpg`)
    setStage('done')
    setSelected(candidates.findIndex((item) => item.species === candidate.species))
    setAdded([])
  }

  const addToGarden = (candidate: Candidate) => {
    addPlant({
      name: candidate.common.split(' ')[0],
      species: candidate.species,
      room: candidate.room,
      potSize: '16 cm nursery pot',
      soilType: candidate.family === 'Araceae' ? 'Aroid mix' : 'Cactus & succulent mix',
      image: preview ?? candidate.image,
      moisture: candidate.threshold + 12,
      minMoisture: candidate.minMoisture,
      maxMoisture: candidate.maxMoisture,
      threshold: candidate.threshold,
      sensorId: 'SM-NEW',
      pumpId: 'PUMP-A',
      autoWater: false,
      notes: 'Added from demo plant identification. Confirm the species before enabling automatic watering.',
      wateringDuration: candidate.duration,
      lastWatered: new Date().toISOString(),
      health: 'Healthy',
      light: candidate.light,
    })
    setAdded((current) => [...current, candidate.species])
  }

  const active = results[selected]

  return (
    <div>
      <PageHeader
        eyebrow="Plant intelligence"
        title="Plant identification"
        subtitle="Upload a photo for a possible match and starting care notes. This demo never claims a certain diagnosis from an image."
        icon={ScanLine}
        actions={
          <Link to="/assistant" className="btn-secondary">
            <Sparkles className="h-3.5 w-3.5" /> Ask Flora about a photo
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="panel p-4 sm:p-5">
          <h2 className="font-display text-sm font-bold text-main">1. Add a clear photo</h2>
          <p className="mt-1 text-[10px] leading-4 text-muted">Good light, one plant, leaves and stems visible. The image is processed locally in this demo and never uploaded.</p>

          <div
            onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              readFile(event.dataTransfer.files?.[0])
            }}
            className={cn(
              'mt-4 overflow-hidden rounded-3xl border-2 border-dashed transition',
              dragging ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-500/10' : 'border-line bg-surface-2',
            )}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Plant photo to identify" className="aspect-[4/3] w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-forest-950/80 to-transparent p-3">
                  <p className="max-w-[60%] truncate text-[10px] font-medium text-white/80">{fileName || 'plant-photo.jpg'}</p>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg border border-white/25 bg-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-white backdrop-blur transition hover:bg-white/20">
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPreview(null); setStage('idle'); setFileName(''); setAdded([]) }}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {stage === 'scanning' && (
                  <div className="absolute inset-0 grid place-items-center bg-forest-950/45 backdrop-blur-[2px]">
                    <div className="rounded-2xl bg-white/95 px-5 py-4 text-center shadow-float dark:bg-[#173026]/95">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-700 dark:text-emerald-300" />
                      <p className="mt-2 text-[11px] font-bold text-main">Comparing leaf shape & posture…</p>
                      <p className="text-[9px] text-muted">Local demo model · no upload</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface text-emerald-700 shadow-sm dark:text-emerald-300">
                  <UploadCloud className="h-6 w-6" />
                </span>
                <p className="mt-3 text-[12px] font-bold text-main">Drop a photo here</p>
                <p className="mt-1 text-[10px] text-muted">JPG, PNG or WebP · up to 4 MB</p>
                <button type="button" onClick={() => inputRef.current?.click()} className="btn-primary mt-4">
                  <Camera className="h-4 w-4" /> Choose photo
                </button>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => readFile(event.target.files?.[0])} />

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={analyse} disabled={!preview || stage === 'scanning'} className="btn-primary">
              <ScanLine className="h-4 w-4" /> {stage === 'done' ? 'Scan again' : 'Identify plant'}
            </button>
            {preview && (
              <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary">
                <ImagePlus className="h-4 w-4" /> Another photo
              </button>
            )}
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <p className="stat-label mb-2">Or try a sample photo</p>
            <div className="grid grid-cols-4 gap-2">
              {candidates.map((candidate) => (
                <button
                  key={candidate.species}
                  type="button"
                  onClick={() => useSample(candidate)}
                  className="group relative overflow-hidden rounded-xl border border-line text-left"
                >
                  <img src={candidate.image} alt={candidate.common} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/80 to-transparent px-1.5 pb-1 pt-4 text-[8px] font-semibold text-white">{candidate.common}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {stage !== 'done' || !active ? (
            <div className="panel flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Leaf className="h-7 w-7" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold text-main">Possible matches appear here</h2>
              <p className="mt-1.5 max-w-sm text-[11px] leading-5 text-muted">
                You'll get a ranked shortlist with confidence, visible traits and cautious care notes. Identification from a single photo is an estimate, not a guarantee.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <span className="chip-neutral">Leaf shape</span>
                <span className="chip-neutral">Growth habit</span>
                <span className="chip-neutral">Colour & texture</span>
              </div>
            </div>
          ) : (
            <>
              <div className="panel overflow-hidden">
                <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <ScanLine className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[11px] font-bold text-main">Best possible match</p>
                      <p className="text-[9px] text-muted">Demo model · visual estimate only</p>
                    </div>
                  </div>
                  <span className="chip-amber">{active.confidence}% confidence</span>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <img src={preview ?? active.image} alt={active.common} className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="min-w-0">
                      <h2 className="font-display text-xl font-extrabold tracking-[-0.04em] text-main">{active.common}</h2>
                      <p className="text-[11px] italic text-muted">{active.species}</p>
                      <p className="mt-1 text-[9px] text-muted">Family {active.family} · {active.traits[0]}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="chip-green"><Check className="h-2.5 w-2.5" /> {active.light}</span>
                        <span className="chip-blue"><Droplets className="h-2.5 w-2.5" /> {active.threshold}% threshold</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl bg-surface-2 p-3">
                      <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-muted"><Sun className="h-3 w-3" /> Light</p>
                      <p className="mt-1 text-[10.5px] font-semibold text-soft">{active.light}</p>
                    </div>
                    <div className="rounded-xl bg-surface-2 p-3">
                      <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-muted"><Droplets className="h-3 w-3" /> Watering</p>
                      <p className="mt-1 text-[10.5px] font-semibold text-soft">{active.water}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="stat-label mb-1.5">Visible traits</p>
                    <div className="flex flex-wrap gap-1.5">
                      {active.traits.map((trait) => <span key={trait} className="chip-neutral">{trait}</span>)}
                    </div>
                  </div>

                  <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-4.5 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
                    <AlertTriangle className="mr-1 inline h-3 w-3" /> {active.note}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => addToGarden(active)}
                      disabled={added.includes(active.species)}
                      className="btn-primary"
                    >
                      {added.includes(active.species) ? <Check className="h-4 w-4" /> : <Sprout className="h-4 w-4" />}
                      {added.includes(active.species) ? 'Added to My Plants' : 'Add to My Plants'}
                    </button>
                    <Link to="/assistant" className="btn-secondary">
                      Ask about care <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  {added.includes(active.species) && (
                    <p className="mt-2 text-[9px] text-muted">Added with automatic watering off. Confirm the species, then enable it in My Plants.</p>
                  )}
                </div>
              </div>

              <div className="panel p-4">
                <h2 className="font-display text-sm font-bold text-main">Other possible matches</h2>
                <div className="mt-3 space-y-2">
                  {results.map((candidate, index) => (
                    <button
                      key={candidate.species}
                      type="button"
                      onClick={() => setSelected(index)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition',
                        index === selected ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10' : 'border-line bg-surface hover:bg-surface-2',
                      )}
                    >
                      <img src={candidate.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold text-main">{candidate.common}</span>
                        <span className="block text-[9px] italic text-muted">{candidate.species}</span>
                      </span>
                      <span className={cn('chip', candidate.confidence >= 85 ? 'chip-green' : candidate.confidence >= 75 ? 'chip-blue' : 'chip-amber')}>
                        {candidate.confidence}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <InfoBanner icon={Sparkles} title="What this demo can do" tone="info">
          Compares the photo against a small set of sample species and shows a plausible shortlist. It is a local rule-based demo, not a trained vision model.
        </InfoBanner>
        <InfoBanner icon={AlertTriangle} title="What it cannot do" tone="warning">
          It cannot confirm a species, diagnose disease or detect pests with certainty. Similar-looking plants exist, and lighting can change leaf colour.
        </InfoBanner>
        <InfoBanner icon={Check} title="Good next steps" tone="success">
          Compare the traits yourself, check the stem and leaf arrangement, and ask a local nursery if you need a firm identification before changing care.
        </InfoBanner>
      </div>
    </div>
  )
}
