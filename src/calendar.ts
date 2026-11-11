// Calendar and deadlines logic. No DOM here, so node --test can run it.
// Dates are ISO strings (`YYYY-MM-DD`); arithmetic goes through UTC so time zones can't shift a day.

import { filterProjects, parseDate, STYLES, styleOf, type Milestone, type MilestoneStyle, type Project } from './model.ts'
import { byTime, meetingsForCalendar, type Meeting } from './meetings.ts'
import { t } from './pl.ts'

type Row = { project: Project; file: string }

/** `projects` lists the ticked project files among those passing architect and status; null when all are ticked. */
export type CalendarFilter = { architect: string; status: string; projects: string[] | null }

export type Entry = {
  project: Project
  file: string
  milestone: Milestone
  /** place of the milestone in its project */
  index: number
  /** stored value, `YYYY-MM-DD` or `YYYY-MM` */
  value: string
  precision: 'day' | 'month'
  due: string
  state: 'done' | 'overdue' | 'open'
  /** false while the date is only planned */
  confirmed: boolean
}

const toDate = (iso: string) => new Date(iso + 'T00:00:00Z')
const toIso = (d: Date) => d.toISOString().slice(0, 10)

export function addDays(iso: string, days: number): string {
  const d = toDate(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return toIso(d)
}

/** The Monday of the week `iso` falls in. */
export function monday(iso: string): string {
  return addDays(iso, -((toDate(iso).getUTCDay() + 6) % 7))
}

/** `YYYY-MM` plus or minus whole months. */
export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number)
  return toIso(new Date(Date.UTC(y, m - 1 + n, 1))).slice(0, 7)
}

/** Weeks of a month (`YYYY-MM`), Monday first, padded with days of the months around it. */
export function monthGrid(month: string): string[][] {
  const first = month + '-01'
  const last = addDays(addMonths(month, 1) + '-01', -1)
  const weeks: string[][] = []
  for (let day = monday(first); day <= last; ) {
    const week: string[] = []
    for (let i = 0; i < 7; i++, day = addDays(day, 1)) week.push(day)
    weeks.push(week)
  }
  return weeks
}

/** The rows passing the architect and status filters: the project selection's options. */
export const selectable = <T extends Row>(rows: T[], f: CalendarFilter): T[] => filterProjects(rows, { architect: f.architect, status: f.status, q: '' })

export function visibleRows<T extends Row>(rows: T[], f: CalendarFilter): T[] {
  const { projects } = f
  return selectable(rows, f).filter((r) => !projects || projects.includes(r.file))
}

/** `p` in the URL: absent for all, `nic` for none, otherwise once per ticked file. */
export function projectsOf(params: URLSearchParams): string[] | null {
  const p = params.getAll('p')
  return !p.length ? null : p[0] === 'nic' ? [] : p
}

export function withProjects(params: URLSearchParams, projects: string[] | null): URLSearchParams {
  const out = new URLSearchParams(params)
  out.delete('p')
  if (projects) for (const f of projects.length ? projects : ['nic']) out.append('p', f)
  return out
}

/** Ticks or unticks `file`; ticking every choice gives null (all). */
export function toggleProject(choices: { file: string }[], projects: string[] | null, file: string): string[] | null {
  const ticked = choices.map((c) => c.file).filter((f) => (projects ?? [f]).includes(f))
  const next = ticked.includes(file) ? ticked.filter((f) => f !== file) : [...ticked, file]
  return next.length === choices.length ? null : next
}

/** The closed project selection: all, the one ticked label, "N z M" or none. */
export function projectsLabel(choices: { file: string; label: string }[], projects: string[] | null): string {
  const ticked = choices.filter((c) => !projects || projects.includes(c.file))
  if (ticked.length === choices.length) return t.allProjects
  if (!ticked.length) return t.noProjects
  return ticked.length === 1 ? ticked[0].label : t.projectsOf(ticked.length, choices.length)
}

