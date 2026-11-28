// Defaults for every article in src/articles/
// URL = section base + file name, unless the article sets `slug`
// (e.g. the Problem Solver lives at /press-on-nails/problem-solver/).
const base = {
  "nail-ideas": "/nail-ideas/",
  "press-ons": "/press-on-nails/",
  "home-decor": "/home-decor/",
};

export default {
  layout: "layouts/article.njk",
  eleventyComputed: {
    permalink: (data) => `${base[data.section] || "/articles/"}${data.slug || data.page.fileSlug}/`,
    ogImage: (data) => data.ogImage || `/assets/og/${data.page.fileSlug}.jpg`,
    pinImage: (data) => data.pinImage || `/assets/pins/${data.page.fileSlug}.jpg`,
    bodyClass: (data) => `article-page section-${data.section}${data.pageType ? " type-" + data.pageType : ""}`,
  },
};
