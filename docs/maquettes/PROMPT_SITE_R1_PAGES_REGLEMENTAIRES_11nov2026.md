# Prompt Claude Code — Lot R1 (site) : les trois pages réglementaires dans la DA v3 (maquette 42)

**Modèle : Sonnet.** **Dépôt : `Ecopatrimoine/Site-Ploutos`** (site statique, aucun bundler, Netlify publie la racine après `rm -rf docs`). **Branche : `refonte-site` (tête `6a7fd24`)**, commits ASCII fichier par fichier, pas de `git add .`, pas de `Co-Authored-By`, pas de push sans GO de David. `main` n'est pas touchée (gelée jusqu'à la v3).

Références, déjà déposées dans le dépôt : `docs/maquettes/site_pages_reglementaires.html` (maquette 42, validée par David le 11/11/2026 : « ok nickel ça me va ») ; ce prompt sous `docs/maquettes/PROMPT_SITE_R1_PAGES_REGLEMENTAIRES_11nov2026.md`. La maquette fait foi pour les dimensions, couleurs, typographies et comportements ; ce prompt fait foi pour ce qui diffère d'elle (liste ci-dessous).

## Décisions qui bornent le lot (David, 11/11)
- **Trois pages, un gabarit** : `cgu.html`, `dpa.html`, `politique-confidentialite.html`. Barre du haut de la maquette (80 px, tuile lin avec π et lettrage, filet or 3 px), tête encre `#0B1120` (eyebrow « Document contractuel », titre Source Serif 4 600, ligne de version), trois onglets, sommaire collant à gauche (270 px), texte sur une feuille blanche (860 px au plus, Lato 16,5 px, interligne 1,7, 72 caractères par ligne), pied encre.
- **Le texte juridique ne change pas d'un mot.** Titres, paragraphes, listes, tableau, liens, date de version : repris tels quels. Seule la présentation des `h2` change : le numéro passe dans un `<span class="no">` au-dessus du titre (« Article 1 » pour les CGU, « 1 » tel quel pour les deux autres : on n'ajoute pas le mot « Article » là où la source ne l'a pas), et le séparateur (« — » ou « . ») disparaît de l'affichage.
- **Ce qui diffère de la maquette.** (1) Les onglets sont des liens vers les trois adresses réelles (`/cgu`, `/dpa`, `/politique-confidentialite`), l'onglet de la page courante porte `aria-current="page"` ; aucune bascule par script. (2) Le sommaire et les `id` des titres sont écrits en dur dans le HTML, pas fabriqués par script. (3) La navigation de la barre ne contient que ce qui existe aujourd'hui sur l'accueil de `refonte-site` : Fonctionnalités, Tarifs, FAQ, Contact (ancres de `/`), puis « Se connecter » et « Essai gratuit 30 j » (mêmes cibles que l'accueil actuel) ; les entrées de la maquette qui visent le futur accueil (Prévoyance, Réglementaire, Nouveautés, Téléchargement) viendront avec le lot de l'accueil. (4) Le pied reprend les liens du pied actuel de ces pages.
- **Script minimal**, une seule feuille `ploutos-doc.js` partagée : repère de lecture du sommaire (IntersectionObserver), fil de progression sous la barre, bouton « Imprimer ou enregistrer en PDF » (`window.print()`). Sans script, la page reste entièrement lisible et navigable.
- **Impression** : seuls le titre, la ligne de version et le texte s'impriment (règles `@media print` de la maquette).
- **Mouvement réduit** : aucune animation sous `prefers-reduced-motion`.
- **Feuille de style** : une feuille `ploutos-doc.css` à la racine, partagée par les trois pages. À la recon, lire `ploutos-carte.css` : si ses jetons couvrent les valeurs de la maquette, les réutiliser (la page charge les deux feuilles) plutôt que de les dupliquer ; sinon déclarer les jetons manquants dans `ploutos-doc.css`. Dire le choix au STOP. Aucun hex dans les trois pages elles-mêmes.
- **Polices** : les `@font-face` locaux existants (Lato 400/700/900, Source Serif 4 600). Aucun appel externe nouveau ; le beacon Cloudflare existant reste tel quel.
- **Métadonnées** : `<title>`, description, canonique et balises de partage inchangées (le lot S1 les reprendra).

## 0. Recon lecture seule, puis STOP court
Lire en entier les trois pages, `ploutos-carte.css`, `sw.js`, `_headers`, `_redirects`, la maquette 42. Livrable `docs/maquettes/R1_CONFRONTATION_PAGES_REGLEMENTAIRES.md` : la structure commune des trois pages et leurs écarts (tableau du DPA, `h3` de la politique), le choix sur les jetons, la liste des `id` de titres retenus (stables, en minuscules sans accent : `article-1`, `section-1`…), tout écart entre la maquette et ce prompt. Puis STOP et attendre le GO.

## 1. Réalisation
`ploutos-doc.css`, `ploutos-doc.js`, puis les trois pages. `sw.js` : ajouter les deux nouveaux fichiers au précache et passer le cache à `ploutos-landing-v3`.

## 2. Gate du dépôt (à chaque commit)
(1) `npx --yes html-validate cgu.html dpa.html politique-confidentialite.html` sans erreur. (2) **Texte identique** : script `docs/maquettes/texte_identique.mjs` qui compare, pour chacune des trois pages, le texte du corps juridique avant (version de `6a7fd24`, lue par `git show`) et après, espaces normalisés, en neutralisant uniquement le séparateur des `h2` (« — » après « Article N », « . » après le numéro) ; toute autre différence fait échouer la gate. Résultat collé dans la confrontation. (3) Aucun hex ni `style=` dans les trois pages : `grep -n "#[0-9A-Fa-f]\{6\}\|style=" cgu.html dpa.html politique-confidentialite.html` vide. (4) Contraste ≥ 4,5 pour chaque couple texte/fond de `ploutos-doc.css` (`docs/maquettes/contraste.mjs` étendu). (5) Captures Playwright 1 280 et 390 px des trois pages, plus une capture de l'aperçu d'impression des CGU, dans `docs/maquettes/captures/`.

## 3. Garde-fous
- Pas un mot du texte juridique ne change ; pas de reformulation, pas de correction typographique « au passage » (si une coquille est vue, la lister au STOP final).
- Les trois adresses, leurs canoniques et les redirections existantes restent identiques.
- Aucune ressource externe nouvelle, aucun effet 3D, aucune animation d'entrée autre que celle de la maquette.
- `docs/` reste versionné et jamais servi.
- Pas de commit tant que la gate n'est pas verte ; `--amend` seulement après `git fetch` + `git status`.

## Livraison
Récap demande vs fait point par point, résultat des cinq points de gate, captures, puis STOP : recette par David sur le serveur local (`python -m http.server 8080`) : les trois pages, passage d'un onglet à l'autre, sommaire qui suit la lecture, impression, téléphone. Push sur `refonte-site` par David après GO. Lot suivant : S1 (socle de référencement).
