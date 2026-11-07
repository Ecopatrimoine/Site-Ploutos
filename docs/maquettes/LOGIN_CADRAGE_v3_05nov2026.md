# Cadrage v3 — connexion et animation d'ouverture (lot V3-3)

> v3 du 04/11/2026, 20 h 10 : recette de L1 par David, trois retours (section 12) et chorégraphie ramenée à 5,1 s (section 11 remplacée). v2 du 04/11/2026, 18 h 15 : décisions de David sur les maquettes 28 → 28d (section 10), qui remplacent les sections 3 et 7 là où elles diffèrent. Rédigé par Claude (Fable) le 04/11/2026 au soir, après la recon lecture seule de `refonte-ui` (tête `67f7443d`), sur le modèle d'`ACCUEIL_CADRAGE_29oct2026.md`. Demande de David (31/10) : « login et animation d'ouverture refaits ». Assets V3-3 attendus par la Roadmap : π clair avec point or, lettrage sans fond. Ce document fixe le parcours et les règles ; la planche (maquette 28) vient ensuite, puis les lots L1 → L3. Rien n'est codé avant le STOP de David sur la planche.

## 1. Ce que la recon a établi

- **La chaîne d'ouverture est en calques, pas en aiguillage** (`src/components/ChaineAuth.tsx`) : `verification` (spinner) → `auth` (AuthGate) → sortie 460 ms → `profil` éventuel → `transition` (LoginTransition) → l'application montée (`AppInner`). LicenceGate, « Quoi de neuf » et le bureau n'existent qu'**après** la fin de la transition. Le calque d'auth est opaque (`#F8F6F7`, z 99000), la garde petit écran est au-dessus (z 100000). Les tests `ChaineAuth.calque.render.test.tsx` et `App.demarrage.render.test.tsx` verrouillent cet ordre : **on garde la chaîne telle quelle**, on ne refait que ce qui est dessiné dedans.
- **Quand la transition se joue aujourd'hui** : après une connexion, après un lien de confirmation, après une recovery terminée, et **à chaque chargement avec session valide** (F5 sur le web, chaque lancement d'Electron). Elle ne se rejoue ni au retour du mode hors-ligne, ni au rafraîchissement du jeton. Durée actuelle : environ 6,7 s (8 icônes de 338 ms, puis logo, lettrage, filet, « By Ecopatrimoine Conseil », puis 2,6 s d'attente). Son `/sounds/login.mp3` (49 Ko) joué par `new Audio().play()` ; au chargement sans geste, le navigateur le refuse en silence.
- **AuthGate** (514 lignes) : quatre modes (connexion, inscription, mot de passe oublié, nouveau mot de passe), Turnstile en connexion / inscription / oubli, jamais en reset ; message hors-ligne 72 h (`authState === "grace"`) ; 16 hex en dur, 18 rgba, pas d'`aria-live`, pas de `prefers-reduced-motion`, fond dégradé avec dix formes géométriques flottantes (le « SaaS générique » que DESIGN.md rejette). Couleurs passées par ChaineAuth **en dur** (`#101B3B`, `#E3AF64`, `#26428B`, `#FBECD7`) ; LoginTransition reçoit les couleurs **du cabinet**.
- **LicenceGate** (265 lignes) : deux états seulement (essai terminé, abonnement inactif), deux cartes de plan, code promo, Stripe direct. Aucun jeton, police système ; R-V31c-2 l'attend en V3-3. La logique d'états riche existe déjà dans `src/components/outils/etatsLicence.ts` (CarteLicence, V3-1f-1) : **LicenceGate la réutilise**, il ne la réinvente pas.
- **GardePetitEcran** : fond `--pl-navy` avec le logo `logo.ploutos.svg` **marine sur transparent** : le π y est quasi invisible. C'est l'un des deux usages du π clair.
- **Assets** : `logo.ploutos.svg` = π navy, anneau ouvert, point or en haut à droite (fond transparent, le `rect` blanc n'est qu'un clipPath) ; `lettrage.ploutos.svg` = lettrage navy sans fond ; `lettrage.ploutos.blanc.svg` **embarque son rectangle marine** (R-V31f1-9) ; `icon.png` 1024 px / 408 Ko sert à 56 px dans la carte de licence. Le logo d'AuthGate et de LoginTransition est le **base64** de `logo.ploutos.svg` figé dans `App.tsx` l. 148 et le lettrage est un base64 inliné deux fois. `manifest.webmanifest` référence `icon-192.png` / `icon-512.png` qui n'existent pas.
- **Electron** charge `https://app.ploutos-cgp.fr` (pas `file://`, Turnstile l'exige) : les chemins absolus `/logo…`, `/sounds/…` sont ceux de Netlify. Pas de splash natif : `show:false`, fond `#F8F6F7`, affichage au `ready-to-show`. Fenêtre 1400 × 900, minimum 1024 × 700.
- **CRM hôte (A1)** : aucun jeton, aucun paramètre d'authentification. Un conseiller qui vient de Kleios arrive par `/?dossier=<id>&phase=&depuis=crm`, la demande est gardée en `sessionStorage` à travers **le même AuthGate**, puis la transition, puis `ouvrirDossier`. Sous CRM hôte la bande du cabinet n'a pas de « Déconnexion ».
- **Pages statiques** `inscription.html`, `abonnement.html`, `merci.html` : **absentes de ce dépôt**, elles vivent dans `Ecopatrimoine/Site-Ploutos` ; l'application n'y renvoie jamais (LicenceGate et CarteLicence ouvrent Stripe directement).
- **DESIGN.md** : Arbitrage n° 4 — seules les animations du registre établi existent et **toute animation nouvelle doit être ajoutée à la liste, datée, dans le journal** ; `prefers-reduced-motion` et la préférence « Animations » du poste (`html[data-pl-animations="non"]`) coupent tout ce qui est préfixé `pl-` ; les styles inline et les `setTimeout` ne sont pas couverts. Lato est « réservée à l'identité (en-tête, menu d'aide, écran de connexion) ». Polices locales par fontsource, jamais Google Fonts. L'or ne décore jamais ; budget six usages par écran.

## 2. Le parcours réel (ce que l'écran doit couvrir)

| Situation | Déclencheur | Ce que voit le conseiller | Ce qui suit |
|---|---|---|---|
| **Ouverture** (web ou Electron) | chargement, session valide | animation d'ouverture courte | bureau, ou dossier demandé (CRM hôte) |
| **Connexion** | `unauthenticated` | écran de connexion : e-mail, mot de passe, anti-robot, « Se connecter », « Mot de passe oublié », « Créer un compte » | sortie de l'écran → animation → application |
| **Première connexion** (compte confirmé par e-mail) | lien de confirmation → session | la même animation ; le courriel de bienvenue part en arrière-plan (`sendWelcomeIfNeeded`) | « Quoi de neuf » ne s'ouvre pas (compte créé après la note) |
| **Création de compte** | mode `register` | nom du cabinet, e-mail, mot de passe, confirmation, anti-robot | message « Vérifiez votre e-mail », retour connexion |
| **Mot de passe oublié** | mode `forgot` | e-mail + anti-robot | « Lien envoyé » |
| **Nouveau mot de passe** | lien de récupération (`isPasswordRecovery`) | deux champs, **sans** anti-robot, « Annuler » déconnecte | retour connexion, aucune animation tant que la recovery est vivante |
| **Hors-ligne 72 h** | `authState === "grace"` | l'application s'ouvre ; bandeau d'information (pas un blocage) | retour réseau sans rejouer l'animation |
| **Session expirée** (`expired`, compte désactivé ou grâce dépassée) | `expired` | l'écran de connexion recouvre l'application, la saisie en cours reste dessous | même utilisateur : on retrouve tout |
| **Licence expirée / inactive** | après la transition, `!licence.isValid` | écran de licence : état lu dans `etatsLicence.ts`, les deux plans, code promo, support, déconnexion | Stripe dans un nouvel onglet |
| **Petit écran** | < 768 px, ou tablette portrait < 1024 px | calque navy : phrase, π clair, « Tournez votre tablette » | rien d'autre |
| **CRM hôte** | `?dossier=…&depuis=crm` | même écran de connexion ; après l'animation, le dossier s'ouvre directement, jamais le bureau | « Quitter le dossier » |
| **Electron hors-ligne au lancement** | `did-fail-load` | `electron/offline.html` (page autonome) | relance |

Deux changements de comportement proposés, à trancher par David (section 7) : (1) l'animation complète ne se joue qu'à **l'ouverture de l'application et à la connexion**, et un retour d'expiration (reconnexion du même conseiller sur sa saisie) la joue en **version courte** (le π seul, 600 ms) pour ne pas interrompre le travail ; (2) le **son** ne se joue qu'après un geste (le clic « Se connecter »), jamais au chargement, et respecte la préférence « Animations » du poste.

## 3. Ce que l'animation doit dire en deux secondes

- **L'histoire** (une seule action, section 6 du skill motion) : *l'encre pose le trait, l'or marque le point, le nom apparaît, la page s'ouvre.* Mise en place → action → résolution, le dernier plan est l'application elle-même.
- **Les trois temps** (budget total **≤ 2,4 s** du clic à l'application, contre 6,7 s aujourd'hui) :
  1. **Le trait** (0 → 900 ms) : l'anneau du π se trace (`stroke-dashoffset`, ease-out `cubic-bezier(.16,1,.3,1)` — le `--pl-ease` du socle), le π apparaît dans la foulée (opacité + 6 px, 600 ms, le même geste que l'en-tête de « Mon abonnement », déjà au registre). Le trait est l'encre ; rien d'autre ne bouge.
  2. **Le point or** (800 → 1 100 ms) : il arrive en bout d'anneau, échelle 0,6 → 1 sans rebond (archétype **Premium** : 350-600 ms, dépassement 0 %). C'est le seul or de la scène.
  3. **Le nom et l'ouverture** (1 100 → 2 300 ms) : lettrage sans fond (fondu 420 ms), puis la scène se dissout vers l'application (fondu 500 ms + échelle 0,97 → 1 côté application, comme la sortie actuelle). Pas de filet or, pas de « By Ecopatrimoine Conseil » animé : la signature du cabinet est dans la bande du cabinet, juste après.
