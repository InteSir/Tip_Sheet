# The Tip Sheet: Code Guide for a MERN developer

*Written 27 Nov 2026 for v4. Paths are relative to the project root.*

If you know React and Express, you already know most of this project. It uses **Eleventy (11ty) v3**, a static site generator. It runs in Node at **build time**, reads data and templates, and writes plain HTML/CSS/JS into `_site/`. Netlify serves that folder. There is no server at runtime, no database and no React. The only browser JavaScript is one small file, `src/assets/js/site.js`.

---

## 1. Eleventy in React / Express terms

| Eleventy concept | Closest MERN idea | Where it is here |
|---|---|---|
| **`_data/` files** | Global props / React Context, available to every template | `src/_data/site.js`, `taxonomy.js`, `images.json`, `products.json`, `browsePages.js` |
| **Front matter** (the YAML between `---` lines at the top of a `.md`/`.njk`) | Props passed to one page | e.g. `looks:` and `groups:` in `src/articles/new-years-eve-nails.md` |
| **Directory data file** (`*.11tydata.js`) | Default props for every page in a folder | `src/articles/articles.11tydata.js` sets the layout and URL for all articles |
| **Layouts** | Wrapper components (`<Layout>{children}</Layout>`) | `src/_includes/layouts/base.njk` → `article.njk` / `page.njk` |
| **Partials** (`{% include %}`) | Small presentational components with no props | `src/_includes/partials/header.njk`, `footer.njk` |
| **Nunjucks** (`.njk`) | JSX-like templating: HTML with `{{ }}` and `{% %}` | all `.njk` files |
| **Shortcodes** | Reusable components that return an HTML string | `eleventy.config.js`: `img`, `lookFull`, `lookCard`, `articleCard`, `shapeTile` |
| **Filters** | Pure helper functions / selectors (`arr.filter(...)`) | `eleventy.config.js`: `similarLooks`, `withFacet`, `bySection`, `limit` |
| **Collections** | Queries: "give me all articles, sorted" | `collections.articles`, `collections.looks` in `eleventy.config.js` |
| **`permalink`** | Routes (`app.get('/nail-ideas/:slug')`) | front matter, or computed in `articles.11tydata.js` |
| **Pagination** | One template producing many pages, like `items.map(i => <Page/>)` writing files | `src/pages/sections.njk` (3 hubs), `src/pages/browse-facet.njk` (every filter page) |
| **The build** | `next export` / `vite build`: a static export | `npm run build` → `_site/` |
| **`eleventy --serve`** | `vite dev` / `nodemon` with live reload | `npm start` |

**Mental model:** `eleventy.config.js` is your `server.js` plus component library. `src/_data` is the store. Each `.md`/`.njk` file in `src/` is a route. Layouts wrap routes like an `<App>` shell.

---

## 2. Folder map

```
tip-sheet/
├─ eleventy.config.js      ← "server.js": shortcodes (components), filters, collections, image pipeline
├─ package.json            ← npm scripts (section 7)
├─ netlify.toml            ← Netlify build command, headers, redirects
├─ src/                    ← everything that becomes the website
│  ├─ index.njk            ← HOMEPAGE (route "/")
│  ├─ _data/               ← global data ("context")
│  │  ├─ site.js           ← name, URL, nav, homepage config, New this week, shopping flag
│  │  ├─ taxonomy.js       ← shapes, lengths, colours (with swatches), finishes, styles, occasions
│  │  ├─ images.json       ← ALT TEXT + AI flag for every image (build fails without an entry)
│  │  ├─ products.json     ← product records for later (hidden while shopping: false)
│  │  └─ browsePages.js    ← generates the list of /browse/<facet>/<value>/ pages
│  ├─ _includes/
│  │  ├─ layouts/base.njk     ← <html>, <head>, header, footer, scripts
│  │  ├─ layouts/article.njk  ← article template: hero, looks, Problem Solver, checklists, sources
│  │  ├─ layouts/page.njk     ← simple pages (About, legal)
│  │  └─ partials/            ← header.njk, footer.njk, newsletter.njk
│  ├─ articles/            ← ONE MARKDOWN FILE PER ARTICLE (front matter = data, body = prose)
│  │  └─ articles.11tydata.js ← default layout + URL rule for all articles
│  ├─ pages/               ← hubs, browse, saved, search, About, legal, contact, 404
│  ├─ images/              ← source images (JPG). Resized to WebP/JPEG automatically
│  └─ assets/              ← css/main.css, js/site.js, fonts, brand SVGs, og/ and pins/ images
├─ publishing/             ← Pin packages (pins/*.json) and content-plan.json
├─ pinterest-pins/         ← rendered 1000×1500 Pin images, one folder per article
├─ dashboard/              ← private publishing dashboard (generated, NOT part of the site)
├─ tools/                  ← check-site.js (link/alt/soft-launch checker), make_pins.py, build-dashboard.js
├─ brand-kit/              ← logo, favicon, Pinterest profile/cover, mockups
└─ docs/CODE_GUIDE.md      ← this file
```

