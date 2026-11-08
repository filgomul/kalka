import { useEffect, useId, useRef, useState } from 'preact/hooks'
import { architectOptions, todayIso, type Project } from './model.ts'
import {
  emptyMeeting,
  endChoices,
  filterMeetings,
  parseTime,
  startChoices,
  withStart,
  formatWhen,
  initialView,
  MEETING_TYPES,
  meetingError,
  prepareMeetingForSave,
  projectIdOf,
  splitMeetings,
  type Meeting,
  type MeetingType,
} from './meetings.ts'
import { badgeFor, textOn } from './tasks.ts'
import { projectChoices } from './calendar.ts'
import { meetingTypeLabels, t } from './pl.ts'
import { ConflictError, deleteMeeting, saveMeeting, type LoadedMeeting } from './storage.ts'
import { withParam, type ViewProps } from './calendar-view.tsx'
import { Portal } from './board.tsx'
import type { Data } from './main.tsx'

export type MeetingProps = ViewProps & { reloadMeetings: () => Promise<void> }

const projectIds = (data: Data) => new Set(data.projects.map((l) => l.project.id))

/** Title of the meeting's project, or '' without one. */
export function projectTitleOf(data: Data, m: Meeting): string {
  const id = projectIdOf(m, projectIds(data))
  const l = id ? data.projects.find((p) => p.project.id === id) : undefined
  return l ? l.project.title || l.file : ''
}

/** "@" for online, a small building for stacjonarne, each in its own colour. */
export function TypeMark({ type }: { type: MeetingType }) {
  const label = meetingTypeLabels[type]
  return (
    <span class="type-mark" data-type={type} role="img" aria-label={label} title={label}>
      {type === 'online' ? '@' : (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
          <rect x="3" y="1.5" width="10" height="13" rx="1" />
          <path d="M6 4.5h1M9 4.5h1M6 7.5h1M9 7.5h1M6 10.5h1M9 10.5h1M7 14.5v-2h2v2" />
        </svg>
      )}
    </span>
  )
}

/** The architect's initials in their colour; nothing without an architect. */
export function Avatar({ data, name }: { data: Data; name: string }) {
  if (!name) return null
  const b = badgeFor(data.settings.badges, name)
  return <span class="avatar" style={{ background: b.color, color: textOn(b.color) }} title={name}>{b.initials}</span>
}

/**
 * Open-meeting state, writes and the conflict message, shared by the tab, the project page
 * and the calendar. The dialog goes through a portal, so it also works inside the project form.
 */
export function useMeetingEdit(data: Data, reloadMeetings: () => Promise<void>) {
  const [open, setOpen] = useState<LoadedMeeting | null>(null)
  const [error, setError] = useState('')

  /** Runs a write; a conflict only shows the message. Meetings are read again either way. */
  async function run(write: () => Promise<unknown>) {
    setError('')
    try {
      await write()
    } catch (e) {
      if (!(e instanceof ConflictError)) throw e
      setError(t.meetingConflict)
    } finally {
      await reloadMeetings()
    }
  }

  return {
    error,
    edit: setOpen,
    add: (projectId = '', architect = '') => setOpen({ meeting: emptyMeeting(projectId, architect), file: '', duplicate: false }),
    dialog: open && (
      <Portal>
        <MeetingDialog
          key={open.file || open.meeting.id}
          loaded={open}
          data={data}
          onSave={(m) => run(() => saveMeeting(data.dir, prepareMeetingForSave(m), open.file || `${m.id}.json`, open.meeting.updatedAt))}
          onRemove={() => run(() => deleteMeeting(data.dir, open.file, open.meeting.updatedAt))}
          // the close event comes a moment later; it must not close a dialog opened since
          onClose={() => setOpen((o) => (o === open ? null : o))}
        />
      </Portal>
    ),
  }
}

type DialogProps = {
  loaded: LoadedMeeting
  data: Data
  onSave: (m: Meeting) => Promise<void>
  onRemove: () => Promise<void>
  onClose: () => void
}

