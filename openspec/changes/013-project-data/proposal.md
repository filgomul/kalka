## Why

The studio keeps the investor's contact details, the plot identifier and the people to
call at the office (the permit officer, the conservator) in emails and notebooks. The
project page is where everyone looks first, but it has nowhere to keep them.

## What Changes

- A project keeps five more text fields: investor, phone, email, plot identifier and
  office contacts, stored as `investor`, `investorPhone`, `investorEmail`, `plot` and
  `officeContact`.
- The project form gets a "Dane projektu" section after "Projekt" and before
  "Terminy", for new and saved projects. It is folded each time the form opens and
  unfolds when the user clicks its heading. When an investor is filled in, the heading
  shows it: "Dane projektu - Jan Nowak".
- Investor, phone, email and plot are one-line fields; "kontakt do urzędu" is a large
  free-text field like "uwagi". All are plain text with no format check, so two numbers
  or several plots fit in one field.
- The fields are saved with "Zapisz" and undone by "Anuluj", like the other project
  fields.
- They are not shown in the project list, search or calendar.
- The investment address is the project's existing "miejscowość" and "adres"; no
  second address field.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `projects`: new requirements for the project data fields and the folded "Dane
  projektu" section

## Impact

- Specs: `projects` (ADDED: Project data, Project data section). "Edit project" stays
  as it is: the new requirement states on its own that the fields are saved with
  "Zapisz".
- Code: `src/model.ts` (fields on `Project`, `emptyProject`), `src/form.tsx` (the
  section), `src/pl.ts` (labels), `src/style.css` (folding heading)
- Tests: `src/model.test.ts`
- Docs: `AGENTS.md` (domain terms, project data in "How it fits together")
- Data: the fields hold real people's contact data. They live only in the project
  files on the shared OneDrive, like addresses today. Specs, tests and commits use
  made-up names, numbers and plots only.
- No migration: a file without the fields reads them as empty and gets them when the
  project is next written.
- No new dependency
- Merge order 011, 012, 013. 011 and 012 are on `main` already.

## Decisions

Settled with the engineer on 2026-11-09 (also on the card's "Ustalenia"):

1. **One investor** per project. Several people, numbers or plots go into the same
   field as text.
2. **"Adres inwestycji" is the existing address** (city and address in "Projekt").
3. **Plain text, no links**: no format check on phone or email, no `tel:` or `mailto:`
   links.
4. **Saved with "Zapisz"**, undone by "Anuluj".
5. **Not in the list, search or calendar.**
6. **Always folded** when the form opens; the heading shows the investor when there is
   one.
7. **Out of scope**: call and mail links, several investors as separate entries, a
   shared contact book, search by investor or plot, a geoportal link for the plot.
