## ADDED Requirements

### Requirement: Project templates

The system SHALL offer three project templates, "projekt budowlany", "projekt wnętrz" and "inny", each an ordered list of milestone styles that seeds a new project's milestones. A project does not keep which template it came from.

#### Scenario: Building template

- **WHEN** the user creates a project from "projekt budowlany"
- **THEN** the milestones section shows, undated and in this order: "data rozpoczęcia", "wydanie koncepcji", "akceptacja koncepcji", "PB do urzędu", "uzupełnienie do urzędu", "uzyskanie pozwolenia", "termin branżystów", "wydanie projektu"

#### Scenario: Interior template

- **WHEN** the user creates a project from "projekt wnętrz"
- **THEN** the milestones section shows, undated and in this order: "data rozpoczęcia", "układy funkcjonalne", "akceptacja układów", "pierwsze wizualizacje", "akceptacja wizualizacji", "wydanie projektu", "nadzór autorski"

#### Scenario: Other

- **WHEN** the user creates a project from "inny"
- **THEN** the milestones section is empty apart from "+ Dodaj termin"

#### Scenario: No template in the file

- **WHEN** a project created from "projekt wnętrz" is saved
- **THEN** the project file holds its milestones and no record of the template

### Requirement: Milestone styles

The system SHALL give every milestone a style with a name, a short label and a colour, from a fixed list of 14 styles: the 13 milestone kinds of the two templates and "inny". Every style has its own colour; only "inny" is black and none uses the overdue colour. A milestone whose style is unknown shows as "inny".

#### Scenario: Short labels

- **WHEN** milestones of each style are shown in the calendar
- **THEN** their short labels are "rozp.", "konc.", "akc.", "PB", "uzup.", "pozw.", "branż.", "wyd.", "ukł.", "akc. ukł.", "wiz.", "akc. wiz.", "nadz." and "inny", for data rozpoczęcia, wydanie koncepcji, akceptacja koncepcji, PB do urzędu, uzupełnienie do urzędu, uzyskanie pozwolenia, termin branżystów, wydanie projektu, układy funkcjonalne, akceptacja układów, pierwsze wizualizacje, akceptacja wizualizacji, nadzór autorski and inny

#### Scenario: Unknown style

- **WHEN** a hand-edited project file has a milestone `{ "id": "x1", "style": "odbior", "title": "odbiór budynku", "date": "2027-05-10" }`
- **THEN** the form shows "odbiór budynku" and the calendar shows it as "inny", in black

### Requirement: Add milestone

The system SHALL let the user add a milestone to a project with "+ Dodaj termin" below the milestone list, which opens a dialog with a title (required) and a style chosen from the 14 styles, "inny" by default. The new milestone goes to the end of the list, undated, planned and not done. Only the project changes, never a template.

#### Scenario: Second supplement

- **WHEN** the user clicks "+ Dodaj termin" in project "Dom Lipowa", types "drugie uzupełnienie", picks "uzupełnienie do urzędu", clicks "Dodaj" and then "Zapisz"
- **THEN** the project file holds a milestone with style `uzupelnienie` and title "drugie uzupełnienie" at the end of its milestones
- **AND** the project has two milestones with the "uzupełnienie do urzędu" style, each with its own date, done and confirmed marks

#### Scenario: Default style

- **WHEN** the user opens "+ Dodaj termin"
- **THEN** the style shows "inny"

#### Scenario: Title missing

- **WHEN** the user clicks "Dodaj" with an empty title
- **THEN** the dialog stays open and shows "Podaj nazwę terminu."

#### Scenario: Cancelled project edit

- **WHEN** the user adds a milestone and then clicks "Anuluj" in the project form
- **THEN** nothing is written and the project has its old milestones

#### Scenario: New project

- **WHEN** the user adds a milestone to a project that has not been saved yet
- **THEN** it is added to the list and written with the project on "Zapisz"

### Requirement: Edit added milestone

The system SHALL let the user change the title and style of a milestone they added, in the same dialog as adding, with "Zmień" instead of "Dodaj". Milestones that came from a template keep their style's name and style and offer no such dialog.

