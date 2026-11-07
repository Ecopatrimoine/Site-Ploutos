// Contraste WCAG des couples texte/fond declares dans ploutos-carte.css (L3, V3-3).
// Usage (depuis la racine du depot) : node docs/maquettes/contraste.mjs
// Lit les jetons dans la feuille ; seuls les couples TEXTE/FOND sont testes (seuil 4,5).
// Exceptions explicites : les placeholders (--pl-text-subtle). Les bordures de champ (non-texte, 1.4.11)
// sont hors perimetre de ce script : item Roadmap « bordures de champ 1.4.11 ».
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../ploutos-carte.css', import.meta.url), 'utf8');
const tok = {};
for (const m of css.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g)) tok[m[1]] = m[2];

const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// [nom du couple, jeton texte, jeton fond]
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
  ['pied de l\'accueil : lettrage blanc chaud sur navy du site', 'pl-white-warm', 'pl-cab-navy']
];
const EXCEPTIONS = [['placeholder : subtle sur carte (exception declaree)', 'pl-text-subtle', 'pl-card']];

let echec = 0;
for (const [nom, t, f] of COUPLES) {
  if (!tok[t] || !tok[f]) { console.log('JETON ABSENT', nom, t, f); echec++; continue; }
  const r = ratio(tok[t], tok[f]);
  const ok = r >= 4.5;
  if (!ok) echec++;
  console.log((ok ? 'OK    ' : 'ECHEC ') + r.toFixed(2).padStart(5) + '  ' + nom + '  (' + tok[t] + ' / ' + tok[f] + ')');
}
for (const [nom, t, f] of EXCEPTIONS) {
  console.log('EXCEP ' + ratio(tok[t], tok[f]).toFixed(2).padStart(5) + '  ' + nom);
}
console.log(echec ? '\n' + echec + ' couple(s) sous 4,5' : '\nTous les couples >= 4,5');
process.exit(echec ? 1 : 0);
