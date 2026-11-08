# Spec Delta

## MODIFIED Requirements

### Requirement: Views navigation

The system SHALL show a header with five tabs, "Kalendarz", "Projekty", "Terminy", "Spotkania" and "Urlopy", mark the current one, and keep the lead-architect and status filters when switching tabs. "Kalendarz" is the start view: the home address and the app name in the header lead to it.

#### Scenario: Tab order

- **WHEN** the user opens Kalka
- **THEN** the header shows "Kalendarz", "Projekty", "Terminy", "Spotkania" and "Urlopy", in that order

#### Scenario: Start view

- **WHEN** the user opens the home address or clicks "Kalka" in the header
- **THEN** the calendar is shown with "Kalendarz" marked as the current tab

#### Scenario: Back to the project list

- **WHEN** the user opens a project from "Projekty" and clicks "Anuluj"
- **THEN** the project list is shown again with the same filters and search

#### Scenario: Switch with a filter

- **WHEN** the project list is filtered to architect "Anna Nowak" and the user clicks "Kalendarz"
- **THEN** the calendar opens filtered to "Anna Nowak"
- **AND** clicking "Terminy" opens the deadlines list filtered to "Anna Nowak"
- **AND** clicking "Spotkania" opens the meetings list filtered to "Anna Nowak"
- **AND** clicking "Urlopy" opens the leaves list filtered to "Anna Nowak"

#### Scenario: Search stays on the list

- **WHEN** the project list has the search text "Oliwa" and the user clicks "Kalendarz"
- **THEN** the calendar is not narrowed by that text

### Requirement: Overview

The system SHALL let the user switch the calendar between "Miesiąc" and "Przegląd", keeping the choice in the URL. The overview shows a range of whole months, from an "od" month to a "do" month, as blocks three per row, each headed by month and year and listing that month's visible milestones and meetings in date order. The range is kept in the URL; without one, it starts at the current month and shows six months.

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

- **WHEN** nothing of the kinds chosen in "Pokaż" falls in a month of the range
- **THEN** its block shows "brak wpisów"

### Requirement: Filters

The system SHALL filter the calendar by lead architect and status with the same choices and default as the project list (`zakończony` hidden), and optionally by one project, offered as "l.p. title" in order of l.p. (projects without l.p. last, by title). All filters are kept in the URL. In the calendar and in "Terminy" each filter has a visible label: "Architekt prowadzący", "Status projektu" and "Projekt", side by side on one line. These filters narrow milestones and meetings, never leaves: the architect filter keeps the meetings whose own architect is that architect, the project filter keeps only that project's meetings, and the status filter narrows milestones only.

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

#### Scenario: Meetings by their architect

- **WHEN** the lead-architect filter is "Anna Nowak", Jan Kowalski leads "Dom Lipowa" and a meeting of "Dom Lipowa" has Anna Nowak as its architect
- **THEN** that meeting is shown and "Dom Lipowa"'s milestones are not
- **AND** a meeting without a project whose architect is Anna Nowak is shown, one whose architect is Jan Kowalski is not

#### Scenario: Meetings of one project

- **WHEN** "Dom Lipowa" is chosen in the project filter
- **THEN** only meetings of "Dom Lipowa" are shown, whatever their architect, and no meeting without a project

#### Scenario: Status leaves meetings alone

- **WHEN** the status filter is "zakończony" and a meeting belongs to an `aktywny` project
- **THEN** the meeting is still shown

### Requirement: Show filter

The system SHALL offer in the calendar, after the project filter, a filter labelled "Pokaż" that opens a list of three checkboxes, "Terminy", "Spotkania" and "Urlopy", all ticked by default; it hides each kind that is not ticked. Closed, it reads "wszystko", the ticked kinds joined by commas, or "nic". The choice is kept in the URL. The architect and project filters are disabled while neither "Terminy" nor "Spotkania" is ticked, the status filter while "Terminy" is not. "Terminy" (the tab) has no such filter.

#### Scenario: Default

- **WHEN** the user opens "Kalendarz" without a choice in "Pokaż"
- **THEN** "Pokaż" reads "wszystko" with all three ticked, and milestones, meetings and leaves are shown

#### Scenario: Milestones only

- **WHEN** only "Terminy" is ticked
- **THEN** no leave line, overview leave entry or meeting is shown and the milestones are as before

#### Scenario: Untick meetings

- **WHEN** the user unticks "Spotkania"
- **THEN** "Pokaż" reads "Terminy, Urlopy", no meeting is shown and milestones and leaves are as before

#### Scenario: Leaves only

- **WHEN** only "Urlopy" is ticked
- **THEN** no milestone chip, strip entry, overview milestone, meeting or legend is shown
- **AND** the architect, status and project filters are disabled

#### Scenario: Meetings only

- **WHEN** only "Spotkania" is ticked
- **THEN** only meetings are shown, the architect and project filters are enabled and the status filter is disabled

#### Scenario: Nothing ticked

- **WHEN** the user unticks all three
- **THEN** "Pokaż" reads "nic" and the grid and overview show no entries

#### Scenario: Refresh

- **WHEN** only "Urlopy" is ticked and the user refreshes the page
- **THEN** "Pokaż" still has only "Urlopy" ticked

### Requirement: Leaves in the overview

The system SHALL list at the top of each overview month block every leave that has at least one day in that month, before the milestones, by "od" and then architect name, each showing "urlop", the architect's name and the dates as `DD.MM - DD.MM` (one date for a one-day leave) in the architect's colour. Leaves do not count towards the eight entries a block shows.

#### Scenario: Leave across two months

