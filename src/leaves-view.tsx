import { useEffect, useRef, useState } from 'preact/hooks'
import { architectOptions, formatDate, todayIso } from './model.ts'
import { emptyLeave, formatRange, isOngoing, leaveError, pickDay, splitLeaves, type Leave, type Pick } from './leaves.ts'
import { addMonths, monthGrid } from './calendar.ts'
import { badgeFor } from './tasks.ts'
import { months, t, weekdays } from './pl.ts'
import { ConflictError, deleteLeave, saveLeave, type LoadedLeave } from './storage.ts'
import { withParam, type ViewProps } from './calendar-view.tsx'
import type { Data } from './main.tsx'

export type LeaveProps = ViewProps & { reloadLeaves: () => Promise<void> }

/** Inline style giving an element its architect's colour (`--c`); CSS derives the tint like a milestone's. */
export const leaveColor = (data: Data, name: string) => `--c: ${badgeFor(data.settings.badges, name).color}`

/**
 * Open-leave state, writes and the conflict message, shared by the "Urlopy" tab and the calendar.
 * `removeInDialog` puts "Usuń" in the dialog (the calendar has no row buttons).
 */
export function useLeaveEdit(data: Data, reloadLeaves: () => Promise<void>, removeInDialog: boolean) {
  const [open, setOpen] = useState<LoadedLeave | null>(null)
  const [error, setError] = useState('')

  /** Runs a write; a conflict only shows the message. Leaves are read again either way. */
  async function run(write: () => Promise<unknown>) {
    setError('')
    try {
      await write()
    } catch (e) {
      if (!(e instanceof ConflictError)) throw e
      setError(t.leaveConflict)
    } finally {
      await reloadLeaves()
    }
  }

  const save = (before: LoadedLeave, leave: Leave) => run(() => saveLeave(data.dir, leave, before.file || `${leave.id}.json`, before.leave.updatedAt))
  const remove = (l: LoadedLeave) => run(() => deleteLeave(data.dir, l.file, l.leave.updatedAt))
  const confirmed = (l: LoadedLeave) => confirm(t.confirmRemoveLeave(l.leave.architect, formatRange(l.leave)))

  return {
    error,
    edit: setOpen,
    add: () => setOpen({ leave: emptyLeave(), file: '', duplicate: false }),
    /** The row button's delete, after the confirm box. */
    askRemove: (l: LoadedLeave) => {
      if (confirmed(l)) remove(l).catch((e) => setError(`${t.saveFailed} ${(e as Error).message}`))
    },
    dialog: open && (
      <LeaveDialog
        key={open.file || open.leave.id}
        loaded={open}
        architects={data.settings.architects}
        onSave={(leave) => save(open, leave)}
        onRemove={removeInDialog && open.file ? () => (confirmed(open) ? remove(open).then(() => true) : Promise.resolve(false)) : undefined}
        onClose={() => setOpen((o) => (o === open ? null : o))}
      />
    ),
  }
}

type DialogProps = {
  loaded: LoadedLeave
  architects: string[]
  onSave: (leave: Leave) => Promise<void>
  /** resolves false when the user declined the confirm box */
  onRemove?: () => Promise<boolean>
  onClose: () => void
}

