# Spec Delta

## MODIFIED Requirements

### Requirement: Task board on the project page

The system SHALL show a section "Zadania" on the page of a saved project, between "Terminy" and "Spotkania", holding the project's tasks in three columns "Do zrobienia", "W trakcie" and "Wykonane". A project that has not been saved yet has no task section.

#### Scenario: Saved project

- **WHEN** the user opens the existing project "Dom Lipowa"
- **THEN** the page shows "Projekt", "Terminy", "Zadania", "Spotkania", "Zakres branż" and "uwagi", in that order
- **AND** "Zadania" shows the columns "Do zrobienia", "W trakcie" and "Wykonane", empty when the project has no tasks

#### Scenario: New project

- **WHEN** the user opens "Nowy projekt"
- **THEN** the page has no "Zadania" section
- **AND** after saving the project and opening it again, the section is there
