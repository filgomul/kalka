# Spec Delta

## Purpose

Keeps the studio's meetings in Kalka, with or without a project, so the project page shows
when and how often the investors were met and the calendar shows meetings next to the
milestones and leaves.

## ADDED Requirements

### Requirement: Meeting fields

The system SHALL hold for each meeting a title, a day, an optional start time "od" and end time "do", an architect picked from the architects in `kalka.json` (optional), an optional project, a type "stacjonarne" or "online", and a note. Only the title and the day are required. An end time needs a start time and is not before it.

#### Scenario: Title missing

- **WHEN** the user saves the meeting dialog with an empty title
- **THEN** nothing is written and the dialog shows "Podaj nazwę spotkania."

#### Scenario: Day missing

- **WHEN** the user saves the meeting dialog without a day
- **THEN** nothing is written and the dialog shows "Podaj datę spotkania."

#### Scenario: End without start

- **WHEN** the user saves a meeting with "do" 11:00 and no "od"
- **THEN** nothing is written and the dialog shows "Podaj godzinę „od”."

#### Scenario: End before start

- **WHEN** the user saves a meeting with "od" 11:00 and "do" 10:30
- **THEN** nothing is written and the dialog shows "Godzina „do” nie może być wcześniejsza niż „od”."

#### Scenario: Only a day

- **WHEN** the user saves "Odbiór próbek" on 2026-11-20 with no times, no architect, no project and no note
- **THEN** the meeting is written with type "stacjonarne"

#### Scenario: Architect no longer listed

- **WHEN** a meeting's architect is "Piotr Zieliński", who is not in `kalka.json`
- **THEN** the dialog shows "Piotr Zieliński" as the selected architect and saving without touching the field keeps it

### Requirement: Meeting dialog