`_site/` (the output) and `node_modules/` are generated. Never edit them.

---

## 3. Where each visible part lives

| What you see | Template file | Data | Main CSS selectors |
|---|---|---|---|
| Top announcement strip | `partials/header.njk` | `site.announcement` | `.top-strip` |
| Header, logo, nav, Browse/Search/Saved icons | `partials/header.njk` | `site.nav`, `site.chips` (mobile row) | `.site-header`, `.primary-nav`, `.header-tools`, `.saved-count` |
| Homepage hero | `src/index.njk` (first section) | `site.homepage.heroUrl` | `.ed-hero` |
| Homepage **Start here** | `src/index.njk` (`starts` list at the top of the section) | inline in template | `.start-here`, `.start-grid`, `.start-card` + **`.ed-link`** |
| Homepage **New this week** | `src/index.njk` (`.new-edit`) | **`site.homepage.newThisWeek`** in `site.js` | `.new-edit__grid`, `.ne`, `.ne--lead/--tall/--wide/--square/--landscape` |
| Homepage browse block (shape tiles + chips) | `src/index.njk` (`.browse-block`) | `taxonomy.js` | `.browse-block`, `.shape-tile`, `.browse-rows` |
| Homepage Problem Solver band | `src/index.njk` | Problem Solver article front matter | `.solver-band` |
| Complete the Vibe / decor band | `src/index.njk` | `site.homepage.vibe` | `.vibe`, `.feature-band` |
| Hub pages (Nail Ideas, Press-On Hub, Home & Decor) | `src/pages/sections.njk` (paginated) | `sectionPages:` list in its front matter | `.hub`, `.page-head` |
| Hub numbered links (01 This week / 02 Short nails / 03 Finish) | `sections.njk` (`sp.start`) | `start:` per hub in front matter | `.start-card` + **`.ed-link`** |
| Nail Ideas **Browse band** (dark) | `sections.njk` (`.browse-band`) | `taxonomy.js` + counts from `collections.looks` | `.browse-band`, `.browse-rows--band`, `.browse-col`, `.chip` |
| Hub **FAQ** | `sections.njk` (`.faq--hub`) | `faq:` per hub in front matter | `.faq`, `.faq--hub`, `.faq__item` |
| Article header, hero, intro | `layouts/article.njk` (top) | article front matter | `.article-head`, `.article-hero`, `.prose` |
| **Look groups** ("Gold & champagne") | `layouts/article.njk` (`.looks`) | `groups:` in front matter | `.look-group`, `.look-group__head` |
| **Look Card** | shortcode **`lookFull`** in `eleventy.config.js` | each item in `looks:` | `.look-card`, `.look-card__eyebrow/__title/__fig/__body/__tax/__best`, `.how`, `.look-actions`, `.act`, `.look-more` |
| Small look tiles (browse pages, Saved) | shortcode `lookCard` + `site.js` (Saved page) | `collections.looks` | `.look-tile`, `.article-card` |
| **Problem Solver** | `layouts/article.njk` (`{% if problems %}`) | `problems:` in `press-on-problem-solver.md` | `.problems`, `.problem-index`, `.problem`, `.problem__quick`, `.problem__cols`, `.problem__conflict` |
| Checklist / sizing guide | `layouts/article.njk` | `checklist:` / sizing data | `.checklist-groups`, `[data-print]` |
| Follow block + footer | `partials/footer.njk` | `site.social`, `site.strapline` | `.follow`, `.site-footer` |
| Saved page | `src/pages/saved.njk` + `site.js` | browser localStorage `tipsheet-saved-v1` | `.look-tile` |

