# Spec Delta

## Purpose

Keeps the architects' leaves in Kalka, listed in the "Urlopy" tab, so the studio sees who
is away and when, next to the milestones in the calendar.

## ADDED Requirements

### Requirement: Leaves tab

The system SHALL show a view "Urlopy", reached from the fourth header tab, listing leaves in two sections: "Bieżące i nadchodzące" with every leave whose "do" is today or later, by "od" ascending, and below it "Minione" with every leave that ended before today, by "od" descending. Leaves starting on the same day are ordered by architect name. A section without leaves says so.

#### Scenario: Sections and order

- **WHEN** today is 2026-11-10 and the leaves are Anna Nowak 2026-12-01 to 2026-12-05, Jan Kowalski 2026-11-09 to 2026-11-13, Anna Nowak 2026-07-01 to 2026-07-14 and Jan Kowalski 2026-10-19 to 2026-10-23
- **THEN** "Bieżące i nadchodzące" lists Jan Kowalski 09.11.2026 - 13.11.2026 and then Anna Nowak 01.12.2026 - 05.12.2026
- **AND** "Minione" lists Jan Kowalski 19.10.2026 - 23.10.2026 and then Anna Nowak 01.07.2026 - 14.07.2026

#### Scenario: Ends today

- **WHEN** today is 2026-11-10 and a leave ends on 2026-11-10
- **THEN** it is listed under "Bieżące i nadchodzące"

#### Scenario: Going on today

- **WHEN** today is 2026-11-10 and a leave runs from 2026-11-09 to 2026-11-13
- **THEN** its row is marked "trwa"
- **AND** a leave from 2026-12-01 to 2026-12-05 is not marked

#### Scenario: No current leaves

- **WHEN** every leave ended before today
- **THEN** "Bieżące i nadchodzące" shows "Brak nadchodzących urlopów." and "Minione" lists the leaves

#### Scenario: No leaves at all

- **WHEN** there are no leave files
- **THEN** "Bieżące i nadchodzące" shows "Brak nadchodzących urlopów." and no "Minione" section is shown

### Requirement: Leave row

The system SHALL show each leave as a row with the architect's name and its dates as "od - do" (`DD.MM.YYYY - DD.MM.YYYY`, a one-day leave as one date), coloured by the architect's colour in `kalka.json` the way the "Terminy" list colours a milestone by its style, with buttons "Edytuj" and "Usuń".

#### Scenario: Architect with a colour

- **WHEN** `kalka.json` holds `{ "name": "Anna Nowak", "color": "#697662" }` and Anna Nowak has a leave from 2026-12-01 to 2026-12-05
- **THEN** its row shows "Anna Nowak" and "01.12.2026 - 05.12.2026" in `#697662`

#### Scenario: One day

- **WHEN** a leave runs from 2026-12-07 to 2026-12-07
- **THEN** its row shows "07.12.2026"

#### Scenario: No colour

- **WHEN** the architect is a plain name in `kalka.json`, has an invalid colour or is not in `kalka.json`
- **THEN** the row is grey

### Requirement: Leave fields

The system SHALL hold for each leave an architect, picked from the architects in `kalka.json`, and the first and last day of the leave, "od" and "do", both whole days. All three are required and "do" may not be before "od".

#### Scenario: Architect missing

- **WHEN** the user saves the dialog without an architect
- **THEN** nothing is written and the dialog shows "Wybierz architekta."

#### Scenario: Date missing

- **WHEN** the user saves the dialog with "od" or "do" empty
- **THEN** nothing is written and the dialog shows "Podaj daty od i do."

#### Scenario: End before start

- **WHEN** the user saves the dialog with "od" 2026-12-05 and "do" 2026-12-01
- **THEN** nothing is written and the dialog shows "Data „do” nie może być wcześniejsza niż „od”."

#### Scenario: Architect no longer listed

- **WHEN** a leave's architect is "Piotr Zieliński", who is not in `kalka.json`
- **THEN** the dialog shows "Piotr Zieliński" as the selected architect and saving without touching the field keeps it

#### Scenario: Empty architects list

- **WHEN** `kalka.json` has no architects and the user opens the dialog
- **THEN** the architect choice is empty and the dialog shows "Dodaj architektów w pliku kalka.json"

### Requirement: Add leave

The system SHALL add a leave from a button "+ Dodaj urlop" in the "Urlopy" view, which opens the leave dialog "Nowy urlop" empty; "Zapisz" in the dialog writes the leave at once and "Anuluj" closes it without writing.

