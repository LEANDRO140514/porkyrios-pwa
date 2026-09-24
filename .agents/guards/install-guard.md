# Install Guard

Purpose: block typosquatting and suspicious packages before they enter the dependency tree.

## WHEN this guard fires

Before any `npm install`, `yarn add`, or `pnpm add` of a package that is NOT
already in `package.json`.

## WHAT to check

For each new package name:

- Typosquatting: is the name within a close edit distance (1-2 characters) of a
  popular package (`react`, `express`, `lodash`, `axios`, `chalk`, and similar)?
  Examples: `expresss`, `lodahs`, `crossenv`.
- Suspicious signals: very low download count, brand-new publish date, no repository
  link, install scripts (`preinstall`/`postinstall`) in a trivial package, or a name
  mimicking an internal/scoped package.
- Intent match: does the name the user typed match the package they described wanting?

## Action on violation

Refuse the install. Explain in plain language which popular package the name resembles
or which suspicious signal was found, and why malicious packages run code on install.
Suggest the likely intended package name and ask the user to confirm before proceeding.
