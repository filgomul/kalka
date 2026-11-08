# tasks Specification

## Purpose
Small jobs inside a building project, each with an assignee, a due date and a state,
kept as a board on the project page so the studio sees who does what.

## Requirements

### Requirement: Task board on the project page

The system SHALL show a section "Zadania" on the page of a saved project, between "Terminy" and "Spotkania", holding the project's tasks in three columns "Do zrobienia", "W trakcie" and "Wykonane". A project that has not been saved yet has no task section.

#### Scenario: Saved project

- **WHEN** the user opens the existing project "Dom Lipowa"
- **THEN** the page shows "Projekt", "Terminy", "Zadania", "Spotkania", "Zakres branż" and "uwagi", in that order
- **AND** "Zadania" shows the columns "Do zrobienia", "W trakcie" and "Wykonane", empty when the project has no tasks

#### Scenario: New project

- **WHEN** the user opens "Nowy projekt"
- **THEN** the page has no "Zadania" section
- **AND** after saving the project and opening it again, the section is there

### Requirement: Task fields

The system SHALL hold for each task a title, a description, a due date with day or month precision stored and shown like a milestone date, an assignee and a state. Only the title is required. The assignee is picked from the architects in `kalka.json`, whoever leads the project.

#### Scenario: Assignee other than the lead architect

- **WHEN** "Dom Lipowa" is led by "Anna Nowak" and `kalka.json` lists "Anna Nowak" and "Jan Kowalski"
- **THEN** the assignee choice offers an empty choice, "Anna Nowak" and "Jan Kowalski"
- **AND** a task can be saved with "Jan Kowalski" as assignee

#### Scenario: Month precision

- **WHEN** the user switches the task date to "miesiąc", picks November 2026 and saves
- **THEN** the task file holds `"due": "2026-11"` and the card shows `11.2026`

#### Scenario: Title missing

- **WHEN** the user saves a task with an empty title
- **THEN** nothing is written and the dialog shows "Podaj tytuł zadania."

#### Scenario: Assignee no longer listed

- **WHEN** a task's assignee is "Piotr Zieliński", who is not in `kalka.json`
- **THEN** the dialog shows "Piotr Zieliński" as the selected assignee and saving without touching the field keeps it

### Requirement: Add task

The system SHALL add a task from a button "+ Dodaj zadanie" in the task section, which opens the task dialog empty with the state "Do zrobienia"; saving the dialog creates the task in that project.

#### Scenario: Add

- **WHEN** the user clicks "+ Dodaj zadanie" on "Dom Lipowa", enters "Rysunki elewacji" and clicks "Zapisz" in the dialog
- **THEN** a new file `zadania/<id>.json` exists with that title, state `todo` and the project's id
- **AND** the card appears at the bottom of "Do zrobienia"

#### Scenario: Cancel adding

- **WHEN** the user opens the empty dialog and clicks "Anuluj"
- **THEN** no file is written and the board is unchanged

### Requirement: Edit task

The system SHALL open a dialog with all fields of a task when its card is clicked, and save the changed fields when the user clicks "Zapisz" in the dialog; "Anuluj" in the dialog closes it without writing.

#### Scenario: Change and save

- **WHEN** the user clicks the card "Rysunki elewacji", changes the assignee to "Jan Kowalski" and clicks "Zapisz"
- **THEN** the task file holds `"assignee": "Jan Kowalski"` and a new `updatedAt`
- **AND** the card shows Jan Kowalski's initials

#### Scenario: Change state in the dialog

- **WHEN** the user picks "W trakcie" in the dialog's state choice and saves
- **THEN** the card moves to the bottom of "W trakcie"

### Requirement: Move task by dragging

The system SHALL let the user drag a card above or below another card, in its own column or in another one, or onto a column's empty space, which puts it at the bottom. While dragging, the board marks where the card will land. A drop sets the task to that column's state and that place and saves at once; a drop where the card already is changes nothing.

#### Scenario: Drag to done

- **WHEN** the user drags "Rysunki elewacji" from "W trakcie" onto the empty space of "Wykonane"
- **THEN** the task file holds `"status": "done"`
- **AND** the card shows at the bottom of "Wykonane"

#### Scenario: Reorder within a column

- **WHEN** "Do zrobienia" shows "A", "B", "C" and the user drags "C" above "A"
- **THEN** the column shows "C", "A", "B"

#### Scenario: Between cards of another column

- **WHEN** "W trakcie" shows "D", "E" and the user drags "A" from "Do zrobienia" between "D" and "E"
- **THEN** "W trakcie" shows "D", "A", "E" and "A" has the state `doing`

#### Scenario: Same place

- **WHEN** the user drops a card back where it was
- **THEN** nothing is written

### Requirement: Delete task

The system SHALL delete a task from a button "Usuń" in its dialog after the user confirms in a browser confirm box naming the task, and remove that task's file.

#### Scenario: Confirm

- **WHEN** the user clicks "Usuń" for "Rysunki elewacji" and confirms
- **THEN** the task's file no longer exists and the card is gone

#### Scenario: Decline

- **WHEN** the user clicks "Usuń" and declines the confirm box
- **THEN** nothing is deleted and the dialog stays open

### Requirement: Tasks saved apart from the project form

The system SHALL write every task change (add, edit, move, delete) at once to the task's own file, never to the project file, so the project form's "Zapisz" and "Anuluj" neither save nor undo task changes. The section says so under its heading.

#### Scenario: Hint

