# Visual Patterns

Cross-cutting visual rules and recipes that aren't single components. Tier marked per section.

---

## 1. Data visualization **[S core, U-reusable]**

Stats are **always visualized**, never shown as bare numbers. Two canonical primitives.

### RingChart (circular progress) **[S]**
A circular SVG ring with a centered percentage. The canonical "overall completion / performance" visual.

**Inputs:** `value` (0–100), `size` (px, default 100), `color` (default brand blue `#0655CB`).

**Geometry (exact):**
```
strokeWidth   = size * 0.10          // ring thickness = 10% of diameter
radius        = (size - strokeWidth) / 2
circumference = 2 * π * radius
dashOffset    = circumference * (1 - min(value/100, 1))
```
- Draw two concentric circles at `radius`, centered, with `stroke-width = strokeWidth`:
  - **track:** stroke `#E5E7EB`, full ring.
  - **progress:** stroke `color`, `stroke-dasharray = circumference`, `stroke-dashoffset = dashOffset`, **round line caps**.
- Rotate the SVG **−90°** so the arc starts at 12 o'clock and fills clockwise.
- Center overlay: the value as `{value}%` in 18–20 px bold (colored to match), optionally a tiny caption ("اكتمال") beneath.

**Sizes in use:** 70 px (compact, in the performance tag), 120 px (performance tab).
**Color:** brand blue for completion; the performance-tag ring uses the score-threshold color.

### StatBar (horizontal bar) **[S]**
A labeled progress bar. The canonical "one metric" visual.

**Inputs:** `label`, `value`, `max`, `color`, `displayValue` (e.g. `"85%"` or `"3 / 5"`).

**Anatomy:**
```
[ label (12px muted) ............... value (14px bold, colored) ]   ← header row, space-between
[ ████████████░░░░░░░░░░░░░░░░░░░░ ]                                 ← track 8px, gray-100, full-round
```
- `pct = max > 0 ? min(value/max * 100, 100) : 0` (clamped 0–100).
- Track: 8 px tall, `gray-100`, fully rounded, clipped.
- Fill: full height, rounded, `width = pct%`, `background = color`, transition ~200 ms.
- Value text takes the same color as the fill.

**Color rule:** blue `#0655CB` by default; for score bars, **green if value ≥ 50 else red**. Show `displayValue` as `"—"` when there is no data yet.

> Both primitives are re-implemented inline in several screens with identical math — extract once and reuse.

### Mini progress bar
A thinner (6 px) blue bar used inside course cards and dense tiles — same as StatBar but fixed blue, no header row, just an inline `track + fill + %`.

---

## 2. Tint ladder (tinted fills) **[U]**

