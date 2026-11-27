// Browse filters. Each entry becomes a page at /browse/<facet>/<slug>/
// Add a new value here, then use its slug in an article's look front matter.
// Facet pages with fewer than `minLooks` looks are still built, but are marked
// noindex and left out of the sitemap until they have enough looks.
export default {
  minLooks: 3,
  facets: [
    { key: "shape", label: "Shape", intro: "Find designs that suit the nail shape you love." },
    { key: "length", label: "Length", intro: "From practical short sets to statement long nails." },
    { key: "colour", label: "Color", intro: "Browse nail ideas by color family." },
    { key: "finish", label: "Finish", intro: "Chrome, cat-eye, velvet, jelly and more: browse by the way a nail catches the light." },
    { key: "style", label: "Style", intro: "French tips, nail art, coquette details and minimal sets." },
    { key: "occasion", label: "Occasion", intro: "Seasonal and special-occasion nail ideas." },
  ],
  shape: [
    { slug: "almond", label: "Almond", image: "french-almond.jpg", intro: "Tapered, soft-pointed and endlessly flattering: almond is the most-pinned shape for a reason." },
    { slug: "square", label: "Square", image: "nye-02.jpg", intro: "Clean, straight edges that show off French tips and bold color." },
    { slug: "squoval", label: "Squoval", image: "chrome-short.jpg", intro: "A square with softened corners: sturdy, natural-looking and ideal for short nails." },
    { slug: "oval", label: "Oval", image: "burgundy-cateye.jpg", intro: "Rounded and elegant, oval nails make fingers look longer." },
    { slug: "round", label: "Round", image: "candy-cane-short.jpg", intro: "The easiest shape to wear every day, especially on short nails." },
    { slug: "coffin", label: "Coffin", image: "coquette-set.jpg", intro: "Long and tapered with a flat tip, coffin is made for nail art." },
  ],
  length: [
    { slug: "short", label: "Short", image: "chrome-short.jpg", intro: "Practical, polished and quick to wear: short nail designs that still feel special." },
    { slug: "medium", label: "Medium", image: "hero-red-christmas.jpg", intro: "The sweet spot for most press-on sets, with room for detail." },
    { slug: "long", label: "Long", image: "french-almond.jpg", intro: "Statement length for French tips, chrome and full nail art." },
  ],
  colour: [
    { slug: "red", label: "Red", swatch: "#B8263F", intro: "Cherry, scarlet, cranberry and classic holiday reds." },
    { slug: "burgundy", label: "Burgundy", swatch: "#5E1A2B", intro: "Deep wine, oxblood and black-cherry tones for cold-weather nails." },
    { slug: "pink", label: "Pink", swatch: "#E8B4B8", intro: "Sheer blush, jelly pink and soft coquette shades." },
    { slug: "nude", label: "Nude & Milky", swatch: "#E6C3B9", intro: "Milky, sheer and skin-tone shades that go with everything." },
    { slug: "white", label: "White & Pearl", swatch: "#F4F1EC", intro: "Crisp whites, milky bases and pearl chrome." },
    { slug: "gold", label: "Gold & Champagne", swatch: "#C9A46A", intro: "Champagne, foil and metallic gold accents." },
    { slug: "silver", label: "Silver", swatch: "#BFC3C7", intro: "Mirror chrome, disco mosaics and frosted silver." },
    { slug: "black", label: "Black", swatch: "#1E1A1C", intro: "Glossy black, goth cat-eye and black-and-gold." },
    { slug: "blue", label: "Blue & Navy", swatch: "#1F2A44", intro: "Midnight navy, icy blue chrome and winter blues." },
    { slug: "purple", label: "Plum & Purple", swatch: "#4A2340", intro: "Plum noir and aurora shimmer." },
    { slug: "green", label: "Green", swatch: "#2F5D46", intro: "Forest, pine and emerald nail ideas." },
    { slug: "brown", label: "Brown & Taupe", swatch: "#7A5644", intro: "Mocha, caramel and taupe neutrals." },
  ],
  finish: [
    { slug: "chrome", label: "Chrome", intro: "Mirror, glazed and pearl chrome: a high-shine metallic finish." },
    { slug: "cat-eye", label: "Cat-Eye", intro: "Magnetic shimmer that forms a band of light, from soft to dramatic." },
    { slug: "velvet", label: "Velvet", intro: "Cat-eye's diffused cousin: an all-over soft shimmer that looks like fabric." },
    { slug: "jelly", label: "Jelly & Sheer", intro: "Translucent, glassy color you can see through." },
    { slug: "glitter", label: "Glitter", intro: "Fine shimmer, confetti and sparkle." },
    { slug: "foil", label: "Foil", intro: "Gold and silver foil veins, flecks and leaf." },
    { slug: "glossy", label: "Glossy", intro: "Classic high-shine color." },
    { slug: "matte", label: "Matte", intro: "Soft, no-shine finishes." },
  ],
  style: [
    { slug: "french-tip", label: "French Tip", intro: "Classic, colored, chrome and micro French tips." },
    { slug: "nail-art", label: "Nail Art", intro: "Accent nails, stripes, stars, mosaics and hand-painted details." },
    { slug: "coquette", label: "Coquette", intro: "Bows, pearls and soft romantic details." },
    { slug: "minimal", label: "Minimal", intro: "Simple, clean designs that always look expensive." },
    { slug: "mismatched", label: "Mismatched", intro: "A different color or finish on each nail or each hand." },
  ],
  occasion: [
    { slug: "new-years", label: "New Year’s", intro: "Champagne, sparkle and countdown-ready nails." },
    { slug: "christmas", label: "Christmas", intro: "Festive nails for the whole holiday season." },
    { slug: "winter", label: "Winter", intro: "Cozy, deep and frosty nails for cold months." },
    { slug: "everyday", label: "Everyday", intro: "Easy designs for work, weekends and everything between." },
  ],
};
