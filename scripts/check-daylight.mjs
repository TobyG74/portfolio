import assert from "node:assert/strict";
import { daylightAt, lampPosition } from "../lib/daylight.js";

const at = (hour, minute = 0, second = 0) => daylightAt(new Date(2026, 9, 11, hour, minute, second));
assert.equal(at(12).daylight, 1);
assert.equal(at(0).night, 1);
assert.equal(at(4).night, 1);
assert.equal(at(20).night, 1);
assert.ok(Math.abs(at(6).daylight - 0.5) < 1e-10);
assert.ok(Math.abs(at(18).daylight - 0.5) < 1e-10);
assert.ok(at(5, 45).daylight < at(6, 15).daylight);
assert.ok(at(17, 45).daylight > at(18, 15).daylight);
assert.ok(at(6).sun[0] > 0 && at(18).sun[0] < 0);
assert.ok(at(12).sun[1] > 0 && at(0).sun[1] < 0);
assert.ok(Math.abs(at(23, 59, 59).sun[0] - at(0).sun[0]) < 0.01, "midnight must not jump");
for (let minute = 0; minute < 1440; minute++) {
  const cycle = at(Math.floor(minute / 60), minute % 60);
  assert.ok(cycle.daylight >= 0 && cycle.daylight <= 1);
  assert.ok(cycle.sun.every(Number.isFinite));
  assert.equal(cycle.daylight + cycle.night, 1);
  const next = at(Math.floor((minute + 1) / 60), (minute + 1) % 60);
  assert.ok(Math.abs(next.daylight - cycle.daylight) < 0.03, "sunrise and sunset must change gradually");
}
const lamp = lampPosition({ pos: [0, 0, -23], h: 6.5 });
assert.ok(lamp.every(Number.isFinite));
assert.ok(lamp[2] > -23 && lamp[2] < 0, "lamps must sit on the village side of each building");
console.log("Daylight checks passed: local clock, dawn, dusk, midnight, and street lamp placement.");
