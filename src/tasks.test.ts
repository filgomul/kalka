import { test } from 'node:test'
import assert from 'node:assert/strict'
import { t } from './pl.ts'
import { emptyProject, formatDate, type Project } from './model.ts'
import { byDay, byDue, byWeek, weekLabel, dropNeedsReviewer, needsReviewer, dayLabel, loadTodoView, saveTodoView, doneThisWeek, filterTaskRows, doneAtOn, doneDay, badgeFor, emptyTask, GREY, normalizeTask, placeAt, prepareTaskForSave, sortTasks, stampDone, taskState, textOn, type Task } from './tasks.ts'

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
  assert.equal(t.reviewer, '')
  assert.equal(t.reviewNote, '')
  assert.equal(t.status, 'todo')
})

test('tasks: File without reviewer', () => {
  for (const raw of [{}, { reviewer: 7 as unknown as string, reviewNote: null as unknown as string }]) {
    const t = normalizeTask({ id: 'a', projectId: 'p1', title: 'Rysunki', ...raw })
    assert.equal(t.reviewer, '')
    assert.equal(t.reviewNote, '')
  }
})

test('tasks: Reviewer notes trimmed', () => {
  assert.equal(prepareTaskForSave(task('A', { reviewNote: '  Popraw wymiary okien.  ' })).reviewNote, 'Popraw wymiary okien.')
})

test('tasks: State picked without a reviewer', () => {
  assert.equal(needsReviewer(task('Rysunki elewacji', { status: 'review' })), true)
  assert.equal(needsReviewer(task('Rysunki elewacji', { status: 'review', reviewer: 'Jan Kowalski' })), false)
})

test('tasks: Other states', () => {
  for (const status of ['todo', 'doing', 'done'] as const) assert.equal(needsReviewer(task('A', { status })), false)
})

test('tasks: Assignee reviews', () => {
  assert.equal(needsReviewer(task('A', { status: 'review', assignee: 'Anna Nowak', reviewer: 'Anna Nowak' })), false)
})

test('tasks: Reviewer without an assignee', () => {
  assert.equal(t.people('Anna Nowak', 'Jan Kowalski'), 'osoba: Anna Nowak, weryfikuje: Jan Kowalski')
  assert.equal(t.people('', 'Jan Kowalski'), 'osoba: -, weryfikuje: Jan Kowalski')
})

