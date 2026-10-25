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
import { CalendarView } from './calendar-view.tsx'
import { Deadlines } from './deadlines.tsx'
import './style.css'

export type Data = { dir: FileSystemDirectoryHandle; settings: Settings } & ReadResult

// Routes live in the hash: #/?a=&s=&q= (list), #/kalendarz?a=&s=&p=&m=, #/terminy?a=&s=&p=,
// #/nowy and #/projekt/<file>. The query holds the filters; z= on a form link names the view to go back to.
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
  return { path, query: query ? '?' + query : '', params, filter, go }
}

const qs = (p: URLSearchParams) => (p.size ? '?' + p : '')
const VIEWS = ['kalendarz', 'terminy']

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

  // back to the view the form was opened from, with its filters
  const back = () => {
    const p = new URLSearchParams(route.params)
    const z = p.get('z') ?? ''
    p.delete('z')
    route.go('/' + (VIEWS.includes(z) ? z : '') + qs(p))
  }
  const saved = async () => {
    await load(data.dir)
    back()
  }
  // the form keeps the tab of the view it was opened from
  const view = route.path === '/nowy' || route.path.startsWith('/projekt/') ? (route.params.get('z') ?? '') : route.path.slice(1)
  const tabQuery = qs(new URLSearchParams([...route.params].filter(([k]) => k === 'a' || k === 's')))

  let content
  if (route.path === '/nowy') {
    content = <ProjectForm data={data} loaded={null} onSaved={saved} onCancel={back} />
  } else if (route.path.startsWith('/projekt/')) {
    const file = decodeURIComponent(route.path.slice('/projekt/'.length))
    const loaded = data.projects.find((p) => p.file === file)
    content = loaded ? (
      <ProjectForm key={file} data={data} loaded={loaded} onSaved={saved} onCancel={back} />
    ) : (
      <main><p>{t.notFound}</p><a href={'#/' + route.query}>{t.back}</a></main>
    )
  } else if (route.path === '/kalendarz' || route.path === '/terminy') {
    const View = route.path === '/kalendarz' ? CalendarView : Deadlines
    content = <View data={data} params={route.params} onParams={(p) => route.go(route.path + qs(p), true)} />
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
        <a class="brand" href={'#/' + tabQuery}>{t.appName}</a>
        <nav class="tabs">
          {[['', t.projects], ['kalendarz', t.calendar], ['terminy', t.deadlines]].map(([v, label]) => (
            <a key={v} class="tab" href={`#/${v}${tabQuery}`} aria-current={(VIEWS.includes(view) ? view : '') === v ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>
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
