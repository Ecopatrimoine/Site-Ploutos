# Prompt Claude Code — Lot S1 (site) : le socle de référencement, moteurs de recherche et moteurs à intelligence artificielle

**Modèle : Sonnet.** **Dépôt : `Ecopatrimoine/Site-Ploutos`**, **branche `refonte-site`, après le lot R1 poussé.** Commits ASCII fichier par fichier, pas de `git add .`, pas de `Co-Authored-By`, pas de push sans GO de David. `main` n'est pas touchée.

Référence, déjà dans le dépôt : `docs/maquettes/SEO_CADRAGE_11nov2026.md` (§2 A « Technique »). Ce prompt sous `docs/maquettes/PROMPT_SITE_S1_SOCLE_REFERENCEMENT_11nov2026.md`. Décisions de David du 11/11/2026 : « ok pour tout » (robots des moteurs à intelligence artificielle autorisés, wiki publié en partie, calculs en accès libre, pages de comparaison — ces trois derniers sont des lots ultérieurs, hors S1).

## Périmètre
Les pages qui existent aujourd'hui sur `refonte-site` : `index.html`, `inscription.html`, `cgu.html`, `dpa.html`, `politique-confidentialite.html`, plus `merci.html`, `merci-contact.html`, `404.html`, `maintenance.html` pour leur statut d'indexation. Le nouvel accueil (maquette 41f) et les pages nouvelles sont hors lot : S1 pose le socle sur lequel elles viendront.

## Ce que le lot livre
1. **`robots.txt`** : la règle générale actuelle conservée, plus un groupe explicite `Allow: /` pour les robots des moteurs à intelligence artificielle et la ligne `Sitemap`. Liste de départ à vérifier à la recon sur la documentation de chaque éditeur (noms exacts, pas de nom inventé) : GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Bingbot. Tout nom non confirmé par sa source est retiré et signalé au STOP.
2. **`llms.txt`** à la racine, texte ci-dessous repris tel quel (Markdown, UTF-8) :

```
# Ploutos

> Ploutos est un logiciel de gestion de patrimoine pour les conseillers en gestion de patrimoine (CGP) indépendants et les courtiers. Il couvre le parcours complet du conseil : collecte des informations du client, bilan patrimonial, scénarios, documents réglementaires. Il est édité par EcoPatrimoine Conseil (Perpignan, France) et conçu par un CGP en exercice.

## L'essentiel
- Public : CGP indépendants, cabinets de conseil en gestion de patrimoine, courtiers en assurance.
- Prix : 50 € HT par mois ou 500 € HT par an, un seul plan tout compris. Essai gratuit de 30 jours, sans carte bancaire.
- Fonctions : collecte patrimoniale guidée ; bilan (patrimoine, succession et assurance-vie, prévoyance, impôt sur le revenu et IFI, projection) ; scénarios comparés à la situation actuelle (donation, démembrement, vente, versement) ; prévoyance (régimes obligatoires, conventions collectives, indépendants, audit d'une prévoyance collective d'entreprise) ; documents réglementaires (entrée en relation, lettre de mission, recueil, document de conseil) aux couleurs du cabinet.
- Appareils : application Windows, navigateur web, iPad et iPhone, Android. Utilisable 72 heures hors ligne.
- Données : enregistrées d'abord sur l'appareil du conseiller, synchronisation chiffrée, hébergement en Union européenne (Irlande). Export des dossiers au format JSON.
- Langue : français. Fiscalité et réglementation : France.

## Pages
- [Accueil](https://ploutos-cgp.fr/) : présentation, fonctions, tarifs, questions fréquentes.
- [Créer un compte d'essai](https://ploutos-cgp.fr/inscription)
- [Conditions générales d'utilisation](https://ploutos-cgp.fr/cgu)
- [Accord de traitement des données](https://ploutos-cgp.fr/dpa)
- [Politique de confidentialité](https://ploutos-cgp.fr/politique-confidentialite)

## Contact
contact@ecopatrimoine-conseil.com
```

