## Why

Two small requests from QA on the tasks and milestones shipped so far. Tasks have no way
to say "do this first", so an urgent job sinks among the others in the "Zadania" tab,
which orders by due date only. And adding a milestone with a named style (for example
"akceptacja koncepcji") makes the user type the style's name a second time as the
milestone's name.

## What Changes

- A task can be marked urgent with a "pilne" checkbox in the task dialog, on the project
  page and in the "Zadania" tab. The task file gets `"urgent": true`; without it a task is
  not urgent, so older files read as before.
- An urgent task that is not done shows a red "!" before its title, on the project board
  and in the "Zadania" tab. A done task keeps the mark in its file but shows no "!"; it
  shows again when the task leaves "Wykonane".
- In the "Zadania" tab, "Do zrobienia" and "W trakcie" put urgent tasks first, each group
  ordered by due date as today. "Wykonane" keeps its order by completion time. The project
  board keeps the manual order; urgent tasks do not jump.
- The milestone dialog ("+ Dodaj termin", and "edytuj" for an added milestone) shows the
  style first and the name second.
- Picking a style fills the name with the style's name when the name is empty or still
  holds the name of the style picked before. A name the user typed is never replaced.
  Picking "inny" clears a filled-in name, so the user writes their own. The name stays
  required.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tasks`: urgent mark on a task (field, dialog checkbox, "!" on both cards), urgent
  first in the tab's "Do zrobienia" and "W trakcie", `urgent` in the task file
- `projects`: style first in the milestone dialog, the name filled from the style

## Impact

- Specs: `tasks` (ADDED: urgent task; MODIFIED: order in the tasks tab, task file),
  `projects` (MODIFIED: add milestone, edit added milestone)
- Code: `src/tasks.ts` (`urgent` in `Task` and `normalizeTask`, urgent first in the tab's
  order), `src/board.tsx` (checkbox in the task dialog, "!" on the project board card),
  `src/tasks-view.tsx` ("!" on the tab card), `src/model.ts` (name-from-style rule),
  `src/form.tsx` (milestone dialog), `src/pl.ts`, `src/style.css`
- Tests: `src/tasks.test.ts`, `src/model.test.ts`
- Docs: `AGENTS.md` (the `zadanie` domain term mentions `urgent`)
- Data: no migration; `urgent` is written only when set
- No new dependency

## Decisions

Settled with the engineer on 2026-11-09:

1. **One change for two cards**: both are small QA follow-ups; the project type and the
   project data cards are separate changes.
2. **Project board order unchanged**: urgent tasks keep their manual place there; only the
   "Zadania" tab moves them up.
3. **Urgent first in the tab**, then by due date within each group. "Wykonane" is not
   affected.
4. **Done tasks show no "!"** but keep the mark, so moving one back brings it back
   (proposed, written on the card).
5. **Name filled from the style** when empty or still the previous style's name; "inny"
   clears a filled-in name; the same in the "edytuj" dialog (proposed, written on the
   card).
6. **Style before name** in the milestone dialog.
7. **Out of scope**: a "tylko pilne" filter, urgent tasks in the calendar, editing
   template milestones, editing the style list.
