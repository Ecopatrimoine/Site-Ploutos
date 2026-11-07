# L3 (V3-3) — Confrontation maquette 30 / `connexion.css` / dépôt Site-Ploutos

Recon en lecture seule du 07/11/2026, branche `l3-carte-inscription` créée depuis `main` (4dc38cb), aucun fichier du site modifié. Dépôt Ploutos lu à `C:\Users\davla\Ploutos` (branche `refonte-ui`), pas à `..\ploutos`.

## 1. Écarts maquette 30 / `connexion.css` + `index.css` + `refonte.css`

### Repris tels quels
`.cx-ecran` (gap 18, padding 32/16/24), `.cx-carte` (420 px, rayon 7, ombre `--pl-shadow-card`), `.cx-tete` (padding 28/32/4, gap 10, π 56 px, lettrage 150 px), baseline 13 px, `.cx-corps` (gap 14, padding 14/32/6), titre Source Serif 4 600 22 px, sous-titre 13 px, captcha 65 px, pied 12 px, `.pl-msg` (bord 3 px, padding 10/14, picto 16 px), `.pl-btn` 44 px / Lato 700 14, `.pl-link-btn` 44 px, `.pl-fx` (focus or profond 2 px, offset 2).

### Écarts à trancher (la maquette n'est pas égale à l'application)
| # | Sujet | Application | Maquette 30 / prompt | Défaut proposé |
|---|---|---|---|---|
| E1 | Fond de l'écran | `--pl-parchment` #E8E3D9 | lin #F3EEE3 (décision 05/11) | **lin**, comme le prompt. `--pl-lin` n'existe pas dans `index.css` de Ploutos : il est défini seulement dans la maquette. |
| E2 | `--pl-navy-light` | **#1E293B** | **#26428B** | Garder #26428B pour le site (liens, survol, 8,1 sur lin, 9,4 sur blanc). C'est le bleu du site actuel (`--sky`), pas celui de l'app : à confirmer, sinon le lien « Se connecter » change de teinte entre site et app. |
| E3 | `--pl-radius-ctl` | 4 px | 5 px | 5 px (prompt et maquette). Écart de 1 px avec l'app. |
| E4 | `--pl-border-strong` | #CCC5B8 | #B9B1A3 | #B9B1A3 (maquette). Voir E8. |
| E5 | Bouton plein | `.pl-btn-primary` = `--pl-navy` #0F172A | navy cabinet #101B3B | #101B3B (prompt). Écart quasi invisible. |
| E6 | `autocomplete` e-mail (register) | `email` | `username` | `username` (prompt). À noter : l'app dit `email`. |
| E7 | Placeholder e-mail | `votre@email.com` | `prenom@cabinet.fr` | maquette. |
| E8 | **Contraste non-texte** | bordure champ #CCC5B8 sur blanc = **1,71** | #B9B1A3 sur blanc = **2,13** | Les deux < 3:1 (WCAG 1.4.11). Le prompt demande ≥ 4,5 pour les couples texte/fond, pas pour les bordures. Je propose de garder #B9B1A3 (cohérence avec l'app) et de le dire ; sinon prendre `--pl-text-subtle` #7E8F9F (3,3). |
| E9 | **Eyebrow « Pourquoi Ploutos »** | — | or profond #A67F32 12 px sur lin = **3,18** | **Échoue le 4,5 de la gate (3).** Options : `--pl-gold-text-parchment` #7A5C0F (5,39 sur lin, jeton déjà dans l'app) ou `--pl-gold-text` #8B6914 (4,40, échoue). Défaut : #7A5C0F pour tout texte or ; #A67F32 reste réservé au focus et au ✓ décoratif. |
| E10 | Placeholder `--pl-text-subtle` #7E8F9F sur blanc | — | = 3,32 | Les placeholders sont exemptés de 1.4.3 dans la pratique, mais la gate dit « chaque couple déclaré ». Défaut : le déclarer comme exception explicite dans le script de contraste (comme l'app). |
| E11 | Mobile | `@media (max-width:560px)` ramène les paddings à 20 px | maquette : rien | Reprendre la règle 560 px. Sans elle, à 390 px la zone utile (390 − 32 − 64 = 294 px) est plus étroite que le widget Turnstile (300 px) : débordement de 6 px. |
| E12 | Message d'état | picto = SVG de `EtatPicto` (coche, cercle en pointillé, cadenas...) | glyphes texte ✓ ! … dans un rond plein | Reprendre les tracés lucide de l'app en SVG inline (coche pour succès, cercle pointillé pour anti-robot, et pour l'erreur le picto de `PICTO_DE_ETAT.bloque` : à lire dans `etats.ts`). Les glyphes de la maquette ne sont pas ceux de l'app. |

### Éléments de la maquette qui ne sont pas dans le prompt
- **Les liens légaux disparaissent.** L'`inscription.html` actuelle a un pied avec CGU · DPA · Politique de confidentialité · Contact ; le pied de la carte (`cx-pied`) ne garde que « Ploutos · EcoPatrimoine Conseil · contact@... ». Or c'est la page qui collecte les données personnelles : retirer le lien vers la politique de confidentialité au point de collecte est une régression de conformité (information RGPD). **Je propose de garder les trois liens dans le pied** (cibles 44 px, en ligne sous la carte). Même chose pour `merci*.html` et `404.html`, qui les ont aujourd'hui. À valider.
- **Textes nouveaux dans la maquette** (le prompt dit « textes mot pour mot », la maquette en introduit) :
  - merci : « Plan Solo — Annuel. **Votre essai se poursuit sans interruption.** » — affirmation métier non présente aujourd'hui, à vérifier ou retirer. Le prompt dit : repli « Votre abonnement est actif. » Défaut : phrase = nom du plan seul (« Plan Solo — Annuel. ») ou « Votre abonnement est actif. » sans plan.
  - merci-contact : « Nous vous répondons sous deux jours ouvrés à l'adresse indiquée. » au lieu de « Nous revenons vers vous sous 48 h ouvrées. » Défaut : **garder l'existant**.
  - 404 : sous-titre « L'adresse a peut-être changé, ou la page a été retirée. » au lieu de « Le lien est peut-être erroné... lancez votre essai gratuit. » Défaut : maquette (le prompt dit « textes de la maquette »), le bouton « Essai gratuit 30 jours » porte déjà l'appel.
  - Bénéfices : « Données hébergées en Union européenne — Chiffrées, utilisables hors-ligne 72 h ». Le DESIGN.md de Ploutos (05/11) précise le sens exact : « une connexion internet est requise dans les 72 heures », donc « utilisables hors-ligne 72 h » est défendable mais compressé ; « Windows, web, iPad, Android » et « Un seul compte, tous vos appareils » sont repris du site.
  - « e-mail » (maquette) contre « email » (messages de `inscription.js`). Défaut : **ne pas toucher aux textes de `inscription.js`** (« email » reste dans les trois messages), « e-mail » dans les libellés neufs.
- **Titre de page** : la maquette met « Créer un compte » en `h2` ; sur les trois petites pages il n'y a aucun `h1`. Défaut : `h1` sur le titre de la carte pour `merci`, `merci-contact`, `404` ; sur `inscription`, `h1` = titre de la colonne bénéfices, `h2` = titre de la carte (comme la maquette).

## 2. Usages de `--cream` dans `index.html` (grep non tronqué)

```
34:  --cream: #FBECD7;     (déclaration)
35:  --cream2: #F5F0E8;    (autre variable, non concernée)
143:.features-bg { background: var(--cream2); }
184:.pricing { background: var(--cream2); }
225:.about { background: var(--cream2); }
```
**`var(--cream)` n'est lu nulle part** (le littéral #FBECD7 non plus). Le « partout où la variable est lue » est donc vide : le remplacement par le lin est sans effet visuel, aucun contraste n'est modifié. Les trois fonds de sections utilisent `--cream2` #F5F0E8, que le prompt ne vise pas. Défaut : remplacer la valeur de `--cream` par #F3EEE3 (ligne 34) et ne rien changer d'autre. (Alternative : supprimer la variable morte.) À noter pour la passe finale : #F5F0E8 (accueil) et #F3EEE3 (carte) sont deux crèmes voisines.

Contraste de référence, texte navy #101B3B : sur #FBECD7 = 14,56 ; sur le lin #F3EEE3 = 14,61.

## 3. Les deux autres retouches de l'accueil
- **Pied** (l. 775) : `<img src="lettrage.ploutos.blanc.svg" ... opacity:0.9>` → lettrage trait inline en `color: var(--pl-white-warm)`. #F8F7F4 sur navy #101B3B = 15,78. Le pied reste navy (le prompt ne demande pas de le changer).
- **« À propos »** (l. 715) : `filter:brightness(0) invert(1)` sur `logo.ploutos.svg` → `logo.ploutos.clair.svg`, sur le rond dégradé navy→sky de `.about-avatar`. Le π clair contient #101B3B (anneau ?), #E3AF64, #F8F7F4 : à vérifier à l'œil que l'anneau navy ne disparaît pas sur le rond navy (c'est le point de contraste réel de cette retouche).
- `index.html` : les trois retouches introduisent un `style=` inline si je suis le modèle actuel ; je passerai par des classes pour ne pas ajouter d'erreur `no-inline-style`.

## 4. Gate (1) `html-validate` : l'état de départ est rouge

Avant tout changement, règles par défaut, sur les cinq fichiers : **114 erreurs**.

| Fichier | Erreurs | Règles |
|---|---|---|
| `index.html` | 52 | void-style 10, no-inline-style 30, no-implicit-button-type 11, no-implicit-input-type 1 |
| `inscription.html` | 38 | void-style 23, no-inline-style 13, autocomplete-password 2 |
| `merci.html` | 8 | void-style 8 |
| `merci-contact.html` | 8 | void-style 8 |
| `404.html` | 8 | void-style 8 |

Le critère « sans erreur » est tenable pour les quatre pages réécrites (elles sont refaites : balises void sans `/`, aucun style inline, `type` explicites). Il **ne l'est pas pour `index.html`** sans toucher à 52 endroits hors lot. Défaut : sur `index.html`, la gate = **aucune erreur nouvelle** (52 avant, 52 ou moins après) et je liste les règles historiques ici.

## 5. Gate (2) : conflit avec le π en ligne
Le π (`logo.ploutos.svg`) contient des `fill="#..."` (#101B3B, #E3AF64...) et un `clipPath id="clip0_167_104"`. Inliné, il (a) casse le grep « aucun hex dans les quatre pages », (b) dupliquerait l'`id` (nav + carte) : erreur `no-dup-id`. La maquette l'inline seulement pour être autonome.
**Défaut proposé : π en `<img src="/logo.ploutos.svg" alt="">` (aucune couleur à hériter), seul le lettrage est inliné** (il est en `currentColor`, sans hex, sans `id` : 7 tracés, 6,4 Ko). C'est le choix « inline » du prompt, appliqué au seul fichier qui en a besoin. Pour ne pas dupliquer 6,4 Ko deux fois par page (nav + carte), je propose un `<symbol id="lettrage">` défini une fois et deux `<use href="#lettrage">` ; `currentColor` s'hérite à travers `<use>`. Dites-moi si vous préférez la copie littérale deux fois.
`logo.ploutos.svg` du site est identique octet pour octet à celui de Ploutos. Le `logo.ploutos.clair.svg` (π clair) est copié tel quel ; `lettrage.ploutos.trait.svg` aussi (aucun hex).

## 6. Ce que `inscription.js` touche dans le DOM (à conserver)

| Sélecteur | Usage | Dans la nouvelle page |
|---|---|---|
| `#msg` | `className = 'msg ' + type` + `textContent` | conteneur du `MessageEtat` (reconstruit à chaque message) |
| `#form-register` | submit ; `display:none` au succès | conservé |
| `#r-cabinet`, `#r-email`, `#r-password`, `#r-confirm` | lecture des valeurs | conservés |
| `#btn-register` | `disabled`, `textContent` | conservé |
| `#confirm-screen`, `#confirm-email` | affichage de l'écran de confirmation | `#confirm-screen` = bloc « Compte créé » masqué par défaut, `#confirm-email` = `<b>` |
| `#pills` | masqué au succès | le paragraphe « Essai 30 jours · sans carte bancaire · sans engagement » de la colonne bénéfices |
| `#switch-text` | masqué au succès | la ligne « Déjà un compte ? » ; remplacée par « ← Retour à l'accueil » |
| `.cf-turnstile` + `data-sitekey`, `data-callback`, `data-error-callback`, `data-expired-callback` | widget | conservés à l'identique, dans `.cx-captcha` (65 px réservés) |
| `onTurnstileSuccess/Error/Expired` | globales appelées par les `data-*` | inchangées de signature |

### Lignes de `inscription.js` qui touchent le DOM hors des trois fonctions citées
Le prompt limite le diff à `showMsg`, `hideMsg` et la branche succès. Deux autres lignes doivent changer pour que le visuel soit cohérent :
1. **L. 103 (`finally`)** : `btn.textContent = "Commencer l'essai gratuit →"` doit devenir `"Créer mon compte"`, sinon le bouton reprend l'ancien libellé après un échec.
2. **L. 61** : `'Création en cours...'` → la maquette écrit « Création en cours… » (caractère `…`). Optionnel ; défaut : laisser les trois points ASCII.
Je les inclus dans le diff (deux lignes de libellé, aucun flux) sauf avis contraire.

### Choix de l'état du `MessageEtat` par branche
- succès → `pret`, `role="status"`, mot « Compte créé » ;
- toutes les validations et erreurs réseau/serveur → `bloque`, `role="alert"`, mot « Erreur » ;
- `turnstileToken` manquant (l. 57) → `acompleter`, `role="status"`, mot « Anti-robot » (maquette) ;
- `onTurnstileError` → mot « Anti-robot » (prompt). État non précisé : défaut **`bloque` / `alert`**, car la vérification a échoué (ce n'est pas « à compléter »). À confirmer.
- Régions live : un `role="alert"` inséré dynamiquement est annoncé ; je recrée le nœud à chaque message dans un conteneur `#msg` stable plutôt que de changer le `role` d'un nœud existant (peu fiable).

## 7. Autres constats de la recon
- **CSP (`_headers`)** : `/inscription.html` et `/inscription` ont la même CSP. `style-src 'self' 'unsafe-inline'`, `img-src 'self' data:`, `font-src 'self'`, `script-src 'self' 'unsafe-inline' challenges.cloudflare.com static.cloudflareinsights.com`, `connect-src` Supabase + Cloudflare. Une feuille `/ploutos-carte.css`, deux SVG en `<img>` et des polices locales sont couverts. Aucune CSP n'existe pour `merci*`, `404`, `index` (rien à vérifier côté entêtes).
- **`netlify.toml`** : le build ne fait que `rm -rf docs`. `docs/maquettes/captures/` est donc retiré avec `docs/` (le prompt dit « par `netlify.toml` » : c'est exact, via `docs`) et `/docs/*` renvoie 404 par `_redirects`.
- **Polices** : Source Serif 4 600 est déjà dans `/fonts/` (aussi 300, 400, 300 italique). Il suffit de la déclarer dans `ploutos-carte.css`. L'accueil ne charge pas Source Serif 4 ; non nécessaire pour les trois retouches.
- **`sw.js`** : `cache.addAll` échoue entièrement si une URL manque. Les cinq URL demandées (`/inscription.html`, `/inscription.js`, `/ploutos-carte.css`, les deux SVG) existeront toutes ; `CACHE_NAME` → `ploutos-landing-v2`. Note : le SW répond en réseau d'abord ; le précache n'ajoute donc rien en ligne.
- **Icône d'onglet** d'`inscription.html` : `<link rel="icon" href="logo.ploutos.svg" type="image/png">` : type erroné (le fichier est un SVG) et chemin relatif. Hors lot, je le corrige dans la réécriture sauf avis contraire (`type="image/svg+xml"`), ou je l'aligne sur les trois `<link rel=icon>` des autres pages.
- **Playwright** 1.65.0 est disponible via `npx` ; les navigateurs devront être téléchargés (~150 Mo) au premier lancement des captures.
- Aucun `maintenance.html`, aucun `ouverture.mp3` (hors lot).

## 8. Questions pour David (défauts entre parenthèses, je lance l'étape 1 sur ces défauts si pas de retour)
1. **Liens légaux** : garder CGU · DPA · Confidentialité dans le pied de la carte, sur les 4 pages (oui, cibles 44 px) ?
2. **Eyebrow et textes or** : #7A5C0F pour tout texte or (le #A67F32 de la maquette est à 3,18 sur lin) ?
3. **`--pl-navy-light`** : #26428B (site) ou #1E293B (app) pour liens et survol ?
4. **Phrase de `merci.html`** : « Plan Solo — Annuel. » seul, sans « Votre essai se poursuit sans interruption » (affirmation non vérifiée) ?
5. **`merci-contact.html`** : garder « Nous revenons vers vous sous 48 h ouvrées. » ?
6. **`onTurnstileError`** : `bloque` / `alert` ?
7. **Libellé du bouton** dans le `finally` : accepter ces deux lignes hors des trois fonctions ?
8. **`index.html` gate (1)** : critère « aucune erreur nouvelle » (52 historiques) ?
9. **π en `<img>` + lettrage en `<symbol>`/`<use>`** plutôt que tout inliné ?
10. **`--cream`** : remplacer la valeur (sans effet, variable non lue) ou supprimer la variable ?
11. Bordure des champs #B9B1A3 (2,13 sur blanc) : acceptable en l'état, comme dans l'app ?

## 9. Decisions de David (07/11) et resultats de l'etape 1

Reponses appliquees : liens legaux dans le pied des quatre pages (cibles 44 px) ; texte or en #7A5C0F ; liens et survols de la carte en #1E293B (`--pl-navy-light`), nav et colonne des benefices en #26428B sous `--site-sky` ; phrase de `merci.html` (« Plan Solo — Annuel. » ou « Votre abonnement est actif. ») ; `merci-contact` inchange ; `onTurnstileError` en bloque / alert ; deux libelles de bouton ; π en `<img>` et lettrage en `<symbol>` + deux `<use>` ; `--cream` supprimee ; icones d'onglet d'`inscription.html` alignees sur les autres pages.

### Gate
1. `html-validate` (regles par defaut) : `inscription`, `merci`, `merci-contact`, `404` = **0 erreur** ; `index.html` = **49** (52 avant ; void-style 9, no-inline-style 28, no-implicit-button-type 11, no-implicit-input-type 1, tous historiques ; les retouches ont retire 2 `style=` et 1 balise auto-fermee).
2. `grep "data:image\|#[0-9A-Fa-f]{6}"` sur les quatre pages : vide.
3. `node docs/maquettes/contraste.mjs` : 18 couples texte/fond tous >= 4,5 (le plus bas : bouton desactive 4,63) ; placeholder #7E8F9F sur blanc = 3,32, **exception declaree** dans le script.
4. Cibles : aucun `a`, `button`, `input` visible sous 44 px de haut sur les quatre pages (tous les etats d'`inscription`), a 1 280 et 390 px ; aucun debordement horizontal.
5. Captures Playwright dans `docs/maquettes/captures/` (1 280 x 720 et 390 x 844) : inscription (vide, anti-robot manquant, erreur compte existant, compte cree), `merci` (`?plan=annual`, sans plan, plan inconnu), `merci-contact`, `404`, pied et « A propos » de l'accueil, zoom du rond « A propos ».
Verifie aussi, sur serveur local avec la CSP de `_headers` : aucune violation CSP dans la console ; corps du POST `auth/v1/signup` identique (email, password, `data.cabinet_name` / `full_name`, `gotrue_meta_security.captcha_token`) ; Turnstile bloque en local (conteneur vide, attendu), jeton injecte via `onTurnstileSuccess`. A 390 px la zone utile du widget est de 318 px (390 - 32 - 40) pour 300 px de widget.

### Notes pour la passe finale (items Roadmap)
- **Unifier les deux cremes** : l'accueil reste sur #F5F0E8 (`--cream2`), la carte sur le lin #F3EEE3.
- **« bordures de champ 1.4.11 »** : les bordures de champ sont sous 3:1 (1,71 dans l'application avec #CCC5B8, 2,13 ici avec #B9B1A3). A traiter pour l'application et le site ensemble. Le script de contraste ne teste que les couples texte/fond.
- Rappel : controle d'adresse jetable sur le site ; nettoyage `lettrage.ploutos.blanc.svg` et PNG de lettrage ; `maintenance.html` sur la carte ; « Vitrine v3 - captures et effets ».

### Ecarts d'execution a signaler
- Le diff d'`inscription.js` : `showMsg`, `hideMsg`, nouveaux utilitaires `buildMsg` / `ETATS_MSG` / `PICTOS_MSG`, la branche succes, les deux libelles du bouton, et **deux arguments de type** ajoutes aux appels `showMsg` des l. 29 et 57 (`'antirobot-erreur'`, `'antirobot'`) pour que le mot soit choisi par la branche. Signature de `showMsg(text, type)` inchangee.
- Pied d'`inscription` : largeur portee a 520 px (carte restee a 420 px) pour que les cinq elements tiennent sur une ligne a 1 280 px ; ils passent a la ligne sur telephone.
- Pictogramme de l'erreur : cadenas (celui de `PICTO_DE_ETAT.bloque` dans l'application), pas le point d'exclamation de la maquette.
