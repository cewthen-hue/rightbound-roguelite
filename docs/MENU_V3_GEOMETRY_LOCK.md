# Menu V3 — verrouillage géométrique Lot 4

Contrat : `0.35.0-lot4`

Révision géométrique active : `0.35.1`

Statut : première capture iPhone contrôlée et corrigée ; seconde capture iPhone et validation Android encore requises avant le Lot 5.

## Révision iPhone du 24 juillet 2026

La première capture réelle a confirmé la stabilité générale du menu : scène dominante, dix niveaux visibles, bouton Rejouer lisible, panneaux de puissance et de récompense correctement contenus et dock utilisable.

Deux défauts ont empêché la validation finale immédiate :

1. la valeur des golds était tronquée en `3…` dans la première capsule ;
2. une continuation inférieure fixe de 64 px doublait la réserve iPhone et créait une bande vide sous le dock.

La révision `0.35.1` :

- réserve davantage de largeur numérique à la capsule Gold ;
- réduit légèrement l’icône et le bouton `+` des trois ressources ;
- conserve des colonnes plus compactes pour Gemmes et Énergie ;
- supprime la continuation inférieure fixe redondante ;
- conserve la vraie safe area dans la hauteur du dock et dans le padding des boutons ;
- ne modifie ni la scène, ni les niveaux, ni le bouton principal, ni les slots des futurs sprites.

## Autorité des fichiers

La géométrie finale avant sprites est définie dans cet ordre :

1. `styles/menu-v3/menu-v3.tokens.css` — valeurs partagées ;
2. `styles/menu-v3/menu-v3.layout.css` — structure générale ;
3. `styles/menu-v3/menu-v3.responsive.css` — adaptations existantes ;
4. `styles/menu-v3/menu-v3.geometry.css` — autorité finale du Lot 4 ;
5. `styles/menu-v3/menu-v3.debug.css` — visualisation uniquement.

Les sprites du Lot 5 devront s’adapter à cette géométrie. Ils ne devront jamais déplacer un module, modifier une ligne de grille ou imposer leur propre taille au menu.

## Profils de validation

Le validateur runtime reconnaît les cinq profils de référence :

| Profil | Largeur | Hauteur |
|---|---:|---:|
| Compact Android | 360 px | 780 px |
| iPhone compact | 375 px | 812 px |
| iPhone standard | 390 px | 844 px |
| iPhone standard haut | 393 px | 852 px |
| Grand téléphone | 430 px | 932 px |

Les formats proches sont associés automatiquement au profil le plus proche. La largeur du shell ne doit jamais dépasser `430 px`.

## Modules mesurés

Le runtime mesure et contrôle :

- barre supérieure ;
- en-tête du monde ;
- carte principale ;
- en-tête de la carte ;
- scène ;
- statistiques ;
- sélection des niveaux ;
- action principale ;
- dock inférieur.

Pour chaque module, le rapport contient la position, la largeur, la hauteur, le ratio, le centre, les dépassements internes et les sorties éventuelles hors du shell.

## Safe areas

- Haut : `max(6px, env(safe-area-inset-top))`.
- Bas : `max(7px, env(safe-area-inset-bottom))`.
- La hauteur du dock augmente avec la safe area inférieure.
- Le contenu du dock ne doit jamais passer sous l’indicateur d’accueil iPhone.
- Le fond général couvre déjà le bord physique de l’écran ; aucune continuation fixe supplémentaire n’est autorisée.

## Emplacement de Jack

Le futur sprite complet de Jack possède un emplacement indépendant dans la scène :

- largeur : `28 %` de la scène ;
- hauteur : `70 %` de la scène ;
- distance du bas : `3 %` ;
- ancre : centre bas `50 % 100 %` ;
- mode : `contain`.

Le point situé entre les pieds du personnage devra correspondre à l’ancre basse du fichier final.

## Contrat des futurs assets

Le contrat machine est enregistré dans :

`assets/menu-v3/geometry-contract.json`

Modes autorisés :

- `contain` : l’image entière reste visible ;
- `cover` : l’image remplit la zone et peut être recadrée ;
- `nine-slice` : les bordures restent fixes et le centre peut s’étirer.

Groupes d’emplacements définis :

- portrait de Jack ;
- trois ressources ;
- Options et Journal ;
- ruban du monde ;
- fond, Jack et cadre de scène ;
- puissance et récompense ;
- dix cases de niveau ;
- cadre et icône du bouton Jouer ;
- quatre icônes du dock.

Aucun fichier image définitif n’est encore chargé.

## Validateur runtime

Le module `src/menu-v3/menu-v3-geometry.js` produit un rapport contenant :

- dimensions du viewport ;
- profil de téléphone le plus proche ;
- safe areas réellement mesurées ;
- dimensions et centres des modules ;
- dimensions, ratios et ancres des futurs assets ;
- dépassements de texte ;
- éléments hors du shell ;
- cibles tactiles sous 44 px ;
- statut `pass`, `warning` ou `fail`.

Commandes disponibles dans la console :

```js
RightboundMenuV3Geometry.setDebug(true)
RightboundMenuV3Geometry.measure()
RightboundMenuV3Geometry.getReport()
RightboundMenuV3Geometry.exportReport()
RightboundMenuV3Geometry.setDebug(false)
```

Le mode debug affiche :

- limites des modules ;
- axes centraux ;
- centres des modules ;
- ancres des assets ;
- bandes de safe area ;
- dimensions mesurées ;
- éléments en dépassement signalés en rouge.

## Critères d’acceptation

Le Lot 4 peut être validé définitivement lorsque, sur au moins un iPhone et un Android :

1. aucun scroll vertical ou horizontal n’apparaît ;
2. aucun module ne sort du shell ;
3. aucun texte utile n’est tronqué ;
4. le dock reste entièrement utilisable au-dessus de la safe area sans bande vide artificielle ;
5. les dix niveaux restent visibles ;
6. le bouton Jouer reste visible et suffisamment grand ;
7. la scène conserve la plus grande surface de l’écran ;
8. le rapport ne contient aucune erreur géométrique ;
9. les avertissements éventuels sont uniquement les exceptions compactes prévues pour les nodes et les petits boutons `+` ;
10. les captures réelles correspondent à la direction visuelle validée avant la production des sprites.

## Règle après validation

Après validation finale du Lot 4, les changements de dimensions nécessiteront une réouverture explicite du verrou géométrique. Le Lot 5 devra uniquement produire les images correspondant aux emplacements enregistrés.
