## ADDED Requirements

### Requirement: Tasks tab

The system SHALL show a header tab "Zadania" listing the tasks of all projects in three columns "Do zrobienia", "W trakcie" and "Wykonane", each headed by its number of tasks. A task whose project file is missing is shown nowhere. There is no button to add a task here.

#### Scenario: Tasks of several projects

- **WHEN** "Dom Lipowa" has the task "Rysunki elewacji" in "Do zrobienia" and "Willa Sosnowa" has "Zestawienie okien" in "W trakcie"
- **THEN** "Zadania" shows "Rysunki elewacji" under "Do zrobienia" and "Zestawienie okien" under "W trakcie"

#### Scenario: Project gone

- **WHEN** a task file's `projectId` matches no project file
- **THEN** the task is not shown in "Zadania"

### Requirement: Tasks tab filters

The system SHALL filter the tab by "Architekt" and "Status projektu", side by side, both kept in the URL so the view survives a refresh and can be bookmarked. "Architekt" offers "wszyscy architekci", the architects from `kalka.json` followed by assignees no longer listed, and "nieprzypisane" last; it narrows by the task's assignee. "Status projektu" has the choices and default of the calendar's status filter and narrows by the status of the task's project.

#### Scenario: One architect

- **WHEN** "Rysunki elewacji" is assigned to "Anna Nowak" in "Dom Lipowa", led by "Jan Kowalski", and the user picks "Anna Nowak"
- **THEN** "Rysunki elewacji" is shown
- **AND** tasks assigned to "Jan Kowalski" or to nobody are not

#### Scenario: Unassigned

- **WHEN** the user picks "nieprzypisane"
- **THEN** only tasks without an assignee are shown

#### Scenario: All architects

- **WHEN** the filter is "wszyscy architekci"
- **THEN** tasks of every assignee and tasks without one are shown

#### Scenario: Assignee no longer listed

- **WHEN** a task is assigned to "Piotr Zieliński", who is not in `kalka.json`
- **THEN** "Architekt" offers "Piotr Zieliński" after the listed architects and before "nieprzypisane"

#### Scenario: Default status

- **WHEN** no project status is chosen
- **THEN** tasks of `aktywny` and `wstrzymany` projects are shown and those of `zakończony` projects are not

#### Scenario: Bookmark

- **WHEN** the user picks "Anna Nowak", bookmarks the page and opens the bookmark later
- **THEN** "Zadania" opens filtered to "Anna Nowak"

#### Scenario: Unassigned stays on the tab

- **WHEN** "Zadania" is filtered to "nieprzypisane" and the user clicks "Kalendarz"
- **THEN** the calendar opens with "wszyscy architekci"

### Requirement: Order in the tasks tab

The system SHALL order "Do zrobienia" and "W trakcie" in the tab by due date, a month counting as its last day, so overdue tasks come first and tasks without a date last; equal dates go by title. The manual order from the project boards does not apply, and dropping a card within its own column changes nothing.

#### Scenario: By due date

- **WHEN** today is 2026-11-20 and "Do zrobienia" holds "A" due 2026-11-30, "B" due 2026-11-14, "C" without a date and "D" due 2026-11
- **THEN** the column shows "B", "A", "D", "C"

#### Scenario: Project order ignored

- **WHEN** a project board shows "A" above "B" in "Do zrobienia" and "B" is due earlier
- **THEN** the tab shows "B" above "A"

#### Scenario: Drop in the same column

- **WHEN** the user drags a card within its own column in the tab
- **THEN** nothing is written and the order stays

### Requirement: Tasks tab card

The system SHALL show each task in the tab as a card with its title, its project's title, a "wykonane" checkbox, its due date bottom-left (marked "po terminie" when overdue and not done) and the assignee's initials circle bottom-right when it has one. Cards in "Wykonane" are greyed and their checkbox is ticked. A sync conflict copy carries the "konflikt synchronizacji" badge.

#### Scenario: Full card

- **WHEN** "Rysunki elewacji" of "Dom Lipowa" is due 2026-11-14, assigned to "Anna Nowak" with initials "AN", and today is 2026-11-20
- **THEN** its card shows "Rysunki elewacji", "Dom Lipowa", an unticked "wykonane", "14.11.2026 · po terminie" and the "AN" circle

#### Scenario: Done card

- **WHEN** a task is in "Wykonane"
- **THEN** its card is greyed, "wykonane" is ticked and its date is not marked "po terminie"

### Requirement: Done checkbox

The system SHALL mark a task done when its "wykonane" checkbox is ticked and put a done task back in "Do zrobienia" when it is unticked, saving at once with the task conflict check. The task goes to the bottom of that column on its project's board.

#### Scenario: Tick

- **WHEN** the user ticks "wykonane" on "Rysunki elewacji" in "W trakcie"
- **THEN** the task file holds `"status": "done"` and the card shows in "Wykonane"
- **AND** on "Dom Lipowa"'s board the task is at the bottom of "Wykonane"

