## 1. Model

- [x] 1.1 `src/model.ts`: optional `confirmed?: MilestoneKey[]` on `Project` and `isConfirmed(p, key)`, next to `done` and `isDone`; `normalize` keeps only known keys in `confirmed`; `prepareForSave` writes `confirmed` like `done` and drops it when empty. Verify: `pnpm build` type-checks
- [x] 1.2 `src/model.test.ts`: "projects: New project" (`emptyProject` has nothing confirmed), "projects: Confirm and save", "projects: Back to planned" (no `confirmed` key written), "projects: File without confirmed marks" (`normalize` without `confirmed`), "projects: Confirmed without a date", "projects: Date changed", "projects: Independent of done", "projects: Planned next milestone", "projects: Confirmed next milestone" and "projects: Planned and overdue" (`nextMilestone` returns planned and confirmed alike). Verify: `pnpm test` green

## 2. Form

- [x] 2.1 `src/pl.ts`: `done: 'zrealizowane'` (was 'zrobione'), `planned: 'planowane'`, `confirmed: 'potwierdzone'`, `unconfirmed: 'niepotwierdzone'`. Verify: `pnpm build` type-checks
- [x] 2.2 `src/form.tsx`: a radio pair "planowane" / "potwierdzone" per milestone, named after its key, toggling the key in `draft.confirmed` the way `setDone` toggles `done`; the "zrealizowane" checkbox stays. `src/style.css`: radio pair and checkbox on one row under the date, keeping the milestone grid aligned. Verify: `pnpm build` type-checks; in the dev server arrows move only within one milestone's pair

## 3. Calendar, list and "Terminy"

- [x] 3.1 `src/calendar.ts`: `Entry` gets `confirmed: boolean` from `isConfirmed`; `state` is unchanged. Verify: `pnpm build` type-checks
- [x] 3.2 `src/calendar.test.ts`: extend "calendar: Done and overdue in one month" with `pbDoUrzedu` confirmed, and add "calendar: Planned chip", "calendar: Confirmed chip", "calendar: Planned month", "calendar: Planned and overdue", "calendar: Planned and done" (entry `done`, so the view shows no mark) and "calendar: Planned entry" (listed by `deadlines` under the week of 2026-11-16, `confirmed` false). Verify: `pnpm test` green
- [x] 3.3 `src/calendar-view.tsx`: a small exported `PlannedMark` (a round "?" in the milestone colour, styled like the overdue "!", `title` "niepotwierdzone"); `Chip` sets `data-planned` when the entry is neither confirmed nor done and renders the mark inside `<b>` before the short label, so an overdue chip reads "! ? PB"; hover text adds "niepotwierdzone" before "po terminie"; the legend gets an entry for the mark. `src/style.css`: `.chip[data-planned]` fainter tint and text than a confirmed chip, no strike-through, plus the mark's style. Verify: chips in the month grid, strip and overview in the dev server
- [x] 3.4 `src/list.tsx` and `src/deadlines.tsx`: `PlannedMark` before the date of a planned next milestone and a planned deadlines entry. Verify: the list and "Terminy" in the dev server

## 4. Docs

- [x] 4.1 `AGENTS.md`: the milestones bullet says a milestone is planned or confirmed and, separately, done; add the rows `planowane / potwierdzone | confirmed | Date is a guess until marked confirmed` and `zrealizowane | done | Milestone reached` after "status" in the domain terms table. Verify: `git diff AGENTS.md` shows only those lines

## 5. Verify

- [x] 5.1 `pnpm test` and `pnpm build` are green; `openspec validate --all --strict` passes
- [x] 5.2 Verify in the running dev environment (`pnpm dev`, Chrome or Edge, a scratch data folder outside the repo): open an existing project and see "planowane" on every milestone and its chips faint with "?"; set "uzyskanie pozwolenia" to a date next month, pick "potwierdzone", save, and see `"confirmed": ["pozwolenie"]` in its file and a full-colour "pozw." chip; pick "planowane" again and see the faint "? pozw." chip with its hover text, the legend entry and "?" before the date in the list and "Terminy"; move the date to last week and see "! ? pozw." outlined as overdue; tick "zrealizowane", save, and see the chip dimmed and struck through with no "?"