#### Scenario: Add

- **WHEN** the user clicks "+ Dodaj urlop", picks "Anna Nowak", "od" 2026-12-01 and "do" 2026-12-05 and clicks "Zapisz"
- **THEN** a new file `urlopy/<id>.json` exists with those values
- **AND** the row appears under "Bieżące i nadchodzące"

#### Scenario: Cancel adding

- **WHEN** the user opens the empty dialog and clicks "Anuluj"
- **THEN** no file is written and the list is unchanged

### Requirement: Edit leave

The system SHALL open the leave dialog "Urlop" with the leave's values when its "Edytuj" button is clicked, and write the changed leave when the user clicks "Zapisz"; "Anuluj" closes it without writing.

#### Scenario: Change and save

- **WHEN** the user clicks "Edytuj" on Anna Nowak 01.12.2026 - 05.12.2026, changes "do" to 2026-12-08 and clicks "Zapisz"
- **THEN** the leave file holds `"to": "2026-12-08"` and a new `updatedAt`
- **AND** the row shows "01.12.2026 - 08.12.2026"

### Requirement: Delete leave

The system SHALL delete a leave from its "Usuń" button after the user confirms in a browser confirm box naming the architect and dates, and remove that leave's file.

#### Scenario: Confirm

- **WHEN** the user clicks "Usuń" on Anna Nowak 01.12.2026 - 05.12.2026 and confirms "Usunąć urlop: Anna Nowak, 01.12.2026 - 05.12.2026?"
- **THEN** the leave's file no longer exists and the row is gone

#### Scenario: Decline

- **WHEN** the user clicks "Usuń" and declines the confirm box
- **THEN** nothing is deleted

### Requirement: Architect filter for leaves

The system SHALL filter the "Urlopy" view by the architect on leave with a choice "Architekt" offering "wszyscy architekci", the architects in `kalka.json` and any architect of a leave who is not listed. The choice is kept in the URL and carried to and from the other tabs like their architect filter.

#### Scenario: One architect

- **WHEN** the user picks "Anna Nowak" in "Urlopy"
- **THEN** both sections list only Anna Nowak's leaves

#### Scenario: Carried from the calendar

- **WHEN** the calendar's architect filter is "Jan Kowalski" and the user clicks "Urlopy"
- **THEN** "Urlopy" opens filtered to Jan Kowalski's leaves

#### Scenario: Architect not listed

- **WHEN** a leave belongs to "Piotr Zieliński", who is not in `kalka.json`
- **THEN** the filter offers "Piotr Zieliński" after the names from `kalka.json`

### Requirement: Leave file

The system SHALL keep each leave as `urlopy/<id>.json` holding `id`, `architect`, `from` and `to` (`YYYY-MM-DD`) and `updatedAt`. A file without `id`, without an `architect`, or whose `from` or `to` is not a valid day, or whose `to` is before `from`, is reported as unreadable.

#### Scenario: Written file

- **WHEN** the user adds a leave for Anna Nowak from 2026-12-01 to 2026-12-05
- **THEN** the file holds `"architect": "Anna Nowak"`, `"from": "2026-12-01"`, `"to": "2026-12-05"` and an `updatedAt`

#### Scenario: Hand-edited file with a bad date

- **WHEN** a leave file has `"from": "2026-12"`
- **THEN** the leave is not listed and the broken-files notice names `urlopy/` and the file

### Requirement: Leave conflict

The system SHALL refuse to write or delete a leave whose file changed on disk since the leaves were read, read the leaves again and tell the user to repeat the change.

#### Scenario: Someone else changed the leave first

- **WHEN** the user saves a leave but another person changed that leave file since it was read
- **THEN** nothing is written
- **AND** the list shows the leaves as they are on disk and the message "Ktoś inny zmienił ten urlop w międzyczasie. Urlopy są odświeżone, wprowadź zmianę ponownie."

#### Scenario: Leave already deleted

- **WHEN** the user saves or deletes a leave whose file another person has deleted
- **THEN** nothing is written, the leaves are read again and the same message is shown

### Requirement: Sync conflict copies of a leave

The system SHALL show every leave file that shares an id with another one, each as its own row marked "konflikt synchronizacji" with its file name; deleting one in Kalka removes only that file.

#### Scenario: Two copies

- **WHEN** `urlopy/` holds two files with the same `id`
- **THEN** both rows show "konflikt synchronizacji" and their file names
- **AND** after the user deletes one, the other is listed without the mark
