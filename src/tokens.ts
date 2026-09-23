/** W3C DTCG token handling: flatten, resolve `{alias}` references, export, and reverse-lookup values. */

export interface Token {
  path: string;
  type?: string;
  value: unknown;
  /** Value with every `{alias}` resolved. */
  resolved: unknown;
  alias?: string;
  description?: string;
}

type Json = Record<string, unknown>;

export function flattenTokens(raw: unknown): Token[] {
  const out: Token[] = [];
  const walk = (node: Json, path: string[], inheritedType?: string) => {
    const type = (node.$type as string) ?? inheritedType;
    if ("$value" in node) {
      out.push({
        path: path.join("."),
        type,
        value: node.$value,
        resolved: node.$value,
        alias: typeof node.$value === "string" && /^\{.*\}$/.test(node.$value) ? node.$value.slice(1, -1) : undefined,
        description: node.$description as string | undefined,
      });
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("$") || typeof v !== "object" || v === null) continue;
      walk(v as Json, [...path, k], type);
    }
  };
  walk(raw as Json, []);

  const byPath = new Map(out.map((t) => [t.path, t]));
  const resolve = (v: unknown, seen: Set<string>): unknown => {
    if (typeof v === "string") {
      const m = /^\{(.*)\}$/.exec(v);
      if (!m) return v;
      const target = byPath.get(m[1]);
      if (!target || seen.has(m[1])) return v;
      return resolve(target.value, new Set([...seen, m[1]]));
    }
    if (Array.isArray(v)) return v.map((x) => resolve(x, seen));
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolve(x, seen)]));
    return v;
  };
  for (const t of out) t.resolved = resolve(t.value, new Set([t.path]));
  return out;
}

export function filterTokens(tokens: Token[], prefix?: string): Token[] {
  if (!prefix) return tokens;
  const p = prefix.replace(/\.$/, "");
  return tokens.filter((t) => t.path === p || t.path.startsWith(p + "."));
}

const cssName = (path: string) => "--" + path.replace(/\./g, "-").replace(/_/g, "-");

function cssValue(t: Token): string | undefined {
  const v = t.resolved as any;
  switch (t.type) {
    case "shadow":
      return `${v.offsetX} ${v.offsetY} ${v.blur} ${v.spread} ${v.color}`;
    case "gradient":
      return `linear-gradient(135deg, ${v.map((s: any) => `${s.color} ${s.position * 100}%`).join(", ")})`;
    case "fontFamily":
      return (Array.isArray(v) ? v : [v]).map((f: string) => (/\s/.test(f) ? `"${f}"` : f)).join(", ");
    case "typography":
      return `${v.fontWeight} ${v.fontSize}/${v.lineHeight} ${cssValue({ ...t, type: "fontFamily", resolved: v.fontFamily })}`;
    default:
      return typeof v === "string" || typeof v === "number" ? String(v) : undefined;
  }
}

export function toCss(tokens: Token[]): string {
  const lines = tokens
    .map((t) => {
      const v = cssValue(t);
      return v === undefined ? undefined : `  ${cssName(t.path)}: ${v};`;
    })
    .filter(Boolean);
  return `:root {\n${lines.join("\n")}\n}`;
}

/** A Tailwind `theme.extend` object built from the token groups that map onto Tailwind keys. */
export function toTailwind(tokens: Token[]): Json {
  const theme: Record<string, Json> = {};
  const set = (key: string, path: string[], value: unknown) => {
    let node: Json = (theme[key] ??= {});
    path.slice(0, -1).forEach((p) => (node = (node[p] ??= {}) as Json));
    node[path[path.length - 1]] = value;
  };
  for (const t of tokens) {
    const [group, ...rest] = t.path.split(".");
    const css = cssValue(t);
    if (group === "color") set("colors", rest, t.resolved);
    else if (group === "spacing") set("spacing", [rest.join(".").replace("_", ".")], t.resolved);
    else if (group === "radius") set("borderRadius", rest, t.resolved);
    else if (group === "elevation") set("boxShadow", rest, css);
    else if (t.path.startsWith("typography.fontSize.")) set("fontSize", rest.slice(1), t.resolved);
    else if (t.path.startsWith("typography.fontWeight.")) set("fontWeight", rest.slice(1), String(t.resolved));
    else if (t.path.startsWith("typography.fontFamily.")) set("fontFamily", rest.slice(1), t.resolved);
    else if (t.path.startsWith("typography.lineHeight.")) set("lineHeight", rest.slice(1), t.resolved);
    else if (t.path.startsWith("motion.duration.")) set("transitionDuration", rest.slice(1), t.resolved);
    else if (group === "gradient") set("backgroundImage", rest, css);
  }
  return theme;
}

// ---- reverse lookup ----------------------------------------------------------

