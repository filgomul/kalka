## MODIFIED Requirements

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
- **AND** after the user moves "akceptacja koncepcji" above "wydanie koncepcji" and saves, the "akc." chip comes first

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