- **Pas de carrousel d'icônes** (les huit pictogrammes actuels n'ont pas d'histoire), **pas de formes géométriques flottantes**, pas de dégradé « hero », pas de parchemin en bande : la scène est une seule matière (variante A : parchemin plein ; variante B : encre pleine), la planche montre les deux.
- **Trois couches** (motion-design) : primaire = trait + point ; secondaire = l'ombre portée du π qui se pose 50 ms après lui ; ambiante = le grain du papier, immobile (une matière, pas un mouvement). Sous `prefers-reduced-motion` : **l'image finale, immédiatement** (le dernier plan doit tenir seul), et la dissolution devient un fondu de 0 ms.
- **Échappement** : un clic ou `Échap` saute à l'application (la scène est interruptible : on continue depuis la valeur courante, jamais de saut en arrière).
- **Identité** : navy `#101B3B` (le navy du logo, `--pl-cab-navy`) pour le trait, or `#E3AF64` (`--pl-gold-light`, autorisé en repère non textuel) pour le point, parchemin `#E8E3D9` ou encre selon la variante ; Lato 900 pour le lettrage (asset SVG, pas de texte). Les couleurs du cabinet **ne pilotent plus la scène** (elles colorent la bande du cabinet après) : l'ouverture, c'est Ploutos.

