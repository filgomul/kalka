import { render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { t } from './pl.ts'
import type { Filter } from './model.ts'
import {
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

  useEffect(() => {
    if (isSupported()) rememberedFolder().then((d) => setRemembered(d ?? null), () => {})
  }, [])

  if (!isSupported()) return <main class="screen"><p>{t.unsupported}</p></main>

  async function load(dir: FileSystemDirectoryHandle) {
    const settings = await openFolder(dir)
    setData({ dir, settings, ...(await readProjects(dir)) })
  }

  async function open(how: 'pick' | 'reopen') {
    setBusy(true)
    setError('')
    try {
      const dir = how === 'pick' ? await pickFolder() : remembered!
      if (how === 'reopen') await reopenFolder(dir)
      await load(dir)
    } catch (e) {
      // closing the picker is not an error
      if ((e as Error).name !== 'AbortError') {
        setError(`${t.folderUnavailable} (${(e as Error).message})`)
        setRemembered(null)
      }
    } finally {
      setBusy(false)
    }
  }

  if (!data) {
    return (
      <main class="screen">
        <h1>{t.appName}</h1>
        {error && <p class="error">{error}</p>}
        {remembered ? (
          <button disabled={busy} onClick={() => open('reopen')}>{t.openFolder}</button>
        ) : (
          <>
            <p>{t.pickHint}</p>
            <button disabled={busy} onClick={() => open('pick')}>{t.pickFolder}</button>
          </>
        )}
      </main>
    )
  }

  const toList = () => route.go('/' + route.query)
  const saved = async () => {
    await load(data.dir)
    toList()
  }

  if (route.path === '/nowy') return <ProjectForm data={data} loaded={null} onSaved={saved} onCancel={toList} />
  if (route.path.startsWith('/projekt/')) {
    const file = decodeURIComponent(route.path.slice('/projekt/'.length))
    const loaded = data.projects.find((p) => p.file === file)
    if (!loaded) return <main class="screen"><p>{t.notFound}</p><a href={'#/' + route.query}>{t.back}</a></main>
    return <ProjectForm key={file} data={data} loaded={loaded} onSaved={saved} onCancel={toList} />
  }
  return (
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

render(<App />, document.getElementById('app')!)
