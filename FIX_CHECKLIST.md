# ALAIA fix checklist (preview `dev-v3-stabilize`)

Status: TODO · DONE (with evidence) · BLOCKED (named input + safe fallback). Evidence lives in `docs/alaia/evidence/`.

## Asset truth table (inventory 26 Nov 2026)
| Source | What | Real? |
|---|---|---|
| `KAGGLE/renders/upload9-11` `ORB_00..15` (+`upload8/O_02`) | 16 master-plan angles, 1920×1080, one lighting | **Real** Blender renders of the model |
| `KAGGLE/renders/upload5-6` `P_st_0..2`, `P_br1liv_0..2`, `P_br1bed_0..2`, `P_corr_0..2`, `P_balc_0..2` | Wide interior/corridor/balcony renders 2100×900 | **Real** Blender renders |
| `KAGGLE/renders/upload2` `I_br1_bed_0/180/270`, `I_br1_living_0` | 1BR interiors 1600×900 | **Real** |
| `KAGGLE/renders/upload8` `PLAN_st/br1/br2` | Furnished unit plans | **Real** |
| `KAGGLE/renders/upload3/6` `elev_base`, `E_elev` | Elevations (one type each) | **Real** |
| `KAGGLE/renders/upload7` `bf_T06_a_F0..4` | Tower 06 side A views G–4 | **Real** |
| `KAGGLE/ai/ALAIA_AI_*`, `_HF_UPLOAD_orbit`, site `ai/orb_*`, `ai/oc/*.mp4`, `ai/walk/*`, `ai/res/*` | Restyled stills, orbit clips, walk stills/clips, dollhouse/lift/dive | **Generated** (AI) |
| site `views/bf_T06_a_*` | Window views | Real render **with added people** (edited) → replaced by original for T06 |
| site `views/bf_T{other}_*` | Window views other towers | Render-style, no raw originals found → unverified |
| 2BR interior | — | **None real** |

## Phase A
- [ ] A1 Dock reserve, bottom-sheet snap/drag, sticky primary action, coverage script incl. off-viewport primary + scroll rows, touch flow tower→Floor 1→unit→Open this home
- [ ] A2 Selection survives resize/rotation (390↔844, 820↔1180 on tower/floor/unit)
- [ ] A3 Hooks only on localhost; delete `sha()`
## Phase B
- [ ] B4 Remove generated interiors/transitions; real renders + plan; 2BR "coming soon" + plan; no page reveal; no double exposure; room/bath counts vs plan
- [ ] B5 Film stall root cause + fix
- [ ] B6 Layout/touch all viewports
## Phase C
- [ ] C7 Master plan: no video; real ORB renders 200 ms crossfade; Kaggle instructions for 72-frame sequence
## Phase D
- [ ] D8 Elevation per type · [ ] D9 A-/B- unit labels · [ ] D10 Gallery thumbnails · [ ] D11 One scene at a time · [ ] D12 Lift fit/skip · [ ] D13 Amenities markers + list · [ ] D14 Active tab from scene · [ ] D15 "El Hammam", "47 Hotel"
