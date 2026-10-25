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
- **AND** after a folder is picked the app remembers it and shows the project list

### Requirement: Reopen data folder

The system SHALL reopen the remembered folder on later visits after a single click, without showing the directory picker again.

#### Scenario: Returning user

- **WHEN** the app opens on a computer with a remembered folder
- **THEN** it shows one button "Otwórz folder Kalka"
- **AND** clicking it asks the browser for permission (if needed) and then shows the project list

#### Scenario: Folder no longer available

- **WHEN** the remembered folder cannot be opened (moved, deleted, permission denied)
- **THEN** the app explains this in Polish and offers "Wybierz folder Kalka" again

### Requirement: Unsupported browser

The system SHALL tell the user, in Polish, that Kalka needs Chrome or Edge when the browser has no directory picker, instead of failing silently.

#### Scenario: Firefox

- **WHEN** the app opens in a browser without `showDirectoryPicker`
- **THEN** it shows a message naming Chrome and Edge and no other controls

### Requirement: Folder layout

The system SHALL keep settings in `kalka.json` and one file per project in `projekty/<id>.json`, creating both when the chosen folder is empty.

#### Scenario: Empty folder chosen

- **WHEN** the picked folder has no `kalka.json`
- **THEN** the app creates `kalka.json` with `{ "schema": 1, "architects": [] }` and an empty `projekty/` folder
- **AND** shows an empty project list

### Requirement: Read all projects

The system SHALL read every `projekty/*.json` file when the folder is opened and whenever the user refreshes, and report unreadable files without hiding the others.

#### Scenario: One broken file

- **WHEN** one project file is not valid JSON or has no `id`
- **THEN** the other projects are listed
- **AND** a notice names the broken file

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
