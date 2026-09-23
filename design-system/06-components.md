# Components

Each component is described by **anatomy → variants → states → sizing → behavior**, with concrete measurements. Tier is marked per component:

- **[U] Universal** — shared by every surface (student app + future console).
- **[S] Student-surface** — specific to the mobile student app.

All measurements: lengths in px, colors in hex (see `01-color.md`), radius/spacing from `03`/`04`. Every interactive element should carry a stable test id; ids used by the prototype are listed where relevant so the new build can preserve selectors.

---

# Part 1 — Universal primitives

## Button **[U]**
The primary action element.

**Anatomy:** label text, optional leading/trailing icon, centered, single line. Gap icon↔label 8 px.

**Variants:**
| Variant | Fill | Text | Hover |
|---|---|---|---|
| `primary` (default) | brand blue `#0655CB` | white | `#0044AE` / blue @ 90% |
| `success` | green `#22C55E` | white | green @ 90% |
| `destructive` | red `#EF4444` | white | red @ 90% |
| `outline` | transparent + 1 px border | text/primary | subtle bg ⚠ (prototype tints green — should be neutral/blue) |
| `secondary` | surface/page `#F5F5F5` | brand blue | slightly darker |
| `ghost` | transparent | inherits | subtle bg on hover |
| `link` | none | brand blue | underline |

> **Brand-reconciled:** all CTAs — including purchase CTAs (`add to cart`, `pay`, `buy now`, `create account`) — use the **`primary` (brand blue)** variant. The prototype rendered these green; that is superseded. The `success` variant is for genuine success *feedback*, not CTAs. For featured/promotional emphasis, use a **`highlight`** treatment (brand yellow `#FFCA00`, navy text) rather than a colored button.

**Sizes:**
| Size | Height | Padding (x) | Text | Radius |
|---|---|---|---|---|
| `xs` | 24 | 8 | 12 | 10 |
| `sm` | 32 | 12 | 14 | 10 |
| `default` | 36 | 16 | 14 | 10 |
| `lg` | 40 | 24 | 14 | 10 |
| `icon` (xs/sm/default/lg) | 24 / 32 / 36 / 40 square | — | — | 10 |

> A button used as a **lone primary touch target** must be ≥ 44 px tall — the prototype does this by making such buttons full-width with 12–24 px vertical padding (e.g. `py-3`/`py-6`). Don't ship the 36 px default as a standalone primary CTA.

**States:** hover (darken/tint), focus (3 px focus ring in brand blue at 50%), disabled (50% opacity, no pointer), invalid (red ring). Transition ~150 ms.

---

## Input (text field) **[U]**
**Anatomy:** single-line field; optional inline icon (e.g. search). Often preceded by a 12 px label (`text/secondary`) and followed by a 12 px error line (red) when invalid.

**Sizing:** height 36 px; padding 12 px horizontal, 4 px vertical; radius 10 px (`radius/md`); 1 px border `#E5E7EB`. Text **16 px on mobile** (→ 14 px desktop). Placeholder in `text/secondary`.

**States:** focus → border brand blue + 3 px blue@50% ring; disabled → 50% opacity; invalid → red border + red ring (+ external 12 px red error message). Selection highlight uses brand blue.

**RTL specifics:** force `dir="ltr"` for phone, OTP, and access-key inputs. Search inputs place the magnifier icon on the **right** and pad the right edge.

**Special input treatments:**
- **OTP:** centered, 24 px bold, wide letter-spacing (~0.5em) to feel like separate boxes.
- **Phone:** `tel`, max length 11, LTR, placeholder `01xxxxxxxxx`.

---

## Select (dropdown) **[U]**
**Anatomy:** trigger (value + trailing chevron) → popover list of options; each option may show a leading check when selected.

**Sizing:** trigger height 36 px (default) / 32 px (sm); padding 12 px; radius 10 px (`radius/md`); border `#E5E7EB`; gap 8 px; text 14 px. Popover: white, radius 10 px, `shadow-md`, min-width 128 px.

