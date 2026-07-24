# Assets Menu V3

La géométrie du Lot 4 est définie en version `0.35.0-lot4`.

La direction artistique officielle est verrouillée sous l’identifiant :

`RIGHTBOUND_STYLE_V1`

Il s’agit d’un **RPG fantasy médiéval 2D cartoon premium conçu pour mobile**, et non d’un rendu semi-réaliste.

Ce dossier reste sans sprite définitif jusqu’à la validation des captures réelles iPhone et Android.

## Contrats

- géométrie : `geometry-contract.json` ;
- style : `style-contract.json` ;
- documentation géométrique : `docs/MENU_V3_GEOMETRY_LOCK.md` ;
- charte artistique : `docs/MENU_V3_ART_DIRECTION.md`.

## Structure de production prévue

```text
assets/menu-v3/
  references/
  source/
  runtime/
  geometry-contract.json
  style-contract.json
```

- `references/` contiendra uniquement les pilotes approuvés ;
- `source/` conservera les versions haute résolution ;
- `runtime/` contiendra uniquement les assets validés à au moins 9/10 et optimisés pour le jeu.

Les trois pilotes seront produits dans cet ordre :

1. `stage-background` ;
2. `stage-hero` ;
3. `stage-frame`.

Aucun lot massif, aucun sprite sheet de génération et aucun asset de l’ancien menu ne doivent être utilisés comme solution définitive.
