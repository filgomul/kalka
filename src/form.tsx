import { useEffect, useRef, useState } from 'preact/hooks'
import { BRANCHES, emptyProject, fromTemplate, moveMilestone, newId, nextLp, parseDate, prepareForSave, STATUSES, STYLES, titleOf, type Milestone, type Project } from './model.ts'
import { branchLabels, statusLabels, t } from './pl.ts'
import { ConflictError, saveProject, type Loaded } from './storage.ts'
import type { Data } from './main.tsx'
import { Portal, TaskBoard } from './board.tsx'

type Props = {
  data: Data
  /** null for a new project */
  loaded: Loaded | null
  /** template id that seeds a new project's milestones; ignored for a saved one */
  template?: string | null
  onSaved: () => Promise<void>
  onCancel: () => void
  /** reads the task files again after a task change */
  reloadTasks: () => Promise<void>
}

type Precision = 'day' | 'month'

export function ProjectForm({ data, loaded, template, onSaved, onCancel, reloadTasks }: Props) {
  const [draft, setDraft] = useState<Project>(
    () => loaded?.project ?? { ...emptyProject(), lp: nextLp(data.projects.map((l) => l.project)), timeline: fromTemplate(template) },
  )
  /** day or month per milestone id; a milestone without an entry is a day */
  const [precision, setPrecision] = useState<Record<string, Precision>>(
    () => Object.fromEntries(draft.timeline.map((m) => [m.id, parseDate(m.date)?.precision ?? 'day'])),
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (patch: Partial<Project>) => setDraft((d) => ({ ...d, ...patch }))
  const setTimeline = (change: (list: Milestone[]) => Milestone[]) => setDraft((d) => ({ ...d, timeline: change(d.timeline) }))
  const setMilestone = (id: string, patch: Partial<Milestone>) => setTimeline((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  const switchPrecision = (m: Milestone, to: Precision) => {
    setPrecision((p) => ({ ...p, [m.id]: to }))
    // a month keeps its year and month; a day can't be guessed from a month
    setMilestone(m.id, { date: to === 'month' ? (m.date ?? '').slice(0, 7) : '' })
  }

  const listed = data.settings.architects
  const architects = draft.leadArchitect && !listed.includes(draft.leadArchitect) ? [...listed, draft.leadArchitect] : listed

  async function save(e: Event) {
    e.preventDefault()
    if (!draft.title.trim()) return setError(t.titleRequired)
    setSaving(true)
    setError('')
    try {
      const file = loaded?.file ?? `${draft.id}.json`
      await saveProject(data.dir, prepareForSave(draft), file, loaded?.project.updatedAt ?? '')
      await onSaved()
    } catch (err) {
      setError(err instanceof ConflictError ? t.conflict : `${t.saveFailed} ${(err as Error).message}`)
      setSaving(false)
    }
  }

  return (
    <main>
      <form onSubmit={save}>
        <div class="heading">
          <a class="back" href="#/" onClick={(e) => { e.preventDefault(); onCancel() }}>← {t.back}</a>
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
        />

        {loaded && <TaskBoard data={data} projectId={loaded.project.id} reloadTasks={reloadTasks} />}

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
          <button type="button" onClick={onCancel}>{t.cancel}</button>
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
  onMilestone: (id: string, patch: Partial<Milestone>) => void
  onPrecision: (m: Milestone, to: Precision) => void
}

/** The project's milestones in order: dates and marks, add, edit, delete and reorder. All of it changes only the draft. */
function Timeline({ list, precision, onChange, onMilestone, onPrecision }: TimelineProps) {
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
        <button type="button" onClick={() => setEditing('new')}>+ {t.addMilestone}</button>
      </div>
      <div ref={grid} class="fields milestones" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        {list.map((m, i) => {
          const name = titleOf(m)
          const isDragged = m.id === dragging
          const n = isDragged ? -1 : k++
          // a line before the milestone the drop lands before, or after the last one for the end
          const drop = n === -1 || dropAt === null ? undefined : n === dropAt ? 'before' : n === others - 1 && dropAt === others ? 'after' : undefined
          const day = (precision[m.id] ?? 'day') === 'day'
          return (
            <fieldset key={m.id} class={isDragged ? 'milestone dragging' : 'milestone'} data-drop={drop}>
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
                <span class="name">{name}</span>
                {m.title && <button type="button" class="link" onClick={() => setEditing(m)}>{t.edit}</button>}
                <button type="button" class="link" onClick={() => remove(m)}>{t.remove}</button>
              </legend>
              <input
                type={day ? 'date' : 'month'}
                aria-label={name}
                value={m.date ?? ''}
                onInput={(e) => onMilestone(m.id, { date: e.currentTarget.value })}
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
