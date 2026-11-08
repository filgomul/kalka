import { useEffect, useRef, useState } from 'preact/hooks'
import { BRANCHES, emptyProject, fromTemplate, moveMilestone, newId, nextLp, parseDate, prepareForSave, STATUSES, STYLES, styleOf, titleOf, withTimeline, type Milestone, type Project } from './model.ts'
import { branchLabels, statusLabels, t } from './pl.ts'
import { ConflictError, readProjects, saveProject, type Loaded } from './storage.ts'
import type { Data } from './main.tsx'
import { Portal, TaskBoard } from './board.tsx'
import { colorOf } from './calendar-view.tsx'
import { MeetingsSection } from './meetings-view.tsx'

type Props = {
  data: Data
  /** null for a new project */
  loaded: Loaded | null
  /** template id that seeds a new project's milestones; ignored for a saved one */
  template?: string | null
  onSaved: () => Promise<void>
  onCancel: () => void
  /** reads the folder again after a milestone change, without leaving the form */
  reloadProjects: () => Promise<void>
  /** reads the task files again after a task change */
  reloadTasks: () => Promise<void>
  /** reads the meeting files again after a meeting change */
  reloadMeetings: () => Promise<void>
}

type Precision = 'day' | 'month'

/** A typed date is written once the user stops typing for this long. */
const DATE_DELAY = 500

