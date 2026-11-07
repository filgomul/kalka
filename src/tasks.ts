// Tasks of a project and the pure logic around them. No DOM here, so node --test can run it.
// One file per task in zadania/, pointing at its project by projectId.

import { newId, parseDate } from './model.ts'

export const TASK_STATUSES = ['todo', 'doing', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export type Task = {
  id: string
  projectId: string
  title: string
  description: string
  /** `YYYY-MM-DD` or `YYYY-MM`, like a milestone; absent without a date */
  due?: string
  /** an architect's name; empty when nobody is assigned */
  assignee: string
  status: TaskStatus
  /** place in its column, smaller first; absent until someone places the task */
  order?: number
  updatedAt: string
}

/** Initials and colour of an architect, as written in kalka.json. */
export type Badge = { initials?: string; color?: string }

type Row = { task: Task }

export function emptyTask(projectId: string): Task {
  return { id: newId(), projectId, title: '', description: '', assignee: '', status: 'todo', updatedAt: '' }
}

/** Fills fields a hand-edited file lacks; the caller has checked `id` and `projectId`. */
export function normalizeTask(raw: Partial<Task> & { id: string; projectId: string }): Task {
  const text = (v: unknown) => (typeof v === 'string' ? v : '')
  const task: Task = {
    ...raw,
    title: text(raw.title),
    description: text(raw.description),
    assignee: text(raw.assignee),
    status: TASK_STATUSES.includes(raw.status as TaskStatus) ? raw.status! : 'todo',
    updatedAt: text(raw.updatedAt),
  }
  if (typeof task.due !== 'string') delete task.due
  if (!Number.isFinite(task.order)) delete task.order
  return task
}

/** Trims text and drops a date that is not a day or a month before a save. */
export function prepareTaskForSave(task: Task): Task {
  const out = { ...task, title: task.title.trim(), description: task.description.trim() }
  if (!parseDate(out.due)) delete out.due
  return out
}

/** Like a calendar entry: done, overdue (due before `today`, not done) or open. */
export function taskState(task: Task, today: string): 'done' | 'overdue' | 'open' {
  if (task.status === 'done') return 'done'
  const d = parseDate(task.due)
  return d && d.due < today ? 'overdue' : 'open'
}

const dueKey = (t: Task) => parseDate(t.due)?.due ?? '9999'

/** By `order`; tasks without one after, by due date (undated last), then title. */
export function sortTasks<T extends Row>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const x = a.task.order ?? Infinity
    const y = b.task.order ?? Infinity
    return (x === y ? 0 : x < y ? -1 : 1) || dueKey(a.task).localeCompare(dueKey(b.task)) || a.task.title.localeCompare(b.task.title, 'pl')
  })
}

/**
 * Puts `moved` into `column` (the rows of one status, `moved` among them or not) at `index`
 * counted among the other rows, with `status`. Returns the rows to write: normally only
 * `moved` with an `order` between its new neighbours; the whole column renumbered 1, 2, 3...
 * when a neighbour has no `order` or the gap is too small; nothing when it stays put.
 */
export function placeAt<T extends Row>(column: T[], moved: T, index: number, status: TaskStatus): T[] {
  const sorted = sortTasks(column)
  if (moved.task.status === status && sorted.indexOf(moved) === index) return []
  const others = sorted.filter((r) => r !== moved)
  const prev = others[index - 1]?.task.order
  const next = others[index]?.task.order
  let order: number | undefined
  if (!others.length) order = 0
  else if (index === 0) order = next === undefined ? undefined : next - 1
  else if (index >= others.length) order = prev === undefined ? undefined : prev + 1
  else if (prev !== undefined && next !== undefined && next - prev > 1e-6) order = (prev + next) / 2
  if (order !== undefined) return [{ ...moved, task: { ...moved.task, status, order } }]
  const placed = [...others.slice(0, index), moved, ...others.slice(index)]
  return placed.flatMap((r, i) =>
    r === moved || r.task.order !== i + 1 ? [{ ...r, task: { ...r.task, status: r === moved ? status : r.task.status, order: i + 1 } }] : [],
  )
}

// Assignee circle

export const GREY = '#8a857d'
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/** First letters of the first and last word: "Jan Maria Kowalski" is "JK". */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ''
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (words[0][0] + last).toLocaleUpperCase('pl')
}

/** Initials and colour for an assignee, falling back to the name's initials and grey. */
export function badgeFor(badges: Record<string, Badge>, name: string): Required<Badge> {
  const b = badges[name]
  return { initials: b?.initials?.trim() || initialsOf(name), color: b?.color && HEX.test(b.color) ? b.color : GREY }
}

const INK = '#2f2e2e'

/** White or dark text, whichever contrasts more with the `#rgb` / `#rrggbb` background. */
export function textOn(hex: string): string {
  const luminance = (h: string) => {
    const s = h.length === 4 ? h.slice(1).replace(/./g, (c) => c + c) : h.slice(1)
    const [r, g, b] = [0, 2, 4].map((i) => {
      const c = parseInt(s.slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const bg = luminance(hex)
  return 1.05 / (bg + 0.05) >= (bg + 0.05) / (luminance(INK) + 0.05) ? '#fff' : INK
}
