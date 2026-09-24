---
name: new
description: Use when the user wants to create a custom slash command owned by the project, not by SlashStack.
---

# new

## Purpose

Create a custom user-owned slash command that survives SlashStack update and uninstall.

## When to Use

Use when the user wants to create a custom slash command owned by the project, not by SlashStack.

## Workflow

1. Guide naming: ask for a short kebab-case name that does not collide with any
   installed SlashStack skill, and a one-sentence purpose.
2. Draft the skill: write a `SKILL.md` with frontmatter (name, description) and
   Purpose, When to Use, Workflow, and Output sections matching the user's intent.
3. Write it as a USER skill: create `<skills dir>/<name>/SKILL.md` in the same
   skills directory SlashStack uses. Do NOT add it to the manifest's
   `managedSkills` — user skills are owned by the user, not by SlashStack.
4. Confirm ownership: explain that because the skill is not in `managedSkills`,
   `slashstack update` will not overwrite it and `slashstack uninstall` will
   not remove it.
5. Verify: read the file back and confirm it renders the expected sections.

## Output

A new user skill containing:
- Path: the created `SKILL.md` location
- Ownership: confirmation the skill is user-owned and absent from managedSkills
- Survival guarantee: statement that it survives update and uninstall
- Usage: how to invoke the new command
