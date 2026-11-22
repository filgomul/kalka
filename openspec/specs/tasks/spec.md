# tasks Specification

## Purpose
Small jobs inside a building project, each with an assignee, a due date and a state,
kept as a board on the project page so the studio sees who does what.

## Requirements

### Requirement: Task board on the project page

The system SHALL show a section "Zadania" on the page of a saved project, between "Terminy" and "Spotkania", holding the project's tasks in four columns "Do zrobienia", "W trakcie", "Do weryfikacji" and "Wykonane", each in its own colour. A project that has not been saved yet has no task section.

#### Scenario: Saved project

- **WHEN** the user opens the existing project "Dom Lipowa"
- **THEN** the page shows "Projekt", "Terminy", "Zadania", "Spotkania", "Zakres branż" and "uwagi", in that order
- **AND** "Zadania" shows the columns "Do zrobienia", "W trakcie", "Do weryfikacji" and "Wykonane", empty when the project has no tasks

#### Scenario: Waiting for a check

- **WHEN** the user drags "Rysunki elewacji" from "W trakcie" onto "Do weryfikacji"
- **THEN** the task file holds `"status": "review"` and the card shows in "Do weryfikacji", whose header is light blue

#### Scenario: New project

- **WHEN** the user opens "Nowy projekt"
- **THEN** the page has no "Zadania" section
- **AND** after saving the project and opening it again, the section is there

### Requirement: Task fields

The system SHALL hold for each task a title, a description, a due date with day or month precision stored and shown like a milestone date, an assignee, a reviewer ("weryfikuje"), reviewer notes ("uwagi z weryfikacji") and a state. Only the title is required, and the reviewer in "Do weryfikacji". The assignee and the reviewer are picked from the architects in `kalka.json`, whoever leads the project; the reviewer may be the assignee. The dialog always shows both reviewer fields, and the reviewer and the notes stay when the task changes state.

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

#### Scenario: Assignee reviews

- **WHEN** "Rysunki elewacji" is assigned to "Anna Nowak" and the user picks "Anna Nowak" in "weryfikuje"
- **THEN** the task can be saved in "Do weryfikacji"

#### Scenario: Reviewer no longer listed

- **WHEN** a task's reviewer is "Piotr Zieliński", who is not in `kalka.json`
- **THEN** the dialog shows "Piotr Zieliński" as the selected reviewer and saving without touching the field keeps it

#### Scenario: Back for fixes

- **WHEN** a task in "Do weryfikacji" reviewed by "Jan Kowalski" gets "Popraw wymiary okien." in "uwagi z weryfikacji" and is moved to "W trakcie"
- **THEN** the task file still holds `"reviewer": "Jan Kowalski"` and `"reviewNote": "Popraw wymiary okien."`
- **AND** opening the task shows both in the dialog

#### Scenario: Reviewer on a task not yet in review

- **WHEN** the user picks "Jan Kowalski" in "weryfikuje" on a task in "Do zrobienia" and saves
- **THEN** the task file holds `"reviewer": "Jan Kowalski"` and the task stays in "Do zrobienia"

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

The system SHALL let the user drag a card above or below another card, in its own column or in another one, or onto a column's empty space, which puts it at the bottom. While dragging, the board marks where the card will land. A drop sets the task to that column's state and that place and saves at once; a drop where the card already is changes nothing. A task without a reviewer dropped on "Do weryfikacji" from another column opens the dialog instead, as "Reviewer asked for on the way to Do weryfikacji" says.

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

#### Scenario: Between cards in review

- **WHEN** "Do weryfikacji" shows "D", "E" and the user drags "A", reviewed by "Jan Kowalski", from "W trakcie" between "D" and "E"
- **THEN** "Do weryfikacji" shows "D", "A", "E" and "A" has the state `review`

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

The system SHALL show each task as a card with its title, its due date in the bottom-left corner and, when it has an assignee, a circle with the assignee's initials in the assignee's colour in the bottom-right corner. Text in the circle is light or dark, whichever contrasts more with the colour. A card in "Do weryfikacji" whose task has a reviewer also shows, after the assignee's circle, the reviewer's circle with a small check mark; hovering either circle shows "osoba: <assignee>, weryfikuje: <reviewer>" ("osoba: -" without an assignee). Cards in the other columns show no reviewer.

#### Scenario: Full card

- **WHEN** a task "Rysunki elewacji" is due 2026-11-14 and assigned to "Anna Nowak" with initials "AN" and colour `#697662`
- **THEN** the card shows "Rysunki elewacji", "14.11.2026" bottom-left and a `#697662` circle with "AN" bottom-right

#### Scenario: No date, no assignee

- **WHEN** a task has neither a due date nor an assignee
- **THEN** the card shows only its title

#### Scenario: Overdue

- **WHEN** today is 2026-11-20 and a task in "Do zrobienia", "W trakcie" or "Do weryfikacji" is due 2026-11-14
- **THEN** its date is marked "po terminie"

#### Scenario: Done is never overdue

- **WHEN** today is 2026-11-20 and a task in "Wykonane" is due 2026-11-14
- **THEN** its date is not marked "po terminie"

#### Scenario: Waiting for a check

