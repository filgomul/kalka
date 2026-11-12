# Spec Delta

## MODIFIED Requirements

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

### Requirement: Tasks tab

The system SHALL show a header tab "Zadania" listing all tasks, of every project and without one, in four columns "Do zrobienia", "W trakcie", "Do weryfikacji" and "Wykonane", each headed by its number of tasks. A task whose project file is missing counts as a task without a project.

#### Scenario: Tasks of several projects

- **WHEN** "Dom Lipowa" has the task "Rysunki elewacji" in "Do zrobienia" and "Willa Sosnowa" has "Zestawienie okien" in "W trakcie" and "Rzut dachu" in "Do weryfikacji"
- **THEN** "Zadania" shows "Rysunki elewacji" under "Do zrobienia", "Zestawienie okien" under "W trakcie" and "Rzut dachu" under "Do weryfikacji"

#### Scenario: Project gone

- **WHEN** a task file's `projectId` matches no project file
- **THEN** the task shows in "Zadania" as a task without a project

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