test('tasks: Back for fixes', () => {
  const before = task('A', { status: 'review', reviewer: 'Jan Kowalski', reviewNote: 'Popraw wymiary okien.' })
  const after = prepareTaskForSave(stampDone(before, { ...before, status: 'doing' }, '2026-11-22T10:00:00Z'))
  assert.equal(after.reviewer, 'Jan Kowalski')
  assert.equal(after.reviewNote, 'Popraw wymiary okien.')
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

test('tasks: Waiting for a check', () => {
  const t = normalizeTask({ id: 'a', projectId: 'p1', title: 'Rzut dachu', status: 'review' })
  assert.equal(t.status, 'review')
  assert.equal('doneAt' in t, false)
})

test('tasks: Hand-edited urgent mark', () => {
  assert.equal('urgent' in normalizeTask({ id: 'a', projectId: 'p1', urgent: 'tak' as unknown as true }), false)
  assert.equal(normalizeTask({ id: 'a', projectId: 'p1', urgent: true }).urgent, true)
})

test('tasks: Overdue', () => {
  assert.equal(taskState(task('A', { due: '2026-11-14' }), '2026-11-20'), 'overdue')
  assert.equal(taskState(task('A', { due: '2026-11-14', status: 'doing' }), '2026-11-20'), 'overdue')
  assert.equal(taskState(task('A', { due: '2026-11-14', status: 'review' }), '2026-11-20'), 'overdue')
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

test('tasks: Between cards in review', () => {
  const [d, e] = [row('D', { status: 'review', order: 1 }), row('E', { status: 'review', order: 2 })]
  const a = row('A', { status: 'doing', reviewer: 'Jan Kowalski' })
  assert.equal(dropNeedsReviewer(a.task, 'review'), false)
  const out = placeAt([d, e], a, 1, 'review')
  assert.deepEqual([out[0].task.status, out[0].task.reviewer], ['review', 'Jan Kowalski'])
  assert.deepEqual(titles(sortTasks([d, e, ...out])), ['D', 'A', 'E'])
})

test('tasks: Drag without a reviewer', () => {
  assert.equal(dropNeedsReviewer(task('Rysunki elewacji', { status: 'doing' }), 'review'), true)
  assert.equal(dropNeedsReviewer(task('Rysunki elewacji', { status: 'doing' }), 'done'), false)
})

test('tasks: Reviewer already chosen', () => {
  assert.equal(dropNeedsReviewer(task('Rysunki elewacji', { status: 'doing', reviewer: 'Jan Kowalski' }), 'review'), false)
})

test('tasks: Older task waiting for a check', () => {
  // reordering in review or ticking done does not ask for a reviewer
  const old = task('A', { status: 'review' })
  assert.equal(dropNeedsReviewer(old, 'review'), false)
  assert.equal(dropNeedsReviewer(old, 'done'), false)
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
  const checked = task('S', { status: 'review' })
  assert.equal(stampDone(checked, { ...checked, status: 'done' }, NOW).doneAt, NOW)
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
  assert.equal('doneAt' in stampDone(before, { ...before, status: 'review' }, NOW), false)
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
  // "Do weryfikacji" goes by reviewer
  const review = [row('Bez weryfikatora', { status: 'review', assignee: 'Anna Nowak' }), row('Z weryfikatorem', { status: 'review', reviewer: 'Jan Kowalski' })]
  assert.deepEqual(titles(filterTaskRows(review, [lipowa], { ...ALL, unassigned: true })), ['Bez weryfikatora'])
})

test('tasks: Tasks to check', () => {
  const rows = [row('Rzut dachu', { status: 'review', assignee: 'Anna Nowak', reviewer: 'Jan Kowalski' })]
  assert.deepEqual(titles(filterTaskRows(rows, [lipowa], { ...ALL, architect: 'Jan Kowalski' })), ['Rzut dachu'])
  assert.deepEqual(titles(filterTaskRows(rows, [lipowa], { ...ALL, architect: 'Anna Nowak' })), [])
})

test('tasks: Reviewer outside review', () => {
  const rows = [row('Rysunki elewacji', { status: 'doing', assignee: 'Anna Nowak', reviewer: 'Jan Kowalski' })]
  assert.deepEqual(titles(filterTaskRows(rows, [lipowa], { ...ALL, architect: 'Jan Kowalski' })), [])
  assert.deepEqual(titles(filterTaskRows(rows, [lipowa], { ...ALL, architect: 'Anna Nowak' })), ['Rysunki elewacji'])
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

test('tasks: Waiting for a check (order)', () => {
  const rows = [row('A', { status: 'review', due: '2026-11-30' }), row('B', { status: 'review', urgent: true }), row('C', { status: 'review', due: '2026-11-14' })]
  assert.deepEqual(titles(byDue(rows)), ['B', 'C', 'A'])
})

test('tasks: Project order ignored', () => {
  const rows = [row('A', { order: 1, due: '2026-12-01' }), row('B', { order: 2, due: '2026-11-01' })]
  assert.deepEqual(titles(byDue(rows)), ['B', 'A'])
})

const done = (title: string, day: number, extra: Partial<Task> = {}) =>
  row(title, { status: 'done', doneAt: `2026-11-${String(day).padStart(2, '0')}T10:00:00.000Z`, ...extra })
/** Wednesday; this week is 2026-11-16 - 2026-11-22 */
const WED = '2026-11-18'
const weeks = (rows: { task: Task }[], today = WED) => byWeek(rows, today).map((g) => [weekLabel(g.key, today), titles(g.rows)])

test('tasks: Week groups and counts', () => {
  assert.deepEqual(weeks([done('A', 17), done('B', 18), done('C', 12), done('D', 3)]), [
    ['ten tydzień', ['B', 'A']],
    ['w zeszłym tygodniu', ['C']],
    ['02.11.2026 - 08.11.2026', ['D']],
  ])
})

test('tasks: Older week header', () => {
  assert.equal(weekLabel('2026-10-26', WED), '26.10.2026 - 01.11.2026')
})

test('tasks: Week boundary', () => {
  const local = (d: number, h: number, m: number) => new Date(2026, 10, d, h, m).toISOString()
  const rows = [row('Niedziela', { status: 'done', doneAt: local(15, 23, 30) }), row('Poniedziałek', { status: 'done', doneAt: local(16, 0, 10) })]
  assert.deepEqual(weeks(rows, '2026-11-16'), [['ten tydzień', ['Poniedziałek']], ['w zeszłym tygodniu', ['Niedziela']]])
})

test('tasks: Empty week skipped', () => {
  assert.deepEqual(weeks([done('A', 18), done('B', 4)]).map((g) => g[0]), ['ten tydzień', '02.11.2026 - 08.11.2026'])
})

test('tasks: Done ignores urgency in a week', () => {
  assert.deepEqual(weeks([done('Pilne', 17, { urgent: true }), done('Inne', 18)]), [['ten tydzień', ['Inne', 'Pilne']]])
})

test('tasks: Older file', () => {
  const old = row('Stare', { status: 'done', updatedAt: '2026-11-17T09:00:00.000Z' })
  assert.deepEqual(weeks([old, done('Nowsze', 18)]), [['ten tydzień', ['Nowsze', 'Stare']]])
})

test('tasks: Clock ahead', () => {
  assert.deepEqual(weeks([done('A', 18), done('Z przyszłości', 24)]), [['ten tydzień', ['Z przyszłości', 'A']]])
})

test('tasks: Undo keeps it visible', () => {
  const eight = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => row(`T${n}`, { status: 'done', doneAt: `2026-11-17T0${n}:00:00.000Z` }))
  const ticked = row('Nowe', { status: 'done', doneAt: '2026-11-18T10:00:00.000Z' })
  assert.equal(byWeek([...eight, ticked], WED)[0].rows[0], ticked)
})

test('tasks: File without any time', () => {
  const bare = row('Bez czasu', { status: 'done', doneAt: '', updatedAt: '' })
  const groups = byWeek([bare, done('A', 18)], WED)
  assert.deepEqual(groups.map((g) => titles(g.rows)), [['A'], ['Bez czasu']])
})

test('tasks: Back to its old week', () => {
  // dragged out and back: done again today; then 2026-11-03 picked in the dialog
  const before = task('Stara', { status: 'done', doneAt: '2026-11-18T09:00:00.000Z' })
  const saved = stampDone(before, { ...before, doneAt: doneAtOn('2026-11-03') }, NOW)
  assert.equal(doneDay(saved), '2026-11-03')
  assert.deepEqual(weeks([{ task: saved }]), [['02.11.2026 - 08.11.2026', ['Stara']]])
})

test('tasks: Picked when becoming done', () => {
  const before = task('A', { status: 'doing' })
  const saved = stampDone(before, { ...before, status: 'done', doneAt: doneAtOn('2026-11-10') }, NOW)
  assert.equal(doneDay(saved), '2026-11-10')
})

test('tasks: Unchanged', () => {
  const before = task('A', { status: 'done', doneAt: '2026-11-03T13:20:00.000Z' })
  assert.equal(stampDone(before, { ...before, title: 'B' }, NOW).doneAt, '2026-11-03T13:20:00.000Z')
})

test('tasks: Old file unchanged', () => {
  const before = task('A', { status: 'done', updatedAt: '2026-11-05T10:00:00.000Z' })
  assert.equal(doneDay(before), '2026-11-05')
  assert.equal('doneAt' in stampDone(before, { ...before, title: 'B' }, NOW), false)
})

test('tasks: Nothing done', () => {
  assert.deepEqual(byWeek([], WED), [])
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

const DAY_TODAY = '2026-11-10'
const groups = (rows: { task: Task }[]) => byDay(rows, DAY_TODAY).map((g) => [dayLabel(g.key), g.key === DAY_TODAY, titles(g.rows)])

test('tasks: Groups and counts', () => {
  const rows = [row('D', { due: '2026-11-14' }), row('B', { due: '2026-11-10' }), row('C', { due: '2026-11-12' }), row('A', { due: '2026-11-10' })]
  assert.deepEqual(groups(rows), [
    ['wt 10.11.2026', true, ['A', 'B']],
    ['czw 12.11.2026', false, ['C']],
    ['sob 14.11.2026', false, ['D']],
  ])
})

test('tasks: Overdue together', () => {
  const rows = [row('later', { due: '2026-11-12' }), row('six', { due: '2026-11-06' }), row('three', { due: '2026-11-03' })]
  assert.deepEqual(groups(rows)[0], ['po terminie', false, ['three', 'six']])
})

test('tasks: Urgent inside a day', () => {
  assert.deepEqual(groups([row('A', { due: '2026-11-12' }), row('B', { due: '2026-11-12', urgent: true })]), [['czw 12.11.2026', false, ['B', 'A']]])
})

test('tasks: Urgent keeps its day', () => {
  const rows = [row('B', { due: '2026-11-14', urgent: true }), row('A', { due: '2026-11-12' })]
  assert.deepEqual(groups(rows), [
    ['czw 12.11.2026', false, ['A']],
    ['sob 14.11.2026', false, ['B']],
  ])
})

test('tasks: Month date', () => {
  const rows = [row('dec', { due: '2026-12-01' }), row('month', { due: '2026-11' }), row('last', { due: '2026-11-30' })]
  assert.deepEqual(groups(rows).map((g) => g[0]), ['pon 30.11.2026', '11.2026', 'wt 01.12.2026'])
})

test('tasks: Past month', () => {
  assert.deepEqual(groups([row('oct', { due: '2026-10' })]), [['po terminie', false, ['oct']]])
})

test('tasks: Without a date', () => {
  const rows = [row('none'), row('day', { due: '2026-11-12' })]
  assert.deepEqual(groups(rows).at(-1), ['bez terminu', false, ['none']])
})

test('tasks: Empty column', () => {
  assert.deepEqual(byDay([], DAY_TODAY), [])
})

const memory = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }
}

test('tasks: First visit', () => {
  assert.equal(loadTodoView(memory()), 'urgent')
  assert.equal(loadTodoView(undefined), 'urgent')
})

test('tasks: Remembered', () => {
  const store = memory()
  saveTodoView(store, 'days')
  assert.equal(loadTodoView(store), 'days')
  saveTodoView(store, 'urgent')
  assert.equal(loadTodoView(store), 'urgent')
})

test('tasks: Storage blocked', () => {
  const blocked = { getItem: () => { throw new Error('SecurityError') }, setItem: () => { throw new Error('QuotaExceededError') } }
  assert.equal(loadTodoView(blocked), 'urgent')
  assert.doesNotThrow(() => saveTodoView(blocked, 'days'))
})
