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

- **WHEN** today is 2026-11-20 and a task in "Do zrobienia", "W trakcie" or "Do weryfikacji" is due 2026-11-14
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

The system SHALL keep each task as `zadania/<id>.json` holding `id`, `projectId` (empty for a task without a project), `title`, `description`, `due` (absent without a date), `assignee` (empty when none), `status` (`todo`, `doing`, `review` or `done`), `order` (a number for its place in its column), `urgent` (`true` for an urgent task, absent otherwise), `doneAt` (the time the task last became done, absent unless done) and `updatedAt`. A file with an unknown status counts as `todo`; missing text fields, `projectId` included, count as empty; a `projectId` that matches no project file counts as no project; without a numeric `order` the task has no place yet; any `urgent` other than `true` counts as not urgent. `doneAt` is set when a task's state becomes `done`, kept while it stays done, and removed when it leaves `done`.

#### Scenario: Written file

- **WHEN** the user adds "Rysunki elewacji" due 2026-11-14 for Anna Nowak to "Dom Lipowa"
- **THEN** the file holds `"projectId"` equal to the project's `id`, `"due": "2026-11-14"`, `"assignee": "Anna Nowak"` and `"status": "todo"`
- **AND** it holds no `urgent`

#### Scenario: Waiting for a check

- **WHEN** a task file has `"status": "review"`
- **THEN** the task shows in "Do weryfikacji" and its file holds no `doneAt`

#### Scenario: Hand-edited file

- **WHEN** a task file has `"status": "gotowe"` and no `description`
- **THEN** the task shows in "Do zrobienia" with an empty description

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

- **WHEN** a done task with `doneAt` is edited in its dialog without leaving "Wykonane", or moved within "Wykonane" on the project board
- **THEN** its `doneAt` is unchanged

#### Scenario: Done time removed

- **WHEN** a done task is moved back to "Do zrobienia" or "Do weryfikacji"
- **THEN** its file no longer holds `doneAt`

#### Scenario: File without done time

- **WHEN** a done task's file has no `doneAt`
- **THEN** the task shows in "Wykonane" as before, and the file gets no `doneAt` until the task becomes done again

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

The system SHALL filter the tab by "Architekt", "Status projektu" and "Projekt", side by side, all kept in the URL so the view survives a refresh and can be bookmarked. "Architekt" offers "wszyscy architekci", the architects from `kalka.json` followed by assignees no longer listed, and "nieprzypisane" last; it narrows by the task's assignee. "Status projektu" has the choices and default of the calendar's status filter and narrows the tasks that have a project by that project's status. "Projekt" offers "wszystkie zadania", "z projektem" and "bez projektu"; "Status projektu" is disabled while "bez projektu" is chosen.

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

The system SHALL show each task in the tab as a card with its title, its project's title (or "bez projektu"), a "wykonane" checkbox, its due date bottom-left (marked "po terminie" when overdue and not done) and the assignee's initials circle bottom-right when it has one. Cards in "Wykonane" are greyed and their checkbox is ticked. A sync conflict copy carries the "konflikt synchronizacji" badge.

#### Scenario: Full card

- **WHEN** "Rysunki elewacji" of "Dom Lipowa" is due 2026-11-14, assigned to "Anna Nowak" with initials "AN", and today is 2026-11-20
- **THEN** its card shows "Rysunki elewacji", "Dom Lipowa", an unticked "wykonane", "14.11.2026 · po terminie" and the "AN" circle

#### Scenario: Done card

- **WHEN** a task is in "Wykonane"
- **THEN** its card is greyed, "wykonane" is ticked and its date is not marked "po terminie"

#### Scenario: Card without a project

- **WHEN** "Zamówić próbki" has no project
- **THEN** its card shows "bez projektu" where the project's title would be

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
