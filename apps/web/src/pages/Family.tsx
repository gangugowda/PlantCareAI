import { useState } from 'react'
import {
  Check,
  Copy,
  Crown,
  Eye,
  Link2,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { cn, initials, timeAgo } from '../lib/utils'
import { Avatar, InfoBanner, PageHeader } from '../components/ui'
import type { FamilyMember } from '../lib/types'

const roles: FamilyMember['role'][] = ['Owner', 'Caregiver', 'Viewer']

const roleMeta: Record<FamilyMember['role'], { icon: typeof Crown; tone: string; description: string }> = {
  Owner: { icon: Crown, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300', description: 'Full control, billing and member management.' },
  Caregiver: { icon: ShieldCheck, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300', description: 'Can water plants, complete tasks and view all data.' },
  Viewer: { icon: Eye, tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300', description: 'Read-only access to plants, readings and reports.' },
}

const permissions = [
  { label: 'View plants & live readings', Owner: true, Caregiver: true, Viewer: true },
  { label: 'View watering history & analytics', Owner: true, Caregiver: true, Viewer: true },
  { label: 'Complete care tasks', Owner: true, Caregiver: true, Viewer: false },
  { label: 'Start manual watering', Owner: true, Caregiver: true, Viewer: false },
  { label: 'Change thresholds & pump safety', Owner: true, Caregiver: false, Viewer: false },
  { label: 'Manage members & roles', Owner: true, Caregiver: false, Viewer: false },
  { label: 'Invite or remove people', Owner: true, Caregiver: false, Viewer: false },
]

export default function FamilyPage() {
  const { state, user, addFamilyMember, updateFamilyRole, removeFamilyMember, notify } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'Caregiver' as FamilyMember['role'] })
  const [copied, setCopied] = useState(false)

  const submit = () => {
    if (!form.name.trim()) return notify('Enter the person’s name.', 'warning')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return notify('Enter a valid email address.', 'warning')
    if (state.family.some((member) => member.email.toLowerCase() === form.email.trim().toLowerCase())) {
      return notify('That email is already on the family list.', 'warning')
    }
    addFamilyMember({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      avatar: initials(form.name),
      status: 'Invited',
    })
    setModalOpen(false)
    setForm({ name: '', email: '', role: 'Caregiver' })
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/dashboard?invite=family-demo`)
      setCopied(true)
      notify('Demo invite link copied. No email was sent.', 'info')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      notify('Clipboard access is unavailable in this browser.', 'warning')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Family access"
        subtitle="Let the people who care for your plants help — with clear roles and limits on what they can change."
        icon={Users}
        actions={
          <button type="button" onClick={() => setModalOpen(true)} className="btn-primary">
            <UserPlus className="h-4 w-4" /> Invite member
          </button>
        }
      />

      <div className="mb-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'People with access', value: state.family.length, note: 'including you', tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300', icon: Users },
          { label: 'Active now', value: state.family.filter((member) => member.status === 'Active').length, note: 'accepted invites', tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300', icon: Check },
          { label: 'Pending invites', value: state.family.filter((member) => member.status === 'Invited').length, note: 'demo only', tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300', icon: Mail },
          { label: 'Caregivers', value: state.family.filter((member) => member.role === 'Caregiver').length, note: 'can water & complete tasks', tone: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300', icon: ShieldCheck },
        ].map((stat) => (
          <div key={stat.label} className="panel flex items-center gap-3 p-4">
            <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', stat.tone)}><stat.icon className="h-4.5 w-4.5" /></span>
            <div>
              <p className="font-display text-xl font-bold tracking-[-0.04em] text-main">{stat.value}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
              <p className="text-[8px] text-muted/70">{stat.note}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
            <div>
              <h2 className="font-display text-sm font-bold text-main">Family members</h2>
              <p className="text-[10px] text-muted">Roles apply to the whole demo garden.</p>
            </div>
            <button type="button" onClick={copyLink} className="btn-secondary !py-1.5 !text-[10px]">
              {copied ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />} {copied ? 'Copied' : 'Copy invite link'}
            </button>
          </div>

          <div className="divide-y divide-[color:var(--line)]">
            {state.family.map((member) => {
              const meta = roleMeta[member.role]
              const isOwner = member.role === 'Owner'
              return (
                <div key={member.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                  <Avatar initials={member.avatar} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[12px] font-bold text-main">{member.name}</p>
                      {member.email === user?.email && <span className="chip-neutral">You</span>}
                      <span className={cn('chip', member.status === 'Active' ? 'chip-green' : 'chip-amber')}>
                        {member.status === 'Active' ? <Check className="h-2.5 w-2.5" /> : <Mail className="h-2.5 w-2.5" />} {member.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-muted">{member.email}</p>
                    <p className="mt-1 text-[9px] text-muted">{meta.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('grid h-7 w-7 place-items-center rounded-lg', meta.tone)}><meta.icon className="h-3.5 w-3.5" /></span>
                    <select
                      value={member.role}
                      onChange={(event) => updateFamilyRole(member.id, event.target.value as FamilyMember['role'])}
                      disabled={isOwner}
                      className="select !w-auto !py-1.5 !text-[10px] disabled:opacity-50"
                      aria-label={`Role for ${member.name}`}
                    >
                      {roles.map((role) => <option key={role} value={role} disabled={isOwner && role !== 'Owner'}>{role}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeFamilyMember(member.id)}
                      disabled={isOwner}
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-500/10"
                      aria-label={`Remove ${member.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-line bg-surface-2 px-4 py-3 sm:px-5">
            <p className="text-[9px] leading-4 text-muted">
              The Owner role cannot be removed or changed in this demo. Invitations are simulated and no email is sent.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="panel p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-main"><ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> What each role can do</h2>
            <div className="mt-3 space-y-2">
              {roles.map((role) => {
                const meta = roleMeta[role]
                return (
                  <div key={role} className="rounded-xl border border-line p-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('grid h-6 w-6 place-items-center rounded-md', meta.tone)}><meta.icon className="h-3 w-3" /></span>
                      <p className="text-[10.5px] font-bold text-main">{role}</p>
                    </div>
                    <p className="mt-1 text-[9px] leading-4 text-muted">{meta.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <InfoBanner icon={Mail} title="Demo invitations only" tone="warning">
            This page does not send real email or create real accounts. In production, invites would use an email service and role-based server permissions — not just client-side hiding.
          </InfoBanner>

          <div className="panel p-4">
            <h2 className="font-display text-sm font-bold text-main">Recent shared activity</h2>
            <div className="mt-3 space-y-3">
              {state.activities.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-[9.5px] font-semibold text-main">{activity.title}</p>
                    <p className="text-[8.5px] text-muted">{timeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="panel mt-4 overflow-hidden">
        <div className="border-b border-line px-4 py-3 sm:px-5">
          <h2 className="font-display text-sm font-bold text-main">Permission matrix</h2>
          <p className="text-[10px] text-muted">Reference for the demo role model.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-wide text-muted">Capability</th>
                {roles.map((role) => <th key={role} className="px-4 py-2.5 text-center text-[9px] font-bold uppercase tracking-wide text-muted">{role}</th>)}
              </tr>
            </thead>
            <tbody>
              {permissions.map((row) => (
                <tr key={row.label} className="table-row">
                  <td className="px-4 py-2.5 text-[10px] text-soft">{row.label}</td>
                  {roles.map((role) => (
                    <td key={role} className="px-4 py-2.5 text-center">
                      {row[role] ? <Check className="mx-auto h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" /> : <X className="mx-auto h-3.5 w-3.5 text-muted/50" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-5">
          <button type="button" aria-label="Close" onClick={() => setModalOpen(false)} className="absolute inset-0 bg-[#07150f]/55 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-line bg-surface p-5 shadow-float animate-fadeUp sm:rounded-3xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-main">Invite a family member</h2>
                <p className="mt-0.5 text-[10.5px] text-muted">Demo only — no email will be sent.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="icon-btn h-8 w-8 rounded-lg" aria-label="Close">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label" htmlFor="family-name">Full name</label>
                <input id="family-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Malini Perera" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="family-email">Email</label>
                <input id="family-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@example.com" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="family-role">Role</label>
                <select id="family-role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as FamilyMember['role'] })} className="select">
                  {roles.filter((role) => role !== 'Owner').map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                <p className="mt-1 text-[9px] text-muted">{roleMeta[form.role].description}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="button" onClick={submit} className="btn-primary"><Plus className="h-4 w-4" /> Add to family</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
