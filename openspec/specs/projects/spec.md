# projects Specification

## Purpose

The project register: everything the old sheet held about one building project, as a
list and a form.

## Requirements

### Requirement: Project list

The system SHALL list projects with running number, title, location, lead architect, status and next milestone, sorted by next milestone date (projects without one last).

#### Scenario: Default view

- **WHEN** the project list opens
- **THEN** projects with status `zakończony` are hidden by default
- **AND** each row shows l.p., title, city, lead architect, the next milestone name and date, and status

### Requirement: Filter and search

The system SHALL filter the list by lead architect and by status, and search by text in title, city and address; filters are kept in the URL so they survive a refresh.

#### Scenario: Filter by architect

- **WHEN** the user picks an architect in the filter
- **THEN** only that architect's projects are shown

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

The system SHALL create a project from a form where only the title is required; everything else is optional.

#### Scenario: Minimal project

- **WHEN** the user opens "Nowy projekt", enters a title and saves
- **THEN** a new file `projekty/<id>.json` exists with status `aktywny`, empty milestones and empty branch scopes
- **AND** the list shows it

### Requirement: Running number

The system SHALL keep the old sheet's running number as an optional whole number `lp` per project, editable in the form, and suggest the next free number for a new project. Numbers are not checked for uniqueness.

#### Scenario: New project gets the next number

- **WHEN** the highest `lp` among loaded projects is 41 and the user opens "Nowy projekt"
- **THEN** the l.p. field is pre-filled with 42 and can be changed or cleared

#### Scenario: No number

- **WHEN** a project has no `lp`
- **THEN** its l.p. cell in the list is empty

### Requirement: Lead architect list

The system SHALL offer the lead architect as a choice from the `architects` list in `kalka.json`, which the studio edits by hand; the app has no screen to change the list.

#### Scenario: Pick from the list

- **WHEN** `kalka.json` holds `"architects": ["Anna Nowak", "Jan Kowalski"]` and the user opens the form
- **THEN** the lead architect field offers an empty choice, "Anna Nowak" and "Jan Kowalski"

#### Scenario: Value not on the list

- **WHEN** a project's `leadArchitect` is "Piotr Zieliński", who is not in `architects`
- **THEN** the form shows "Piotr Zieliński" as the selected choice and saving without touching the field keeps it
- **AND** the list's architect filter offers "Piotr Zieliński" next to the names from `kalka.json`

#### Scenario: Empty list

- **WHEN** `kalka.json` has no `architects` or an empty one
- **THEN** the lead architect field offers only the empty choice and a hint "Dodaj architektów w pliku kalka.json"

### Requirement: Edit project

The system SHALL edit l.p., title, location (city, address), lead architect, status, seven milestones, six branch scopes and notes, and save all of them at once.

#### Scenario: Edit and cancel

- **WHEN** the user changes fields and clicks "Anuluj"
- **THEN** nothing is written and the list shows the old values

### Requirement: Milestone precision

The system SHALL accept each milestone as a full date or a month, store it as `YYYY-MM-DD` or `YYYY-MM`, and display it as `30.10.2026` or `10.2026`.

#### Scenario: Month only

- **WHEN** the user switches a milestone to "miesiąc" and picks November 2026
- **THEN** the project file holds `"branzysci": "2026-11"`
- **AND** the list shows `11.2026`

#### Scenario: Clear a milestone

- **WHEN** the user clears a milestone input and saves
- **THEN** the key is absent from `milestones` in the file

### Requirement: Branch scope

The system SHALL hold a free-text scope for each of the six branches, where empty means "brak".

#### Scenario: Display

- **WHEN** a project has an empty `sanitarna` scope
- **THEN** the form shows the field empty and any summary shows "brak"

### Requirement: Milestone done

The system SHALL let the user mark each of the seven milestones as done or not done with a checkbox "zrealizowane" in the project form, whether or not it has a date, and keep the done milestones in the project file. A project file without done marks counts as nothing done.

