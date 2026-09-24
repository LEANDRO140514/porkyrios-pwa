# Fragile Guard

Purpose: protect files the project has marked hands-off from accidental edits.

## WHEN this guard fires

Before editing any file listed in `.agents/memory/project.md` under a
"## Hands-Off Files" section.

## WHAT to check

- Read `.agents/memory/project.md` and locate the "## Hands-Off Files" section.
  If the section is absent, this guard passes.
- Compare every file about to be edited against the listed paths and globs.
- For each match, note any reason recorded next to the entry.

## Action on violation

Do not edit silently. Warn in plain language that the file is marked hands-off,
state the recorded reason if one exists, and ask for explicit confirmation before
touching it. If the user declines, leave the file unchanged and propose an
alternative approach that avoids it.
