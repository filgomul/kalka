## ADDED Requirements

### Requirement: Milestone done

The system SHALL let the user mark each of the six milestones as done or not done in the project form, whether or not it has a date, and keep the done milestones in the project file. A project file without done marks counts as nothing done.

#### Scenario: Tick and save

- **WHEN** the user ticks "zrobione" next to "wydanie koncepcji" and saves
- **THEN** the project file holds `"done": ["koncepcja"]`
- **AND** reopening the form shows that milestone ticked

#### Scenario: File without done marks

- **WHEN** a project file has no `done` key, for example one written before this change or by the CSV import
- **THEN** every milestone of that project counts as not done

#### Scenario: Done without a date

- **WHEN** the user ticks "zrobione" for a milestone with no date and saves
- **THEN** the milestone is saved as done and still has no date

#### Scenario: Untick

- **WHEN** the user unticks the last done milestone and saves
- **THEN** the project file holds no done milestones

## MODIFIED Requirements

### Requirement: Next milestone

The system SHALL treat the next milestone of a project as the dated milestone that is not done with the earliest due date, also when that date is before today; a month-precision milestone is due on the last day of that month. A next milestone due before today is shown as overdue.

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
