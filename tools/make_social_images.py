#!/usr/bin/env python3
"""
Generate Pinterest pins (1000x1500) and share images (1200x630) for every article.

Optional helper: the site already includes generated images in src/assets/pins and
src/assets/og. Re-run this only when you add or rename an article, or design pins in
free Canva instead and save them with the same file names.

Requirements: Python 3 + Pillow  (pip install pillow)
Usage:        python3 tools/make_social_images.py
"""
import os, re, glob
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
FONTS = os.path.join(ROOT, "tools", "fonts")
IVORY, BLUSH, BERRY, INK, TAUPE, GOLD, PINE = "#FAF6F1", "#F3E4DF", "#7A1F3D", "#2A2124", "#6F605B", "#B08442", "#2F4A3E"

def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)

def front_matter(path):
    text = open(path, encoding="utf-8").read()
    fm = text.split("---")[1]
    get = lambda k: (re.search(rf'^{k}:\s*"?(.*?)"?\s*$', fm, re.M) or [None, ""])[1]
    return {"slug": os.path.splitext(os.path.basename(path))[0], "headline": get("headline"),
            "accent": get("headlineAccent"), "kicker": get("kicker"), "hero": get("hero"), "section": get("section")}

def wrap(draw, text, f, width):
    words, lines, line = text.split(), [], ""
    for w in words:
        test = (line + " " + w).strip()
        if draw.textlength(test, font=f) <= width: line = test
        else: lines.append(line); line = w
    if line: lines.append(line)
    return lines

def cover(img, w, h):
    return ImageOps.fit(img.convert("RGB"), (w, h), Image.LANCZOS, centering=(0.5, 0.45))

def wordmark(draw, x, y, scale, colour=INK, accent=BERRY):
    f1, f2 = font("BrandSerifItalic.ttf", int(30 * scale)), font("BrandSerif.ttf", int(58 * scale))
    draw.text((x, y + int(20 * scale)), "the", font=f1, fill=accent)
    draw.text((x + int(46 * scale), y), "Tip Sheet", font=f2, fill=colour)

def make_pin(a):
    W, H = 1000, 1500
    im = Image.new("RGB", (W, H), IVORY)
    im.paste(cover(Image.open(os.path.join(SRC, "images", a["hero"])), W, 960), (0, 0))
    d = ImageDraw.Draw(im)
    acc = PINE if a["section"] == "holiday-home" else BERRY
    d.rectangle([0, 960, W, H], fill=IVORY)
    d.text((70, 1010), a["kicker"].upper(), font=font("BrandSansBold.ttf", 24), fill=acc, spacing=4)
    y = 1060
    for line in wrap(d, a["headline"], font("BrandSerif.ttf", 82), W - 140)[:2]:
        d.text((70, y), line, font=font("BrandSerif.ttf", 82), fill=INK); y += 92
    for line in wrap(d, a["accent"], font("BrandSerifItalic.ttf", 72), W - 140)[:2]:
        d.text((70, y), line, font=font("BrandSerifItalic.ttf", 72), fill=acc); y += 84
    d.line([70, 1400, 130, 1400], fill=GOLD, width=2)
    wordmark(d, 70, 1414, 0.7)
    return im

def make_og(a):
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), IVORY)
    im.paste(cover(Image.open(os.path.join(SRC, "images", a["hero"])), 520, H), (W - 520, 0))
    d = ImageDraw.Draw(im)
    acc = PINE if a["section"] == "holiday-home" else BERRY
    d.text((70, 90), a["kicker"].upper(), font=font("BrandSansBold.ttf", 20), fill=acc)
    y = 136
    for line in wrap(d, a["headline"], font("BrandSerif.ttf", 56), 560)[:3]:
        d.text((70, y), line, font=font("BrandSerif.ttf", 56), fill=INK); y += 64
    for line in wrap(d, a["accent"], font("BrandSerifItalic.ttf", 50), 560)[:2]:
        d.text((70, y), line, font=font("BrandSerifItalic.ttf", 50), fill=acc); y += 58
    wordmark(d, 70, 520, 0.6)
    return im

if __name__ == "__main__":
    os.makedirs(os.path.join(SRC, "assets", "pins"), exist_ok=True)
    os.makedirs(os.path.join(SRC, "assets", "og"), exist_ok=True)
    for path in sorted(glob.glob(os.path.join(SRC, "articles", "*.md"))):
        a = front_matter(path)
        if not a["hero"]: continue
        make_pin(a).save(os.path.join(SRC, "assets", "pins", a["slug"] + ".jpg"), quality=86, optimize=True, progressive=True)
        make_og(a).save(os.path.join(SRC, "assets", "og", a["slug"] + ".jpg"), quality=86, optimize=True, progressive=True)
        print("made", a["slug"])
