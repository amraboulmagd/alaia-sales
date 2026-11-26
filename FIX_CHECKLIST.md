# ALAIA fix checklist (preview `dev-v3-stabilize`, last verified deployment `aee15e31`, commit `7ecc05e`)

DONE = test output + screenshot in `docs/alaia/evidence/` (images in `Downloads\ALAIA\evidence\`). Real Chrome (H.264, video on), Chromium + WebKit 27.2 for layout. Touch = CDP touch emulation, not physical devices.

| Item | Status | Evidence |
|---|---|---|
| A1 Dock/sheet/primary action | DONE | Coverage audit after last commit: 160 large + 160 small scenes and 160 phone re-run, 0 covered / 0 off-screen primary / 0 unscrollable (`final_audit_a.json`, `final_audit_b.json`, `fa_ph`); touch flow tower→Floor 1→unit→Open this home 10/10 (5 sizes × EN/AR, `final_flows.jsonl`); sheet drag/tap 3/3 (`final_sheet_drag.jsonl`) |
| A2 Selection kept on rotation | DONE | 12/12 (`final_rotate.json`) |
| A3 Hooks localhost-only, `sha()` deleted | DONE | Preview: `__alaia`/`__alaiaK`/`__orbSet` undefined, `?debug=1` ignored, Sales mode works via UI (`final_preview_nohooks.json`). `sha()` had no callers. |
| B4 Generated interiors removed | DONE (2BR BLOCKED) | All AI walk/dollhouse/lift/dive/room media deleted; 3 real 360° panoramas joined from real render slices (overlap 735–736 px measured, `b4_stitch.jsonl`); real plans; gallery = original renders; T06 views = unedited originals (`b4_walk_check.json`). 2BR: no real interior render → plan + "coming soon". |
| B5 Film hangs | DONE | Root cause: Cloudflare Pages answers Range with full 200 → seeks fail. Middleware serves 206; keyframes every 1 s + every chapter (was 10.4 s). Preview: first motion 417–579 ms, 0 stalls, 20 rapid Next/Prev in sync (`b5_film_preview.jsonl`). Throttled 4 Mbps phone: 1.7 s. |
| B6 Layout all viewports | DONE (emulation) | 10 viewports × EN/AR audit clean; WebKit 3 viewports clean (`final_webkit.json`) |
| C7 Master plan | PARTIAL / BLOCKED | Done: no `<video>`; 16 real renders, anchors verified (`c7_contact_sheet_real_orbit_with_anchors.jpg`); every on-screen tower has a pill, 0 crossing lines, 0 hit overlaps at 4 sizes (`c7_orbit_check.json`); drag response 1–11 ms; taps 804/804 mouse 1920, 288/288 touch 390, 64/64 at 1300 and 820. Blocked: 72-frame sequence needs a Kaggle render (`docs/alaia/KAGGLE_ORBIT_72.md`); other times of day hidden (no real renders). |
| D8 Elevation per type | DONE (fallback) | Schematic from developer floor data, correct floor count/hit areas per type (`d_checks.json`, `d8_tower*.png`). Real per-type elevation renders not available. |
| D9 A-/B- labels | DONE | `A-201…` (`d_checks.json`); floor hover tooltip removed |
| D10 Gallery tiles | DONE | 0 blank tiles, 11/11 loaded after filter switching |
| D11 One scene at a time | IMPLEMENTED, NOT MEASURED | Outgoing frame fades in 0.18 s before incoming starts |
| D12 Lift | DONE by removal | AI lift clip removed with B4; unit opens directly on the real plan |
| D13 Amenities | DONE | 44 px pins, 8 named rows, real amenity renders A1–A8 |
| D14 Active tab | DONE | Towers on tower/floor/unit, Amenities only on its plan |
| D15 Text | DONE | "El Hammam" everywhere; "47" labelled "Hotel rooms" (from existing project data "47 rooms · ground + 4") |

Still needs a physical check: iPhone/Android Safari/Chrome touch feel, iPad Safari, the 1920 kiosk touch panel, the laptop with the download-manager extension.
