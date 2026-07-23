# Runtime de combat mobile

Version : `0.25.0`

## Objectifs

- Stabiliser les déplacements et le défilement sur Safari iPhone.
- Réduire le travail JavaScript et DOM effectué à chaque image.
- Conserver le gameplay, la progression, les équipements et les récompenses existantes.
- Garder l’architecture HTML5 Canvas sans introduire de moteur externe.

## Changements principaux

- Simulation à pas fixe de 60 Hz avec interpolation visuelle.
- Delta time plafonné et nombre maximal de rattrapages par frame.
- Canvas 2D créé avec les indicateurs `alpha: false` et `desynchronized: true`.
- Densité de rendu mobile plafonnée et ajustable automatiquement.
- Arrière-plan statique pré-rendu sur un canvas secondaire.
- Coordonnées de dessin arrondies pour réduire les vibrations visuelles.
- HUD synchronisé au maximum 12 fois par seconde et uniquement lorsque les valeurs changent.
- États des boutons et cooldowns modifiés uniquement lorsqu’ils changent réellement.
- Pools réutilisables pour les particules et les textes flottants.
- Limites de particules et de textes selon le niveau de qualité actif.
- Rendu suspendu lorsque le menu, une amélioration ou un résultat masque le combat.
- Suppression des flous CSS coûteux placés au-dessus du canvas en mouvement.
- ResizeObserver et redimensionnement regroupé dans une seule frame.

## Qualité adaptative

Le runtime commence en qualité `high` puis mesure le framerate pendant le combat.

- `high` : DPR maximal 1.5, effets complets.
- `balanced` : DPR maximal 1.25, effets réduits.
- `low` : DPR maximal 1, effets davantage limités.

Deux échantillons lents consécutifs abaissent la qualité. Quatre échantillons fluides consécutifs permettent une remontée progressive.

## Diagnostic

Une API de diagnostic est disponible dans la console :

```js
RightboundPerformance.getStats();
```

Forcer temporairement une qualité :

```js
RightboundPerformance.setQuality("high");
RightboundPerformance.setQuality("balanced");
RightboundPerformance.setQuality("low");
RightboundPerformance.setQuality("auto");
```

## Compatibilité conservée

Le reset du joueur utilise toujours `Object.assign` avec la structure attendue par `combat-runtime.js`. La création des ennemis continue d’utiliser `Array.prototype.push`, ce qui conserve l’application des statistiques d’équipement et de la difficulté du niveau.
