## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Edit project

The system SHALL edit l.p., title, location (city, address), lead architect, status, seven milestones, six branch scopes and notes, and save all of them at once.

#### Scenario: Edit and cancel

- **WHEN** the user changes fields and clicks "Anuluj"
- **THEN** nothing is written and the list shows the old values

### Requirement: Milestone done

The system SHALL let the user mark each of the seven milestones as done or not done in the project form, whether or not it has a date, and keep the done milestones in the project file. A project file without done marks counts as nothing done.

#### Scenario: Tick and save

- **WHEN** the user ticks "zrobione" next to "wydanie koncepcji" and saves
- **THEN** the project file holds `"done": ["koncepcja"]`
- **AND** reopening the form shows that milestone ticked

#### Scenario: File without done marks

- **WHEN** a project file has no `done` key, for example one written before milestones could be marked done
- **THEN** every milestone of that project counts as not done

#### Scenario: Done without a date

- **WHEN** the user ticks "zrobione" for a milestone with no date and saves
- **THEN** the milestone is saved as done and still has no date

#### Scenario: Untick

- **WHEN** the user unticks the last done milestone and saves
- **THEN** the project file holds no done milestones

## REMOVED Requirements

### Requirement: CSV import

**Reason**: The one-off migration from the old sheet is done; every studio folder already holds the migrated project files, so the script is no longer needed.
**Migration**: None. Migrated files stay valid as they are; a project that never had "akceptacja koncepcji" shows it empty and not done.