function LeaveDialog({ loaded, architects, onSave, onRemove, onClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState<Leave>(loaded.leave)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<Leave>) => setDraft((d) => ({ ...d, ...patch }))
  const options = draft.architect && !architects.includes(draft.architect) ? [...architects, draft.architect] : architects

  useEffect(() => ref.current?.showModal(), [])

  async function act(action: () => Promise<unknown>) {
    setBusy(true)
    setError('')
    try {
      if ((await action()) !== false) ref.current?.close()
    } catch (err) {
      setError(`${t.saveFailed} ${(err as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  function save(e: Event) {
    e.preventDefault()
    const invalid = leaveError(draft)
    if (invalid) return setError(invalid)
    act(() => onSave(draft))
  }

  return (
    <dialog ref={ref} class="task-dialog" onClose={onClose}>
      <form onSubmit={save} noValidate>
        <h2>{loaded.file ? t.leave : t.newLeave}</h2>
        <label>
          {t.architect} *
          <select aria-required="true" value={draft.architect} onChange={(e) => set({ architect: e.currentTarget.value })}>
            <option value=""></option>
            {options.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        {architects.length === 0 && <small class="hint">{t.noArchitects}</small>}
        <fieldset class="range">
          <legend>{t.leaveDates} *</legend>
          <RangePicker from={draft.from} to={draft.to} onPick={(from, to) => set({ from, to })} />
        </fieldset>
        <div class="dialog-actions">
          {error && <p class="error" role="alert">{error}</p>}
          {onRemove && <button type="button" class="danger" disabled={busy} onClick={() => act(onRemove)}>{t.remove}</button>}
          <button type="button" onClick={() => ref.current?.close()}>{t.cancel}</button>
          <button class="primary" type="submit" disabled={busy}>{busy ? t.saving : t.save}</button>
        </div>
      </form>
    </dialog>
  )
}

/** The "Urlopy" tab: current and upcoming leaves, then past ones, filtered by the architect on leave. */
export function LeavesView({ data, params, onParams, reloadLeaves }: LeaveProps) {
  const today = todayIso()
  const architect = params.get('a') ?? ''
  const { current, past } = splitLeaves(data.leaves.filter((l) => !architect || l.leave.architect === architect), today)
  const architects = architectOptions(data.settings.architects, data.leaves.map((l) => l.leave.architect))
  const edit = useLeaveEdit(data, reloadLeaves, false)

  const section = (title: string, rows: LoadedLeave[]) => (
    <tbody>
      <tr class="group"><th colSpan={3}>{title}</th></tr>
      {rows.map((l) => (
        <tr key={l.file} class="leave-row" style={leaveColor(data, l.leave.architect)}>
          <td class="who">
            {l.leave.architect}
            {l.duplicate && <span class="badge">{t.syncConflict}: {l.file}</span>}
          </td>
          <td class="when">
            {formatRange(l.leave)}
            {isOngoing(l.leave, today) && <span class="ongoing">{t.ongoing}</span>}
          </td>
          <td class="row-actions">
            <button type="button" class="link" onClick={() => edit.edit(l)}>{t.edit}</button>
            <button type="button" class="link danger" onClick={() => edit.askRemove(l)}>{t.remove}</button>
          </td>
        </tr>
      ))}
    </tbody>
  )

  return (
    <main>
      <div class="heading">
        <h1>{t.leaves} <span class="count">{current.length + past.length}</span></h1>
        <button type="button" class="primary" onClick={edit.add}>+ {t.addLeave}</button>
      </div>

      <div class="toolbar">
        <label>
          {t.architectFilter}
          <select value={architect} onChange={(e) => onParams(withParam(params, 'a', e.currentTarget.value))}>
            <option value="">{t.allArchitects}</option>
            {architects.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </div>

      {edit.error && <p class="error" role="alert">{edit.error}</p>}

      <div class="table">
        <table class="leaves">
          <thead>
            <tr>
              <th>{t.architect}</th>
              <th>{t.colDates}</th>
              <th></th>
            </tr>
          </thead>
          {section(t.leavesCurrent, current)}
          {current.length === 0 && (
            <tbody><tr><td colSpan={3} class="muted">{t.noLeaves}</td></tr></tbody>
          )}
          {past.length > 0 && section(t.leavesPast, past)}
        </table>
      </div>
      {edit.dialog}
    </main>
  )
}

/** One month of day buttons for picking a leave: first click the first day, then the last one. */
function RangePicker({ from, to, onPick }: { from: string; to: string; onPick: (from: string, to: string) => void }) {
  const today = todayIso()
  const [month, setMonth] = useState((from || today).slice(0, 7))
  const [picking, setPicking] = useState(false)
  // while waiting for the last day, the range follows the pointer
  const [hover, setHover] = useState('')
  const end = picking && hover >= from ? hover : to

  function click(day: string) {
    const next: Pick = pickDay({ from, to, picking }, day)
    setPicking(next.picking)
    onPick(next.from, next.to)
  }

  const hint = picking ? t.pickLastDay : from ? '' : t.pickFirstDay
  return (
    <div class="range-picker" onMouseLeave={() => setHover('')}>
      <div class="range-head">
        <button type="button" class="link" aria-label={t.prevMonth} onClick={() => setMonth(addMonths(month, -1))}>‹</button>
        <span>{months[+month.slice(5) - 1]} {month.slice(0, 4)}</span>
        <button type="button" class="link" aria-label={t.nextMonth} onClick={() => setMonth(addMonths(month, 1))}>›</button>
      </div>
      <div class="range-grid">
        {weekdays.map((d) => <span key={d} class="dow">{d}</span>)}
        {monthGrid(month).flat().map((day) => {
          const inRange = !!from && day >= from && day <= end
          const cls = [day.slice(0, 7) !== month && 'out', inRange && 'in', day === from && 'start', day === end && 'end', day === today && 'today'].filter(Boolean).join(' ')
          return (
            <button key={day} type="button" class={cls} aria-label={formatDate(day)} aria-pressed={inRange} onClick={() => click(day)} onMouseEnter={() => setHover(day)}>
              {+day.slice(8)}
            </button>
          )
        })}
      </div>
      <p class="range-sum">
        {from ? formatRange({ ...emptyLeave(), from, to: end }) : ''}
        {hint && <span class="muted">{hint}</span>}
      </p>
    </div>
  )
}
