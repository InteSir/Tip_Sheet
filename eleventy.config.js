// Eleventy configuration for The Tip Sheet (v2: Look Cards, finish facet,
// central product data, saved favourites, RSS). Docs: https://www.11ty.dev/docs/config/
import fs from "node:fs";
import path from "node:path";
import Image from "@11ty/eleventy-img";

const imageMeta = JSON.parse(fs.readFileSync("./src/_data/images.json", "utf8"));
const taxonomy = (await import("./src/_data/taxonomy.js")).default;
const site = (await import("./src/_data/site.js")).default;
const productList = JSON.parse(fs.readFileSync("./src/_data/products.json", "utf8")).products;
const products = Object.fromEntries(productList.map((p) => [p.id, p]));

// Facets used for browse pages. Article-level values + look-level values are merged.
const FACETS = ["shape", "length", "colour", "finish", "style", "occasion"];
const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const label = (slug, facet) => ((taxonomy[facet] || []).find((t) => t.slug === slug) || {}).label || slug;

function facetValues(data) {
  const out = {};
  for (const f of FACETS) {
    const set = new Set(asArray(data[f]));
    for (const look of data.looks || []) asArray(look[f]).forEach((v) => set.add(v));
    out[f] = [...set];
  }
  return out;
}

// Products: the link a card uses. affiliateUrl wins once it is set (phase 2);
// until then the normal Amazon product URL is used. Sample records have no link.
// Only verified records (and labelled sample slots) ever appear on the site.
// While site.shopping is false (soft launch) nothing product-related is shown at all.
const isShown = (p) => !!site.shopping && !!p && (p.sample || p.verificationStatus === "verified");
const productLink = (p) => (p.affiliateUrl && p.affiliateReady ? p.affiliateUrl : p.amazonUrl) || "";
const MATCH = {
  exact: { label: "Exact match", note: "Same design, shape and colour as the look." },
  close: { label: "Close match", note: "Same idea and colour family; small differences." },
  mix: { label: "Mix two sets", note: "Combine two sets (or a set plus a DIY step) to get the look." },
  none: { label: "No match yet", note: "We haven't found a set that matches honestly. DIY or salon for now." },
};
const DIFFICULTY = { "press-on": "Press-on", diy: "DIY", salon: "Salon" };

