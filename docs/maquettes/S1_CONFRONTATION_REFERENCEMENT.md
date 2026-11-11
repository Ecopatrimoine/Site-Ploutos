# Lot S1 - confrontation du referencement (recon, lecture seule)

Date : 11/11/2026. Depot `Ecopatrimoine/Site-Ploutos`, branche `refonte-site`, tete `3c23f09` (= `origin/refonte-site` apres `git fetch` : **R1 est pousse**).
Lu : les `<head>` des 10 fichiers HTML racine, `robots.txt`, `sitemap.xml`, `_headers`, `_redirects`, `netlify.toml`, `manifest.webmanifest`, le bloc `ld+json` d'`index.html`, la FAQ visible, les sections tarifs et fonctions, `docs/maquettes/SEO_CADRAGE_11nov2026.md` (§2 A), le prompt S1.
Rien n'a ete modifie dans le depot : ce fichier est le seul ajout, non commite.

**Deux points bloquent la redaction de `llms.txt` et des offres : voir la section 6, points 1 et 2.**

## 1. Etat constate, page par page

| Page | `<title>` | Description | Canonique | Indexation |
|---|---|---|---|---|
| `index.html` | Ploutos — Le logiciel patrimonial des CGP independants | presente | `https://ploutos-cgp.fr/` (1) | `index, follow` |
| `inscription.html` | Creer un compte Ploutos — Essai gratuit 30 jours | presente | `https://ploutos-cgp.fr/inscription` (1) | indexable (pas de balise `robots`) |
| `cgu.html` | Conditions Generales d'Utilisation — Ploutos | presente | `https://ploutos-cgp.fr/cgu` (1) | indexable |
| `dpa.html` | Accord de traitement des donnees (DPA) — Ploutos | presente | `https://ploutos-cgp.fr/dpa` (1) | indexable |
| `politique-confidentialite.html` | Politique de confidentialite — Ploutos | presente | `https://ploutos-cgp.fr/politique-confidentialite` (1) | indexable |
| `merci.html` | Ploutos — Bienvenue ! Votre abonnement est actif | aucune | aucune | **`noindex` deja present** |
| `merci-contact.html` | Ploutos — Message bien recu | aucune | aucune | **`noindex` deja present** |
| `404.html` | Page introuvable — Ploutos | aucune | aucune | **`noindex` deja present** |
| `maintenance.html` | Maintenance — Ploutos | aucune | aucune | **`noindex` deja present** |

- Point 6 du lot : **rien a corriger**. Les quatre pages techniques sont deja en `noindex` ; chaque page indexable a **une seule** canonique, vers elle-meme.
- `google12df349d6aa6566d.html` : fichier de verification Search Console (une ligne de texte, pas de `<head>`), hors perimetre, intact.
- `lang="fr"` partout. Aucun `hreflang`.
- **Balises de partage** : `og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `twitter:*` presentes sur les cinq pages indexables. **Absents partout** : `og:image:width`, `og:image:height`, `og:locale`, `og:site_name` (point 7 du lot).
- **Donnees structurees** : seul `index.html` en a (un bloc `ld+json` dans le `<head>`, ligne 342, JSON valide). Les quatre autres pages indexables n'en ont aucune.
- **html-validate (regles par defaut), base de depart** : `index.html` 49 erreurs (historiques, les memes qu'a la fin de L3), `maintenance.html` 3, tout le reste 0. La gate S1 s'entend « aucune erreur nouvelle » ; `maintenance.html` n'est pas touchee.

## 2. Robots : noms confirmes a la source (consultes le 11/11/2026)

La regle generale actuelle (`User-agent: *` / `Allow: /` / `Sitemap: https://ploutos-cgp.fr/sitemap.xml`) ne contient **aucun `Disallow`**.

