## Context

The project board (`src/board.tsx`) holds all task editing: `TaskBoard` runs the writes
(`run` / `persist` with the `ConflictError` message and `reloadTasks`), `saveDialog`
puts a task that changes column at the bottom of it with `placeAt`, and `TaskDialog`
opens through `Portal`. All of it assumes one `projectId`. `Card` is a `<button>`, so it
can't hold a checkbox. Filters on other tabs live in the URL (`a`, `s`, ...) and the
header carries only `a` and `s` between tabs (`tabQuery` in `src/main.tsx`). See
proposal.md for why and the specs for the behaviour.

## Goals / Non-Goals

**Goals:**

- One code path for task writes, used by the project board and the tab, so the
  conflict check, the "bottom of the project's column" rule and `doneAt` can't differ
  between them.
- Pure, tested logic for the tab's filter, order and recent / older split.

**Non-Goals:**

- Changing the project board's behaviour or look (its cards get no checkbox).
- A generic board component shared by both views.

## Decisions

1. **`useTaskEdit(data, reloadTasks)` in `src/board.tsx`**, like `useMeetingEdit`: it
   owns the open task, the error message, `persist`, `saveDialog`, `remove`,
   `moveTo(row, status)` (bottom of that status on the task's project board via
   `placeAt`) and renders the dialog. `TaskBoard` and the tab both use it.
   `saveDialog` takes the project's column from `data.tasks` by the task's `projectId`,
   not from a board prop. Alternative: copy the write code into the tab - rejected, two
   copies of the conflict and placement rules.
2. **`doneAt` stamped in `persist`**: before writing each row it looks up the task as
   read (`data.tasks` by file) and applies a pure `stampDone(before, after, now)`: a
   task becoming done gets `doneAt = now`, one leaving done loses it, otherwise it is
   kept. Every write (dialog, drag on either view, checkbox, column renumbering) goes
   through `persist`, so no path can miss it. Alternative: set it in `placeAt` or in
   the dialog - rejected, several places to keep in step.
3. **Pure helpers in `src/tasks.ts`**: `filterTaskRows(rows, projects, filter)` (drops
   tasks without a project; architect, unassigned, project status with the
   `filterProjects` status rules), `byDue(rows)` (due date with a month as its last day,
   undated last, then title) and `splitDone(rows, n)` (`{ recent, older }` by `doneAt`,
   falling back to `updatedAt`, latest first).
4. **URL**: `#/zadania?a=&s=&n=`. "nieprzypisane" sets `n=1` and clears `a`; picking an
   architect clears `n`. Since `tabQuery` carries only `a` and `s`, "nieprzypisane"
   stays on this tab without a special case. Alternative: a reserved value in `a` -
   rejected, the calendar would read it as an architect's name.
5. **Own card in `src/tasks-view.tsx`**: a `<div>` with a title button, the checkbox
   and the same footer markup (date, `badgeFor` / `textOn` circle) and CSS classes as
   the board card. Alternative: make the board `Card` a `<div>` too - more churn on a
   view this change doesn't touch.
6. **Dragging per column only**: `dragover` / `drop` on the column, `.col[data-over]`
   marks it; no insertion line, since the order is by date. A drop on the card's own
   column is ignored.
7. **"pokaż starsze" is local state**, not in the URL: it resets on leaving the tab.

## Risks / Trade-offs

- [`doneAt` relies on the task as read] → a conflict already refuses a write when the
  file changed since it was read, so `before` is the file's current content when the
  write goes through.
- [Old done tasks fall back to `updatedAt`, which renumbering touches] → only until
  each is done again; they were done before the tab existed, so their exact order
  matters little.
- [Many done tasks across projects] → only five render until "pokaż starsze"; the
  rest is a sort of at most a few hundred items.

## Migration Plan

No data migration. `doneAt` appears in files as tasks are done from now on. Rollback
is a revert; older code ignores the extra field.
