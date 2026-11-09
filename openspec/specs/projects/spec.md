# projects Specification

## Purpose

The project register: everything the old sheet held about one building project, as a
list and a form.

## Requirements

### Requirement: Project list

The system SHALL list projects with running number, title, type, location, lead architect, next milestone and status, sorted by next milestone date (projects without one last) unless the user sorts by another column (see "Sort by column").

#### Scenario: Default view

- **WHEN** the project list opens
- **THEN** projects with status `zakończony` are hidden by default
- **AND** the columns are, in this order, "l.p.", "tytuł", "typ", "miejscowość", "arch. prowadzący", "najbliższy termin" and "status"
- **AND** each row shows l.p., title, type ("projekt budowlany", "projekt wnętrz" or "inny"), city, lead architect, the next milestone name and date, and status

### Requirement: Filter and search

The system SHALL filter the list by lead architect, by status and by project type, and search by text in title, city and address; filters are kept in the URL so they survive a refresh.

#### Scenario: Filter by architect

- **WHEN** the user picks an architect in the filter
- **THEN** only that architect's projects are shown

#### Scenario: Filter by type

- **WHEN** the user picks "projekt wnętrz" in the "Typ projektu" filter, which offers "wszystkie typy", "projekt budowlany", "projekt wnętrz" and "inny"
- **THEN** only projects of type "projekt wnętrz" are shown
- **AND** after a refresh, or after opening a project and going back, the filter still shows "projekt wnętrz"

#### Scenario: Search

- **WHEN** the user types "Oliwa"
- **THEN** only projects whose title, city or address contains "oliwa" (case-insensitive) are shown

### Requirement: Next milestone

The system SHALL treat the next milestone of a project as the dated milestone that is not done with the earliest due date, also when that date is before today; a month-precision milestone is due on the last day of that month. Planned and confirmed milestones count alike. A next milestone due before today is shown as overdue; a planned next milestone shows a question mark before its date.

#### Scenario: Mixed precision

- **WHEN** today is 2026-10-25 and a project has `pbDoUrzedu: 2026-10-30` and `branzysci: 2026-10`, neither done
- **THEN** the next milestone is `pbDoUrzedu` (30.10.2026), because `branzysci` is due 31.10.2026

#### Scenario: Overdue

- **WHEN** today is 2026-10-25 and a project has `pbDoUrzedu: 2026-10-10` not done and `pozwolenie: 2026-12-01`
- **THEN** the next milestone is `pbDoUrzedu` (10.10.2026), marked "po terminie"
- **AND** the project sorts before projects whose next milestone is today or later

#### Scenario: Done milestone skipped

- **WHEN** today is 2026-10-25 and a project has `pbDoUrzedu: 2026-10-10` marked done and `pozwolenie: 2026-12-01` not done
- **THEN** the next milestone is `pozwolenie` (01.12.2026)

#### Scenario: All in the past

- **WHEN** every dated milestone of a project is before today and marked done, or it has no dated milestones
- **THEN** the project shows "brak nadchodzących terminów" and sorts last

#### Scenario: Planned next milestone

- **WHEN** today is 2026-10-25 and a project "Dom Lipowa" has `pozwolenie: 2027-03` planned and no other open dated milestone
- **THEN** the list shows "? 03.2027" with "uzyskanie pozwolenia" as the next milestone
- **AND** hovering the question mark shows "niepotwierdzone"

#### Scenario: Confirmed next milestone

- **WHEN** the next milestone of a project is `pozwolenie: 2027-03` confirmed
- **THEN** the list shows "03.2027" with no question mark

#### Scenario: Planned and overdue

- **WHEN** today is 2026-10-25 and the next milestone is `pbDoUrzedu: 2026-10-10` planned
- **THEN** the list shows "? 10.10.2026" marked "po terminie"

### Requirement: Create project

The system SHALL create a project from a template picked in a menu that the "Nowy projekt" button opens, listing "projekt budowlany", "projekt wnętrz" and "inny"; picking one opens an empty project form with that template's milestones. Only the title is required; everything else is optional.

#### Scenario: Minimal project

- **WHEN** the user opens "Nowy projekt", picks "projekt budowlany", enters a title and saves
- **THEN** a new file `projekty/<id>.json` exists with status `aktywny`, the eight undated building milestones and empty branch scopes
- **AND** the list shows it

