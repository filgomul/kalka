import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  architectOptions,
  emptyProject,
  filterProjects,
  formatDate,
  nextLp,
  nextMilestone,
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
  assert.deepEqual(nextMilestone(p, '2026-10-25'), { key: 'pbDoUrzedu', value: '2026-10-30', due: '2026-10-30' })
  assert.equal(nextMilestone(p, '2026-10-31')?.due, '2026-10-31')
})

test('projects: All in the past', () => {
  const past = project({ title: 'B', milestones: { koncepcja: '2026-01-10', pozwolenie: '2026-09' } })
  const soon = project({ title: 'A', milestones: { koncepcja: '2026-11-02' } })
  assert.equal(nextMilestone(past, '2026-10-25'), null)
  assert.deepEqual(
    sortProjects(rows(past, soon), '2026-10-25').map((r) => r.project.title),
    ['A', 'B'],
  )
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