- **WHEN** "Rysunki elewacji" in "Do weryfikacji" is assigned to "Anna Nowak" ("AN") and reviewed by "Jan Kowalski" ("JK")
- **THEN** the card shows the "AN" circle and then the "JK" circle with a check mark
- **AND** hovering either shows "osoba: Anna Nowak, weryfikuje: Jan Kowalski"

#### Scenario: Reviewer without an assignee

- **WHEN** a task in "Do weryfikacji" has no assignee and is reviewed by "Jan Kowalski"
- **THEN** the card shows only the "JK" circle with a check mark, and hovering it shows "osoba: -, weryfikuje: Jan Kowalski"

#### Scenario: Reviewer outside review

- **WHEN** a task in "W trakcie" assigned to "Anna Nowak" has "Jan Kowalski" as reviewer
- **THEN** the card shows only the "AN" circle

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

- **WHEN** one user arranges "Do zrobienia" as "C", "A", "B" and another user opens the project after the sync client synced the files
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

The system SHALL keep each task as `zadania/<id>.json` holding `id`, `projectId` (empty for a task without a project), `title`, `description`, `due` (absent without a date), `assignee` (empty when none), `reviewer` (empty when none), `reviewNote` (empty when none), `status` (`todo`, `doing`, `review` or `done`), `order` (a number for its place in its column), `urgent` (`true` for an urgent task, absent otherwise), `doneAt` (the time the task last became done, absent unless done) and `updatedAt`. A file with an unknown status counts as `todo`; missing text fields, `projectId`, `reviewer` and `reviewNote` included, count as empty; a `projectId` that matches no project file counts as no project; without a numeric `order` the task has no place yet; any `urgent` other than `true` counts as not urgent. `doneAt` is set when a task's state becomes `done` (to the time of that change, or to the day picked in "data wykonania"), kept while it stays done unless another day is picked in "data wykonania", and removed when it leaves `done`.

#### Scenario: Written file

- **WHEN** the user adds "Rysunki elewacji" due 2026-11-14 for Anna Nowak to "Dom Lipowa"
- **THEN** the file holds `"projectId"` equal to the project's `id`, `"due": "2026-11-14"`, `"assignee": "Anna Nowak"`, `"reviewer": ""`, `"reviewNote": ""` and `"status": "todo"`
- **AND** it holds no `urgent`

#### Scenario: Waiting for a check

- **WHEN** a task file has `"status": "review"`
- **THEN** the task shows in "Do weryfikacji" and its file holds no `doneAt`

#### Scenario: Reviewer notes trimmed

- **WHEN** the user saves "  Popraw wymiary okien.  " in "uwagi z weryfikacji"
- **THEN** the file holds `"reviewNote": "Popraw wymiary okien."`

#### Scenario: Hand-edited file

- **WHEN** a task file has `"status": "gotowe"` and no `description`
- **THEN** the task shows in "Do zrobienia" with an empty description

#### Scenario: File without reviewer

- **WHEN** a task file has no `reviewer` and no `reviewNote`, or `"reviewer": 7`
- **THEN** the task has no reviewer and empty reviewer notes

#### Scenario: Hand-edited urgent mark

- **WHEN** a task file has `"urgent": "tak"`
- **THEN** the task is not urgent

#### Scenario: Project gone

- **WHEN** a task file's `projectId` matches no project file
- **THEN** the task shows on no project's board and in "Zadania" as a task without a project, and its file is left alone until the task is saved

#### Scenario: Done time set

- **WHEN** a task in "W trakcie" or "Do weryfikacji" is moved to "Wykonane", on the project board or in the "Zadania" tab
- **THEN** its file holds `doneAt` with the time of that change

#### Scenario: Done time kept

- **WHEN** a done task with `doneAt` is edited in its dialog without leaving "Wykonane" or touching "data wykonania", or moved within "Wykonane" on the project board
- **THEN** its `doneAt` is unchanged

#### Scenario: Done time removed

- **WHEN** a done task is moved back to "Do zrobienia" or "Do weryfikacji"
- **THEN** its file no longer holds `doneAt`

#### Scenario: File without done time

- **WHEN** a done task's file has no `doneAt`
- **THEN** the task shows in "Wykonane" as before, and the file gets no `doneAt` until the task becomes done again or a day is picked in "data wykonania"

### Requirement: Sync conflict copies of a task

The system SHALL show every task file that shares an id with another task file as its own card with a "konflikt synchronizacji" badge, and deleting one of them removes only that file.

#### Scenario: Two copies

- **WHEN** `zadania/` holds two files with the same task id
- **THEN** both cards show with the "konflikt synchronizacji" badge
- **AND** deleting one leaves the other file and its card, now without the badge after the tasks are read again

### Requirement: Tasks tab

The system SHALL show a header tab "Zadania" listing all tasks, of every project and without one, in four columns "Do zrobienia", "W trakcie", "Do weryfikacji" and "Wykonane", each headed by its number of tasks. A task whose project file is missing counts as a task without a project.

#### Scenario: Tasks of several projects

- **WHEN** "Dom Lipowa" has the task "Rysunki elewacji" in "Do zrobienia" and "Willa Sosnowa" has "Zestawienie okien" in "W trakcie" and "Rzut dachu" in "Do weryfikacji"
- **THEN** "Zadania" shows "Rysunki elewacji" under "Do zrobienia", "Zestawienie okien" under "W trakcie" and "Rzut dachu" under "Do weryfikacji"

