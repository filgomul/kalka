## MODIFIED Requirements

### Requirement: Chip state

The system SHALL show a done milestone as dimmed and struck through, and a milestone that is not done and due before today as overdue: outlined in a colour none of the seven milestone colours uses, with "!" before its short label. A planned milestone that is not done is drawn fainter than a confirmed one, not struck through, with a question mark before its short label; when it is also overdue it gets the overdue outline, "!" and the question mark. A done milestone shows no question mark. This applies to day chips, month-strip entries and overview entries alike.

#### Scenario: Done and overdue in one month

- **WHEN** today is 2026-10-25 and a visible project has `koncepcja: 2026-10-05` marked done and `pbDoUrzedu: 2026-10-16` confirmed and not done
- **THEN** the `koncepcja` chip is dimmed and struck through
- **AND** the `pbDoUrzedu` chip is outlined as overdue and reads "! PB" before the project title

#### Scenario: Due today

- **WHEN** today is 2026-10-25 and a milestone that is not done falls on 2026-10-25
- **THEN** its chip is not marked overdue

#### Scenario: Planned chip

- **WHEN** today is 2026-10-25 and a visible project "Dom Lipowa" has `pozwolenie: 2026-11-20` planned and not done
- **THEN** 20 November 2026 shows a chip "? pozw. Dom Lipowa", fainter than a confirmed chip of the same kind and not struck through
- **AND** hovering it shows "Dom Lipowa - uzyskanie pozwolenia, niepotwierdzone"

#### Scenario: Confirmed chip

- **WHEN** the same milestone is confirmed
- **THEN** the chip reads "pozw. Dom Lipowa" in the full colour, with no question mark

#### Scenario: Planned month

- **WHEN** a visible project has `branzysci: 2026-11` planned and not done and the calendar shows November 2026
- **THEN** its strip entry is drawn fainter with a question mark before "termin branżystów"

#### Scenario: Planned and overdue

- **WHEN** today is 2026-10-25 and a visible project has `pbDoUrzedu: 2026-10-16` planned and not done
- **THEN** its chip is outlined as overdue and reads "! ? PB" before the project title
- **AND** hovering it shows "niepotwierdzone, po terminie" after the milestone name

#### Scenario: Planned and done

- **WHEN** a visible project has `koncepcja: 2026-10-05` planned and marked done
- **THEN** its chip is dimmed and struck through like any done chip, with no question mark

#### Scenario: Legend

- **WHEN** the calendar or overview is shown
- **THEN** the legend explains the question mark as "niepotwierdzone"

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