## 4. L'écran de connexion

- **Un calque opaque, une seule matière** : fond parchemin plein (`--pl-parchment`), **carte blanche** (`--pl-card`, rayon `--pl-radius-card` 7 px, ombre `--pl-shadow-card`), en-tête de carte = le π (asset, 56 px) et le lettrage, sous-titre « Logiciel du conseiller en gestion de patrimoine » en Lato 400. Aucune bande d'en-tête (rien d'animé, rien de parchemin en bande, pas de liseré).
- **Les quatre modes dans la même carte** (connexion, création, oubli, nouveau mot de passe) : titre N2 Source Serif 4 600 22 px, champs `pl-champ` 44 px avec libellé en Lato 700 12 px **sans capitales** (R-V31e-4), bouton plein `pl-btn` navy 44 px, liens secondaires `pl-link-btn` 44 px ; anti-robot centré ; messages d'état avec `role="status"` / `role="alert"` (V3-1g : « ce qui arrive en asynchrone est dit »).
- **Palette d'états** (règle du 28/10) : succès vert (`--pl-etat-pret`), erreur rouge (`--pl-etat-bloque`), hors-ligne ambre (`--pl-etat-acompleter`), toujours **avec un mot** et un pictogramme.
- **Sortie de l'écran** quand la connexion réussit : la carte se retire (fondu + échelle 1 → 1,02, 320 ms), le fond reste ; l'animation démarre sur le même fond — **aucune coupure blanche** entre les deux calques (aujourd'hui l'AuthGate part en 460 ms vers `#F8F6F7` puis la transition arrive en fondu sur un autre dégradé).
- **Pied** : version et commit (`__APP_VERSION__`), « EcoPatrimoine Conseil », lien support ; « Données stockées localement » disparaît (faux depuis Supabase).
- **Ce qui ne change pas** : les quatre handlers, Turnstile, la validation d'e-mail jetable, `sendWelcomeIfNeeded`, la garde clavier du captcha (test `AuthGate.captchaClavier`), les messages de succès et d'erreur (textes conservés mot pour mot, sauf capitales).