#### Scenario: Rename

- **WHEN** the user opens the added milestone "drugie uzupełnienie", changes the title to "uzupełnienie po wezwaniu", clicks "Zmień" and then "Zapisz"
- **THEN** the project file holds the new title and the milestone keeps its date, done and confirmed marks and its place in the list

#### Scenario: Template milestone

- **WHEN** the project form shows "uzyskanie pozwolenia" from the building template
- **THEN** it offers no way to change its name or style

### Requirement: Delete milestone

The system SHALL let the user delete any milestone of a project, from a template or added, after confirming `Usunąć termin „<name>”?`. The deletion is written by "Zapisz" and undone by "Anuluj".

#### Scenario: Confirm

- **WHEN** the user deletes "uzupełnienie do urzędu", confirms and clicks "Zapisz"
- **THEN** the project file no longer holds that milestone and the calendar no longer shows it

#### Scenario: Decline

- **WHEN** the user deletes a milestone and declines the confirmation
- **THEN** the milestone stays in the list

### Requirement: Reorder milestones

The system SHALL let the user change the order of a project's milestones by dragging a milestone by its handle above or below another, or by pressing arrow up or down while its handle has focus. The order is written by "Zapisz" and undone by "Anuluj", and every place that lists a project's milestones uses it.

#### Scenario: Drag

- **WHEN** the user drags "wydanie projektu" above "termin branżystów" and clicks "Zapisz"
- **THEN** reopening the form shows "wydanie projektu" before "termin branżystów"

#### Scenario: Keyboard

- **WHEN** the handle of the last milestone has focus and the user presses arrow up
- **THEN** that milestone moves one place up and its handle keeps focus

#### Scenario: Cancel

- **WHEN** the user reorders milestones and clicks "Anuluj"
- **THEN** the project file keeps the old order

### Requirement: Older project files

The system SHALL read a project file written before this change, which holds `milestones` as an object keyed by milestone kind with `done` and `confirmed` lists, as a building-template project: its seven milestones in the building order with their dates and marks, followed by an undated "wydanie projektu". The file changes shape only when the project is saved.

#### Scenario: Read

- **WHEN** a project file holds `"milestones": { "pozwolenie": "2027-03" }`, `"done": ["koncepcja"]` and `"confirmed": ["pozwolenie"]`
- **THEN** the form shows the eight building milestones in order, "wydanie koncepcji" done, "uzyskanie pozwolenia" at 03.2027 and confirmed, "wydanie projektu" empty
- **AND** the list and the calendar show the same dates and marks as before this change

#### Scenario: Save

- **WHEN** the user saves such a project
- **THEN** the file holds the milestones as an ordered list under `timeline`, including the undated "wydanie projektu"
- **AND** the file no longer holds the old `milestones`, `done` and `confirmed` keys

#### Scenario: Not opened

- **WHEN** nobody saves an older project
- **THEN** its file stays as it is and keeps reading the same way

## MODIFIED Requirements

### Requirement: Create project

The system SHALL create a project from a template picked in a menu that the "Nowy projekt" button opens, listing "projekt budowlany", "projekt wnętrz" and "inny"; picking one opens an empty project form with that template's milestones. Only the title is required; everything else is optional.

#### Scenario: Minimal project

- **WHEN** the user opens "Nowy projekt", picks "projekt budowlany", enters a title and saves
- **THEN** a new file `projekty/<id>.json` exists with status `aktywny`, the eight undated building milestones and empty branch scopes
- **AND** the list shows it

#### Scenario: Menu

- **WHEN** the user clicks "Nowy projekt"
- **THEN** a menu lists "projekt budowlany", "projekt wnętrz" and "inny", in that order
- **AND** pressing Esc or clicking outside closes it without opening a form

#### Scenario: Link without a template

- **WHEN** the user opens the new-project address without a template, for example from an old bookmark
- **THEN** the form opens with the building template's milestones

### Requirement: Edit project

