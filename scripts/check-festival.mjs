/**
 * Pins the birthday behaviour so it cannot silently stop firing, and so it is
 * testable without waiting a year for the date to come round.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  BIRTHDAY,
  BIRTHDAY_FALLBACK,
  BIRTHDAY_GOSSIP,
  BIRTHDAY_LINES,
  birthdayLineFor,
  isBirthday,
} from "../lib/festival.js";

// month is written 1 based in the config, but Date takes it 0 based
const on = (y, m, d) => new Date(y, m - 1, d, 12, 0, 0);

assert.equal(isBirthday(on(2026, 7, 30)), true, "30 July 2026 must be the birthday");
assert.equal(isBirthday(on(2031, 7, 30)), true, "it must fire every year, not just once");
assert.equal(isBirthday(on(2026, 7, 29)), false, "the day before must be ordinary");
assert.equal(isBirthday(on(2026, 7, 31)), false, "the day after must be ordinary");
assert.equal(isBirthday(on(2026, 6, 30)), false, "30 June is not 30 July");
assert.equal(isBirthday(on(2026, 12, 30)), false, "the day alone must not be enough");

// edge of the day: the first and last minute both count
assert.equal(isBirthday(new Date(2026, 6, 30, 0, 0, 0)), true, "midnight starts the day");
assert.equal(isBirthday(new Date(2026, 6, 30, 23, 59, 59)), true, "it lasts until midnight");

assert.equal(BIRTHDAY.month, 7);
assert.equal(BIRTHDAY.day, 30);

// every villager must get a line, and no line may be a duplicate of another,
// or the village would sound like it is reading one card aloud
const lines = Object.values(BIRTHDAY_LINES);
assert.ok(lines.length >= 10, `only ${lines.length} villager lines written`);
assert.equal(new Set(lines).size, lines.length, "two villagers share the same line");
for (const [id, line] of Object.entries(BIRTHDAY_LINES)) {
  assert.ok(line.length > 20, `${id}'s line is too short to read as speech`);
  assert.ok(!line.includes("—"), `${id}'s line still contains an em dash`);
}

// an unknown villager must still say something rather than crash on undefined
assert.equal(birthdayLineFor("nobody-here"), BIRTHDAY_FALLBACK);
assert.equal(birthdayLineFor(undefined), BIRTHDAY_FALLBACK);
assert.equal(birthdayLineFor("sage"), BIRTHDAY_LINES.sage);

// gossip pairs are call and response, so both halves must exist
for (const pair of BIRTHDAY_GOSSIP) {
  assert.equal(pair.length, 2, "a gossip exchange needs exactly two lines");
  assert.ok(pair[0].length > 10 && pair[1].length > 10, "gossip lines too short");
}


/**
 * The floating shouts live on each villager in lib/npcs.js, which imports the
 * @/ alias and so cannot be loaded under plain Node. Scan it as text instead:
 * what matters is that no two villagers say the same thing, which is what a
 * shared pool of lines could never guarantee.
 */
const npcSource = fs.readFileSync("lib/npcs.js", "utf8");

// Only speaking villagers carry a `role`; houses, landmarks, animals and the
// gossip spots also have an `id`, which is why a bare id scan overcounted.
const blocks = npcSource.split(/\n\s{2}\{/).filter((b) => /\n\s{4}role: "/.test(b));
const ids = blocks.map((b) => b.match(/\n\s{4}id: "([^"]+)"/)?.[1]).filter(Boolean);
const shouts = blocks.map((b) => b.match(/\n\s{4}shout: "([^"]+)"/)?.[1]).filter(Boolean);

assert.ok(ids.length >= 16, `expected at least 16 villagers, found ${ids.length}`);
assert.equal(
  shouts.length,
  ids.length,
  `${ids.length} villagers but ${shouts.length} shouts; missing on: ${ids
    .filter((_, i) => !blocks[i].includes("shout:"))
    .join(", ")}`
);
assert.equal(
  new Set(shouts).size,
  shouts.length,
  `two villagers shout the same line: ${shouts.filter((s, i) => shouts.indexOf(s) !== i).join(" | ")}`
);
for (const s of shouts) {
  assert.ok(s.length > 12 && s.length < 45, `shout is a bad length for a bubble: "${s}"`);
  assert.ok(!s.includes("—"), `shout still contains an em dash: "${s}"`);
}

/**
 * The whole world speaks Indonesian, so villager names and roles must too.
 * They were half translated once, with English titles sitting next to
 * Indonesian ones, and nothing but a reader would have caught it.
 */
const ENGLISH = [
  "sage", "archivist", "unit circuit", "master forge", "pathfinder", "bard",
  "guild master", "courier", "keeper of logs", "gate warden", "loremaster",
  "scholar", "automaton", "blacksmith", "guide", "storyteller", "quest giver",
  "messenger", "save point", "tutorial", "cook", "gardener", "minstrel",
  "herbalist", "scribe", "villager",
];

const names = blocks.map((b) => b.match(/\n\s{4}name: "([^"]+)"/)?.[1]).filter(Boolean);
const roles = blocks.map((b) => b.match(/\n\s{4}role: "([^"]+)"/)?.[1]).filter(Boolean);
assert.equal(names.length, ids.length, "every villager needs a name");
assert.equal(roles.length, ids.length, "every villager needs a role");

for (const text of [...names, ...roles]) {
  const lower = text.toLowerCase();
  const hit = ENGLISH.find((w) => lower === w || lower.includes(w));
  assert.ok(!hit, `"${text}" is still English ("${hit}"); the world speaks Indonesian`);
}
assert.equal(new Set(names).size, names.length, "two villagers share a name");

/**
 * Every gossiping pair must own its birthday script. Sharing one pool made
 * both pairs recite the same exchange on the same beat, which read as two
 * villagers with identical dialogue. Same failure as the shouts, so it gets
 * the same guard.
 */
const gossipSection = npcSource.slice(npcSource.indexOf("export const gossips"));
const festiveBlocks = [...gossipSection.matchAll(/festive: \[([^\]]*)\]/g)].map((m) => m[1]);
const festiveLines = festiveBlocks.flatMap((b) => [...b.matchAll(/"([^"]+)"/g)].map((m) => m[1]));

assert.ok(
  festiveBlocks.length >= 4,
  `expected a festive script per speaker, found ${festiveBlocks.length}`
);
assert.equal(
  new Set(festiveLines).size,
  festiveLines.length,
  `two gossips share a line: ${festiveLines.filter((l, i) => festiveLines.indexOf(l) !== i).join(" | ")}`
);
// and none of them may collide with a villager's floating shout either
for (const line of festiveLines) {
  assert.ok(!shouts.includes(line), `a gossip line duplicates a shout: "${line}"`);
}

console.log("birthday :", `${BIRTHDAY.day}/${BIRTHDAY.month}, every year`);
console.log("shouts   :", `${shouts.length} villagers, all distinct`);
console.log("villagers:", `${lines.length} unique lines + fallback`);
console.log(
  "gossip   :",
  `${festiveBlocks.length} speakers with their own script, ${festiveLines.length} lines, all distinct`
);
console.log("today    :", isBirthday() ? "IS the birthday, decorations are up" : "an ordinary day");
console.log("\nall festival checks passed");
