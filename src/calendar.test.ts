import { test } from 'node:test'
import assert from 'node:assert/strict'
import { moveMilestone, normalize, styleOf, titleOf, type Project, type RawProject } from './model.ts'
import {
  deadlines,
  entries,
  legendStyles,
  monthEntries,
  monthGrid,
  overviewMonths,
  overviewRange,
  projectChoices,
  projectIdChoices,
  projectsLabel,
  projectsOf,
  selectable,
  toggleProject,
  withNarrowing,
  withProjects,
  rangeLength,
  stepRange,
  visibleRows,
  withFrom,
  withLength,
  withTo,
  showOf,
  showParam,
  shownOnCalendar,
  isMeetingItem,
  withMeetings,
  ganttRows,
  placeOf,
  dayCenter,
  spanOf,
  rangeMonths,
} from './calendar.ts'
import { leavesInMonth } from './leaves.ts'

const TODAY = '2026-10-25'

/** Fixtures go through `normalize`, so the older shape (`milestones`, `done`, `confirmed`) still works here. */
function row(fields: Partial<RawProject>, file = (fields.title ?? 'p') + '.json') {
  return { project: normalize({ id: 'p', ...fields }), file }
}
const titles = (rs: { project: Project }[]) => rs.map((r) => r.project.title)
const noFilter = { architect: '', status: '', projects: null }

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
  assert.deepEqual(day.map((e) => [e.project.title, e.milestone.style]), [['Dom Lipowa', 'pbDoUrzedu'], ['Hala Brzozowa', 'uzupelnienie']])
})

test('calendar: Undated milestone', () => {
  const all = entries([row({ title: 'Dom', milestones: { koncepcja: '2026-10-05' }, done: ['pozwolenie'] })], TODAY)
  assert.deepEqual(all.map((e) => e.milestone.style), ['koncepcja'])
})

test('calendar: Done and overdue in one month', () => {
  const all = entries([row({ title: 'Dom', milestones: { koncepcja: '2026-10-05', pbDoUrzedu: '2026-10-16' }, done: ['koncepcja'], confirmed: ['pbDoUrzedu'] })], TODAY)
  assert.deepEqual(all.map((e) => [e.milestone.style, e.state, e.confirmed]), [['koncepcja', 'done', false], ['pbDoUrzedu', 'overdue', true]])
})

test('calendar: Due today (chip)', () => {
  const [e] = entries([row({ milestones: { pbDoUrzedu: TODAY } })], TODAY)
  assert.equal(e.state, 'open')
})

test('calendar: Branch designs due in November', () => {
  const all = entries([row({ title: 'Dom', milestones: { branzysci: '2026-11' } })], TODAY)
  const nov = monthEntries(all, '2026-11')
  assert.deepEqual(nov.strip.map((e) => e.milestone.style), ['branzysci'])
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
  // architect and status still apply next to the selection
  const rs = [row({ title: 'A', leadArchitect: 'Anna Nowak' }), row({ title: 'B', leadArchitect: 'Anna Nowak' }), row({ title: 'Z', leadArchitect: 'Anna Nowak', status: 'zakończony' }), row({ title: 'J', leadArchitect: 'Jan Kowalski' })]
  assert.deepEqual(titles(visibleRows(rs, { architect: 'Anna Nowak', status: '', projects: ['A.json'] })), ['A'])
  assert.deepEqual(titles(visibleRows(rs, { architect: 'Anna Nowak', status: '', projects: ['Z.json', 'J.json'] })), [])
})

test('calendar: Sync conflict copy', () => {
  const rs = [row({ id: 'x', title: 'Dom' }, 'x.json'), row({ id: 'x', title: 'Dom (kopia)' }, 'x-PC.json')]
  assert.deepEqual(titles(visibleRows(rs, { ...noFilter, projects: ['x-PC.json'] })), ['Dom (kopia)'])
})

