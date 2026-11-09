import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  architectOptions,
  DEFAULT_SORT,
  filterProjects,
  formatDate,
  fromTemplate,
  moveMilestone,
  nextLp,
  nextMilestone,
  normalize,
  parseSort,
  prepareForSave,
  sortParam,
  sortProjects,
  STYLES,
  styleOf,
  templateOf,
  titleOf,
  withTimeline,
  type Milestone,
  type TypeId,
  type Project,
  type RawProject,
} from './model.ts'

/** Fixtures go through `normalize`, so the older shape (`milestones`, `done`, `confirmed`) still works here. */
function project(fields: Partial<RawProject> = {}): Project {
  return normalize({ id: 'x', ...fields })
}
const rows = (...ps: Project[]) => ps.map((project) => ({ project }))
const of = (p: Project, style: string) => p.timeline.find((m) => m.style === style)!
const next = (p: Project) => {
  const n = nextMilestone(p)
  return n && [n.milestone.style, n.milestone.date, n.due]
}

// Templates and styles

test('projects: Building template', () => {
  assert.deepEqual(fromTemplate('budowlany').map(titleOf), [
    'data rozpoczęcia',
    'wydanie koncepcji',
    'akceptacja koncepcji',
    'PB do urzędu',
    'uzupełnienie do urzędu',
    'uzyskanie pozwolenia',
    'termin branżystów',
    'wydanie projektu',
  ])
  assert.ok(fromTemplate('budowlany').every((m) => !m.date && !m.done && !m.confirmed))
})

test('projects: Interior template', () => {
  assert.deepEqual(fromTemplate('wnetrza').map(titleOf), [
    'data rozpoczęcia',
    'układy funkcjonalne',
    'akceptacja układów',
    'pierwsze wizualizacje',
    'akceptacja wizualizacji',
    'wydanie projektu',
    'nadzór autorski',
  ])
})

test('projects: Other', () => {
  assert.deepEqual(fromTemplate('inny'), [])
})

test('projects: Link without a template', () => {
  assert.deepEqual(fromTemplate(null), fromTemplate('budowlany'))
  assert.deepEqual(fromTemplate('nieznany'), fromTemplate('budowlany'))
})

test('projects: No template in the file', () => {
  const saved = prepareForSave(project({ title: 'Mieszkanie Klonowa', type: templateOf('wnetrza').id, timeline: fromTemplate('wnetrza') }))
  assert.deepEqual(Object.keys(saved).sort(), ['branches', 'id', 'leadArchitect', 'location', 'notes', 'status', 'timeline', 'title', 'type', 'updatedAt'])
  assert.equal(saved.type, 'wnetrza')
  assert.equal(saved.timeline.length, 7)
})

// Project type

test('projects: Link without a template (type)', () => {
  assert.equal(templateOf(null).id, 'budowlany')
  assert.equal(templateOf('nieznany').id, 'budowlany')
  assert.equal(templateOf('wnetrza').name, 'projekt wnętrz')
})

test('projects: File without a type', () => {
  assert.equal(project({ title: 'Dom Lipowa' }).type, 'inny')
})

test('projects: Unknown type', () => {
  assert.equal(project({ type: 'biuro' as TypeId }).type, 'inny')
  assert.equal(project({ type: 'budowlany' }).type, 'budowlany')
})

test('projects: Milestone change on a file without a type', () => {
  const base = project({ title: 'Dom Lipowa', timeline: fromTemplate('budowlany') })
  const written = withTimeline(base, base.timeline.map((m, i) => (i === 1 ? { ...m, done: true } : m)))
  assert.equal(written.type, 'inny')
  assert.equal(written.timeline[1].done, true)
})

