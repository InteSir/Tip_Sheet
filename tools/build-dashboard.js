#!/usr/bin/env node
// npm run dashboard
// Builds a PRIVATE Pinterest publishing dashboard from publishing/content-plan.json and
// publishing/pins/*.json into dashboard/index.html (+ dashboard/pins.csv).
// dashboard/ is outside src/ and _site/ and is git-ignored, so it is never deployed.
// Open dashboard/index.html in your browser. Nothing is posted anywhere.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, "publishing/content-plan.json"), "utf8"));
const pkgDir = path.join(ROOT, "publishing/pins");
const pkgs = fs.readdirSync(pkgDir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(pkgDir, f), "utf8")));
const out = path.join(ROOT, "dashboard");
fs.mkdirSync(out, { recursive: true });
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const SITE = (await import("../src/_data/site.js")).default.url;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dow = (d) => (d ? DAYS[new Date(d + "T00:00:00Z").getUTCDay()] : "");
const mondayOf = (d) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x.toISOString().slice(0, 10); };

const titleOf = Object.fromEntries(plan.items.map((i) => [i.slug, i.title]));
const pins = [];
for (const k of pkgs) for (const p of k.pins) pins.push({ ...p, article: k.article, pool: p.pool || "reserve", img: `../pinterest-pins/${k.article}/${p.file}`, link: SITE + p.destination, exists: fs.existsSync(path.join(ROOT, "pinterest-pins", k.article, p.file)) });
const byDate = (a, b) => (a.publishDate || "9999").localeCompare(b.publishDate || "9999") || a.id.localeCompare(b.id);
pins.sort(byDate);
const pool = pins.filter((p) => p.pool === "initial");
const reserve = pins.filter((p) => p.pool !== "initial");
const held = pool.filter((p) => p.altPublishDate);
const scheduled = pool.filter((p) => !p.altPublishDate);
const boards = plan.pinterest?.boards || [];
const launchBoards = boards.filter((b) => b.status === "launch");
const laterBoards = boards.filter((b) => b.status !== "launch");
const missing = pins.filter((p) => !p.exists).length;
const badBoard = pins.filter((p) => !launchBoards.some((b) => b.name === p.board));
const statusCounts = pins.reduce((m, p) => ((m[p.status] = (m[p.status] || 0) + 1), m), {});

const weeks = {};
for (const p of scheduled) (weeks[mondayOf(p.publishDate)] ||= []).push(p);

