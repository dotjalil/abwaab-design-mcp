// End-to-end check: spawns the built server over stdio and calls every tool.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "smoke", version: "0" });
await client.connect(new StdioClientTransport({ command: "node", args: ["dist/index.js"] }));

const calls = [
  ["list_docs", {}],
  ["read_doc", { id: "color", heading: "usage rules" }],
  ["search_docs", { query: "empty state", limit: 2 }],
  ["get_tokens", { path: "color.role", format: "list" }],
  ["get_tokens", { path: "elevation", format: "css" }],
  ["get_tokens", { format: "tailwind" }],
  ["resolve_value", { values: ["#0655cb", "#0066CC", "18px", "16px", "600", "rgba(0,0,0,0.5)"] }],
  ["list_components", {}],
  ["get_component", { name: "ring" }],
  ["list_routes", {}],
  ["get_route", { path: "/courses/abc123" }],
  ["known_issues", {}],
];

let failed = 0;
for (const [name, args] of calls) {
  const res = await client.callTool({ name, arguments: args });
  const out = res.content[0].text;
  if (res.isError) failed++;
  console.log(`\n=== ${name} ${JSON.stringify(args)} ${res.isError ? "ERROR" : "ok"} (${out.length} chars)`);
  console.log(process.env.FULL ? out : out.slice(0, 600));
}
const { resources } = await client.listResources();
const { prompts } = await client.listPrompts();
const p = await client.getPrompt({ name: "build-screen", arguments: { route: "/home" } });
console.log(`\nresources: ${resources.length}, prompts: ${prompts.map((x) => x.name).join(", ")}, build-screen: ${p.messages[0].content.text.length} chars`);
await client.close();
process.exit(failed ? 1 : 0);
