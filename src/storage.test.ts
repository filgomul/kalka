import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyProject } from './model.ts'
import { ConflictError, openFolder, readProjects, saveProject } from './storage.ts'

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
    async *entries() {
      for (const [name, v] of tree) yield [name, typeof v === 'string' ? fileHandle(tree, name) : dirHandle(v)]
    },
  }
  return dir as unknown as FileSystemDirectoryHandle
}

const json = (v: unknown) => JSON.stringify(v)
const projectsOf = (root: Tree) => root.get('projekty') as Tree

test('storage: Empty folder chosen', async () => {
  const root: Tree = new Map()
  const settings = await openFolder(dirHandle(root))
  assert.deepEqual(settings, { schema: 1, architects: [] })
  assert.deepEqual(JSON.parse(root.get('kalka.json') as string), { schema: 1, architects: [] })
  assert.equal(projectsOf(root).size, 0)
})

test('storage: kalka.json architects are read', async () => {
  const root: Tree = new Map([['kalka.json', json({ schema: 1, architects: ['Anna Nowak', 3] })]])
  assert.deepEqual((await openFolder(dirHandle(root))).architects, ['Anna Nowak'])
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

test('storage: Minimal project', async () => {
  const root: Tree = new Map()
  const dir = dirHandle(root)
  await openFolder(dir)
  const p = { ...emptyProject(), title: 'Nowy dom' }
  await saveProject(dir, p, `${p.id}.json`, '')
  const onDisk = JSON.parse(projectsOf(root).get(`${p.id}.json`) as string)
  assert.equal(onDisk.status, 'aktywny')
  assert.deepEqual(onDisk.milestones, {})
  assert.equal(onDisk.branches.sanitarna, '')
  // the same file can't be created twice
  await assert.rejects(saveProject(dir, p, `${p.id}.json`, ''), ConflictError)
})
