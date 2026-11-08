## Context

Leaves (change 008) set the pattern this change follows: one file per item in its own
folder, read with the projects by the generic `readFolder` in `src/storage.ts`, written
and deleted with the `updatedAt` check (`checkedWrite`, `checkedDelete`), reloaded alone
after a change (`reloadLeaves` in `src/main.tsx`), and edited through one hook and dialog
(`useLeaveEdit` in `src/leaves-view.tsx`) shared by the tab and the calendar. Task cards
(`src/board.tsx`) already draw the initials circle from `badgeFor` / `textOn` in
`src/tasks.ts`, and open their dialog through `Portal` because the project page is one
`<form>`. The "Nowy projekt" menu in `src/list.tsx` uses the native `popover` attribute.

In the calendar, `shownOnCalendar` returns milestone entries and leaves, `Show` is one of
three values in `k`, and `overviewMonths` caps a block's milestones at eight. See
proposal.md for why and the specs for the behaviour.

## Goals / Non-Goals

**Goals:**

- Meetings stored, conflict-checked and reloaded exactly like leaves, reusing the same
  storage code.
- One dialog and one edit hook for the three places that open a meeting.
- Pure, tested logic for validation, sections and order, filters, "Pokaż" parsing and
  the merged overview list; the views only render it.

**Non-Goals:**

- A shared dialog or list component across tasks, leaves and meetings.
- Meetings in the "Terminy" deadlines list (`deadlines()` stays milestone-only).

## Decisions

### 1. One file per meeting, in `spotkania/`

`spotkania/<id>.json` with `id`, `title`, `date`, `start?`, `end?`, `architect`,
`projectId?`, `type`, `note`, `updatedAt`. Same reasoning as leaves: per-item files keep
a conflict as narrow as the edit. Times are separate `HH:MM` strings rather than full
timestamps, so the day stays a plain `YYYY-MM-DD` like every other date in Kalka and
time zones never shift it. `type` values are the Polish words (`stacjonarne`, `online`),
like project `status`.

### 2. Storage reuse

`openFolder` creates `spotkania/`. `readProjects` also reads it through `readFolder` with
`parseMeeting`, broken files prefixed `spotkania/`. `ReadResult` gains
`meetings: LoadedMeeting[]` (`{ meeting, file, duplicate }`); `readMeetings(dir)`,
`saveMeeting` (on `checkedWrite`) and `deleteMeeting` (on `checkedDelete`) mirror the
leave functions. `main.tsx` adds `reloadMeetings()` like `reloadLeaves()` and passes it
to the tab, `ProjectForm` and `CalendarView`.

### 3. Pure logic in `src/meetings.ts`

- `Meeting` type, `emptyMeeting(projectId?, architect?)`, `parseMeeting(raw)` (throws on
  missing `id` or a `date` that is not a day, reusing `isDay` from `leaves.ts`; drops a
  bad time, unknown type becomes `stacjonarne`), `meetingError(draft)` returning the
  dialog message or `''`.
- `byTime(a, b)`: day, then start time with untimed after timed, then title
  (`localeCompare(..., 'pl')`); used by the sections, the day cells and the overview.
- `splitMeetings(rows, today)`: `{ current, past }`, current `date >= today` ascending,
  past descending (the reverse of `byTime`).
- `formatTimes(m)` (`10:00-11:30`, `10:00`, `''`) and `formatWhen(m)` (day plus times).
- `projectIdOf(m, projects)`: the `projectId` when a loaded project has it, else `''`, so
  a dangling id counts as no project everywhere (filters, tab, dialog).
- `filterMeetings(rows, { architect, withProject }, projects)` for the tab, and
  `meetingsForCalendar(rows, filter, projects)` for the calendar: with a project chosen,
  only meetings whose `projectIdOf` is that project's id; otherwise by architect when set.
- `initialView(count)`: `'cards'` up to six, `'list'` above.

### 4. "Pokaż" as a set in `k`

`showOf(k)` becomes a set of `terminy | spotkania | urlopy`: no `k` means all three,
`k=nic` none, otherwise the comma-separated kinds; unknown words are ignored. Old links
need not keep their meaning (proposal decision 11). `showParam(set)`
writes the reverse, dropping `k` when all three are chosen. `shownOnCalendar` returns
`{ all, meetings, leaves }`, each empty when its kind is not chosen.

