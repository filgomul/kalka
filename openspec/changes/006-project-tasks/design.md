## Context

Projects are files in `projekty/`, read all at once into `Data` in `src/main.tsx` and
saved with an `updatedAt` check in `saveProject` (`src/storage.ts`). The project page
(`src/form.tsx`) is one `<form>` with a draft that only "Zapisz" writes. `kalka.json`
architects are read as `string[]` and used by the form, the list filter and the calendar
filter. Pure logic lives in plain modules (`model.ts`, `calendar.ts`) tested with
`node --test`. See proposal.md for why and the specs for the behaviour.

## Goals / Non-Goals

**Goals:**

- Tasks that save without touching the project draft or the project file.
- A task file and pure helpers that a later calendar, timeline or per-person view can
  read without changing the file format.
- Reuse the existing read, save and conflict code instead of a second copy of it.

**Non-Goals:**

- Any task code that only a later view would use (no unused `taskEntries` now).
- Keyboard reordering, touch drag-and-drop, a settings screen for architects.

## Decisions

### 1. One file per task, in `zadania/`

`zadania/<id>.json` with `id`, `projectId`, `title`, `description`, `due?`, `assignee`,
`status`, `order`, `updatedAt`. Alternatives: a `tasks` array in the project file (every drag
would rewrite the project file and clash with the open draft's `updatedAt`) or one
`zadania/<projectId>.json` per project (two people moving different tasks of one
project would conflict). Per-task files make the conflict check as narrow as the edit,
and a later cross-project view only lists one folder.

### 2. Shared folder read and checked write in `storage.ts`

`readProjects` becomes a generic folder read (parse, validate, mark duplicate ids,
collect broken files) used for `projekty/` and `zadania/`. `saveProject`'s body becomes
a generic checked write by folder; `saveTask` and a new `deleteTask` (same check, then
`removeEntry`) sit on it. A missing file is fine only for a new task (`loadedAt` empty);
for an edit or delete it is a conflict, which covers "task already deleted".

### 3. Pure task logic in `src/tasks.ts`

`Task` type, `normalizeTask` (unknown status to `todo`, missing text to empty, like
`normalize` for projects), `prepareTaskForSave` (trim, drop an invalid `due`),
`taskState(task, today)` returning `done | overdue | open` the way calendar `Entry.state`
does, `sortTasks` (by `order`; tasks without one after, by `parseDate(due).due`, undated
last, then title), `placeAt` for drops (decision 9) and the badge
helpers (`initialsOf(name)`, `badgeFor(settings, name)`, `textOn(hex)` for light or dark
text by relative luminance). Dates go through `parseDate` and `formatDate` from
`model.ts`, so a month-precision task behaves exactly like a milestone.

### 4. Settings keep `architects: string[]` and gain `badges`

`openFolder` reads each entry as a name or `{ name, initials?, color? }` and returns
`architects` (names, as today) plus `badges: Record<name, { initials, color }>` for the
entries that define them. The form, list and calendar keep working on names untouched.
Alternative: `Architect` objects everywhere, which changes three views for no visible
gain.

### 5. Tasks in `Data`, reloaded on their own

`ReadResult` gains `tasks` (each with its file name and duplicate flag, like `Loaded`);
broken task files join `broken` with a `zadania/` prefix. After every task write or
conflict the board calls `reloadTasks()`, which re-reads only `zadania/` and replaces
`data.tasks`. The project draft lives in `ProjectForm` state, so it is not disturbed.

### 6. Board inside the form, dialog outside it

`src/board.tsx` renders the "Zadania" section between "Terminy" and "Zakres branż" in
`ProjectForm`, only when `loaded` is set. Cards are `<button type="button">` so they
never submit the project form. The task dialog is a native `<dialog>` opened with
`showModal()` and rendered through `createPortal` (from `preact/compat`, part of the
installed `preact`) into `document.body`: a `<form>` cannot nest in the project form,
and Enter in a task field must not submit the project. Delete uses `confirm()`.

### 7. Native drag-and-drop

Cards are `draggable`; `dragstart` puts the task file name in `dataTransfer`. On
`dragover` the column works out the insertion index from the pointer's position against
the middle of each card and draws a line there; empty space below the last card means
the bottom. `drop` hands the column, the index and the moved task to `placeAt` and saves
what it returns. The dialog's state select is the keyboard and touch path for changing
columns; it puts the task at the bottom of the new column.

### 9. Order as a number between the neighbours

Each task stores `order`, a number. A drop at index `i` gives the moved task the midpoint
of its new neighbours' `order` (top: first minus 1, bottom: last plus 1, empty column: 0),
so normally only the moved task's file is written and two people reordering different
cards do not conflict. When a neighbour has no `order` (hand-edited file) or the gap is
below 1e-6 after many drops in one spot, `placeAt` renumbers the whole column 1, 2, 3,
... and returns every task whose `order` changed; the board saves them one by one, each
with its own check. A new task gets the bottom of "Do zrobienia".

Alternatives: an ordered id list per project in its own file (one more file every
reorder rewrites, and every drag conflicts with any other drag on the same project) or
integer positions renumbered on every drop (rewrites the column each time).

### 8. Ready for a later calendar and timeline

`due` uses the milestone format and `taskState` mirrors `Entry.state`, so a later change
can add task entries to `calendar.ts` with no new date code. In such a view the
architect filter means the assignee for tasks and the lead architect for milestones; that
belongs in that change's spec. A later `start` field is optional, so `normalizeTask`
reads old files without migration.

## Risks / Trade-offs

- [Two save modes on one page] -> hint under the "Zadania" heading; task dialog has its
  own "Zapisz" / "Anuluj", drag saves on drop.
- [Native drag-and-drop does not work on touch or with a keyboard] -> state select in
  the dialog.
- [OneDrive sync lag shows a stale board] -> the conflict check refuses stale writes and
  reloads; "Odśwież" in the list reads everything again.
- [Check-then-write is not atomic] -> same accepted limit as `saveProject`, now per task,
  so the window is smaller.
- [An older copy of the app open in a tab drops object entries from `architects`] ->
  write objects into `kalka.json` only after the deploy; the old app never rewrites the
  file, so nothing is lost.
- [A renumber writes several files and can stop half-way on a conflict] -> it is rare
  (hand-edited files or dozens of drops in one gap); on a conflict the board reloads and
  shows the order as written so far, which is still a valid order.
- [Many small files] -> hundreds of tasks read in one pass at open; fine for a studio.

## Migration Plan

None for data: `zadania/` is created on the first open, existing project files and a
plain-name `kalka.json` stay valid. Rollback is a redeploy of the previous build; it
ignores `zadania/`.
