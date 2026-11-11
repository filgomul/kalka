## Why

The calendar shows single dates, but not how long each project runs or how projects
overlap. The studio wants one picture of every project from its first to its last
milestone (Trello card "Gantt chart"), to see which projects run at the same time and
what comes next in each.

## What Changes

- Kalendarz gets a third mode, "Harmonogram", after "Miesiąc" and "Przegląd", kept in
  the URL like the other two.
- Harmonogram shows one row per visible project that has at least one dated
  milestone, ordered by its first date. A bar runs from the earliest to the latest
  milestone date; a month date counts from the month's first day at the start and to
  its last day at the end.
- A day milestone is a diamond on its day in its style's colour; a month milestone is
  a band over that whole month. Several milestones of one project on the same day, or
  in the same month, are one mark with their number; hovering lists them.
- Marks show the calendar's states: done, overdue and planned ("?").
- Clicking a row's label or a mark opens the project form, which comes back to
  Harmonogram with the same range and filters.
- Harmonogram uses the overview's month range ("od", "do", 3/6/12/24, previous, next,
  "Dziś"; 6 months by default), shared with "Przegląd". A today line marks the
  current day. Rows reaching past the range continue to its edge.
- The project filter becomes a multi-select ("Projekty") in every calendar mode and in
  "Terminy": checkboxes with "zaznacz wszystkie" and "odznacz wszystkie", all ticked
  by default. Its options are the projects that pass the architect and status
  filters; changing either of those ticks all projects again.
- **BREAKING (behaviour)**: choosing projects no longer turns the architect and status
  filters off. Old links with one `p=` still open with that one project ticked.
- The range gets a fourth shortcut, "24" (the longest range allowed), in both
  "Przegląd" and "Harmonogram".
- "Pokaż" is hidden in Harmonogram: it shows milestones only, never meetings or
  leaves.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `calendar`: the Harmonogram mode (ADDED: Harmonogram rows, Harmonogram bars and
  marks, Stacked marks); the third mode and the shared range (MODIFIED: Overview,
  Overview range, with a "24" shortcut); the multi-select project filter (MODIFIED: Filters); "Pokaż" not in
  Harmonogram (MODIFIED: Show filter); opening a project from Harmonogram (MODIFIED:
  Open project from calendar)

## Impact

- Specs: `calendar` only
- Code: `src/calendar.ts` (rows, bar span, marks and stacks for Harmonogram; project
  selection in the filter), `src/calendar-view.tsx` (the mode, the multi-select
  filter), `src/deadlines.tsx` (reads the new filter), `src/meetings.ts` (meetings of
  several projects), `src/pl.ts` (labels), `src/style.css` (rows, bars, diamonds,
  bands, today line)
- Tests: `src/calendar.test.ts`, `src/meetings.test.ts`
- Docs: `AGENTS.md` (calendar line: three modes, multi-select project filter)
- URL: `w=harmonogram`; `p` repeated once per chosen project, `p=nic` for none, absent
  for all. Old single-`p` links keep working.
- No data change, no new dependency
- Tasks, meetings, leaves, "Projekty" and the other tabs are not touched beyond the
  shared project filter in "Terminy".

## Decisions

Settled with the engineer on 2026-11-11:

1. **Third mode in Kalendarz**, named "Harmonogram", not a new tab.
2. **Architect and status narrow the project options**; the project multi-select picks
   among them, all by default, with select-all and select-none.
3. **The multi-select project filter is used everywhere** the project filter is
   (Miesiąc, Przegląd, Harmonogram, Terminy).
4. **Range like "Przegląd"**: 6 months by default, 3, 12 or 24 by shortcut; "24" is
   added to "Przegląd" as well.
5. **No dates, no row**; one date gives one diamond with no bar; same-day or
   same-month milestones of a project stack into one numbered mark with a hover list.
6. **States shown** as in the calendar.
7. **Click opens the project**; rows ordered by first date.
8. **Only Kalendarz changes** (plus the shared filter in Terminy).

## Open questions

Defaults written into the spec; say if any should differ:

1. **Bar colour**: neutral grey, the colour is on the marks. Alternative: the lead
   architect's colour from `kalka.json`.
2. **Rows outside the range**: a project whose dates all fall before or after the
   range has no row. Alternative: keep the row, empty, with an arrow.
3. **Stacked mark colour**: neutral, with no state of its own; the hover list gives
   each milestone's state.
4. **Ties in row order**: same first date, then l.p., then title.
5. **Filter text when closed**: "wszystkie projekty", the project's "l.p. title" when
   one is ticked, "N z M" for several, "żaden" for none.
