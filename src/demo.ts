// The demo version (?demo): an in-memory stand-in for the data folder, filled with made-up data
// dated from today. Nothing is kept; the storage tests use the same stand-in. No DOM here.
// Every name, place, phone and e-mail below is made up: the repo is public.

import { addDays, addMonths } from './calendar.ts'
import { emptyProject, type Milestone, type Project } from './model.ts'
import type { Task } from './tasks.ts'
import type { Leave } from './leaves.ts'
import type { Meeting } from './meetings.ts'
import { t } from './pl.ts'

/** A folder as nested Maps: a file is its text, a subfolder another Map. */
export type Tree = Map<string, string | Tree>

function notFound() {
  return Object.assign(new Error('not found'), { name: 'NotFoundError' })
}

function fileHandle(tree: Tree, name: string) {
  return {
    kind: 'file' as const,
    name,
    getFile: async () => new File([tree.get(name) as string], name),
    createWritable: async () => {
      let text = ''
      return { write: async (s: string) => void (text += s), close: async () => void tree.set(name, text) }
    },
  }
}

/** Covers the handle methods storage.ts calls, and nothing more. */
export function memoryFolder(tree: Tree, name = ''): FileSystemDirectoryHandle {
  const dir = {
    kind: 'directory' as const,
    name,
    async getDirectoryHandle(child: string, opts?: { create?: boolean }) {
      if (!tree.has(child)) {
        if (!opts?.create) throw notFound()
        tree.set(child, new Map())
      }
      return memoryFolder(tree.get(child) as Tree, child)
    },
    async getFileHandle(child: string, opts?: { create?: boolean }) {
      if (!tree.has(child)) {
        if (!opts?.create) throw notFound()
        tree.set(child, '')
      }
      return fileHandle(tree, child)
    },
    async removeEntry(child: string) {
      if (!tree.has(child)) throw notFound()
      tree.delete(child)
    },
    async *entries() {
      for (const [child, v] of tree) yield [child, typeof v === 'string' ? fileHandle(tree, child) : memoryFolder(v, child)]
    },
  }
  return dir as unknown as FileSystemDirectoryHandle
}

// Demo data. Dates are offsets from `today` (days or months), from -365 to +730 days, so the demo
// looks the same on any day. Fixed ids and no randomness: the same day gives the same files.

const EWA = 'Ewa Kowal'
const JAN = 'Jan Wiśniak'
const MARTA = 'Marta Lis'
const PIOTR = 'Piotr Zając'

