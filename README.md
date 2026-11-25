# PlantCare AI

**Smart monitoring. Healthier plants.**

PlantCare AI is a complete, responsive plant-care web app: an ESP32-style monitoring dashboard, safety-gated automatic and manual watering, AI-assisted care guidance, recommendations, weather context, identification, care calendar, growth timeline, family access, voice control, offline/PWA support and a full marketing site.

> This repository is a **frontend demo**. Sensor telemetry, AI answers, weather, plant identification, invites and hardware events are simulated locally. No real ESP32 is connected and no data leaves your browser. See [Demo scope & limitations](#demo-scope--limitations).

---

## Quick start

Requirements: Node 20.11+ and npm 9+.

```bash
npm install
npm run dev
```

Open **http://localhost:5173**.

### Demo account

| Email | Password |
| --- | --- |
| `demo@plantcare.ai` | `demo1234` |

Or visit **http://localhost:5173/login?demo=1** to sign in instantly.

You can also create a new local account with **Sign up** — each account gets its own plant workspace stored in this browser.

### Production build

```bash
npm run build     # type-check + Vite production build
npm run preview   # preview the production build on http://localhost:4173
```

The service worker is registered in production builds, so the app shell and cached assets work offline.

---

## What is included

### Public site
- **Home** — hero, live product preview, features, workflow, testimonials and CTA.
- **Problem**, **Solution**, **Features**, **How It Works** — full marketing pages.
- Responsive desktop mega-menu, mobile menu, footer, dark mode, language switcher and newsletter demo form.

### Authentication
- Login, sign up, logout, forgot password, reset password and profile.
- Remember-me behaviour (`localStorage` vs `sessionStorage`).
- Protected app routes with redirect to login.
- Per-user state isolation.

### Dashboard
- Plant selector with live moisture for each plant.
- Live moisture, pump, reservoir and device cards.
- Automatic watering arm/disarm with countdown and cooldown.
- Manual watering modal with the same runtime, reservoir, cooldown, daily-cycle and emergency-stop checks.
- Emergency stop, activity timeline, watering history, moisture chart, care tasks and OLED mirror.
- Device online/offline simulation and demo weather context.

### Plant management
- Add, edit, delete and inspect plants.
- Per-plant species, room, pot, soil, sensor, pump, moisture range, threshold, duration, notes and photo.
- Plant detail page with charts, history, care notes and growth preview.

### Intelligence
- **AI Plant Assistant** — local rule-based chat with photo upload, context sidebar, uncertainty-aware answers and chat history.
- **AI Recommendations** — threshold, pulse duration and frequency proposals with rationale, confidence, accept/dismiss and hard safety limits.
- **Plant Identification** — local photo comparison demo with ranked possible matches and cautious care notes.
- **Care Calendar** — month view, task creation, completion, filters and per-plant reminders.
- **Growth Timeline** — height chart, photo entries, milestones and notes.

### System
- **Weather-aware watering** — demo forecast, rainfall, humidity and per-plant guidance; weather is context only and never overrides sensors or hardware safety.
- **Water & pump health** — reservoir, estimated litres, runtime, cooldown, cycles, interlocks, maintenance checklist, device diagnostics, water-use chart and emergency controls.
- **Family access** — roles, permission matrix, invite flow (demo) and shared activity.
- **Voice control** — browser speech recognition where available, plus typed commands; all commands use the same safety checks.
- **Offline mode** — online/offline detection, device-offline simulation, sync queue, install prompt, storage estimate and ESP32 autonomy explanation.
- **Settings** — appearance, English/Sinhala/Tamil, timezone, units, per-plant automatic watering, thresholds, pump safety, device details, notification preferences, account and data export/reset.

### Platform
- Light/dark themes with persisted preference.
- Demo language switcher (English, Sinhala, Tamil) for a few dashboard labels; most page content stays in English.
- Responsive layouts for mobile, tablet and desktop.
- Keyboard-accessible controls, focus rings, ARIA labels and reduced-motion support.
- PWA manifest and production service worker (offline is best-effort; this prototype is intended to run online).

---

## Demo scope & limitations

This project intentionally labels simulated behaviour instead of pretending to be production infrastructure.

| Area | What the demo does | What production needs |
| --- | --- | --- |
| Telemetry | Simulated moisture drift every 16 seconds | ESP32 + sensor firmware and a backend |
| Pump | Simulated countdown and safety checks | Relay control, local interlocks, pump ratings |
| AI | Local keyword/rule responses | A real model with safety evaluation |
| Identification | Small local candidate list | A trained vision model + confidence calibration |
| Weather | Static sample forecasts | A weather API and optional rain sensor |
| Family invites | Local member list | Email service, server-side roles and auth |
| Auth | Browser `localStorage` demo accounts | Secure server-side auth, hashing and sessions |
| Offline | Cached shell + local state | Background sync, conflict resolution and device auth |
| Notifications | In-app demo alerts | Push service and user permission |

**Safety principle:** manual and automatic watering share the same protections — maximum runtime, cooldown, daily-cycle cap, low-reservoir lockout and emergency shutdown. Weather and AI advice can never bypass them. The website is a monitoring and approval layer; a real ESP32 must enforce its own local safety.

**Demo reset:** Settings → **Data & demo** → **Reset demo workspace** restores the sample garden.

---

## Project structure

```
apps/web/
  public/                 favicon, manifest, service worker, plant photography
  src/
    components/           app shell, public layout, shared UI, marketing, plant modal, OLED mirror
    lib/
      store.tsx           auth, state, persistence, simulation, watering safety, AI responses
      types.ts            domain types
      seed.ts             demo plants, events, tasks, growth, family, recommendations, settings
      i18n.ts             English / Sinhala / Tamil dictionaries
      utils.ts            formatting, charts helpers, CSV export
    pages/                public, auth, dashboard and all app pages
    App.tsx               routes and protected-route logic
    main.tsx              React entry point + service-worker registration
    index.css             design tokens and component classes
```

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript check only |

---

## Notes

- All photography lives in `apps/web/public/plants` and is used for demo illustration. Some images are approximate for the labelled species.
- The app is a single-page React app using React Router; host it with an SPA fallback to `index.html`.
- The service worker only registers in production builds. The Vite dev server bypasses it to avoid stale modules.
