## 1. Urgent task

- [ ] 1.1 `src/tasks.ts`: `Task` gains optional `urgent?: true`; `normalizeTask` keeps it only when it is exactly `true`; `byDue` puts urgent rows first, then by due date and title as before (`splitDone` unchanged). `src/tasks.test.ts`: "tasks: Hand-edited urgent mark", "tasks: Urgent first", "tasks: Done ignores urgency", plus "tasks: By due date" still green. Verify: `pnpm test` green
- [ ] 1.2 `src/board.tsx`: "pilne" checkbox in `TaskDialog` (sets `urgent: true`, removes the key when unticked, so an unmarked file holds no `urgent`); the project board card shows a red "!" before the title, with `title` and `aria-label` "pilne", when the task is urgent and not done. `src/tasks-view.tsx`: the same "!" on the tab card. `src/pl.ts`: "pilne". `src/style.css`: the "!" mark in the overdue red. Verify: `pnpm build` type-checks; in the dev server ticking "pilne" writes `"urgent": true`, the "!" shows on both cards, the project board order stays, and a done urgent task shows no "!"
- [ ] 1.3 `AGENTS.md`: the `zadanie` domain term mentions `urgent`. Verify: `git diff AGENTS.md` shows only that line

## 2. Milestone name from the style

- [ ] 2.1 `src/model.ts`: pure `titleForStyle(title, fromStyle, toStyle)` returning the new style's name when `title` is empty or equals `fromStyle`'s name, an empty string when that holds and `toStyle` is "inny", and `title` unchanged otherwise. `src/model.test.ts`: "projects: Name from the style", "projects: Style picked again", "projects: Typed title kept", "projects: Back to inny", "projects: Change style of a filled-in name". Verify: `pnpm test` green
- [ ] 2.2 `src/form.tsx`: `MilestoneDialog` shows "styl" before "nazwa" and on a style change sets the title with `titleForStyle`, in both "Dodaj" and "Zmień". Verify: `pnpm build` type-checks; in the dev server picking "akceptacja koncepcji" fills the name, picking another style follows it, a typed name stays, "inny" clears a filled-in name, and "Dodaj" with an empty name still shows "Podaj nazwę terminu."

## 3. Verify

- [ ] 3.1 `pnpm test` and `pnpm build` are green; `openspec validate --all --strict` passes
- [ ] 3.2 Verify in the running dev environment (`pnpm dev`, Chrome or Edge, a scratch data folder outside the repo): on a project with three tasks in "Do zrobienia", mark the last one urgent and check the board order stays and "!" shows; in "Zadania" check urgent tasks lead "Do zrobienia" and "W trakcie" by date, tick one done and see the "!" go and come back on untick; open a task file and see `"urgent": true` set and removed; add milestones with "akceptacja koncepcji", then switch styles, type a name, pick "inny", and edit an added milestone's style through "edytuj"
