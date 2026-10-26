import { test } from 'node:test'
import assert from 'node:assert/strict'
import { milestoneLabels } from './pl.ts'
import {
  architectOptions,
  emptyProject,
  filterProjects,
  formatDate,
  isConfirmed,
  isDone,
  MILESTONES,
  nextLp,
  nextMilestone,
  normalize,
  prepareForSave,
  sortProjects,
  type Project,
} from './model.ts'

function project(fields: Partial<Project>): Project {
  return { ...emptyProject(), ...fields }
}
const rows = (...ps: Project[]) => ps.map((project) => ({ project }))

test('projects: Mixed precision', () => {
  const p = project({ milestones: { pbDoUrzedu: '2026-10-30', branzysci: '2026-10' } })
  assert.deepEqual(nextMilestone(p), { key: 'pbDoUrzedu', value: '2026-10-30', due: '2026-10-30' })
})

test('projects: Overdue', () => {
  const late = project({ title: 'B', milestones: { pbDoUrzedu: '2026-10-10', pozwolenie: '2026-12-01' } })
  const soon = project({ title: 'A', milestones: { koncepcja: '2026-10-25' } })
  const next = nextMilestone(late)
  assert.deepEqual(next, { key: 'pbDoUrzedu', value: '2026-10-10', due: '2026-10-10' })
  assert.ok(next!.due < '2026-10-25')
  assert.deepEqual(sortProjects(rows(soon, late)).map((r) => r.project.title), ['B', 'A'])
})

test('projects: Done milestone skipped', () => {
  const p = project({ milestones: { pbDoUrzedu: '2026-10-10', pozwolenie: '2026-12-01' }, done: ['pbDoUrzedu'] })
  assert.equal(nextMilestone(p)?.key, 'pozwolenie')
})

test('projects: All in the past', () => {
  const past = project({ title: 'B', milestones: { koncepcja: '2026-01-10', pozwolenie: '2026-09' }, done: ['koncepcja', 'pozwolenie'] })
  const none = project({ title: 'C' })
  const soon = project({ title: 'A', milestones: { koncepcja: '2026-11-02' } })
  assert.equal(nextMilestone(past), null)
  assert.equal(nextMilestone(none), null)
  assert.deepEqual(sortProjects(rows(past, none, soon)).map((r) => r.project.title), ['A', 'B', 'C'])
})

test('projects: File without done marks', () => {
  const p = normalize({ id: 'x', title: 'Dom', milestones: { koncepcja: '2026-01-10' } })
  assert.deepEqual(p.done, [])
  assert.equal(isDone(p, 'koncepcja'), false)
  assert.equal(nextMilestone(p)?.key, 'koncepcja')
  // a hand-edited file with junk in done
  assert.deepEqual(normalize({ id: 'x', done: 'koncepcja' as never }).done, [])
  assert.deepEqual(normalize({ id: 'x', done: ['pozwolenie', 'nic' as never, 'koncepcja'] }).done, ['koncepcja', 'pozwolenie'])
})

test('projects: Done without a date', () => {
  const saved = prepareForSave(project({ title: 'Dom', done: ['koncepcja'] }))
  assert.deepEqual(saved.done, ['koncepcja'])
  assert.equal('koncepcja' in saved.milestones, false)
})

test('projects: Untick', () => {
  const saved = prepareForSave(project({ title: 'Dom', done: [] }))
  assert.equal('done' in saved, false)
})

test('projects: Month only', () => {
  assert.equal(formatDate('2026-11'), '11.2026')
  assert.equal(formatDate('2026-10-30'), '30.10.2026')
  assert.equal(formatDate(undefined), '')
})

test('projects: Clear a milestone', () => {
  const saved = prepareForSave(project({ title: ' Dom ', milestones: { koncepcja: '', pozwolenie: '2026-12' } }))
  assert.deepEqual(saved.milestones, { pozwolenie: '2026-12' })
  assert.equal(saved.title, 'Dom')
  assert.equal('koncepcja' in saved.milestones, false)
})

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

test('projects: New project gets the next number', () => {
  assert.equal(nextLp([project({ lp: 41 }), project({ lp: 7 }), project({})]), 42)
  assert.equal(nextLp([]), 1)
})

test('projects: Value not on the list', () => {
  const ps = [project({ leadArchitect: 'Piotr Zieliński' }), project({ leadArchitect: 'Anna Nowak' }), project({})]
  assert.deepEqual(architectOptions(['Anna Nowak', 'Jan Kowalski'], ps), ['Anna Nowak', 'Jan Kowalski', 'Piotr Zieliński'])
})

test('projects: Form order', () => {
  assert.deepEqual(MILESTONES.map((k) => milestoneLabels[k]), [
    'data rozpoczęcia',
    'wydanie koncepcji',
    'akceptacja koncepcji',
    'PB do urzędu',
    'uzupełnienie do urzędu',
    'uzyskanie pozwolenia',
    'termin branżystów',
  ])
})