3. **Plan du site** : script `scripts/sitemap.mjs` (Node, sans dépendance) qui écrit `sitemap.xml` à partir de la liste des pages indexables, `lastmod` = date du dernier commit qui a modifié le fichier (`git log -1 --format=%cs -- <fichier>`), sans `changefreq` ni `priority`. Le fichier généré est commité (Netlify n'exécute pas le script). `scripts/` n'est pas servi : l'ajouter à la commande de build (`rm -rf docs scripts`) et à la règle 404 de `_redirects`, sur le modèle de `docs/`.
4. **Données structurées de l'accueil** (`index.html`, un seul bloc `@graph`) : `Organization` complétée (`legalName`, adresse et immatriculation telles qu'elles figurent à l'article 1 des CGU, `sameAs` : `https://www.ecopatrimoine-conseil.com` et `https://www.youtube.com/@ecopatrimoineconseil`, `email`) ; nœud `WebSite` ; `SoftwareApplication` complétée (`url`, `image`, `screenshot` avec les captures existantes de `/img/`, `featureList` reprise des fonctions affichées sur la page, `inLanguage`, offres avec `priceSpecification` et `valueAddedTaxIncluded: false`, `url` de chaque offre) ; `FAQPage` strictement identique aux questions et réponses visibles. **Aucune note, aucun avis, aucun nombre d'utilisateurs** : rien qui ne soit affiché sur la page.
5. **Données structurées des trois pages juridiques** : `WebPage` (nom, description, `dateModified` = la date de version affichée, `isPartOf` le `WebSite`) et `BreadcrumbList` (Accueil › page).
6. **Statut d'indexation** : `merci.html`, `merci-contact.html`, `404.html`, `maintenance.html` en `noindex` (constater, corriger si absent) ; `inscription.html` indexable avec sa canonique ; vérifier qu'aucune page indexable n'a deux canoniques ni une canonique vers une autre page.
7. **Image de partage** : constater les dimensions d'`og-image.png` ; si elle ne fait pas 1 200 × 630, le signaler au STOP (on ne la refait pas dans ce lot : elle viendra avec le nouvel accueil) ; ajouter `og:image:width`, `og:image:height`, `og:locale` (`fr_FR`) et `og:site_name` sur les pages indexables.
8. **Cache** dans `_headers` : `/fonts/*` et `/img/*` en `Cache-Control: public, max-age=31536000, immutable` ; ne rien changer aux politiques de sécurité existantes.

## 0. Recon lecture seule, puis STOP court
Lire les `<head>` de toutes les pages, `robots.txt`, `sitemap.xml`, `_headers`, `_redirects`, `netlify.toml`, le bloc de données structurées d'`index.html`, la FAQ visible. Vérifier les noms de robots à la source. Livrable `docs/maquettes/S1_CONFRONTATION_REFERENCEMENT.md` : l'état constaté page par page (titre, description, canonique, indexation), la liste confirmée des robots avec l'adresse de la documentation qui confirme chaque nom, les écarts entre la FAQ visible et la `FAQPage` actuelle, les dimensions de l'image de partage. Puis STOP et attendre le GO.

## Gate du dépôt (à chaque commit)
(1) `npx --yes html-validate` sur toutes les pages touchées, sans erreur nouvelle. (2) Script `scripts/verif-seo.mjs` : chaque bloc `application/ld+json` se lit par `JSON.parse` ; la `FAQPage` est identique au texte visible (question et réponse, espaces normalisés) ; chaque page indexable est dans `sitemap.xml` et aucune page `noindex` n'y est ; `sitemap.xml` est identique à ce que régénère `scripts/sitemap.mjs` ; `llms.txt` existe et ses liens pointent vers des pages du plan du site. (3) `robots.txt` : un seul `Sitemap`, aucune ligne `Disallow` nouvelle. (4) `rm -rf docs scripts` : vérifier en local que ni `docs/` ni `scripts/` ne restent dans la copie publiée.

## Garde-fous
- Aucun texte visible ne change (ni l'accueil, ni les pages juridiques) : le lot ne touche que les `<head>`, les blocs de données structurées et les fichiers de racine.
- Aucune donnée structurée qui affirme quelque chose d'absent de la page.
- Aucune ressource externe nouvelle.
- Pas de commit tant que la gate n'est pas verte.

## Livraison
Récap demande vs fait point par point, résultats de gate, puis STOP. Recette par David : ouvrir `/robots.txt`, `/llms.txt`, `/sitemap.xml` en local. Push sur `refonte-site` après GO. Actions de David après la mise en ligne (hors dépôt) : déclarer le site dans Bing Webmaster Tools, soumettre le plan du site dans Google Search Console et dans Bing. Lots suivants (cadrage §3) : S2 pages de fonction et de service avec le nouvel accueil, S3 savoir publié, S4 calculateurs en accès libre, pages de comparaison.