The system SHALL edit l.p., title, location (city, address), lead architect, status, the project's milestones, six branch scopes and notes, and save all of them at once.

#### Scenario: Edit and cancel

- **WHEN** the user changes fields and clicks "Anuluj"
- **THEN** nothing is written and the list shows the old values

### Requirement: Milestone precision

The system SHALL accept each milestone as a full date or a month, store it as `YYYY-MM-DD` or `YYYY-MM`, and display it as `30.10.2026` or `10.2026`.

#### Scenario: Month only

- **WHEN** the user switches "termin branżystów" to "miesiąc" and picks November 2026
- **THEN** that milestone in the project file holds `"date": "2026-11"`
- **AND** the list shows `11.2026`

#### Scenario: Clear a milestone

- **WHEN** the user clears a milestone input and saves
- **THEN** the milestone stays in the project file without a `date`

### Requirement: Milestone done

The system SHALL let the user mark each milestone as done or not done with a checkbox "zrealizowane" in the project form, whether or not it has a date, and keep the mark on that milestone in the project file. A milestone without the mark is not done.

#### Scenario: Tick and save

- **WHEN** the user ticks "zrealizowane" next to "wydanie koncepcji" and saves
- **THEN** that milestone in the project file holds `"done": true`
- **AND** reopening the form shows that milestone ticked

#### Scenario: File without done marks

- **WHEN** a project file has no `done` marks, for example an older file without a `done` key
- **THEN** every milestone of that project counts as not done

#### Scenario: Done without a date

- **WHEN** the user ticks "zrealizowane" for a milestone with no date and saves
- **THEN** the milestone is saved as done and still has no date

#### Scenario: Untick

- **WHEN** the user unticks a done milestone and saves
- **THEN** that milestone in the project file holds no `done` mark

#### Scenario: Same style twice

- **WHEN** a project has two "uzupełnienie do urzędu" milestones and the user ticks only the second
- **THEN** only the second is done

### Requirement: Confirmed date

The system SHALL let the user mark each milestone as "planowane" or "potwierdzone" with a pair of radio buttons in the project form, whether or not it has a date, and keep `"confirmed": true` on a confirmed milestone in the project file. A milestone without the mark is planned. The choice is independent of "zrealizowane", and changing a milestone's date keeps it.

#### Scenario: New project

- **WHEN** the user creates a project from any template
- **THEN** every milestone shows "planowane" selected

#### Scenario: Confirm and save

- **WHEN** a project has "uzyskanie pozwolenia" at 2027-03 and the user picks "potwierdzone" for it and saves
- **THEN** that milestone in the project file holds `"confirmed": true`
- **AND** reopening the form shows "potwierdzone" selected

#### Scenario: Back to planned

- **WHEN** the user picks "planowane" for a confirmed milestone and saves
- **THEN** that milestone in the project file holds no `confirmed` mark

#### Scenario: File without confirmed marks

- **WHEN** a project file has no `confirmed` marks, for example an older file without a `confirmed` key
- **THEN** every milestone of that project shows "planowane"

#### Scenario: Confirmed without a date

- **WHEN** the user picks "potwierdzone" for a milestone with no date and saves
- **THEN** the milestone is saved as confirmed and still has no date

#### Scenario: Date changed

- **WHEN** "uzyskanie pozwolenia" is confirmed at `2027-03` and the user changes the date to 2027-03-18 and saves
- **THEN** that milestone holds `"date": "2027-03-18"` and is still confirmed

#### Scenario: Independent of done

- **WHEN** the user ticks "zrealizowane" for a planned milestone and saves
- **THEN** the milestone is done and still planned, and unticking it later shows it planned as before

## REMOVED Requirements

### Requirement: Concept acceptance milestone

**Reason**: The fixed list of seven milestones is replaced by templates. "akceptacja koncepcji" is now a style that the building template places between "wydanie koncepcji" and "PB do urzędu".

**Migration**: Covered by "Project templates" (building template order) and "Older project files" (an older file without `akceptacja` reads with an undated "akceptacja koncepcji").
