# Spacing & Layout

**Tier: Universal (spacing scale, touch targets) + Student-surface (container, page rhythm).**

---

## Base unit

The spacing system is built on a **4 px base unit**. All padding, margin, and gaps are multiples of 4.

| Step | px | Common use |
|---|---|---|
| 0.5 | 2 | Hairline insets, badge vertical padding |
| 1 | 4 | Tight gaps (icon↔label), micro padding |
| 1.5 | 6 | Chip vertical padding, small gaps |
| 2 | 8 | Default small gap, badge horizontal padding |
| 3 | 12 | Card inner gaps, row gaps, control horizontal padding |
| 4 | 16 | **Screen side margin**, card padding, standard section gap |
| 5 | 20 | Card vertical padding (comfortable) |
| 6 | 24 | Card vertical padding (roomy), dialog padding, section gap |
| 8 | 32 | Empty-state top padding |
| 12 | 48 | Large vertical padding (success screens) |
| 20 | 80 | Bottom scroll padding to clear the bottom nav |

When in doubt, **16 px** is the default rhythm (side margins, card padding, gaps between stacked cards).

---

## The mobile container (Student-surface)

The student app renders as a **centered single column**, capped at **512 px** wide, on the page surface (`#F5F5F5`). On phones it fills the width; on larger screens it stays a centered 512 px column (the desktop experience is intentionally just the mobile column centered — desktop is out of scope, see README).

```
┌─────────────────────────────┐  viewport (any width)
│        #F5F5F5 page         │
│   ┌───────────────────┐     │
│   │   app column       │    │  ← max-width 512px, centered
│   │   (TopBar)         │    │
│   │   (scroll content) │    │
│   │   (BottomNav)      │    │
│   └───────────────────┘     │
└─────────────────────────────┘
```

- **Side margins:** content sits at **16 px** from the column edges (`px-4`).
- **Vertical page padding:** **16 px** top/bottom for standard screens (`py-4`); larger (48 px) for celebratory/success screens.
- **Section rhythm:** stacked sections/cards are separated by **16 px** (occasionally 20 px on denser dashboards).

### Fixed chrome heights (Student-surface)
| Element | Height |
|---|---|
| TopBar | **56 px** |
| BottomNav | **64 px** |
| Bottom scroll padding (content) | **80 px** (clears the 64 px nav + breathing room) |

The chat room is the one exception to the scroll model: it is a **full-screen fixed overlay** (still capped at 512 px, centered) that covers the BottomNav.

---

## Touch targets (Universal, enforced on Student-surface)

- **Minimum interactive size is 44 × 44 px.** Back button, cart button, remove button, chat input buttons all reserve at least 44 px.
- Bottom-nav items reserve **64 px** minimum width and 44 px height.
- List rows are at least **48 px** tall; comfortable rows 56–72 px.
- Note: the base Button component is only 36 px tall by default — when a button is a *primary touch target on its own*, it is sized up (full-width with 12–24 px vertical padding) to meet 44 px. Don't ship a 36 px button as a lone primary action.

---

## Layout patterns

**Standard scrollable screen:**
```
TopBar (56px, sticky)
└─ content: px-16 py-16, sections gap-16
BottomNav (64px, fixed)
```

**Card internal layout:**
- Padding: 16 px sides; top 16–24 px, bottom 16–20 px (varies by density).
- Internal gaps: 12 px between elements, 8 px for tight clusters.

**Horizontal scrollers** (enrolled courses, filter chips, quick actions): a single row with 8–12 px gaps and hidden scrollbars, overflowing the right edge in RTL.

**Two/three-column tiles** inside cards: equal columns with 12 px gap (stat tiles use 2 columns; quick-stat grids use 3).

---

## Spacing do / don't
- ✅ Snap everything to the 4 px grid.
- ✅ 16 px side margins, always.
- ✅ Leave 80 px of bottom padding on scrollable screens so content clears the nav.
- ❌ Don't use arbitrary one-off paddings outside the scale.
- ❌ Don't let primary buttons fall below 44 px tall.