#### Scenario: Project gone

- **WHEN** a task file's `projectId` matches no project file
- **THEN** the task shows in "Zadania" as a task without a project

### Requirement: Tasks tab filters

The system SHALL filter the tab by "Architekt", "Status projektu" and "Projekt", side by side, all kept in the URL so the view survives a refresh and can be bookmarked. "Architekt" offers "wszyscy architekci", the architects from `kalka.json` followed by assignees and reviewers no longer listed, and "nieprzypisane" last; it narrows "Do weryfikacji" by the task's reviewer and the other columns by the task's assignee. "Status projektu" has the choices and default of the calendar's status filter and narrows the tasks that have a project by that project's status. "Projekt" offers "wszystkie zadania", "z projektem" and "bez projektu"; "Status projektu" is disabled while "bez projektu" is chosen.

#### Scenario: One architect

- **WHEN** "Rysunki elewacji" is assigned to "Anna Nowak" in "Dom Lipowa", led by "Jan Kowalski", and the user picks "Anna Nowak"
- **THEN** "Rysunki elewacji" is shown
- **AND** tasks assigned to "Jan Kowalski" or to nobody are not

#### Scenario: Tasks to check

- **WHEN** "Rzut dachu" in "Do weryfikacji" is assigned to "Anna Nowak" and reviewed by "Jan Kowalski", and the user picks "Jan Kowalski"
- **THEN** "Rzut dachu" is shown in "Do weryfikacji"
- **AND** with "Anna Nowak" picked it is not shown

#### Scenario: Reviewer outside review

- **WHEN** "Rysunki elewacji" in "W trakcie" is assigned to "Anna Nowak" with "Jan Kowalski" as reviewer, and the user picks "Jan Kowalski"
- **THEN** "Rysunki elewacji" is not shown

#### Scenario: Unassigned

- **WHEN** the user picks "nieprzypisane"
- **THEN** "Do zrobienia", "W trakcie" and "Wykonane" show only tasks without an assignee
- **AND** "Do weryfikacji" shows only tasks without a reviewer

#### Scenario: All architects

- **WHEN** the filter is "wszyscy architekci"
- **THEN** tasks of every assignee and tasks without one are shown

#### Scenario: Assignee no longer listed

- **WHEN** a task is assigned to "Piotr Zieliński", who is not in `kalka.json`
- **THEN** "Architekt" offers "Piotr Zieliński" after the listed architects and before "nieprzypisane"

#### Scenario: Reviewer no longer listed

- **WHEN** a task is reviewed by "Piotr Zieliński", who is not in `kalka.json`
- **THEN** "Architekt" offers "Piotr Zieliński" after the listed architects and before "nieprzypisane"

#### Scenario: Default status

- **WHEN** no project status is chosen
- **THEN** tasks of `aktywny` and `wstrzymany` projects are shown and those of `zakończony` projects are not

#### Scenario: With a project

- **WHEN** the user picks "z projektem" in "Projekt"
- **THEN** only tasks of a project are shown

#### Scenario: Without a project

- **WHEN** the user picks "bez projektu" in "Projekt"
- **THEN** only tasks without a project are shown and "Status projektu" is disabled

#### Scenario: Status leaves tasks without a project alone

- **WHEN** "Status projektu" is "zakończony" and "Projekt" is "wszystkie zadania"
- **THEN** tasks of `zakończony` projects and tasks without a project are shown

#### Scenario: Bookmark

- **WHEN** the user picks "Anna Nowak", bookmarks the page and opens the bookmark later
- **THEN** "Zadania" opens filtered to "Anna Nowak"

#### Scenario: Unassigned stays on the tab

- **WHEN** "Zadania" is filtered to "nieprzypisane" and the user clicks "Kalendarz"
- **THEN** the calendar opens with "wszyscy architekci"

### Requirement: Order in the tasks tab

The system SHALL order "W trakcie", "Do weryfikacji", and "Do zrobienia" while it shows "Pilne", in the tab with urgent tasks first, then the others, each group by due date, a month counting as its last day, so overdue tasks come first and tasks without a date last; equal dates go by title. The manual order from the project boards does not apply, and dropping a card within its own column changes nothing.

#### Scenario: By due date

- **WHEN** today is 2026-11-20 and "Do zrobienia" holds "A" due 2026-11-30, "B" due 2026-11-14, "C" without a date and "D" due 2026-11
- **THEN** the column shows "B", "A", "D", "C"

#### Scenario: Urgent first

- **WHEN** "Do zrobienia" holds "A" due 2026-11-14, urgent "B" due 2026-11-30 and urgent "C" without a date
- **THEN** the column shows "B", "C", "A"

#### Scenario: Waiting for a check

- **WHEN** "Do weryfikacji" holds "A" due 2026-11-30, urgent "B" without a date and "C" due 2026-11-14
- **THEN** the column shows "B", "C", "A"

#### Scenario: Done ignores urgency

- **WHEN** an urgent task was done on 2026-11-05 and another task on 2026-11-06
- **THEN** "Wykonane" shows the task done on 2026-11-06 first

#### Scenario: Project order ignored