test('projects: Short labels', () => {
  assert.deepEqual(STYLES.map((s) => s.short), ['rozp.', 'konc.', 'akc.', 'PB', 'uzup.', 'pozw.', 'branż.', 'wyd.', 'ukł.', 'akc. ukł.', 'wiz.', 'akc. wiz.', 'nadz.', 'inny'])
  assert.deepEqual(STYLES.map((s) => s.name), [
    'data rozpoczęcia',
    'wydanie koncepcji',
    'akceptacja koncepcji',
    'PB do urzędu',
    'uzupełnienie do urzędu',
    'uzyskanie pozwolenia',
    'termin branżystów',
    'wydanie projektu',
    'układy funkcjonalne',
    'akceptacja układów',
    'pierwsze wizualizacje',
    'akceptacja wizualizacji',
    'nadzór autorski',
    'inny',
  ])
  // every style has its own colour; only "inny" is black; none is the overdue red
  const colors = STYLES.map((s) => s.color)
  assert.equal(new Set(colors).size, colors.length)
  assert.deepEqual(STYLES.filter((s) => s.color === '#000000').map((s) => s.id), ['inny'])
  assert.ok(!colors.includes('#9b3b2f'))
})

test('projects: Unknown style', () => {
  const p = project({ timeline: [{ id: 'x1', style: 'odbior', title: 'odbiór budynku', date: '2027-05-10' }] })
  const [m] = p.timeline
  assert.equal(titleOf(m), 'odbiór budynku')
  assert.equal(styleOf(m.style).id, 'inny')
  assert.equal(styleOf(m.style).color, '#000000')
  // the unknown id is kept, so a later style list can define it
  assert.equal(prepareForSave(p).timeline[0].style, 'odbior')
})

// Older files

test('projects: Read', () => {
  const p = project({ title: 'Dom Lipowa', milestones: { pozwolenie: '2027-03' }, done: ['koncepcja'], confirmed: ['pozwolenie'] })
  assert.deepEqual(p.timeline.map((m) => m.style), fromTemplate('budowlany').map((m) => m.style))
  assert.deepEqual(of(p, 'koncepcja'), { id: 'koncepcja', style: 'koncepcja', done: true })
  assert.deepEqual(of(p, 'pozwolenie'), { id: 'pozwolenie', style: 'pozwolenie', date: '2027-03', confirmed: true })
  assert.deepEqual(of(p, 'wydanieProjektu'), { id: 'wydanieProjektu', style: 'wydanieProjektu' })
  assert.deepEqual(next(p), ['pozwolenie', '2027-03', '2027-03-31'])
})

test('projects: Save', () => {
  const saved = prepareForSave(project({ title: 'Dom Lipowa', milestones: { pozwolenie: '2027-03' }, done: ['koncepcja'] }))
  const file = JSON.parse(JSON.stringify(saved))
  assert.equal(file.timeline.length, 8)
  assert.equal(file.timeline.at(-1).style, 'wydanieProjektu')
  assert.ok(!('milestones' in file) && !('done' in file) && !('confirmed' in file))
  // read again, the new shape gives the same list
  assert.deepEqual(normalize(file).timeline, saved.timeline)
})

// Next milestone

test('projects: Mixed precision', () => {
  const p = project({ milestones: { pbDoUrzedu: '2026-10-30', branzysci: '2026-10' } })
  assert.deepEqual(next(p), ['pbDoUrzedu', '2026-10-30', '2026-10-30'])
})

test('projects: Overdue', () => {
  const late = project({ title: 'B', milestones: { pbDoUrzedu: '2026-10-10', pozwolenie: '2026-12-01' } })
  const soon = project({ title: 'A', milestones: { koncepcja: '2026-10-25' } })
  assert.deepEqual(next(late), ['pbDoUrzedu', '2026-10-10', '2026-10-10'])
  assert.ok(nextMilestone(late)!.due < '2026-10-25')
  assert.deepEqual(sortProjects(rows(soon, late)).map((r) => r.project.title), ['B', 'A'])
})

test('projects: Done milestone skipped', () => {
  const p = project({ milestones: { pbDoUrzedu: '2026-10-10', pozwolenie: '2026-12-01' }, done: ['pbDoUrzedu'] })
  assert.equal(nextMilestone(p)?.milestone.style, 'pozwolenie')
})

