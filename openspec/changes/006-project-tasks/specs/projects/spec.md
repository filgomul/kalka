## MODIFIED Requirements

### Requirement: Lead architect list

The system SHALL offer the lead architect as a choice from the `architects` list in `kalka.json`, which the studio edits by hand; the app has no screen to change the list. An entry is either a name or an object with `name` and optionally `initials` and `color`; the choices show the names.

#### Scenario: Pick from the list

- **WHEN** `kalka.json` holds `"architects": ["Anna Nowak", "Jan Kowalski"]` and the user opens the form
- **THEN** the lead architect field offers an empty choice, "Anna Nowak" and "Jan Kowalski"

#### Scenario: Entries with initials and colour

- **WHEN** `kalka.json` holds `"architects": [{ "name": "Anna Nowak", "initials": "AN", "color": "#697662" }, "Jan Kowalski"]`
- **THEN** the lead architect field and the architect filters offer "Anna Nowak" and "Jan Kowalski"

#### Scenario: Entry without a name

- **WHEN** an entry is an object without a text `name`
- **THEN** it is left out of the choices and the other entries are offered

#### Scenario: Value not on the list

- **WHEN** a project's `leadArchitect` is "Piotr Zieliński", who is not in `architects`
- **THEN** the form shows "Piotr Zieliński" as the selected choice and saving without touching the field keeps it
- **AND** the list's architect filter offers "Piotr Zieliński" next to the names from `kalka.json`

#### Scenario: Empty list

- **WHEN** `kalka.json` has no `architects` or an empty one
- **THEN** the lead architect field offers only the empty choice and a hint "Dodaj architektów w pliku kalka.json"
