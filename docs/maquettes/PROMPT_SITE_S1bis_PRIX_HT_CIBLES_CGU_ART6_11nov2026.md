# Prompt Claude Code — Lot S1-bis (site) : prix hors taxes et franchise de TVA, cibles élargies, article 6 des CGU

**Modèle : Sonnet.** **Dépôt : `Ecopatrimoine/Site-Ploutos`, branche `refonte-site`, tête `1bf967e` (S1 poussé).** Commits ASCII fichier par fichier, pas de `git add .`, pas de `Co-Authored-By`, pas de push sans GO de David. `main` n'est pas touchée : tout sort avec la v3.

Ce prompt sous `docs/maquettes/PROMPT_SITE_S1bis_PRIX_HT_CIBLES_CGU_ART6_11nov2026.md` (à commiter en tête, commit « docs » à part, avec la confrontation). Il clôt le point laissé ouvert par S1 (prix neutre, option c).

## Décisions de David (11/11/2026)
1. **Les prix sont hors taxes.** EcoPatrimoine Conseil est aujourd'hui en franchise en base de TVA : la TVA n'est pas facturée. Affichage retenu : le prix avec « HT », et la mention « TVA non applicable, art. 293 B du CGI » en petit à proximité.
2. **L'article 6 des CGU est corrigé** (il dit aujourd'hui « exprimés toutes taxes comprises », ce qui contredit la décision 1).
3. **Cibles** : Ploutos s'adresse aux conseillers en gestion de patrimoine (CGP), aux conseillers en investissements financiers (CIF), aux courtiers en assurance, aux agents d'assurance, aux sociétés d'assurance et aux agents immobiliers.
4. **Une alerte pour la sortie de franchise** : le jour où l'Éditeur devient redevable de la TVA, rien ne doit être oublié. Le lot livre la liste de contrôle correspondante.

## Ce que le lot livre

### A. Article 6 des CGU (`cgu.html`, et le brouillon `docs/CGU_v2_Ploutos.md` au même endroit)
Remplacer, dans la première phrase de l'article 6, les mots « exprimés toutes taxes comprises. » par, mot pour mot :

> exprimés hors taxes. À la date des présentes, l'Éditeur bénéficie de la franchise en base de TVA : la TVA n'est pas applicable (article 293 B du Code général des impôts). Si l'Éditeur devient redevable de la TVA, celle-ci s'ajoute aux prix au taux en vigueur, y compris pour les abonnements en cours et pour ceux portant la mention « tarif bloqué », dont le prix hors taxes reste maintenu.

Espaces insécables à l'intérieur des guillemets, comme le reste de la page depuis R1-bis. Aucun autre mot des CGU ne change.