const copyBtn = (v, label = "Copy") => `<button type="button" data-copy="${esc(v)}">${label}</button>`;
const st = (s) => `<span class="st st-${esc(s)}">${esc(s)}</span>`;
const card = (p) => `<article class="pin" id="${esc(p.id)}" data-pool="${esc(p.pool)}" data-board="${esc(p.board)}">
<a href="${esc(p.img)}" target="_blank"><img src="${esc(p.img)}" alt="${esc(p.altText)}" loading="lazy"></a>${p.exists ? "" : `<p class="warn">Image not generated: run make_pins.py</p>`}
<div class="meta">${st(p.status)} <span class="pool pool-${esc(p.pool)}">${p.pool === "initial" ? "initial pool" : "reserve"}</span></div>
<p class="date">${p.publishDate ? `<strong>${dow(p.publishDate)} ${esc(p.publishDate)}</strong>` : `<span class="muted">No date (reserve)</span>`}${p.altPublishDate ? `<br><span class="muted">Option B: ${dow(p.altPublishDate)} ${esc(p.altPublishDate)}</span>` : ""}</p>
<h3>${esc(p.title)} ${copyBtn(p.title)}</h3>
<p class="muted small">${esc(titleOf[p.article] || p.article)} · ${esc(p.direction)}</p>
<dl>
<dt>Board</dt><dd>${esc(p.board)} ${copyBtn(p.board)}</dd>
<dt>Later seasonal board</dt><dd>${esc(p.laterSeasonalBoard || "–")}</dd>
<dt>Description</dt><dd>${esc(p.description)} ${copyBtn(p.description)}</dd>
<dt>Keywords</dt><dd>${esc((p.keywords || []).join(", "))} ${copyBtn((p.keywords || []).join(", "))}</dd>
<dt>Link</dt><dd><code>${esc(p.link)}</code> ${copyBtn(p.link)}</dd>
<dt>Alt text</dt><dd>${esc(p.altText)} ${copyBtn(p.altText)}</dd>
<dt>AI disclosure</dt><dd class="${p.images?.length ? "ai" : ""}">${esc(p.aiDisclosure)}</dd>
${p.scheduleNote ? `<dt>Note</dt><dd class="muted">${esc(p.scheduleNote)}</dd>` : ""}
<dt>File</dt><dd class="muted small">pinterest-pins/${esc(p.article)}/${esc(p.file)}</dd>
</dl></article>`;
const schedRow = (p, alt) => `<tr><td>${dow(alt ? p.altPublishDate : p.publishDate)}</td><td>${esc(alt ? p.altPublishDate : p.publishDate)}</td><td><a href="#${esc(p.id)}">${esc(p.title)}</a></td><td>${esc(p.board)}</td><td><code>${esc(p.destination)}</code></td><td>${st(p.status)}</td></tr>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>The Tip Sheet: Pinterest publishing dashboard (private)</title>
<style>
*{box-sizing:border-box}body{font:15px/1.5 system-ui,sans-serif;margin:0;background:#FAF6F1;color:#2A2124}header{background:#2A2124;color:#FAF6F1;padding:18px 24px}
h1{font:600 22px Georgia,serif;margin:0}main{padding:16px 24px;max-width:1360px}h2{font:600 20px Georgia,serif;margin:30px 0 10px;border-bottom:1px solid #ddd;padding-bottom:6px}h3{font-size:15px}
table{border-collapse:collapse;width:100%;background:#fff;margin-bottom:12px}th,td{border-bottom:1px solid #eee;padding:7px 8px;text-align:left;vertical-align:top;font-size:13.5px}th{background:#F1ECE4;font-size:12px;text-transform:uppercase;letter-spacing:.06em}
.st{display:inline-block;padding:1px 8px;border-radius:10px;font-size:12px;font-weight:600;background:#eee}.st-draft{background:#F3E4DF}.st-ready{background:#E6C3B9}.st-published{background:#2F4A3E;color:#fff}.st-planned{background:#fff;border:1px dashed #6F605B}
.pool{font-size:12px;font-weight:600;padding:1px 8px;border-radius:10px}.pool-initial{background:#7A1F3D;color:#fff}.pool-reserve{background:#fff;border:1px solid #6F605B;color:#6F605B}
.boards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}.board{background:#fff;border:1px solid #eee;border-radius:8px;padding:12px;font-size:13px}.board h3{margin:0 0 4px;font:600 16px Georgia,serif}.board.later{background:#F7F2EC;border-style:dashed}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}.pin{background:#fff;border:1px solid #eee;border-radius:8px;padding:10px;font-size:13px}
.pin img{width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:4px;background:#eee;display:block}.pin h3{margin:4px 0}.meta{margin-top:8px}.date{margin:6px 0 0}
dl{margin:6px 0 0}dt{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6F605B;margin-top:6px}dd{margin:0}dd.ai{color:#7A1F3D}
.muted{color:#6F605B}.small{font-size:12px}.warn{color:#B8263F;font-weight:600}.note{background:#fff;border-left:4px solid #B08442;padding:10px 14px;margin:12px 0}
code{font-size:12px;background:#F1ECE4;padding:1px 4px;word-break:break-all}button{font:inherit;font-size:11px;padding:1px 7px;cursor:pointer;border:1px solid #ccc;background:#FAF6F1;border-radius:4px;margin-left:2px}
.filters{position:sticky;top:0;background:#FAF6F1;padding:10px 0;z-index:2;border-bottom:1px solid #eee}.filters button{font-size:13px;padding:4px 10px}.filters button.on{background:#2A2124;color:#fff}
.kw{color:#6F605B}
</style></head><body><header><h1>The Tip Sheet · Pinterest publishing dashboard</h1><div>Private: generated ${new Date().toISOString().slice(0, 10)} by <code style="background:#443;color:#fff">npm run dashboard</code>. Not part of the website. No automatic posting. Everything stays <strong>draft</strong> until Intesar reviews it.</div></header><main>
<p><strong>${pins.length}</strong> Pins: <strong>${pool.length}</strong> in the initial pool (${scheduled.length} scheduled Nov–Jan, ${held.length} Christmas Pins waiting on a choice) and <strong>${reserve.length}</strong> in reserve. Status: ${Object.entries(statusCounts).map(([k, v]) => `${v} ${k}`).join(", ")}.${missing ? ` <span class="warn">${missing} Pin image(s) missing.</span>` : ""}${badBoard.length ? ` <span class="warn">${badBoard.length} Pin(s) point at a board that isn't one of the 5 launch boards.</span>` : ""}</p>
<div class="note"><strong>Soft launch rules.</strong> ~5 original Pins a week, never all at once. Each Pin links to its article or look anchor, and its title/description match that page. No product promises, prices, "shop the look" or affiliate wording until monetisation is live. Tick Pinterest's AI label for every Pin made from AI images. Dates assume a first Pin on Mon 30 Nov 2026 and shift with the site's go-live date.</div>

<h2>Boards (5 at launch)</h2><div class="boards">
${launchBoards.map((b) => `<div class="board"><h3>${esc(b.name)} ${copyBtn(b.name)}</h3><p class="muted small">${pool.filter((p) => p.board === b.name).length} initial · ${reserve.filter((p) => p.board === b.name).length} reserve</p><p>${esc(b.description)} ${copyBtn(b.description)}</p><p class="kw small"><strong>Keywords:</strong> ${esc(b.keywords.join(", "))}</p><p class="small"><strong>Fed by:</strong> ${esc(b.feeds.join(" · "))}</p></div>`).join("")}
</div>
<h3>Later seasonal boards (add when Intesar is ready)</h3><div class="boards">
${laterBoards.map((b) => `<div class="board later"><h3>${esc(b.name)} <span class="muted small">later</span></h3><p class="muted small">${pins.filter((p) => p.laterSeasonalBoard === b.name).length} Pins tagged · ${esc(b.when || "")}</p><p>${esc(b.description)} ${copyBtn(b.description)}</p></div>`).join("")}
</div>

