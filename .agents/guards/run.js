#!/usr/bin/env node
/**
 * SlashStack Guard Runner
 *
 * This script scans staged or pushed Git content for security violations.
 * It is invoked by pre-commit and pre-push hooks installed by SlashStack.
 *
 * Mode: commit | push
 * - commit: scans staged files (git diff --cached)
 * - push: scans outgoing commits (requires commit range argument)
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const mode = process.argv[2];

if (mode !== "commit" && mode !== "push") {
  console.error("Usage: run.js <commit|push>");
  process.exit(1);
}

// SlashStack-owned paths that ship with the install. Guard docs reference the
// patterns they scan for (e.g. <<<<<<<) so installing/committing/pushing the
// SlashStack tree itself would otherwise self-block. User-editable paths under
// .agents/memory and .agents/references are still scanned.
const isSlashStackOwned = (file) =>
  file === "AGENTS.md" ||
  file.startsWith(".agents/guards/") ||
  file.startsWith(".agents/skills/");

function runGit(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8" });
  } catch (error) {
    console.error("Git command failed:", error.stderr?.trim() || error.message);
    process.exit(1);
  }
}

// Like runGit but throws on failure so the caller can decide whether to
// fail closed, continue, or otherwise recover. Use this inside try/catch
// blocks where the runner needs to make the call.
function runGitOrThrow(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function getRepoRoot() {
  return runGit(["rev-parse", "--show-toplevel"]).trim();
}

function scanForSecrets(filePath, content) {
  const SECRET_PATTERNS = [
    {
      category: "env-file",
      regex: /\.env$/,
      message: "Environment file staged for commit",
    },
    {
      category: "conflict-marker",
      regex: /<{7}/,
      message: "Conflict markers detected in staged content",
    },
    {
      category: "private-key",
      regex: /-----BEGIN\\s+(?:RSA\\s+)?PRIVATE\\s+KEY-----/,
      message: "Possible private key in staged content",
    },
    {
      category: "credential-prefix",
      regex: /sk[-_](?:test|live)[_-][A-Za-z0-9]+/,
      message: "Possible API credential in staged content",
    },
    {
      category: "credential-prefix",
      regex: /AKIA[A-Z0-9]+/,
      message: "Possible API credential in staged content",
    },
    {
      category: "credential-prefix",
      regex: /gh[pou]_[A-Za-z0-9]{10,}/,
      message: "Possible API credential in staged content",
    },
    {
      category: "credential-prefix",
      regex: /xoxb[-_][A-Za-z0-9_-]{10,}/,
      message: "Possible API credential in staged content",
    },
    {
      category: "credential-prefix",
      regex: /xoxp[-_][A-Za-z0-9_-]{10,}/,
      message: "Possible API credential in staged content",
    },
  ];

  const violations = [];

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.category === "env-file") {
      if (pattern.regex.test(filePath)) {
        violations.push({
          category: pattern.category,
          file: filePath,
          message: pattern.message,
        });
      }
    } else {
      if (pattern.regex.test(content)) {
        violations.push({
          category: pattern.category,
          file: filePath,
          message: pattern.message,
        });
      }
    }
  }

  return violations;
}

if (mode === "commit") {
  const repoRoot = getRepoRoot();
  const stagedFiles = runGit(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]).trim().split("\n").filter(Boolean);

  let hasViolations = false;

  for (const file of stagedFiles) {
    if (isSlashStackOwned(file)) continue;

    const fullPath = join(repoRoot, file);
    if (!existsSync(fullPath)) continue;

    try {
      const content = runGit(["diff", "--cached", "--no-ext-diff", "-U0", "--", file]);
      const violations = scanForSecrets(file, content);

      for (const violation of violations) {
        hasViolations = true;
        console.error(`Guard blocked: ${violation.file} - ${violation.message}`);
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }

  if (hasViolations) {
    console.error("");
    console.error("Commit blocked by SlashStack guards.");
    console.error("Unstage or fix the violating files, then commit again.");
    console.error("");
    console.error("To bypass (not recommended): git commit --no-verify");
    process.exit(1);
  }

  process.exit(0);
}

if (mode === "push") {
  // Push mode: read refs from stdin (format: local_ref local_sha remote_ref remote_sha).
  // process.stdin.read() is non-blocking and returns null when no data is
  // buffered yet, which silently allows every push. Read FD 0 synchronously.
  const stdin = readFileSync(0, "utf8") || "";

  if (!stdin) {
    // No refs to push, allow
    process.exit(0);
  }

  const lines = stdin.trim().split("\n").filter(Boolean);
  let hasViolations = false;

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length < 4) continue;

    const [localRef, localSha, remoteRef, remoteSha] = parts;

    let commitsToScan = [];

    if (remoteSha === "0000000000000000000000000000000000000000") {
      // New branch: scan all commits reachable from local_sha
      try {
        commitsToScan = runGitOrThrow(["rev-list", localSha]).trim().split("\n").filter(Boolean);
      } catch (error) {
        // Fail closed: if we cannot enumerate the commits to scan, we
        // cannot prove they are safe to push.
        console.error(`Guard failed to enumerate commits for ${localRef}: ${error.message}`);
        process.exit(1);
      }
    } else {
      // Existing branch: scan commits since remote_sha
      try {
        commitsToScan = runGitOrThrow(["rev-list", `${remoteSha}..${localSha}`]).trim().split("\n").filter(Boolean);
      } catch (error) {
        console.error(`Guard failed to enumerate commits for ${localRef}: ${error.message}`);
        process.exit(1);
      }
    }

    for (const commit of commitsToScan) {
      // Scan per-file with the same allowlist used by pre-commit. Pushing
      // the whole commit blob as one content loses file identity, so the
      // SlashStack tree itself would self-block on its own commit-guard.md.
      let changedFiles;
      try {
        changedFiles = runGitOrThrow(["show", "--name-only", "--format=", commit])
          .trim()
          .split("\n")
          .filter(Boolean);
      } catch (error) {
        // Fail closed: if we cannot enumerate the changed files we cannot
        // guarantee the commit is safe to push.
        console.error(`Guard failed to inspect commit ${commit.slice(0, 7)}: ${error.message}`);
        process.exit(1);
      }

      for (const file of changedFiles) {
        if (isSlashStackOwned(file)) continue;

        let content;
        try {
          content = runGitOrThrow(["show", `${commit}:${file}`]);
        } catch {
          // Binary file or deleted in this commit — nothing to scan.
          continue;
        }

        const violations = scanForSecrets(file, content);
        for (const violation of violations) {
          hasViolations = true;
          console.error(`Guard blocked: ${violation.file} - ${violation.message}`);
        }
      }
    }
  }

  if (hasViolations) {
    console.error("");
    console.error("Push blocked by SlashStack guards.");
    console.error("Secrets detected in outgoing commits.");
    console.error("Rewrite history to remove them, then rotate credentials.");
    process.exit(1);
  }

  process.exit(0);
}
