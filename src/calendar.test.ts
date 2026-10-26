import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyProject, type Project } from './model.ts'
import {
  deadlines,
  entries,
  monthEntries,
  monthGrid,
  overviewMonths,
  overviewRange,
  projectChoices,
  rangeLength,
  stepRange,
  visibleRows,
  withFrom,
  withLength,
  withTo,
} from './calendar.ts'

const TODAY = '2026-10-25'

function row(fields: Partial<Project>, file = (fields.title ?? 'p') + '.json') {
  return { project: { ...emptyProject(), ...fields }, file }
}
const titles = (rs: { project: Project }[]) => rs.map((r) => r.project.title)
const noFilter = { architect: '', status: '', project: '' }

test('calendar: October 2026', () => {
  const weeks = monthGrid('2026-10')
  assert.equal(weeks[0][0], '2026-09-28')
  assert.equal(weeks.at(-1)!.at(-1), '2026-11-01')
  assert.ok(weeks.every((w) => w.length === 7))
  assert.equal(weeks.length, 5)
  // a month starting on Monday has no leading days
  assert.equal(monthGrid('2027-02')[0][0], '2027-02-01')
})

test('calendar: Two milestones on one day', () => {
  const all = entries([row({ title: 'Dom Lipowa', milestones: { pbDoUrzedu: '2026-10-16' } }), row({ title: 'Hala Brzozowa', milestones: { uzupelnienie: '2026-10-16' } })], TODAY)
  const day = monthEntries(all, '2026-10').byDay.get('2026-10-16')!
  assert.deepEqual(day.map((e) => [e.project.title, e.key]), [['Dom Lipowa', 'pbDoUrzedu'], ['Hala Brzozowa', 'uzupelnienie']])
})

test('calendar: Undated milestone', () => {
  const all = entries([row({ title: 'Dom', milestones: { koncepcja: '2026-10-05' }, done: ['pozwolenie'] })], TODAY)
  assert.deepEqual(all.map((e) => e.key), ['koncepcja'])
})

test('calendar: Done and overdue in one month', () => {
  const all = entries([row({ title: 'Dom', milestones: { koncepcja: '2026-10-05', pbDoUrzedu: '2026-10-16' }, done: ['koncepcja'], confirmed: ['pbDoUrzedu'] })], TODAY)
  assert.deepEqual(all.map((e) => [e.key, e.state, e.confirmed]), [['koncepcja', 'done', false], ['pbDoUrzedu', 'overdue', true]])
})

test('calendar: Due today (chip)', () => {
  const [e] = entries([row({ milestones: { pbDoUrzedu: TODAY } })], TODAY)
  assert.equal(e.state, 'open')
})

test('calendar: Branch designs due in November', () => {
  const all = entries([row({ title: 'Dom', milestones: { branzysci: '2026-11' } })], TODAY)
  const nov = monthEntries(all, '2026-11')
  assert.deepEqual(nov.strip.map((e) => e.key), ['branzysci'])
  assert.equal(nov.byDay.size, 0)
  assert.equal(monthEntries(all, '2026-10').strip.length, 0)
})

test('calendar: Month not yet over', () => {
  const [e] = entries([row({ milestones: { branzysci: '2026-10' } })], TODAY)
  assert.equal(e.due, '2026-10-31')
  assert.equal(e.state, 'open')
})

test('calendar: One architect', () => {
  const rs = [row({ title: 'A', leadArchitect: 'Anna Nowak' }), row({ title: 'B', leadArchitect: 'Jan Kowalski' })]
  assert.deepEqual(titles(visibleRows(rs, { ...noFilter, architect: 'Anna Nowak' })), ['A'])
})

test('calendar: Default status', () => {
  const rs = [row({ title: 'A' }), row({ title: 'W', status: 'wstrzymany' }), row({ title: 'Z', status: 'zakończony' })]
  assert.deepEqual(titles(visibleRows(rs, noFilter)), ['A', 'W'])
})

test('calendar: One project', () => {
  const rs = [row({ title: 'A', leadArchitect: 'Anna Nowak' }), row({ title: 'Z', leadArchitect: 'Jan Kowalski', status: 'zakończony' })]
  assert.deepEqual(titles(visibleRows(rs, { architect: 'Anna Nowak', status: '', project: 'Z.json' })), ['Z'])
})

