# Logo & Identity

**Tier: Universal foundation.**

The Abwaab logo is supplied as fixed artwork in [`../identity/`](../identity/). Always use these files. Never redraw, rebuild or retype the mark. Agents connected to the `abwaab-design` MCP server can get any variant (path, metadata, or an inline data URI) with the `get_logo` tool.

---

## Assets

All files are PNG with a transparent background.

| Variant id | File | Lockup | Source px | Aspect (w:h) | Background |
|---|---|---|---|---|---|
| `horizontal` | `identity/logo.png` | Arabic wordmark "ابواب" · icon · Latin wordmark "abwaab" in one row | 1080 × 278 | ≈ 3.9 : 1 | Light (white / `#F5F5F5`) |
| `vertical` | `identity/logo-vertical.png` | Icon stacked over "abwaab" over "ابواب" | 919 × 1080 | ≈ 0.85 : 1 | Light (white / `#F5F5F5`) |
| `icon` | `identity/logo-icon.png` | Icon only (blue + yellow book/door) | 451 × 500 | ≈ 0.9 : 1 | Light (white / `#F5F5F5`) |
| `icon-white` | `identity/logo-icon-white.png` | Icon only, solid white knockout | 451 × 500 | ≈ 0.9 : 1 | Brand blue `#0655CB`, navy `#002F77`, course-header gradient |

---

## Which variant to use

1. **Horizontal (`logo.png`) is the default.** Use it in the TopBar, page and document headers, email and report headers, and any wide, short slot.
2. **Vertical (`logo-vertical.png`)** is for centered, roughly square slots: the splash screen, hero or welcome moments, empty states that show the brand, and cover or title slides.
3. **Icon (`logo-icon.png`)** is for tight spaces where the wordmark would fall below its minimum size, plus favicon, app icon, small badges and system avatars.
4. **Icon white (`logo-icon-white.png`)** is for any brand-colored surface: the auth screens (full-bleed brand blue), navy panels, and the course-header gradient.

Quick picker:

| Surface | Wide slot | Square / centered slot | Tiny (< 24 px tall) |
|---|---|---|---|
| White / `#F5F5F5` | `horizontal` | `vertical` | `icon` |
| Brand blue / navy / gradient | `icon-white` | `icon-white` | `icon-white` |

## Backgrounds

- Place the **full-color** variants (`horizontal`, `vertical`, `icon`) only on **white `#FFFFFF`** or the **page gray `#F5F5F5`**. The navy wordmark and blue panel of the icon disappear on blue.
- On **brand blue `#0655CB`, navy `#002F77`, or the course-header gradient**, use only **`icon-white`**.
- **Never** place the logo on brand yellow `#FFCA00`, on functional colors (green / red / amber), or on photos and busy imagery.
- ⚠ **There is no white (knockout) horizontal or vertical lockup.** On blue surfaces, use `icon-white` by itself. Don't fake a white wordmark with CSS filters (`brightness(0) invert(1)`) or by recoloring the PNG. If a white lockup is needed, request it from the brand team.

## Clear space & minimum size

- **Clear space:** at least **25% of the logo's rendered height** empty on every side. Keep text, icons, container edges and other marks out of it. For example, a 36 px tall TopBar logo needs 9 px free around it.
- **Minimum rendered height:** `horizontal` **24 px**, `vertical` **64 px**, `icon` / `icon-white` **16 px**. Below these sizes, switch to the next smaller variant (horizontal/vertical → icon).
- Don't render any file larger than its source size. The files are raster, so upscaling blurs them.

## Standard placements in the student app

| Placement | Variant | Rendered height |
|---|---|---|
| TopBar (`showLogo`) | `horizontal` | 36 px (≈ 140 px wide) |
| Auth screens (above the card, on brand blue) | `icon-white` | 64 px |
| Splash `/` (on `#F5F5F5`) | `vertical` | 120 px (≈ 102 px wide) |

## Don'ts

- Don't redraw the logo in SVG, CSS, canvas or emoji (📚 is not a stand-in), and don't re-typeset "ابواب" / "abwaab" in Dubai or any other font.
- Don't recolor, tint, add gradients, change opacity, or apply filters.
- Don't stretch, squash, rotate or skew it. Scale it proportionally only.
- Don't add shadows, outlines, glows or a container shape (circle, card) behind the mark itself.
- Don't crop or rearrange the lockup, for example by taking the wordmark without the icon or swapping the Arabic and Latin sides.
- **Don't mirror it for RTL.** The lockup is fixed artwork. In `dir="rtl"` layouts it keeps its orientation, so never apply `scaleX(-1)` or treat it as a directional icon.
- Don't append "بلس" / "Plus" or any other text to the mark. If the product name "أبواب بلس" is needed, set it as separate text with its own clear space.

## Implementation

- Set **height only** and let width follow (`height: 36px; width: auto;`). Never set both.
- Alt text: `alt="أبواب"`. When the logo is a home link, the link's accessible name is "الرئيسية".
- **Stacks with a codebase:** copy the needed file(s) from `identity/` into the app's static assets and reference them from there.
- **Standalone HTML artifacts, emails and slides** that can't reference this repo: inline the file as a data URI (`get_logo` with `embed: true` returns `data:image/png;base64,…`), or upload it as a file next to the page.