- **WHEN** a project board shows "A" above "B" in "Do zrobienia" and "B" is due earlier
- **THEN** the tab shows "B" above "A"

#### Scenario: Drop in the same column

- **WHEN** the user drags a card within its own column in the tab
- **THEN** nothing is written and the order stays

#### Scenario: "W trakcie" in the days view

- **WHEN** "Do zrobienia" shows "Dni" and "W trakcie" holds "A" due 2026-11-14 and urgent "B" due 2026-11-30
- **THEN** "W trakcie" shows "B", "A", without day groups

### Requirement: Tasks tab card

The system SHALL show each task in the tab as a card with its title, its project's title (or "bez projektu"), a "wykonane" checkbox, its due date bottom-left (marked "po terminie" when overdue and not done) and the assignee's initials circle bottom-right when it has one, followed in "Do weryfikacji" by the reviewer's circle with its check mark and hover text as on the project board. Cards in "Wykonane" are greyed and their checkbox is ticked. A sync conflict copy carries the "konflikt synchronizacji" badge.

#### Scenario: Full card

- **WHEN** "Rysunki elewacji" of "Dom Lipowa" is due 2026-11-14, assigned to "Anna Nowak" with initials "AN", and today is 2026-11-20
- **THEN** its card shows "Rysunki elewacji", "Dom Lipowa", an unticked "wykonane", "14.11.2026 · po terminie" and the "AN" circle

#### Scenario: Done card

- **WHEN** a task is in "Wykonane"
- **THEN** its card is greyed, "wykonane" is ticked and its date is not marked "po terminie"

#### Scenario: Card without a project

- **WHEN** "Zamówić próbki" has no project
- **THEN** its card shows "bez projektu" where the project's title would be

#### Scenario: Waiting for a check

- **WHEN** "Rzut dachu" in "Do weryfikacji" is assigned to "Anna Nowak" ("AN") and reviewed by "Jan Kowalski" ("JK")
- **THEN** its card shows the "AN" circle and then the "JK" circle with a check mark

### Requirement: Done checkbox

The system SHALL mark a task done when its "wykonane" checkbox is ticked and put a done task back in "Do zrobienia" when it is unticked, saving at once with the task conflict check. The task goes to the bottom of that column on its project's board.

#### Scenario: Tick

- **WHEN** the user ticks "wykonane" on "Rysunki elewacji" in "W trakcie"
- **THEN** the task file holds `"status": "done"` and the card shows in "Wykonane"
- **AND** on "Dom Lipowa"'s board the task is at the bottom of "Wykonane"

#### Scenario: Tick after the check

- **WHEN** the user ticks "wykonane" on a card in "Do weryfikacji"
- **THEN** the task file holds `"status": "done"` and the card shows in "Wykonane"

#### Scenario: Untick

- **WHEN** the user unticks "wykonane" on a card in "Wykonane"
- **THEN** the task file holds `"status": "todo"` and the card shows in "Do zrobienia"

### Requirement: Change state in the tasks tab

The system SHALL let the user drag a card in the tab onto another column, which sets the task to that column's state and saves at once, putting it at the bottom of that column on its project's board. While dragging, the column under the pointer is marked. A conflict shows the task conflict message above the columns and reads the tasks again. A task without a reviewer dropped on "Do weryfikacji" opens the dialog instead, as "Reviewer asked for on the way to Do weryfikacji" says.

#### Scenario: Drag to "W trakcie"

- **WHEN** the user drags "Rysunki elewacji" from "Do zrobienia" onto "W trakcie"
- **THEN** the task file holds `"status": "doing"`
- **AND** on "Dom Lipowa"'s board it is at the bottom of "W trakcie"

#### Scenario: Drag to "Do weryfikacji" without a reviewer

- **WHEN** the user drags "Rysunki elewacji", which has no reviewer, from "W trakcie" onto "Do weryfikacji" in the tab
- **THEN** nothing is written and the task dialog opens with the state "Do weryfikacji"

#### Scenario: Someone else changed the task

- **WHEN** the user drags a task to "Wykonane" but another person changed that task file since it was read
- **THEN** nothing is written, the tab shows the tasks as they are on disk and the message "Ktoś inny zmienił to zadanie w międzyczasie. Zadania są odświeżone, wprowadź zmianę ponownie."

### Requirement: Task dialog from the tasks tab

The system SHALL open the task dialog of the project page when a card in the tab is clicked, with the same fields, "Zapisz", "Anuluj" and "Usuń", plus a "projekt" choice and, for a task of a project, a link to that project. The link opens the project page, whose "Anuluj" leads back to "Zadania" with the same filters. A state or project changed in the dialog puts the task at the bottom of that column on its (new) project's board. The dialog on a project page has no "projekt" choice.

#### Scenario: Open the project

- **WHEN** the user clicks "Rysunki elewacji" in the tab filtered to "Anna Nowak" and then the link to "Dom Lipowa"
- **THEN** the page of "Dom Lipowa" opens
- **AND** "Anuluj" there shows "Zadania" filtered to "Anna Nowak"

#### Scenario: Give a task a project

- **WHEN** the user opens "Zamówić próbki", which has no project, picks "12 Dom Lipowa" in "projekt" and saves
- **THEN** the task file holds the id of "Dom Lipowa" and the task is at the bottom of its column on "Dom Lipowa"'s board

