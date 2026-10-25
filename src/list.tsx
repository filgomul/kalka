import { architectOptions, filterProjects, formatDate, nextMilestone, sortProjects, STATUSES, todayIso, type Filter } from './model.ts'
import { milestoneLabels, statusLabels, t } from './pl.ts'
import type { Data } from './main.tsx'

type Props = {
  data: Data
  filter: Filter
  query: string
  onFilter: (f: Filter) => void
  onRefresh: () => void
}

export function ProjectList({ data, filter, query, onFilter, onRefresh }: Props) {
  const today = todayIso()
  const rows = sortProjects(filterProjects(data.projects, filter), today)
  const architects = architectOptions(data.settings.architects, data.projects.map((l) => l.project))
  const set = (patch: Partial<Filter>) => onFilter({ ...filter, ...patch })

  return (
    <main>
      <div class="heading">
        <h1>{t.projects} <span class="count">{rows.length}</span></h1>
        <button type="button" onClick={onRefresh}>{t.refresh}</button>
        <a class="button primary" href={'#/nowy' + query}>+ {t.newProject}</a>
      </div>

      {data.broken.length > 0 && (
        <div class="error">
          {t.brokenFiles}
          <ul>{data.broken.map((b) => <li key={b.file}>{b.file}: {b.reason}</li>)}</ul>
        </div>
      )}

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
      </div>

      {rows.length === 0 ? (
        <p class="empty">{t.empty}</p>
      ) : (
        <div class="table">
          <table>
            <thead>
              <tr>
                <th class="num">{t.colLp}</th>
                <th>{t.colTitle}</th>
                <th>{t.colCity}</th>
                <th>{t.colArchitect}</th>
                <th>{t.colNext}</th>
                <th>{t.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ project: p, file, duplicate }) => {
                const next = nextMilestone(p, today)
                return (
                  <tr key={file}>
                    <td class="num">{p.lp ?? ''}</td>
                    <td class="title">
                      <a href={`#/projekt/${encodeURIComponent(file)}${query}`}>{p.title || file}</a>
                      {duplicate && <span class="badge">{t.syncConflict}: {file}</span>}
                    </td>
                    <td>{p.location.city}</td>
                    <td>{p.leadArchitect}</td>
                    <td>
                      {next ? (
                        <>
                          <span class="date">{formatDate(next.value)}</span>
                          <span class="sub">{milestoneLabels[next.key]}</span>
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
