# calendar Specification

## Purpose

Shows when milestones fall, across all projects or narrowed to one architect or one
project, so the studio sees which deadline is next and which ones slipped.

## Requirements

### Requirement: Views navigation

The system SHALL show a header with six tabs, "Kalendarz", "Projekty", "Terminy", "Zadania", "Spotkania" and "Urlopy", mark the current one, and keep the lead-architect and status filters when switching tabs. "Kalendarz" is the start view: the home address and the app name in the header lead to it.

#### Scenario: Tab order

- **WHEN** the user opens Kalka
- **THEN** the header shows "Kalendarz", "Projekty", "Terminy", "Zadania", "Spotkania" and "Urlopy", in that order

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
- **AND** clicking "Zadania" opens the tasks tab filtered to tasks assigned to "Anna Nowak"
- **AND** clicking "Spotkania" opens the meetings list filtered to "Anna Nowak"
- **AND** clicking "Urlopy" opens the leaves list filtered to "Anna Nowak"

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

The system SHALL let the user switch the calendar between "Miesiąc", "Przegląd" and "Harmonogram", keeping the choice in the URL. The overview shows a range of whole months, from an "od" month to a "do" month, as blocks three per row, each headed by month and year and listing that month's visible milestones and meetings in date order. The range is kept in the URL; without one, it starts at the current month and shows six months.

#### Scenario: Default range

- **WHEN** today is 2026-10-25 and the user clicks "Przegląd"
- **THEN** six blocks from "październik 2026" to "marzec 2027" are shown, three per row, with "od" showing październik 2026, "do" showing marzec 2027 and the shortcut "6" highlighted
- **AND** clicking "Miesiąc" shows October 2026 again

#### Scenario: Switch to Harmonogram

- **WHEN** the user clicks "Harmonogram"
- **THEN** "Harmonogram" is marked as the current mode and shows the project rows
- **AND** after a refresh it is still shown

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

### Requirement: Overview range

The system SHALL let the user change the range of "Przegląd" and "Harmonogram", which share it: "od" and "do" each open the browser's month picker; the shortcuts "3", "6", "12" and "24" set "do" so the range has that many months from "od"; previous and next move the whole range by its length; "Dziś" moves "od" to the current month keeping the length. Changing "od" keeps the length. A range has one to 24 months.

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

#### Scenario: Two years

- **WHEN** the user picks styczeń 2026 as "od" and clicks "24"
- **THEN** it shows styczeń 2026 to grudzień 2027 and "24" is highlighted

#### Scenario: Shared with Harmonogram

- **WHEN** the overview shows styczeń to czerwiec 2027 and the user clicks "Harmonogram"
- **THEN** "Harmonogram" shows the columns "sty 2027" to "cze 2027" with the same range controls
- **AND** clicking "12" there and then "Przegląd" shows styczeń to grudzień 2027

### Requirement: Milestone chips

The system SHALL place every day-precision milestone of every visible project on its day as a chip showing its style's short label and the project title, in its style's colour, with a legend naming the short label and name of each style the visible projects' dated milestones use. A day shows all its chips, in date order and then in the order of each project's milestones; a title that does not fit is shortened, and hovering shows the full title and milestone name.

#### Scenario: Two milestones on one day

- **WHEN** two visible projects both have a milestone on 2026-10-16
- **THEN** that day cell shows two chips, one per project, each in its own style's colour

#### Scenario: Busy day

- **WHEN** five visible milestones fall on 2026-10-14
- **THEN** that day cell shows all five chips, without a "more" link

#### Scenario: Long title

- **WHEN** a chip's project title is longer than the day cell is wide
- **THEN** the chip shows the start of the title followed by "…"
- **AND** hovering the chip shows the full title and "uzyskanie pozwolenia" (or whichever milestone it is)

#### Scenario: Undated milestone

- **WHEN** a project has no date for "uzyskanie pozwolenia"
- **THEN** no chip for it appears anywhere, even when it is marked done

#### Scenario: Added milestone

