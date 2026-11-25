import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Compass, Leaf, MoveLeft } from 'lucide-react'
import { AppProvider, useApp } from './lib/store'
import PublicLayout from './components/PublicLayout'
import AppLayout from './components/AppLayout'
import Home from './pages/Home'
import ProblemPage from './pages/Problem'
import SolutionPage from './pages/Solution'
import FeaturesPage from './pages/Features'
import HowItWorksPage from './pages/HowItWorks'
import { ForgotPasswordPage, LoginPage, ProfilePage, ResetPasswordPage, SignupPage } from './pages/Auth'

const DashboardPage = lazy(() => import('./pages/Dashboard'))
const PlantsPage = lazy(() => import('./pages/Plants'))
const PlantDetailPage = lazy(() => import('./pages/PlantDetail'))
const AnalyticsPage = lazy(() => import('./pages/Analytics'))
const AssistantPage = lazy(() => import('./pages/Assistant'))
const RecommendationsPage = lazy(() => import('./pages/Recommendations'))
const IdentifyPage = lazy(() => import('./pages/Identify'))
const CalendarPage = lazy(() => import('./pages/Calendar'))
const GrowthPage = lazy(() => import('./pages/Growth'))
const WeatherPage = lazy(() => import('./pages/Weather'))
const WaterHealthPage = lazy(() => import('./pages/WaterHealth'))
const FamilyPage = lazy(() => import('./pages/Family'))
const VoicePage = lazy(() => import('./pages/Voice'))
const OfflinePage = lazy(() => import('./pages/Offline'))
const SettingsPage = lazy(() => import('./pages/Settings'))

function RouteFallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-5">
      <div className="text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Leaf className="h-5 w-5 animate-pulse" />
        </span>
        <p className="mt-3 text-[11px] font-semibold text-muted">Loading your garden…</p>
      </div>
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useApp()
  const location = useLocation()
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  return <>{children}</>
}

function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div className="max-w-md text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <Compass className="h-7 w-7" />
        </span>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">404 · Page not found</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-main">This leaf isn't on the map.</h1>
        <p className="mt-2 text-sm leading-6 text-muted">The page may have moved, or the link may be out of date. Head back to the garden and pick up where you left off.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/" className="btn-primary"><Leaf className="h-4 w-4" /> Back to home</Link>
          <Link to="/dashboard" className="btn-secondary"><MoveLeft className="h-4 w-4" /> Open dashboard</Link>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/problem" element={<ProblemPage />} />
              <Route path="/solution" element={<SolutionPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/plants" element={<PlantsPage />} />
              <Route path="/plants/:id" element={<PlantDetailPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/identify" element={<IdentifyPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/growth" element={<GrowthPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/water-health" element={<WaterHealthPage />} />
              <Route path="/family" element={<FamilyPage />} />
              <Route path="/voice" element={<VoicePage />} />
              <Route path="/offline" element={<OfflinePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  )
}
