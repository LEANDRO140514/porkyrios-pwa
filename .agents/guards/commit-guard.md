# Commit Guard

Purpose: stop secrets and broken merge state from entering git history at the commit boundary.

## WHEN this guard fires

Before any `git commit` (including `git commit -a`, amend, and commits made through tools).

## WHAT to check

Scan the staged diff (`git diff --cached`) for each of these patterns:

- `sk-` prefixed strings (API keys such as OpenAI or Stripe secret keys)
- `AKIA` prefixed strings (AWS access key ids)
- `-----BEGIN` blocks (private keys and certificates)
- Staged `.env` file paths (`.env`, `.env.local`, `.env.production`, and similar)
- `<<<<<<<` conflict markers (unresolved merges)

## Action on violation

Refuse the commit. Explain in plain language which pattern matched, in which file
and line, and why committing it is dangerous (secrets in history are exposed forever,
conflict markers break the build). Suggest unstaging the offending file or moving the
secret to an ignored `.env` file, then re-checking.
