## MODIFIED Requirements

### Requirement: Views navigation

The system SHALL show a header with six tabs, "Kalendarz", "Projekty", "Terminy", "Zadania", "Spotkania" and "Urlopy", mark the current one, and keep the lead-architect and status filters when switching tabs. "Kalendarz" is the start view: the home address and the app name in the header lead to it.

#### Scenario: Tab order

- **WHEN** the user opens Kalka
- **THEN** the header shows "Kalendarz", "Projekty", "Terminy", "Zadania", "Spotkania" and "Urlopy", in that order

#### Scenario: Start view

- **WHEN** the user opens the home address or clicks "Kalka" in the header
- **THEN** the calendar is shown with "Kalendarz" marked as the current tab

#### Scenario: Back to the project list

- **WHEN** the user opens a project from "Projekty" and clicks "Anuluj"
- **THEN** the project list is shown again with the same filters and search

#### Scenario: Switch with a filter

- **WHEN** the project list is filtered to architect "Anna Nowak" and the user clicks "Kalendarz"
- **THEN** the calendar opens filtered to "Anna Nowak"
- **AND** clicking "Terminy" opens the deadlines list filtered to "Anna Nowak"
- **AND** clicking "Zadania" opens the tasks tab filtered to tasks assigned to "Anna Nowak"
- **AND** clicking "Spotkania" opens the meetings list filtered to "Anna Nowak"
- **AND** clicking "Urlopy" opens the leaves list filtered to "Anna Nowak"

#### Scenario: Search stays on the list

- **WHEN** the project list has the search text "Oliwa" and the user clicks "Kalendarz"
- **THEN** the calendar is not narrowed by that text
