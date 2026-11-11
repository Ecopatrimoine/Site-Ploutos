# Lot R1 - confrontation des trois pages reglementaires (recon, lecture seule)

Date : 11/11/2026. Depot `Ecopatrimoine/Site-Ploutos`, branche `refonte-site`, tete `6a7fd24`.
Lu en entier : `cgu.html`, `dpa.html`, `politique-confidentialite.html`, `ploutos-carte.css`, `sw.js`, `_headers`, `_redirects`, `netlify.toml`, `docs/maquettes/contraste.mjs`, la maquette 42 (structure, CSS, script ; les 4 lignes de polices en base64 ne comptent pas), l'accueil (nav et ancres), `inscription.html` (nav).
Rien n'a ete modifie dans le depot : ce fichier est le seul ajout, et il n'est pas commite.

## 0. Etat de depart

- **Fichiers non suivis par git** : la maquette 42 (`site_pages_reglementaires.html`), ce prompt (`PROMPT_SITE_R1_...md`), le prompt S1, `SEO_CADRAGE`, `FICHE_COMPARATEURS` et les maquettes `site_vitrine_v3*.html`. Le prompt les dit « deja deposes dans le depot » : ils sont sur le disque mais pas dans l'historique. A trancher (question 1).
- **html-validate (regles par defaut) sur les trois pages actuelles : 4 erreurs.**
  - `no-inline-style` sur le lien du logo de chacune des trois pages (cgu 118, dpa 139, politique 118) ;
  - `prefer-tbody` sur le tableau du DPA (ligne 173 : des `<tr>` directement dans `<table>`).
  La premiere disparait avec la nouvelle barre. La seconde impose un `<thead>` et un `<tbody>` dans le DPA (balisage seul, texte inchange).
- **Outils** : Node 24, `npx --yes html-validate` fonctionne ; Playwright est disponible via le `@playwright/cli` global (playwright-core 1.64) ; la revision de Chromium qu'il attend (1247) n'est pas installee, mais 1254 l'est : les captures se feront avec `executablePath` sur cette version, sans rien telecharger.
- **Rappel d'environnement** : la session a ete ouverte dans `Site Lunelos` (autre depot, `lunelos-landing`, non touche). Tout le travail R1 se fait dans `Site ploutos`.

## 1. Structure commune des trois pages (avant) et ce qu'elle devient

