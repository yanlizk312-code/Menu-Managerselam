---
name: Logo header banner (square→wide)
description: How the customer menu header fills edge-to-edge with a square logo, no blur, no crop
---

# Square logo in a wide header

The customer menu header (`menu.tsx`) must show the AL-RISALA logo edge-to-edge with no
empty sides, no blur, and no cropping of the emblem. The source logo is square (~1:1),
which cannot satisfy all three at once via CSS alone.

**Decision:** pre-process the square logo into a wide banner (ratio ~1.84:1) using a
mirrored edge-extension, then display it with `object-fit: cover` at that aspect ratio.

**How to apply:** extract the left/right food-only strips of the square logo (~26% width,
emblem is centered), `flop()` (horizontal flip) each, resize to side panels (~42% each),
and composite the full logo in the center. The flip makes the seam at the center-logo edge
seamless (mirror reflection). Done with `sharp` as a one-off script; upload result via
`POST /api/upload/logo` (Bearer `admin-token-alrisala`) which stores it in Supabase.

**Why:** user explicitly rejected both blur-fill (sides looked dark/empty) and object-cover
on the raw square (cropped the top مطعم arch and bottom الرسالة calligraphy). A genuinely
wide image is the only way to get full-bleed + full-emblem + no-blur simultaneously.
