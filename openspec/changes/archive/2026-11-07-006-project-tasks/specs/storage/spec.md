## MODIFIED Requirements

### Requirement: Folder layout

The system SHALL keep settings in `kalka.json`, one file per project in `projekty/<id>.json` and one file per task in `zadania/<id>.json`, creating the file and both folders when they are missing.

#### Scenario: Empty folder chosen

- **WHEN** the picked folder has no `kalka.json`
- **THEN** the app creates `kalka.json` with `{ "schema": 1, "architects": [] }` and empty `projekty/` and `zadania/` folders
- **AND** shows an empty project list

#### Scenario: Folder from before tasks

- **WHEN** the picked folder has `kalka.json` and `projekty/` but no `zadania/`
- **THEN** the app creates an empty `zadania/` folder and leaves the other files as they are

## ADDED Requirements

### Requirement: Read all tasks

The system SHALL read every `zadania/*.json` file whenever it reads the projects, and report unreadable task files in the same notice as unreadable project files without hiding the other tasks.

#### Scenario: One broken task file

- **WHEN** one task file is not valid JSON or has no `id` or no `projectId`
- **THEN** the other tasks are shown
- **AND** the notice names `zadania/` and the broken file

#### Scenario: Refresh

- **WHEN** another person added a task and the user clicks "Odśwież" in the project list
- **THEN** the new task shows on its project's board
