## MODIFIED Requirements

### Requirement: Reopen data folder

The system SHALL reopen the remembered folder on later visits without showing the directory picker again: straight away when the browser still grants read and write access to it, otherwise after a single click.

#### Scenario: Returning user

- **WHEN** the app opens on a computer with a remembered folder and the browser did not keep access to it
- **THEN** it shows one button "Otwórz folder Kalka"
- **AND** clicking it asks the browser for permission (if needed) and then shows the project list

#### Scenario: Access kept by the browser

- **WHEN** the user earlier chose "Allow on every visit" in the browser's permission prompt and then refreshes the page
- **THEN** the app shows the project list without any click
- **AND** the "Otwórz folder Kalka" and "Wybierz folder Kalka" buttons do not flash up while the app checks

#### Scenario: Folder no longer available

- **WHEN** the remembered folder cannot be opened (moved, deleted, permission denied)
- **THEN** the app explains this in Polish and offers "Wybierz folder Kalka" again
