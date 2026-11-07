# Spec Delta

## MODIFIED Requirements

### Requirement: Views navigation

The system SHALL show a header with four tabs, "Projekty", "Kalendarz", "Terminy" and "Urlopy", mark the current one, and keep the lead-architect and status filters when switching tabs.

#### Scenario: Switch with a filter

- **WHEN** the project list is filtered to architect "Anna Nowak" and the user clicks "Kalendarz"
- **THEN** the calendar opens filtered to "Anna Nowak"
- **AND** clicking "Terminy" opens the deadlines list filtered to "Anna Nowak"
- **AND** clicking "Urlopy" opens the leaves list filtered to "Anna Nowak"

#### Scenario: Search stays on the list

- **WHEN** the project list has the search text "Oliwa" and the user clicks "Kalendarz"
- **THEN** the calendar is not narrowed by that text

### Requirement: Filters

The system SHALL filter the calendar by lead architect and status with the same choices and default as the project list (`zakończony` hidden), and optionally by one project, offered as "l.p. title" in order of l.p. (projects without l.p. last, by title). All filters are kept in the URL. In the calendar and in "Terminy" each filter has a visible label: "Architekt prowadzący", "Status projektu" and "Projekt", side by side on one line. These filters narrow milestones only, never leaves.

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

#### Scenario: Labels

- **WHEN** the user opens "Kalendarz" or "Terminy"
- **THEN** the filters are labelled "Architekt prowadzący", "Status projektu" and "Projekt", in that order

#### Scenario: Long project title

- **WHEN** a project's title is longer than the project filter is wide and the window is at least 900 px wide
- **THEN** the project filter keeps the width of the other filters, shortening the shown title, and "Pokaż" stays on the same line

#### Scenario: Leaves ignore the filters

- **WHEN** the lead-architect filter is "Anna Nowak" and Jan Kowalski has a leave in the shown month
- **THEN** Jan Kowalski's leave is still shown
- **AND** the same holds when a status or a project is chosen

## ADDED Requirements

### Requirement: Show filter

The system SHALL offer in the calendar, after the project filter, a filter labelled "Pokaż" with "Terminy i urlopy" (the default), "Terminy" and "Urlopy", kept in the URL. "Terminy" hides leaves; "Urlopy" hides milestones (chips, month strip, overview entries and the legend) and disables the architect, status and project filters. "Terminy" (the tab) has no such filter.

#### Scenario: Default

- **WHEN** the user opens "Kalendarz" without a choice in "Pokaż"
- **THEN** "Pokaż" shows "Terminy i urlopy" and both milestones and leaves are shown

#### Scenario: Milestones only

- **WHEN** the user picks "Terminy"
- **THEN** no leave line and no overview leave entry is shown and the milestones are as before

#### Scenario: Leaves only

- **WHEN** the user picks "Urlopy"
- **THEN** no milestone chip, strip entry, overview milestone or legend is shown
- **AND** the architect, status and project filters are disabled

#### Scenario: Refresh

- **WHEN** "Pokaż" is "Urlopy" and the user refreshes the page
- **THEN** "Pokaż" is still "Urlopy"

### Requirement: Leave lines

The system SHALL draw in the month grid every leave as a thin line in its architect's colour over the grid days from "od" to "do", dimmed days of the months around included, above that day's milestone chips. Above the line small text reads "urlop" and the architect's name. A leave crossing a week row's end continues as a new piece on the next row. Hovering shows the name and the full dates.

#### Scenario: One week

- **WHEN** the calendar shows November 2026 and Anna Nowak has a leave from 2026-11-10 to 2026-11-13
- **THEN** one line labelled "urlop Anna Nowak" runs from Tuesday 10 to Friday 13 November above the chips of those days
- **AND** hovering it shows "Anna Nowak - urlop 10.11.2026 - 13.11.2026"

#### Scenario: Across weeks and months

- **WHEN** the calendar shows November 2026 and Anna Nowak has a leave from 2026-11-27 to 2026-12-02
- **THEN** one piece runs from Friday 27 to Sunday 29 November and another from Monday 30 November to Wednesday 2 December in the last row, both labelled "urlop Anna Nowak"
- **AND** December 2026 shows a piece from Tuesday 1 to Wednesday 2 December

#### Scenario: Overlapping leaves

- **WHEN** Anna Nowak is on leave from 2026-11-09 to 2026-11-13 and Jan Kowalski from 2026-11-11 to 2026-11-17
- **THEN** the two leaves are on separate lines, Anna Nowak's above Jan Kowalski's, each staying on one line within a week row

#### Scenario: Colour and text

- **WHEN** Anna Nowak's entry in `kalka.json` has the colour `#697662` and Jan Kowalski has none
- **THEN** Anna Nowak's lines are `#697662` with their label in a darker shade of it, and Jan Kowalski's are grey

### Requirement: Leaves in the overview

The system SHALL list at the top of each overview month block every leave that has at least one day in that month, before the milestones, by "od" and then architect name, each showing "urlop", the architect's name and the dates as `DD.MM - DD.MM` (one date for a one-day leave) in the architect's colour. Leaves do not count towards the eight milestones a block shows. An empty block shows "brak terminów", or "brak urlopów" when "Pokaż" is "Urlopy".

#### Scenario: Leave across two months

- **WHEN** the overview includes November and December 2026 and Anna Nowak has a leave from 2026-11-27 to 2026-12-02
- **THEN** both the "listopad 2026" and the "grudzień 2026" blocks list "urlop Anna Nowak 27.11 - 02.12" above their milestones

#### Scenario: Busy month with a leave

- **WHEN** eleven visible milestones and one leave fall in March 2027
- **THEN** the "marzec 2027" block lists the leave, the first eight milestones and "+3 więcej"

#### Scenario: Only leaves

- **WHEN** "Pokaż" is "Terminy i urlopy" and a month has a leave but no visible milestone
- **THEN** its block lists the leave and "brak terminów" below it

#### Scenario: No leaves

- **WHEN** "Pokaż" is "Urlopy" and a month has no leave
- **THEN** its block shows "brak urlopów"

### Requirement: Edit leave from the calendar

The system SHALL open the leave dialog "Urlop", the same as "Edytuj" in "Urlopy" plus a button "Usuń", when a leave line (or its label) or an overview leave entry is clicked. Saving, deleting (after the same confirm box) or "Anuluj" closes the dialog and keeps the calendar on the same month or range and filters, showing the leaves as written.

#### Scenario: Click a line

- **WHEN** the calendar shows November 2026 with the architect filter "Anna Nowak" and the user clicks Jan Kowalski's leave line, clicks 11 and then 18 November in the dialog and clicks "Zapisz"
- **THEN** Jan Kowalski's leave file holds `"to": "2026-11-18"`
- **AND** the calendar still shows November 2026 filtered to "Anna Nowak", with the line now ending on 18 November

#### Scenario: From the overview

- **WHEN** the user clicks "urlop Anna Nowak 27.11 - 02.12" in the overview of listopad 2026 to kwiecień 2027 and clicks "Anuluj"
- **THEN** nothing is written and the same overview is shown

#### Scenario: Delete from the calendar

- **WHEN** the user clicks a leave line, clicks "Usuń" and confirms
- **THEN** the leave's file no longer exists and its line is gone

#### Scenario: Conflict from the calendar

- **WHEN** the user saves a leave from the calendar but another person changed that leave file since it was read
- **THEN** nothing is written, the leaves are read again and the calendar shows the leave conflict message
