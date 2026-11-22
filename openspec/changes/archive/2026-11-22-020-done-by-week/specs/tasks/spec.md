## REMOVED Requirements

### Requirement: Recently done tasks

**Reason**: "Wykonane" in the tab is grouped by week instead of showing the five latest
tasks in one list.

**Migration**: See "Done tasks by week", "Older weeks folded" and "Long weeks folded".

## MODIFIED Requirements

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

## ADDED Requirements

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
