#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { DOC_FILES, TOKENS_FILE, findComponent, findRoute, getStore, search, type Route, type Store } from "./docs.js";
import { LOGOS, LOGO_VARIANTS, findLogo, readLogo } from "./identity.js";
import { filterTokens, flattenTokens, lookupValue, toCss, toTailwind } from "./tokens.js";

// Docs live next to the server (repo root). Override to serve a different checkout.
const ROOT = process.env.ABWAAB_DESIGN_DIR
  ? resolve(process.env.ABWAAB_DESIGN_DIR)
  : resolve(dirname(fileURLToPath(import.meta.url)), "..");

const store = () => getStore(ROOT);
const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const json = (v: unknown) => text(JSON.stringify(v, null, 2));
const fail = (t: string) => ({ ...text(t), isError: true });

const INSTRUCTIONS = `AbwaabPlus design system (student app). Use these tools before writing or reviewing any AbwaabPlus UI.

Ground rules:
- The app is 100% RTL Arabic. Use logical properties (start/end), not left/right. Sole typeface: Dubai (weights 300/400/500/700 — no 600).
- design-tokens.json is canonical: never invent colours, spacing, radii or shadows. Check any literal value with \`resolve_value\`.
- All CTAs (incl. add-to-cart / pay / buy) are brand blue #0655CB. Green/red/amber are functional state signals only; yellow is for highlight/promo.
- Logo: never draw, recreate or retype the Abwaab logo — call \`get_logo\` for the right file (colour variants on white/#F5F5F5, \`icon-white\` on brand blue). Never mirror it for RTL.
- Where docs and the prototype disagree the docs win; the PRD wins for business rules. Call \`known_issues\` so you don't copy prototype bugs.

Typical flow: \`get_route\` for the screen → it returns the route spec plus every component spec it's built from → \`get_tokens\` in the format your stack needs.`;

const server = new McpServer({ name: "abwaab-design", version: "0.1.0" }, { instructions: INSTRUCTIONS });

// ---- docs ---------------------------------------------------------------------

