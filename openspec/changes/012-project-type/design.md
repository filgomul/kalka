## Context

- `TEMPLATES` in `src/model.ts` has the ids `budowlany`, `wnetrza`, `inny`.
  `fromTemplate` falls back to the building template, and the new-project link carries
  the id as `t=` (`formHref` in `src/list.tsx`). `back()` in `src/main.tsx` drops
  `z` and `t`.
- `normalize` fills a project as read, and `prepareForSave` shapes it before a write.
  Milestone writes go through `withTimeline(base, list)`, which writes the whole
  normalized `base`.
- The `/projekty` URL is parsed into `Filter { architect, status, q }` in `useRoute`,
  and `onFilter` builds it again from those three fields. `filterProjects` is shared
  with the calendar (`visibleRows`) and the tasks tab (`filterTaskRows`), which build
  `Filter` objects by hand. The header carries only `a` and `s` between tabs.
- `sortProjects(rows)` has one fixed order: next milestone, then l.p., then title.
- 011 and 013 are being built at the same time and touch `src/form.tsx`,
  `src/model.ts` and `src/pl.ts`.

See proposal.md for why and the delta spec for the behaviour.

## Goals / Non-Goals

**Goals:**

- Pure, tested sorting and type logic in `src/model.ts`.
- Small, separate hunks in the files 013 also edits.

**Non-Goals:**

- A generic table or sorting component. The list is the only sortable table.
- A type filter outside the project list.

## Decisions

1. **`type` on `Project`, typed as `TypeId = 'budowlany' | 'wnetrza' | 'inny'`** and
   checked against `TEMPLATES` ids. `normalize` sets `inny` for a missing or unknown
   value, and `emptyProject` starts with `inny`. Because `withTimeline` writes the
   normalized base, a milestone change also writes `type`, which is the spec's
   "Milestone change on a file without a type". Alternative: keep `type` optional and
   leave it out of untouched files. Rejected: every reader would need the `?? 'inny'`
   fallback.
2. **New project**: the form's initial draft sets `type` to the id of the template
   `fromTemplate` actually used. A small `templateOf(id)` returns the template, with
   the same building fallback, and `fromTemplate` uses it. This way a missing or
   unknown `t` gives `budowlany` for both the milestones and the type. Type labels are
   the template names, so no new strings are needed for the values.
3. **Filter**: `Filter` gains an optional `type?: string`, and `filterProjects` checks
   it only when it is set. The calendar and tasks callers stay untouched. In the URL
   it is `y`. `useRoute` reads it and `onFilter` writes it.
4. **Sort**: `type Sort = { key: SortKey; desc: boolean }` with `SortKey` one of
   `lp | tytul | typ | miejscowosc | architekt | termin | status`.
   - `parseSort('-tytul')` reads the URL value; a missing or unknown value gives the
     default `{ termin, asc }`. `sortParam(sort)` writes it, and the default writes
     nothing.
   - `sortProjects(rows, sort?)` compares on the chosen key and puts empty values
     last whatever the direction (only the comparison of two non-empty values is
     negated). On a tie it falls back to the current order (next milestone, l.p.,
     title).
   - Values compared:
     - Text: `localeCompare('pl')`.
     - l.p.: as a number.
     - Status and type: their index in `STATUSES` and `TEMPLATES`.
     - Next milestone: its due date; no next milestone counts as empty.
   - The sort lives in its own `o` param, next to the filter, not inside `Filter`, so
     the shared `Filter` type stays about filtering.
5. **Header click**: each `<th>` holds a `<button>`. Clicking the sorted column flips
   `desc`; clicking another sets it ascending. `aria-sort` goes on the sorted `<th>`
   and an arrow after the label shows the direction. `ProjectList` gets
   `sort` / `onSort` props, and `main.tsx` puts `o` into the same `go(..., true)` call
   as the filters.
6. **Form**: one `<label>` with a `<select>` right after "tytuł", in its own hunk.
   It sets `draft.type` through the existing `set`, so it waits for "Zapisz" like the
   other fields.
7. **Strings** (`src/pl.ts`, one block next to the list strings): `typeFilter: 'Typ
   projektu'`, `typeAll: 'wszystkie typy'`, `projectType: 'typ projektu'`. The column
   header reuses `colType: 'typ'`.

## Risks / Trade-offs

- [Every existing project shows "inny" until edited.] → Agreed on the card. Setting
  the type is one choice in the form per project.
- [011 and 013 edit the same files.] → Small, separate hunks. Before the archive
  commit, rebase on `main` (after 011 has merged) and check that the MODIFIED
  requirement texts in the delta still match `openspec/specs/projects/spec.md`.
- [A sort or filter in a bookmark that no longer exists.] → An unknown `o` gives the
  default order, and an unknown `y` value matches no project, the same as an unknown
  `a` today.
