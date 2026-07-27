# Assets Menu V3

La géométrie du Lot 4 est définie en version `0.35.0-lot4`, révision `0.35.1`.

La direction artistique officielle est verrouillée sous l’identifiant :

`RIGHTBOUND_STYLE_V1`

Il s’agit d’un **RPG fantasy médiéval 2D cartoon premium conçu pour mobile**, et non d’un rendu semi-réaliste.

Le pipeline technique des assets est actif en version :

`0.36.0-lot5.0`

Aucun sprite définitif n’est encore requis. Les fichiers déjà ajoutés sont toutefois contrôlés immédiatement.

## Contrats

- manifeste technique : `asset-manifest.json` ;
- géométrie : `geometry-contract.json` ;
- style : `style-contract.json` ;
- documentation du pipeline : `docs/MENU_V3_ASSET_PIPELINE.md` ;
- documentation géométrique : `docs/MENU_V3_GEOMETRY_LOCK.md` ;
- charte artistique : `docs/MENU_V3_ART_DIRECTION.md`.

## Structure de production

```text
assets/menu-v3/
  references/
  source/
  runtime/
  asset-manifest.json
  geometry-contract.json
  style-contract.json
```

- `references/` contient uniquement les références officiellement approuvées ;
- `source/` conserve les versions maîtres haute résolution ;
- `runtime/` contient uniquement les fichiers optimisés autorisés à être chargés par le jeu ;
- `asset-manifest.json` définit les noms, formats, dimensions, ancres et limites techniques des 24 assets.

## Validation

```bash
npm run test:assets
npm run test:assets:strict
npm run report:assets
```

Le contrôle incrémental accepte que les assets encore `planned` soient absents, mais refuse immédiatement tout fichier présent qui ne respecte pas le manifeste.

Les contrôles couvrent notamment :

- dimensions et ratio ;
- format réel ;
- poids ;
- canal alpha ;
- marges transparentes ;
- contact avec les bords ;
- pixels magenta résiduels ;
- doublons SHA-256 ;
- fichiers non déclarés ;
- runtime sans source maître.

Les trois pilotes seront produits dans cet ordre :

1. `stage-background` ;
2. `stage-hero` ;
3. `stage-frame`.

Aucun lot massif, aucun sprite sheet de génération et aucun asset de l’ancien menu ne doivent être utilisés comme solution définitive.
