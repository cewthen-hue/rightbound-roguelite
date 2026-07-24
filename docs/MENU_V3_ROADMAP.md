# Menu V3 — feuille de route verrouillée

Version du plan : `2.3.1`
Version applicative active : `0.35.1`
Direction visuelle : RPG fantasy médiéval **2D cartoon premium**, lisible et conçu pour mobile.
Style ID officiel : `RIGHTBOUND_STYLE_V1`.
Plateformes : iPhone et Android, avec publication Android prévue sur Google Play.
Orientation : portrait uniquement.

Ce document est la source de vérité du chantier Menu V3. Un lot n’est validé définitivement qu’après contrôle sur une capture réelle de téléphone.

## Règles non négociables

1. Le Menu V3 reste indépendant des anciens menus V1/V2 pendant sa construction.
2. Les systèmes existants sont conservés : progression, niveaux, inventaire, équipement, économie, coffres et combat.
3. Le layout définit toujours les dimensions. Un sprite ne doit jamais déplacer ou redimensionner un module.
4. Aucun empilement de feuilles `fix`, `final` ou `polish` dans le V3.
5. Les dimensions partagées sont centralisées dans `styles/menu-v3/menu-v3.tokens.css`.
6. Les textes, nombres et états restent en HTML.
7. Grid et Flex structurent les modules. Le positionnement absolu est limité aux couches internes de la scène et au diagnostic.
8. Les sprites définitifs ne commencent qu’après validation finale du Lot 4.
9. Un sprite mal cadré est corrigé dans son fichier source, jamais en déplaçant le layout.
10. Safari iPhone et Android moderne doivent respecter les safe areas et rester sans scroll involontaire.
11. Rightbound reste en portrait et ne demande jamais de tourner le téléphone.
12. L’application Android Google Play devra également verrouiller le portrait dans sa configuration native.
13. Toute donnée modifiée hors du menu est réconciliée automatiquement au retour sur Expédition.
14. Après validation du Lot 4, toute modification de taille exige une réouverture explicite du verrou géométrique.
15. Tous les futurs tickets d’assets doivent citer `RIGHTBOUND_STYLE_V1` et `geometry-contract.json`.
16. La direction semi-réaliste est abandonnée : aucun asset définitif ne doit dériver vers le photoréalisme, la 3D, le chibi, l’anime ou le vectoriel plat.
17. Un seul asset est produit par ticket, avec trois candidats maximum par round.
18. Aucun sprite sheet de génération et aucun lot massif ne sont autorisés avant l’approbation des trois pilotes.
19. Un asset doit obtenir au moins 9/10 avant d’entrer dans `assets/menu-v3/runtime/`.
20. La géométrie ne doit jamais être modifiée pour faire rentrer une image mal cadrée.

## Lot 1 — Squelette mobile intégral

Objectif : obtenir toute la géométrie de l’écran sans sprite définitif.

Modules :

1. safe area supérieure ;
2. top bar ;
3. en-tête du monde ;
4. carte principale du niveau ;
5. sélection des niveaux ;
6. bouton Jouer ;
7. navigation inférieure ;
8. safe area inférieure.

Profils de référence :

- 360 × 780 ;
- 375 × 812 ;
- 390 × 844 ;
- 393 × 852 ;
- 430 × 932.

Statut : implémenté et verrouillé.

## Lot 2 — Composants HTML/CSS temporaires

Composants réalisés :

- portrait temporaire de Jack ;
- niveau, XP et ressources ;
- Options et Journal ;
- ruban et titre du monde ;
- carte principale et décor CSS temporaire ;
- puissance, préparation et récompense ;
- dix nodes et légende ;
- bouton Jouer ;
- dock Expédition, Équipement, Coffres et Boutique.

Révisions validées :

- ressources mieux espacées ;
- titre du monde mieux respiré ;
- Jack temporaire réduit ;
- sélection compacte ;
- nodes 32 × 40 px sur téléphone standard ;
- bouton Jouer renforcé ;
- dock à quatre onglets.

Statut : implémenté.

