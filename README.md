# The Tip Sheet

*Nail ideas, press-on know-how and small-space style.*

A fast, static beauty-editorial website built with **Eleventy (11ty)**, plain HTML/CSS/JavaScript and **Pagefind** search. It's made for **Netlify's free plan**: no database, no login, no backend, no paid services.

> **Soft launch (v3).** The site launches **without products or affiliate links**. `src/_data/products.json` stays in the repo for a later phase, but nothing product-related renders while `shopping: false` in `src/_data/site.js`. Photos are AI-generated inspiration and are captioned "AI-generated inspiration, not a product photo". See [Turning shopping on later](#turning-shopping-on-later).

---

## 1. Run it on your computer

You need **Node.js 20 or newer**. Get the free "LTS" version from nodejs.org.

```bash
cd the-tip-sheet
npm install        # first time only: downloads Eleventy, Pagefind and the fonts
npm start          # builds the site and opens a live preview
```

Open the address it prints (usually **http://localhost:8080**). Pages reload automatically when you edit a file.

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Builds the finished site into `_site/` and creates the search index |
| `npm run check` | After a build, checks every page for broken links, missing images, alt text and metadata |

Search reads an index made during `npm run build`. If you add an article while `npm start` is running, stop it and run `npm start` again to refresh search.

---

## 2. Deploy to Netlify (free)

Everything Netlify needs is already in **`netlify.toml`**, so you don't type any build settings yourself:

| Setting | Value | Where it comes from |
| --- | --- | --- |
| Base directory | *(leave empty: the repository root)* | |
| Build command | `npm run netlify` (build + site check) | `netlify.toml` |
| Publish directory | `_site` | `netlify.toml` |
| Node version | 22 | `netlify.toml` |
| Production branch | the branch that holds this project (`main` once merged) | Netlify UI |

**Recommended: connect the GitHub repository**
1. Sign in at app.netlify.com (free account) → **Add new project → Import an existing project → GitHub**, and pick the repository.
2. Choose the **branch to deploy** (the production branch). Leave the other fields as Netlify fills them in from `netlify.toml`, then click **Deploy**.
3. Under **Project configuration → Change project name**, choose a free name such as `the-tip-sheet` (if it's free) for `the-tip-sheet.netlify.app`.
4. Open **Forms** in the Netlify dashboard and select **Enable form detection**, then trigger one more deploy (**Deploys → Trigger deploy**). Form detection is off by default, and the contact form only accepts messages after a deploy with it switched on.

From then on, every commit to the production branch rebuilds and republishes the site automatically, usually within a couple of minutes. Commits to other branches do nothing unless you switch on branch deploys. A pull request gets a private-ish *Deploy Preview* link so you can check changes before merging.

If a build fails (for example a broken link or an image without alt text), Netlify keeps the last good version live. Open the failed deploy's log to see the problem.

**Alternative: drag and drop (no Git)** — run `npm run build` on your computer and drag the `_site` folder onto **Add new project → Deploy manually**. Changes then need a manual rebuild and re-upload, and the contact form won't be detected.

**After the first deploy**
- **Site address:** Netlify sets the `URL` variable automatically, so links, sitemap and share images use your real `.netlify.app` address. Also update the fallback address in `src/_data/site.js` (`url:`) to match.
- **Contact form:** messages appear under **Forms**. Turn on email notifications there if you like.
- **Search Console (optional, free):** submit `https://YOUR-SITE.netlify.app/sitemap.xml`.
- **Pinterest:** start with 5 boards (Nail Ideas & Nail Inspiration; Short Nail Designs; Press-On Nails & Tutorials; Chrome & Cat-Eye Nails; Renter-Friendly Small-Space Decor). Once the site is live, claim it in your free Pinterest Business account (Settings → Claimed accounts → Websites). If Pinterest gives you a meta tag, paste its content value into `pinterestVerify` in `src/_data/site.js` and redeploy. Then add your profile link to `site.social.pinterest`. Full kit: `Pinterest_Launch_Kit_Soft_Launch.md`.

---

## 2b. Editing on GitHub (no computer setup needed)

You can make every everyday change in the GitHub website. Each commit to the production branch triggers a Netlify rebuild.

- **Edit an article:** open `src/articles/<name>.md`, click the pencil icon, edit, then **Commit changes**.
- **Add an article:** in `src/articles/`, choose **Add file → Create new file**, name it `your-article-slug.md`, and copy the front matter from section 4 below.
- **Add or replace an image:** open `src/images/`, choose **Add file → Upload files**, and drop in the photo (JPG or PNG). Then add a matching entry with alt text to `src/_data/images.json`; the build stops if an image has no entry. To replace a placeholder, upload a file with the same name and set `"placeholder": false` for it.
- **Verify a product or add an affiliate link:** edit `src/_data/products.json` (see section 5). Nothing appears on the site while `shopping: false`.
- **Pins and share images** are made on your computer with `npm run pins` (needs Python + Pillow). You can also upload your own 1000×1500 Pins to `pinterest-pins/<article>/` and 1200×630 share images to `src/assets/og/`, keeping the same file names.
- **Mark a Pin as posted:** edit `publishing/pins/<article>.json` and change its `status` to `published`.

Tip: for bigger changes, commit to a new branch and open a pull request. Netlify builds a Deploy Preview you can check before you merge.

---

## New to Eleventy? Read the code guide

**[docs/CODE_GUIDE.md](docs/CODE_GUIDE.md)** explains this project in React/Express terms: what each folder does, where every visible section lives (file + CSS selector), how to add articles, looks, images and pages, and how to debug build errors.

## v4 changes (27 Nov 2026)

- Look Cards are now editorial blog cards: eyebrow → title → full-width 3:2 image + AI caption → description → tags + swatches → Best for → "How to recreate" inline → action bar (Save / Pin it / More like this buttons). Shortcode `lookFull` in `eleventy.config.js`, styles in the v4 block of `main.css`.
- `.wrap-narrow` and `.wrap-wide` are both 1040px.
- Nail Ideas hub: dark Browse band (4 columns), FAQ aligned to `.wrap`.
- Reusable `.ed-link` hover for Start here and hub links.
- Homepage "New this week" is a curated editorial strip, driven by `site.homepage.newThisWeek`.
- Problem Solver spacing.
- New full-resolution AI images for the New Year's Eve article and the New this week strip.

## 3. What's inside (v2, 26 Nov 2026)

```
the-tip-sheet/
├─ netlify.toml               Build settings, headers, and 301 redirects (/guides → /press-on-nails, /holiday-home → /home-decor)
├─ eleventy.config.js         Images, Look Cards, product cards, collections, filters
├─ package.json               npm scripts: build, check, netlify, pins, dashboard
├─ src/
│  ├─ index.njk               Homepage (editorial hero → Start here → New this week → Browse → Featured → Problem Solver → Complete the vibe → Home & Decor → Follow)
│  ├─ feed.njk                RSS (Atom) feed at /feed.xml
│  ├─ articles/               ← ARTICLES (one Markdown file each; looks, problems, steps, checklists live in front matter)
│  ├─ pages/                  Section hubs, Browse, Saved, How we use AI images, About, Contact, legal, Search, 404
│  ├─ _data/
│  │  ├─ site.js              Name, URL, 3-pillar nav, mobile chips, banner, homepage picks, newsletter (off)
│  │  ├─ products.json        ← THE ONLY PLACE PRODUCT LINKS LIVE (see section 5)
│  │  ├─ taxonomy.js          Browse filters: shape, length, colour, finish, style, occasion (+ swatches)
│  │  └─ images.json          Alt text + AI flag for every photo
│  ├─ _includes/layouts/      base, article (Look Cards, Problem Solver, steps, checklist), page
│  ├─ _includes/partials/     header (3 pillars + mobile chip row), footer, newsletter (hidden until configured)
│  ├─ images/                 Original images (WebP + JPEG generated at build)
│  └─ assets/                 css, js (menu, saved looks, print), fonts, brand, pins/ (one Pin per article for the on-page Save button), og/
├─ publishing/
│  ├─ content-plan.json       Publishing calendar (published, ready and planned articles)
│  └─ pins/<article>.json     The Pin package for each article (titles, descriptions, keywords, boards, links, dates, status)
├─ pinterest-pins/<article>/  Generated 1000×1500 Pin images for manual upload. NOT deployed (outside src/)
├─ dashboard/                 Private publishing dashboard, generated locally, git-ignored, never deployed
├─ tools/
│  ├─ make_pins.py            npm run pins: Pin images + share images from publishing/pins/*.json
│  ├─ build-dashboard.js      npm run dashboard: dashboard/index.html + dashboard/pins.csv
│  ├─ seed_pin_packages.py    One-off seed of the 26 Nov Pin packages (edit the JSON afterwards instead)
│  └─ check-site.js           Links, anchors, metadata, product schema, Look Card fields, soft-launch rules, Pins (5 boards, pools), feed, redirects
└─ brand-kit/                 The approved brand kit
```

**Built in:** Look Cards with their own anchor links (`/nail-ideas/new-years-eve-nails/#nye-disco-mosaic`), Save (stored only in the visitor's browser, listed at `/saved/`), Pin it, More like this, browse by finish, a printable sizing chart and prep checklist (Print buttons, print-only styles), RSS, responsive images, structured data, static search, accessible mobile menu.

---

## 4. The publishing workflow

Research → Article → Article Images → Pin Package → Asset Storage → Manual Review → Publishing Queue (Product Matching and Product Cards come back when shopping is turned on). A content package isn't finished until the article *and* its Pins are ready.

1. **Article:** add `src/articles/<slug>.md`. Copy `new-years-eve-nails.md` for an inspiration article or `press-on-problem-solver.md` / `press-on-sizing-guide.md` for a guide. Each look needs `id`, `title`, `image`, `shape`, `length`, `finish`, `colour`, `swatches`, `difficulty` (press-on | diy | salon), `bestFor`, `text` (about 45 words) and `ways` (`pressOn`, `diy`, `salon`, one sentence each, no specific product promised), plus optional `group`. `match`/`matchNote` are ignored during the soft launch. Don't pad: twenty genuinely different looks beat twenty-five repetitive ones.
2. **Images:** AI inspiration goes in `src/images/` with a line in `images.json` (`"ai": true`). The site captions it "AI-generated inspiration, not a product photo". No licensed characters and no numbers (like a year) painted on nails.
3. **Products:** not used during the soft launch (see section 5).
4. **Pins:** add `publishing/pins/<slug>.json` (each Pin has `board` = one of the 5 launch boards, optional `laterSeasonalBoard`, `pool` = initial | reserve, and a suggested `publishDate` for initial Pins), then `npm run pins`. Templates: `main`, `grid4`, `grid9`, `single`, `stack`, `split`, `checklist`, `diagnosis`.
5. **Calendar:** add the article to `publishing/content-plan.json`, then `npm run dashboard` and open `dashboard/index.html`.
6. **Review:** `npm run netlify` (build + all checks). Change Pin `status` from `draft` to `ready` after you've reviewed it, and to `published` once you've posted it by hand. Nothing is ever posted automatically.

`npm run pins` needs Python 3 with Pillow (`pip install pillow`). Pin images aren't needed for the Netlify build. The check only warns if they're missing.

---

## 5. Products: phase 1 → phase 2

<a id="turning-shopping-on-later"></a>
### Turning shopping on later

The soft launch hides every product card, quick pick, Shop the Look block and match badge. To bring them back, once real products are verified and (optionally) Amazon Associates has approved the account:

1. Verify records in `products.json` (below).
2. Set `shopping: true` in `src/_data/site.js`.
3. Rewrite `src/pages/affiliate-disclosure.md` and `src/pages/editorial-standards.md` so they describe how products are chosen and any commission, and add the program's required sentence.
4. Re-add `match`/`matchNote` to looks and update the checker's soft-launch rules in `tools/check-site.js`.

Brand note: the brand tagline "Nail ideas, and the press-ons to match." is kept in `site.js` as `tagline` but isn't shown while shopping is off; the site uses the `strapline` instead.


All product data lives in **`src/_data/products.json`** (`products` array). Each record has `id, name, brand, category, asin, amazonUrl, affiliateUrl, affiliateReady, matchedArticles, matchedLooks, matchType, matchReason, verificationStatus, lastChecked, imageSource, imageUsageStatus` (plus `candidateAsin`, `candidateUrl`, `searchTerms` and `evidence` while a record is unverified).

- **Shown on the site (only once `shopping: true`):** only `verificationStatus: "verified"` records (a page we actually opened confirmed the product). `needs-verification` records stay hidden.
- **Phase 1, verify:** open `candidateUrl`, confirm the title, shape and colour and that it's live, then set `asin`, `amazonUrl` (`https://www.amazon.com/dp/<ASIN>`), `verificationStatus: "verified"` and `lastChecked`. Never guess an ASIN.
- **Phase 2, affiliate:** once Amazon Associates approves the account, paste the SiteStripe/PA-API link into `affiliateUrl` and set `affiliateReady: true`. Cards switch to the affiliate link and the page disclosure switches to commission wording automatically. Also add the program's required sentence to `src/pages/affiliate-disclosure.md` before the first affiliate link goes live.
- **Images:** product cards show a clean no-photo design until a photo is authorised (brand/retailer permission or an approved SiteStripe/PA-API image). Then set `image` and `imageUsageStatus: "approved"`. Never download, crop or AI-edit Amazon or customer-review photos.
- **No prices, ratings or reviews**, ever. Cards say "Check price at Amazon".

---

## 6. Customise

- **Colours, fonts, spacing:** the variables at the top of `src/assets/css/main.css`.
- **Top banner, menu, social links:** `src/_data/site.js`.
- **Homepage hero and Complete the vibe:** `homepage` in `src/_data/site.js`.
- **Newsletter:** stays hidden until you set `newsletter.enabled: true` and an `action` URL in `site.js`.
- **Logos and favicons:** replace the files in `src/assets/brand/`, keeping the same names. Originals are in `brand-kit/`.

## Credits & licences
- Fonts: **Fraunces** and **DM Sans**, SIL Open Font License 1.1 (licence files in `src/assets/fonts/`).
- Tools: Eleventy, @11ty/eleventy-img and Pagefind (all MIT licensed).
- Photos: AI-generated nail and decor inspiration, labelled on every image. Never present them as product photos.
