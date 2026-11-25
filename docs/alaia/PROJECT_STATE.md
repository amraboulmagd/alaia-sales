# Project state — 25 Nov 2026

**Branch** `dev/v3-stabilize` (commits after `c34cfee`). **Production** unchanged.

## Done (with evidence)
- BUG-001 root cause: `setPointerCapture` retargets `pointerup` to the frame, so `e.target.closest('[data-b]')` was null → taps never opened a tower. Fix: resolve tower at pointer-down via `elementFromPoint`, confirm at release, ignore moved/multi-touch/cancelled gestures.
- BUG-007 (master plan): no `touch-action:none` → browser fired `pointercancel` on finger drag; fixed. Zero-size layout produced `Infinity` marker coordinates; guarded.
- BUG-002 root cause: `$('#dh-in')` bound the handler to the outgoing frame's button (duplicate id during the 1.2 s crossfade). Fix: bind inside the new frame; outgoing frames are made inert and lose ids. Lift overlay stops catching taps when dismissed.
- BUG-003: PIN hash and console `setAdmin` removed from the public bundle; server login (PBKDF2, 6–10 digits), lockout (5/IP, 25 global per 15 min), HttpOnly/Secure/SameSite=Strict session (10 min idle, 12 h max), CSRF header + origin check, logout invalidates server-side, inventory + leads on D1, docs/functions paths blocked publicly.
- BUG-004: 56/64 px kiosk, 44 px tablet/phone hit areas; invisible larger hit rects on map markers.
- BUG-005: media audited (contact sheets); every interior is a typical-type illustrative render with generic window views; persistent EN/AR disclosure; node labels corrected (no node showed an entrance).
- BUG-006: exit/expiry close all protected UI and end the server session; inventory modal fully Arabic; sticky prev/next; scroll reset verified.
- Lead flow: confirmation now says "Request received" only when the server stored it; offline → "Saved on this screen" + automatic retry. Engaz claims made truthful.

## Next actions
1. Amr completes GitHub sign-in → push → verify preview with `sec_api.js`, `sales_ui.js`, `bug001/002`.
2. Review 7-viewport × EN/AR screenshots (BUG-008) and fix layout issues.
3. Walk-viewer gestures + frame timing, idle timers, floor-plan checks, performance baseline.
4. Phase 2 (finder, shortlist/compare, deep links/QR) after Phase 1 is VERIFIED.

## Pending decisions for Amr
- Production promotion + production D1/PIN setup (approval).
- GitHub sign-in on this PC.