test('projects: All in the past', () => {
  const past = project({ title: 'B', milestones: { koncepcja: '2026-01-10', pozwolenie: '2026-09' }, done: ['koncepcja', 'pozwolenie'] })
  const none = project({ title: 'C' })
  const soon = project({ title: 'A', milestones: { koncepcja: '2026-11-02' } })
  assert.equal(nextMilestone(past), null)
  assert.equal(nextMilestone(none), null)
  assert.deepEqual(sortProjects(rows(past, none, soon)).map((r) => r.project.title), ['A', 'B', 'C'])
})

test('projects: Planned next milestone', () => {
  const p = project({ title: 'Dom Lipowa', milestones: { pozwolenie: '2027-03' } })
  const n = nextMilestone(p)!
  assert.equal(titleOf(n.milestone), 'uzyskanie pozwolenia')
  assert.equal(formatDate(n.milestone.date), '03.2027')
  assert.equal(n.milestone.confirmed, undefined)
})

test('projects: Confirmed next milestone', () => {
  const p = project({ milestones: { pozwolenie: '2027-03' }, confirmed: ['pozwolenie'] })
  assert.equal(nextMilestone(p)?.milestone.confirmed, true)
})

test('projects: Planned and overdue', () => {
  const p = project({ milestones: { pbDoUrzedu: '2026-10-10', pozwolenie: '2026-12-01' }, confirmed: ['pozwolenie'] })
  const n = nextMilestone(p)!
  assert.equal(n.milestone.style, 'pbDoUrzedu')
  assert.ok(n.due < '2026-10-25')
  assert.equal(n.milestone.confirmed, undefined)
})

// Precision, done and confirmed per milestone

test('projects: Month only', () => {
  assert.equal(formatDate('2026-11'), '11.2026')
  assert.equal(formatDate('2026-10-30'), '30.10.2026')
  assert.equal(formatDate(undefined), '')
  const saved = prepareForSave(project({ timeline: [{ id: 'branzysci', style: 'branzysci', date: '2026-11' }] }))
  assert.equal(saved.timeline[0].date, '2026-11')
})

test('projects: Clear a milestone', () => {
  const saved = prepareForSave(project({ title: ' Dom ', timeline: [{ id: 'koncepcja', style: 'koncepcja', date: '' }, { id: 'x', style: 'pozwolenie', date: 'wkrótce' }] }))
  assert.deepEqual(saved.timeline, [{ id: 'koncepcja', style: 'koncepcja' }, { id: 'x', style: 'pozwolenie' }])
  assert.equal(saved.title, 'Dom')
})

test('projects: Tick and save', () => {
  const p = project({ timeline: fromTemplate('budowlany') })
  const ticked = { ...p, timeline: p.timeline.map((m) => (m.style === 'koncepcja' ? { ...m, done: true } : m)) }
  const reopened = normalize(JSON.parse(JSON.stringify(prepareForSave(ticked))))
  assert.equal(of(reopened, 'koncepcja').done, true)
  assert.equal(reopened.timeline.filter((m) => m.done).length, 1)
})

test('projects: File without done marks', () => {
  const p = project({ milestones: { koncepcja: '2026-01-10' } })
  assert.ok(p.timeline.every((m) => !m.done))
  assert.equal(nextMilestone(p)?.milestone.style, 'koncepcja')
  // a hand-edited file with junk in done
  assert.ok(project({ done: 'koncepcja' }).timeline.every((m) => !m.done))
  assert.deepEqual(project({ done: ['pozwolenie', 'nic', 'koncepcja'] }).timeline.filter((m) => m.done).map((m) => m.style), ['koncepcja', 'pozwolenie'])
  assert.ok(project({ timeline: [{ id: 'a', style: 'koncepcja', done: 'tak' }] }).timeline.every((m) => !m.done))
})

test('projects: Done without a date', () => {
  const saved = prepareForSave(project({ title: 'Dom', timeline: [{ id: 'koncepcja', style: 'koncepcja', done: true }] }))
  assert.deepEqual(saved.timeline, [{ id: 'koncepcja', style: 'koncepcja', done: true }])
})

test('projects: Untick', () => {
  const saved = prepareForSave(project({ title: 'Dom', timeline: [{ id: 'koncepcja', style: 'koncepcja', done: false }] }))
  assert.ok(!('done' in saved.timeline[0]))
})

