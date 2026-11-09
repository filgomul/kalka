// Project data and the pure logic around it. No DOM here, so node --test can run it.

export const BRANCHES = ['konstrukcja', 'sanitarna', 'elektryczna', 'drogowa', 'ppoz', 'bhpSanepid'] as const
export const STATUSES = ['aktywny', 'wstrzymany', 'zakończony'] as const

export type BranchKey = (typeof BRANCHES)[number]
export type Status = (typeof STATUSES)[number]

/** How a milestone looks in the calendar: name, short label and colour. */
export type MilestoneStyle = { id: string; name: string; short: string; color: string }
/** A project's type is the id of the template it started from, or one picked later. */
export type TypeId = 'budowlany' | 'wnetrza' | 'inny'
/** The styles a new project starts with, in order. */
export type Template = { id: TypeId; name: string; styles: string[] }
/** One milestone of a project; `title` only on milestones the user added, flags only when true. */
export type Milestone = {
  id: string
  style: string
  title?: string
  /** `YYYY-MM-DD` or `YYYY-MM`; absent without a date */
  date?: string
  done?: boolean
  /** the date is confirmed; without it the date is planned */
  confirmed?: boolean
}

// Built-in defaults. A later configuration view will override them from kalka.json by id
// (and hide styles rather than delete them), so projects store only a style's id.
export const STYLES: MilestoneStyle[] = [
  { id: 'rozpoczecie', name: 'data rozpoczęcia', short: 'rozp.', color: '#7d776d' },
  { id: 'koncepcja', name: 'wydanie koncepcji', short: 'konc.', color: '#a07a3c' },
  { id: 'akceptacja', name: 'akceptacja koncepcji', short: 'akc.', color: '#807a35' },
  { id: 'pbDoUrzedu', name: 'PB do urzędu', short: 'PB', color: '#4e6b80' },
  { id: 'uzupelnienie', name: 'uzupełnienie do urzędu', short: 'uzup.', color: '#7a5f7f' },
  { id: 'pozwolenie', name: 'uzyskanie pozwolenia', short: 'pozw.', color: '#697662' },
  { id: 'branzysci', name: 'termin branżystów', short: 'branż.', color: '#3e7d77' },
  { id: 'wydanieProjektu', name: 'wydanie projektu', short: 'wyd.', color: '#4a5899' },
  { id: 'uklady', name: 'układy funkcjonalne', short: 'ukł.', color: '#a0587a' },
  { id: 'akceptacjaUkladow', name: 'akceptacja układów', short: 'akc. ukł.', color: '#8a4f9a' },
  { id: 'wizualizacje', name: 'pierwsze wizualizacje', short: 'wiz.', color: '#3f8a5c' },
  { id: 'akceptacjaWizualizacji', name: 'akceptacja wizualizacji', short: 'akc. wiz.', color: '#2c5e3c' },
  { id: 'nadzor', name: 'nadzór autorski', short: 'nadz.', color: '#6b4a35' },
  { id: 'inny', name: 'inny', short: 'inny', color: '#000000' },
]

export const TEMPLATES: Template[] = [
  {
    id: 'budowlany',
    name: 'projekt budowlany',
    styles: ['rozpoczecie', 'koncepcja', 'akceptacja', 'pbDoUrzedu', 'uzupelnienie', 'pozwolenie', 'branzysci', 'wydanieProjektu'],
  },
  {
    id: 'wnetrza',
    name: 'projekt wnętrz',
    styles: ['rozpoczecie', 'uklady', 'akceptacjaUkladow', 'wizualizacje', 'akceptacjaWizualizacji', 'wydanieProjektu', 'nadzor'],
  },
  { id: 'inny', name: 'inny', styles: [] },
]

const OTHER = STYLES.at(-1)!

/** An unknown style looks like "inny". */
export const styleOf = (id: string): MilestoneStyle => STYLES.find((s) => s.id === id) ?? OTHER
export const titleOf = (m: Milestone): string => m.title || styleOf(m.style).name

/** An unknown or missing template id gives the building one. */
export const templateOf = (id: string | null | undefined): Template => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]

/** A milestone's title after its style changes: an empty title or the old style's name follows the new style ("inny" empties it); a typed title stays. */
export function titleForStyle(title: string, from: string, to: string): string {
  if (title.trim() && title.trim() !== styleOf(from).name) return title
  return to === 'inny' ? '' : styleOf(to).name
}