#### Scenario: Change in the dialog

- **WHEN** the user changes the due date in the dialog and clicks "Zapisz"
- **THEN** the task file holds the new date and the card moves to its place by date

### Requirement: Done stamp

The system SHALL show a "wykonane" stamp on every card in the tab's "Wykonane" column. A task marked done in the tab, by its checkbox or by dragging, gets its stamp with a short landing animation; other done cards show it still. Animations are skipped when the system asks for reduced motion.

#### Scenario: Tick

- **WHEN** the user ticks "wykonane" on "Rysunki elewacji"
- **THEN** its card in "Wykonane" shows the stamp landing

#### Scenario: Already done

- **WHEN** the user opens the tab and "Inwentaryzacja" is done
- **THEN** its card shows the stamp without animation

### Requirement: Building of the week

The system SHALL show on the right of the tab's columns, staying in view while the page scrolls, a small Gdańsk-style tenement with one floor for each task shown by the filters whose completion time falls in the current week, Monday to Sunday, and the text "<N> <piętro / piętra / pięter> w tym tygodniu". Floors sit a little crooked and the tenement sways more the taller it is. From five floors it has a stepped gable, from eight a golden weathervane. With no floors a small construction sign stands on the empty plot, with the hover text "Tu powstanie kamienica". Done tasks without a recorded completion time don't count. At most ten floors are drawn; the number counts all.

#### Scenario: Three this week

- **WHEN** today is Wednesday 2026-11-11 and three shown tasks were done on 2026-11-09, 2026-11-10 and 2026-11-11, and one on Sunday 2026-11-08
- **THEN** the tenement has three floors, no gable, and the text reads "3 piętra w tym tygodniu"

#### Scenario: Filtered

- **WHEN** the architect filter is "Anna Nowak" and only one of this week's done tasks is assigned to her
- **THEN** the tenement has one floor and the text reads "1 piętro w tym tygodniu"

#### Scenario: Gable and weathervane

- **WHEN** eight shown tasks were done this week
- **THEN** the tenement has eight floors, a stepped gable and a weathervane, and the text reads "8 pięter w tym tygodniu"

#### Scenario: New week

- **WHEN** it is Monday and no shown task has been done since midnight
- **THEN** a construction sign stands on the empty plot, hovering it shows "Tu powstanie kamienica", and the text reads "0 pięter w tym tygodniu"

### Requirement: Cheer every third task

The system SHALL show, at every third task marked done in the tab since it was opened (ticked or dragged to "Wykonane"), a bubble above the "Wykonane" column with a line drawn at random from the studio's cheer lines, each naming who says it. The bubble disappears after 5.2 seconds or when another task is marked done.

#### Scenario: Third task

- **WHEN** the user opens the tab and ticks "wykonane" on three tasks
- **THEN** no bubble shows after the first two
- **AND** after the third a bubble shows a cheer line for 5.2 seconds

#### Scenario: Unticking doesn't count

- **WHEN** the user ticks a task, unticks it and ticks it again
- **THEN** that counts as two tasks marked done

### Requirement: Add task from the tasks tab

The system SHALL offer "+ Dodaj zadanie" at the right end of the tab's filter line. It opens the task dialog empty, with the state "Do zrobienia", no assignee and "projekt" set to "bez projektu"; "projekt" offers "bez projektu" and the projects as "l.p. title" in the order of the calendar's project filter. Saving puts the task at the bottom of "Do zrobienia" on that project's board, or among the tasks without a project.

#### Scenario: Add

- **WHEN** the user clicks "+ Dodaj zadanie" in "Zadania", enters "Inwentaryzacja", picks "12 Dom Lipowa" and clicks "Zapisz"
- **THEN** a new file `zadania/<id>.json` holds that title, state `todo` and the id of "Dom Lipowa"
- **AND** the task is at the bottom of "Do zrobienia" on "Dom Lipowa"'s board

#### Scenario: Nothing preselected

- **WHEN** "Zadania" is filtered to "Anna Nowak" and the user clicks "+ Dodaj zadanie"
- **THEN** the dialog's "osoba" and "projekt" are both empty

#### Scenario: Without a project

- **WHEN** the user adds "Zamówić próbki" without picking a project
- **THEN** the task file holds an empty `projectId` and the task shows in "Zadania" with "bez projektu"
- **AND** it shows on no project's board

#### Scenario: Project choices

- **WHEN** the loaded projects are "Dom Lipowa" (l.p. 12) and "Willa Sosnowa" (l.p. 3)
- **THEN** "projekt" offers "bez projektu", "3 Willa Sosnowa" and "12 Dom Lipowa", in that order

### Requirement: Building stays in view

The system SHALL keep the building of the week in a narrow column on the right of the three task columns, at the top of the window while the page scrolls past long columns. In a window narrower than 900 px it sits above the columns instead and scrolls with the page.

#### Scenario: Long columns

- **WHEN** "Wykonane" shows all its tasks after "pokaż starsze" and the user scrolls down
- **THEN** the building stays visible at the top right

#### Scenario: Narrow window

- **WHEN** the window is 700 px wide
- **THEN** the building is above the columns and scrolls away with them

### Requirement: Urgent task