function MeetingDialog({ loaded, data, onSave, onRemove, onClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  // a project that is gone shows (and is saved) as no project
  const [draft, setDraft] = useState<Meeting>(() => ({ ...loaded.meeting, projectId: projectIdOf(loaded.meeting, projectIds(data)) }))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<Meeting>) => setDraft((d) => ({ ...d, ...patch }))
  const architects = data.settings.architects
  const options = draft.architect && !architects.includes(draft.architect) ? [...architects, draft.architect] : architects
  // the choice stores the project's id; sync conflict copies sharing an id are offered once
  const idOf = new Map(data.projects.map((l) => [l.file, l.project.id]))
  const seen = new Set<string>()
  const projects = projectChoices(data.projects).flatMap((c) => {
    const id = idOf.get(c.file)!
    if (seen.has(id)) return []
    seen.add(id)
    return [{ id, label: c.label }]
  })

  useEffect(() => ref.current?.showModal(), [])

  async function act(action: () => Promise<void>) {
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

  function save(e: Event) {
    e.preventDefault()
    const invalid = meetingError(draft)
    if (invalid) return setError(invalid)
    act(() => onSave(draft))
  }

  return (
    <dialog ref={ref} class="task-dialog" onClose={onClose}>
      <form onSubmit={save} noValidate>
        <h2>{loaded.file ? t.meeting : t.newMeeting}</h2>
        <label>
          {t.meetingTitle} *
          <input aria-required="true" value={draft.title} onInput={(e) => set({ title: e.currentTarget.value })} />
        </label>
        <div class="dialog-row">
          <label>
            {t.meetingDate} *
            <input type="date" aria-required="true" value={draft.date} onInput={(e) => set({ date: e.currentTarget.value })} />
          </label>
          <TimeField label={t.from} value={draft.start ?? ''} choices={startChoices()} onPick={(start) => setDraft((d) => ({ ...d, ...withStart(d, start) }))} />
          <TimeField label={t.to} value={draft.end ?? ''} choices={draft.start ? endChoices(draft.start) : []} disabled={!draft.start} onPick={(end) => set({ end })} />
        </div>
        <div class="dialog-row">
          <label>
            {t.architect}
            <select value={draft.architect} onChange={(e) => set({ architect: e.currentTarget.value })}>
              <option value=""></option>
              {options.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label>
            {t.colProject}
            <select value={draft.projectId ?? ''} onChange={(e) => set({ projectId: e.currentTarget.value })}>
              <option value="">{t.noProject}</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </label>
          <label>
            {t.meetingType}
            <select value={draft.type} onChange={(e) => set({ type: e.currentTarget.value as MeetingType })}>
              {MEETING_TYPES.map((k) => <option key={k} value={k}>{meetingTypeLabels[k]}</option>)}
            </select>
          </label>
        </div>
        {architects.length === 0 && <small class="hint">{t.noArchitects}</small>}
        <label>
          {t.meetingNote}
          <textarea rows={5} value={draft.note} onInput={(e) => set({ note: e.currentTarget.value })} />
        </label>
        <div class="dialog-actions">
          {error && <p class="error" role="alert">{error}</p>}
          {loaded.file && (
            <button type="button" class="danger" disabled={busy} onClick={() => confirm(t.confirmRemoveMeeting(loaded.meeting.title)) && act(onRemove)}>
              {t.remove}
            </button>
          )}
          <button type="button" onClick={() => ref.current?.close()}>{t.cancel}</button>
          <button class="primary" type="submit" disabled={busy}>{busy ? t.saving : t.save}</button>
        </div>
      </form>
    </dialog>
  )
}

type TimeFieldProps = {
  label: string
  /** `HH:MM` or '' */
  value: string
  choices: { time: string; note?: string }[]
  disabled?: boolean
  /** a picked or typed time, or '' when the field was cleared */
  onPick: (time: string) => void
}

/**
 * A time typed freely ("930", "9.30") or picked from a list under the field. The list is a
 * popover anchored to the input, so it draws above the dialog instead of making it scroll.
 */
function TimeField({ label, value, choices, disabled, onPick }: TimeFieldProps) {
  const id = useId()
  const anchor = '--time-' + id.replace(/[^\w-]/g, '')
  const list = useRef<HTMLUListElement>(null)
  const [text, setText] = useState(value)
  const [open, setOpen] = useState(false)
  // the highlighted entry; while not moving with the arrows, the current value
  const [active, setActive] = useState(-1)

  useEffect(() => setText(value), [value])
  useEffect(() => {
    const el = list.current
    if (!el) return
    if (open && choices.length) {
      if (!el.matches(':popover-open')) el.showPopover()
      el.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
    } else if (el.matches(':popover-open')) el.hidePopover()
  })

  function show() {
    setActive(choices.findIndex((c) => c.time === value))
    setOpen(true)
  }

  function pick(time: string) {
    setText(time)
    setOpen(false)
    onPick(time)
  }

  /** On leaving the field or Enter: an empty field clears, unreadable text goes back to the value. */
  function commit() {
    setOpen(false)
    if (!text.trim()) return value && onPick('')
    const time = parseTime(text)
    if (time) {
      setText(time)
      if (time !== value) onPick(time)
    } else setText(value)
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return show()
      const next = Math.min(choices.length - 1, Math.max(0, active + (e.key === 'ArrowDown' ? 1 : -1)))
      setActive(next)
      setText(choices[next]?.time ?? text)
    } else if (e.key === 'Enter') {
      // Enter picks; it doesn't submit the dialog's form
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape' && open) {
      // closes only the list, not the dialog
      e.preventDefault()
      e.stopPropagation()
      setText(value)
      setOpen(false)
    }
  }

  // the list sits outside the label: a click inside a label would also click the input and reopen the list
  return (
    <>
      <label>
        {label}
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={id}
          autocomplete="off"
          placeholder="--:--"
          style={`anchor-name: ${anchor}`}
          class="time-input"
          value={text}
          disabled={disabled}
          onFocus={show}
          onClick={() => !open && show()}
          onInput={(e) => {
            setText(e.currentTarget.value)
            setOpen(true)
          }}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
      </label>
      <ul ref={list} id={id} role="listbox" popover="manual" class="time-list" style={`position-anchor: ${anchor}`} aria-label={label}>
        {choices.map((c, i) => (
          // mousedown, not click: the input keeps focus, so its blur doesn't run first
          <li key={c.time} role="option" aria-selected={i === active} onMouseDown={(e) => { e.preventDefault(); pick(c.time) }}>
            {c.time}
            {c.note && <small>{c.note}</small>}
          </li>
        ))}
      </ul>
    </>
  )
}

type ListProps = {
  data: Data
  current: LoadedMeeting[]
  past: LoadedMeeting[]
  onOpen: (l: LoadedMeeting) => void
}

/** The two sections as one-line rows; `withProject` adds the project column second (the tab). */
function MeetingTable({ data, current, past, onOpen, withProject }: ListProps & { withProject?: boolean }) {
  const cols = withProject ? 6 : 5
  const section = (title: string, rows: LoadedMeeting[]) => (
    <tbody>
      <tr class="group"><th colSpan={cols}>{title}</th></tr>
      {rows.map((l) => (
        <tr key={l.file} class="meeting-row" onClick={() => onOpen(l)}>
          <td class="when">{formatWhen(l.meeting)}</td>
          {withProject && <td class="project">{projectTitleOf(data, l.meeting)}</td>}
          <td class="title">
            <button type="button" class="link">{l.meeting.title}</button>
            {l.duplicate && <span class="badge">{t.syncConflict}: {l.file}</span>}
          </td>
          <td class="who">
            <Avatar data={data} name={l.meeting.architect} />
            {l.meeting.architect}
          </td>
          <td><TypeMark type={l.meeting.type} /></td>
          <td class="note">{l.meeting.note}</td>
        </tr>
      ))}
    </tbody>
  )
  return (
    <div class="table">
      <table class="meetings">
        <thead>
          <tr>
            <th>{t.colDate}</th>
            {withProject && <th>{t.colProject}</th>}
            <th>{t.meetingTitle}</th>
            <th>{t.architect}</th>
            <th>{t.colType}</th>
            <th>{t.colNote}</th>
          </tr>
        </thead>
        {section(t.leavesCurrent, current)}
        {current.length === 0 && <tbody><tr><td colSpan={cols} class="muted">{t.noMeetings}</td></tr></tbody>}
        {past.length > 0 && section(t.leavesPast, past)}
      </table>
    </div>
  )
}

/** The two sections as cards, three per row on a wide window. */
function MeetingCards({ data, current, past, onOpen }: ListProps) {
  const section = (title: string, rows: LoadedMeeting[]) => (
    <>
      <h3 class="meeting-group">{title}</h3>
      {rows.length > 0 && (
        <div class="meeting-cards">
          {rows.map(({ meeting: m, file, duplicate }, i) => (
            <button key={file} type="button" class="task meeting-card" onClick={() => onOpen(rows[i])}>
              <span class="meeting-head">
                <span class="task-title">{m.title}</span>
                <TypeMark type={m.type} />
              </span>
              {duplicate && <span class="badge">{t.syncConflict}: {file}</span>}
              {m.note && <span class="meeting-note">{m.note}</span>}
              <span class="task-foot">
                <span class="date">{formatWhen(m)}</span>
                <Avatar data={data} name={m.architect} />
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  )
  return (
    <>
      {section(t.leavesCurrent, current)}
      {current.length === 0 && <p class="muted">{t.noMeetings}</p>}
      {past.length > 0 && section(t.leavesPast, past)}
    </>
  )
}

/** The "Spotkania" section of a saved project. Every change is written at once, apart from the project form. */
export function MeetingsSection({ data, project, reloadMeetings }: { data: Data; project: Project; reloadMeetings: () => Promise<void> }) {
  const ids = projectIds(data)
  const rows = data.meetings.filter((l) => projectIdOf(l.meeting, ids) === project.id)
  const [view, setView] = useState(() => initialView(rows.length))
  const edit = useMeetingEdit(data, reloadMeetings)
  const { current, past } = splitMeetings(rows, todayIso())
  const list = { data, current, past, onOpen: edit.edit }

  return (
    <section class="card meetings">
      <div class="section-head">
        <h2>{t.meetings}</h2>
        <span class="muted">{t.meetingsHint}</span>
        <div class="seg" role="group">
          <button type="button" aria-pressed={view === 'cards'} onClick={() => setView('cards')}>{t.viewCards}</button>
          <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>{t.viewList}</button>
        </div>
        <button type="button" onClick={() => edit.add(project.id, project.leadArchitect)}>+ {t.addMeeting}</button>
      </div>
      {edit.error && <p class="error" role="alert">{edit.error}</p>}
      {view === 'cards' ? <MeetingCards {...list} /> : <MeetingTable {...list} />}
      {edit.dialog}
    </section>
  )
}

/** The "Spotkania" tab: every meeting, filtered by architect and by having a project. */
export function MeetingsView({ data, params, onParams, reloadMeetings }: MeetingProps) {
  const architect = params.get('a') ?? ''
  const withProject = params.get('j') ?? ''
  const { current, past } = splitMeetings(filterMeetings(data.meetings, { architect, withProject }, projectIds(data)), todayIso())
  const architects = architectOptions(data.settings.architects, data.meetings.map((l) => l.meeting.architect))
  const edit = useMeetingEdit(data, reloadMeetings)
  const set = (key: string) => (e: { currentTarget: HTMLSelectElement }) => onParams(withParam(params, key, e.currentTarget.value))

  return (
    <main>
      <div class="heading">
        <h1>{t.meetings} <span class="count">{current.length + past.length}</span></h1>
        <button type="button" class="primary" onClick={() => edit.add()}>+ {t.addMeeting}</button>
      </div>

      <div class="toolbar">
        <label>
          {t.architectFilter}
          <select value={architect} onChange={set('a')}>
            <option value="">{t.allArchitects}</option>
            {architects.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label>
          {t.filterProject}
          <select value={withProject} onChange={set('j')}>
            <option value="">{t.allMeetings}</option>
            <option value="z">{t.withProject}</option>
            <option value="bez">{t.withoutProject}</option>
          </select>
        </label>
      </div>

      {edit.error && <p class="error" role="alert">{edit.error}</p>}
      <MeetingTable data={data} current={current} past={past} onOpen={edit.edit} withProject />
      {edit.dialog}
    </main>
  )
}