server.registerTool(
  "list_docs",
  {
    title: "List design docs",
    description: "List every doc (id, file, title) with its section headings. Use the ids with read_doc.",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  async () => {
    const s = store();
    return json(
      [...s.docs.values()].map((d) => ({
        id: d.id,
        file: d.file,
        title: d.title,
        sections: d.sections.filter((x) => x.level === 2).map((x) => x.heading),
      })),
    );
  },
);

server.registerTool(
  "read_doc",
  {
    title: "Read a design doc",
    description:
      "Read a whole doc by id (see list_docs), or just one section by passing a heading (case-insensitive substring match). Prefer sections — whole docs can be long.",
    inputSchema: {
      id: z.string().describe("Doc id, e.g. 'color', 'components', 'route-courses'."),
      heading: z.string().optional().describe("Optional heading to return just that section, e.g. 'Usage rules'."),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ id, heading }) => {
    const doc = store().docs.get(id);
    if (!doc) return fail(`Unknown doc '${id}'. Valid ids: ${DOC_FILES.map((d) => d.id).join(", ")}`);
    if (!heading) return text(doc.content);
    const k = heading.toLowerCase();
    const matches = doc.sections.filter((s) => s.heading.toLowerCase().includes(k));
    if (!matches.length)
      return fail(`No heading matching '${heading}' in ${doc.file}. Headings:\n- ${doc.sections.map((s) => s.heading).join("\n- ")}`);
    return text(matches.map((s) => `<!-- ${doc.file} › ${s.path} -->\n${s.text}`).join("\n\n---\n\n"));
  },
);

server.registerTool(
  "search_docs",
  {
    title: "Search design docs",
    description: "Keyword search across all docs. Returns the best-matching sections with full text and their location.",
    inputSchema: {
      query: z.string().describe("Keywords, e.g. 'empty state illustration' or 'otp input'."),
      limit: z.number().int().min(1).max(20).default(5),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ query, limit }) => {
    const hits = search(store(), query, limit);
    if (!hits.length) return text(`No matches for '${query}'.`);
    return text(hits.map((h) => `<!-- ${h.section.file} › ${h.section.path} (read_doc id='${h.section.docId}') -->\n${h.section.text}`).join("\n\n---\n\n"));
  },
);

// ---- tokens -------------------------------------------------------------------

server.registerTool(
  "get_tokens",
  {
    title: "Get design tokens",
    description:
      "Design tokens with aliases resolved. Filter by dot path prefix (e.g. 'color.brand', 'spacing', 'typography.styles'). Formats: 'list' (path/value/description — best for reading), 'json' (raw DTCG subtree), 'css' (:root custom properties), 'tailwind' (theme.extend object).",
    inputSchema: {
      path: z.string().optional().describe("Dot-path prefix. Omit for everything."),
      format: z.enum(["list", "json", "css", "tailwind"]).default("list"),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ path, format }) => {
    const s = store();
    const tokens = filterTokens(flattenTokens(s.tokensRaw), path);
    if (!tokens.length) {
      const groups = [...new Set(flattenTokens(s.tokensRaw).map((t) => t.path.split(".").slice(0, 2).join(".")))];
      return fail(`No tokens under '${path}'. Try one of: ${groups.join(", ")}`);
    }
    if (format === "css") return text(toCss(tokens));
    if (format === "tailwind") return json(toTailwind(tokens));
    if (format === "json") {
      let node: any = s.tokensRaw;
      for (const p of (path ?? "").split(".").filter(Boolean)) node = node?.[p];
      return json(node);
    }
    return json(tokens.map((t) => ({ path: t.path, value: t.resolved, ...(t.alias && { alias: t.alias }), ...(t.description && { description: t.description }) })));
  },
);

server.registerTool(
  "resolve_value",
  {
    title: "Resolve raw values to tokens",
    description:
      "Check literal values (hex/rgb colours, px/rem/ms dimensions, font weights) against the token set. Returns the exact token(s) to use, or flags the value as off-system with the nearest tokens. Use it to lint generated code.",
    inputSchema: {
      values: z.array(z.string()).min(1).max(50).describe("e.g. ['#0655CB', '#0066CC', '18px', '600']"),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ values }) => {
    const tokens = flattenTokens(store().tokensRaw);
    return json(values.map((v) => lookupValue(tokens, v)));
  },
);

// ---- components & routes --------------------------------------------------------

server.registerTool(
  "list_components",
  {
    title: "List components",
    description: "All specified components with tier (universal = shared by every surface, student = mobile student app only) and aliases.",
    inputSchema: { tier: z.enum(["universal", "student"]).optional() },
    annotations: { readOnlyHint: true },
  },
  async ({ tier }) =>
    json(
      store()
        .components.filter((c) => !tier || c.tier === tier)
        .map((c) => ({ name: c.name, tier: c.tier, aliases: c.aliases.length > 1 ? c.aliases : undefined })),
    ),
);

server.registerTool(
  "get_component",
  {
    title: "Get component spec",
    description: "Full spec for one component — anatomy, variants, states, sizing, behavior, test ids. Fuzzy name match (e.g. 'button', 'CourseCard', 'ring').",
    inputSchema: { name: z.string() },
    annotations: { readOnlyHint: true },
  },
  async ({ name }) => {
    const s = store();
    const c = findComponent(s, name);
    if (!c) return fail(`No component '${name}'. Known: ${s.components.map((x) => x.name).join(", ")}`);
    return text(`<!-- tier: ${c.tier} -->\n${c.text}`);
  },
);

server.registerTool(
  "list_routes",
  {
    title: "List routes",
    description: "Every screen/route in the student app, with the doc it's specified in.",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  async () => json(store().routes.map((r) => ({ path: r.path, doc: r.docId, components: r.componentRefs }))),
);

function routeBundle(s: Store, r: Route, withComponents: boolean) {
  const parts = [`<!-- route ${r.path} — ${s.docs.get(r.docId)!.file} -->\n${r.text}`];
  if (!withComponents) return parts.join("");
  const seen = new Set<string>();
  const unresolved: string[] = [];
  for (const ref of r.componentRefs) {
    const c = findComponent(s, ref);
    if (!c) {
      unresolved.push(ref);
      continue;
    }
    if (seen.has(c.name)) continue;
    seen.add(c.name);
    parts.push(`<!-- component: ${c.name} (${c.tier}) -->\n${c.text}`);
  }
  if (unresolved.length)
    parts.push(`<!-- Screen-local pieces without a standalone spec (see route text / search_docs): ${[...new Set(unresolved)].join(", ")} -->`);
  return parts.join("\n\n---\n\n");
}

server.registerTool(
  "get_route",
  {
    title: "Get route spec",
    description:
      "Everything needed to build one screen: its functional spec (layout, data, actions, states, test ids) plus the full spec of each component it's built from. Accepts '/courses', '/courses/123', 'cart', etc.",
    inputSchema: {
      path: z.string(),
      include_components: z.boolean().default(true),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ path, include_components }) => {
    const s = store();
    const r = findRoute(s, path);
    if (!r) return fail(`No route '${path}'. Known: ${s.routes.map((x) => x.path).join(", ")}`);
    return text(routeBundle(s, r, include_components));
  },
);

server.registerTool(
  "known_issues",
  {
    title: "Known issues & superseded prototype behavior",
    description:
      "Documented inconsistencies, outstanding brand misalignments, and every ⚠ flag across the docs — things NOT to copy from the prototype. Read before building or reviewing.",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  async () => {
    const s = store();
    const parts: string[] = [];
    const section = (docId: string, heading: string) =>
      s.docs.get(docId)?.sections.find((x) => x.heading.toLowerCase().startsWith(heading.toLowerCase()));
    const inc = section("overview", "Known inconsistencies");
    if (inc) parts.push(`<!-- ${inc.file} -->\n${inc.text}`);
    const brand = section("brand-alignment", "Outstanding misalignment");
    if (brand) parts.push(`<!-- ${brand.file} -->\n${brand.text}`);
    const flags: string[] = [];
    for (const d of s.docs.values()) {
      d.content.split("\n").forEach((line, i) => {
        if (line.includes("⚠")) flags.push(`- ${d.file}:${i + 1} — ${line.trim()}`);
      });
    }
    if (flags.length) parts.push(`## ⚠ flags across all docs\n${flags.join("\n")}`);
    return text(parts.join("\n\n---\n\n"));
  },
);

// ---- identity -----------------------------------------------------------------

const logoGuidance = (s: Store) => s.docs.get("logo")?.sections.find((x) => x.heading.startsWith("Which variant"))?.text ?? "";

server.registerTool(
  "get_logo",
  {
    title: "Get the Abwaab logo",
    description:
      "The official Abwaab logo files — never redraw the logo. Omit variant to list all variants with the rules for choosing one. With a variant: absolute file path, size, allowed background and a preview image; set embed=true to also get a data URI for inlining in standalone HTML/artifacts. Full rules: read_doc id='logo'.",
    inputSchema: {
      variant: z.enum(LOGO_VARIANTS).optional().describe("horizontal (default choice), vertical, icon, icon-white (for brand-blue surfaces)."),
      embed: z.boolean().default(false).describe("Include a data:image/png;base64 URI."),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ variant, embed }) => {
    if (!variant) return text(`${logoGuidance(store())}\n\n## Variants\n${JSON.stringify(LOGOS.map((l) => ({ ...l, path: join(ROOT, l.file) })), null, 2)}`);
    const logo = findLogo(variant)!;
    let data: string;
    try {
      data = readLogo(ROOT, logo);
    } catch {
      return fail(`Logo file missing: ${join(ROOT, logo.file)}`);
    }
    const info = { ...logo, path: join(ROOT, logo.file), ...(embed && { dataUri: `data:image/png;base64,${data}` }) };
    return { content: [{ type: "text" as const, text: JSON.stringify(info, null, 2) }, { type: "image" as const, data, mimeType: "image/png" }] };
  },
);

// ---- resources ----------------------------------------------------------------

for (const d of DOC_FILES) {
  server.registerResource(
    d.id,
    `abwaab-design://docs/${d.id}`,
    { title: d.title, description: d.file, mimeType: "text/markdown" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: store().docs.get(d.id)?.content ?? "" }] }),
  );
}
server.registerResource(
  "tokens",
  "abwaab-design://tokens",
  { title: "Design tokens (DTCG JSON)", description: TOKENS_FILE, mimeType: "application/json" },
  async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(store().tokensRaw, null, 2) }] }),
);