| Avant (`6a7fd24`) | Apres (R1) |
|---|---|
| `<head>` : meta, titre, description, canonique, `og:*`, `twitter:*`, icone | **Inchange** (le lot S1 les reprendra) |
| `<style>` inline (≈ 95 lignes, 4 `@font-face` Source Serif 4 300/400/600/300 italique, jetons `--navy` `--cream`...) | Retire. `<link>` vers `/ploutos-carte.css` puis `/ploutos-doc.css` ; `<script src="/ploutos-doc.js" defer>` |
| `<header>` : logo en `<img>` + `onerror` + `style=`, lien « ← Retour » | Barre de la maquette : tuile lin (π, « PLOUTOS », « by EcoPatrimoine Conseil »), Fonctionnalites / Tarifs / FAQ / Contact (`/#fonctionnalites`, `/#tarifs`, `/#faq`, `/#contact`, les quatre ancres existent sur l'accueil), « Se connecter » (`https://app.ploutos-cgp.fr`), « Essai gratuit 30 j » (`/inscription.html`) ; filet or 3 px ; fil de progression |
| `.hero` centre : `h1` + `p` de version | Tete encre `#0B1120` : eyebrow « Document contractuel », `h1` (Source Serif 4 600), ligne de version, trois onglets-liens |
| `.container` 780 px, `.notice` + `h2` / `p` / `ul` / tableau | `<main>` : sommaire collant 270 px + feuille blanche 860 px max (Lato 16,5 px, interligne 1,7, 72 ch) ; `.notice` + corps **repris tels quels** |
| `<footer>` 2 `<p>` | Pied encre ; **meme texte et memes liens qu'aujourd'hui** (« © Ploutos 2026 — EcoPatrimoine Conseil · CGU · DPA · Politique de confidentialite · Accueil » / « Contact : ... ») |
| Beacon Cloudflare `type="module"` | **Inchange** |

Aucun `style=` ni hex dans les trois pages apres R1 : le π est un `<svg>` en ligne dont les remplissages passent par la feuille (comme la maquette), le `onerror` disparait.

## 2. Ecarts entre les trois pages

| | CGU | DPA | Politique |
|---|---|---|---|
| `h2` | 12, « Article N — Titre » | 5, « N. Titre » | 7, « N. Titre » |
| Numero affiche (`<span class="no">`) | « Article N » | « N » | « N » |
| `h3` | aucun | aucun | 1 : « Lecture automatique de documents » (dans la section 3) |
| Listes | aucune | 1 `ul` (section 2, 5 `li`) | 2 `ul` (sections 2 et 4), avec 6 `<em>` |
| Tableau | non | oui : `.table-wrap` + `<table>` 3 colonnes x (1 en-tete + 6 lignes) | non |
| `.notice` | oui | oui (avec lien `/cgu`) | oui |
| Liens internes dans le corps | `/politique-confidentialite` x2, `/dpa` x1 | `/cgu` x1 | `/dpa` x2 |
| Lien externe | non | non | `https://www.cnil.fr` (`target="_blank" rel="noopener"`, repris tel quel) |
| `<br>` | 3 (article 1) | non | non |
| Ligne de version | « Version en vigueur au 1er septembre 2026 · EcoPatrimoine Conseil » | « Annexe RGPD (art. 28) aux CGU de Ploutos · Version en vigueur au 1er septembre 2026 » | « Version en vigueur au 1er septembre 2026 · Conforme RGPD (Reglement UE 2016/679) » |

Le `h3` de la politique n'entre pas dans le sommaire (la maquette ne liste que les `h2`) ; il garde le style `h3` de la maquette.

## 3. Choix sur les jetons

`ploutos-carte.css` couvre les couleurs de marque, les polices, l'ombre et la courbe de la maquette ; il manque six couleurs (tableau ci-dessous). **Choix : reutiliser la carte pour ce qu'elle couvre (les pages chargent les deux feuilles), declarer les six manquantes dans `ploutos-doc.css`.**

Repris de la carte : `--pl-navy` (#0F172A), `--pl-cab-navy` (#101B3B), `--site-sky` (#26428B), `--pl-gold-light` (#E3AF64), `--pl-gold-text-parchment` (#7A5C0F), `--pl-lin` (#F3EEE3), `--pl-white-warm` (#F8F7F4), `--pl-border` (#D8D2C6), `--pl-text-muted-refonte` (#4D5D74), `--pl-card` (#FFFFFF), `--pl-shadow-card` (identique a `--sh`), `--pl-ease`, `--pl-f-ui` / `--pl-f-serif`. Les quatre `@font-face` (Lato 400/700/900, Source Serif 4 600) sont deja dans la carte : rien a redeclarer, aucun nouvel appel.

A declarer dans `ploutos-doc.css` (absents de la carte) :

| Jeton | Valeur | Usage |
|---|---|---|
| `--doc-parch` | #E8E3D9 | fond de page, onglet actif |
| `--doc-gold` | #C4973D | filet de la barre, puces, repere du sommaire (non texte) |
| `--doc-ink` | #0B1120 | tete et pied |
| `--doc-ink-texte` | #A9B6CC | ligne de version, texte du pied |
| `--doc-onglet-texte` | #C9D2E0 | texte des onglets inactifs |
| `--doc-zebra` | #FDFCFA | lignes impaires du tableau |

Cout de la reutilisation : la carte apporte ≈ 9,7 Ko de regles inutiles ici (`cx-*`, champs, messages), deja en cache et precachees. Collisions a neutraliser dans `ploutos-doc.css` : `body` (la carte le met en colonne flex sur fond lin, 15 px), `.btn` (la carte le met a 100 % de large, 44 px : la feuille utilise `.dc-btn`), la regle `a:focus-visible` (voir 6-B). `contraste.mjs` sera etendu pour lire les deux feuilles.

## 4. `id` des titres retenus (ecrits en dur ; sommaire dans le meme ordre)

Stables, minuscules, sans accent. Aucun ne commence par six caracteres hexadecimaux (la gate `#[0-9A-Fa-f]{6}` ne les prendrait pas pour des couleurs).

- **CGU** : `article-1` ... `article-12`.
- **DPA** : `section-1` ... `section-5`.
- **Politique** : `section-1` ... `section-7`.

Entrees du sommaire = titres sans le numero (comme la maquette) :
- CGU : Editeur du service · Objet · Service reserve aux professionnels · Compte et acces · Essai gratuit · Abonnement, prix et paiement · Disponibilite, maintenance et support · Nature du Service et responsabilite · Propriete intellectuelle · Donnees personnelles · Evolution du Service et des CGU · Droit applicable et juridiction.
- DPA : Roles et objet · Description du traitement · Obligations du sous-traitant · Sous-traitants ulterieurs · Audit.
- Politique : Responsable de traitement · Donnees traitees, finalites et bases legales · Destinataires et sous-traitants · Durees de conservation · Vos droits · Cookies et traceurs · Securite.

Forme du titre : `<h2 id="article-1"><span class="no">Article 1</span> Editeur du service</h2>` (une espace apres le `span`, pour que le nom accessible et le texte brut restent « Article 1 Editeur du service » ; elle ne se voit pas, le `span` etant en bloc).

## 5. Ecarts maquette / prompt (decides par le prompt, appliques)

1. Onglets = liens `/cgu`, `/dpa`, `/politique-confidentialite`, `aria-current="page"` sur la page courante, dans un `<nav aria-label="Documents">` ; la maquette utilisait des `<button role="tab">` et une bascule par script, abandonnes.
2. Sommaire et `id` ecrits en dur ; plus de `h2.innerHTML = ...` par script.
3. Barre : Fonctionnalites, Tarifs, FAQ, Contact, Se connecter, Essai gratuit ; Prevoyance, Reglementaire, Nouveautes, Telechargement retires (lot de l'accueil).
4. Pied : celui de chaque page aujourd'hui.
5. Script reduit a trois fonctions : repere du sommaire (`IntersectionObserver`), fil de progression, `window.print()`.

## 6. Ecarts de realisation que je propose (a valider avec le GO)

- **A. Un seul `h1`, dans la tete.** La maquette garde un `<header class="tete">` cache dans chaque `<article>` et le recopie dans la tete par script ; sans script, la tete resterait vide. Ici, la tete encre contient directement eyebrow, `h1`, version et onglets ; les regles `@media print` masquent l'eyebrow, les onglets, la barre, le sommaire, le pied et le fond encre, et remettent `h1` et version en encre sur blanc. Meme rendu papier, pas de `h1` double. **Defaut de la maquette corrige au passage** : en impression la ligne de version garde `#A9B6CC` sur blanc (≈ 2,1:1) ; elle passera en couleur d'encre.
- **B. Anneau de focus.** La maquette utilise `#C4973D` (2,09:1 sur le fond de page, 2,68:1 sur la feuille) ; le jeton de la carte, `--pl-gold-deep` #A67F32, donne 2,88:1 sur le fond de page. Les deux sont sous les 3:1 de WCAG 1.4.11. Proposition : anneau 2 px **navy #0F172A** sur les zones claires (13,96:1 sur le fond de page, 15,43:1 sur la barre), **or clair #E3AF64** sur les zones encre (tete, pied : 9,49:1). Les couples de texte, eux, passent tous (voir section 7).
- **C. Trois defauts de la maquette a 390 px** (mesures sur la maquette en Chromium, aucun debordement horizontal, mais) : le libelle « SOMMAIRE » reste seul au-dessus du bouton (la liste est masquee sous 900 px) ; le bouton « Essai gratuit 30 j » passe sur deux lignes (133 px de large) ; le sous-titre « by EcoPatrimoine Conseil » se coupe. Proposition : masquer le libelle sous 900 px, `white-space: nowrap` sur la CTA et marges de la barre resserrees sous 480 px pour que tuile + CTA tiennent dans 390 px (la largeur de la tuile est fixee par « PLOUTOS », pas par le sous-titre : a verifier en capture).
- **D. Bouton d'impression.** Il porte `hidden` dans le HTML et `ploutos-doc.js` le montre : sans script, pas de bouton mort (le prompt demande que la page reste « entierement lisible et navigable »).
- **E. DPA : `<thead>` / `<tbody>`** pour passer `prefer-tbody` (gate 1). Balisage seul ; j'ajoute `scope="col"` sur les trois `<th>` (accessibilite, aucun mot). A refuser si « tel quel » doit aussi valoir pour les attributs.
- **F. Libelles qui different, a harmoniser ou non.** Onglets de la maquette : « CGU » · « Traitement des donnees » · « Confidentialite ». Pied actuel, repris tel quel : « CGU » · « DPA » · « Politique de confidentialite ». Bouton : « Essai gratuit 30 j » (maquette et prompt) contre « Essai gratuit 30j » sur l'accueil d'aujourd'hui. Je suis la maquette pour les onglets et le bouton, le pied actuel pour le pied.
- **G. Degrades de la tete.** La maquette a deux degrades radiaux dans la tete encre ; l'en-tete de `ploutos-carte.css` dit « aucun degrade » (c'est la regle de la carte, pas de ces pages). Je suis la maquette validee.
- **H. `<em>` de la politique (6, section 2).** Lato italique n'est pas livre en local (les `@font-face` du prompt sont 400/700/900 droits) : le navigateur synthetise l'oblique. Rendu correct, pas parfait ; je n'ajoute aucune police.
- **I. Eyebrow « Document contractuel » sur la Politique de confidentialite.** C'est une notice d'information, pas un contrat. Je suis le prompt ; a vous de dire si l'eyebrow doit changer pour cette page (« Document d'information »).
- **J. Impression.** J'ajoute `break-after: avoid` sur `h2`/`h3` et `break-inside: avoid` sur les lignes du tableau (pas dans la maquette, sans effet a l'ecran).
- **K. Recette locale : `python -m http.server` ne sert pas `/cgu`** (pas d'extension), donc les onglets et les liens internes du texte donneraient 404 en local (Netlify, lui, les sert). Proposition : `docs/maquettes/serveur_local.mjs`, une trentaine de lignes de Node sans dependance, qui sert la racine sur le port 8080 et resout `/cgu` -> `cgu.html` ; il sert aussi aux captures. `docs/` reste retire du build.

## 7. Gate : comment chaque point sera tenu

1. `npx --yes html-validate cgu.html dpa.html politique-confidentialite.html` : cible 0 erreur (depart : 4, voir section 0).
2. **Texte identique** : `docs/maquettes/texte_identique.mjs`. Pour chaque page, avant = `git show 6a7fd24:<page>`, apres = fichier courant ; compare `h1`, ligne de version et corps (`.container` avant, `.feuille` apres), espaces normalises, balises en ligne supprimees, balises de bloc remplacees par une espace ; neutralise **uniquement** le separateur des `h2` (« Article N — » et « N. ») ; compare en plus, dans l'ordre, la liste `href` + texte de chaque lien du corps. Toute autre difference = echec.
3. `grep -n "#[0-9A-Fa-f]\{6\}\|style=" cgu.html dpa.html politique-confidentialite.html` : vide.
4. `contraste.mjs` etendu aux deux feuilles, avec composition des transparences (onglets, degrades de la tete au pire point). **Deja calcule sur les valeurs de la maquette, tous >= 4,5** : corps navy/fond 13,96 ; eyebrow or-texte/fond 4,88 (le plus serre) ; sommaire muted/fond 5,24 ; lien sky/blanc 9,40 ; version/encre 9,19 (6,52 au pire du degrade) ; onglets 10,30 et 8,16 au survol ; bouton or 9,00 ; pied 9,19. Les deux couples les plus serres reposent sur le jeton nouveau `--doc-parch` : eyebrow or-texte/parch 4,88 et sommaire muted/parch 5,24.
5. Captures Playwright 1 280 et 390 px des trois pages + apercu d'impression des CGU (`emulateMedia print`, largeur A4) dans `docs/maquettes/captures/`.

## 8. Observations sur le texte (rien n'est modifie, a trancher plus tard)

- CGU : la phrase « Toute creation de compte emporte acceptation pleine et entiere des presentes. » figure deux fois, dans l'encadre d'ouverture et a la fin de l'article 2.
- DPA : « l'Utilisateur » (majuscule, terme non defini dans l'annexe, la CGU ecrit « l'utilisateur ») cote a cote avec « l'utilisateur » en minuscule dans la ligne Anthropic du tableau et dans le paragraphe qui suit le tableau.
- CGU article 8 : un seul paragraphe d'environ 330 mots. Lisible dans la feuille a 72 caracteres, mais c'est le plus long bloc des trois pages.

## 9. Fichiers du lot apres GO

`ploutos-doc.css`, `ploutos-doc.js`, `cgu.html`, `dpa.html`, `politique-confidentialite.html`, `sw.js` (precache des deux nouveaux fichiers, cache `ploutos-landing-v3`) ; hors site : `docs/maquettes/texte_identique.mjs`, `docs/maquettes/contraste.mjs` (etendu), `docs/maquettes/serveur_local.mjs` (si K accepte), `docs/maquettes/captures/`. Pas de modification de `_headers`, `_redirects`, `netlify.toml`, ni des metadonnees. Les pages ne sont pas ajoutees au precache (reseau d'abord, comme aujourd'hui) : le prompt n'en demande que deux fichiers.

## 10. Decisions attendues avec le GO

1. Commiter la maquette 42 et ce prompt (aujourd'hui non suivis) avec le premier commit de docs du lot ? Les autres fichiers non suivis (S1, SEO, comparateurs, maquettes v3) : hors lot, je n'y touche pas.
2. Ecarts 6-A a 6-K : tout accepter par defaut, ou lesquels refuser ? Les trois qui touchent le plus le rendu : **B** (couleur du focus), **C** (mobile), **K** (serveur local).

## 11. Decisions du GO (David, 11/11/2026)

1. Commit « docs » a part, en premier : `site_pages_reglementaires.html`, `PROMPT_SITE_R1_...md`, ce fichier. Les autres fichiers non suivis de `docs/maquettes/` (maquettes `site_vitrine_v3*`, `SEO_CADRAGE`, prompt S1, fiche comparateurs) restent hors lot.
2. Ecarts 6-A a 6-K acceptes, avec ces precisions :
   - **B** : anneau navy `#0F172A` sur les zones claires, or clair `#E3AF64` sur les zones encre.
   - **C** : verifier les trois points (libelle « Sommaire », CTA sur deux lignes, sous-titre de la tuile) sur la capture 390 px et la joindre a la livraison.
   - **E** : `thead` / `tbody` et `scope="col"` acceptes ; « tel quel » vaut pour les mots, pas pour les attributs.
   - **F** : onglets « CGU », « Traitement des donnees », « Confidentialite » ; bouton « Essai gratuit 30 j » (avec l'espace) ; pied actuel repris tel quel.
   - **G** : suivre la maquette (les deux degrades de la tete).
   - **I (CHANGEMENT)** : l'eyebrow de la politique de confidentialite devient **« Document d'information »** ; CGU et DPA gardent « Document contractuel ».
   - **K** : `docs/maquettes/serveur_local.mjs`, Node sans dependance, port 8080, aussi utilise pour les captures ; la commande exacte de lancement est donnee a la livraison.
3. Observations de la section 8 (phrase d'acceptation repetee dans les CGU, « Utilisateur » / « utilisateur » dans le DPA) : rien n'est modifie ; elles sont reprises dans le recap final comme points a revoir a la prochaine version des textes.
4. Tout le travail se fait dans `Site ploutos`, branche `refonte-site`. `Site Lunelos` n'est pas concerne. Commits ASCII, un fichier par commit, pas de push.