- **WHEN** the user opens a saved project
- **THEN** the "Zadania" section shows "Zmiany zadań zapisują się od razu."

#### Scenario: Cancel the project form

- **WHEN** the user moves a task to "Wykonane", changes the project title and clicks "Anuluj" in the project form
- **THEN** the task stays in "Wykonane" and the project title is unchanged

#### Scenario: Save the project form after task changes

- **WHEN** the user adds a task and then changes the project title and clicks "Zapisz"
- **THEN** the project is saved without a conflict message and the task exists

### Requirement: Task card

The system SHALL show each task as a card with its title, its due date in the bottom-left corner and, when it has an assignee, a circle with the assignee's initials in the assignee's colour in the bottom-right corner. Text in the circle is light or dark, whichever contrasts more with the colour.

#### Scenario: Full card

- **WHEN** a task "Rysunki elewacji" is due 2026-11-14 and assigned to "Anna Nowak" with initials "AN" and colour `#697662`
- **THEN** the card shows "Rysunki elewacji", "14.11.2026" bottom-left and a `#697662` circle with "AN" bottom-right

#### Scenario: No date, no assignee

- **WHEN** a task has neither a due date nor an assignee
- **THEN** the card shows only its title

#### Scenario: Overdue

- **WHEN** today is 2026-11-20 and a task in "Do zrobienia" or "W trakcie" is due 2026-11-14
- **THEN** its date is marked "po terminie"

#### Scenario: Done is never overdue

- **WHEN** today is 2026-11-20 and a task in "Wykonane" is due 2026-11-14
- **THEN** its date is not marked "po terminie"

### Requirement: Assignee initials and colour

The system SHALL take an assignee's initials and colour from their entry in `kalka.json`. Without initials it uses the first letters of the first and last word of the name in capitals; without a valid hex colour (`#rgb` or `#rrggbb`) it uses grey.

#### Scenario: Defined in kalka.json

- **WHEN** `kalka.json` holds `{ "name": "Anna Nowak", "initials": "ANo", "color": "#697662" }`
- **THEN** cards assigned to Anna Nowak show "ANo" in a `#697662` circle

#### Scenario: Plain name

- **WHEN** `kalka.json` lists "Jan Maria Kowalski" as a plain name
- **THEN** cards assigned to him show "JK" in a grey circle

#### Scenario: Invalid colour

- **WHEN** an entry has `"color": "zielony"`
- **THEN** that architect's circle is grey

### Requirement: Order of cards

The system SHALL show the cards of each column in the order users arranged them, the same for everybody and after a refresh; the due date does not reorder them. Tasks without a place yet, from hand-edited files, come after the others by due date (a month counting as its last day), then those without a date, then by title.

#### Scenario: Order kept

- **WHEN** one user arranges "Do zrobienia" as "C", "A", "B" and another user opens the project after OneDrive synced the files
- **THEN** the other user sees "C", "A", "B"

#### Scenario: Date changed

- **WHEN** "Do zrobienia" shows "A", "B" and the user gives "B" a due date earlier than "A"'s
- **THEN** the column still shows "A", "B"

#### Scenario: Tasks without a place

- **WHEN** "Do zrobienia" holds "X" with a place, and "B" due 2026-11-30, "A" due 2026-11 and "C" without a date, none of them with a place
- **THEN** the column shows "X", "A", "B", "C", because "A" is due 30.11.2026 and sorts by title before "B"

### Requirement: Task conflict

The system SHALL refuse to write or delete a task whose file changed on disk since the tasks were read, read the tasks again and tell the user to repeat the change.

#### Scenario: Someone else moved the task first

- **WHEN** the user drags a task to "Wykonane" but another person changed that task file since it was read
- **THEN** nothing is written
- **AND** the board shows the tasks as they are on disk and the message "Ktoś inny zmienił to zadanie w międzyczasie. Zadania są odświeżone, wprowadź zmianę ponownie."

#### Scenario: Task already deleted

- **WHEN** the user saves a task whose file another person has deleted
- **THEN** nothing is written, the tasks are read again and the same message is shown

### Requirement: Task file

The system SHALL keep each task as `zadania/<id>.json` holding `id`, `projectId`, `title`, `description`, `due` (absent without a date), `assignee` (empty when none), `status` (`todo`, `doing` or `done`), `order` (a number for its place in its column) and `updatedAt`. A file with an unknown status counts as `todo`; missing text fields count as empty; without a numeric `order` the task has no place yet.

#### Scenario: Written file

- **WHEN** the user adds "Rysunki elewacji" due 2026-11-14 for Anna Nowak to "Dom Lipowa"
- **THEN** the file holds `"projectId"` equal to the project's `id`, `"due": "2026-11-14"`, `"assignee": "Anna Nowak"` and `"status": "todo"`

#### Scenario: Hand-edited file

- **WHEN** a task file has `"status": "gotowe"` and no `description`
- **THEN** the task shows in "Do zrobienia" with an empty description

#### Scenario: Project gone

- **WHEN** a task file's `projectId` matches no project file
- **THEN** the task is shown nowhere and its file is left alone

### Requirement: Sync conflict copies of a task

The system SHALL show every task file that shares an id with another task file as its own card with a "konflikt synchronizacji" badge, and deleting one of them removes only that file.

#### Scenario: Two copies

- **WHEN** `zadania/` holds two files with the same task id
- **THEN** both cards show with the "konflikt synchronizacji" badge
- **AND** deleting one leaves the other file and its card, now without the badge after the tasks are read again
