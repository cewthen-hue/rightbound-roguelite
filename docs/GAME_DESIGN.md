# Game Design — Rightbound Roguelite

## Vision

Jeu mobile en portrait, immédiatement compréhensible, avec des parties courtes et une progression durable hors partie.

Le joueur contrôle un héros qui avance automatiquement vers la droite. Le cœur du jeu repose sur le timing des actions manuelles, la construction d’un build roguelike pendant la partie et l’amélioration permanente du compte entre les niveaux.

## Présentation mobile

- Orientation : portrait.
- Zone de jeu : environ 70 % supérieurs de l’écran.
- Interface d’action : environ 30 % inférieurs.
- Lecture simple à une main ou deux pouces.
- Actions principales toujours visibles.

## Boucle en partie

1. Le héros avance automatiquement.
2. Il rencontre un ennemi statique.
3. Le héros et l’ennemi échangent des attaques automatiques.
4. Le joueur utilise le saut, les compétences et les consommables.
5. L’ennemi donne XP et monnaie.
6. Une montée de niveau propose trois améliorations aléatoires.
7. La partie continue jusqu’au boss ou à la mort.

## Contrôles actuels

- Saut : esquive temporairement une attaque.
- Compétence 1 — Frappe : dégâts importants.
- Compétence 2 — Soin : restaure des PV.
- Compétence 3 — Onde : dégâts et étourdissement.
- Potion : soin consommable.

Ces compétences sont provisoires. À terme, le joueur choisira trois compétences à équiper avant le niveau.

## Progression roguelike pendant la partie

Améliorations actuelles :

- dégâts ;
- PV maximum ;
- vitesse d’attaque ;
- chance de critique ;
- dégâts critiques ;
- armure ;
- soin à l’élimination ;
- vitesse de déplacement ;
- puissance des compétences ;
- réduction des cooldowns.

## Progression permanente prévue

- Carte de niveaux à débloquer.
- Équipements permanents.
- Amélioration des équipements.
- Déblocage et amélioration des compétences.
- Emplacements d’objets.
- Ressources gagnées après les parties.
- Boss et biomes distincts.

## Principes de conception

- Les attaques automatiques créent un rythme constant.
- Les boutons manuels doivent avoir un impact visible.
- Les choix d’amélioration doivent modifier réellement le build.
- Les premières secondes doivent être jouables sans tutoriel long.
- Une partie perdue doit tout de même contribuer à la progression permanente.
