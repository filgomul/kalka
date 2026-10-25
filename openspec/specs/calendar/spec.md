# calendar Specification

## Purpose

Shows when milestones fall, across all projects or narrowed to one architect or one
project, so the studio sees which deadline is next and which ones slipped.

## Requirements

### Requirement: Views navigation

The system SHALL show a header with three tabs, "Projekty", "Kalendarz" and "Terminy", mark the current one, and keep the lead-architect and status filters when switching tabs.

#### Scenario: Switch with a filter

- **WHEN** the project list is filtered to architect "Anna Nowak" and the user clicks "Kalendarz"
- **THEN** the calendar opens filtered to "Anna Nowak"
- **AND** clicking "Terminy" opens the deadlines list filtered to "Anna Nowak"

#### Scenario: Search stays on the list

- **WHEN** the project list has the search text "Oliwa" and the user clicks "Kalendarz"
- **THEN** the calendar is not narrowed by that text

### Requirement: Month grid

The system SHALL show one month at a time as a Monday-first grid with Polish day and month names, today highlighted, and controls for previous month, next month and "Dziś". Clicking the month name opens the browser's month picker to jump straight to any month. The shown month is kept in the URL so it survives a refresh.

#### Scenario: October 2026

- **WHEN** the calendar shows October 2026
- **THEN** the first row starts with Monday 28 September and the last row ends with Sunday 1 November
- **AND** days outside October are dimmed

#### Scenario: Refresh

- **WHEN** the calendar shows March 2027 and the user refreshes the page
- **THEN** the calendar still shows March 2027

#### Scenario: Jump to a month

- **WHEN** the calendar shows October 2026 and the user clicks "październik 2026" and picks March 2028
- **THEN** the calendar shows March 2028 with the same filters

### Requirement: Overview

The system SHALL let the user switch the calendar between "Miesiąc" and "Przegląd", keeping the choice in the URL. The overview shows a range of whole months, from an "od" month to a "do" month, as blocks three per row, each headed by month and year and listing that month's visible milestones in date order. The range is kept in the URL; without one, it starts at the current month and shows six months.

#### Scenario: Default range

- **WHEN** today is 2026-10-25 and the user clicks "Przegląd"
- **THEN** six blocks from "październik 2026" to "marzec 2027" are shown, three per row, with "od" showing październik 2026, "do" showing marzec 2027 and the shortcut "6" highlighted
- **AND** clicking "Miesiąc" shows October 2026 again

#### Scenario: Refresh keeps the range

- **WHEN** the overview shows January to June 2027 and the user refreshes the page
- **THEN** the overview still shows January to June 2027

#### Scenario: Month block content

- **WHEN** a visible project has `pbDoUrzedu: 2026-10-16` not done, `koncepcja: 2026-10-05` done and `branzysci: 2026-10`, and today is 2026-10-25
- **THEN** the "październik 2026" block lists "05 konc.", "16 PB" and "mies. branż.", each with the project title, in that order
- **AND** the `koncepcja` entry is dimmed and struck through and the `pbDoUrzedu` entry is marked overdue, as in the month grid

#### Scenario: Busy month

- **WHEN** eleven visible milestones fall in March 2027 and the overview includes March 2027
- **THEN** the "marzec 2027" block lists the first eight and a link "+3 więcej"
- **AND** clicking the link or the month name shows March 2027 in the month view

#### Scenario: Empty month

- **WHEN** no visible milestone falls in a month of the range
- **THEN** its block shows "brak terminów"

### Requirement: Overview range

The system SHALL let the user change the overview range: "od" and "do" each open the browser's month picker; the shortcuts "3", "6" and "12" set "do" so the range has that many months from "od"; previous and next move the whole range by its length; "Dziś" moves "od" to the current month keeping the length. Changing "od" keeps the length. A range has one to 24 months.

#### Scenario: Shortcut

- **WHEN** the overview shows październik 2026 to marzec 2027 and the user clicks "3"
- **THEN** it shows październik to grudzień 2026 and "3" is highlighted

