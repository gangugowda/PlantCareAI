import { useEffect, useRef, useState } from 'react'
import { Camera, Check, ImagePlus, Leaf, ShieldCheck, Upload, X } from 'lucide-react'
import { useApp } from '../lib/store'
import type { Plant } from '../lib/types'
import { plantImages } from '../lib/seed'
import { Modal, Toggle } from './ui'
import { cn } from '../lib/utils'

const photoOptions = [
  { src: plantImages.monstera, label: 'Monstera' },
  { src: plantImages.snake, label: 'Snake plant' },
  { src: plantImages.aloe, label: 'Aloe' },
  { src: plantImages.money, label: 'Trailing' },
  { src: plantImages.peace, label: 'Peace lily' },
  { src: plantImages.leaf, label: 'Foliage' },
]

const defaultPlant: Omit<Plant, 'id' | 'createdAt'> = {
  name: '',
  species: '',
  room: 'Living Room',
  potSize: '18 cm pot',
  soilType: 'Indoor potting mix',
  image: plantImages.monstera,
  moisture: 55,
  minMoisture: 30,
  maxMoisture: 75,
  threshold: 42,
  sensorId: 'SM-01',
  pumpId: 'PUMP-A',
  autoWater: true,
  notes: '',
  wateringDuration: 10,
  lastWatered: new Date().toISOString(),
  health: 'Healthy',
  light: 'Bright indirect',
}