---

## 4. CSS map (`src/assets/css/main.css`)

One file, no build step, plain CSS custom properties. Search for these banner comments:

| Section banner | What it holds |
|---|---|
| `Fonts` | self-hosted Fraunces + DM Sans `@font-face` |
| **`Design tokens`** | `:root` colours (`--ivory`, `--berry`, `--ink`, `--gold`…), `--font-serif/--font-sans`, spacing (`--gutter`, `--space-section`), radii |
| `Reset` | base element styles, global `prefers-reduced-motion` rule |
| `Layout helpers` | `.wrap` (1280px max), `.wrap-narrow` / `.wrap-wide` (overridden in v4 to 1040px), `.section` |
| `Type helpers` | `.label`, `.kicker`, `.h1`, `.h2`, `.section-head`, `.link-arrow` |
| `Buttons & chips` | `.btn`, `.btn--outline`, `.chip`, `.chips` |
| `Media / images` | `.media`, ratio classes `.ratio-32`, `.ratio-45`, `.ratio-1`, `.ph-chip` |
| `Top strip & header` … `404` | one block per page area, in page order |
| second `=====` banner (v2/v3) | homepage editorial sections, start cards, solver band, look tiles, Problem Solver base styles, print rules |
| **last `=====` banner, "v4"** | everything changed in v4: widths, look groups, Look Card, action bar, More like this, `.ed-link`, Browse band, hub FAQ, New this week, Problem Solver spacing |

Later rules override earlier ones with the same specificity, so the v4 block wins. To restyle something, search for its selector from the table in section 3 and edit the **last** occurrence.

Breakpoints are mobile-first: base styles are for phones, then `@media (min-width: 640px)` for tablet, `768px` for small laptop and `1024px` for desktop.

---

## 5. Nunjucks vs JSX cheat sheet

| Task | JSX | Nunjucks |
|---|---|---|
| Output a value | `{title}` | `{{ title }}` (auto-escaped) |
| Output trusted HTML | `dangerouslySetInnerHTML` | `{{ content \| safe }}` |
| Condition | `{ok && <p/>}` / ternary | `{% if ok %}<p>…</p>{% elif x %}…{% else %}…{% endif %}` |
| Inline ternary | `a ? b : c` | `{{ b if a else c }}` |
| Loop | `items.map((i, n) => …)` | `{% for i in items %}{{ loop.index }}…{% endfor %}` |
| Loop with async shortcode | n/a | `{% asyncEach i in items %}{% lookCard i %}{% endeach %}` |
| Variable | `const x = …` | `{% set x = … %}` |
| Call helper | `formatDate(d)` | filter: `{{ d \| readableDate }}` |
| Chain helpers | `limit(sort(a), 3)` | `{{ a \| sort \| limit(3) }}` |
| Render component | `<LookCard look={l} />` | `{% lookCard l %}` (shortcode) |
| Include child | `<Header />` | `{% include "partials/header.njk" %}` |
| Wrap in layout | `<Layout>…</Layout>` | front matter `layout: layouts/base.njk`; inside the layout, `{{ content \| safe }}` is `children` |
| Comment | `{/* */}` | `{# comment #}` |
| Trim whitespace | n/a | `{%- … -%}` |

**Real example** (homepage New this week, `src/index.njk`):

```njk
{% asyncEach f in site.homepage.newThisWeek %}
<a class="ne ne--{{ f.layout }} ed-link" href="{{ f.url }}">
  <span class="ne__media">{% img f.image, "(min-width: 1024px) 420px, 100vw", "no-chip", "lazy", [400, 800, 1200] %}</span>
  <span class="ne__text">
    <span class="label">{{ f.label }}</span>
    <span class="ne__title ed-link__title"><span class="ed-link__line">{{ f.title }}</span></span>
  </span>
</a>
{% endeach %}
```

In JSX that would be `site.homepage.newThisWeek.map(f => <a className={"ne ne--" + f.layout}>…</a>)`.

**A shortcode is a component that returns a string** (`eleventy.config.js`):

