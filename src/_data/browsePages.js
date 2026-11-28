// One entry per browse filter value -> /browse/<facet>/<slug>/
// `count` = number of nail looks with that value. Pages under taxonomy.minLooks
// are still built (so links never break) but get noindex and stay out of the sitemap.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import taxonomy from "./taxonomy.js";

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const dir = "src/articles";
const looks = [];
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const d = matter(fs.readFileSync(path.join(dir, f), "utf8")).data;
  if (d.draft || d.section === "home-decor") continue;
  for (const l of d.looks || []) looks.push({ ...l, occasion: asArray(l.occasion).length ? l.occasion : d.occasion });
}

export default taxonomy.facets.flatMap((facet) =>
  (taxonomy[facet.key] || []).map((t) => {
    const count = looks.filter((l) => asArray(l[facet.key]).includes(t.slug)).length;
    return { facet: facet.key, facetLabel: facet.label, ...t, count, noindex: count < taxonomy.minLooks };
  })
);
