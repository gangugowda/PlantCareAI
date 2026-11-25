export type Language = 'en' | 'si' | 'ta'
export type Theme = 'light' | 'dark'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  plan: 'Home' | 'Grower Pro'
  joined: string
}

export interface Plant {
  id: string
  name: string
  species: string
  room: string
  potSize: string
  soilType: string
  image: string
  moisture: number
  minMoisture: number
  maxMoisture: number
  threshold: number
  sensorId: string
  pumpId: string
  autoWater: boolean
  notes: string
  wateringDuration: number
  lastWatered: string
  health: 'Thriving' | 'Healthy' | 'Needs attention'
  light: string
  createdAt: string
}

export type PumpStatus = 'OFF' | 'ON' | 'COOLING' | 'LOCKED' | 'FAULT'

export interface PumpState {
  status: PumpStatus
  plantId: string | null
  mode: 'auto' | 'manual' | null
  remaining: number
  cooldownRemaining: number
  dailyCycles: number
}

export interface Device {
  name: string
  id: string
  online: boolean
  wifi: string
  wifiStrength: number
  sensorHealth: 'Healthy' | 'Check sensor'
  lastSeen: string
  firmware: string
  pairing: 'Paired' | 'Ready to pair'
  reservoir: number
  offlineAutonomy: boolean
  ip: string
}

export type ActivityType =
  | 'watering'
  | 'moisture'
  | 'reservoir'
  | 'device'
  | 'sensor'
  | 'safety'
  | 'care'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  detail: string
  timestamp: string
  plantId?: string
}

export interface WateringEvent {
  id: string
  plantId: string
  date: string
  durationSec: number
  liters: number
  mode: 'auto' | 'manual'
  status: 'completed' | 'stopped'
}

export interface CareTask {
  id: string
  title: string
  type: 'Watering' | 'Fertilizing' | 'Pruning' | 'Repotting' | 'Pest inspection' | 'Seasonal'
  date: string
  time: string
  plantId: string
  completed: boolean
  notes: string
}

export interface GrowthEntry {
  id: string
  plantId: string
  date: string
  note: string
  image: string
  heightCm: number
}

export interface FamilyMember {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Caregiver' | 'Viewer'
  avatar: string
  status: 'Active' | 'Invited'
}

export interface AppNotification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'moisture' | 'water' | 'device' | 'safety' | 'care'
}

export interface Settings {
  defaultThreshold: number
  maxRuntime: number
  cooldownMinutes: number
  maxDailyCycles: number
  emergencyShutdown: boolean
  lowWaterLockout: boolean
  timezone: string
  temperatureUnit: 'C' | 'F'
  waterUnit: 'L' | 'gal'
  language: Language
  theme: Theme
  notifications: {
    lowMoisture: boolean
    wateringComplete: boolean
    lowReservoir: boolean
    pumpWarning: boolean
    sensorFault: boolean
    deviceOffline: boolean
  }
}

export interface Recommendation {
  id: string
  plantId: string
  threshold: number
  duration: number
  frequency: string
  rationale: string
  confidence: number
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  image?: string
  timestamp: string
}

export interface AppState {
  plants: Plant[]
  device: Device
  pump: PumpState
  activities: Activity[]
  wateringEvents: WateringEvent[]
  careTasks: CareTask[]
  growthEntries: GrowthEntry[]
  family: FamilyMember[]
  notifications: AppNotification[]
  recommendations: Recommendation[]
  settings: Settings
  chat: ChatMessage[]
  autoWatering: boolean
  lastSynced: string
  demoMode: boolean
}
