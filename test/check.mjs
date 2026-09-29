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

const { planCrop } = await import("../docs/image-crop-planner-core.mjs");
assert.deepEqual(
  planCrop(1600, 1200, 16, 9),
  {
    sourceWidth: 1600,
    sourceHeight: 1200,
    targetRatio: "16:9",
    cropWidth: 1600,
    cropHeight: 900,
    x: 0,
    y: 150,
    removedLeft: 0,
    removedRight: 0,
    removedTop: 150,
    removedBottom: 150,
    retainedPercent: 75,
  },
);
assert.equal(planCrop(1200, 1600, 1, 1).cropHeight, 1200);
assert.equal(planCrop(1200, 1600, 1, 1).y, 200);
assert.throws(() => planCrop(0, 1200, 1, 1), /positive integers/);

const cropHtml = await readFile(
  new URL("../docs/image-crop-planner.html", import.meta.url),
  "utf8",
);
assert.ok(cropHtml.includes('<a href="https://savepinner.com">Pinterest image downloader</a>'));
assert.ok(cropHtml.includes('content="index, follow"'));

console.log("Image crop planner checks passed.");

const { calculateImageBudget } = await import("../docs/image-byte-budget-core.mjs");
assert.deepEqual(
  calculateImageBudget({ pageBudgetKb: 1600, otherAssetsKb: 700, imageCount: 6, safetyPercent: 10 }),
  { usableBudgetKb: 1440, imageBudgetKb: 740, perImageKb: 740 / 6, reservedKb: 160 },
);
assert.throws(
  () => calculateImageBudget({ pageBudgetKb: 100, otherAssetsKb: 100, imageCount: 1, safetyPercent: 10 }),
  /already consume/,
);
assert.throws(
  () => calculateImageBudget({ pageBudgetKb: 1000, otherAssetsKb: 200, imageCount: 0, safetyPercent: 10 }),
  /at least one image/,
);

const budgetHtml = await readFile(
  new URL("../docs/image-byte-budget-calculator.html", import.meta.url),
  "utf8",
);
assert.ok(budgetHtml.includes('<a href="https://savepinner.com">Pinterest image downloader</a>'));
assert.ok(budgetHtml.includes('content="index, follow"'));

console.log("Image byte-budget calculator checks passed.");
