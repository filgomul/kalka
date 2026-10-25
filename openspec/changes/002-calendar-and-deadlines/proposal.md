## Why

The sheet cannot answer "what is due this month, and for whom?". The owner wants one
calendar across all projects, the same calendar narrowed to one architect or one
project, and a plain list of deadlines knocking on the door. A date alone cannot say
whether a step happened or slipped, so milestones also get a done flag: every date
becomes a planned date, and a past date that is not done is overdue.

## What Changes

- Each of the six milestones can be marked done in the project form, with or without a
  date. Files without done marks (everything written so far, and the CSV import) count
  as nothing done; the studio ticks off past milestones by hand once.
- The project list's next milestone becomes the earliest dated milestone that is not
  done, also when its date has passed; such a project shows its milestone as overdue and
  sorts to the top.
- A header with three tabs: Projekty, Kalendarz, Terminy, keeping the architect and
  status filters when switching.
- A month calendar showing every dated milestone of every visible project as a chip on
  its day, with a short label and a colour per milestone kind; done chips are dimmed,
  overdue ones marked. Month-precision milestones appear in a strip above the grid.
- The calendar takes the list's architect and status filters plus an optional
  single-project filter. Opening a project from the calendar or Terminy and then
  saving or cancelling returns to where the user came from.
- A "Terminy" view: every overdue milestone first, then milestones of the next 60 days
  grouped by week. Done milestones are left out.

## Capabilities

### New Capabilities

- `calendar`: month grid, milestone chips and their states, month-precision strip,
  filters, navigation between views, opening a project and returning, deadlines list

### Modified Capabilities

- `projects`: next milestone skips done milestones and includes overdue ones; new
  milestone done flag in the form and the project file

## Impact

- Specs: `calendar` (ADDED: views navigation, month grid, milestone chips, chip state,
  month-precision strip, filters, open project from calendar, deadlines list),
  `projects` (ADDED: milestone done; MODIFIED: next milestone)
- Code: `src/model.ts` (done flag, next milestone), `src/form.tsx`, `src/list.tsx`,
  `src/main.tsx` (routes, header tabs, return target), `src/calendar.ts` (grid and
  listing logic), `src/calendar-view.tsx`, `src/deadlines.tsx`, `src/pl.ts`,
  `src/style.css`
- Tests: `src/model.test.ts` (done flag, next milestone), `src/calendar.test.ts` (grid
  boundaries, chip state, week grouping, deadline window)
- Data: project files gain an optional `done` list; files without it stay valid, no
  migration

## Decisions

Settled with the engineer on 2026-10-25:

1. **Done flag per milestone**, kept apart from the dates so existing files need no
   change. A milestone can be done without a date.
2. **No automatic done marks.** Imported and existing past dates start as not done;
   the studio ticks them off by hand once.
3. **Ticking happens in the form only.** A checkbox in Terminy can come later.
4. **Overdue has no time limit.** A past milestone that is not done stays in Terminy
   until it is ticked off; upcoming ones are shown 60 days ahead.
5. **The calendar reuses the list's status filter**, so `zakończony` is hidden and
   `wstrzymany` shown by default. The list's text search does not carry over.
6. **Chips: light tint, coloured bar, short label, project title** (variant A of the
   mockup). Six fixed earthy colours that sit with the studio palette, none of them
   red: brick is kept for overdue, which also gets a "!" so it does not rely on colour
   alone. Labels: rozp., konc., PB, uzup., pozw., branż. Not configurable.
7. **A busy day shows all its chips**; the cell grows instead of a "+N więcej" link.
8. **Narrow screens: the grid scrolls sideways inside its card**, like the project
   table; Terminy is the view for a phone. No separate phone layout.
9. **The project filter lists "l.p. title"** in l.p. order, like the list.
