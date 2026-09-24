# Env Guard

Purpose: detect drift between the documented environment contract and the local environment.

## WHEN this guard fires

Before running the app, deploying, or after any change that touches `.env.example`
or `.env.local`.

## WHAT to check

- Read the keys (names only, never values) from `.env.example` and `.env.local`.
- Missing keys: keys present in `.env.example` but absent from `.env.local` —
  the app may crash or silently misbehave.
- Extra keys: keys present in `.env.local` but absent from `.env.example` —
  potential drift, dead config, or an undocumented dependency.
- Never print or log the values of any key.

## Action on violation

Flag the drift. List the missing and extra key NAMES in plain language, explain that
missing keys can break the app and extra keys hide undocumented requirements, and
suggest adding missing keys to `.env.local` and documenting extra keys in
`.env.example` (with placeholder values only).
