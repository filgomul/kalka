# Spec Delta

## MODIFIED Requirements

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

- **WHEN** "Harmonogram" shows styczeń to czerwiec 2027 with two projects ticked and the user clicks a circle, a band, a numbered mark or a row label of "Dom Lipowa"
- **THEN** the form for "Dom Lipowa" opens
- **AND** clicking "Anuluj" or saving returns to "Harmonogram" of styczeń to czerwiec 2027 with the same two projects ticked

#### Scenario: From the deadlines list

- **WHEN** the user opens a project from "Terminy" and saves it
- **THEN** "Terminy" is shown again with the same filters

### Requirement: Harmonogram bars and marks

The system SHALL draw in each row a neutral bar from the project's earliest to its latest milestone date, a month date starting the bar on its first day and ending it on its last. A bar reaching past the range stops at the range's edge with an arrow. A day milestone is a circle on its day in its style's colour; a month milestone is a band over that whole month with rounded ends, tinted and outlined in its style's colour. A circle inside a band is drawn over it. A project with one date shows its mark and no bar.

#### Scenario: Day and month milestones

- **WHEN** a visible project "Dom Lipowa" has "wydanie koncepcji" on 2026-11-05, "PB do urzędu" on 2027-01-20 and "termin branżystów" at 2027-03, and the range is listopad 2026 to kwiecień 2027
- **THEN** its bar runs from 5 November 2026 to 31 March 2027
- **AND** a circle in the "wydanie koncepcji" colour sits on 5 November, one in the "PB do urzędu" colour on 20 January, and a rounded band outlined in the "termin branżystów" colour covers the whole of March 2027

#### Scenario: Month at the start

- **WHEN** a project's earliest milestone is "data rozpoczęcia" at 2026-12 and its latest is on 2027-02-14
- **THEN** its bar starts on 1 December 2026 and ends on 14 February 2027

#### Scenario: Past the edge

- **WHEN** the range is listopad 2026 to kwiecień 2027 and a project's dates run from 2026-09-01 to 2027-02-10
- **THEN** its bar starts at the left edge of "lis 2026" with an arrow pointing left and ends on 10 February 2027
- **AND** the 2026-09-01 milestone is not drawn

#### Scenario: One date

- **WHEN** a visible project's only dated milestone is "wydanie koncepcji" on 2026-12-03
- **THEN** its row shows one circle on 3 December 2026 and no bar

#### Scenario: Diamond inside a band

- **WHEN** a project has "termin branżystów" at 2027-03 and "PB do urzędu" on 2027-03-10
- **THEN** the "PB do urzędu" circle is drawn over the March band

### Requirement: Harmonogram mark state

The system SHALL show on single circles and bands the states of the chips: a done milestone dimmed, a milestone not done and due before today outlined in the overdue colour, a planned milestone not done drawn fainter. Hovering a mark shows the project title, the milestone title, its date and its state words, as on a chip.

#### Scenario: Overdue diamond

- **WHEN** today is 2026-11-11 and a visible project "Dom Lipowa" has "PB do urzędu" on 2026-11-02 confirmed and not done
- **THEN** its circle is outlined in the overdue colour
- **AND** hovering it shows "Dom Lipowa - PB do urzędu, 02.11.2026, po terminie"

#### Scenario: Done diamond

- **WHEN** "wydanie koncepcji" on 2026-11-05 is marked done
- **THEN** its circle is dimmed

#### Scenario: Planned band

- **WHEN** "Dom Lipowa" has "termin branżystów" at 2027-03 planned and not done
- **THEN** its band is drawn fainter
- **AND** hovering it shows "Dom Lipowa - termin branżystów, 03.2027, niepotwierdzone"

### Requirement: Stacked marks

The system SHALL draw two or more milestones of one project on the same day as one circle, and two or more month milestones of one project in the same month as one band, in a neutral colour showing their number and no state of its own. Hovering it lists each milestone with its title, date and state words, in the project's order.

#### Scenario: Two on one day

- **WHEN** "Dom Lipowa" has "wydanie koncepcji" and "akceptacja koncepcji" both on 2026-12-10, the first done
- **THEN** its row shows one neutral circle on 10 December 2026 with "2"
- **AND** hovering it lists "wydanie koncepcji, 10.12.2026, zrealizowane" and "akceptacja koncepcji, 10.12.2026"

#### Scenario: Two in one month

- **WHEN** "Dom Lipowa" has "termin branżystów" and "wydanie projektu" both at 2027-04
- **THEN** its row shows one neutral band over April 2027 with "2"

#### Scenario: Different projects

- **WHEN** "Dom Lipowa" and "Willa Sosnowa" each have a milestone on 2026-12-10
- **THEN** each row shows its own single circle, with no number