export default function PlantModal({ open, onClose, plant }: { open: boolean; onClose: () => void; plant?: Plant }) {
  const { state, addPlant, updatePlant, nextPlantName, notify } = useApp()
  const [form, setForm] = useState<Omit<Plant, 'id' | 'createdAt'>>(defaultPlant)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (plant) {
      const { id: _id, createdAt: _createdAt, ...rest } = plant
      setForm(rest)
    } else {
      setForm({
        ...defaultPlant,
        name: nextPlantName(),
        sensorId: `SM-0${Math.min(9, state.plants.length + 1)}`,
        pumpId: state.plants.length % 2 === 0 ? 'PUMP-A' : 'PUMP-B',
        image: photoOptions[state.plants.length % photoOptions.length].src,
      })
    }
    setError('')
  }, [open, plant, nextPlantName, state.plants.length])

  const set = <K extends keyof Omit<Plant, 'id' | 'createdAt'>>(key: K, value: Omit<Plant, 'id' | 'createdAt'>[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const uploadImage = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setError('Keep uploaded photos under 2.5 MB for this demo.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => set('image', String(reader.result))
    reader.readAsDataURL(file)
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Give this plant a name.')
    if (!form.species.trim()) return setError('Add the plant species.')
    if (form.minMoisture >= form.maxMoisture) return setError('Minimum moisture must be lower than maximum.')
    if (form.threshold <= form.minMoisture || form.threshold >= form.maxMoisture) {
      return setError('The watering threshold needs to sit between the minimum and maximum moisture.')
    }
    if (plant) {
      updatePlant({ ...plant, ...form })
    } else {
      addPlant({ ...form, createdAt: new Date().toISOString() } as Omit<Plant, 'id' | 'createdAt'>)
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={plant ? `Edit ${plant.name}` : 'Add a new plant'}
      subtitle="Set the care profile and connect it to a sensor and pump zone."
      size="lg"
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="plant-form" className="btn-primary"><Check className="h-4 w-4" /> {plant ? 'Save plant' : 'Add plant'}</button>
        </>
      }
    >
      <form id="plant-form" onSubmit={submit} className="space-y-5">
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface-2 p-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface">
            <img src={form.image} alt="Plant preview" className="h-full w-full object-cover" />
            <button type="button" onClick={() => fileRef.current?.click()} className="absolute inset-0 grid place-items-center bg-forest-950/45 text-white opacity-0 transition hover:opacity-100" aria-label="Upload plant photo">
              <Camera className="h-5 w-5" />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-main">Plant photograph</p>
            <p className="mt-0.5 text-[10px] leading-5 text-muted">Choose a sample or upload a real photo (stored locally in this demo).</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {photoOptions.map((photo) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => set('image', photo.src)}
                  title={photo.label}
                  className={cn('h-9 w-9 overflow-hidden rounded-lg border-2 transition', form.image === photo.src ? 'border-emerald-500 ring-2 ring-emerald-500/15' : 'border-transparent opacity-70 hover:opacity-100')}
                >
                  <img src={photo.src} alt={photo.label} className="h-full w-full object-cover" />
                </button>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()} className="grid h-9 w-9 place-items-center rounded-lg border border-dashed border-line bg-surface text-muted transition hover:border-emerald-400 hover:text-emerald-700" aria-label="Upload image">
                <Upload className="h-3.5 w-3.5" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0])} />
          </div>
          <span className="chip-green shrink-0"><ShieldCheck className="h-2.5 w-2.5" /> Local only</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="plant-name">Plant name *</label>
            <input id="plant-name" className="input" value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="e.g. Moss" required />
          </div>
          <div>
            <label className="label" htmlFor="plant-species">Species *</label>
            <input id="plant-species" className="input" value={form.species} onChange={(event) => set('species', event.target.value)} placeholder="e.g. Monstera deliciosa" list="species-list" required />
            <datalist id="species-list">
              {['Monstera deliciosa', 'Sansevieria trifasciata', 'Aloe vera', 'Epipremnum aureum', 'Spathiphyllum wallisii', 'Ficus lyrata', 'Calathea orbifolia'].map((species) => <option key={species} value={species} />)}
            </datalist>
          </div>
          <div>
            <label className="label" htmlFor="plant-room">Room or location</label>
            <select id="plant-room" className="select" value={form.room} onChange={(event) => set('room', event.target.value)}>
              {['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Study', 'Balcony', 'Office', 'Other'].map((room) => <option key={room}>{room}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="plant-light">Light preference</label>
            <select id="plant-light" className="select" value={form.light} onChange={(event) => set('light', event.target.value)}>
              {['Bright indirect', 'Medium indirect', 'Low light', 'Direct sun, 4–6 hrs', 'Dappled shade'].map((light) => <option key={light}>{light}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="plant-pot">Pot size</label>
            <input id="plant-pot" className="input" value={form.potSize} onChange={(event) => set('potSize', event.target.value)} placeholder="e.g. 20 cm ceramic" />
          </div>
          <div>
            <label className="label" htmlFor="plant-soil">Soil type</label>
            <input id="plant-soil" className="input" value={form.soilType} onChange={(event) => set('soilType', event.target.value)} placeholder="e.g. Aroid mix" />
          </div>
        </div>

        <div className="rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-main">Moisture preferences</p>
              <p className="mt-0.5 text-[9px] text-muted">The threshold must always sit inside the safe plant range.</p>
            </div>
            <span className="chip-neutral">{form.threshold}% trigger</span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="plant-min">Minimum moisture</label>
              <div className="relative">
                <input id="plant-min" type="number" min={5} max={95} className="input pr-8" value={form.minMoisture} onChange={(event) => set('minMoisture', Number(event.target.value))} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">%</span>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="plant-threshold">Watering threshold</label>
              <div className="relative">
                <input id="plant-threshold" type="number" min={form.minMoisture + 1} max={form.maxMoisture - 1} className="input pr-8 ring-2 ring-emerald-500/10" value={form.threshold} onChange={(event) => set('threshold', Number(event.target.value))} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">%</span>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="plant-max">Maximum moisture</label>
              <div className="relative">
                <input id="plant-max" type="number" min={10} max={100} className="input pr-8" value={form.maxMoisture} onChange={(event) => set('maxMoisture', Number(event.target.value))} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">%</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <input
              type="range"
              min={10}
              max={90}
              value={form.threshold}
              onChange={(event) => {
                const value = Number(event.target.value)
                set('threshold', value)
                if (value <= form.minMoisture) set('minMoisture', Math.max(5, value - 5))
                if (value >= form.maxMoisture) set('maxMoisture', Math.min(95, value + 5))
              }}
              className="range"
              aria-label="Threshold preview"
              style={{ '--range-progress': `${((form.threshold - 10) / 80) * 100}%` } as React.CSSProperties}
            />
            <div className="mt-2 flex justify-between text-[8px] text-muted"><span>Dry</span><span>Balanced</span><span>Wet</span></div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="plant-sensor">Linked sensor</label>
            <select id="plant-sensor" className="select" value={form.sensorId} onChange={(event) => set('sensorId', event.target.value)}>
              {['SM-01', 'SM-02', 'SM-03', 'SM-04', 'SM-05'].map((sensor) => <option key={sensor}>{sensor}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="plant-pump">Linked pump zone</label>
            <select id="plant-pump" className="select" value={form.pumpId} onChange={(event) => set('pumpId', event.target.value)}>
              {['PUMP-A', 'PUMP-B', 'PUMP-C'].map((pump) => <option key={pump}>{pump}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="plant-duration">Watering pulse</label>
            <div className="relative">
              <input id="plant-duration" type="number" min={2} max={state.settings.maxRuntime} className="input pr-10" value={form.wateringDuration} onChange={(event) => set('wateringDuration', Number(event.target.value))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">sec</span>
            </div>
            <p className="mt-1 text-[8px] text-muted">Hardware max {state.settings.maxRuntime}s</p>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="plant-notes">Care notes</label>
          <textarea id="plant-notes" className="textarea" value={form.notes} onChange={(event) => set('notes', event.target.value)} placeholder="Light, feeding, rotation, repotting notes…" />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3">
          <div>
            <p className="text-[11px] font-bold text-main">Automatic watering for this plant</p>
            <p className="mt-0.5 text-[9px] text-muted">Global automation and all safety checks still apply.</p>
          </div>
          <Toggle checked={form.autoWater} onChange={(value) => set('autoWater', value)} label="Automatic watering for this plant" />
        </div>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[9px] leading-5 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
          <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Plant settings are saved to this browser workspace. The actual ESP32 must receive the threshold before it can apply it.
        </div>
      </form>
    </Modal>
  )
}
