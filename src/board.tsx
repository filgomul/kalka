import { render, type ComponentChildren } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { formatDate, parseDate, todayIso } from './model.ts'
import { t, taskStatusLabels } from './pl.ts'
import { ConflictError, deleteTask, saveTask, type LoadedTask } from './storage.ts'
import { badgeFor, emptyTask, placeAt, prepareTaskForSave, sortTasks, TASK_STATUSES, taskState, textOn, type Task, type TaskStatus } from './tasks.ts'
import type { Data } from './main.tsx'

type Props = {
  data: Data
  projectId: string
  reloadTasks: () => Promise<void>
}

/** Where a dragged card would land: before the `index`-th other card of the `status` column. */
type DropAt = { status: TaskStatus; index: number }

/** The "Zadania" section of a saved project. Every change is written at once, apart from the project form. */
export function TaskBoard({ data, projectId, reloadTasks }: Props) {
  const today = todayIso()
  const rows = data.tasks.filter((l) => l.task.projectId === projectId)
  const column = (s: TaskStatus) => sortTasks(rows.filter((l) => l.task.status === s))
  const [open, setOpen] = useState<LoadedTask | null>(null)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState<LoadedTask | null>(null)
  const [dropAt, setDropAt] = useState<DropAt | null>(null)

  /** Runs a write; a conflict only shows the message. Tasks are read again either way. */
  async function run(write: () => Promise<unknown>) {
    setError('')
    try {
      await write()
    } catch (e) {
      if (!(e instanceof ConflictError)) throw e
      setError(t.taskConflict)
    } finally {
      await reloadTasks()
    }
  }

  // one file at a time, each with its own check; a conflict stops the rest
  const persist = (list: LoadedTask[]) =>
    run(async () => {
      for (const l of list) await saveTask(data.dir, prepareTaskForSave(l.task), l.file, l.task.updatedAt)
    })

  const failed = (e: unknown) => setError(`${t.saveFailed} ${(e as Error).message}`)

  /** Saves the dialog; a task that changes column (or is new) goes to the bottom of it. */
  async function saveDialog(before: LoadedTask, task: Task) {
    const isNew = !before.file
    const edited = { ...before, file: before.file || `${task.id}.json`, task }
    if (!isNew && before.task.status === task.status) return persist([edited])
    const target = column(task.status).filter((l) => l.file !== before.file)
    return persist(placeAt(target, edited, target.length, task.status))
  }

  async function remove(l: LoadedTask) {
    await run(() => deleteTask(data.dir, l.file, l.task.updatedAt))
  }

  function onDragOver(e: DragEvent, status: TaskStatus) {
    if (!dragging) return
    e.preventDefault()
    // the insertion index among the other cards, from the pointer against each card's middle
    const cards = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('.task:not(.dragging)')]
    const i = cards.findIndex((c) => {
      const r = c.getBoundingClientRect()
      return e.clientY < r.top + r.height / 2
    })
    const index = i === -1 ? cards.length : i
    if (dropAt?.status !== status || dropAt.index !== index) setDropAt({ status, index })
  }

  function onDrop(e: DragEvent, status: TaskStatus) {
    e.preventDefault()
    const moved = dragging
    const at = dropAt
    setDragging(null)
    setDropAt(null)
    if (!moved || !at || at.status !== status) return
    const list = placeAt(column(status), moved, at.index, status)
    if (list.length) persist(list).catch(failed)
  }

  function onDragLeave(e: DragEvent) {
    const to = e.relatedTarget as Node | null
    if (!to || !(e.currentTarget as HTMLElement).contains(to)) setDropAt(null)
  }

  return (
    <section class="card tasks">
      <div class="tasks-head">
        <h2>{t.tasks}</h2>
        <span class="muted">{t.tasksHint}</span>
        <button type="button" onClick={() => setOpen({ task: emptyTask(projectId), file: '', duplicate: false })}>+ {t.addTask}</button>
      </div>
      {error && <p class="error" role="alert">{error}</p>}
      <div class="board">
        {TASK_STATUSES.map((status) => {
          const cards = column(status)
          const target = dropAt?.status === status ? dropAt.index : -1
          const others = cards.filter((l) => l !== dragging).length
          let k = 0 // index among the cards that are not being dragged
          return (
            <div
              key={status}
              class="col"
              data-over={target !== -1 || undefined}
              onDragOver={(e) => onDragOver(e, status)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, status)}
            >
              <h3>{taskStatusLabels[status]} <span class="count">{cards.length}</span></h3>
              {cards.map((l) => {
                const isDragged = l === dragging
                const n = isDragged ? -1 : k++
                // a line above the card the drop lands before, or below the last card for the bottom
                const drop = n === -1 ? undefined : n === target ? 'before' : n === others - 1 && target === others ? 'after' : undefined
                return (
                  <Card
                    key={l.file}
                    loaded={l}
                    data={data}
                    today={today}
                    drop={drop}
                    dragged={isDragged}
                    onOpen={() => setOpen(l)}
                    onDragStart={() => setDragging(l)}
                    onDragEnd={() => {
                      setDragging(null)
                      setDropAt(null)
                    }}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
      {open && (
        <Portal>
          <TaskDialog
            key={open.file || open.task.id}
            loaded={open}
            architects={data.settings.architects}
            onSave={(task) => saveDialog(open, task)}
            onRemove={() => remove(open)}
            // the close event comes a moment later; it must not close a dialog opened since
            onClose={() => setOpen((o) => (o === open ? null : o))}
          />
        </Portal>
      )}
    </section>
  )
}

type CardProps = {
  loaded: LoadedTask
  data: Data
  today: string
  drop?: 'before' | 'after'
  dragged: boolean
  onOpen: () => void
  onDragStart: () => void
  onDragEnd: () => void
}

function Card({ loaded: { task, file, duplicate }, data, today, drop, dragged, onOpen, onDragStart, onDragEnd }: CardProps) {
  const late = taskState(task, today) === 'overdue'
  const badge = task.assignee ? badgeFor(data.settings.badges, task.assignee) : null
  return (
    <button
      type="button"
      class={dragged ? 'task dragging' : 'task'}
      draggable
      data-drop={drop}
      onClick={onOpen}
      onDragStart={(e) => {
        e.dataTransfer!.setData('text/plain', file)
        e.dataTransfer!.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
    >
      <span class="task-title">{task.title}</span>
      {duplicate && <span class="badge">{t.syncConflict}: {file}</span>}
      {(task.due || badge) && (
        <span class="task-foot">
          <span class={late ? 'date late' : 'date'}>
            {formatDate(task.due)}
            {late && <> · {t.overdue}</>}
          </span>
          {badge && (
            <span class="avatar" style={{ background: badge.color, color: textOn(badge.color) }} title={task.assignee}>
              {badge.initials}
            </span>
          )}
        </span>
      )}
    </button>
  )
}

type DialogProps = {
  loaded: LoadedTask
  architects: string[]
  onSave: (task: Task) => Promise<void>
  onRemove: () => Promise<void>
  onClose: () => void
}

type Precision = 'day' | 'month'

function TaskDialog({ loaded, architects, onSave, onRemove, onClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState<Task>(loaded.task)
  const [precision, setPrecision] = useState<Precision>(parseDate(loaded.task.due)?.precision ?? 'day')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isNew = !loaded.file
  const set = (patch: Partial<Task>) => setDraft((d) => ({ ...d, ...patch }))
  const options = draft.assignee && !architects.includes(draft.assignee) ? [...architects, draft.assignee] : architects

  useEffect(() => ref.current?.showModal(), [])

  async function act(e: Event | null, action: () => Promise<void>) {
    e?.preventDefault()
    setBusy(true)
    setError('')
    try {
      await action()
      ref.current?.close()
    } catch (err) {
      setError(`${t.saveFailed} ${(err as Error).message}`)
      setBusy(false)
    }
  }

  const save = (e: Event) => {
    if (!draft.title.trim()) {
      e.preventDefault()
      return setError(t.taskTitleRequired)
    }
    act(e, () => onSave(draft))
  }

  const remove = () => {
    if (confirm(t.confirmRemove(loaded.task.title))) act(null, onRemove)
  }

  return (
    <dialog ref={ref} class="task-dialog" onClose={onClose}>
      <form onSubmit={save}>
        <h2>{isNew ? t.newTask : t.task}</h2>
        <label>
          {t.taskTitle} *
          <input aria-required="true" value={draft.title} onInput={(e) => set({ title: e.currentTarget.value })} />
        </label>
        <label>
          {t.description}
          <textarea rows={4} value={draft.description} onInput={(e) => set({ description: e.currentTarget.value })} />
        </label>
        <div class="dialog-row">
          <fieldset class="milestone">
            <legend>{t.due}</legend>
            <input
              type={precision === 'day' ? 'date' : 'month'}
              aria-label={t.due}
              value={draft.due ?? ''}
              onInput={(e) => set({ due: e.currentTarget.value })}
            />
            <select
              aria-label={`${t.due}: ${t.day} / ${t.month}`}
              value={precision}
              onChange={(e) => {
                const to = e.currentTarget.value as Precision
                setPrecision(to)
                // a month keeps its year and month; a day can't be guessed from a month
                set({ due: to === 'month' ? (draft.due ?? '').slice(0, 7) : '' })
              }}
            >
              <option value="day">{t.day}</option>
              <option value="month">{t.month}</option>
            </select>
          </fieldset>
          <label>
            {t.assignee}
            <select value={draft.assignee} onChange={(e) => set({ assignee: e.currentTarget.value })}>
              <option value=""></option>
              {options.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label>
            {t.taskState}
            <select value={draft.status} onChange={(e) => set({ status: e.currentTarget.value as TaskStatus })}>
              {TASK_STATUSES.map((s) => <option key={s} value={s}>{taskStatusLabels[s]}</option>)}
            </select>
          </label>
        </div>
        {architects.length === 0 && <small class="hint">{t.noArchitects}</small>}
        <div class="dialog-actions">
          {error && <p class="error" role="alert">{error}</p>}
          {!isNew && <button type="button" class="danger" disabled={busy} onClick={remove}>{t.remove}</button>}
          <button type="button" onClick={() => ref.current?.close()}>{t.cancel}</button>
          <button class="primary" type="submit" disabled={busy}>{busy ? t.saving : t.save}</button>
        </div>
      </form>
    </dialog>
  )
}

/** Renders `children` into a div on <body>, so the dialog's form is not nested in the project form. */
function Portal({ children }: { children: ComponentChildren }) {
  const [el] = useState(() => document.createElement('div'))
  useEffect(() => {
    document.body.append(el)
    return () => {
      render(null, el)
      el.remove()
    }
  }, [])
  useEffect(() => render(children, el))
  return null
}