export function ProjectForm({ data, loaded, template, onSaved, onCancel, reloadProjects, reloadTasks, reloadMeetings }: Props) {
  const [draft, setDraft] = useState<Project>(
    () => loaded?.project ?? { ...emptyProject(), lp: nextLp(data.projects.map((l) => l.project)), timeline: fromTemplate(template) },
  )
  /** day or month per milestone id; a milestone without an entry is a day */
  const [precision, setPrecision] = useState<Record<string, Precision>>(
    () => Object.fromEntries(draft.timeline.map((m) => [m.id, parseDate(m.date)?.precision ?? 'day'])),
  )
  const [error, setError] = useState('')
  const [timelineError, setTimelineError] = useState('')
  const [saving, setSaving] = useState(false)

  // Milestone changes of a saved project are written at once (only the milestones); the
  // other fields wait for "Zapisz". `base` is the project as last written and is what a
  // milestone write starts from. `saveAt` is the updatedAt "Zapisz" checks against: it
  // follows our own milestone writes, but not a re-read after someone else's save, so
  // "Zapisz" still refuses to overwrite their other fields with this draft's old values.
  const base = useRef<Project | null>(loaded?.project ?? null)
  const saveAt = useRef(loaded?.project.updatedAt ?? '')
  const queue = useRef<Promise<void>>(Promise.resolve())
  const pending = useRef<{ list: Milestone[]; timer: number } | null>(null)
  const latest = useRef(draft)
  latest.current = draft

  const set = (patch: Partial<Project>) => setDraft((d) => ({ ...d, ...patch }))

  /** Puts `list` in the draft and, for a saved project, writes it after `delay` ms (null: draft only). */
  function commit(list: Milestone[], delay: number | null = 0) {
    setDraft((d) => ({ ...d, timeline: list }))
    if (!base.current || delay === null) return
    if (pending.current) clearTimeout(pending.current.timer)
    pending.current = { list, timer: window.setTimeout(flush, delay) }
  }

  /** Starts the waiting milestone write now; resolves when every write so far is done. */
  function flush(): Promise<void> {
    const p = pending.current
    if (p) {
      clearTimeout(p.timer)
      pending.current = null
      queue.current = queue.current.then(() => writeTimeline(p.list))
    }
    return queue.current
  }

  /** One milestone write. Never rejects, so the queue keeps going. */
  async function writeTimeline(list: Milestone[]) {
    const from = base.current!
    try {
      const saved = await saveProject(data.dir, withTimeline(from, list), loaded!.file, from.updatedAt)
      if (saveAt.current === from.updatedAt) saveAt.current = saved.updatedAt
      base.current = saved
      setTimelineError('')
      await reloadProjects()
    } catch (err) {
      if (!(err instanceof ConflictError)) return setTimelineError(`${t.saveFailed} ${(err as Error).message}`)
      // someone else saved first: show the milestones as the file holds them, keep the other fields
      const fresh = (await readProjects(data.dir)).projects.find((l) => l.file === loaded!.file)?.project
      if (fresh) {
        base.current = fresh
        setDraft((d) => ({ ...d, timeline: fresh.timeline }))
        setPrecision(Object.fromEntries(fresh.timeline.map((m) => [m.id, parseDate(m.date)?.precision ?? 'day'])))
      }
      setTimelineError(t.timelineConflict)
      await reloadProjects()
    }
  }

  // a date typed just before leaving still gets written
  useEffect(() => () => void flush(), [])

  const setTimeline = (change: (list: Milestone[]) => Milestone[]) => commit(change(draft.timeline))
  const setMilestone = (id: string, patch: Partial<Milestone>, delay: number | null = 0) =>
    commit(draft.timeline.map((m) => (m.id === id ? { ...m, ...patch } : m)), delay)
  const switchPrecision = (m: Milestone, to: Precision) => {
    setPrecision((p) => ({ ...p, [m.id]: to }))
    // a month keeps its year and month and is written; a day can't be guessed from a month,
    // so the field is emptied in the draft only and the stored month stays until a day is picked
    if (to === 'month') setMilestone(m.id, { date: (m.date ?? '').slice(0, 7) })
    else setMilestone(m.id, { date: '' }, null)
  }

  const listed = data.settings.architects
  const architects = draft.leadArchitect && !listed.includes(draft.leadArchitect) ? [...listed, draft.leadArchitect] : listed

  async function save(e: Event) {
    e.preventDefault()
    if (!draft.title.trim()) return setError(t.titleRequired)
    setSaving(true)
    setError('')
    try {
      await flush()
      const file = loaded?.file ?? `${draft.id}.json`
      await saveProject(data.dir, prepareForSave(latest.current), file, saveAt.current)
      await onSaved()
    } catch (err) {
      setError(err instanceof ConflictError ? t.conflict : `${t.saveFailed} ${(err as Error).message}`)
      setSaving(false)
    }
  }

  async function cancel() {
    await flush()
    onCancel()
  }

  return (
    <main>
      <form onSubmit={save}>
        <div class="heading">
          <a class="back" href="#/" onClick={(e) => { e.preventDefault(); cancel() }}>← {t.back}</a>
          <h1>{loaded ? draft.title || loaded.file : t.newProject}</h1>
        </div>

        <section class="card">
          <h2>{t.project}</h2>
          <div class="fields">
            <label class="narrow">
              {t.lp}
              <input
                type="number"
                min="1"
                step="1"
                value={draft.lp ?? ''}
                onInput={(e) => set({ lp: e.currentTarget.value === '' ? undefined : Number(e.currentTarget.value) })}
              />
            </label>
            <label class="wide">
              {t.title} *
              <input required value={draft.title} onInput={(e) => set({ title: e.currentTarget.value })} />
            </label>
            <label>
              {t.city}
              <input value={draft.location.city} onInput={(e) => set({ location: { ...draft.location, city: e.currentTarget.value } })} />
            </label>
            <label class="wide">
              {t.address}
              <input value={draft.location.address} onInput={(e) => set({ location: { ...draft.location, address: e.currentTarget.value } })} />
            </label>
            <label>
              {t.leadArchitect}
              <select value={draft.leadArchitect} onChange={(e) => set({ leadArchitect: e.currentTarget.value })}>
                <option value=""></option>
                {architects.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              {listed.length === 0 && <small class="hint">{t.noArchitects}</small>}
            </label>
            <label>
              {t.status}
              <select value={draft.status} onChange={(e) => set({ status: e.currentTarget.value as Project['status'] })}>
                {STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </label>
          </div>
        </section>

        <Timeline
          list={draft.timeline}
          precision={precision}
          onChange={setTimeline}
          onMilestone={setMilestone}
          onPrecision={switchPrecision}
          savesAtOnce={!!loaded}
          error={timelineError}
        />

        {loaded && <TaskBoard data={data} projectId={loaded.project.id} reloadTasks={reloadTasks} />}

        {loaded && <MeetingsSection data={data} project={loaded.project} reloadMeetings={reloadMeetings} />}

        <section class="card">
          <h2>{t.branches}</h2>
          <div class="fields two">
            {BRANCHES.map((key) => (
              <label key={key}>
                {branchLabels[key]}
                <textarea rows={4} value={draft.branches[key]} onInput={(e) => set({ branches: { ...draft.branches, [key]: e.currentTarget.value } })} />
              </label>
            ))}
          </div>
        </section>

        <section class="card">
          <h2>{t.notes}</h2>
          <textarea rows={4} aria-label={t.notes} value={draft.notes} onInput={(e) => set({ notes: e.currentTarget.value })} />
        </section>

        <div class="actions">
          {error && <p class="error" role="alert">{error}</p>}
          <button type="button" onClick={cancel}>{t.cancel}</button>
          <button class="primary" type="submit" disabled={saving}>{saving ? t.saving : t.save}</button>
        </div>
      </form>
    </main>
  )
}

type TimelineProps = {
  list: Milestone[]
  precision: Record<string, Precision>
  onChange: (change: (list: Milestone[]) => Milestone[]) => void
  /** `delay` in ms before the write; the date input waits for the user to stop typing */
  onMilestone: (id: string, patch: Partial<Milestone>, delay?: number) => void
  onPrecision: (m: Milestone, to: Precision) => void
  /** a saved project, whose milestone changes are written at once */
  savesAtOnce: boolean
  /** why the last milestone write failed, if it did */
  error: string
}

/** The project's milestones in order: dates and marks, add, edit, delete and reorder. */
function Timeline({ list, precision, onChange, onMilestone, onPrecision, savesAtOnce, error }: TimelineProps) {
  const [editing, setEditing] = useState<Milestone | 'new' | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  /** where a dragged milestone would land: its index among the milestones not being dragged */
  const [dropAt, setDropAt] = useState<number | null>(null)
  const grid = useRef<HTMLDivElement>(null)
  /** handle to focus again after a keyboard move re-renders the list */
  const refocus = useRef<string | null>(null)

  useEffect(() => {
    if (!refocus.current) return
    grid.current?.querySelector<HTMLElement>(`[data-handle="${refocus.current}"]`)?.focus()
    refocus.current = null
  })

  const move = (from: number, to: number) => onChange((l) => moveMilestone(l, from, to))

  function onKeyDown(e: KeyboardEvent, i: number, id: string) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    const to = e.key === 'ArrowUp' ? i - 1 : i + 1
    if (to < 0 || to >= list.length) return
    refocus.current = id
    move(i, to)
  }

  function onDragOver(e: DragEvent) {
    if (!dragging) return
    e.preventDefault()
    // the grid wraps, so go by reading order: before the first milestone the pointer is above,
    // or level with and left of its middle
    const rows = [...grid.current!.querySelectorAll<HTMLElement>('.milestone:not(.dragging)')]
    const i = rows.findIndex((r) => {
      const b = r.getBoundingClientRect()
      return e.clientY < b.top || (e.clientY <= b.bottom && e.clientX < b.left + b.width / 2)
    })
    const index = i === -1 ? rows.length : i
    if (index !== dropAt) setDropAt(index)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    const from = list.findIndex((m) => m.id === dragging)
    if (from !== -1 && dropAt !== null) move(from, dropAt)
    setDragging(null)
    setDropAt(null)
  }

  function onDragLeave(e: DragEvent) {
    const to = e.relatedTarget as Node | null
    if (!to || !(e.currentTarget as HTMLElement).contains(to)) setDropAt(null)
  }

  const remove = (m: Milestone) => {
    if (confirm(t.confirmRemoveMilestone(titleOf(m)))) onChange((l) => l.filter((x) => x.id !== m.id))
  }

  const apply = (title: string, style: string) => {
    if (editing === 'new') onChange((l) => [...l, { id: newId().slice(0, 8), style, title }])
    else if (editing) onMilestone(editing.id, { title, style })
  }

  const others = list.length - (dragging ? 1 : 0)
  let k = 0 // index among the milestones not being dragged
  return (
    <section class="card">
      <div class="section-head">
        <h2>{t.milestones}</h2>
        {savesAtOnce && <span class="muted">{t.milestonesHint}</span>}
        <button type="button" onClick={() => setEditing('new')}>+ {t.addMilestone}</button>
      </div>
      {error && <p class="error" role="alert">{error}</p>}
      <div ref={grid} class="fields milestones" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        {list.map((m, i) => {
          const name = titleOf(m)
          const isDragged = m.id === dragging
          const n = isDragged ? -1 : k++
          // a line before the milestone the drop lands before, or after the last one for the end
          const drop = n === -1 || dropAt === null ? undefined : n === dropAt ? 'before' : n === others - 1 && dropAt === others ? 'after' : undefined
          const day = (precision[m.id] ?? 'day') === 'day'
          return (
            <fieldset key={m.id} class={isDragged ? 'milestone dragging' : 'milestone'} style={colorOf(m.style)} data-drop={drop}>
              <legend>
                <button
                  type="button"
                  class="handle"
                  draggable
                  data-handle={m.id}
                  aria-label={`${t.moveMilestone}: ${name}`}
                  title={t.moveMilestone}
                  onDragStart={(e) => {
                    e.dataTransfer!.setData('text/plain', m.id)
                    e.dataTransfer!.effectAllowed = 'move'
                    e.dataTransfer!.setDragImage(e.currentTarget.closest('fieldset')!, 12, 12)
                    setDragging(m.id)
                  }}
                  onDragEnd={() => {
                    setDragging(null)
                    setDropAt(null)
                  }}
                  onKeyDown={(e) => onKeyDown(e, i, m.id)}
                >
                  ⠿
                </button>
                <b class="short">{styleOf(m.style).short}</b>
                <span class="name">{name}</span>
                {m.title && <button type="button" class="link" onClick={() => setEditing(m)}>{t.edit}</button>}
                <button type="button" class="link" onClick={() => remove(m)}>{t.remove}</button>
              </legend>
              <input
                type={day ? 'date' : 'month'}
                aria-label={name}
                value={m.date ?? ''}
                onInput={(e) => onMilestone(m.id, { date: e.currentTarget.value }, DATE_DELAY)}
              />
              <select aria-label={`${name}: ${t.day} / ${t.month}`} value={day ? 'day' : 'month'} onChange={(e) => onPrecision(m, e.currentTarget.value as Precision)}>
                <option value="day">{t.day}</option>
                <option value="month">{t.month}</option>
              </select>
              <div class="state">
                <span role="radiogroup" aria-label={`${name}: ${t.planned} / ${t.confirmed}`}>
                  <label class="check">
                    <input type="radio" name={`${m.id}-confirmed`} checked={!m.confirmed} onChange={() => onMilestone(m.id, { confirmed: false })} />
                    {t.planned}
                  </label>
                  <label class="check">
                    <input type="radio" name={`${m.id}-confirmed`} checked={!!m.confirmed} onChange={() => onMilestone(m.id, { confirmed: true })} />
                    {t.confirmed}
                  </label>
                </span>
                <label class="check">
                  <input type="checkbox" checked={!!m.done} onChange={(e) => onMilestone(m.id, { done: e.currentTarget.checked })} />
                  {t.done}
                </label>
              </div>
            </fieldset>
          )
        })}
      </div>
      {editing && (
        <Portal>
          <MilestoneDialog milestone={editing === 'new' ? null : editing} onApply={apply} onClose={() => setEditing(null)} />
        </Portal>
      )}
    </section>
  )
}

type DialogProps = {
  /** null to add a milestone */
  milestone: Milestone | null
  onApply: (title: string, style: string) => void
  onClose: () => void
}

/** Title and style of an added milestone. Rendered outside the project form (see Portal), so Enter never submits the project. */
function MilestoneDialog({ milestone, onApply, onClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [title, setTitle] = useState(milestone?.title ?? '')
  const [style, setStyle] = useState(milestone?.style ?? 'inny')
  const [error, setError] = useState('')

  useEffect(() => ref.current?.showModal(), [])

  function submit(e: Event) {
    e.preventDefault()
    if (!title.trim()) return setError(t.milestoneTitleRequired)
    onApply(title.trim(), style)
    ref.current?.close()
  }

  return (
    <dialog ref={ref} class="task-dialog" onClose={onClose}>
      <form onSubmit={submit}>
        <h2>{milestone ? t.milestone : t.newMilestone}</h2>
        <label>
          {t.milestoneTitle} *
          <input aria-required="true" value={title} onInput={(e) => setTitle(e.currentTarget.value)} />
        </label>
        <label>
          {t.milestoneStyle}
          <select value={style} onChange={(e) => setStyle(e.currentTarget.value)}>
            {STYLES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            {/* a style from a hand-edited file stays selectable instead of silently changing */}
            {!STYLES.some((s) => s.id === style) && <option value={style}>{style}</option>}
          </select>
        </label>
        <div class="dialog-actions">
          {error && <p class="error" role="alert">{error}</p>}
          <button type="button" onClick={() => ref.current?.close()}>{t.cancel}</button>
          <button class="primary" type="submit">{milestone ? t.change : t.add}</button>
        </div>
      </form>
    </dialog>
  )
}
