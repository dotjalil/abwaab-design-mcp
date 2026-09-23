# AbwaabPlus — Design & Build Documentation

This is the **stack-agnostic specification** for the AbwaabPlus student app. It exists to let a fresh build — by human developers and AI agents, in any framework — reproduce the product faithfully without reverse-engineering the prototype's source code.

The current prototype (Next.js / React / Tailwind) is the **visual and interaction source of truth**. These documents distill it into a neutral contract: colors as hex and role, spacing as a numeric scale, typography as a scale, components by anatomy and behavior, screens by layout and flow. No framework-specific code is required to consume them.

> **Scope:** the **student app, as built**. The prototype implements the student experience only. The PRD (`/AbwaabPlus_PRD.md`) additionally describes Admin, Teacher, and MTA experiences that are **not** built yet and are **not** specified here. See *Multi-surface architecture* below for how this system is designed to extend to them.

---

## Using this as an MCP server

This repo also ships an MCP server (`src/`) that serves these docs to any agent (Claude Code, Cursor, Windsurf, Codex, …) in any project. It reads the markdown and `design-tokens.json` **live from this checkout** — edit a doc and every connected agent sees the change on its next call; no rebuild or restart needed. You only rebuild when the server code in `src/` changes.

### 1. Build once

```bash
cd /path/to/abwaab-plus/design
npm install          # also compiles src/ → dist/ (via the "prepare" script)
npm run smoke        # optional: spawns the server and calls every tool
```

### 2. Connect it

**Claude Code — available in every project (user scope).** Run this from this repo's root; `$(pwd)` fills in the absolute path for you:
```bash
claude mcp add -s user abwaab-design -- node "$(pwd)/dist/index.js"
claude mcp get abwaab-design     # should show ✔ Connected
```
Use `-s project` instead to write a `.mcp.json` into one repo so teammates get it too. Check with `claude mcp list`, or `/mcp` inside a session.

For the configs below, replace `/path/to/abwaab-plus/design` with the absolute path of this repo. Run `pwd` in the repo root to get it. A wrong path makes the client report "connection closed" or "failed".

**Cursor / Windsurf / Claude Desktop / any client with a JSON config** (`~/.cursor/mcp.json`, `claude_desktop_config.json`, …):
```json
{
  "mcpServers": {
    "abwaab-design": {
      "command": "node",
      "args": ["/path/to/abwaab-plus/design/dist/index.js"]
    }
  }
}
```

**Codex** (`~/.codex/config.toml`):
```toml
[mcp_servers.abwaab-design]
command = "node"
args = ["/path/to/abwaab-plus/design/dist/index.js"]
```

**From GitHub instead of a local path:** once this repo is pushed, clients can run it directly with `npx -y github:<org>/<repo>` as the command. It's slower on first start, and you get updates by clearing the npx cache.

To serve a different checkout of the docs than the one the server lives in, set `ABWAAB_DESIGN_DIR=/path/to/docs` in the server's environment.

### 3. What agents get

When an agent connects, the server sends it a short brief: RTL, the Dubai font, tokens are canonical, all CTAs are brand blue, and which source wins when docs and the prototype disagree. Then:

| Tool | Use it for |
|---|---|
| `get_route` | **Start here when building a screen.** Returns the route spec (layout, data, actions, states, test ids) **plus the full spec of every component it's built from.** Accepts `/courses/123`, `/cart`, `home`, … |
| `get_component` | One component's anatomy, variants, states, sizes. Names are matched loosely (`button`, `ring`, `CourseCard`). |
| `get_tokens` | Tokens with aliases resolved. Filter by path (`color.brand`, `spacing`, `typography.styles`), output as `list`, `json`, `css` (custom properties), or `tailwind` (`theme.extend`). |
| `resolve_value` | Lint literal values. `#0066CC` → off-system, nearest is `color.brand.blue`; `600` → weight not shipped, use 700; `18px` → `typography.fontSize.title`. |
| `known_issues` | Prototype inconsistencies, outstanding brand misalignments, and every ⚠ flag in the docs, so agents don't copy prototype bugs. |
| `search_docs` | Keyword search that returns matching *sections*, not whole files. |
| `list_docs` / `read_doc` | Browse the docs, or read a single section by heading. |
| `list_components` / `list_routes` | Indexes. |

