## Why

Tasks live only on each project's page, so an architect who wants to know what to do
next has to open every project, and the studio owner can't see who has how much work.
One view of every task across projects, per architect and ordered by due date, answers
both, and lets people tick a task done where they look at it.

## What Changes

- A new header tab "Zadania", between "Terminy" and "Spotkania", lists the tasks of all
  projects in the three columns of the project board: "Do zrobienia", "W trakcie",
  "Wykonane".
- Filters, kept in the URL so "my tasks" can be bookmarked: "Architekt" (the assignee:
  "wszyscy architekci", each architect, "nieprzypisane" for tasks without one) and
  "Status projektu" (same choices and default as the calendar: active and on-hold
  projects). The architect and status carry over to and from the other tabs; the
  "nieprzypisane" choice stays on this tab.
- "Do zrobienia" and "W trakcie" are ordered by due date: overdue first, then the
  nearest, a month counting as its last day, undated last. The manual order of the
  project board does not apply here, and dragging within a column does nothing.
- "Wykonane" shows the five most recently done tasks, greyed; older ones are behind
  "pokaż starsze (N)".
- A card shows its title, its project, its due date (marked "po terminie" when overdue)
  and the assignee's initials circle, plus a "wykonane" checkbox. Ticking it marks the
  task done; unticking a done task puts it back in "Do zrobienia".
- Dragging a card to another column sets that state. Whether ticked or dragged, the task
  goes to the bottom of that column on its project's board.
- Clicking a card opens the same task dialog as on the project page, with a link to the
  project. "+ Dodaj zadanie" on the filter line adds a task, with a project choice in the
  dialog.
- A task file gets a `doneAt` timestamp, set when the task becomes done and removed when
  it leaves "Wykonane". Older files without it work unchanged; their `updatedAt` stands in.
- To make finishing tasks a bit more fun: done cards in the tab carry a "wykonane"
  stamp that lands when a task is marked done; a small swaying Gdańsk tenement next to the
  heading grows a floor for each task done this week; every third task marked done shows a
  bubble with a random cheer line from the studio's life for 5.2 seconds.
- Both boards get a six-dot grip on each card and lanes coloured burgundy (to do), ochre
  (in progress) and sage (done); the tab's checkbox is drawn like a marker tick.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tasks`: the "Zadania" tab with its filters, order, cards, checkbox, dragging between
  columns, recently done tasks and dialog, done stamp, building of the week and cheers;
  the task file gains `doneAt`
- `storage`: a task file without `projectId` is read as a task without a project
- `calendar`: the header gets a sixth tab "Zadania" and the architect and status
  filters carry over to it

## Impact

- Specs: `tasks` (ADDED: tasks tab, tasks tab filters, order in the tasks tab, tasks tab
  card, done checkbox, change state in the tasks tab, recently done tasks, task dialog
  from the tasks tab, done stamp, building of the week, cheer every third task;
  MODIFIED: task file), `storage` (MODIFIED: read all tasks), `calendar` (MODIFIED:
  views navigation)
- Code: `src/tasks.ts` (filter, order, recent split, `doneAt` stamping), new
  `src/tasks-view.tsx` (the tab), `src/board.tsx` (task edit logic and dialog shared with
  the tab, project link in the dialog), `src/main.tsx` (route, tab), `src/pl.ts`,
  `src/style.css`
- Tests: `src/tasks.test.ts`
- Docs: `AGENTS.md` (the tab, `doneAt`)
- Data: no migration; `doneAt` is written only from now on
- No new dependency

## Decisions

Settled with the engineer on 2026-11-08:

1. **Columns** like the project board, not a plain list.
2. **Five recently done** tasks shown; the rest behind "pokaż starsze (N)".
3. **Project status filter** as in the calendar: default active and on hold, plus each
   status and "wszystkie".
4. **"nieprzypisane"** is a choice in the architect filter, showing tasks without an
   assignee. "wszyscy architekci" shows them too, without a circle.
5. **No remembered architect**: the URL holds the choice, so a bookmark opens "my tasks".
6. **Landing place**: a task that changes state from this tab goes to the bottom of
   that column on its project's board, as when the state is changed in the dialog.
7. **Unticking** a done task puts it back in "Do zrobienia".
8. **No reordering** in this tab: the order is by date, and priorities stay in the
   project.
9. **`doneAt`** is a new field, because `updatedAt` also changes when a column is
   renumbered and would make old done tasks look recent.
10. **Tab position**: "Kalendarz", "Projekty", "Terminy", "Zadania", "Spotkania", "Urlopy".
11. **Rewards** (engineer, after review on mockups, 2026-11-08): checkbox "Szkic"
    (variant C), stamp (1) and building of the week (4), plus the cheer bubble (3) at
    every third task marked done, shown for 5.2 seconds. The building follows the tab's
    filters (proposed), so "my tasks" shows "my building". After a second round of
    mockups the building became the swaying Gdańsk tenement (variant "A+C 2").
12. **Add from the tab** (engineer, 2026-11-08): "+ Dodaj zadanie" at the end of the
    filter line; nothing is preselected, whatever the filter. A task may have no project
    (like a meeting): the tab's dialog offers "projekt" with "bez projektu", a "Projekt"
    filter shows all tasks, those with a project or those without, and a task whose
    project file is gone counts as one without a project instead of disappearing. The
    building moves to a sticky column on the right.
13. **Out of scope**: tasks in the calendar and in "Terminy" (decided on the card),
    dragging on a phone,
    start dates and reminders.
