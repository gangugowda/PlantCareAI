import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Sprout,
  UserRound,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { Logo, StatusDot } from '../components/ui'
import { cn } from '../lib/utils'

function AuthShell({
  children,
  heading,
  subheading,
  footer,
}: {
  children: React.ReactNode
  heading: string
  subheading: string
  footer?: React.ReactNode
}) {
  return (
    <main role="main" className="min-h-screen bg-[color:var(--bg)] lg:grid lg:grid-cols-[.92fr_1.08fr]">
      <div className="relative hidden min-h-screen overflow-hidden bg-forest-950 lg:block">
        <img src="/plants/hero7.jpg" alt="A person caring for a collection of indoor plants" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/45 to-forest-950/25" />
        <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Link to="/">
            <Logo light />
          </Link>
          <div className="max-w-md">
            <span className="eyebrow-dark"><Leaf className="h-3 w-3" /> Intelligent plant care</span>
            <blockquote className="mt-6 font-display text-3xl font-bold leading-[1.15] tracking-[-0.04em] text-white xl:text-4xl">
              “The best plant care is the care you don’t have to remember.”
            </blockquote>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Sense soil moisture, water safely, protect the pump and see exactly what is happening — from anywhere.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { value: '24/7', label: 'monitoring' },
                { value: '6', label: 'safety checks' },
                { value: '0', label: 'guesswork' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur">
                  <p className="font-display text-xl font-bold text-lime-300">{item.value}</p>
                  <p className="mt-0.5 text-[9px] text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/70">
            <ShieldCheck className="h-4 w-4 text-lime-300/70" />
            Demo authentication runs locally. No credentials leave this browser.
          </div>
        </div>
      </div>

      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between p-5 sm:px-8 lg:px-10">
          <Link to="/" className="lg:invisible">
            <Logo />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-main">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-10 pt-2 sm:px-8">
          <div className="w-full max-w-[420px]">
            <div className="mb-7">
              <h1 className="font-display text-[30px] font-extrabold leading-tight tracking-[-0.045em] text-main">{heading}</h1>
              <p className="mt-2 text-sm leading-6 text-muted">{subheading}</p>
            </div>
            {children}
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>
      </div>
    </main>
  )
}

function PasswordField({
  value,
  onChange,
  label = 'Password',
  placeholder = 'Enter your password',
  autoComplete = 'current-password',
}: {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  autoComplete?: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      <label className="label" htmlFor={`password-${label}`}>{label}</label>
      <div className="relative">
        <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          id={`password-${label}`}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="input !pl-10 !pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-main"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { user, login, demoLogin, notify } = useApp()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@plantcare.ai')
  const [password, setPassword] = useState('demo1234')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const demoHandled = useRef(false)

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    if (searchParams.get('demo') === '1' && !user && !demoHandled.current) {
      demoHandled.current = true
      setLoading(true)
      window.setTimeout(() => {
        demoLogin()
        navigate('/dashboard', { replace: true })
      }, 500)
    }
  }, [searchParams, user, demoLogin, navigate])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!email.includes('@') || password.length < 6) {
      setError('Enter a valid email and a password with at least 6 characters.')
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      const result = login(email, password, remember)
      setLoading(false)
      if (!result.ok) {
        setError(result.message)
        return
      }
      navigate('/dashboard')
    }, 450)
  }

  const startDemo = () => {
    setLoading(true)
    window.setTimeout(() => {
      demoLogin()
      navigate('/dashboard')
    }, 400)
  }

  return (
    <AuthShell
      heading="Welcome back to your garden."
      subheading="Log in to monitor plants, control watering and pick up where you left off."
      footer={
        <div className="space-y-4">
          <p className="text-center text-xs text-muted">
            New to PlantCare AI?{' '}
            <Link to="/signup" className="font-bold text-emerald-700 hover:underline dark:text-emerald-300">Create a free account</Link>
          </p>
          <div className="flex items-center gap-2 text-[10px] leading-5 text-muted">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-300" />
            Demo authentication. Accounts and sessions are stored in this browser only.
          </div>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="login-email">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" className="input !pl-10" required />
          </div>
        </div>
        <PasswordField value={password} onChange={setPassword} />
        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-soft">
            <button
              type="button"
              role="checkbox"
              aria-checked={remember}
              onClick={() => setRemember((value) => !value)}
              className={cn('grid h-4 w-4 place-items-center rounded border transition', remember ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-[color:var(--line-strong)] bg-surface')}
            >
              {remember && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
            </button>
            Remember me
          </label>
          <Link to="/forgot-password" className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-300">Forgot password?</Link>
        </div>
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Signing in…</span> : <>Log in <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[color:var(--line)]" />
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted">or</span>
        <span className="h-px flex-1 bg-[color:var(--line)]" />
      </div>
      <button type="button" onClick={startDemo} disabled={loading} className="btn-secondary w-full !py-3">
        <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
        Continue with demo account
      </button>
      <div className="mt-3 rounded-xl bg-surface-2 px-3.5 py-2.5 text-[10px] leading-5 text-muted">
        Demo login: <span className="font-semibold text-soft">demo@plantcare.ai</span> / <span className="font-semibold text-soft">demo1234</span>
      </div>
    </AuthShell>
  )
}

export function SignupPage() {
  const { user, signup } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const strength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : password.length > 0 ? 1 : 0

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (name.trim().length < 2) return setError('Please enter your full name.')
    if (!email.includes('@')) return setError('Please enter a valid email address.')
    if (password.length < 8) return setError('Choose a password with at least 8 characters.')
    if (password !== confirm) return setError('Those passwords do not match.')
    if (!terms) return setError('Please accept the demo terms to continue.')
    setLoading(true)
    window.setTimeout(() => {
      const result = signup(name, email, password)
      setLoading(false)
      if (!result.ok) {
        setError(result.message)
        return
      }
      navigate('/dashboard')
    }, 500)
  }

  return (
    <AuthShell
      heading="Start with your first plant."
      subheading="Create a workspace for your plants, sensors and watering history. You can explore with demo data first."
      footer={
        <div className="space-y-4">
          <p className="text-center text-xs text-muted">
            Already growing with us?{' '}
            <Link to="/login" className="font-bold text-emerald-700 hover:underline dark:text-emerald-300">Log in</Link>
          </p>
          <div className="flex items-center gap-2 text-[10px] leading-5 text-muted">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-300" />
            This demo stores account details locally. Production authentication should use a server-side provider.
          </div>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="signup-name">Full name</label>
          <div className="relative">
            <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input id="signup-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nadeesha Perera" autoComplete="name" className="input !pl-10" required />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="signup-email">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input id="signup-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" className="input !pl-10" required />
          </div>
        </div>
        <PasswordField value={password} onChange={setPassword} label="Create password" placeholder="At least 8 characters" autoComplete="new-password" />
        {password && (
          <div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <span key={level} className={cn('h-1 flex-1 rounded-full', strength >= level ? (strength >= 3 ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-[color:var(--line)]')} />
              ))}
            </div>
            <p className="mt-1.5 text-[9px] text-muted">{strength >= 3 ? 'Strong password' : strength >= 2 ? 'Good password' : 'Use 8+ characters, numbers and symbols'}</p>
          </div>
        )}
        <PasswordField value={confirm} onChange={setConfirm} label="Confirm password" placeholder="Repeat password" autoComplete="new-password" />
        <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-5 text-soft">
          <button
            type="button"
            role="checkbox"
            aria-checked={terms}
            onClick={() => setTerms((value) => !value)}
            className={cn('mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border transition', terms ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-[color:var(--line-strong)] bg-surface')}
          >
            {terms && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
          </button>
          <span>I understand this is a demonstration app and agree to use it for sample plant-care data.</span>
        </label>
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-5 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Creating workspace…</span> : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {['No card needed', 'Demo data ready', 'Offline-aware'].map((item) => (
          <div key={item} className="rounded-lg bg-surface-2 px-2 py-2 text-center text-[9px] font-medium text-muted"><CheckCircle2 className="mx-auto mb-1 h-3 w-3 text-emerald-700 dark:text-emerald-300" />{item}</div>
        ))}
      </div>
    </AuthShell>
  )
}

export function ForgotPasswordPage() {
  const { resetPassword } = useApp()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const navigate = useNavigate()

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.includes('@')) return
    setSent(true)
  }

  return (
    <AuthShell
      heading="Reset your password."
      subheading="We’ll prepare a local reset path for the email associated with your demo workspace."
      footer={<p className="text-center text-xs text-muted">Remembered it? <Link to="/login" className="font-bold text-emerald-700 hover:underline dark:text-emerald-300">Back to login</Link></p>}
    >
      {sent ? (
        <div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white"><Check className="h-5 w-5" /></span>
            <p className="mt-3 text-sm font-bold text-main">Reset path ready (demo)</p>
            <p className="mt-1.5 text-xs leading-5 text-muted">
              No real email is sent. Continue to the reset screen to choose a new password for <strong className="text-soft">{email}</strong>.
            </p>
          </div>
          <button type="button" onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)} className="btn-primary mt-4 w-full !py-3">
            Continue to reset <ArrowRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setSent(false)} className="btn-ghost mt-2 w-full">Use a different email</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="forgot-email">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input id="forgot-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="input !pl-10" required />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full !py-3">Send reset instructions <ArrowRight className="h-4 w-4" /></button>
          <p className="flex items-start gap-2 text-[10px] leading-5 text-muted">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-300" />
            Demo flow: no email is sent. You’ll move directly to the local reset form.
          </p>
        </form>
      )}
    </AuthShell>
  )
}

export function ResetPasswordPage() {
  const { resetPassword, notify } = useApp()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) return setError('Use at least 8 characters.')
    if (password !== confirm) return setError('Those passwords do not match.')
    const result = resetPassword(email, password)
    if (!result.ok) return setError(result.message)
    setSuccess(true)
    notify('Password updated. You can log in now.')
  }

  return (
    <AuthShell
      heading="Choose a new password."
      subheading="Set a fresh password for your local PlantCare AI demo account."
      footer={<p className="text-center text-xs text-muted">Need help? <Link to="/login" className="font-bold text-emerald-700 hover:underline dark:text-emerald-300">Return to login</Link></p>}
    >
      {success ? (
        <div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white"><Check className="h-5 w-5" /></span>
            <p className="mt-3 text-sm font-bold text-main">Password updated</p>
            <p className="mt-1.5 text-xs leading-5 text-muted">You can now log in with your new password.</p>
          </div>
          <Link to="/login" className="btn-primary mt-4 w-full !py-3">Go to login <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="reset-email">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="input !pl-10" required />
            </div>
          </div>
          <PasswordField value={password} onChange={setPassword} label="New password" autoComplete="new-password" />
          <PasswordField value={confirm} onChange={setConfirm} label="Confirm new password" autoComplete="new-password" />
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
          <button type="submit" className="btn-primary w-full !py-3">Update password <ArrowRight className="h-4 w-4" /></button>
        </form>
      )}
    </AuthShell>
  )
}

