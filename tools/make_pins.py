#!/usr/bin/env python3
"""
Pin packages + share images for The Tip Sheet.

  npm run pins          (or: python3 tools/make_pins.py)
  python3 tools/make_pins.py new-years-eve-nails     (one article only)
  python3 tools/make_pins.py brand                   (default share image + Pinterest profile cover only)

Reads   publishing/pins/<article-slug>.json   (one Pin package per article)
Writes  pinterest-pins/<article-slug>/<pin-id>.png  1000x1500 Pins for manual upload
        pinterest-pins/_profile/pinterest-cover-soft-launch-1920x1080.png  soft-launch profile cover
        src/assets/og/default.jpg                   site-wide fallback share image (soft-launch wording)
        src/assets/pins/<article-slug>.jpg          the article's own "Save this" Pin (copy of pin 1)
        src/assets/og/<article-slug>.jpg            1200x630 share image for every article

pinterest-pins/ sits outside src/, so the Pin package is never deployed with the site.
Pins are built only from our own AI inspiration images (src/images) plus brand typography,
and carry a small "AI-generated inspiration" line. Never feed retailer or Amazon photos in here.

Requirements: Python 3 + Pillow (pip install pillow). Free, no API.
"""
import os, re, sys, json, glob
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
FONTS = os.path.join(ROOT, "tools", "fonts")
PKG = os.path.join(ROOT, "publishing", "pins")
OUT = os.path.join(ROOT, "pinterest-pins")
IVORY, BLUSH, NUDE, BERRY, INK, TAUPE, GOLD, PINE, LINEN = "#FAF6F1", "#F3E4DF", "#E6C3B9", "#7A1F3D", "#2A2124", "#6F605B", "#B08442", "#2F4A3E", "#F1ECE4"
W, H = 1000, 1500

def font(name, size): return ImageFont.truetype(os.path.join(FONTS, name), size)
SERIF, ITAL, SANS, SANSB = "BrandSerif.ttf", "BrandSerifItalic.ttf", "BrandSans.ttf", "BrandSansBold.ttf"

def load(file):
    return Image.open(os.path.join(SRC, "images", file)).convert("RGB")

def cover(img, w, h, cy=0.5):
    out = ImageOps.fit(img, (w, h), Image.LANCZOS, centering=(0.5, cy))
    if out.width > img.width * 1.2:  # upscaled: a gentle sharpen keeps it crisp
        out = out.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    return out

def wrap(draw, text, f, width):
    words, lines, line = (text or "").split(), [], ""
    for w in words:
        t = (line + " " + w).strip()
        if draw.textlength(t, font=f) <= width: line = t
        else:
            if line: lines.append(line)
            line = w
    if line: lines.append(line)
    return lines

def text_block(d, x, y, text, fname, size, fill, width, lh=1.1, max_lines=4, align="left"):
    f = font(fname, size)
    for line in wrap(d, text, f, width)[:max_lines]:
        tx = x if align == "left" else x + (width - d.textlength(line, font=f)) / 2
        d.text((tx, y), line, font=f, fill=fill); y += int(size * lh)
    return y

def wordmark(d, x, y, scale=1.0, colour=INK, accent=BERRY, center_width=None):
    f1, f2 = font(ITAL, int(30 * scale)), font(SERIF, int(58 * scale))
    total = int(46 * scale) + d.textlength("Tip Sheet", font=f2)
    if center_width: x = x + (center_width - total) / 2
    d.text((x, y + int(20 * scale)), "the", font=f1, fill=accent)
    d.text((x + int(46 * scale), y), "Tip Sheet", font=f2, fill=colour)

def ai_tag(d, x, y, dark=False):
    f = font(SANS, 19)
    t = "AI-generated inspiration"
    w = d.textlength(t, font=f)
    d.rounded_rectangle([x, y, x + w + 28, y + 34], radius=17, fill=(42, 33, 36) if not dark else (250, 246, 241))
    d.text((x + 14, y + 6), t, font=f, fill=IVORY if not dark else INK)

