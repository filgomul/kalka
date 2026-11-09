## ADDED Requirements

### Requirement: Project data

The system SHALL keep per project an investor, a phone number, an email address, a plot identifier and free-text office contacts, stored as `investor`, `investorPhone`, `investorEmail`, `plot` and `officeContact`. They are plain text with no format check, saved with "Zapisz" and undone by "Anuluj" like the other project fields. They are not shown in the project list or the calendar and the list search does not look in them.

#### Scenario: Fill and save

- **WHEN** the user opens "Dom Lipowa", fills in "inwestor" with "Jan Nowak", "telefon" with "600 100 200", "e-mail" with "jan.nowak@example.com", "identyfikator działki" with "123/4" and "kontakt do urzędu" with "Starostwo, wydział architektury: p. Ewa Kowalska, pokój 12", and clicks "Zapisz"
- **THEN** the project file holds `"investor": "Jan Nowak"`, `"investorPhone": "600 100 200"`, `"investorEmail": "jan.nowak@example.com"`, `"plot": "123/4"` and that office contact text
- **AND** reopening the project shows the same values

#### Scenario: Cancel

- **WHEN** the user changes "inwestor" and clicks "Anuluj"
- **THEN** the project file keeps the old investor

#### Scenario: Any text accepted

- **WHEN** the user types "600 100 200, 601 200 300" as the phone, "biuro@" as the email and "123/4, 123/5" as the plot, and clicks "Zapisz"
- **THEN** the project is saved with no message and the file holds the three values as typed

#### Scenario: File without project data

- **WHEN** a project file has none of the five keys, for example one written before this change
- **THEN** the form shows the five fields empty
- **AND** the file stays as it is while nobody writes the project

#### Scenario: Not searched

- **WHEN** project "Dom Lipowa" in Gdańsk has investor "Jan Nowak" and the user types "Nowak" in the list search
- **THEN** "Dom Lipowa" is not shown
- **AND** no list column shows the investor, phone, email, plot or office contacts

### Requirement: Project data section

The system SHALL show the project data in a "Dane projektu" section of the project form, after the "Projekt" section and before the milestones, for new and saved projects. The section is folded each time the form opens; clicking its heading unfolds or folds it. When the investor is filled in, the heading reads "Dane projektu - <investor>". Investor, phone, email and plot are one-line fields; "kontakt do urzędu" is a multi-line field like "uwagi".

#### Scenario: Folded on open

- **WHEN** the user opens a project whose project data is filled in
- **THEN** the "Dane projektu" section is folded and its fields are hidden
- **AND** clicking the heading shows "inwestor", "telefon", "e-mail", "identyfikator działki" and "kontakt do urzędu"

#### Scenario: Investor in the heading

- **WHEN** a project has investor "Jan Nowak"
- **THEN** the folded heading reads "Dane projektu - Jan Nowak"

#### Scenario: No investor

- **WHEN** a project has no investor, or only spaces in it
- **THEN** the heading reads "Dane projektu"

#### Scenario: New project

- **WHEN** the user opens "Nowy projekt"
- **THEN** the form shows the folded "Dane projektu" section between "Projekt" and "Terminy"
