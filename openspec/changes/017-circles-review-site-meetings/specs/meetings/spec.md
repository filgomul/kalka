# Spec Delta

## MODIFIED Requirements

### Requirement: Meeting fields

The system SHALL hold for each meeting a title, a day, an optional start time "od" and end time "do", an architect picked from the architects in `kalka.json` (optional), an optional project, a type "stacjonarne", "online" or "na budowie", and a note. Only the title and the day are required. An end time needs a start time and is not before it.

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

#### Scenario: On site

- **WHEN** the user opens the type choice in the meeting dialog
- **THEN** it offers "stacjonarne", "online" and "na budowie", with "stacjonarne" chosen for a new meeting
- **AND** saving "Odbiór stropu" with "na budowie" writes the meeting with that type

#### Scenario: Architect no longer listed

- **WHEN** a meeting's architect is "Piotr Zieliński", who is not in `kalka.json`
- **THEN** the dialog shows "Piotr Zieliński" as the selected architect and saving without touching the field keeps it

### Requirement: Meeting type mark

The system SHALL mark each meeting with its type wherever the type is shown: "@" for "online", a building icon for "stacjonarne" and a hard hat for "na budowie", each in its own colour, the same colour in cards, rows and on the project page and in "Spotkania". Hovering the mark names the type.

#### Scenario: Both types

- **WHEN** a project has an online meeting and a stacjonarne meeting
- **THEN** the online one shows "@" and the stacjonarne one a building icon, in two different colours
- **AND** switching between cards and list keeps the same mark and colour for each

#### Scenario: On site

- **WHEN** a project has a meeting of type "na budowie"
- **THEN** it shows a hard hat in a colour different from both other types
- **AND** hovering the mark shows "na budowie"

### Requirement: Meeting file

The system SHALL keep each meeting as `spotkania/<id>.json` holding `id`, `title`, `date` (`YYYY-MM-DD`), `start` and `end` (`HH:MM`, absent without a time), `architect` (empty when none), `projectId` (absent without a project), `type` (`stacjonarne`, `online` or `budowa`), `note` and `updatedAt`. A file without `id` or whose `date` is not a valid day is reported as unreadable; an unknown type counts as `stacjonarne`, missing text fields as empty and a time that is not `HH:MM` as absent.

#### Scenario: Written file

- **WHEN** the user adds "Spotkanie z inwestorem" to "Dom Lipowa" on 2026-11-14 from 10:00 to 11:30, online, with Anna Nowak
- **THEN** the file holds the project's id as `"projectId"`, `"date": "2026-11-14"`, `"start": "10:00"`, `"end": "11:30"`, `"architect": "Anna Nowak"` and `"type": "online"`

#### Scenario: On site file

- **WHEN** the user saves a meeting of type "na budowie"
- **THEN** the file holds `"type": "budowa"`
- **AND** reading it back shows the meeting as "na budowie"

#### Scenario: Hand-edited file

- **WHEN** a meeting file has `"type": "telefon"`, `"start": "10"` and no `note`
- **THEN** the meeting shows as stacjonarne, without times and with an empty note

#### Scenario: Bad day

- **WHEN** a meeting file has `"date": "2026-11"`
- **THEN** the meeting is not listed and the broken-files notice names `spotkania/` and the file

#### Scenario: Project gone

- **WHEN** a meeting file's `projectId` matches no project file
- **THEN** the meeting counts as a meeting without a project and its file is left alone
