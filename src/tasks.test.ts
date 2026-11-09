import { test } from 'node:test'
import assert from 'node:assert/strict'
import { t } from './pl.ts'
import { emptyProject, formatDate, type Project } from './model.ts'
import { byDue, doneThisWeek, filterTaskRows, splitDone, badgeFor, emptyTask, GREY, normalizeTask, placeAt, prepareTaskForSave, sortTasks, stampDone, taskState, textOn, type Task } from './tasks.ts'

const task = (title: string, extra: Partial<Task> = {}): Task => ({ ...emptyTask('p1'), id: title, title, ...extra })
const row = (title: string, extra: Partial<Task> = {}) => ({ task: task(title, extra), file: `${title}.json` })
const titles = (rows: { task: Task }[]) => rows.map((r) => r.task.title)

test('tasks: Month precision', () => {
  const saved = prepareTaskForSave(task('Rysunki', { due: '2026-11' }))
  assert.equal(saved.due, '2026-11')
  assert.equal(formatDate(saved.due), '11.2026')
  assert.equal(prepareTaskForSave(task('Rysunki', { due: '' })).due, undefined)
})

test('tasks: Written file', () => {
  const t = prepareTaskForSave({ ...emptyTask('dom-lipowa'), title: ' Rysunki elewacji ', due: '2026-11-14', assignee: 'Anna Nowak' })
  assert.equal(t.projectId, 'dom-lipowa')
  assert.equal(t.title, 'Rysunki elewacji')
  assert.equal(t.due, '2026-11-14')
  assert.equal(t.assignee, 'Anna Nowak')
  assert.equal(t.status, 'todo')
})

test('tasks: Hand-edited file', () => {
  const t = normalizeTask({ id: 'a', projectId: 'p1', title: 'Rysunki', status: 'gotowe' as Task['status'], order: 'x' as unknown as number })
  assert.equal(t.status, 'todo')
  assert.equal(t.description, '')
  assert.equal(t.assignee, '')
  assert.equal(t.order, undefined)
  assert.equal('due' in t, false)
  assert.equal('urgent' in t, false)
})

test('tasks: Hand-edited urgent mark', () => {
  assert.equal('urgent' in normalizeTask({ id: 'a', projectId: 'p1', urgent: 'tak' as unknown as true }), false)
  assert.equal(normalizeTask({ id: 'a', projectId: 'p1', urgent: true }).urgent, true)
})

test('tasks: Overdue', () => {
  assert.equal(taskState(task('A', { due: '2026-11-14' }), '2026-11-20'), 'overdue')
  assert.equal(taskState(task('A', { due: '2026-11-14', status: 'doing' }), '2026-11-20'), 'overdue')
  assert.equal(taskState(task('A', { due: '2026-11' }), '2026-11-20'), 'open')
  assert.equal(taskState(task('A'), '2026-11-20'), 'open')
})

test('tasks: Done is never overdue', () => {
  assert.equal(taskState(task('A', { due: '2026-11-14', status: 'done' }), '2026-11-20'), 'done')
})

test('tasks: Date changed', () => {
  const rows = [row('A', { order: 1, due: '2026-12-01' }), row('B', { order: 2, due: '2026-11-01' })]
  assert.deepEqual(titles(sortTasks(rows)), ['A', 'B'])
})

test('tasks: Tasks without a place', () => {
  const rows = [row('C'), row('B', { due: '2026-11-30' }), row('X', { order: 5 }), row('A', { due: '2026-11' })]
  assert.deepEqual(titles(sortTasks(rows)), ['X', 'A', 'B', 'C'])
})

test('tasks: Drag to done', () => {
  const moved = row('R', { status: 'doing', order: 1 })
  const done = [row('D', { status: 'done', order: 4 })]
  const out = placeAt(done, moved, 1, 'done')
  assert.equal(out.length, 1)
  assert.deepEqual([out[0].task.status, out[0].task.order], ['done', 5])
  assert.equal(placeAt([], moved, 0, 'done')[0].task.order, 0)
})

