// One-off: turns the CSV export of the studio's old sheet into Kalka project files.
// Usage: node scripts/import-csv.ts <csv> <dataFolder>   (writes <dataFolder>/projekty/<id>.json)
// The CSV holds personal data: keep it and the output outside the repo.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BRANCHES, emptyProject, MILESTONES, type Project } from '../src/model.ts'

/** RFC 4180: quoted cells may hold commas, quotes ("") and line breaks. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  text = text.replace(/^﻿/, '').replace(/\r\n/g, '\n')
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c !== '"') cell += c
      else if (text[i + 1] === '"') cell += text[i++]
      else quoted = false
    } else if (c === '"') {
      quoted = true
    } else if (c === ',' || c === '\n') {
      row.push(cell)
      cell = ''
      if (c === '\n') {
        rows.push(row)
        row = []
      }
    } else {
      cell += c
    }
  }
  if (cell || row.length) rows.push([...row, cell])
  return rows
}

// Sheet headers carry typos and stray spaces, so columns are found by a distinctive fragment.
const COLUMNS = {
  lp: 'l.p.',
  location: 'lokaliz',
  title: 'tytuł',
  rozpoczecie: 'rozpocz',
  koncepcja: 'koncepcji',
  pbDoUrzedu: 'pb do urzędu',
  uzupelnienie: 'uzupełnienia',
  pozwolenie: 'pozwolenia',
  branzysci: 'branżowych',
  leadArchitect: 'prowadzący',
  konstrukcja: 'konstrukcyjna',
  sanitarna: 'sanitarna',
  elektryczna: 'elektryczn',
  drogowa: 'drogowa',
  ppoz: 'ppoż',
  bhpSanepid: 'bhp',
} as const

/** `12/06/2026` or `12.06.2026` to `2026-06-12`, `11.2026` to `2026-11`; empty and `-` to undefined. */
export function sheetDate(cell: string): string | undefined {
  const v = cell.trim()
  if (!v || v === '-') return undefined
  const pad = (s: string) => s.padStart(2, '0')
  let m = /^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/.exec(v)
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`
  m = /^(\d{1,2})\.(\d{4})$/.exec(v)
  if (m) return `${m[2]}-${pad(m[1])}`
  throw new Error(`nieznany format daty "${v}"`)
}

/** "Gdańsk,\nul. Przykładowa 1": city before the first comma or line break, address after it. */
export function splitLocation(cell: string): Project['location'] {
  const v = cell.trim()
  const at = v.search(/[,\n]/)
  if (at < 0) return { city: v, address: '' }
  return { city: v.slice(0, at).trim(), address: v.slice(at + 1).replace(/\s+/g, ' ').trim() }
}

const scope = (cell: string) => (/^(brak|-)?$/i.test(cell.trim()) ? '' : cell.trim())
/** Drops a leading academic title ("mgr inż. arch.") so names match kalka.json. */
const architect = (cell: string) => cell.trim().replace(/^(\p{Ll}\S*\s+)+/u, '')

/** Returns projects and problems ("l.p. 7: ...") for rows that were imported with a gap. */
export function importCsv(text: string, now = new Date().toISOString()): { projects: Project[]; problems: string[] } {
  const [header, ...rows] = parseCsv(text)
  const col = {} as Record<keyof typeof COLUMNS, number>
  for (const [key, fragment] of Object.entries(COLUMNS) as [keyof typeof COLUMNS, string][]) {
    const i = header.findIndex((h) => h.trim().toLowerCase().includes(fragment))
    if (i < 0) throw new Error(`Brak kolumny zawierającej "${fragment}"`)
    col[key] = i
  }
  const projects: Project[] = []
  const problems: string[] = []
  for (const row of rows) {
    const cell = (key: keyof typeof COLUMNS) => row[col[key]] ?? ''
    const title = cell('title').trim()
    if (!title) continue
    const lp = Number.parseInt(cell('lp'), 10)
    const p: Project = {
      ...emptyProject(),
      title,
      location: splitLocation(cell('location')),
      leadArchitect: architect(cell('leadArchitect')),
      updatedAt: now,
    }
    if (Number.isInteger(lp)) p.lp = lp
    for (const key of MILESTONES) {
      try {
        const date = sheetDate(cell(key))
        if (date) p.milestones[key] = date
      } catch (e) {
        problems.push(`l.p. ${cell('lp') || '?'}, ${key}: ${(e as Error).message}`)
      }
    }
    for (const key of BRANCHES) p.branches[key] = scope(cell(key))
    projects.push(p)
  }
  return { projects, problems }
}

if (import.meta.main) {
  const [csv, dataFolder] = process.argv.slice(2)
  if (!csv || !dataFolder) {
    console.error('Użycie: node scripts/import-csv.ts <plik.csv> <folder Kalka>')
    process.exit(1)
  }
  const out = join(dataFolder, 'projekty')
  mkdirSync(out, { recursive: true })
  // a second run would duplicate every project under new ids
  if (readdirSync(out).some((f) => f.endsWith('.json'))) {
    console.error(`${out} zawiera już projekty; import przerwany.`)
    process.exit(1)
  }
  const { projects, problems } = importCsv(readFileSync(csv, 'utf8'))
  for (const p of projects) writeFileSync(join(out, `${p.id}.json`), JSON.stringify(p, null, 2) + '\n')
  console.log(`Zapisano ${projects.length} projektów w ${out}`)
  for (const msg of problems) console.warn(`Uwaga: ${msg}`)
}
