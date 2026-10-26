// Project data and the pure logic around it. No DOM here, so node --test can run it.

export const MILESTONES = ['rozpoczecie', 'koncepcja', 'akceptacja', 'pbDoUrzedu', 'uzupelnienie', 'pozwolenie', 'branzysci'] as const
export const BRANCHES = ['konstrukcja', 'sanitarna', 'elektryczna', 'drogowa', 'ppoz', 'bhpSanepid'] as const
export const STATUSES = ['aktywny', 'wstrzymany', 'zakończony'] as const

export type MilestoneKey = (typeof MILESTONES)[number]
export type BranchKey = (typeof BRANCHES)[number]
export type Status = (typeof STATUSES)[number]

export type Project = {
  id: string
  lp?: number
  title: string
  location: { city: string; address: string }
  leadArchitect: string
  status: Status
  /** `YYYY-MM-DD` or `YYYY-MM`; a key without a date is absent */
  milestones: Partial<Record<MilestoneKey, string>>
  /** milestones marked done, dated or not; absent means none */
  done?: MilestoneKey[]
  /** milestones whose date is confirmed; the rest are planned; absent means none */
  confirmed?: MilestoneKey[]
  /** empty string means "brak" */
  branches: Record<BranchKey, string>
  notes: string
  updatedAt: string
}

export type ParsedDate = { precision: 'day' | 'month'; due: string }

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/
const MONTH = /^(\d{4})-(\d{2})$/

/** A stored milestone value; a month is due on its last day. */
export function parseDate(value: string | undefined): ParsedDate | null {
  if (!value) return null
  if (DAY.test(value)) return { precision: 'day', due: value }
  const m = MONTH.exec(value)
  if (!m) return null
  const lastDay = new Date(Date.UTC(+m[1], +m[2], 0)).getUTCDate()
  return { precision: 'month', due: `${value}-${String(lastDay).padStart(2, '0')}` }
}

/** `30.10.2026` or `10.2026` */
export function formatDate(value: string | undefined): string {
  const d = parseDate(value)
  if (!d) return ''
  const [y, m, day] = value!.split('-')
  return d.precision === 'day' ? `${day}.${m}.${y}` : `${m}.${y}`
}

export function todayIso(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export type NextMilestone = { key: MilestoneKey; value: string; due: string }

export const isDone = (p: Project, key: MilestoneKey) => p.done?.includes(key) ?? false
export const isConfirmed = (p: Project, key: MilestoneKey) => p.confirmed?.includes(key) ?? false

/** The dated, not-done milestone with the earliest due date; before `today` means overdue. */
export function nextMilestone(p: Project): NextMilestone | null {
  let next: NextMilestone | null = null
  for (const key of MILESTONES) {
    const value = p.milestones[key]
    const d = parseDate(value)
    if (d && !isDone(p, key) && (!next || d.due < next.due)) next = { key, value: value!, due: d.due }
  }
  return next
}

export function nextLp(projects: Project[]): number {
  return Math.max(0, ...projects.map((p) => p.lp ?? 0)) + 1
}

/** Names from kalka.json first, then any other value projects already use. */
export function architectOptions(listed: string[], projects: Project[]): string[] {
  const extra = projects.map((p) => p.leadArchitect).filter((a) => a && !listed.includes(a))
  return [...listed, ...[...new Set(extra)].sort((a, b) => a.localeCompare(b, 'pl'))]
}

export function newId(): string {
  return crypto.randomUUID()
}

export function emptyProject(): Project {
  return {
    id: newId(),
    title: '',
    location: { city: '', address: '' },
    leadArchitect: '',
    status: 'aktywny',
    milestones: {},
    branches: Object.fromEntries(BRANCHES.map((b) => [b, ''])) as Record<BranchKey, string>,
    notes: '',
    updatedAt: '',
  }
}

/** Fills fields a hand-edited or older file lacks; the caller has checked `id`. */
export function normalize(raw: Partial<Project> & { id: string }): Project {
  const base = emptyProject()
  return {
    ...base,
    ...raw,
    location: { ...base.location, ...raw.location },
    milestones: { ...raw.milestones },
    done: MILESTONES.filter((k) => Array.isArray(raw.done) && raw.done.includes(k)),
    confirmed: MILESTONES.filter((k) => Array.isArray(raw.confirmed) && raw.confirmed.includes(k)),
    branches: { ...base.branches, ...raw.branches },
    status: STATUSES.includes(raw.status as Status) ? raw.status! : 'aktywny',
  }
}

/** Trims text and drops cleared milestones and empty done and confirmed lists before a save. */
export function prepareForSave(p: Project): Project {
  const milestones: Project['milestones'] = {}
  for (const key of MILESTONES) if (parseDate(p.milestones[key])) milestones[key] = p.milestones[key]
  const out: Project = {
    ...p,
    title: p.title.trim(),
    location: { city: p.location.city.trim(), address: p.location.address.trim() },
    milestones,
    done: MILESTONES.filter((k) => isDone(p, k)),
    confirmed: MILESTONES.filter((k) => isConfirmed(p, k)),
  }
  if (out.lp === undefined || !Number.isInteger(out.lp)) delete out.lp
  if (!out.done!.length) delete out.done
  if (!out.confirmed!.length) delete out.confirmed
  return out
}

/** `status` is a Status, 'wszystkie', or empty for the default (everything but zakończony). */
export type Filter = { architect: string; status: string; q: string }

export function filterProjects<T extends { project: Project }>(rows: T[], f: Filter): T[] {
  const q = f.q.trim().toLocaleLowerCase('pl')
  return rows.filter(({ project: p }) => {
    if (f.architect && p.leadArchitect !== f.architect) return false
    if (!f.status && p.status === 'zakończony') return false
    if (f.status && f.status !== 'wszystkie' && p.status !== f.status) return false
    if (!q) return true
    return [p.title, p.location.city, p.location.address].some((s) => s.toLocaleLowerCase('pl').includes(q))
  })
}

/** By next milestone (overdue first), projects without one last; then by l.p. and title. */
export function sortProjects<T extends { project: Project }>(rows: T[]): T[] {
  const key = (p: Project) => nextMilestone(p)?.due ?? '9999'
  return [...rows].sort(
    (a, b) =>
      key(a.project).localeCompare(key(b.project)) ||
      (a.project.lp ?? Infinity) - (b.project.lp ?? Infinity) ||
      a.project.title.localeCompare(b.project.title, 'pl'),
  )
}
