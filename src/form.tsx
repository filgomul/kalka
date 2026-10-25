import { useState } from 'preact/hooks'
import { BRANCHES, emptyProject, MILESTONES, nextLp, parseDate, prepareForSave, STATUSES, type MilestoneKey, type Project } from './model.ts'
import { branchLabels, milestoneLabels, statusLabels, t } from './pl.ts'
import { ConflictError, saveProject, type Loaded } from './storage.ts'
import type { Data } from './main.tsx'

type Props = {
  data: Data
  /** null for a new project */
  loaded: Loaded | null
  onSaved: () => Promise<void>
  onCancel: () => void
}

type Precision = 'day' | 'month'

export function ProjectForm({ data, loaded, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<Project>(
    () => loaded?.project ?? { ...emptyProject(), lp: nextLp(data.projects.map((l) => l.project)) },
  )
  const [precision, setPrecision] = useState(
    () => Object.fromEntries(MILESTONES.map((k) => [k, parseDate(draft.milestones[k])?.precision ?? 'day'])) as Record<MilestoneKey, Precision>,
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (patch: Partial<Project>) => setDraft((d) => ({ ...d, ...patch }))
  const setMilestone = (key: MilestoneKey, value: string) => setDraft((d) => ({ ...d, milestones: { ...d.milestones, [key]: value } }))
  const switchPrecision = (key: MilestoneKey, to: Precision) => {
    setPrecision((p) => ({ ...p, [key]: to }))
    // a month keeps its year and month; a day can't be guessed from a month
    setMilestone(key, to === 'month' ? (draft.milestones[key] ?? '').slice(0, 7) : '')
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

        <section class="card">
          <h2>{t.milestones}</h2>
          <div class="fields milestones">
            {MILESTONES.map((key) => (
              <fieldset key={key} class="milestone">
                <legend>{milestoneLabels[key]}</legend>
                <input
                  type={precision[key] === 'day' ? 'date' : 'month'}
                  aria-label={milestoneLabels[key]}
                  value={draft.milestones[key] ?? ''}
                  onInput={(e) => setMilestone(key, e.currentTarget.value)}
                />
                <select aria-label={`${milestoneLabels[key]}: ${t.day} / ${t.month}`} value={precision[key]} onChange={(e) => switchPrecision(key, e.currentTarget.value as Precision)}>
                  <option value="day">{t.day}</option>
                  <option value="month">{t.month}</option>
                </select>
              </fieldset>
            ))}
          </div>
        </section>

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
