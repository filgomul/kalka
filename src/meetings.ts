// Meetings and the pure logic around them. No DOM here, so node --test can run it.
// One file per meeting in spotkania/, pointing at its project (if any) by projectId.

import { formatDate, newId } from './model.ts'
import { isDay } from './leaves.ts'
import { t } from './pl.ts'

export const MEETING_TYPES = ['stacjonarne', 'online'] as const
export type MeetingType = (typeof MEETING_TYPES)[number]

export type Meeting = {
  id: string
  title: string
  /** `YYYY-MM-DD` */
  date: string
  /** `HH:MM`; absent without a time */
  start?: string
  /** `HH:MM`, only with a `start`; absent without one */
  end?: string
  /** an architect's name; empty when nobody */
  architect: string
  /** absent for a meeting without a project */
  projectId?: string
  type: MeetingType
  note: string
  updatedAt: string
}

type Row = { meeting: Meeting }

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const isTime = (v: unknown): v is string => typeof v === 'string' && TIME.test(v)

// Times in the dialog: typed freely or picked from a list of quarter hours

const toMinutes = (time: string) => +time.slice(0, 2) * 60 + +time.slice(3)
const pad = (n: number) => String(n).padStart(2, '0')
const toTime = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
const DAY_END = 24 * 60

/** A typed time as `HH:MM`: "9", "930", "0930", "9.30", "9:30", "9,30"; null when unreadable. */
export function parseTime(text: string): string | null {
  const s = text.trim().replace(/[.,]/g, ':')
  const m = /^(\d{1,2})(?::?(\d{2}))?$/.exec(s)
  if (!m) return null
  const time = `${pad(+m[1])}:${m[2] ?? '00'}`
  return isTime(time) ? time : null
}

/** "15 min", "1 h", "1 h 30 min". */
export function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const min = minutes % 60
  return [h && `${h} h`, min && `${min} min`].filter(Boolean).join(' ')
}

/** The "od" list: every quarter hour from 07:00 to 21:00. */
export function startChoices(): { time: string; note?: string }[] {
  return Array.from({ length: (21 - 7) * 4 + 1 }, (_, i) => ({ time: toTime(7 * 60 + i * 15) }))
}

/** The "do" list: every quarter hour after `start` up to eight hours later (not past midnight), with the length. */
export function endChoices(start: string): { time: string; note?: string }[] {
  const from = toMinutes(start)
  const out = []
  for (let m = from + 15; m <= from + 8 * 60 && m < DAY_END; m += 15) out.push({ time: toTime(m), note: durationLabel(m - from) })
  return out
}

/**
 * The times after "od" becomes `start`: an empty "do" becomes an hour later, a set one moves
 * by the same amount; past midnight "do" is left empty. Without a start there is no end.
 */
export function withStart(m: Pick<Meeting, 'start' | 'end'>, start: string): { start: string; end: string } {
  if (!start) return { start: '', end: '' }
  const length = m.start && m.end ? toMinutes(m.end) - toMinutes(m.start) : 60
  const end = toMinutes(start) + length
  return { start, end: length > 0 && end < DAY_END ? toTime(end) : '' }
}

export function emptyMeeting(projectId = '', architect = ''): Meeting {
  return { id: newId(), title: '', date: '', architect, projectId: projectId || undefined, type: 'stacjonarne', note: '', updatedAt: '' }
}

/** The dialog's message for an invalid draft, or '' when it can be saved. */
export function meetingError(m: Meeting): string {
  if (!m.title.trim()) return t.meetingTitleRequired
  if (!isDay(m.date)) return t.meetingDateRequired
  if (m.end && !m.start) return t.meetingStartRequired
  if (m.start && m.end && m.end < m.start) return t.meetingOrder
  return ''
}

/** Trims text and drops empty optional fields before a save. */
export function prepareMeetingForSave(m: Meeting): Meeting {
  const out: Meeting = { ...m, title: m.title.trim(), note: m.note.trim() }
  if (!isTime(out.start)) delete out.start
  if (!out.start || !isTime(out.end)) delete out.end
  if (!out.projectId) delete out.projectId
  return out
}

