import { useRef } from 'preact/hooks'
import { architectOptions, STATUSES, styleOf, titleOf, todayIso } from './model.ts'
import {
  addMonths,
  isMeetingItem,
  KINDS,
  legendStyles,
  isMonth,
  meetingsByDay,
  monthEntries,
  monthGrid,
  overviewMonths,
  overviewRange,
  projectChoices,
  rangeLength,
  showOf,
  showParam,
  shownOnCalendar,
  stepRange,
  withFrom,
  withLength,
  withMeetings,
  withTo,
  type CalendarFilter,
  type Entry,
  type Range,
} from './calendar.ts'
import { kindLabels, meetingTypeLabels, months, monthsShort, statusLabels, t, weekdays } from './pl.ts'
import { formatRange, formatShortRange, leavesInMonth, weekLanes } from './leaves.ts'
import { leaveColor, useLeaveEdit } from './leaves-view.tsx'
import { formatTimes, formatWhen } from './meetings.ts'
import { projectTitleOf, useMeetingEdit } from './meetings-view.tsx'
import { badgeFor, textOn } from './tasks.ts'
import type { LoadedLeave, LoadedMeeting } from './storage.ts'
import type { Data } from './main.tsx'

export type ViewProps = {
  data: Data
  params: URLSearchParams
  onParams: (p: URLSearchParams) => void
}

export const calendarFilter = (params: URLSearchParams): CalendarFilter => ({
  architect: params.get('a') ?? '',
  status: params.get('s') ?? '',
  project: params.get('p') ?? '',
})

/** Form link that comes back to `view` with the same query. */
export function projectHref(file: string, params: URLSearchParams, view: string): string {
  const p = new URLSearchParams(params)
  p.set('z', view)
  return `#/projekt/${encodeURIComponent(file)}?${p}`
}

/** Sets or clears one query key, keeping the others. */
export function withParam(params: URLSearchParams, key: string, value: string): URLSearchParams {
  const p = new URLSearchParams(params)
  if (value) p.set(key, value)
  else p.delete(key)
  return p
}

