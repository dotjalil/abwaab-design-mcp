# Color

**Tier: Universal foundation.**

AbwaabPlus uses a **two-color brand system — blue (primary) + yellow (secondary)** — reconciled to the Abwaab Brand Guidelines V.4 (2021), plus a small set of **functional** colors that signal UI state. Color is never decorative: if an element is interactive it is **blue**; if it is featured/promotional it is **yellow**; if it communicates an outcome it uses the matching **functional** color (green/red/amber).

> **Brand decision:** these values follow the Abwaab brand. The earlier prototype used `#2563EB` (blue) with green CTAs; both are superseded here. See [`../brand-alignment.md`](../brand-alignment.md).

---

## Brand — Blue (primary)

| Token | Hex | Role |
|---|---|---|
| `brand/blue` (primary) | **`#0655CB`** | The primary brand color. All primary buttons/CTAs, active navigation, links, focus rings, selected/active states, interactive accents, progress fills, QR code dark module. |
| `brand/blue-hover` | **`#0044AE`** | Hover/pressed state of any blue element (Abwaab Blue 2). Mid stop of the course-header gradient. |
| `brand/navy` | **`#002F77`** | Darkest brand blue (Abwaab Blue 3). Deep accents and the dark stop of the course-header gradient. |

## Brand — Yellow (secondary / highlight)

| Token | Hex | Role |
|---|---|---|
| `brand/yellow` | **`#FFCA00`** | The secondary brand color. **Highlights, special offers, featured items, savings, and numbers-on-blue.** The brand's "make it pop" color. |
| `brand/gold` | **`#D9A901`** | Supporting gold for depth/contrast on light surfaces. |
| `brand/gold-deep` | **`#B48C0E`** | Deep gold (Abwaab Gold 2). |

> **Rule:** blue is the interactive/primary color; yellow is the highlight/featured color. Use yellow deliberately for things the brand wants to "pop" (promotions, savings, featured/`isHighlighted` content, key numbers) — not as a general accent. Do **not** introduce additional brand hues beyond blue + yellow/gold.

The course detail header uses a **blue gradient** (135°, `#0655CB → #002F77`) — the only gradient in the system. Everything else is flat.

---

## Functional palette (UI signals — not brand colors)