#### Scenario: Menu

- **WHEN** the user clicks "Nowy projekt"
- **THEN** a menu lists "projekt budowlany", "projekt wnętrz" and "inny", in that order
- **AND** pressing Esc or clicking outside closes it without opening a form

#### Scenario: Link without a template

- **WHEN** the user opens the new-project address without a template, for example from an old bookmark
- **THEN** the form opens with the building template's milestones

### Requirement: Running number

The system SHALL keep the old sheet's running number as an optional whole number `lp` per project, editable in the form, and suggest the next free number for a new project. Numbers are not checked for uniqueness.

#### Scenario: New project gets the next number

- **WHEN** the highest `lp` among loaded projects is 41 and the user opens "Nowy projekt"
- **THEN** the l.p. field is pre-filled with 42 and can be changed or cleared

#### Scenario: No number

- **WHEN** a project has no `lp`
- **THEN** its l.p. cell in the list is empty

### Requirement: Lead architect list

The system SHALL offer the lead architect as a choice from the `architects` list in `kalka.json`, which the studio edits by hand; the app has no screen to change the list. An entry is either a name or an object with `name` and optionally `initials` and `color`; the choices show the names.

#### Scenario: Pick from the list

- **WHEN** `kalka.json` holds `"architects": ["Anna Nowak", "Jan Kowalski"]` and the user opens the form
- **THEN** the lead architect field offers an empty choice, "Anna Nowak" and "Jan Kowalski"

#### Scenario: Entries with initials and colour

- **WHEN** `kalka.json` holds `"architects": [{ "name": "Anna Nowak", "initials": "AN", "color": "#697662" }, "Jan Kowalski"]`
- **THEN** the lead architect field and the architect filters offer "Anna Nowak" and "Jan Kowalski"

#### Scenario: Entry without a name

- **WHEN** an entry is an object without a text `name`
- **THEN** it is left out of the choices and the other entries are offered

#### Scenario: Value not on the list

- **WHEN** a project's `leadArchitect` is "Piotr Zieliński", who is not in `architects`
- **THEN** the form shows "Piotr Zieliński" as the selected choice and saving without touching the field keeps it
- **AND** the list's architect filter offers "Piotr Zieliński" next to the names from `kalka.json`

#### Scenario: Empty list

- **WHEN** `kalka.json` has no `architects` or an empty one
- **THEN** the lead architect field offers only the empty choice and a hint "Dodaj architektów w pliku kalka.json"

### Requirement: Edit project

The system SHALL edit l.p., title, project type, location (city, address), lead architect, status, the project's milestones, six branch scopes and notes. The fields other than the milestones are saved together with "Zapisz"; milestone changes of a saved project are written on their own at once (see "Milestones saved at once").

#### Scenario: Edit and cancel

- **WHEN** the user changes fields other than the milestones and clicks "Anuluj"
- **THEN** nothing is written and the list shows the old values

### Requirement: Milestone precision

The system SHALL accept each milestone as a full date or a month, store it as `YYYY-MM-DD` or `YYYY-MM`, and display it as `30.10.2026` or `10.2026`.

#### Scenario: Month only

- **WHEN** the user switches "termin branżystów" to "miesiąc" and picks November 2026
- **THEN** that milestone in the project file holds `"date": "2026-11"`
- **AND** the list shows `11.2026`

#### Scenario: Clear a milestone

- **WHEN** the user clears a milestone input
- **THEN** the milestone stays in the project file without a `date`

### Requirement: Branch scope

The system SHALL hold a free-text scope for each of the six branches, where empty means "brak".

#### Scenario: Display

- **WHEN** a project has an empty `sanitarna` scope
- **THEN** the form shows the field empty and any summary shows "brak"

### Requirement: Milestone done

The system SHALL let the user mark each milestone as done or not done with a checkbox "zrealizowane" in the project form, whether or not it has a date, and keep the mark on that milestone in the project file. A milestone without the mark is not done.

#### Scenario: Tick and save

- **WHEN** the user ticks "zrealizowane" next to "wydanie koncepcji"
- **THEN** that milestone in the project file holds `"done": true`
- **AND** reopening the form shows that milestone ticked

#### Scenario: File without done marks