The control is a button reading "wszystko" / the chosen kinds / "nic" with
`popovertarget` pointing at a `popover="auto"` panel of three checkboxes, so Esc and
outside clicks close it natively, as in the "Nowy projekt" menu, and the toolbar keeps
one line. Alternative: `<select multiple>`, which renders as a tall list box and needs
Ctrl-click; or three inline checkboxes, which don't fit the filter line next to a long
project title.

### 5. Calendar rendering

- Month grid: per day, `meetingsByDay` (sorted with `byTime`) renders meeting chips in
  the same chips row as milestones, before them; leave lines stay above. A meeting chip
  is a `<button>` with `--c` from `badgeFor`, a full `border` in `--c` (milestone chips
  have none), the initials circle, times and title; `data-past` dims it with the same
  opacity as a planned milestone.
- Overview: `overviewMonths` takes the merged, sorted list of milestone entries and
  meetings (`{ kind: 'milestone', entry } | { kind: 'meeting', row }`, a day's meetings
  first), so the eight-entry cap and "+N więcej" count both. The empty text becomes
  "brak wpisów" when a block shows nothing at all, including leaves.
- Clicking a chip or overview entry opens the dialog through `useMeetingEdit`, in
  place, like leaves.

### 6. One dialog, one hook

`src/meetings-view.tsx` exports `MeetingDialog` and `useMeetingEdit(data, reload, defaults)`
holding the open meeting, save / delete through `saveMeeting` / `deleteMeeting`, and the
conflict message, like `useLeaveEdit`. Unlike leaves, "Usuń" is always in the dialog of an
existing meeting (no row buttons anywhere). The dialog is rendered through `Portal` from
`board.tsx` so it works inside the project form, as the task dialog does.

The project choice reuses `projectChoices` from `calendar.ts` for order and labels but
stores the project's `id`; sync conflict copies sharing an id appear once. Date and times
are native `<input type="date">` and `<input type="time">`, which give `YYYY-MM-DD` and
`HH:MM` directly.

### 7. Views

- Tab: route `#/spotkania?a=&j=` (`j`: `z` with project, `bez` without), added to `VIEWS`
  and the header between "Terminy" and "Urlopy". Rows are a table; clicking a row (a
  button in the title cell for keyboard users) opens the dialog.
- Project page: `MeetingsSection` after `TaskBoard` in `form.tsx`, only for a saved
  project. The cards/list choice is component state seeded from `initialView`; cards are
  a CSS grid, three columns from 900 px, the note clamped to three lines with
  `-webkit-line-clamp`, list notes cut with `text-overflow: ellipsis`.
- `TypeMark`: "@" or an inline SVG building (a few rects, `currentColor`), colours as two
  new tokens in `style.css` used by both views and the dialog's type choice hint. No
  icon font or library.

### 8. Calendar as the start view

The calendar keeps its route `#/kalendarz`, so its links, `onParams` and `projectHref`
stay as they are. An empty path (`#/` or no hash) is redirected with `replaceState` to
`#/kalendarz`, keeping the query, and the project list moves to `#/projekty`. `VIEWS`
gains `projekty`; the list's project and new-project links set `z=projekty`, so `back()`
returns there, and a form link without `z` returns to the calendar. The header renders
"Kalendarz" first, and the brand link points at `#/kalendarz`. The broken-files notice
moves from `list.tsx` to `main.tsx`, under the header for every route. Alternative:
render the calendar at `#/` itself, which means changing every `#/kalendarz` link and
the form's way back for no visible gain.

## Risks / Trade-offs

- [A busy day cell grows tall with meetings and milestones] → acceptable for a small
  studio; the day shows all chips as it does today.
- [The `a` filter means the meeting's architect on "Spotkania" and in the calendar's
  meetings, but the lead architect for milestones] → matches the engineer's decision;
  the hover text names the meeting's architect.
- [Old bookmarks: `#/` now opens the calendar, and a calendar link with an old `k` value
  may show different kinds] → accepted (proposal decision 11); the tabs lead anywhere.
- [Check-then-write is not atomic] → same known limit as projects, tasks and leaves.

## Migration Plan

None. `spotkania/` is created on first open; older folders keep working. Rollback is a
revert; leftover `spotkania/` files are ignored by older versions.
