# Design System — Overview

The AbwaabPlus design system is the **universal foundation** plus the **student-surface conventions** that together define how the product looks and behaves. Every rule here is expressed without reference to any framework.

---

## Product personality

AbwaabPlus is an Arabic-first learning platform for Egyptian preparatory and secondary students. The emotional promise from the PRD is: **Assured · On Track · Not Alone** (مطمئن · على المسار · لست وحدك). The interface should always feel:

- **Reassuring** — progress is visible, failure is framed as recoverable ("practice your mistakes"), empty states are encouraging rather than blank.
- **Simple and consumer-grade** — this is a student's phone app, not an admin tool. Frequent actions are reachable in one or two taps. One primary action per screen.
- **Trustworthy and calm** — a single confident brand blue, generous rounding, soft surfaces, restrained shadows. No visual noise.

## The five principles

1. **Blue + yellow brand.** Blue `#0655CB` is the primary brand color — every primary action, CTA, active state, link, and interactive accent. Yellow `#FFCA00` is the secondary/highlight color for featured, promotional, and savings cues. Everything else is *functional* (success/error/warning) and is never used decoratively. (Reconciled to the Abwaab brand — see [`../brand-alignment.md`](../brand-alignment.md).)
2. **Mobile-first, single column.** The student app is a centered mobile column (max 512 px) that works thumb-first. Touch targets are never smaller than 44 px.
3. **RTL by default.** Arabic, right-to-left, throughout. Only inherently-LTR data (phone numbers, codes, percentages, dates) is forced LTR.
4. **Rounded and soft.** Cards 16 px, controls 8–12 px, avatars circular. Shadows are subtle (1–2 dp). No sharp corners, no heavy borders, no stock photography.
5. **Show, don't tell, for data.** Stats use ring charts and horizontal bars, not bare numbers. Progress is always visualized.

---

## Typographic & visual identity at a glance

| Aspect | Value |
|---|---|
| Typeface | **Dubai** (Arabic + Latin), weights 300 / 400 / 500 / 700 |
| Brand — primary | **`#0655CB`** (blue) |
| Brand — secondary | **`#FFCA00`** (yellow) |
| Page surface | **`#F5F5F5`** (light gray) |
| Card surface | **`#FFFFFF`** |
| Primary text | **`#1F2937`** |
| Default radius | **12 px** (scale derived from it) |
| Base spacing unit | **4 px** |
| Mobile container | **512 px** max width, centered |
| Min touch target | **44 px** |

Full values are in the foundation files; the machine-readable export is [`design-tokens.json`](./design-tokens.json).

---

## Tiering: universal vs student-surface

Each rule belongs to one of two tiers so the system can extend to the future management console (see the repo README):

- **Universal foundation** — shared by every surface: color, typography, the spacing/radius/elevation scales, icon system, motion, and the core primitives (Button, Input, Select, Checkbox, Card, Badge, Tabs, Accordion, Dialog, Sheet, Avatar, Progress, Separator, Toast).
- **Student-surface conventions** — specific to this mobile app: the 512 px column and `AppShell`, the `TopBar`, the `BottomNav`, mobile touch sizing, the consumer-emotional patterns (emoji covers, encouraging empty states), and the student-specific composite components (CourseCard, LessonRow, ChatBubble, RingChart, StatBar, FileViewer).

Files mark each section's tier.

---

## Known inconsistencies to resolve in the new build

The prototype is a fast prototype; these are points where it is internally inconsistent or took shortcuts. The new build should **decide deliberately** on each. They are documented honestly so they don't get copied blindly.

1. **Green used for interactivity, not just success.** ✅ **Resolved (brand reconciliation).** The prototype wired the "accent" to green `#22C55E`, leaking into interactive treatments (outline/ghost button hover, dropdown highlighted option, the course-list type-filter chips). Per the brand decision, `accent` now points at **brand blue** so all interactive states are blue; green is functional-success-only. Filter chips standardize on blue (use a distinct treatment, not color family, to separate subject vs type). See `01-color.md`.

2. **Hard-coded grays instead of tokens.** `TopBar` and `BottomNav` use raw gray utilities (`gray-400`, `gray-600`, `gray-700`, `gray-900`, `gray-200`) and an inline `#E5E7EB` shadow, rather than the gray tokens. The new build should route every gray through a named token (see `01-color.md`).

3. **Icon-tile radius inconsistency.** Course "cover" icon tiles are 16 px radius on most screens but 12 px on the bundle page. Pick one (16 px recommended) and apply everywhere.

4. **Avatar bg alpha varies.** Tinted avatar/cover backgrounds use the cover color at ~12% (`+"20"`), ~19% (`+"30"`), ~8% (`+"15"`), or ~6% (`+"10"`) alpha depending on screen. Standardize the tint ladder (see `07-visual-patterns.md`).

5. **Two ring components.** A `RingProgress`/`RingChart` SVG ring is re-implemented inline on multiple screens with identical math. Normalize to one component (`07-visual-patterns.md`).

6. **`font-semibold` (600) is requested but not shipped.** Some shadcn primitives ask for weight 600; only 300/400/500/700 Dubai files are loaded, so 600 is browser-synthesized. Either ship a 600 weight or map "semibold" usages to 700. See `02-typography.md`.

7. **Prototype-only shortcuts (functional).** OTP always succeeds, password is ignored, quizzes generate a random score, the bundle-in-cart checkout path is a no-op, and persistence uses `sessionStorage`. These are flagged in the functional docs and must be replaced by real backend behavior.

---

## Reading order

For a first pass: this overview → `01-color.md` → `02-typography.md` → `03-spacing-layout.md` → `04-radius-elevation.md` → `05-iconography-motion.md` → `06-components.md` → `07-visual-patterns.md`. Then cross over to the functional pillar for screen-by-screen detail.