| Nom | Editeur | Page qui le confirme | Role (cite) | Verdict |
|---|---|---|---|---|
| `GPTBot` | OpenAI | `developers.openai.com/api/docs/bots` (`platform.openai.com/docs/bots` y redirige, 301) | entrainement des modeles generatifs | **confirme** |
| `OAI-SearchBot` | OpenAI | idem | « surface websites in search results in ChatGPT's search features » | **confirme** |
| `ChatGPT-User` | OpenAI | idem | actions initiees par l'utilisateur ; « robots.txt rules may not apply » | **confirme** |
| `ClaudeBot` | Anthropic | `support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler` | collecte de contenu pour l'entrainement | **confirme** |
| `Claude-SearchBot` | Anthropic | idem | « improve search result quality for users » | **confirme** |
| `Claude-User` | Anthropic | idem | « supports Claude AI users » (requete d'un utilisateur) | **confirme** |
| `PerplexityBot` | Perplexity | `docs.perplexity.ai/guides/bots` | afficher et lier les sites dans Perplexity, pas d'entrainement ; la page recommande de l'autoriser | **confirme** |
| `Perplexity-User` | Perplexity | idem | « this fetcher generally ignores robots.txt rules » (action de l'utilisateur) | **confirme** |
| `Google-Extended` | Google | `developers.google.com/search/docs/crawling-indexing/google-common-crawlers` | « standalone product token » : Gemini (entrainement et ancrage) ; **« does not impact a site's inclusion in Google Search »** ; **pas d'agent utilisateur HTTP propre** | **confirme** |
| `Applebot-Extended` | Apple | `support.apple.com/en-us/119829` | « secondary user agent », n'explore pas ; entrainement des modeles Apple ; **sans effet sur Search** | **confirme** |
| `Bingbot` | Microsoft | `bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0` | « Bingbot is our standard crawler » (selon le resume de la page dans la recherche) | **non confirme par lecture directe** : voir ci-dessous |

**Bingbot.** La page d'aide Microsoft existe (titre « Which Crawlers Does Bing Use? ») mais son corps ne s'affiche pas en lecture automatique : je n'ai pu en citer aucune phrase moi-meme. Le nom est en revanche etaye par le resume de cette page dans une recherche et par un billet du blog officiel Bing (« If there is no specific set of directives for the bingbot or msnbot user agent, then BingBot will honor the default set of directives »). Au sens strict de la consigne (« tout nom non confirme par sa source est retire »), **Bingbot est a retirer**, sauf decision contraire de votre part (question 4). Il n'a de toute facon pas besoin d'une regle propre : il suit deja le groupe `*`.

**Non retenus** (non demandes, et non documentes comme jetons `robots.txt` sur la page lue) : `OAI-AdsBot` (validation de pages publicitaires, documente par OpenAI) ; `Claude-Agent` (cite par la page Anthropic uniquement comme identifiant de navigateurs heberges, renvoi vers un autre article) ; `anthropic-ai` et `Claude-Web` (absents de la page).

**Portee reelle de ce groupe.** Le groupe `*` autorise deja tout : les nouvelles lignes rendent l'intention explicite mais ne changent le comportement d'aucun robot qui respecte `*`. Deux sont de plus decrits par leur editeur comme pouvant ignorer `robots.txt` (`ChatGPT-User`, `Perplexity-User`). `Google-Extended` et `Applebot-Extended` ne sont que des jetons de controle d'usage, sans effet sur l'indexation classique.

`robots.txt` cible : le groupe `*` inchange, un seul groupe supplementaire (une ligne `User-agent` par nom confirme, puis `Allow: /`), une seule ligne `Sitemap`, aucun `Disallow`.

## 3. FAQ visible / `FAQPage`

**Aucun ecart.** Six questions visibles, six dans la `FAQPage`, questions et reponses identiques mot pour mot (espaces normalises, `&nbsp;` compris, lien e-mail de la Q6 inclus). La `FAQPage` actuelle n'est donc pas a corriger, seulement a conserver telle quelle dans le graphe.

## 4. Image de partage

`og-image.png` : **1 200 x 630** (82 Ko). Rien a signaler ; on ajoute seulement `og:image:width` 1200 et `og:image:height` 630. Les autres images : `icon-192` 192x192, `icon-512` 512x512, `apple-touch-icon` 180x180, `logo.ploutos.png` 251x276.

## 5. Donnees structurees existantes de l'accueil

Un seul bloc, deja en `@graph` : `Organization` (`@id .../#organization`, nom, url, logo), `SoftwareApplication` (nom, categorie, systemes, description, `publisher`, deux `Offer` avec `price` 50 et 500 EUR, **sans** `priceSpecification`, **sans** `url`, **sans** indication de taxe), `FAQPage`. Aucun `WebSite`, aucune note, aucun avis.

A produire (dans le meme `@graph`) :
- **Organization** : `legalName` « EcoPatrimoine Conseil », `address` (6 rue Mirabeau, 66000 Perpignan, FR), `identifier` (RCS Perpignan, 909 388 373), `email` contact@ecopatrimoine-conseil.com, `sameAs` : `https://www.ecopatrimoine-conseil.com` et `https://www.youtube.com/@ecopatrimoineconseil`.
- **WebSite** : `@id .../#website`, nom, url, `inLanguage` fr, `publisher` l'organisation.
- **SoftwareApplication** : `url`, `image` (`og-image.png`), `screenshot` = **les 6 captures affichees sur l'accueil** (`capture-ir`, `-prevoyance`, `-succession`, `-hypotheses`, `-prevoyance-coll`, `-lettre-mission`, avec leur `alt` visible) ; les 4 autres fichiers de `/img/` (`capture-collecte`, `-ifi`, `-parametres`, `-succession-app`) ne sont pas affichees : **non reprises** ; `featureList` reprise des textes affiches (les 6 cartes « Calculs fiscaux automatises », « Documents PDF professionnels », « Gestion multi-clients », « Comparateur d'hypotheses », « Identite visuelle complete », « Donnees chez vous — RGPD », et les lignes des cartes de prix : « Lettre de mission reglementaire ACPR », « Mode hors-ligne 72h », « Windows + Web + iPad + Android », etc.) ; `inLanguage` fr ; deux `Offer` avec `url` (les liens de souscription affiches : les deux liens `buy.stripe.com` des boutons « S'abonner »), `priceSpecification`.
- **FAQPage** : inchangee (section 3).
- **Pages juridiques** : `WebPage` (nom = titre de page, description = description de la page, `dateModified` = la date de version affichee, soit 2026-09-01, `isPartOf` le `WebSite`) et `BreadcrumbList` Accueil › page.

## 6. Points a trancher avant de commencer

1. **Prix hors taxes ou toutes taxes comprises : vos documents se contredisent.** Le prompt S1 et le cadrage (« offres hors taxes ») disent **HT** (`llms.txt` : « 50 € HT par mois ou 500 € HT par an » ; offres avec `valueAddedTaxIncluded: false`). L'**article 6 des CGU**, seule mention de taxe sur tout le site, dit que les prix « affiches sur ploutos-cgp.fr [...] sont exprimes **toutes taxes comprises** » ; l'accueil, lui, affiche « 50€ /mois » et « 500€ /an » sans aucune mention HT ni TTC. Un `valueAddedTaxIncluded: false` contredirait donc un texte contractuel publie. Je ne tranche pas : le vrai statut des prix Stripe est de votre cote. Options :
   - **(a) TTC**, comme les CGU : `llms.txt` « 50 € TTC par mois ou 500 € TTC par an », `valueAddedTaxIncluded: true`.
   - **(b) HT** : il faut alors corriger l'article 6 des CGU et afficher « HT » sur l'accueil, deux changements de texte visible **hors du perimetre de S1** (« aucun texte visible ne change »), a faire dans un lot a part.
   - **(c) neutre, pour S1** : `llms.txt` « 50 € par mois ou 500 € par an », et on **omet** `valueAddedTaxIncluded` jusqu'a ce que (a) ou (b) soit fait. C'est la seule option qui respecte a la fois la consigne « rien d'absent de la page » et les CGU telles qu'elles sont. **C'est celle que je ferai par defaut** si vous ne dites rien, mais la phrase `llms.txt` s'ecarte alors du texte donne.
2. **`llms.txt` « repris tel quel » : plusieurs affirmations ne sont pas encore affichees sur l'accueil actuel.** Elles decrivent le nouvel accueil. Constat dans le texte visible de `index.html` : **absents** « HT » (voir 1), « bilan », « projection » (l'accueil dit « projette les revenus »), « versement », « entree en relation », « recueil », « document de conseil » (seule la « lettre de mission » est affichee), « format JSON » (nulle part sur le site ; les CGU disent seulement que les donnees sont exportables), « courtiers » (CGU article 3 seulement) ; « Perpignan » figure dans les CGU et la politique mais pas sur l'accueil. **Presents** : essai de 30 jours sans carte, un seul plan, prevoyance (regime obligatoire, conventions collectives, statuts TNS, audit d'une couverture collective), donation / vente / demembrement, couleurs du cabinet, Windows / web / iPad / iPhone / Android, 72 h hors ligne, Irlande, local-first, CGP en exercice. Ce sont des faits produit que vous connaissez ; la garde « rien d'absent de la page » vise les donnees structurees, pas `llms.txt`. **Je le reprends tel quel** (sauf la ligne de prix, point 1) et je liste ces ecarts au STOP final. Dites-moi si vous preferez qu'il attende le nouvel accueil.
3. **Cache `immutable` d'un an sur `/img/*`.** Les captures ne portent pas d'empreinte dans leur nom (`capture-ir.png`) : si vous en remplacez une, les visiteurs deja venus garderont l'ancienne jusqu'a un an. Les polices (`/fonts/*`) ne bougent pas, elles sont sans risque. Options : **(i)** tel que demande, avec la regle de renommer une capture a chaque changement (`capture-ir-2.png`) ; **(ii)** `/fonts/*` immutable d'un an et `/img/*` a **une semaine** (`max-age=604800`). Je recommande (ii) tant que le nommage n'est pas fait ; (i) si vous tenez la regle.
4. **Bingbot** (section 2) : retirer (lettre de la consigne) ou garder (documente par Microsoft, mais je n'ai pas pu lire la page moi-meme) ?
5. **Documents a versionner.** Le prompt S1 et `SEO_CADRAGE_11nov2026.md` sont sur le disque mais **non suivis** par git (comme l'etait le prompt R1). Proposition : un commit « docs » de tete avec `PROMPT_SITE_S1_...md`, `SEO_CADRAGE_11nov2026.md` et ce fichier ; `FICHE_COMPARATEURS` et les maquettes `site_vitrine_v3*` restent non suivies.

## 7. A savoir (rien a decider)

- **`lastmod` des pages juridiques.** La formule imposee (`git log -1 --format=%cs`) donnerait aujourd'hui `2026-11-11` pour les CGU, le DPA et la politique (a cause du lot R1, presentation seule), alors que leur `dateModified` structuree sera la date de version affichee, `2026-09-01`. Les deux sont exacts pour ce qu'ils mesurent ; je les laisse tels que formules. `index.html` et `inscription.html` : `2026-11-07`.
- **Le plan du site doit etre regenere apres les commits de pages**, car il lit la date du dernier commit de chaque fichier : le dernier commit du lot sera donc le `sitemap.xml`.
- **Adresse et RCS de l'`Organization`** : repris de l'article 1 des CGU comme demande ; ils figurent sur le site (CGU) mais pas sur l'accueil lui-meme.
- **Chaine YouTube** : elle redirige vers l'ecran de consentement Google en lecture automatique, donc non verifiable de l'exterieur ; le lien et `https://www.ecopatrimoine-conseil.com` (200, « Ecopatrimoine Conseil | La revolution de votre patrimoine ») sont tous deux affiches sur l'accueil (section « A propos »), ce qui satisfait la garde.
- `scripts/` n'existe pas encore ; `_redirects` aura `/scripts/*  /404.html  404!` ; `netlify.toml` passera a `rm -rf docs scripts`.

## 8. Plan de realisation apres GO

Commits ASCII, un fichier par commit, gate avant chaque commit (comme R1) :
1. docs de tete (voir question 5) ; 2. `robots.txt` ; 3. `llms.txt` ; 4. `index.html` (un seul `@graph` complete, balises de partage) ; 5. `cgu.html` ; 6. `dpa.html` ; 7. `politique-confidentialite.html` ; 8. `inscription.html` (balises de partage seules) ; 9. `_headers` (cache, sans toucher aux CSP) ; 10. `_redirects` ; 11. `netlify.toml` ; 12. `scripts/sitemap.mjs` ; 13. `scripts/verif-seo.mjs` ; 14. `sitemap.xml` regenere en dernier.

**`scripts/sitemap.mjs`** : liste fixe des cinq pages indexables ; l'URL de chaque entree est lue dans sa canonique (plus de table a tenir) ; `lastmod` par `git log -1 --format=%cs` ; ni `changefreq` ni `priority` ; ecrit `sitemap.xml`.

**`scripts/verif-seo.mjs`** (code de sortie non nul au premier ecart) : chaque `ld+json` se lit par `JSON.parse` ; la `FAQPage` est identique au texte visible ; chaque page indexable est dans `sitemap.xml` et aucune page `noindex` n'y est ; `sitemap.xml` est identique a la regeneration ; `llms.txt` existe et ses liens sont dans le plan du site ; une seule canonique par page indexable, vers elle-meme ; `robots.txt` : un seul `Sitemap`, aucun `Disallow` ; balises `og:image:width/height`, `og:locale`, `og:site_name` sur les pages indexables.

**Controle que j'ajoute a la gate** (non demande) : le corps de chaque page (de `<body` a la fin) est **octet pour octet identique** a celui de `3c23f09`, ce qui prouve que « aucun texte visible ne change » et que seuls les `<head>` bougent.

Gate (4) du prompt : `rm -rf docs scripts` dans une copie du depot, verification que ni `docs/` ni `scripts/` ne restent.

Ce que S1 ne touche pas : `maintenance.html`, `merci*.html`, `404.html` (deja en `noindex`), `ploutos-doc.*`, `ploutos-carte.css`, `sw.js`, les politiques de securite de `_headers`.

## 9. Decisions du GO (David, 11/11/2026)

1. **Prix : option (c), neutre.** « 50 € par mois ou 500 € par an », aucune mention HT ni TTC, pas de `valueAddedTaxIncluded`, dans `llms.txt` comme dans les offres. Le regime de taxe sera tranche a part ; un lot court reprendra ces mentions (et, selon la reponse, l'article 6 des CGU).
2. **`llms.txt` repris tel quel hors prix** (il decrit la version qui sera en ligne avec la v3, puisque rien ne sort avant), avec une seule autre modification : les courtiers retires (premiere phrase : « ... pour les conseillers en gestion de patrimoine (CGP) independants. » ; ligne Public : « CGP independants, cabinets de conseil en gestion de patrimoine. »). Les affirmations absentes de l'accueil actuel sont a lister au STOP final.
3. **Cache** : `/fonts/*` un an `immutable` ; `/img/*` une semaine (`max-age=604800`), sans `immutable`.
4. **Bingbot retire** (source non lue directement) ; le groupe `*` le couvre.
5. **Commit « docs » de tete** : `SEO_CADRAGE_11nov2026.md`, `PROMPT_SITE_S1_...md` et ce fichier. `FICHE_COMPARATEURS` et les maquettes `site_vitrine_v3*` restent non suivies.
6. Constats acceptes, dont `lastmod` 2026-11-11 et `dateModified` 2026-09-01 pour les pages juridiques, et le controle ajoute a la gate (corps des pages identique a `3c23f09`).