- **WHEN** a visible project "Dom Lipowa" has an added milestone "drugie uzupełnienie" with the "uzupełnienie do urzędu" style on 2026-12-03
- **THEN** 3 December 2026 shows a chip "uzup. Dom Lipowa" in the "uzupełnienie do urzędu" colour
- **AND** hovering it shows "Dom Lipowa - drugie uzupełnienie"

#### Scenario: Other style

- **WHEN** a visible project has a milestone "zmiana inwestora" with the "inny" style on 2026-12-08
- **THEN** 8 December 2026 shows a black chip "inny" with the project title

#### Scenario: Concept acceptance chip

- **WHEN** a visible project "Dom Lipowa" has "akceptacja koncepcji" on 2026-11-14
- **THEN** 14 November 2026 shows a chip "akc. Dom Lipowa" in a colour no other style uses
- **AND** when "wydanie koncepcji" and "PB do urzędu" are also in use, the legend lists "akc. - akceptacja koncepcji" between "konc. - wydanie koncepcji" and "PB - PB do urzędu"

#### Scenario: Same day as the concept

- **WHEN** a visible project lists "wydanie koncepcji" before "akceptacja koncepcji" and both fall on 2026-11-14
- **THEN** the day cell shows the "konc." chip before the "akc." chip
- **AND** after the user moves "akceptacja koncepcji" above "wydanie koncepcji", the "akc." chip comes first

#### Scenario: Legend of the styles in use

- **WHEN** the visible projects have dated milestones only of the styles "wydanie koncepcji", "PB do urzędu" and "nadzór autorski"
- **THEN** the legend lists "konc. - wydanie koncepcji", "PB - PB do urzędu" and "nadz. - nadzór autorski", in the order of the style list, and the "?" explanation
- **AND** styles that only undated milestones use are not listed

### Requirement: Chip state

The system SHALL show a done milestone as dimmed and struck through, and a milestone that is not done and due before today as overdue: outlined in a colour no milestone style uses, with "!" before its short label. A planned milestone that is not done is drawn fainter than a confirmed one, not struck through, with a question mark before its short label; when it is also overdue it gets the overdue outline, "!" and the question mark. A done milestone shows no question mark. This applies to day chips, month-strip entries and overview entries alike.

#### Scenario: Done and overdue in one month

- **WHEN** today is 2026-10-25 and a visible project has "wydanie koncepcji" on 2026-10-05 marked done and "PB do urzędu" on 2026-10-16 confirmed and not done
- **THEN** the "wydanie koncepcji" chip is dimmed and struck through
- **AND** the "PB do urzędu" chip is outlined as overdue and reads "! PB" before the project title

#### Scenario: Due today

- **WHEN** today is 2026-10-25 and a milestone that is not done falls on 2026-10-25
- **THEN** its chip is not marked overdue

#### Scenario: Planned chip

- **WHEN** today is 2026-10-25 and a visible project "Dom Lipowa" has "uzyskanie pozwolenia" on 2026-11-20 planned and not done
- **THEN** 20 November 2026 shows a chip "? pozw. Dom Lipowa", fainter than a confirmed chip of the same style and not struck through
- **AND** hovering it shows "Dom Lipowa - uzyskanie pozwolenia, niepotwierdzone"

#### Scenario: Confirmed chip

- **WHEN** the same milestone is confirmed
- **THEN** the chip reads "pozw. Dom Lipowa" in the full colour, with no question mark

#### Scenario: Planned month

- **WHEN** a visible project has "termin branżystów" at 2026-11 planned and not done and the calendar shows November 2026
- **THEN** its strip entry is drawn fainter with a question mark before "termin branżystów"

#### Scenario: Planned and overdue

- **WHEN** today is 2026-10-25 and a visible project has "PB do urzędu" on 2026-10-16 planned and not done
- **THEN** its chip is outlined as overdue and reads "! ? PB" before the project title
- **AND** hovering it shows "niepotwierdzone, po terminie" after the milestone name

