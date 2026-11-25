import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  Activity,
  AppNotification,
  AppState,
  CareTask,
  ChatMessage,
  Device,
  FamilyMember,
  GrowthEntry,
  Language,
  Plant,
  Recommendation,
  Settings,
  Theme,
  User,
} from './types'
import { seedState } from './seed'
import { translate } from './i18n'
import { clamp, uid } from './utils'

interface Account extends User {
  password: string
}

interface Toast {
  id: string
  message: string
  tone: 'success' | 'info' | 'warning' | 'error'
}

interface ActionResult {
  ok: boolean
  message: string
}

interface AppContextValue {
  state: AppState
  user: User | null
  activePlantId: string
  activePlant: Plant | undefined
  setActivePlantId: (id: string) => void
  theme: Theme
  language: Language
  t: (key: string) => string
  toast: Toast | null
  notify: (message: string, tone?: Toast['tone']) => void
  login: (email: string, password: string, remember: boolean) => ActionResult
  demoLogin: () => void
  signup: (name: string, email: string, password: string) => ActionResult
  resetPassword: (email: string, newPassword: string) => ActionResult
  logout: () => void
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  setAutoWatering: (on: boolean) => void
  toggleAutoWatering: () => void
  manualWater: (plantId: string, duration: number) => ActionResult
  stopPump: () => void
  setDeviceOnline: (online: boolean) => void
  updateDevice: (patch: Partial<Device>) => void
  addPlant: (plant: Omit<Plant, 'id' | 'createdAt'>) => void
  updatePlant: (plant: Plant) => void
  deletePlant: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  updateNotificationSettings: (patch: Partial<Settings['notifications']>) => void
  nextPlantName: () => string
  addTask: (task: Omit<CareTask, 'id'>) => void
  updateTask: (task: CareTask) => void
  deleteTask: (id: string) => void
  addGrowthEntry: (entry: Omit<GrowthEntry, 'id'>) => void
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void
  updateFamilyRole: (id: string, role: FamilyMember['role']) => void
  removeFamilyMember: (id: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  decideRecommendation: (id: string, decision: 'accepted' | 'rejected') => void
  askAssistant: (message: string, image?: string) => void
  clearChat: () => void
  aiThinking: boolean
  resetDemo: () => void
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
  addCareTaskComplete: (id: string) => void
}

const ACCOUNTS_KEY = 'plantcare_accounts_v1'
const SESSION_KEY = 'plantcare_session_v1'
const THEME_KEY = 'plantcare_theme_v1'
const appStateKey = (userId: string) => `plantcare_state_${userId}`

const demoAccount: Account = {
  id: 'demo-user',
  name: 'Nadeesha Perera',
  email: 'demo@plantcare.ai',
  password: 'demo1234',
  avatar: 'NP',
  plan: 'Grower Pro',
  joined: '2025-03-18',
}

function readAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Account[]
      if (!parsed.some((account) => account.id === demoAccount.id)) parsed.unshift(demoAccount)
      return parsed
    }
  } catch {
    // Fall through to the demo account.
  }
  return [demoAccount]
}

function saveAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function readSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const account = JSON.parse(raw) as Account
    const accounts = readAccounts()
    const latest = accounts.find((item) => item.id === account.id)
    if (!latest) return null
    const { password: _password, ...user } = latest
    return user
  } catch {
    return null
  }
}

function loadState(userId: string): AppState {
  try {
    const raw = localStorage.getItem(appStateKey(userId))
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed.plants?.length && parsed.settings) return parsed
    }
  } catch {
    // Corrupt or older data gets a clean demo state.
  }
  return seedState()
}

const AppContext = createContext<AppContextValue | null>(null)

