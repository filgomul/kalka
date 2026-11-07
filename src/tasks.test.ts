import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatDate } from './model.ts'
import { badgeFor, emptyTask, GREY, normalizeTask, placeAt, prepareTaskForSave, sortTasks, taskState, textOn, type Task } from './tasks.ts'

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