The system SHALL let the user mark a task urgent with a "pilne" toggle in the top-right corner of the task dialog, on the project page and in the "Zadania" tab, saved with "Zapisz"; while it is on, the dialog's top edge is red. A task that is urgent and not done shows on the project board and in the tab as a card with a red folded top-right corner holding "!", labelled "pilne", a red border and a light red background. A done urgent task shows only the red corner, without the border and background, until it leaves "Wykonane".

#### Scenario: Mark urgent

- **WHEN** the user opens "Rysunki elewacji" on "Dom Lipowa", turns "pilne" on and clicks "Zapisz"
- **THEN** the task file holds `"urgent": true`
- **AND** its card is marked urgent on the project board and in "Zadania"

#### Scenario: Unmark

- **WHEN** the user turns "pilne" off on an urgent task and clicks "Zapisz"
- **THEN** the task file no longer holds `urgent` and the card is not marked

#### Scenario: Board order kept

- **WHEN** "Do zrobienia" on "Dom Lipowa" shows "A", "B", "C" and the user marks "C" urgent
- **THEN** the column still shows "A", "B", "C", with "C" marked urgent

#### Scenario: Done urgent task

- **WHEN** an urgent task is moved to "Wykonane"
- **THEN** its card shows the red corner with "!" but no red border or background, and its file still holds `"urgent": true`
- **AND** when it is moved back to "Do zrobienia", its card has the red border and background again

#### Scenario: Cancel

- **WHEN** the user turns "pilne" on and clicks "Anuluj" in the dialog
- **THEN** nothing is written and the card is not marked

#### Scenario: Dialog shows the mark

- **WHEN** the user opens an urgent task
- **THEN** the "pilne" toggle is on and the dialog's top edge is red

### Requirement: View of "Do zrobienia"

The system SHALL show two buttons "Pilne" and "Dni" in the header of the tab's "Do zrobienia" column, the chosen one pressed. "Pilne" orders the column as the tab's order says, "Dni" groups it by day. The browser remembers the last choice and the tab opens with it, on every later visit in that browser. Without a remembered choice, or when the browser can't store it, the tab opens with "Pilne".

#### Scenario: First visit

- **WHEN** the user opens "Zadania" in a browser that has never chosen a view
- **THEN** "Pilne" is pressed and "Do zrobienia" shows urgent tasks first, then by due date

#### Scenario: Switch to days

- **WHEN** the user clicks "Dni"
- **THEN** "Dni" is pressed and "Do zrobienia" shows the same tasks grouped by day
- **AND** "W trakcie" and "Wykonane" are unchanged

#### Scenario: Remembered

- **WHEN** the user picks "Dni", closes the browser and opens "Zadania" again the next day
- **THEN** "Dni" is pressed and "Do zrobienia" is grouped by day

#### Scenario: Other browser

- **WHEN** the user picked "Dni" on one PC and opens "Zadania" on another
- **THEN** the other PC opens with "Pilne"

#### Scenario: Storage blocked

- **WHEN** the browser refuses to store site data
- **THEN** the tab opens with "Pilne", the buttons still switch the view while the tab is open, and no error is shown

#### Scenario: Filters and bookmarks

- **WHEN** the user switches the view
- **THEN** the page address and the filters are unchanged

### Requirement: "Do zrobienia" by day

The system SHALL show "Do zrobienia" in the "Dni" view as groups, each headed by its day and its number of tasks, alternating background bands. Overdue tasks form one group "po terminie" first; then one group per due day, earliest first; a month date forms its own group after that month's days; undated tasks come last as "bez terminu". Today's group is marked "dziś". Days without tasks get no group. Inside a group, urgent tasks first, then by due date, then title.

#### Scenario: Groups and counts

- **WHEN** today is 2026-11-10 and "Do zrobienia" holds "A" and "B" due 2026-11-10, "C" due 2026-11-12 and "D" due 2026-11-14
- **THEN** the column shows a group "wt 10.11.2026" marked "dziś" with 2, holding "A", "B"; then "czw 12.11.2026" with 1, holding "C"; then "sob 14.11.2026" with 1, holding "D"
- **AND** no group for 2026-11-11 or 2026-11-13

#### Scenario: Overdue together

- **WHEN** today is 2026-11-10 and tasks are due 2026-11-03 and 2026-11-06
- **THEN** both are in one group "po terminie" with 2, at the top, the one due 2026-11-03 first

#### Scenario: Urgent inside a day

- **WHEN** "A" and urgent "B" are both due 2026-11-12
- **THEN** the group "czw 12.11.2026" shows "B", "A"

#### Scenario: Urgent keeps its day

- **WHEN** urgent "B" is due 2026-11-14 and "A" is due 2026-11-12
- **THEN** "A" is in the group of 2026-11-12, above the group of 2026-11-14 holding "B"

#### Scenario: Month date

- **WHEN** today is 2026-11-10 and tasks are due 2026-11-30, 2026-11 and 2026-12-01
- **THEN** the groups are "pon 30.11.2026", then "11.2026", then "wt 01.12.2026"

#### Scenario: Past month

- **WHEN** today is 2026-11-10 and a task is due 2026-10
- **THEN** it is in "po terminie"

#### Scenario: Without a date

- **WHEN** a task has no due date
- **THEN** it is in the last group "bez terminu"

