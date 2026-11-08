## ADDED Requirements

### Requirement: Tasks tab

The system SHALL show a header tab "Zadania" listing all tasks, of every project and without one, in three columns "Do zrobienia", "W trakcie" and "Wykonane", each headed by its number of tasks. A task whose project file is missing counts as a task without a project.

#### Scenario: Tasks of several projects

- **WHEN** "Dom Lipowa" has the task "Rysunki elewacji" in "Do zrobienia" and "Willa Sosnowa" has "Zestawienie okien" in "W trakcie"
- **THEN** "Zadania" shows "Rysunki elewacji" under "Do zrobienia" and "Zestawienie okien" under "W trakcie"

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

## MODIFIED Requirements

### Requirement: Task file

The system SHALL keep each task as `zadania/<id>.json` holding `id`, `projectId` (empty for a task without a project), `title`, `description`, `due` (absent without a date), `assignee` (empty when none), `status` (`todo`, `doing` or `done`), `order` (a number for its place in its column), `doneAt` (the time the task last became done, absent unless done) and `updatedAt`. A file with an unknown status counts as `todo`; missing text fields, `projectId` included, count as empty; a `projectId` that matches no project file counts as no project; without a numeric `order` the task has no place yet. `doneAt` is set when a task's state becomes `done`, kept while it stays done, and removed when it leaves `done`.

#### Scenario: Written file

- **WHEN** the user adds "Rysunki elewacji" due 2026-11-14 for Anna Nowak to "Dom Lipowa"
- **THEN** the file holds `"projectId"` equal to the project's `id`, `"due": "2026-11-14"`, `"assignee": "Anna Nowak"` and `"status": "todo"`

#### Scenario: Hand-edited file

- **WHEN** a task file has `"status": "gotowe"` and no `description`
- **THEN** the task shows in "Do zrobienia" with an empty description

#### Scenario: Project gone

- **WHEN** a task file's `projectId` matches no project file
- **THEN** the task shows on no project's board and in "Zadania" as a task without a project, and its file is left alone until the task is saved

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
