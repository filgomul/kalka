## ADDED Requirements

### Requirement: View of "Do zrobienia"

The system SHALL show two buttons "Pilne" and "Dni" in the header of the tab's "Do zrobienia" column, the chosen one pressed. "Pilne" orders the column as the tab's order says, "Dni" groups it by day. The browser remembers the last choice and the tab opens with it, on every later visit in that browser. Without a remembered choice, or when the browser can't store it, the tab opens with "Pilne".

#### Scenario: First visit

- **WHEN** the user opens "Zadania" in a browser that has never chosen a view
- **THEN** "Pilne" is pressed and "Do zrobienia" shows urgent tasks first, then by due date

#### Scenario: Switch to days

- **WHEN** the user clicks "Dni"
- **THEN** "Dni" is pressed and "Do zrobienia" shows the same tasks grouped by day
- **AND** "W trakcie" and "Wykonane" are unchanged

#### Scenario: Remembered

- **WHEN** the user picks "Dni", closes the browser and opens "Zadania" again the next day
- **THEN** "Dni" is pressed and "Do zrobienia" is grouped by day

#### Scenario: Other browser

- **WHEN** the user picked "Dni" on one PC and opens "Zadania" on another
- **THEN** the other PC opens with "Pilne"

#### Scenario: Storage blocked

- **WHEN** the browser refuses to store site data
- **THEN** the tab opens with "Pilne", the buttons still switch the view while the tab is open, and no error is shown

#### Scenario: Filters and bookmarks

- **WHEN** the user switches the view
- **THEN** the page address and the filters are unchanged

### Requirement: "Do zrobienia" by day

The system SHALL show "Do zrobienia" in the "Dni" view as groups, each headed by its day and its number of tasks, alternating background bands. Overdue tasks form one group "po terminie" first; then one group per due day, earliest first; a month date forms its own group after that month's days; undated tasks come last as "bez terminu". Today's group is marked "dziś". Days without tasks get no group. Inside a group, urgent tasks first, then by due date, then title.

#### Scenario: Groups and counts

- **WHEN** today is 2026-11-10 and "Do zrobienia" holds "A" and "B" due 2026-11-10, "C" due 2026-11-12 and "D" due 2026-11-14
- **THEN** the column shows a group "wt 10.11.2026" marked "dziś" with 2, holding "A", "B"; then "czw 12.11.2026" with 1, holding "C"; then "sob 14.11.2026" with 1, holding "D"
- **AND** no group for 2026-11-11 or 2026-11-13

#### Scenario: Overdue together

- **WHEN** today is 2026-11-10 and tasks are due 2026-11-03 and 2026-11-06
- **THEN** both are in one group "po terminie" with 2, at the top, the one due 2026-11-03 first

#### Scenario: Urgent inside a day

- **WHEN** "A" and urgent "B" are both due 2026-11-12
- **THEN** the group "czw 12.11.2026" shows "B", "A"

#### Scenario: Urgent keeps its day

- **WHEN** urgent "B" is due 2026-11-14 and "A" is due 2026-11-12
- **THEN** "A" is in the group of 2026-11-12, above the group of 2026-11-14 holding "B"

#### Scenario: Month date

- **WHEN** today is 2026-11-10 and tasks are due 2026-11-30, 2026-11 and 2026-12-01
- **THEN** the groups are "pon 30.11.2026", then "11.2026", then "wt 01.12.2026"

#### Scenario: Past month

- **WHEN** today is 2026-11-10 and a task is due 2026-10
- **THEN** it is in "po terminie"

#### Scenario: Without a date

- **WHEN** a task has no due date
- **THEN** it is in the last group "bez terminu"

#### Scenario: Empty column

- **WHEN** no shown task is in "Do zrobienia"
- **THEN** the column shows no groups, and its header shows 0

#### Scenario: Dragging out

- **WHEN** the user drags a card from a day group onto "W trakcie"
- **THEN** the task gets the state `doing` as before, and its group's number goes down by one, the group disappearing when it was the last

## MODIFIED Requirements

### Requirement: Order in the tasks tab

The system SHALL order "W trakcie", and "Do zrobienia" while it shows "Pilne", in the tab with urgent tasks first, then the others, each group by due date, a month counting as its last day, so overdue tasks come first and tasks without a date last; equal dates go by title. The manual order from the project boards does not apply, and dropping a card within its own column changes nothing.

#### Scenario: By due date

- **WHEN** today is 2026-11-20 and "Do zrobienia" holds "A" due 2026-11-30, "B" due 2026-11-14, "C" without a date and "D" due 2026-11
- **THEN** the column shows "B", "A", "D", "C"

#### Scenario: Urgent first

- **WHEN** "Do zrobienia" holds "A" due 2026-11-14, urgent "B" due 2026-11-30 and urgent "C" without a date
- **THEN** the column shows "B", "C", "A"

#### Scenario: Done ignores urgency

- **WHEN** an urgent task was done on 2026-11-05 and another task on 2026-11-06
- **THEN** "Wykonane" shows the task done on 2026-11-06 first

#### Scenario: Project order ignored

- **WHEN** a project board shows "A" above "B" in "Do zrobienia" and "B" is due earlier
- **THEN** the tab shows "B" above "A"

#### Scenario: Drop in the same column

- **WHEN** the user drags a card within its own column in the tab
- **THEN** nothing is written and the order stays

#### Scenario: "W trakcie" in the days view

- **WHEN** "Do zrobienia" shows "Dni" and "W trakcie" holds "A" due 2026-11-14 and urgent "B" due 2026-11-30
- **THEN** "W trakcie" shows "B", "A", without day groups
