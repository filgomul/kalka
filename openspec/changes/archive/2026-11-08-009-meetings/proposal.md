## Why

The studio can't record meetings in Kalka. Opening a project, nobody sees when the
investors were last met or how many meetings there were, and meetings that belong to no
project (an office visit, a supplier) live only in people's own calendars. Meetings kept
in Kalka, on the project page, in their own tab and in the calendar, put them next to the
milestones and leaves.

## What Changes

- A meeting has a title, a date, optional start and end times, an architect (from
  `kalka.json`), an optional project, a type ("stacjonarne" or "online") and a note.
  Only the title and the date are required.
- A saved project's page gets a section "Spotkania" after "Zadania", listing that
  project's meetings in two sections, "Bieżące i nadchodzące" (date ascending) and
  "Minione" (date descending), like "Urlopy". Two buttons above switch between cards
  (three per row on a computer, like task cards) and a list (one row per meeting). It
  opens as cards when the project has at most six meetings, as a list otherwise.
- Each meeting shows its type in a corner: "@" for online and a building icon for
  stacjonarne, in one colour per type, the same in both views.
- "+ Dodaj spotkanie" on the project page opens a dialog with all fields, the project set
  to the open project and the architect to its lead architect. Clicking a meeting opens
  the same dialog filled in, with "Usuń" (after a confirm box).
- A fifth header tab "Spotkania", between "Terminy" and "Urlopy", lists every meeting as a
  list with the same two sections and a project column (empty for a meeting without a
  project) second after the date. It adds meetings (project empty by default), opens them
  for editing and deleting, and filters by architect and by "z projektem" / "bez
  projektu".
- Calendar "Miesiąc": each meeting is a raised chip on its day, before the milestone
  chips, filled with the architect's colour, with the initials in a circle, the times and
  the title in bold. A day with meetings shows a dark pill with their count ("2
  spotkania") next to its number, so busy days stand out at a glance. Meetings before
  today are faded. Clicking one opens the meeting dialog in place.
- Calendar "Przegląd": meetings are listed among the milestones by date, as their own
  meeting entries, and count towards the eight entries a block shows.
- The calendar's architect filter also narrows meetings (by the meeting's architect) and
  the project filter shows only that project's meetings; the status filter narrows
  milestones only. Leaves still ignore all three.
- "Pokaż" becomes a multi-select of "Terminy", "Spotkania" and "Urlopy", all chosen by
  default, replacing the single choice "Terminy i urlopy" / "Terminy" / "Urlopy".
- "Kalendarz" becomes the start view and the first header tab: "Kalendarz", "Projekty",
  "Terminy", "Spotkania", "Urlopy". The app opens on the calendar once the folder is
  open, the "Kalka" name in the header leads there, and the project list gets its own
  address. The broken-files notice shows above every tab, not only on the project list.
- An empty overview block says "brak wpisów" instead of "brak terminów" / "brak
  urlopów", since any mix of kinds can be shown.
- Each meeting is its own file in a new `spotkania/` folder, with the same conflict
  check as tasks and leaves.

## Capabilities

### New Capabilities

- `meetings`: meeting fields and file, the meeting dialog (add, edit, delete), the
  "Spotkania" tab with its sections and filters, the "Spotkania" section on the project
  page with cards and list, the type mark, conflicts and sync conflict copies

### Modified Capabilities

- `calendar`: five header tabs with "Kalendarz" first and as the start view; the filters
  narrow meetings too; "Pokaż" becomes a multi-select with "Spotkania"; meetings in the
  month grid and the overview; empty overview block text; editing a meeting from the
  calendar
- `storage`: the folder layout gains `spotkania/`; meeting files are read with the
  projects and broken ones reported like task and leave files; opening the folder shows
  the calendar; the broken-files notice shows on every tab
- `tasks`: the project page order gains "Spotkania" after "Zadania"

## Impact

