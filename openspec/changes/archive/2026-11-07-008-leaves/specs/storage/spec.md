# Spec Delta

## MODIFIED Requirements

### Requirement: Folder layout

The system SHALL keep settings in `kalka.json`, one file per project in `projekty/<id>.json`, one file per task in `zadania/<id>.json` and one file per leave in `urlopy/<id>.json`, creating the file and the folders when they are missing.

#### Scenario: Empty folder chosen

- **WHEN** the picked folder has no `kalka.json`
- **THEN** the app creates `kalka.json` with `{ "schema": 1, "architects": [] }` and empty `projekty/`, `zadania/` and `urlopy/` folders
- **AND** shows an empty project list

#### Scenario: Folder from before tasks

- **WHEN** the picked folder has `kalka.json` and `projekty/` but no `zadania/`
- **THEN** the app creates an empty `zadania/` folder and leaves the other files as they are

#### Scenario: Folder from before leaves

- **WHEN** the picked folder has `kalka.json`, `projekty/` and `zadania/` but no `urlopy/`
- **THEN** the app creates an empty `urlopy/` folder and leaves the other files as they are

## ADDED Requirements

### Requirement: Read all leaves

The system SHALL read every `urlopy/*.json` file whenever it reads the projects, and report unreadable leave files in the same notice as unreadable project and task files without hiding the other leaves.

#### Scenario: One broken leave file

- **WHEN** one leave file is not valid JSON
- **THEN** the other leaves are listed
- **AND** the notice names `urlopy/` and the broken file

#### Scenario: Refresh

- **WHEN** another person added a leave and the user clicks "Odśwież" in the project list
- **THEN** the new leave shows in "Urlopy" and in the calendar