#### Scenario: Tick and save

- **WHEN** the user ticks "zrealizowane" next to "wydanie koncepcji" and saves
- **THEN** the project file holds `"done": ["koncepcja"]`
- **AND** reopening the form shows that milestone ticked

#### Scenario: File without done marks

- **WHEN** a project file has no `done` key, for example one written before milestones could be marked done
- **THEN** every milestone of that project counts as not done

#### Scenario: Done without a date

- **WHEN** the user ticks "zrealizowane" for a milestone with no date and saves
- **THEN** the milestone is saved as done and still has no date

#### Scenario: Untick

- **WHEN** the user unticks the last done milestone and saves
- **THEN** the project file holds no done milestones

### Requirement: Concept acceptance milestone

The system SHALL hold a milestone "akceptacja koncepcji" (key `akceptacja`) that comes right after "wydanie koncepcji" and before "PB do urzędu" wherever milestones are listed, and that is optional, accepts day or month precision, can be marked done and counts for the next milestone like the others. Project files without it stay valid.

#### Scenario: Form order

- **WHEN** the user opens the project form
- **THEN** the milestones section shows "data rozpoczęcia", "wydanie koncepcji", "akceptacja koncepcji", "PB do urzędu", "uzupełnienie do urzędu", "uzyskanie pozwolenia" and "termin branżystów", in that order

#### Scenario: Save a date

- **WHEN** the user enters 14.11.2026 as "akceptacja koncepcji" and saves
- **THEN** the project file holds `"akceptacja": "2026-11-14"` in `milestones`

#### Scenario: Next milestone

- **WHEN** today is 2026-10-25 and a project has `koncepcja: 2026-10-05` done, `akceptacja: 2026-11-14` not done and `pbDoUrzedu: 2026-12-01`
- **THEN** the list shows "akceptacja koncepcji" 14.11.2026 as the next milestone

#### Scenario: Older file

- **WHEN** a project file written before this change has no `akceptacja` key
- **THEN** the form shows "akceptacja koncepcji" empty and not done, and saving without touching it writes no `akceptacja` key

### Requirement: Confirmed date

The system SHALL let the user mark each of the seven milestones as "planowane" or "potwierdzone" with a pair of radio buttons in the project form, whether or not it has a date, and keep the confirmed milestones in the project file as `"confirmed": [<milestone keys>]`. A milestone not listed there is planned. The choice is independent of "zrealizowane", and changing a milestone's date keeps it.

#### Scenario: New project

- **WHEN** the user opens "Nowy projekt"
- **THEN** every milestone shows "planowane" selected

#### Scenario: Confirm and save

- **WHEN** a project has `pozwolenie: 2027-03` and the user picks "potwierdzone" for it and saves
- **THEN** the project file holds `"confirmed": ["pozwolenie"]`
- **AND** reopening the form shows "potwierdzone" selected

#### Scenario: Back to planned

- **WHEN** `pozwolenie` is the only confirmed milestone and the user picks "planowane" for it and saves
- **THEN** the project file holds no `confirmed` key

#### Scenario: File without confirmed marks

- **WHEN** a project file has no `confirmed` key, for example one written before this change
- **THEN** every milestone of that project shows "planowane"

#### Scenario: Confirmed without a date

- **WHEN** the user picks "potwierdzone" for a milestone with no date and saves
- **THEN** the milestone is saved as confirmed and still has no date

#### Scenario: Date changed

- **WHEN** `pozwolenie` is confirmed at `2027-03` and the user changes the date to 2027-03-18 and saves
- **THEN** the file holds `"pozwolenie": "2027-03-18"` and `pozwolenie` is still confirmed

#### Scenario: Independent of done

- **WHEN** the user ticks "zrealizowane" for a planned milestone and saves
- **THEN** the milestone is done and still planned, and unticking it later shows it planned as before
