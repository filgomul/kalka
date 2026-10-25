import { useRef } from 'preact/hooks'
import { architectOptions, MILESTONES, STATUSES, todayIso } from './model.ts'
import {
  addMonths,
  entries,
  isMonth,
  monthEntries,
  monthGrid,
  overviewMonths,
  overviewRange,
  projectChoices,
  rangeLength,
  stepRange,
  visibleRows,
  withFrom,
  withLength,
  withTo,
  type CalendarFilter,
  type Entry,
  type Range,
} from './calendar.ts'
import { milestoneLabels, milestoneShort, months, monthsShort, statusLabels, t, weekdays } from './pl.ts'
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

/** Architect, status and project filters shared by the calendar and Terminy. */
export function CalendarFilters({ data, params, onParams }: ViewProps) {
  const f = calendarFilter(params)
  const architects = architectOptions(data.settings.architects, data.projects.map((l) => l.project))
  const set = (key: string) => (e: { currentTarget: HTMLSelectElement }) => onParams(withParam(params, key, e.currentTarget.value))
  return (
    <div class="toolbar">
      <select aria-label={t.colArchitect} value={f.architect} onChange={set('a')} disabled={!!f.project}>
        <option value="">{t.allArchitects}</option>
        {architects.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <select aria-label={t.colStatus} value={f.status} onChange={set('s')} disabled={!!f.project}>
        <option value="">{t.statusDefault}</option>
        {STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
        <option value="wszystkie">{t.statusAll}</option>
      </select>
      <select aria-label={t.colProject} value={f.project} onChange={set('p')}>
        <option value="">{t.allProjects}</option>
        {projectChoices(data.projects).map((c) => <option key={c.file} value={c.file}>{c.label}</option>)}
      </select>
    </div>
  )
}

/** `day` puts the day of the month (or "mies.") in front, for the overview's lists. */
export function Chip({ e, href, day }: { e: Entry; href: string; day?: boolean }) {
  const state = e.state === 'overdue' ? `, ${t.overdue}` : e.state === 'done' ? `, ${t.done}` : ''
  return (
    <a class="chip" data-kind={e.key} data-state={e.state} href={href} title={`${e.project.title || e.file} - ${milestoneLabels[e.key]}${state}`}>
      {day && <i class="d">{e.precision === 'day' ? e.value.slice(8) : t.wholeMonth}</i>}
      <b>{milestoneShort[e.key]}</b>
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

export function CalendarView(props: ViewProps) {
  const { data, params, onParams } = props
  const today = todayIso()
  const current = today.slice(0, 7)
  const month = isMonth(params.get('m')) ? params.get('m')! : current
  const isOverview = params.get('w') === 'przeglad'
  const range = overviewRange(params.get('od'), params.get('do'), current)
  const all = entries(visibleRows(data.projects, calendarFilter(params)), today)
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

      <CalendarFilters {...props} />

      <div class="legend" aria-label={t.legend}>
        {MILESTONES.map((k) => (
          <span key={k}><i data-kind={k} />{milestoneShort[k]} - {milestoneLabels[k]}</span>
        ))}
      </div>

      {isOverview ? <Overview all={all} params={params} today={today} range={range} /> : <MonthView all={all} params={params} today={today} month={month} />}
    </main>
  )
}

type PartProps = { all: Entry[]; params: URLSearchParams; today: string }

function MonthView({ all, params, today, month }: PartProps & { month: string }) {
  const { byDay, strip } = monthEntries(all, month)
  const href = (e: Entry) => projectHref(e.file, params, 'kalendarz')
  return (
    <>
      {strip.length > 0 && (
        <div class="card strip">
          <span class="lbl">{t.thisMonth}</span>
          {strip.map((e) => <Chip key={e.file + e.key} e={e} href={href(e)} />)}
        </div>
      )}

      <div class="month-scroll">
        <div class="month-grid">
          {weekdays.map((d) => <div key={d} class="dow">{d}</div>)}
          {monthGrid(month).flat().map((day, i) => {
            const cls = ['day', day.slice(0, 7) !== month && 'out', i % 7 > 4 && 'weekend', day === today && 'today'].filter(Boolean).join(' ')
            return (
              <div key={day} class={cls}>
                <span class="n">{+day.slice(8)}</span>
                {byDay.get(day)?.map((e) => <Chip key={e.file + e.key} e={e} href={href(e)} />)}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

function Overview({ all, params, today, range }: PartProps & { range: Range }) {
  const href = (e: Entry) => projectHref(e.file, params, 'kalendarz')
  // month view of `m` with the same filters; the range stays in the URL for the way back
  const monthHref = (m: string) => {
    const p = withParam(withParam(params, 'w', ''), 'm', m)
    return '#/kalendarz' + (p.size ? '?' + p : '')
  }
  return (
    <div class="overview">
      {overviewMonths(all, range).map(({ month, shown, more }) => (
        <section key={month} class={month === today.slice(0, 7) ? 'card overview-month now' : 'card overview-month'}>
          <h2><a href={monthHref(month)}>{months[+month.slice(5) - 1]} {month.slice(0, 4)}</a></h2>
          {shown.length === 0 ? (
            <p class="muted">{t.noMilestones}</p>
          ) : (
            <ul>{shown.map((e) => <li key={e.file + e.key}><Chip e={e} href={href(e)} day /></li>)}</ul>
          )}
          {more > 0 && <a class="more" href={monthHref(month)}>+{more} {t.more}</a>}
        </section>
      ))}
    </div>
  )
}