test('projects: Same style twice', () => {
  const p = project({
    timeline: [
      { id: 'uzupelnienie', style: 'uzupelnienie', date: '2026-11-02' },
      { id: 'k3f9a2c1', style: 'uzupelnienie', title: 'drugie uzupełnienie', date: '2026-12-03', done: true },
    ],
  })
  assert.deepEqual(p.timeline.map((m) => !!m.done), [false, true])
  assert.equal(nextMilestone(p)?.milestone.id, 'uzupelnienie')
})

test('projects: New project', () => {
  for (const id of ['budowlany', 'wnetrza']) assert.ok(fromTemplate(id).every((m) => !m.confirmed))
})

test('projects: Confirm and save', () => {
  const saved = prepareForSave(project({ title: 'Dom', timeline: [{ id: 'pozwolenie', style: 'pozwolenie', date: '2027-03', confirmed: true }] }))
  assert.equal(saved.timeline[0].confirmed, true)
  const reopened = normalize(JSON.parse(JSON.stringify(saved)))
  assert.equal(reopened.timeline[0].confirmed, true)
})

test('projects: Back to planned', () => {
  const saved = prepareForSave(project({ title: 'Dom', timeline: [{ id: 'pozwolenie', style: 'pozwolenie', date: '2027-03', confirmed: false }] }))
  assert.ok(!('confirmed' in saved.timeline[0]))
})

test('projects: File without confirmed marks', () => {
  const p = project({ milestones: { koncepcja: '2026-01-10' }, done: ['koncepcja'] })
  assert.ok(p.timeline.every((m) => !m.confirmed))
  // a hand-edited file with junk in confirmed
  assert.ok(project({ confirmed: 'koncepcja' }).timeline.every((m) => !m.confirmed))
  assert.deepEqual(project({ confirmed: ['pozwolenie', 'nic', 'koncepcja'] }).timeline.filter((m) => m.confirmed).map((m) => m.style), ['koncepcja', 'pozwolenie'])
})

test('projects: Confirmed without a date', () => {
  const saved = prepareForSave(project({ title: 'Dom', timeline: [{ id: 'koncepcja', style: 'koncepcja', confirmed: true }] }))
  assert.deepEqual(saved.timeline, [{ id: 'koncepcja', style: 'koncepcja', confirmed: true }])
})

test('projects: Date changed', () => {
  const p = project({ title: 'Dom', timeline: [{ id: 'pozwolenie', style: 'pozwolenie', date: '2027-03', confirmed: true }] })
  const saved = prepareForSave({ ...p, timeline: [{ ...p.timeline[0], date: '2027-03-18' }] })
  assert.deepEqual(saved.timeline[0], { id: 'pozwolenie', style: 'pozwolenie', date: '2027-03-18', confirmed: true })
})

test('projects: Independent of done', () => {
  const done = prepareForSave(project({ title: 'Dom', timeline: [{ id: 'koncepcja', style: 'koncepcja', date: '2026-10-05', done: true }] }))
  assert.deepEqual([done.timeline[0].done, done.timeline[0].confirmed], [true, undefined])
  const unticked = prepareForSave({ ...done, timeline: [{ ...done.timeline[0], done: false }] })
  assert.deepEqual([unticked.timeline[0].done, unticked.timeline[0].confirmed], [undefined, undefined])
})

// Adding and reordering

test('projects: Second supplement', () => {
  const p = project({ title: 'Dom Lipowa', timeline: fromTemplate('budowlany') })
  const added: Milestone = { id: 'k3f9a2c1', style: 'uzupelnienie', title: ' drugie uzupełnienie ' }
  const saved = prepareForSave({ ...p, timeline: [...p.timeline, added] })
  assert.deepEqual(saved.timeline.at(-1), { id: 'k3f9a2c1', style: 'uzupelnienie', title: 'drugie uzupełnienie' })
  assert.equal(saved.timeline.filter((m) => m.style === 'uzupelnienie').length, 2)
  // an empty title falls back to the style's name
  assert.equal(titleOf({ id: 'y', style: 'uzupelnienie', title: '' }), 'uzupełnienie do urzędu')
})

