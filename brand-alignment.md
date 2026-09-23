# Brand Alignment — Outstanding Items

**Abwaab Brand Guidelines V.4 (2021)** — *print & social* — vs the **exported AbwaabPlus web design system** (`/docs`).

The full three-bucket review has been actioned. This document now tracks **only what is not fully reconciled**: outstanding misalignments, minor/documented nuances, the intentional deviation, and held brand assets. The applied color fixes are summarized in the banner below and listed in the appendix changelog.

---

> ## ✅ Decision taken: follow the Abwaab brand — palette reconciled
> Applied across the design system, tokens, and styleguide:
> - Primary blue **`#2563EB` → `#0655CB`**; hover **`#1D4ED8` → `#0044AE`**; navy **`#002F77`** added.
> - **Yellow `#FFCA00`** (+ gold `#D9A901`) added as the secondary / highlight color.
> - **Green / red / amber demoted to functional UI signals** (not brand); all CTAs are brand blue; savings/promo cues use brand yellow.
> - Course-header gradient → **`#0655CB → #002F77`**.
>
> These three color misalignments (blue hue, missing yellow, off-palette green) are **closed**. Everything below is what remains.

---

## Status summary

| Item | Status |
|---|---|
| Blue hue | ✅ Fixed |
| Yellow secondary/highlight | ✅ Fixed |
| Green off-palette (+ CTA color) | ✅ Fixed |
| **Subject color system** | ❌ **Outstanding** (deferred — see below) |
| Functional colors green/red/amber (+ `-dark`/`-light`/tints) | ➖ Intentional deviation — preserved (state can't be brand-only) |
| Neutral gray ramp (incl. `#D1D5DB` scrollbar) | ➖ Intentional deviation — preserved (UI depth; brand has one neutral) |
| Warning amber vs brand gold | ➖ Intentional — documented, value unchanged |
| Cool-gray surface (`#EAEDEF`) | ➖ Intentional — keep (optional swap noted) |
| Dubai font (vs DIN Next LT Arabic) | ➖ Intentional deviation |
| Line of Journey · flat icon library · logo lockup rules | ⏸ Held — brand assets, deferred |
| Graphic devices · photography · stationary · social templates | ➖ Out of scope (brand-only, print/social) |

---

## Outstanding misalignment

### Subject color system

This is the one genuine "doesn't align" item still open (deferred by choice, not yet built).

**What the brand defines.** Abwaab gives every school subject its own **color identity**: each subject = **two shades (a light + a dark)** plus a **shared cool gray** (`#E2E2E2`) used across all of them — "3 colours per subject," always on a white background, paired with a flat subject icon. Color *encodes the subject*, consistently, everywhere it appears.

| Subject | Light | Dark |
|---|---|---|
| Arabic (العربية) | `#DB3141` | `#9B0013` |
| Math (رياضيات) | `#FF7F00` | `#E54600` |
| Chemistry (كيمياء) | `#FFB703` | `#EB8200` |
| Biology (أحياء) | `#80D647` | `#48B700` |
| Geography (الجغرافيا) | `#33CC99` | `#007769` |
| English (إنجليزي) | `#1E7CD8` | `#004BA5` |
| Physics (فيزياء) | `#8E3AB5` | `#662193` |
| Psychology/Sociology (علم النفس) | `#E065B4` | `#AD2F7A` |
| Science (علوم) | `#FF8B96` | `#E25263` |
| History (التاريخ) | `#CC9999` | `#935A5A` |
| Philosophy/Logic (الفلسفة والمنطق) | `#838BA5` | `#686F8C` |

*(Shared cool gray across all subjects: `#E2E2E2`. KSA exam icons reuse Geography/Psychology pairs.)*

**What the app has.** No subject color concept. Each course carries an **arbitrary `coverColor` (hex) + `coverEmoji`**, assigned per course/teacher in mock data; teachers carry their own `avatarColor`/`avatarEmoji`. A course "cover" is an emoji on a single tinted tile. Subjects exist only as **filter labels** (كيمياء، رياضيات، فيزياء، أحياء، علوم) and as text — they have **no color**.

**Where the misalignment is — precisely:**

1. **Color is keyed to the wrong thing.** The brand keys color to the *subject*; the app keys it to the *course/teacher instance*. So two chemistry courses can be different colors, and a chemistry course can accidentally share a color with a physics one. The brand's intent — "see a color, know the subject" — is lost.
2. **The hexes are off-palette.** The app's `coverColor` values match none of the defined subject shades; they're not drawn from the brand at all.
3. **The 2-shade + shared-gray structure is missing.** The app has one flat tint per cover; the brand specifies a light shade, a dark shade, and the common `#E2E2E2` gray (used for icon fills/shadows). There's no light/dark pairing to theme with.
4. **Covers are emoji, not the brand subject icons.** The brand pairs each subject color with a flat multicolor subject icon on white; the app uses emoji glyphs. (This overlaps with the held *flat icon library* item.)
5. **Subject lists don't fully line up.** The brand defines ~11 subjects (incl. History/Clay, Philosophy/Gray, Psychology/Magenta, Geography/Turquoise); the prototype's mock data covers only a science-stream subset. A full mapping needs the complete subject list.

**To align (when picked up):** add **subject color tokens** (per subject: `light`, `dark`, + shared `#E2E2E2`) sourced from the table above; map each course's *subject* (not its instance) to those tokens and drive course covers, subject chips, and stat accents off them; ideally pair with the brand subject icons (held *flat icon library*). Contained, additive work — no conflict with the reconciled core palette. Deferred per "none for now."

---

## Intentional deviations (off-palette, preserved)

After the reconciliation, every remaining off-palette static color is **functional or neutral** — none imitate a brand color, so none were "corrected to brand." They're preserved deliberately (replacing them would destroy state meaning or flatten UI depth) and documented here. This is the complete record of intentional deviations.

- **Functional color system** — green `#22C55E`, red `#EF4444`, amber `#F59E0B`, plus their contrast variants (`-dark` text shades `#15803D` / `#B91C1C` / `#B45309`, `success-light` `#86EFAC`, and the ~10% tint surfaces). These signal success / error / warning state, which the blue + yellow brand pair cannot carry. Declared "functional, not brand" in `01-color.md` and `design-tokens.json`; preserved by design.
- **Neutral gray ramp** — a full ramp (≈gray-50 → gray-800), including surfaces `#F9FAFB`/`#F3F4F6`, border `#E5E7EB`, the **`#D1D5DB`** scrollbar thumb, and text grays `#6B7280`/`#9CA3AF`/`#1F2937`. The brand defines only one neutral (Cool Gray `#EAEDEF`); a single gray can't serve surfaces, borders, disabled, and text, so the ramp is kept.
- **Warning amber vs brand gold** — warning stays `#F59E0B`; visually close to brand gold `#D9A901`. Flagged in `01-color.md`, **not** pushed to a more distinct hue. Revisit only if warnings start to read as brand accents in context.
- **Cool-gray surface** — page `#F5F5F5` / border `#E5E7EB` kept instead of brand `#EAEDEF` (same near-white family). `#EAEDEF` noted as an optional swap for `surface/page` if exact brand-neutral matching is wanted.
- **Dubai font** instead of the brand's **DIN Next LT Arabic** — confirmed intentional for the web. The brand's *type behavior* (Regular body / Medium headers / Bold key words, numbers in English) is preserved on Dubai; only the typeface differs.

---

## Held — brand assets, deferred (not conflicts)

These are on-brand assets the app doesn't yet use. None conflict with the reconciled palette; they were explicitly held for later.

- **Line of Journey** — the signature dashed "learning path" device (4 pt stroke, dash 40 / gap 40, white on blue/yellow). Conceptually ideal for a learning app (roadmaps, progress, onboarding).
- **Flat multicolor icon & illustration library** — the brand's clean, round-edged, flat-colored icon set (with round drop-shadow) and line-art sub-topic icons (`#919191` stroke). Would replace the app's emoji covers + monochrome line icons. *(Overlaps with subject-system point #4.)*
- **Logo lockup & clear-space rules** — primary/horizontal/icon lockups, clear space, minimum size (20 mm), misuse list. The app has a logo image but no documented digital lockup/clear-space rules.

---

## Out of scope (brand-only, print/social)

Listed for completeness — no web counterpart and none expected: brand graphic devices (dash-shape, arrow-head, zig-zag, confetti, frame), photography treatment (framed photos + confetti overlays + watermark), stationary & collateral (apparel, notebooks, letterheads, envelopes, business cards, corporate footer), and social-media/product-post templates.

---

## Appendix — color reconciliation changelog (applied)

| Concept | Before (prototype) | After (brand-reconciled) |
|---|---|---|
| Primary blue | `#2563EB` | **`#0655CB`** |
| Hover/pressed blue | `#1D4ED8` | **`#0044AE`** |
| Navy (darkest) | — ("navy" token = `#2563EB`) | **`#002F77`** |
| Secondary / highlight | — (absent) | **`#FFCA00`** (+ gold `#D9A901`) |
| Course-header gradient | `#2563EB → #1D4ED8` | **`#0655CB → #002F77`** |
| Interactive `accent` role | green `#22C55E` | **brand blue** |
| CTAs (add-to-cart, pay, buy-now, register) | green | **brand blue** |
| Savings / promo cues | green | **brand yellow** |
| Green / red / amber | "semantic" | **functional UI signals only (not brand)** |
| Cool-gray surface | `#F5F5F5` / `#E5E7EB` | unchanged (see Minor) |
| Subject colors | arbitrary `coverColor` | unchanged — outstanding (see above) |
