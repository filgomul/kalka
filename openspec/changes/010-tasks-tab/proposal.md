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
  project.
- A task file gets a `doneAt` timestamp, set when the task becomes done and removed when
  it leaves "Wykonane". Older files without it work unchanged; their `updatedAt` stands in.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tasks`: the "Zadania" tab with its filters, order, cards, checkbox, dragging between
  columns, recently done tasks and dialog; the task file gains `doneAt`
- `calendar`: the header gets a sixth tab "Zadania" and the architect and status
  filters carry over to it

## Impact

- Specs: `tasks` (ADDED: tasks tab, tasks tab filters, order in the tasks tab, tasks tab
  card, done checkbox, change state in the tasks tab, recently done tasks, task dialog
  from the tasks tab; MODIFIED: task file), `calendar` (MODIFIED: views navigation)
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
11. **Out of scope**: tasks in the calendar and in "Terminy" (decided on the card),
    adding a task from this tab (the dialog has no project choice), dragging on a phone,
    start dates and reminders.