## 5. Licence, petit écran, pages statiques

- **LicenceGate** : même coque que l'écran de connexion (calque parchemin, carte blanche), **états lus dans `etatsLicence.ts`** (essai terminé, abonnement inactif, résilié, période de grâce dépassée) avec la bande teintée de `CarteLicence` (couleur d'état + texte `-text`), le π clair sur la bande (plus de filtre `invert`), les deux plans en cartes `pl-`, code promo en `pl-champ`, support et déconnexion en `pl-link-btn`. Les tarifs restent ceux de `lib/abonnement.ts` (une source).
- **GardePetitEcran** : inchangé dans sa règle et ses textes (test verrouillé), **le π clair avec point or** remplace le logo marine invisible ; le conteneur garde `--pl-navy`.
- **Carte de licence (V3-1f-1)** : le `filter: invert(1) hue-rotate(180deg)` de `.pl-ou-logo` est remplacé par l'asset `π clair` ; le `@keyframes pl-ou-logo` reste (test `outils.abonnement` l. 221-233 à adapter pour le filtre seulement).
- **Pages statiques** (`inscription.html`, `abonnement.html`, `merci.html`) : dans `Site-Ploutos`, pas ici. Le lot L3 livre aux deux dépôts **les assets** (π clair, lettrage sans fond, feuille `ouverture.css` autonome) et une page de référence HTML ; l'alignement des trois pages se fait dans une session sur `Site-Ploutos`, après le GO de David (question 4).

## 6. Accessibilité et technique

