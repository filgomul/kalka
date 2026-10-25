## 1. Logic

- [ ] 1.1 `src/calendar.ts`: `monthGrid(year, month)` (Monday-first weeks, leading/trailing days), `milestonesOn(projects, filter)`, `dueDate(value)` (last day of month for `YYYY-MM`), `groupByWeek`
- [ ] 1.2 Tests named after the scenarios below

## 2. Views

- [ ] 2.1 `#/kalendarz`: month grid, prev/next/today, chips, month-precision strip, architect and project filter in the URL hash
- [ ] 2.2 `#/terminy`: overdue and upcoming list grouped by week
- [ ] 2.3 Navigation: list and calendar share the architect filter; chip click opens the project form

## 3. Verify

- [ ] 3.1 Tests are green
- [ ] 3.2 Verify in the running dev environment: with the imported data, open October 2026, confirm every dated milestone of that month shows, filter by each architect, open a chip, check Terminy ordering
