# Menu V3 — pipeline technique des assets

Version : `0.36.0-lot5.0`

Statut : actif sur GitHub. Aucun sprite définitif n’est encore requis.

Ce pipeline empêche qu’une image mal dimensionnée, mal détourée, trop lourde ou non déclarée soit intégrée silencieusement dans le Menu V3.

## Fichiers d’autorité

```text
assets/menu-v3/asset-manifest.json
assets/menu-v3/style-contract.json
assets/menu-v3/geometry-contract.json
scripts/validate-menu-v3-assets.mjs
tests/menu-v3-assets-contract.mjs
```

- `asset-manifest.json` définit chaque fichier attendu et ses contraintes techniques ;
- `style-contract.json` définit `RIGHTBOUND_STYLE_V1` ;
- `geometry-contract.json` définit le slot, le mode de rendu et l’ancre ;
- le validateur inspecte les fichiers réellement présents ;
- le test de contrat empêche la suppression accidentelle des règles essentielles.

## Bibliothèque déclarée

Le manifeste couvre 24 assets :

- trois pilotes : décor, Jack en pied et cadre de scène ;
- portrait de Jack ;
- Gold, Gemmes et Énergie ;
- Options et Journal ;
- ruban du monde ;
- Puissance et Récompense ;
- nodes normal, terminé, verrouillé, Élite, Boss et surbrillance sélectionnée ;
- cadre et icône du bouton Jouer ;
- quatre icônes du dock.

Chaque entrée contient :

- identifiant unique ;
- famille ;
- statut de production ;
- slot géométrique ;
- mode `contain`, `cover` ou `nine-slice` ;
- point d’ancrage ;
- chemin source ;
- chemin runtime ;
- format ;
- dimensions exactes ;
- règle de canal alpha ;
- poids maximal ;
- occupation minimale du canvas ;
- marge transparente maximale ;
- règle de contact avec les bords.

## Cycle de vie

### `planned`

L’asset est défini mais ses fichiers peuvent être absents. C’est le statut de toute la bibliothèque au démarrage du Lot 5.0.

Un fichier ajouté malgré le statut `planned` est tout de même contrôlé immédiatement.

### `candidate`

La version source haute résolution devient obligatoire. Le runtime peut encore être absent pendant la validation visuelle.

### `approved`

La source et le runtime deviennent tous les deux obligatoires. Le fichier runtime est alors autorisé à être chargé par le jeu.

### `retired`

L’asset ne doit plus exister dans `runtime/`.

## Modes de validation

### Validation incrémentale

```bash
npm run test:assets
```

- autorise l’absence des assets encore `planned` ;
- inspecte tous les fichiers déjà présents ;
- échoue dès qu’un fichier présent est non conforme.

C’est le mode exécuté actuellement par GitHub Actions.

### Validation stricte

```bash
npm run test:assets:strict
```

- exige les sources et runtimes de tous les assets non retirés ;
- sera activée lorsque la bibliothèque complète devra être considérée comme livrée.

### Rapport sans blocage

```bash
npm run report:assets
```

Produit les rapports mais ne renvoie pas de code d’échec. Ce mode sert uniquement au diagnostic local.

## Contrôles automatiques

### Structure du manifeste

- Style ID identique à `RIGHTBOUND_STYLE_V1` ;
- identifiants uniques ;
- chemins uniques ;
- statuts connus ;
- slots présents dans le contrat géométrique ;
- modes de rendu autorisés ;
- ancres valides ;
- ordre exact des trois pilotes.

### Présence des fichiers

- une source obligatoire pour un candidat ;
- source et runtime obligatoires pour un asset approuvé ;
- runtime interdit pour un asset retiré ;
- runtime interdit sans source maître ;
- fichier non déclaré interdit dans `source/` ou `runtime/`.

### Métadonnées d’image

Le validateur utilise `sharp` pour contrôler :

- image réellement décodable ;
- extension ;
- format interne ;
- largeur ;
- hauteur ;
- ratio ;
- nombre d’octets ;
- présence ou absence du canal alpha.

Renommer artificiellement un JPEG en PNG ne permet donc pas de passer le contrôle.

### Analyse des pixels

Pour les fichiers transparents :

- détection de la zone visible ;
- largeur et hauteur utiles minimales ;
- marge transparente sur chacun des quatre côtés ;
- détection d’un sujet qui touche le bord lorsque le slot exige une marge de sécurité ;
- rejet d’un fichier entièrement transparent.

Pour tous les fichiers :

- détection des pixels proches de `#FF00FF` ;
- tolérance technique de dix valeurs par canal ;
- aucun pixel magenta opaque autorisé dans un fichier final.

### Doublons

Chaque runtime reçoit une empreinte SHA-256. Deux assets runtime strictement identiques font échouer le contrôle.

Cela évite notamment qu’une même icône soit copiée sous plusieurs noms pour compléter artificiellement la bibliothèque.

## Rapports

Chaque exécution produit :

```text
artifacts/menu-v3-assets/report.json
artifacts/menu-v3-assets/report.md
```

Le rapport contient :

- statut global ;
- mode de validation ;
- nombre d’assets déclarés ;
- nombre de fichiers inspectés ;
- assets encore planifiés ;
- résultat par fichier ;
- métadonnées ;
- empreintes SHA-256 ;
- analyse des pixels ;
- erreurs et avertissements.

GitHub Actions conserve ces rapports pendant 14 jours, y compris lorsqu’un fichier échoue.

## Règles de production

1. Aucun fichier image ne doit être ajouté directement dans `runtime/` sans source correspondante.
2. Aucun nom libre n’est autorisé : le chemin doit déjà exister dans le manifeste.
3. Les dimensions sont celles du manifeste, pas celles proposées par le générateur d’images.
4. Le magenta sert uniquement d’étape de détourage et doit avoir entièrement disparu avant l’ajout au dépôt.
5. Une image refusée ne doit pas être renommée pour contourner le contrôle.
6. Une image approuvée conserve sa source haute résolution.
7. La géométrie HTML/CSS ne doit jamais être modifiée pour compenser une mauvaise image.
8. Le score artistique de 9/10 reste une validation humaine distincte du contrôle technique.

## Passage au Lot 5.1

Le pipeline étant installé, le Lot 5.1 pourra créer les tickets détaillés des trois pilotes :

1. `stage-background` ;
2. `stage-hero` ;
3. `stage-frame`.

Les tickets préciseront le contenu artistique et les prompts. Le manifeste du Lot 5.0 précise déjà les chemins, formats, dimensions, ancres et limites techniques.
