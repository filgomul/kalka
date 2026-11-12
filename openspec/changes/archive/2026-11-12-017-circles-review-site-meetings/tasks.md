# Tasks

## 1. Harmonogram circles (variant D)

- [x] 1.1 `src/calendar-view.tsx`: the day mark class `gantt-diamond` becomes `gantt-dot` (comments too); `src/calendar.ts`: the `dayCenter` comment says "a circle". `src/style.css`: `.gantt-dot` is a circle (no rotation, `border-radius: 50%`), a stack 18px; `.gantt-band` loses the left stripe and gets rounded ends with an inset outline in `--c`; overdue, done and planned rules carry over to the new class. No logic changes, so no new test. Verify: `pnpm build` type-checks and `grep -rn diamond src` finds nothing; in the dev server (`?demo`) "Harmonogram" shows circles, a "2" circle, rounded outlined bands, and the overdue, done and planned looks

## 2. Meeting type "na budowie"

- [x] 2.1 `src/meetings.ts`: `MEETING_TYPES` gains `budowa` (after `online`); a new meeting stays `stacjonarne`; reading keeps unknown types as `stacjonarne`. `src/pl.ts`: `budowa: 'na budowie'` in `meetingTypeLabels`. `src/meetings.test.ts`: add "meetings: On site" (a meeting saved with `budowa` is written with `"type": "budowa"` and the type list is stacjonarne, online, budowa with stacjonarne as default) and "meetings: On site file" (a file with `"type": "budowa"` reads back as `budowa`); keep "meetings: Hand-edited file" green. Verify: `pnpm test` green
- [x] 2.2 `src/meetings-view.tsx`: `TypeMark` draws a hard-hat icon (inline SVG, stroke in `currentColor`, same size as the building) for `budowa`. `src/style.css`: `--site: #c25a1c` and `.type-mark[data-type='budowa']` in that colour with the same tint rule as the others. Verify: `pnpm build` type-checks; in the dev server a "na budowie" meeting shows the hard hat in cards, the list and on the project page, hovering it shows "na budowie", and the dialog offers the three types
- [x] 2.3 `AGENTS.md`: the **meetings** line and the "stacjonarne / online" domain row name "na budowie" (`budowa`, hard hat); the meeting file row lists the third type. Verify: `git diff AGENTS.md` shows only those lines

## 3. Task state "Do weryfikacji"

- [x] 3.1 `src/tasks.ts`: `TASK_STATUSES` is `todo`, `doing`, `review`, `done`; `doneAt` and overdue rules already key on `done`, so `review` is overdue like `todo`/`doing` and leaving `done` for `review` removes `doneAt`. `src/pl.ts`: `review: 'Do weryfikacji'` in `taskStatusLabels`. `src/tasks.test.ts`: extend "tasks: Overdue" with a `review` task; add "tasks: Waiting for a check" (a file with `"status": "review"` reads as `review`, no `doneAt`); extend "tasks: Done time set" (from `review`) and "tasks: Done time removed" (back to `review`); keep "tasks: Hand-edited file" green. Verify: `pnpm test` green
- [x] 3.2 `src/tasks-view.tsx`: the "Do weryfikacji" column is ordered like "W trakcie" (urgent first, then by due date, no day groups, no "pokaż starsze"); the "wykonane" checkbox on a `review` card ticks to `done`. `src/tasks.test.ts`: add "tasks: Waiting for a check (order)" with the scenario's three tasks through the same ordering helper the tab uses, and "tasks: Tick after the check" if the tick path is pure; otherwise check it in 5.2. Verify: `pnpm test` green
- [x] 3.3 `src/style.css`: `--lane-review: #4a86b8`, `--lane-review-tint: #e8f1f8` and `.col[data-status='review']`; `.board` gets four columns (`repeat(4, minmax(0, 1fr))`), keeping the existing narrow-screen rules (check they still stack the columns). Verify: in the dev server the project board and "Zadania" show four columns, the third light blue, at full width and on a narrow window
- [x] 3.4 `AGENTS.md`: the **tasks** line names four columns; the "do zrobienia / w trakcie / wykonane" domain row adds "do weryfikacji" (`review`) and the task file row lists it. Verify: `git diff AGENTS.md` shows only those lines

## 4. Demo data

- [x] 4.1 `src/demo.ts`: two or three tasks in `review` (one overdue, one urgent, one without a project) and three or four meetings of type `budowa` (the made-up site visits such as "Oględziny stropów", "Wizja lokalna na działce", "Odbiór końcowy kawiarni", and one more in the current month). `src/demo.test.ts`: "demo: Tasks" checks every status in `TASK_STATUSES` has tasks; "demo: Leaves and meetings" checks every type in `MEETING_TYPES` occurs, one `budowa` in the current month. Verify: `pnpm test` green; `?demo` shows them

## 5. Verify

- [x] 5.1 `pnpm test` and `pnpm build` are green; `openspec validate --all --strict` passes
- [x] 5.2 Verify in the running dev environment (`pnpm dev`, Chrome or Edge, `?demo` and a scratch data folder outside the repo, made-up data only): Harmonogram circles, stacks and rounded bands with their states; add, edit and reopen a "na budowie" meeting and check its mark everywhere and its file; drag a task to "Do weryfikacji" on a project board and in "Zadania", check overdue marking, ordering, the "wykonane" tick and untick, and `doneAt` in the file; four columns on a narrow window
- [x] 5.3 Before the archive commit: rebase on `main` and check the MODIFIED requirements still match `openspec/specs/` (no other change touched the calendar, meetings, tasks or demo requirements this change modifies)
