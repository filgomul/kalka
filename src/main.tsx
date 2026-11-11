import { render, type ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { t } from './pl.ts'
import { parseSort, sortParam, todayIso, type Filter, type Sort } from './model.ts'
import {
  hasAccess,
  isSupported,
  openFolder,
  pickFolder,
  readLeaves,
  readMeetings,
  readProjects,
  readTasks,
  rememberedFolder,
  reopenFolder,
  type ReadResult,
  type Settings,
} from './storage.ts'
import { ProjectList } from './list.tsx'
import { ProjectForm } from './form.tsx'
import { CalendarView } from './calendar-view.tsx'
import { Deadlines } from './deadlines.tsx'
import { LeavesView } from './leaves-view.tsx'
import { MeetingsView } from './meetings-view.tsx'
import { TasksView } from './tasks-view.tsx'
import './style.css'

export type Data = { dir: FileSystemDirectoryHandle; settings: Settings } & ReadResult

// Routes live in the hash: #/kalendarz?a=&s=&p=&k=&m= (the start view), #/projekty?a=&s=&q=&y=&o=, #/terminy?a=&s=&p=,
// #/zadania?a=&s=&n=, #/spotkania?a=&j=, #/urlopy?a=, #/nowy and #/projekt/<file>. The query holds the filters; z= on a form link
// names the view to go back to.

/** The calendar is the start view: an empty path becomes #/kalendarz, keeping the query. */
function startView(hash: string): string {
  const [path, query] = hash.split('?')
  return path === '' || path === '/' ? '/kalendarz' + (query !== undefined ? '?' + query : '') : hash
}

/** The current hash, with an empty path replaced in the address bar by the start view. */
function currentHash(): string {
  const hash = location.hash.slice(1)
  const to = startView(hash)
  if (to !== hash) history.replaceState(null, '', '#' + to)
  return to
}

function useRoute() {
  const [hash, setHash] = useState(currentHash)
  useEffect(() => {
    const on = () => setHash(currentHash())
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  const [path, query = ''] = hash.split('?')
  const params = new URLSearchParams(query)
  const filter: Filter = { architect: params.get('a') ?? '', status: params.get('s') ?? '', q: params.get('q') ?? '', type: params.get('y') ?? '' }
  const go = (to: string, replace = false) => {
    to = startView(to)
    if (replace) history.replaceState(null, '', '#' + to)
    else location.hash = to
    setHash(to)
  }
  return { path, query: query ? '?' + query : '', params, filter, go }
}

const qs = (p: URLSearchParams) => (p.size ? '?' + p : '')
const VIEWS = ['kalendarz', 'projekty', 'terminy', 'zadania', 'spotkania', 'urlopy']

// ?demo (before the hash, so routes keep it) opens made-up data in memory instead of the folder
const demo = new URLSearchParams(location.search).has('demo')
const demoLink = <a class="demo-link" href="?demo">{t.demoLink}</a>

function App() {
  const route = useRoute()
  const [remembered, setRemembered] = useState<FileSystemDirectoryHandle | null>(null)
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // true until we know whether the remembered folder opens without a click, or the demo is loaded
  const [checking, setChecking] = useState(() => demo || isSupported())

  useEffect(() => {
    if (demo) {
      // a separate chunk, never fetched outside the demo
      import('./demo.ts')
        .then((m) => load(m.demoFolder(todayIso())))
        .catch((e) => setError(`${t.loadFailed} (${(e as Error).message})`))
        .finally(() => setChecking(false))
      return
    }
    if (!isSupported()) return
    ;(async () => {
      const dir = await rememberedFolder()
      if (dir && (await hasAccess(dir))) await load(dir)
      else setRemembered(dir ?? null)
    })()
      .catch(fail)
      .finally(() => setChecking(false))
  }, [])

  if (!isSupported() && !demo) return <Screen><p>{t.unsupported}</p>{demoLink}</Screen>

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
        ) : demo ? null : remembered ? (
          <button class="primary" disabled={busy} onClick={() => open('reopen')}>{t.openFolder}</button>
        ) : (
          <>
            <p>{t.pickHint}</p>
            <button class="primary" disabled={busy} onClick={() => open('pick')}>{t.pickFolder}</button>
            {demoLink}
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
    p.delete('t')
    route.go('/' + (VIEWS.includes(z) ? z : 'kalendarz') + qs(p))
  }
  const saved = async () => {
    await load(data.dir)
    back()
  }
  // after a milestone change: everything is read again without leaving the form, whose draft lives in its own state
  const reloadProjects = () => load(data.dir)
  // after a task change: only zadania/ is read again, so an open project draft is kept
  const reloadTasks = async () => {
    const { tasks, broken } = await readTasks(data.dir)
    setData((d) => d && { ...d, tasks, broken: [...d.broken.filter((b) => !b.file.startsWith('zadania/')), ...broken] })
  }
  // after a meeting change: only spotkania/ is read again, so an open project draft is kept
  const reloadMeetings = async () => {
    const { meetings, broken } = await readMeetings(data.dir)
    setData((d) => d && { ...d, meetings, broken: [...d.broken.filter((b) => !b.file.startsWith('spotkania/')), ...broken] })
  }
  // after a leave change: only urlopy/ is read again
  const reloadLeaves = async () => {
    const { leaves, broken } = await readLeaves(data.dir)
    setData((d) => d && { ...d, leaves, broken: [...d.broken.filter((b) => !b.file.startsWith('urlopy/')), ...broken] })
  }
  // the form keeps the tab of the view it was opened from
  const view = route.path === '/nowy' || route.path.startsWith('/projekt/') ? (route.params.get('z') ?? '') : route.path.slice(1)
  const tabQuery = qs(new URLSearchParams([...route.params].filter(([k]) => k === 'a' || k === 's')))

  let content
  if (route.path === '/nowy') {
    content = <ProjectForm key={'nowy-' + (route.params.get('t') ?? '')} data={data} loaded={null} template={route.params.get('t')} onSaved={saved} onCancel={back} reloadProjects={reloadProjects} reloadTasks={reloadTasks} reloadMeetings={reloadMeetings} />
  } else if (route.path.startsWith('/projekt/')) {
    const file = decodeURIComponent(route.path.slice('/projekt/'.length))
    const loaded = data.projects.find((p) => p.file === file)
    content = loaded ? (
      <ProjectForm key={file} data={data} loaded={loaded} onSaved={saved} onCancel={back} reloadProjects={reloadProjects} reloadTasks={reloadTasks} reloadMeetings={reloadMeetings} />
    ) : (
      <main><p>{t.notFound}</p><a href={'#/projekty' + route.query}>{t.back}</a></main>
    )
  } else if (route.path === '/kalendarz' || route.path === '/terminy' || route.path === '/zadania' || route.path === '/spotkania' || route.path === '/urlopy') {
    const props = { data, params: route.params, onParams: (p: URLSearchParams) => route.go(route.path + qs(p), true) }
    content =
      route.path === '/kalendarz' ? <CalendarView {...props} reloadLeaves={reloadLeaves} reloadMeetings={reloadMeetings} />
      : route.path === '/zadania' ? <TasksView {...props} reloadTasks={reloadTasks} />
      : route.path === '/spotkania' ? <MeetingsView {...props} reloadMeetings={reloadMeetings} />
      : route.path === '/urlopy' ? <LeavesView {...props} reloadLeaves={reloadLeaves} />
      : <Deadlines {...props} />
  } else if (route.path === '/projekty') {
    const sort = parseSort(route.params.get('o'))
    const show = (f: Filter, s: Sort) => {
      const p = new URLSearchParams()
      if (f.architect) p.set('a', f.architect)
      if (f.status) p.set('s', f.status)
      if (f.q) p.set('q', f.q)
      if (f.type) p.set('y', f.type)
      if (sortParam(s)) p.set('o', sortParam(s))
      route.go('/projekty' + qs(p), true)
    }
    content = (
      <ProjectList
        data={data}
        filter={route.filter}
        sort={sort}
        query={route.query}
        onFilter={(f) => show(f, sort)}
        onSort={(s) => show(route.filter, s)}
        onRefresh={() =>
          load(data.dir).catch((e) => {
            setData(null)
            setRemembered(null)
            setError(`${t.folderUnavailable} (${(e as Error).message})`)
          })
        }
      />
    )
  } else {
    content = <main><p>{t.notFound}</p><a href={'#/kalendarz' + tabQuery}>{t.back}</a></main>
  }

  return (
    <>
      <header class="top">
        <a class="brand" href={'#/kalendarz' + tabQuery}>{t.appName}</a>
        <nav class="tabs">
          {[['kalendarz', t.calendar], ['projekty', t.projects], ['terminy', t.deadlines], ['zadania', t.tasks], ['spotkania', t.meetings], ['urlopy', t.leaves]].map(([v, label]) => (
            <a key={v} class="tab" href={`#/${v}${tabQuery}`} aria-current={view === v ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <span class="folder" title={t.folder}>{data.dir.name}</span>
      </header>
      {demo && (
        <div class="notice">
          <p class="demo">
            {t.demoBanner} {!isSupported() && t.demoBrowser} <a href={location.pathname}>{t.demoExit}</a>
          </p>
        </div>
      )}
      {data.broken.length > 0 && (
        <div class="notice">
          <div class="error">
            {t.brokenFiles}
            <ul>{data.broken.map((b) => <li key={b.file}>{b.file}: {b.reason}</li>)}</ul>
          </div>
        </div>
      )}
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
