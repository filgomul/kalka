import { architectOptions, filterProjects, formatDate, nextMilestone, sortProjects, STATUSES, templateOf, TEMPLATES, titleOf, todayIso, type Filter, type Sort, type SortKey } from './model.ts'
import { statusLabels, t } from './pl.ts'
import { PlannedMark } from './calendar-view.tsx'
import type { Data } from './main.tsx'

type Props = {
  data: Data
  filter: Filter
  sort: Sort
  query: string
  onFilter: (f: Filter) => void
  onSort: (s: Sort) => void
  onRefresh: () => void
}

/** Form link that keeps the list's filters and comes back to the list. */
function formHref(path: string, query: string, template?: string): string {
  const p = new URLSearchParams(query)
  p.set('z', 'projekty')
  if (template) p.set('t', template)
  return `#/${path}?${p}`
}

/** Header label, sort key and cell class of each column, in order. */
const COLUMNS: [SortKey, string, string?][] = [
  ['lp', t.colLp, 'num'],
  ['tytul', t.colTitle],
  ['typ', t.colType],
  ['miejscowosc', t.colCity],
  ['architekt', t.colArchitect],
  ['termin', t.colNext],
  ['status', t.colStatus],
]

export function ProjectList({ data, filter, sort, query, onFilter, onSort, onRefresh }: Props) {
  const today = todayIso()
  const rows = sortProjects(filterProjects(data.projects, filter), sort)
  const architects = architectOptions(data.settings.architects, data.projects.map((l) => l.project.leadArchitect))
  const set = (patch: Partial<Filter>) => onFilter({ ...filter, ...patch })

  return (
    <main>
      <div class="heading">
        <h1>{t.projects} <span class="count">{rows.length}</span></h1>
        <button type="button" onClick={onRefresh}>{t.refresh}</button>
        <button type="button" class="primary new-project" popovertarget="templates">+ {t.newProject}</button>
        <div id="templates" popover="auto" class="menu" role="menu" aria-label={t.newProject}>
          {TEMPLATES.map((tpl) => <a key={tpl.id} role="menuitem" href={formHref('nowy', query, tpl.id)}>{tpl.name}</a>)}
        </div>
      </div>

      <div class="toolbar">
        <input type="search" placeholder={t.search} aria-label={t.search} value={filter.q} onInput={(e) => set({ q: e.currentTarget.value })} />
        <select aria-label={t.colArchitect} value={filter.architect} onChange={(e) => set({ architect: e.currentTarget.value })}>
          <option value="">{t.allArchitects}</option>
          {architects.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select aria-label={t.colStatus} value={filter.status} onChange={(e) => set({ status: e.currentTarget.value })}>
          <option value="">{t.statusDefault}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
          <option value="wszystkie">{t.statusAll}</option>
        </select>
        <select aria-label={t.typeFilter} value={filter.type ?? ''} onChange={(e) => set({ type: e.currentTarget.value })}>
          <option value="">{t.typeAll}</option>
          {TEMPLATES.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <p class="empty">{t.empty}</p>
      ) : (
        <div class="table">
          <table>
            <thead>
              <tr>
                {COLUMNS.map(([key, label, cls]) => {
                  const on = sort.key === key
                  return (
                    <th key={key} class={cls} aria-sort={on ? (sort.desc ? 'descending' : 'ascending') : undefined}>
                      <button type="button" class="sort" onClick={() => onSort({ key, desc: on && !sort.desc })}>
                        {label}
                        {on && <span aria-hidden="true">{sort.desc ? ' ▼' : ' ▲'}</span>}
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ project: p, file, duplicate }) => {
                const next = nextMilestone(p)
                const late = next && next.due < today
                return (
                  <tr key={file}>
                    <td class="num">{p.lp ?? ''}</td>
                    <td class="title">
                      <a href={formHref(`projekt/${encodeURIComponent(file)}`, query)}>{p.title || file}</a>
                      {duplicate && <span class="badge">{t.syncConflict}: {file}</span>}
                    </td>
                    <td>{templateOf(p.type).name}</td>
                    <td>{p.location.city}</td>
                    <td>{p.leadArchitect}</td>
                    <td>
                      {next ? (
                        <>
                          <span class={late ? 'date late' : 'date'}>{!next.milestone.confirmed && <PlannedMark style={next.milestone.style} />}{formatDate(next.milestone.date)}</span>
                          <span class="sub">
                            {titleOf(next.milestone)}
                            {late && <>, <span class="late">{t.overdue}</span></>}
                          </span>
                        </>
                      ) : (
                        <span class="muted">{t.noUpcoming}</span>
                      )}
                    </td>
                    <td><span class="pill" data-status={p.status}>{statusLabels[p.status]}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