test('tasks: Reorder within a column', () => {
  const [a, b, c] = [row('A', { order: 1 }), row('B', { order: 2 }), row('C', { order: 3 })]
  const out = placeAt([a, b, c], c, 0, 'todo')
  assert.equal(out.length, 1)
  assert.equal(out[0].task.order, 0)
  assert.deepEqual(titles(sortTasks([a, b, ...out])), ['C', 'A', 'B'])
})

test('tasks: Between cards of another column', () => {
  const a = row('A', { order: 1 })
  const [d, e] = [row('D', { status: 'doing', order: 1 }), row('E', { status: 'doing', order: 2 })]
  const out = placeAt([d, e], a, 1, 'doing')
  assert.equal(out.length, 1)
  assert.deepEqual([out[0].task.status, out[0].task.order], ['doing', 1.5])
  assert.deepEqual(titles(sortTasks([d, e, ...out])), ['D', 'A', 'E'])
})

test('tasks: Same place', () => {
  const [a, b] = [row('A', { order: 1 }), row('B', { order: 2 })]
  assert.deepEqual(placeAt([a, b], b, 1, 'todo'), [])
  assert.deepEqual(placeAt([a, b], a, 0, 'todo'), [])
})

test('tasks: Renumber', () => {
  // a gap too small to split
  const [a, b, c] = [row('A', { order: 1 }), row('B', { order: 1 + 1e-7 }), row('C', { order: 3 })]
  const out = placeAt([a, b, c], c, 1, 'todo')
  assert.deepEqual(out.map((r) => [r.task.title, r.task.order]), [['C', 2], ['B', 3]])
  // a neighbour without an order
  const [x, y] = [row('X', { order: 1 }), row('Y')]
  const moved = row('N', { status: 'doing' })
  const out2 = placeAt([x, y], moved, 2, 'todo')
  assert.deepEqual(out2.map((r) => [r.task.title, r.task.order, r.task.status]), [['Y', 2, 'todo'], ['N', 3, 'todo']])
})

test('tasks: Defined in kalka.json', () => {
  assert.deepEqual(badgeFor({ 'Anna Nowak': { initials: 'ANo', color: '#697662' } }, 'Anna Nowak'), { initials: 'ANo', color: '#697662' })
})

test('tasks: Plain name', () => {
  assert.deepEqual(badgeFor({}, 'Jan Maria Kowalski'), { initials: 'JK', color: GREY })
  assert.equal(badgeFor({}, 'Anna').initials, 'A')
})

test('tasks: Invalid colour', () => {
  assert.equal(badgeFor({ 'Anna Nowak': { color: 'zielony' } }, 'Anna Nowak').color, GREY)
  assert.equal(badgeFor({ 'Anna Nowak': { color: '#abc' } }, 'Anna Nowak').color, '#abc')
})

test('tasks: Full card', () => {
  assert.equal(textOn('#697662'), '#fff')
  assert.equal(textOn('#f5eee2'), '#2f2e2e')
  assert.equal(textOn('#fff'), '#2f2e2e')
})

const NOW = '2026-11-20T10:00:00.000Z'

test('tasks: Done time set', () => {
  const before = task('R', { status: 'doing' })
  assert.equal(stampDone(before, { ...before, status: 'done' }, NOW).doneAt, NOW)
  // a task saved as done straight away
  assert.equal(stampDone(undefined, task('N', { status: 'done' }), NOW).doneAt, NOW)
})

test('tasks: Done time kept', () => {
  const before = task('R', { status: 'done', doneAt: '2026-11-02T08:00:00.000Z', order: 1 })
  assert.equal(stampDone(before, { ...before, description: 'x', order: 2 }, NOW).doneAt, '2026-11-02T08:00:00.000Z')
})

test('tasks: Done time removed', () => {
  const before = task('R', { status: 'done', doneAt: '2026-11-02T08:00:00.000Z' })
  assert.equal('doneAt' in stampDone(before, { ...before, status: 'todo' }, NOW), false)
})

