# Test results (real Chrome, real CDP input; not physical devices)

| Test | Before fix | After fix | Evidence |
|---|---|---|---|
| BUG-001 tower taps, mouse, 16 angles × 4 times, 1920×1080 | **0/64** | **64/64** | `evidence/bug001_baseline_mouse.json`, `bug001_fixed_mouse.json` |
| BUG-001 tower taps, touch (CDP), same matrix | — | **64/64** | `bug001_fixed_touch.json` |
| BUG-001 every visible marker, all angles/times (mouse 1920, touch 1366) | — | running | `bug001_full_*.json` |
| Master-plan gestures: drag-on-marker rotates (no open), 4 px jitter tap opens, pinch zooms (no open), touchcancel ignored | drag did **not** rotate (browser cancelled touch) | all pass, 0 console errors | `gestures_master.json` |
| BUG-002 Enter This Home: direct / next / prev / reopen, T06-B-207 + all types | **2/17** | **32/32** | `bug002_*` |
| BUG-003 security API (local wrangler + D1) | client-side SHA-256 of 4-digit PIN in bundle | **29/29** | `sec_local.json` (qa/) |
| BUG-003/006 sales UI (real long-press, typed PIN, exit, expiry, Arabic inventory, unit panel) | — | **13/13** | `sales_ui_local.json` |
| BUG-004 targets, 1920 + 390 EN | 12/20 scenes had undersized targets | 0/20 | `baseline/report.json`, screens run |

| Preview 830aa9c9: security API | — | **29/29** | `sec_preview.json` |
| Preview 830aa9c9: sales UI | — | **13/13** | `sales_ui_preview.json` |
| All scenes, 7 viewports × EN/AR (140) | — | 0 undersized, 0 h-scroll, 0 errors | `screens/report.json` |
| After phone fixes: tower taps 390 touch / 1920 mouse; Enter Home touch | — | **64/64**, **64/64**, **32/32** | `bug001_after008_*`, `bug002_after008_touch.json` |

Not yet run: preview-URL runs (push waiting on GitHub sign-in), full 7-viewport × EN/AR screenshot review, walk-viewer gesture/frame timing, idle timers, performance, soak.