#### Scenario: Empty column

- **WHEN** no shown task is in "Do zrobienia"
- **THEN** the column shows no groups, and its header shows 0

#### Scenario: Dragging out

- **WHEN** the user drags a card from a day group onto "W trakcie"
- **THEN** the task gets the state `doing` as before, and its group's number goes down by one, the group disappearing when it was the last

### Requirement: Reviewer required in "Do weryfikacji"

The system SHALL refuse to save a task from its dialog while its state is "Do weryfikacji" and it has no reviewer: nothing is written and the dialog shows "Wybierz osobę, która zweryfikuje zadanie.". In the other states the reviewer is optional. A task already in "Do weryfikacji" without a reviewer stays there until it is saved from the dialog.

#### Scenario: State picked without a reviewer

- **WHEN** the user opens "Rysunki elewacji", which has no reviewer, picks "Do weryfikacji" in the dialog's state choice and clicks "Zapisz"
- **THEN** nothing is written and the dialog shows "Wybierz osobę, która zweryfikuje zadanie."
- **AND** after picking "Jan Kowalski" in "weryfikuje" and clicking "Zapisz" the task file holds `"status": "review"` and `"reviewer": "Jan Kowalski"`

#### Scenario: Other states

- **WHEN** the user saves a task in "W trakcie" without a reviewer
- **THEN** the task is saved

#### Scenario: Older task waiting for a check

- **WHEN** a task file has `"status": "review"` and no `reviewer`
- **THEN** the task shows in "Do weryfikacji" with only its assignee's circle
- **AND** dragging it within "Do weryfikacji" on its project board or ticking "wykonane" saves without asking for a reviewer

### Requirement: Reviewer asked for on the way to "Do weryfikacji"

The system SHALL, when a task without a reviewer is dragged from another column onto "Do weryfikacji", on the project board or in the "Zadania" tab, write nothing and open the task dialog with the state set to "Do weryfikacji". "Zapisz" with a reviewer puts the task at the bottom of "Do weryfikacji" on its project's board; "Anuluj" leaves the task where it was. A task that has a reviewer moves at once, as in any other column.

#### Scenario: Drag without a reviewer

- **WHEN** the user drags "Rysunki elewacji", which has no reviewer, from "W trakcie" onto "Do weryfikacji"
- **THEN** nothing is written and the task dialog opens with the state "Do weryfikacji" and an empty "weryfikuje"

#### Scenario: Reviewer picked

- **WHEN** in that dialog the user picks "Jan Kowalski" in "weryfikuje" and clicks "Zapisz"
- **THEN** the task file holds `"status": "review"` and `"reviewer": "Jan Kowalski"`
- **AND** the task is at the bottom of "Do weryfikacji" on its project's board

#### Scenario: Cancelled

- **WHEN** in that dialog the user clicks "Anuluj"
- **THEN** nothing is written and the task stays in "W trakcie"

#### Scenario: Reviewer already chosen

- **WHEN** "Rysunki elewacji" was sent back from "Do weryfikacji" to "W trakcie" with "Jan Kowalski" as reviewer and the user drags it onto "Do weryfikacji" again
- **THEN** no dialog opens and the task file holds `"status": "review"` and `"reviewer": "Jan Kowalski"`

### Requirement: Done tasks by week

The system SHALL show the tab's "Wykonane" as groups, one per week (Monday to Sunday, local time) in which shown tasks were done, newest week first, each headed by its week and its number of tasks, alternating background bands. The current week is headed "ten tydzień", the week before it "w zeszłym tygodniu", and every older week by its Monday and Sunday, "02.11.2026 - 08.11.2026". Weeks without done tasks get no group. Inside a group, the latest done task comes first. A task without a recorded completion time counts as done at its last change. A completion time after the current week counts as the current week. The column header counts all shown done tasks.

#### Scenario: Groups and counts

- **WHEN** today is Wednesday 2026-11-18 and shown tasks were done: "A" on 2026-11-17, "B" on 2026-11-18, "C" on 2026-11-12, "D" on 2026-11-03
- **THEN** "Wykonane" shows a group "ten tydzień" with 2, holding "B", "A"; then "w zeszłym tygodniu" with 1, holding "C"; then "pokaż starsze (1)"
- **AND** the header of "Wykonane" shows 4

#### Scenario: Older week header

- **WHEN** today is 2026-11-18, a task was done on 2026-11-03 and the user clicks "pokaż starsze (1)"
- **THEN** it shows in a group "02.11.2026 - 08.11.2026" with 1

#### Scenario: Week boundary

- **WHEN** today is Monday 2026-11-16 and tasks were done on Sunday 2026-11-15 at 23:30 and on Monday 2026-11-16 at 00:10, local time
- **THEN** the second is in "ten tydzień" and the first in "w zeszłym tygodniu"

#### Scenario: Empty week skipped

- **WHEN** today is 2026-11-18 and tasks were done on 2026-11-18 and 2026-11-04, none in between
- **THEN** after "pokaż starsze (1)" the groups are "ten tydzień", then "02.11.2026 - 08.11.2026", with no group "w zeszłym tygodniu"

#### Scenario: Done ignores urgency in a week