/** Every file of the demo folder, as the app would write it. */
export function demoFiles(today: string) {
  const d = (n: number) => addDays(today, n)
  const mo = (n: number) => addMonths(today.slice(0, 7), n)
  const updatedAt = `${today}T08:00:00.000Z`
  const at = (n: number, time: string) => `${d(n)}T${time}:00.000Z`

  // a milestone; flags: d = done, c = confirmed
  let added = 0
  const m = (style: string, date?: string, flags = '', title?: string): Milestone => ({
    id: title ? `demo-m${++added}` : style,
    style,
    ...(title ? { title } : {}),
    ...(date ? { date } : {}),
    ...(flags.includes('d') ? { done: true } : {}),
    ...(flags.includes('c') ? { confirmed: true } : {}),
  })
  const project = (n: number, p: Partial<Project>): Project => ({ ...emptyProject(), ...p, id: `demo-p${n}`, updatedAt })
  const branches = (b: Partial<Project['branches']>) => ({ ...emptyProject().branches, ...b })

  const projects: Project[] = [
    project(1, {
      lp: 1,
      title: 'Dom jednorodzinny Sosnowa',
      type: 'budowlany',
      location: { city: 'Zielonka Mała', address: 'ul. Sosnowa 7' },
      leadArchitect: EWA,
      status: 'aktywny',
      timeline: [
        m('rozpoczecie', d(-200), 'dc'),
        m('koncepcja', d(-150), 'dc'),
        m('akceptacja', d(-120), 'dc'),
        m('pbDoUrzedu', d(-30), 'dc'),
        m('uzupelnienie', d(-5), 'c'),
        m('pozwolenie', mo(2)),
        m('branzysci', mo(4)),
        m('wydanieProjektu', mo(6)),
      ],
      branches: branches({ konstrukcja: 'fundamenty, stropy, więźba dachowa', sanitarna: 'woda, kanalizacja, c.o. z pompą ciepła', elektryczna: 'instalacja wewnętrzna, fotowoltaika' }),
      notes: 'Działka narożna, wjazd od ul. Brzozowej.',
      investor: 'Anna i Tomasz Przykładowi',
      investorPhone: '600 000 101',
      investorEmail: 'sosnowa@example.com',
      plot: '000001_1.0001.123/4',
      officeContact: 'Starostwo, wydział architektury, pokój 12 - referentka prowadząca sprawę',
    }),
    project(2, {
      lp: 2,
      title: 'Kamienica Ogrodowa - przebudowa',
      type: 'budowlany',
      location: { city: 'Miasteczko Dolne', address: 'ul. Ogrodowa 14' },
      leadArchitect: JAN,
      status: 'aktywny',
      timeline: [
        m('rozpoczecie', d(-300), 'dc'),
        m('koncepcja', d(-240), 'dc'),
        m('akceptacja', d(-210), 'dc'),
        m('pbDoUrzedu', d(-90), 'dc'),
        m('uzupelnienie', d(-40), 'dc'),
        m('pozwolenie', d(3), 'c'),
        m('inny', d(10), 'c', 'uzgodnienie z konserwatorem'),
        m('branzysci', d(45)),
        m('wydanieProjektu', mo(3)),
      ],
      branches: branches({ konstrukcja: 'wzmocnienie stropów', sanitarna: 'nowe piony', elektryczna: 'cała instalacja', ppoz: 'tak, budynek wielorodzinny', bhpSanepid: 'lokal usługowy na parterze' }),
      investor: 'Wspólnota Mieszkaniowa Ogrodowa 14',
      investorPhone: '600 000 102',
      investorEmail: 'ogrodowa14@example.com',
      officeContact: 'Konserwator zabytków - wymagane uzgodnienie elewacji',
    }),
    project(3, {
      lp: 3,
      title: 'Hala magazynowa Polna',
      type: 'budowlany',
      location: { city: 'Brzezinki', address: 'ul. Polna 2' },
      leadArchitect: MARTA,
      status: 'wstrzymany',
      timeline: [
        m('rozpoczecie', d(-330), 'dc'),
        m('koncepcja', d(-280), 'dc'),
        m('akceptacja', d(-260), 'd'),
        m('pbDoUrzedu', mo(5)),
        m('uzupelnienie'),
        m('pozwolenie'),
        m('branzysci'),
        m('wydanieProjektu'),
      ],
      notes: 'Wstrzymane do decyzji inwestora o finansowaniu.',
    }),
    project(4, {
      lp: 4,
      title: 'Osiedle Lipowe - budynek B',
      type: 'budowlany',
      location: { city: 'Lipno Wielkie', address: 'ul. Lipowa 21-25' },
      leadArchitect: EWA,
      status: 'aktywny',
      timeline: [
        m('rozpoczecie', d(-20), 'dc'),
        m('koncepcja', d(14), 'c'),
        m('akceptacja', d(40)),
        m('pbDoUrzedu', mo(8)),
        m('uzupelnienie', mo(12)),
        m('pozwolenie', mo(15)),
        m('branzysci', mo(18)),
        m('wydanieProjektu', mo(22)),
      ],
      branches: branches({ konstrukcja: 'garaż podziemny', drogowa: 'zjazd z drogi gminnej', ppoz: 'tak' }),
    }),
    project(5, {
      lp: 5,
      title: 'Wnętrza apartamentu Słoneczna',
      type: 'wnetrza',
      location: { city: 'Zielonka Mała', address: 'ul. Słoneczna 3/12' },
      leadArchitect: MARTA,
      status: 'aktywny',
      timeline: [
        m('rozpoczecie', d(-60), 'dc'),
        m('uklady', d(-30), 'dc'),
        m('akceptacjaUkladow', d(-14), 'dc'),
        m('wizualizacje', d(0), 'c'),
        m('akceptacjaWizualizacji', d(12)),
        m('wydanieProjektu', mo(2)),
        m('nadzor', d(75)),
        m('nadzor', mo(5), '', 'nadzór - odbiór końcowy'),
      ],
      investor: 'Karolina Przykładowa',
      investorPhone: '600 000 105',
      investorEmail: 'sloneczna@example.com',
    }),
    project(6, {
      lp: 6,
      title: 'Wnętrza kawiarni Pod Lipą',
      type: 'wnetrza',
      location: { city: 'Miasteczko Dolne', address: 'Rynek 4' },
      leadArchitect: PIOTR,
      status: 'zakończony',
      timeline: [
        m('rozpoczecie', d(-360), 'dc'),
        m('uklady', d(-320), 'dc'),
        m('akceptacjaUkladow', d(-300), 'dc'),
        m('wizualizacje', d(-260), 'dc'),
        m('akceptacjaWizualizacji', d(-240), 'dc'),
        m('wydanieProjektu', d(-150), 'dc'),
        m('nadzor', d(-100), 'dc'),
      ],
    }),
    project(7, {
      lp: 7,
      title: 'Ekspertyza stropów - szkoła',
      type: 'inny',
      location: { city: 'Brzezinki', address: 'ul. Szkolna 1' },
      leadArchitect: JAN,
      status: 'aktywny',
      timeline: [
        m('rozpoczecie', d(-10), 'dc'),
        m('inny', d(1), 'c', 'oględziny na miejscu'),
        m('inny', d(21), '', 'oddanie ekspertyzy'),
        m('inny', undefined, '', 'prezentacja dla rady rodziców'),
      ],
      branches: branches({ konstrukcja: 'ocena nośności stropów' }),
    }),
    project(8, {
      title: 'Altana ogrodowa',
      type: 'inny',
      location: { city: 'Lipno Wielkie', address: 'ul. Ogrodowa 40' },
      leadArchitect: PIOTR,
      status: 'wstrzymany',
      notes: 'Bez terminów - czeka na zgodę sąsiada.',
    }),
  ]

  let taskNo = 0
  const task = (projectId: string, title: string, assignee: string, status: Task['status'], extra: Partial<Task> = {}): Task => ({
    id: `demo-t${++taskNo}`,
    projectId,
    title,
    description: '',
    assignee,
    status,
    ...extra,
    updatedAt,
  })
  const tasks: Task[] = [
    task('demo-p1', 'Odpowiedź na wezwanie do uzupełnienia', EWA, 'todo', { due: d(-2), urgent: true, description: 'Starostwo prosi o poprawione zestawienie powierzchni.' }),
    task('demo-p1', 'Zebrać uzgodnienia branżowe', EWA, 'todo', { due: d(6) }),
    task('demo-p2', 'Rysunki elewacji do konserwatora', JAN, 'doing', { due: d(0), urgent: true }),
    task('demo-p2', 'Zestawienie stolarki okiennej', MARTA, 'todo', { due: d(3) }),
    task('demo-p4', 'Koncepcja - warianty układu mieszkań', EWA, 'doing', { due: d(12) }),
    task('demo-p4', 'Analiza planu miejscowego', JAN, 'todo', { due: mo(1) }),
    task('demo-p5', 'Dobór płytek do łazienki', MARTA, 'todo', { due: d(1) }),
    task('demo-p5', 'Wizualizacje salonu', MARTA, 'doing', { due: d(0) }),
    task('demo-p7', 'Umówić oględziny z dyrekcją', '', 'todo', { due: d(1) }),
    task('', 'Zamówić tusz do plotera', PIOTR, 'todo'),
    task('', 'Przegląd kopii zapasowych', '', 'todo', { due: d(20) }),
    task('demo-p3', 'Ustalić z inwestorem termin wznowienia', MARTA, 'todo'),
    task('', 'Szkolenie BHP', JAN, 'doing', { due: d(-1) }),
    task('demo-p1', 'Złożyć PB w starostwie', EWA, 'done', { due: d(-30), doneAt: at(-30, '12:00') }),
    task('demo-p2', 'Inwentaryzacja budynku', JAN, 'done', { doneAt: at(-25, '10:00') }),
    task('demo-p5', 'Układy funkcjonalne - wersja 2', MARTA, 'done', { doneAt: at(-20, '16:30') }),
    task('demo-p4', 'Mapa do celów projektowych', EWA, 'done', { doneAt: at(-7, '09:15') }),
    task('', 'Odnowić licencję programu CAD', PIOTR, 'done', { doneAt: at(-3, '11:00') }),
    task('demo-p7', 'Zebrać archiwalną dokumentację', JAN, 'done', { doneAt: at(-2, '14:45') }),
    task('demo-p6', 'Protokół z odbioru', PIOTR, 'done', { doneAt: at(-100, '13:00') }),
  ]

  let leaveNo = 0
  const leave = (architect: string, from: number, to: number): Leave => ({ id: `demo-u${++leaveNo}`, architect, from: d(from), to: d(to), updatedAt })
  const leaves: Leave[] = [leave(MARTA, -60, -50), leave(JAN, -2, 4), leave(EWA, 3, 9), leave(MARTA, 20, 20), leave(PIOTR, 30, 44), leave(EWA, 180, 190)]

  let meetingNo = 0
  const meeting = (title: string, day: number, architect: string, type: Meeting['type'], extra: Partial<Meeting> = {}): Meeting => ({
    id: `demo-s${++meetingNo}`,
    title,
    date: d(day),
    architect,
    type,
    note: '',
    ...extra,
    updatedAt,
  })
  const meetings: Meeting[] = [
    meeting('Omówienie uzupełnień z inwestorem', 0, EWA, 'online', { projectId: 'demo-p1', start: '14:00', end: '15:00' }),
    meeting('Oględziny stropów', 1, JAN, 'stacjonarne', { projectId: 'demo-p7', start: '08:30', end: '10:00' }),
    meeting('Spotkanie z konserwatorem', 2, JAN, 'stacjonarne', { projectId: 'demo-p2', start: '10:00', end: '11:30', note: 'Zabrać rysunki elewacji.' }),
    meeting('Zebranie pracowni', 7, '', 'stacjonarne', { start: '09:00' }),
    meeting('Prezentacja wizualizacji', 12, MARTA, 'online', { projectId: 'demo-p5' }),
    meeting('Wizja lokalna na działce', 40, EWA, 'stacjonarne', { projectId: 'demo-p4' }),
    meeting('Webinar o warunkach technicznych', -14, JAN, 'online', { start: '11:00', end: '12:00' }),
    meeting('Odbiór końcowy kawiarni', -110, PIOTR, 'stacjonarne', { projectId: 'demo-p6', start: '12:00', end: '13:00' }),
  ]

  const settings = {
    schema: 1,
    architects: [
      { name: EWA, initials: 'EK', color: '#b5523b' },
      { name: JAN, initials: 'JW', color: '#3b6fb5' },
      { name: MARTA, initials: 'ML', color: '#4f8a3c' },
      PIOTR,
    ],
  }
  return { settings, projects, tasks, leaves, meetings }
}

/** The demo folder for `today`: a fresh in-memory copy each call. */
export function demoFolder(today: string): FileSystemDirectoryHandle {
  const f = demoFiles(today)
  const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n'
  const folder = (items: { id: string }[]): Tree => new Map(items.map((v) => [`${v.id}.json`, json(v)]))
  const tree: Tree = new Map<string, string | Tree>([
    ['kalka.json', json(f.settings)],
    ['projekty', folder(f.projects)],
    ['zadania', folder(f.tasks)],
    ['urlopy', folder(f.leaves)],
    ['spotkania', folder(f.meetings)],
  ])
  return memoryFolder(tree, t.demoName)
}
