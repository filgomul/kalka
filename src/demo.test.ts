import { test } from 'node:test'
import assert from 'node:assert/strict'
import { demoFolder } from './demo.ts'
import { openFolder, readProjects, saveProject } from './storage.ts'
import { addDays, addMonths } from './calendar.ts'
import { DONE_SHOWN, TASK_STATUSES } from './tasks.ts'
import { MEETING_TYPES } from './meetings.ts'

const TODAY = '2026-11-11'

async function open(today = TODAY) {
  const dir = demoFolder(today)
  const settings = await openFolder(dir)
  return { dir, settings, ...(await readProjects(dir)) }
}

/** Every date in the demo data: milestones, task due dates, leaves and meetings. */
async function allDates(today = TODAY) {
  const data = await open(today)
  return [
    ...data.projects.flatMap((p) => p.project.timeline.flatMap((m) => (m.date ? [m.date] : []))),
    ...data.tasks.flatMap((t) => (t.task.due ? [t.task.due] : [])),
    ...data.leaves.flatMap((l) => [l.leave.from, l.leave.to]),
    ...data.meetings.map((m) => m.meeting.date),
  ]
}

test('demo: Architects', async () => {
  const { settings } = await open()
  assert.equal(settings.architects.length, 4)
  assert.equal(Object.values(settings.badges).filter((b) => b.initials && b.color).length, 3)
})

test('demo: Projects', async () => {
  const { projects, broken } = await open()
  assert.equal(projects.length, 8)
  assert.deepEqual(broken, [])
  assert.ok(projects.every((p) => !p.duplicate))
  const all = projects.map((p) => p.project)
  assert.deepEqual(new Set(all.map((p) => p.type)), new Set(['budowlany', 'wnetrza', 'inny']))
  assert.deepEqual(new Set(all.map((p) => p.status)), new Set(['aktywny', 'wstrzymany', 'zakończony']))
  const ms = all.flatMap((p) => p.timeline)
  assert.ok(ms.some((m) => m.date?.length === 10), 'day date')
  assert.ok(ms.some((m) => m.date?.length === 7), 'month date')
  assert.ok(ms.some((m) => m.date && m.confirmed), 'confirmed')
  assert.ok(ms.some((m) => m.date && !m.confirmed), 'planned')
  assert.ok(ms.some((m) => m.done), 'done')
  assert.ok(ms.some((m) => m.date && m.date.length === 10 && m.date < TODAY && !m.done), 'overdue')
  assert.ok(ms.some((m) => m.title), 'added with a title')
  assert.ok(ms.some((m) => !m.date), 'undated')
  assert.ok(all.some((p) => p.investor && Object.values(p.branches).some(Boolean)), 'project data and branches')
  assert.ok(all.some((p) => Object.values(p.branches).every((b) => !b)), 'every branch brak')
})

test('demo: Tasks', async () => {
  const tasks = (await open()).tasks.map((t) => t.task)
  const thisWeek = addDays(TODAY, 6)
  assert.deepEqual(new Set(tasks.map((t) => t.status)), new Set(TASK_STATUSES))
  assert.ok(tasks.some((t) => t.urgent), 'urgent')
  assert.ok(tasks.some((t) => t.status !== 'done' && t.due && t.due < TODAY), 'overdue')
  assert.ok(tasks.some((t) => t.due === TODAY), 'today')
  assert.ok(tasks.some((t) => t.due && t.due > TODAY && t.due <= thisWeek), 'this week')
  assert.ok(tasks.some((t) => !t.due), 'no due date')
  assert.ok(tasks.some((t) => !t.assignee), 'no assignee')
  assert.ok(tasks.some((t) => !t.projectId), 'no project')
  assert.ok(tasks.filter((t) => t.status === 'done' && t.doneAt).length > DONE_SHOWN, 'older done folded')
})

test('demo: Leaves and meetings', async () => {
  const { leaves, meetings } = await open()
  const ls = leaves.map((l) => l.leave)
  assert.ok(ls.some((l) => l.to < TODAY), 'past')
  assert.ok(ls.some((l) => l.from <= TODAY && TODAY <= l.to), 'current')
  assert.ok(ls.some((l) => l.from > TODAY), 'upcoming')
  assert.ok(ls.some((a, i) => ls.some((b, j) => i !== j && a.from <= b.to && b.from <= a.to)), 'two overlapping')
  const ms = meetings.map((m) => m.meeting)
  assert.deepEqual(new Set(ms.map((m) => m.type)), new Set(MEETING_TYPES))
  assert.ok(ms.some((m) => m.type === 'budowa' && m.date.startsWith(TODAY.slice(0, 7))), 'on site in the current month')
  assert.ok(ms.some((m) => m.projectId) && ms.some((m) => !m.projectId), 'with and without a project')
  assert.ok(ms.some((m) => m.start) && ms.some((m) => !m.start), 'with and without times')
  assert.ok(ms.some((m) => m.date.startsWith(TODAY.slice(0, 7))), 'in the current month')
})

test('demo: Opened on 2026-11-11', async () => {
  for (const date of await allDates()) {
    if (date.length === 10) assert.ok(date >= '2025-11-11' && date <= '2028-11-10', date)
    else assert.ok(date >= '2025-11' && date <= '2028-10', date)
  }
})

test('demo: Opened a year later', async () => {
  const before = await allDates()
  const after = await allDates('2027-11-11')
  assert.equal(after.length, before.length)
  before.forEach((date, i) => assert.equal(after[i], date.length === 10 ? addDays(date, 365) : addMonths(date, 12)))
})

test('demo: Edit in the demo', async () => {
  const { dir, projects } = await open()
  const { project, file } = projects[0]
  await saveProject(dir, { ...project, title: 'Zmieniony tytuł' }, file, project.updatedAt)
  assert.equal((await readProjects(dir)).projects.find((p) => p.file === file)!.project.title, 'Zmieniony tytuł')
  assert.equal((await open()).projects.find((p) => p.file === file)!.project.title, project.title)
})
