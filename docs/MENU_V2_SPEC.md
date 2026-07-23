# Menu V2 — spécification structurelle

Version : `0.26.0`
Statut : phase 1, squelette complet

## Objectif

Reconstruire le menu principal selon la composition de référence sans empiler de nouveaux correctifs sur l’ancien layout. Les systèmes existants de progression, de build, d’économie, de coffres et d’inventaire restent inchangés.

## Architecture temporaire

Le Menu V2 est construit dans deux fichiers isolés :

- `src/menu-v2.js`
- `styles/menu-v2.css`

L’ancien menu reste monté mais invisible avec la classe `menu-v2-legacy-source`. Il sert temporairement de pont pour les actions existantes : sélection d’un niveau, flèches précédente/suivante et lancement d’une expédition. Cette méthode permet de reconstruire l’interface sans casser les récompenses ou la sauvegarde.

## Grille verticale

Le shell V2 réserve toujours une ligne à chacun des six modules :

1. barre du profil et des ressources ;
2. en-tête du monde ;
3. carte d’expédition unifiée ;
4. sélection des niveaux ;
5. action principale ;
6. dock inférieur à cinq onglets.

La hauteur du dock est réservée dans la grille. Il ne peut donc plus être repoussé hors de l’écran par les modules précédents.

## Modules de la phase 1

### Barre supérieure

- portrait de Jack ;
- nom, niveau et barre XP sur trois lignes ;
- trois ressources de dimensions identiques ;
- golds connectés à l’économie réelle ;
- gemmes et énergie conservées comme valeurs provisoires.

### En-tête du monde

- bouton Options ;
- titre Monde 1 / Les Faubourgs oubliés ;
- bouton Journal.

### Carte d’expédition unifiée

- plaque du niveau ;
- badge Normal, Élite ou Boss ;
- décor, atmosphère, Jack et cadre dans un seul module ;
- footer de zone en deux colonnes ;
- puissance et récompense intégrées au même bloc.

### Sélecteur

- titre « Sélection du niveau » ;
- dix niveaux simultanés ;
- flèches latérales ;
- états terminé, verrouillé, élite, boss et sélectionné ;
- légende dédiée.

### Action principale

- bouton normal ou verrouillé ;
- libellé principal et instruction séparés.

### Dock

- Expédition ;
- Héros ;
- Équipement ;
- Forge ;
- Boutique.

Les icônes du dock utilisent temporairement les sprites existants. Les sprites définitifs seront produits après validation de toute la géométrie.

## Responsive

Trois plages sont prévues :

- largeur standard jusqu’à 430 px ;
- téléphones étroits jusqu’à 370 px ;
- hauteurs courtes sous 790 px puis sous 700 px.

Les safe areas iOS sont absorbées par le shell et le dock.

## Données connectées dès cette phase

- golds permanents ;
- niveau sélectionné ;
- nom et type du niveau ;
- puissance recommandée ;
- puissance réelle et état de préparation ;
- coffre garanti ;
- niveau terminé, disponible ou verrouillé ;
- états des dix nodes ;
- lancement du niveau.

## Étape suivante

La phase 2 reconstruira précisément la top bar sur la base de captures réelles du Menu V2 : dimensions du portrait, grille identité/XP, largeur des capsules et alignement des boutons plus.