#### Scenario: Custom end

- **WHEN** the overview shows październik 2026 to marzec 2027 and the user picks maj 2027 as "do"
- **THEN** it shows eight blocks from październik 2026 to maj 2027 and no shortcut is highlighted

#### Scenario: End before start

- **WHEN** "od" is październik 2026 and the user picks sierpień 2026 as "do"
- **THEN** "do" becomes październik 2026 and one block is shown

#### Scenario: Move the start

- **WHEN** the overview shows październik 2026 to marzec 2027 and the user picks styczeń 2027 as "od"
- **THEN** it shows styczeń to czerwiec 2027

#### Scenario: Step

- **WHEN** the overview shows październik 2026 to marzec 2027 and the user clicks next
- **THEN** it shows kwiecień to wrzesień 2027 with the same filters
- **AND** clicking previous shows październik 2026 to marzec 2027 again

#### Scenario: Back to today

- **WHEN** today is 2026-10-25, the overview shows kwiecień to wrzesień 2027 and the user clicks "Dziś"
- **THEN** it shows październik 2026 to marzec 2027

#### Scenario: Range cap

- **WHEN** "od" is październik 2026 and the user picks grudzień 2029 as "do"
- **THEN** "do" becomes wrzesień 2028, so 24 months are shown

#### Scenario: Whole year

- **WHEN** the user picks styczeń 2026 as "od" and clicks "12"
- **THEN** it shows styczeń to grudzień 2026

### Requirement: Milestone chips

The system SHALL place every day-precision milestone of every visible project on its day as a chip showing the milestone's short label (rozp., konc., akc., PB, uzup., pozw., branż.) and the project title, coloured by milestone kind, with a legend naming the seven colours and full milestone names. A day shows all its chips; a title that does not fit is shortened, and hovering the chip shows the full title and milestone name.

#### Scenario: Two milestones on one day

- **WHEN** two visible projects both have a milestone on 2026-10-16
- **THEN** that day cell shows two chips, one per project, each with its own milestone colour

#### Scenario: Busy day

- **WHEN** five visible milestones fall on 2026-10-14
- **THEN** that day cell shows all five chips, without a "more" link

#### Scenario: Long title

- **WHEN** a chip's project title is longer than the day cell is wide
- **THEN** the chip shows the start of the title followed by "…"
- **AND** hovering the chip shows the full title and "uzyskanie pozwolenia" (or whichever milestone it is)

#### Scenario: Undated milestone

- **WHEN** a project has no date for `pozwolenie`
- **THEN** no chip for `pozwolenie` appears anywhere, even when it is marked done

#### Scenario: Concept acceptance chip

- **WHEN** a visible project "Dom Lipowa" has `akceptacja: 2026-11-14`
- **THEN** 14 November 2026 shows a chip "akc. Dom Lipowa" in a colour no other milestone kind uses
- **AND** the legend lists "akc. - akceptacja koncepcji" between "konc. - wydanie koncepcji" and "PB - PB do urzędu"

#### Scenario: Same day as the concept

- **WHEN** a visible project has `koncepcja: 2026-11-14` and `akceptacja: 2026-11-14`
- **THEN** the day cell shows the "konc." chip before the "akc." chip

### Requirement: Chip state

The system SHALL show a done milestone as dimmed and struck through, and a milestone that is not done and due before today as overdue: outlined in a colour none of the seven milestone colours uses, with "!" before its short label. This applies to day chips and month-strip entries alike.

#### Scenario: Done and overdue in one month

- **WHEN** today is 2026-10-25 and a visible project has `koncepcja: 2026-10-05` marked done and `pbDoUrzedu: 2026-10-16` not done
- **THEN** the `koncepcja` chip is dimmed and struck through
- **AND** the `pbDoUrzedu` chip is outlined as overdue and reads "! PB" before the project title

#### Scenario: Due today

- **WHEN** today is 2026-10-25 and a milestone that is not done falls on 2026-10-25
- **THEN** its chip is not marked overdue

### Requirement: Month-precision strip