#### Scenario: Planned and done

- **WHEN** a visible project has "wydanie koncepcji" on 2026-10-05 planned and marked done
- **THEN** its chip is dimmed and struck through like any done chip, with no question mark

#### Scenario: Legend

- **WHEN** the calendar or overview is shown
- **THEN** the legend explains the question mark as "niepotwierdzone"

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

The system SHALL filter the calendar by lead architect and status with the same choices and default as the project list (`zakończony` hidden), and by a selection of projects among those that pass both. All filters are kept in the URL. In the calendar and in "Terminy" each filter has a visible label: "Architekt prowadzący", "Status projektu" and "Projekty", side by side on one line. These filters narrow milestones and meetings, never leaves: the architect filter keeps the meetings whose own architect is that architect, the project selection, while not every project is ticked, keeps only the ticked projects' meetings, and the status filter narrows milestones only.

#### Scenario: Project choices

- **WHEN** the projects passing the architect and status filters are "Dom Lipowa" (l.p. 12), "Willa Sosnowa" (l.p. 3) and "Hala Brzozowa" (no l.p.)
- **THEN** the project selection offers "3 Willa Sosnowa", "12 Dom Lipowa" and "Hala Brzozowa", in that order, all ticked, and reads "wszystkie projekty"

#### Scenario: One architect

- **WHEN** the lead-architect filter is set
- **THEN** only milestones of that architect's projects are shown in the grid and the strip

#### Scenario: Default status

- **WHEN** no status is chosen
- **THEN** milestones of `aktywny` and `wstrzymany` projects are shown and those of `zakończony` projects are not

#### Scenario: One project

- **WHEN** only "Dom Lipowa" is ticked in the project selection
- **THEN** only that project's milestones are shown
- **AND** the architect and status filters stay enabled and still apply

#### Scenario: Sync conflict copy

- **WHEN** two project files share an id and only one of them is ticked in the project selection
- **THEN** only the milestones of the ticked file are shown

#### Scenario: Labels

- **WHEN** the user opens "Kalendarz" or "Terminy"
- **THEN** the filters are labelled "Architekt prowadzący", "Status projektu" and "Projekty", in that order

#### Scenario: Long project title

- **WHEN** the one ticked project's title is longer than the project filter is wide and the window is at least 900 px wide
- **THEN** the project filter keeps the width of the other filters, shortening the shown title, and "Pokaż" stays on the same line

#### Scenario: Leaves ignore the filters

- **WHEN** the lead-architect filter is "Anna Nowak" and Jan Kowalski has a leave in the shown month
- **THEN** Jan Kowalski's leave is still shown
- **AND** the same holds when a status is chosen or projects are unticked

#### Scenario: Meetings by their architect

- **WHEN** the lead-architect filter is "Anna Nowak", every project is ticked, Jan Kowalski leads "Dom Lipowa" and a meeting of "Dom Lipowa" has Anna Nowak as its architect
- **THEN** that meeting is shown and "Dom Lipowa"'s milestones are not
- **AND** a meeting without a project whose architect is Anna Nowak is shown, one whose architect is Jan Kowalski is not

#### Scenario: Meetings of one project

- **WHEN** only "Dom Lipowa" is ticked
- **THEN** only meetings of "Dom Lipowa" are shown, whatever their architect, and no meeting without a project
- **AND** with "Willa Sosnowa" ticked too, meetings of both are shown

#### Scenario: No project ticked

- **WHEN** no project is ticked
- **THEN** no milestone and no meeting is shown, and leaves still are

#### Scenario: Status leaves meetings alone

- **WHEN** the status filter is "zakończony" and a meeting belongs to an `aktywny` project
- **THEN** the meeting is still shown

### Requirement: Open project from calendar

The system SHALL open the project form when a chip, a strip entry, an overview entry, a Harmonogram row label or mark, or a deadlines-list entry is clicked, and return to the view it came from, with the same month or range and filters, when the form is saved or cancelled.

#### Scenario: Click chip