/** A meeting file as read; throws on a file that can't be shown, so it lands in the broken-files notice. */
export function parseMeeting(raw: any): Meeting {
  if (typeof raw?.id !== 'string' || !raw.id) throw new Error('brak id')
  if (!isDay(raw.date)) throw new Error('niepoprawna data')
  const text = (v: unknown) => (typeof v === 'string' ? v : '')
  return prepareMeetingForSave({
    id: raw.id,
    title: text(raw.title),
    date: raw.date,
    start: raw.start,
    end: raw.end,
    architect: text(raw.architect),
    projectId: text(raw.projectId),
    type: MEETING_TYPES.includes(raw.type) ? raw.type : 'stacjonarne',
    note: text(raw.note),
    updatedAt: text(raw.updatedAt),
  })
}

/** Day, then start time (untimed after timed), then title. */
export function byTime(a: Meeting, b: Meeting): number {
  return a.date.localeCompare(b.date) || Number(!a.start) - Number(!b.start) || (a.start ?? '').localeCompare(b.start ?? '') || a.title.localeCompare(b.title, 'pl')
}

/** Latest day and time first; untimed still after the timed ones of their day. */
function byTimeDesc(a: Meeting, b: Meeting): number {
  return b.date.localeCompare(a.date) || Number(!a.start) - Number(!b.start) || (b.start ?? '').localeCompare(a.start ?? '') || a.title.localeCompare(b.title, 'pl')
}

/** From today on, earliest first; before today, latest first. */
export function splitMeetings<T extends Row>(rows: T[], today: string): { current: T[]; past: T[] } {
  return {
    current: rows.filter((r) => r.meeting.date >= today).sort((a, b) => byTime(a.meeting, b.meeting)),
    past: rows.filter((r) => r.meeting.date < today).sort((a, b) => byTimeDesc(a.meeting, b.meeting)),
  }
}

/** `10:00-11:30`, `10:00` or ''. */
export const formatTimes = (m: Meeting) => (m.start ? (m.end ? `${m.start}-${m.end}` : m.start) : '')

/** `14.11.2026 10:00-11:30`, or the day alone. */
export const formatWhen = (m: Meeting) => [formatDate(m.date), formatTimes(m)].filter(Boolean).join(' ')

/** The meeting's project id when that project is loaded, else '' (a gone project counts as none). */
export const projectIdOf = (m: Meeting, projectIds: Set<string>) => (m.projectId && projectIds.has(m.projectId) ? m.projectId : '')

/** "Spotkania" tab filters: `withProject` is '' (all), 'z' (with a project) or 'bez' (without). */
export function filterMeetings<T extends Row>(rows: T[], f: { architect: string; withProject: string }, projectIds: Set<string>): T[] {
  return rows.filter((r) => {
    if (f.architect && r.meeting.architect !== f.architect) return false
    const has = !!projectIdOf(r.meeting, projectIds)
    return f.withProject === 'z' ? has : f.withProject === 'bez' ? !has : true
  })
}

/**
 * Calendar filters for meetings: ticked projects (file names; null when all are ticked) keep only
 * their meetings; otherwise the architect filter keeps that architect's meetings. Status never applies.
 */
export function meetingsForCalendar<T extends Row>(rows: T[], f: { architect: string; projects: string[] | null }, projects: { project: { id: string }; file: string }[]): T[] {
  const { projects: ticked } = f
  if (ticked) {
    const chosen = new Set(projects.filter((p) => ticked.includes(p.file)).map((p) => p.project.id))
    const ids = new Set(projects.map((p) => p.project.id))
    return rows.filter((r) => chosen.has(projectIdOf(r.meeting, ids)))
  }
  return rows.filter((r) => !f.architect || r.meeting.architect === f.architect)
}

/** Cards for up to six meetings, a list above that. */
export const initialView = (count: number): 'cards' | 'list' => (count <= 6 ? 'cards' : 'list')
