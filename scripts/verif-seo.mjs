// Gate des lots S1 (referencement) et S1-bis (prix hors taxes, cibles, article 6). Node, aucune dependance.
// Usage (depuis la racine du depot) : node scripts/verif-seo.mjs [--sans-publication] [--release]
// Code de sortie non nul si un controle echoue. Les controles :
//  1. donnees structurees : chaque bloc application/ld+json se lit par JSON.parse ; structure attendue par page ;
//     la FAQPage est identique au texte visible ; rien d'absent de la page (captures, offres, fonctions, liens) ;
//     aucune note, aucun avis, aucun nombre d'utilisateurs ; offres hors taxes (valueAddedTaxIncluded false, « HT »
//     affiche) ; audience = la phrase des cibles affichee ; titre et description de l'accueil repris par og: et twitter:
//  2. indexation : une seule canonique par page indexable, vers elle-meme ; noindex sur les pages techniques ;
//     balises de partage completes, dimensions reelles de og-image.png
//  3. sitemap.xml : identique a ce que regenere scripts/sitemap.mjs ; pages indexables seules ; ni changefreq ni priority
//  4. robots.txt : un seul Sitemap, aucun Disallow, noms de robots de la liste confirmee, rien d'invente
//  5. llms.txt : present, liens dans le plan du site, prix « HT » avec la mention de franchise, cibles (decisions du 11/11/2026)
//  6. texte visible : le corps de chaque page est identique, octet pour octet, a celui du commit de base (BASE), hors les
//     differences DECLAREES une a une (DIFFERENCES) ; chaque fragment de depart doit exister exactement une fois
//  7. configuration : politiques de securite de _headers intactes, cache, regle 404 de scripts/, commande de build
//  8. publication : simulation (sans shell) de la commande de build de netlify.toml sur une copie, docs/ et scripts/ ne restent pas
//  9. mention de franchise en base de TVA : presente partout (accueil, llms.txt, article 6 des CGU) ou nulle part ; un etat
//     mixte fait echouer la gate ; docs/SORTIE_FRANCHISE_TVA.md cite chacune des trois mentions
// 10. date de version provisoire des CGU (attribut data-version-provisoire, dateModified provisoire, « [date de mise en
//     ligne] ») : AVERTISSEMENT en mode normal ; ECHEC avec --release (a lancer a la mise en ligne, une fois la date posee)
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { RACINE, PAGES_INDEXABLES, genererSitemap } from './sitemap.mjs';

