# storage Specification

## Purpose

Keeps all Kalka data as files in a folder the studio chooses on its shared OneDrive, so
nothing leaves the studio's computers and no server is needed.

## Requirements

### Requirement: Choose data folder

The system SHALL let the user pick the Kalka data folder with the browser's directory
picker, with read and write access, and remember the choice on that computer.

#### Scenario: First use

- **WHEN** the app opens on a computer that has no remembered folder and the user clicks "Wybierz folder Kalka"
- **THEN** the browser's directory picker opens
- **AND** after a folder is picked the app remembers it and shows the calendar

### Requirement: Reopen data folder

The system SHALL reopen the remembered folder on later visits without showing the directory picker again: straight away when the browser still grants read and write access to it, otherwise after a single click.

#### Scenario: Returning user

- **WHEN** the app opens on a computer with a remembered folder and the browser did not keep access to it
- **THEN** it shows one button "Otwórz folder Kalka"
- **AND** clicking it asks the browser for permission (if needed) and then shows the calendar

#### Scenario: Access kept by the browser

- **WHEN** the user earlier chose "Allow on every visit" in the browser's permission prompt and then refreshes the page
- **THEN** the app shows the page it was on without any click
- **AND** the "Otwórz folder Kalka" and "Wybierz folder Kalka" buttons do not flash up while the app checks

#### Scenario: Folder no longer available

- **WHEN** the remembered folder cannot be opened (moved, deleted, permission denied)
- **THEN** the app explains this in Polish and offers "Wybierz folder Kalka" again

### Requirement: Unsupported browser

The system SHALL tell the user, in Polish, that Kalka needs Chrome or Edge when the browser has no directory picker, instead of failing silently.

#### Scenario: Firefox

- **WHEN** the app opens in a browser without `showDirectoryPicker`
- **THEN** it shows a message naming Chrome and Edge and no other controls

### Requirement: Folder layout

The system SHALL keep settings in `kalka.json`, one file per project in `projekty/<id>.json`, one file per task in `zadania/<id>.json`, one file per leave in `urlopy/<id>.json` and one file per meeting in `spotkania/<id>.json`, creating the file and the folders when they are missing.

#### Scenario: Empty folder chosen

- **WHEN** the picked folder has no `kalka.json`
- **THEN** the app creates `kalka.json` with `{ "schema": 1, "architects": [] }` and empty `projekty/`, `zadania/`, `urlopy/` and `spotkania/` folders
- **AND** shows an empty calendar

#### Scenario: Folder from before tasks

- **WHEN** the picked folder has `kalka.json` and `projekty/` but no `zadania/`
- **THEN** the app creates an empty `zadania/` folder and leaves the other files as they are

#### Scenario: Folder from before leaves

- **WHEN** the picked folder has `kalka.json`, `projekty/` and `zadania/` but no `urlopy/`
- **THEN** the app creates an empty `urlopy/` folder and leaves the other files as they are

#### Scenario: Folder from before meetings

- **WHEN** the picked folder has `kalka.json`, `projekty/`, `zadania/` and `urlopy/` but no `spotkania/`
- **THEN** the app creates an empty `spotkania/` folder and leaves the other files as they are

### Requirement: Read all projects

The system SHALL read every `projekty/*.json` file when the folder is opened and whenever the user refreshes, and report unreadable files without hiding the others, in a notice shown under the header on every tab.

#### Scenario: One broken file

- **WHEN** one project file is not valid JSON or has no `id`
- **THEN** the other projects are listed
- **AND** a notice names the broken file

#### Scenario: Notice on the start view

- **WHEN** a project file is broken and the app opens on "Kalendarz"
- **THEN** the calendar shows the notice naming the file
- **AND** "Projekty", "Terminy", "Spotkania" and "Urlopy" show it too

### Requirement: Save with conflict check

The system SHALL write a project to its own file and refuse to overwrite a file that changed since the project was loaded.

#### Scenario: Normal save

- **WHEN** the user saves a project whose file still has the `updatedAt` that was loaded
- **THEN** the file is written with the new values and a new `updatedAt`
- **AND** the list shows the new values

#### Scenario: Someone else saved first

- **WHEN** the user saves a project but the file on disk has a different `updatedAt` than the one loaded
- **THEN** nothing is written
- **AND** the form shows "Ktoś inny zapisał ten projekt w międzyczasie. Odśwież i wprowadź zmiany ponownie."

### Requirement: Duplicate ids

The system SHALL show every file that shares an id with another file (for example a OneDrive conflict copy) and mark them, rather than silently picking one.

#### Scenario: OneDrive conflict copy

- **WHEN** `projekty/` holds two files with the same `id`
- **THEN** both appear in the list with a "konflikt synchronizacji" badge and their file names
- **AND** the app deletes neither; the user removes the unwanted copy in OneDrive

### Requirement: Read all tasks

The system SHALL read every `zadania/*.json` file whenever it reads the projects, and report unreadable task files in the same notice as unreadable project files without hiding the other tasks.

#### Scenario: One broken task file

- **WHEN** one task file is not valid JSON or has no `id` or no `projectId`
- **THEN** the other tasks are shown
- **AND** the notice names `zadania/` and the broken file

#### Scenario: Refresh

- **WHEN** another person added a task and the user clicks "Odśwież" in the project list
- **THEN** the new task shows on its project's board

### Requirement: Read all leaves

The system SHALL read every `urlopy/*.json` file whenever it reads the projects, and report unreadable leave files in the same notice as unreadable project and task files without hiding the other leaves.

#### Scenario: One broken leave file

- **WHEN** one leave file is not valid JSON
- **THEN** the other leaves are listed
- **AND** the notice names `urlopy/` and the broken file

#### Scenario: Refresh

- **WHEN** another person added a leave and the user clicks "Odśwież" in the project list
- **THEN** the new leave shows in "Urlopy" and in the calendar

### Requirement: Read all meetings

The system SHALL read every `spotkania/*.json` file whenever it reads the projects, and report unreadable meeting files in the same notice as unreadable project, task and leave files without hiding the other meetings.

#### Scenario: One broken meeting file

- **WHEN** one meeting file is not valid JSON
- **THEN** the other meetings are listed
- **AND** the notice names `spotkania/` and the broken file

#### Scenario: Refresh

- **WHEN** another person added a meeting and the user clicks "Odśwież" in the project list
- **THEN** the new meeting shows in "Spotkania", on its project's page and in the calendar