- **WHEN** the user clicks a chip in November 2026 with the architect filter set
- **THEN** the form for that project opens
- **AND** clicking "Anuluj" or saving returns to November 2026 with the same architect filter

#### Scenario: From the overview

- **WHEN** the user opens a project from the overview of styczeń to czerwiec 2027 and clicks "Anuluj"
- **THEN** the overview of styczeń to czerwiec 2027 is shown again with the same filters

#### Scenario: From Harmonogram

- **WHEN** "Harmonogram" shows styczeń to czerwiec 2027 with two projects ticked and the user clicks a diamond, a band, a numbered mark or a row label of "Dom Lipowa"
- **THEN** the form for "Dom Lipowa" opens
- **AND** clicking "Anuluj" or saving returns to "Harmonogram" of styczeń to czerwiec 2027 with the same two projects ticked

#### Scenario: From the deadlines list

- **WHEN** the user opens a project from "Terminy" and saves it
- **THEN** "Terminy" is shown again with the same filters

### Requirement: Deadlines list

The system SHALL list every milestone that is not done and due before today under "Po terminie", oldest first, followed by milestones that are not done and due from today to 60 days after, grouped by week (Monday to Sunday). Done milestones are left out; planned ones are listed with a question mark before the date. It uses the same filters as the calendar and a month-precision milestone is due on the last day of its month.

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

#### Scenario: Planned entry

- **WHEN** today is 2026-10-25 and a visible milestone dated 2026-11-20 is planned and not done
- **THEN** it is listed under the week of 16.11.2026 as "? 20.11.2026"
- **AND** once confirmed it is listed as "20.11.2026"

### Requirement: Show filter

The system SHALL offer in the calendar's "Miesiąc" and "Przegląd", after the project filter, a filter labelled "Pokaż" that opens a list of three checkboxes, "Terminy", "Spotkania" and "Urlopy", all ticked by default; it hides each kind that is not ticked. Closed, it reads "wszystko", the ticked kinds joined by commas, or "nic". The choice is kept in the URL. The architect and project filters are disabled while neither "Terminy" nor "Spotkania" is ticked, the status filter while "Terminy" is not. "Harmonogram" and "Terminy" (the tab) have no such filter.

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

#### Scenario: Not in Harmonogram

- **WHEN** only "Urlopy" is ticked and the user clicks "Harmonogram"
- **THEN** "Pokaż" is not shown, the project rows and the legend are shown, no meeting or leave is drawn and the architect, status and project filters are enabled
- **AND** clicking "Miesiąc" shows "Pokaż" with only "Urlopy" ticked again

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

### Requirement: Harmonogram rows

The system SHALL show in "Harmonogram" one row per visible project whose span, from its earliest to its latest dated milestone, overlaps the range. A row is labelled "l.p. title" like the project filter. Rows are ordered by the project's earliest date (a month date counting from its first day), then by l.p. (projects without l.p. last), then by title. A project without dated milestones has no row. With no row the mode shows "brak wpisów".

#### Scenario: Order by first date

- **WHEN** the range is listopad 2026 to kwiecień 2027 and the visible projects are "Willa Sosnowa" (l.p. 3) with its first date on 2027-01-15, "Dom Lipowa" (l.p. 12) with its first date at 2026-11 (month) and "Hala Brzozowa" (no l.p.) with its first date on 2026-11-02
- **THEN** the rows are "12 Dom Lipowa", "Hala Brzozowa" and "3 Willa Sosnowa", in that order

#### Scenario: Same first date

- **WHEN** "Willa Sosnowa" (l.p. 3) and "Dom Lipowa" (l.p. 12) both start on 2026-12-01
- **THEN** "3 Willa Sosnowa" comes before "12 Dom Lipowa"

#### Scenario: No dates

- **WHEN** a visible project has no dated milestone, even one marked done
- **THEN** it has no row

#### Scenario: All dates outside the range

- **WHEN** the range is listopad 2026 to kwiecień 2027 and a visible project's dates all fall in 2025
- **THEN** it has no row