/** Architect, status and project filters shared by the calendar and Terminy; `kind` adds "Pokaż" (calendar only). */
export function CalendarFilters({ data, params, onParams, kind }: ViewProps & { kind?: boolean }) {
  const f = calendarFilter(params)
  const show = showOf(kind ? params.get('k') : null)
  const architects = architectOptions(data.settings.architects, data.projects.map((l) => l.project.leadArchitect))
  const set = (key: string) => (e: { currentTarget: HTMLSelectElement }) => onParams(withParam(params, key, e.currentTarget.value))
  // architect and project narrow milestones and meetings, status milestones only; never leaves
  const narrowsNothing = !show.has('terminy') && !show.has('spotkania')
  const toggle = (k: (typeof KINDS)[number]) => {
    const next = new Set(show)
    if (!next.delete(k)) next.add(k)
    onParams(withParam(params, 'k', showParam(next)))
  }
  const summary = show.size === KINDS.length ? t.showEverything : show.size ? KINDS.filter((k) => show.has(k)).map((k) => kindLabels[k]).join(', ') : t.showNothing
  return (
    <div class="toolbar">
      <label>
        {t.filterArchitect}
        <select value={f.architect} onChange={set('a')} disabled={!!f.project || narrowsNothing}>
          <option value="">{t.allArchitects}</option>
          {architects.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </label>
      <label>
        {t.filterStatus}
        <select value={f.status} onChange={set('s')} disabled={!!f.project || !show.has('terminy')}>
          <option value="">{t.statusDefault}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
          <option value="wszystkie">{t.statusAll}</option>
        </select>
      </label>
      <label>
        {t.filterProject}
        <select value={f.project} onChange={set('p')} disabled={narrowsNothing}>
          <option value="">{t.allProjects}</option>
          {projectChoices(data.projects).map((c) => <option key={c.file} value={c.file}>{c.label}</option>)}
        </select>
      </label>
      {kind && (
        <>
          <label>
            {t.filterShow}
            <button type="button" class="show-kinds" popovertarget="show-kinds">{summary}</button>
          </label>
          <div id="show-kinds" popover="auto" class="menu kinds">
            {KINDS.map((k) => (
              <label key={k} class="check">
                <input type="checkbox" checked={show.has(k)} onChange={() => toggle(k)} />
                {kindLabels[k]}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Inline style that gives an element its milestone style's colour; CSS derives the tint and text from it. */
export const colorOf = (style: string) => `--c: ${styleOf(style).color}`

/** The "?" before a date that is only planned, in the milestone's colour (inherited when no style is given). */
export function PlannedMark({ style }: { style?: string }) {
  return <abbr class="q" style={style ? colorOf(style) : undefined} title={t.unconfirmed}>?</abbr>
}

/** `day` puts the day of the month (or "mies.") in front, for the overview's lists. */
export function Chip({ e, href, day }: { e: Entry; href: string; day?: boolean }) {
  const planned = !e.confirmed && e.state !== 'done'
  const state = [planned && t.unconfirmed, e.state === 'overdue' && t.overdue, e.state === 'done' && t.done].filter(Boolean).map((s) => `, ${s}`).join('')
  return (
    <a class="chip" style={colorOf(e.milestone.style)} data-state={e.state} data-planned={planned || undefined} href={href} title={`${e.project.title || e.file} - ${titleOf(e.milestone)}${state}`}>
      {day && <i class="d">{e.precision === 'day' ? e.value.slice(8) : t.wholeMonth}</i>}
      <b>{planned && <PlannedMark />}{styleOf(e.milestone.style).short}</b>
      <span>{e.project.title || e.file}</span>
    </a>
  )
}

/** A month button that opens the browser's own month picker; the input is hidden so the button keeps the Polish name. */
function MonthPick({ value, label, class: cls, onPick }: { value: string; label: string; class: string; onPick: (m: string) => void }) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <span class="month-pick">
      <button type="button" class={cls} title={t.pickMonth} onClick={() => input.current?.showPicker()}>{label}</button>
      <input ref={input} type="month" tabIndex={-1} aria-hidden="true" value={value} onChange={(e) => e.currentTarget.value && onPick(e.currentTarget.value)} />
    </span>
  )
}

const SHORTCUTS = [3, 6, 12]

/** A meeting in the month grid, or in the overview (`day`: with the day of the month in front). */
function MeetingChip({ l, data, today, day, onOpen }: { l: LoadedMeeting; data: Data; today: string; day?: boolean; onOpen: (l: LoadedMeeting) => void }) {
  const m = l.meeting
  const time = formatTimes(m)
  const title = [m.title, formatWhen(m), m.architect, meetingTypeLabels[m.type], projectTitleOf(data, m)].filter(Boolean).join(', ')
  // filled with the architect's colour; the text, and the circle's fill, contrast with it
  const b = badgeFor(data.settings.badges, m.architect)
  return (
    <button type="button" class="chip meeting" style={`--c: ${b.color}; --on: ${textOn(b.color)}`} data-past={m.date < today || undefined} title={title} onClick={() => onOpen(l)}>
      {day && <i class="d">{m.date.slice(8)}</i>}
      {m.architect && <span class="avatar">{b.initials}</span>}
      {time && <b>{time}</b>}
      <span>{m.title}</span>
    </button>
  )
}

export function CalendarView(props: ViewProps & { reloadLeaves: () => Promise<void>; reloadMeetings: () => Promise<void> }) {
  const { data, params, onParams, reloadLeaves, reloadMeetings } = props
  const today = todayIso()
  const current = today.slice(0, 7)
  const month = isMonth(params.get('m')) ? params.get('m')! : current
  const isOverview = params.get('w') === 'przeglad'
  const range = overviewRange(params.get('od'), params.get('do'), current)
  const show = showOf(params.get('k'))
  const { all, leaves, meetings } = shownOnCalendar(data.projects, data.leaves, data.meetings, calendarFilter(params), show, today)
  const edit = useLeaveEdit(data, reloadLeaves, true)
  const meetingEdit = useMeetingEdit(data, reloadMeetings)
  const parts = { all, leaves, meetings, data, params, today, onLeave: edit.edit, onMeeting: meetingEdit.edit }
  const go = (m: string) => onParams(withParam(params, 'm', m === current ? '' : m))
  const setRange = (r: Range) => onParams(withParam(withParam(params, 'od', r.from), 'do', r.to))
  const short = (m: string) => `${monthsShort[+m.slice(5) - 1]} ${m.slice(0, 4)}`

  return (
    <main>
      <div class="heading">
        <h1>{t.calendar}</h1>
        <div class="seg" role="group">
          <button type="button" aria-pressed={!isOverview} onClick={() => onParams(withParam(params, 'w', ''))}>{t.viewMonth}</button>
          <button type="button" aria-pressed={isOverview} onClick={() => onParams(withParam(params, 'w', 'przeglad'))}>{t.viewOverview}</button>
        </div>
        {isOverview ? (
          <>
            <div class="month-nav">
              <button type="button" aria-label={t.prevRange} onClick={() => setRange(stepRange(range, -1))}>‹</button>
              <span class="lbl">{t.from}</span>
              <MonthPick class="pick" value={range.from} label={short(range.from)} onPick={(m) => setRange(withFrom(range, m))} />
              <span class="lbl">{t.to}</span>
              <MonthPick class="pick" value={range.to} label={short(range.to)} onPick={(m) => setRange(withTo(range, m))} />
              <button type="button" aria-label={t.nextRange} onClick={() => setRange(stepRange(range, 1))}>›</button>
            </div>
            <div class="seg" role="group" aria-label={t.rangeLength}>
              {SHORTCUTS.map((n) => (
                <button key={n} type="button" aria-pressed={rangeLength(range) === n} onClick={() => setRange(withLength(range, n))}>{n}</button>
              ))}
            </div>
            <button type="button" onClick={() => setRange(withFrom(range, current))}>{t.today}</button>
          </>
        ) : (
          <>
            <div class="month-nav">
              <button type="button" aria-label={t.prevMonth} onClick={() => go(addMonths(month, -1))}>‹</button>
              <MonthPick class="month" value={month} label={`${months[+month.slice(5) - 1]} ${month.slice(0, 4)}`} onPick={go} />
              <button type="button" aria-label={t.nextMonth} onClick={() => go(addMonths(month, 1))}>›</button>
            </div>
            <button type="button" onClick={() => go(current)}>{t.today}</button>
          </>
        )}
      </div>

      <CalendarFilters {...props} kind />

      {show.has('terminy') && (
        <div class="legend" aria-label={t.legend}>
          {legendStyles(all).map((s) => (
            <span key={s.id}><i style={colorOf(s.id)} />{s.short} - {s.name}</span>
          ))}
          <span><PlannedMark />{t.unconfirmed}</span>
        </div>
      )}

      {edit.error && <p class="error" role="alert">{edit.error}</p>}
      {meetingEdit.error && <p class="error" role="alert">{meetingEdit.error}</p>}

      {isOverview ? <Overview {...parts} range={range} /> : <MonthView {...parts} month={month} />}
      {edit.dialog}
      {meetingEdit.dialog}
    </main>
  )
}

type PartProps = {
  all: Entry[]
  leaves: LoadedLeave[]
  meetings: LoadedMeeting[]
  data: Data
  params: URLSearchParams
  today: string
  onLeave: (l: LoadedLeave) => void
  onMeeting: (l: LoadedMeeting) => void
}

const leaveTitle = (l: LoadedLeave) => t.leaveTitle(l.leave.architect, formatRange(l.leave))

function MonthView({ all, leaves, meetings, data, params, today, month, onLeave, onMeeting }: PartProps & { month: string }) {
  const { byDay, strip } = monthEntries(all, month)
  const meetingDays = meetingsByDay(meetings)
  const href = (e: Entry) => projectHref(e.file, params, 'kalendarz')
  return (
    <>
      {strip.length > 0 && (
        <div class="card strip">
          <span class="lbl">{t.thisMonth}</span>
          {strip.map((e) => <Chip key={e.file + e.milestone.id} e={e} href={href(e)} />)}
        </div>
      )}

      <div class="month-scroll">
        <div class="month-grid">
          <div class="dows">{weekdays.map((d) => <div key={d} class="dow">{d}</div>)}</div>
          {monthGrid(month).map((week) => {
            // each week is its own grid: day cells over every row, leave lines under the day numbers, chips last
            const pieces = weekLanes(leaves, week)
            const lanes = Math.max(0, ...pieces.map((p) => p.lane + 1))
            return (
              <div key={week[0]} class="week" style={`grid-template-rows: var(--num-row) ${'var(--lane-row) '.repeat(lanes)}1fr`}>
                {week.map((day, i) => {
                  const cls = ['day', day.slice(0, 7) !== month && 'out', i > 4 && 'weekend', day === today && 'today'].filter(Boolean).join(' ')
                  const count = meetingDays.get(day)?.length ?? 0
                  return (
                    <div key={day} class={cls} style={`grid-column: ${i + 1}`}>
                      <span class="day-head">
                        <span class="n">{+day.slice(8)}</span>
                        {count > 0 && <span class="meeting-count">{t.meetingCount(count)}</span>}
                      </span>
                    </div>
                  )
                })}
                {pieces.map(({ row: l, start, span, lane }) => {
                  // a thin line in the architect's colour with "urlop" and the name above it
                  return (
                    <button
                      key={l.file}
                      type="button"
                      class="leave-bar"
                      style={`${leaveColor(data, l.leave.architect)}; grid-column: ${start} / span ${span}; grid-row: ${lane + 2}`}
                      title={leaveTitle(l)}
                      onClick={() => onLeave(l)}
                    >
                      <span><b>{t.leaveShort}</b> {l.leave.architect}</span>
                    </button>
                  )
                })}
                {week.map((day, i) => {
                  // a day's meetings (by time) before its milestones
                  const dayMeetings = meetingDays.get(day) ?? []
                  const chips = byDay.get(day) ?? []
                  return (dayMeetings.length > 0 || chips.length > 0) && (
                    <div key={day} class="chips" style={`grid-column: ${i + 1}; grid-row: ${lanes + 2}`}>
                      {dayMeetings.map((l) => <MeetingChip key={l.file} l={l} data={data} today={today} onOpen={onMeeting} />)}
                      {chips.map((e) => <Chip key={e.file + e.milestone.id} e={e} href={href(e)} />)}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function Overview({ all, leaves, meetings, data, params, today, range, onLeave, onMeeting }: PartProps & { range: Range }) {
  const href = (e: Entry) => projectHref(e.file, params, 'kalendarz')
  // month view of `m` with the same filters; the range stays in the URL for the way back
  const monthHref = (m: string) => {
    const p = withParam(withParam(params, 'w', ''), 'm', m)
    return '#/kalendarz' + (p.size ? '?' + p : '')
  }
  return (
    <div class="overview">
      {overviewMonths(withMeetings(all, meetings), range).map(({ month, shown, more }) => {
        const monthLeaves = leavesInMonth(leaves, month)
        return (
          <section key={month} class={month === today.slice(0, 7) ? 'card overview-month now' : 'card overview-month'}>
            <h2><a href={monthHref(month)}>{months[+month.slice(5) - 1]} {month.slice(0, 4)}</a></h2>
            <OverviewLeaves rows={monthLeaves} data={data} onLeave={onLeave} />
            {shown.length > 0 && (
              <ul>
                {shown.map((item) =>
                  isMeetingItem(item) ? (
                    <li key={item.row.file}><MeetingChip l={item.row} data={data} today={today} day onOpen={onMeeting} /></li>
                  ) : (
                    <li key={item.file + item.milestone.id}><Chip e={item} href={href(item)} day /></li>
                  ),
                )}
              </ul>
            )}
            {shown.length === 0 && monthLeaves.length === 0 && <p class="muted">{t.noEntries}</p>}
            {more > 0 && <a class="more" href={monthHref(month)}>+{more} {t.more}</a>}
          </section>
        )
      })}
    </div>
  )
}

/** The leaves of an overview month block, above its milestones; each opens the leave dialog. */
function OverviewLeaves({ rows, data, onLeave }: { rows: LoadedLeave[]; data: Data; onLeave: (l: LoadedLeave) => void }) {
  if (!rows.length) return null
  return (
    <ul class="overview-leaves">
      {rows.map((l) => (
        <li key={l.file}>
          <button type="button" class="chip leave" style={leaveColor(data, l.leave.architect)} title={leaveTitle(l)} onClick={() => onLeave(l)}>
            <b>{t.leaveShort}</b>
            <span>{l.leave.architect}</span>
            <b class="dates">{formatShortRange(l.leave)}</b>
          </button>
        </li>
      ))}
    </ul>
  )
}