**States:** placeholder in `text/secondary`; open animates fade+zoom; **highlighted option** background ⚠ (prototype = green `#22C55E`; recommend brand blue tint); selected option shows a check; disabled option 50%.

**Use:** registration grade/specialization/governorate pickers.

---

## Checkbox **[U]**
**Anatomy:** 16 × 16 box, 4 px radius, 1 px border `#E5E7EB`; check glyph (14 px) when checked.
**States:** checked → fill brand blue `#0655CB`, white check, blue border; focus → blue ring; disabled → 50%. Used with a 14 px label (e.g. refund-policy agreement).

---

## Card **[U]**
The fundamental surface.
**Anatomy:** white container, 16 px radius, 1 px `#E5E7EB` border, `shadow-sm`. Optional regions: header (title + description + optional action), content, footer. Internal vertical gap 24 px between regions (tighter in dense usage).
**Padding:** 16 px sides; top 16–24 px / bottom 16–20 px depending on density.
**States:** if tappable → `cursor: pointer` + lift to `shadow-md` on hover. Many composite cards (course cards, chat cards, profile rows) are tappable cards.

---

## Badge / Pill **[U]**
**Anatomy:** fully-rounded label, 12 px text (often 10 px in dense UI), medium weight; optional 12 px leading icon; horizontal padding 8 px, vertical 2 px.
**Variants:** `primary` (blue fill/white), `secondary` (page-gray fill / blue or muted text), `destructive` (red/white), `outline` (border + text), `ghost`. Custom tinted badges use a semantic hue @ ~10% bg with the saturated hue text (e.g. "مع متابعة" = blue @ 10% bg, blue text).
**Semantic badge vocabulary** (see `07-visual-patterns.md` for the full list): course type, mode, guided "مع متابعة", score %, channel unread counts, achievement badges.

---

## Tabs **[U]**
Two list styles:
- **Segmented (default):** a `#F5F5F5` track, 3 px padding, 36 px tall; the active tab is a white pill with `shadow-sm`. Inactive labels muted. Used as the course-detail tab bar (rebuilt as a custom `SegmentedTabBar`, below).
- **Line:** transparent track; the active tab shows a 2 px underline in `text/primary`.

Trigger: 14 px medium, radius 8 px (segmented), gap 6 px. Active text → `text/primary`.

---

## Accordion **[U]**
**Anatomy:** stacked items separated by 1 px bottom borders (last item borderless). Trigger row: 14 px medium label + trailing chevron that rotates 180° when open; 16 px vertical padding. Content animates open/closed (height), with 16 px bottom padding.
**Use:** generic disclosure; the course Sections are a custom variant (`SectionAccordion`, below).

---

## Dialog (modal) **[U]**
**Anatomy:** centered card over a **black @ 50%** scrim; 12 px radius, 24 px padding, 16 px internal gap, `shadow-lg`; optional close (×) pinned to the top-trailing corner; header (18 px bold title + 14 px muted description), body, footer (actions, right-aligned). Max-width ~512 px on larger screens, otherwise viewport − 32 px.
**Motion:** fade + zoom-from-95%, ~200 ms.

---

## Sheet (slide-over / bottom sheet) **[U]**
**Anatomy:** panel sliding from an edge over a black@50% scrim; white, `shadow-lg`, 16 px internal gap; header (16 px padding, bold title + 14 px muted description) and optional footer. Close (×) top-trailing.
**Sides:** right/left (drawer, ~75% width, ≤ 384 px on small screens), top/bottom (auto height). The **bottom sheet** (top corners 20 px rounded, `radius/2xl`) is the student-app pattern for pickers (e.g. grade selection).
**Motion:** slide + fade; open ~500 ms / close ~300 ms.

---