```js
eleventyConfig.addAsyncShortcode("lookFull", async (l, n, pageUrl, articleTitle, similar = []) => {
  const img = await imgShortcode(l.image, "(min-width: 1080px) 1000px, 100vw", "ratio-32 no-chip", "lazy", [600, 1000, 1400]);
  // ... builds tags, "How to recreate", action bar ...
  return `<article class="look-card" id="${esc(anchor)}"> ... </article>`;
});
```

Called from `layouts/article.njk`:

```njk
{% set sim = collections.looks | similarLooks(look, page.url) %}
{% lookFull look, look.num, page.url, title, sim %}
```

**A collection is a query** (`eleventy.config.js`):

```js
eleventyConfig.addCollection("articles", (api) =>
  api.getFilteredByGlob("src/articles/*.md").filter(isLive).sort((a, b) => b.date - a.date));
// isLive hides articles whose date is still in the future (scheduled posts)
```

**A route** comes from `articles.11tydata.js`:

```js
permalink: (data) => `${base[data.section] || "/articles/"}${data.slug || data.page.fileSlug}/`,
// section: nail-ideas + file new-years-eve-nails.md  →  /nail-ideas/new-years-eve-nails/
```

---

## 6. How to make common changes

### Add an article
1. Copy an existing file in `src/articles/`, e.g. `red-christmas-nail-ideas.md`, to `valentines-nails.md`. The file name becomes the URL slug.
2. Edit the front matter: `title`, `description`, `section: nail-ideas` (or `press-ons` / `home-decor`), `date`, `hero:` (an image file name), `kicker`, `occasion`.
3. Write the intro in Markdown below the closing `---`.
4. Add `groups:` and `looks:` (next section). Run `npm start` and open `/nail-ideas/valentines-nails/`.
5. The article automatically appears in its hub, the RSS feed, the sitemap, search, and every browse page its looks match.

### Add a look
Add an item under `looks:` in the article's front matter:

```yaml
  - id: val-cherry-hearts          # unique; becomes the #anchor
    group: hearts-and-reds         # must match a groups: id (optional)
    title: "Cherry hearts on milky pink"
    image: val-01.jpg              # in src/images/ AND in src/_data/images.json
    aiImage: true
    shape: almond                  # slugs from src/_data/taxonomy.js
    length: short
    finish: [glossy]
    colour: [red, pink]
    style: [nail-art]
    swatches: ["#F4DCD6", "#B8263F"]
    difficulty: diy                # press-on | diy | salon
    bestFor: "Date night, short nails"
    text: "<p>One or two sentences of editorial description.</p>"
    ways:
      pressOn: "…"
      diy: "…"
      salon: "…"
```

The checker (`npm run check`) fails if `id`, `title`, `image`, `text`, `shape/length/finish`, `difficulty` or `bestFor` is missing.

### Change colours or fonts
Edit the `:root` tokens under `/* ---------- Design tokens ---------- */` in `main.css`, e.g. `--berry: #7A1F3D;`. Everything uses the variables. Fonts are self-hosted in `src/assets/fonts/` and declared under `Fonts`. To change a font, add the `.woff2`, add an `@font-face`, then change `--font-serif` / `--font-sans`.

### Add a simple page
Create `src/pages/shipping.md`:

```md
---
layout: layouts/page.njk
title: Shipping
permalink: /shipping/
description: "…"
---
Your Markdown here.
```

### Edit the navigation
`src/_data/site.js` → `nav:` (desktop) and `chips:` (mobile row under the logo). Footer links are written directly in `partials/footer.njk`.

### Change spacing or widths
- Section spacing: `--space-section` in the tokens.
- Page gutters: `--gutter`.
- Reading/content width: `.wrap-narrow` and `.wrap-wide` (both `width: min(100% - 40px, 1040px)` since v4) in the v4 block.
- Look Card padding: `.look-card` (mobile) and inside `@media (min-width: 768px)`.

### Add an image and its alt text
1. Put the JPG in `src/images/`. 1600px wide is plenty; Eleventy Image makes 400–1400px WebP + JPEG versions.
2. Add an entry to `src/_data/images.json`:
   ```json
   "val-01.jpg": { "alt": "Hand with short almond nails in milky pink with small cherry-red hearts", "placeholder": true, "ai": true, "source": "AI-generated inspiration (…)" }
   ```
   The build **stops** with `Missing entry for "val-01.jpg"` if you forget. `ai: true` makes the "AI-generated inspiration" caption appear.