It also exposes every doc as a **resource** (`abwaab-design://docs/<id>`, `abwaab-design://tokens`), and two **prompts**:
- `build-screen` (`route`, optional `stack`): a complete context pack for implementing one screen.
- `review-ui` (`code`): a checklist-driven review of UI code against the system.

**Example asks, from any project:**
- *"Build the `/courses/[courseId]` screen in React Native using the abwaab-design MCP."*
- *"Give me the abwaab tokens as a Tailwind theme and wire them into tailwind.config.ts."*
- *"Review `src/components/CartItem.tsx` against the abwaab design system."*

### Developing the server

```bash
npm run dev        # tsc --watch
npm run inspect    # MCP Inspector UI against dist/index.js
npm run smoke      # FULL=1 npm run smoke prints full tool outputs
```

The parser depends on a few doc conventions. Keep them when you edit the docs:
- Components are `##` headings in `design-system/06-components.md`. The tier comes from a `**[U]**`/`**[S]**` marker or from the enclosing `# Part …` heading. Aliases go in the heading as `A / B` or `A (B)`.
- Routes are `##` headings that start with a backticked path (`` ## `/cart` — … ``) in `functional/routes/*.md`. A route file with no such headings is treated as a single route named after the file.
- A route's components come from its `**Components:** A, B (variant), C` line or its `## Components used` paragraph.
- To add a new doc file, add it to `DOC_FILES` in `src/docs.ts`.

---

## The two axes

There are two distinct things you might want to look up, and they are deliberately kept separate:

| Axis | Question it answers | Where it lives |
|---|---|---|
| **Functional** | *What does this screen do?* — UX, routing, data, actions, states, flows | [`functional/`](./functional/) |
| **Design system** | *What does it look like?* — tokens, components, visual treatment | [`design-system/`](./design-system/) |

**Single source of truth per concern.** Tokens and components are defined **once** in the design-system pillar. Functional route docs *reference* them ("built from: CourseCard, TopBar") rather than re-describing visuals. So:

- Want the visual contract for a button or a color? → design-system pillar.
- Want to know what the Course screen does and how a user moves through it? → functional pillar.
- Each route doc links from its behavior down into the components it is built from.

---

## Multi-surface architecture (shared foundation, split surface)

AbwaabPlus is one product with three audiences: **students**, **teachers** (the primary customers — students follow teachers), and **admin/operations** (including MTAs, the human support layer). The intended architecture is:

- **One identity + one backend + one design system**, shared by everyone. A student, a teacher, and an admin are all *users with roles* (RBAC) over one source of truth for courses, enrollments, and payments.
- **Two frontend surfaces**, because form factor and job-to-be-done diverge:
  - **(A) Student app** — mobile-first, consumer, emotional/simple. *This is what's documented here.*
  - **(B) Management console** — desktop-first, data-dense, role-gated; serves teacher, admin, and MTA at different permission levels. *Not yet built.*

To make the design system "combine-ready," the design-system pillar is **tiered**:

- **Universal foundation** — color, typography, spacing, radius, elevation, icons, motion, and the core primitives (Button, Input, Card, Badge, …). Authored to be shared by *both* surfaces.
- **Student-surface conventions** — things specific to the mobile student app: the 512 px container, bottom navigation, top bar, mobile touch targets, consumer-emotional patterns.

When the management console is built, it inherits the universal foundation and adds only console-specific conventions (desktop layout, data tables, etc.). Each design-system doc marks which tier a given rule belongs to.

---

## Document index

### Design system (`design-system/`)
| File | Tier | Contents |
|---|---|---|
| [`00-overview.md`](./design-system/00-overview.md) | — | Design principles, RTL & Arabic, mobile-first, brand, known inconsistencies to resolve |
| [`01-color.md`](./design-system/01-color.md) | Universal | Brand blue, semantic palette, surfaces, full token table, usage rules |
| [`02-typography.md`](./design-system/02-typography.md) | Universal | Dubai font, weights, type scale, RTL text rules |
| [`03-spacing-layout.md`](./design-system/03-spacing-layout.md) | Universal + Student | 4 px scale, container, margins, touch targets, page rhythm |
| [`04-radius-elevation.md`](./design-system/04-radius-elevation.md) | Universal | Radius scale, shadow/elevation rules |
| [`05-iconography-motion.md`](./design-system/05-iconography-motion.md) | Universal | Icon system, sizes, motion & transitions |
| [`06-components.md`](./design-system/06-components.md) | Both (marked) | Every component: anatomy, variants, states, sizing, behavior |
| [`07-visual-patterns.md`](./design-system/07-visual-patterns.md) | Both (marked) | Charts/stats, badge semantics, empty/loading/locked states, RTL patterns |
| [`design-tokens.json`](./design-system/design-tokens.json) | Universal | Machine-readable token export (W3C DTCG format) |

### Functional (`functional/`)
| File | Contents |
|---|---|
| [`00-architecture.md`](./functional/00-architecture.md) | Route tree, layouts, navigation model, state model, data entities |
| [`01-flows.md`](./functional/01-flows.md) | Auth, enrollment, purchase/checkout, access-key flows |
| [`routes/auth.md`](./functional/routes/auth.md) | `/auth`, `/auth/otp`, `/auth/password`, `/auth/register` |
| [`routes/home.md`](./functional/routes/home.md) | `/home` dashboard |
| [`routes/courses.md`](./functional/routes/courses.md) | `/courses`, course detail (3 tabs), file viewer |
| [`routes/explore.md`](./functional/routes/explore.md) | `/explore` browse & purchase |
| [`routes/messages.md`](./functional/routes/messages.md) | `/messages`, chat room (guided / discussion / system) |
| [`routes/profile.md`](./functional/routes/profile.md) | `/profile`, `/profile/academic` |
| [`routes/commerce.md`](./functional/routes/commerce.md) | `/cart`, `/cart/checkout`, `/bundle/[id]` |

---

## How to use these docs

**Human developers / designers:** Start with `design-system/00-overview.md` for principles, then read the foundation files. When building a screen, open its `functional/routes/*.md` doc and follow the "built from" links into `06-components.md`.

**AI agents:** If the `abwaab-design` MCP server is connected, use it (see *Using this as an MCP server* above) instead of reading files directly. Treat `design-system/design-tokens.json` as the canonical token source. For any UI element, resolve its component spec in `06-components.md` (anatomy + states + measurements) and its screen context in the relevant route doc. Every measurement is given concretely (px, hex, ratio) so no inference from framework classes is needed.

**Conventions used throughout:**
- All measurements are concrete: lengths in **px**, colors in **hex**, opacity as a percentage or `color @ NN%`.
- Spacing follows a **4 px base unit**; the scale is listed in `03-spacing-layout.md`.
- The app is **100% RTL (Arabic)**. "Leading/trailing" mean start/end in reading order; explicit left/right is only used where the prototype hard-codes it.
- Arabic UI strings are quoted verbatim where they carry meaning, with an English gloss in parentheses.
- Every interactive element in the prototype carries a stable `data-testid`; these are listed per route so the new build can preserve test selectors.

**Source of truth note:** Where these docs and the PRD disagree, the **prototype (and therefore these docs) wins for visual & interaction design**; the **PRD wins for business rules and unbuilt behavior**. Known divergences are flagged inline.