- **WHEN** a project file has no `done` marks, for example an older file without a `done` key
- **THEN** every milestone of that project counts as not done

#### Scenario: Done without a date

- **WHEN** the user ticks "zrealizowane" for a milestone with no date
- **THEN** the milestone is saved as done and still has no date

#### Scenario: Untick

- **WHEN** the user unticks a done milestone
- **THEN** that milestone in the project file holds no `done` mark

#### Scenario: Same style twice

- **WHEN** a project has two "uzupełnienie do urzędu" milestones and the user ticks only the second
- **THEN** only the second is done

### Requirement: Confirmed date

The system SHALL let the user mark each milestone as "planowane" or "potwierdzone" with a pair of radio buttons in the project form, whether or not it has a date, and keep `"confirmed": true` on a confirmed milestone in the project file. A milestone without the mark is planned. The choice is independent of "zrealizowane", and changing a milestone's date keeps it.

#### Scenario: New project

- **WHEN** the user creates a project from any template
- **THEN** every milestone shows "planowane" selected

#### Scenario: Confirm and save

- **WHEN** a project has "uzyskanie pozwolenia" at 2027-03 and the user picks "potwierdzone" for it
- **THEN** that milestone in the project file holds `"confirmed": true`
- **AND** reopening the form shows "potwierdzone" selected

#### Scenario: Back to planned

- **WHEN** the user picks "planowane" for a confirmed milestone
- **THEN** that milestone in the project file holds no `confirmed` mark

#### Scenario: File without confirmed marks

- **WHEN** a project file has no `confirmed` marks, for example an older file without a `confirmed` key
- **THEN** every milestone of that project shows "planowane"

#### Scenario: Confirmed without a date

- **WHEN** the user picks "potwierdzone" for a milestone with no date
- **THEN** the milestone is saved as confirmed and still has no date

#### Scenario: Date changed

- **WHEN** "uzyskanie pozwolenia" is confirmed at `2027-03` and the user changes the date to 2027-03-18
- **THEN** that milestone holds `"date": "2027-03-18"` and is still confirmed

#### Scenario: Independent of done

- **WHEN** the user ticks "zrealizowane" for a planned milestone
- **THEN** the milestone is done and still planned, and unticking it later shows it planned as before

### Requirement: Project templates

The system SHALL offer three project templates, "projekt budowlany", "projekt wnętrz" and "inny", each an ordered list of milestone styles that seeds a new project's milestones. A new project also takes its type from the template (see "Project type").

#### Scenario: Building template

- **WHEN** the user creates a project from "projekt budowlany"
- **THEN** the milestones section shows, undated and in this order: "data rozpoczęcia", "wydanie koncepcji", "akceptacja koncepcji", "PB do urzędu", "uzupełnienie do urzędu", "uzyskanie pozwolenia", "termin branżystów", "wydanie projektu"

#### Scenario: Interior template

- **WHEN** the user creates a project from "projekt wnętrz"
- **THEN** the milestones section shows, undated and in this order: "data rozpoczęcia", "układy funkcjonalne", "akceptacja układów", "pierwsze wizualizacje", "akceptacja wizualizacji", "wydanie projektu", "nadzór autorski"

#### Scenario: Other

- **WHEN** the user creates a project from "inny"
- **THEN** the milestones section is empty apart from "+ Dodaj termin"

#### Scenario: No template in the file

- **WHEN** a project created from "projekt wnętrz" is saved
- **THEN** the project file holds its milestones and `"type": "wnetrza"`, and no other record of the template

### Requirement: Milestone styles

The system SHALL give every milestone a style with a name, a short label and a colour, from a fixed list of 14 styles: the 13 milestone kinds of the two templates and "inny". Every style has its own colour; only "inny" is black and none uses the overdue colour. A milestone whose style is unknown shows as "inny".

#### Scenario: Short labels

- **WHEN** milestones of each style are shown in the calendar
- **THEN** their short labels are "rozp.", "konc.", "akc.", "PB", "uzup.", "pozw.", "branż.", "wyd.", "ukł.", "akc. ukł.", "wiz.", "akc. wiz.", "nadz." and "inny", for data rozpoczęcia, wydanie koncepcji, akceptacja koncepcji, PB do urzędu, uzupełnienie do urzędu, uzyskanie pozwolenia, termin branżystów, wydanie projektu, układy funkcjonalne, akceptacja układów, pierwsze wizualizacje, akceptacja wizualizacji, nadzór autorski and inny