for (const l of LOGOS) {
  server.registerResource(
    `logo-${l.id}`,
    `abwaab-design://${l.file}`,
    { title: `Logo — ${l.id}`, description: l.use, mimeType: "image/png" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "image/png", blob: readLogo(ROOT, l) }] }),
  );
}

// ---- prompts ------------------------------------------------------------------

server.registerPrompt(
  "build-screen",
  {
    title: "Build a screen",
    description: "Context pack for implementing one AbwaabPlus screen: principles, route spec, component specs, tokens, known issues.",
    argsSchema: { route: z.string().describe("e.g. /home, /courses/[courseId], /cart"), stack: z.string().optional().describe("Target stack, e.g. 'React Native', 'Flutter'") },
  },
  ({ route, stack }) => {
    const s = store();
    const r = findRoute(s, route);
    const overview = s.docs.get("overview")!;
    const principles = overview.sections.find((x) => x.heading.startsWith("The five principles"))?.text ?? "";
    const rtl = s.docs.get("visual-patterns")?.sections.find((x) => /RTL patterns/.test(x.heading))?.text ?? "";
    const tokens = toCss(flattenTokens(s.tokensRaw));
    const body = [
      `Implement the AbwaabPlus screen \`${route}\`${stack ? ` in ${stack}` : ""}. Follow the spec below exactly; use tokens, never literal values; preserve every data-testid.`,
      principles,
      rtl,
      r ? routeBundle(s, r, true) : `(No route matched '${route}'. Known: ${s.routes.map((x) => x.path).join(", ")})`,
      ...(r && /logo/i.test(r.text) ? [`${logoGuidance(s)}\n\nGet the files with the \`get_logo\` tool; never redraw the logo.`] : []),
      "## Tokens\n```css\n" + tokens + "\n```",
      "Before finishing, call the `known_issues` tool and make sure none of those prototype issues were copied, then check any literal values with `resolve_value`.",
    ];
    return { messages: [{ role: "user", content: { type: "text", text: body.join("\n\n---\n\n") } }] };
  },
);

server.registerPrompt(
  "review-ui",
  {
    title: "Review UI against the design system",
    description: "Review a UI snippet for token, RTL, typography and component-spec compliance.",
    argsSchema: { code: z.string().describe("The UI code to review") },
  },
  ({ code }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Review this UI code against the AbwaabPlus design system.

1. Extract every literal colour, spacing, radius, font-size/weight and duration and run them through \`resolve_value\`; flag anything off-system and give the token to use.
2. Identify which components it implements and compare against \`get_component\` (variants, sizes, states, test ids).
3. Check RTL (logical start/end, not left/right), Dubai font, no weight 600, CTAs in brand blue.
4. Check \`known_issues\` for prototype behavior that was copied.

Report findings as a list: location → problem → fix.

\`\`\`
${code}
\`\`\``,
        },
      },
    ],
  }),
);

await server.connect(new StdioServerTransport());
