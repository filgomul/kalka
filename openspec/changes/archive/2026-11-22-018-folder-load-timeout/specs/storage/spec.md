# Spec Delta

## ADDED Requirements

### Requirement: Remembered folder does not answer

The system SHALL stop waiting when reading the remembered folder takes longer than 5 seconds, at startup or after "Otwórz folder Kalka" (counted from the end of the browser's permission prompt), explain in Polish that the folder does not answer and that OneDrive should be checked, and offer "Wybierz folder Kalka". If the read still finishes before the user clicks that button, the system SHALL open with that data. Saves, refreshes and reading a newly picked folder have no limit.

#### Scenario: OneDrive does not answer

- **WHEN** the app opens on a computer whose browser kept access to the remembered folder, and reading the folder has not finished after 5 seconds (for example OneDrive is paused or the files are cloud-only)
- **THEN** "Wczytywanie…" is replaced by "Folder Kalka nie odpowiada. Sprawdź, czy OneDrive działa i synchronizuje pliki, albo wybierz folder ponownie."
- **AND** the "Wybierz folder Kalka" button is shown

#### Scenario: OneDrive does not answer after "Otwórz folder Kalka"

- **WHEN** the browser did not keep access, the user clicks "Otwórz folder Kalka" and allows access, and reading the folder has not finished 5 seconds after that
- **THEN** the same message and the "Wybierz folder Kalka" button are shown instead of the disabled "Otwórz folder Kalka"
- **AND** time the user spends on the browser's permission prompt does not count towards the 5 seconds

#### Scenario: Picking the folder again

- **WHEN** the message is shown and the user clicks "Wybierz folder Kalka" and picks a folder that answers
- **THEN** the app remembers the new folder and shows the calendar
- **AND** no file in either folder is changed by the read that timed out

#### Scenario: Folder answers late

- **WHEN** the message is shown and the stuck read finishes before the user clicks "Wybierz folder Kalka"
- **THEN** the app shows the page it was on with the folder's data, as on a normal start

#### Scenario: Late answer after a click

- **WHEN** the user clicked "Wybierz folder Kalka" and the stuck read finishes afterwards
- **THEN** its data is not shown; the app keeps the folder the user picks

#### Scenario: Slow but healthy folder

- **WHEN** reading the remembered folder finishes within 5 seconds
- **THEN** the app opens as before and no message is shown

#### Scenario: Saving is not limited

- **WHEN** the app is open and a save or "Odśwież" takes longer than 5 seconds
- **THEN** the app keeps waiting for it as before