/** A new architect or status ticks every project again. */
export function withNarrowing(params: URLSearchParams, key: 'a' | 's', value: string): URLSearchParams {
  const out = withProjects(params, null)
  if (value) out.set(key, value)
  else out.delete(key)
  return out
}

/** Every dated milestone of the rows, by due date, then place in its project, then title. */
export function entries(rows: Row[], today: string): Entry[] {
  const out: Entry[] = []
  for (const { project, file } of rows) {
    project.timeline.forEach((milestone, index) => {
      const d = parseDate(milestone.date)
      if (!d) return
      const state = milestone.done ? 'done' : d.due < today ? 'overdue' : 'open'
      out.push({ project, file, milestone, index, value: milestone.date!, precision: d.precision, due: d.due, state, confirmed: !!milestone.confirmed })
    })
  }
  return out.sort(
    (a, b) =>
      a.due.localeCompare(b.due) ||
      a.index - b.index ||
      a.project.title.localeCompare(b.project.title, 'pl'),
  )
}

/** The styles the entries use, in the order of the style list; an unknown style counts as "inny". */
export function legendStyles(all: Entry[]): MilestoneStyle[] {
  const used = new Set(all.map((e) => styleOf(e.milestone.style).id))
  return STYLES.filter((s) => used.has(s.id))
}

/** Day-precision entries by day, and the month-precision ones of `month` for the strip. */
export function monthEntries(all: Entry[], month: string): { byDay: Map<string, Entry[]>; strip: Entry[] } {
  const byDay = new Map<string, Entry[]>()
  const strip: Entry[] = []
  for (const e of all) {
    if (e.precision === 'month') {
      if (e.value === month) strip.push(e)
    } else {
      byDay.set(e.value, [...(byDay.get(e.value) ?? []), e])
    }
  }
  return { byDay, strip }
}

/** The kinds the calendar can show, in the order of the "Pokaż" choices. */
export const KINDS = ['terminy', 'spotkania', 'urlopy'] as const
export type Kind = (typeof KINDS)[number]
export type Show = Set<Kind>

/** `k` in the URL: absent (or empty) shows every kind, `nic` none, otherwise the comma-separated kinds. */
export function showOf(k: string | null): Show {
  if (!k) return new Set(KINDS)
  const listed = k.split(',')
  return new Set(KINDS.filter((kind) => listed.includes(kind)))
}

/** The reverse of `showOf`: '' (no key) when every kind is shown. */
export function showParam(show: Show): string {
  if (show.size === KINDS.length) return ''
  return show.size ? KINDS.filter((k) => show.has(k)).join(',') : 'nic'
}

/**
 * What the calendar draws: milestones narrowed by every filter, meetings by the architect and
 * project filters (never the status), leaves never narrowed; each only while its kind is shown.
 */
export function shownOnCalendar<T extends Row, L, M extends { meeting: Meeting }>(
  rows: T[],
  leaves: L[],
  meetings: M[],
  f: CalendarFilter,
  show: Show,
  today: string,
): { all: Entry[]; leaves: L[]; meetings: M[] } {
  return {
    all: show.has('terminy') ? entries(visibleRows(rows, f), today) : [],
    meetings: show.has('spotkania') ? meetingsForCalendar(meetings, { architect: f.architect, projects: f.projects && visibleRows(rows, f).map((r) => r.file) }, rows).sort((a, b) => byTime(a.meeting, b.meeting)) : [],
    leaves: show.has('urlopy') ? leaves : [],
  }
}

/** A meeting in the overview's list; `value` is its day, like an entry's stored value. */
export type MeetingItem<M> = { value: string; row: M }
export function isMeetingItem<M>(item: Entry | MeetingItem<M>): item is MeetingItem<M> {
  return 'row' in item
}

/** Milestone entries and meetings (each already in order) in one list by day; a day's meetings come first. */
export function withMeetings<M extends { meeting: Meeting }>(all: Entry[], meetings: M[]): (Entry | MeetingItem<M>)[] {
  const day = (item: Entry | MeetingItem<M>) => (isMeetingItem(item) ? item.value : item.due)
  // the sort is stable, so meetings stay before the entries of their day and each keeps its own order
  return [...meetings.map((row) => ({ value: row.meeting.date, row })), ...all].sort((a, b) => day(a).localeCompare(day(b)))
}