These communicate **state only** — they are *not* part of the Abwaab brand palette (an **intentional deviation**: state meaning can't be carried by blue + yellow alone), and must never be used decoratively or as CTAs (CTAs are brand blue; promos/savings are brand yellow). Filled status surfaces (banners, chips, badge backgrounds) use the hue **at ~10% alpha**; text/icon sitting on that tint uses the matching **`-dark`** shade for contrast.

| Token | Hex | Text/icon on its ~10% tint | Meaning |
|---|---|---|---|
| `fn/success` (green) | **`#22C55E`** | `fn/success-dark` **`#15803D`** | Positive, passed, complete, on-track, "helped" |
| `fn/success-light` | **`#86EFAC`** | — | Lighter success accent (rarely used) |
| `fn/error` (red) | **`#EF4444`** | `fn/error-dark` **`#B91C1C`** | Failure, destructive, warnings list, logout, wrong answer |
| `fn/warning` (amber) | **`#F59E0B`** | `fn/warning-dark` **`#B45309`** | Caution, in-between performance ("good"), cart conflicts, active-mistakes count. **Kept distinct from brand gold `#D9A901`.** |
| `fn/neutral` (gray) | **`#9CA3AF`** | — | Disabled, "not started", secondary meta |

> Savings/promo/featured cues are **not** functional green — they use **brand yellow** `#FFCA00` (see Brand — Yellow above). The functional family above (and the `-dark`/`-light` variants) is preserved as a deliberate, documented off-brand UI system.

### Score & performance thresholds
Color is assigned to scores by fixed thresholds (used on quizzes, stat bars, performance tags):

| Condition | Color | Label (performance tag) |
|---|---|---|
| No quizzes taken | gray `#9CA3AF` | "لم يبدأ بعد / ابدأ الآن" (not started) |
| score ≥ 75% | green `#22C55E` | "متفوق" (excellent) |
| 50% ≤ score < 75% | orange `#F59E0B` | "جيد" (good) |
| score < 50% | red `#EF4444` | "يحتاج تحسين" (needs improvement) |

A simpler **pass line of 50%** is used for individual quiz verdicts and per-bar coloring: ≥ 50 → green "ناجح" (passed), < 50 → red "يحتاج تحسين". The new build should keep **50 = pass**, **75 = excellence** as the two canonical thresholds.

---

## Neutrals & surfaces

| Token | Hex | Role |
|---|---|---|
| `surface/page` | **`#F5F5F5`** | App/page background, also section fill behind cards |
| `surface/card` | **`#FFFFFF`** | Cards, top bar, bottom nav, popovers, sheets, dialogs |
| `surface/sunken` | **`#F9FAFB`–`#F3F4F6`** | Inset tiles inside cards (stat tiles, list-row fills, billing rows). Prototype uses `gray-50`/`gray-100`. |
| `text/primary` | **`#1F2937`** | Headings, primary body text, values |
| `text/secondary` | **`#6B7280`** | Labels, meta, captions, placeholders, inactive |
| `text/disabled` | **`#9CA3AF`** | Disabled text, inactive nav icons |
| `border/default` | **`#E5E7EB`** | Card borders, dividers, input borders, top-bar bottom line |
| `scrollbar/thumb` | **`#D1D5DB`** | Custom 4 px scrollbar thumb |
| `overlay/scrim` | **`#000000` @ 50%** | Modal & sheet backdrop |

> **Cleanup note:** the prototype scatters raw gray utilities (`gray-50/100/200/300/400/600/700/900`) across components. Map them to the named tokens above in the new build. Approximate mapping: `gray-50 → surface/sunken`, `gray-100 → surface/sunken (darker)`, `gray-200 → border/default`, `gray-400 → text/disabled`, `gray-600/700 → text/secondary`, `gray-900 → text/primary`.

> **Intentional deviation (neutrals):** this is a full neutral **gray ramp** (≈gray-50 → gray-800, including the `#D1D5DB` scrollbar thumb), used for UI depth and contrast. The Abwaab brand defines only one neutral — Cool Gray `#EAEDEF`. The ramp is preserved deliberately (a single brand gray can't carry surfaces, borders, disabled, and text); `#EAEDEF` remains an optional swap for `surface/page` if exact brand-neutral matching is ever wanted.

---

## Semantic → role token mapping (for theming)

The system is built on role tokens (the kind a theming layer would expose). This mapping is **reconciled to the brand** — keep these relationships when re-theming:

| Role token | Resolves to | Hex |
|---|---|---|
| `primary` | brand/blue | `#0655CB` |
| `primary-foreground` | white | `#FFFFFF` |
| `secondary` | surface/page | `#F5F5F5` |
| `secondary-foreground` | brand/blue | `#0655CB` |
| `accent` (interactive hover/highlight) | brand/blue | `#0655CB` |
| `accent-foreground` | white | `#FFFFFF` |
| `highlight` (featured/promo) | brand/yellow | `#FFCA00` |
| `highlight-foreground` | brand/navy | `#002F77` |
| `muted` | surface/page | `#F5F5F5` |
| `muted-foreground` | text/secondary | `#6B7280` |
| `destructive` | fn/error | `#EF4444` |
| `background` | surface/page | `#F5F5F5` |
| `foreground` | text/primary | `#1F2937` |
| `card` / `popover` | surface/card | `#FFFFFF` |
| `border` / `input` | border/default | `#E5E7EB` |
| `ring` | brand/blue | `#0655CB` |

> **Reconciled:** `accent` (component hover/highlight — outline-button hover, dropdown option highlight) now points at **brand blue**, so all interactive states are blue. The prototype's green-accent behavior is superseded. `highlight` (brand yellow) is the new role for featured/promotional surfaces.

---

## Usage rules

- **Primary action / all CTAs → blue fill** (`#0655CB`), white text, hover `#0044AE`. This includes purchase CTAs (add-to-cart, pay, buy-now), account creation, and "practice mistakes". (The prototype rendered these green; per the brand decision they are **blue**.)
- **Featured / promotional / savings → yellow** (`#FFCA00`), with navy (`#002F77`) or blue text on it. Use for special offers, bundle savings, `isHighlighted` content, and key numbers-on-blue. Yellow is a *highlight*, not a CTA fill for ordinary actions.
- **Destructive action → red** (`#EF4444`), usually as outline/text, not heavy fill (e.g. logout = red outline, remove = red icon).
- **Functional success → green** (`#22C55E`) only as *feedback/state* (completion check, "passed", success screen, online dot) — never as a CTA or decoration.
- **Never** use a functional color for a non-functional purpose (no green "just because", no red unless something is wrong, no amber that reads as brand gold).
- **Tinted backgrounds** (status banners, badges) use the hue at ~10% alpha with the saturated hue for text/icon.
- **Charts** use brand blue for the main series; green/red/amber only when encoding a score outcome.

## Charts color slots
The five chart slots map to: `chart-1 = #0655CB` (blue), `chart-2 = #22C55E` (green), `chart-3 = #EF4444` (red), `chart-4 = #F59E0B` (amber), `chart-5 = #9CA3AF` (gray). In practice, use blue for fills and green/red only for score-encoded bars; yellow `#FFCA00` is available for a "featured/highlight" series.