3. Use it with `{% img "val-01.jpg", "100vw", "ratio-32" %}` or as `image:` in a look.

### Edit the homepage New this week strip
Edit `site.homepage.newThisWeek` in `site.js`. Each item has `layout` (`lead`, `tall`, `wide`, `square`, `landscape`), `image`, `label`, `title`, `text`, `url` (a real page or `#look` anchor; the checker verifies links) and an optional `cta`. Keep exactly one `lead`.

### Pins and the dashboard
- Pin copy lives in `publishing/pins/<article>.json` (title, description, keywords, board, destination, publishDate, status).
- `npm run pins` renders the 1000×1500 images into `pinterest-pins/<article>/`.
- `npm run dashboard` rebuilds `dashboard/index.html`, a private file you open locally. It is not deployed.
- The checker fails on a Pin with a missing field, an unknown board, shopping wording or a broken destination anchor.

### Turn shopping on later
Follow README → "Turning shopping on later". In short: verify products in `src/_data/products.json`, add affiliate URLs once approved, set `shopping: true` in `site.js`, update the disclosure page, and remove the soft-launch bans from `tools/check-site.js`.

---

## 7. npm scripts and the Netlify build

| Script | What it does |
|---|---|
| `npm start` | full build, then `eleventy --serve` with live reload at http://localhost:8080 |
| `npm run build` | delete `_site`, run Eleventy, build the Pagefind search index |
| `npm run check` | `tools/check-site.js`: links, anchors, alt text, titles, Look Card markup, Pins, feed, redirects, soft-launch bans |
| `npm run netlify` | `build` + `check`. **This is what Netlify runs.** |
| `npm run pins` | render Pin images (Python + Pillow) |
| `npm run dashboard` | regenerate the private publishing dashboard |

`netlify.toml` sets `command = "npm run netlify"`, `publish = "_site"` and Node 22. If the checker finds a problem, the build fails and Netlify keeps the previous version live, so a broken link can never go out.

---

## 8. Browser JavaScript (`src/assets/js/site.js`)

Plain JS, no framework, about 100 lines:
- **Save**: any `[data-save]` button toggles an item in `localStorage["tipsheet-saved-v1"]` and sets `aria-pressed` plus the label Save/Saved (filled heart via CSS). It also updates the header count.
- **More like this**: `[data-more-toggle]` buttons toggle `aria-expanded` and the `hidden` attribute of the panel named in `aria-controls`. Without JS, the panel simply shows.
- **Saved page**: renders `.look-tile` markup from localStorage.
- Header compacting on scroll, mobile menu, `[data-print]` buttons, `.is-target` highlight for `#anchor` links.

---

## 9. Debugging

| Symptom | Cause and fix |
|---|---|
| `Missing entry for "x.jpg" in src/_data/images.json` | Add the image to `images.json` (section 6). |
| `unknown block tag: endfor` / `expected endif` | Unbalanced `{% for %}`/`{% if %}`. The line number counts from **after** the front matter. |
| `Template render error … asyncEach` / a shortcode prints `[object Promise]` | **The asyncEach gotcha.** Async shortcodes (`img`, `lookFull`, `lookCard`, `articleCard`) cannot run inside a plain `{% for %}` loop. Use `{% asyncEach x in list %}…{% endeach %}`. Plain loops are fine when they contain no async shortcodes. |
| YAML error on build | Front matter indentation, or an unquoted value containing `:` or `#`. Wrap text values in `"double quotes"`. |
| Look card missing from browse pages | Its `shape/length/finish/colour` slug isn't in `taxonomy.js` (check spelling). |
| Checker: `destination anchor missing #id` | A Pin or New-this-week link points to a look `id` that changed. |
| CSS change not showing | You edited an earlier rule; a later rule (often in the v4 block) overrides it. Search the selector and edit the last match. |
| Changes not picked up by `npm start` | Data files in `_data/` reload, but changes to `eleventy.config.js` need a restart (Ctrl+C, `npm start`). |
| Build is slow (about 1–2 minutes) | Eleventy Image resizes every picture into `_site/img/`. `npm run build` deletes `_site` first, so a clean build redoes it. That is normal. |

Debug output: `{{ someVar | dump }}` prints JSON in the page, much like `console.log` in JSX. Run `DEBUG=Eleventy* npx eleventy` for verbose logs.