#### Scenario: Untick

- **WHEN** the user unticks "wykonane" on a card in "Wykonane"
- **THEN** the task file holds `"status": "todo"` and the card shows in "Do zrobienia"

### Requirement: Change state in the tasks tab

The system SHALL let the user drag a card in the tab onto another column, which sets the task to that column's state and saves at once, putting it at the bottom of that column on its project's board. While dragging, the column under the pointer is marked. A conflict shows the task conflict message above the columns and reads the tasks again.

#### Scenario: Drag to "W trakcie"

- **WHEN** the user drags "Rysunki elewacji" from "Do zrobienia" onto "W trakcie"
- **THEN** the task file holds `"status": "doing"`
- **AND** on "Dom Lipowa"'s board it is at the bottom of "W trakcie"

#### Scenario: Someone else changed the task

- **WHEN** the user drags a task to "Wykonane" but another person changed that task file since it was read
- **THEN** nothing is written, the tab shows the tasks as they are on disk and the message "Ktoś inny zmienił to zadanie w międzyczasie. Zadania są odświeżone, wprowadź zmianę ponownie."

### Requirement: Recently done tasks

The system SHALL show in the tab's "Wykonane" the five tasks done most recently, latest first, and hide the older ones behind a button "pokaż starsze (N)", N being their number, which shows them below. A task without a recorded completion time counts as done at its last change. The column header counts all done tasks.

#### Scenario: More than five

- **WHEN** eight shown tasks are done
- **THEN** "Wykonane" shows the five done last, latest first, and "pokaż starsze (3)"
- **AND** the header of "Wykonane" shows 8

#### Scenario: Show older

- **WHEN** the user clicks "pokaż starsze (3)"
- **THEN** the other three show below the five, latest first

#### Scenario: Undo keeps it visible

- **WHEN** the user ticks "wykonane" on a task
- **THEN** that task is first in "Wykonane", so it can be unticked at once

#### Scenario: Older file

- **WHEN** a done task's file has no completion time and was last changed on 2026-11-02, and another task was done on 2026-11-05
- **THEN** the task done on 2026-11-05 comes first

### Requirement: Task dialog from the tasks tab

The system SHALL open the task dialog of the project page when a card in the tab is clicked, with the same fields, "Zapisz", "Anuluj" and "Usuń", plus a link to the task's project. The link opens the project page, whose "Anuluj" leads back to "Zadania" with the same filters. A state changed in the dialog puts the task at the bottom of that column on its project's board.

#### Scenario: Open the project

- **WHEN** the user clicks "Rysunki elewacji" in the tab filtered to "Anna Nowak" and then the link to "Dom Lipowa"
- **THEN** the page of "Dom Lipowa" opens
- **AND** "Anuluj" there shows "Zadania" filtered to "Anna Nowak"

#### Scenario: Change in the dialog

- **WHEN** the user changes the due date in the dialog and clicks "Zapisz"
- **THEN** the task file holds the new date and the card moves to its place by date

## MODIFIED Requirements

### Requirement: Task file

The system SHALL keep each task as `zadania/<id>.json` holding `id`, `projectId`, `title`, `description`, `due` (absent without a date), `assignee` (empty when none), `status` (`todo`, `doing` or `done`), `order` (a number for its place in its column), `doneAt` (the time the task last became done, absent unless done) and `updatedAt`. A file with an unknown status counts as `todo`; missing text fields count as empty; without a numeric `order` the task has no place yet. `doneAt` is set when a task's state becomes `done`, kept while it stays done, and removed when it leaves `done`.

#### Scenario: Written file

- **WHEN** the user adds "Rysunki elewacji" due 2026-11-14 for Anna Nowak to "Dom Lipowa"
- **THEN** the file holds `"projectId"` equal to the project's `id`, `"due": "2026-11-14"`, `"assignee": "Anna Nowak"` and `"status": "todo"`

#### Scenario: Hand-edited file

- **WHEN** a task file has `"status": "gotowe"` and no `description`
- **THEN** the task shows in "Do zrobienia" with an empty description

#### Scenario: Project gone

- **WHEN** a task file's `projectId` matches no project file
- **THEN** the task is shown nowhere and its file is left alone

#### Scenario: Done time set

- **WHEN** a task in "W trakcie" is moved to "Wykonane", on the project board or in the "Zadania" tab
- **THEN** its file holds `doneAt` with the time of that change

#### Scenario: Done time kept

- **WHEN** a done task with `doneAt` is edited in its dialog without leaving "Wykonane", or moved within "Wykonane" on the project board
- **THEN** its `doneAt` is unchanged

#### Scenario: Done time removed

- **WHEN** a done task is moved back to "Do zrobienia"
- **THEN** its file no longer holds `doneAt`

#### Scenario: File without done time

- **WHEN** a done task's file has no `doneAt`
- **THEN** the task shows in "Wykonane" as before, and the file gets no `doneAt` until the task becomes done again
