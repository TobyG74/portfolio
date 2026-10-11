/**
 * Every model in this world is referenced by a bare name in a data table, and
 * a typo or a deleted source pack only shows up as an invisible prop in the
 * browser. This scans the tables as TEXT (they use @/ aliases Node cannot
 * resolve) and asserts each referenced file is actually on disk.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = "public/models";
const SOURCES = [
  "lib/npcs.js",
  "lib/game.js",
  "components/RpgWorld.jsx",
];

const available = new Map(); // bare name -> folder it lives in
for (const dir of fs.readdirSync(ROOT)) {
  const full = path.join(ROOT, dir);
  if (!fs.statSync(full).isDirectory()) continue;
  for (const file of fs.readdirSync(full)) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== ".fbx" && ext !== ".glb" && ext !== ".obj") continue;
    available.set(path.basename(file, ext), dir);
  }
}

const referenced = new Map(); // name -> where it was written
for (const src of SOURCES) {
  const text = fs.readFileSync(src, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/\bmodel:\s*"([^"]+)"/g)) {
      if (!referenced.has(m[1])) referenced.set(m[1], `${src}:${i + 1}`);
    }
  });
}

assert.ok(referenced.size > 0, "found no model references at all, the regex is wrong");

const missing = [];
for (const [name, where] of referenced) {
  if (!available.has(name)) missing.push(`${name} (referenced at ${where})`);
}

if (missing.length) {
  console.error("missing model files:");
  for (const m of missing) console.error("  -", m);
}
assert.equal(missing.length, 0, `${missing.length} referenced model file(s) not in ${ROOT}`);

const byFolder = new Map();
for (const [name] of referenced) {
  const folder = available.get(name);
  byFolder.set(folder, (byFolder.get(folder) || 0) + 1);
}

console.log(
  "referenced:",
  [...byFolder].map(([f, n]) => `${f}=${n}`).join(" "),
  `(${referenced.size} models, all present)`
);

// unused files are not an error, but worth knowing about before a deploy
const unused = [...available.keys()].filter((n) => !referenced.has(n));
if (unused.length) console.log("unused    :", unused.join(" "));

console.log("\nall asset checks passed");
