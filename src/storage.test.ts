import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyProject, withTimeline } from './model.ts'
import { emptyTask } from './tasks.ts'
import { emptyLeave } from './leaves.ts'
import { ConflictError, deleteLeave, deleteTask, openFolder, readLeaves, readProjects, readTasks, saveLeave, saveProject, saveTask } from './storage.ts'

// In-memory stand-in for FileSystemDirectoryHandle: nested Maps, files as strings.
type Tree = Map<string, string | Tree>

function notFound() {
  return Object.assign(new Error('not found'), { name: 'NotFoundError' })
}

function fileHandle(tree: Tree, name: string) {
  return {
    kind: 'file' as const,
    getFile: async () => new File([tree.get(name) as string], name),
    createWritable: async () => {
      let text = ''
      return { write: async (s: string) => void (text += s), close: async () => void tree.set(name, text) }
    },
  }
}

function dirHandle(tree: Tree): FileSystemDirectoryHandle {
  const dir = {
    kind: 'directory' as const,
    async getDirectoryHandle(name: string, opts?: { create?: boolean }) {
      if (!tree.has(name)) {
        if (!opts?.create) throw notFound()
        tree.set(name, new Map())
      }
      return dirHandle(tree.get(name) as Tree)
    },
    async getFileHandle(name: string, opts?: { create?: boolean }) {
      if (!tree.has(name)) {
        if (!opts?.create) throw notFound()
        tree.set(name, '')
      }
      return fileHandle(tree, name)
    },
    async removeEntry(name: string) {
      if (!tree.has(name)) throw notFound()
      tree.delete(name)
    },
    async *entries() {
      for (const [name, v] of tree) yield [name, typeof v === 'string' ? fileHandle(tree, name) : dirHandle(v)]
    },
  }
  return dir as unknown as FileSystemDirectoryHandle
}

const json = (v: unknown) => JSON.stringify(v)
const projectsOf = (root: Tree) => root.get('projekty') as Tree
const tasksOf = (root: Tree) => root.get('zadania') as Tree
const leavesOf = (root: Tree) => root.get('urlopy') as Tree

test('storage: Empty folder chosen', async () => {
  const root: Tree = new Map()
  const settings = await openFolder(dirHandle(root))
  assert.deepEqual(settings, { schema: 1, architects: [], badges: {} })
  assert.deepEqual(JSON.parse(root.get('kalka.json') as string), { schema: 1, architects: [] })
  assert.equal(projectsOf(root).size, 0)
  assert.equal(tasksOf(root).size, 0)
  assert.equal(leavesOf(root).size, 0)
})

test('storage: Folder from before tasks', async () => {
  const project = json({ id: 'a', title: 'Dom' })
  const root: Tree = new Map<string, string | Tree>([['kalka.json', json({ schema: 1, architects: ['Anna Nowak'] })], ['projekty', new Map([['a.json', project]])]])
  await openFolder(dirHandle(root))
  assert.equal(tasksOf(root).size, 0)
  assert.equal(projectsOf(root).get('a.json'), project)
  assert.deepEqual(JSON.parse(root.get('kalka.json') as string).architects, ['Anna Nowak'])
})

test('storage: One broken task file', async () => {
  const root: Tree = new Map([
    ['zadania', new Map([
      ['t1.json', json({ id: 't1', projectId: 'a', title: 'Rysunki' })],
      ['t2.json', '{ nie json'],
      ['t3.json', json({ id: 't3', title: 'Bez projektu' })],
    ])],
  ])
  const { tasks, broken } = await readProjects(dirHandle(root))
  assert.deepEqual(tasks.map((l) => l.task.title), ['Rysunki'])
  assert.deepEqual(broken.map((b) => b.file), ['zadania/t2.json', 'zadania/t3.json'])
})

test('storage: kalka.json architects are read', async () => {
  const root: Tree = new Map([['kalka.json', json({ schema: 1, architects: ['Anna Nowak', 3] })]])
  assert.deepEqual((await openFolder(dirHandle(root))).architects, ['Anna Nowak'])
})

