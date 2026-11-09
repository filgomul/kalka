## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Order in the tasks tab

The system SHALL order "Do zrobienia" and "W trakcie" in the tab with urgent tasks first, then the others, each group by due date, a month counting as its last day, so overdue tasks come first and tasks without a date last; equal dates go by title. The manual order from the project boards does not apply, and dropping a card within its own column changes nothing.

#### Scenario: By due date

- **WHEN** today is 2026-11-20 and "Do zrobienia" holds "A" due 2026-11-30, "B" due 2026-11-14, "C" without a date and "D" due 2026-11
- **THEN** the column shows "B", "A", "D", "C"

#### Scenario: Urgent first

- **WHEN** "Do zrobienia" holds "A" due 2026-11-14, urgent "B" due 2026-11-30 and urgent "C" without a date
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

### Requirement: Task file

The system SHALL keep each task as `zadania/<id>.json` holding `id`, `projectId` (empty for a task without a project), `title`, `description`, `due` (absent without a date), `assignee` (empty when none), `status` (`todo`, `doing` or `done`), `order` (a number for its place in its column), `urgent` (`true` for an urgent task, absent otherwise), `doneAt` (the time the task last became done, absent unless done) and `updatedAt`. A file with an unknown status counts as `todo`; missing text fields, `projectId` included, count as empty; a `projectId` that matches no project file counts as no project; without a numeric `order` the task has no place yet; any `urgent` other than `true` counts as not urgent. `doneAt` is set when a task's state becomes `done`, kept while it stays done, and removed when it leaves `done`.

#### Scenario: Written file

- **WHEN** the user adds "Rysunki elewacji" due 2026-11-14 for Anna Nowak to "Dom Lipowa"
- **THEN** the file holds `"projectId"` equal to the project's `id`, `"due": "2026-11-14"`, `"assignee": "Anna Nowak"` and `"status": "todo"`
- **AND** it holds no `urgent`

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