test('calendar: Sync conflict copy', () => {
  const rs = [row({ id: 'x', title: 'Dom' }, 'x.json'), row({ id: 'x', title: 'Dom (kopia)' }, 'x-PC.json')]
  assert.deepEqual(titles(visibleRows(rs, { ...noFilter, project: 'x-PC.json' })), ['Dom (kopia)'])
})

test('calendar: Project choices', () => {
  const rs = [row({ title: 'Dom Lipowa', lp: 12 }), row({ title: 'Willa Sosnowa', lp: 3 }), row({ title: 'Hala Brzozowa' })]
  assert.deepEqual(projectChoices(rs).map((c) => c.label), ['3 Willa Sosnowa', '12 Dom Lipowa', 'Hala Brzozowa'])
})

test('calendar: Ordering', () => {
  const all = entries([row({ title: 'Dom', milestones: { koncepcja: '2026-10-10', rozpoczecie: '2026-06-01', pbDoUrzedu: '2026-10-30', branzysci: '2026-11' } })], TODAY)
  const d = deadlines(all, TODAY)
  assert.deepEqual(d.overdue.map((e) => e.value), ['2026-06-01', '2026-10-10'])
  assert.deepEqual(d.weeks.map((w) => [w.monday, w.entries.map((e) => e.value)]), [
    ['2026-10-26', ['2026-10-30']],
    ['2026-11-30', ['2026-11']],
  ])
})

test('calendar: Due today (deadlines)', () => {
  const d = deadlines(entries([row({ milestones: { pbDoUrzedu: TODAY } })], TODAY), TODAY)
  assert.equal(d.overdue.length, 0)
  assert.deepEqual(d.weeks.map((w) => w.monday), ['2026-10-19'])
})

test('calendar: Done milestone', () => {
  const d = deadlines(entries([row({ milestones: { pbDoUrzedu: '2026-10-20', pozwolenie: '2026-10-28' }, done: ['pbDoUrzedu', 'pozwolenie'] })], TODAY), TODAY)
  assert.deepEqual(d, { overdue: [], weeks: [] })
})

test('calendar: Outside the window', () => {
  const all = entries([row({ milestones: { koncepcja: '2026-12-24', pozwolenie: '2026-12-25' } })], TODAY)
  assert.deepEqual(deadlines(all, TODAY).weeks.flatMap((w) => w.entries.map((e) => e.value)), ['2026-12-24'])
  assert.equal(all.length, 2)
})

const OCT_MAR = { from: '2026-10', to: '2027-03' }

test('calendar: Default range', () => {
  const r = overviewRange(null, null, '2026-10')
  assert.deepEqual(r, OCT_MAR)
  assert.equal(rangeLength(r), 6)
  assert.deepEqual(overviewMonths([], r).map((m) => m.month), ['2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03'])
  // the range comes back from the URL as it was, junk falls back to the default
  assert.deepEqual(overviewRange('2027-01', '2027-06', '2026-10'), { from: '2027-01', to: '2027-06' })
  assert.deepEqual(overviewRange('2027-13', 'x', '2026-10'), OCT_MAR)
})

test('calendar: Month block content', () => {
  const all = entries([row({ title: 'Dom', milestones: { pbDoUrzedu: '2026-10-16', koncepcja: '2026-10-05', branzysci: '2026-10' }, done: ['koncepcja'] })], TODAY)
  const [oct] = overviewMonths(all, OCT_MAR)
  assert.deepEqual(oct.shown.map((e) => [e.key, e.precision, e.state]), [
    ['koncepcja', 'day', 'done'],
    ['pbDoUrzedu', 'day', 'overdue'],
    ['branzysci', 'month', 'open'],
  ])
  assert.equal(oct.more, 0)
})

test('calendar: Busy month', () => {
  const rs = Array.from({ length: 11 }, (_, i) => row({ title: 'P' + i, milestones: { koncepcja: `2027-03-${String(i + 1).padStart(2, '0')}` } }))
  const mar = overviewMonths(entries(rs, TODAY), OCT_MAR).at(-1)!
  assert.equal(mar.month, '2027-03')
  assert.equal(mar.shown.length, 8)
  assert.equal(mar.more, 3)
  assert.equal(mar.shown[0].value, '2027-03-01')
})

test('calendar: Empty month', () => {
  const months = overviewMonths(entries([row({ milestones: { koncepcja: '2026-10-05' } })], TODAY), OCT_MAR)
  assert.equal(months.filter((m) => m.shown.length === 0).length, 5)
})