/** A new project's milestones; an unknown or missing template gives the building one. */
export function fromTemplate(id: string | null | undefined): Milestone[] {
  return templateOf(id).styles.map((style) => ({ id: style, style }))
}

/** `list` with the item at `from` moved to index `to` of the result. */
export function moveMilestone<T>(list: T[], from: number, to: number): T[] {
  const out = [...list]
  const [moved] = out.splice(from, 1)
  out.splice(to, 0, moved)
  return out
}

export type Project = {
  id: string
  lp?: number
  title: string
  type: TypeId
  location: { city: string; address: string }
  leadArchitect: string
  status: Status
  /** in the project's order */
  timeline: Milestone[]
  /** empty string means "brak" */
  branches: Record<BranchKey, string>
  notes: string
  /** project data: plain text, no format check */
  investor: string
  investorPhone: string
  investorEmail: string
  plot: string
  officeContact: string
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

export type NextMilestone = { milestone: Milestone; due: string }

/** The dated, not-done milestone with the earliest due date (the first one on a tie); before `today` means overdue. */
export function nextMilestone(p: Project): NextMilestone | null {
  let next: NextMilestone | null = null
  for (const m of p.timeline) {
    const d = parseDate(m.date)
    if (d && !m.done && (!next || d.due < next.due)) next = { milestone: m, due: d.due }
  }
  return next
}

export function nextLp(projects: Project[]): number {
  return Math.max(0, ...projects.map((p) => p.lp ?? 0)) + 1
}

/** Names from kalka.json first, then any other name already in use (lead architects, leave architects), by name. */
export function architectOptions(listed: string[], used: string[]): string[] {
  const extra = used.filter((a) => a && !listed.includes(a))
  return [...listed, ...[...new Set(extra)].sort((a, b) => a.localeCompare(b, 'pl'))]
}

export function newId(): string {
  return crypto.randomUUID()
}

export function emptyProject(): Project {
  return {
    id: newId(),
    title: '',
    type: 'inny',
    location: { city: '', address: '' },
    leadArchitect: '',
    status: 'aktywny',
    timeline: [],
    branches: Object.fromEntries(BRANCHES.map((b) => [b, ''])) as Record<BranchKey, string>,
    notes: '',
    investor: '',
    investorPhone: '',
    investorEmail: '',
    plot: '',
    officeContact: '',
    updatedAt: '',
  }
}

/** A project file as read: the current shape, or the shape from before templates. */
export type RawProject = Partial<Omit<Project, 'timeline'>> & {
  id: string
  timeline?: unknown
  /** before templates: dates keyed by milestone kind, plus lists of done and confirmed kinds */
  milestones?: Record<string, unknown>
  done?: unknown
  confirmed?: unknown
}

/** A milestone with only the fields that are set: trimmed title, accepted date, flags when true. */
function cleanMilestone(m: Milestone, acceptDate: (v: string) => boolean): Milestone {
  const out: Milestone = { id: m.id, style: m.style }
  if (typeof m.title === 'string' && m.title.trim()) out.title = m.title.trim()
  if (typeof m.date === 'string' && acceptDate(m.date)) out.date = m.date
  if (m.done === true) out.done = true
  if (m.confirmed === true) out.confirmed = true
  return out
}

const isMilestone = (m: unknown): m is Milestone =>
  typeof m === 'object' && m !== null && typeof (m as Milestone).id === 'string' && typeof (m as Milestone).style === 'string'

/** An older file's seven milestones in the building order, plus an empty "wydanie projektu". */
function fromOlderFile(raw: RawProject): Milestone[] {
  const dates = raw.milestones ?? {}
  const has = (list: unknown, key: string) => Array.isArray(list) && list.includes(key)
  return fromTemplate('budowlany').map((m) => ({
    ...m,
    date: typeof dates[m.style] === 'string' ? (dates[m.style] as string) : undefined,
    done: has(raw.done, m.style),
    confirmed: has(raw.confirmed, m.style),
  }))
}

/** Fills fields a hand-edited or older file lacks; the caller has checked `id`. Older files leave their old keys behind. */
export function normalize(raw: RawProject): Project {
  const { timeline, milestones: _milestones, done: _done, confirmed: _confirmed, ...rest } = raw
  const base = emptyProject()
  const list = Array.isArray(timeline) ? timeline.filter(isMilestone) : fromOlderFile(raw)
  return {
    ...base,
    ...rest,
    location: { ...base.location, ...raw.location },
    timeline: list.map((m) => cleanMilestone(m, () => true)),
    branches: { ...base.branches, ...raw.branches },
    status: STATUSES.includes(raw.status as Status) ? raw.status! : 'aktywny',
    type: TEMPLATES.some((t) => t.id === raw.type) ? raw.type! : 'inny',
  }
}

/** Trims text and drops invalid dates, empty titles and false flags before a save. */
export function prepareForSave(p: Project): Project {
  const out: Project = {
    ...p,
    title: p.title.trim(),
    location: { city: p.location.city.trim(), address: p.location.address.trim() },
    timeline: p.timeline.map((m) => cleanMilestone(m, (v) => !!parseDate(v))),
  }
  if (out.lp === undefined || !Number.isInteger(out.lp)) delete out.lp
  return out
}

/** What a milestone change writes: the project as last written with only its milestones replaced, so unsaved fields stay out. */
export const withTimeline = (base: Project, timeline: Milestone[]): Project => prepareForSave({ ...base, timeline })

/** `status` is a Status, 'wszystkie', or empty for the default (everything but zakończony); `type` empty or absent for every type. */
export type Filter = { architect: string; status: string; q: string; type?: string }

export function filterProjects<T extends { project: Project }>(rows: T[], f: Filter): T[] {
  const q = f.q.trim().toLocaleLowerCase('pl')
  return rows.filter(({ project: p }) => {
    if (f.architect && p.leadArchitect !== f.architect) return false
    if (f.type && p.type !== f.type) return false
    if (!f.status && p.status === 'zakończony') return false
    if (f.status && f.status !== 'wszystkie' && p.status !== f.status) return false
    if (!q) return true
    return [p.title, p.location.city, p.location.address].some((s) => s.toLocaleLowerCase('pl').includes(q))
  })
}

/** List columns the user can sort by; in the URL as `o=<key>`, `o=-<key>` for descending. */
export const SORT_KEYS = ['lp', 'tytul', 'typ', 'miejscowosc', 'architekt', 'termin', 'status'] as const
export type SortKey = (typeof SORT_KEYS)[number]
export type Sort = { key: SortKey; desc: boolean }
export const DEFAULT_SORT: Sort = { key: 'termin', desc: false }

/** A missing or unknown value gives the default sort. */
export function parseSort(value: string | null): Sort {
  const desc = !!value?.startsWith('-')
  const key = (desc ? value!.slice(1) : value) as SortKey
  return SORT_KEYS.includes(key) ? { key, desc } : DEFAULT_SORT
}

/** The `o` value; empty for the default sort. */
export const sortParam = (s: Sort): string => (s.key === DEFAULT_SORT.key && s.desc === DEFAULT_SORT.desc ? '' : (s.desc ? '-' : '') + s.key)

/** What a column sorts on; undefined is empty. Status and type go by their list order. */
const SORT_VALUE: Record<SortKey, (p: Project) => string | number | undefined> = {
  lp: (p) => p.lp,
  tytul: (p) => p.title || undefined,
  typ: (p) => TEMPLATES.findIndex((t) => t.id === p.type),
  miejscowosc: (p) => p.location.city || undefined,
  architekt: (p) => p.leadArchitect || undefined,
  termin: (p) => nextMilestone(p)?.due,
  status: (p) => STATUSES.indexOf(p.status),
}

/** Empty values last whatever the direction. */
function byColumn(a: Project, b: Project, key: SortKey, desc: boolean): number {
  const x = SORT_VALUE[key](a)
  const y = SORT_VALUE[key](b)
  if (x === undefined || y === undefined) return x === y ? 0 : x === undefined ? 1 : -1
  const c = typeof x === 'number' ? x - (y as number) : x.localeCompare(y as string, 'pl')
  return desc ? -c : c
}

/** By the chosen column; ties (and the default) by next milestone (overdue first, none last), then l.p. and title. */
export function sortProjects<T extends { project: Project }>(rows: T[], sort: Sort = DEFAULT_SORT): T[] {
  return [...rows].sort(
    (a, b) =>
      byColumn(a.project, b.project, sort.key, sort.desc) ||
      byColumn(a.project, b.project, 'termin', false) ||
      byColumn(a.project, b.project, 'lp', false) ||
      a.project.title.localeCompare(b.project.title, 'pl'),
  )
}
