# ALAIA — Session handoff (V3 directive)

Read this first. No secret values here. Requirements: `REQUIREMENTS_MATRIX.json` (run `node qa/check_matrix.js`).

## Where things are
| What | Path |
|---|---|
| Workspace | `C:\ALAIA — Sales Experience` |
| Site source (git, branch `dev/v3-stabilize`) | `deploy/` — the built `index.html` is now the editable source |
| Server code (Cloudflare Pages Functions) | `deploy/functions/` (`_shared.js`, `api/leads.js`, `api/inventory.js`, `api/staff/{login,logout,session,inventory,leads}.js`, `_middleware.js`) |
| QA scripts | `qa/` (`lib.js`, `bug001_towers.js`, `bug002_enter.js`, `gestures_master.js`, `gestures_walk.js`, `sec_api.js`, `sales_ui.js`, `scenes.js`, `contact.js`, `check_matrix.js`) |
| Applied patches (reproducible record) | `tools/patch_003_auth.py`, `patch_004_targets.py`, `patch_005_media.py` (BUG-001/002/006/007 edits were inline; see git history) |
| Old source snapshot | `src/` (copied from `_handoff_src`) |
| Image evidence, deliverables | `C:\Users\amrab\Downloads\ALAIA\` |
| JSON evidence | `deploy/docs/alaia/evidence/` |

## Run locally
- Static: `python -m http.server 8791` in `deploy/`.
- With Functions + local D1: `qa\node_modules\.bin\wrangler pages dev . --port 8792 --d1 DB=alaia-local` in `deploy/` (needs `deploy/.dev.vars`, git-ignored, local test PIN only).
- Tests use the installed Google Chrome (H.264 capable) through `playwright-core`, with real CDP mouse/touch input.

## Deployment
- Production: `main` → https://alaia-sales.pages.dev (deployment `1e555b04`, commit `c34cfee`) — **untouched**.
- Preview: branch `dev/v3-stabilize` → `https://dev-v3-stabilize.alaia-sales.pages.dev` once pushed.
- Preview env: D1 `alaia-preview` bound as `DB`, secrets `STAFF_PIN_SALT`/`STAFF_PIN_HASH`. Preview PIN is in `C:\ALAIA — Sales Experience\PRIVATE_preview_staff_pin.txt` (not in git).
- **Production has no D1 or PIN secrets.** Before merging to `main`: create D1 `alaia-prod`, bind as `DB` in production config, set production PIN secrets (new PIN, ≥6 digits). Otherwise sales login returns 503.
- Rollback: Cloudflare Pages → Deployments → previous production deployment → "Rollback", or `git revert` on `main`.

## Status
See `PROJECT_STATE.md` and `TEST_RESULTS.md`.