- **Cibles 44 px** partout (boutons, liens, champs) : primitives `pl-btn` / `pl-link-btn` / `pl-champ`, test `cibles44.source` étendu au dossier `components/connexion`.
- **Focus visible** : `.pl-fx` (anneau `--pl-gold-deep`), ordre de tabulation e-mail → mot de passe → anti-robot → bouton → liens ; `autocomplete="username" / "current-password" / "new-password"` ; `Entrée` soumet (déjà) ; `Échap` saute l'animation.
- **Contraste** : tout couple déclaré dans la feuille passe le test V3-1g (4,5) ; sous-titres en `--pl-text-muted-refonte` (`#4D5D74`), jamais `#94a3b8`.
- **Mouvement** : composant à classes `pl-` (couvert par les deux règles de coupure), **plus aucun `setTimeout` de mise en scène** : une horloge unique `requestAnimationFrame` (`useHorlogeUnique(durée)`, section 2 du skill rossark : une horloge par scène, tout le reste est fonction du temps), figée à sa dernière image sous `prefers-reduced-motion` ou `data-pl-animations="non"`, et mise en pause quand l'onglet est caché (`document.hidden`).
- **Son** : joué après un geste seulement, volume 0,45, coupé par la préférence « Animations » du poste ; un futur réglage « Son » dans Paramètres = item Roadmap, pas ce lot.
- **Assets** : `public/logo.ploutos.clair.svg` (π `--pl-white-warm` + anneau clair + point or, même viewBox 251 × 276), `public/lettrage.ploutos.trait.svg` (lettrage sans fond, une couleur `currentColor`), `public/icon.png` ramené à 256 px (ou un `icon-256.png` dédié pour la carte), `manifest.webmanifest` corrigé vers `pwa-192x192.png` / `pwa-512x512.png` ; le base64 de `App.tsx` l. 148 **disparaît** au profit de l'URL `/logo.ploutos.svg` (une seule source) ; `sw.js` précache `/logo.ploutos.clair.svg`, `/lettrage.ploutos.trait.svg`, `/sounds/login.mp3`.
- **Jetons** : `--pl-cab-navy`, `--pl-gold-light`, `--pl-parchment`, `--pl-white-warm`, `--pl-ease` ; durées nouvelles `--pl-ouverture: 2300ms` et `--pl-ouverture-court: 600ms` dans `src/design/tokens.js` + miroir `index.css` (test `designTokens`). Aucun hex en dur dans `components/connexion/` (liste du test V3-1c étendue).
- **DESIGN.md** : entrée datée dans le registre établi (Arbitrage n° 4) : « ouverture de Ploutos — trait de l'anneau 900 ms, π 600 ms, point or 300 ms, lettrage 420 ms, dissolution 500 ms ; une fois par ouverture ou connexion ; version courte 600 ms au retour d'expiration ; coupée par `prefers-reduced-motion` et la préférence du poste ».

## 7. Questions à David (à trancher sur la planche, défauts proposés)

1. **Fond de l'ouverture** : A — parchemin plein (continuité avec l'application, π navy) ; B — encre pleine `#101B3B` (le π clair avec point or, puis dissolution vers le parchemin). *Défaut proposé : B pour l'ouverture, A pour l'écran de connexion (la planche montre les deux).*
2. **Rejouer ou pas** : l'ouverture complète à chaque lancement d'Electron et à chaque connexion ; la version courte (π seul) au retour d'expiration sur une saisie en cours. *Défaut proposé : oui.*
3. **Le son** : gardé, joué seulement après le clic « Se connecter » (jamais au lancement), coupé par la préférence du poste ; ou retiré. *Défaut proposé : gardé après clic.* `login.mp3` actuel conservé ou remplacé par un son plus court (≤ 1,2 s, aligné sur le point or) : à écouter.
4. **Pages statiques** : L3 limité aux assets + feuille de référence livrés à `Site-Ploutos`, l'alignement des pages dans une session dédiée sur ce dépôt. *Défaut proposé : oui.*
5. **« Créer un compte » reste dans l'application** (inscription + Turnstile + validation d'e-mail jetable) ou renvoie vers `inscription.html` du site. *Défaut proposé : reste.*

## 8. Lots (Sonnet, depuis `67f7443d`, gate complète à chaque commit, pas de push sans GO)

