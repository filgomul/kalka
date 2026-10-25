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

The system SHALL treat the next milestone of a project as the dated milestone with the earliest due date on or after today; a month-precision milestone is due on the last day of that month.

#### Scenario: Mixed precision

- **WHEN** today is 2026-10-25 and a project has `pbDoUrzedu: 2026-10-30` and `branzysci: 2026-10`
- **THEN** the next milestone is `pbDoUrzedu` (30.10.2026), because `branzysci` is due 31.10.2026

#### Scenario: All in the past

- **WHEN** every dated milestone is before today
- **THEN** the project shows "brak nadchodzących terminów" and sorts last

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

The system SHALL edit l.p., title, location (city, address), lead architect, status, six milestones, six branch scopes and notes, and save all of them at once.

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

### Requirement: CSV import

The system SHALL provide a script that converts the studio's CSV export of the old sheet into one project file per filled row, without needing the browser.

#### Scenario: Import a row

- **WHEN** the script runs on a CSV with the sheet's Polish headers and a row with l.p. `7`, title "Dom testowy", location "Gdańsk," followed by "ul. Przykładowa 1" on the next line, dates `12/06/2026` and `11.2026`, and `brak` in a branch column
- **THEN** it writes a file with `lp: 7`, `title: "Dom testowy"`, `location: { city: "Gdańsk", address: "ul. Przykładowa 1" }`, `"2026-06-12"` and `"2026-11"` as the milestones, an empty string for that branch and status `aktywny`

#### Scenario: Architect with an academic title

- **WHEN** the lead architect cell reads "mgr inż. arch. Anna Nowak"
- **THEN** `leadArchitect` is "Anna Nowak", so it matches the name in `kalka.json`

#### Scenario: MINIMUM prefix

- **WHEN** a branch cell reads "MINIMUM - inwentaryzacja instalacji"
- **THEN** the branch scope holds that text unchanged

#### Scenario: Empty and dash cells

- **WHEN** a date cell is empty or `-`
- **THEN** that milestone key is absent

#### Scenario: Numbered empty rows

- **WHEN** a row has only a running number and no title
- **THEN** it is skipped
