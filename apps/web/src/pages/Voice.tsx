import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  AudioLines,
  Check,
  Command,
  Droplets,
  Mic,
  MicOff,
  Power,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn, formatTime } from '../lib/utils'
import { InfoBanner, PageHeader, Toggle } from '../components/ui'

interface VoiceLog {
  id: string
  command: string
  response: string
  time: string
  tone: 'success' | 'warning' | 'info'
}

const commandGuide = [
  { phrase: '“Water Monstera”', action: 'Starts a safety-checked manual watering pulse', icon: Droplets },
  { phrase: '“Stop watering”', action: 'Stops the pump and starts the cooldown', icon: Power },
  { phrase: '“Turn on automatic watering”', action: 'Arms automatic watering (sensor-triggered)', icon: Sparkles },
  { phrase: '“Pause automatic watering”', action: 'Disarms automatic watering without stopping a pulse', icon: Power },
  { phrase: '“Check moisture”', action: 'Reads back live sensor values', icon: AudioLines },
  { phrase: '“System status”', action: 'Summarises device, reservoir and pump state', icon: ShieldCheck },
]

export default function VoicePage() {
  const { state, manualWater, stopPump, setAutoWatering, notify } = useApp()
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [input, setInput] = useState('')
  const [speakReplies, setSpeakReplies] = useState(true)
  const [logs, setLogs] = useState<VoiceLog[]>([
    {
      id: 'voice-welcome',
      command: '—',
      response: 'Voice control ready. Try “Water Monstera” or type a command below.',
      time: new Date().toISOString(),
      tone: 'info',
    },
  ])
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? '')
        .join(' ')
      setTranscript(text)
      if (event.results[event.results.length - 1]?.isFinal) {
        runCommand(text)
      }
    }
    recognition.onerror = () => {
      setListening(false)
      notify('Microphone access was blocked or unavailable.', 'warning')
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    return () => {
      try { recognition.stop() } catch { /* already stopped */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const speak = (text: string) => {
    if (!speakReplies || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    } catch {
      // Speech output is optional.
    }
  }

  const pushLog = (command: string, response: string, tone: VoiceLog['tone']) => {
    setLogs((current) => [{ id: `voice-${Date.now()}`, command, response, time: new Date().toISOString(), tone }, ...current].slice(0, 12))
    speak(response)
  }

  const runCommand = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    const lower = text.toLowerCase()
    const plant = state.plants.find((item) => lower.includes(item.name.toLowerCase()) || lower.includes(item.species.split(' ')[0].toLowerCase()))

    if (/(stop|halt|cancel)/.test(lower) && /(water|pump)/.test(lower)) {
      if (state.pump.status === 'ON') {
        stopPump()
        pushLog(text, 'Pump stopped. A safety cooldown is now active.', 'warning')
      } else {
        pushLog(text, 'The pump is not running, so there is nothing to stop.', 'info')
      }
      return
    }

    if (/(automatic|auto)/.test(lower) && /(on|enable|arm|start)/.test(lower)) {
      setAutoWatering(true)
      pushLog(text, 'Automatic watering armed. It will still follow sensor thresholds and hardware limits.', 'success')
      return
    }

    if (/(automatic|auto)/.test(lower) && /(off|disable|pause|stop)/.test(lower)) {
      setAutoWatering(false)
      pushLog(text, 'Automatic watering paused. Any pulse already running is unaffected.', 'warning')
      return
    }

    if (/(water|irrigate|drink)/.test(lower)) {
      if (!plant) {
        pushLog(text, 'I could not match a plant name. Try “Water Monstera” or “Water Pearl”.', 'warning')
        return
      }
      const result = manualWater(plant.id, plant.wateringDuration)
      pushLog(text, result.ok ? `Watering ${plant.name} for ${Math.min(plant.wateringDuration, state.settings.maxRuntime)} seconds. ${result.message}.` : `Blocked: ${result.message}`, result.ok ? 'success' : 'warning')
      return
    }

    if (/(moisture|reading|sensor)/.test(lower)) {
      const target = plant ?? state.plants[0]
      if (!target) {
        pushLog(text, 'No plants are in the garden yet.', 'warning')
        return
      }
      pushLog(text, `${target.name} is at ${target.moisture}% soil moisture against a ${target.threshold}% threshold.`, 'info')
      return
    }

    if (/(status|how is|system|device|reservoir)/.test(lower)) {
      pushLog(
        text,
        `Device ${state.device.online ? 'online' : 'offline'}, reservoir ${Math.round(state.device.reservoir)}%, pump ${state.pump.status.toLowerCase()}, automatic watering ${state.autoWatering ? 'armed' : 'paused'}.`,
        'info',
      )
      return
    }

    pushLog(text, 'I did not recognise that command. Try “Water Monstera”, “Stop watering”, “Check moisture” or “System status”.', 'warning')
  }

  const startListening = () => {
    if (!supported) return notify('Speech recognition is not available in this browser. Type a command instead.', 'warning')
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    setTranscript('')
    try {
      recognitionRef.current?.start()
      setListening(true)
    } catch {
      setListening(false)
      notify('Could not start the microphone. Check browser permissions.', 'warning')
    }
  }

  const submitTyped = () => {
    if (!input.trim()) return
    runCommand(input)
    setInput('')
  }

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Voice control"
        subtitle="Hands-free care with the same safety checks as the buttons. Voice can never bypass pump limits or the low-water lockout."
        icon={Mic}
        actions={
          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
            <Volume2 className="h-3.5 w-3.5 text-muted" />
            <span className="text-[10px] font-semibold text-soft">Speak replies</span>
            <Toggle checked={speakReplies} onChange={setSpeakReplies} label="Speak replies" />
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="panel relative overflow-hidden p-5 sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
          <div className="relative flex flex-col items-center text-center">
            <span className={cn('mb-4 chip', supported ? 'chip-green' : 'chip-amber')}>
              {supported ? <><Check className="h-2.5 w-2.5" /> Browser speech recognition available</> : <><AlertTriangle className="h-2.5 w-2.5" /> Speech recognition unavailable — use typed commands</>}
            </span>

            <div className="relative">
              {listening && (
                <>
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
                  <span className="absolute -inset-4 animate-pulse rounded-full border border-emerald-400/30" />
                </>
              )}
              <button
                type="button"
                onClick={startListening}
                aria-pressed={listening}
                aria-label={listening ? 'Stop listening' : 'Start voice command'}
                className={cn(
                  'relative grid h-28 w-28 place-items-center rounded-full text-white shadow-float transition-all duration-300',
                  listening ? 'scale-105 bg-emerald-500' : 'bg-forest-900 hover:scale-105 dark:bg-lime-300 dark:text-forest-950',
                )}
              >
                {listening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
              </button>
            </div>

            <h2 className="mt-5 font-display text-lg font-bold tracking-[-0.03em] text-main">
              {listening ? 'Listening…' : 'Tap to speak'}
            </h2>
            <p className="mt-1 max-w-md text-[10.5px] leading-5 text-muted">
              {listening ? 'Say a command such as “Water Monstera” or “System status”.' : 'Microphone audio is processed by your browser in this demo. Commands are matched locally by keyword.'}
            </p>

            <div className="mt-4 min-h-[54px] w-full max-w-lg rounded-2xl border border-line bg-surface-2 px-4 py-3 text-left">
              <p className="text-[8px] font-bold uppercase tracking-wide text-muted">Heard</p>
              <p className={cn('mt-0.5 text-[12px]', transcript ? 'text-main' : 'text-muted')}>{transcript || 'Waiting for a command…'}</p>
            </div>

            <div className="mt-3 flex w-full max-w-lg gap-2">
              <div className="relative flex-1">
                <Command className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') submitTyped() }}
                  placeholder="Type a command, e.g. “Check moisture”"
                  className="input !pl-9"
                  aria-label="Type a voice-style command"
                />
              </div>
              <button type="button" onClick={submitTyped} className="btn-primary !px-3.5" aria-label="Run typed command"><Send className="h-4 w-4" /></button>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {['Water Monstera', 'Check moisture', 'System status', 'Pause automatic watering'].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => { setInput(example); runCommand(example) }}
                  className="rounded-full border border-line bg-surface px-2.5 py-1 text-[9px] font-semibold text-soft transition hover:border-emerald-300 hover:text-main"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main"><Command className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> Command guide</h2>
            <div className="mt-3 space-y-2.5">
              {commandGuide.map((item) => (
                <div key={item.phrase} className="flex gap-2.5">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-soft"><item.icon className="h-3.5 w-3.5" /></span>
                  <div>
                    <p className="text-[10px] font-bold text-main">{item.phrase}</p>
                    <p className="text-[9px] leading-4 text-muted">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <InfoBanner icon={ShieldCheck} title="Voice obeys the same interlocks" tone="success">
            “Water” commands call the identical manual-watering function as the app. Offline device, emergency shutdown, cooldown, daily-cycle cap and low reservoir all still block the pump.
          </InfoBanner>

          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main"><VolumeX className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> Privacy note</h2>
            <p className="mt-1.5 text-[9.5px] leading-4.5 text-muted">
              This demo uses your browser's speech API when available. Audio is handled by the browser vendor, not this app. If you are uncomfortable, use the typed command field — it exercises the same logic.
            </p>
          </div>
        </aside>
      </div>

      <section className="panel mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
          <div>
            <h2 className="font-display text-sm font-bold text-main">Command history</h2>
            <p className="text-[10px] text-muted">Session only · newest first</p>
          </div>
          <span className="chip-neutral">{logs.length} entries</span>
        </div>
        <div className="divide-y divide-[color:var(--line)]">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 px-4 py-3 sm:px-5">
              <span className={cn('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg', log.tone === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : log.tone === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300')}>
                {log.tone === 'success' ? <Check className="h-3.5 w-3.5" /> : log.tone === 'warning' ? <AlertTriangle className="h-3.5 w-3.5" /> : <AudioLines className="h-3.5 w-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                {log.command !== '—' && <p className="text-[10px] font-bold text-main">“{log.command}”</p>}
                <p className="text-[9.5px] leading-4 text-muted">{log.response}</p>
              </div>
              <span className="shrink-0 text-[8px] text-muted">{formatTime(log.time)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
