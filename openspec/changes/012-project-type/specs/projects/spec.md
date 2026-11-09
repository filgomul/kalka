## MODIFIED Requirements

### Requirement: Project list

The system SHALL list projects with running number, title, type, location, lead architect, next milestone and status, sorted by next milestone date (projects without one last) unless the user sorts by another column (see "Sort by column").

#### Scenario: Default view

- **WHEN** the project list opens
- **THEN** projects with status `zakończony` are hidden by default
- **AND** the columns are, in this order, "l.p.", "tytuł", "typ", "miejscowość", "arch. prowadzący", "najbliższy termin" and "status"
- **AND** each row shows l.p., title, type ("projekt budowlany", "projekt wnętrz" or "inny"), city, lead architect, the next milestone name and date, and status

### Requirement: Filter and search

The system SHALL filter the list by lead architect, by status and by project type, and search by text in title, city and address; filters are kept in the URL so they survive a refresh.

#### Scenario: Filter by architect

- **WHEN** the user picks an architect in the filter
- **THEN** only that architect's projects are shown

#### Scenario: Filter by type

- **WHEN** the user picks "projekt wnętrz" in the "Typ projektu" filter, which offers "wszystkie typy", "projekt budowlany", "projekt wnętrz" and "inny"
- **THEN** only projects of type "projekt wnętrz" are shown
- **AND** after a refresh, or after opening a project and going back, the filter still shows "projekt wnętrz"

#### Scenario: Search

- **WHEN** the user types "Oliwa"
- **THEN** only projects whose title, city or address contains "oliwa" (case-insensitive) are shown

### Requirement: Edit project

The system SHALL edit l.p., title, project type, location (city, address), lead architect, status, the project's milestones, six branch scopes and notes. The fields other than the milestones are saved together with "Zapisz"; milestone changes of a saved project are written on their own at once (see "Milestones saved at once").

#### Scenario: Edit and cancel

- **WHEN** the user changes fields other than the milestones and clicks "Anuluj"
- **THEN** nothing is written and the list shows the old values

### Requirement: Project templates

The system SHALL offer three project templates, "projekt budowlany", "projekt wnętrz" and "inny", each an ordered list of milestone styles that seeds a new project's milestones. A new project also takes its type from the template (see "Project type").

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
- **THEN** the project file holds its milestones and `"type": "wnetrza"`, and no other record of the template

## ADDED Requirements

### Requirement: Project type

The system SHALL keep each project's type, one of "projekt budowlany", "projekt wnętrz" and "inny", stored as `type` with the template keys `budowlany`, `wnetrza` and `inny`. A file without one of these keys reads as "inny" and gets `type` only when the project is written. The project form offers the type as a choice saved with "Zapisz"; changing it leaves the milestones as they are.

#### Scenario: New project

- **WHEN** the user opens "Nowy projekt" and picks "projekt wnętrz"
- **THEN** the form shows "projekt wnętrz" as the type

#### Scenario: Link without a template

- **WHEN** the user opens the new-project address without a template
- **THEN** the form shows "projekt budowlany" as the type

#### Scenario: File without a type

- **WHEN** a project file "Dom Lipowa" has no `type`
- **THEN** the list and the form show "inny"
- **AND** the file stays as it is while nobody writes the project

#### Scenario: Unknown type

- **WHEN** a hand-edited project file holds `"type": "biuro"`
- **THEN** the list and the form show "inny"

#### Scenario: Change and save

- **WHEN** the user opens "Dom Lipowa", picks "projekt budowlany" as the type and clicks "Zapisz"
- **THEN** the project file holds `"type": "budowlany"` and the same milestones as before

#### Scenario: Change and cancel

- **WHEN** the user picks another type and clicks "Anuluj"
- **THEN** the project file keeps its old type, or still has none

#### Scenario: Milestone change on a file without a type

- **WHEN** a project file has no `type` and the user ticks "zrealizowane" for one of its milestones
- **THEN** the project file holds `"type": "inny"` together with the done mark

### Requirement: Sort by column

The system SHALL sort the project list by a column when the user clicks its header, and reverse the order when the user clicks the same header again. The sorted column's header shows the direction. Empty values sort last in both directions; status and type sort in the order of their lists; ties keep the default order. The sort is kept in the URL, and without one the list sorts by next milestone.

#### Scenario: Sort by title

- **WHEN** the list holds "Willa Łąkowa", "Dom Lipowa" and "Kamienica Oliwa" and the user clicks "tytuł"
- **THEN** the rows show "Dom Lipowa", "Kamienica Oliwa", "Willa Łąkowa"
- **AND** the "tytuł" header shows the ascending direction

#### Scenario: Reverse

- **WHEN** the list is sorted by "tytuł" and the user clicks "tytuł" again
- **THEN** the rows show "Willa Łąkowa", "Kamienica Oliwa", "Dom Lipowa"
- **AND** the header shows the descending direction

#### Scenario: Other column

- **WHEN** the list is sorted by "tytuł" descending and the user clicks "miejscowość"
- **THEN** the list is sorted by city ascending

#### Scenario: Running number

- **WHEN** projects have l.p. 10, 2 and none, and the user clicks "l.p."
- **THEN** the rows show 2, 10, then the project without a number

#### Scenario: Empty values last

- **WHEN** one project has no city and the user sorts by "miejscowość" ascending, then descending
- **THEN** the project without a city is last both times

#### Scenario: Status order

- **WHEN** the status filter shows all statuses and the user clicks "status"
- **THEN** "aktywny" projects come first, then "wstrzymany", then "zakończony"

#### Scenario: Type order

- **WHEN** the user clicks "typ"
- **THEN** "projekt budowlany" projects come first, then "projekt wnętrz", then "inny"

#### Scenario: Ties

- **WHEN** the list is sorted by "arch. prowadzący" and two projects have the same lead architect
- **THEN** those two keep the order by next milestone between them

#### Scenario: Next milestone reversed

- **WHEN** the list opens with no sort and the user clicks "najbliższy termin"
- **THEN** the project with the latest next milestone comes first
- **AND** projects without an upcoming milestone stay last

#### Scenario: Kept in the URL

- **WHEN** the list is sorted by "miejscowość" descending and the user refreshes the page, or opens a project and goes back
- **THEN** the list is still sorted by "miejscowość" descending

#### Scenario: Unknown sort in the URL

- **WHEN** the address holds a sort the list does not know, for example from a hand-edited bookmark
- **THEN** the list sorts by next milestone
