// Calendar and deadlines logic. No DOM here, so node --test can run it.
// Dates are ISO strings (`YYYY-MM-DD`); arithmetic goes through UTC so time zones can't shift a day.

import { filterProjects, isDone, MILESTONES, parseDate, type MilestoneKey, type Project } from './model.ts'

type Row = { project: Project; file: string }

/** `project` is a file name; when set, architect and status are ignored. */
export type CalendarFilter = { architect: string; status: string; project: string }

export type Entry = {
  project: Project
  file: string
  key: MilestoneKey
  /** stored value, `YYYY-MM-DD` or `YYYY-MM` */
  value: string
  precision: 'day' | 'month'
  due: string
  state: 'done' | 'overdue' | 'open'
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

export function visibleRows<T extends Row>(rows: T[], f: CalendarFilter): T[] {
  if (f.project) return rows.filter((r) => r.file === f.project)
  return filterProjects(rows, { architect: f.architect, status: f.status, q: '' })
}

/** Every dated milestone of the rows, by due date, then milestone order, then title. */
export function entries(rows: Row[], today: string): Entry[] {
  const out: Entry[] = []
  for (const { project, file } of rows) {
    for (const key of MILESTONES) {
      const value = project.milestones[key]
      const d = parseDate(value)
      if (!d) continue
      const state = isDone(project, key) ? 'done' : d.due < today ? 'overdue' : 'open'
      out.push({ project, file, key, value: value!, precision: d.precision, due: d.due, state })
    }
  }
  return out.sort(
    (a, b) =>
      a.due.localeCompare(b.due) ||
      MILESTONES.indexOf(a.key) - MILESTONES.indexOf(b.key) ||
      a.project.title.localeCompare(b.project.title, 'pl'),
  )
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

/** Project filter choices: "l.p. title" in l.p. order, projects without l.p. last by title. */
export function projectChoices(rows: Row[]): { file: string; label: string }[] {
  return [...rows]
    .sort(
      (a, b) =>
        (a.project.lp ?? Infinity) - (b.project.lp ?? Infinity) ||
        a.project.title.localeCompare(b.project.title, 'pl'),
    )
    .map(({ project: p, file }) => ({ file, label: [p.lp, p.title || file].filter((x) => x !== undefined).join(' ') }))
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

/** Each month of the range with its first eight entries in date order and how many more there are. */
export function overviewMonths(all: Entry[], r: Range): { month: string; shown: Entry[]; more: number }[] {
  return Array.from({ length: rangeLength(r) }, (_, i) => {
    const month = addMonths(r.from, i)
    const list = all.filter((e) => e.value.startsWith(month))
    return { month, shown: list.slice(0, BLOCK_CAP), more: Math.max(0, list.length - BLOCK_CAP) }
  })
}
