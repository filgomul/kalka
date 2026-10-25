// The Kalka data folder on the synced OneDrive, opened through the File System Access API.
// kalka.json holds settings, projekty/<id>.json one project each.

import { normalize, type Project } from './model.ts'

export type Settings = { schema: number; architects: string[] }
/** A project and the file it came from; `duplicate` marks ids shared by several files. */
export type Loaded = { project: Project; file: string; duplicate: boolean }
export type ReadResult = { projects: Loaded[]; broken: { file: string; reason: string }[] }

const SETTINGS = 'kalka.json'
const PROJECTS = 'projekty'

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

/** Reads kalka.json, creating it and projekty/ when missing. */
export async function openFolder(dir: FileSystemDirectoryHandle): Promise<Settings> {
  await dir.getDirectoryHandle(PROJECTS, { create: true })
  let text: string
  try {
    text = await (await (await dir.getFileHandle(SETTINGS)).getFile()).text()
  } catch (e) {
    if ((e as Error).name !== 'NotFoundError') throw e
    const settings: Settings = { schema: 1, architects: [] }
    await write(await dir.getFileHandle(SETTINGS, { create: true }), settings)
    return settings
  }
  const raw = JSON.parse(text)
  const architects = Array.isArray(raw.architects) ? raw.architects.filter((a: unknown) => typeof a === 'string') : []
  return { schema: raw.schema ?? 1, architects }
}

export async function readProjects(dir: FileSystemDirectoryHandle): Promise<ReadResult> {
  const folder = await dir.getDirectoryHandle(PROJECTS, { create: true })
  const projects: Loaded[] = []
  const broken: ReadResult['broken'] = []
  for await (const [file, handle] of folder.entries()) {
    if (handle.kind !== 'file' || !file.endsWith('.json')) continue
    try {
      const raw = JSON.parse(await (await handle.getFile()).text())
      if (typeof raw?.id !== 'string' || !raw.id) throw new Error('brak id')
      projects.push({ project: normalize(raw), file, duplicate: false })
    } catch (e) {
      broken.push({ file, reason: (e as Error).message })
    }
  }
  const count = new Map<string, number>()
  for (const { project } of projects) count.set(project.id, (count.get(project.id) ?? 0) + 1)
  for (const l of projects) l.duplicate = count.get(l.project.id)! > 1
  return { projects, broken }
}

/**
 * Writes `project` to `file` unless the file changed since it was loaded:
 * its `updatedAt` must still be `loadedAt`, and a new project (loadedAt '') must not exist yet.
 */
export async function saveProject(
  dir: FileSystemDirectoryHandle,
  project: Project,
  file: string,
  loadedAt: string,
): Promise<Project> {
  const folder = await dir.getDirectoryHandle(PROJECTS, { create: true })
  let onDisk = ''
  try {
    const text = await (await (await folder.getFileHandle(file)).getFile()).text()
    onDisk = JSON.parse(text).updatedAt ?? ''
  } catch (e) {
    // a missing file is fine for a new project; an unreadable one is a conflict
    if ((e as Error).name !== 'NotFoundError') onDisk = 'unreadable'
  }
  if (onDisk !== loadedAt) throw new ConflictError(file)
  // ponytail: check-then-write, not atomic; a save landing between the two is missed. Fine for a few users.
  const saved = { ...project, updatedAt: new Date().toISOString() }
  await write(await folder.getFileHandle(file, { create: true }), saved)
  return saved
}

async function write(handle: FileSystemFileHandle, data: unknown) {
  const w = await handle.createWritable()
  await w.write(JSON.stringify(data, null, 2) + '\n')
  await w.close()
}