## Lot 3 — Données et interactions

### Lot 3.1 — Données réelles

- progression permanente du héros ;
- XP et niveau ;
- golds ;
- gemmes et énergie temporairement à zéro ;
- coût d’expédition temporaire à dix ;
- niveau sélectionné ;
- puissance réelle et recommandée ;
- coffre garanti.

### Lot 3.2 — États des niveaux

- états `completed`, `available` et `locked` ;
- sélection réelle ;
- variantes normal, élite et boss ;
- consultation des niveaux verrouillés sans lancement possible.

### Lot 3.3 — Bouton Jouer et navigation

- `JOUER`, `REJOUER` et `VERROUILLÉ` ;
- lancement relié à la logique existante ;
- Équipement relié à l’inventaire ;
- Coffres relié au stock réel ;
- badge Coffres réel ;
- Boutique, Options et Journal conservés comme fonctions futures explicites.

### Lot 3.4 — Réconciliation complète

- coordinateur `menu-v3-sync.js` ;
- actualisation après victoire, défaite, équipement, coffre, progression et économie ;
- reprise des récompenses interrompues ;
- synchronisation au retour dans l’application ;
- protection contre les boucles de MutationObserver.

Statut du Lot 3 : implémenté.

## Lot 4 — Validation et verrouillage géométrique

Objectif : figer la géométrie réelle avant toute production de sprites.

Implémentation active :

- `styles/menu-v3/menu-v3.geometry.css` devient l’autorité finale du layout avant sprites ;
- safe areas supérieure et inférieure verrouillées ;
- hauteur du dock adaptée à l’indicateur d’accueil iPhone ;
- emplacement futur de Jack verrouillé à 28 % × 70 % de la scène, ancré centre-bas ;
- futurs emplacements d’assets déclarés par `data-v3-asset-slot` ;
- modes `contain`, `cover` et `nine-slice` enregistrés ;
- contrat machine dans `assets/menu-v3/geometry-contract.json` ;
- documentation détaillée dans `docs/MENU_V3_GEOMETRY_LOCK.md` ;
- runtime `src/menu-v3/menu-v3-geometry.js` ;
- mesure des modules, centres, ratios, ancres, safe areas, textes, touch targets et débordements ;
- statuts `pass`, `warning` et `fail` ;
- rapport exportable ;
- visualisation debug des limites, axes, centres, ancres et anomalies ;
- tests automatiques dédiés.

Commandes de diagnostic :

```js
RightboundMenuV3Geometry.setDebug(true)
RightboundMenuV3Geometry.measure()
RightboundMenuV3Geometry.getReport()
RightboundMenuV3Geometry.exportReport()
RightboundMenuV3Geometry.setDebug(false)
```

Validation réelle :

- iPhone : **validé le 24 juillet 2026** avec valeur Gold à quatre chiffres, titre long, puissance à trois chiffres, récompense Diamant, dix nodes et safe area système ;
- Android : en attente d’une capture réelle.

Statut : implémenté sur GitHub et validé sur iPhone ; fermeture définitive suspendue uniquement à la validation Android.

## Préproduction artistique du Lot 5

La direction artistique est préparée avant la production afin d’éviter les générations incohérentes ou inutilisables.

Documents et contrats actifs :

- `docs/MENU_V3_ART_DIRECTION.md` — charte artistique complète ;
- `assets/menu-v3/style-contract.json` — contrat machine ;
- Style ID obligatoire : `RIGHTBOUND_STYLE_V1` ;
- direction : RPG fantasy médiéval 2D cartoon premium ;
- rendu adulte, lisible, coloré avec contrôle et non semi-réaliste ;
- lumière principale venant du haut gauche ;
- palette officielle bleu sarcelle, vert olive, bronze, or vieilli et parchemin ;
- organisation prévue en `references/`, `source/` et `runtime/` ;
- contrôle obligatoire à 32, 40 et 64 px ;
- note minimale de 9/10 ;
- rejets automatiques en cas de mauvais cadrage, dérive de style, alpha incorrect, franges magenta ou incompatibilité géométrique.