- **L1 — assets et animation d'ouverture** (½ jour) : les trois assets + manifeste + précache ; `src/components/connexion/Ouverture.tsx` (remplace le contenu de `LoginTransition.tsx`, **même fichier et même export** pour ne pas toucher `ChaineAuth`, `annonces.test` ni les mocks) sur horloge unique, variante longue / courte, `Échap`, son après geste ; `pl-ou-logo` sans filtre ; GardePetitEcran avec le π clair ; jetons `--pl-ouverture*` ; DESIGN.md registre + journal ; tests : rendu, dernière image sous reduced-motion, pas de `setTimeout`, chemins d'assets, `ChaineAuth` intact (8 775 verts + les nouveaux). Captures : `ouverture-00..04` à 1 024 px.
- **L2 — écran de connexion et états** (1 jour) : `AuthGate.tsx` réécrit sur les primitives `pl-` (quatre modes, Turnstile, handlers intacts), palette d'états, `role="status"` / `alert`, sortie continue vers l'ouverture (fond commun), pied avec version ; `LicenceGate.tsx` sur `etatsLicence.ts` et la même coque ; `ChaineAuth` ne passe plus de couleurs en dur (jetons) ; tests existants verts (`captchaClavier`, `App.demarrage`, `ChaineAuth.calque`) + contraste + cibles 44 ; captures `connexion-*`, `licence-*`.
- **L3 — pages statiques alignées** (½ jour, dépôt `Site-Ploutos`, après GO) : assets + `ouverture.css` + page de référence ; `inscription.html`, `abonnement.html`, `merci.html` reprises sur la carte de connexion.
- Hors lot, items Roadmap nés : réglage « Son » dans Paramètres ; précache complet du service worker ; `icons.svg` orphelin à retirer ; écran Électron `offline.html` à aligner sur la carte de connexion ; login Kleios (copie de l'AuthGate, 04/08) à réaligner à la refonte de Kleios.

## 9. Planche à produire (maquette 28, `docs/refonte-ui/maquettes/connexion_ouverture.html`)

Une page, **deux variantes maximum**, STOP de David dessus : (1) l'écran de connexion en mode connexion, avec un bouton qui joue la sortie puis l'ouverture ; (2) l'ouverture en variante A (parchemin) et B (encre), rejouables, avec un interrupteur « mouvement réduit » qui montre la dernière image ; (3) les états en vignettes : création, oubli, nouveau mot de passe, erreur, hors-ligne, licence expirée, petit écran. Les trois assets sont dessinés dans la planche (SVG inline) puis extraits tels quels en L1.

## 10. Décisions de David sur les planches (04/11/2026, 17 h 50 → 18 h 11)

- **Plus de pictogrammes** : le carrousel des huit icônes ne revient pas, confirmé.
- **L'ouverture retenue : « le carnet signé, au trait »** (maquette 28b proposition 6, précisée par la 28c variante A et la 28d tempo posé). Sur l'encre pleine, une page de parchemin se pose ; un trait d'encre navy écrit le contour du π d'un seul geste, le corps se remplit, l'anneau se trace, le point or ferme la marque ; les sept lettres de PLOUTOS s'écrivent au trait puis se remplissent, de gauche à droite ; une courte ligne d'or souligne le nom ; **la signature « By Ecopatrimoine Conseil » revient, écrite lettre à lettre** ; la marque complète reste immobile une demi-seconde ; puis la page s'ouvre jusqu'aux bords de l'écran et devient l'application, sans fondu. Les variantes A/B du fond (section 3), l'orbite, la lumière, la montée et l'estampe sont écartées.
- **Tempo posé** (David : « j'ai l'impression que c'est très rapide », confirmé) : **6,3 s** du début de la scène à l'application, détail en section 11. David a relevé que la page s'ouvrait avant la fin de la signature (28d v1) : règle posée, **rien ne s'ouvre tant que la signature n'est pas écrite**, la respiration de 0,5 s commence à la dernière lettre.
- **Référence** : maquette 28d, scène « Tempo posé » (`docs/refonte-ui/maquettes/connexion_ouverture_d.html`, `#pose`). La 28 (écran de connexion, états, assets) reste la référence de L2 ; la 28b et la 28c sont des planches d'exploration, conservées.
- **Défauts de la section 7 retenus sans objection** : l'ouverture complète à chaque lancement de l'application et à chaque connexion, la version courte (π seul, 600 ms) au retour d'expiration ; le son `login.mp3` gardé, joué seulement après le clic « Se connecter », jamais au lancement, coupé par la préférence « Animations » du poste ; L3 limité aux assets livrés à `Site-Ploutos` ; « Créer un compte » reste dans l'application.

## 11. La chorégraphie de référence (v3 : 5,1 s, millisecondes depuis le début de la scène)

Référence image par image : maquette 28e, scène `#cinq` (`docs/refonte-ui/maquettes/connexion_ouverture_e.html`), son `ouverture.mp3` joué depuis le même instant zéro.

- 0 → 700 : la page de parchemin (400 × 470 px) monte de 36 px et se pose, `--pl-ease`.
- 450 → 1 700 : le contour du π s'écrit (trait navy 4 px, ease-in-out `cubic-bezier(.77,0,.175,1)`). **Son : le trait de crayon** (450 → 1 700).
- 1 600 → 2 050 : le corps du π se remplit.
- 1 450 → 2 300 : l'anneau se trace.
- 2 250 → 2 550 : le point or se pose (échelle 0,6 → 1, sans rebond). **Son : la goutte d'eau** (2 250).
- 2 300 → 3 360 : les sept lettres s'écrivent au trait (520 ms chacune, 90 ms d'écart, ordre P L O U T O S) ; 2 700 → 3 540 : chaque lettre se remplit (300 ms, 90 ms d'écart).
- 3 350 → 3 770 : la ligne d'or (56 × 2 px) se trace sous le nom.
- 3 500 → 4 220 : « By Ecopatrimoine Conseil » s'écrit lettre à lettre (24 caractères, 25 ms d'écart, 120 ms chacun). **Son : le vent**, de gauche à droite (3 450 → 4 400).
- 4 220 → 4 500 : respiration, rien ne bouge. Règle : **rien ne s'ouvre tant que la signature n'est pas écrite**.
- 4 500 → 5 100 : la page s'étend aux bords (largeur et hauteur vers 102 %, rayon vers 0, ease-in-out) ; 4 550 → 4 850 : son contenu s'efface. **Son : le swoosh profond** (il part à 4 050 pour que son pic, 550 ms plus loin, coïncide avec le mouvement).
- **4 700** : `onComplete`, l'application est montée dessous **à l'échelle 1, sans zoom ni déplacement** ; la page devenue pleine est le voile, et son opacité passe de 1 à 0 de 4 700 à 5 100 (`--pl-ouverture-voile: 400ms`). Aucune transformation (`scale`, `translate`) sur l'application ni sur le voile : la page qui s'étend fait seule la transition.
- Version courte : inchangée, 1 250 ms (page 900 ms, π plein 600 ms, ouverture 650 ms), sans son.
- Sous `prefers-reduced-motion` ou la préférence du poste : toutes les durées et tous les délais à zéro, l'image finale (la page signée) puis l'application ; jamais de son.

## 12. Retours de recette L1 (David, 04/11/2026, 19 h 40 → 20 h 08)

- L'écran de connexion n'a pas changé : normal, c'est L2 ; à faire tout de suite après L1-bis.
- **Plus de zoom à la fin** : le `scale(.97 → 1)` et le fondu d'arrivée de l'application sont retirés ; les bords de la page qui s'étendent font seuls la transition (section 11).
- **La scène passe à 5,1 s** (de 6,3), signature toujours finie avant l'ouverture.
- **Nouveau son** `public/sounds/ouverture.mp3` (5,7 s, stéréo 48 kHz, 160 kbit/s, −20 LUFS), composé par Claude sur la partition de David : crayon à papier pendant le tracé du π, goutte d'eau quand le point or se fixe, vent pendant la signature, swoosh profond quand les bords s'étendent. Sources : crayon = LaSonotheque.fr « Crayon à papier » ID 0221 (licence du site, usage professionnel admis, mention souhaitée) ; goutte = Pixabay freesound_community « waterdrops » 72206 ; swoosh = Pixabay universfield « deep swoosh » 383771 (licence Pixabay, usage commercial admis, attribution non exigée) ; vent = synthèse (bruit filtré). `login.mp3` est retiré. Le son est toujours joué seulement après un geste, jamais au lancement, jamais sous les deux coupures.
- La bande d'en-tête (maquette 29b) : David la juge « un peu mieux », retour final quand il la verra en place ; lot L2-bis après L2.
