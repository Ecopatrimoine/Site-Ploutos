# Sortie de la franchise en base de TVA : liste de contrôle

Document versionné, jamais servi (`netlify.toml` retire `docs/` de la copie publiée ; `_redirects` répond 404 sur `/docs/*`).
Créé par le lot S1-bis (11/11/2026). Situation à cette date : EcoPatrimoine Conseil est en **franchise en base de TVA** (article 293 B du Code général des impôts). Les prix affichés (50 € par mois, 500 € par an) sont **hors taxes** ; la TVA n'est pas facturée.

Ce fichier liste tout ce qui doit changer **le jour où l'Éditeur devient redevable de la TVA**. Les numéros de ligne sont ceux de l'état livré par S1-bis ; les retrouver par la mention citée si le fichier a bougé depuis.

`scripts/verif-seo.mjs` contrôle que la mention de franchise est **cohérente** : présente partout (accueil, `llms.txt`, article 6 des CGU) ou nulle part. Un état mixte fait échouer la gate. Il contrôle aussi que le présent fichier cite chacune de ces trois mentions, telles qu'elles sont écrites aujourd'hui. Conséquence pour la sortie : on retire les trois mentions **dans le même lot**, puis on met à jour les marqueurs de ce contrôle dans le script, puis ce fichier.

## À décider avant de toucher aux fichiers
1. **Date d'effet** de l'assujettissement, à fixer avec l'expert-comptable ou le service des impôts des entreprises. Les seuils et le calendrier sont à vérifier à la source (BOFiP, impots.gouv.fr) au moment voulu : ils ne sont volontairement pas recopiés ici.
2. **Affichage** : on garde les prix hors taxes (50 € HT et 500 € HT, la TVA s'ajoute) ou on passe à un affichage toutes taxes comprises (les montants affichés changent alors). Le reste de la liste suppose que les prix restent affichés **hors taxes** ; les écarts sont signalés au point 4.
3. Le prix des abonnements portant la mention « tarif bloqué » reste maintenu hors taxes (article 6 des CGU) : la TVA s'y ajoute.

## 1. Dans le dépôt : texte visible et fichiers de référencement
| # | Fichier : ligne | Mention actuelle | À faire |
|---|---|---|---|
| 1 | `index.html:788` | « Prix hors taxes. TVA non applicable, art. 293 B du CGI. » | Retirer la mention de franchise. Garder « Prix hors taxes », complété par la TVA au taux en vigueur. Ligne de la classe `.price-tax-note` (CSS à la ligne 204). |
| 2 | `llms.txt:7` | « (TVA non applicable, art. 293 B du CGI) » dans la ligne Prix | Retirer la parenthèse ; indiquer que la TVA s'ajoute. |
| 3 | `cgu.html:141` (article 6) | « À la date des présentes, l'Éditeur bénéficie de la franchise en base de TVA : la TVA n'est pas applicable (article 293 B du Code général des impôts). Si l'Éditeur devient redevable de la TVA, celle-ci s'ajoute aux prix au taux en vigueur, … » | Réécrire ces deux phrases au présent : l'Éditeur est redevable de la TVA, qui s'ajoute aux prix au taux en vigueur (y compris « tarif bloqué », prix hors taxes maintenu). Garder « exprimés hors taxes » et la dernière phrase (« L'application de la TVA ne constitue pas une évolution tarifaire au sens du présent article »). |
| 4 | `docs/CGU_v2_Ploutos.md:25` | idem (brouillon) | Même réécriture. |
| 5 | `index.html:753-754, 773-776` et boutons `767, 785` | « HT » dans les prix, la note du plan annuel et les boutons | Inchangés tant que l'affichage reste hors taxes. Voir le point 2 de la décision. |
| 6 | `llms.txt:7` | « 50 € HT par mois ou 500 € HT par an » | Idem. |

## 2. La nouvelle version des CGU : une modification substantielle
La sortie de franchise modifie l'article 6 : c'est une **modification substantielle des CGU**, **à notifier au moins trente (30) jours avant son entrée en vigueur**, selon l'article 11 des CGU (`cgu.html:155-156`). Il faut donc :
- fixer la date de mise en ligne de la nouvelle version, et notifier les abonnés au moins 30 jours avant ;
- remplacer la ligne de version de `cgu.html:86` par la date réelle et retirer l'attribut `data-version-provisoire` s'il est encore là ;
- mettre à jour `dateModified` dans les données structurées des CGU (`cgu.html:37`) ;
- lancer `node scripts/verif-seo.mjs --release` : il échoue tant qu'une date de version provisoire subsiste ;
- rebaser les contrôles de texte (`docs/maquettes/texte_identique.mjs` et le contrôle du texte visible de `scripts/verif-seo.mjs`) sur la tête qui précède le lot de sortie, avec les nouvelles différences déclarées une à une.
La phrase de l'article 6 « L'application de la TVA ne constitue pas une évolution tarifaire au sens du présent article » vise à ne pas déclencher le préavis de la phrase suivante (évolution des tarifs) ; elle n'écarte pas la notification de l'article 11.

## 3. Données structurées (accueil)
| Fichier : ligne | Propriété | À faire |
|---|---|---|
| `index.html:471` et `index.html:485` | `"valueAddedTaxIncluded": false` (offres mensuelle et annuelle) | Reste vrai tant que les prix affichés sont hors taxes. Passe à `true`, avec les montants toutes taxes comprises, **seulement** si l'affichage change (point 2 de la décision). |
| `index.html` (blocs `Offer`, `price` 50 et 500) | `price` | Idem : changent seulement avec l'affichage. |

## 4. Hors dépôt, à la charge de David
- **Stripe** : réglage de la taxe (Stripe Tax ou taux de TVA) sur les prix et les liens de paiement `buy.stripe.com/...` utilisés par les deux boutons de l'accueil (`index.html:767` et `index.html:785`) ; vérifier si les prix y sont déclarés hors taxes ou toutes taxes comprises, et comment la TVA est ajoutée au paiement.
- **Factures** : retirer la mention de franchise (« TVA non applicable, art. 293 B du CGI ») ; ajouter les mentions de TVA obligatoires (numéro de TVA, taux, montant de TVA) ; vérifier le modèle de facture généré par Stripe.
- **Information des abonnés** : message aux abonnés en cours (mensuels, annuels, « tarif bloqué »), au moins 30 jours avant l'entrée en vigueur de la nouvelle version des CGU ; les abonnés « tarif bloqué » gardent leur prix hors taxes, la TVA s'y ajoute.
- **Déclarations et comptabilité** : numéro de TVA, régime et périodicité des déclarations, avec l'expert-comptable.

## 5. Après les modifications
1. `node scripts/verif-seo.mjs` : vert, sans état mixte de la franchise.
2. `node scripts/verif-seo.mjs --release` : vert (date de version posée).
3. `node scripts/sitemap.mjs`, en dernier : la date de dernière modification des pages touchées est celle du commit.
4. Recette de David : section Tarifs et « À propos » de l'accueil, article 6 des CGU, `/llms.txt`.
