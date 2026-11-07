## Why

The studio has no place to keep the small jobs inside a project (drawings, calls,
documents to collect) or to say who does them. The person doing a job is often not the
lead architect, so the lead architect field cannot carry it. A task list per project with
an assignee, kept in Kalka next to the milestones, replaces notes and memory. It is also
the base for a later view of one person's tasks and for tasks in the calendar.

## What Changes

- The project page gets a "Zadania" section between "Terminy" and "Zakres branż": a board
  with three columns, "Do zrobienia", "W trakcie" and "Wykonane". The section is not
  shown for a new project until it has been saved.
- Each task has a title (required), a description, a due date with day or month
  precision like a milestone, an assignee picked from the architects in `kalka.json`
  (any architect, not only the lead one) and a status (the column).
- A card shows the title, the date in the bottom-left corner and a circle with the
  assignee's initials in the bottom-right corner. Clicking a card opens a dialog with
  every field, where the task can be edited or deleted (deleting asks for confirmation).
  "+ Dodaj zadanie" opens the same dialog empty.
- Cards are dragged between columns to change their status, and above or below other
  cards to set their order, so the studio can rank tasks by priority. The dialog's
  status choice moves a task to another column for keyboard and touch users.
- Every task change is saved at once and is not part of the project form's "Zapisz" /
  "Anuluj".
- Each task is its own file in a new `zadania/` folder, with its own conflict check, so
  two people working on different tasks of one project never block each other.
- Architects in `kalka.json` may be written as objects with initials and a hex colour
  for the circle. Plain names keep working: initials come from the name, the colour is
  grey.

## Capabilities

### New Capabilities

- `tasks`: the task board on the project page, task fields, adding, editing, moving and
  deleting tasks, card display and the task file

### Modified Capabilities

- `storage`: the folder layout gains `zadania/`; task files are read with the projects
  and broken or duplicate task files are reported like project files
- `projects`: the architects list in `kalka.json` accepts entries with initials and a
  colour

## Impact

- Specs: `tasks` (new), `storage` (MODIFIED: folder layout; ADDED: read all tasks),
  `projects` (MODIFIED: lead architect list)
- Code: new `src/tasks.ts` (task model and pure logic), new `src/board.tsx` (board,
  cards, dialog); `src/storage.ts` (architect entries, task read, save and delete),
  `src/main.tsx` (tasks in the loaded data), `src/form.tsx` (board placement),
  `src/pl.ts`, `src/style.css`
- Tests: new `src/tasks.test.ts`, `src/storage.test.ts`
- Docs: `AGENTS.md` (folder layout, domain terms)
- Data: a new `zadania/` folder, created on first open; no migration of existing files
- No new dependency: drag-and-drop and the dialog use what the browser has

## Decisions

Settled with the engineer on 2026-11-07:

1. **Not on a new project**: the task section appears once the project has been saved.
2. **Saved at once**: adding, editing, moving and deleting a task writes immediately;
   the project form's "Anuluj" never undoes a task change.
3. **One file per task** in `zadania/<id>.json`, pointing at its project by `projectId`.
4. **A single due date** per task, day or month precision, stored like a milestone date.
   A start date for a later timeline can be added as an optional field without
   migrating files.
5. **Any architect** can be assigned; the assignee has no link to the lead architect.
6. **Columns**: "Do zrobienia", "W trakcie", "Wykonane".
7. **Colour** in `kalka.json` as hex (`#rrggbb` or `#rgb`).
8. **Out of scope**: a per-person view of tasks and tasks in the calendar or "Terminy";
   each will be its own change.
9. **Delete confirmation** is the browser's own confirm box.
10. **Manual order**: cards are dragged above or below other cards, within a column and
    into another one, and the board keeps that order (priority). The due date does not
    reorder cards.
11. **Where a card lands without a chosen spot**: a new task goes to the bottom of "Do
    zrobienia"; a task moved with the dialog's status choice, or dropped on a column's
    empty space, goes to the bottom of that column.
12. **Tasks without a position** (hand-edited files) sort after the positioned ones, by
    due date, then title, until someone drags them.
13. **Order is shared**: there is one order per column for everybody, stored in the task
    files, not a personal order per user.
14. **Overdue**: a task that is not "Wykonane" with a due date before today shows its
    date marked "po terminie", like the project list.
15. **Unassigned** tasks show no circle. An assignee no longer in `kalka.json` keeps
    their name, gets initials from it and a grey circle.
16. **Conflict**: when a task changed on disk since it was read, nothing is written, the
    tasks are read again and a message asks to repeat the change.
17. **Sync conflict copies** of a task file (same id twice) both show as cards with a
    "konflikt synchronizacji" badge; deleting one in Kalka removes only that file.
18. **Finished and on-hold projects** keep an editable board.
19. **Orphan tasks** whose project file no longer exists are not shown anywhere.
20. **Initials text colour** is white or dark, whichever reads better on the chosen
    colour, so any hex stays legible.
21. **No keyboard reordering**: keyboard and touch users can change a task's column
    through the dialog but not its place within a column.
