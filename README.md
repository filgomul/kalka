# Kalka

Planner for an architectural studio: every building project with its milestones
(concept, building-permit application, permit granted, branch designs due), lead
architect and the scope handed to branch engineers. Replaces an Excel sheet. Polish UI.

- **No server, no accounts.** The app is static HTML/JS (GitHub Pages). All data lives as
  JSON files in a folder on the studio's shared OneDrive, which the browser opens through
  the File System Access API. Chrome or Edge only.
- **This repo holds code only.** Project data (addresses, client names) never goes in.

```bash
pnpm install --ignore-scripts
pnpm dev      # http://localhost:5173
pnpm test     # node --test
pnpm build    # dist/
```

Specs and the change workflow: see [AGENTS.md](AGENTS.md) and `openspec/`.
