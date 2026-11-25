import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  ImagePlus,
  Leaf,
  Lightbulb,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn, moistureStatus, timeAgo } from '../lib/utils'
import { PageHeader, StatusDot } from '../components/ui'

function MessageBody({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, index) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={index} className="h-1" />
        const isBullet = trimmed.startsWith('•') || /^\d+\./.test(trimmed)
        const content = trimmed.replace(/^•\s?/, '').replace(/^\d+\.\s?/, '')
        const parts = content.split(/(\*\*.*?\*\*)/g)
        const rendered = parts.map((part, partIndex) =>
          part.startsWith('**') && part.endsWith('**') ? <strong key={partIndex} className="font-semibold text-main">{part.slice(2, -2)}</strong> : <span key={partIndex}>{part}</span>,
        )
        if (isBullet) {
          return (
            <div key={index} className="flex gap-2 pl-0.5 text-[11.5px] leading-5 text-soft">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
              <span>{rendered}</span>
            </div>
          )
        }
        return <p key={index} className="text-[11.5px] leading-5 text-soft">{rendered}</p>
      })}
    </div>
  )
}

const suggestions = [
  { icon: AlertCircle, text: 'Why are my plant leaves turning yellow?' },
  { icon: Droplets, text: 'Is my plant receiving too much water?' },
  { icon: Sun, text: 'How much light does my Monstera need?' },
  { icon: Sprout, text: 'Why is my plant growing slowly?' },
]