def header(d, p, y, colour=INK, accent=BERRY, kcol=None, width=W - 140, x=70, align="left", hsize=78):
    if p.get("kicker"):
        f = font(SANSB, 23); k = p["kicker"].upper()
        kx = x if align == "left" else x + (width - d.textlength(k, font=f)) / 2
        d.text((kx, y), k, font=f, fill=kcol or accent); y += 48
    y = text_block(d, x, y, p.get("headline", ""), SERIF, hsize, colour, width, 1.06, 3, align)
    if p.get("accent"):
        y = text_block(d, x, y, p["accent"], ITAL, int(hsize * .9), accent, width, 1.08, 2, align)
    return y

# ---------------- templates ----------------
def t_main(p):
    im = Image.new("RGB", (W, H), IVORY); d = ImageDraw.Draw(im)
    im.paste(cover(load(p["images"][0]), W, 960), (0, 0))
    ai_tag(d, W - 300, 24)
    y = header(d, p, 1000)
    d.line([70, 1404, 130, 1404], fill=GOLD, width=2); wordmark(d, 70, 1414, .7)
    return im

def t_grid4(p):
    im = Image.new("RGB", (W, H), IVORY); d = ImageDraw.Draw(im)
    y = header(d, p, 70, align="center", hsize=70)
    top = max(y + 30, 380); s = 440; g = 20; x0 = (W - 2 * s - g) // 2
    for i, f in enumerate(p["images"][:4]):
        im.paste(cover(load(f), s, s), (x0 + (i % 2) * (s + g), top + (i // 2) * (s + g)))
    ai_tag(d, x0 + 12, top + 2 * s + g - 46)
    wordmark(d, 0, H - 110, .7, center_width=W)
    return im

def t_grid9(p):
    im = Image.new("RGB", (W, H), INK); d = ImageDraw.Draw(im)
    s, g = 300, 12; x0 = (W - 3 * s - 2 * g) // 2; top = 330
    for i, f in enumerate(p["images"][:9]):
        im.paste(cover(load(f), s, s), (x0 + (i % 3) * (s + g), top + (i // 3) * (s + g)))
    header(d, p, 70, colour=IVORY, accent=NUDE, kcol=GOLD, align="center", hsize=66)
    ai_tag(d, x0, top + 3 * s + 2 * g + 18, dark=True)
    wordmark(d, 0, H - 110, .7, colour=IVORY, accent=NUDE, center_width=W)
    return im

def t_single(p):
    im = Image.new("RGB", (W, H), INK); d = ImageDraw.Draw(im)
    y = header(d, p, 80, colour=IVORY, accent=NUDE, kcol=GOLD, hsize=74)
    top = min(max(y + 40, 300), 420)
    im.paste(cover(load(p["images"][0]), W - 120, W - 120), (60, top))
    ai_tag(d, 84, top + W - 120 - 54)
    if p.get("caption"):
        text_block(d, 70, top + W - 120 + 36, p["caption"], ITAL, 40, NUDE, W - 140, 1.15, 2)
    wordmark(d, 70, H - 100, .62, colour=IVORY, accent=NUDE)
    return im

def t_stack(p):
    im = Image.new("RGB", (W, H), IVORY); d = ImageDraw.Draw(im)
    y = header(d, p, 64, hsize=68)
    top = max(y + 24, 330); n = len(p["images"][:4]); avail = H - top - 150; g = 14; hh = (avail - (n - 1) * g) // n
    for i, f in enumerate(p["images"][:4]):
        im.paste(cover(load(f), W - 140, hh, .55), (70, top + i * (hh + g)))
        lab = (p.get("labels") or [None] * 4)[i]
        if lab:
            fl = font(SANSB, 22); tw = d.textlength(lab.upper(), font=fl)
            d.rectangle([70, top + i * (hh + g) + hh - 44, 70 + tw + 32, top + i * (hh + g) + hh], fill=IVORY)
            d.text((86, top + i * (hh + g) + hh - 36), lab.upper(), font=fl, fill=INK)
    ai_tag(d, W - 330, top + 12)
    wordmark(d, 70, H - 112, .66)
    return im

def t_split(p):
    im = Image.new("RGB", (W, H), LINEN); d = ImageDraw.Draw(im)
    im.paste(cover(load(p["images"][0]), W, 820), (0, 0))
    s = (W - 140 - 20) // 2
    for i, f in enumerate(p["images"][1:3]):
        im.paste(cover(load(f), s, 300), (70 + i * (s + 20), 850))
    ai_tag(d, 24, 24)
    header(d, p, 1185, hsize=62)
    wordmark(d, W - 330, H - 96, .6)
    return im

def t_list(p, dark=False):
    bg, fg, ac = (INK, IVORY, NUDE) if dark else (IVORY, INK, BERRY)
    im = Image.new("RGB", (W, H), bg); d = ImageDraw.Draw(im)
    items = p.get("items", [])[:7]
    if p.get("images"):
        im.paste(cover(load(p["images"][0]), W, 420), (0, 0)); ai_tag(d, W - 300, 24)
        top, hs, isz, gap = 470, 62, 34, 22
    else:
        top, hs, isz, gap = 0, 86, 44 if len(items) <= 5 else 38, 34
    fn, ft = font(ITAL, int(isz * 1.25)), font(SANS, isz)
    # measure so the block sits in the middle of the free space
    def draw(y0, real):
        y = header(d, p, y0, colour=fg, accent=ac, kcol=GOLD if dark else BERRY, hsize=hs) if real else y0 + measure_head
        y += 64
        if real: d.line([70, y - 30, 170, y - 30], fill=GOLD, width=3)
        for i, item in enumerate(items):
            lines = wrap(d, item, ft, W - 230)[:2]
            if real:
                d.text((70, y - 6), f"{i + 1:02d}", font=fn, fill=GOLD)
                ny = y
                for line in lines: d.text((170, ny), line, font=ft, fill=fg); ny += int(isz * 1.25)
            y += int(isz * 1.25) * len(lines) + gap
            if real and i < len(items) - 1:
                d.line([170, y - gap // 2, W - 70, y - gap // 2], fill=(255, 255, 255, 40) if dark else "#E9E1D7", width=1)
        return y
    scratch = Image.new("RGB", (W, H)); sd = ImageDraw.Draw(scratch)
    measure_head = header(sd, p, 0, hsize=hs)
    total = draw(0, False)
    y0 = top if top else max(110, (H - 170 - total) // 2)
    draw(y0, True)
    d.line([70, H - 128, 130, H - 128], fill=GOLD, width=2)
    wordmark(d, 70, H - 112, .66, colour=fg, accent=ac)
    return im

def t_checklist(p): return t_list(p, False)
def t_diagnosis(p): return t_list(p, True)

TEMPLATES = {"main": t_main, "grid4": t_grid4, "grid9": t_grid9, "single": t_single, "stack": t_stack,
             "split": t_split, "checklist": t_checklist, "diagnosis": t_diagnosis}

# ---------------- share (OG) images ----------------
def front_matter(path):
    fm = open(path, encoding="utf-8").read().split("---")[1]
    get = lambda k: (re.search(rf'^{k}:\s*"?(.*?)"?\s*$', fm, re.M) or [None, ""])[1]
    return {"slug": os.path.splitext(os.path.basename(path))[0], "headline": get("headline") or get("title"),
            "accent": get("headlineAccent"), "kicker": get("kicker"), "hero": get("hero"), "section": get("section")}

def fit_size(d, text, fname, size, width, max_lines, floor=34):
    """Largest size <= `size` at which `text` wraps into `max_lines` (so nothing is silently cut)."""
    while size > floor and len(wrap(d, text, font(fname, size), width)) > max_lines: size -= 2
    return size

def make_og(a):
    im = Image.new("RGB", (1200, 630), IVORY)
    im.paste(cover(load(a["hero"]), 520, 630), (680, 0))
    d = ImageDraw.Draw(im)
    acc = PINE if a["section"] == "home-decor" else BERRY
    head, accent = a["headline"], a["accent"]
    if not accent and ": " in head:  # long SEO titles without a headline: split at the colon
        head, accent = head.split(": ", 1); head += ":"
    d.text((70, 90), a["kicker"].upper(), font=font(SANSB, 20), fill=acc)
    hs = fit_size(d, head, SERIF, 56, 560, 3)
    y = text_block(d, 70, 136, head, SERIF, hs, INK, 560, 1.14, 3)
    if accent:
        acs = fit_size(d, accent, ITAL, min(50, hs), 560, 2 if hs >= 50 else 3)
        text_block(d, 70, y, accent, ITAL, acs, acc, 560, 1.16, 3)
    wordmark(d, 70, 520, .6)
    return im

# ---------------- brand images (site default share image + Pinterest profile cover) ----------------
# Soft launch (Nov 2026): neutral line, no product promises. The approved tagline
# "Nail ideas, and the press-ons to match." is NOT used here until products are live (Intesar's call).
SOFT_LINE = ("Nail ideas &", "press-on know-how")
STRAP = "NAIL IDEAS  ·  PRESS-ON HOW-TO  ·  SEASONAL STYLE"

def brand_card(W_, H_, imgs, s):
    im = Image.new("RGB", (W_, H_), IVORY); d = ImageDraw.Draw(im)
    big_w, small_w, g, m = int(W_ * .27), int(W_ * .156), int(W_ * .016), int(H_ * .083)
    x_big = W_ - m - small_w - g - big_w
    im.paste(cover(load(imgs[0]), big_w, H_ - 2 * m), (x_big, m))
    hh = (H_ - 2 * m - g) // 2
    im.paste(cover(load(imgs[1]), small_w, hh), (W_ - m - small_w, m))
    im.paste(cover(load(imgs[2]), small_w, hh), (W_ - m - small_w, m + hh + g))
    x = int(W_ * .078)
    f = font(SANS, int(19 * s)); d.text((x, int(H_ * .3)), STRAP, font=f, fill=TAUPE)
    wordmark(d, x - 6, int(H_ * .34), 1.25 * s)
    y = int(H_ * .55)
    d.text((x, y), SOFT_LINE[0], font=font(SERIF, int(44 * s)), fill=INK)
    d.text((x, y + int(58 * s)), SOFT_LINE[1], font=font(ITAL, int(44 * s)), fill=BERRY)
    d.line([x, y + int(140 * s), x + int(60 * s), y + int(140 * s)], fill=GOLD, width=2)
    d.text((x, y + int(165 * s)), "Short · Almond · French tip · Chrome · Cat-eye", font=font(SANS, int(21 * s)), fill=TAUPE)
    ai_tag(d, x_big + 14, H_ - m - 48)
    return im

def make_brand():
    imgs = ["french-almond.jpg", "burgundy-cateye.jpg", "chrome-short.jpg"]
    save_jpg(brand_card(1200, 630, imgs, .8), os.path.join(SRC, "assets", "og", "default.jpg"))
    os.makedirs(os.path.join(OUT, "_profile"), exist_ok=True)
    brand_card(1920, 1080, imgs, 1.0).save(os.path.join(OUT, "_profile", "pinterest-cover-soft-launch-1920x1080.png"), optimize=True)
    print("brand: src/assets/og/default.jpg + pinterest-pins/_profile/pinterest-cover-soft-launch-1920x1080.png")

def save_jpg(im, path): im.save(path, quality=86, optimize=True, progressive=True)

if __name__ == "__main__":
    only = sys.argv[1:]
    os.makedirs(os.path.join(SRC, "assets", "pins"), exist_ok=True)
    os.makedirs(os.path.join(SRC, "assets", "og"), exist_ok=True)
    if not only or "brand" in only: make_brand()
    for path in sorted(glob.glob(os.path.join(SRC, "articles", "*.md"))):
        a = front_matter(path)
        if a["hero"] and (not only or a["slug"] in only):
            save_jpg(make_og(a), os.path.join(SRC, "assets", "og", a["slug"] + ".jpg"))
    for pkg_path in sorted(glob.glob(os.path.join(PKG, "*.json"))):
        pkg = json.load(open(pkg_path, encoding="utf-8"))
        slug = pkg["article"]
        if only and slug not in only: continue
        os.makedirs(os.path.join(OUT, slug), exist_ok=True)
        for i, p in enumerate(pkg["pins"]):
            im = TEMPLATES[p["template"]](p)
            assert im.size == (W, H)
            im.save(os.path.join(OUT, slug, p["file"]), optimize=True)
            if i == 0: save_jpg(im, os.path.join(SRC, "assets", "pins", slug + ".jpg"))
        print(f"{slug}: {len(pkg['pins'])} pins")
