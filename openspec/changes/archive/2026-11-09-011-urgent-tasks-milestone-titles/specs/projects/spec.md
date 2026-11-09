## MODIFIED Requirements

### Requirement: Add milestone

The system SHALL let the user add a milestone to a project with "+ Dodaj termin" in the top right corner of the milestones section (where "+ Dodaj zadanie" sits in the tasks section), which opens a dialog with a style chosen from the 14 styles, "inny" by default, followed by a title (required). Picking a style puts that style's name in the title when the title is empty or still holds the name of the style picked before; a title the user typed is kept. Picking "inny" empties a title that holds the previous style's name. The new milestone goes to the end of the list, undated, planned and not done. Only the project changes, never a template.

#### Scenario: Second supplement

- **WHEN** the user clicks "+ Dodaj termin" in project "Dom Lipowa", types "drugie uzupełnienie", picks "uzupełnienie do urzędu" and clicks "Dodaj"
- **THEN** the project file holds a milestone with style `uzupelnienie` and title "drugie uzupełnienie" at the end of its milestones
- **AND** the project has two milestones with the "uzupełnienie do urzędu" style, each with its own date, done and confirmed marks

#### Scenario: Default style

- **WHEN** the user opens "+ Dodaj termin"
- **THEN** the dialog shows the style first, set to "inny", and an empty title below it

#### Scenario: Name from the style

- **WHEN** the user opens "+ Dodaj termin", picks "akceptacja koncepcji" and clicks "Dodaj"
- **THEN** the project file holds a milestone with style `akceptacja` and title "akceptacja koncepcji"

#### Scenario: Style picked again

- **WHEN** the user picks "akceptacja koncepcji" and then "wydanie koncepcji" without touching the title
- **THEN** the title reads "wydanie koncepcji"

#### Scenario: Typed title kept

- **WHEN** the user picks "akceptacja koncepcji", changes the title to "akceptacja koncepcji - wariant B" and then picks "wydanie koncepcji"
- **THEN** the title still reads "akceptacja koncepcji - wariant B"

#### Scenario: Back to "inny"

- **WHEN** the user picks "akceptacja koncepcji" and then "inny" without touching the title
- **THEN** the title is empty

#### Scenario: Title missing

- **WHEN** the user clicks "Dodaj" with an empty title
- **THEN** the dialog stays open and shows "Podaj nazwę terminu."

#### Scenario: Anuluj keeps an added milestone

- **WHEN** the user adds a milestone to a saved project and then clicks "Anuluj" in the project form
- **THEN** the project file still holds the added milestone

#### Scenario: New project

- **WHEN** the user adds a milestone to a project that has not been saved yet
- **THEN** it is added to the list and written with the project on "Zapisz"

### Requirement: Edit added milestone

The system SHALL let the user change the title and style of a milestone they added, in the same dialog as adding, with "Zmień" instead of "Dodaj" and the same filling of the title from the style. Milestones that came from a template keep their style's name and style and offer no such dialog.

#### Scenario: Rename

- **WHEN** the user opens the added milestone "drugie uzupełnienie", changes the title to "uzupełnienie po wezwaniu" and clicks "Zmień"
- **THEN** the project file holds the new title and the milestone keeps its date, done and confirmed marks and its place in the list

#### Scenario: Change style of a filled-in name

- **WHEN** the user opens the added milestone "akceptacja koncepcji" with style `akceptacja`, picks "akceptacja układów" and clicks "Zmień"
- **THEN** the project file holds style `akceptacjaUkladow` and title "akceptacja układów"

#### Scenario: Template milestone

- **WHEN** the project form shows "uzyskanie pozwolenia" from the building template
- **THEN** it offers no way to change its name or style
