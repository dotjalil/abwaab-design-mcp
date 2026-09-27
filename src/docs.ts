import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/** Every doc the server exposes. `id` is the stable handle agents pass to tools. */
export const DOC_FILES: { id: string; file: string; title: string }[] = [
  { id: "readme", file: "README.md", title: "Index & conventions" },
  { id: "overview", file: "design-system/00-overview.md", title: "Design principles, RTL, known inconsistencies" },
  { id: "color", file: "design-system/01-color.md", title: "Color" },
  { id: "typography", file: "design-system/02-typography.md", title: "Typography" },
  { id: "spacing-layout", file: "design-system/03-spacing-layout.md", title: "Spacing & layout" },
  { id: "radius-elevation", file: "design-system/04-radius-elevation.md", title: "Radius & elevation" },
  { id: "iconography-motion", file: "design-system/05-iconography-motion.md", title: "Iconography & motion" },
  { id: "components", file: "design-system/06-components.md", title: "Components" },
  { id: "visual-patterns", file: "design-system/07-visual-patterns.md", title: "Visual patterns" },
  { id: "logo", file: "design-system/08-logo.md", title: "Logo & identity" },
  { id: "brand-alignment", file: "brand-alignment.md", title: "Brand alignment — outstanding items" },
  { id: "architecture", file: "functional/00-architecture.md", title: "Route tree, layouts, state & data model" },
  { id: "flows", file: "functional/01-flows.md", title: "Key user flows" },
  { id: "route-auth", file: "functional/routes/auth.md", title: "Routes — auth" },
  { id: "route-home", file: "functional/routes/home.md", title: "Routes — home" },
  { id: "route-courses", file: "functional/routes/courses.md", title: "Routes — courses" },
  { id: "route-explore", file: "functional/routes/explore.md", title: "Routes — explore" },
  { id: "route-messages", file: "functional/routes/messages.md", title: "Routes — messages" },
  { id: "route-profile", file: "functional/routes/profile.md", title: "Routes — profile" },
  { id: "route-commerce", file: "functional/routes/commerce.md", title: "Routes — commerce" },
];

export const TOKENS_FILE = "design-system/design-tokens.json";

export interface Doc {
  id: string;
  file: string;
  title: string;
  content: string;
  sections: Section[];
}

export interface Section {
  docId: string;
  file: string;
  heading: string;
  level: number;
  /** Heading trail, e.g. "Components › Part 1 — Universal primitives › Button". */
  path: string;
  /** Heading line + body up to the next heading of the same or higher level. */
  text: string;
}

export interface Component {
  name: string;
  aliases: string[];
  tier: "universal" | "student" | "unknown";
  text: string;
}

export interface Route {
  path: string;
  docId: string;
  text: string;
  /** Raw component names listed in the route doc. */
  componentRefs: string[];
}

export interface Store {
  root: string;
  docs: Map<string, Doc>;
  tokensRaw: unknown;
  components: Component[];
  routes: Route[];
}

export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function parseSections(docId: string, file: string, content: string): Section[] {
  const lines = content.split("\n");
  const heads: { line: number; level: number; heading: string }[] = [];
  let inFence = false;
  lines.forEach((l, i) => {
    if (l.startsWith("```")) inFence = !inFence;
    const m = !inFence && /^(#{1,6})\s+(.*)$/.exec(l);
    if (m) heads.push({ line: i, level: m[1].length, heading: m[2].trim() });
  });
  const trail: string[] = [];
  return heads.map((h, idx) => {
    trail.length = h.level - 1;
    trail[h.level - 1] = h.heading;
    let end = lines.length;
    for (let j = idx + 1; j < heads.length; j++) {
      if (heads[j].level <= h.level) {
        end = heads[j].line;
        break;
      }
    }
    return {
      docId,
      file,
      heading: h.heading,
      level: h.level,
      path: trail.filter(Boolean).join(" › "),
      text: lines.slice(h.line, end).join("\n").trim(),
    };
  });
}

/** "RingChart (RingProgress) — see `07…`" → ["RingChart", "RingProgress"]. */
function componentNames(heading: string): string[] {
  const clean = heading
    .replace(/\*\*\[[^\]]*\]\*\*/g, "")
    .replace(/—.*$/, "")
    .trim();
  const inParens = [...clean.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]);
  const outside = clean.replace(/\([^)]*\)/g, "");
  return [outside, ...inParens]
    .flatMap((s) => s.split(/\s*[/+]\s*/))
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseComponents(docs: Map<string, Doc>): Component[] {
  const comps = docs.get("components");
  const patterns = docs.get("visual-patterns");
  if (!comps) return [];
  const out: Component[] = [];
  let partTier: Component["tier"] = "unknown";
  for (const s of comps.sections) {
    if (s.level === 1 && /^Part/.test(s.heading)) {
      partTier = /\[S\]|Student/i.test(s.heading) ? "student" : "universal";
      continue;
    }
    if (s.level !== 2 || /index/i.test(s.heading)) continue;
    const tier = /\[U\]/.test(s.heading) ? "universal" : /\[S\]/.test(s.heading) ? "student" : partTier;
    const names = componentNames(s.heading);
    let text = s.text;
    // Pointer entries ("see 07-visual-patterns.md") get the full spec appended.
    if (/07-visual-patterns/.test(s.heading) && patterns) {
      const keys = names.map(norm);
      const full = patterns.sections.find((p) => p.level === 3 && keys.some((k) => norm(p.heading).startsWith(k)));
      if (full) text += `\n\n---\n_From 07-visual-patterns.md:_\n\n${full.text}`;
    }
    out.push({ name: names[0], aliases: names, tier, text });
  }
  return out;
}

