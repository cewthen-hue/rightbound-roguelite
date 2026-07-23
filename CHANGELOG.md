# Changelog

Toutes les modifications importantes du projet sont enregistrées ici.

## [0.35.0] — 2026-07-24

### Menu V3 — Lot 4 : verrouillage géométrique

- Ajout de `styles/menu-v3/menu-v3.geometry.css` comme autorité finale du layout avant les sprites.
- Verrouillage des safe areas supérieure et inférieure, avec hauteur de dock adaptée à l’indicateur d’accueil iPhone.
- Définition de cinq profils de validation : 360×780, 375×812, 390×844, 393×852 et 430×932.
- Ajout de `src/menu-v3/menu-v3-geometry.js` pour mesurer dimensions, centres, ratios, ancres, débordements, textes et cibles tactiles.
- Ajout des statuts géométriques `pass`, `warning` et `fail` et d’un rapport exportable.
- Extension du mode debug avec axes centraux, safe areas, dimensions, ancres et signalement rouge des anomalies.
- Déclaration de tous les futurs emplacements d’assets via `data-v3-asset-slot`, sans charger de sprite définitif.
- Verrouillage de l’emplacement futur de Jack à 28 % × 70 % de la scène, ancré au centre bas.
- Ajout du contrat machine `assets/menu-v3/geometry-contract.json`.
- Ajout de la documentation `docs/MENU_V3_GEOMETRY_LOCK.md`.
- Ajout du test automatique `tests/menu-v3-geometry-contract.mjs` et intégration aux GitHub Actions.
- Mise à jour du cache PWA en version `0.35.0`.

## [0.31.1] — 2026-07-23

### Menu V3 — révision complète du Lot 2

- Espacement renforcé entre les capsules Or, Gemmes et Énergie.
- Réduction des boutons `+` et des connecteurs décoratifs afin de supprimer l’impression de chevauchement dans la top bar.
- Ajout d’une respiration verticale plus nette entre le ruban `MONDE 1` et le titre du monde.
- Réduction du personnage CSS temporaire à environ 58 % de la hauteur de scène pour mieux représenter le futur sprite.
- Agrandissement léger de la légende des niveaux sur iPhone, avec variantes dédiées aux petits écrans.
- Uniformisation visuelle des quatre emplacements d’icônes dans le dock inférieur.
- Remplacement du symbole temporaire Coffres par une forme carrée plus lisible.
- Activation du fichier d’architecture prévu `styles/menu-v3/menu-v3.skin.css`.
- Mise à jour des contrats automatiques et du cache PWA en version `0.31.1`.

## [0.31.0] — 2026-07-23

### Menu V3 — composants temporaires du Lot 2

- Construction HTML/CSS du profil, des ressources, de l’en-tête du monde, de la carte, des statistiques, des niveaux, du bouton Jouer et du dock.
- Ajout d’un décor médiéval lumineux et d’un personnage temporaires entièrement en CSS.
- Ajout des états visuels terminé, disponible, verrouillé, élite, boss et sélectionné.
- Désactivation du mode debug par défaut tout en conservant son accès manuel.
- Aucun sprite définitif chargé avant le Lot 5.

## [0.24.0] — 2026-07-22

### Lisibilité et équilibrage du menu des niveaux

- Rééquilibrage de toutes les lignes du menu pour laisser davantage d’espace aux informations, au sélecteur et à la navigation.
- Alignement plus précis du portrait, du nom, du niveau, de l’expérience et des trois ressources dans la barre supérieure.
- Suppression du compteur de progression redondant qui flottait au-dessus de la scène.
- Agrandissement du titre du monde et des libellés Options et Journal.
- Repositionnement de la plaque du niveau et meilleure intégration du badge Normal, Élite ou Boss.
- Ancrage du personnage dans le décor avec suppression de son flottement et ajout d’une ombre de contact discrète.
- Agrandissement du footer de scène et de ses textes.
- Renforcement de la hiérarchie du panneau de puissance et de récompense.
- Agrandissement des cases de niveau, des flèches, des statuts et de la légende.
- Agrandissement du bouton principal et de son instruction contextuelle.
- Recalibrage du dock inférieur avec icônes, labels et contrastes plus lisibles.
- Ajout d’adaptations dédiées aux téléphones étroits et aux faibles hauteurs Safari.
- Mise à jour du cache PWA en version `0.24.0`.

## [0.20.0] — 2026-07-22

### Stabilisation complète du menu premium

- Suppression physique des anciens immeubles, silhouettes et éléments procéduraux responsables des grands triangles noirs.
- Reconstruction des fallbacks de décor et de personnage dans des couches strictement contenues dans la scène.
- Réorganisation complète des z-index afin que le décor, l’atmosphère, Jack, le cadre, la plaque et les textes ne puissent plus se recouvrir incorrectement.
- Suppression de la dépendance à `:has()` pour masquer les anciens éléments visuels.
- Correction du titre du monde avec retour à la ligne contrôlé et dimensions adaptatives.
- Simplification de la barre supérieure : suppression des libellés trop longs dans les blocs Golds et Puissance.
- Agrandissement des textes secondaires, des informations de puissance, de la légende et des libellés de navigation.
- Remplacement des libellés latéraux trop étroits par `Options` et `Journal`.
- Suppression des informations répétées autour du bouton Jouer ; le bouton affiche maintenant une instruction contextuelle intégrée.
- Amélioration de l’affichage des dix niveaux, y compris lorsqu’un niveau verrouillé, Élite ou Boss est sélectionné.
- Renforcement des comportements responsive pour petits écrans et faibles hauteurs Safari.
- Connexion automatique des futures images de panneaux, ressources et utilitaires prévues dans le manifeste.
- Mise à jour du cache PWA en version `0.20.0`.

## [0.19.0] — 2026-07-22

### Layout premium du menu des niveaux

- Refonte complète de la composition portrait du menu des niveaux en conservant toute la progression existante.
- Nouvelle barre supérieure avec portrait de Jack, progression du Monde 1, golds et puissance réelle du build.
- Ajout d’une présentation centrale du monde avec raccourcis Paramètres et Journal, sans ajouter de boutique, énergie ou pack payant fictif.
- Reconstruction de la scène du niveau avec plaque dédiée, décor provisoire, héros provisoire, cadre renforcé et atmosphère animée.
- Ajout d’un panneau compact combinant puissance conseillée, état du build et coffre garanti.
- Nouvelle navigation présentant les dix niveaux simultanément, avec états normal, sélectionné, terminé, verrouillé, Élite et Boss.
- Ajout d’une légende de progression et d’un bouton Jouer principal plus lisible.
- Activation du bouton Inventaire dans la navigation inférieure et conservation des onglets Compétences, Niveaux et Coffres.
- Ajout de `src/menu-assets.js`, manifeste central permettant aux futurs sprites d’apparaître automatiquement dès qu’ils sont ajoutés aux chemins prévus.
- Ajout de `src/menu-layout.js`, couche d’amélioration non destructive préservant la logique du menu, des coffres, du build et du déblocage des niveaux.
- Ajout de fallbacks CSS complets pour que le layout soit testable avant la production des images.
- Ajout de `docs/MENU_ASSET_MANIFEST.md` avec les noms de fichiers, dimensions, formats et ordre de génération de tous les futurs assets.