const ORIGINE = 'https://ploutos-cgp.fr';
const BASE = '1bf967e'; // tete de S1, avant le lot S1-bis : reference du « texte visible » (differences declarees : DIFFERENCES)
const BASE_CONFIG = '3c23f09'; // dernier commit avant le lot S1 : reference des politiques de securite de _headers
const RELEASE = process.argv.includes('--release');
const DATE_PROVISOIRE = '9999-12-31';
const VERSION_PROVISOIRE = 'Version en vigueur au [date de mise en ligne] · EcoPatrimoine Conseil';
const ACCUEIL_TITRE = 'Ploutos — Logiciel patrimonial pour CGP, CIF et courtiers';
const ACCUEIL_DESCRIPTION = "Logiciel de gestion de patrimoine pour CGP, CIF, courtiers et agents d'assurance : bilan, succession, prévoyance, documents. Essai gratuit 30 jours.";
const CIBLES = "Ploutos s'adresse aux conseillers en gestion de patrimoine (CGP), aux conseillers en investissements financiers (CIF), aux courtiers et agents d'assurance, aux sociétés d'assurance et aux agents immobiliers.";
const MARQUEURS_FRANCHISE = { // la formulation differe volontairement d'un fichier a l'autre
  'index.html': 'TVA non applicable, art. 293 B du CGI',
  'llms.txt': 'TVA non applicable, art. 293 B du CGI',
  'cgu.html': "la TVA n'est pas applicable (article 293 B du Code général des impôts)"
};
const FICHE_SORTIE = 'docs/SORTIE_FRANCHISE_TVA.md';
// Differences admises du corps de chaque page par rapport a BASE : [nom, fragment de depart, fragment d'arrivee].
// Declarees une a une ; le fragment de depart doit exister EXACTEMENT UNE FOIS dans BASE. Toute autre difference echoue.
const DIFFERENCES = {
  'index.html': [
    ['B1 prix mensuel : « 50 € HT /mois » (montant)', '<span class="price-big">50€</span>', '<span class="price-big">50&nbsp;€</span>'],
    ['B1 prix mensuel : « 50 € HT /mois » (periode)', '<span class="price-period">/mois</span>', '<span class="price-period">HT /mois</span>'],
    ['B2 prix annuel : « 500 € HT /an » (montant)', '<span class="price-big" style="color:white;">500€</span>', '<span class="price-big" style="color:white;">500&nbsp;€</span>'],
    ['B2 prix annuel : « 500 € HT /an » (periode)', '<span class="price-period">/an</span>', '<span class="price-period">HT /an</span>'],
    ['B3 note du plan annuel : « soit 41,67 € HT/mois »', '<div class="price-note">soit 41,67€/mois — 2 mois offerts</div>', '<div class="price-note">soit 41,67&nbsp;€ HT/mois — 2 mois offerts</div>'],
    ['B4 ligne sous les cartes : insertion',
      '  </div>\n  <p class="text-center" style="margin-top:2rem;font-size:0.92rem;"><a href="/inscription"',
      '  </div>\n  <p class="price-tax-note">Prix hors taxes. TVA non applicable, art. 293 B du CGI.</p>\n  <p class="text-center" style="margin-top:2rem;font-size:0.92rem;"><a href="/inscription"'],
    ['B5 bouton mensuel : « S\'abonner — 50 € HT/mois → »', 'class="btn-pricing solid">S\'abonner — 50 €/mois →</a>', 'class="btn-pricing solid">S\'abonner — 50 € HT/mois →</a>'],
    ['B6 bouton annuel : « S\'abonner — 500 € HT/an → »', 'class="btn-pricing white">S\'abonner — 500€/an →</a>', 'class="btn-pricing white">S\'abonner — 500 € HT/an →</a>'],
    ['C1 paragraphe des cibles : insertion apres le premier paragraphe de « A propos »',
      '      <p style="color:var(--muted);font-size:0.88rem;line-height:1.75;margin-bottom:1rem;">Né du constat',
      '      <p class="about-cibles">' + CIBLES + '</p>\n      <p style="color:var(--muted);font-size:0.88rem;line-height:1.75;margin-bottom:1rem;">Né du constat']
  ],
  'cgu.html': [
    ['A3 article 3 : liste des utilisateurs vises',
      '(conseillers en gestion de patrimoine, courtiers, experts-comptables, professions du chiffre et du droit et assimilés)',
      "(conseillers en gestion de patrimoine, conseillers en investissements financiers, courtiers et agents d'assurance, sociétés d'assurance, agents immobiliers, experts-comptables, professions du chiffre et du droit et assimilés)"],
    ['A6 article 6 : prix hors taxes, franchise en base de TVA',
      'exprimés toutes taxes comprises.',
      "exprimés hors taxes. À la date des présentes, l'Éditeur bénéficie de la franchise en base de TVA : la TVA n'est pas applicable (article 293 B du Code général des impôts). Si l'Éditeur devient redevable de la TVA, celle-ci s'ajoute aux prix au taux en vigueur, y compris pour les abonnements en cours et pour ceux portant la mention «&nbsp;tarif bloqué&nbsp;», dont le prix hors taxes reste maintenu. L'application de la TVA ne constitue pas une évolution tarifaire au sens du présent article."],
    ['A7 ligne de version : date de mise en ligne provisoire',
      '<p class="ver">Version en vigueur au 1er septembre 2026 · EcoPatrimoine Conseil</p>',
      '<p class="ver" data-version-provisoire>' + VERSION_PROVISOIRE + '</p>']
  ]
};
const PAGES_NOINDEX = ['merci.html', 'merci-contact.html', '404.html', 'maintenance.html'];
const ROBOTS_IA = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended'];
const INTERDITS = ['aggregateRating', 'review', 'reviewCount', 'ratingValue', 'ratingCount', 'bestRating', 'userCount', 'interactionStatistic', 'userInteractionCount'];
const MOIS = { janvier: '01', février: '02', mars: '03', avril: '04', mai: '05', juin: '06', juillet: '07', août: '08', septembre: '09', octobre: '10', novembre: '11', décembre: '12' };

let echecs = 0;
const ok = (cond, msg) => { if (!cond) echecs++; console.log((cond ? '  ok     ' : '  ECHEC  ') + msg); return cond; };
const titre = (t) => console.log('\n== ' + t + ' ==');

