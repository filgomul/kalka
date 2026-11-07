// The Kalka data folder on the synced OneDrive, opened through the File System Access API.
// kalka.json holds settings, projekty/<id>.json one project each, zadania/<id>.json one task each,
// urlopy/<id>.json one leave each.

import { normalize, type Project } from './model.ts'
import { normalizeTask, type Badge, type Task } from './tasks.ts'
import { parseLeave, type Leave } from './leaves.ts'

/** `architects` are the names; `badges` the initials and colours of entries that define them. */
export type Settings = { schema: number; architects: string[]; badges: Record<string, Badge> }
/** A project and the file it came from; `duplicate` marks ids shared by several files. */
export type Loaded = { project: Project; file: string; duplicate: boolean }
/** A task and the file it came from, like `Loaded`. */
export type LoadedTask = { task: Task; file: string; duplicate: boolean }
/** A leave and the file it came from, like `Loaded`. */
export type LoadedLeave = { leave: Leave; file: string; duplicate: boolean }
export type ReadResult = { projects: Loaded[]; tasks: LoadedTask[]; leaves: LoadedLeave[]; broken: { file: string; reason: string }[] }

const SETTINGS = 'kalka.json'
const PROJECTS = 'projekty'
const TASKS = 'zadania'
const LEAVES = 'urlopy'

export const isSupported = () => typeof window !== 'undefined' && 'showDirectoryPicker' in window

export class ConflictError extends Error {}

// Remembered handle, per computer and browser profile

function handles<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('kalka', 1)
    open.onupgradeneeded = () => open.result.createObjectStore('handles')
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const req = run(open.result.transaction('handles', mode).objectStore('handles'))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    }
  })
}

export const rememberedFolder = () =>
  handles<FileSystemDirectoryHandle | undefined>('readonly', (s) => s.get('folder'))

export async function pickFolder(): Promise<FileSystemDirectoryHandle> {
  const dir = await window.showDirectoryPicker({ id: 'kalka', mode: 'readwrite' })
  await handles('readwrite', (s) => s.put(dir, 'folder'))
  return dir
}

/** True when the browser kept read/write access ("Allow on every visit"); never prompts. */
export async function hasAccess(dir: FileSystemDirectoryHandle): Promise<boolean> {
  return (await dir.queryPermission({ mode: 'readwrite' })) === 'granted'
}

/** Asks for read/write permission again; must run inside a click. */
export async function reopenFolder(dir: FileSystemDirectoryHandle): Promise<void> {
  if ((await dir.requestPermission({ mode: 'readwrite' })) !== 'granted') throw new Error('permission denied')
}

// Folder contents

/** Reads kalka.json, creating it, projekty/, zadania/ and urlopy/ when missing. */
export async function openFolder(dir: FileSystemDirectoryHandle): Promise<Settings> {
  await dir.getDirectoryHandle(PROJECTS, { create: true })
  await dir.getDirectoryHandle(TASKS, { create: true })
  await dir.getDirectoryHandle(LEAVES, { create: true })
  let text: string
  try {
    text = await (await (await dir.getFileHandle(SETTINGS)).getFile()).text()
  } catch (e) {
    if ((e as Error).name !== 'NotFoundError') throw e
    await write(await dir.getFileHandle(SETTINGS, { create: true }), { schema: 1, architects: [] })
    return { schema: 1, architects: [], badges: {} }
  }
  const raw = JSON.parse(text)
  const architects: string[] = []
  const badges: Record<string, Badge> = {}
  // an entry is a name or { name, initials?, color? }
  for (const a of Array.isArray(raw.architects) ? raw.architects : []) {
    if (typeof a === 'string') architects.push(a)
    else if (typeof a?.name === 'string' && a.name) {
      architects.push(a.name)
      const badge: Badge = {}
      if (typeof a.initials === 'string') badge.initials = a.initials
      if (typeof a.color === 'string') badge.color = a.color
      badges[a.name] = badge
    }
  }
  return { schema: raw.schema ?? 1, architects, badges }
}

export async function readProjects(dir: FileSystemDirectoryHandle): Promise<ReadResult> {
  const read = await readFolder(dir, PROJECTS, (raw) => {
    if (typeof raw?.id !== 'string' || !raw.id) throw new Error('brak id')
    return normalize(raw)
  })
  const { tasks, broken } = await readTasks(dir)
  const leaves = await readLeaves(dir)
  return {
    projects: read.items.map(({ value, ...l }) => ({ project: value, ...l })),
    tasks,
    leaves: leaves.leaves,
    broken: [...read.broken, ...broken, ...leaves.broken],
  }
}

/** Reads zadania/ alone, to refresh the boards after a task change. */
export async function readTasks(dir: FileSystemDirectoryHandle): Promise<Pick<ReadResult, 'tasks' | 'broken'>> {
  const read = await readFolder(dir, TASKS, (raw) => {
    if (typeof raw?.id !== 'string' || !raw.id) throw new Error('brak id')
    if (typeof raw.projectId !== 'string' || !raw.projectId) throw new Error('brak projectId')
    return normalizeTask(raw)
  })
  return {
    tasks: read.items.map(({ value, ...l }) => ({ task: value, ...l })),
    broken: read.broken.map((b) => ({ ...b, file: `${TASKS}/${b.file}` })),
  }
}

