## Why

Two small requests from QA on the tasks and milestones shipped so far. Tasks have no way
to say "do this first", so an urgent job sinks among the others in the "Zadania" tab,
which orders by due date only. And adding a milestone with a named style (for example
"akceptacja koncepcji") makes the user type the style's name a second time as the
milestone's name.

## What Changes

- A task can be marked urgent with a "pilne" flag toggle in the top-right corner of the
  task dialog, on the project page and in the "Zadania" tab; while it is on, the dialog's
  top edge is red. The task file gets `"urgent": true`; without it a task is
  not urgent, so older files read as before.
- An urgent task that is not done stands out on the project board and in the "Zadania"
  tab: a red folded top-right corner with "!", a red border and a light coral background.
  A done urgent task keeps only the red corner, without the border and background, so it
  is still clear it was urgent; the full look comes back when it leaves "Wykonane".
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

- `tasks`: urgent mark on a task (field, dialog toggle, marked card on both boards), urgent
  first in the tab's "Do zrobienia" and "W trakcie", `urgent` in the task file
- `projects`: style first in the milestone dialog, the name filled from the style

## Impact

- Specs: `tasks` (ADDED: urgent task; MODIFIED: order in the tasks tab, task file),
  `projects` (MODIFIED: add milestone, edit added milestone)
- Code: `src/tasks.ts` (`urgent` in `Task` and `normalizeTask`, urgent first in the tab's
  order), `src/board.tsx` (toggle in the task dialog, marked project board card),
  `src/tasks-view.tsx` (marked tab card), `src/model.ts` (name-from-style rule),
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
4. **Done urgent tasks keep the corner only** (engineer, after review on mockups,
   2026-11-09, variant B): no border or background, so they don't look like open work;
   moving one back brings the full look back. Replaces the first proposal of no mark at
   all.
5. **Name filled from the style** when empty or still the previous style's name; "inny"
   clears a filled-in name; the same in the "edytuj" dialog (proposed, written on the
   card).
6. **Style before name** in the milestone dialog.
7. **Look** (engineer, after review on mockups, 2026-11-09): a single "!" before the
   title was easy to miss. The card gets a red folded corner with "!" in the top-right,
   a red border and a coral background (variant C); the dialog's checkbox becomes a flag
   toggle in its top-right corner that turns the dialog's top edge red (variant 3). The
   urgent red is brighter than the burgundy "Do zrobienia" lane and the overdue red.
8. **Out of scope**: a "tylko pilne" filter, urgent tasks in the calendar, editing
   template milestones, editing the style list.