const lire = (f) => readFileSync(RACINE + f, 'utf8');
const depart = (f, ref = BASE) => execFileSync('git', ['show', `${ref}:${f}`], { cwd: RACINE, encoding: 'utf8', maxBuffer: 1 << 26 });
const premiereDifference = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const ctx = (s) => JSON.stringify(s.slice(Math.max(0, i - 50), i + 70));
  return `position ${i}\n         attendu : ${ctx(a)}\n         trouve  : ${ctx(b)}`;
};
const ENT = [[/&nbsp;/g, ' '], [/&amp;/g, '&'], [/&lt;/g, '<'], [/&gt;/g, '>'], [/&quot;/g, '"'], [/&#39;|&apos;/g, "'"]];
const decoder = (s) => ENT.reduce((a, [re, to]) => a.replace(re, to), s);
const norm = (s) => decoder(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
// texte tel qu'un navigateur l'affiche : une balise de bloc separe les mots, une balise en ligne (a, strong, span...) non
const BLOC = /<\/?(?:h[1-6]|p|ul|ol|li|div|table|thead|tbody|tr|td|th|br|article|section|header|footer|main|nav|button|form|label|figure|figcaption|dl|dt|dd|details|summary|aside)\b[^>]*>/gi;
const txt = (h) => norm(h.replace(BLOC, ' ').replace(/<[^>]+>/g, ''));
const visible = (html) => txt(html.slice(html.search(/<body/i)).replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' '));
const attr = (tag, n) => { const m = tag.match(new RegExp(String.raw`\b${n}\s*=\s*(?:"([^"]*)"|'([^']*)')`, 'i')); return m ? (m[1] ?? m[2]) : undefined; };
const tete = (html) => html.slice(0, html.search(/<\/head>/i));
const metas = (html) => [...tete(html).matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
const meta = (html, cle) => metas(html).filter((m) => attr(m, 'name') === cle || attr(m, 'property') === cle).map((m) => attr(m, 'content'));
const liens = (html) => [...tete(html).matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
const blocsLd = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
const urlAttendue = (f) => ORIGINE + (f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, ''));
const cles = (o, acc = new Set()) => { if (Array.isArray(o)) o.forEach((x) => cles(x, acc)); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { acc.add(k); cles(v, acc); } return acc; };
const dimensionsPng = (f) => { const b = readFileSync(RACINE + f); return b.slice(1, 4).toString() === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };

// ---------------------------------------------------------------- 1. donnees structurees
titre('1. donnees structurees');
const graphe = {};
for (const f of [...PAGES_INDEXABLES, ...PAGES_NOINDEX]) {
  const blocs = blocsLd(lire(f));
  let valide = true; const parses = [];
  for (const b of blocs) { try { parses.push(JSON.parse(b)); } catch (e) { valide = false; console.log('      ' + f + ' : ' + e.message); } }
  ok(valide, `${f} : ${blocs.length} bloc(s) ld+json, ${valide ? 'tous lisibles par JSON.parse' : 'JSON INVALIDE'}`);
  graphe[f] = parses;
}
const types = (f) => (graphe[f][0]?.['@graph'] || []).map((n) => n['@type']);
{
  const f = 'index.html', html = lire(f), t = types(f), vis = visible(html);
  ok(graphe[f].length === 1, 'index.html : un seul bloc ld+json');
  ok(JSON.stringify(t) === JSON.stringify(['Organization', 'WebSite', 'SoftwareApplication', 'FAQPage']), 'index.html : un seul @graph = ' + JSON.stringify(t));
  const g = graphe[f][0]['@graph'];
  const org = g.find((n) => n['@type'] === 'Organization'), web = g.find((n) => n['@type'] === 'WebSite');
  const sw = g.find((n) => n['@type'] === 'SoftwareApplication'), faq = g.find((n) => n['@type'] === 'FAQPage');

  // FAQPage = texte visible
  const sect = html.slice(html.indexOf('id="faq"'), html.indexOf('<!-- À PROPOS -->'));
  const visibles = [...sect.matchAll(/<button class="faq-q"[^>]*><span>([\s\S]*?)<\/span>[\s\S]*?<div class="faq-a">([\s\S]*?)<\/div>/g)].map((m) => ({ q: txt(m[1]), a: txt(m[2]) }));
  const dedans = faq.mainEntity.map((e) => ({ q: norm(e.name), a: txt(e.acceptedAnswer.text) }));
  ok(visibles.length > 0 && visibles.length === dedans.length, `FAQPage : ${dedans.length} questions, ${visibles.length} visibles`);
  visibles.forEach((v, i) => ok(dedans[i] && v.q === dedans[i].q && v.a === dedans[i].a, `FAQPage Q${i + 1} : question et reponse identiques au texte visible`));

  // garde-fous : ni note, ni avis, ni compteur, ni regime de taxe
  const k = cles(graphe[f][0]);
  ok(!INTERDITS.some((x) => k.has(x)), 'aucune cle de note, d\'avis ni de compteur d\'utilisateurs (' + INTERDITS.filter((x) => k.has(x)).join(', ') + ')');

  // Organization : rien d'absent du site
  ok(org.legalName === 'EcoPatrimoine Conseil' && org.name === 'EcoPatrimoine Conseil', 'Organization : nom et legalName');
  const cgu = visible(lire('cgu.html'));
  const adr = org.address;
  ok(cgu.includes(`${adr.streetAddress}, ${adr.postalCode} ${adr.addressLocality}`) && adr.addressCountry === 'FR', `Organization : adresse « ${adr.streetAddress}, ${adr.postalCode} ${adr.addressLocality} » presente a l'article 1 des CGU`);
  ok(cgu.includes(org.identifier.value) && /RCS/.test(cgu) && org.identifier.name === 'RCS Perpignan', `Organization : immatriculation « ${org.identifier.name} ${org.identifier.value} » presente a l'article 1 des CGU`);
  ok(vis.includes(org.email), 'Organization : e-mail affiche sur la page');
  for (const u of org.sameAs) ok(html.includes(`href="${u}`), `Organization : sameAs ${u} est un lien affiche sur la page`);
  ok(web.url === ORIGINE + '/' && web.inLanguage === 'fr' && web.publisher['@id'] === org['@id'], 'WebSite : url, langue, editeur');

  // SoftwareApplication : tout vient de la page
  ok(sw.url === ORIGINE + '/' && sw.inLanguage === 'fr' && sw.publisher['@id'] === org['@id'], 'SoftwareApplication : url, langue, editeur');
  ok(sw.image === ORIGINE + '/og-image.png' && existsSync(RACINE + 'og-image.png'), 'SoftwareApplication : image = og-image.png (existe)');
  ok(sw.featureList.length > 0 && sw.featureList.every((x) => vis.includes(norm(x))), `featureList : ${sw.featureList.length} fonctions, toutes presentes dans le texte visible`);
  for (const s of sw.screenshot) {
    const chemin = s.contentUrl.replace(ORIGINE, '');
    const tag = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]).find((t2) => attr(t2, 'src') === chemin);
    ok(tag && attr(tag, 'alt') === s.caption && Number(attr(tag, 'width')) === s.width && Number(attr(tag, 'height')) === s.height && existsSync(RACINE + chemin.slice(1)), `screenshot ${chemin} : affichee, legende = alt, dimensions = attributs, fichier present`);
  }
  ok(sw.offers.length === 2, 'SoftwareApplication : 2 offres');
  for (const o of sw.offers) {
    ok(vis.includes(norm(o.name)) && html.includes(`href="${o.url}"`) && o.priceCurrency === 'EUR' && o.priceSpecification?.price === o.price && ['MON', 'ANN'].includes(o.priceSpecification?.unitCode),
      `offre « ${o.name} » : nom affiche, lien de souscription affiche, priceSpecification coherente (${o.price} EUR, ${o.priceSpecification?.unitCode})`);
    ok(vis.includes(`${o.price} € HT`) && o.priceSpecification?.valueAddedTaxIncluded === false,
      `offre « ${o.name} » : prix affiche hors taxes (« ${o.price} € HT ») et priceSpecification.valueAddedTaxIncluded = false`);
  }

  // audience : une seule valeur, la phrase des cibles telle qu'affichee (S1-bis)
  const pCibles = html.match(/<p class="about-cibles">([\s\S]*?)<\/p>/);
  ok(pCibles && txt(pCibles[1]) === CIBLES && vis.includes(CIBLES), 'paragraphe des cibles affiche, mot pour mot (section « A propos »)');
  ok(sw.audience?.['@type'] === 'Audience' && typeof sw.audience.audienceType === 'string' && norm(sw.audience.audienceType) === CIBLES && vis.includes(norm(sw.audience.audienceType)),
    'SoftwareApplication.audience : un noeud Audience dont audienceType = la phrase des cibles affichee');

  // titre, description et balises de partage (S1-bis)
  const titreHtml = txt((html.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1]);
  ok(titreHtml === ACCUEIL_TITRE && [...titreHtml].length <= 60, `index.html : <title> = « ${ACCUEIL_TITRE} » (${[...titreHtml].length} caracteres, 60 au plus)`);
  const desc = meta(html, 'description');
  ok(desc.length === 1 && norm(desc[0]) === ACCUEIL_DESCRIPTION && [...norm(desc[0])].length <= 155, `index.html : meta description = le texte demande (${desc[0] ? [...norm(desc[0])].length : 0} caracteres, 155 au plus)`);
  for (const [cle, attendu] of [['og:title', ACCUEIL_TITRE], ['twitter:title', ACCUEIL_TITRE], ['og:description', ACCUEIL_DESCRIPTION], ['twitter:description', ACCUEIL_DESCRIPTION]]) {
    const v = meta(html, cle);
    ok(v.length === 1 && norm(v[0]) === attendu, `index.html : ${cle} aligne sur ${cle.endsWith('title') ? 'le titre' : 'la description'}`);
  }
}
for (const f of ['cgu.html', 'dpa.html', 'politique-confidentialite.html']) {
  const html = lire(f), g = graphe[f][0]?.['@graph'] || [];
  ok(JSON.stringify(types(f)) === JSON.stringify(['WebPage', 'BreadcrumbList']) && graphe[f].length === 1, `${f} : un @graph WebPage + BreadcrumbList`);
  const wp = g.find((n) => n['@type'] === 'WebPage'), bc = g.find((n) => n['@type'] === 'BreadcrumbList');
  if (!wp || !bc) continue;
  const verBalise = html.match(/<p class="ver"([^>]*)>([\s\S]*?)<\/p>/);
  const h1 = txt(html.match(/<h1>([\s\S]*?)<\/h1>/)[1]), ver = txt(verBalise[2]), provisoire = /\bdata-version-provisoire\b/.test(verBalise[1]);
  const d = ver.match(/(\d+|1er)\s+([a-zéûè]+)\s+(\d{4})/); const date = d ? `${d[3]}-${MOIS[d[2]]}-${String(parseInt(d[1], 10)).padStart(2, '0')}` : null;
  ok(wp.name === h1, `${f} : WebPage.name = titre affiche « ${h1} »`);
  ok(wp.description === norm(meta(html, 'description')[0]), `${f} : WebPage.description = meta description`);
  if (provisoire) ok(wp.dateModified === DATE_PROVISOIRE && ver === VERSION_PROVISOIRE, `${f} : version provisoire coherente : attribut data-version-provisoire, ligne « ${ver} », dateModified ${wp.dateModified} (provisoire attendue : ${DATE_PROVISOIRE})`);
  else ok(wp.dateModified === date && wp.dateModified !== DATE_PROVISOIRE, `${f} : dateModified ${wp.dateModified} = date de version affichee (${date})`);
  // espaces insecables a l'interieur des guillemets du texte juridique (la gate de texte normalise les espaces et ne les voit pas)
  const feuille = (html.match(/<article class="feuille">([\s\S]*?)<\/article>/) || [, ''])[1];
  const guillemets = (feuille.match(/[«»]/g) || []).length, mauvais = [...feuille.matchAll(/«(?!&nbsp;| )|(?<!&nbsp;| )»/g)].length;
  ok(mauvais === 0 && (f !== 'cgu.html' || guillemets > 0), `${f} : guillemets « » : espace insecable a l'interieur partout (${guillemets} guillemets, ${mauvais} avec une espace ordinaire ou sans espace)`);
  ok(wp.url === urlAttendue(f) && wp.isPartOf?.['@id'] === ORIGINE + '/#website' && wp.isPartOf?.['@type'] === 'WebSite', `${f} : url et isPartOf (WebSite)`);
  ok(wp.breadcrumb?.['@id'] === bc['@id'], `${f} : breadcrumb relie au BreadcrumbList`);
  const it = bc.itemListElement || [];
  ok(it.length === 2 && it[0].position === 1 && it[0].name === 'Accueil' && it[0].item === ORIGINE + '/' && it[1].position === 2 && it[1].name === h1 && it[1].item === urlAttendue(f) && visible(html).includes('Accueil'), `${f} : fil d'Ariane Accueil › ${h1}`);
  const k = cles(graphe[f][0]);
  ok(!INTERDITS.some((x) => k.has(x)), `${f} : aucune cle interdite`);
}

// ---------------------------------------------------------------- 2. indexation et partage
titre('2. indexation et balises de partage');
const [lOg, hOg] = dimensionsPng('og-image.png') || [0, 0];
ok(lOg === 1200 && hOg === 630, `og-image.png : ${lOg} x ${hOg} px (1200 x 630 attendu)`);
for (const f of PAGES_INDEXABLES) {
  const html = lire(f), c = liens(html).filter((l) => attr(l, 'rel') === 'canonical').map((l) => attr(l, 'href'));
  const rb = meta(html, 'robots').join(' ');
  ok(c.length === 1 && c[0] === urlAttendue(f), `${f} : une seule canonique, vers elle-meme (${c.join(' , ') || 'aucune'})`);
  ok(!/noindex/i.test(rb), `${f} : indexable (robots : ${rb || 'pas de balise'})`);
  ok(meta(html, 'og:image:width')[0] === String(lOg) && meta(html, 'og:image:height')[0] === String(hOg) && meta(html, 'og:locale')[0] === 'fr_FR' && meta(html, 'og:site_name')[0] === 'Ploutos' && meta(html, 'og:image').length === 1,
    `${f} : og:image:width/height = ${lOg}x${hOg}, og:locale fr_FR, og:site_name Ploutos`);
  ok(meta(html, 'og:url')[0] === urlAttendue(f), `${f} : og:url = canonique`);
}
for (const f of PAGES_NOINDEX) ok(/noindex/i.test(meta(lire(f), 'robots').join(' ')), `${f} : noindex`);

// ---------------------------------------------------------------- 3. sitemap
titre('3. sitemap.xml');
const sitemap = lire('sitemap.xml');
let regenere = null;
try { regenere = genererSitemap(); } catch (e) { ok(false, 'regeneration impossible : ' + e.message); }
if (regenere !== null) ok(sitemap === regenere, 'sitemap.xml identique a ce que regenere scripts/sitemap.mjs' + (sitemap === regenere ? '' : ' (relancer : node scripts/sitemap.mjs, apres avoir committe les pages)'));
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
ok(JSON.stringify(locs) === JSON.stringify(PAGES_INDEXABLES.map(urlAttendue)), `sitemap.xml : ${locs.length} URL = les pages indexables (${locs.map((u) => u.replace(ORIGINE, '') || '/').join(' ')})`);
ok(!/changefreq|priority/.test(sitemap), 'sitemap.xml : ni changefreq ni priority');
ok([...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].every((m) => /^\d{4}-\d{2}-\d{2}$/.test(m[1])) && (sitemap.match(/<lastmod>/g) || []).length === locs.length, 'sitemap.xml : un lastmod AAAA-MM-JJ par URL');
for (const f of PAGES_NOINDEX) ok(!sitemap.includes('/' + f.replace(/\.html$/, '') + '<') && !sitemap.includes(f), `${f} (noindex) : absente du plan du site`);

// ---------------------------------------------------------------- 4. robots.txt
titre('4. robots.txt');
const robots = lire('robots.txt');
const lignes = robots.split('\n').map((l) => l.replace(/#.*$/, '').trim()).filter(Boolean);
ok(lignes.filter((l) => /^sitemap\s*:/i.test(l)).length === 1 && lignes.includes(`Sitemap: ${ORIGINE}/sitemap.xml`), 'un seul Sitemap : ' + ORIGINE + '/sitemap.xml');
ok(!lignes.some((l) => /^disallow\s*:/i.test(l)), 'aucune ligne Disallow');
const groupes = []; let cour = null;
for (const l of lignes) { const m = l.match(/^(user-agent|allow|disallow|sitemap)\s*:\s*(.*)$/i); if (!m) continue; const k = m[1].toLowerCase(); if (k === 'user-agent') { if (!cour || cour.regles.length) { cour = { agents: [], regles: [] }; groupes.push(cour); } cour.agents.push(m[2]); } else if (k !== 'sitemap' && cour) cour.regles.push(l); }
ok(groupes.some((g) => g.agents.length === 1 && g.agents[0] === '*' && g.regles.includes('Allow: /')), 'groupe general conserve : User-agent: * / Allow: /');
const gIA = groupes.find((g) => !g.agents.includes('*'));
ok(gIA && JSON.stringify([...gIA.agents].sort()) === JSON.stringify([...ROBOTS_IA].sort()) && JSON.stringify(gIA.regles) === JSON.stringify(['Allow: /']), `groupe des moteurs a intelligence artificielle : ${gIA ? gIA.agents.length : 0} noms = la liste confirmee, Allow: / seul`);

// ---------------------------------------------------------------- 5. llms.txt
titre('5. llms.txt');
ok(existsSync(RACINE + 'llms.txt'), 'llms.txt existe');
if (existsSync(RACINE + 'llms.txt')) {
  const llms = lire('llms.txt');
  ok(llms.startsWith('# Ploutos\n') && !llms.startsWith('﻿') && llms.endsWith('\n'), 'llms.txt : Markdown UTF-8 sans BOM, titre « # Ploutos », fin de ligne finale');
  const cibles = [...llms.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
  ok(cibles.length > 0 && cibles.every((u) => locs.includes(u)), `llms.txt : ${cibles.length} liens, tous dans le plan du site`);
  const ligneLlms = llms.split('\n');
  ok(/\bHT\b/.test(llms) && !/\bTTC\b|toutes taxes/i.test(llms), 'llms.txt : prix hors taxes (« HT »), aucun « TTC » ni « toutes taxes »');
  ok(ligneLlms.includes('- Prix : 50 € HT par mois ou 500 € HT par an, un seul plan tout compris (TVA non applicable, art. 293 B du CGI). Essai gratuit de 30 jours, sans carte bancaire.'),
    'llms.txt : ligne Prix exacte (50 € HT par mois ou 500 € HT par an, TVA non applicable art. 293 B du CGI)');
  ok(ligneLlms.includes("- Public : CGP indépendants et cabinets de conseil en gestion de patrimoine, CIF, courtiers en assurance, agents d'assurance, sociétés d'assurance, agents immobiliers."),
    'llms.txt : ligne Public exacte (CGP, CIF, courtiers, agents d\'assurance, societes d\'assurance, agents immobiliers)');
  ok(llms.includes("pour les conseillers en gestion de patrimoine (CGP), les conseillers en investissements financiers (CIF), les courtiers et agents d'assurance, les sociétés d'assurance et les agents immobiliers. Il couvre"),
    'llms.txt : premiere phrase avec la liste des cibles');
}

// ---------------------------------------------------------------- 6. texte visible
titre(`6. texte visible : corps des pages identique a ${BASE}, hors differences declarees`);
const corpsDe = (h) => h.slice(h.search(/<body/i));
for (const f of PAGES_INDEXABLES) {
  const liste = DIFFERENCES[f] || [];
  const a = corpsDe(depart(f)), b = corpsDe(lire(f));
  let attendu = a, applicables = true;
  for (const [nom, de, vers] of liste) {
    const n = a.split(de).length - 1;
    ok(n === 1, `${f} : difference declaree « ${nom} » : fragment de depart present une seule fois dans ${BASE} (${n})`);
    if (n === 1) attendu = attendu.replace(de, () => vers); else applicables = false;
  }
  const egal = applicables && attendu === b;
  ok(egal, `${f} : du <body au dernier octet, identique a ${BASE}` + (liste.length ? ` + ${liste.length} difference(s) declaree(s), aucune autre` : ', aucune difference'));
  if (applicables && !egal) console.log('         ' + premiereDifference(attendu, b));
}
for (const f of PAGES_NOINDEX) ok(depart(f) === lire(f), `${f} : fichier entier inchange`);

// ---------------------------------------------------------------- 7. configuration
titre('7. configuration (_headers, _redirects, netlify.toml)');
const hdr = lire('_headers'), hdrBase = depart('_headers', BASE_CONFIG);
ok(hdr.startsWith(hdrBase), '_headers : politiques de securite (CSP) intactes, fichier de depart = prefixe exact');
ok(/\n\/fonts\/\*\n  Cache-Control: public, max-age=31536000, immutable\n/.test(hdr), '_headers : /fonts/* en un an, immutable');
ok(/\n\/img\/\*\n  Cache-Control: public, max-age=604800\n/.test(hdr) && !/\/img\/\*\n  Cache-Control:[^\n]*immutable/.test(hdr), '_headers : /img/* en une semaine, sans immutable');
const red = lire('_redirects');
ok(/^\/docs\/\*\s+\/404\.html\s+404!/m.test(red) && /^\/scripts\/\*\s+\/404\.html\s+404!/m.test(red), '_redirects : /docs/* et /scripts/* renvoient la 404 de marque (404!)');
const toml = lire('netlify.toml');
const commande = (toml.match(/^\s*command\s*=\s*"([^"]*)"/m) || [])[1];
ok(commande === 'rm -rf docs scripts', `netlify.toml : commande de build « ${commande} »`);

// ---------------------------------------------------------------- 8. publication
titre('8. publication : build simulé sur une copie');
if (process.argv.includes('--sans-publication')) console.log('  (ignore : --sans-publication)');
else {
  const tmp = mkdtempSync(join(tmpdir(), 'ploutos-publication-'));
  try {
    const fichiers = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: RACINE, encoding: 'utf8', maxBuffer: 1 << 26 }).split('\0').filter(Boolean);
    for (const f of fichiers) if (existsSync(RACINE + f)) { mkdirSync(dirname(join(tmp, f)), { recursive: true }); cpSync(RACINE + f, join(tmp, f)); }
    ok(existsSync(join(tmp, 'docs')) && existsSync(join(tmp, 'scripts')), `copie du depot : ${fichiers.length} fichiers, docs/ et scripts/ presents avant le build`);
    // Simulation sans shell : seule la forme « rm -rf <noms> » est acceptee, executee par Node dans la copie.
    const m = (commande || '').match(/^rm -rf((?: [A-Za-z0-9_-][A-Za-z0-9_.-]*)+)$/);
    ok(Boolean(m), `build simule : la commande « ${commande} » est de la forme « rm -rf <noms> » (seule forme simulee)`);
    if (m) for (const nom of m[1].trim().split(' ')) rmSync(join(tmp, nom), { recursive: true, force: true });
    ok(!existsSync(join(tmp, 'docs')) && !existsSync(join(tmp, 'scripts')), 'apres le build : ni docs/ ni scripts/ dans la copie publiee');
    ok(['index.html', 'robots.txt', 'llms.txt', 'sitemap.xml', 'ploutos-doc.css', '_headers', '_redirects'].every((f) => existsSync(join(tmp, f))), 'apres le build : robots.txt, llms.txt, sitemap.xml, _headers, _redirects et les pages sont publies');
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

// ---------------------------------------------------------------- 9. mention de franchise en base de TVA
titre('9. mention de franchise en base de TVA : presente partout ou nulle part');
{
  const fichiers = Object.keys(MARQUEURS_FRANCHISE);
  const texteDe = (f) => (f.endsWith('.html') ? visible(lire(f)) : lire(f));
  const present = Object.fromEntries(fichiers.map((f) => [f, texteDe(f).includes(MARQUEURS_FRANCHISE[f])]));
  const avec = fichiers.filter((f) => present[f]), sans = fichiers.filter((f) => !present[f]);
  const etat = !sans.length ? 'PRESENTE PARTOUT' : !avec.length ? 'ABSENTE PARTOUT' : 'ETAT MIXTE';
  ok(!avec.length || !sans.length, `mention de franchise : ${etat} (presente : ${avec.join(', ') || 'aucun fichier'} ; absente : ${sans.join(', ') || 'aucun fichier'})`);
  // aucune variante : toute mention de franchise ailleurs que dans un des trois marqueurs exacts echoue
  const approx = /293\s*B|franchise en base/i;
  const variantes = [...PAGES_INDEXABLES, ...PAGES_NOINDEX, 'llms.txt'].filter((f) => approx.test(texteDe(f)) && !present[f]);
  ok(!variantes.length, `mention de franchise : aucune formulation alteree ni ajoutee ailleurs (${variantes.join(', ') || 'rien trouve'})`);
  const fiche = existsSync(RACINE + FICHE_SORTIE) ? lire(FICHE_SORTIE) : '';
  ok(fiche !== '' && fichiers.every((f) => fiche.includes(MARQUEURS_FRANCHISE[f])), `${FICHE_SORTIE} : existe et cite les ${fichiers.length} mentions de franchise, telles qu'ecrites aujourd'hui`);
  if (!sans.length) {
    const cgu9 = visible(lire('cgu.html')), accueil9 = visible(lire('index.html')), llms9 = lire('llms.txt');
    ok(cgu9.includes('exprimés hors taxes') && !/toutes taxes comprises/i.test(cgu9), 'franchise : CGU article 6 « exprimés hors taxes », aucune « toutes taxes comprises »');
    ok(accueil9.includes('Prix hors taxes.') && !/\bTTC\b|toutes taxes/i.test(accueil9), 'franchise : accueil « Prix hors taxes. », aucun « TTC »');
    ok(/\bHT\b/.test(llms9) && !/\bTTC\b|toutes taxes/i.test(llms9), 'franchise : llms.txt « HT », aucun « TTC »');
  }
}

// ---------------------------------------------------------------- 10. date de version provisoire
titre(`10. date de version provisoire des CGU (${RELEASE ? 'mode --release : echec' : 'avertissement, echoue avec --release'})`);
let avertissements = 0;
{
  const html = lire('cgu.html');
  const provisoires = [];
  if (/\bdata-version-provisoire\b/.test(html)) provisoires.push('cgu.html : attribut data-version-provisoire sur la ligne de version');
  if (new RegExp(`"dateModified"\\s*:\\s*"${DATE_PROVISOIRE}"`).test(html)) provisoires.push(`cgu.html : dateModified = ${DATE_PROVISOIRE} (valeur provisoire)`);
  if (visible(html).includes('[date de mise en ligne]')) provisoires.push('cgu.html : « [date de mise en ligne] » affiche dans la ligne de version');
  if (!provisoires.length) ok(true, 'aucune date de version provisoire : les CGU portent une date de mise en ligne');
  for (const p of provisoires) {
    if (RELEASE) ok(false, p + ' : la mise en ligne exige une date de version posee');
    else { avertissements++; console.log('  AVERTISSEMENT  ' + p + ' (echoue avec --release)'); }
  }
}

console.log(echecs
  ? `\n${echecs} controle(s) en echec : la gate echoue${RELEASE ? ' (mode --release)' : ''}`
  : '\nTous les controles passent' + (RELEASE ? ' (mode --release : pret pour la mise en ligne)' : avertissements ? ` (${avertissements} avertissement(s) : a lever avant la mise en ligne, voir --release)` : ''));
process.exit(echecs ? 1 : 0);