#### Scenario: Unknown style

- **WHEN** a hand-edited project file has a milestone `{ "id": "x1", "style": "odbior", "title": "odbiór budynku", "date": "2027-05-10" }`
- **THEN** the form shows "odbiór budynku" and the calendar shows it as "inny", in black

### Requirement: Add milestone

The system SHALL let the user add a milestone to a project with "+ Dodaj termin" in the top right corner of the milestones section (where "+ Dodaj zadanie" sits in the tasks section), which opens a dialog with a style chosen from the 14 styles, "inny" by default, followed by a title (required). Picking a style puts that style's name in the title when the title is empty or still holds the name of the style picked before; a title the user typed is kept. Picking "inny" empties a title that holds the previous style's name. The new milestone goes to the end of the list, undated, planned and not done. Only the project changes, never a template.

#### Scenario: Second supplement

- **WHEN** the user clicks "+ Dodaj termin" in project "Dom Lipowa", types "drugie uzupełnienie", picks "uzupełnienie do urzędu" and clicks "Dodaj"
- **THEN** the project file holds a milestone with style `uzupelnienie` and title "drugie uzupełnienie" at the end of its milestones
- **AND** the project has two milestones with the "uzupełnienie do urzędu" style, each with its own date, done and confirmed marks

#### Scenario: Default style

- **WHEN** the user opens "+ Dodaj termin"
- **THEN** the dialog shows the style first, set to "inny", and an empty title below it

#### Scenario: Name from the style

- **WHEN** the user opens "+ Dodaj termin", picks "akceptacja koncepcji" and clicks "Dodaj"
- **THEN** the project file holds a milestone with style `akceptacja` and title "akceptacja koncepcji"

#### Scenario: Style picked again

- **WHEN** the user picks "akceptacja koncepcji" and then "wydanie koncepcji" without touching the title
- **THEN** the title reads "wydanie koncepcji"

#### Scenario: Typed title kept

- **WHEN** the user picks "akceptacja koncepcji", changes the title to "akceptacja koncepcji - wariant B" and then picks "wydanie koncepcji"
- **THEN** the title still reads "akceptacja koncepcji - wariant B"

#### Scenario: Back to "inny"

- **WHEN** the user picks "akceptacja koncepcji" and then "inny" without touching the title
- **THEN** the title is empty

#### Scenario: Title missing

- **WHEN** the user clicks "Dodaj" with an empty title
- **THEN** the dialog stays open and shows "Podaj nazwę terminu."

#### Scenario: Anuluj keeps an added milestone

- **WHEN** the user adds a milestone to a saved project and then clicks "Anuluj" in the project form
- **THEN** the project file still holds the added milestone

#### Scenario: New project

- **WHEN** the user adds a milestone to a project that has not been saved yet
- **THEN** it is added to the list and written with the project on "Zapisz"

### Requirement: Edit added milestone

The system SHALL let the user change the title and style of a milestone they added, in the same dialog as adding, with "Zmień" instead of "Dodaj" and the same filling of the title from the style. Milestones that came from a template keep their style's name and style and offer no such dialog.

#### Scenario: Rename

- **WHEN** the user opens the added milestone "drugie uzupełnienie", changes the title to "uzupełnienie po wezwaniu" and clicks "Zmień"
- **THEN** the project file holds the new title and the milestone keeps its date, done and confirmed marks and its place in the list

#### Scenario: Change style of a filled-in name

- **WHEN** the user opens the added milestone "akceptacja koncepcji" with style `akceptacja`, picks "akceptacja układów" and clicks "Zmień"
- **THEN** the project file holds style `akceptacjaUkladow` and title "akceptacja układów"

#### Scenario: Template milestone

- **WHEN** the project form shows "uzyskanie pozwolenia" from the building template
- **THEN** it offers no way to change its name or style

### Requirement: Delete milestone

The system SHALL let the user delete any milestone of a project, from a template or added, after confirming `Usunąć termin „<name>”?`. The deletion is written at once (see "Milestones saved at once").

#### Scenario: Confirm

