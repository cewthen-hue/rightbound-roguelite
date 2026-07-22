# Menu premium — manifeste des assets

Version du layout : `0.20.0`

Le menu fonctionne sans aucune image grâce aux fallbacks CSS. Dès qu’un fichier est ajouté au chemin indiqué, il est chargé automatiquement sans modifier le code.

## Direction commune

- Jeu mobile roguelite dark fantasy post-apocalyptique.
- Illustration 2D semi-réaliste stylisée et peinte à la main.
- Contours sombres propres, matières usées, métal noirci, cuir, vert olive et accents verts.
- Lumière principale venant du haut gauche.
- Contraste fort et silhouette lisible sur petit écran.
- Aucun texte dans les images.
- Aucun watermark.

## Personnage

| Clé | Chemin exact | Taille de production | Format | Fond | Utilisation |
|---|---|---:|---|---|---|
| Portrait | `assets/menu/hero/jack-portrait.webp` | 512 × 512 | WebP | opaque ou détouré dans le cadre | Barre supérieure |
| Héros complet | `assets/menu/hero/jack-menu-idle.webp` | 768 × 1024 | WebP | transparent | Scène centrale |

Le héros complet doit avoir des marges transparentes régulières, les pieds proches du bas de l’image et l’ensemble du corps visible.

## Monde 1

| Clé | Chemin exact | Taille de production | Format | Fond | Utilisation |
|---|---|---:|---|---|---|
| Décor principal | `assets/menu/worlds/world-01-faubourgs.webp` | 1024 × 1280 | WebP | opaque | Scène centrale |
| Atmosphère | `assets/menu/worlds/world-01-atmosphere.webp` | 1024 × 1280 | WebP | transparent | Fumée, poussière, braises |

Le centre du décor doit rester suffisamment dégagé pour accueillir Jack. Aucun personnage ne doit apparaître dans le décor principal.

## Cadres et boutons

| Clé | Chemin exact | Taille de production | Format | Fond |
|---|---|---:|---|---|
| Cadre central | `assets/menu/ui/frame-stage.png` | 768 × 1024 | PNG | transparent |
| Plaque du niveau | `assets/menu/ui/frame-level-plaque.png` | 768 × 180 | PNG | transparent |
| Panneau d’information | `assets/menu/ui/frame-info-panel.png` | 512 × 180 | PNG | transparent |
| Bouton Jouer | `assets/menu/ui/button-play.png` | 768 × 220 | PNG | transparent |
| Bouton Jouer pressé | `assets/menu/ui/button-play-pressed.png` | 768 × 220 | PNG | transparent |
| Bouton Jouer verrouillé | `assets/menu/ui/button-play-locked.png` | 768 × 220 | PNG | transparent |

Le bouton Jouer ne doit contenir aucun mot. Le texte reste produit en HTML.

## Nœuds des niveaux

Tous les nœuds sont carrés, strictement centrés, sans numéro et avec fond transparent.

| État | Chemin exact | Taille |
|---|---|---:|
| Normal | `assets/menu/ui/node-normal.png` | 256 × 256 |
| Sélectionné | `assets/menu/ui/node-selected.png` | 256 × 256 |
| Terminé | `assets/menu/ui/node-completed.png` | 256 × 256 |
| Verrouillé | `assets/menu/ui/node-locked.png` | 256 × 256 |
| Élite | `assets/menu/ui/node-elite.png` | 256 × 256 |
| Boss | `assets/menu/ui/node-boss.png` | 256 × 256 |

## Navigation inférieure

| Icône | Chemin exact | Taille |
|---|---|---:|
| Inventaire | `assets/menu/icons/nav-inventory.png` | 256 × 256 |
| Compétences | `assets/menu/icons/nav-skills.png` | 256 × 256 |
| Niveaux | `assets/menu/icons/nav-levels.png` | 256 × 256 |
| Coffres | `assets/menu/icons/nav-chests.png` | 256 × 256 |

## Petites icônes

| Icône | Chemin exact | Taille |
|---|---|---:|
| Options | `assets/menu/icons/settings.png` | 192 × 192 |
| Journal | `assets/menu/icons/journal.png` | 192 × 192 |
| Gold | `assets/menu/icons/gold.png` | 128 × 128 |
| Puissance | `assets/menu/icons/power.png` | 128 × 128 |
| Verrou | `assets/menu/icons/lock.png` | 128 × 128 |
| Terminé | `assets/menu/icons/check.png` | 128 × 128 |
| Élite | `assets/menu/icons/elite.png` | 128 × 128 |
| Boss | `assets/menu/icons/boss.png` | 128 × 128 |

## Coffres

Les quatre coffres doivent garder exactement la même caméra, la même silhouette et les mêmes proportions.

| Coffre | Chemin exact | Taille |
|---|---|---:|
| Bronze | `assets/menu/chests/chest-bronze.png` | 512 × 512 |
| Argent | `assets/menu/chests/chest-silver.png` | 512 × 512 |
| Or | `assets/menu/chests/chest-gold.png` | 512 × 512 |
| Diamant | `assets/menu/chests/chest-diamond.png` | 512 × 512 |

## Ordre recommandé de génération

1. Jack complet.
2. Portrait de Jack.
3. Décor des Faubourgs.
4. Atmosphère transparente.
5. Cadre central.
6. Plaque du niveau.
7. Bouton Jouer et ses deux variantes.
8. Six nœuds de niveau.
9. Quatre icônes de navigation.
10. Quatre coffres.
11. Petites icônes utilitaires.

## Compression

- Conserver les transparences en PNG lorsque les contours ou ombres doivent rester nets.
- Utiliser WebP pour les deux grandes illustrations et le personnage.
- Cible recommandée : décor inférieur à 450 Ko, héros inférieur à 250 Ko, chaque asset UI inférieur à 120 Ko.
- Ne jamais redimensionner les images directement à leur petite taille d’affichage : conserver les dimensions de production ci-dessus.
