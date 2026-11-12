# demo Specification

## Purpose
Lets anyone open Kalka with made-up, varied data and use it fully without a data
folder, to show the app, try it in any browser or check a change, with nothing kept.

## Requirements

### Requirement: Open the demo

The system SHALL open the demo version when the address has `demo` in its query (`?demo` before the hash), whatever folder is remembered, and SHALL offer a "Wersja demo" link to that address on the start screen. Hash routes and their filters work in the demo as in the normal version.

#### Scenario: Demo link

- **WHEN** someone opens `https://example.github.io/kalka/?demo`
- **THEN** the calendar shows the demo data without any folder picker or permission prompt

#### Scenario: Remembered folder

- **WHEN** the computer has a remembered folder with access kept and someone opens `?demo#/projekty`
- **THEN** "Projekty" lists the demo projects, not the folder's

#### Scenario: From the start screen

- **WHEN** the start screen shows "Wybierz folder Kalka" and the user clicks "Wersja demo"
- **THEN** the address gets `?demo` and the calendar shows the demo data

#### Scenario: Route kept

- **WHEN** someone opens `?demo#/zadania?a=Ewa%20Kowal`
- **THEN** "Zadania" opens with the "Ewa Kowal" filter set

### Requirement: Real folder untouched

The system SHALL NOT read, write, open, ask permission for or replace the remembered data folder while in the demo.

#### Scenario: Edit in the demo

- **WHEN** the user edits and saves a project in the demo and then opens the normal version
- **THEN** the remembered folder opens as before, with none of the demo's projects or changes

### Requirement: Changes not kept

The system SHALL let the user change demo data like real data (add, edit, delete, drag, refresh) and SHALL keep the changes only in the open page: a reload or a new visit starts from fresh demo data.

#### Scenario: Save in the demo

- **WHEN** the user changes a demo project's title and clicks "Zapisz"
- **THEN** the list shows the new title, as with a real folder

#### Scenario: Reload

- **WHEN** the user deleted a demo task and then reloads the page
- **THEN** the task is back

### Requirement: Demo banner

The system SHALL show, on every tab of the demo, a banner under the header: "Wersja demo - zmyślone dane, zmiany nie są zapisywane i znikną po odświeżeniu strony." with a link "Wyjdź z wersji demo". The header shows "Wersja demo" where the folder name goes.

#### Scenario: Every tab

- **WHEN** the user moves through "Kalendarz", "Projekty", "Terminy", "Zadania", "Spotkania", "Urlopy" and a project's page in the demo
- **THEN** the banner shows on each

#### Scenario: Leave the demo

- **WHEN** the user clicks "Wyjdź z wersji demo"
- **THEN** the address loses `demo` and the hash, and the app starts as usual: the remembered folder, or the start screen

### Requirement: Demo in other browsers

The system SHALL open the demo in browsers without the directory picker, and there the banner SHALL add: "Pełna wersja działa w Google Chrome i Microsoft Edge, bo zapisuje dane w folderze na dysku."

#### Scenario: Firefox

- **WHEN** someone opens `?demo` in a browser without `showDirectoryPicker`
- **THEN** the calendar shows the demo data
- **AND** the banner has the Chrome and Edge line

#### Scenario: Chrome

- **WHEN** someone opens `?demo` in Chrome
- **THEN** the banner has no Chrome and Edge line

### Requirement: Demo data

The system SHALL fill the demo with made-up data that shows every feature. It holds 4 architects, one without initials and colour, and 8 projects. No demo file is broken or shares an id with another, and no name, address, phone or e-mail belongs to a real person or place.

#### Scenario: Architects

- **WHEN** the demo opens
- **THEN** the architect filters list 4 architects, 3 of them with initials and colour on task cards and meetings and 1 without

#### Scenario: Projects

- **WHEN** the demo opens
- **THEN** "Projekty" lists 8 projects covering the types "projekt budowlany", "projekt wnętrz" and "inny" and the statuses "aktywny", "wstrzymany" and "zakończony"
- **AND** among their milestones are day and month dates, planned and confirmed, done and not done, overdue, a milestone the user added with its own title, and a milestone without a date
- **AND** at least one project has filled "Dane projektu" and branch scopes, and one has every branch "brak"
- **AND** no notice of broken files and no "konflikt synchronizacji" badge shows

#### Scenario: Tasks

- **WHEN** the demo opens "Zadania"
- **THEN** every column has tasks, "Do weryfikacji" included, among them urgent ones, overdue ones, ones due today and this week, ones without a due date, ones without an assignee and ones without a project
- **AND** "Wykonane" has more than five done tasks, so older ones are folded

#### Scenario: Leaves and meetings

- **WHEN** the demo opens "Urlopy" and "Spotkania"
- **THEN** there are past, current and upcoming leaves, two of them overlapping
- **AND** meetings of all three types, "stacjonarne", "online" and "na budowie", with and without a project, with and without times, some in the current month

### Requirement: Demo dates follow today

The system SHALL place every demo date (milestones, task due dates, leaves, meetings) relative to the day the demo opens, from 365 days before it to 730 days after it, so the demo looks the same on any day.

#### Scenario: Opened on 2026-11-11

- **WHEN** the demo opens on 2026-11-11
- **THEN** every demo date falls between 2025-11-11 and 2028-11-10
- **AND** "Terminy" lists both upcoming and recently passed milestones

#### Scenario: Opened a year later

- **WHEN** the demo opens on 2027-11-11
- **THEN** the same milestones, tasks, leaves and meetings show, each moved by the same 365 days as the opening day
