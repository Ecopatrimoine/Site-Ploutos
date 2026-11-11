// Contraste WCAG des couples declares dans ploutos-carte.css (L3, V3-3) et ploutos-doc.css (R1).
// Usage (depuis la racine du depot) : node docs/maquettes/contraste.mjs
// Lit les jetons dans les deux feuilles (la feuille des pages reglementaires, chargee apres, l'emporte).
// - Couples TEXTE/FOND : seuil 4,5. Exceptions explicites : les placeholders (--pl-text-subtle).
// - Anneaux de FOCUS (non-texte, WCAG 1.4.11, lot R1) : seuil 3. Les bordures de champ restent hors perimetre :
//   item Roadmap « bordures de champ 1.4.11 ».
// Un fond peut etre un jeton ou une composition { mix: [jeton de dessus, opacite, fond] } (imbricable) : c'est
// ainsi que sont testes les onglets (blanc lin a 8 % / 16 % sur l'encre) et les degrades de la tete (au pire point).
// Accueil (lot S1-bis) : la ligne « Prix hors taxes. TVA non applicable, art. 293 B du CGI. » sous les cartes de la
// section Tarifs. Sa couleur est lue dans la regle .price-tax-note de index.html, son fond dans la regle .pricing
// (un var(--x) est resolu dans le :root de index.html). Regle ou valeur introuvable : « JETON ABSENT », la gate echoue.
import { readFileSync } from 'node:fs';

const lire = (f) => readFileSync(new URL(f, import.meta.url), 'utf8');
const tok = {};
for (const css of [lire('../../ploutos-carte.css'), lire('../../ploutos-doc.css')]) {
  for (const m of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g)) tok[m[1]] = m[2];
}