test('projects: Entries with initials and colour', async () => {
  const architects = [{ name: 'Anna Nowak', initials: 'AN', color: '#697662' }, 'Jan Kowalski']
  const root: Tree = new Map([['kalka.json', json({ schema: 1, architects })]])
  const settings = await openFolder(dirHandle(root))
  assert.deepEqual(settings.architects, ['Anna Nowak', 'Jan Kowalski'])
  assert.deepEqual(settings.badges, { 'Anna Nowak': { initials: 'AN', color: '#697662' } })
})

test('projects: Entry without a name', async () => {
  const architects = [{ initials: 'XX' }, { name: 3 }, { name: 'Anna Nowak' }, 'Jan Kowalski']
  const root: Tree = new Map([['kalka.json', json({ schema: 1, architects })]])
  const settings = await openFolder(dirHandle(root))
  assert.deepEqual(settings.architects, ['Anna Nowak', 'Jan Kowalski'])
  assert.deepEqual(settings.badges, { 'Anna Nowak': {} })
})

test('storage: One broken file', async () => {
  const root: Tree = new Map([
    ['projekty', new Map([
      ['a.json', json({ id: 'a', title: 'Dom testowy' })],
      ['b.json', '{ nie json'],
      ['c.json', json({ title: 'Bez id' })],
      ['notatka.txt', 'x'],
    ])],
  ])
  const { projects, broken } = await readProjects(dirHandle(root))
  assert.deepEqual(projects.map((p) => p.project.title), ['Dom testowy'])
  assert.deepEqual(broken.map((b) => b.file), ['b.json', 'c.json'])
})

test('storage: OneDrive conflict copy', async () => {
  const root: Tree = new Map([
    ['projekty', new Map([
      ['a.json', json({ id: 'a', title: 'Dom' })],
      ['a-LAPTOP.json', json({ id: 'a', title: 'Dom (kopia)' })],
      ['b.json', json({ id: 'b', title: 'Biuro' })],
    ])],
  ])
  const { projects } = await readProjects(dirHandle(root))
  assert.deepEqual(
    projects.map((p) => [p.file, p.duplicate]),
    [['a.json', true], ['a-LAPTOP.json', true], ['b.json', false]],
  )
})

test('storage: Normal save', async () => {
  const root: Tree = new Map([['projekty', new Map([['a.json', json({ id: 'a', title: 'Dom', updatedAt: 't1' })]])]])
  const dir = dirHandle(root)
  const [loaded] = (await readProjects(dir)).projects
  const saved = await saveProject(dir, { ...loaded.project, title: 'Dom 2' }, loaded.file, loaded.project.updatedAt)
  const onDisk = JSON.parse(projectsOf(root).get('a.json') as string)
  assert.equal(onDisk.title, 'Dom 2')
  assert.equal(onDisk.updatedAt, saved.updatedAt)
  assert.notEqual(onDisk.updatedAt, 't1')
})

test('storage: Someone else saved first', async () => {
  const root: Tree = new Map([['projekty', new Map([['a.json', json({ id: 'a', title: 'Dom', updatedAt: 't1' })]])]])
  const dir = dirHandle(root)
  const [loaded] = (await readProjects(dir)).projects
  projectsOf(root).set('a.json', json({ id: 'a', title: 'Dom od kolegi', updatedAt: 't2' }))
  await assert.rejects(saveProject(dir, { ...loaded.project, title: 'Mój' }, loaded.file, 't1'), ConflictError)
  assert.equal(JSON.parse(projectsOf(root).get('a.json') as string).title, 'Dom od kolegi')
})

test('projects: Zapisz after a milestone change', async () => {
  const root: Tree = new Map([['projekty', new Map([['a.json', json({ id: 'a', title: 'Dom', updatedAt: 't1', timeline: [{ id: 'koncepcja', style: 'koncepcja' }] })]])]])
  const dir = dirHandle(root)
  const [loaded] = (await readProjects(dir)).projects
  // the milestone write moves the baseline on
  const base = await saveProject(dir, withTimeline(loaded.project, [{ id: 'koncepcja', style: 'koncepcja', done: true }]), loaded.file, loaded.project.updatedAt)
  // "Zapisz" against the old baseline would be a false conflict; against the new one it goes through
  await assert.rejects(saveProject(dir, { ...base, title: 'Dom 2' }, loaded.file, 't1'), ConflictError)
  await saveProject(dir, { ...base, title: 'Dom 2' }, loaded.file, base.updatedAt)
  const onDisk = JSON.parse(projectsOf(root).get('a.json') as string)
  assert.deepEqual([onDisk.title, onDisk.timeline[0].done], ['Dom 2', true])
})