## Avatar **[U]**
**Anatomy:** circular image or fallback (initial/emoji on a tinted fill). Optional small status **badge/dot** at a bottom corner; optional grouping (overlapping with 2 px ring).
**Sizes:** sm 24 / default 32 / lg 40 px. The student app commonly uses larger emoji avatars (40–64 px) on a tinted circle — see composite `AvatarTile`.
**Status dot:** small filled circle with a 2 px white ring; **green** dot = online (chat).

---

## Progress (linear) **[U]**
**Anatomy:** fully-rounded track (brand blue @ ~20%) with a brand-blue fill; height **8 px** (a thinner **6 px** variant is used inside dense cards). Fill width = value %. Animated ~200–300 ms.
**Variant — colored bar (`StatBar`):** the student app uses a track at `gray-100` with a fill colored by meaning (blue default; green/red by the 50 score line). See `07-visual-patterns.md`.

---

## Separator **[U]**
1 px line in `#E5E7EB`, horizontal (full width) or vertical (full height). Used between info rows and list sections.

---

## Toast (notification) **[U]**
Transient message host. White surface, `text/primary`, 1 px `#E5E7EB` border, 12 px radius. Status icons: success (check-circle), info (info), warning (triangle-alert), error (octagon-x), loading (spinner). Note: the prototype declares the toaster but mounts it inconsistently — the new build should mount one global toast host and route success/error feedback through it (the prototype currently uses inline colored text for access-key and form feedback instead).

---

# Part 2 — Student-surface chrome **[S]**

## TopBar
Sticky white header, **56 px** tall, 1 px bottom hairline (`#E5E7EB`), capped at 512 px and centered.
**Anatomy (leading → trailing):** optional back button (right-arrow, 44 px hit) → either a **logo** (image, ~36 px tall) *or* a **title** (16 px bold); on the trailing side, optional custom actions + optional **cart button** (cart icon, 44 px hit, with a blue count badge when items > 0).
**Props:** `title`, `showBack`, `showCart`, `showLogo`, `actions`.
**Behavior:** back → navigate back; cart → go to `/cart`. Cart badge: blue circle, 16 px, white 10 px bold count, pinned to the leading-top corner (left in RTL).
**Test ids:** `top-bar`, `back-button`, `cart-button`.

## BottomNav
Fixed bottom tab bar, **64 px** tall, white, 1 px top border, capped 512 px, centered. Five destinations:

| Order | Label | Route | Icon |
|---|---|---|---|
| 1 | الرئيسية (Home) | `/home` | house |
| 2 | كورساتي (My Courses) | `/courses` | open-book |
| 3 | الرسائل (Messages) | `/messages` | chat (+unread badge) |
| 4 | استكشف (Explore) | `/explore` | compass |
| 5 | حسابي (Profile) | `/profile` | user |

**Item anatomy:** stacked icon (22 px) + 10 px label, ≥ 64 px wide / 44 px tall.
**Active state:** brand blue, **bold** label, **icon stroke 2.5**. **Inactive:** `text/disabled` gray, normal label, stroke 2. Active is determined by exact route match or path-prefix match.
**Unread badge (Messages only):** red circle, 16 px, white 10 px bold count, leading-top corner.
**Test ids:** `bottom-nav`, `nav-home`, `nav-courses`, `nav-messages`, `nav-explore`, `nav-profile`.

## AppShell
The mobile frame: page surface `#F5F5F5`, centered 512 px column, full min-height, content area with **80 px** bottom padding, and the BottomNav. Wraps every authenticated screen except the full-screen chat room.

---

# Part 3 — Student-surface composites **[S]**

These are defined inline in the prototype's screens; the new build should extract them as named components. Each lists the screens it appears on.

## FileTypeIcon
One component mapping content type → icon + color (see `05-iconography-motion.md`). Sizes: 16 px (lists) and 48 px (file-viewer hero). Locked state → lock icon in gray.

