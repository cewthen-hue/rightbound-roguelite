# Menu V3 — feuille de route verrouillée

Version du plan : `2.2.0`
Version applicative active : `0.35.0`
Direction visuelle : interface mobile fantasy RPG médiévale lumineuse, lisible et premium.
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

Statut : implémenté sur GitHub ; validation finale sur une capture réelle iPhone et une capture Android en attente.

## Lot 5 — Production des sprites définitifs

Le Lot 5 commencera uniquement après validation finale du Lot 4.

Chaque fiche devra contenir :

- nom exact ;
- dossier exact ;
- dimensions du canvas ;
- ratio ;
- zone utile ;
- marges maximales ;
- point d’ancrage ;
- mode `contain`, `cover` ou `nine-slice` ;
- format ;
- fond de détourage ;
- prompt complet ;
- asset de référence.

Tous les fichiers seront placés dans le dossier unique `assets/menu-v3/`.

## Lot 6 — Validation automatique des assets

Contrôles prévus :

- noms ;
- extensions ;
- dimensions ;
- ratios ;
- poids ;
- canal alpha ;
- marges transparentes ;
- fichiers manquants ;
- doublons.

## Lot 7 — Intégration des sprites

Les images seront appliquées au layout verrouillé sans modifier sa géométrie.

Ordre de diagnostic :

1. ratio du fichier ;
2. marges transparentes ;
3. point d’ancrage ;
4. mode de rendu ;
5. correction du fichier source.

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

docs/
  MENU_V3_ROADMAP.md
  MENU_V3_GEOMETRY_LOCK.md

tests/
  menu-v3-contract.mjs
  menu-v3-components-contract.mjs
  menu-v3-data-contract.mjs
  menu-v3-interactions-contract.mjs
  menu-v3-sync-contract.mjs
  menu-v3-geometry-contract.mjs
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
- [ ] Lot 4 — Validation finale sur captures réelles iPhone et Android.
- [ ] Lot 5 — Production des sprites.
- [ ] Lot 6 — Validation automatique des assets.
- [ ] Lot 7 — Intégration.
- [ ] Lot 8 — Polish final.
