# Radius & Elevation

**Tier: Universal foundation.**

---

## Corner radius

The radius scale is derived from a single base of **12 px**. Everything is rounded; there are no sharp corners in the UI.

| Token | px | Use |
|---|---|---|
| `radius/checkbox` | 4 | Checkbox only (a literal one-off, not part of the derived scale) |
| `radius/sm` | 8 | Small controls *(derived: base − 4)* |
| `radius/md` | **10** | **Buttons, inputs, select triggers** *(derived: base − 2)* |
| `radius/lg` (base) | **12** | **The default.** Dialog, tabs list, segmented controls, inner tiles, list rows, sunken tiles |
| `radius/xl` | **16** | **Cards**, cover/icon tiles, QR image, status banners |
| `radius/2xl` | 20 | Course-header cover tile, chat bubbles (`rounded-2xl`), bottom-sheet top corners |
| `radius/full` | 9999 | Avatars, badges/pills, chips, progress tracks, dots, circular buttons |

**Practical defaults:**
- **Cards → 16 px.**
- **Buttons & inputs → 10 px** (`radius/md`; an 8–12 px band is acceptable if a system prefers a rounder or squarer control).
- **Pills, chips, badges, avatars, progress bars → fully round.**
- **Icon/cover tiles → 12–16 px** (standardize on 16; the bundle page's 12 px is an inconsistency to fix — see `00-overview.md`).
- **Chat bubbles → 20 px** (`radius/2xl`), with the corner nearest the sender "notched" to a small radius (the tail): student bubble has a small bottom-trailing corner, other bubble a small bottom-leading corner.

---

## Elevation (shadows)

Elevation is **deliberately subtle**. The design relies on the gray page surface + white cards + hairline borders for separation, not heavy shadows.

| Level | Shadow | Use |
|---|---|---|
| **0 — flat** | none (border only) | Most list rows, inset tiles, the top bar's line |
| **1 — resting card** | very soft, ~1 dp (`shadow-sm`) | Cards at rest, active segmented-tab pill |
| **1→2 — hover** | soft, ~2 dp (`shadow-md`) | Cards on hover/press (tappable cards lift slightly) |
| **2 — floating** | medium (`shadow-md`) | Dropdown/select popovers |
| **3 — overlay** | larger (`shadow-lg`) | Dialogs and sheets |

Rules:
- **Cards use `shadow-sm` at rest**, lifting to `shadow-md` only on hover/press if tappable.
- **No `shadow-xl` or heavier** on inline content. Heavy shadow is reserved for true overlays (dialog/sheet).
- The **TopBar** has *no* drop shadow — just a 1 px bottom hairline (`#E5E7EB`).
- Borders do much of the separation work: cards and inputs carry a 1 px `#E5E7EB` border; dividers are 1 px `#E5E7EB`.

### The one gradient
The course detail **header** uses a 135° linear gradient from `#0655CB` (brand blue) to `#002F77` (brand navy). This is the only gradient in the system; everywhere else, fills are flat. Status banners use flat ~10% tints, not gradients (the explore bundle banner's subtle yellow→orange gradient is a minor exception and may be flattened).

---

## Do / don't
- ✅ Round everything; cards 16, controls 8–12, pills full.
- ✅ Keep shadows at 1–2 dp for inline content.
- ✅ Use borders + surface contrast as the primary separation tool.
- ❌ No sharp corners.
- ❌ No heavy shadows on cards or rows.
- ❌ No gradients except the course header.
