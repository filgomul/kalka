import { render, type ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { t } from './pl.ts'
import type { Filter } from './model.ts'
import {
  hasAccess,
  isSupported,
  openFolder,
  pickFolder,
  readProjects,
  rememberedFolder,
  reopenFolder,
  type ReadResult,
  type Settings,
} from './storage.ts'
import { ProjectList } from './list.tsx'
import { ProjectForm } from './form.tsx'
import './style.css'

export type Data = { dir: FileSystemDirectoryHandle; settings: Settings } & ReadResult

// Routes live in the hash: #/?a=&s=&q= (list), #/nowy, #/projekt/<file>; the query is the list filter.
function useRoute() {
  const [hash, setHash] = useState(location.hash.slice(1) || '/')
  useEffect(() => {
    const on = () => setHash(location.hash.slice(1) || '/')
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const [path, query = ''] = hash.split('?')
  const params = new URLSearchParams(query)
  const filter: Filter = { architect: params.get('a') ?? '', status: params.get('s') ?? '', q: params.get('q') ?? '' }
  const go = (to: string, replace = false) => {
    if (replace) history.replaceState(null, '', '#' + to)
    else location.hash = to
    setHash(to)
  }
  return { path, query: query ? '?' + query : '', filter, go }
}

function App() {
  const route = useRoute()
  const [remembered, setRemembered] = useState<FileSystemDirectoryHandle | null>(null)
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // true until we know whether the remembered folder opens without a click
  const [checking, setChecking] = useState(isSupported)

  useEffect(() => {
    if (!isSupported()) return
    ;(async () => {
      const dir = await rememberedFolder()
      if (dir && (await hasAccess(dir))) await load(dir)
      else setRemembered(dir ?? null)
    })()
      .catch(fail)
      .finally(() => setChecking(false))
  }, [])

  if (!isSupported()) return <Screen><p>{t.unsupported}</p></Screen>

  async function load(dir: FileSystemDirectoryHandle) {
    const settings = await openFolder(dir)
    setData({ dir, settings, ...(await readProjects(dir)) })
  }

  function fail(e: unknown) {
    // closing the picker is not an error
    if ((e as Error).name === 'AbortError') return
    setError(`${t.folderUnavailable} (${(e as Error).message})`)
    setRemembered(null)
  }

  async function open(how: 'pick' | 'reopen') {
    setBusy(true)
    setError('')
    try {
      const dir = how === 'pick' ? await pickFolder() : remembered!
      if (how === 'reopen') await reopenFolder(dir)
      await load(dir)
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  if (!data) {
    return (
      <Screen>
        {error && <p class="error">{error}</p>}
        {checking ? (
          <p class="muted">{t.loading}</p>
        ) : remembered ? (
          <button class="primary" disabled={busy} onClick={() => open('reopen')}>{t.openFolder}</button>
        ) : (
          <>
            <p>{t.pickHint}</p>
            <button class="primary" disabled={busy} onClick={() => open('pick')}>{t.pickFolder}</button>
          </>
        )}
      </Screen>
    )
  }

  const toList = () => route.go('/' + route.query)
  const saved = async () => {
    await load(data.dir)
    toList()
  }

  let content
  if (route.path === '/nowy') {
    content = <ProjectForm data={data} loaded={null} onSaved={saved} onCancel={toList} />
  } else if (route.path.startsWith('/projekt/')) {
    const file = decodeURIComponent(route.path.slice('/projekt/'.length))
    const loaded = data.projects.find((p) => p.file === file)
    content = loaded ? (
      <ProjectForm key={file} data={data} loaded={loaded} onSaved={saved} onCancel={toList} />
    ) : (
      <main><p>{t.notFound}</p><a href={'#/' + route.query}>{t.back}</a></main>
    )
  } else {
    content = (
      <ProjectList
        data={data}
        filter={route.filter}
        query={route.query}
        onFilter={(f) => {
          const p = new URLSearchParams()
          if (f.architect) p.set('a', f.architect)
          if (f.status) p.set('s', f.status)
          if (f.q) p.set('q', f.q)
          route.go('/' + (p.size ? '?' + p : ''), true)
        }}
        onRefresh={() =>
          load(data.dir).catch((e) => {
            setData(null)
            setRemembered(null)
            setError(`${t.folderUnavailable} (${(e as Error).message})`)
          })
        }
      />
    )
  }

  return (
    <>
      <header class="top">
        <a class="brand" href={'#/' + route.query}>{t.appName}</a>
        <span class="folder" title={t.folder}>{data.dir.name}</span>
      </header>
      {content}
    </>
  )
}

/** Start, no-folder and unsupported-browser screens. */
function Screen({ children }: { children: ComponentChildren }) {
  return (
    <main class="screen">
      <div class="card">
        <h1 class="brand">{t.appName}</h1>
        <p class="tagline">{t.tagline}</p>
        {children}
      </div>
    </main>
  )
}

render(<App />, document.getElementById('app')!)
