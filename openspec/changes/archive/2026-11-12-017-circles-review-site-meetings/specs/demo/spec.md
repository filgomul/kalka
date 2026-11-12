# Spec Delta

## MODIFIED Requirements

### Requirement: Demo data

The system SHALL fill the demo with made-up data that shows every feature. It holds 4 architects, one without initials and colour, and 8 projects. No demo file is broken or shares an id with another, and no name, address, phone or e-mail belongs to a real person or place.

#### Scenario: Architects

- **WHEN** the demo opens
- **THEN** the architect filters list 4 architects, 3 of them with initials and colour on task cards and meetings and 1 without

#### Scenario: Projects

- **WHEN** the demo opens
- **THEN** "Projekty" lists 8 projects covering the types "projekt budowlany", "projekt wnętrz" and "inny" and the statuses "aktywny", "wstrzymany" and "zakończony"
- **AND** among their milestones are day and month dates, planned and confirmed, done and not done, overdue, a milestone the user added with its own title, and a milestone without a date
- **AND** at least one project has filled "Dane projektu" and branch scopes, and one has every branch "brak"
- **AND** no notice of broken files and no "konflikt synchronizacji" badge shows

#### Scenario: Tasks

- **WHEN** the demo opens "Zadania"
- **THEN** every column has tasks, "Do weryfikacji" included, among them urgent ones, overdue ones, ones due today and this week, ones without a due date, ones without an assignee and ones without a project
- **AND** "Wykonane" has more than five done tasks, so older ones are folded

#### Scenario: Leaves and meetings

- **WHEN** the demo opens "Urlopy" and "Spotkania"
- **THEN** there are past, current and upcoming leaves, two of them overlapping
- **AND** meetings of all three types, "stacjonarne", "online" and "na budowie", with and without a project, with and without times, some in the current month
