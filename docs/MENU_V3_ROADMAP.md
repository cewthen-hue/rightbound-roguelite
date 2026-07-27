# Menu V3 — feuille de route verrouillée

Version du plan : `2.5.0`

Interface active : `0.35.1`

Pipeline d’assets actif : `0.36.0-lot5.0`

Direction visuelle : RPG fantasy médiéval **2D cartoon premium**, lisible et conçu pour mobile.

Style ID officiel : `RIGHTBOUND_STYLE_V1`.

Plateformes : iPhone et Android, avec publication Android prévue sur Google Play.

Orientation : portrait uniquement.

Ce document est la source de vérité du chantier Menu V3. Une validation automatisée réduit les risques, mais la publication reste conditionnée à des contrôles sur appareils réels.

## Règles non négociables

1. Le Menu V3 reste indépendant des anciens menus V1/V2 pendant sa construction.
2. Les systèmes existants sont conservés : progression, niveaux, inventaire, équipement, économie, coffres et combat.
3. Le layout définit les dimensions. Un sprite ne déplace ni ne redimensionne un module.
4. Aucun empilement de feuilles `fix`, `final` ou `polish` dans le V3.
5. Les dimensions partagées restent centralisées dans `styles/menu-v3/menu-v3.tokens.css`.
6. Les textes, nombres et états restent en HTML.
7. Grid et Flex structurent les modules ; l’absolu reste limité aux couches internes et au diagnostic.
8. Un sprite mal cadré est corrigé dans son fichier source, jamais en modifiant la géométrie.
9. Safari iPhone et Android moderne doivent respecter les safe areas sans scroll involontaire.
10. Rightbound reste en portrait et ne demande jamais de tourner le téléphone.
11. L’application Android Google Play verrouillera également le portrait dans sa configuration native.
12. Toute donnée modifiée hors du menu est réconciliée au retour sur Expédition.
13. Une modification de taille après verrouillage exige une réouverture explicite du Lot 4.
14. Tous les tickets d’assets citent `RIGHTBOUND_STYLE_V1`, `geometry-contract.json` et `asset-manifest.json`.
15. La direction semi-réaliste est abandonnée : photoréalisme, 3D, chibi, anime et vectoriel plat sont interdits.
16. Un seul asset est produit par ticket, avec trois candidats maximum par round.
17. Aucun sprite sheet de génération et aucun lot massif avant l’approbation des trois pilotes.
18. Un asset doit obtenir au moins 9/10 avant d’entrer dans `assets/menu-v3/runtime/`.
19. Aucun runtime ne peut exister sans source maître correspondante.
20. Aucun fichier image non déclaré dans `asset-manifest.json` n’est autorisé dans `source/` ou `runtime/`.
21. Les simulations Playwright renforcent la validation mobile mais ne remplacent pas un futur Android réel.

## Lot 1 — Squelette mobile intégral

Modules verrouillés :

1. safe area supérieure ;
2. top bar ;
3. en-tête du monde ;
4. carte principale ;
5. sélection des niveaux ;
6. bouton Jouer ;
7. dock inférieur ;
8. safe area inférieure.

Profils : 360×780, 375×812, 390×844, 393×852 et 430×932.

Statut : **terminé**.

## Lot 2 — Composants HTML/CSS temporaires

Composants réalisés : portrait, niveau, XP, ressources, Options, Journal, ruban, titre du monde, carte, scène CSS, puissance, récompense, dix nodes, légende, bouton Jouer et dock à quatre onglets.

Statut : **terminé**.

## Lot 3 — Données et interactions

### Lot 3.1 — Données réelles

- progression permanente du héros ;
- XP et niveau ;
- golds ;
- gemmes et énergie temporairement à zéro ;
- niveau sélectionné ;
- puissance réelle et recommandée ;
- coffre garanti.

### Lot 3.2 — États des niveaux

- `completed`, `available`, `locked` ;
- sélection réelle ;
- variantes normal, Élite et Boss.

### Lot 3.3 — Action et navigation

- `JOUER`, `REJOUER`, `VERROUILLÉ` ;
- lancement relié au gameplay ;
- Équipement relié à l’inventaire ;
- Coffres relié au stock réel ;
- badge Coffres réel.

### Lot 3.4 — Réconciliation

- coordinateur `menu-v3-sync.js` ;
- actualisation après progression, équipement, coffres et économie ;
- reprise des récompenses interrompues ;
- synchronisation au retour dans l’application.

Statut du Lot 3 : **terminé**.

## Lot 4 — Verrouillage géométrique

Implémentation :

- `menu-v3.geometry.css` comme autorité finale avant sprites ;
- safe areas verrouillées ;
- emplacement de Jack fixé à 28 % × 70 % de la scène, ancré centre-bas ;
- slots d’assets déclarés par `data-v3-asset-slot` ;
- modes `contain`, `cover`, `nine-slice` ;
- validateur runtime et mode debug ;
- rapport exportable ;
- contrat machine `assets/menu-v3/geometry-contract.json`.

Validation réelle :

- iPhone : **validé le 24 juillet 2026** ;
- Android réel : en attente.

Statut : **verrou technique terminé, validation Android réelle reportée**.

## Lot 4.5 — Validation automatisée multi-écrans

La suite Playwright contrôle cinq profils :

- Android compact 360×780 ;
- iPhone compact 375×812 ;
- iPhone standard 390×844 ;
- Android standard 393×852 ;
- Android large 430×932.

État de stress : Gold `2010`, niveau 10, `GARDIEN DES FAUBOURGS`, puissance `165 / 109`, récompense `1 COFFRE DIAMANT`.

