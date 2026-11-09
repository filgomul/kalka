## Why

QA wants to see at a glance which tasks are due on which day, and how many fall on each
day. In the "Zadania" tab, "Do zrobienia" puts urgent tasks first and then sorts by due
date, so tasks due on the same day can end up apart and nothing marks where one day ends
and the next begins.

## What Changes

- "Do zrobienia" in the "Zadania" tab gets two buttons in its header: "Pilne" (today's
  order: urgent first, then by due date) and "Dni" (grouped by day).
- In "Dni", the column shows one group per due date, earliest first. Each group has a
  header with the weekday, the date and the number of tasks, and the groups alternate
  background bands so each day stands out. Inside a group, urgent tasks come first, then
  by title.
- Overdue tasks share one group, "po terminie", at the top. A task due in a month
  ("11.2026") gets a group for that month, after the days of that month. Tasks without a
  date go last, in a group "bez terminu". The group for today is marked "dziś". Days with
  no tasks are not shown.
- The chosen view is remembered in the browser and used the next time the tab opens. A
  browser that has never chosen, or that can't store it, opens with "Pilne".
- "W trakcie", "Wykonane", the project boards, the filters and dragging stay as they are.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tasks`: "Order in the tasks tab" covers "Do zrobienia" only in the "Pilne" view; new
  requirements for the view buttons and remembering the choice, and for the day groups

## Impact

- Specs: `tasks` (MODIFIED: Order in the tasks tab; ADDED: View of "Do zrobienia",
  "Do zrobienia" by day)
- Code: `src/tasks.ts` (grouping by day, reading the stored view), `src/tasks-view.tsx`
  (buttons in the column header, group headers), `src/pl.ts` (labels), `src/style.css`
  (group headers and bands)
- Tests: `src/tasks.test.ts`
- Docs: `AGENTS.md` (the **tasks** line)
- Storage: the view is kept in the browser's `localStorage`, under one key with no
  project data in it. It isn't shared through OneDrive, so each PC and browser keeps its
  own choice. This is the app's first use of `localStorage`.
- No new dependency, no change to task files

## Decisions

Settled with the engineer on 2026-11-09:

1. **Only "Do zrobienia" in the "Zadania" tab.** The project boards keep the order users
   set by dragging, and "W trakcie" and "Wykonane" are unchanged.
2. **A toggle, not a replacement.** "Pilne" stays the default, because urgent-first
   and grouping by day can't share one list: urgent tasks from several days would split
   those days in two.
3. **Remembered per browser**, not in the URL. Bookmarks don't carry the view.
4. **Buttons in the column header**, since they change only that column. Labels "Pilne"
   and "Dni" keep the header narrow.
5. **Out of scope**: day groups in other columns or on the project boards, showing
   days without tasks, sharing the choice between PCs.
