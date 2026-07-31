import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const script = await readFile(
  new URL("../savepinner-pinterest-helper.user.js", import.meta.url),
  "utf8",
);

for (const marker of [
  "// ==UserScript==",
  "// @version      0.1.0",
  "// @license      MIT",
  "// @homepageURL  https://savepinner.com/pinterest-downloader/",
  "// @supportURL   https://github.com/jiankn/savepinner-pinterest-helper/issues",
  "// @grant        GM_setClipboard",
  "// @grant        GM_openInTab",
]) {
  assert.ok(script.includes(marker), `Missing metadata: ${marker}`);
}

assert.ok(!script.includes("@require"), "External code is not allowed");
assert.ok(!/\beval\s*\(/.test(script), "eval() is not allowed");
assert.ok(!/utm_(?:source|medium|campaign)=/.test(script), "Tracking parameters are not allowed");
assert.ok(script.includes("Copy clean Pin URL"), "The script needs standalone functionality");
assert.ok(script.includes("Copy URL & open SavePinner"), "The product workflow is missing");

console.log("Userscript metadata and policy checks passed.");
