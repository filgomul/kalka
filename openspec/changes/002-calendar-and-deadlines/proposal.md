## Why

The sheet cannot answer "what is due this month, and for whom?". The owner wants one
calendar across all projects, the same calendar narrowed to one architect or one
project, and a plain list of deadlines knocking on the door.

## What Changes

- A month calendar showing every dated milestone of every visible project as a chip on
  its day, colour-coded by milestone kind; month-precision milestones appear in a strip
  above the grid.
- The calendar takes the same lead-architect filter as the project list, plus an optional
  single-project filter.
- A "Terminy" view: milestones from the last 30 days and the next 60 days, grouped by
  week, overdue ones on top.

## Impact

- Specs: `calendar` (ADDED: month grid, milestone chips, month-precision strip, filters,
  open project from calendar, deadlines list)
- Code: `src/calendar.ts` (grid and listing logic), `src/views/Calendar.tsx`,
  `src/views/Deadlines.tsx`
- Tests: `src/calendar.test.ts` (grid boundaries, week grouping, due-date rules)

## Open questions

1. Overdue window: 30 days back is a guess. This proposal assumes **30 days**; make it a
   setting only if asked.
2. Chip colours per milestone kind: six fixed colours chosen by the developer. This
   proposal assumes **no user-configurable colours**.