function parseHex(input: string): { rgb: [number, number, number]; alpha: number; hex: string } | undefined {
  // Require the "#" so bare numbers like "600" aren't read as 3-digit hex.
  const m = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(input.trim());
  if (!m) return undefined;
  let h = m[1];
  if (h.length <= 4) h = [...h].map((c) => c + c).join("");
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return { rgb: [n(0), n(2), n(4)], alpha: h.length === 8 ? n(6) / 255 : 1, hex: "#" + h.toUpperCase() };
}

function parseRgb(input: string) {
  const m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(input.trim());
  if (!m) return undefined;
  const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  const rgb: [number, number, number] = [+m[1], +m[2], +m[3]];
  const bytes = a < 1 ? [...rgb, Math.round(a * 255)] : rgb;
  const hex = "#" + bytes.map((c) => c.toString(16).padStart(2, "0")).join("").toUpperCase();
  return { rgb, alpha: a, hex };
}

// Weighted RGB distance ("redmean") — cheap and good enough to rank near misses.
function colorDistance(a: [number, number, number], b: [number, number, number]) {
  const r = (a[0] + b[0]) / 2;
  const [dr, dg, db] = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  return Math.sqrt((2 + r / 256) * dr * dr + 4 * dg * dg + (2 + (255 - r) / 256) * db * db);
}

export interface Lookup {
  input: string;
  kind: "color" | "dimension" | "number" | "unknown";
  onSystem: boolean;
  exact: { path: string; value: unknown; description?: string }[];
  nearest: { path: string; value: unknown; distance: number }[];
  note?: string;
}

export function lookupValue(tokens: Token[], input: string): Lookup {
  const color = parseHex(input) ?? parseRgb(input);
  if (color) {
    const colorTokens = tokens.filter((t) => t.type === "color" && typeof t.resolved === "string");
    const exact = colorTokens.filter((t) => parseHex(t.resolved as string)?.hex === color.hex);
    // Several tokens alias the same value; list each distinct value once.
    const nearest = colorTokens
      .map((t) => ({ t, c: parseHex(t.resolved as string) }))
      .filter((x) => x.c && x.c.hex !== color.hex)
      .map((x) => ({ path: x.t.path, value: x.t.resolved, distance: Math.round(colorDistance(color.rgb, x.c!.rgb)) }))
      .sort((a, b) => a.distance - b.distance)
      .filter((x, i, arr) => arr.findIndex((y) => y.value === x.value) === i)
      .slice(0, 3);
    return {
      input,
      kind: "color",
      onSystem: exact.length > 0,
      exact: exact.map((t) => ({ path: t.path, value: t.resolved, description: t.description })),
      nearest,
      note:
        color.alpha < 1 && !exact.length
          ? "Input has alpha. Tints are expressed as `token @ NN%` (see visual-patterns › Tint ladder) — compare the base colour."
          : undefined,
    };
  }

  const dim = /^(-?[\d.]+)\s*(px|ms|rem)?$/i.exec(input.trim());
  if (dim) {
    const num = parseFloat(dim[1]);
    const unit = (dim[2] ?? "").toLowerCase();
    const px = unit === "rem" ? num * 16 : num;
    const isWeight = !unit && Number.isInteger(num) && num >= 100 && num <= 900 && num % 100 === 0;
    const candidates = tokens.filter((t) => {
      const v = t.resolved;
      if (unit === "ms") return typeof v === "string" && v.endsWith("ms");
      if (isWeight) return t.path.startsWith("typography.fontWeight.");
      return typeof v === "string" && v.endsWith("px");
    });
    const numeric = (v: unknown) => (typeof v === "number" ? v : parseFloat(String(v)));
    const exact = candidates.filter((t) => numeric(t.resolved) === px);
    const nearest = candidates
      .filter((t) => numeric(t.resolved) !== px)
      .map((t) => ({ path: t.path, value: t.resolved, distance: Math.abs(numeric(t.resolved) - px) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
    let note: string | undefined;
    if (isWeight && !exact.length)
      note = num === 600 ? "Weight 600 (semibold) is not shipped for Dubai — use 700 (typography.fontWeight.bold)." : "Dubai ships 300/400/500/700 only.";
    else if (!exact.length && unit !== "ms" && px % 4 !== 0)
      note = "Off-system and not a multiple of the 4px base unit — use the nearest `spacing.*` token.";
    return {
      input,
      kind: isWeight ? "number" : "dimension",
      onSystem: exact.length > 0,
      exact: exact.map((t) => ({ path: t.path, value: t.resolved, description: t.description })),
      nearest,
      note,
    };
  }

  return { input, kind: "unknown", onSystem: false, exact: [], nearest: [], note: "Pass a hex with # (#0655CB), rgb(), px/rem/ms dimension, or a bare number (font weight)." };
}