const threeProjects = () => [
  row({ title: 'Dom Lipowa', lp: 12, leadArchitect: 'Anna Nowak' }),
  row({ title: 'Willa Sosnowa', lp: 3, leadArchitect: 'Anna Nowak' }),
  row({ title: 'Hala Brzozowa', leadArchitect: 'Jan Kowalski' }),
]

test('calendar: Project choices', () => {
  const choices = projectChoices(selectable(threeProjects(), noFilter))
  assert.deepEqual(choices.map((c) => c.label), ['3 Willa Sosnowa', '12 Dom Lipowa', 'Hala Brzozowa'])
  assert.equal(projectsLabel(choices, null), 'wszystkie projekty')
})

test('calendar: Options follow the architect', () => {
  const choices = projectChoices(selectable(threeProjects(), { ...noFilter, architect: 'Anna Nowak' }))
  assert.deepEqual(choices.map((c) => c.label), ['3 Willa Sosnowa', '12 Dom Lipowa'])
})

test('calendar: Untick one', () => {
  const rs = threeProjects()
  const choices = projectChoices(rs)
  const projects = toggleProject(choices, null, 'Hala Brzozowa.json')
  assert.deepEqual(projects, ['Willa Sosnowa.json', 'Dom Lipowa.json'])
  assert.equal(projectsLabel(choices, projects), '2 z 3')
  assert.deepEqual(titles(visibleRows(rs, { ...noFilter, projects })), ['Dom Lipowa', 'Willa Sosnowa'])
  // ticking it again means all
  assert.equal(toggleProject(choices, projects, 'Hala Brzozowa.json'), null)
})

test('calendar: One ticked', () => {
  assert.equal(projectsLabel(projectChoices(threeProjects()), ['Dom Lipowa.json']), '12 Dom Lipowa')
})

test('calendar: Select none and all', () => {
  const rs = threeProjects()
  const none = projectsOf(withProjects(new URLSearchParams(), []))
  assert.deepEqual(none, [])
  assert.equal(projectsLabel(projectChoices(rs), none), 'żaden')
  assert.deepEqual(visibleRows(rs, { ...noFilter, projects: none }), [])
  assert.equal(projectsOf(withProjects(new URLSearchParams('p=nic'), null)), null)
})

test('calendar: Architect change ticks all', () => {
  const p = withNarrowing(new URLSearchParams('p=Dom+Lipowa.json&m=2026-11'), 'a', 'Jan Kowalski')
  assert.equal(projectsOf(p), null)
  assert.equal(p.get('a'), 'Jan Kowalski')
  assert.equal(p.get('m'), '2026-11')
  assert.equal(withNarrowing(p, 'a', '').has('a'), false)
})

test('calendar: Refresh (Projekty)', () => {
  const p = withProjects(new URLSearchParams('a=Anna+Nowak'), ['Dom Lipowa.json', 'Willa, Sosnowa.json'])
  assert.deepEqual(projectsOf(new URLSearchParams(p.toString())), ['Dom Lipowa.json', 'Willa, Sosnowa.json'])
  assert.equal(p.get('a'), 'Anna Nowak')
})

test('calendar: Link with one project', () => {
  const rs = threeProjects()
  assert.deepEqual(titles(visibleRows(rs, { ...noFilter, projects: projectsOf(new URLSearchParams('p=Dom+Lipowa.json')) })), ['Dom Lipowa'])
})

