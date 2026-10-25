# calendar Specification

## Purpose

Shows when milestones fall, across all projects or narrowed to one architect or one
project, so the studio sees which deadline is next.

## ADDED Requirements

### Requirement: Month grid

The system SHALL show one month at a time as a Monday-first grid with Polish day and month names, today highlighted, and controls for previous month, next month and "Dziś".

#### Scenario: October 2026

- **WHEN** the calendar shows October 2026
- **THEN** the first row starts with Monday 28 September and the last row ends with Sunday 1 November
- **AND** days outside October are dimmed

### Requirement: Milestone chips

The system SHALL place every day-precision milestone of every visible project on its day as a chip showing the project title and the milestone's short name, coloured by milestone kind.

#### Scenario: Two milestones on one day

- **WHEN** two visible projects both have a milestone on 2026-10-16
- **THEN** that day cell shows two chips, one per project, each with its own milestone colour

#### Scenario: Undated milestone

- **WHEN** a project has no date for `pozwolenie`
- **THEN** no chip for `pozwolenie` appears anywhere

### Requirement: Month-precision strip

The system SHALL show milestones stored as `YYYY-MM` in a strip above the grid of that month, not on a particular day.

#### Scenario: Branch designs due in November

- **WHEN** a visible project has `branzysci: 2026-11` and the calendar shows November 2026
- **THEN** the strip above the grid lists that project with "termin branżystów"
- **AND** no day cell shows it

### Requirement: Filters

The system SHALL filter the calendar by lead architect and, optionally, by one project, and keep both in the URL.

#### Scenario: One architect

- **WHEN** the lead-architect filter is set
- **THEN** only milestones of that architect's projects are shown in the grid and the strip

#### Scenario: One project

- **WHEN** a project is chosen in the project filter
- **THEN** only that project's milestones are shown and the architect filter is ignored

### Requirement: Open project from calendar

The system SHALL open the project form when a chip or a strip entry is clicked.

#### Scenario: Click chip

- **WHEN** the user clicks a chip
- **THEN** the form for that project opens
- **AND** "Wróć" returns to the same month with the same filters

### Requirement: Deadlines list

The system SHALL list dated milestones from 30 days before today to 60 days after, overdue ones first, then grouped by week; it uses the same filters as the calendar. A month-precision milestone is due on the last day of its month.

#### Scenario: Ordering

- **WHEN** today is 2026-10-25 and visible milestones fall on 2026-10-10, 2026-10-30 and 2026-11 (month)
- **THEN** the list shows 10.10.2026 under "Po terminie", 30.10.2026 under the week of 26.10.2026, and `11.2026` under the week of 30.11.2026

#### Scenario: Outside the window

- **WHEN** a milestone is more than 60 days ahead
- **THEN** it does not appear in the list (it still appears in the calendar)

## Open questions

- Should status `wstrzymany` projects be hidden from the calendar by default, like `zakończony` in the list?
