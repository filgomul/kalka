## Context

Tasks (change 006) set the pattern this change follows: one file per item in its own
folder, read with the projects by the generic `readFolder` in `src/storage.ts`, written
with the `updatedAt` check of `checkedWrite`, deleted with the same check, and reloaded
alone after a change (`reloadTasks` in `src/main.tsx`). Architect colours already exist
as `settings.badges`, with `badgeFor` (grey fallback) and `textOn` in `src/tasks.ts`.

The month grid in `src/calendar-view.tsx` is one flat 7-column CSS grid of day cells, so
nothing can span several days. `CalendarFilters` is shared by "Kalendarz" and "Terminy"
and has no visible labels. See proposal.md for why and the specs for the behaviour.

## Goals / Non-Goals

**Goals:**

- Leaves stored and conflict-checked exactly like tasks, reusing the same read, write and
  delete code.
- Pure, tested logic for list sections, overview months and bar layout; the views only
  render it.

**Non-Goals:**

- A shared dialog component for tasks and leaves (two dialogs don't justify one yet).
- Any leave logic for the "Terminy" list or for warnings on milestones.

## Decisions

### 1. One file per leave, in `urlopy/`

`urlopy/<id>.json` with `id`, `architect`, `from`, `to`, `updatedAt`. Alternatives: a
`leaves` array in `kalka.json` (every edit rewrites the settings file and two people adding
leaves at once conflict) or one file per architect (same clash for one person's leaves).
Per-leave files keep the conflict as narrow as the edit, like tasks.

### 2. Storage reuse

`openFolder` creates `urlopy/`. `readProjects` also reads `urlopy/` through `readFolder`,
whose parse step rejects a file without `id` or `architect`, with a `from` / `to` that is
not a valid day, or with `to` before `from`; broken leave files get the `urlopy/` prefix.
`ReadResult` gains `leaves: LoadedLeave[]` (`{ leave, file, duplicate }`), plus a
`readLeaves(dir)` for reloading alone. `saveLeave` sits on `checkedWrite`; `deleteTask`'s
body becomes a generic checked delete by folder, used by `deleteTask` and `deleteLeave`.

### 3. Pure logic in `src/leaves.ts`

- `Leave` type, `parseLeave(raw)` (the validation above, throws like the project and task
  parsers), `leaveError(draft)` returning the dialog's message key or nothing.
- `splitLeaves(rows, today)`: `{ current, past }`, current = `to >= today` by `from`
  ascending, past by `from` descending, ties by architect name (`localeCompare(..., 'pl')`).
- `isOngoing(leave, today)`, `formatRange(leave)` (`DD.MM.YYYY - DD.MM.YYYY` or one date)
  and `formatShortRange(leave)` (`DD.MM - DD.MM`).
- `leavesInMonth(rows, month)`: leaves with a day in the month, by `from` then name.
- `weekLanes(rows, week)`: for one week row (7 ISO days) the pieces of the leaves that
  touch it, each `{ row, start, span, lane }` with `start` and `span` in columns 1-7.
  Lanes are filled greedily in `from`-then-name order, so overlapping leaves stack and a
  leave keeps its lane within the row. A leave may change lane on the next row; that's
  acceptable and keeps the logic per row.

Dates are compared as ISO strings and stepped with `addDays` from `calendar.ts`.

### 4. Month grid as week rows

Each week becomes its own 7-column grid (`.week`): day cells span every row of the week
(`grid-row: 1 / -1`) and draw the background, borders and day number; leave pieces sit in
rows 2 to lanes+1 at `grid-column: start / span`; each day's chips go in the last row of
its column. The grid's height grows with the lanes of that row only. Alternative:
absolutely positioned bars measured from cell positions, which breaks on resize and
horizontal scroll.

### 5. Colour

Rows, bars and overview entries use `badgeFor(settings.badges, name).color`. Bars are
solid with `textOn` text, as the spec asks for contrast. List rows and overview entries
set `--c` to that colour and reuse the chip tint (`--t`, `--x` and the left border),
so they look like milestone entries.

### 6. Filters

URL key `k` = `''` (Terminy i urlopy), `terminy` or `urlopy`. `CalendarFilters` wraps each
select in a `<label>` with the visible text and takes a `kind` flag so only the calendar
renders "Pokaż"; with `k=urlopy` it disables the other three selects. `CalendarView`
computes milestone entries only when `k` is not `urlopy` and leaves only when it is not
`terminy`; `visibleRows` stays milestone-only, so the calendar filters never reach leaves.
`architectOptions(listed, projects)` becomes `architectOptions(listed, extraNames)` so the
leaves view passes the leave architects and the other callers pass lead architects.

### 7. View and routing

Route `#/urlopy?a=` added to `VIEWS` and the header tabs; the architect choice uses `a`,
so tab links already carry it. `src/leaves-view.tsx` renders heading with "+ Dodaj
urlop", the architect filter, the two sections as tables, and a `<dialog>` opened with
`showModal()` (same structure as `TaskDialog`, no portal since it is not inside a form).
After any write it calls `reloadLeaves()` from `main.tsx`, which reads `urlopy/` alone,
like `reloadTasks`. A `ConflictError` shows the leave conflict message.

### 8. One dialog for the tab and the calendar

`leaves-view.tsx` exports `LeaveDialog` (fields, validation, save, and "Usuń" when a
`onRemove` is given) and a small `useLeaveEdit(data, reloadLeaves)` holding the open
leave, the save / delete calls and the conflict message. The "Urlopy" tab and
`CalendarView` both use it, so the calendar opens the dialog in place: bars and overview
leave entries are `<button type="button">`, the URL (month, range, filters) is untouched,
and after `reloadLeaves()` the calendar re-renders from the new `data.leaves`.
`main.tsx` passes `reloadLeaves` to `CalendarView` too. Alternative: link to
`#/urlopy` with the leave open, which loses the calendar's place.

## Risks / Trade-offs

- [Many overlapping leaves make a week row tall] → acceptable for a studio of a few
  people; the row grows instead of hiding bars.
- [A leave can switch lane between week rows] → the name repeats on every piece, so it
  stays readable.
- [The shared `a` means different things on "Urlopy" (person on leave) and in the
  calendar (lead architect)] → the labels differ ("Architekt" vs "Architekt
  prowadzący"); revisit if the studio finds it confusing.
- [Check-then-write is not atomic] → same known limit as projects and tasks.

## Migration Plan

None. `urlopy/` is created on first open; older folders keep working. Rollback is a
revert; leftover `urlopy/` files are ignored by older versions.