Contrôles : scroll, largeur du shell, confinement, chevauchements, textes, dix nodes, bouton Jouer, dock, erreurs géométriques et erreurs JavaScript.

Artefacts : captures normales, captures debug, rapports JSON, rapport HTML et traces d’échec.

Statut : **implémenté**. La simulation ne remplace pas un Android réel avant publication.

## Préproduction artistique

Documents actifs :

- `docs/MENU_V3_ART_DIRECTION.md` ;
- `assets/menu-v3/style-contract.json` ;
- Style ID `RIGHTBOUND_STYLE_V1`.

Ordre verrouillé des pilotes :

1. `stage-background` ;
2. `stage-hero` ;
3. `stage-frame`.

Statut : **charte verrouillée**.

## Lot 5.0 — Pipeline technique des assets

Objectif : empêcher l’intégration d’un sprite techniquement incorrect avant toute production graphique massive.

Implémentation active :

- manifeste complet `assets/menu-v3/asset-manifest.json` ;
- 24 assets déclarés ;
- chemins source et runtime canoniques ;
- formats, dimensions, ratios et poids maximaux ;
- règles de canal alpha ;
- occupation minimale du canvas ;
- marges transparentes maximales ;
- contrôle du contact avec les bords ;
- détection des pixels proches de `#FF00FF` ;
- détection des doublons runtime par SHA-256 ;
- rejet des fichiers non déclarés ;
- rejet d’un runtime sans source maître ;
- statuts `planned`, `candidate`, `approved`, `retired` ;
- modes incrémental, strict et rapport seul ;
- rapports JSON et Markdown ;
- job GitHub Actions dédié avec artefacts conservés 14 jours ;
- test statique `tests/menu-v3-assets-contract.mjs`.

Commandes :

```bash
npm run test:assets
npm run test:assets:strict
npm run report:assets
```

Le mode incrémental autorise l’absence des 24 assets encore planifiés, mais contrôle immédiatement tout fichier ajouté.

Documentation : `docs/MENU_V3_ASSET_PIPELINE.md`.

Statut : **implémenté sur GitHub ; première exécution CI en attente de résultat**.

## Lot 5.1 — Tickets techniques des trois pilotes

Prochaine étape graphique, réalisable sans générer immédiatement les images :

1. ticket `stage-background` ;
2. ticket `stage-hero` ;
3. ticket `stage-frame`.

Chaque ticket contiendra : Style ID, slot, chemins, canvas, ratio, zone utile, marges, ancre, mode, format, prompt, exclusions, références et critères d’acceptation.

Statut : **à faire ultérieurement**.

## Écrans fonctionnels prioritaires après le Lot 5.0

L’ordre convenu est :

1. **Équipement V3** — géométrie, données et interactions avec visuels temporaires ;
2. **Coffres V3** — stock, ouverture, révélation et navigation avec visuels temporaires ;
3. tickets des pilotes ou gameplay selon disponibilité des outils graphiques.

Ces écrans sont construits avec la même méthode que le menu : structure, composants, données, interactions, validation, puis sprites.

## Lot 6 — Validation de livraison des assets

Le pipeline du Lot 5.0 existe déjà. Le Lot 6 activera la validation stricte lorsque la bibliothèque sera produite :

- tous les fichiers obligatoires présents ;
- sources et runtimes complets ;
- candidats approuvés ;
- contrôle technique réussi ;
- score artistique humain d’au moins 9/10 ;
- captures à taille réelle validées.

## Lot 7 — Intégration des sprites

Les images seront appliquées au layout verrouillé sans modifier sa géométrie.

Ordre de diagnostic : ratio, marges, ancre, mode de rendu, cohérence de style, puis correction du fichier source.

## Lot 8 — Polish final

- animations de pression ;
- transitions ;
- feedback tactile ;
- notifications ;
- préchargement ;
- accessibilité ;
- optimisation Safari et Android WebView ;
- tests de régression visuelle ;
- suppression des anciens menus et CSS inutiles.

## Structure technique active

```text
src/menu-v3/
  menu-v3-shell.js
  menu-v3-components.js
  menu-v3-data.js
  menu-v3-interactions.js
  menu-v3-sync.js
  menu-v3-geometry.js

styles/menu-v3/
  menu-v3.tokens.css
  menu-v3.layout.css
  menu-v3.components.css
  menu-v3.skin.css
  menu-v3.responsive.css
  menu-v3.geometry.css
  menu-v3.debug.css

assets/menu-v3/
  README.md
  asset-manifest.json
  geometry-contract.json
  style-contract.json
  references/
  source/
  runtime/

docs/
  MENU_V3_ROADMAP.md
  MENU_V3_GEOMETRY_LOCK.md
  MENU_V3_ART_DIRECTION.md
  MENU_V3_ASSET_PIPELINE.md

scripts/
  validate-menu-v3-assets.mjs

tests/
  menu-v3-assets-contract.mjs
  menu-v3-visual-contract.mjs
  visual/menu-v3.visual.spec.mjs
```

## Statut actuel

- [x] Lots 1 à 3.4.
- [x] Lot 4 — verrou géométrique.
- [x] Lot 4 — validation iPhone.
- [ ] Lot 4 — validation Android réelle.
- [x] Lot 4.5 — tests multi-viewport.
- [x] Charte `RIGHTBOUND_STYLE_V1`.
- [x] Lot 5.0 — pipeline technique des assets.
- [ ] Lot 5.1 — tickets des trois pilotes.
- [ ] Équipement V3.
- [ ] Coffres V3.
- [ ] Lot 6 — validation stricte de livraison.
- [ ] Lot 7 — intégration.
- [ ] Lot 8 — polish final.