## AvatarTile (emoji cover/avatar)
A rounded tile showing an emoji on a tinted fill (`coverColor`/`avatarColor` at a low alpha). Used for course covers, teacher/student avatars, bundle covers.
**Sizes & shapes observed:** 40 px (`radius 12–16`), 48 px circle, 56 px (`radius 16`), 64 px circle, 72 px (`radius 24`). **Standardize** the tint alpha (see inconsistency #4) — recommended ladder: avatar/cover tint at 12%, header-on-color tile at 20%.
**Variants:** circular (people) vs rounded-square (courses/bundles).

## CourseCard
Three observed layouts — unify into one component with a `layout` prop:
- **mini** (home horizontal scroller): ≥ 180 px wide vertical card — 40 px cover tile, 14 px bold title (2-line clamp), thin 6 px progress bar + %, optional "مع متابعة" blue badge.
- **list** (my courses): horizontal — 56 px cover tile, 14 px bold title (1-line), subject, 6 px progress bar + %, two secondary badges (type + mode).
- **explore** (browse): horizontal — 56 px cover tile, title, teacher name, type + grade badges, price (blue bold) + an **add-to-cart** success button.
**Common:** white tappable Card, cover tile + text column; tap → course detail (or add-to-cart on explore). Test id `course-card-{id}` / `course-item-{id}` / `explore-course-{id}`.

## TrackCard (explore)
Horizontal card: 56 px cover, title, teacher, "{n} كورسات", two pricing badges (monthly blue, semester green), full-width "اشترك الآن" blue button (adds monthly tier to cart). Test id `track-{id}`.

## ChipFilter
Fully-rounded filter chip, 12 px bold text, 6 px/12 px padding, in a horizontal scroller.
**States:** active = filled (brand blue) + white text; inactive = white + colored text + 20%-tinted border.
> **Brand-reconciled:** selected chips use **brand blue** across the board. The prototype's green type-filter chips are superseded — to distinguish chip groups (subject vs type), vary layout/label, not color family.

## SegmentedTabBar
The course-detail tab control: a `#F5F5F5` track (radius 12, 4 px padding) holding equal-width tabs; **active** tab = white pill + `shadow-sm` + `text/primary`; inactive = muted. 14 px medium. Test ids `tab-content` / `tab-review` / `tab-performance`.

## SectionAccordion + FileRow (LessonRow)
**SectionAccordion:** white rounded (16) bordered container. Header row (16 px padding): 14 px bold section title + a "{done}/{total}" count badge + a left-chevron that rotates 90° to point down when expanded. Expanding reveals the file rows.
**FileRow:** a tappable row (16 px sides, 12 px vertical), bottom-divided. Anatomy: 36 px icon tile (`FileTypeIcon` on a sunken fill) → title (14 px; **green + medium when completed**) + meta line (duration • type label • optional score badge) → trailing check-circle (green) when completed.
**States:**
- **locked** (sequential gating): 40% opacity, not tappable, lock icon replaces the type icon.
- **completed:** green title, trailing green check, score badge.
- **score badge:** tiny badge, green if score ≥ 50 else red.
Test ids `section-{id}`, `file-{id}`.

## RingChart (RingProgress) — see `07-visual-patterns.md`
Circular SVG progress ring with a centered % label. The canonical stat visualization.

## StatBar — see `07-visual-patterns.md`
Labeled horizontal bar (label + value header over a colored track). The other canonical stat visualization.

## PerformanceTag
A tinted banner summarizing performance: a trend icon + "تقييم الأداء" label + the tag word ("متفوق/جيد/يحتاج تحسين/لم يبدأ"), optionally with the average score and/or a small ring. Background and color come from the score thresholds (`01-color.md`). Appears on home (compact) and academic report (full, with ring).

## InfoRow
A profile detail row: leading 18 px blue icon → 12 px muted label over a 14 px bold value; separated by hairlines. Value forced LTR for phone numbers.

## CollapsibleCard
A tappable Card whose header has a trailing left-chevron that rotates 90° on expand, revealing extra content below (used for QR code and Billing on profile). Distinct from Accordion in that it's a standalone card.

## ChatBubble
A message bubble, max 80% width, ~10 px vertical / 16 px horizontal padding, 20 px radius (`radius/2xl`) with a notched tail corner toward the sender.
**Variants:**
- **self (student):** brand-blue fill, white text, tail at bottom-trailing; timestamp white@60%.
- **other (MTA):** white fill, `text/primary`, `shadow-sm`, tail at bottom-leading; shows a 10 px blue bold sender name; timestamp muted.
Text 14 px, relaxed line height; timestamp 10 px. Test id `message-{id}`.

## SystemPill / RatingPrompt / RatingResult (chat inline)
- **SystemPill:** centered rounded pill for system/automated messages; **warning type = red tint**, else gray. Test id `system-message-{id}`.
- **RatingPrompt:** white rounded card, "هل فهمت الإجابة؟" + two pill buttons — yes (green tint + thumbs-up) / no (red tint + thumbs-down). Test ids `rating-message-{id}`, `rate-yes-{id}`, `rate-no-{id}`.
- **RatingResult:** small secondary badge "✓ أفاد" / "✗ لم يفد" after rating.

## ChatListItem
Three list styles encoding channel (see `07-visual-patterns.md` for the channel-color rule):
- **GuidedChatCard:** premium tappable Card — circular emoji avatar with green online dot, MTA name (bold if unread), course line (blue@60%), last message + **blue** unread badge.
- **DiscussionChatRow:** flat row — rounded-square emoji avatar, group title (bold if unread), last message, member count, **green** unread badge.
- **SystemBanner:** amber-tinted banner — bell icon, "إشعارات النظام", preview, **amber** unread badge, trailing chevron.
Test id `chat-room-{id}` (rows) / `system-notifications-banner`.

## QuickActionsBar (chat)
A horizontal scroller of tappable blue-tinted pills with canned prompts ("📖 سؤال في المنهج", "❓ استفسار عام", "🔧 مشكلة تقنية"); tapping sends that text. Guided chat only. Test id `quick-actions`.

## MessageInputBar (chat)
A bottom bar: image button + mic button (44 px) → text input (Enter sends) → send button (blue, disabled when empty). Discussion chat omits image/mic and quick actions; system chat omits the input bar entirely (read-only). Test ids `message-input-container`, `message-input`, `send-button`.

## ThreadCard (discussion chat)
A card with a parent message (small avatar-initial + name + time + body) and an indented replies block (smaller avatars, deeper indent), plus a "رد / {n} رد" reply affordance.

## EmptyState
A centered pattern used across screens: a large emoji (30–48 px) over a short encouraging line (14 px muted), optionally a CTA button. Always reassuring in tone (e.g. "لا توجد أخطاء — أحسنت! استمر في التفوق"). See `07-visual-patterns.md`.

## QRBlock
A centered QR image (200 px, brand-blue modules on white, 16 px radius) with a 12 px muted caption showing the student id. Revealed inside the profile QR `CollapsibleCard`. Test id `qr-display`.

---

## Component → screen index
| Component | Appears on |
|---|---|
| TopBar / BottomNav / AppShell | all authenticated screens |
| CourseCard | home, courses, explore |
| TrackCard | explore |
| ChipFilter | courses, explore |
| SegmentedTabBar | course detail |
| SectionAccordion / FileRow | course detail (content) |
| FileTypeIcon | course detail, file viewer |
| RingChart / StatBar / PerformanceTag | home, course detail (performance), academic |
| ChatBubble / ChatListItem / QuickActionsBar / MessageInputBar / ThreadCard | messages, chat room |
| InfoRow / CollapsibleCard / QRBlock | profile |
| EmptyState | home, courses, explore, messages, cart, review tab |