test('tasks: File without done time', () => {
  const before = normalizeTask({ id: 'R', projectId: 'p1', title: 'R', status: 'done', doneAt: 5 as unknown as string })
  assert.equal('doneAt' in before, false)
  assert.equal('doneAt' in stampDone(before, { ...before, order: 3 }, NOW), false)
})

// The "Zadania" tab

const project = (id: string, extra: Partial<Project> = {}) => ({ project: { ...emptyProject(), id, ...extra } })
const lipowa = project('p1', { title: 'Dom Lipowa', leadArchitect: 'Jan Kowalski' })
const sosnowa = project('p2', { title: 'Willa Sosnowa' })
const ALL = { architect: '', unassigned: false, status: '', withProject: '' }

test('tasks: Tasks of several projects', () => {
  const rows = [row('Rysunki elewacji'), row('Zestawienie okien', { projectId: 'p2', status: 'doing' })]
  assert.deepEqual(titles(filterTaskRows(rows, [lipowa, sosnowa], ALL)), ['Rysunki elewacji', 'Zestawienie okien'])
})

test('tasks: Project gone in the tab', () => {
  // shown, as a task without a project
  const rows = [row('A', { projectId: 'gone' })]
  assert.deepEqual(titles(filterTaskRows(rows, [lipowa], ALL)), ['A'])
  assert.deepEqual(titles(filterTaskRows(rows, [lipowa], { ...ALL, withProject: 'bez' })), ['A'])
})

const mixed = [row('Z projektem'), row('Bez', { projectId: '' }), row('Zgubiony', { projectId: 'gone' })]

test('tasks: With a project', () => {
  assert.deepEqual(titles(filterTaskRows(mixed, [lipowa], { ...ALL, withProject: 'z' })), ['Z projektem'])
})

test('tasks: Without a project', () => {
  assert.deepEqual(titles(filterTaskRows(mixed, [lipowa], { ...ALL, withProject: 'bez' })), ['Bez', 'Zgubiony'])
})

test('tasks: Status leaves tasks without a project alone', () => {
  const done = project('z', { status: 'zakończony' })
  const rows = [row('Aktywny'), row('Zakończony', { projectId: 'z' }), row('Bez', { projectId: '' })]
  assert.deepEqual(titles(filterTaskRows(rows, [lipowa, done], { ...ALL, status: 'zakończony' })), ['Zakończony', 'Bez'])
  assert.deepEqual(titles(filterTaskRows(rows, [lipowa, done], ALL)), ['Aktywny', 'Bez'])
})

const assigned = [row('Anna', { assignee: 'Anna Nowak' }), row('Jan', { assignee: 'Jan Kowalski' }), row('Nikt')]

test('tasks: One architect', () => {
  assert.deepEqual(titles(filterTaskRows(assigned, [lipowa], { ...ALL, architect: 'Anna Nowak' })), ['Anna'])
})

test('tasks: Unassigned', () => {
  assert.deepEqual(titles(filterTaskRows(assigned, [lipowa], { ...ALL, unassigned: true })), ['Nikt'])
})

test('tasks: All architects', () => {
  assert.deepEqual(titles(filterTaskRows(assigned, [lipowa], ALL)), ['Anna', 'Jan', 'Nikt'])
})

test('tasks: Default status', () => {
  const projects = [project('a', { status: 'aktywny' }), project('w', { status: 'wstrzymany' }), project('z', { status: 'zakończony' })]
  const rows = ['a', 'w', 'z'].map((id) => row(id, { projectId: id }))
  assert.deepEqual(titles(filterTaskRows(rows, projects, ALL)), ['a', 'w'])
  assert.deepEqual(titles(filterTaskRows(rows, projects, { ...ALL, status: 'wszystkie' })), ['a', 'w', 'z'])
  assert.deepEqual(titles(filterTaskRows(rows, projects, { ...ALL, status: 'zakończony' })), ['z'])
})

