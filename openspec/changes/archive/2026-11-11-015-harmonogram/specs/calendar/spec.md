## ADDED Requirements

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

## MODIFIED Requirements

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