- **WHEN** the user deletes "uzupełnienie do urzędu" and confirms
- **THEN** the project file no longer holds that milestone and the calendar no longer shows it

#### Scenario: Decline

- **WHEN** the user deletes a milestone and declines the confirmation
- **THEN** the milestone stays in the list

### Requirement: Reorder milestones

The system SHALL let the user change the order of a project's milestones by dragging a milestone by its handle above or below another, or by pressing arrow up or down while its handle has focus. The new order is written at once (see "Milestones saved at once"), and every place that lists a project's milestones uses it.

#### Scenario: Drag

- **WHEN** the user drags "wydanie projektu" above "termin branżystów"
- **THEN** reopening the form shows "wydanie projektu" before "termin branżystów"

#### Scenario: Keyboard

- **WHEN** the handle of the last milestone has focus and the user presses arrow up
- **THEN** that milestone moves one place up and its handle keeps focus

#### Scenario: Anuluj keeps the order

- **WHEN** the user reorders the milestones of a saved project and clicks "Anuluj"
- **THEN** the project file holds the new order

### Requirement: Milestones saved at once

The system SHALL write every change to the milestones of a saved project (date, day / month, planned / confirmed, done, add, edit, delete, reorder) to the project file at once, without "Zapisz". Only the milestones are written; other fields changed in the form wait for "Zapisz", and "Anuluj" undoes only them. The section shows the hint "Zmiany terminów zapisują się od razu."

#### Scenario: Date changed

- **WHEN** the user picks 18.03.2027 for "uzyskanie pozwolenia" in project "Dom Lipowa" and leaves the form with "Anuluj"
- **THEN** the project file holds `"date": "2027-03-18"` for that milestone

#### Scenario: Unsaved project fields stay out

- **WHEN** the user changes the title to "Dom Lipowa 2" and then ticks "zrealizowane" for "wydanie koncepcji"
- **THEN** the project file holds "wydanie koncepcji" as done and still the old title
- **AND** clicking "Anuluj" leaves the old title and the done mark

#### Scenario: Zapisz after a milestone change

- **WHEN** the user ticks a milestone as done, then changes the title and clicks "Zapisz"
- **THEN** the project file holds the new title and the done mark, with no conflict message

#### Scenario: New project

- **WHEN** the user changes a milestone of a project that has not been saved yet
- **THEN** nothing is written until "Zapisz", which writes the project with its milestones

#### Scenario: Someone else saved first

- **WHEN** the user changes a milestone but the project file on disk was changed by someone else since it was read
- **THEN** nothing is written, the form shows "Ktoś inny zmienił ten projekt w międzyczasie. Terminy wczytano ponownie - powtórz zmianę."
- **AND** the milestones show what the file holds, while other unsaved fields in the form keep their values

#### Scenario: Typing a date

- **WHEN** the user types a date by hand, digit by digit
- **THEN** the file is written once the user stops typing, not after every digit

#### Scenario: Month to day

- **WHEN** a milestone holds `2027-03` and the user switches it to "dzień"
- **THEN** the date field is empty and the file still holds `2027-03`
- **AND** picking 18.03.2027 writes `"date": "2027-03-18"`

#### Scenario: Day to month

- **WHEN** a milestone holds `2027-03-18` and the user switches it to "miesiąc"
- **THEN** the file holds `"date": "2027-03"` at once

### Requirement: Older project files

The system SHALL read a project file written before this change, which holds `milestones` as an object keyed by milestone kind with `done` and `confirmed` lists, as a building-template project: its seven milestones in the building order with their dates and marks, followed by an undated "wydanie projektu". The file changes shape only when the project is saved.

#### Scenario: Read

- **WHEN** a project file holds `"milestones": { "pozwolenie": "2027-03" }`, `"done": ["koncepcja"]` and `"confirmed": ["pozwolenie"]`
- **THEN** the form shows the eight building milestones in order, "wydanie koncepcji" done, "uzyskanie pozwolenia" at 03.2027 and confirmed, "wydanie projektu" empty
- **AND** the list and the calendar show the same dates and marks as before this change

#### Scenario: Save

- **WHEN** the user saves such a project
- **THEN** the file holds the milestones as an ordered list under `timeline`, including the undated "wydanie projektu"
- **AND** the file no longer holds the old `milestones`, `done` and `confirmed` keys

