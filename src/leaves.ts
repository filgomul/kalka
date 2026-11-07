// Architects' leaves and the pure logic around them. No DOM here, so node --test can run it.
// One file per leave in urlopy/, whole days from `from` to `to`, both included.

import { formatDate, newId } from './model.ts'
import { t } from './pl.ts'

export type Leave = {
  id: string
  /** an architect's name */
  architect: string
  /** first day, `YYYY-MM-DD` */
  from: string
  /** last day, `YYYY-MM-DD`, not before `from` */
  to: string
  updatedAt: string
}

type Row = { leave: Leave }

export function emptyLeave(): Leave {
  return { id: newId(), architect: '', from: '', to: '', updatedAt: '' }
}

/** A real calendar day as `YYYY-MM-DD` (so `2026-02-30` is not one). */
export function isDay(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v + 'T00:00:00Z')) && new Date(v + 'T00:00:00Z').toISOString().startsWith(v)
}

/** The dialog's message for an invalid draft, or '' when it can be saved. */
export function leaveError(l: Leave): string {
  if (!l.architect) return t.leaveArchitectRequired
  if (!isDay(l.from) || !isDay(l.to)) return t.leaveDatesRequired
  if (l.to < l.from) return t.leaveOrder
  return ''
}

/** A leave file as read; throws on a file that can't be shown, so it lands in the broken-files notice. */
export function parseLeave(raw: any): Leave {
  if (typeof raw?.id !== 'string' || !raw.id) throw new Error('brak id')
  if (typeof raw.architect !== 'string' || !raw.architect) throw new Error('brak architekta')
  if (!isDay(raw.from) || !isDay(raw.to)) throw new Error('niepoprawna data')
  if (raw.to < raw.from) throw new Error('data „do” przed „od”')
  return { id: raw.id, architect: raw.architect, from: raw.from, to: raw.to, updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '' }
}

const byName = (a: Row, b: Row) => a.leave.architect.localeCompare(b.leave.architect, 'pl')

/** Not yet ended (ending today counts) by start ascending; ended by start descending; ties by name. */
export function splitLeaves<T extends Row>(rows: T[], today: string): { current: T[]; past: T[] } {
  const current = rows.filter((r) => r.leave.to >= today).sort((a, b) => a.leave.from.localeCompare(b.leave.from) || byName(a, b))
  const past = rows.filter((r) => r.leave.to < today).sort((a, b) => b.leave.from.localeCompare(a.leave.from) || byName(a, b))
  return { current, past }
}

export const isOngoing = (l: Leave, today: string) => l.from <= today && today <= l.to

/** `01.12.2026 - 05.12.2026`, or one date for a one-day leave. */
export const formatRange = (l: Leave) => (l.from === l.to ? formatDate(l.from) : `${formatDate(l.from)} - ${formatDate(l.to)}`)

/** `27.11 - 02.12`, for the overview where the block names the month. */
export function formatShortRange(l: Leave): string {
  const short = (d: string) => `${d.slice(8)}.${d.slice(5, 7)}`
  return l.from === l.to ? short(l.from) : `${short(l.from)} - ${short(l.to)}`
}

/** Leaves with at least one day in `month` (`YYYY-MM`), by start then name. */
export function leavesInMonth<T extends Row>(rows: T[], month: string): T[] {
  return rows
    .filter((r) => r.leave.from.slice(0, 7) <= month && r.leave.to.slice(0, 7) >= month)
    .sort((a, b) => a.leave.from.localeCompare(b.leave.from) || byName(a, b))
}

/** The dialog's range calendar: `picking` is true between the first and the last click. */
export type Pick = { from: string; to: string; picking: boolean }

/**
 * A click on `day`: the first click makes a one-day leave and waits for the last day; a click on
 * a later (or the same) day then ends the leave. A click on an earlier day starts again from it.
 */
export function pickDay(p: Pick, day: string): Pick {
  if (p.picking && day >= p.from) return { from: p.from, to: day, picking: false }
  return { from: day, to: day, picking: true }
}

/** One leave's piece in a week row: columns 1-7, and the line it sits on (0 at the top). */
export type Piece<T> = { row: T; start: number; span: number; lane: number }

/** The pieces of the leaves touching `week` (seven days, Monday first); overlapping ones get separate lines. */
export function weekLanes<T extends Row>(rows: T[], week: string[]): Piece<T>[] {
  const first = week[0]
  const last = week[6]
  const laneEnds: number[] = [] // last column taken on each line
  return rows
    .filter((r) => r.leave.from <= last && r.leave.to >= first)
    .sort((a, b) => a.leave.from.localeCompare(b.leave.from) || byName(a, b))
    .map((row) => {
      const start = row.leave.from <= first ? 1 : week.indexOf(row.leave.from) + 1
      const end = row.leave.to >= last ? 7 : week.indexOf(row.leave.to) + 1
      let lane = laneEnds.findIndex((e) => e < start)
      if (lane === -1) lane = laneEnds.length
      laneEnds[lane] = end
      return { row, start, span: end - start + 1, lane }
    })
}
