// Genere sitemap.xml (lot S1). Node, aucune dependance.
// Usage (depuis la racine du depot) : node scripts/sitemap.mjs
//
// - La liste ci-dessous est celle des pages INDEXABLES. Les pages en noindex (merci, merci-contact, 404,
//   maintenance) n'y figurent jamais.
// - L'URL de chaque entree est lue dans la balise canonique de la page : le plan du site ne peut pas
//   contredire la canonique.
// - lastmod = date du dernier commit qui a modifie le fichier (git log -1 --format=%cs -- <fichier>).
//   Il faut donc committer les pages AVANT de generer : le sitemap.xml est le dernier commit d'un lot.
// - Ni changefreq ni priority.
// Le fichier genere est commite : Netlify n'execute pas ce script (scripts/ est retire du build, voir
// netlify.toml, et renvoie 404 par _redirects).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const RACINE = fileURLToPath(new URL('../', import.meta.url));
export const PAGES_INDEXABLES = ['index.html', 'inscription.html', 'cgu.html', 'dpa.html', 'politique-confidentialite.html'];

const echapper = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function canonique(fichier) {
  const html = readFileSync(RACINE + fichier, 'utf8');
  const liens = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).filter((l) => /\brel\s*=\s*["']canonical["']/i.test(l));
  if (liens.length !== 1) throw new Error(`${fichier} : ${liens.length} canonique(s), une seule attendue`);
  const href = liens[0].match(/\bhref\s*=\s*"([^"]+)"/i);
  if (!href) throw new Error(`${fichier} : canonique sans href`);
  return href[1];
}

export function dateDernierCommit(fichier) {
  const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', fichier], { cwd: RACINE, encoding: 'utf8' }).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error(`${fichier} : aucun commit (fichier non suivi ?), lastmod impossible`);
  return d;
}

export function genererSitemap(pages = PAGES_INDEXABLES) {
  const entrees = pages.map((f) => `  <url>\n    <loc>${echapper(canonique(f))}</loc>\n    <lastmod>${dateDernierCommit(f)}</lastmod>\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entrees.join('\n')}\n</urlset>\n`;
}

// execution directe seulement (l'import par verif-seo.mjs n'ecrit rien)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const xml = genererSitemap();
  writeFileSync(RACINE + 'sitemap.xml', xml);
  console.log(`sitemap.xml ecrit : ${PAGES_INDEXABLES.length} pages`);
  for (const f of PAGES_INDEXABLES) console.log(`  ${dateDernierCommit(f)}  ${canonique(f)}`);
}
