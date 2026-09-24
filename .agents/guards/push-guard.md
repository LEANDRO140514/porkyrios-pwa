# Push Guard

Purpose: catch secrets that escaped commit-guard before they reach a remote. This is
the second gate after commit-guard.

## WHEN this guard fires

Before any `git push` (including force pushes and pushes of new branches).

## WHAT to check

Scan the commit history about to be pushed (`git log -p @{upstream}..HEAD`, or the
full branch history for new branches) for:

- `sk-` prefixed strings (API keys)
- `AKIA` prefixed strings (AWS access key ids)
- `-----BEGIN` blocks (private keys and certificates)
- Committed `.env` file contents
- Any credential-looking string added in a commit and later deleted (it is still in history)

## Action on violation

Refuse the push. Explain in plain language which commit contains the secret and that
pushing publishes the entire history, not just the final state. Suggest rewriting the
offending commits (interactive rebase or a history rewrite tool) and rotating the
exposed credential before pushing.
