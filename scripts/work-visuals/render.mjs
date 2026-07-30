/**
 * Renders every reconstructed work panel to public/work/rebuilt/.
 *
 *   node scripts/work-visuals/render.mjs
 *
 * Output is committed: the site stays fully static and the panels are only
 * regenerated when their source module changes.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { panels as cityscoot } from "./cityscoot.mjs";
import { panels as ple } from "./ple.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "..", "public", "work", "rebuilt");

const all = [...cityscoot, ...ple];

mkdirSync(outDir, { recursive: true });

let bytes = 0;
for (const [name, build] of all) {
  const markup = build();
  const file = join(outDir, `${name}.svg`);
  writeFileSync(file, markup, "utf8");
  bytes += Buffer.byteLength(markup);
  console.log(`${name}.svg  ${(Buffer.byteLength(markup) / 1024).toFixed(1)} kB`);
}
console.log(`\n${all.length} panels · ${(bytes / 1024).toFixed(1)} kB total`);