Ordre verrouillé des pilotes :

1. `stage-background` ;
2. `stage-hero` ;
3. `stage-frame`.

Ces trois pilotes deviennent ensuite les références obligatoires de toute la bibliothèque.

Statut : charte et contrat implémentés ; production bloquée jusqu’à la validation Android finale du Lot 4.

## Lot 5 — Production des sprites définitifs

Le Lot 5 commencera uniquement après validation finale du Lot 4.

Chaque fiche devra contenir :

- Style ID `RIGHTBOUND_STYLE_V1` ;
- identifiant exact du slot géométrique ;
- nom exact ;
- dossier source et dossier runtime ;
- dimensions du canvas ;
- ratio ;
- zone utile ;
- marges maximales ;
- point d’ancrage ;
- mode `contain`, `cover` ou `nine-slice` ;
- format ;
- fond de détourage ;
- bloc de style canonique ;
- bloc d’exclusion canonique ;
- prompt complet ;
- asset de référence ;
- critères d’acceptation.

Règles de production :

- un seul asset par ticket ;
- trois candidats maximum par round ;
- contrôle technique avant intégration ;
- test à la taille réelle sur téléphone ;
- aucune série suivante avant validation de la série actuelle ;
- aucun fichier rejeté dans `runtime/`.

## Lot 6 — Validation automatique des assets

Contrôles prévus :

- noms ;
- extensions ;
- dimensions ;
- ratios ;
- poids ;
- canal alpha ;
- marges transparentes ;
- pixels magenta résiduels ;
- fichiers manquants ;
- doublons ;
- respect du Style ID et du slot géométrique.

## Lot 7 — Intégration des sprites

Les images seront appliquées au layout verrouillé sans modifier sa géométrie.

Ordre de diagnostic :

1. ratio du fichier ;
2. marges transparentes ;
3. point d’ancrage ;
4. mode de rendu ;
5. cohérence avec `RIGHTBOUND_STYLE_V1` ;
6. correction du fichier source.

## Lot 8 — Polish final

- animations de pression ;
- transitions ;
- feedback tactile ;
- notifications ;
- préchargement ;
- accessibilité ;
- optimisation Safari et Android WebView ;
- tests de régression visuelle ;
- suppression des anciens menus et CSS devenus inutiles.

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
  geometry-contract.json
  style-contract.json
  references/
  source/
  runtime/

docs/
  MENU_V3_ROADMAP.md
  MENU_V3_GEOMETRY_LOCK.md
  MENU_V3_ART_DIRECTION.md

tests/
  menu-v3-contract.mjs
  menu-v3-components-contract.mjs
  menu-v3-data-contract.mjs
  menu-v3-interactions-contract.mjs
  menu-v3-sync-contract.mjs
  menu-v3-geometry-contract.mjs
  menu-v3-style-contract.mjs
  mobile-platform-contract.mjs
```

Le pont V2 invisible reste utilisé uniquement pour la sélection et le lancement déjà éprouvés. Aucun sprite Menu V3 définitif n’est chargé.

## Statut actuel

- [x] Feuille de route enregistrée.
- [x] Lot 1 — Squelette mobile intégral.
- [x] Lot 2 — Composants temporaires.
- [x] Lot 3.1 — Données réelles.
- [x] Lot 3.2 — États des niveaux.
- [x] Lot 3.3 — Bouton Jouer et navigation.
- [x] Lot 3.4 — Synchronisation complète.
- [x] Lot 4 — Outils, contrat et verrou géométrique implémentés.
- [x] Lot 4 — Validation iPhone.
- [ ] Lot 4 — Validation Android et fermeture définitive.
- [x] Lot 5 — Charte artistique et contrat machine préparés.
- [ ] Lot 5 — Production des trois pilotes.
- [ ] Lot 5 — Production de la bibliothèque complète.
- [ ] Lot 6 — Validation automatique des assets.
- [ ] Lot 7 — Intégration.
- [ ] Lot 8 — Polish final.
