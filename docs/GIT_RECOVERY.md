# Git recovery (Chunk 0) — 2026-09-03

## Symptom

Local object store was incomplete: `git diff` failed (`unable to read` blob), `git fsck` reported missing `.gitmodules` / `.gitattributes` blobs and invalid reflog entries for deleted commits. `git status` and `git log` still worked against `origin/main` at `e68a503`.

## Non-destructive recovery performed

1. **Preserve** full working tree (excluding heavy deps) to  
   `D:\dev\htdocs\_ulnovatech_preserve_20260903-202635`
2. **Fresh clone** with submodules to  
   `D:\dev\htdocs\_ulnovatech_fresh_b_20260903`  
   (HEAD matched: `e68a50310f4833fbfb2472eed5c7a50d919d7316`)
3. **Object restore**: pack/objects from the fresh clone were copied into the workspace `.git` (in-place rename of `.git` was locked by another process). Working tree files were **not** replaced.
4. **Reflog**: `git reflog expire --expire=now --all` cleared invalid reflog entries.
5. **Noise cleanup**:
   - Restored `sleekly-dash/backend/vendor` phantom “modified” entries (content matched HEAD).
   - Checked out ~812 CRLF/stat-only phantoms that had empty content diffs.
6. **Junk removed** (also present under preserve if needed):
   - `_deploy_tmp/`
   - Orphan hashed Vite assets under `assets/`, `dash/assets/`, `portfolio-app/assets/`, `blog/uln-blog-app/assets/` (untracked only; one tracked file restored from HEAD after accidental delete)
   - Duplicate untracked `portfolio/*.webflow.io/` trees (canonical copies remain under `portfolio/portfolio/`)

## Verification (post-recovery)

| Check | Result |
| --- | --- |
| `git fsck --full --no-dangling` | exit 0 |
| `git diff HEAD` | works |
| `git status` | works |
| `git submodule status` | `sleekly-blog` @ `c419323` |
| HEAD | `e68a503` = `origin/main` |

## Residual / do not delete yet

| Path | Role |
| --- | --- |
| `D:\dev\htdocs\_ulnovatech_preserve_20260903-202635` | Forensic backup of pre-recovery tree + damaged objects |
| `D:\dev\htdocs\_ulnovatech_fresh_b_20260903` | Clean reference clone |
| `D:\dev\htdocs\_ulnovatech_fresh_20260903-202635` | Failed partial clone (safe to delete when unlocked) |

Keep preserve + fresh clone until Chunks 1–3 have landed and a push/backup exists. Then delete manually.

## Follow-up hygiene (not Chunk 0 commits)

- Prefer `core.autocrlf=true` on Windows or `.gitattributes` for text to avoid phantom dirty trees after object store swaps.
- Do not commit `ulndash/`, `uln-blog/`, `marketing/.env.production`, or `infra/secrets/*` (see `.gitignore` updates).
- Partition of remaining dirty paths: [`WORKING_TREE_PARTITION.md`](WORKING_TREE_PARTITION.md).