function parseRoutes(docs: Map<string, Doc>): Route[] {
  const out: Route[] = [];
  const refsIn = (text: string): string[] => {
    const lists: string[] = [];
    for (const m of text.matchAll(/\*\*Components:\*\*\s*([^\n]*?)(?:\*\*Test ids?:\*\*|$)/gm)) lists.push(m[1]);
    for (const m of text.matchAll(/## Components used\n([^\n]*)/g)) lists.push(m[1]);
    return lists.flatMap((l) =>
      l
        .replace(/\(→.*$/, "")
        .replace(/\([^)]*\)/g, "")
        .split(/[,/]/)
        .map((s) => s.replace(/[.*`]/g, "").trim())
        .filter(Boolean),
    );
  };
  for (const doc of docs.values()) {
    if (!doc.id.startsWith("route-")) continue;
    const routeSections = doc.sections.filter((s) => s.level === 2 && /^`\/[^`]*`/.test(s.heading));
    if (routeSections.length === 0) {
      // Single-route file (home, explore): the whole doc is the route.
      out.push({ path: "/" + doc.id.slice("route-".length), docId: doc.id, text: doc.content, componentRefs: refsIn(doc.content) });
      continue;
    }
    for (const s of routeSections) {
      const path = /^`([^`]*)`/.exec(s.heading)![1];
      out.push({ path, docId: doc.id, text: s.text, componentRefs: refsIn(s.text) });
    }
  }
  return out;
}

let cache: { stamp: string; store: Store } | undefined;

/** Loads all docs, re-parsing only when a file changed on disk (so edits show up without a restart). */
export function getStore(root: string): Store {
  const files = [...DOC_FILES.map((d) => d.file), TOKENS_FILE];
  const stamp = files
    .map((f) => {
      try {
        return statSync(join(root, f)).mtimeMs;
      } catch {
        return 0;
      }
    })
    .join(",");
  if (cache?.stamp === stamp) return cache.store;

  const docs = new Map<string, Doc>();
  for (const d of DOC_FILES) {
    let content: string;
    try {
      content = readFileSync(join(root, d.file), "utf8");
    } catch {
      continue;
    }
    docs.set(d.id, { ...d, content, sections: parseSections(d.id, d.file, content) });
  }
  const tokensRaw = JSON.parse(readFileSync(join(root, TOKENS_FILE), "utf8"));
  const store: Store = { root, docs, tokensRaw, components: parseComponents(docs), routes: parseRoutes(docs) };
  cache = { stamp, store };
  return store;
}

export function findComponent(store: Store, name: string): Component | undefined {
  const k = norm(name);
  if (!k) return undefined;
  return (
    store.components.find((c) => c.aliases.some((a) => norm(a) === k)) ??
    store.components.find((c) => c.aliases.some((a) => norm(a).startsWith(k) || k.startsWith(norm(a))))
  );
}

/** Accepts "/courses/abc", "/courses/[courseId]", "courses", "cart". */
export function findRoute(store: Store, input: string): Route | undefined {
  const p = "/" + input.trim().replace(/^\/+|\/+$/g, "");
  const exact = store.routes.find((r) => r.path === p);
  if (exact) return exact;
  return store.routes.find((r) => {
    const re = new RegExp("^" + r.path.replace(/\[[^\]]+\]/g, "[^/]+").replace(/\/$/, "") + "/?$");
    return re.test(p);
  });
}

/** Simple term-frequency search over sections, weighting heading hits. */
export function search(store: Store, query: string, limit: number) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 1);
  if (!terms.length) return [];
  const results: { section: Section; score: number }[] = [];
  for (const doc of store.docs.values()) {
    for (const s of doc.sections) {
      if (s.level === 1) continue; // whole-file sections would always win
      const body = s.text.toLowerCase();
      const head = s.heading.toLowerCase();
      let score = 0;
      let matched = 0;
      for (const t of terms) {
        const hits = body.split(t).length - 1;
        if (hits) matched++;
        score += Math.min(hits, 10) + (head.includes(t) ? 8 : 0);
      }
      if (!score) continue;
      score *= matched / terms.length; // favour sections matching every term
      score /= Math.sqrt(1 + s.text.length / 2000); // don't let huge sections dominate
      results.push({ section: s, score });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