export function ProfilePage() {
  const { user, state, notify } = useApp()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [timezone, setTimezone] = useState(state.settings.timezone)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">Personal settings</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-[-0.045em] text-main">Your profile</h1>
        <p className="mt-1.5 text-sm text-muted">Manage how you appear across your PlantCare AI workspace.</p>
      </div>
      <div className="panel overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-forest-900 via-emerald-800 to-emerald-600" />
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-9 mb-5 flex items-end justify-between">
            <span className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-[color:var(--surface)] bg-lime-300 font-display text-2xl font-extrabold text-forest-950 shadow-card">{user?.avatar}</span>
            <span className="chip-green mb-1"><StatusDot tone="green" /> {user?.plan} plan</span>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              notify('Profile details saved locally for this demo.')
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="label" htmlFor="profile-name">Full name</label>
              <input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="profile-email">Email</label>
              <input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="profile-tz">Time zone</label>
              <select id="profile-tz" value={timezone} onChange={(event) => setTimezone(event.target.value)} className="select">
                <option>Asia/Colombo</option>
                <option>Asia/Kolkata</option>
                <option>Asia/Singapore</option>
                <option>Europe/London</option>
                <option>America/New_York</option>
                <option>Australia/Sydney</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="profile-member-since">Member since</label>
              <input id="profile-member-since" readOnly value={new Date(user?.joined ?? Date.now()).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} className="input" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">Save profile</button>
            </div>
          </form>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Plants', value: state.plants.length },
              { label: 'Watering cycles', value: state.wateringEvents.length },
              { label: 'Care tasks', value: state.careTasks.length },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-line bg-surface-2 p-3 text-center">
                <p className="font-display text-xl font-bold text-main">{stat.value}</p>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700 dark:text-emerald-300" />
            <div>
              <p className="text-[11px] font-semibold text-main">Local demo account</p>
              <p className="mt-0.5 text-[10px] leading-5 text-muted">Profile changes are not persisted to a server. A production build should use a secure auth provider and database.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[10px] text-muted">
        <LockKeyhole className="h-3.5 w-3.5" />
        Password changes are available in Settings → General.
        <Link to="/settings" className="ml-auto font-bold text-emerald-700 hover:underline dark:text-emerald-300">Open settings <ArrowRight className="h-3 w-3 inline" /></Link>
      </div>
    </div>
  )
}
