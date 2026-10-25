## 1. Open without a click

- [x] 1.1 `src/storage.ts`: check the remembered folder's read/write permission without prompting (`queryPermission`). Verify: `pnpm build` type-checks
- [x] 1.2 `src/main.tsx`: on start, when a folder is remembered and access is granted, load it straight away; when it fails, fall back to the "Folder no longer available" screen; show `t.loading` instead of buttons until the check is done. Verify: "storage: Access kept by the browser" and "storage: Returning user" by hand in the dev server

## 2. Verify

- [x] 2.1 `pnpm test` is green
- [x] 2.2 Verify in the running dev environment (`pnpm dev`, Chrome and Edge, a scratch data folder outside the repo): pick the folder, press F5 and see "Otwórz folder Kalka"; click it, choose "Allow on every visit", press F5 and land on the project list with no click and no button flash; remove the permission in the site settings, press F5 and see the button again; rename the scratch folder and confirm the "Folder no longer available" message