/** The shown meetings by day, for the month grid. */
export function meetingsByDay<M extends { meeting: Meeting }>(meetings: M[]): Map<string, M[]> {
  const out = new Map<string, M[]>()
  for (const m of meetings) out.set(m.meeting.date, [...(out.get(m.meeting.date) ?? []), m])
  return out
}

export const WINDOW_DAYS = 60

/** Not-done milestones: all overdue ones, then those due within 60 days grouped by week. */
export function deadlines(all: Entry[], today: string): { overdue: Entry[]; weeks: { monday: string; entries: Entry[] }[] } {
  const open = all.filter((e) => e.state !== 'done')
  const end = addDays(today, WINDOW_DAYS)
  const weeks: { monday: string; entries: Entry[] }[] = []
  for (const e of open) {
    if (e.due < today || e.due > end) continue
    const m = monday(e.due)
    const week = weeks.at(-1)
    if (week?.monday === m) week.entries.push(e)
    else weeks.push({ monday: m, entries: [e] })
  }
  return { overdue: open.filter((e) => e.due < today), weeks }
}

/** "l.p. title", or the title alone without l.p. */
const labelOf = ({ project: p, file }: Row) => [p.lp, p.title || file].filter((x) => x !== undefined).join(' ')
/** l.p. order, projects without l.p. last by title. */
const byLp = (a: Row, b: Row) => (a.project.lp ?? Infinity) - (b.project.lp ?? Infinity) || a.project.title.localeCompare(b.project.title, 'pl')

/** Project filter choices: "l.p. title" in l.p. order, projects without l.p. last by title. */
export function projectChoices(rows: Row[]): { file: string; label: string }[] {
  return [...rows].sort(byLp).map((r) => ({ file: r.file, label: labelOf(r) }))
}

/** `projectChoices` keyed by project id, once per id (sync conflict copies share one), for dialogs that store the id. */
export function projectIdChoices(rows: Row[]): { id: string; label: string }[] {
  const seen = new Set<string>()
  const idOf = new Map(rows.map((r) => [r.file, r.project.id]))
  return projectChoices(rows).flatMap((c) => {
    const id = idOf.get(c.file)!
    if (seen.has(id)) return []
    seen.add(id)
    return [{ id, label: c.label }]
  })
}

export const isMonth = (v: string | null): v is string => !!v && /^\d{4}-(0[1-9]|1[0-2])$/.test(v)

// Overview: a range of whole months, "od" to "do" inclusive

export type Range = { from: string; to: string }
export const OVERVIEW_DEFAULT = 6
export const OVERVIEW_MAX = 24
export const BLOCK_CAP = 8

/** Number of months from `r.from` to `r.to`, both included. */
export function rangeLength(r: Range): number {
  const [fy, fm] = r.from.split('-').map(Number)
  const [ty, tm] = r.to.split('-').map(Number)
  return (ty - fy) * 12 + tm - fm + 1
}

/** "do" before "od" becomes "od"; a range longer than 24 months is cut to 24. */
function clamp(from: string, to: string): Range {
  const n = rangeLength({ from, to })
  return { from, to: n < 1 ? from : n > OVERVIEW_MAX ? addMonths(from, OVERVIEW_MAX - 1) : to }
}

/** The range from the URL; without one, six months from `current`. */
export function overviewRange(from: string | null, to: string | null, current: string): Range {
  const start = isMonth(from) ? from : current
  return clamp(start, isMonth(to) ? to : addMonths(start, OVERVIEW_DEFAULT - 1))
}

export const withLength = (r: Range, n: number): Range => clamp(r.from, addMonths(r.from, n - 1))
export const withTo = (r: Range, to: string): Range => clamp(r.from, to)
/** A new "od" keeps the length; "Dziś" is `withFrom(r, current month)`. */
export const withFrom = (r: Range, from: string): Range => withLength({ from, to: from }, rangeLength(r))
export function stepRange(r: Range, dir: 1 | -1): Range {
  const n = rangeLength(r) * dir
  return { from: addMonths(r.from, n), to: addMonths(r.to, n) }
}

