## Why

The studio can't see in Kalka who will be away. Leaves sit in people's heads or in other
calendars, so a milestone can be planned for a week the lead architect is on holiday.
Leaves kept in Kalka, listed in one place and drawn on the calendar as a continuous bar,
make absences visible next to the milestones.

## What Changes

- A fourth header tab "Urlopy" after "Terminy". It lists leaves in two sections:
  "Bieżące i nadchodzące" (not yet ended, earliest start first) and "Minione" (ended,
  latest start first), so new leaves stay on top as the list grows over the years and old
  ones are never deleted. A leave going on today is marked "trwa".
- Each row shows the architect and the dates "od - do" in the architect's colour from
  `kalka.json`, like the coloured milestone column in "Terminy", with "Edytuj" and "Usuń"
  buttons. "Usuń" asks for confirmation.
- "+ Dodaj urlop" opens a dialog: architect (from `kalka.json`), "od" and "do" (whole
  days). "Edytuj" opens the same dialog filled in.
- The "Urlopy" tab filters by architect (the person on leave), sharing the architect
  choice with the other tabs.
- Calendar "Miesiąc": each leave is a bar in the architect's colour across the days from
  "od" to "do", above the milestone chips, cut at the end of each week row.
- Calendar "Przegląd": each month block lists the leaves that touch that month at the
  top, above its milestones, with their dates.
- Clicking a leave bar or overview leave entry opens the leave dialog, where it can be
  changed or deleted without leaving the calendar.
- Calendar gets a fourth filter "Pokaż" after the project filter: "Terminy i urlopy"
  (default), "Terminy", "Urlopy".
- The calendar's architect, status and project filters narrow milestones only; every
  architect's leaves stay visible while "Pokaż" includes leaves.
- The filters of "Kalendarz" and "Terminy" get visible labels: "Architekt prowadzący",
  "Status projektu", "Projekt" and, in the calendar, "Pokaż".
- Each leave is its own file in a new `urlopy/` folder, with the same conflict check as
  tasks.

## Capabilities

### New Capabilities

- `leaves`: the "Urlopy" tab, leave fields, adding, editing and deleting leaves, list
  sections and order, the architect filter, row colour, the leave file, conflicts and
  sync conflict copies

### Modified Capabilities

- `calendar`: four header tabs; labelled filters plus the new "Pokaż" filter; leave bars
  in the month grid and leaves in the overview
- `storage`: the folder layout gains `urlopy/`; leave files are read with the projects
  and broken leave files are reported like task files

## Impact

- Specs: `leaves` (new), `calendar` (MODIFIED: views navigation, filters; ADDED: show
  filter, leave bars, leaves in the overview, edit leave from the calendar), `storage` (MODIFIED: folder layout; ADDED:
  read all leaves)
- Code: new `src/leaves.ts` (leave model and pure logic), new `src/leaves-view.tsx` (tab,
  list, dialog); `src/storage.ts` (read, save and delete leaves), `src/main.tsx` (route,
  tab, leaves in the loaded data), `src/calendar.ts` and `src/calendar-view.tsx` (bars,
  overview, "Pokaż", labels), `src/pl.ts`, `src/style.css`
- Tests: new `src/leaves.test.ts`, `src/storage.test.ts`, `src/calendar.test.ts`
- Docs: `AGENTS.md` (folder layout, views, domain terms)
- Data: a new `urlopy/` folder, created on first open; no migration of existing files
- No new dependency

## Decisions

Settled with the engineer on 2026-11-07, or proposed here for review:

1. **Calendar filters don't touch leaves** (engineer): architect, status and project
   narrow milestones only; with "Pokaż" set to "Terminy i urlopy" or "Urlopy" every
   architect's leaves are shown.
2. **Two sections** (engineer's suggestion): "Bieżące i nadchodzące" by start ascending,
   then "Minione" by start descending. A leave ending today is still current.
3. **Filter name "Pokaż"** (proposed), options "Terminy i urlopy", "Terminy", "Urlopy".
   While it is "Urlopy", the three other calendar filters are disabled, since they only
   narrow milestones.
4. **Button "+ Dodaj urlop"** (proposed), dialog titled "Nowy urlop" / "Urlop".
5. **Fields**: architect (required), "od" and "do" (required, whole days, "do" not before
   "od"; one-day leaves allowed). No note or type of leave.
6. **One file per leave** in `urlopy/<id>.json`, like tasks, so two people editing
   different leaves never block each other.
7. **Colour**: the architect's colour from `kalka.json`; grey without one, like the task
   circle. Text on calendar bars is light or dark, whichever reads better.
8. **Architect filter on "Urlopy"** reuses the shared architect choice (`a` in the URL), so
   it carries over between tabs like in "Terminy". On "Urlopy" it means the person on
   leave; in the calendar it still means the lead architect (decision 1).
9. **Leaves editable from the calendar** (engineer): clicking a bar or an overview leave
   entry opens the same dialog as "Edytuj" in "Urlopy", with "Usuń" in it; the calendar
   stays on the same month or range and filters. In "Urlopy" deleting stays a row button.
10. **Labels only on "Kalendarz" and "Terminy"**, which share the filter bar; the project
    list filters stay as they are.
11. **Out of scope**: leaves in the "Terminy" deadlines list, leave types (sick leave,
    half days), warnings when a milestone falls in a leave, adding a leave from the
    calendar.
