## ADDED Requirements

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

## MODIFIED Requirements

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

### Requirement: Task file

The system SHALL keep each task as `zadania/<id>.json` holding `id`, `projectId` (empty for a task without a project), `title`, `description`, `due` (absent without a date), `assignee` (empty when none), `reviewer` (empty when none), `reviewNote` (empty when none), `status` (`todo`, `doing`, `review` or `done`), `order` (a number for its place in its column), `urgent` (`true` for an urgent task, absent otherwise), `doneAt` (the time the task last became done, absent unless done) and `updatedAt`. A file with an unknown status counts as `todo`; missing text fields, `projectId`, `reviewer` and `reviewNote` included, count as empty; a `projectId` that matches no project file counts as no project; without a numeric `order` the task has no place yet; any `urgent` other than `true` counts as not urgent. `doneAt` is set when a task's state becomes `done`, kept while it stays done, and removed when it leaves `done`.

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

- **WHEN** a done task with `doneAt` is edited in its dialog without leaving "Wykonane", or moved within "Wykonane" on the project board
- **THEN** its `doneAt` is unchanged

#### Scenario: Done time removed

- **WHEN** a done task is moved back to "Do zrobienia" or "Do weryfikacji"
- **THEN** its file no longer holds `doneAt`

#### Scenario: File without done time

- **WHEN** a done task's file has no `doneAt`
- **THEN** the task shows in "Wykonane" as before, and the file gets no `doneAt` until the task becomes done again

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
