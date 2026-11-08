## MODIFIED Requirements

### Requirement: Read all tasks

The system SHALL read every `zadania/*.json` file whenever it reads the projects, and report unreadable task files in the same notice as unreadable project files without hiding the other tasks. A task file without `projectId` is a task without a project, not a broken file.

#### Scenario: One broken task file

- **WHEN** one task file is not valid JSON or has no `id`
- **THEN** the other tasks are shown
- **AND** the notice names `zadania/` and the broken file

#### Scenario: Task without a project

- **WHEN** a task file has an `id` and no `projectId`
- **THEN** the task is read as a task without a project and the notice does not name it

#### Scenario: Refresh

- **WHEN** another person added a task and the user clicks "Odśwież" in the project list
- **THEN** the new task shows on its project's board