test('calendar: Shortcut', () => {
  assert.deepEqual(withLength(OCT_MAR, 3), { from: '2026-10', to: '2026-12' })
  assert.equal(rangeLength(withLength(OCT_MAR, 12)), 12)
})

test('calendar: Custom end', () => {
  const r = withTo(OCT_MAR, '2027-05')
  assert.deepEqual(r, { from: '2026-10', to: '2027-05' })
  assert.equal(rangeLength(r), 8)
})

test('calendar: End before start', () => {
  assert.deepEqual(withTo(OCT_MAR, '2026-08'), { from: '2026-10', to: '2026-10' })
})

test('calendar: Move the start', () => {
  assert.deepEqual(withFrom(OCT_MAR, '2027-01'), { from: '2027-01', to: '2027-06' })
})

test('calendar: Step', () => {
  const next = stepRange(OCT_MAR, 1)
  assert.deepEqual(next, { from: '2027-04', to: '2027-09' })
  assert.deepEqual(stepRange(next, -1), OCT_MAR)
})

test('calendar: Back to today', () => {
  assert.deepEqual(withFrom({ from: '2027-04', to: '2027-09' }, '2026-10'), OCT_MAR)
})

test('calendar: Range cap', () => {
  assert.deepEqual(withTo(OCT_MAR, '2029-12'), { from: '2026-10', to: '2028-09' })
  assert.deepEqual(overviewRange('2026-10', '2029-12', '2026-10'), { from: '2026-10', to: '2028-09' })
})

test('calendar: Whole year', () => {
  assert.deepEqual(withLength(withFrom(OCT_MAR, '2026-01'), 12), { from: '2026-01', to: '2026-12' })
})

test('calendar: Concept acceptance chip', () => {
  const all = entries([row({ title: 'Dom Lipowa', milestones: { akceptacja: '2026-11-14' } })], TODAY)
  const day = monthEntries(all, '2026-11').byDay.get('2026-11-14')!
  assert.deepEqual(day.map((e) => [e.project.title, e.key, e.state]), [['Dom Lipowa', 'akceptacja', 'open']])
})

test('calendar: Same day as the concept', () => {
  const all = entries([row({ title: 'Dom', milestones: { akceptacja: '2026-11-14', koncepcja: '2026-11-14' } })], TODAY)
  assert.deepEqual(all.map((e) => e.key), ['koncepcja', 'akceptacja'])
})

test('calendar: Planned chip', () => {
  const [e] = entries([row({ title: 'Dom Lipowa', milestones: { pozwolenie: '2026-11-20' } })], TODAY)
  assert.deepEqual([e.value, e.state, e.confirmed], ['2026-11-20', 'open', false])
})

test('calendar: Confirmed chip', () => {
  const [e] = entries([row({ title: 'Dom Lipowa', milestones: { pozwolenie: '2026-11-20' }, confirmed: ['pozwolenie'] })], TODAY)
  assert.deepEqual([e.state, e.confirmed], ['open', true])
})

test('calendar: Planned month', () => {
  const all = entries([row({ title: 'Dom', milestones: { branzysci: '2026-11' } })], TODAY)
  const { strip } = monthEntries(all, '2026-11')
  assert.deepEqual(strip.map((e) => [e.key, e.confirmed]), [['branzysci', false]])
})

test('calendar: Planned and overdue', () => {
  const [e] = entries([row({ milestones: { pbDoUrzedu: '2026-10-16' } })], TODAY)
  assert.deepEqual([e.state, e.confirmed], ['overdue', false])
})

test('calendar: Planned and done', () => {
  const [e] = entries([row({ milestones: { koncepcja: '2026-10-05' }, done: ['koncepcja'] })], TODAY)
  assert.deepEqual([e.state, e.confirmed], ['done', false])
})

test('calendar: Planned entry', () => {
  const d = deadlines(entries([row({ milestones: { pozwolenie: '2026-11-20' } })], TODAY), TODAY)
  assert.deepEqual(d.weeks.map((w) => [w.monday, w.entries.map((e) => [e.value, e.confirmed])]), [['2026-11-16', [['2026-11-20', false]]]])
  const confirmed = deadlines(entries([row({ milestones: { pozwolenie: '2026-11-20' }, confirmed: ['pozwolenie'] })], TODAY), TODAY)
  assert.equal(confirmed.weeks[0].entries[0].confirmed, true)
})
