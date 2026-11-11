# Lot S1-bis - confrontation (recon, lecture seule)

Date : 11/11/2026. Depot `Ecopatrimoine/Site-Ploutos`, branche `refonte-site`, tete `1bf967e` = `origin/refonte-site` apres `git fetch` : **S1 est pousse**.
Lu : `cgu.html` (article 6, ligne de version, JSON-LD), `docs/CGU_v2_Ploutos.md`, `index.html` (section Tarifs, section « A propos », `<head>`, bloc `ld+json`, CSS des prix), `llms.txt`, `scripts/verif-seo.mjs`, `docs/maquettes/texte_identique.mjs`, `netlify/functions/submission-created.mjs`, `merci.html`.
Rien n'a ete modifie dans le depot : ce fichier est le seul ajout. Le prompt S1-bis est sur le disque mais non suivi : il part dans le commit « docs » de tete avec ce fichier.

## 1. Emplacements exacts de chaque modification

### A. Article 6 des CGU
| Fichier | Ligne | Etat actuel | Modification |
|---|---|---|---|
| `cgu.html` | 141 | `...aux prix affichés sur ploutos-cgp.fr au jour de la souscription, exprimés toutes taxes comprises. Le paiement est opéré...` | « exprimés toutes taxes comprises. » remplace par le texte du prompt, mot pour mot ; guillemets `«&nbsp;tarif bloqué&nbsp;»` (le reste de la phrase 5 de l'article contient deja la meme forme) |
| `cgu.html` | 86 | `<p class="ver">Version en vigueur au 1er septembre 2026 · EcoPatrimoine Conseil</p>` | `<p class="ver" data-version-provisoire>Version en vigueur au [date de mise en ligne] · EcoPatrimoine Conseil</p>` |
| `cgu.html` | 37 | `"dateModified": "2026-09-01"` | valeur provisoire reperable (question 3) |
| `docs/CGU_v2_Ploutos.md` | 25 | meme phrase, meme formulation | meme remplacement |
| `docs/CGU_v2_Ploutos.md` | 2 | `*Projet v2 — pour validation. Version en vigueur au [DATE DE MISE EN LIGNE].*` | **inchangee** : le brouillon porte deja une date provisoire |

Le brouillon n'est **pas un miroir** de la page : il garde `[CAPITAL SOCIAL À CONFIRMER]`, `[GÉRANT — voir question en cours]` et un autre e-mail de contact (`contact@ploutos-cgp.fr`). Seul l'article 6 y est touche, comme demande. Ses guillemets sont des espaces ordinaires (markdown) : j'y garde la meme convention (question 6).

### B. Prix de l'accueil (`index.html`, section Tarifs, lignes 734-782)
| Ligne | Actuel | Apres |
|---|---|---|
| 745-746 | `<span class="price-big">50€</span>` / `<span class="price-period">/mois</span>` | `50&nbsp;€` / `HT /mois` -> texte affiche « 50 € HT /mois » |
| 765-766 | `<span class="price-big" style="color:white;">500€</span>` / `<span class="price-period">/an</span>` | `500&nbsp;€` / `HT /an` -> « 500 € HT /an » |
| 768 | `soit 41,67€/mois — 2 mois offerts` | `soit 41,67&nbsp;€ HT/mois — 2 mois offerts` |
| apres 779 (`  </div>` qui ferme `.pricing-cards`) | (rien) | une ligne en petit : « Prix hors taxes. TVA non applicable, art. 293 B du CGI. » |
| 759 et 777 | `S'abonner — 50 €/mois →` et `S'abonner — 500€/an →` | **inchanges** (consigne) : voir observation 4 |

Le « HT » reste dans `.price-period` (deja petit, deja teinte pour la carte vedette) : aucune regle de mise en page nouvelle pour les prix.

### C. Cibles
| Emplacement | Modification |
|---|---|
| `index.html` ligne 6 | `<title>` -> « Ploutos — Logiciel de gestion de patrimoine pour CGP, CIF, courtiers et agents d'assurance » |
| ligne 7 | `description` -> texte du prompt |
| lignes 16, 17, 24, 25 | `og:title`, `og:description`, `twitter:title`, `twitter:description` alignes sur ces deux textes (aujourd'hui `og:description` et `twitter:description` sont une version courte differente de la `description`) |
| apres la ligne 822 | un paragraphe : « Ploutos s'adresse aux conseillers en gestion de patrimoine (CGP), aux conseillers en investissements financiers (CIF), aux courtiers et agents d'assurance, aux sociétés d'assurance et aux agents immobiliers. » (question 2 sur l'emplacement) |

### D. `llms.txt`
Ligne 3 (premiere phrase), ligne 6 (Public), ligne 7 (Prix) : remplacees par les textes du prompt. `courtiers` y revient, volontairement.

### E. Donnees structurees de l'accueil (bloc `ld+json`, lignes 346-538)
- Offres (lignes 461 et 474) : `priceSpecification` complete avec `"valueAddedTaxIncluded": false` ; prix 50 et 500 inchanges.
- `SoftwareApplication` (ligne 386) : propriete `audience` ajoutee (question 4).

### F. Alerte de sortie de franchise
`docs/SORTIE_FRANCHISE_TVA.md` (nouveau) ; controle de coherence dans `scripts/verif-seo.mjs`.

## 2. Autres mentions de prix ou de taxe : grep non tronque

Motif `€ | TTC | HT | taxe | TVA` (insensible a la casse, mots entiers pour TTC/HT/TVA) sur tous les fichiers suivis hors `docs/maquettes`, images et polices ; puis `euro | prix | tarif | /mois | /an | mensuel | annuel`.

| Fichier : ligne | Occurrence | Prix ou taxe ? |
|---|---|---|
| `cgu.html:141` | « exprimés toutes taxes comprises » | **oui : la seule mention de taxe du site** (corrigee en A) |
| `docs/CGU_v2_Ploutos.md:25` | idem | oui (corrigee en A) |
| `index.html:745, 765` | `50€`, `500€` | oui (B) |
| `index.html:759, 777` | `S'abonner — 50 €/mois →`, `S'abonner — 500€/an →` | oui, **non modifiees** (consigne) |
| `index.html:768` | `soit 41,67€/mois` | oui (B) |
| `llms.txt:7` | `50 € par mois ou 500 € par an` | oui (D) |
| `cgu.html:123`, `politique-confidentialite.html:117`, `docs/CGU_v2_Ploutos.md:7`, `docs/POLITIQUE_CONFIDENTIALITE_v2_Ploutos.md:5` | « capital de 1 000 € » / « [CAPITAL SOCIAL À CONFIRMER] € » | non : capital social |
| `index.html:457, 470` et `merci.html:55` | « Plan Solo — Mensuel / Annuel » | noms de plans, aucun montant |

**Aucune occurrence** de `TVA`, `TTC` ou `HT` nulle part ailleurs, ni dans `netlify/functions/submission-created.mjs`, `merci*.html`, `maintenance.html`, `404.html`, `inscription.html`, `dpa.html`, `politique-confidentialite.html`. Pas de mention de prix dans les donnees structurees autre que `price` 50 et 500 (S1).

## 3. Constats qui demandent votre avis (a trancher avec le GO)

1. **Contraste de la ligne sous les cartes : la consigne ne peut pas etre tenue a la lettre.** Elle demande « le style des notes existantes de la section, contraste >= 4,5 ». Or la couleur de ces notes, `--muted` #6B7280, sur le fond de la section, `--cream2` #F5F0E8, donne **4,26:1** : sous le seuil. Les notes existantes (« Une question avant de vous lancer ? ») sont donc elles-memes sous 4,5 ; je ne les touche pas (garde-fou). Pour la nouvelle ligne, je propose une classe dediee de meme taille, avec `#4D5D74` (la couleur de texte attenue du site, **5,91:1**), un peu plus fonce que ses voisines. Mesures : `#6B7280`/blanc (carte) 4,83 ; navy/`--cream2` 14,91.
2. **Emplacement du paragraphe des cibles.** « Apres le premier paragraphe de texte » : la section « A propos » commence par `<p class="section-sub">` (ligne 822, « Face a l'absence d'outils... ») puis un second paragraphe a style en ligne (ligne 823, « Né du constat... »). **Defaut : juste apres la ligne 822**, avant « Né du constat ». Dites-moi si vous le voulez apres la 823. Le nouveau paragraphe reprend le style du 823 **par une classe CSS** (pas de `style=`), pour ne pas ajouter d'erreur `no-inline-style` : la gate (1) exige « aucune erreur nouvelle » et l'accueil est a 49 erreurs historiques.
3. **Valeur provisoire de `dateModified`.** Une valeur ISO impossible a confondre avec une vraie date : **`9999-12-31`** (JSON-LD toujours lisible, grep facile, `--release` la refuse). Le texte visible de la ligne de version porte deja `[date de mise en ligne]`.
4. **`audience`.** Defaut : un seul noeud `Audience` dont `audienceType` est **la phrase affichee en C, telle quelle** (« Ploutos s'adresse aux ... agents immobiliers. »), ce qui permet a la gate de la verifier mot pour mot dans le texte visible. Variante : cinq noeuds (un par cible), chacun sous-chaine exacte de cette phrase ; plus propre pour un lecteur automatique, moins fidele a « la phrase ». Je prends le defaut sauf avis contraire.
5. **Ligne de version du DPA et de la politique** : inchangees, comme demande. Le DPA est pourtant une annexe qui « fait partie integrante » des CGU : a garder en tete pour la mise en ligne.
6. **Guillemets du brouillon `.md`** : espaces ordinaires (comme tout le fichier), `&nbsp;` dans la page HTML.

## 4. Observations (rien n'est corrige, comme le veulent les garde-fous)

1. **Article 3 des CGU** liste les utilisateurs vises : « conseillers en gestion de patrimoine, courtiers, experts-comptables, professions du chiffre et du droit et assimilés ». La nouvelle liste de cibles (CIF, agents d'assurance, sociétés d'assurance, agents immobiliers) n'y figure pas, et inversement. L'**article 2** dit « destiné aux professionnels du conseil en gestion de patrimoine ». Aucun mot des CGU hors article 6 ne change dans ce lot ; a reprendre dans une version des textes.
2. **L'accueil reste centre sur les CGP** hors « A propos » : bandeau « Logiciel CGP indépendants » (ligne 566), « Un CGP a créé l'outil qu'il voulait » (821), « conçu par un CGP en exercice, pour les CGP indépendants » (822 et 828), « Taillé pour les indépendants / cabinet solo » (836), « Rejoignez les premiers CGP » (871). Rien d'autre ne change dans le texte visible (le nouvel accueil viendra dans son lot).
3. **Longueur du titre et de la description** : le nouveau titre fait 90 caracteres et la description 186 ; les moteurs en affichent habituellement 60 et 155 environ, le reste est coupe. Texte repris mot pour mot comme demande.
4. **Prix sans « HT » restants sur l'accueil** : les deux boutons « S'abonner — 50 €/mois → » et « — 500€/an → » (consigne : inchanges). Sur la meme section, le prix des cartes dit « HT », celui des boutons non.
5. **Article 6 : tension possible dans le texte demande.** La nouvelle phrase ajoute la TVA « y compris pour les abonnements en cours et pour ceux portant la mention tarif bloque », alors que la phrase suivante de l'article dit que toute evolution des tarifs est notifiee 30 jours avant et ne s'applique qu'aux periodes suivantes. Une TVA obligatoire n'est pas une evolution de tarif au sens de cette phrase, mais la lecture n'est pas immediate. A l'inverse, la modification de l'article 6 est une modification substantielle des CGU : notification 30 jours avant (article 11) pour les abonnes existants. Rien n'est en ligne avant la v3, donc rien a notifier aujourd'hui ; c'est dans la liste de sortie de franchise (F).
6. **Notes existantes sous 4,5** (point 3.1) et `maintenance.html` a 3 erreurs html-validate : non touches.

## 5. Rebasage des deux gates

**`docs/maquettes/texte_identique.mjs` (texte juridique, R1) -> base `1bf967e`.**
Les deux cotes (avant, apres) ont maintenant la meme structure (`h1`, `p.ver`, `article.feuille`) : je supprime la neutralisation des separateurs de `h2` et la lecture de l'ancienne structure `.hero` / `.container`. La base et la liste des **differences declarees** deviennent des constantes en tete de fichier : pour `cgu.html`, exactement deux substitutions de texte (la phrase de l'article 6 ; la ligne de version), appliquees au texte de depart avant comparaison ; **aucune** pour `dpa.html` et `politique-confidentialite.html`. Si le texte de depart ne contient pas une substitution declaree, la gate echoue ; toute autre difference (mot, lien, balise `strong`/`em`/`a`...) echoue.

**`scripts/verif-seo.mjs`, controle « texte visible » (S1) -> base `1bf967e`.**
Meme principe sur le corps (de `<body` a la fin), octet pour octet : chaque substitution est un couple (fragment de depart, fragment d'arrivee) **declare un a un**, et le fragment de depart doit exister **exactement une fois**. `index.html` : B1 (prix mensuel), B2 (prix annuel), B3 (note de l'annuel), B4 (ligne sous les cartes, insertion), C1 (paragraphe des cibles, insertion). `cgu.html` : article 6, ligne de version. Les sept autres pages : fichiers entiers identiques a `1bf967e`.

**Autres evolutions de `verif-seo.mjs`.**
- `valueAddedTaxIncluded` sort de la liste des cles interdites et devient **obligatoire a `false`** sur les deux offres ; le test « prix affiche » accepte « 50 € HT ».
- `llms.txt` : les controles « aucun HT / TTC » et « aucun courtier » sont inverses (HT et art. 293 B presents, CIF, agents d'assurance, agents immobiliers presents) ; la ligne Prix exacte est verifiee.
- Nouveaux : `audience` verifiee dans le texte visible ; `<title>`/`description` de l'accueil egaux aux textes demandes et repris par `og:*` et `twitter:*` ; **espaces insecables** dans les guillemets des CGU et du DPA (la gate texte, qui normalise les espaces, ne peut pas les voir) ; **coherence de la mention de franchise** ; **mode `--release`**.
- **Coherence de la franchise** : trois marqueurs, un par fichier (la formulation differe volontairement) : `index.html` « TVA non applicable, art. 293 B du CGI » ; `llms.txt` idem ; `cgu.html` article 6 « la TVA n'est pas applicable (article 293 B du Code général des impôts) ». **Presents partout** (avec « HT » sur les offres, « exprimés hors taxes » dans l'article 6, « HT » dans `llms.txt`) **ou nulle part** ; un etat mixte fait echouer la gate. J'y ajoute que `docs/SORTIE_FRANCHISE_TVA.md` existe et cite chacun de ces trois marqueurs, pour qu'elle ne se desynchronise pas du texte.
- **Mode `--release`** : echoue tant que `data-version-provisoire` est dans `cgu.html` ou que `dateModified` vaut la valeur provisoire ; en mode normal, un `AVERTISSEMENT` est affiche et le code de sortie reste 0. La date des CGU est la seule chose provisoire.
- Tests de mutation comme pour S1, etendus a ces controles (etat mixte de la franchise, `valueAddedTaxIncluded` oublie, courtier retire, date provisoire en `--release`...).

**Gate par gate.**
1. html-validate : `index.html` doit rester a **49 erreurs, ventilees pareil** ; `cgu.html` et les autres a 0.
2. texte juridique : `texte_identique.mjs` rebase.
3. texte visible de l'accueil : controle rebase, differences B et C seules.
4. `verif-seo.mjs` : vert en mode normal (avec l'avertissement), **rouge en `--release`** ; je montre les deux dans le recap.
5. coherence de la franchise : dans `verif-seo.mjs`.
6. contraste de la nouvelle ligne : ajoute a `docs/maquettes/contraste.mjs` (couple `#4D5D74` / `#F5F0E8`).
7. `sitemap.xml` regenere en dernier (le `lastmod` de `cgu.html` et d'`index.html` passera a la date du commit).

## 6. Plan de realisation apres GO

Commits ASCII, un fichier par commit ; les scripts viennent **apres** les pages (leurs differences declarees supposent les pages modifiees), le plan du site en dernier :
1. docs de tete (prompt S1-bis + cette confrontation) ; 2. `cgu.html` ; 3. `docs/CGU_v2_Ploutos.md` ; 4. `index.html` (B, C et E : un seul fichier, un seul commit) ; 5. `llms.txt` ; 6. `docs/SORTIE_FRANCHISE_TVA.md` ; 7. `docs/maquettes/contraste.mjs` ; 8. `docs/maquettes/texte_identique.mjs` ; 9. `scripts/verif-seo.mjs` ; 10. `sitemap.xml`.
Gate complete sur l'arbre final avant les commits, puis sur une copie propre de la tete finale (comme S1).

## 7. Ce que S1-bis ne touche pas

`dpa.html`, `politique-confidentialite.html`, `inscription.html`, `merci*.html`, `404.html`, `maintenance.html`, `ploutos-doc.*`, `ploutos-carte.css`, `sw.js`, `_headers`, `_redirects`, `netlify.toml`, `robots.txt`, aucun lien Stripe, aucun libelle de bouton d'abonnement, aucun prix.