test('projects: Save a date', () => {
  const saved = prepareForSave(project({ title: 'Dom', milestones: { akceptacja: '2026-11-14' } }))
  assert.deepEqual(saved.milestones, { akceptacja: '2026-11-14' })
})

test('projects: Next milestone', () => {
  const p = project({ milestones: { koncepcja: '2026-10-05', akceptacja: '2026-11-14', pbDoUrzedu: '2026-12-01' }, done: ['koncepcja'] })
  assert.deepEqual(nextMilestone(p), { key: 'akceptacja', value: '2026-11-14', due: '2026-11-14' })
})

test('projects: Older file', () => {
  const p = normalize({ id: 'x', title: 'Dom', milestones: { koncepcja: '2026-01-10' } })
  assert.equal(p.milestones.akceptacja, undefined)
  assert.equal(isDone(p, 'akceptacja'), false)
  assert.ok(!('akceptacja' in prepareForSave(p).milestones))
})

test('projects: New project', () => {
  const p = emptyProject()
  assert.equal(p.confirmed, undefined)
  assert.ok(MILESTONES.every((k) => !isConfirmed(p, k)))
})

test('projects: Confirm and save', () => {
  const saved = prepareForSave(project({ title: 'Dom', milestones: { pozwolenie: '2027-03' }, confirmed: ['pozwolenie'] }))
  assert.deepEqual(saved.confirmed, ['pozwolenie'])
  const reopened = normalize(JSON.parse(JSON.stringify(saved)))
  assert.equal(isConfirmed(reopened, 'pozwolenie'), true)
})

test('projects: Back to planned', () => {
  const saved = prepareForSave(project({ title: 'Dom', milestones: { pozwolenie: '2027-03' }, confirmed: [] }))
  assert.equal('confirmed' in saved, false)
})

test('projects: File without confirmed marks', () => {
  const p = normalize({ id: 'x', title: 'Dom', milestones: { koncepcja: '2026-01-10' }, done: ['koncepcja'] })
  assert.deepEqual(p.confirmed, [])
  assert.ok(MILESTONES.every((k) => !isConfirmed(p, k)))
  // a hand-edited file with junk in confirmed
  assert.deepEqual(normalize({ id: 'x', confirmed: 'koncepcja' as never }).confirmed, [])
  assert.deepEqual(normalize({ id: 'x', confirmed: ['pozwolenie', 'nic' as never, 'koncepcja'] }).confirmed, ['koncepcja', 'pozwolenie'])
})

test('projects: Confirmed without a date', () => {
  const saved = prepareForSave(project({ title: 'Dom', confirmed: ['koncepcja'] }))
  assert.deepEqual(saved.confirmed, ['koncepcja'])
  assert.equal('koncepcja' in saved.milestones, false)
})

test('projects: Date changed', () => {
  const p = project({ title: 'Dom', milestones: { pozwolenie: '2027-03' }, confirmed: ['pozwolenie'] })
  const saved = prepareForSave({ ...p, milestones: { pozwolenie: '2027-03-18' } })
  assert.equal(saved.milestones.pozwolenie, '2027-03-18')
  assert.equal(isConfirmed(saved, 'pozwolenie'), true)
})

test('projects: Independent of done', () => {
  const done = prepareForSave(project({ title: 'Dom', milestones: { koncepcja: '2026-10-05' }, done: ['koncepcja'] }))
  assert.equal(isDone(done, 'koncepcja'), true)
  assert.equal(isConfirmed(done, 'koncepcja'), false)
  const unticked = prepareForSave({ ...done, done: [] })
  assert.equal(isDone(unticked, 'koncepcja'), false)
  assert.equal(isConfirmed(unticked, 'koncepcja'), false)
})

test('projects: Planned next milestone', () => {
  const p = project({ title: 'Dom Lipowa', milestones: { pozwolenie: '2027-03' } })
  const next = nextMilestone(p)!
  assert.equal(next.key, 'pozwolenie')
  assert.equal(formatDate(next.value), '03.2027')
  assert.equal(isConfirmed(p, next.key), false)
})

test('projects: Confirmed next milestone', () => {
  const p = project({ milestones: { pozwolenie: '2027-03' }, confirmed: ['pozwolenie'] })
  assert.equal(nextMilestone(p)?.key, 'pozwolenie')
  assert.equal(isConfirmed(p, 'pozwolenie'), true)
})

test('projects: Planned and overdue', () => {
  const p = project({ milestones: { pbDoUrzedu: '2026-10-10', pozwolenie: '2026-12-01' }, confirmed: ['pozwolenie'] })
  const next = nextMilestone(p)!
  assert.equal(next.key, 'pbDoUrzedu')
  assert.ok(next.due < '2026-10-25')
  assert.equal(isConfirmed(p, next.key), false)
})