test('calendar: Project choices by id', () => {
  // a sync conflict copy shares the id and is offered once
  const rs = [row({ id: 'lipowa', title: 'Dom Lipowa', lp: 12 }), row({ id: 'lipowa', title: 'Dom Lipowa', lp: 12 }, 'Dom Lipowa (1).json'), row({ id: 'sosnowa', title: 'Willa Sosnowa', lp: 3 })]
  assert.deepEqual(projectIdChoices(rs), [{ id: 'sosnowa', label: '3 Willa Sosnowa' }, { id: 'lipowa', label: '12 Dom Lipowa' }])
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
  assert.deepEqual(oct.shown.map((e) => [e.milestone.style, e.precision, e.state]), [
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

test('calendar: Two years', () => {
  const r = withLength({ from: '2026-01', to: '2026-06' }, 24)
  assert.deepEqual(r, { from: '2026-01', to: '2027-12' })
  assert.equal(rangeLength(r), 24)
})

test('calendar: Concept acceptance chip', () => {
  const all = entries([row({ title: 'Dom Lipowa', milestones: { akceptacja: '2026-11-14' } })], TODAY)
  const day = monthEntries(all, '2026-11').byDay.get('2026-11-14')!
  assert.deepEqual(day.map((e) => [e.project.title, e.milestone.style, e.state]), [['Dom Lipowa', 'akceptacja', 'open']])
  const legend = legendStyles(entries([row({ milestones: { pbDoUrzedu: '2026-12-01', akceptacja: '2026-11-14', koncepcja: '2026-10-05' } })], TODAY))
  assert.deepEqual(legend.map((s) => `${s.short} - ${s.name}`), ['konc. - wydanie koncepcji', 'akc. - akceptacja koncepcji', 'PB - PB do urzędu'])
})

test('calendar: Same day as the concept', () => {
  const r = row({ title: 'Dom', milestones: { akceptacja: '2026-11-14', koncepcja: '2026-11-14' } })
  assert.deepEqual(entries([r], TODAY).map((e) => e.milestone.style), ['koncepcja', 'akceptacja'])
  // after moving "akceptacja koncepcji" above "wydanie koncepcji" the order follows
  const swapped = { ...r, project: { ...r.project, timeline: moveMilestone(r.project.timeline, 2, 1) } }
  assert.deepEqual(entries([swapped], TODAY).map((e) => e.milestone.style), ['akceptacja', 'koncepcja'])
})

test('calendar: Added milestone', () => {
  const r = row({
    title: 'Dom Lipowa',
    timeline: [
      { id: 'uzupelnienie', style: 'uzupelnienie' },
      { id: 'k3f9a2c1', style: 'uzupelnienie', title: 'drugie uzupełnienie', date: '2026-12-03' },
    ],
  })
  const day = monthEntries(entries([r], TODAY), '2026-12').byDay.get('2026-12-03')!
  assert.deepEqual(day.map((e) => [styleOf(e.milestone.style).short, titleOf(e.milestone), e.project.title]), [['uzup.', 'drugie uzupełnienie', 'Dom Lipowa']])
})

test('calendar: Other style', () => {
  const [e] = entries([row({ timeline: [{ id: 'p81c0d2e', style: 'inny', title: 'zmiana inwestora', date: '2026-12-08' }] })], TODAY)
  assert.deepEqual([styleOf(e.milestone.style).short, styleOf(e.milestone.style).color, titleOf(e.milestone)], ['inny', '#000000', 'zmiana inwestora'])
})

test('calendar: Legend of the styles in use', () => {
  const all = entries(
    [
      row({ title: 'A', timeline: [{ id: 'nadzor', style: 'nadzor', date: '2026-11' }, { id: 'pbDoUrzedu', style: 'pbDoUrzedu', date: '2026-10-30' }, { id: 'pozwolenie', style: 'pozwolenie' }] }),
      row({ title: 'B', timeline: [{ id: 'koncepcja', style: 'koncepcja', date: '2026-10-05' }] }),
    ],
    TODAY,
  )
  // in the order of the style list; "uzyskanie pozwolenia" has no date, so it is not listed
  assert.deepEqual(legendStyles(all).map((s) => s.id), ['koncepcja', 'pbDoUrzedu', 'nadzor'])
  // an unknown style is listed as "inny"
  assert.deepEqual(legendStyles(entries([row({ timeline: [{ id: 'x', style: 'odbior', title: 'odbiór', date: '2026-11-02' }] })], TODAY)).map((s) => s.id), ['inny'])
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
  assert.deepEqual(strip.map((e) => [e.milestone.style, e.confirmed]), [['branzysci', false]])
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

test('calendar: Leaves ignore the filters', () => {
  const rows = [row({ title: 'Dom Lipowa', leadArchitect: 'Anna Nowak', status: 'aktywny', milestones: { koncepcja: '2026-11-05' } }), row({ title: 'Hala', leadArchitect: 'Jan Kowalski', milestones: { koncepcja: '2026-11-06' } })]
  const leaves = [{ leave: { architect: 'Jan Kowalski' } }]
  const byAnna = shownOnCalendar(rows, leaves, [], { ...noFilter, architect: 'Anna Nowak' }, showOf(null), TODAY)
  assert.deepEqual(byAnna.all.map((e) => e.project.title), ['Dom Lipowa'])
  assert.deepEqual(byAnna.leaves, leaves)
  assert.deepEqual(shownOnCalendar(rows, leaves, [], { ...noFilter, projects: ['Hala.json'], status: 'zakończony' }, showOf(null), TODAY).leaves, leaves)
})

// one milestone, one meeting and one leave, to see which kinds "Pokaż" lets through
const kindsRows = [row({ title: 'Dom Lipowa', milestones: { koncepcja: '2026-11-05' } })]
const kindsLeaves = [{ leave: { architect: 'Jan Kowalski' } }]
const kindsMeetings = [{ meeting: { id: 'm', title: 'Spotkanie', date: '2026-11-05', architect: '', type: 'online' as const, note: '', updatedAt: '' } }]
const shownKinds = (k: string | null) => {
  const s = shownOnCalendar(kindsRows, kindsLeaves, kindsMeetings, noFilter, showOf(k), TODAY)
  return [s.all.length, s.meetings.length, s.leaves.length]
}

test('calendar: Default', () => {
  assert.deepEqual(shownKinds(null), [1, 1, 1])
  assert.deepEqual(shownKinds(''), [1, 1, 1])
  assert.equal(showParam(showOf(null)), '')
})

test('calendar: Milestones only', () => {
  assert.deepEqual(shownKinds('terminy'), [1, 0, 0])
})

test('calendar: Untick meetings', () => {
  const show = showOf(null)
  show.delete('spotkania')
  assert.equal(showParam(show), 'terminy,urlopy')
  assert.deepEqual(shownKinds(showParam(show)), [1, 0, 1])
})

test('calendar: Leaves only', () => {
  assert.deepEqual(shownKinds('urlopy'), [0, 0, 1])
})

test('calendar: Meetings only', () => {
  assert.deepEqual(shownKinds('spotkania'), [0, 1, 0])
})

test('calendar: Nothing ticked', () => {
  assert.equal(showParam(new Set()), 'nic')
  assert.deepEqual(shownKinds('nic'), [0, 0, 0])
})

test('calendar: Refresh (Pokaż)', () => {
  assert.deepEqual([...showOf(showParam(new Set(['urlopy'])))], ['urlopy'])
})

test('calendar: Meeting among milestones', () => {
  const all = entries([row({ title: 'Dom', milestones: { pbDoUrzedu: '2026-11-16', koncepcja: '2026-11-14' } })], TODAY)
  const meetings = [{ meeting: { ...kindsMeetings[0].meeting, title: 'Spotkanie z inwestorem', date: '2026-11-14', start: '10:00' } }]
  const [nov] = overviewMonths(withMeetings(all, meetings), { from: '2026-11', to: '2026-11' })
  assert.deepEqual(
    nov.shown.map((item) => (isMeetingItem(item) ? item.row.meeting.title : item.milestone.style)),
    ['Spotkanie z inwestorem', 'koncepcja', 'pbDoUrzedu'],
  )
})

test('calendar: Busy month with meetings', () => {
  const all = entries(Array.from({ length: 6 }, (_, i) => row({ title: `P${i}`, milestones: { koncepcja: `2027-03-0${i + 1}` } })), TODAY)
  const meetings = Array.from({ length: 5 }, (_, i) => ({ meeting: { ...kindsMeetings[0].meeting, id: `m${i}`, date: `2027-03-1${i}` } }))
  const [march] = overviewMonths(withMeetings(all, meetings), { from: '2027-03', to: '2027-03' })
  assert.deepEqual([march.shown.length, march.more], [8, 3])
  assert.deepEqual(march.shown.map((i) => i.value.slice(0, 10)).slice(5), ['2027-03-06', '2027-03-10', '2027-03-11'])
})

test('calendar: Meetings follow the architect and project filters', () => {
  const rows = [row({ title: 'Dom Lipowa', leadArchitect: 'Jan Kowalski', milestones: { koncepcja: '2026-11-05' } })]
  const meetings = [{ meeting: { ...kindsMeetings[0].meeting, architect: 'Anna Nowak', projectId: 'p' } }]
  const byAnna = shownOnCalendar(rows, [], meetings, { ...noFilter, architect: 'Anna Nowak' }, showOf(null), TODAY)
  assert.deepEqual([byAnna.all.length, byAnna.meetings.length], [0, 1])
  assert.equal(shownOnCalendar(rows, [], meetings, { ...noFilter, status: 'zakończony' }, showOf(null), TODAY).meetings.length, 1)
})

test('calendar: Busy month with a leave', () => {
  const days = Array.from({ length: 11 }, (_, i) => `2027-03-${String(i + 1).padStart(2, '0')}`)
  const all = entries(days.map((d, i) => row({ title: `P${i}`, milestones: { koncepcja: d } })), TODAY)
  const [march] = overviewMonths(all, { from: '2027-03', to: '2027-03' })
  assert.deepEqual([march.shown.length, march.more], [8, 3])
  const leaves = [{ leave: { id: 'l', architect: 'Anna Nowak', from: '2027-03-02', to: '2027-03-04', updatedAt: '' } }]
  assert.equal(leavesInMonth(leaves, '2027-03').length, 1)
})

// Harmonogram

const NOV_APR = { from: '2026-11', to: '2027-04' }
/** A project with a timeline of [style, date] pairs, in that order. */
const tl = (title: string, dates: [string, string][], fields: Partial<RawProject> = {}) =>
  row({ title, timeline: dates.map(([style, date], i) => ({ id: style + i, style, date })), ...fields })
const gantt = (rs: ReturnType<typeof row>[], r = NOV_APR, today = '2026-11-11') => ganttRows(entries(rs, today), r)

test('calendar: Order by first date', () => {
  const rows = gantt([
    tl('Willa Sosnowa', [['koncepcja', '2027-01-15']], { lp: 3 }),
    tl('Dom Lipowa', [['branzysci', '2026-11'], ['pbDoUrzedu', '2026-11-20']], { lp: 12 }),
    tl('Hala Brzozowa', [['koncepcja', '2026-11-02']]),
  ])
  assert.deepEqual(rows.map((r) => r.label), ['12 Dom Lipowa', 'Hala Brzozowa', '3 Willa Sosnowa'])
})

test('calendar: Same first date', () => {
  const rows = gantt([tl('Dom Lipowa', [['koncepcja', '2026-12-01']], { lp: 12 }), tl('Willa Sosnowa', [['koncepcja', '2026-12-01']], { lp: 3 })])
  assert.deepEqual(rows.map((r) => r.label), ['3 Willa Sosnowa', '12 Dom Lipowa'])
})

test('calendar: No dates', () => {
  const r = row({ title: 'Bez dat', timeline: [{ id: 'k', style: 'koncepcja', done: true }] })
  assert.deepEqual(gantt([r]), [])
})

test('calendar: All dates outside the range', () => {
  assert.deepEqual(gantt([tl('Stary', [['koncepcja', '2025-03-01'], ['pbDoUrzedu', '2025-09']])]), [])
  assert.deepEqual(gantt([tl('Późny', [['koncepcja', '2027-05-01']])]), [])
})

test('calendar: Span across the range', () => {
  const [r] = gantt([tl('Dom', [['koncepcja', '2026-08-10'], ['branzysci', '2027-08']])])
  assert.deepEqual([r.start, r.end, r.before, r.after, r.marks.length], ['2026-08-10', '2027-08-31', true, true, 0])
  assert.deepEqual(spanOf(r.start, r.end, NOV_APR), [0, 1])
})

test('calendar: Nothing to show', () => {
  assert.deepEqual(gantt([]), [])
})

test('calendar: Day and month milestones', () => {
  const [r] = gantt([tl('Dom Lipowa', [['koncepcja', '2026-11-05'], ['pbDoUrzedu', '2027-01-20'], ['branzysci', '2027-03']])])
  assert.deepEqual([r.start, r.end, r.bar, r.before, r.after], ['2026-11-05', '2027-03-31', true, false, false])
  assert.deepEqual(r.marks.map((m) => [m.value, m.precision, m.entries.map((e) => e.milestone.style)]), [
    ['2026-11-05', 'day', ['koncepcja']],
    ['2027-01-20', 'day', ['pbDoUrzedu']],
    ['2027-03', 'month', ['branzysci']],
  ])
  // the band covers the whole of March: the fifth column of six
  assert.deepEqual(spanOf('2027-03-01', '2027-03-31', NOV_APR), [4 / 6, 5 / 6])
})

test('calendar: Month at the start', () => {
  const [r] = gantt([tl('Dom', [['rozpoczecie', '2026-12'], ['koncepcja', '2027-02-14']])])
  assert.deepEqual([r.start, r.end], ['2026-12-01', '2027-02-14'])
})

test('calendar: Past the edge', () => {
  const [r] = gantt([tl('Dom', [['rozpoczecie', '2026-09-01'], ['koncepcja', '2027-02-10']])])
  assert.deepEqual([r.before, r.after], [true, false])
  assert.deepEqual(r.marks.map((m) => m.value), ['2027-02-10'])
  assert.equal(spanOf(r.start, r.end, NOV_APR)[0], 0)
})

test('calendar: One date', () => {
  const [r] = gantt([tl('Dom', [['koncepcja', '2026-12-03']])])
  assert.equal(r.bar, false)
  assert.equal(r.marks.length, 1)
})

test('calendar: Two on one day', () => {
  const r = row({ title: 'Dom Lipowa', timeline: [{ id: 'a', style: 'koncepcja', date: '2026-12-10', done: true }, { id: 'b', style: 'akceptacja', date: '2026-12-10' }] })
  const [g] = gantt([r])
  assert.equal(g.marks.length, 1)
  assert.equal(g.bar, false)
  assert.deepEqual(g.marks[0].entries.map((e) => [e.milestone.style, e.state]), [['koncepcja', 'done'], ['akceptacja', 'open']])
})

test('calendar: Two in one month', () => {
  const [g] = gantt([tl('Dom Lipowa', [['branzysci', '2027-04'], ['wydanieProjektu', '2027-04']])])
  assert.deepEqual(g.marks.map((m) => [m.value, m.entries.length]), [['2027-04', 2]])
})

test('calendar: Different projects', () => {
  const rows = gantt([tl('Dom Lipowa', [['koncepcja', '2026-12-10']]), tl('Willa Sosnowa', [['pbDoUrzedu', '2026-12-10']])])
  assert.deepEqual(rows.map((r) => r.marks.map((m) => m.entries.length)), [[1], [1]])
})

test('calendar: Columns', () => {
  assert.deepEqual(rangeMonths(NOV_APR), ['2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04'])
  // every month is one equal column, whatever its number of days
  assert.equal(placeOf('2027-02-01', NOV_APR), 3 / 6)
  assert.equal(placeOf('2027-03-01', NOV_APR), 4 / 6)
})

test('calendar: Today line', () => {
  assert.ok(Math.abs(dayCenter('2026-11-11', NOV_APR)! - 10.5 / 30 / 6) < 1e-12)
  assert.equal(dayCenter('2026-10-31', NOV_APR), null)
  assert.equal(dayCenter('2027-05-01', NOV_APR), null)
})
