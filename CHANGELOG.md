# Changelog

Toutes les modifications importantes du projet sont enregistrées ici.

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
