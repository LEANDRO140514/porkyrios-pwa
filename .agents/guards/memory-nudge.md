# Memory Nudge

Purpose: make sure durable knowledge learned this session is captured before it is lost.

## WHEN this guard fires

Before ending a session, handing off, or after completing a substantial piece of work.

## WHAT to check

- Did this session reveal durable facts not yet in `.agents/memory/project.md`
  (architecture, conventions, commands, risks)?
- Did this session reveal a reusable tactic or mistake worth adding to
  `.agents/memory/patterns.json` via the improve workflow?
- Were any saved references made stale by this session's changes?

## Action on violation

Do not end the session silently. Prompt the user to run the remember workflow,
listing in plain language the specific facts worth saving. If the user declines,
respect the choice and end the session; never write to memory without confirmation.