**Date de version.** Le texte change, donc la date de version aussi, et elle sera celle de la mise en ligne (inconnue aujourd'hui). La ligne de version des CGU devient « Version en vigueur au [date de mise en ligne] · EcoPatrimoine Conseil » et son élément porte l'attribut `data-version-provisoire`. `dateModified` des données structurées des CGU suit la même règle (valeur provisoire repérable). `scripts/verif-seo.mjs` reçoit un mode `--release` qui **échoue** tant que cet attribut ou cette valeur provisoire existent ; en mode normal, c'est un avertissement affiché, pas un échec. Le DPA et la politique de confidentialité gardent leur date.

### B. Prix sur l'accueil actuel (`index.html`, section Tarifs seulement)
- « 50€ /mois » devient « 50 € HT /mois » ; « 500€ /an » devient « 500 € HT /an » ; « soit 41,67€/mois — 2 mois offerts » devient « soit 41,67 € HT/mois — 2 mois offerts ».
- Sous les deux cartes, une ligne en petit : « Prix hors taxes. TVA non applicable, art. 293 B du CGI. » (style des notes existantes de la section, contraste ≥ 4,5).
- Les libellés des boutons d'abonnement et les liens Stripe ne changent pas.

### C. Cibles
- `index.html`, section « À propos » : un paragraphe ajouté après le premier paragraphe de texte, mot pour mot : « Ploutos s'adresse aux conseillers en gestion de patrimoine (CGP), aux conseillers en investissements financiers (CIF), aux courtiers et agents d'assurance, aux sociétés d'assurance et aux agents immobiliers. »
- `index.html`, `<head>` : titre « Ploutos — Logiciel de gestion de patrimoine pour CGP, CIF, courtiers et agents d'assurance » ; description « Ploutos, le logiciel de gestion de patrimoine des CGP, CIF, courtiers et agents d'assurance : bilan patrimonial, succession, prévoyance, documents réglementaires. Essai gratuit 30 jours. » ; `og:title`, `og:description`, `twitter:title`, `twitter:description` alignés sur ces deux textes.
- Rien d'autre ne change dans le texte visible de l'accueil (le nouvel accueil, maquette 41, viendra dans son propre lot).

### D. `llms.txt`
- Première phrase : « …pour les conseillers en gestion de patrimoine (CGP), les conseillers en investissements financiers (CIF), les courtiers et agents d'assurance, les sociétés d'assurance et les agents immobiliers. »
- Ligne Public : « CGP indépendants et cabinets de conseil en gestion de patrimoine, CIF, courtiers en assurance, agents d'assurance, sociétés d'assurance, agents immobiliers. »
- Ligne Prix : « 50 € HT par mois ou 500 € HT par an, un seul plan tout compris (TVA non applicable, art. 293 B du CGI). Essai gratuit de 30 jours, sans carte bancaire. »

### E. Données structurées de l'accueil
- Offres : `priceSpecification` avec `valueAddedTaxIncluded: false`, prix inchangés (50 et 500).
- `SoftwareApplication` : propriété `audience` (`Audience`, `audienceType` reprenant la phrase des cibles affichée en C).
- Toujours aucune note, aucun avis.

### F. Alerte de sortie de franchise
Fichier `docs/SORTIE_FRANCHISE_TVA.md` (versionné, jamais servi) : la liste de tout ce qui doit changer le jour où l'Éditeur devient redevable de la TVA, avec pour chaque point le fichier et la ligne : la mention « TVA non applicable, art. 293 B du CGI » de l'accueil ; la ligne Prix de `llms.txt` ; la deuxième phrase ajoutée à l'article 6 des CGU (et donc une nouvelle version des CGU, notifiée selon leur article 11) ; les données structurées ; hors dépôt, à la charge de David : réglage de la taxe dans Stripe, mentions des factures, information des abonnés. `scripts/verif-seo.mjs` contrôle que ces mentions sont **cohérentes entre elles** : soit la mention de franchise est présente partout (accueil, `llms.txt`, article 6), soit nulle part ; un état mixte fait échouer la gate.

## 0. Recon lecture seule, puis STOP court
Lire `cgu.html` (article 6 et ligne de version), `docs/CGU_v2_Ploutos.md`, la section Tarifs et la section « À propos » d'`index.html`, son `<head>` et son bloc de données structurées, `llms.txt`, `scripts/verif-seo.mjs`, `docs/maquettes/texte_identique.mjs`. Livrable `docs/maquettes/S1bis_CONFRONTATION.md` : les emplacements exacts de chaque modification, toute autre mention de prix ou de taxe trouvée sur le site (grep non tronqué de « € », « TTC », « HT », « taxe », « TVA » sur toutes les pages), la façon dont les deux gates de texte seront rebasées. Puis STOP et attendre le GO.

## Gate du dépôt
(1) `npx --yes html-validate` : aucune erreur nouvelle. (2) **Texte juridique** : `texte_identique.mjs` rebasé sur `1bf967e` ; la seule différence admise dans `cgu.html` est le remplacement de l'article 6 décrit en A et la ligne de version ; DPA et politique identiques. (3) **Texte visible de l'accueil** : le contrôle de S1 rebasé sur `1bf967e` ; les seules différences admises sont celles de B et C, déclarées une à une dans le script. (4) `scripts/verif-seo.mjs` vert en mode normal, **rouge en mode `--release`** (à cause de la date provisoire : le montrer dans le récap). (5) Cohérence de la mention de franchise (F). (6) Contraste de la nouvelle ligne de la section Tarifs. (7) `sitemap.xml` régénéré en dernier.

## Garde-fous
- Aucun mot des CGU hors article 6 et ligne de version ; aucun mot du DPA ni de la politique.
- Aucun changement de prix : seuls « HT » et la mention s'ajoutent.
- Aucune mention de taxe ailleurs que là où ce prompt le dit ; toute autre occurrence trouvée à la recon est listée, pas corrigée.
- Pas de commit tant que la gate n'est pas verte.

## Livraison
Récap demande vs fait point par point, résultats de gate (dont l'échec attendu du mode `--release`), puis STOP. Recette par David : section Tarifs et « À propos » de l'accueil, article 6 des CGU, `/llms.txt`. Push sur `refonte-site` après GO. À la mise en ligne de la v3 : poser la date de version des CGU, relancer `verif-seo.mjs --release`.
