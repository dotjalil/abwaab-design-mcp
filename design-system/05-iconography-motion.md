# Iconography & Motion

**Tier: Universal foundation.**

---

## Icon system

The prototype uses the **Lucide** line-icon set. For a stack-agnostic build, the requirement is: **a consistent line-icon family** with these characteristics:

- **Style:** outline / stroke icons (not filled, not duotone), rounded line caps and joins.
- **Default stroke weight:** 2. **Active/emphasised stroke weight:** 2.5 (used to mark the active bottom-nav item without changing color alone).
- **Default size:** **22 px** in chrome (top bar, bottom nav), **16–18 px** inline (list rows, card headers, inline labels), **14 px** for small meta icons, **12–10 px** for micro (badges, member counts).
- **Hero sizes:** 48 px for a file-viewer hero icon, 24–28 px for prominent stat/empty-state icons.
- Icons inherit text color by default; semantic icons take their semantic color.

### Standard icon sizes
| Context | Size |
|---|---|
| Top bar actions (back, cart) | 22 px |
| Bottom nav | 22 px |
| Card-header / row leading icon | 18 px |
| Inline file-type icon (lists) | 16 px |
| Small meta (duration, member count, dots) | 10–14 px |
| Hero (file viewer) | 48 px |
| Empty-state / success disc | 24–48 px |

### Canonical icon meanings
| Meaning | Icon | Notes |
|---|---|---|
| Home | house | bottom nav |
| My courses | open book | bottom nav |
| Messages | chat bubble | bottom nav, +unread badge |
| Explore | compass | bottom nav |
| Profile/account | user | bottom nav, info rows |
| Back (RTL) | **right arrow** | forward is leftward in RTL |
| Drill-in / next (RTL) | **left chevron** | rotates to down-chevron when a section expands |
| Cart | shopping cart | top bar, add-to-cart |
| Remove/delete | trash | red |
| Access key | key | |
| Schedule/timetable | calendar | |
| Performance/trend | trending-up | stat headers |
| Completion check | check-circle | green when complete |
| Warning/alert | triangle-alert | red/orange |
| Search | magnifier | pinned to the **right** in RTL inputs |
| QR | qr-code | |
| Billing | credit-card | |
| Settings | gear | |
| Support | help-circle | |
| Logout | log-out | red |
| Send (chat) | send (paper plane) | |
| Attach image / voice | image / mic | chat input |

### File-type icon ↔ color map
A single file-type icon component maps each content type to an icon **and** a semantic color, used at 16 px in lists and 48 px in the file-viewer hero:

| File type | Icon | Color |
|---|---|---|
| Video | play | brand blue `#0655CB` |
| Quiz | clipboard-check | green `#22C55E` |
| Assignment | file-text | orange `#F59E0B` |
| PDF | file-down | red `#EF4444` |
| Task (مهمة) | alert-circle | orange `#F59E0B` |
| Locked | lock | gray `#9CA3AF`/`gray-300` |

Normalize this into one `FileTypeIcon(type, size)` component (see `06-components.md`).

---

## Emoji as illustration
The prototype deliberately uses **emoji** (not custom illustrations or stock photos) for: course/teacher/bundle "cover" glyphs, empty-state icons (📭 📪 🔍 💬 🛒 📅), splash (📚), and celebration (🎉). This is a low-cost, friendly, culturally-neutral illustration strategy. Keep it consistent: covers are emoji on a tinted rounded tile; empty states are a large centered emoji above an encouraging line. (A future system could swap emoji for a custom illustration set without changing layout.)

---

## Motion

Motion is **functional and quick** — it confirms state changes, it never decorates.

| Interaction | Motion | Duration |
|---|---|---|
| Hover/press color & shadow | ease transition on color/box-shadow | ~150 ms |
| Progress bar / ring fill | width/stroke transition | ~200–300 ms (ease) |
| Accordion / section expand | height auto-animate + chevron rotate (90° or 180°) | ~200 ms |
| Tab switch | active pill moves; content swaps | ~200 ms |
| Dialog open/close | fade + scale from 95% | ~200 ms |
| Sheet (bottom/side) | slide from edge + fade | open ~500 ms / close ~300 ms |
| Toast | library default slide/fade | — |
| Chat send | message appends, container auto-scrolls to bottom | ~50 ms scroll delay |

Principles:
- **Transitions, not animations.** Default to transitioning `color`, `background`, `box-shadow`, `transform`, and chart fills.
- **Respect reduced-motion**: the new build should disable non-essential transitions when the OS requests reduced motion (the prototype does not — add it).
- **No looping/idle animation** except a spinner on async loads.
- Chevrons rotate to indicate expand/collapse (left-chevron → rotates 90° to point down when open; some accordions rotate a down-chevron 180°). Pick one convention and apply it.
