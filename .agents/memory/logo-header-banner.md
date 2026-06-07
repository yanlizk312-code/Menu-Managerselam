---
name: Logo header banner (decouple text size from header height)
description: How the customer menu header shows food + gold AL-RISALA text, and why the source is a tall 2:1 banner
---

# Customer menu header banner

The customer menu header (`menu.tsx`, the `restaurantLogo` block) shows a food photo with
a dark scrim and large gold "AL-RISALA" wordmark + "RESTAURANT" subtitle. Displayed with
`object-fit: cover` inside a div whose `aspectRatio` is tuned for height.

## The core trap: text size is coupled to header height
With a single cover image, shrinking the container `aspectRatio` (making the header taller)
zooms the image to fill height, so the **gold text gets bigger too**. The user repeatedly
asked for "bigger area, same text size" — impossible with a short source image via CSS alone.

**Decision:** make the SOURCE banner tall (ratio ~2.0, 1840x920), with the text sized for the
desired on-screen width. Then keep the display container ratio >= source ratio (e.g. 2.3–2.5).
In that regime `cover` is **width-driven** (scale = containerWidth/1840, constant), so the text
on-screen size is FIXED regardless of header height — changing `aspectRatio` only reveals more
or less food top/bottom. This fully decouples header height from text size. Smaller display
ratio = taller header; text never changes as long as ratio stays >= ~2.0.

## How to regenerate the banner
- Generator script: `make-banner.mjs` at workspace ROOT. Composites a transparent SVG overlay
  (dark radial scrim + gold emblem rings/cloche/cutlery + AL-RISALA + RESTAURANT) over the
  clean food photo with `sharp`.
- Base food photo: `attached_assets/food-bg.png` (CLEAN food, no logo). Do NOT use
  `al-risala-banner.png` — it has an old ghost logo/border baked in.
- `sharp` is NOT an app dep: `pnpm add -w sharp`, run `node make-banner.mjs`, then
  `pnpm remove -w sharp`. Only DejaVu Serif/Sans fonts exist (no Arabic). generateImage renders
  text unreliably — that's why text is SVG vector, not AI.
- Output is now `.webp` (quality 80, ~138KB, was 195KB JPEG / 3.2MB PNG). The upload route
  (`db.ts` uploadLogoToSupabase/uploadImageToSupabase) maps `.webp` → `image/webp` content-type;
  if you add new formats, extend those ternaries or Supabase serves the wrong MIME.
- Upload result: `curl -s -X POST http://localhost:80/api/upload/logo -H "Authorization: Bearer admin-token-alrisala" -F "image=@attached_assets/al-risala-logo.webp"`
  → Supabase logos bucket, persists to app_settings key `logo`, returns a `?v=timestamp` cache-buster.

**Why:** user rejected blur-fill and bright photos; settled on darkened food + large gold text,
and iterated many times on header height while demanding the text stay the same size. The tall
source is the only clean way to satisfy both (no letterbox bands, no side-crop of the wordmark).
