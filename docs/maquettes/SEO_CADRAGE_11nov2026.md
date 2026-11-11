# Référencement du site Ploutos — cadrage (11/11/2026)

Objet : faire de ploutos-cgp.fr la réponse aux recherches « logiciel CGP » sur Google et dans les moteurs à intelligence artificielle (ChatGPT, Perplexity, Gemini, Copilot, Claude). Ce document pose le constat, les trois leviers, les lots et les décisions attendues de David. Il accompagne les maquettes 41f (accueil) et 42 (pages réglementaires).

## 1. Constat (audit du dépôt `refonte-site` et recherches du 11/11/2026)

Ce qui est sain. Chaque page a un titre, une description, une adresse canonique et ses balises de partage. L'accueil porte des données structurées (éditeur, logiciel avec ses deux offres, questions fréquentes). Les polices sont locales, `robots.txt` autorise tout, le fichier de vérification Google Search Console est en place.

Ce qui manque.

1. Le site est une seule page. Le plan du site déclare cinq adresses (accueil, inscription, trois pages juridiques), datées de juillet. Une page ne peut pas répondre à la fois à « logiciel bilan patrimonial », « calcul droits de succession », « prévoyance TNS » et « lettre de mission CGP » : il faut une page par intention de recherche.
2. Ploutos n'apparaît pas sur sa propre catégorie. Sur « logiciel CGP indépendant bilan patrimonial comparatif 2026 » et « Ploutos logiciel gestion de patrimoine CGP », les résultats sont des comparateurs (La Fabrique du Net, Hackceleration, Appvizer, Profession CGP, Club Patrimoine) et des concurrents ; aucune page de ploutos-cgp.fr n'est remontée, y compris en cherchant le nom de domaine. Mesure indicative faite avec l'outil de recherche de Claude, à confirmer dans Search Console.
3. Aucune présence hors du site : pas de fiche sur les comparateurs, pas d'article de presse professionnelle. Or ce sont ces pages que les moteurs à intelligence artificielle lisent et citent quand on leur demande « quel logiciel pour un CGP indépendant ».
4. Rien n'est prévu pour les moteurs à intelligence artificielle : pas de fichier `llms.txt`, pas de règle explicite pour leurs robots, pas de page de faits datés et sourcés qu'ils puissent citer.
5. Détails techniques : captures en PNG lourds, données structurées du logiciel incomplètes (pas d'adresse, pas de captures, pas de liste de fonctions, prix sans mention hors taxes), dates du plan du site figées.

## 2. Les trois leviers

Le référencement tient à trois choses, d'importance croissante : la technique (le site est lisible par les moteurs), le contenu (il existe une page qui répond à chaque question), l'autorité (d'autres sites parlent de Ploutos). Claude peut faire entièrement les deux premiers ; le troisième demande des démarches de David.

### A. Technique — à livrer avec la refonte du site

- Un titre et une description propres à chaque page, écrits sur l'intention de recherche.
- Données structurées complètes : logiciel (adresse, captures, liste de fonctions, offres hors taxes, systèmes), éditeur (avec les liens vers le site du cabinet, la chaîne YouTube, LinkedIn), questions fréquentes strictement identiques au texte visible, fil d'Ariane, vidéo de 90 secondes, articles pour les guides. Jamais de note ni d'avis tant qu'il n'y a pas d'utilisateurs : pas de données inventées.
- Plan du site régénéré à chaque publication, avec les vraies dates.
- `llms.txt` à la racine : ce qu'est Ploutos, pour qui, prix, pages de référence. Règles explicites dans `robots.txt` pour les robots des moteurs à intelligence artificielle (décision de David, recommandation : les autoriser).
- Tout le texte commercial reste dans le HTML servi, jamais fabriqué par script : c'est déjà le cas des maquettes 41f et 42, à tenir comme règle du lot (les écrans 3D sont décoratifs, leur contenu ne compte pas pour le référencement).
- Vitesse : captures en WebP ou AVIF aux bonnes tailles, vidéo du haut de page chargée après le texte, animations sans décalage de mise en page. Objectif : les trois indicateurs Core Web Vitals au vert sur mobile.
- Déclaration du site dans Bing Webmaster Tools en plus de Search Console (Bing alimente plusieurs moteurs à intelligence artificielle).

### B. Contenu — le levier principal

Passer d'une page à une arborescence, chaque page visant une recherche précise.

1. Pages de fonction (une par intention) : bilan patrimonial ; succession et assurance-vie ; prévoyance (régimes obligatoires, conventions collectives, indépendants, audit de prévoyance collective) ; scénarios (donation, démembrement) ; documents réglementaires (lettre de mission, entrée en relation, recueil, document de conseil) ; calculs rapides.
2. Pages de service : tarifs, téléchargement, nouveautés (une entrée datée par version : du contenu frais à chaque mise à jour), à propos.
3. Le savoir publié. Le wiki du logiciel contient déjà des fiches sourcées (texte de loi, mode de calcul), tenues à jour par la veille Légifrance. En publier une sélection sur le site donne exactement ce que Google et les moteurs à intelligence artificielle récompensent : des réponses factuelles, datées, sourcées, écrites par un praticien. Décision de David.
4. Calculateurs publics. Ouvrir deux ou trois des calculs rapides en accès libre sur le site (par exemple frais de donation, capital ou rente, crédit) : ce sont les pages qui attirent le plus de recherches et de liens dans ce métier, et chacune mène à l'essai gratuit. Décision de David (on donne une partie du produit).
5. Pages de comparaison honnêtes (« Ploutos et [outil] », « alternative à [outil] ») : ce sont des recherches fréquentes, aujourd'hui captées par les comparateurs. Uniquement des faits publics et vérifiables, la publicité comparative étant encadrée. Décision de David.
6. À propos renforcé : qui édite, CGP en exercice, immatriculation, formateur. C'est le signal d'expérience et de légitimité que les moteurs cherchent sur un sujet financier.

### C. Autorité — démarches de David, à lancer à la sortie de la v3

- Fiches sur les comparateurs qui tiennent la première page : La Fabrique du Net, Appvizer, Capterra ; contact des auteurs des comparatifs existants (Hackceleration, Profession CGP, Club Patrimoine) pour y figurer.
- Communiqué de lancement de la v3 à la presse professionnelle (Profession CGP, Club Patrimoine).
- Liens depuis ce que David maîtrise déjà : site du cabinet, descriptions des vidéos « T'as une minute », LinkedIn.
- Aucun avis acheté ni faux témoignage : les premiers avis viendront des premiers utilisateurs.

Claude prépare les textes (fiche type, communiqué, messages aux auteurs) ; David les envoie.

## 3. Lots proposés

- S1, technique : avec la refonte, avant le merge v3 (Sonnet).
- S2, pages de fonction et de service : à la sortie de la v3, sur les maquettes 41f et 42.
- S3, savoir publié : puis une fiche ou deux par mois.
- S4, calculateurs publics : après S2.
- En parallèle, à la sortie de la v3 : démarches d'autorité.

## 4. Mesure

Search Console et Bing Webmaster Tools ; une liste de quinze recherches cibles et de cinq questions posées aux moteurs à intelligence artificielle, relevée une fois par mois.

## 5. Ce qu'il faut savoir avant de commencer

Personne ne peut garantir une première place. Le domaine est jeune et sans liens : les pages techniques produisent leur effet en quelques semaines, le contenu en trois à six mois, l'autorité au rythme des démarches. Le marché est étroit et peu disputé sur les recherches précises (prévoyance, documents réglementaires, calculs) : c'est là que Ploutos peut être premier le plus vite.

## 6. Décisions attendues de David

1. Publier une sélection du wiki sur le site : oui ou non.
2. Ouvrir deux ou trois calculs rapides en accès libre : oui ou non, et lesquels.
3. Autoriser les robots des moteurs à intelligence artificielle à lire le site : oui (recommandé) ou non.
4. Pages de comparaison avec d'autres logiciels : oui ou non.
