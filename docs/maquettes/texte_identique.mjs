// Gate (2) des lots R1 puis S1-bis : le texte juridique des trois pages n'a change que des differences DECLAREES.
// Usage (depuis la racine du depot) : node docs/maquettes/texte_identique.mjs
//
// Avant = la page telle qu'elle est dans le commit de base (git show <BASE>:<page>).
// Apres = le fichier courant.
// Les deux cotes ont la meme structure (h1, p.ver, article.feuille). Pour chaque page on compare : le titre h1, la
// ligne de version, le corps (texte, espaces normalises), la liste des liens du corps (href, target, rel, texte) et
// le « squelette » (suite des balises h2/h3/p/ul/li/tr/th/td/strong/em/br/a). Le sommaire, les onglets, l'eyebrow,
// la barre et le pied sont hors perimetre (ils ne font pas partie du texte juridique).
//
// Differences admises : celles de DIFFERENCES ci-dessous, et aucune autre. Chacune est un couple (fragment de depart,
// fragment d'arrivee), declare un a un, applique au TEXTE de depart (ou a la ligne de version) avant comparaison.
// Si le fragment de depart n'existe pas exactement une fois dans la base, la gate echoue ; toute autre difference
// (mot, ponctuation, lien, balise de contenu) echoue aussi. Les espaces sont normalises : cette gate ne voit pas la
// difference entre espace ordinaire et espace insecable (c'est scripts/verif-seo.mjs qui la controle).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = '1bf967e'; // tete de S1, avant le lot S1-bis
const PAGES = ['cgu.html', 'dpa.html', 'politique-confidentialite.html'];
const RACINE = fileURLToPath(new URL('../../', import.meta.url));

// Ligne de version des CGU : deux etats admis (retouche du lot S1-bis).
//  - la ligne PROVISOIRE « Version en vigueur au [date de mise en ligne] · EcoPatrimoine Conseil » ;
//  - la ligne DATEE « Version en vigueur au 12 novembre 2026 · EcoPatrimoine Conseil » : jour (« 1er » pour le premier),
//    mois en toutes lettres, annee ; date de calendrier reelle, jamais anterieure a DATE_PLANCHER (jour du lot S1-bis :
//    la version qui porte l'article 6 hors taxes ne peut pas etre plus ancienne). Tout autre format echoue.
// (scripts/verif-seo.mjs applique la meme regle a la ligne <p class="ver"> du <body et a dateModified.)
const DATE_PLANCHER = '2026-11-11';
const MOIS = { janvier: 1, février: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, août: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12 };
const LIGNE_DATEE = new RegExp(`^Version en vigueur au (1er|[2-9]|[12]\\d|3[01]) (${Object.keys(MOIS).join('|')}) (\\d{4}) · EcoPatrimoine Conseil$`);
// la ligne apres, si c'est une ligne datee valide ; sinon null
function ligneDatee(v) {
  const m = v.match(LIGNE_DATEE);
  if (!m) return null;
  const j = m[1] === '1er' ? 1 : Number(m[1]), mois = MOIS[m[2]], an = Number(m[3]);
  const d = new Date(Date.UTC(an, mois - 1, j));
  if (d.getUTCFullYear() !== an || d.getUTCMonth() !== mois - 1 || d.getUTCDate() !== j) return null; // 31 fevrier, etc.
  return d.toISOString().slice(0, 10) >= DATE_PLANCHER ? v : null;
}

// Differences declarees. « ou » : 'corps' (texte de l'article) ou 'version' (ligne de version).
// Lot S1-bis : trois substitutions dans les CGU, aucune dans le DPA ni dans la politique de confidentialite.
const DIFFERENCES = {
  'cgu.html': [
    {
      nom: 'article 3 : liste des utilisateurs vises (CIF, agents d\'assurance, societes d\'assurance, agents immobiliers)',
      ou: 'corps',
      de: '(conseillers en gestion de patrimoine, courtiers, experts-comptables, professions du chiffre et du droit et assimilés)',
      vers: '(conseillers en gestion de patrimoine, conseillers en investissements financiers, courtiers et agents d\'assurance, sociétés d\'assurance, agents immobiliers, experts-comptables, professions du chiffre et du droit et assimilés)'
    },
    {
      nom: 'article 6 : prix hors taxes, franchise en base de TVA',
      ou: 'corps',
      de: 'exprimés toutes taxes comprises.',
      vers: 'exprimés hors taxes. À la date des présentes, l\'Éditeur bénéficie de la franchise en base de TVA : la TVA n\'est pas applicable (article 293 B du Code général des impôts). Si l\'Éditeur devient redevable de la TVA, celle-ci s\'ajoute aux prix au taux en vigueur, y compris pour les abonnements en cours et pour ceux portant la mention « tarif bloqué », dont le prix hors taxes reste maintenu. L\'application de la TVA ne constitue pas une évolution tarifaire au sens du présent article.'
    },
    {
      nom: 'ligne de version : date de mise en ligne, provisoire ou posee (« 12 novembre 2026 », au plus tot le ' + DATE_PLANCHER + ')',
      ou: 'version',
      de: 'Version en vigueur au 1er septembre 2026 · EcoPatrimoine Conseil',
      vers: 'Version en vigueur au [date de mise en ligne] · EcoPatrimoine Conseil',
      variante: ligneDatee
    }
  ],
  'dpa.html': [],
  'politique-confidentialite.html': []
};