#### Scenario: Span across the range

- **WHEN** the range is listopad 2026 to kwiecień 2027 and a visible project's first date is 2026-08-10 and its last 2027-08
- **THEN** it has a row whose bar runs over the whole range

#### Scenario: Nothing to show

- **WHEN** no visible project has a row in the range
- **THEN** "Harmonogram" shows "brak wpisów"

### Requirement: Harmonogram axis

The system SHALL draw "Harmonogram" with the row labels on the left and one equally wide column per month of the range, headed by the short month name and year ("lis 2026"), and a vertical line on today's date when it falls in the range. A day sits at its place within its month's column. On a narrow window the months scroll sideways while the labels stay in view. The legend names the styles in use and the "?" as in the calendar.

#### Scenario: Columns

- **WHEN** "Harmonogram" shows listopad 2026 to kwiecień 2027
- **THEN** six columns are headed "lis 2026", "gru 2026", "sty 2027", "lut 2027", "mar 2027" and "kwi 2027"

#### Scenario: Today line

- **WHEN** today is 2026-11-11 and the range includes listopad 2026
- **THEN** a vertical line crosses every row at 11 November
- **AND** no such line is drawn when the range does not include today

#### Scenario: Narrow window

- **WHEN** the window is narrower than the months need and the user scrolls the months sideways
- **THEN** the row labels stay in view

#### Scenario: Legend

- **WHEN** the shown rows have dated milestones only of the styles "wydanie koncepcji" and "PB do urzędu"
- **THEN** the legend lists "konc. - wydanie koncepcji" and "PB - PB do urzędu" and explains "?" as "niepotwierdzone"

### Requirement: Harmonogram bars and marks

The system SHALL draw in each row a neutral bar from the project's earliest to its latest milestone date, a month date starting the bar on its first day and ending it on its last. A bar reaching past the range stops at the range's edge with an arrow. A day milestone is a diamond on its day in its style's colour; a month milestone is a band over that whole month in its style's colour. A diamond inside a band is drawn over it. A project with one date shows its mark and no bar.

#### Scenario: Day and month milestones

- **WHEN** a visible project "Dom Lipowa" has "wydanie koncepcji" on 2026-11-05, "PB do urzędu" on 2027-01-20 and "termin branżystów" at 2027-03, and the range is listopad 2026 to kwiecień 2027
- **THEN** its bar runs from 5 November 2026 to 31 March 2027
- **AND** a diamond in the "wydanie koncepcji" colour sits on 5 November, one in the "PB do urzędu" colour on 20 January, and a band in the "termin branżystów" colour covers the whole of March 2027

#### Scenario: Month at the start

- **WHEN** a project's earliest milestone is "data rozpoczęcia" at 2026-12 and its latest is on 2027-02-14
- **THEN** its bar starts on 1 December 2026 and ends on 14 February 2027

#### Scenario: Past the edge

- **WHEN** the range is listopad 2026 to kwiecień 2027 and a project's dates run from 2026-09-01 to 2027-02-10
- **THEN** its bar starts at the left edge of "lis 2026" with an arrow pointing left and ends on 10 February 2027
- **AND** the 2026-09-01 milestone is not drawn

#### Scenario: One date

- **WHEN** a visible project's only dated milestone is "wydanie koncepcji" on 2026-12-03
- **THEN** its row shows one diamond on 3 December 2026 and no bar

#### Scenario: Diamond inside a band

- **WHEN** a project has "termin branżystów" at 2027-03 and "PB do urzędu" on 2027-03-10
- **THEN** the "PB do urzędu" diamond is drawn over the March band

### Requirement: Harmonogram mark state

The system SHALL show on single diamonds and bands the states of the chips: a done milestone dimmed, a milestone not done and due before today outlined in the overdue colour, a planned milestone not done drawn fainter. Hovering a mark shows the project title, the milestone title, its date and its state words, as on a chip.

#### Scenario: Overdue diamond

