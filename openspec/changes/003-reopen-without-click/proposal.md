## Why

After a browser refresh (F5) Kalka always shows "Otwórz folder Kalka" and waits for a
click, even though the folder never changes. Users refresh with the browser instead of
"Odśwież" and then get stuck on the start screen. Chrome and Edge can keep the folder
permission across visits ("Allow on every visit"), but Kalka never checks for it.

## What Changes

- On start, when a folder is remembered and the browser still grants read and write
  access to it, Kalka opens it straight away and shows the project list.
- When the browser did not keep the permission, nothing changes: one click on
  "Otwórz folder Kalka" and the browser's permission prompt, where the user can pick
  "Allow on every visit" so later refreshes need no click.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `storage`: reopening the remembered folder needs no click when the browser kept the
  permission

## Impact

- Specs: `storage` (MODIFIED: reopen data folder)
- Code: `src/storage.ts` (check the remembered folder's permission without prompting),
  `src/main.tsx` (open on start when it is granted; no button flash while checking)
- Tests: none new; the check sits in the browser start-up path, verified by hand
- Browsers: the "Allow on every visit" choice exists only in recent Chrome and Edge;
  older versions keep today's one-click behaviour

## Decisions

Settled with the engineer on 2026-10-25:

1. **No setting or new button.** Kalka asks the browser whether access is still
   granted and uses it if so; the choice to keep access is the browser's own prompt.
2. **Separate from change 002**, in its own branch and PR.