test('storage: Minimal project', async () => {
  const root: Tree = new Map()
  const dir = dirHandle(root)
  await openFolder(dir)
  const p = { ...emptyProject(), title: 'Nowy dom' }
  await saveProject(dir, p, `${p.id}.json`, '')
  const onDisk = JSON.parse(projectsOf(root).get(`${p.id}.json`) as string)
  assert.equal(onDisk.status, 'aktywny')
  assert.deepEqual(onDisk.timeline, [])
  assert.equal(onDisk.branches.sanitarna, '')
  // the same file can't be created twice
  await assert.rejects(saveProject(dir, p, `${p.id}.json`, ''), ConflictError)
})

test('tasks: Add', async () => {
  const root: Tree = new Map()
  const dir = dirHandle(root)
  await openFolder(dir)
  const task = { ...emptyTask('dom-lipowa'), title: 'Rysunki elewacji' }
  await saveTask(dir, task, `${task.id}.json`, '')
  const onDisk = JSON.parse(tasksOf(root).get(`${task.id}.json`) as string)
  assert.deepEqual([onDisk.projectId, onDisk.title, onDisk.status], ['dom-lipowa', 'Rysunki elewacji', 'todo'])
  assert.ok(onDisk.updatedAt)
})

test('tasks: Confirm', async () => {
  const root: Tree = new Map([['zadania', new Map([['t1.json', json({ id: 't1', projectId: 'a', updatedAt: 't1' })]])]])
  await deleteTask(dirHandle(root), 't1.json', 't1')
  assert.equal(tasksOf(root).has('t1.json'), false)
})

test('tasks: Someone else moved the task first', async () => {
  const root: Tree = new Map([['zadania', new Map([['t1.json', json({ id: 't1', projectId: 'a', status: 'todo', updatedAt: 't1' })]])]])
  const dir = dirHandle(root)
  const [loaded] = (await readTasks(dir)).tasks
  const theirs = json({ id: 't1', projectId: 'a', status: 'doing', updatedAt: 't2' })
  tasksOf(root).set('t1.json', theirs)
  await assert.rejects(saveTask(dir, { ...loaded.task, status: 'done' }, loaded.file, 't1'), ConflictError)
  await assert.rejects(deleteTask(dir, loaded.file, 't1'), ConflictError)
  assert.equal(tasksOf(root).get('t1.json'), theirs)
})

test('tasks: Task already deleted', async () => {
  const root: Tree = new Map([['zadania', new Map()]])
  const dir = dirHandle(root)
  const task = { ...emptyTask('a'), id: 't1', title: 'Rysunki', updatedAt: 't1' }
  await assert.rejects(saveTask(dir, task, 't1.json', 't1'), ConflictError)
  await assert.rejects(deleteTask(dir, 't1.json', 't1'), ConflictError)
  assert.equal(tasksOf(root).size, 0)
})

test('tasks: Two copies', async () => {
  const root: Tree = new Map([
    ['zadania', new Map([
      ['t1.json', json({ id: 't1', projectId: 'a', title: 'Rysunki', updatedAt: 'x' })],
      ['t1-LAPTOP.json', json({ id: 't1', projectId: 'a', title: 'Rysunki (kopia)', updatedAt: 'y' })],
    ])],
  ])
  const dir = dirHandle(root)
  const { tasks } = await readTasks(dir)
  assert.deepEqual(tasks.map((l) => [l.file, l.duplicate]), [['t1.json', true], ['t1-LAPTOP.json', true]])
  await deleteTask(dir, 't1-LAPTOP.json', 'y')
  assert.deepEqual((await readTasks(dir)).tasks.map((l) => [l.file, l.duplicate]), [['t1.json', false]])
})

