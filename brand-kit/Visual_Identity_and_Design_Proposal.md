# The Tip Sheet: Visual Identity & Website Design Proposal
Prepared for Intesar · 24 November 2026 · **Status: draft for approval. Nothing has been built, deployed, registered or published.**

All mockups in `mockups/` and assets in `logo/`, `favicon/` and `pinterest/` are real files you can use or edit. The nail and decor photos in the mockups are **AI-generated placeholders** made to show the look. Don't publish them as real products (see section 4).

---

## 1. Brand identity

**Name: The Tip Sheet.** This was my top pick from the brand-name shortlist. It plays on nail tips and insider tips, it suits an editorial magazine, and it can grow into wider beauty later. Availability of names, handles and the free Netlify address is **unverified**.

**Tagline:** *Nail ideas, and the press-ons to match.* (Short version: "Nail ideas · Press-on picks".)

**Direction:** a quiet, warm beauty magazine. Think ivory paper, a deep berry ink, generous white space and big close-up photos. The personality is a friend with great taste who tells you exactly which set to buy. Confident and useful, not cutesy or shouty.

**Mood words:** warm · polished · editorial · soft-luxe · trustworthy

### Colour palette (contrast checked against WCAG)
| Name | HEX | Use | Text contrast |
|---|---|---|---|
| Ivory | `#FAF6F1` | Page background | — |
| Blush | `#F3E4DF` | Section bands, product card backgrounds | — |
| Nude | `#E6C3B9` | Dividers, borders, logo accent on dark | decorative only |
| **Berry** (primary) | `#7A1F3D` | Logo mark, buttons, links, labels | 9.3:1 on Ivory ✅ |
| Ink | `#2A2124` | Body text, headlines, footer background | 14.6:1 ✅ |
| Taupe | `#6F605B` | Secondary text, captions, meta | 5.6:1 on Ivory, 4.9:1 on Blush ✅ |
| Cherry | `#B8263F` | Seasonal accent (Christmas/Valentine's badges) | 5.8:1 ✅ |
| Pine | `#2F4A3E` | Holiday Home section only | 9.0:1 ✅ |
| Gold | `#B08442` | Thin rules and small ornaments only | 3.1:1 ❌ never use for text |

Rule of thumb: about 80% Ivory/Blush, 15% Ink, 5% Berry. Berry is precious, so use it for things people click.

### Fonts (both free on Google Fonts, SIL Open Font License)
- **Headings and logo: Fraunces.** A soft, high-contrast editorial serif. Use weight 500 for headlines and *Italic 400* for the accent half of a headline ("…*press-ons to match*").
- **Body, buttons and labels: DM Sans.** Clean and very readable on phones. 400 for body, 600 for buttons and UPPERCASE labels with wide letter-spacing.
- Sizes, mobile → desktop: H1 32→60px, H2 24→34px, body 17→18px at 1.6 line height, labels 11–13px uppercase with +0.16em tracking.

---

## 2. Logo & brand assets

The concept: the dot of the "i" in *Tip* is a small **almond nail**. It's a quiet, ownable detail that says "nails" without a cartoon hand or polish bottle. The almond shape repeats across the site (shape tiles, monogram, favicon) and ties everything together.

| Asset | File(s) supplied | Size | Format | Notes |
|---|---|---|---|---|
| Primary logo | `logo/logo-primary.svg`, `@2x.png` | ~640×128 viewBox | **SVG** on site, PNG backup | Ink text + Berry nail. Text is outlined, so no font is needed |
| Logo on dark | `logo/logo-primary-reversed.svg` | same | SVG | Ivory + Nude, for the footer |
| Logo + tagline | `logo/logo-with-tagline.svg`, `@2x.png` | ~640×162 | SVG / PNG | For About page, pins, media kit |
| Monogram | `logo/monogram.svg`, `monogram-512.png` | 512×512 | SVG / PNG | Berry almond with italic "ts", for watermarks and small spaces |
| Favicon | `favicon/favicon.svg`, `favicon-32.png` | scalable, 32×32 | **SVG** + PNG fallback | Berry rounded square, italic "t", nude nail dot |
| Apple touch icon | `favicon/favicon-apple-touch-180.png` | 180×180 | PNG | iPhone home screen |
| Web app icons | `favicon/favicon-192.png`, `favicon-512.png` | 192, 512 | PNG | For `site.webmanifest` |
| Pinterest profile picture | `pinterest/pinterest-profile-800.png` | 800×800 (shows as a circle) | PNG | Monogram on blush; the circle crop is already safe |
| Pinterest profile cover | `pinterest/pinterest-cover-1920x1080.png` | 1920×1080 (16:9) | PNG or JPG | Pinterest asks for 16:9, at least 800×450. Text sits away from the top corners, where phones put Back/Share buttons |
| Pin template | `pinterest/pin-template-1000x1500.png` | 1000×1500 (2:3) | PNG/JPG | Photo top, title block bottom, small logo. Rebuild it in free Canva for each article |
| Website hero / share banner | `mockups/share-banner-1200x630.jpg` | 1200×630 | JPG/WebP | Link-preview image (Open Graph) when the site is shared |

Pinterest sizes were checked on 24 Nov 2026 against Pinterest's Business help page ("Add a profile cover": minimum 800×450, 16:9 recommended) and 2026 size guides.

---

## 3. Website design

See `mockups/homepage-desktop.jpg`, `mockups/homepage-mobile.jpg` and `mockups/article-mobile.jpg`.

### Header and navigation
- **Top strip** (Berry, one line): the current headline article, e.g. "25 red Christmas nail ideas →". Swap it each season.
- **Desktop:** logo centred, magazine-style. Nail Ideas · Press-Ons · Browse on the left; Guides · Holiday Home · Search on the right. A thin Nude rule underneath.
- **Mobile:** menu icon · centred logo · search icon. The menu opens a full-screen ivory panel with the same five links and the shape and colour chips.
- The header stays at the top on scroll but shrinks to a slim 56px bar.

### Homepage hierarchy (top to bottom)
1. **Cover story.** One big photo (4:5 on mobile, a wide crop on desktop) with a "+ Matching press-ons" badge, a kicker ("THE CHRISTMAS EDIT"), a two-tone headline and two buttons (Read the edit / Shop press-ons).
2. **Browse by shape.** Six almond-shaped photo tiles: Almond, Short, Square, Oval, Coffin, Stiletto. Four on mobile, swipe for more. This is the signature visual.
3. **This week's press-on picks.** A blush band with 4 product cards on desktop, swipeable on mobile.
4. **Latest nail ideas.** A 3-column editorial grid of 4:5 images with a small category kicker and a serif title.
5. **Holiday Home band.** Secondary and visually separated: Pine accent instead of Berry, a landscape photo and one link. It appears once, below the nail content.
6. **Follow on Pinterest.** A simple centred block.
7. **Footer** (Ink background): reversed logo, three link columns (Explore / About / Legal) and the affiliate disclosure line.

### Category and browse pages
- A header with title, a one-line intro and a row of filter chips (Shape · Length · Colour · Occasion). The chips are just links to static pages, so they need no backend.
- A 2-column grid on mobile and 3–4 on desktop, all 4:5 images, so every page looks consistent.

### Nail inspiration article (see `article-mobile.jpg`)
- Breadcrumb → large serif title with an italic Berry second line → "Updated" date → a short, soft disclosure ("We may earn a commission… How we choose →").
- **Quick Picks box** near the top: best overall / best short / best budget, each linking to its set.
- **Each design:** a numbered serif heading ("*1.* Cherry French tips with bows") → **a full-width 4:5 photo** → a tag line (Shape · Length · Finish) → 2–3 sentences → **a "Get this look" card.**
- **Desktop:** a centred 720px reading column with images breaking wider to 1040px. No sidebar, which keeps it calm and magazine-like.
- End with a **Shop the Look** grid (every set in the article), an FAQ, a tall Pinterest-ready image ("Save this for later") and related articles.

### Press-on product cards
Two versions, both quiet and editorial:
- **In-article "Get this look"** (horizontal): blush background, square product photo on the left, a small "GET THIS LOOK" label, the set's name in serif and one Berry pill button "See it at Amazon".
- **Grid card** (vertical): white card, square image, "PRESS-ON MATCH" label, name, meta line (Length · Shape · Finish) and a text link "See it at Target →".
- **No prices, stars, "SALE!" badges or countdowns.** Prices change and Amazon's rules don't allow showing stale ones. Show the shop name, so readers know where they're going.
- Links open in a new tab with `rel="sponsored noopener"`.
- The card **must show the same colour family as the look above it.** This is the core promise of the brand (see the red look → red French set in the mockup).

### Holiday Home section
Same layout system, different accent: **Pine `#2F4A3E`** replaces Berry for labels and links, and photos are landscape (3:2) cozy interiors. It's limited to its own band on the homepage and its own `/holiday-home/` hub, so the brand still reads as "nails" at a glance.

### Responsive behaviour
| | Mobile (<640px) | Tablet (640–1023px) | Desktop (≥1024px) |
|---|---|---|---|
| Side margins | 20px | 32px | 80px, content max 1280px |
| Nav | menu icon + search | menu icon + search | full links, centred logo |
| Hero | photo above text | photo above text | photo left 55% / text right |
| Shape tiles | 4 visible, swipe | 6 in a row | 6 in a row |
| Product picks | horizontal swipe | 2 columns | 4 columns |
| Article grid | 2 columns | 3 columns | 3–4 columns |
| Buttons | full-width, 48px tall | inline | inline |

Design mobile-first: most Pinterest traffic arrives on phones.

---

## 4. Image direction

**Style:** natural window light, warm-neutral backgrounds (ivory linen, cream knit, pale stone), hands relaxed and close up, one or two small props (a ribbon, a coffee cup, a pearl, eucalyptus). The nails are always the sharpest, most colourful thing in the frame. Avoid neon lighting, cluttered salon tables and heavy filters.

**Ratios and sizes**
| Use | Ratio | Export width |
|---|---|---|
| Article and grid images | **4:5** | 1200px (srcset 480 / 800 / 1200) |
| Product card images | **1:1** | 600px |
| Shape tiles (almond mask) | 2:3 | 400px |
| Holiday Home images | 3:2 | 1200px |
| Pins | 2:3 | 1000×1500 |
| Share / OG image | 1.91:1 | 1200×630 |

**Keeping it consistent across very different nail designs**
1. Every image gets one of three backgrounds: ivory fabric, cream knit or pale stone.
2. Apply one shared light, warm edit (the same free Lightroom Mobile/Snapseed preset) to every photo.
3. Crop everything to 4:5 with the nails in the lower-middle third.
4. Put any text on pins, never baked into website photos.
5. The almond mask, ivory page and berry labels frame each photo, so even mismatched photos sit together.

**Image rights (important for an affiliate site)**
- **Amazon product images** may only be shown through Amazon's own tools (SiteStripe image links or the Product Advertising API). Don't download and re-host them.
- **Etsy and Target:** use their affiliate-provided images or link text.
- **Inspiration photos from other creators:** use them only with written permission and credit. A credit alone isn't permission. The competitor research flagged this risk.
- **Best long-term option:** buy a few press-on sets and photograph them yourself in this style. That makes your images unique and a stronger fit for Pinterest.
- Placeholder AI images (like these mockups) can work for decorative headers, but not as "this product" photos.

**Making product picks feel helpful, not like ads**
- Show the product only right after the look it matches, never as a banner.
- Use one card per design with calm colours and a single button.
- Use honest labels: "Get this look", "Closest match", "Budget pick".
- Add one line of real opinion ("Runs slightly long; file to a short almond").
- Put the disclosure near the top, short and friendly, linking to "How we choose products".

---

## 5. Implementation (all free)

**Stack:** Eleventy (11ty) (recommended earlier) or Astro. Either works as a static site on **Netlify's free plan**, with a free `yourname.netlify.app` address. A custom domain is optional later. The exact free-plan limits weren't re-checked today; confirm them when you sign up.

| Need | Free tool |
|---|---|
| Fonts | Self-host Fraunces + DM Sans as WOFF2 via **Fontsource** (`@fontsource-variable/fraunces`, `@fontsource-variable/dm-sans`) or google-webfonts-helper. This is faster and more private than calling Google. Use `font-display: swap` |
| Image optimisation at build | **@11ty/eleventy-img** (Eleventy) or Astro's built-in `<Image>`. Both make WebP/AVIF in several sizes automatically |
| One-off image compression | **Squoosh** (squoosh.app) |
| SVG clean-up | **SVGOMG** |
| Favicon pack check | **RealFaviconGenerator** |
| Pin designs | **Canva free** (set up a template with these colours and fonts) |
| Photo editing | Lightroom Mobile (free tier) or Snapseed |
| Search | **Pagefind** (static, no server) |
| Contact form | **Netlify Forms** (free tier) |
| Analytics (optional) | Netlify's built-in options, or a free, privacy-friendly tool |

**Which format for what**
- **SVG:** logo, reversed logo, monogram, favicon, icons (menu, search, arrows), the almond mask shape.
- **PNG:** favicon fallbacks (32, 180, 192, 512), Pinterest profile picture, anything that needs transparency outside the site.
- **WebP** (with AVIF where supported, via the image plugin): **every photo on the website**: articles, product cards, tiles, hero. Keep each photo under ~150KB.
- **JPG/PNG:** pins and the Pinterest cover (Pinterest doesn't need WebP).

**Design tokens to drop into CSS later** (written down now so the build matches this proposal):
```css
:root{
  --ivory:#FAF6F1; --blush:#F3E4DF; --nude:#E6C3B9; --berry:#7A1F3D;
  --ink:#2A2124; --taupe:#6F605B; --cherry:#B8263F; --pine:#2F4A3E; --gold:#B08442;
  --font-serif:"Fraunces Variable", Georgia, serif;
  --font-sans:"DM Sans Variable", system-ui, sans-serif;
  --radius-card:14px; --radius-pill:999px; --max:1280px;
}
```
Reusable components to build once: Header, Footer, ShapeTile, ProductCard (inline + grid), LookBlock (number + image + tags + card), QuickPicks, CategoryGrid and Disclosure.

---

## Decisions for you
1. Approve **The Tip Sheet** as the name, or pick Tipwise / Shade & Shape (the visual system works with any of them).
2. Approve the **palette and fonts**.
3. Approve the **logo concept** (almond-nail dot) and the monogram/favicon.
4. Approve the **homepage and article layouts**.

After approval, the next steps are: check that the free Netlify subdomain and Pinterest/Instagram handles are free (without registering), then build the site.
