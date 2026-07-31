// ==UserScript==
// @name         SavePinner Pinterest Helper
// @namespace    https://savepinner.com/
// @version      0.1.1
// @description  Copy clean Pinterest Pin and media URLs, then continue in SavePinner when needed.
// @author       jiankn
// @license      MIT
// @include      /^https:\/\/(?:www\.)?pinterest\.(?:com|at|ca|ch|cl|co\.kr|co\.uk|com\.au|com\.mx|de|dk|es|fi|fr|ie|it|jp|nl|nz|ph|pt|ru|se)\/.*$/
// @homepageURL  https://savepinner.com/pinterest-downloader/
// @supportURL   https://github.com/jiankn/savepinner-pinterest-helper/issues
// @source       https://github.com/jiankn/savepinner-pinterest-helper
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const PRODUCT_URL = "https://savepinner.com/pinterest-downloader/";
  const HOST_ID = "savepinner-pinterest-helper";
  const ROOT_DOMAINS = new Set([
    "pinterest.com",
    "pinterest.at",
    "pinterest.ca",
    "pinterest.ch",
    "pinterest.cl",
    "pinterest.co.kr",
    "pinterest.co.uk",
    "pinterest.com.au",
    "pinterest.com.mx",
    "pinterest.de",
    "pinterest.dk",
    "pinterest.es",
    "pinterest.fi",
    "pinterest.fr",
    "pinterest.ie",
    "pinterest.it",
    "pinterest.jp",
    "pinterest.nl",
    "pinterest.nz",
    "pinterest.ph",
    "pinterest.pt",
    "pinterest.ru",
    "pinterest.se",
  ]);

  let currentPageKey = "";

  function isPinterestHost(hostname) {
    const host = hostname.toLowerCase().replace(/^www\./, "");
    return ROOT_DOMAINS.has(host);
  }

  function parsePinUrl(value) {
    let url;
    try {
      url = new URL(value);
    } catch {
      return null;
    }

    if (url.protocol !== "https:" || !isPinterestHost(url.hostname)) {
      return null;
    }

    const match = url.pathname.match(
      /^\/pin\/(?:(\d{1,20})|[A-Za-z0-9][A-Za-z0-9_-]*--(\d{1,20}))(?:\/[A-Za-z0-9_-]*)?\/?$/,
    );
    const pinId = match?.[1] || match?.[2];
    if (!pinId) {
      return null;
    }

    return {
      id: pinId,
      cleanUrl: `https://${url.hostname}/pin/${pinId}/`,
    };
  }

  function getPin() {
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    return parsePinUrl(canonical || "") || parsePinUrl(location.href);
  }

  function getMetaContent(selectors) {
    for (const selector of selectors) {
      const content = document.querySelector(selector)?.content?.trim();
      if (!content) continue;

      try {
        const url = new URL(content, location.href);
        if (url.protocol === "https:" || url.protocol === "http:") {
          return url.href;
        }
      } catch {
        // Ignore malformed metadata and continue looking.
      }
    }
    return "";
  }

  function getMedia() {
    const videoUrl = getMetaContent([
      'meta[property="og:video:secure_url"]',
      'meta[property="og:video:url"]',
      'meta[property="og:video"]',
    ]);
    if (videoUrl) return { type: "Video", url: videoUrl };

    const imageUrl = getMetaContent([
      'meta[property="og:image:secure_url"]',
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
    ]);
    return imageUrl ? { type: "Image", url: imageUrl } : null;
  }

  async function copyText(value) {
    if (typeof GM_setClipboard === "function") {
      GM_setClipboard(value, "text");
      return;
    }
    await navigator.clipboard.writeText(value);
  }

  function openProduct() {
    if (typeof GM_openInTab === "function") {
      GM_openInTab(PRODUCT_URL, { active: true, insert: true });
      return;
    }
    window.open(PRODUCT_URL, "_blank", "noopener,noreferrer");
  }

  function createInterface(pin) {
    const host = document.createElement("div");
    host.id = HOST_ID;
    host.style.position = "fixed";
    host.style.right = "18px";
    host.style.bottom = "18px";
    host.style.zIndex = "2147483647";
    const shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = `
      :host { all: initial; }
      * { box-sizing: border-box; }
      .launcher, .button { border: 0; cursor: pointer; font: 600 14px/1.2 system-ui, sans-serif; }
      .launcher { width: 52px; height: 52px; border-radius: 50%; color: white; background: #e60023;
        box-shadow: 0 8px 24px rgba(0,0,0,.25); }
      .panel { display: none; width: min(340px, calc(100vw - 36px)); margin-bottom: 10px; padding: 16px;
        border: 1px solid #e5e7eb; border-radius: 16px; color: #111827; background: white;
        box-shadow: 0 14px 40px rgba(0,0,0,.22); font: 14px/1.45 system-ui, sans-serif; }
      .panel.open { display: block; }
      h2 { margin: 0 0 4px; font-size: 17px; }
      .muted { margin: 0 0 12px; color: #6b7280; }
      .value { overflow: hidden; margin: 8px 0 12px; padding: 9px 10px; border-radius: 9px;
        background: #f3f4f6; color: #374151; text-overflow: ellipsis; white-space: nowrap; }
      .actions { display: grid; gap: 8px; }
      .button { width: 100%; padding: 10px 12px; border-radius: 9px; color: #1f2937; background: #e5e7eb; }
      .button:hover { background: #d1d5db; }
      .button.primary { color: white; background: #e60023; }
      .button.primary:hover { background: #bd001d; }
      .status { min-height: 20px; margin: 10px 0 0; color: #047857; font-size: 12px; }
    `;

    const panel = document.createElement("section");
    panel.className = "panel";
    panel.setAttribute("aria-label", "SavePinner Pinterest Helper");

    const title = document.createElement("h2");
    title.textContent = "SavePinner Helper";
    const summary = document.createElement("p");
    summary.className = "muted";
    summary.textContent = `Pin ${pin.id}`;
    const value = document.createElement("div");
    value.className = "value";
    value.title = pin.cleanUrl;
    value.textContent = pin.cleanUrl;
    const actions = document.createElement("div");
    actions.className = "actions";
    const status = document.createElement("p");
    status.className = "status";
    status.setAttribute("aria-live", "polite");

    function makeButton(label, className, onClick) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.textContent = label;
      button.addEventListener("click", onClick);
      return button;
    }

    actions.append(
      makeButton("Copy clean Pin URL", "button", async () => {
        try {
          await copyText(pin.cleanUrl);
          status.textContent = "Clean Pin URL copied.";
        } catch {
          status.textContent = "Copy failed. Select the URL above manually.";
        }
      }),
    );

    const media = getMedia();
    if (media) {
      actions.append(
        makeButton(`Copy detected ${media.type.toLowerCase()} URL`, "button", async () => {
          try {
            await copyText(media.url);
            status.textContent = `${media.type} URL copied from page metadata.`;
          } catch {
            status.textContent = "Copy failed. Try the SavePinner workflow instead.";
          }
        }),
      );
    }

    actions.append(
      makeButton("Copy URL & open SavePinner", "button primary", async () => {
        try {
          await copyText(pin.cleanUrl);
          status.textContent = "URL copied. Paste it into SavePinner.";
        } catch {
          status.textContent = "Opening SavePinner. Copy the URL above manually.";
        }
        openProduct();
      }),
    );

    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "launcher";
    launcher.textContent = "SP";
    launcher.title = "Open SavePinner Pinterest Helper";
    launcher.setAttribute("aria-label", "Open SavePinner Pinterest Helper");
    launcher.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("open");
      launcher.setAttribute("aria-expanded", String(isOpen));
    });

    panel.append(title, summary, value, actions, status);
    shadow.append(style, panel, launcher);
    document.documentElement.append(host);
  }

  function refresh() {
    const pin = getPin();
    const pageKey = pin?.cleanUrl || "";
    if (pageKey === currentPageKey && document.getElementById(HOST_ID)) return;

    document.getElementById(HOST_ID)?.remove();
    currentPageKey = pageKey;
    if (pin) createInterface(pin);
  }

  refresh();
  window.addEventListener("popstate", refresh);
  setInterval(refresh, 1000);
})();
