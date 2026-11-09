# Tasks

## 1. Project type

- [x] 1.1 `src/model.ts`: `TypeId`, `type` on `Project`, `templateOf(id)` (building fallback) used by `fromTemplate`, `emptyProject` with `type: 'inny'`, `normalize` reading a missing or unknown `type` as `inny`. `src/model.test.ts`: "projects: File without a type", "projects: Unknown type", "projects: No template in the file" (`prepareForSave` of a `wnetrza` project holds `type: 'wnetrza'`), "projects: Milestone change on a file without a type" (`withTimeline` of a normalized file without `type` holds `type: 'inny'`), "projects: Link without a template" (`templateOf(null).id` is `budowlany`). Verify: `pnpm test` green
- [x] 1.2 `src/pl.ts`: `typeFilter`, `typeAll`, `projectType` in one block. `src/form.tsx`: a new project's draft gets `type: templateOf(template).id`; a "typ projektu" select after "tytuł" listing `TEMPLATES` names, set through `set`. Keep both edits as separate small hunks. Verify: `pnpm build` type-checks; in the dev server a new project from "projekt wnętrz" shows that type, and changing the type then "Anuluj" leaves the file as it was

## 2. Type column and filter

- [x] 2.1 `src/model.ts`: `Filter` gains optional `type`; `filterProjects` narrows by it when set. `src/model.test.ts`: "projects: Filter by type". Verify: `pnpm test` green, calendar and tasks tests unchanged
- [x] 2.2 `src/main.tsx`: read `y` into `filter.type` and write it in `onFilter`. `src/list.tsx`: "typ" column after "tytuł" showing the template name; "Typ projektu" select after the status filter ("wszystkie typy" plus the three types). Verify: in the dev server the filter narrows the list and survives a refresh and a round trip through a project form; switching to "Kalendarz" does not carry `y`

## 3. Sort by column

- [x] 3.1 `src/model.ts`: `SortKey`, `Sort`, `parseSort`, `sortParam`, `sortProjects(rows, sort?)` with empty values last in both directions, list order for status and type, ties by the default order. `src/model.test.ts`: "projects: Sort by title" (with "Łąkowa" after "Lipowa"), "projects: Reverse", "projects: Running number", "projects: Empty values last", "projects: Status order", "projects: Type order", "projects: Ties", "projects: Next milestone reversed", "projects: Unknown sort in the URL" (`parseSort('x')` is the default and `sortParam` of the default is empty). Existing "Overdue" and "All in the past" tests still pass with no sort. Verify: `pnpm test` green
- [x] 3.2 `src/main.tsx`: read `o` with `parseSort` and write it with `sortParam`, together with the filters. `src/list.tsx`: header buttons (click sorts ascending, the sorted header flips), `aria-sort` and a direction arrow on the sorted header. `src/style.css`: header buttons look like the current headers. Verify: in the dev server every column sorts and reverses, the arrow follows, and the sort survives a refresh and a round trip through a project form

## 4. Docs

- [x] 4.1 `AGENTS.md`: "How it fits together" says the project keeps its type (instead of "the project does not keep the template") and that the list sorts by any column; a `typ projektu` / `type` domain term row. Verify: `git diff AGENTS.md` shows only those lines

## 5. Verify

- [x] 5.1 `pnpm test` and `pnpm build` are green; `openspec validate --all --strict` passes
- [x] 5.2 Verify in the running dev environment (`pnpm dev`, Chrome or Edge, a scratch data folder outside the repo): one project file without `type`, one with `"type": "biuro"`, and a new project from each template. Check the "typ" column and filter, sort each column both ways (empty city, missing l.p., all statuses shown), refresh, open a project and go back. Change a type, then "Anuluj" and "Zapisz". Tick a milestone on the file without `type` and check the file now holds `"type": "inny"`
- [ ] 5.3 Before the archive commit: rebase on `main` (after 011 merged) and check that the MODIFIED requirement texts in `specs/projects/spec.md` still match `openspec/specs/projects/spec.md` apart from this change's edits