The system SHALL edit a meeting in a dialog titled "Nowe spotkanie" or "Spotkanie" with: "nazwa", "data", "od" and "do" (times), "architekt" (an empty choice and the architects), "projekt" ("bez projektu" and the projects as "l.p. title" in the order of the calendar's project filter), "typ" ("stacjonarne", "online") and "notatka". "Zapisz" writes the meeting at once and "Anuluj" closes without writing.

#### Scenario: Project choices

- **WHEN** the loaded projects are "Dom Lipowa" (l.p. 12) and "Willa Sosnowa" (l.p. 3) and the user opens the dialog
- **THEN** "projekt" offers "bez projektu", "3 Willa Sosnowa" and "12 Dom Lipowa", in that order

#### Scenario: Empty architects list

- **WHEN** `kalka.json` has no architects and the user opens the dialog
- **THEN** the architect choice is empty and the dialog shows "Dodaj architektów w pliku kalka.json"

#### Scenario: Cancel

- **WHEN** the user changes the title in the dialog and clicks "Anuluj"
- **THEN** nothing is written

### Requirement: Meeting times

The system SHALL let the user type the times in "od" and "do" or pick them from a list that opens under the field: "od" lists every quarter hour from 07:00 to 21:00, "do" every quarter hour after "od" up to eight hours later, each with the meeting's length. Typed times are read as "9", "930", "9.30" or "9:30"; unreadable text goes back to the previous value. A new "od" with an empty "do" sets "do" an hour later; changing "od" moves "do" by the same amount.

#### Scenario: Pick the start

- **WHEN** both times are empty and the user picks 10:00 from the "od" list
- **THEN** "od" shows 10:00 and "do" shows 11:00

#### Scenario: End list

- **WHEN** "od" is 10:00 and the user opens "do"
- **THEN** the list starts with "10:15 15 min", "10:30 30 min", "10:45 45 min", "11:00 1 h" and ends with "18:00 8 h"

#### Scenario: Typed time

- **WHEN** the user types "930" in "od" and leaves the field
- **THEN** "od" shows 09:30; "9.30", "9:30" and "09:30" give the same, "9" gives 09:00

#### Scenario: Length kept

- **WHEN** the times are 10:00 and 11:30 and the user changes "od" to 13:00
- **THEN** "do" shows 14:30

#### Scenario: Past midnight

- **WHEN** "do" is empty and the user types 23:30 in "od"
- **THEN** "do" stays empty

#### Scenario: Unreadable text

- **WHEN** "od" shows 10:00 and the user types "jutro" and leaves the field
- **THEN** "od" shows 10:00 again

#### Scenario: No times

- **WHEN** the user clears "od"
- **THEN** "do" is cleared too and cannot be filled until "od" is

#### Scenario: Keyboard

- **WHEN** the "od" field has focus and the user presses arrow down and Enter
- **THEN** the next time in the list is picked; Esc closes the list without closing the dialog

### Requirement: Edit meeting

The system SHALL open the meeting dialog filled with a meeting's values when the meeting is clicked (a card or row on the project page, a row in "Spotkania", a chip in the calendar), and write the changed meeting on "Zapisz".

#### Scenario: Change and save

- **WHEN** the user clicks the meeting "Spotkanie z inwestorem", changes "do" to 12:00 and clicks "Zapisz"
- **THEN** the meeting file holds `"end": "12:00"` and a new `updatedAt`

#### Scenario: Move to another project

- **WHEN** on the page of "Dom Lipowa" the user opens one of its meetings, picks "Willa Sosnowa" as project and saves
- **THEN** the meeting is gone from "Dom Lipowa"'s section and shows in "Willa Sosnowa"'s

### Requirement: Delete meeting

The system SHALL delete a meeting from a button "Usuń" in the dialog of an existing meeting after the user confirms `Usunąć spotkanie „<title>”?`, and remove that meeting's file. A new meeting's dialog has no "Usuń".

#### Scenario: Confirm

- **WHEN** the user clicks "Usuń" in the dialog of "Spotkanie z inwestorem" and confirms
- **THEN** the meeting's file no longer exists and the dialog closes

#### Scenario: Decline

- **WHEN** the user clicks "Usuń" and declines the confirm box
- **THEN** nothing is deleted and the dialog stays open

### Requirement: Meeting type mark

The system SHALL mark each meeting with its type wherever the type is shown: "@" for "online" and a building icon for "stacjonarne", each in its own colour, the same colour in cards, rows and on the project page and in "Spotkania". Hovering the mark names the type.

#### Scenario: Both types

- **WHEN** a project has an online meeting and a stacjonarne meeting
- **THEN** the online one shows "@" and the stacjonarne one a building icon, in two different colours
- **AND** switching between cards and list keeps the same mark and colour for each

### Requirement: Meeting sections

The system SHALL list meetings in two sections: "Bieżące i nadchodzące" with every meeting dated today or later, by day and start time ascending, and below it "Minione" with every meeting dated before today, by day and start time descending. Meetings without a time come after the timed ones of their day, then by title. A section without meetings says so.

#### Scenario: Sections and order

- **WHEN** today is 2026-11-10 and the meetings are A on 2026-11-20 10:00, B on 2026-11-12, C on 2026-11-12 09:00, D on 2026-10-01 and E on 2026-11-03 14:00
- **THEN** "Bieżące i nadchodzące" lists C, B, A
- **AND** "Minione" lists E, D

#### Scenario: Today

- **WHEN** today is 2026-11-10 and a meeting is on 2026-11-10 at 08:00
- **THEN** it is listed under "Bieżące i nadchodzące", also after 08:00

#### Scenario: No upcoming meetings

- **WHEN** every meeting is before today
- **THEN** "Bieżące i nadchodzące" shows "Brak nadchodzących spotkań." and "Minione" lists the meetings

#### Scenario: No meetings at all

- **WHEN** there are no meetings to list
- **THEN** "Bieżące i nadchodzące" shows "Brak nadchodzących spotkań." and no "Minione" section is shown

### Requirement: Meetings section on the project page

The system SHALL show a section "Spotkania" on the page of a saved project, between "Zadania" and "Zakres branż", listing that project's meetings in the meeting sections, with the hint "Zmiany spotkań zapisują się od razu." and a button "+ Dodaj spotkanie". A project that has not been saved yet has no such section.

#### Scenario: Saved project

- **WHEN** the user opens the existing project "Dom Lipowa"
- **THEN** the page shows "Spotkania" after "Zadania" and before "Zakres branż"

#### Scenario: New project

- **WHEN** the user opens "Nowy projekt"
- **THEN** the page has no "Spotkania" section

#### Scenario: Add from the project

- **WHEN** "Dom Lipowa" is led by "Anna Nowak" and the user clicks "+ Dodaj spotkanie" in its section
- **THEN** the dialog "Nowe spotkanie" opens with "projekt" set to "Dom Lipowa", "architekt" to "Anna Nowak" and "typ" to "stacjonarne"
- **AND** after "Zapisz" the meeting shows in the section and a new file `spotkania/<id>.json` holds the project's id

#### Scenario: Project form untouched

- **WHEN** the user adds a meeting, then changes the project title and clicks "Anuluj" in the project form
- **THEN** the meeting stays and the project title is unchanged

### Requirement: Cards or list on the project page

The system SHALL offer two buttons "Karty" and "Lista" at the top of the project's "Spotkania" section. It opens as cards when the project has at most six meetings and as a list when it has more; the buttons switch the view until the page is left.

#### Scenario: Six meetings

- **WHEN** the user opens a project with six meetings
- **THEN** "Karty" is pressed and the meetings show as cards

#### Scenario: Seven meetings

- **WHEN** the user opens a project with seven meetings
- **THEN** "Lista" is pressed and the meetings show as rows

#### Scenario: Switch

- **WHEN** the section shows cards and the user clicks "Lista"
- **THEN** the same meetings show as rows, in the same sections and order

### Requirement: Meeting card

The system SHALL show a meeting card, like a task card, with its title, its type mark in the top-right corner, its note cut after three lines with "…", the day and times bottom-left (`14.11.2026 10:00-11:30`, `14.11.2026 10:00` with only "od", the day alone without times) and, with an architect, a circle with the architect's initials in their colour bottom-right. Cards sit three per row in a window at least 900 px wide.

#### Scenario: Full card

- **WHEN** a meeting "Spotkanie z inwestorem" on 2026-11-14 from 10:00 to 11:30, stacjonarne, with Anna Nowak (initials "AN", colour `#697662`) has a long note
- **THEN** the card shows the title, a building icon top-right, the start of the note ending in "…", "14.11.2026 10:00-11:30" bottom-left and a `#697662` circle with "AN" bottom-right

#### Scenario: Without architect

- **WHEN** a meeting has no architect
- **THEN** its card shows no circle

### Requirement: Meeting row

The system SHALL show a meeting row on one line with the day and times, the title, the architect's initials circle and name, the type mark and the note cut with "…" to fit the line. In "Spotkania" the project title comes second, after the day, and is empty for a meeting without a project; on the project page the row has no project.

#### Scenario: Tab row

- **WHEN** "Spotkania" lists "Spotkanie z inwestorem" of "Dom Lipowa" on 2026-11-14 10:00-11:30
- **THEN** its row shows "14.11.2026 10:00-11:30", "Dom Lipowa", "Spotkanie z inwestorem", the architect, the type mark and the note

#### Scenario: Meeting without a project

- **WHEN** "Spotkania" lists a meeting without a project
- **THEN** its project cell is empty

### Requirement: Meetings tab

The system SHALL show a view "Spotkania", reached from the header tab between "Terminy" and "Urlopy", listing every meeting as rows in the meeting sections, with a count, a button "+ Dodaj spotkanie" that opens "Nowe spotkanie" with "bez projektu" and no architect, and the meeting dialog when a row is clicked.

#### Scenario: Add without a project

- **WHEN** the user clicks "+ Dodaj spotkanie" in "Spotkania", enters "Wizyta w hurtowni", picks 2026-11-18 and clicks "Zapisz"
- **THEN** a new file `spotkania/<id>.json` exists without a `projectId`
- **AND** the row appears under "Bieżące i nadchodzące" with an empty project cell

#### Scenario: Cancel adding

- **WHEN** the user opens the empty dialog and clicks "Anuluj"
- **THEN** no file is written and the list is unchanged

### Requirement: Filters in the meetings tab

The system SHALL filter "Spotkania" with "Architekt" (the meeting's architect; "wszyscy architekci", the architects in `kalka.json` and any meeting's architect not listed) and "Projekt" ("wszystkie spotkania", "z projektem", "bez projektu"). Both are kept in the URL; the architect choice is carried to and from the other tabs like their architect filter.

#### Scenario: One architect

- **WHEN** the user picks "Anna Nowak" in "Spotkania"
- **THEN** both sections list only meetings whose architect is Anna Nowak

#### Scenario: With a project

- **WHEN** the user picks "z projektem"
- **THEN** only meetings with a project are listed, whichever project it is

#### Scenario: Without a project

- **WHEN** the user picks "bez projektu"
- **THEN** only meetings without a project are listed

#### Scenario: Carried from the calendar

- **WHEN** the calendar's architect filter is "Jan Kowalski" and the user clicks "Spotkania"
- **THEN** "Spotkania" opens filtered to Jan Kowalski's meetings

### Requirement: Meeting file

The system SHALL keep each meeting as `spotkania/<id>.json` holding `id`, `title`, `date` (`YYYY-MM-DD`), `start` and `end` (`HH:MM`, absent without a time), `architect` (empty when none), `projectId` (absent without a project), `type` (`stacjonarne` or `online`), `note` and `updatedAt`. A file without `id` or whose `date` is not a valid day is reported as unreadable; an unknown type counts as `stacjonarne`, missing text fields as empty and a time that is not `HH:MM` as absent.

#### Scenario: Written file

- **WHEN** the user adds "Spotkanie z inwestorem" to "Dom Lipowa" on 2026-11-14 from 10:00 to 11:30, online, with Anna Nowak
- **THEN** the file holds the project's id as `"projectId"`, `"date": "2026-11-14"`, `"start": "10:00"`, `"end": "11:30"`, `"architect": "Anna Nowak"` and `"type": "online"`

#### Scenario: Hand-edited file

- **WHEN** a meeting file has `"type": "telefon"`, `"start": "10"` and no `note`
- **THEN** the meeting shows as stacjonarne, without times and with an empty note

#### Scenario: Bad day

- **WHEN** a meeting file has `"date": "2026-11"`
- **THEN** the meeting is not listed and the broken-files notice names `spotkania/` and the file

#### Scenario: Project gone

- **WHEN** a meeting file's `projectId` matches no project file
- **THEN** the meeting counts as a meeting without a project and its file is left alone

### Requirement: Meeting conflict

The system SHALL refuse to write or delete a meeting whose file changed on disk since the meetings were read, read the meetings again and tell the user to repeat the change.

#### Scenario: Someone else changed the meeting first

- **WHEN** the user saves a meeting but another person changed that meeting file since it was read
- **THEN** nothing is written
- **AND** the view shows the meetings as they are on disk and the message "Ktoś inny zmienił to spotkanie w międzyczasie. Spotkania są odświeżone, wprowadź zmianę ponownie."

#### Scenario: Meeting already deleted

- **WHEN** the user saves or deletes a meeting whose file another person has deleted
- **THEN** nothing is written, the meetings are read again and the same message is shown

### Requirement: Sync conflict copies of a meeting

The system SHALL show every meeting file that shares an id with another one, each as its own card or row marked "konflikt synchronizacji" with its file name; deleting one in Kalka removes only that file.

#### Scenario: Two copies

- **WHEN** `spotkania/` holds two files with the same `id`
- **THEN** both show "konflikt synchronizacji" and their file names
- **AND** after the user deletes one, the other is listed without the mark