test('projects: Drag', () => {
  const list = fromTemplate('budowlany')
  const from = list.findIndex((m) => m.style === 'wydanieProjektu')
  const moved = moveMilestone(list, from, list.findIndex((m) => m.style === 'branzysci'))
  assert.deepEqual(moved.slice(-2).map((m) => m.style), ['wydanieProjektu', 'branzysci'])
  assert.deepEqual(moveMilestone(moved, 6, 7), list)
  assert.equal(list.at(-1)!.style, 'wydanieProjektu') // the input is left alone
})

// Milestones saved at once

test('projects: Unsaved project fields stay out', () => {
  const base = project({ title: 'Dom Lipowa', updatedAt: 't1', timeline: fromTemplate('budowlany') })
  const draft = { ...base, title: 'Dom Lipowa 2', timeline: base.timeline.map((m) => (m.style === 'koncepcja' ? { ...m, done: true } : m)) }
  const written = withTimeline(base, draft.timeline)
  assert.equal(written.title, 'Dom Lipowa')
  assert.equal(written.updatedAt, 't1')
  assert.equal(of(written, 'koncepcja').done, true)
})

test('projects: Day to month', () => {
  const base = project({ timeline: [{ id: 'pozwolenie', style: 'pozwolenie', date: '2027-03-18' }] })
  const written = withTimeline(base, [{ ...base.timeline[0], date: '2027-03-18'.slice(0, 7) }])
  assert.equal(written.timeline[0].date, '2027-03')
})

// List, filters, numbers (unchanged behaviour)

test('projects: Default view', () => {
  const r = rows(project({ title: 'Otwarty' }), project({ title: 'Stary', status: 'zakończony' }))
  assert.deepEqual(filterProjects(r, { architect: '', status: '', q: '' }).map((x) => x.project.title), ['Otwarty'])
  assert.equal(filterProjects(r, { architect: '', status: 'wszystkie', q: '' }).length, 2)
  assert.deepEqual(filterProjects(r, { architect: '', status: 'zakończony', q: '' }).map((x) => x.project.title), ['Stary'])
})

test('projects: Filter by architect', () => {
  const r = rows(project({ title: 'A', leadArchitect: 'Anna Nowak' }), project({ title: 'B', leadArchitect: 'Jan Kowalski' }))
  assert.deepEqual(filterProjects(r, { architect: 'Anna Nowak', status: '', q: '' }).map((x) => x.project.title), ['A'])
})

test('projects: Search', () => {
  const r = rows(
    project({ title: 'Dom w Oliwie', location: { city: 'Gdańsk', address: '' } }),
    project({ title: 'Biuro', location: { city: 'Gdańsk', address: 'ul. Oliwska 3' } }),
    project({ title: 'Hala', location: { city: 'Oliwa', address: '' } }),
    project({ title: 'Szkoła', location: { city: 'Sopot', address: 'ul. Morska 1' } }),
  )
  assert.deepEqual(
    filterProjects(r, { architect: '', status: '', q: 'Oliwa' }).map((x) => x.project.title),
    ['Hala'],
  )
  assert.equal(filterProjects(r, { architect: '', status: '', q: 'oliw' }).length, 3)
})

test('projects: Filter by type', () => {
  const r = rows(project({ title: 'Dom', type: 'budowlany' }), project({ title: 'Mieszkanie', type: 'wnetrza' }), project({ title: 'Stary' }))
  const titles = (type?: string) => filterProjects(r, { architect: '', status: '', q: '', type }).map((x) => x.project.title)
  assert.deepEqual(titles('wnetrza'), ['Mieszkanie'])
  assert.deepEqual(titles('inny'), ['Stary'])
  assert.equal(titles('').length, 3)
  assert.equal(titles(undefined).length, 3)
})

// Sort by column

const sorted = (ps: Project[], o: string | null) => sortProjects(rows(...ps), parseSort(o)).map((r) => r.project.title)
const abc = [project({ title: 'Willa Łąkowa' }), project({ title: 'Dom Lipowa' }), project({ title: 'Kamienica Oliwa' })]

