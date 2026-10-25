## MODIFIED Requirements

### Requirement: Milestone chips

The system SHALL place every day-precision milestone of every visible project on its day as a chip showing the milestone's short label (rozp., konc., akc., PB, uzup., pozw., branż.) and the project title, coloured by milestone kind, with a legend naming the seven colours and full milestone names. A day shows all its chips; a title that does not fit is shortened, and hovering the chip shows the full title and milestone name.

#### Scenario: Two milestones on one day

- **WHEN** two visible projects both have a milestone on 2026-10-16
- **THEN** that day cell shows two chips, one per project, each with its own milestone colour

#### Scenario: Busy day

- **WHEN** five visible milestones fall on 2026-10-14
- **THEN** that day cell shows all five chips, without a "more" link

#### Scenario: Long title

- **WHEN** a chip's project title is longer than the day cell is wide
- **THEN** the chip shows the start of the title followed by "…"
- **AND** hovering the chip shows the full title and "uzyskanie pozwolenia" (or whichever milestone it is)

#### Scenario: Undated milestone

- **WHEN** a project has no date for `pozwolenie`
- **THEN** no chip for `pozwolenie` appears anywhere, even when it is marked done

#### Scenario: Concept acceptance chip

- **WHEN** a visible project "Dom Lipowa" has `akceptacja: 2026-11-14`
- **THEN** 14 November 2026 shows a chip "akc. Dom Lipowa" in a colour no other milestone kind uses
- **AND** the legend lists "akc. - akceptacja koncepcji" between "konc. - wydanie koncepcji" and "PB - PB do urzędu"

#### Scenario: Same day as the concept

- **WHEN** a visible project has `koncepcja: 2026-11-14` and `akceptacja: 2026-11-14`
- **THEN** the day cell shows the "konc." chip before the "akc." chip

### Requirement: Chip state

The system SHALL show a done milestone as dimmed and struck through, and a milestone that is not done and due before today as overdue: outlined in a colour none of the seven milestone colours uses, with "!" before its short label. This applies to day chips and month-strip entries alike.

#### Scenario: Done and overdue in one month

- **WHEN** today is 2026-10-25 and a visible project has `koncepcja: 2026-10-05` marked done and `pbDoUrzedu: 2026-10-16` not done
- **THEN** the `koncepcja` chip is dimmed and struck through
- **AND** the `pbDoUrzedu` chip is outlined as overdue and reads "! PB" before the project title

#### Scenario: Due today

- **WHEN** today is 2026-10-25 and a milestone that is not done falls on 2026-10-25
- **THEN** its chip is not marked overdue
