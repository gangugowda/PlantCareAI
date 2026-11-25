import { Droplets, Leaf, Wifi } from 'lucide-react'
import type { Device, Plant, PumpState } from '../lib/types'
import { cn } from '../lib/utils'

export default function OLEDMirror({ plant, pump, device, compact = false }: { plant?: Plant; pump: PumpState; device: Device; compact?: boolean }) {
  const pumpLabel = pump.status === 'ON' ? `ON ${pump.remaining}s` : pump.status === 'COOLING' ? 'COOL' : pump.status === 'LOCKED' ? 'LOCK' : pump.status === 'FAULT' ? 'FAULT' : 'OFF'
  return (
    <div className={cn('relative rounded-[22px] border border-charcoal-800 bg-gradient-to-b from-[#1c2420] to-[#0c120f] p-2.5 shadow-float', compact ? 'w-full' : '')}>
      <div className="absolute left-3 top-1.5 flex gap-1">
        {[0, 1, 2].map((dot) => <span key={dot} className="h-1 w-1 rounded-full bg-white/15" />)}
      </div>
      <div className="mt-1.5 overflow-hidden rounded-lg border border-[#2c3a33] bg-[#03120a] px-3 py-3 shadow-[inset_0_0_24px_rgba(58,215,130,.08)]">
        <div className="flex items-center justify-between border-b border-emerald-400/15 pb-1.5">
          <span className="flex items-center gap-1 text-[8px] font-bold tracking-[0.08em] text-[#8ef5ba]"><Leaf className="h-2.5 w-2.5" /> PLANTCARE AI</span>
          {device.online ? <Wifi className="h-2.5 w-2.5 text-[#62d993]" /> : <span className="text-[6px] font-bold text-amber-300">OFFLINE</span>}
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#c9ffdc]">{plant?.name ?? 'Garden'}</p>
            <p className="max-w-[130px] truncate text-[7px] text-[#65a67d]">{plant?.species ?? 'No plant selected'}</p>
          </div>
          <div className="text-right">
            <p className="text-[7px] uppercase tracking-wide text-[#4d8d64]">Moisture</p>
            <p className="font-mono text-xl font-bold leading-none text-[#c9ffdc]">{Math.round(plant?.moisture ?? 0)}<span className="text-[9px]">%</span></p>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-emerald-400/15 pt-1.5 text-[7px]">
          <span className="text-[#4d8d64]">PUMP</span>
          <span className={cn('text-right font-bold', pump.status === 'ON' ? 'text-[#c9ffdc]' : pump.status === 'COOLING' ? 'text-amber-300' : 'text-[#69c58c]')}>{pumpLabel}</span>
          <span className="text-[#4d8d64]">WATER</span>
          <span className="text-right font-bold text-[#c9ffdc]">{Math.round(device.reservoir)}%</span>
          <span className="text-[#4d8d64]">SYSTEM</span>
          <span className={cn('text-right font-bold', device.online ? 'text-[#69c58c]' : 'text-amber-300')}>{device.online ? 'OK' : 'LOCAL'}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-emerald-400/15 pt-1.5">
          <span className="flex items-center gap-1 text-[6px] text-[#4d8d64]"><Droplets className="h-2 w-2" /> AUTO {pump.status === 'ON' ? 'ACTIVE' : 'ARMED'}</span>
          <span className="flex gap-0.5">
            {[0, 1, 2, 3].map((bar) => <span key={bar} className={cn('h-1.5 w-0.5 rounded-sm', bar < Math.round(device.wifiStrength / 25) ? 'bg-[#62d993]' : 'bg-[#234a34]')} />)}
          </span>
        </div>
      </div>
      <p className="mt-1.5 text-center text-[7px] font-medium uppercase tracking-[0.12em] text-white/50">SSD1306 · 128 × 64</p>
    </div>
  )
}
