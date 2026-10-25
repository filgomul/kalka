import { formatDate, todayIso } from './model.ts'
import { deadlines, entries, visibleRows, type Entry } from './calendar.ts'
import { CalendarFilters, calendarFilter, projectHref, type ViewProps } from './calendar-view.tsx'
import { milestoneLabels, t } from './pl.ts'

export function Deadlines(props: ViewProps) {
  const { data, params } = props
  const today = todayIso()
  const { overdue, weeks } = deadlines(entries(visibleRows(data.projects, calendarFilter(params)), today), today)
  const count = overdue.length + weeks.reduce((n, w) => n + w.entries.length, 0)

  const rows = (list: Entry[]) =>
    list.map((e) => (
      <tr key={e.file + e.key}>
        <td class={e.state === 'overdue' ? 'when late' : 'when'}>{formatDate(e.value)}</td>
        <td><span class="kind" data-kind={e.key}>{milestoneLabels[e.key]}</span></td>
        <td class="title"><a href={projectHref(e.file, params, 'terminy')}>{e.project.title || e.file}</a></td>
        <td>{e.project.leadArchitect}</td>
      </tr>
    ))

  return (
    <main>
      <div class="heading">
        <h1>{t.deadlines} <span class="count">{count}</span></h1>
      </div>

      <CalendarFilters {...props} />

      {count === 0 ? (
        <p class="empty">{t.noDeadlines}</p>
      ) : (
        <div class="table">
          <table>
            <thead>
              <tr>
                <th>{t.colDate}</th>
                <th>{t.colMilestone}</th>
                <th>{t.colProject}</th>
                <th>{t.colArchitect}</th>
              </tr>
            </thead>
            {overdue.length > 0 && (
              <tbody>
                <tr class="group late"><th colSpan={4}>{t.overdue}</th></tr>
                {rows(overdue)}
              </tbody>
            )}
            {weeks.map((w) => (
              <tbody key={w.monday}>
                <tr class="group"><th colSpan={4}>{t.weekOf} {formatDate(w.monday)}</th></tr>
                {rows(w.entries)}
              </tbody>
            ))}
          </table>
        </div>
      )}
    </main>
  )
}