test('projects: Sort by title', () => {
  assert.deepEqual(sorted(abc, 'tytul'), ['Dom Lipowa', 'Kamienica Oliwa', 'Willa Łąkowa'])
  // Polish order: Ł after L
  assert.deepEqual(sorted([project({ title: 'Łąka' }), project({ title: 'Lipa' }), project({ title: 'Mak' })], 'tytul'), ['Lipa', 'Łąka', 'Mak'])
})

test('projects: Reverse', () => {
  assert.deepEqual(sorted(abc, '-tytul'), ['Willa Łąkowa', 'Kamienica Oliwa', 'Dom Lipowa'])
})

test('projects: Running number', () => {
  assert.deepEqual(sorted([project({ title: 'A', lp: 10 }), project({ title: 'B', lp: 2 }), project({ title: 'C' })], 'lp'), ['B', 'A', 'C'])
})

test('projects: Empty values last', () => {
  const ps = [project({ title: 'Bez', location: { city: '', address: '' } }), project({ title: 'G', location: { city: 'Gdańsk', address: '' } }), project({ title: 'S', location: { city: 'Sopot', address: '' } })]
  assert.deepEqual(sorted(ps, 'miejscowosc'), ['G', 'S', 'Bez'])
  assert.deepEqual(sorted(ps, '-miejscowosc'), ['S', 'G', 'Bez'])
})

test('projects: Status order', () => {
  const ps = [project({ title: 'Z', status: 'zakończony' }), project({ title: 'A', status: 'aktywny' }), project({ title: 'W', status: 'wstrzymany' })]
  assert.deepEqual(sorted(ps, 'status'), ['A', 'W', 'Z'])
  assert.deepEqual(sorted(ps, '-status'), ['Z', 'W', 'A'])
})

test('projects: Type order', () => {
  const ps = [project({ title: 'I' }), project({ title: 'W', type: 'wnetrza' }), project({ title: 'B', type: 'budowlany' })]
  assert.deepEqual(sorted(ps, 'typ'), ['B', 'W', 'I'])
})

test('projects: Ties', () => {
  const ps = [
    project({ title: 'Później', leadArchitect: 'Anna Nowak', milestones: { pozwolenie: '2027-05-01' } }),
    project({ title: 'Jan', leadArchitect: 'Jan Kowalski' }),
    project({ title: 'Wcześniej', leadArchitect: 'Anna Nowak', milestones: { pozwolenie: '2027-01-01' } }),
  ]
  assert.deepEqual(sorted(ps, 'architekt'), ['Wcześniej', 'Później', 'Jan'])
})

test('projects: Next milestone reversed', () => {
  const ps = [project({ title: 'Brak' }), project({ title: 'Wcześnie', milestones: { pozwolenie: '2027-01-01' } }), project({ title: 'Późno', milestones: { pozwolenie: '2027-05' } })]
  assert.deepEqual(sorted(ps, null), ['Wcześnie', 'Późno', 'Brak'])
  assert.deepEqual(sorted(ps, '-termin'), ['Późno', 'Wcześnie', 'Brak'])
})

test('projects: Unknown sort in the URL', () => {
  assert.deepEqual(parseSort('x'), DEFAULT_SORT)
  assert.deepEqual(parseSort('-'), DEFAULT_SORT)
  assert.deepEqual(parseSort(null), DEFAULT_SORT)
  assert.equal(sortParam(DEFAULT_SORT), '')
  assert.equal(sortParam(parseSort('-miejscowosc')), '-miejscowosc')
  assert.equal(sortParam({ key: 'termin', desc: true }), '-termin')
})

test('projects: New project gets the next number', () => {
  assert.equal(nextLp([project({ lp: 41 }), project({ lp: 7 }), project({})]), 42)
  assert.equal(nextLp([]), 1)
})

test('projects: Value not on the list', () => {
  const ps = [project({ leadArchitect: 'Piotr Zieliński' }), project({ leadArchitect: 'Anna Nowak' }), project({})]
  assert.deepEqual(architectOptions(['Anna Nowak', 'Jan Kowalski'], ps.map((p) => p.leadArchitect)), ['Anna Nowak', 'Jan Kowalski', 'Piotr Zieliński'])
})