- **WHEN** the overview includes November and December 2026 and Anna Nowak has a leave from 2026-11-27 to 2026-12-02
- **THEN** both the "listopad 2026" and the "grudzień 2026" blocks list "urlop Anna Nowak 27.11 - 02.12" above their milestones

#### Scenario: Busy month with a leave

- **WHEN** eleven visible milestones and one leave fall in March 2027
- **THEN** the "marzec 2027" block lists the leave, the first eight milestones and "+3 więcej"

#### Scenario: Only leaves

- **WHEN** all kinds are ticked in "Pokaż" and a month has a leave but no visible milestone or meeting
- **THEN** its block lists the leave and no "brak wpisów"

#### Scenario: No leaves

- **WHEN** only "Urlopy" is ticked and a month has no leave
- **THEN** its block shows "brak wpisów"

## ADDED Requirements

### Requirement: Meeting chips

The system SHALL place every visible meeting on its day in the month grid as a raised chip with the architect's initials in a circle, the times (`10:00-11:30`, `10:00`, or none) and the title in bold, filled with the architect's colour (grey without one). Its text is light or dark, whichever contrasts more with the colour, and the circle is drawn in reverse. A day's meeting chips come under its leave lines and before its milestone chips, by start time, untimed ones after timed ones, then by title. Meetings before today are drawn fainter and flat. Hovering shows the title, day, times, architect, type and project.

#### Scenario: Meeting on a day

- **WHEN** Anna Nowak (initials "AN", colour `#697662`) has "Spotkanie z inwestorem" of "Dom Lipowa" on 2026-11-14 from 10:00 to 11:30 and the calendar shows November 2026
- **THEN** 14 November shows a chip filled with `#697662` in white text, with "AN" in a white circle, "10:00-11:30" and "Spotkanie z inwestorem"
- **AND** hovering it shows "Spotkanie z inwestorem, 14.11.2026 10:00-11:30, Anna Nowak, stacjonarne, Dom Lipowa"

#### Scenario: Light architect colour

- **WHEN** an architect's colour in `kalka.json` is `#f2e6a0`
- **THEN** their meeting chips have dark text and a dark initials circle

#### Scenario: Order in a day

- **WHEN** 2026-11-14 has a milestone, a meeting at 14:00, a meeting at 09:00 and a meeting without a time
- **THEN** the day shows the 09:00 meeting, the 14:00 meeting, the untimed meeting and then the milestone chip

#### Scenario: Past meeting

- **WHEN** today is 2026-11-20 and a meeting was on 2026-11-14
- **THEN** its chip is drawn fainter than the chip of a meeting on 2026-11-20 or later

#### Scenario: No architect

- **WHEN** a meeting has no architect
- **THEN** its chip is grey and has no initials circle

### Requirement: Days with meetings

The system SHALL mark every day of the month grid that has a visible meeting with a dark pill next to its day number giving the number of its visible meetings: "1 spotkanie", "2 spotkania" ... "4 spotkania", "5 spotkań" and so on by Polish grammar. A day without visible meetings has no pill.

#### Scenario: Two meetings

- **WHEN** 2026-11-14 has two visible meetings and five milestones
- **THEN** the number 14 is followed by a dark pill "2 spotkania"

#### Scenario: Counts

- **WHEN** a day has 1, 3, 5, 12 or 22 visible meetings
- **THEN** its pill reads "1 spotkanie", "3 spotkania", "5 spotkań", "12 spotkań" or "22 spotkania"

#### Scenario: Hidden meetings

- **WHEN** "Spotkania" is unticked in "Pokaż", or the architect filter hides a day's only meeting
- **THEN** that day has no pill

### Requirement: Meetings in the overview

The system SHALL list each visible meeting in its overview month block among the milestones in date order, a day's meetings before its milestones in the order of the month grid, each showing the day of the month, the initials circle, the times as in the month grid and the title, styled like its meeting chip. Meetings count towards the eight entries a block shows.

#### Scenario: Meeting among milestones

- **WHEN** a visible project has `pbDoUrzedu: 2026-11-16` and a visible meeting "Spotkanie z inwestorem" is on 2026-11-14 at 10:00
- **THEN** the "listopad 2026" block lists "14 AN 10:00 Spotkanie z inwestorem" and then "16 PB" with the project title

#### Scenario: Start and end time

- **WHEN** a visible meeting "Spotkanie z inwestorem" is on 2026-11-14 from 10:00 to 12:00
- **THEN** its overview entry reads "14 AN 10:00-12:00 Spotkanie z inwestorem"

#### Scenario: Busy month with meetings

- **WHEN** six visible milestones and five visible meetings fall in March 2027
- **THEN** the "marzec 2027" block lists the first eight entries by date and "+3 więcej"

### Requirement: Edit meeting from the calendar

The system SHALL open the meeting dialog "Spotkanie", with "Usuń", when a meeting chip or an overview meeting entry is clicked. Saving, deleting (after the same confirm box) or "Anuluj" closes the dialog and keeps the calendar on the same month or range and filters, showing the meetings as written.

#### Scenario: Change the day

- **WHEN** the calendar shows November 2026 with the architect filter "Anna Nowak" and the user clicks a meeting chip on 14 November, changes the day to 2026-11-17 and clicks "Zapisz"
- **THEN** the meeting file holds `"date": "2026-11-17"`
- **AND** the calendar still shows November 2026 filtered to "Anna Nowak", with the chip on 17 November

#### Scenario: Delete from the overview

- **WHEN** the user clicks a meeting entry in the overview, clicks "Usuń" and confirms
- **THEN** the meeting's file no longer exists and the same overview is shown without it

#### Scenario: Conflict from the calendar

- **WHEN** the user saves a meeting from the calendar but another person changed that meeting file since it was read
- **THEN** nothing is written, the meetings are read again and the calendar shows the meeting conflict message