test('storage: Folder from before leaves', async () => {
  const project = json({ id: 'a', title: 'Dom' })
  const task = json({ id: 't1', projectId: 'a' })
  const root: Tree = new Map<string, string | Tree>([
    ['kalka.json', json({ schema: 1, architects: [] })],
    ['projekty', new Map([['a.json', project]])],
    ['zadania', new Map([['t1.json', task]])],
  ])
  await openFolder(dirHandle(root))
  assert.equal(leavesOf(root).size, 0)
  assert.equal(projectsOf(root).get('a.json'), project)
  assert.equal(tasksOf(root).get('t1.json'), task)
})

const leaveFile = (id: string, updatedAt = 'u1', architect = 'Anna Nowak') => json({ id, architect, from: '2026-12-01', to: '2026-12-05', updatedAt })

test('storage: One broken leave file', async () => {
  const root: Tree = new Map([['urlopy', new Map([['l1.json', leaveFile('l1')], ['l2.json', '{ nie json']])]])
  const { leaves, broken } = await readProjects(dirHandle(root))
  assert.deepEqual(leaves.map((l) => l.leave.architect), ['Anna Nowak'])
  assert.deepEqual(broken.map((b) => b.file), ['urlopy/l2.json'])
})

test('leaves: Written file', async () => {
  const root: Tree = new Map()
  const dir = dirHandle(root)
  await openFolder(dir)
  const leave = { ...emptyLeave(), architect: 'Anna Nowak', from: '2026-12-01', to: '2026-12-05' }
  await saveLeave(dir, leave, `${leave.id}.json`, '')
  const onDisk = JSON.parse(leavesOf(root).get(`${leave.id}.json`) as string)
  assert.deepEqual([onDisk.id, onDisk.architect, onDisk.from, onDisk.to], [leave.id, 'Anna Nowak', '2026-12-01', '2026-12-05'])
  assert.ok(onDisk.updatedAt)
})

test('leaves: Confirm', async () => {
  const root: Tree = new Map([['urlopy', new Map([['l1.json', leaveFile('l1')]])]])
  await deleteLeave(dirHandle(root), 'l1.json', 'u1')
  assert.equal(leavesOf(root).has('l1.json'), false)
})

test('leaves: Someone else changed the leave first', async () => {
  const root: Tree = new Map([['urlopy', new Map([['l1.json', leaveFile('l1')]])]])
  const dir = dirHandle(root)
  const [loaded] = (await readLeaves(dir)).leaves
  const theirs = leaveFile('l1', 'u2', 'Jan Kowalski')
  leavesOf(root).set('l1.json', theirs)
  await assert.rejects(saveLeave(dir, { ...loaded.leave, to: '2026-12-08' }, loaded.file, 'u1'), ConflictError)
  await assert.rejects(deleteLeave(dir, loaded.file, 'u1'), ConflictError)
  assert.equal(leavesOf(root).get('l1.json'), theirs)
})

test('leaves: Leave already deleted', async () => {
  const root: Tree = new Map([['urlopy', new Map()]])
  const dir = dirHandle(root)
  const leave = { id: 'l1', architect: 'Anna Nowak', from: '2026-12-01', to: '2026-12-05', updatedAt: 'u1' }
  await assert.rejects(saveLeave(dir, leave, 'l1.json', 'u1'), ConflictError)
  await assert.rejects(deleteLeave(dir, 'l1.json', 'u1'), ConflictError)
  assert.equal(leavesOf(root).size, 0)
})

test('leaves: Two copies', async () => {
  const root: Tree = new Map([['urlopy', new Map([['l1.json', leaveFile('l1', 'x')], ['l1-LAPTOP.json', leaveFile('l1', 'y')]])]])
  const dir = dirHandle(root)
  assert.deepEqual((await readLeaves(dir)).leaves.map((l) => [l.file, l.duplicate]), [['l1.json', true], ['l1-LAPTOP.json', true]])
  await deleteLeave(dir, 'l1-LAPTOP.json', 'y')
  assert.deepEqual((await readLeaves(dir)).leaves.map((l) => [l.file, l.duplicate]), [['l1.json', false]])
})
