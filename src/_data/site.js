// Global site settings. Edit these values first.
// On Netlify, process.env.URL is set automatically to your live address
// (e.g. https://your-site-name.netlify.app), so canonical URLs and share images stay correct.
export default {
  name: "The Tip Sheet",
  // Brand tagline (kept for the brand kit). While shopping is off it is NOT shown
  // on the site, because the site doesn't link any press-on sets yet.
  tagline: "Nail ideas, and the press-ons to match.",
  // The line the site shows in the footer, feed and default metadata during the soft launch.
  strapline: "Nail ideas, press-on know-how and small-space style.",
  description:
    "Nail inspiration by shape, length, color and finish, plus practical press-on help for sizing, prep, lifting and removal.",
  url: (process.env.URL || "https://the-tip-sheet.netlify.app").replace(/\/$/, ""),
  locale: "en_US",
  language: "en",
  // Shown in the top strip on every page. Update each season.
  announcement: { text: "New: 22 New Year\u2019s Eve nail ideas in gold, silver and chrome", url: "/nail-ideas/new-years-eve-nails/" },

  // Soft launch (Intesar, 26 Nov 2026): no products anywhere on the site.
  // While false, product cards, quick picks, match ratings and "shop" sections
  // never render, even though src/_data/products.json stays in the project for
  // a later monetisation phase. Set to true only when real, approved affiliate
  // links exist (see README "Turning shopping on later").
  shopping: false,
  // Pinterest website claim: paste ONLY the content value from Pinterest's <meta name="p:domain_verify"> tag here, then redeploy.
  pinterestVerify: "",

  // Legacy preview switch: true showed "Sample product" tags. Keep false for launch.
  placeholderMode: false,

  // Small "AI image" chip on thumbnails (cards, tiles). Full captions on heroes
  // and Look Cards are always shown for AI images.
  aiChips: true,

  // Fill in when you create these profiles (leave "" to hide the link).
  social: {
    pinterest: "",
    instagram: "",
  },

  // Three pillars (Intesar's decision, 26 Nov 2026). Shop the Vibe is held
  // back until real products and approved links exist.
  nav: [
    { label: "Nail Ideas", url: "/nail-ideas/" },
    { label: "Press-On Hub", url: "/press-on-nails/" },
    { label: "Home & Decor", url: "/home-decor/" },
  ],

  // Mobile chip row under the logo
  chips: [
    { label: "Nail Ideas", url: "/nail-ideas/" },
    { label: "Press-On Hub", url: "/press-on-nails/" },
    { label: "Fix my press-ons", url: "/press-on-nails/problem-solver/" },
    { label: "Home & Decor", url: "/home-decor/" },
    { label: "Browse", url: "/browse/" },
  ],

  sections: {
    "nail-ideas": { label: "Nail Ideas", url: "/nail-ideas/" },
    "press-ons": { label: "Press-On Hub", url: "/press-on-nails/" },
    "home-decor": { label: "Home & Decor", url: "/home-decor/" },
  },

  // Homepage: the collection in the editorial hero, and the Complete the Vibe row
  homepage: {
    heroUrl: "/nail-ideas/new-years-eve-nails/",
    // "New this week" editorial strip (v4). One lead feature + four smaller ones,
    // each with its own image composition and ratio. Edit freely: every url must be a
    // real page or #look anchor (the site checker verifies them).
    // layout: lead | tall | wide | square | landscape
    newThisWeek: [
      { layout: "lead", image: "nw-collage-winter-edit.jpg", label: "The winter edit", title: "Four moods for the cold months", text: "Red cat-eye, gold glitter fade, ballet-pink bows and a milky nude: the looks we keep coming back to this season, from party to Monday.", url: "/nail-ideas/", cta: "Browse all nail ideas" },
      { layout: "tall", image: "nw-hair-burgundy-cateye.jpg", label: "Cat-eye after dark", title: "Velvet red that moves with you", text: "Plush magnetic shimmer that reads richer than flat red.", url: "/nail-ideas/new-years-eve-nails/#nye-red-velvet-cat-eye" },
      { layout: "wide", image: "nw-flatlay-nye-sets.jpg", label: "New Year's Eve", title: "Five looks for one night", text: "Chrome, champagne glitter, gold foil, milky white and midnight navy, side by side.", url: "/nail-ideas/new-years-eve-nails/" },
      { layout: "square", image: "nw-moodboard-marble-gold.jpg", label: "Palette", title: "Nude, marble and a little gold", text: "Quiet neutrals with foil veining: the easy way into metallics.", url: "/browse/colour/nude/" },
      { layout: "landscape", image: "nw-sweater-mug-champagne.jpg", label: "Everyday chrome", title: "Champagne chrome, on a Tuesday", text: "Gold's softer cousin works with knitwear as well as sequins.", url: "/nail-ideas/new-years-eve-nails/#nye-champagne-chrome" },
    ],
    vibe: [
      { title: "Red nails, red ribbon", url: "/nail-ideas/red-christmas-nail-ideas/", image: "hero-red-christmas.jpg", text: "Cherry French tips with tiny bows." },
      { title: "A window in the same red", url: "/home-decor/small-apartment-christmas-decor/#ribbon-garland", image: "decor-ribbon-garland.jpg", text: "A velvet ribbon garland for a small space." },
      { title: "Champagne at home", url: "/nail-ideas/new-years-eve-nails/#gold-and-champagne", image: "nye-hero.jpg", text: "Gold and champagne nails for the countdown." },
    ],
  },

  // Newsletter stays hidden until Intesar creates an account and approves it.
  newsletter: { enabled: false, action: "" },
};
