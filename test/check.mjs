import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const script = await readFile(
  new URL("../savepinner-pinterest-helper.user.js", import.meta.url),
  "utf8",
);

for (const marker of [
  "// ==UserScript==",
  "// @version      0.1.2",
  "// @license      MIT",
  "// @homepageURL  https://savepinner.com/",
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
assert.ok(script.includes('Image: "https://savepinner.com/"'), "Image Pins must open the homepage");
assert.ok(
  script.includes('Video: "https://savepinner.com/pinterest-video-downloader/"'),
  "Video Pins must open the video downloader",
);
assert.ok(
  script.includes('Default: "https://savepinner.com/pinterest-downloader/"'),
  "Unknown media types must retain the general downloader fallback",
);
assert.ok(script.includes("pinterest\\."), "Pinterest navigation coverage is missing");
assert.ok(script.includes("if (pin) createInterface(pin)"), "Non-Pin pages must not show the interface");

console.log("Userscript metadata and policy checks passed.");

const scorerSource = await readFile(
  new URL("../docs/image-candidate-scorer.js", import.meta.url),
  "utf8",
);
globalThis.imageCandidateScorer = undefined;
Function(scorerSource)();
const { rankCandidates } = globalThis.imageCandidateScorer;
const ranked = rankCandidates([
  { url: "https://i.pinimg.com/originals/pin.jpg", source: "structured", width: 1200, height: 1800, primary: true },
  { url: "https://i.pinimg.com/75x75/avatar.jpg", source: "fallback", width: 75, height: 75, avatar: true },
]);
assert.match(ranked[0].url, /pin\.jpg$/, "Primary Pin image should outrank an avatar");
assert.ok(ranked[0].score > ranked[1].score, "Scoring should penalize distractors");

const scorerHtml = await readFile(
  new URL("../docs/image-candidate-scorer.html", import.meta.url),
  "utf8",
);
assert.ok(scorerHtml.includes('<a href="https://savepinner.com">Pinterest image downloader</a>'));
assert.ok(scorerHtml.includes('content="index,follow"'));

console.log("Image candidate scorer checks passed.");
