#!/usr/bin/env node
// Checks the built site (_site) for broken internal links, missing images,
// missing alt text, duplicate titles and missing meta descriptions.
// v2 also checks: in-page anchors (#look-ids), products.json schema, Look Card
// fields, Complete the Vibe size, Pin package data, the Atom feed and redirects.
// Usage: npm run check   (after npm run build)
import fs from "node:fs";
import path from "node:path";

const SITE = path.resolve("_site");
const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { if (f !== "pagefind") walk(p); }
    else if (f.endsWith(".html")) files.push(p);
  }
})(SITE);

const exists = (url) => {
  const clean = decodeURI(url.split("#")[0].split("?")[0]);
  if (!clean) return true;
  const p = path.join(SITE, clean);
  return fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, "index.html")));
};

const problems = [];
const titles = new Map();
for (const file of files) {
  const rel = "/" + path.relative(SITE, file);
  const html = fs.readFileSync(file, "utf8");
  const title = (html.match(/<title>(.*?)<\/title>/) || [])[1];
  if (!title) problems.push(`${rel}: missing <title>`);
  else titles.set(title, [...(titles.get(title) || []), rel]);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) problems.push(`${rel}: missing/short meta description`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push(`${rel}: expected exactly one <h1>`);
  for (const [, attr, url] of html.matchAll(/\s(href|src|srcset)="([^"]+)"/g)) {
    const urls = attr === "srcset" ? url.split(",").map((s) => s.trim().split(" ")[0]) : [url];
    for (const u of urls) {
      if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(u)) continue;
      if (u.startsWith("/pagefind/")) continue;
      if (!exists(u)) problems.push(`${rel}: broken ${attr} -> ${u}`);
    }
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(tag)) problems.push(`${rel}: <img> without alt`);
}
// ---------- Anchors: every internal #fragment must exist on its target page ----------
const idCache = new Map();
const idsOf = (pagePath) => {
  if (!idCache.has(pagePath)) {
    let f = path.join(SITE, decodeURI(pagePath));
    if (!f.endsWith(".html")) f = path.join(f, "index.html");
    const h = fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
    idCache.set(pagePath, new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(pagePath);
};
for (const file of files) {
  const rel = "/" + path.relative(SITE, file).replace(/index\.html$/, "");
  const html = fs.readFileSync(file, "utf8");
  for (const [, url] of html.matchAll(/\shref="([^"]*#[^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(url)) continue;
    const [pg, frag] = url.split("#");
    if (!frag) continue;
    if (!idsOf(pg || rel).has(decodeURIComponent(frag))) problems.push(`${rel}: link to missing anchor -> ${url}`);
  }
}

// ---------- Products ----------
const warnings = [];
const pdata = JSON.parse(fs.readFileSync("src/_data/products.json", "utf8"));
const REQ = ["id", "name", "brand", "category", "asin", "amazonUrl", "affiliateUrl", "affiliateReady", "matchedArticles", "matchedLooks", "matchType", "matchReason", "lastChecked", "imageSource", "imageUsageStatus", "verificationStatus"];
const seen = new Set();
for (const p of pdata.products) {
  const w = `products.json ${p.id}`;
  for (const k of REQ) if (!(k in p)) problems.push(`${w}: missing field ${k}`);
  if (seen.has(p.id)) problems.push(`${w}: duplicate id`); seen.add(p.id);
  if (!["verified", "needs-verification", "sample"].includes(p.verificationStatus)) problems.push(`${w}: bad verificationStatus`);
  if (!["none", "pending", "approved"].includes(p.imageUsageStatus)) problems.push(`${w}: bad imageUsageStatus`);
  if (p.imageUsageStatus !== "approved" && p.image) problems.push(`${w}: image set but not approved`);
  if (p.matchType && !["exact", "close", "alternative"].includes(p.matchType)) problems.push(`${w}: bad matchType`);
  if (p.verificationStatus !== "verified" && (p.asin || p.amazonUrl)) problems.push(`${w}: asin/amazonUrl only allowed once verified`);
  if (p.asin && !/^[A-Z0-9]{10}$/.test(p.asin)) problems.push(`${w}: malformed ASIN`);
  if (p.amazonUrl && !/^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}$/.test(p.amazonUrl)) problems.push(`${w}: amazonUrl must be https://www.amazon.com/dp/<ASIN>`);
  if (p.amazonUrl && p.asin && !p.amazonUrl.endsWith(p.asin)) problems.push(`${w}: amazonUrl and asin disagree`);
  if (p.affiliateReady && !p.affiliateUrl) problems.push(`${w}: affiliateReady without affiliateUrl`);
  if (p.sample && (p.amazonUrl || p.affiliateUrl)) problems.push(`${w}: sample records must not link`);
}

// ---------- Articles: no product URLs, Look Card fields, Complete the Vibe ----------
const matter = (await import("gray-matter")).default;
const MATCHES = ["exact", "close", "mix", "none"], DIFFS = ["press-on", "diy", "salon"];
for (const f of fs.readdirSync("src/articles").filter((f) => f.endsWith(".md"))) {
  const raw = fs.readFileSync(path.join("src/articles", f), "utf8");
  if (/amazon\.[a-z.]+\/|amzn\.to/.test(raw)) problems.push(`${f}: product URL in an article (use products.json)`);
  const d = matter(raw).data;
  if ((d.completeTheVibe || []).length > 3) problems.push(`${f}: Complete the Vibe has more than 3 items`);
  const ids = new Set();
  for (const l of d.looks || []) {
    if (!l.id) problems.push(`${f}: look without id (${l.title})`); else if (ids.has(l.id)) problems.push(`${f}: duplicate look id ${l.id}`); ids.add(l.id);
    if (!l.title || !l.image || !l.text) problems.push(`${f}: look ${l.id} needs title, image and text`);
    if (d.section !== "home-decor") {
      if (!l.shape || !l.length || !l.finish) problems.push(`${f}: look ${l.id} needs shape, length and finish`);
      if (l.match && !MATCHES.includes(l.match)) problems.push(`${f}: look ${l.id} match must be one of ${MATCHES}`);
      if (!DIFFS.includes(l.difficulty)) problems.push(`${f}: look ${l.id} difficulty must be one of ${DIFFS}`);
      if (!l.bestFor) problems.push(`${f}: look ${l.id} needs bestFor`);
    }
    for (const pid of [].concat(l.products || [], l.product || [])) if (!seen.has(pid)) problems.push(`${f}: look ${l.id} uses unknown product ${pid}`);
  }
}

// ---------- Soft launch: nothing product-related may render ----------
const site = (await import(path.resolve("src/_data/site.js"))).default;
if (!site.shopping) {
  const BANNED = [/class="product-card/, /class="quick-picks/, /class="shop-the-look/, /Checking listings/i, /Sample product/i, /Sample slot/i, /class="match\b/, /\bto match\b/i, /Preview note/i, /amazon\.com\//i, /\[[A-Z][^\]]{2,}\]/];
  for (const file of files) {
    const rel = "/" + path.relative(SITE, file);
    const html = fs.readFileSync(file, "utf8").replace(/<script[\s\S]*?<\/script>/g, "");
    for (const re of BANNED) if (re.test(html)) problems.push(`${rel}: soft-launch page still shows ${re}`);
  }
}

// ---------- v4 Look Cards: editorial markup, action bar, More like this panel ----------
let cardCount = 0;
for (const file of files) {
  const rel = "/" + path.relative(SITE, file);
  const html = fs.readFileSync(file, "utf8");
  if (/<details class="recreate|<details class="more-like/.test(html)) problems.push(`${rel}: old v3 expander markup (recreate/more-like) still present`);
  for (const [card] of html.matchAll(/<article class="look-card"[\s\S]*?<\/article>/g)) {
    cardCount++;
    const id = (card.match(/id="([^"]+)"/) || [])[1];
    const w = `${rel}#${id}`;
    const order = ["look-card__eyebrow", "look-card__title", "look-card__fig", "look-card__text", "look-actions"];
    let last = -1;
    for (const c of order) {
      const i = card.indexOf(`class="${c}`);
      if (i < 0) { problems.push(`${w}: Look Card missing .${c}`); continue; }
      if (i < last) problems.push(`${w}: .${c} is out of editorial order`);
      last = i;
    }
    if (!/class="act act--save"[^>]*data-save=/.test(card)) problems.push(`${w}: action bar needs a Save button with data-save`);
    if (!/pinterest\.com\/pin\/create\/button/.test(card)) problems.push(`${w}: action bar needs Pin it`);
    const m = card.match(/aria-controls="([^"]+)"/);
    if (m && !card.includes(`id="${m[1]}"`)) problems.push(`${w}: More like this button controls missing panel #${m[1]}`);
    if (!/class="ai-caption"/.test(card)) warnings.push(`${w}: Look Card has no AI caption (fine only for a real, authorised photo)`);
  }
}

// ---------- Pin packages ----------
const pinDir = "publishing/pins";
let pinCount = 0;
for (const f of fs.readdirSync(pinDir).filter((f) => f.endsWith(".json"))) {
  const pk = JSON.parse(fs.readFileSync(path.join(pinDir, f), "utf8"));
  for (const p of pk.pins) {
    pinCount++;
    const w = `pins/${f} ${p.file}`;
    for (const k of ["file", "title", "description", "keywords", "destination", "board", "altText", "aiDisclosure", "status", "pool"]) if (!p[k] || (Array.isArray(p[k]) && !p[k].length)) problems.push(`${w}: missing ${k}`);
    if (p.pool && !["initial", "reserve"].includes(p.pool)) problems.push(`${w}: pool must be initial or reserve`);
    if (p.pool === "initial" && !/^\d{4}-\d{2}-\d{2}$/.test(p.publishDate || "")) problems.push(`${w}: initial-pool Pin needs a publishDate (YYYY-MM-DD)`);
    const BOARDS = ["Nail Ideas & Nail Inspiration", "Short Nail Designs", "Press-On Nails & Tutorials", "Chrome & Cat-Eye Nails", "Renter-Friendly Small-Space Decor"];
    if (p.board && !BOARDS.includes(p.board)) problems.push(`${w}: board "${p.board}" is not one of the 5 launch boards`);
    if (/to match|shop the|affiliate|\$\d/i.test(`${p.title} ${p.description} ${p.headline || ""}`)) problems.push(`${w}: product/shopping wording in Pin copy`);
    if (!["draft", "ready", "published"].includes(p.status)) problems.push(`${w}: bad status`);
    if (p.title && p.title.length > 100) problems.push(`${w}: title over 100 characters`);
    if (p.description && p.description.length > 500) problems.push(`${w}: description over 500 characters`);
    const [pg, frag] = String(p.destination).split("#");
    if (!exists(pg)) problems.push(`${w}: destination page missing ${pg}`);
    else if (frag && !idsOf(pg).has(frag)) problems.push(`${w}: destination anchor missing #${frag}`);
    const img = path.join("pinterest-pins", pk.article, p.file);
    if (!fs.existsSync(img)) warnings.push(`${w}: image not generated yet (run npm run pins)`);
    else {
      const b = fs.readFileSync(img);
      if (b.readUInt32BE(16) !== 1000 || b.readUInt32BE(20) !== 1500) problems.push(`${w}: image is not 1000x1500`);
    }
  }
}

// ---------- Feed ----------
const feedPath = path.join(SITE, "feed.xml");
if (!fs.existsSync(feedPath)) problems.push("feed.xml missing");
else {
  const x = fs.readFileSync(feedPath, "utf8");
  if (!x.startsWith('<?xml version="1.0" encoding="utf-8"?>')) problems.push("feed.xml: XML declaration must be first");
  const stack = [];
  for (const m of x.replace(/<\?xml[^>]*\?>/, "").matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
    if (m[4] === "/") continue;
    if (m[1]) { if (stack.pop() !== m[2]) { problems.push(`feed.xml: mismatched </${m[2]}>`); break; } }
    else stack.push(m[2]);
  }
  if (stack.length) problems.push(`feed.xml: unclosed <${stack.join(", ")}>`);
  if (/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/.test(x)) problems.push("feed.xml: unescaped &");
  for (const [, u] of x.matchAll(/<link href="([^"]+)"/g)) if (!/^https:\/\//.test(u)) problems.push(`feed.xml: relative link ${u}`);
}

// ---------- Redirects ----------
const toml = fs.readFileSync("netlify.toml", "utf8");
for (const [, to] of toml.matchAll(/^\s*to\s*=\s*"([^"]+)"/gm)) {
  if (to.includes(":splat")) continue;
  if (!exists(to)) problems.push(`netlify.toml: redirect target missing ${to}`);
}
for (const old of ["/guides/", "/holiday-home/"]) if (!new RegExp(`from = "${old}`).test(toml)) problems.push(`netlify.toml: no redirect for ${old}`);
console.log(`Checked ${pdata.products.length} product records and ${pinCount} Pins.`);
if (warnings.length) console.log("Warnings:\n" + warnings.join("\n"));

for (const [t, pages] of titles) if (pages.length > 1) problems.push(`Duplicate title "${t}": ${pages.join(", ")}`);

console.log(`Checked ${files.length} pages and ${cardCount} Look Cards.`);
if (problems.length) { console.log(problems.join("\n")); process.exitCode = 1; }
else console.log("No broken links, missing images, alt text or metadata problems found.");