const git = (page) => execFileSync('git', ['show', `${BASE}:${page}`], { cwd: RACINE, encoding: 'utf8', maxBuffer: 1 << 24 });
const courant = (page) => readFileSync(new URL(`../../${page}`, import.meta.url), 'utf8');

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

function extraire(html) {
  const h1 = html.match(/<h1>([\s\S]*?)<\/h1>/);
  const ver = html.match(/<p class="ver"[^>]*>([\s\S]*?)<\/p>/);
  const corps = html.match(/<article class="feuille">([\s\S]*?)<\/article>/);
  if (!h1 || !ver || !corps) throw new Error('structure introuvable (h1, p.ver ou article.feuille)');
  return { h1: texte(h1[1]), version: texte(ver[1]), corps: corps[1] };
}

function premiereDifference(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const ctx = (s) => JSON.stringify(s.slice(Math.max(0, i - 50), i + 70));
  return `position ${i}\n      avant : ${ctx(a)}\n      apres : ${ctx(b)}`;
}

// Applique les differences declarees au texte de depart. Retourne { texte, erreurs }.
// `apres` (le texte du fichier courant) ne sert qu'aux differences a variante : la variante rend la forme admise lue
// dans `apres`, ou null (alors c'est l'arrivee de base `vers` qui est attendue, et la comparaison echoue si elle differe).
function appliquer(source, liste, ou, apres) {
  const erreurs = [];
  let r = source;
  for (const d of liste.filter((x) => x.ou === ou)) {
    const n = source.split(d.de).length - 1;
    if (n !== 1) { erreurs.push(`difference declaree « ${d.nom} » : le fragment de depart existe ${n} fois dans ${BASE} (exactement 1 attendue)`); continue; }
    const arrivee = (d.variante && apres !== d.vers && d.variante(apres)) || d.vers;
    r = r.replace(d.de, () => arrivee);
  }
  return { texte: r, erreurs };
}

let echecs = 0;
for (const page of PAGES) {
  let av, ap;
  try { av = extraire(git(page)); ap = extraire(courant(page)); } catch (e) {
    console.log(`ECHEC  ${page} : ${e.message}`); echecs++; continue;
  }
  const liste = DIFFERENCES[page] || [];
  const corpsAv = texte(av.corps);
  const dc = appliquer(corpsAv, liste, 'corps'), dv = appliquer(av.version, liste, 'version', ap.version);
  for (const e of [...dc.erreurs, ...dv.erreurs]) { console.log(`ECHEC  ${page} : ${e}`); echecs++; }
  const controles = [
    ['titre h1', av.h1, ap.h1],
    ['ligne de version (apres differences declarees)', dv.texte, ap.version],
    ['texte du corps (apres differences declarees)', dc.texte, texte(ap.corps)],
    ['liens du corps', liens(av.corps).join('\n'), liens(ap.corps).join('\n')],
    ['squelette des balises', squelette(av.corps), squelette(ap.corps)]
  ];
  const ko = controles.filter(([, x, y]) => x !== y);
  const mots = corpsAv.split(' ').length;
  if (!ko.length) console.log(`OK     ${page} : ${mots} mots, ${liens(av.corps).length} liens, identiques a ${BASE}` + (liste.length ? ` hors ${liste.length} difference(s) declaree(s)` : ' (aucune difference declaree)'));
  for (const d of liste) console.log(`       declaree : ${d.nom}`);
  for (const [nom, x, y] of ko) { console.log(`ECHEC  ${page} : ${nom}\n      ${premiereDifference(x, y)}`); echecs++; }
}
console.log(echecs ? `\n${echecs} difference(s) : la gate echoue` : `\nTexte juridique identique a ${BASE} sur les trois pages, hors les differences declarees`);
process.exit(echecs ? 1 : 0);