test('tasks: By due date', () => {
  const rows = [row('A', { due: '2026-11-30' }), row('B', { due: '2026-11-14' }), row('C'), row('D', { due: '2026-11' })]
  assert.deepEqual(titles(byDue(rows)), ['B', 'A', 'D', 'C'])
})

test('tasks: Urgent first', () => {
  const rows = [row('A', { due: '2026-11-14' }), row('B', { urgent: true, due: '2026-11-30' }), row('C', { urgent: true })]
  assert.deepEqual(titles(byDue(rows)), ['B', 'C', 'A'])
})

test('tasks: Project order ignored', () => {
  const rows = [row('A', { order: 1, due: '2026-12-01' }), row('B', { order: 2, due: '2026-11-01' })]
  assert.deepEqual(titles(byDue(rows)), ['B', 'A'])
})

const done = (title: string, day: number) => row(title, { status: 'done', doneAt: `2026-11-${String(day).padStart(2, '0')}T10:00:00.000Z` })
const eight = [1, 2, 3, 4, 5, 6, 7, 8].map((d) => done(`T${d}`, d))

test('tasks: More than five', () => {
  const { recent, older } = splitDone(eight)
  assert.deepEqual(titles(recent), ['T8', 'T7', 'T6', 'T5', 'T4'])
  assert.equal(older.length, 3)
})

test('tasks: Show older', () => {
  assert.deepEqual(titles(splitDone(eight).older), ['T3', 'T2', 'T1'])
})

test('tasks: Undo keeps it visible', () => {
  const ticked = row('Nowe', { status: 'done', doneAt: NOW })
  assert.equal(splitDone([...eight, ticked]).recent[0], ticked)
})

test('tasks: Older file', () => {
  const old = row('Stare', { status: 'done', updatedAt: '2026-11-02T09:00:00.000Z' })
  assert.deepEqual(titles(splitDone([old, done('Nowsze', 5)]).recent), ['Nowsze', 'Stare'])
})

test('tasks: Done ignores urgency', () => {
  assert.deepEqual(titles(splitDone([row('Pilne', { status: 'done', urgent: true, doneAt: '2026-11-05T10:00:00.000Z' }), done('Inne', 6)]).recent), ['Inne', 'Pilne'])
})

// Building of the week (local noon, so no time zone moves the day)
const doneOn = (title: string, day: string, extra: Partial<Task> = {}) => row(title, { status: 'done', doneAt: new Date(`${day}T12:00:00`).toISOString(), ...extra })

test('tasks: Three this week', () => {
  const rows = [doneOn('A', '2026-11-09'), doneOn('B', '2026-11-10'), doneOn('C', '2026-11-11'), doneOn('D', '2026-11-08')]
  assert.equal(doneThisWeek(rows, '2026-11-11'), 3)
})

test('tasks: Filtered', () => {
  const rows = [doneOn('A', '2026-11-09', { assignee: 'Anna Nowak' }), doneOn('B', '2026-11-10', { assignee: 'Jan Kowalski' })]
  const shown = filterTaskRows(rows, [lipowa], { ...ALL, architect: 'Anna Nowak' })
  assert.equal(doneThisWeek(shown, '2026-11-11'), 1)
})

test('tasks: Gable and weathervane', () => {
  const rows = ['09', '10', '11', '12', '13', '14', '15', '15'].map((d, i) => doneOn(`T${i}`, `2026-11-${d}`))
  assert.equal(doneThisWeek(rows, '2026-11-15'), 8)
})

test('tasks: New week', () => {
  const rows = [doneOn('A', '2026-11-15'), row('Stare', { status: 'done', updatedAt: '2026-11-16T09:00:00.000Z' }), doneOn('Otwarte', '2026-11-16', { status: 'doing' })]
  assert.equal(doneThisWeek(rows, '2026-11-16'), 0)
})

test('tasks: Floor count', () => {
  assert.deepEqual([0, 1, 2, 5, 12, 22, 24, 25].map(t.floorCount), ['0 pięter', '1 piętro', '2 piętra', '5 pięter', '12 pięter', '22 piętra', '24 piętra', '25 pięter'])
})
