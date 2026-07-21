# Rightbound Roguelite

Prototype mobile en portrait d’un roguelite à défilement horizontal automatique.

## Boucle actuelle

- Le héros avance automatiquement vers la droite.
- Il s’arrête devant les ennemis et attaque automatiquement.
- Les ennemis ripostent.
- Le joueur utilise un saut/esquive, trois compétences et des objets rapides.
- Les éliminations donnent de l’XP et des pièces.
- Chaque niveau gagné propose trois améliorations roguelike.
- Le secteur se termine par un boss.

## Lancer le jeu

Ouvrir `index.html` dans un visualiseur HTML compatible JavaScript ou servir le dossier avec un serveur statique.

Le projet est pensé en priorité pour un téléphone en mode portrait.

## Structure

```text
index.html
styles/game.css
src/game.js
assets/images/
assets/audio/
docs/GAME_DESIGN.md
CHANGELOG.md
```

## Workflow du projet

1. Les décisions et demandes sont formulées dans ChatGPT.
2. Le code officiel est modifié et versionné sur GitHub.
3. Le jeu est testé sur téléphone avec un visualiseur HTML ou une URL statique.
4. Les bugs sont remontés avec une capture et le message de console.

## Règle de version

La branche `main` contient toujours la version testable actuelle. Chaque changement important est décrit dans `CHANGELOG.md`.