const makeResponse = (message: string, hasImage: boolean, plants: Plant[], activePlant?: Plant) => {
  const lower = message.toLowerCase()
  if (hasImage) {
    return `Thanks for sharing the photo. I can see the overall leaf colour and posture, but a photo alone cannot confirm a disease or pest with certainty.

Based on what is visible, start with these checks:
• Look under the leaves and along stems for tiny webs, sticky residue or insects.
• Check the top 3–4 cm of soil before watering — a photo cannot show moisture reliably.
• Note whether the affected leaves are old or new; that changes the likely cause.

If you tell me the plant species, watering routine and any recent changes (repotting, moving, fertiliser), I can narrow the possibilities. For a firm diagnosis, a local plant specialist may need to inspect a sample.`
  }

  if (/(yellow|yellowing|pale)/.test(lower)) {
    return `Yellow leaves are usually a signal, not a diagnosis. The three most common causes are:

1. **Overwatering / poor drainage** — check that the top few centimetres of soil dry between waterings and that the pot drains freely.
2. **Natural ageing** — occasional yellow leaves at the base are normal; several at once are not.
3. **Light or nutrient stress** — very low light or a long gap since feeding can also cause pale growth.

For your ${activePlant?.species ?? 'plant'}, keep soil moisture around ${activePlant ? `${activePlant.threshold}–${activePlant.maxMoisture}%` : 'the configured range'}. If the yellowing leaves are soft and limp, hold off watering and inspect the roots. If they are dry and crispy, the issue may be underwatering or low humidity.`
  }

  if (/(too much|overwater|soggy|root rot)/.test(lower)) {
    return `The best test is the soil, not the calendar. Before the next watering, check 3–4 cm below the surface. If it still feels moist, wait.

Signs that point toward overwatering:
• limp or yellowing lower leaves
• wet, compacted soil that stays damp for many days
• a musty smell or dark, soft roots
• fungus gnats around the pot

Your ${activePlant?.name ?? 'plant'} currently reads **${activePlant?.moisture ?? 62}% moisture** against a **${activePlant?.threshold ?? 45}% threshold**. If the reading stays high for several days, reduce watering duration or improve drainage. When in doubt, less water is safer than more.`
  }

  if (/(how often|frequency|water my|watering schedule)/.test(lower)) {
    const species = activePlant?.species ?? 'Monstera deliciosa'
    return `A safe starting point for **${species}** is to water when the top layer of soil is dry and the sensor reading approaches its threshold. For ${activePlant?.name ?? 'your Monstera'}, that threshold is **${activePlant?.threshold ?? 45}%**.

A practical routine:
• Check the live moisture card instead of a fixed day count.
• Water in a short pulse, then let the soil rebalance for 10 minutes.
• Expect slower watering in winter and after repotting.

With your current pot and soil mix, the automatic system is configured for roughly every 6–8 days when conditions are warm. Adjust the threshold rather than extending the pump runtime.`
  }

  if (/(slow|not growing|small leaves|growth)/.test(lower)) {
    return `Slow growth is often a light or energy problem before it is a watering problem. Check these in order:

1. **Light** — most foliage plants need bright, indirect light. If the room is dim, move the plant closer to a window.
2. **Season** — growth naturally slows in cool months.
3. **Root space** — if roots circle the surface or emerge from drainage holes, consider repotting in the right season.
4. **Nutrition** — feed lightly during active growth, not every watering.
5. **Water stress** — chronic over- or underwatering both reduce new growth.

Your care notes for ${activePlant?.name ?? 'this plant'} say “${activePlant?.light ?? 'bright indirect light'}”. Keep an eye on the newest leaf size and colour over the next 3–4 weeks.`
  }

  if (/(pest|bug|gnat|spider mite|insect|sticky|webbing)/.test(lower)) {
    return `Pests are usually visible with a close inspection. Check the undersides of leaves, leaf joints and the top of the soil in good light.

Quick checks:
• **Spider mites** — fine webbing, tiny pale speckles.
• **Fungus gnats** — small flies near damp soil; let the top layer dry.
• **Mealybugs** — white cotton-like clusters.
• **Scale** — small brown bumps and sticky honeydew.

Isolate the plant, wipe visible insects with a damp cloth, and use an appropriate treatment labelled for indoor plants. A photo can suggest a possibility, but confirming the pest usually needs a close-up or physical inspection.`
  }

  if (/(sun|light|window|shade)/.test(lower)) {
    return `Light is measured by what the leaf actually receives, not just how bright the room feels.

For most common houseplants:
• **Bright indirect** — near an east or filtered south/west window; ideal for Monstera, Peace Lily and Pothos.
• **Direct sun** — succulents and Aloe; protect from harsh afternoon heat.
• **Low light** — Snake Plant tolerates it, but growth will slow.

Rotate the pot a quarter turn each week for even growth, and watch for scorched patches (too much direct sun) or stretched, pale stems (too little light).`
  }

  if (/(fertil|nutrient|feed)/.test(lower)) {
    return `Feed according to active growth, not the calendar alone. A balanced liquid fertiliser at half strength every 3–4 weeks during spring and summer is a sensible baseline for many foliage plants. Reduce or pause feeding in winter.

Avoid feeding a very dry or stressed plant — water lightly first. If leaf tips are brown and the soil is not dry, overfeeding may be the cause. Flush the pot with plain water and let it drain fully.`
  }

  if (/(humidity|mist|brown tip|crispy)/.test(lower)) {
    return `Crispy leaf tips can come from low humidity, inconsistent watering, or mineral build-up. Misting is usually temporary; a pebble tray or nearby humidifier helps more consistently.

For your space:
• Group humidity-loving plants together.
• Keep them away from air-conditioning draughts.
• Water thoroughly and let excess drain; never leave the pot standing in water.
• Brown tips on older leaves alone are not an emergency.`
  }

  if (/(monstera)/.test(lower)) {
    return `Monstera deliciosa likes bright, indirect light, a chunky well-draining mix, and a chance to dry slightly between waterings. For your plant, the configured range is **${activePlant?.threshold ?? 45}–${activePlant?.maxMoisture ?? 75}%**.

Aim for:
• Water when the top 3–5 cm is dry and the sensor approaches ${activePlant?.threshold ?? 45}%.
• A 10–15 second pulse is enough for a 20 cm pot; let it soak evenly and drain.
• Support aerial roots with a moss pole.
• Wipe leaves monthly so they can photosynthesise efficiently.`
  }

  return `I can help with that. To give you a useful answer, tell me:

• the plant species or name
• what you are seeing (leaf colour, drooping, spots, pests)
• when you last watered and whether the soil still feels damp
• any recent change in light, room temperature or pot size

You can also switch to one of your plants above so I can use its live moisture reading and care notes. I'm a demo care assistant: I can offer general guidance, but I cannot guarantee a diagnosis from a photo or replace a local plant professional.`
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readSession())
  const [state, setState] = useState<AppState>(() => {
    const session = readSession()
    return session ? loadState(session.id) : seedState()
  })
  const [activePlantId, setActivePlantId] = useState('plant-monstera')
  const [toast, setToast] = useState<Toast | null>(null)
  const [aiThinking, setAiThinking] = useState(false)
  const toastTimer = useRef<number | null>(null)

  const theme = state.settings.theme
  const language = state.settings.language
  const activePlant = state.plants.find((plant) => plant.id === activePlantId) ?? state.plants[0]

  const t = useCallback((key: string) => translate(language, key), [language])

  const notify = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ id: uid('toast'), message, tone })
    toastTimer.current = window.setTimeout(() => setToast(null), 4200)
  }, [])

  const setTheme = useCallback((nextTheme: Theme) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, theme: nextTheme } }))
  }, [])

  const setLanguage = useCallback((nextLanguage: Language) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, language: nextLanguage } }))
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#081711' : '#0E3D2E')
  }, [theme])

  useEffect(() => {
    if (user) localStorage.setItem(appStateKey(user.id), JSON.stringify(state))
  }, [state, user])

  const pushNotification = useCallback(
    (notification: Omit<AppNotification, 'id' | 'read' | 'time'>) => {
      setState((prev) => ({
        ...prev,
        notifications: [
          { ...notification, id: uid('note'), read: false, time: new Date().toISOString() },
          ...prev.notifications,
        ].slice(0, 20),
      }))
    },
    [],
  )

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    setState((prev) => ({
      ...prev,
      activities: [
        { ...activity, id: uid('activity'), timestamp: new Date().toISOString() },
        ...prev.activities,
      ].slice(0, 40),
    }))
  }, [])

  const login = useCallback((email: string, password: string, remember: boolean): ActionResult => {
    const accounts = readAccounts()
    const account = accounts.find((item) => item.email.toLowerCase() === email.trim().toLowerCase())
    if (!account) return { ok: false, message: 'No account found for that email. Try the demo account.' }
    if (account.password !== password) return { ok: false, message: 'That password does not match. Please try again.' }
    const { password: _password, ...safeUser } = account
    setUser(safeUser)
    setState(loadState(safeUser.id))
    setActivePlantId('plant-monstera')
    if (remember) localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
    notify(`Welcome back, ${safeUser.name.split(' ')[0]}.`)
    return { ok: true, message: 'Signed in' }
  }, [notify])

  const demoLogin = useCallback(() => {
    const { password: _password, ...safeUser } = demoAccount
    setUser(safeUser)
    setState(loadState(safeUser.id))
    setActivePlantId('plant-monstera')
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
    notify('Demo workspace loaded. Everything here is interactive.')
  }, [notify])

  const signup = useCallback((name: string, email: string, password: string): ActionResult => {
    const accounts = readAccounts()
    if (accounts.some((account) => account.email.toLowerCase() === email.trim().toLowerCase())) {
      return { ok: false, message: 'An account with this email already exists. Try logging in.' }
    }
    const newAccount: Account = {
      id: uid('user'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      avatar: name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join(''),
      plan: 'Home',
      joined: new Date().toISOString().slice(0, 10),
    }
    saveAccounts([...accounts, newAccount])
    const { password: _password, ...safeUser } = newAccount
    setUser(safeUser)
    setState(seedState())
    setActivePlantId('plant-monstera')
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
    notify('Your PlantCare AI workspace is ready.')
    return { ok: true, message: 'Account created' }
  }, [notify])

  const resetPassword = useCallback((email: string, newPassword: string): ActionResult => {
    const accounts = readAccounts()
    const index = accounts.findIndex((account) => account.email.toLowerCase() === email.trim().toLowerCase())
    if (index < 0) return { ok: false, message: 'No account found for that email.' }
    if (newPassword.length < 8) return { ok: false, message: 'Use at least 8 characters for your new password.' }
    accounts[index] = { ...accounts[index], password: newPassword }
    saveAccounts(accounts)
    return { ok: true, message: 'Password updated. You can log in now.' }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    setActivePlantId('plant-monstera')
    notify('You have been logged out.', 'info')
  }, [notify])

  const addToHistory = useCallback((plantId: string, duration: number, mode: 'auto' | 'manual', status: 'completed' | 'stopped' = 'completed') => {
    setState((prev) => ({
      ...prev,
      wateringEvents: [
        {
          id: uid('water'),
          plantId,
          date: new Date().toISOString(),
          durationSec: duration,
          liters: Number((duration * 0.028).toFixed(2)),
          mode,
          status,
        },
        ...prev.wateringEvents,
      ],
      pump: {
        ...prev.pump,
        dailyCycles: prev.pump.dailyCycles + 1,
        cooldownRemaining: Math.round(prev.settings.cooldownMinutes * 60),
      },
    }))
  }, [])

  const stopPump = useCallback(() => {
    setState((prev) => {
      if (prev.pump.status !== 'ON') return prev
      return {
        ...prev,
        pump: { ...prev.pump, status: 'COOLING', remaining: 0, mode: null, plantId: null, cooldownRemaining: 30 },
        activities: [
          {
            id: uid('activity'),
            type: 'safety',
            title: 'Watering stopped manually',
            detail: 'The pump was stopped by the user. A safety cooldown is active.',
            timestamp: new Date().toISOString(),
          },
          ...prev.activities,
        ],
      }
    })
    notify('Pump stopped safely. Cooldown started.', 'warning')
  }, [notify])

  const manualWater = useCallback((plantId: string, duration: number): ActionResult => {
    const plant = state.plants.find((item) => item.id === plantId)
    if (!plant) return { ok: false, message: 'Choose a plant first.' }
    if (!state.device.online) return { ok: false, message: 'Device is offline. Manual watering is unavailable.' }
    if (state.settings.emergencyShutdown) return { ok: false, message: 'Emergency shutdown is active. Re-enable the pump in Settings.' }
    if (state.pump.status === 'ON') return { ok: false, message: 'The pump is already running.' }
    if (state.pump.status === 'COOLING') return { ok: false, message: 'Pump cooldown is active. Please wait before watering again.' }
    if (state.pump.status === 'LOCKED' || state.pump.status === 'FAULT') return { ok: false, message: 'Pump safety lock is active. Check the device and settings.' }
    if (state.settings.lowWaterLockout && state.device.reservoir < 12) return { ok: false, message: 'Reservoir is too low. Refill before watering.' }
    if (state.pump.dailyCycles >= state.settings.maxDailyCycles) return { ok: false, message: 'Maximum daily watering cycles reached.' }
    const safeDuration = clamp(duration, 2, state.settings.maxRuntime)
    setState((prev) => ({
      ...prev,
      pump: {
        ...prev.pump,
        status: 'ON',
        plantId,
        mode: 'manual',
        remaining: safeDuration,
        cooldownRemaining: 0,
      },
      activities: [
        {
          id: uid('activity'),
          type: 'watering',
          title: 'Manual watering started',
          detail: `${plant.name} is being watered for ${safeDuration} seconds.`,
          timestamp: new Date().toISOString(),
          plantId,
        },
        ...prev.activities,
      ],
    }))
    notify(`Watering ${plant.name} for ${safeDuration}s.`, 'success')
    return { ok: true, message: 'Watering started' }
  }, [state, notify])

  const setAutoWatering = useCallback((on: boolean) => {
    setState((prev) => ({ ...prev, autoWatering: on }))
    notify(on ? 'Automatic watering is armed.' : 'Automatic watering is paused.', on ? 'success' : 'warning')
  }, [notify])

  const toggleAutoWatering = useCallback(() => setAutoWatering(!state.autoWatering), [setAutoWatering, state.autoWatering])

  const setDeviceOnline = useCallback((online: boolean) => {
    setState((prev) => ({
      ...prev,
      device: {
        ...prev.device,
        online,
        lastSeen: online ? new Date().toISOString() : prev.device.lastSeen,
        sensorHealth: prev.device.sensorHealth,
      },
      pump:
        !online && prev.pump.status === 'ON'
          ? { ...prev.pump, status: 'FAULT', remaining: 0, plantId: null }
          : prev.pump,
      lastSynced: online ? new Date().toISOString() : prev.lastSynced,
      activities: [
        {
          id: uid('activity'),
          type: 'device',
          title: online ? 'Device reconnected' : 'Device disconnected',
          detail: online
            ? 'Greenhouse Hub is back online. Stored readings have been synced.'
            : 'Local automatic watering and hardware safety continue on the ESP32.',
          timestamp: new Date().toISOString(),
        },
        ...prev.activities,
      ],
    }))
    notify(
      online
        ? 'Device reconnected. Offline readings synced.'
        : 'Device offline. ESP32 local watering and safety remain active.',
      online ? 'success' : 'warning',
    )
  }, [notify])

  const updateDevice = useCallback((patch: Partial<Device>) => {
    setState((prev) => ({ ...prev, device: { ...prev.device, ...patch } }))
  }, [])

  useEffect(() => {
    if (!user) return
    const interval = window.setInterval(() => {
      setState((prev) => {
        if (!prev.device.online) return prev
        const now = new Date().toISOString()
        const plants = prev.plants.map((plant) => {
          const drift = Math.random() < 0.5 ? -0.45 : 0.18
          return { ...plant, moisture: Math.round(clamp(plant.moisture + drift, 12, 94)) }
        })
        let pump = prev.pump
        let activities = prev.activities
        let autoStarted = false

        if (
          prev.autoWatering &&
          prev.pump.status === 'OFF' &&
          prev.device.reservoir > 12 &&
          !prev.settings.emergencyShutdown &&
          prev.pump.dailyCycles < prev.settings.maxDailyCycles
        ) {
          const candidate = plants.find((plant) => plant.autoWater && plant.moisture <= plant.threshold)
          if (candidate) {
            const duration = Math.min(candidate.wateringDuration, prev.settings.maxRuntime)
            pump = {
              ...prev.pump,
              status: 'ON',
              plantId: candidate.id,
              mode: 'auto',
              remaining: duration,
              cooldownRemaining: 0,
            }
            activities = [
              {
                id: uid('activity'),
                type: 'watering',
                title: 'Automatic watering started',
                detail: `Moisture in ${candidate.name} reached ${candidate.moisture}% (threshold ${candidate.threshold}%).`,
                timestamp: now,
                plantId: candidate.id,
              },
              ...activities,
            ]
            autoStarted = true
          }
        }

        return {
          ...prev,
          plants: autoStarted ? plants : plants,
          pump,
          activities,
          lastSynced: now,
          device: { ...prev.device, lastSeen: now },
        }
      })
    }, 16_000)
    return () => window.clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (!user) return
    const interval = window.setInterval(() => {
      setState((prev) => {
        if (prev.pump.status === 'ON' && prev.pump.plantId) {
          if (prev.pump.remaining <= 1) {
            const plant = prev.plants.find((item) => item.id === prev.pump.plantId)
            const duration = plant?.wateringDuration ?? 10
            const nextPlants = prev.plants.map((item) =>
              item.id === prev.pump.plantId
                ? {
                    ...item,
                    moisture: Math.round(clamp(item.moisture + 8, 20, 92)),
                    lastWatered: new Date().toISOString(),
                  }
                : item,
            )
            return {
              ...prev,
              plants: nextPlants,
              pump: {
                ...prev.pump,
                status: 'COOLING',
                remaining: 0,
                mode: null,
                cooldownRemaining: Math.round(prev.settings.cooldownMinutes * 60),
                dailyCycles: prev.pump.dailyCycles + 1,
              },
              device: {
                ...prev.device,
                reservoir: Math.max(0, Number((prev.device.reservoir - 0.9).toFixed(1))),
              },
              wateringEvents: [
                {
                  id: uid('water'),
                  plantId: prev.pump.plantId,
                  date: new Date().toISOString(),
                  durationSec: duration,
                  liters: Number((duration * 0.028).toFixed(2)),
                  mode: prev.pump.mode ?? 'manual',
                  status: 'completed',
                },
                ...prev.wateringEvents,
              ],
              activities: [
                {
                  id: uid('activity'),
                  type: 'watering',
                  title: 'Watering completed',
                  detail: `${plant?.name ?? 'Plant'} received ${duration} seconds of water. Pump cooldown started.`,
                  timestamp: new Date().toISOString(),
                  plantId: prev.pump.plantId ?? undefined,
                },
                ...prev.activities,
              ],
              notifications: prev.settings.notifications.wateringComplete
                ? [
                    {
                      id: uid('note'),
                      title: 'Watering completed',
                      message: `${plant?.name ?? 'Plant'} was watered successfully.`,
                      time: new Date().toISOString(),
                      read: false,
                      type: 'water' as const,
                    },
                    ...prev.notifications,
                  ].slice(0, 20)
                : prev.notifications,
            }
          }
          return {
            ...prev,
            pump: { ...prev.pump, remaining: prev.pump.remaining - 1 },
            device: {
              ...prev.device,
              reservoir: Math.max(0, Number((prev.device.reservoir - 0.04).toFixed(2))),
            },
          }
        }
        if (prev.pump.status === 'COOLING' && prev.pump.cooldownRemaining > 0) {
          return { ...prev, pump: { ...prev.pump, cooldownRemaining: prev.pump.cooldownRemaining - 1 } }
        }
        if (prev.pump.status === 'COOLING' && prev.pump.cooldownRemaining <= 0) {
          return { ...prev, pump: { ...prev.pump, status: 'OFF' } }
        }
        return prev
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [user])

  const addPlant = useCallback((plant: Omit<Plant, 'id' | 'createdAt'>) => {
    const newPlant: Plant = { ...plant, id: uid('plant'), createdAt: new Date().toISOString() }
    setState((prev) => ({
      ...prev,
      plants: [...prev.plants, newPlant],
      activities: [
        {
          id: uid('activity'),
          type: 'care',
          title: 'New plant added',
          detail: `${newPlant.name} (${newPlant.species}) joined My Plants.`,
          timestamp: new Date().toISOString(),
          plantId: newPlant.id,
        },
        ...prev.activities,
      ],
    }))
    setActivePlantId(newPlant.id)
    notify(`${newPlant.name} added to your garden.`)
  }, [notify])

  const updatePlant = useCallback((plant: Plant) => {
    setState((prev) => ({ ...prev, plants: prev.plants.map((item) => (item.id === plant.id ? plant : item)) }))
    notify('Plant details updated.')
  }, [notify])

  const deletePlant = useCallback((id: string) => {
    setState((prev) => {
      const plant = prev.plants.find((item) => item.id === id)
      return {
        ...prev,
        plants: prev.plants.filter((item) => item.id !== id),
        activities: [
          {
            id: uid('activity'),
            type: 'care',
            title: 'Plant removed',
            detail: `${plant?.name ?? 'Plant'} was removed from the dashboard.`,
            timestamp: new Date().toISOString(),
          },
          ...prev.activities,
        ],
      }
    })
    setActivePlantId((current) => (current === id ? 'plant-monstera' : current))
    notify('Plant deleted.', 'info')
  }, [notify])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
    notify('Settings saved.')
  }, [notify])

  const updateNotificationSettings = useCallback((patch: Partial<Settings['notifications']>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, notifications: { ...prev.settings.notifications, ...patch } },
    }))
  }, [])

  const nextPlantName = useCallback(() => `New plant ${state.plants.length + 1}`, [state.plants.length])

  const addTask = useCallback((task: Omit<CareTask, 'id'>) => {
    setState((prev) => ({ ...prev, careTasks: [{ ...task, id: uid('task') }, ...prev.careTasks] }))
    notify('Care task added to your calendar.')
  }, [notify])

  const updateTask = useCallback((task: CareTask) => {
    setState((prev) => ({ ...prev, careTasks: prev.careTasks.map((item) => (item.id === task.id ? task : item)) }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({ ...prev, careTasks: prev.careTasks.filter((item) => item.id !== id) }))
    notify('Care task removed.', 'info')
  }, [notify])

  const addCareTaskComplete = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      careTasks: prev.careTasks.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    }))
  }, [])

  const addGrowthEntry = useCallback((entry: Omit<GrowthEntry, 'id'>) => {
    setState((prev) => ({
      ...prev,
      growthEntries: [{ ...entry, id: uid('growth') }, ...prev.growthEntries],
    }))
    notify('Growth photo added to the timeline.')
  }, [notify])

  const addFamilyMember = useCallback((member: Omit<FamilyMember, 'id'>) => {
    setState((prev) => ({ ...prev, family: [...prev.family, { ...member, id: uid('family') }] }))
    notify(`Invitation prepared for ${member.email}. Demo only — no email was sent.`, 'info')
  }, [notify])

  const updateFamilyRole = useCallback((id: string, role: FamilyMember['role']) => {
    setState((prev) => ({
      ...prev,
      family: prev.family.map((member) => (member.id === id ? { ...member, role } : member)),
    }))
    notify('Access role updated.')
  }, [notify])

  const removeFamilyMember = useCallback((id: string) => {
    setState((prev) => ({ ...prev, family: prev.family.filter((member) => member.id !== id) }))
    notify('Family member removed.', 'info')
  }, [notify])

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((note) => (note.id === id ? { ...note, read: true } : note)),
    }))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({ ...prev, notifications: prev.notifications.map((note) => ({ ...note, read: true })) }))
  }, [])

  const clearNotifications = useCallback(() => {
    setState((prev) => ({ ...prev, notifications: [] }))
    notify('Notifications cleared.', 'info')
  }, [notify])

  const decideRecommendation = useCallback((id: string, decision: 'accepted' | 'rejected') => {
    setState((prev) => {
      const recommendation = prev.recommendations.find((item) => item.id === id)
      if (!recommendation) return prev
      return {
        ...prev,
        recommendations: prev.recommendations.map((item) => (item.id === id ? { ...item, status: decision } : item)),
        plants:
          decision === 'accepted'
            ? prev.plants.map((plant) =>
                plant.id === recommendation.plantId
                  ? {
                      ...plant,
                      threshold: clamp(recommendation.threshold, Math.max(12, plant.minMoisture), plant.maxMoisture),
                      wateringDuration: clamp(recommendation.duration, 2, prev.settings.maxRuntime),
                    }
                  : plant,
              )
            : prev.plants,
        activities: [
          {
            id: uid('activity'),
            type: 'care',
            title: decision === 'accepted' ? 'AI recommendation accepted' : 'AI recommendation dismissed',
            detail:
              decision === 'accepted'
                ? 'The recommendation was applied within hardware safety limits.'
                : 'Your existing plant settings were kept.',
            timestamp: new Date().toISOString(),
            plantId: recommendation.plantId,
          },
          ...prev.activities,
        ],
      }
    })
    notify(decision === 'accepted' ? 'Recommendation applied within safety limits.' : 'Recommendation dismissed.', decision === 'accepted' ? 'success' : 'info')
  }, [notify])

  const askAssistant = useCallback((message: string, image?: string) => {
    const text = message.trim()
    if (!text && !image) return
    const userMessage: ChatMessage = {
      id: uid('chat'),
      role: 'user',
      content: text || 'Please look at this plant photo.',
      image,
      timestamp: new Date().toISOString(),
    }
    setState((prev) => ({ ...prev, chat: [...prev.chat, userMessage] }))
    setAiThinking(true)
    window.setTimeout(() => {
      setState((prev) => {
        const response = makeResponse(text, Boolean(image), prev.plants, prev.plants.find((plant) => plant.id === activePlantId))
        return {
          ...prev,
          chat: [
            ...prev.chat,
            { id: uid('chat'), role: 'assistant', content: response, timestamp: new Date().toISOString() },
          ],
        }
      })
      setAiThinking(false)
    }, 900)
  }, [activePlantId])

  const clearChat = useCallback(() => {
    setState((prev) => ({
      ...prev,
      chat: [
        {
          id: uid('chat'),
          role: 'assistant',
          content: 'Fresh start. Tell me what you are seeing on your plant, or upload a photo for general observations.',
          timestamp: new Date().toISOString(),
        },
      ],
    }))
    notify('Chat history cleared.', 'info')
  }, [notify])

  const resetDemo = useCallback(() => {
    setState(seedState())
    setActivePlantId('plant-monstera')
    notify('Demo workspace reset.', 'info')
  }, [notify])

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      user,
      activePlantId,
      activePlant,
      setActivePlantId,
      theme,
      language,
      t,
      toast,
      notify,
      login,
      demoLogin,
      signup,
      resetPassword,
      logout,
      setTheme,
      setLanguage,
      setAutoWatering,
      toggleAutoWatering,
      manualWater,
      stopPump,
      setDeviceOnline,
      updateDevice,
      addPlant,
      updatePlant,
      deletePlant,
      updateSettings,
      updateNotificationSettings,
      nextPlantName,
      addTask,
      updateTask,
      deleteTask,
      addGrowthEntry,
      addFamilyMember,
      updateFamilyRole,
      removeFamilyMember,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      decideRecommendation,
      askAssistant,
      clearChat,
      aiThinking,
      resetDemo,
      addActivity,
      addCareTaskComplete,
    }),
    [
      state,
      user,
      activePlantId,
      activePlant,
      theme,
      language,
      t,
      toast,
      notify,
      login,
      demoLogin,
      signup,
      resetPassword,
      logout,
      setTheme,
      setLanguage,
      setAutoWatering,
      toggleAutoWatering,
      manualWater,
      stopPump,
      setDeviceOnline,
      updateDevice,
      addPlant,
      updatePlant,
      deletePlant,
      updateSettings,
      updateNotificationSettings,
      nextPlantName,
      addTask,
      updateTask,
      deleteTask,
      addCareTaskComplete,
      addGrowthEntry,
      addFamilyMember,
      updateFamilyRole,
      removeFamilyMember,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      decideRecommendation,
      askAssistant,
      clearChat,
      aiThinking,
      resetDemo,
      addActivity,
    ],
  )

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-fadeUp">
          <div
            className={[
              'flex items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-float backdrop-blur-xl',
              toast.tone === 'success'
                ? 'border-emerald-200 bg-white/95 text-forest-900 dark:border-emerald-500/30 dark:bg-[#173026]/95 dark:text-white'
                : toast.tone === 'warning'
                  ? 'border-amber-200 bg-amber-50/95 text-amber-950 dark:border-amber-500/30 dark:bg-[#2a2316]/95 dark:text-amber-100'
                  : toast.tone === 'error'
                    ? 'border-red-200 bg-red-50/95 text-red-950 dark:border-red-500/30 dark:bg-[#2a1717]/95 dark:text-red-100'
                    : 'border-slate-200 bg-white/95 text-slate-900 dark:border-white/10 dark:bg-[#173026]/95 dark:text-white',
            ].join(' ')}
          >
            <span
              className={[
                'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold',
                toast.tone === 'success'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                  : toast.tone === 'warning'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                    : toast.tone === 'error'
                      ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white',
              ].join(' ')}
            >
              {toast.tone === 'success' ? '✓' : toast.tone === 'warning' ? '!' : 'i'}
            </span>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
