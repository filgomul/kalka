import { useEffect, useRef, useState } from 'preact/hooks'
import { architectOptions, formatDate, STATUSES, todayIso } from './model.ts'
import { badgeFor, byDue, CHEER_EVERY, emptyTask, CHEER_MS, doneThisWeek, filterTaskRows, splitDone, TASK_STATUSES, taskState, textOn, type TaskStatus } from './tasks.ts'
import { cheers, statusLabels, t, taskStatusLabels } from './pl.ts'
import { projectHref, withParam, type ViewProps } from './calendar-view.tsx'
import { useTaskEdit } from './board.tsx'
import type { Loaded as LoadedProject, LoadedTask } from './storage.ts'
import type { Data } from './main.tsx'

/** The architect choice for tasks without an assignee; stored as `n=1`, not in `a`, so it stays on this tab. */
const UNASSIGNED = '#nieprzypisane'

/** The "Zadania" tab: tasks of all projects by state, ordered by due date. */
export function TasksView({ data, params, onParams, reloadTasks }: ViewProps & { reloadTasks: () => Promise<void> }) {
  const today = todayIso()
  const architect = params.get('a') ?? ''
  const unassigned = params.get('n') === '1'
  const status = params.get('s') ?? ''
  const withProject = params.get('j') ?? ''
  // the first file of an id stands for the project (sync conflict copies share it)
  const projects = new Map<string, LoadedProject>()
  for (const l of data.projects) if (!projects.has(l.project.id)) projects.set(l.project.id, l)
  const projectOf = (l: LoadedTask) => projects.get(l.task.projectId)
  const edit = useTaskEdit(data, reloadTasks, {
    pickProject: true,
    linkTo: (l) => {
      const p = projectOf(l)
      return p ? { href: projectHref(p.file, params, 'zadania'), label: p.project.title || p.file } : null
    },
  })
  const [dragging, setDragging] = useState<LoadedTask | null>(null)
  const [over, setOver] = useState<TaskStatus | null>(null)
  const [showOlder, setShowOlder] = useState(false)
  // the task just marked done gets its stamp landing; every third one marked done since the tab opened, a cheer
  const [landed, setLanded] = useState('')
  const [cheer, setCheer] = useState<[string, string] | null>(null)
  const completed = useRef(0)
  const cheerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(cheerTimer.current), [])

  const rows = filterTaskRows(data.tasks, data.projects, { architect, unassigned, status, withProject })
  const floors = doneThisWeek(rows, today)
  const architects = architectOptions(data.settings.architects, data.tasks.map((l) => l.task.assignee))

  function setArchitect(value: string) {
    let p = withParam(params, 'n', value === UNASSIGNED ? '1' : '')
    p = withParam(p, 'a', value === UNASSIGNED ? '' : value)
    onParams(p)
  }

  /** Moves a task; one that becomes done lands its stamp and counts towards the next cheer. */
  function move(l: LoadedTask, to: TaskStatus) {
    if (l.task.status === to) return
    edit.moveTo(l, to)
    if (to !== 'done') return
    setLanded(l.file)
    clearTimeout(cheerTimer.current)
    setCheer(null)
    if (++completed.current % CHEER_EVERY) return
    setCheer(cheers[Math.floor(Math.random() * cheers.length)])
    cheerTimer.current = setTimeout(() => setCheer(null), CHEER_MS)
  }

  function onDrop(e: DragEvent, to: TaskStatus) {
    e.preventDefault()
    const moved = dragging
    setDragging(null)
    setOver(null)
    if (moved) move(moved, to)
  }

  const card = (l: LoadedTask) => {
    const p = projectOf(l)
    return (
      <Card
        key={l.file}
        loaded={l}
        data={data}
        project={p ? p.project.title || p.file : null}
        today={today}
        dragged={l === dragging}
        onOpen={() => edit.edit(l)}
        landing={l.file === landed}
        onDone={(done) => move(l, done ? 'done' : 'todo')}
        onDragStart={() => setDragging(l)}
        onDragEnd={() => {
          setDragging(null)
          setOver(null)
        }}
      />
    )
  }

  return (
    <main>
      <div class="heading">
        <h1>{t.tasks}</h1>
      </div>

      <div class="toolbar">
        <label>
          {t.architectFilter}
          <select value={unassigned ? UNASSIGNED : architect} onChange={(e) => setArchitect(e.currentTarget.value)}>
            <option value="">{t.allArchitects}</option>
            {architects.map((a) => <option key={a} value={a}>{a}</option>)}
            <option value={UNASSIGNED}>{t.unassigned}</option>
          </select>
        </label>
        <label>
          {t.filterStatus}
          <select value={status} onChange={(e) => onParams(withParam(params, 's', e.currentTarget.value))} disabled={withProject === 'bez'}>
            <option value="">{t.statusDefault}</option>
            {STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
            <option value="wszystkie">{t.statusAll}</option>
          </select>
        </label>
        <label>
          {t.filterProject}
          <select value={withProject} onChange={(e) => onParams(withParam(params, 'j', e.currentTarget.value))}>
            <option value="">{t.allTasks}</option>
            <option value="z">{t.withProject}</option>
            <option value="bez">{t.withoutProject}</option>
          </select>
        </label>
        <button type="button" class="primary toolbar-add" onClick={() => edit.edit({ task: emptyTask(''), file: '', duplicate: false })}>
          + {t.addTask}
        </button>
      </div>

      {edit.error && <p class="error" role="alert">{edit.error}</p>}
      <div class="tasks-layout">
        <div class="board tasks-tab">
          {TASK_STATUSES.map((s) => {
            const cards = rows.filter((l) => l.task.status === s)
            const done = s === 'done' ? splitDone(cards) : null
            return (
              <div
                key={s}
                class="col"
                data-status={s}
                data-over={over === s || undefined}
                onDragOver={(e) => {
                  // only a drop on another column changes anything
                  if (!dragging || dragging.task.status === s) return
                  e.preventDefault()
                  if (over !== s) setOver(s)
                }}
                onDragLeave={(e) => {
                  const to = e.relatedTarget as Node | null
                  if (!to || !(e.currentTarget as HTMLElement).contains(to)) setOver(null)
                }}
                onDrop={(e) => onDrop(e, s)}
              >
                <h3>{taskStatusLabels[s]} <span class="count">{cards.length}</span></h3>
                {s === 'done' && cheer && (
                  <p class="cheer" role="status">
                    <small>{cheer[0]}</small>
                    {cheer[1]}
                  </p>
                )}
                {done ? (
                  <>
                    {done.recent.map(card)}
                    {showOlder && done.older.map(card)}
                    {!showOlder && done.older.length > 0 && (
                      <button type="button" class="older" onClick={() => setShowOlder(true)}>{t.showOlder(done.older.length)}</button>
                    )}
                  </>
                ) : (
                  byDue(cards).map(card)
                )}
              </div>
            )
          })}
        </div>
        <aside class="week-aside">
          <Building floors={floors} />
        </aside>
      </div>
      {edit.dialog}
    </main>
  )
}