- **WHEN** today is 2026-11-11 and a visible project "Dom Lipowa" has "PB do urzędu" on 2026-11-02 confirmed and not done
- **THEN** its diamond is outlined in the overdue colour
- **AND** hovering it shows "Dom Lipowa - PB do urzędu, 02.11.2026, po terminie"

#### Scenario: Done diamond

- **WHEN** "wydanie koncepcji" on 2026-11-05 is marked done
- **THEN** its diamond is dimmed

#### Scenario: Planned band

- **WHEN** "Dom Lipowa" has "termin branżystów" at 2027-03 planned and not done
- **THEN** its band is drawn fainter
- **AND** hovering it shows "Dom Lipowa - termin branżystów, 03.2027, niepotwierdzone"

### Requirement: Stacked marks

The system SHALL draw two or more milestones of one project on the same day as one diamond, and two or more month milestones of one project in the same month as one band, in a neutral colour showing their number and no state of its own. Hovering it lists each milestone with its title, date and state words, in the project's order.

#### Scenario: Two on one day

- **WHEN** "Dom Lipowa" has "wydanie koncepcji" and "akceptacja koncepcji" both on 2026-12-10, the first done
- **THEN** its row shows one neutral diamond on 10 December 2026 with "2"
- **AND** hovering it lists "wydanie koncepcji, 10.12.2026, zrealizowane" and "akceptacja koncepcji, 10.12.2026"

#### Scenario: Two in one month

- **WHEN** "Dom Lipowa" has "termin branżystów" and "wydanie projektu" both at 2027-04
- **THEN** its row shows one neutral band over April 2027 with "2"

#### Scenario: Different projects

- **WHEN** "Dom Lipowa" and "Willa Sosnowa" each have a milestone on 2026-12-10
- **THEN** each row shows its own single diamond, with no number

### Requirement: Project selection

The system SHALL offer a "Projekty" filter that opens a list with "zaznacz wszystkie", "odznacz wszystkie" and a checkbox per project passing the architect and status filters, as "l.p. title" in order of l.p. (projects without l.p. last, by title), all ticked by default. Closed, it reads "wszystkie projekty", the one ticked project, "N z M" or "żaden". Changing the architect or status filter ticks all again. The choice is kept in the URL.

#### Scenario: Options follow the architect

- **WHEN** the lead-architect filter is "Anna Nowak", who leads "Dom Lipowa" and "Willa Sosnowa", and Jan Kowalski leads "Hala Brzozowa"
- **THEN** the list offers only "3 Willa Sosnowa" and "12 Dom Lipowa"

#### Scenario: Untick one

- **WHEN** all three are offered and the user unticks "Hala Brzozowa"
- **THEN** the filter reads "2 z 3" and no milestone of "Hala Brzozowa" is shown

#### Scenario: One ticked

- **WHEN** only "Dom Lipowa" is ticked
- **THEN** the filter reads "12 Dom Lipowa"

#### Scenario: Select none and all

- **WHEN** the user clicks "odznacz wszystkie"
- **THEN** every box is unticked, the filter reads "żaden" and no milestone is shown
- **AND** clicking "zaznacz wszystkie" ticks every box and the filter reads "wszystkie projekty"

#### Scenario: Architect change ticks all

- **WHEN** only "Dom Lipowa" is ticked and the user sets the lead-architect filter to "Jan Kowalski"
- **THEN** every project Jan Kowalski leads is ticked and the filter reads "wszystkie projekty"

#### Scenario: Refresh

- **WHEN** "Dom Lipowa" and "Willa Sosnowa" are ticked and the user refreshes the page
- **THEN** the same two are still ticked

#### Scenario: Link with one project

- **WHEN** the user opens a calendar link naming one project file that passes the architect and status filters
- **THEN** only that project is ticked

#### Scenario: Terminy

- **WHEN** the user unticks "Hala Brzozowa" in "Terminy"
- **THEN** "Terminy" lists no milestone of "Hala Brzozowa"
