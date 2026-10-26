## MODIFIED Requirements

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

## ADDED Requirements

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
