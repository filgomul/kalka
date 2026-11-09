# Tasks

## 1. Grouping by day

- [ ] 1.1 `src/tasks.ts`: `byDay(rows, today)` returns `{ key, rows }[]` in group order: `'overdue'` (tasks where `taskState` is `overdue`), then one group per due date key (a day `YYYY-MM-DD`, a month `YYYY-MM` sorting after the days of that month, using `parseDate(...).due` like `dueKey`), then `''` for undated; each group's rows through `byDue`; groups without rows left out. `src/tasks.test.ts`: "tasks: Groups and counts", "tasks: Overdue together", "tasks: Urgent inside a day", "tasks: Urgent keeps its day", "tasks: Month date", "tasks: Past month", "tasks: Without a date", "tasks: Empty column". Made-up titles only. Verify: `pnpm test` green

## 2. Remembered view

- [ ] 2.1 `src/tasks.ts`: `loadTodoView(store)` returns `'days'` when `store.getItem('kalka.zadania.widok') === 'dni'`, else `'urgent'`, and `saveTodoView(store, view)` writes it; both swallow errors from a throwing `store` (and a missing one). `src/tasks.test.ts`: "tasks: First visit" (empty fake store gives `'urgent'`), "tasks: Remembered" (save `'days'` then load gives `'days'`), "tasks: Storage blocked" (a store whose methods throw gives `'urgent'` and save does not throw). Verify: `pnpm test` green

## 3. "Do zrobienia" header and groups

- [ ] 3.1 `src/pl.ts`: `viewUrgent: 'Pilne'`, `viewDays: 'Dni'`, `noDue: 'bez terminu'`, plus a `dayLabel(key)` or equivalent for "wt 10.11.2026" built from `weekdays` and `formatDate` (month keys format as "11.2026", `'overdue'` as the existing `overdue`). `src/tasks-view.tsx`: `useState(() => loadTodoView(storage()))` where `storage()` returns `localStorage` or `undefined` inside try/catch; a `.seg` with two `aria-pressed` buttons in the "Do zrobienia" `h3` row, clicks set state and `saveTodoView`; in `'days'`, "Do zrobienia" renders `byDay(cards, today).map(group)`, each group a wrapper with a header (label, "dziś" mark when the key is today, count) and its cards; "W trakcie" and "Wykonane" untouched. `src/style.css`: group header, alternating band background (`:nth-child` on the group wrapper, tinted from `--lane-tint`), today's header highlighted, seg sized to fit the column header. Verify: `pnpm build` type-checks; in the dev server "Dni" groups the column and a reload keeps it
- [ ] 3.2 `AGENTS.md`: the **tasks** line mentions "Do zrobienia" in the tab switching between urgent-first and grouped by day, remembered per browser. Verify: `git diff AGENTS.md` shows only that line

## 4. Verify

- [ ] 4.1 `pnpm test` and `pnpm build` are green; `openspec validate --all --strict` passes
- [ ] 4.2 Verify in the running dev environment (`pnpm dev`, Chrome or Edge, a scratch data folder outside the repo, made-up data only): open "Zadania" with no stored choice ("Pilne" pressed, order as before); add tasks due today, in two days, overdue, a month date and none, one urgent; click "Dni" (groups, counts, "dziś", bands, urgent first in its day, "W trakcie" unchanged); reload and reopen the tab ("Dni" kept, address unchanged); drag a card from a group to "W trakcie" (count drops, empty group gone); open in an InPrivate / Incognito window ("Pilne")
- [ ] 4.3 Before the archive commit: rebase on `main` and check "Order in the tasks tab" in `openspec/specs/tasks/spec.md` still matches the MODIFIED copy apart from the intended edits