- **WHEN** an urgent task was done on 2026-11-17 and another task on 2026-11-18, both this week
- **THEN** "ten tydzień" shows the task done on 2026-11-18 first

#### Scenario: Older file

- **WHEN** a done task's file has no completion time and was last changed on 2026-11-17, and another task was done on 2026-11-18, today being 2026-11-18
- **THEN** both are in "ten tydzień", the one done on 2026-11-18 first

#### Scenario: Clock ahead

- **WHEN** today is 2026-11-18 and a task's completion time is 2026-11-24
- **THEN** it is in "ten tydzień", first in that group

#### Scenario: Undo keeps it visible

- **WHEN** this week already has eight done tasks and the user ticks "wykonane" on another task
- **THEN** that task is first in "ten tydzień", so it can be unticked at once

#### Scenario: Nothing done

- **WHEN** no shown task is done
- **THEN** "Wykonane" shows no groups and no buttons, and its header shows 0

### Requirement: Older weeks folded

The system SHALL show at first only the groups "ten tydzień" and "w zeszłym tygodniu" and hide the older weeks behind a button "pokaż starsze (N)" below them, N being the number of tasks done in those older weeks. Clicking it shows the older week groups below, newest first, and the button disappears. Without older done tasks there is no button.

#### Scenario: Older weeks hidden

- **WHEN** today is 2026-11-18 and tasks were done on 2026-11-18, 2026-11-12, 2026-11-05 and 2026-10-28
- **THEN** "Wykonane" shows "ten tydzień" and "w zeszłym tygodniu" and below them "pokaż starsze (2)"

#### Scenario: Show older

- **WHEN** the user clicks "pokaż starsze (2)"
- **THEN** the groups "02.11.2026 - 08.11.2026" and "26.10.2026 - 01.11.2026" show below, in that order, and the button is gone

#### Scenario: Only old tasks

- **WHEN** today is 2026-11-18 and the only done tasks were done on 2026-11-03 and 2026-10-28
- **THEN** "Wykonane" shows only "pokaż starsze (2)", and its header shows 2

### Requirement: Long weeks folded

The system SHALL show in each week group its five latest done tasks and hide the rest of that week behind a button "pokaż więcej (N)" at the bottom of the group, N being their number. Clicking it shows them in that group, after the five, and the button disappears; other groups stay as they were. A group of five or fewer tasks has no button.

#### Scenario: More than five in a week

- **WHEN** eight tasks were done this week
- **THEN** "ten tydzień" shows 8 in its header, the five done last, latest first, and "pokaż więcej (3)"

#### Scenario: Show more

- **WHEN** the user clicks "pokaż więcej (3)" in "ten tydzień"
- **THEN** the other three show below the five in that group, latest first, and "w zeszłym tygodniu" is unchanged

### Requirement: Completion date in the task dialog

The system SHALL show in the task dialog, below "osoba", "weryfikuje" and "stan", a day field "data wykonania" while the dialog's state is "Wykonane", on the project page and in the "Zadania" tab. It shows the day the task counts as done: its completion time, or its last change for a file without one; a task put into "Wykonane" in the dialog shows today. Picking another day and saving stores that day as the task's completion time; saving without changing the field leaves the completion time as it was. Days after today can't be picked, and the dialog can't be saved with the field empty.

#### Scenario: Stored date shown

- **WHEN** the user opens a done task completed on 2026-11-03
- **THEN** the dialog shows "data wykonania" 03.11.2026 below "osoba", "weryfikuje" and "stan"

#### Scenario: Not done

- **WHEN** the user opens a task in "W trakcie"
- **THEN** the dialog shows no "data wykonania"

#### Scenario: Becoming done in the dialog

- **WHEN** today is 2026-11-18 and the user switches "stan" of a task in "W trakcie" to "Wykonane"
- **THEN** "data wykonania" appears with 18.11.2026
- **AND** saving without changing it stores the time of the save as the completion time

#### Scenario: Back to its old week

- **WHEN** today is 2026-11-18, a task completed on 2026-11-03 is dragged to "W trakcie" and back to "Wykonane", so it shows in "ten tydzień", and the user opens it, picks 2026-11-03 in "data wykonania" and saves
- **THEN** the task file holds a `doneAt` on 2026-11-03 and the task shows in the group "02.11.2026 - 08.11.2026"

#### Scenario: Picked when becoming done

- **WHEN** the user switches "stan" of a task in "W trakcie" to "Wykonane", picks 2026-11-10 in "data wykonania" and saves
- **THEN** the task file holds `"status": "done"` and a `doneAt` on 2026-11-10

#### Scenario: Unchanged

- **WHEN** the user opens a done task completed on 2026-11-03 at 14:20, changes its title and saves
- **THEN** its `doneAt` is unchanged, 14:20 included

#### Scenario: Old file unchanged

- **WHEN** a done task's file has no `doneAt` and was last changed on 2026-11-05
- **THEN** its dialog shows "data wykonania" 05.11.2026, and saving without changing it writes no `doneAt`

#### Scenario: No future days

- **WHEN** today is 2026-11-18
- **THEN** "data wykonania" offers no day after 2026-11-18

#### Scenario: Field emptied

- **WHEN** the user clears "data wykonania" and clicks "Zapisz"
- **THEN** nothing is written and the dialog stays open