export default function AssistantPage() {
  const { state, activePlant, askAssistant, clearChat, aiThinking, notify } = useApp()
  const [input, setInput] = useState('')
  const [image, setImage] = useState<string | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [state.chat, aiThinking])

  const submit = () => {
    if (!input.trim() && !image) return
    askAssistant(input, image)
    setInput('')
    setImage(undefined)
    if (textRef.current) textRef.current.style.height = 'auto'
  }

  const upload = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return notify('Please choose an image file.', 'warning')
    if (file.size > 3 * 1024 * 1024) return notify('Keep images under 3 MB for this demo.', 'warning')
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  const handleKey = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const plantStatus = activePlant ? moistureStatus(activePlant.moisture, activePlant.threshold, activePlant.maxMoisture) : null

  return (
    <div>
      <PageHeader
        eyebrow="Plant intelligence"
        title="Ask Flora"
        subtitle="Your AI plant-care assistant for general guidance, symptom checks and care planning."
        icon={MessageCircle}
        actions={
          <>
            <button type="button" onClick={clearChat} className="btn-secondary"><RotateCcw className="h-3.5 w-3.5" /> New conversation</button>
            <Link to="/recommendations" className="btn-primary"><Sparkles className="h-3.5 w-3.5" /> AI recommendations</Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_310px]">
        <div className="panel flex h-[calc(100vh-220px)] min-h-[560px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest-900 text-lime-300 dark:bg-lime-300 dark:text-forest-950"><Bot className="h-5 w-5" /></span>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[color:var(--surface)] bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-main">Flora</p>
                  <span className="rounded-full bg-lime-100 px-1.5 py-0.5 text-[7px] font-extrabold uppercase tracking-wide text-forest-800 dark:bg-lime-300/10 dark:text-lime-300">AI</span>
                </div>
                <p className="text-[9px] text-muted">Plant-care assistant · online demo</p>
              </div>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 sm:flex">
              <ShieldCheck className="h-3 w-3" /> Cannot control the pump
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-surface-2/40 px-4 py-5 sm:px-5">
            <div className="mx-auto max-w-2xl space-y-4">
              {state.chat.map((message) => (
                <div key={message.id} className={cn('flex gap-2.5', message.role === 'user' && 'justify-end')}>
                  {message.role === 'assistant' && (
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-forest-900 text-lime-300 dark:bg-lime-300 dark:text-forest-950"><Leaf className="h-4 w-4" /></span>
                  )}
                  <div className={cn('max-w-[88%] sm:max-w-[82%]', message.role === 'user' && 'order-first')}>
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 shadow-sm',
                        message.role === 'assistant'
                          ? 'rounded-tl-md border border-line bg-surface'
                          : 'rounded-tr-md bg-forest-900 text-white dark:bg-lime-300 dark:text-forest-950',
                      )}
                    >
                      {message.image && <img src={message.image} alt="Uploaded plant" className="mb-2 max-h-64 w-full rounded-xl object-cover" />}
                      {message.role === 'assistant' ? (
                        <MessageBody text={message.content} />
                      ) : (
                        <p className="text-[11.5px] leading-5">{message.content}</p>
                      )}
                    </div>
                    <p className={cn('mt-1 text-[8px] text-muted', message.role === 'user' ? 'text-right' : '')}>
                      {message.role === 'assistant' ? 'Flora · guidance, not a guaranteed diagnosis' : 'You'} · {timeAgo(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {aiThinking && (
                <div className="flex gap-2.5">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-forest-900 text-lime-300 dark:bg-lime-300 dark:text-forest-950"><Leaf className="h-4 w-4" /></span>
                  <div className="rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3">
                    <div className="loading-dots flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="ml-2 text-[9px] text-muted">Flora is thinking…</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-line bg-surface p-3 sm:p-4">
            {state.chat.length <= 1 && (
              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.text}
                    type="button"
                    onClick={() => setInput(suggestion.text)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1.5 text-[9px] font-medium text-soft transition hover:border-emerald-300 hover:text-main"
                  >
                    <suggestion.icon className="h-3 w-3 text-emerald-700 dark:text-emerald-300" />
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}
            {image && (
              <div className="mb-2 flex items-center gap-2 rounded-xl bg-surface-2 p-2">
                <img src={image} alt="Upload preview" className="h-10 w-10 rounded-lg object-cover" />
                <p className="flex-1 text-[9px] text-muted">Photo attached · image-based guidance is not a guarantee</p>
                <button type="button" onClick={() => setImage(undefined)} className="grid h-6 w-6 place-items-center rounded-lg text-muted hover:bg-surface hover:text-main" aria-label="Remove image"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
            <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface p-1.5 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/10">
              <button type="button" onClick={() => fileRef.current?.click()} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-main" aria-label="Upload plant photo">
                <ImagePlus className="h-4.5 w-4.5" />
              </button>
              <textarea
                ref={textRef}
                value={input}
                onChange={(event) => {
                  setInput(event.target.value)
                  event.target.style.height = 'auto'
                  event.target.style.height = `${Math.min(100, event.target.scrollHeight)}px`
                }}
                onKeyDown={handleKey}
                rows={1}
                placeholder="Ask about yellow leaves, watering, light, pests…"
                className="max-h-[100px] min-h-[36px] flex-1 resize-none bg-transparent px-1 py-2 text-xs leading-5 text-main outline-none placeholder:text-muted"
                aria-label="Message Flora"
              />
              <button type="button" onClick={submit} disabled={!input.trim() && !image} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest-900 text-lime-300 transition hover:bg-forest-800 disabled:opacity-30 dark:bg-lime-300 dark:text-forest-950" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
            <p className="mt-1.5 text-center text-[8px] text-muted">Demo AI responses are generated locally from plant-care rules. Not veterinary or professional botanical advice.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Plant context</p>
              <span className="chip-green"><StatusDot tone="green" /> Live</span>
            </div>
            {activePlant && (
              <>
                <div className="mt-3 flex items-center gap-2.5">
                  <img src={activePlant.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-bold text-main">{activePlant.name}</p>
                    <p className="truncate text-[9px] italic text-muted">{activePlant.species}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-surface-2 p-2">
                    <p className="text-[8px] text-muted">Moisture</p>
                    <p className="text-sm font-bold text-main">{activePlant.moisture}%</p>
                    <p className={cn('text-[8px] font-semibold', plantStatus?.tone === 'amber' ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300')}>{plantStatus?.label}</p>
                  </div>
                  <div className="rounded-lg bg-surface-2 p-2">
                    <p className="text-[8px] text-muted">Threshold</p>
                    <p className="text-sm font-bold text-main">{activePlant.threshold}%</p>
                    <p className="text-[8px] text-muted">{activePlant.room}</p>
                  </div>
                </div>
                <p className="mt-2.5 text-[9px] leading-5 text-muted">{activePlant.notes}</p>
                <Link to={`/plants/${activePlant.id}`} className="mt-3 flex items-center justify-between rounded-lg bg-surface-2 px-2.5 py-2 text-[9px] font-semibold text-soft transition hover:bg-[color:var(--surface-3)]">
                  View care profile <ChevronRight className="h-3 w-3" />
                </Link>
              </>
            )}
          </div>

          <div className="panel p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Conversation history</p>
            <div className="mt-3 space-y-1.5">
              <button type="button" className="flex w-full items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-2 text-left dark:bg-emerald-500/10">
                <Clock3 className="h-3 w-3 text-emerald-700 dark:text-emerald-300" />
                <span className="text-[9px] font-semibold text-main">Current conversation</span>
                <span className="ml-auto rounded-full bg-surface px-1.5 text-[8px] text-muted">{state.chat.length}</span>
              </button>
              <div className="flex items-center gap-2 px-2.5 py-2 text-[9px] text-muted"><MessageCircle className="h-3 w-3" /> Yellow Monstera leaves<span className="ml-auto">2d</span></div>
              <div className="flex items-center gap-2 px-2.5 py-2 text-[9px] text-muted"><MessageCircle className="h-3 w-3" /> Aloe watering schedule<span className="ml-auto">5d</span></div>
            </div>
            <p className="mt-2 text-[8px] text-muted">Sample history. Only the current thread is saved.</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/[0.07]">
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-amber-900 dark:text-amber-200"><Lightbulb className="h-3.5 w-3.5" /> Honest AI</p>
            <p className="mt-1.5 text-[9px] leading-5 text-amber-900 dark:text-amber-200/70">
              A photo cannot confirm a diagnosis. Flora offers likely causes and next checks; consult a local plant specialist for severe or spreading problems.
            </p>
          </div>

          <div className="panel p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-bold text-main"><Camera className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" /> Photo tips</p>
            <ul className="mt-2 space-y-1.5 text-[9px] leading-5 text-muted">
              <li>• Use natural, indirect light.</li>
              <li>• Include the whole plant and pot.</li>
              <li>• Add a close-up of the affected leaf.</li>
              <li>• Avoid filters or heavy shadows.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
