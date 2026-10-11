import assert from "node:assert/strict";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants.js";
import nextConfig from "../next.config.mjs";

const dev = nextConfig(PHASE_DEVELOPMENT_SERVER);
const build = nextConfig(PHASE_PRODUCTION_BUILD);
const start = nextConfig(PHASE_PRODUCTION_SERVER);

assert.equal(dev.distDir, ".next-dev");
assert.equal(build.distDir, ".next");
assert.equal(start.distDir, build.distDir, "production server must read the production build");
assert.notEqual(dev.distDir, build.distDir, "a production build must not overwrite dev bundles");
assert.equal(dev.reactStrictMode, true);
assert.deepEqual(dev.transpilePackages, ["three"]);
console.log("Next config checks passed: development and production output are isolated.");