type CardProps = {
  loaded: LoadedTask
  data: Data
  /** the project's title, or null without a project */
  project: string | null
  today: string
  dragged: boolean
  landing: boolean
  onOpen: () => void
  onDone: (done: boolean) => void
  onDragStart: () => void
  onDragEnd: () => void
}

/** A task card with its project and a "wykonane" checkbox; a click elsewhere on the card opens the dialog. */
function Card({ loaded: { task, file, duplicate }, data, project, today, dragged, landing, onOpen, onDone, onDragStart, onDragEnd }: CardProps) {
  const done = task.status === 'done'
  const late = taskState(task, today) === 'overdue'
  const badge = task.assignee ? badgeFor(data.settings.badges, task.assignee) : null
  return (
    <div
      class={'task' + (done ? ' done' : '') + (dragged ? ' dragging' : '')}
      draggable
      onClick={onOpen}
      onDragStart={(e) => {
        e.dataTransfer!.setData('text/plain', file)
        e.dataTransfer!.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
    >
      <span class="grip" aria-hidden="true" />
      <span class="task-head">
        <span class="sketch-check">
          <input
            type="checkbox"
            aria-label={t.taskDone}
            title={t.taskDone}
            checked={done}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onDone(e.currentTarget.checked)}
          />
          {/* a marker tick drawn over the box */}
          <svg viewBox="0 0 26 24" aria-hidden="true"><path d="M4 13 C6 15, 8 17, 10 20 C13 13, 17 7, 24 2" /></svg>
        </span>
        {/* the title is the card's keyboard target; its click bubbles to the card */}
        <button type="button" class="task-title">{task.title}</button>
      </span>
      <span class="task-project" data-none={project === null || undefined}>{project ?? t.noProject}</span>
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
      {done && <span class={landing ? 'stamp landing' : 'stamp'} aria-hidden="true">{t.taskDone}</span>}
    </div>
  )
}

// The building of the week: a Gdańsk tenement, drawn in an 80 x 152 box standing on y = 146.
const X = 20 // facade left edge
const W = 40 // facade width
const H = 11 // floor height
const G = 146 // ground line
/** How far each floor slips sideways and turns (degrees) on the one below; scaled by CROOK. */
const SLIP = [0, 1.5, -2, 3, -1, 2.5, -3, 1, 4, -2]
const TURN = [0, 1, -1.5, 2, -1, 1.5, -2.5, 1, 3, -2]
const CROOK = 0.7

/**
 * One crooked floor per task done this week, swaying more the taller it is; a stepped gable from five,
 * a golden weathervane from eight, at most ten floors drawn. Only what is added after the tab opened drops in.
 */
function Building({ floors }: { floors: number }) {
  const k = Math.min(floors, 10)
  const atOpen = useRef(k)
  const drop = (from: number) => (from >= atOpen.current ? 'kb-drop' : undefined)
  // each floor sits on the one below, so the slips add up like a hand-stacked tower
  const shift = (i: number) => SLIP.slice(0, i + 1).reduce((a, b) => a + b, 0) * CROOK * 0.5
  const top = G - H * k
  const dTop = k ? shift(k - 1) : 0
  return (
    <div class="week-build" title={k === 0 ? t.tenementSign.join(' ') : undefined}>
      <svg class="tenement" viewBox="0 0 80 152" aria-hidden="true">
        <rect class="kb-ground" x="4" y={G} width="72" height="3" rx="1.5" />
        {k === 0 ? (
          <g class="kb-sign">
            <line x1="40" y1={G} x2="40" y2={G - 22} />
            <rect x="26" y={G - 34} width="28" height="14" rx="1" />
            <text x="40" y={G - 24.5}>{t.tenementSign[0]}</text>
            <text x="40" y={G - 21}>{t.tenementSign[1]}</text>
          </g>
        ) : (
          <g class="kb-sway" style={`--a: ${k * 0.18}deg; --t: ${Math.max(0.9, 3 - k * 0.2)}s`}>
            {Array.from({ length: k }, (_, i) => {
              const y = G - H * (i + 1)
              return (
                <g key={i} class={drop(i)}>
                  <g transform={`translate(${shift(i)} 0) rotate(${TURN[i] * CROOK} ${X + W / 2} ${y + H / 2})`}>
                    <rect class="kb-wall" x={X} y={y} width={W} height={H} />
                    {i === 0 ? (
                      <>
                        <path class="kb-door" d={`M37 ${G} v-6 a3 3 0 0 1 6 0 v6 z`} />
                        <rect class="kb-win" x="24" y={y + 3} width="8" height="6" />
                        <rect class="kb-win" x="48" y={y + 3} width="8" height="6" />
                      </>
                    ) : (
                      <>
                        {[25, 37.5, 50].map((wx) => <path key={wx} class="kb-win" d={`M${wx} ${y + 9.5} v-5 a2.5 2.5 0 0 1 5 0 v5 z`} />)}
                        <rect class="kb-cornice" x={X - 1.5} y={y - 0.8} width={W + 3} height="1.6" />
                      </>
                    )}
                  </g>
                </g>
              )
            })}
            {k >= 5 && (
              <g class={drop(4)}>
                <g transform={`translate(${dTop} 0) rotate(${-3 * CROOK} 40 ${top})`}>
                  <path class="kb-wall" d={`M${X} ${top} h3 v-5 h4 v-5 h4 v-5 h4 v-5 h10 v5 h4 v5 h4 v5 h4 v5 h3 z`} />
                  <circle class="kb-win" cx="40" cy={top - 11} r="3" />
                  <rect class="kb-cornice" x={X - 1.5} y={top - 0.8} width={W + 3} height="1.6" />
                </g>
              </g>
            )}
            {k >= 8 && (
              <g class={drop(7)}>
                {/* the weathervane hangs on at an angle */}
                <g class="kb-vane" transform={`translate(${dTop} 0) rotate(${8 * CROOK} 40 ${top - 20})`}>
                  <line x1="40" y1={top - 20} x2="40" y2={top - 32} />
                  <path d={`M36 ${top - 28} h8 l-1.5 2.5 h-5 z`} />
                  <path d={`M40 ${top - 28.5} v-6 l3.5 5 z`} />
                </g>
              </g>
            )}
          </g>
        )}
      </svg>
      <span class="week-text">
        <strong>{t.floorCount(floors)}</strong>
        {t.thisWeek}
      </span>
    </div>
  )
}