/** Reads urlopy/ alone, to refresh the leaves after a leave change. */
export async function readLeaves(dir: FileSystemDirectoryHandle): Promise<Pick<ReadResult, 'leaves' | 'broken'>> {
  const read = await readFolder(dir, LEAVES, parseLeave)
  return {
    leaves: read.items.map(({ value, ...l }) => ({ leave: value, ...l })),
    broken: read.broken.map((b) => ({ ...b, file: `${LEAVES}/${b.file}` })),
  }
}

/** Every `*.json` in `name`, parsed by `parse` (which throws on a bad file); ids in several files are marked. */
async function readFolder<T extends { id: string }>(dir: FileSystemDirectoryHandle, name: string, parse: (raw: any) => T) {
  const folder = await dir.getDirectoryHandle(name, { create: true })
  const items: { value: T; file: string; duplicate: boolean }[] = []
  const broken: ReadResult['broken'] = []
  for await (const [file, handle] of folder.entries()) {
    if (handle.kind !== 'file' || !file.endsWith('.json')) continue
    try {
      items.push({ value: parse(JSON.parse(await (await handle.getFile()).text())), file, duplicate: false })
    } catch (e) {
      broken.push({ file, reason: (e as Error).message })
    }
  }
  const count = new Map<string, number>()
  for (const { value } of items) count.set(value.id, (count.get(value.id) ?? 0) + 1)
  for (const l of items) l.duplicate = count.get(l.value.id)! > 1
  return { items, broken }
}

/**
 * Writes `project` to `file` unless the file changed since it was loaded:
 * its `updatedAt` must still be `loadedAt`, and a new project (loadedAt '') must not exist yet.
 */
export const saveProject = (dir: FileSystemDirectoryHandle, project: Project, file: string, loadedAt: string) =>
  checkedWrite(dir, PROJECTS, project, file, loadedAt)

/** Same check as `saveProject`, for `zadania/<file>`. */
export const saveTask = (dir: FileSystemDirectoryHandle, task: Task, file: string, loadedAt: string) =>
  checkedWrite(dir, TASKS, task, file, loadedAt)

/** Same check as `saveProject`, for `urlopy/<file>`. */
export const saveLeave = (dir: FileSystemDirectoryHandle, leave: Leave, file: string, loadedAt: string) =>
  checkedWrite(dir, LEAVES, leave, file, loadedAt)

/** Removes `zadania/<file>` unless it changed since it was loaded or is already gone. */
export const deleteTask = (dir: FileSystemDirectoryHandle, file: string, loadedAt: string) => checkedDelete(dir, TASKS, file, loadedAt)

/** Removes `urlopy/<file>`, with the same check as `deleteTask`. */
export const deleteLeave = (dir: FileSystemDirectoryHandle, file: string, loadedAt: string) => checkedDelete(dir, LEAVES, file, loadedAt)

async function checkedDelete(dir: FileSystemDirectoryHandle, name: string, file: string, loadedAt: string): Promise<void> {
  const folder = await dir.getDirectoryHandle(name, { create: true })
  if ((await updatedAtOnDisk(folder, file)) !== loadedAt) throw new ConflictError(file)
  try {
    await folder.removeEntry(file)
  } catch (e) {
    throw (e as Error).name === 'NotFoundError' ? new ConflictError(file) : e
  }
}

async function checkedWrite<T extends { updatedAt: string }>(
  dir: FileSystemDirectoryHandle,
  name: string,
  value: T,
  file: string,
  loadedAt: string,
): Promise<T> {
  const folder = await dir.getDirectoryHandle(name, { create: true })
  if ((await updatedAtOnDisk(folder, file)) !== loadedAt) throw new ConflictError(file)
  // ponytail: check-then-write, not atomic; a save landing between the two is missed. Fine for a few users.
  const saved = { ...value, updatedAt: new Date().toISOString() }
  await write(await folder.getFileHandle(file, { create: true }), saved)
  return saved
}

/** `updatedAt` of the file on disk: '' when it is missing (fine for a new file), 'unreadable' (a conflict) when broken. */
async function updatedAtOnDisk(folder: FileSystemDirectoryHandle, file: string): Promise<string> {
  try {
    const text = await (await (await folder.getFileHandle(file)).getFile()).text()
    return JSON.parse(text).updatedAt ?? ''
  } catch (e) {
    return (e as Error).name === 'NotFoundError' ? '' : 'unreadable'
  }
}

async function write(handle: FileSystemFileHandle, data: unknown) {
  const w = await handle.createWritable()
  await w.write(JSON.stringify(data, null, 2) + '\n')
  await w.close()
}
