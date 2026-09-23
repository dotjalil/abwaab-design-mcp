# Typography

**Tier: Universal foundation.**

---

## Typeface

**Dubai** is the only typeface, used for both Arabic and Latin glyphs. It must be used exclusively — no system-font fallback should appear in visible UI (a generic `sans-serif` is acceptable only as the invisible loading fallback).

Dubai is loaded as four local weights:

| Weight name | Numeric | Use |
|---|---|---|
| Light | 300 | Rare; large decorative numerals only |
| Regular | 400 | Body text, secondary text, most labels |
| Medium | 500 | Emphasised body, control labels, completed-item titles |
| Bold | 700 | Headings, names, CTA text, values, unread items, active nav |

> **Gap to fix:** several components request **600 (semibold)** but no 600 file is shipped, so the browser synthesizes it. The new build should either ship a real Dubai Semibold 600 or map all "semibold" usages to **700**. Treat "semibold" in this doc as "≈ 700".

Font smoothing: antialiased.

---

## Type scale

Sizes observed in the prototype, organized into a usable scale. Sizes are in **px**; use the role, not the raw number, when possible.

| Role | Size | Weight | Line height | Where |
|---|---|---|---|---|
| Display | **24 px** (`2xl`) | 700 | tight (~1.1) | Splash brand, success screen title, big score numbers, OTP input |
| Title / H2 | **18–20 px** (`lg`–`xl`) | 700 | tight | Screen section headers, card hero titles, dialog title (18), bundle title (20) |
| Card heading / H3-H4 | **14 px** (`sm`) | 700 | snug | Card titles, course titles, section titles, chat names |
| Body | **14–16 px** (`sm`–`base`) | 400–500 | normal (~1.5) | Message text, list item text, input text (16 on mobile, 14 ≥ desktop) |
| Label | **12 px** (`xs`) | 400–700 | normal | Field labels, meta, captions, badges, chips |
| Micro / Meta | **10–11 px** (`[10px]`/`[11px]`) | 400–700 | normal | Timestamps, badge text, nav labels, fine print, progress percentages |

Notes:
- **Inputs are 16 px on mobile** (prevents iOS zoom-on-focus) and may drop to 14 px at desktop widths.
- **Numerals in data contexts** (scores, prices, percentages) are bold and often forced LTR — see RTL rules below.
- The big quiz/score number is **24 px / 700**, brand blue.

### Concrete size reference (for agents)
`10px · 11px · 12px (xs) · 14px (sm) · 16px (base) · 18px (lg) · 20px (xl) · 24px (2xl) · 30px (3xl, emoji) · 36px (4xl, emoji) · 48px (5xl, emoji/splash)`. The `3xl–5xl` sizes are used almost exclusively for **emoji glyphs** (empty-state icons, cover emojis, splash book), not text.

---

## Weight usage rules

- **Bold (700)** only for: headings, names, card titles, values/numbers, CTA button text, unread chat titles, active nav labels, badge emphasis. Bold is meaningful — it signals "this is the important thing in its row."
- **Medium (500)** for: control/button labels, a completed list item's title, last-message preview when unread.
- **Regular (400)** for: body copy, secondary/meta text, inactive labels, placeholders.
- Avoid making whole paragraphs bold; emphasis loses meaning when overused.

---

## RTL & Arabic text rules

The app is **100% RTL**. The root document is `dir="rtl"`, `lang="ar"`.

- **Default direction is RTL.** Text aligns to the right; reading flows right-to-left.
- **Force LTR (`dir="ltr"`)** only for inherently-LTR data so it renders correctly:
  - Phone numbers, parent phone numbers
  - OTP codes and access keys
  - Percentages and score numbers (e.g. `85%`)
  - Latin/Western dates (the prototype also shows some dates in Arabic-Indic numerals — see below)
- **Arabic-Indic numerals** (٠١٢٣٤٥٦٧٨٩) appear in some static copy (e.g. teacher bios "١٥ سنة", refund policy "٧ أيام / ٣٠٪", a subscription date "٢٠٢٦/٠١/١٥"). Dynamic data (scores, prices, counts) uses Western numerals. **Decision for new build:** choose one numeral system per context and apply consistently — recommended: Western numerals for all data/metrics, Arabic-Indic only in long-form prose if desired.
- **Currency** is written as the number followed by **"ج.م"** (EGP), e.g. `250 ج.م`.
- **Iconography mirrors:** a "back" affordance uses a **right-pointing** arrow (because forward is leftward in RTL). Chevrons that mean "next/drill-in" point **left**. See `05-iconography-motion.md`.
- **Mirrored positioning:** badges that sit in a "corner" (cart count, unread dots) are pinned to the **left** corner in the prototype's RTL layout. Search-field icons sit on the **right**. When re-implementing, anchor these to the logical *start/end*, not hard-coded left/right, so they mirror correctly if an LTR surface is ever added.

---

## Do / Don't

- ✅ Use Dubai everywhere, including numerals and Latin text.
- ✅ Keep the hierarchy: one Title per section, 14 px bold for card titles, 12 px for labels.
- ✅ Force LTR on phone/code/percent/date runs only.
- ❌ Don't fall back to system Arabic fonts.
- ❌ Don't use weight 600 expecting a distinct file — it isn't shipped.
- ❌ Don't bold entire blocks of body text.