The system SHALL show milestones stored as `YYYY-MM` in a strip above the grid of that month, not on a particular day. A month-precision milestone is due on the last day of its month.

#### Scenario: Branch designs due in November

- **WHEN** a visible project has `branzysci: 2026-11` and the calendar shows November 2026
- **THEN** the strip above the grid lists that project with "termin branżystów"
- **AND** no day cell shows it

#### Scenario: Month not yet over

- **WHEN** today is 2026-10-25 and a project has `branzysci: 2026-10` not done
- **THEN** its strip entry in October 2026 is not marked overdue

### Requirement: Filters

The system SHALL filter the calendar by lead architect and status with the same choices and default as the project list (`zakończony` hidden), and optionally by one project, offered as "l.p. title" in order of l.p. (projects without l.p. last, by title). All filters are kept in the URL.

#### Scenario: Project choices

- **WHEN** the loaded projects are "Dom Lipowa" (l.p. 12), "Willa Sosnowa" (l.p. 3) and "Hala Brzozowa" (no l.p.)
- **THEN** the project filter offers "wszystkie projekty", "3 Willa Sosnowa", "12 Dom Lipowa" and "Hala Brzozowa", in that order

#### Scenario: One architect

- **WHEN** the lead-architect filter is set
- **THEN** only milestones of that architect's projects are shown in the grid and the strip

#### Scenario: Default status

- **WHEN** no status is chosen
- **THEN** milestones of `aktywny` and `wstrzymany` projects are shown and those of `zakończony` projects are not

#### Scenario: One project

- **WHEN** a project is chosen in the project filter
- **THEN** only that project's milestones are shown and the architect and status filters are ignored

#### Scenario: Sync conflict copy

- **WHEN** two project files share an id and one of them is chosen in the project filter
- **THEN** only the milestones of the chosen file are shown

### Requirement: Open project from calendar

The system SHALL open the project form when a chip, a strip entry, an overview entry or a deadlines-list entry is clicked, and return to the view it came from, with the same month or range and filters, when the form is saved or cancelled.

#### Scenario: Click chip

- **WHEN** the user clicks a chip in November 2026 with the architect filter set
- **THEN** the form for that project opens
- **AND** clicking "Anuluj" or saving returns to November 2026 with the same architect filter

#### Scenario: From the overview

- **WHEN** the user opens a project from the overview of styczeń to czerwiec 2027 and clicks "Anuluj"
- **THEN** the overview of styczeń to czerwiec 2027 is shown again with the same filters

#### Scenario: From the deadlines list

- **WHEN** the user opens a project from "Terminy" and saves it
- **THEN** "Terminy" is shown again with the same filters

### Requirement: Deadlines list

The system SHALL list every milestone that is not done and due before today under "Po terminie", oldest first, followed by milestones that are not done and due from today to 60 days after, grouped by week (Monday to Sunday). Done milestones are left out. It uses the same filters as the calendar and a month-precision milestone is due on the last day of its month.

#### Scenario: Ordering

- **WHEN** today is 2026-10-25 and visible milestones that are not done fall on 2026-06-01, 2026-10-10, 2026-10-30 and 2026-11 (month)
- **THEN** the list shows 01.06.2026 and then 10.10.2026 under "Po terminie", 30.10.2026 under the week of 26.10.2026, and `11.2026` under the week of 30.11.2026

#### Scenario: Due today

- **WHEN** today is 2026-10-25 and a milestone that is not done falls on 2026-10-25
- **THEN** it is listed under the week of 19.10.2026, not under "Po terminie"

#### Scenario: Done milestone

- **WHEN** a milestone dated 2026-10-20 is marked done
- **THEN** it does not appear in the list (the calendar still shows it as done)

#### Scenario: Outside the window

- **WHEN** a milestone is more than 60 days ahead
- **THEN** it does not appear in the list (it still appears in the calendar)

#### Scenario: Entry content

- **WHEN** the list shows a milestone
- **THEN** the entry shows its date, the milestone name, the project title and the lead architect
