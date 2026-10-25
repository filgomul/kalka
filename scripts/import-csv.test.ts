import { test } from 'node:test'
import assert from 'node:assert/strict'
import { importCsv, parseCsv } from './import-csv.ts'

// Made-up rows in the shape of the studio's export: BOM, CRLF, quoted multi-line cells.
const HEADER =
  'l.p.,lokalizcja,tytuł roboczy projektu,data rozpoczącia,data wydania koncepcji,data wydanie PB do urzędu,' +
  'data uzupełnienia do urzędu,data uzyskania pozwolenia,szacowany termin wykonania projektów branżowych ,' +
  'arch. prowadzący,Zakres dla branżystów ->,branża konstrukcyjna,branża sanitarna,branża elektryczn,' +
  'branża drogowa ,Rezczoznawca Ppoż,rzeczoznawca BHP i SANEPID'

const csv = (...rows: string[]) => '﻿' + [HEADER, ...rows].join('\r\n') + '\r\n'

test('projects: Import a row', () => {
  const { projects, problems } = importCsv(
    csv('7,"Gdańsk,\r\nul. Przykładowa 1",Dom testowy,-,,12/06/2026,,,11.2026,mgr inż. arch. Anna Nowak,,"*stropy\r\n*fundamenty",brak,brak,brak,tak,brak'),
    '2026-10-25T10:00:00.000Z',
  )
  assert.deepEqual(problems, [])
  assert.equal(projects.length, 1)
  const p = projects[0]
  assert.equal(p.lp, 7)
  assert.equal(p.title, 'Dom testowy')
  assert.deepEqual(p.location, { city: 'Gdańsk', address: 'ul. Przykładowa 1' })
  assert.deepEqual(p.milestones, { pbDoUrzedu: '2026-06-12', branzysci: '2026-11' })
  assert.equal(p.branches.konstrukcja, '*stropy\n*fundamenty')
  assert.equal(p.branches.sanitarna, '')
  assert.equal(p.branches.ppoz, 'tak')
  assert.equal(p.status, 'aktywny')
  assert.equal(p.updatedAt, '2026-10-25T10:00:00.000Z')
})

test('projects: Empty and dash cells', () => {
  const [p] = importCsv(csv('1,Sopot,Biuro,-,,-,,,,,,,,,,,')).projects
  assert.deepEqual(p.milestones, {})
  assert.deepEqual(p.location, { city: 'Sopot', address: '' })
})

test('projects: Numbered empty rows', () => {
  const { projects } = importCsv(csv('1,Sopot,Biuro,,,,,,,,,,,,,,', '2,,,,,,,,,,,,,,,,', '3,,,,,,,,,,,,,,,,'))
  assert.deepEqual(projects.map((p) => p.title), ['Biuro'])
})

test('projects: Architect with an academic title', () => {
  const [p] = importCsv(csv('1,Sopot,Biuro,,,,,,,mgr inż. arch. Anna Nowak,,,,,,,')).projects
  assert.equal(p.leadArchitect, 'Anna Nowak')
})

test('projects: MINIMUM prefix', () => {
  const [p] = importCsv(csv('1,Sopot,Biuro,,,,,,,,,,"MINIMUM - inwentaryzacja instalacji",,,,')).projects
  assert.equal(p.branches.sanitarna, 'MINIMUM - inwentaryzacja instalacji')
})

test('projects: CSV import reports unknown dates and keeps the row', () => {
  const { projects, problems } = importCsv(csv('4,Sopot,Biuro,,wiosna,,,,,,,,,,,,'))
  assert.equal(projects.length, 1)
  assert.deepEqual(problems, ['l.p. 4, koncepcja: nieznany format daty "wiosna"'])
})

test('projects: CSV quoting', () => {
  assert.deepEqual(parseCsv('a,"b ""c"", d"\r\ne,f'), [['a', 'b "c", d'], ['e', 'f']])
})