Tinted surfaces use a base hue at a low alpha. Standardize to this ladder (replacing the prototype's scattered `+"10"/"15"/"20"/"30"` hex-alpha suffixes):

| Token | Alpha | Use |
|---|---|---|
| `tint/subtle` | 8% | Quiet avatar/cover fills, quick-action pills |
| `tint/soft` | 10% | Status banners, tinted badges, discussion avatars |
| `tint/medium` | 12% | Standard avatar/cover fill (people & courses) |
| `tint/on-color` | 20% | Tiles/badges placed **on** a colored (gradient) surface, e.g. course-header cover |

Text/icons on a tinted fill use the **saturated** hue (e.g. blue@10% bg + solid blue text).

---

## 3. Badge & status semantics **[U + S]**

Color and label vocabulary for badges/chips. Keep these meanings stable.

### Course descriptors
| Concept | Value → label | Treatment |
|---|---|---|
| Course type | `guided` → "موجّه" / "مع متابعة"; `non-guided` → "ذاتي" | guided = blue@10% bg + blue text; self = secondary/gray |
| Course mode | `online` → "أونلاين"; `offline` → "حضوري"; `hybrid` → "مختلط" | secondary/gray |
| Sequential | "تسلسلي" | shown only if the course locks lessons in order |

### Score / performance
| Concept | Rule | Color |
|---|---|---|
| Quiz verdict | ≥ 50 "ناجح" / < 50 "يحتاج تحسين" | green / red |
| Score badge (file row) | value % | green if ≥ 50 else red |
| Performance tag | none/<50/50–74/≥75 | gray / red / orange / green (labels in `01-color.md`) |
| Achievement badges | "متفوق" (≥75, green), "جيد" (50–74, blue), "يحتاج تحسين" (1–49, red), "ملتزم" (completion ≥80, green), "بدون تنبيهات" (0 warnings, green) | filled semantic + white text + 12 px leading icon |

### Channel unread badges (chat) **[S]**
Unread-count badge color **encodes the channel**:
| Channel | Unread badge color |
|---|---|
| Guided (personal MTA) | **blue** `#0655CB` |
| Discussion (group) | **green** `#22C55E` |
| System (notifications) | **amber** `#F59E0B` |
Keep this mapping — it lets students recognize the channel at a glance.

### Cart vocabulary
Item type: `course` → "كورس", `track` → "مسار", `bundle` → "باقة". Track tier: `monthly` → "شهري", `semester` → "فصلي", `full-year` → "سنوي".

---

## 4. State patterns **[U]**

### Empty states
A centered, **encouraging** pattern (never a blank or a cold "no data"):
```
        [ large emoji 30–48px ]
        short reassuring line (14px muted)
        [ optional CTA button ]
```
Examples (verbatim): 📭 "لا توجد كورسات بعد" + "استكشف الكورسات"; 🔍 "لا توجد نتائج"; 💬 "لا توجد رسائل بعد"; 🛒 "السلة فارغة"; ✅ "لا توجد أخطاء — أحسنت! استمر في التفوق". The "no warnings" state is a **positive green** card, not an empty one: "لا توجد تنبيهات - أنت في المسار الصحيح!".

### Loading states
Centered emoji (📚) + "جاري التحميل..." on the page surface (splash & auth-guard). Async data (QR image) appears only once ready (no flash of broken state). For real network calls the new build should add spinners/skeletons (the prototype's data is local/instant).

### Locked / gated states
Sequential lessons that aren't yet unlocked render at **40% opacity**, non-tappable, with a **lock** icon replacing the type icon. Scheduled/future content (per PRD) shows as a placeholder with a release date. Read-only chat (expired subscription + guide) keeps history but removes the input bar.

### Error / validation
Inline 12 px **red** message directly beneath the offending field; the field gets a red border/ring. Form-level: submit stays enabled but blocks and surfaces field errors (the prototype validates on submit). Destructive confirmations use red.

### Success / positive feedback
Green is the language of success: green CTAs for positive actions, a 96 px green-tinted disc with a check on the purchase-success screen, green "passed" verdicts, green achievement badges, 🎉 on celebrations.

---

## 5. RTL patterns **[U]**

- Root is RTL; content right-aligned, flows right-to-left.
- **Back = right arrow; drill-in/next = left chevron.** Expand chevrons rotate (90° → down).
- **Corner badges** (cart count, unread) pin to the **leading-top** corner (left in RTL). **Search icon** pins to the **right** of its field.
- **Horizontal scrollers** overflow toward the right edge.
- Force **LTR** runs for phone numbers, OTP, access keys, percentages, and Western dates.
- Currency: `{number} ج.م`.
- When building for a possible future LTR surface, anchor mirror-sensitive elements to logical start/end rather than hard left/right.

---

## 6. The course-header gradient **[S]**
The single gradient in the system: course-detail header, 135°, `#0655CB → #002F77` (brand blue → navy), white text/badges on top, with the cover tile at `tint/on-color` (20%) and a white-on-translucent progress bar (`white@20%` track, `white` fill). Reuse this only for the course header; everything else is flat.

---

## 7. Recurring micro-patterns
- **Back affordance:** right-arrow + "رجوع" (14 px muted) — used at the top of inner auth screens (the in-app screens use the TopBar back button instead).
- **"View all" link:** small blue bold text + left-chevron (home section headers → list screens).
- **Collapsible card:** tappable card, trailing chevron rotates 90° on expand (QR, billing).
- **Info row:** blue icon + muted label + bold value, hairline-separated (profile).
- **Tinted status banner:** semantic hue @ 10% bg, saturated icon + text, 16 px radius (warnings, conflicts, bundle promo, no-warnings).