#### Scenario: Not opened

- **WHEN** nobody saves an older project
- **THEN** its file stays as it is and keeps reading the same way

### Requirement: Project type

The system SHALL keep each project's type, one of "projekt budowlany", "projekt wnętrz" and "inny", stored as `type` with the template keys `budowlany`, `wnetrza` and `inny`. A file without one of these keys reads as "inny" and gets `type` only when the project is written. The project form offers the type as a choice saved with "Zapisz"; changing it leaves the milestones as they are.

#### Scenario: New project

- **WHEN** the user opens "Nowy projekt" and picks "projekt wnętrz"
- **THEN** the form shows "projekt wnętrz" as the type

#### Scenario: Link without a template

- **WHEN** the user opens the new-project address without a template
- **THEN** the form shows "projekt budowlany" as the type

#### Scenario: File without a type

- **WHEN** a project file "Dom Lipowa" has no `type`
- **THEN** the list and the form show "inny"
- **AND** the file stays as it is while nobody writes the project

#### Scenario: Unknown type

- **WHEN** a hand-edited project file holds `"type": "biuro"`
- **THEN** the list and the form show "inny"

#### Scenario: Change and save

- **WHEN** the user opens "Dom Lipowa", picks "projekt budowlany" as the type and clicks "Zapisz"
- **THEN** the project file holds `"type": "budowlany"` and the same milestones as before

#### Scenario: Change and cancel

- **WHEN** the user picks another type and clicks "Anuluj"
- **THEN** the project file keeps its old type, or still has none

#### Scenario: Milestone change on a file without a type

- **WHEN** a project file has no `type` and the user ticks "zrealizowane" for one of its milestones
- **THEN** the project file holds `"type": "inny"` together with the done mark

### Requirement: Sort by column

The system SHALL sort the project list by a column when the user clicks its header, and reverse the order when the user clicks the same header again. The sorted column's header shows the direction. Empty values sort last in both directions; status and type sort in the order of their lists; ties keep the default order. The sort is kept in the URL, and without one the list sorts by next milestone.

#### Scenario: Sort by title

- **WHEN** the list holds "Willa Łąkowa", "Dom Lipowa" and "Kamienica Oliwa" and the user clicks "tytuł"
- **THEN** the rows show "Dom Lipowa", "Kamienica Oliwa", "Willa Łąkowa"
- **AND** the "tytuł" header shows the ascending direction

#### Scenario: Reverse

- **WHEN** the list is sorted by "tytuł" and the user clicks "tytuł" again
- **THEN** the rows show "Willa Łąkowa", "Kamienica Oliwa", "Dom Lipowa"
- **AND** the header shows the descending direction

#### Scenario: Other column

- **WHEN** the list is sorted by "tytuł" descending and the user clicks "miejscowość"
- **THEN** the list is sorted by city ascending

#### Scenario: Running number

- **WHEN** projects have l.p. 10, 2 and none, and the user clicks "l.p."
- **THEN** the rows show 2, 10, then the project without a number

#### Scenario: Empty values last

- **WHEN** one project has no city and the user sorts by "miejscowość" ascending, then descending
- **THEN** the project without a city is last both times

#### Scenario: Status order

- **WHEN** the status filter shows all statuses and the user clicks "status"
- **THEN** "aktywny" projects come first, then "wstrzymany", then "zakończony"

#### Scenario: Type order

- **WHEN** the user clicks "typ"
- **THEN** "projekt budowlany" projects come first, then "projekt wnętrz", then "inny"

#### Scenario: Ties

- **WHEN** the list is sorted by "arch. prowadzący" and two projects have the same lead architect
- **THEN** those two keep the order by next milestone between them

#### Scenario: Next milestone reversed

- **WHEN** the list opens with no sort and the user clicks "najbliższy termin"
- **THEN** the project with the latest next milestone comes first
- **AND** projects without an upcoming milestone stay last

#### Scenario: Kept in the URL

- **WHEN** the list is sorted by "miejscowość" descending and the user refreshes the page, or opens a project and goes back
- **THEN** the list is still sorted by "miejscowość" descending

#### Scenario: Unknown sort in the URL

- **WHEN** the address holds a sort the list does not know, for example from a hand-edited bookmark
- **THEN** the list sorts by next milestone
