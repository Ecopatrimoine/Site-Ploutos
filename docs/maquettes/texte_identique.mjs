// Gate (2) du lot R1 : le texte juridique des trois pages n'a pas change d'un mot.
// Usage (depuis la racine du depot) : node docs/maquettes/texte_identique.mjs
//
// Avant = la page telle qu'elle est dans le commit de depart (git show 6a7fd24:<page>).
// Apres = le fichier courant.
// Compare, pour chaque page : le titre h1, la ligne de version, le corps (texte, espaces normalises), la liste
// des liens du corps (href, target, rel, texte) et le « squelette » (suite des balises h2/h3/p/ul/li/tr/th/td/
// strong/em/br/a). Seule difference neutralisee : le separateur des h2 (« Article N — » et « N. »), que la
// nouvelle presentation retire de l'affichage au profit du <span class="no">.
// Tout le reste (mot, ponctuation, lien, balise de contenu) fait echouer la gate. Le sommaire, les onglets,
// l'eyebrow, la barre et le pied sont hors perimetre (ils ne font pas partie du texte juridique).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = '6a7fd24';
const PAGES = ['cgu.html', 'dpa.html', 'politique-confidentialite.html'];
const RACINE = fileURLToPath(new URL('../../', import.meta.url));

const avant = (page) => execFileSync('git', ['show', `${BASE}:${page}`], { cwd: RACINE, encoding: 'utf8', maxBuffer: 1 << 24 });
const apres = (page) => readFileSync(new URL(`../../${page}`, import.meta.url), 'utf8');

// balises de bloc -> espace ; balises en ligne -> rien (le texte colle comme dans le rendu)
const BLOC = /<\/?(?:h[1-6]|p|ul|ol|li|div|table|thead|tbody|tr|td|th|br|article|section|header|footer|main|nav)\b[^>]*>/gi;
const ENTITES = [[/&nbsp;/g, ' '], [/&amp;/g, '&'], [/&lt;/g, '<'], [/&gt;/g, '>'], [/&quot;/g, '"'], [/&#39;/g, "'"]];
const decoder = (s) => ENTITES.reduce((acc, [re, par]) => acc.replace(re, par), s);
const texte = (html) => decoder(html.replace(BLOC, ' ').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

const SQUELETTE = /<(h2|h3|p|ul|li|tr|th|td|strong|em|br|a)\b/gi;
const squelette = (html) => [...html.matchAll(SQUELETTE)].map((m) => m[1].toLowerCase()).join(' ');

function liens(html) {
  const attr = (s, n) => (s.match(new RegExp(`\\b${n}="([^"]*)"`)) || [, ''])[1];
  return [...html.matchAll(/<a\s+([^>]*)>([\s\S]*?)<\/a>/gi)].map(
    (m) => `${attr(m[1], 'href')} | ${attr(m[1], 'target')} | ${attr(m[1], 'rel')} | ${texte(m[2])}`
  );
}

// Retire, dans les h2 de l'ancienne page uniquement, le separateur « — » (CGU) ou « . » (DPA, politique).
const sansSeparateur = (html) => html
  .replace(/(<h2[^>]*>\s*Article\s+\d+)\s*—\s*/g, '$1 ')
  .replace(/(<h2[^>]*>\s*\d+)\s*\.\s*/g, '$1 ');

function extraireAvant(html) {
  const tete = html.match(/<div class="hero">\s*<h1>([\s\S]*?)<\/h1>\s*<p>([\s\S]*?)<\/p>/);
  const corps = html.match(/<div class="container">([\s\S]*?)<\/div>\s*<footer>/);
  if (!tete || !corps) throw new Error('structure de depart introuvable');
  return { h1: texte(tete[1]), version: texte(tete[2]), corps: sansSeparateur(corps[1]) };
}
function extraireApres(html) {
  const h1 = html.match(/<h1>([\s\S]*?)<\/h1>/);
  const ver = html.match(/<p class="ver">([\s\S]*?)<\/p>/);
  const corps = html.match(/<article class="feuille">([\s\S]*?)<\/article>/);
  if (!h1 || !ver || !corps) throw new Error('structure d\'arrivee introuvable (h1, p.ver ou article.feuille)');
  return { h1: texte(h1[1]), version: texte(ver[1]), corps: corps[1] };
}

function premiereDifference(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const ctx = (s) => JSON.stringify(s.slice(Math.max(0, i - 50), i + 70));
  return `position ${i}\n      avant : ${ctx(a)}\n      apres : ${ctx(b)}`;
}

let echecs = 0;
for (const page of PAGES) {
  let av, ap;
  try { av = extraireAvant(avant(page)); ap = extraireApres(apres(page)); } catch (e) {
    console.log(`ECHEC  ${page} : ${e.message}`); echecs++; continue;
  }
  const controles = [
    ['titre h1', av.h1, ap.h1],
    ['ligne de version', av.version, ap.version],
    ['texte du corps', texte(av.corps), texte(ap.corps)],
    ['liens du corps', liens(av.corps).join('\n'), liens(ap.corps).join('\n')],
    ['squelette des balises', squelette(av.corps), squelette(ap.corps)]
  ];
  const ko = controles.filter(([, x, y]) => x !== y);
  const mots = texte(av.corps).split(' ').length;
  if (!ko.length) console.log(`OK     ${page} : ${mots} mots, ${liens(av.corps).length} liens, identiques`);
  for (const [nom, x, y] of ko) { console.log(`ECHEC  ${page} : ${nom}\n      ${premiereDifference(x, y)}`); echecs++; }
}
console.log(echecs ? `\n${echecs} difference(s) : la gate echoue` : '\nTexte identique sur les trois pages');
process.exit(echecs ? 1 : 0);