- Specs: `meetings` (new), `calendar` (MODIFIED: views navigation, overview, filters,
  show filter, leaves in the overview; ADDED: meeting chips, meetings in the overview,
  edit meeting from the calendar), `storage` (MODIFIED: choose data folder, reopen data
  folder, folder layout, read all projects; ADDED: read all meetings), `tasks` (MODIFIED:
  task board on the project page)
- Code: new `src/meetings.ts` (model and pure logic), new `src/meetings-view.tsx` (tab,
  project section, dialog, type mark); `src/storage.ts`, `src/main.tsx` (routes, tab
  order, start view, broken-files notice, meetings in the loaded data), `src/list.tsx`
  (own route, notice moved out), `src/form.tsx` (section on the project page),
  `src/calendar.ts` and `src/calendar-view.tsx` (chips, overview, filters, "Pokaż"),
  `src/pl.ts`, `src/style.css`
- Tests: new `src/meetings.test.ts`; `src/storage.test.ts`, `src/calendar.test.ts`
- Docs: `AGENTS.md` (folder layout, views, domain terms)
- Data: a new `spotkania/` folder, created on first open; no migration of existing files
- No new dependency (the building icon is an inline SVG, not Font Awesome)

## Decisions

Settled with the engineer on 2026-11-08, or proposed here for review:

1. **Calendar filters** (engineer): the architect filter keeps only that architect's
   meetings (the meeting's architect, not the project's lead); the project filter keeps
   only that project's meetings and hides those without a project; the status filter
   doesn't touch meetings. Leaves stay unfiltered.
2. **"Sortowanie" in the tab means filters** (engineer): "Architekt" (the shared `a`, as
   in "Urlopy") and "Projekt" with "wszystkie spotkania", "z projektem", "bez projektu".
   The sections keep their date order.
3. **Required fields** (engineer): title and date. Times are optional; "do" needs "od"
   and is not before it. The architect is optional (grey without one). Type defaults to
   "stacjonarne".
4. **Overview** (engineer): meetings have their own entry look and sit among the
   milestones in date order, sharing the eight-entry cap.
5. **Order within a day** (proposed): meetings before milestones, by start time, meetings
   without a time after timed ones, then by title.
6. **"Pokaż" as a dropdown of checkboxes** (proposed), so it stays on the filter line;
   closed it reads "wszystko", the chosen kinds ("Terminy, Urlopy") or "nic". The
   architect and project filters are disabled while neither "Terminy" nor "Spotkania" is
   chosen, the status filter while "Terminy" is not.
7. **Empty overview block** (proposed): one text, "brak wpisów", whatever "Pokaż" holds.
8. **Edit and delete in the dialog everywhere** (proposed): clicking a card, row or chip
   opens the dialog; "Usuń" sits in the dialog, as for tasks. The tab has no row buttons.
9. **Cards or list is not remembered** (proposed): each opening of a project picks by the
   six-meeting rule; the buttons switch until the page is left.
10. **Meeting whose project is gone** (proposed): a `projectId` matching no project file
    counts as a meeting without a project.
11. **Addresses may change** (engineer): a changed URL format (the "Pokaż" key, the
    project list moving to `#/projekty`) is not treated as breaking; old links need not
    keep working, since anyone can start again from the home page.
12. **"Kalendarz" first** (engineer): it is the first tab and the start view; the
    other tabs keep their order after it.
13. **Broken-files notice on every tab** (proposed): it used to show only on the project
    list, which is no longer the start view, so a broken file would go unnoticed.
14. **Meetings stand out** (engineer, after review on mockups, 2026-11-08): the
    outlined chip got lost among milestones; the chip is now filled in the architect's
    colour, raised and bold, and the day number gets a count pill (variant "E" without
    the side bar). The overview shows the full times, as the month grid does.
15. **Times from a list** (engineer, after review on prototypes, 2026-11-08): the
    browser's time fields were hard to use; "od" and "do" become text fields with a list
    of quarter hours, "do" showing the length and following "od" (variant "A").
16. **Out of scope**: meetings in the "Terminy" deadlines list, several architects or
    guests per meeting, meetings over several days, recurring meetings, reminders,
    adding a meeting by clicking a calendar day.
