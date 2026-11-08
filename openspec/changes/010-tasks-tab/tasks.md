## 1. `doneAt`

- [ ] 1.1 `src/tasks.ts`: `Task` gains optional `doneAt` (ISO time); `normalizeTask` drops a non-string `doneAt`; pure `stampDone(before, after, now)` sets `doneAt = now` when `after` becomes done, removes it when `after` is not done, keeps it otherwise. `src/tasks.test.ts`: "tasks: Done time set", "tasks: Done time kept", "tasks: Done time removed", "tasks: File without done time". Verify: `pnpm test` green
- [ ] 1.2 `src/board.tsx`: move the write logic into `useTaskEdit(data, reloadTasks)` (open task, error, `persist`, `saveDialog` taking the column from `data.tasks` by `projectId`, `remove`, `moveTo(row, status)` to the bottom of that status on the task's project board, the dialog through `Portal` with an optional project link); `persist` applies `stampDone` against the task as read (`data.tasks` by file); `TaskBoard` uses the hook. Verify: `pnpm build` type-checks; in the dev server dragging a card to "Wykonane" on a project board writes `doneAt` and dragging it back removes it, and the board behaves as before

## 2. Tab logic

- [ ] 2.1 `src/tasks.ts`: `filterTaskRows(rows, projects, { architect, unassigned, status })` (drops tasks whose project file is missing; assignee or no assignee; project status by the `filterProjects` rules), `byDue(rows)` (month as its last day, undated last, then title), `splitDone(rows, n)` (`{ recent, older }`, `doneAt` falling back to `updatedAt`, latest first), `DONE_SHOWN = 5`. `src/tasks.test.ts`: "tasks: Tasks of several projects", "tasks: Project gone" (tab), "tasks: One architect", "tasks: Unassigned", "tasks: All architects", "tasks: Default status", "tasks: By due date", "tasks: Project order ignored", "tasks: More than five", "tasks: Show older", "tasks: Undo keeps it visible", "tasks: Older file". Verify: `pnpm test` green

## 3. "Zadania" tab

- [ ] 3.1 `src/pl.ts`: "nieprzypisane", "wykonane", `pokaż starsze (N)`, "Otwórz projekt"; plain dashes only. Verify: `pnpm build` type-checks
- [ ] 3.2 `src/main.tsx`: route `#/zadania`, header tab between "Terminy" and "Spotkania", `VIEWS` includes `zadania`, `TasksView` gets `reloadTasks`. Verify: in the dev server the tab shows in that order and is marked when open
- [ ] 3.3 `src/tasks-view.tsx`: `TasksView` with "Architekt" (`a`; "wszyscy architekci", `architectOptions` of kalka.json and assignees, "nieprzypisane" setting `n=1` and clearing `a`) and "Status projektu" (`s`) filters, three columns with counts, "Do zrobienia" and "W trakcie" by `byDue`, "Wykonane" by `splitDone` with the "pokaż starsze (N)" button; the card (title button, project title, "wykonane" checkbox calling `moveTo` with `done` or `todo`, date with "po terminie", initials circle, sync conflict badge, greyed when done); column-level drag and drop calling `moveTo`, ignored on the own column, `.col[data-over]` while over; conflict message above the columns; card click opens the dialog with a link to `projectHref(file, params, 'zadania')`. `src/style.css` for the card, checkbox and greyed state. Verify: in the dev server filters survive a refresh, "nieprzypisane" is not carried to "Kalendarz", ticking and dragging write the file, and "Anuluj" on the linked project returns to the filtered tab

## 4. Docs

- [ ] 4.1 `AGENTS.md`: "How it fits together" mentions the "Zadania" tab; the `zadanie` domain term mentions `doneAt`. Verify: `git diff AGENTS.md` shows only those lines

## 5. Verify

- [ ] 5.1 `pnpm test` and `pnpm build` are green; `openspec validate --all --strict` passes
- [ ] 5.2 Verify in the running dev environment (`pnpm dev`, Chrome or Edge, a scratch data folder outside the repo): with `"architects": [{ "name": "Anna Nowak", "initials": "AN", "color": "#697662" }, "Jan Kowalski"]`, two projects (one `zakończony`) with tasks for both architects, one unassigned and one for a name not in `kalka.json`; open "Zadania" and check the tab order, columns, counts and order by date; try each "Architekt" choice and the status filter, refresh, switch to "Kalendarz" and back; tick and untick "wykonane", drag between columns and within one, and check the project board's placement and the files' `status` and `doneAt`; mark six or more done and use "pokaż starsze"; open a card, save a date change, follow the project link and "Anuluj" back; change a task file's `updatedAt` by hand, tick it and see the conflict message
