# Security

## Data

Kalka has no server and no accounts. The app is static files on GitHub Pages; the
studio's data lives only in a synced folder on the studio's own computers, opened by
the browser through the File System Access API. The repository must never contain project data
(addresses, client or contractor names, contact details). `*.csv` and `*.xlsx` are
gitignored.

Access control is whatever protects that folder. The app adds none.

## Reporting

Report a vulnerability, or any real project or personal data that ended up in the
repository or its history, privately through GitHub's
["Report a vulnerability"](https://github.com/filgomul/kalka/security/advisories/new)
form. Please do not open a public pull request or discussion with the details.

Supported version: the latest `main` (what is live on GitHub Pages).
