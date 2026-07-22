# Lot 4 — Build équipé et combat

Version de référence : `0.18.0`

## Source de vérité

- `src/items.js` décrit les statistiques brutes des 48 équipements.
- `src/player-profile.js` décrit les instances possédées et les six objets équipés.
- `src/build.js` calcule le build final, la puissance et les valeurs réellement injectées dans le combat.
- `src/combat-runtime.js` applique un instantané du build au lancement de chaque expédition et adapte les ennemis au niveau sélectionné.

Le build est verrouillé au début d’une expédition. Une modification d’équipement ne s’applique qu’à l’expédition suivante.

## Statistiques de base

| Statistique | Valeur |
|---|---:|
| Dégâts | 12 |
| Armure | 0 |
| PV | 100 |
| Critique naturel | 8 % |
| Délai d’attaque | 0,72 s |
| Vitesse de déplacement | 130 |
| Puissance des compétences | ×1,00 |
| Multiplicateur de recharge | ×1,00 |
| Potions gratuites | 0 |

## Conversion des équipements

- `damage` : ajouté directement aux dégâts de base.
- `armor` : ajouté directement à la réduction fixe de chaque attaque ennemie.
- `hp` : ajouté directement aux PV maximum.
- `critChance` : points de pourcentage ajoutés aux 8 % naturels, plafond 75 %.
- `attackSpeed` : réduit le délai d’attaque avec `0,72 / (1 + bonus / 100)`, plafond interne de 65 %.
- `speed` : augmente la vitesse de déplacement en pourcentage, plafond interne de 80 %.
- `power` : chaque point ajoute 5 % à la puissance des compétences.
- `cooldownReduction` : réduit le multiplicateur de recharge, plafond 50 %.
- `healing` : augmente les soins reçus en pourcentage, plafond 100 %.
- `dodge` : chance d’esquive passive en points de pourcentage, plafond 45 %.

Les améliorations roguelike temporaires sont appliquées après ces valeurs et continuent de disparaître à la fin du niveau.

## Puissance du build

La valeur affichée dans l’inventaire et le menu utilise exactement la même formule :

```text
Dégâts × 2
+ Armure × 3
+ PV au-dessus de 100 × 0,5
+ Puissance × 4
+ Vitesse × 1,5
+ Critique × 2
+ Vitesse d’attaque × 1,5
+ Réduction des recharges × 2
+ Soins
+ Esquive × 2
```

Exemples attendus :

- Épée de garnison seule : 16 dégâts, 100 PV, 0 armure, puissance 32.
- Épée de garnison + Casque du veilleur : 16 dégâts, 105 PV, 3 armure, puissance 44.

## Difficulté des niveaux

Les ennemis utilisent la puissance conseillée du niveau comme référence :

```text
ratio = puissanceConseillée / 30
PV ennemis = base × (0,78 + 0,22 × ratio)
dégâts ennemis = base × (0,88 + 0,12 × ratio)
```

Le délai d’attaque diminue légèrement à chaque niveau. Les niveaux Élite et Boss reçoivent des multiplicateurs supplémentaires. Le boss du niveau 10 reçoit un renforcement dédié.

## Matrice de validation manuelle

1. Nouvelle sauvegarde : le menu affiche une puissance de 32 avec l’Épée de garnison.
2. Lancer le niveau 1 : le HUD affiche 16 dégâts, 0 armure et 100 PV.
3. Ouvrir le premier coffre Bronze et équiper le Casque du veilleur.
4. Revenir au menu : la puissance passe à 44.
5. Relancer un niveau : le HUD affiche 16 dégâts, 3 armure et 105 PV.
6. Une attaque ennemie inflige trois points de moins qu’avec zéro armure, sans descendre sous un dégât.
7. Un équipement de critique augmente réellement la fréquence des critiques.
8. Un équipement de vitesse d’attaque réduit réellement l’intervalle entre deux attaques automatiques.
9. Un équipement de recharge réduit les délais affichés des compétences.
10. Un équipement d’esquive peut annuler une attaque et affiche `ESQUIVE`.
11. Les potions restent à zéro tant qu’aucun consommable n’est placé dans un emplacement rapide.
12. À build identique, un niveau élevé possède des ennemis plus résistants et plus dangereux qu’un niveau faible.
13. Changer d’équipement après une expédition ne modifie pas rétroactivement le résultat sauvegardé.

## Hors périmètre actuel

- Les capacités spéciales des objets légendaires marquées `planned` ne sont pas encore actives.
- Les apparences du héros ne changent pas encore selon les objets équipés.
- Les consommables réels et leurs charges seront ajoutés dans un système séparé.
