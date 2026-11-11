## MODIFIED Requirements

### Requirement: Choose data folder

The system SHALL let the user pick the Kalka data folder with the browser's directory
picker, with read and write access, and remember the choice on that computer. The start
screen also offers a "Wersja demo" link (see the demo spec).

#### Scenario: First use

- **WHEN** the app opens on a computer that has no remembered folder and the user clicks "Wybierz folder Kalka"
- **THEN** the browser's directory picker opens
- **AND** after a folder is picked the app remembers it and shows the calendar

#### Scenario: Demo link on the start screen

- **WHEN** the app opens on a computer that has no remembered folder
- **THEN** the start screen shows "Wybierz folder Kalka" and, below it, a "Wersja demo" link

### Requirement: Unsupported browser

The system SHALL tell the user, in Polish, that Kalka needs Chrome or Edge when the browser has no directory picker, instead of failing silently, and offer the demo there.

#### Scenario: Firefox

- **WHEN** the app opens without `demo` in the address in a browser without `showDirectoryPicker`
- **THEN** it shows a message naming Chrome and Edge and a "Wersja demo" link, and no other controls