/** The months of the range, in order. */
export const rangeMonths = (r: Range): string[] => Array.from({ length: rangeLength(r) }, (_, i) => addMonths(r.from, i))

/** Each month of the range with its first eight items (entries, meetings) in date order and how many more there are. */
export function overviewMonths<I extends { value: string }>(all: I[], r: Range): { month: string; shown: I[]; more: number }[] {
  return rangeMonths(r).map((month) => {
    const list = all.filter((e) => e.value.startsWith(month))
    return { month, shown: list.slice(0, BLOCK_CAP), more: Math.max(0, list.length - BLOCK_CAP) }
  })
}

// Harmonogram: one row per project over the overview's range, every month equally wide

/** Milestones of one project on one day, or month milestones of one project in one month; more than one is a stack. */
export type GanttMark = { value: string; precision: 'day' | 'month'; entries: Entry[] }
export type GanttRow = {
  file: string
  project: Project
  label: string
  /** first and last day the bar covers, a month date widened to its first or last day */
  start: string
  end: string
  /** more than one date, so a bar is drawn */
  bar: boolean
  /** the bar runs on before or after the range */
  before: boolean
  after: boolean
  /** marks inside the range, by date */
  marks: GanttMark[]
}

const firstDay = (r: Range) => r.from + '-01'
const lastDay = (r: Range) => addDays(addMonths(r.to, 1) + '-01', -1)

/** Rows of the projects whose span overlaps the range, by first date, then l.p., then title. `all` comes from `entries`. */
export function ganttRows(all: Entry[], r: Range): GanttRow[] {
  const from = firstDay(r)
  const to = lastDay(r)
  const byFile = new Map<string, Entry[]>()
  for (const e of all) byFile.set(e.file, [...(byFile.get(e.file) ?? []), e])
  const rows: GanttRow[] = []
  for (const [file, list] of byFile) {
    const start = list.map((e) => (e.precision === 'month' ? e.value + '-01' : e.value)).sort()[0]
    const end = list.map((e) => e.due).sort().at(-1)!
    if (start > to || end < from) continue
    const marks = new Map<string, GanttMark>()
    for (const e of list) {
      const inside = e.precision === 'month' ? e.value >= r.from && e.value <= r.to : e.value >= from && e.value <= to
      if (!inside) continue
      const mark = marks.get(e.value)
      if (mark) mark.entries.push(e)
      else marks.set(e.value, { value: e.value, precision: e.precision, entries: [e] })
    }
    const bar = new Set(list.map((e) => e.value)).size > 1
    rows.push({ file, project: list[0].project, label: labelOf(list[0]), start, end, bar, before: start < from, after: end > to, marks: [...marks.values()] })
  }
  return rows.sort((a, b) => a.start.localeCompare(b.start) || byLp(a, b))
}

/** Where the day `iso` begins across the range, 0 to 1: its month's column plus its place in that month. */
export function placeOf(iso: string, r: Range): number {
  const month = iso.slice(0, 7)
  const days = +addDays(addMonths(month, 1) + '-01', -1).slice(8)
  const index = rangeLength({ from: r.from, to: month }) - 1
  return Math.min(1, Math.max(0, (index + (+iso.slice(8) - 1) / days) / rangeLength(r)))
}

/** The middle of the day `iso` across the range, or null outside it (the today line, a diamond). */
export function dayCenter(iso: string, r: Range): number | null {
  if (iso < firstDay(r) || iso > lastDay(r)) return null
  return (placeOf(iso, r) + placeOf(addDays(iso, 1), r)) / 2
}

/** Left and right edge of the bar, or of a month band, across the range. */
export function spanOf(start: string, end: string, r: Range): [number, number] {
  return [placeOf(start < firstDay(r) ? firstDay(r) : start, r), placeOf(addDays(end > lastDay(r) ? lastDay(r) : end, 1), r)]
}