const accueil = lire('../../index.html');
const echapper = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regleAccueil = (sel) => (accueil.match(new RegExp('(?:^|\\n)' + echapper(sel) + '\\s*\\{([^}]*)\\}')) || [])[1];
const proprieteAccueil = (corps, nom) => (((corps || '').match(new RegExp('(?:^|[;\\s{])' + nom + '\\s*:\\s*([^;]+)')) || [])[1] || '').trim();
const valeurAccueil = (v) => {
  const m = v.match(/^var\(--([a-z0-9-]+)\)$/);
  if (!m) return /^#[0-9A-Fa-f]{6}$/.test(v) ? v : null;
  return (accueil.match(new RegExp('--' + m[1] + ':\\s*(#[0-9A-Fa-f]{6})\\s*;')) || [])[1] || null;
};
const accueilTexte = valeurAccueil(proprieteAccueil(regleAccueil('.price-tax-note'), 'color'));
const accueilFond = valeurAccueil(proprieteAccueil(regleAccueil('.pricing'), 'background'));
if (accueilTexte) tok['accueil-ligne-sous-les-cartes'] = accueilTexte;
if (accueilFond) tok['accueil-section-tarifs'] = accueilFond;

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
// jeton ou composition -> hexa ; null si un jeton est absent
const resoudre = (spec) => {
  if (typeof spec === 'string') return tok[spec] || null;
  const [dessus, alpha, fond] = spec.mix;
  const a = resoudre(dessus), b = resoudre(fond);
  if (!a || !b) return null;
  const x = rgb(a), y = rgb(b);
  return hex(x.map((v, i) => v * alpha + y[i] * (1 - alpha)));
};
const lum = (h) => {
  const c = rgb(h).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// [nom du couple, jeton texte, jeton ou composition de fond]
const COUPLES = [
  ['baseline, sous-titre, ligne « Deja un compte », pied : muted sur carte', 'pl-text-muted-refonte', 'pl-card'],
  ['pied et reassurance : muted sur lin', 'pl-text-muted-refonte', 'pl-lin'],
  ['titre de la carte, libelles de champ : navy cabinet sur carte', 'pl-cab-navy', 'pl-card'],
  ['titre des benefices, nom du π : navy cabinet sur lin', 'pl-cab-navy', 'pl-lin'],
  ['eyebrow « Pourquoi Ploutos » : or texte sur lin', 'pl-gold-text-parchment', 'pl-lin'],
  ['saisie dans un champ : navy sur carte', 'pl-navy', 'pl-card'],
  ['lien de la carte : navy-light sur carte', 'pl-navy-light', 'pl-card'],
  ['lien du pied : navy-light sur lin', 'pl-navy-light', 'pl-lin'],
  ['lien survol : navy sur lin', 'pl-navy', 'pl-lin'],
  ['lien retour de la nav : bleu du site sur lin', 'site-sky', 'pl-lin'],
  ['bouton plein : blanc chaud sur navy cabinet', 'pl-white-warm', 'pl-cab-navy'],
  ['bouton plein survol : blanc chaud sur navy-light', 'pl-white-warm', 'pl-navy-light'],
  ['bouton ligne : navy cabinet sur carte', 'pl-cab-navy', 'pl-card'],
  ['bouton desactive', 'pl-field-text-disabled', 'pl-field-fill-disabled'],
  ['message succes', 'pl-etat-pret-text', 'pl-etat-pret-fond'],
  ['message a completer', 'pl-etat-acompleter-text', 'pl-etat-acompleter-fond'],
  ['message erreur', 'pl-etat-bloque-text', 'pl-etat-bloque-fond'],
  ['pied de l\'accueil : lettrage blanc chaud sur navy du site', 'pl-white-warm', 'pl-cab-navy'],

  // ploutos-doc.css (R1)
  ['R1 corps : navy sur fond de page', 'pl-navy', 'doc-parch'],
  ['R1 corps, boutons « ligne » et d\'impression : navy sur feuille blanche', 'pl-navy', 'pl-card'],
  ['R1 eyebrow du sommaire : or texte sur fond de page', 'pl-gold-text-parchment', 'doc-parch'],
  ['R1 numero des titres : or texte sur feuille', 'pl-gold-text-parchment', 'pl-card'],
  ['R1 sommaire : muted sur fond de page', 'pl-text-muted-refonte', 'doc-parch'],
  ['R1 sommaire, repere actif et survol : navy sur fond de page', 'pl-navy', 'doc-parch'],
  ['R1 sous-titre de la tuile : muted sur lin', 'pl-text-muted-refonte', 'pl-lin'],
  ['R1 nom de la tuile : navy sur lin', 'pl-navy', 'pl-lin'],
  ['R1 liens de la barre : navy cabinet sur blanc chaud', 'pl-cab-navy', 'pl-white-warm'],
  ['R1 liens de la barre survol : navy cabinet sur lin', 'pl-cab-navy', 'pl-lin'],
  ['R1 bouton or : navy sur or clair', 'pl-navy', 'pl-gold-light'],
  ['R1 lien de la feuille : bleu du site sur feuille', 'site-sky', 'pl-card'],
  ['R1 encadre : navy sur lin', 'pl-navy', 'pl-lin'],
  ['R1 en-tete du tableau : blanc chaud sur navy', 'pl-white-warm', 'pl-navy'],
  ['R1 cellule en zebra : navy sur zebra', 'pl-navy', 'doc-zebra'],
  ['R1 impression survol du bouton : navy sur lin', 'pl-navy', 'pl-lin'],
  ['R1 tete : titre lin sur encre', 'pl-lin', 'doc-ink'],
  ['R1 tete : eyebrow or clair sur encre', 'pl-gold-light', 'doc-ink'],
  ['R1 tete et pied : gris encre sur encre', 'doc-ink-texte', 'doc-ink'],
  ['R1 pied : lien lin sur encre', 'pl-lin', 'doc-ink'],
  ['R1 tete, pire point du degrade bleu (32 %) : titre lin', 'pl-lin', { mix: ['doc-halo-bleu', 0.32, 'doc-ink'] }],
  ['R1 tete, pire point du degrade bleu (32 %) : version', 'doc-ink-texte', { mix: ['doc-halo-bleu', 0.32, 'doc-ink'] }],
  ['R1 tete, pire point du degrade or (18 %) : version', 'doc-ink-texte', { mix: ['pl-gold-light', 0.18, 'doc-ink'] }],
  ['R1 tete, pire point du degrade or (18 %) : eyebrow or clair', 'pl-gold-light', { mix: ['pl-gold-light', 0.18, 'doc-ink'] }],
  ['R1 onglet inactif : gris clair sur lin 8 % / encre', 'doc-onglet-texte', { mix: ['pl-lin', 0.08, 'doc-ink'] }],
  ['R1 onglet inactif survol : gris clair sur lin 16 % / encre', 'doc-onglet-texte', { mix: ['pl-lin', 0.16, 'doc-ink'] }],
  ['R1 onglet inactif sur le degrade bleu (pire point) : gris clair sur lin 8 %', 'doc-onglet-texte', { mix: ['pl-lin', 0.08, { mix: ['doc-halo-bleu', 0.32, 'doc-ink'] }] }],
  ['R1 onglet inactif survol sur le degrade bleu (pire point) : lin 16 %', 'doc-onglet-texte', { mix: ['pl-lin', 0.16, { mix: ['doc-halo-bleu', 0.32, 'doc-ink'] }] }],
  ['R1 onglet actif : navy sur fond de page', 'pl-navy', 'doc-parch'],

  // index.html (S1-bis)
  ['S1-bis accueil, ligne « Prix hors taxes... » sous les cartes : couleur de .price-tax-note sur le fond de la section Tarifs', 'accueil-ligne-sous-les-cartes', 'accueil-section-tarifs']
];
const EXCEPTIONS = [['placeholder : subtle sur carte (exception declaree)', 'pl-text-subtle', 'pl-card']];

// Anneaux de focus de ploutos-doc.css : seuil 3 (non-texte)
const ANNEAUX = [
  ['R1 anneau navy sur fond de page (sommaire, bouton d\'impression)', 'pl-navy', 'doc-parch'],
  ['R1 anneau navy sur feuille blanche (liens du texte)', 'pl-navy', 'pl-card'],
  ['R1 anneau navy sur blanc chaud (liens et boutons de la barre)', 'pl-navy', 'pl-white-warm'],
  ['R1 anneau navy sur lin (tuile)', 'pl-navy', 'pl-lin'],
  ['R1 anneau or clair sur encre (tete, pied)', 'pl-gold-light', 'doc-ink'],
  ['R1 anneau or clair sur le degrade bleu (pire point : onglets)', 'pl-gold-light', { mix: ['doc-halo-bleu', 0.32, 'doc-ink'] }]
];

let echec = 0;
const ligne = (marque, r, nom, t, f) => console.log(marque + r.toFixed(2).padStart(6) + '  ' + nom + '  (' + t + ' / ' + f + ')');
for (const [seuil, liste] of [[4.5, COUPLES], [3, ANNEAUX]]) {
  if (seuil === 3) console.log('\n--- anneaux de focus (non-texte, seuil 3) ---');
  for (const [nom, t, f] of liste) {
    const a = resoudre(t), b = resoudre(f);
    if (!a || !b) { console.log('JETON ABSENT', nom, JSON.stringify(t), JSON.stringify(f)); echec++; continue; }
    const r = ratio(a, b);
    const ok = r >= seuil;
    if (!ok) echec++;
    ligne(ok ? 'OK    ' : 'ECHEC ', r, nom, a, b);
  }
}
for (const [nom, t, f] of EXCEPTIONS) {
  console.log('EXCEP ' + ratio(tok[t], tok[f]).toFixed(2).padStart(5) + '  ' + nom);
}
console.log(echec ? '\n' + echec + ' couple(s) sous le seuil' : '\nTous les couples texte >= 4,5 et tous les anneaux >= 3');
process.exit(echec ? 1 : 0);
