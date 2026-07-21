# Rightbound Roguelite

Roguelite mobile en portrait à défilement horizontal automatique, développé en HTML5 Canvas et JavaScript.

## Jouer

Version publiée avec GitHub Pages :

`https://cewthen-hue.github.io/rightbound-roguelite/`

Le jeu est conçu pour être lancé en portrait. Sur iPhone, utiliser **Safari → Partager → Sur l’écran d’accueil** afin de l’ouvrir comme une application, sans l’interface habituelle du navigateur.

## Boucle actuelle

- Le héros avance automatiquement vers la droite.
- Il s’arrête devant les ennemis et attaque automatiquement.
- Les ennemis ripostent.
- Le joueur utilise un saut/esquive, trois compétences et des objets rapides.
- Les éliminations donnent de l’XP et des pièces.
- Chaque niveau gagné propose trois améliorations roguelike.
- Le secteur se termine par un boss.
- Le menu principal affiche un plateau de progression avec le niveau 1 accessible.

## Expérience mobile

- Interface plein écran pensée comme une scène de jeu et non comme un site.
- Écran de lancement.
- Orientation portrait contrôlée.
- HUD et commandes tactiles fixes.
- Installation PWA.
- Cache local pour un lancement plus rapide et une base de fonctionnement hors ligne.
- Mode plein écran lorsque le navigateur le permet.
- Maintien de l’écran actif pendant une partie sur les appareils compatibles.

## Structure

```text
index.html
manifest.webmanifest
service-worker.js
styles/
  game.css
  menu.css
  app.css
src/
  game.js
  meta-menu.js
  app-shell.js
assets/
  icons/
  images/
  audio/
docs/
  GAME_DESIGN.md
  ROADMAP.md
CHANGELOG.md
```

## Workflow

1. Les décisions et demandes sont formulées dans ChatGPT.
2. La version officielle est modifiée et versionnée sur GitHub.
3. GitHub Pages republie automatiquement la branche `main`.
4. Les tests sont effectués sur téléphone depuis l’URL ou l’application installée.
5. Les bugs sont remontés avec une capture et, si possible, le message de console.

## Règle de version

La branche `main` contient toujours la version testable actuelle. Chaque changement important est décrit dans `CHANGELOG.md`.