<h2>Weekly schedule (initial pool)</h2>
${Object.entries(weeks).map(([w, list]) => `<h3>Week of Mon ${w} · ${list.length} Pins · boards: ${[...new Set(list.map((p) => p.board))].length}</h3><table><thead><tr><th>Day</th><th>Date</th><th>Pin</th><th>Board</th><th>Destination</th><th>Status</th></tr></thead><tbody>${list.map((p) => schedRow(p)).join("")}</tbody></table>`).join("")}
${held.length ? `<h3>Christmas Pins waiting on a choice (${held.length})</h3><p class="muted">At ~5/week these don't fit before Christmas. <strong>Option A (default):</strong> hold for the Christmas 2027 window (dates below, 1–14 Sep 2027). <strong>Option B:</strong> bump weeks 1–2 to ~7 Pins/week and post on the Option B dates.</p>
<table><thead><tr><th>Day</th><th>Option A date</th><th>Pin</th><th>Board</th><th>Destination</th><th>Status</th></tr></thead><tbody>${held.map((p) => schedRow(p)).join("")}</tbody></table>
<table><thead><tr><th>Day</th><th>Option B date</th><th>Pin</th><th>Board</th><th>Destination</th><th>Status</th></tr></thead><tbody>${[...held].sort((a, b) => a.altPublishDate.localeCompare(b.altPublishDate)).map((p) => schedRow(p, true)).join("")}</tbody></table>` : ""}

<h2>Content calendar</h2><table><thead><tr><th>Date</th><th>Article</th><th>Type</th><th>Status</th><th>Pins (initial / reserve)</th><th>Notes</th></tr></thead><tbody>
${[...plan.items].sort((a, b) => a.publishDate.localeCompare(b.publishDate)).map((i) => `<tr><td>${esc(i.publishDate)}</td><td>${i.url ? `<a href="${SITE}${esc(i.url)}">${esc(i.title)}</a>` : esc(i.title)}</td><td>${esc(i.type)}</td><td>${st(i.status)}</td><td>${i.pinPackage ? `${pool.filter((p) => p.article === i.pinPackage).length} / ${reserve.filter((p) => p.article === i.pinPackage).length}` : "–"}</td><td class="muted">${esc(i.notes || "")}</td></tr>`).join("")}
</tbody></table>

<h2 id="pins">Pins (copy-ready)</h2>
<div class="filters">Show: <button type="button" data-f="initial" class="on">Initial pool</button><button type="button" data-f="reserve">Reserve</button><button type="button" data-f="all">All</button>
 · Board: <select id="bf"><option value="">All boards</option>${launchBoards.map((b) => `<option>${esc(b.name)}</option>`).join("")}</select></div>
<h3 class="sec" data-sec="initial">Initial pool (${pool.length})</h3><div class="grid" data-sec="initial">${pool.map(card).join("")}</div>
<h3 class="sec" data-sec="reserve">Reserve (${reserve.length}): kept for later creative variations, no date</h3><div class="grid" data-sec="reserve">${reserve.map(card).join("")}</div>
</main><script>
document.addEventListener("click",e=>{const b=e.target.closest("[data-copy]");if(b){navigator.clipboard?.writeText(b.dataset.copy);const t=b.textContent;b.textContent="Copied";setTimeout(()=>b.textContent=t,1200);}});
let f="initial";const apply=()=>{const bd=document.getElementById("bf").value;document.querySelectorAll("[data-sec]").forEach(el=>el.style.display=(f==="all"||el.dataset.sec===f)?"":"none");document.querySelectorAll(".pin").forEach(el=>el.style.display=(!bd||el.dataset.board===bd)?"":"none");};
document.querySelectorAll("[data-f]").forEach(b=>b.addEventListener("click",()=>{f=b.dataset.f;document.querySelectorAll("[data-f]").forEach(x=>x.classList.toggle("on",x===b));apply();}));
document.getElementById("bf").addEventListener("change",apply);apply();
</script></body></html>`;
fs.writeFileSync(path.join(out, "index.html"), html);
const csvEsc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
const cols = ["pool", "publishDate", "weekday", "altPublishDate", "status", "article", "file", "title", "description", "keywords", "board", "laterSeasonalBoard", "destination", "altText", "aiDisclosure", "scheduleNote"];
const val = (p, c) => (c === "keywords" ? (p.keywords || []).join(", ") : c === "destination" ? p.link : c === "weekday" ? dow(p.publishDate) : p[c]);
fs.writeFileSync(path.join(out, "pins.csv"), [cols.join(","), ...[...pool, ...reserve].map((p) => cols.map((c) => csvEsc(val(p, c))).join(","))].join("\n"));
console.log(`dashboard/index.html: ${plan.items.length} articles, ${pins.length} pins (${pool.length} initial, ${reserve.length} reserve)${missing ? `, ${missing} images missing` : ""}${badBoard.length ? `, ${badBoard.length} off-board` : ""}`);