export default function (eleventyConfig) {
  // ---------- Static files ----------
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/assets/brand/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "src/site.webmanifest": "site.webmanifest" });
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addGlobalData("matchLabels", MATCH);

  // ---------- Responsive images (WebP + JPEG fallback, generated at build) ----------
  // Usage: {% img "file.jpg", "sizes attr", "css-class", "eager" %}
  // Alt text and the AI flag come from src/_data/images.json.
  async function imageData(file, widths) {
    return Image(path.join("src/images", file), {
      widths,
      formats: ["webp", "jpeg"],
      outputDir: "./_site/img/",
      urlPath: "/img/",
      sharpWebpOptions: { quality: 76 },
      sharpJpegOptions: { quality: 78, progressive: true },
      filenameFormat: (id, src, width, format) => `${path.parse(src).name}-${width}.${format}`,
    });
  }
  async function imgShortcode(file, sizes = "100vw", cls = "", loading = "lazy", widths = [400, 800, 1200]) {
    const meta = imageMeta[file];
    if (!meta) throw new Error(`[img] Missing entry for "${file}" in src/_data/images.json`);
    const metadata = await imageData(file, widths);
    const html = Image.generateHTML(metadata, {
      alt: meta.alt,
      sizes,
      loading,
      decoding: "async",
      ...(loading === "eager" ? { fetchpriority: "high" } : {}),
    });
    const chip = site.aiChips && meta.ai && !cls.includes("no-chip")
      ? `<span class="ph-chip" aria-hidden="true" data-pagefind-ignore>AI image</span>` : "";
    return `<span class="media ${cls}">${html}${chip}</span>`;
  }
  eleventyConfig.addAsyncShortcode("img", imgShortcode);
  // URL of one JPEG width (for Pin it buttons and the saved list)
  const imgSrc = async (file, w = 800) => (await imageData(file, [w])).jpeg[0].url;
  eleventyConfig.addAsyncShortcode("imgSrc", imgSrc);

  // ---------- Product card ----------
  // {% productCard "product-id", "inline" | "grid", "Optional label" %}
  // No product URL ever lives in an article: cards read src/_data/products.json.
  async function productCard(id, variant = "grid", cardLabel = "") {
    if (!site.shopping) return ""; // soft launch: no product cards anywhere
    const p = products[id];
    if (!p) throw new Error(`[productCard] Unknown product id "${id}". Add it to src/_data/products.json`);
    const inline = variant === "inline";
    const sample = !!p.sample;
    const href = sample ? "" : productLink(p);
    const imgOk = p.image && p.imageUsageStatus === "approved";
    const img = imgOk
      ? await imgShortcode(p.image, inline ? "160px" : "(min-width: 1024px) 300px, (min-width: 640px) 45vw, 72vw", "ratio-1 no-chip", "lazy", [400, 800])
      : `<span class="media ratio-1 no-photo" role="img" aria-label="Product photo coming soon"><span class="no-photo__mono" aria-hidden="true">${esc((p.brand || p.name || "T").trim()[0])}</span><span class="no-photo__txt">${sample ? "Sample slot" : "Photo coming soon"}</span></span>`;
    const lbl = cardLabel || (p.category === "press-on-nails" ? (inline ? "Get this look" : "Press-on match") : "Useful for this");
    const meta = [p.brand, p.category && (CATEGORY[p.category] || p.category)].filter(Boolean).map(esc).join(" · ");
    const mt = p.matchType && !sample ? `<p class="product-card__match">${esc({ exact: "Exact match", close: "Close match", alternative: "Alternative" }[p.matchType] || "")}${p.matchReason ? `: ${esc(p.matchReason)}` : ""}</p>` : "";
    const where = /amazon\./.test(href) ? "Amazon" : "the retailer";
    const cta = href
      ? `<a class="btn btn--small" href="${esc(href)}" target="_blank" rel="sponsored nofollow noopener">Check price at ${where}<span class="visually-hidden"> (opens in a new tab)</span></a>`
      : `<span class="btn btn--small btn--soon">${sample ? "Sample slot: no link" : "Link being checked"}</span>`;
    return `<article class="product-card product-card--${inline ? "inline" : "grid"}"${inline ? "" : ` id="product-${esc(id)}"`}>
  <div class="product-card__img">${img}</div>
  <div class="product-card__body">
    <p class="label">${esc(lbl)}</p>${sample ? `<p class="sample-tag" data-pagefind-ignore>Sample product</p>` : ""}
    <h3 class="product-card__title">${esc(p.name)}</h3>
    ${meta ? `<p class="product-card__meta">${meta}</p>` : ""}
    ${mt}
    ${sample && !inline && p.note ? `<p class="product-card__note">${esc(p.note)}</p>` : ""}
    ${cta}
  </div>
</article>`;
  }
  const CATEGORY = { "press-on-nails": "Press-on nails", "nail-glue": "Nail glue", "adhesive-tabs": "Adhesive tabs", prep: "Prep", tools: "Tools", "nail-care": "Nail care", removal: "Removal", "nail-art-supplies": "Nail art supplies", "gel-kits": "Gel kit", decor: "Decor" };
  eleventyConfig.addAsyncShortcode("productCard", productCard);

  // ---------- Article card ----------
  eleventyConfig.addAsyncShortcode("articleCard", async (a, size = "") => {
    const kicker = a.data.kicker || (site.sections[a.data.section] || {}).label || "";
    const img = await imgShortcode(a.data.hero, "(min-width: 1024px) 400px, (min-width: 640px) 33vw, 50vw", "ratio-45", "lazy", [400, 800]);
    const n = (a.data.looks || []).length;
    return `<article class="article-card${size ? " article-card--" + size : ""}"><a class="article-card__link" href="${a.url}">${img}<p class="kicker">${esc(kicker)}</p><h3 class="article-card__title">${esc(a.data.title)}</h3>${n > 3 ? `<p class="article-card__count">${n} looks</p>` : ""}</a></article>`;
  });

  // ---------- Small look tile (browse pages, More like this, New this week) ----------
  eleventyConfig.addAsyncShortcode("lookCard", async (l) => {
    const img = await imgShortcode(l.image, "(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw", "ratio-45", "lazy", [400, 800]);
    const k = [l.shape && label(l.shape, "shape"), l.length && label(l.length, "length"), asArray(l.finish)[0] && label(asArray(l.finish)[0], "finish")].filter(Boolean).join(" · ");
    return `<article class="article-card look-tile"><a class="article-card__link" href="${l.articleUrl}#${l.anchor}">${img}<p class="kicker">${esc(k)}</p><h3 class="article-card__title">${esc(l.title)}</h3><p class="look-card__from">From: ${esc(l.articleTitle)}</p></a></article>`;
  });

  // ---------- Full Look Card (inside articles) ----------
  // {% lookFull look, look.num, page.url, articleTitle, similar %}
  // v4 (27 Nov 2026): editorial blog card, top to bottom:
  //   eyebrow (number · difficulty) → title → full-width image + AI caption →
  //   description → tag row + swatches → Best for → How to recreate (inline) →
  //   action bar [Save] [Pin it] [More like this] → hidden "More like this" panel.
  // No product match, no product links (soft launch).
  eleventyConfig.addAsyncShortcode("lookFull", async (l, n, pageUrl, articleTitle, similar = []) => {
    const anchor = l.anchor;
    const meta = imageMeta[l.image] || {};
    const isAi = l.aiImage !== false && meta.ai;
    const img = await imgShortcode(l.image, "(min-width: 1080px) 1000px, 100vw", "ratio-32 no-chip", "lazy", [600, 1000, 1400]);
    const pinMedia = site.url + (await imgSrc(l.image, 1000));
    const pinUrl = `${site.url}${pageUrl}#${anchor}`;
    const plain = String(l.text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const pinDesc = `${l.title}: ${plain.slice(0, 300)} | ${site.name}`;
    const tax = [
      l.shape && `<a href="/browse/shape/${l.shape}/">${esc(label(l.shape, "shape"))}</a>`,
      l.length && `<a href="/browse/length/${l.length}/">${esc(label(l.length, "length"))}</a>`,
      ...asArray(l.finish).map((f) => taxonomy.finish.some((t) => t.slug === f) ? `<a href="/browse/finish/${f}/">${esc(label(f, "finish"))}</a>` : `<span>${esc(f)}</span>`),
    ].filter(Boolean).map((c) => `<li>${c}</li>`).join("");
    const sw = asArray(l.swatches).length
      ? `<span class="swatches" role="img" aria-label="Approximate shades">${asArray(l.swatches).map((h) => `<span class="swatch" style="background:${esc(h)}"></span>`).join("")}</span>` : "";
    const best = l.bestFor ? `<p class="look-card__best"><strong>Best for:</strong> ${esc(l.bestFor)}</p>` : "";
    const w = l.ways || {};
    const wayRows = [["Press-on", w.pressOn], ["DIY", w.diy], ["Salon", w.salon]].filter(([, t]) => t)
      .map(([k, t]) => `<div class="how__row"><dt>${k}</dt><dd>${esc(t)}</dd></div>`).join("");
    const how = wayRows ? `<div class="look-card__how how"><h4 class="how__title">How to recreate this look</h4><dl class="how__list">${wayRows}</dl></div>` : "";
    const fin = asArray(l.finish)[0];
    const finLink = fin && taxonomy.finish.some((t) => t.slug === fin) ? `<a class="link-arrow" href="/browse/finish/${fin}/">All ${esc(label(fin, "finish").toLowerCase())} looks</a>` : "";
    const panelId = `${anchor}-more`;
    const morePanel = similar.length ? `<div class="look-more" id="${esc(panelId)}" data-more-panel>
      <p class="look-more__label">More like this</p>
      <ul class="look-more__list">${(await Promise.all(similar.map(async (s) => `<li><a href="${s.articleUrl}#${s.anchor}"><img src="${await imgSrc(s.image, 400)}" alt="" width="96" height="72" loading="lazy" decoding="async"><span class="look-more__txt"><span class="look-more__t">${esc(s.title)}</span><span class="look-more__from">${esc(s.articleTitle || "")}</span></span></a></li>`))).join("")}</ul>
      ${finLink}
    </div>` : "";
    const num = String(n).padStart(2, "0");
    const eyebrow = [num, l.difficulty && (DIFFICULTY[l.difficulty] || l.difficulty)].filter(Boolean).map(esc).join(" · ");
    const savePayload = esc(JSON.stringify({ id: `${pageUrl}#${anchor}`, t: l.title, u: `${pageUrl}#${anchor}`, i: await imgSrc(l.image, 600), a: articleTitle }));
    const I = {
      heart: `<svg class="act__icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>`,
      pin: `<svg class="act__icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6c0 2.4 1.3 3.9 2.6 4.5L7.5 21l3.3-5.4c.4.1.8.1 1.2.1a6 6 0 0 0 0-12.7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
      grid: `<svg class="act__icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`,
    };
    return `<article class="look-card" id="${esc(anchor)}" aria-labelledby="${esc(anchor)}-title">
  <header class="look-card__head">
    <p class="look-card__eyebrow"><span class="visually-hidden">Look </span>${eyebrow}</p>
    <h3 class="look-card__title" id="${esc(anchor)}-title">${esc(l.title)}</h3>
  </header>
  <figure class="look-card__fig">
    ${img}
    ${isAi ? `<figcaption class="ai-caption">AI-generated inspiration, not a product photo. <a href="/how-we-use-ai-images/">About our images</a></figcaption>` : ""}
  </figure>
  <div class="look-card__body">
    <div class="look-card__text">${l.text || ""}</div>
    ${tax || sw ? `<div class="look-card__tax"><ul class="recipe" aria-label="Shape, length and finish">${tax}</ul>${sw}</div>` : ""}
    ${best}
    ${how}
  </div>
  <div class="look-actions" data-pagefind-ignore>
    <button class="act act--save" type="button" data-save="${savePayload}" aria-pressed="false">${I.heart}<span data-save-label>Save</span><span class="visually-hidden"> ${esc(l.title)}</span></button>
    <a class="act" target="_blank" rel="noopener" href="https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(pinUrl)}&amp;media=${encodeURIComponent(pinMedia)}&amp;description=${encodeURIComponent(pinDesc)}">${I.pin}<span>Pin it</span><span class="visually-hidden"> (opens Pinterest in a new tab)</span></a>
    ${morePanel ? `<button class="act act--more" type="button" aria-expanded="false" aria-controls="${esc(panelId)}" data-more-toggle>${I.grid}<span>More like this</span></button>` : ""}
  </div>
  ${morePanel}
</article>`;
  });

  // {% shapeTile taxonomyItem, "shape" %}
  eleventyConfig.addAsyncShortcode("shapeTile", async (t, facet = "shape") => {
    const img = await imgShortcode(t.image, "(min-width: 1024px) 180px, 25vw", "ratio-23 no-chip", "lazy", [400]);
    return `<li class="shape-tile"><a href="/browse/${facet}/${t.slug}/"><span class="shape-tile__mask">${img}</span><span class="shape-tile__label">${esc(t.label)}</span></a></li>`;
  });

  // Absolute URL of the largest JPEG of an image (for og:image)
  eleventyConfig.addAsyncShortcode("imgUrl", async (file) => site.url + (await imgSrc(file, 1200)));

  // ---------- Collections ----------
  const isLive = (a) => !a.data.draft;
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob("src/articles/*.md").filter(isLive).sort((a, b) => b.date - a.date)
  );

  // Every individual nail look across all articles (browse pages, More like this, Saved)
  const lookAnchor = (look, i) => look.id || `look-${i + 1}`;
  eleventyConfig.addCollection("looks", (api) => {
    const looks = [];
    api.getFilteredByGlob("src/articles/*.md").filter(isLive).sort((a, b) => b.date - a.date).forEach((a) => {
      if (a.data.section === "home-decor") return; // decor ideas are not nail looks
      (a.data.looks || []).forEach((look, i) => {
        looks.push({ ...look, n: i + 1, articleUrl: a.url, articleTitle: a.data.title, articleDate: a.date, anchor: lookAnchor(look, i),
          occasion: asArray(look.occasion).length ? look.occasion : a.data.occasion });
      });
    });
    return looks;
  });

  // ---------- Filters ----------
  eleventyConfig.addFilter("facets", (data) => facetValues(data));
  eleventyConfig.addFilter("lookAnchor", (look, i) => lookAnchor(look, i));
  // Adds the anchor to each look of an article (used by the template loop)
  eleventyConfig.addFilter("withAnchors", (looks) => (looks || []).map((l, i) => ({ ...l, num: i + 1, anchor: lookAnchor(l, i) })));

  eleventyConfig.addFilter("notSection", (articles, section) => articles.filter((a) => a.data.section !== section));
  eleventyConfig.addFilter("bySection", (articles, section) => articles.filter((a) => a.data.section === section));
  eleventyConfig.addFilter("byGuide", (articles) => articles.filter((a) => a.data.pageType === "guide"));

  eleventyConfig.addFilter("withFacet", (items, facet, slug) =>
    items.filter((item) => {
      const vals = item.data ? facetValues(item.data)[facet] : asArray(item[facet]);
      return vals.includes(slug);
    })
  );

  // 3 most similar looks from the whole site (shared finish/colour/shape/style)
  eleventyConfig.addFilter("similarLooks", (all, look, pageUrl, n = 3) => {
    const score = (o) => {
      let s = 0;
      for (const [f, w] of [["finish", 3], ["colour", 2], ["style", 2], ["shape", 1], ["length", 1]]) {
        const mine = asArray(look[f]);
        s += asArray(o[f]).filter((v) => mine.includes(v)).length * w;
      }
      return s + (o.articleUrl !== pageUrl ? 0.5 : 0);
    };
    return all
      .filter((o) => !(o.articleUrl === pageUrl && o.anchor === look.anchor))
      .map((o) => ({ o, s: score(o) }))
      .filter((x) => x.s >= 3)
      .sort((a, b) => b.s - a.s)
      .slice(0, n)
      .map((x) => x.o);
  });

  eleventyConfig.addFilter("related", (articles, currentUrl, n = 3) => {
    const current = articles.find((a) => a.url === currentUrl);
    if (!current) return [];
    const mine = facetValues(current.data);
    return articles
      .filter((a) => a.url !== current.url)
      .map((a) => {
        const theirs = facetValues(a.data);
        let score = a.data.section === current.data.section ? 2 : 0;
        for (const f of FACETS) score += theirs[f].filter((v) => mine[f].includes(v)).length;
        return { a, score };
      })
      .sort((x, y) => y.score - x.score || y.a.date - x.a.date)
      .slice(0, n)
      .map((x) => x.a);
  });

  eleventyConfig.addFilter("findUrl", (articles, url) => articles.find((a) => a.url === url));
  eleventyConfig.addFilter("notUrl", (articles, url) => articles.filter((a) => a.url !== url));
  eleventyConfig.addFilter("taxLabel", (slug, facet) => label(slug, facet));
  eleventyConfig.addFilter("groupLooks", (looks, groups) => {
    if (!groups || !groups.length) return [{ id: "", title: "", intro: "", looks }];
    return groups.map((g) => ({ ...g, looks: looks.filter((l) => l.group === g.id) })).filter((g) => g.looks.length);
  });

  // Unique products referenced in an article (looks + quick picks + extras), in order
  eleventyConfig.addFilter("articleProducts", (data) => {
    const ids = [];
    (data.quickPicks || []).forEach((q) => q.product && ids.push(q.product));
    (data.looks || []).forEach((l) => asArray(l.products).concat(asArray(l.product), productList.filter((p) => l.id && asArray(p.matchedLooks).includes(l.id)).map((p) => p.id)).forEach((p) => ids.push(p)));
    (data.problems || []).forEach((pr) => problemProducts(pr).forEach((p) => ids.push(p)));
    asArray(data.extraProducts).forEach((p) => ids.push(p));
    return [...new Set(ids)].filter((id) => isShown(products[id]));
  });
  // Problem Solver: explicit products, else verified products in the listed categories (max 2)
  function problemProducts(pr) {
    const explicit = asArray(pr.products).filter((id) => isShown(products[id]));
    if (explicit.length) return explicit;
    return productList.filter((p) => isShown(p) && !p.sample && asArray(pr.productCategories).includes(p.category)).slice(0, 2).map((p) => p.id);
  }
  eleventyConfig.addFilter("problemProducts", problemProducts);
  eleventyConfig.addFilter("product", (id) => {
    const p = products[id];
    if (!p) throw new Error(`[product] Unknown product id "${id}". Add it to src/_data/products.json`);
    return p;
  });
  // true when any listed product links to a store (drives the disclosure wording)
  eleventyConfig.addFilter("anyLinked", (ids) => ids.some((id) => products[id] && !products[id].sample && productLink(products[id])));
  eleventyConfig.addFilter("anyAffiliate", (ids) => ids.some((id) => products[id] && products[id].affiliateReady && products[id].affiliateUrl));
  eleventyConfig.addFilter("productsFor", (category) => productList.filter((p) => isShown(p) && !p.sample && (!category || p.category === category)));
  eleventyConfig.addFilter("productsByCategories", (cats) => productList.filter((p) => isShown(p) && !p.sample && asArray(cats).includes(p.category)));

  eleventyConfig.addFilter("absUrl", (url) => new URL(url, site.url).href);
  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }));
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("rfc3339", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("urlencode", (s) => encodeURIComponent(s));
  eleventyConfig.addFilter("xmlEscape", (s) => esc(s).replace(/'/g, "&#39;"));
  eleventyConfig.addFilter("stripTags", (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  eleventyConfig.addFilter("readingTime", (content) => {
    const words = String(content || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(2, Math.round(words / 220));
  });
  // Absolute links inside feed content
  eleventyConfig.addFilter("absLinks", (html) => String(html || "").replace(/(href|src)="\/(?!\/)/g, `$1="${site.url}/`));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
