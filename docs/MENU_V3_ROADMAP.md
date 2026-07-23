# Menu V3 — feuille de route verrouillée

Version du plan : `1.8.0`
Direction visuelle : interface mobile fantasy RPG médiévale lumineuse, lisible et premium.
Référence : nouvelle maquette validée par le projet le 23 juillet 2026.

Ce document est la source de vérité du chantier Menu V3. Les lots doivent être réalisés dans l’ordre ci-dessous. Un lot n’est considéré terminé qu’après validation sur une capture réelle d’iPhone.

## Règles non négociables

1. Le Menu V3 est indépendant des anciens menus V1/V2 pendant sa construction.
2. Les systèmes existants restent conservés : progression, niveaux, inventaire, équipement, économie, coffres et combat.
3. Le layout définit toujours les dimensions. Un sprite ne doit jamais imposer ou modifier la géométrie.
4. Aucun empilement de feuilles `fix`, `final`, `polish` ou équivalent dans le V3.
5. Toutes les dimensions partagées sont centralisées dans `styles/menu-v3/menu-v3.tokens.css`.
6. Les textes, nombres et états restent en HTML. Ils ne sont jamais intégrés dans les images.
7. Les grands modules utilisent Grid/Flex. Le positionnement absolu est réservé aux couches internes de la scène.
8. Les sprites définitifs ne sont créés qu’après validation du Lot 4.
9. Un sprite mal cadré est corrigé dans le fichier source ; le layout ne doit pas être déplacé pour le compenser.
10. Chaque étape doit rester stable sur Safari iPhone et respecter les safe areas iOS.

## Lot 1 — Squelette mobile intégral

Objectif : obtenir toute la géométrie de l’écran sans sprite définitif.

Modules réservés dans une grille verticale unique :

1. safe area supérieure ;
2. top bar ;
3. en-tête du monde ;
4. carte principale du niveau ;
5. sélection des niveaux ;
6. bouton Jouer ;
7. navigation inférieure ;
8. safe area inférieure.

Livrables :

- shell Menu V3 isolé ;
- tokens globaux ;
- layout responsive ;
- mode debug des zones ;
- aucun scroll involontaire ;
- dock toujours visible ;
- aucune superposition entre modules.

Tailles de validation minimales :

- 360 × 780 ;
- 375 × 812 ;
- 390 × 844 ;
- 393 × 852 ;
- 430 × 932.

## Lot 2 — Composants HTML complets

Objectif : construire tous les composants avec des formes CSS temporaires.

Composants :

- profil de Jack ;
- niveau et XP ;
- capsules gold, gemmes et énergie ;
- Options et Journal ;
- ruban Monde 1 ;
- titre du monde ;
- bandeau de niveau ;
- badge de difficulté ;
- scène ;
- puissance conseillée ;
- récompense ;
- dix nodes ;
- légende ;
- bouton Jouer ;
- quatre onglets inférieurs : Expédition, Équipement, Coffres et Boutique.

## Lot 3 — Données et interactions

Objectif : connecter le Menu V3 aux systèmes réels.

Données et actions :

- niveau permanent du héros ;
- XP permanent ;
- golds ;
- gemmes ;
- énergie et coût d’expédition ;
- monde et niveau sélectionnés ;
- puissance recommandée ;
- puissance réelle ;
- coffre garanti ;
- niveaux terminés, verrouillés, élite et boss ;
- lancement du niveau ;
- navigation inférieure.

Sous-lots :

- Lot 3.1 : valeurs réelles et synchronisation des données ;
- Lot 3.2 : états réels des dix niveaux ;
- Lot 3.3 : bouton Jouer et navigation ;
- Lot 3.4 : synchronisation après tous les changements de jeu.

## Lot 4 — Validation et verrouillage géométrique

Objectif : valider le layout réel avant toute production de nouveaux sprites.

Le mode debug doit montrer :

- limites des composants ;
- centres ;
- safe areas ;
- points d’ancrage ;
- dimensions réelles ;
- débordements ;
- ratios des futures images.

Aucun sprite définitif ne doit être commandé avant validation écrite de ce lot.

## Lot 5 — Production des sprites définitifs

Objectif : fournir un contrat exact pour chaque image.

Chaque fiche d’asset doit contenir :

- nom exact ;
- dossier exact ;
- dimensions du canvas ;
- ratio ;
- zone utile ;
- marges maximales ;
- point d’ancrage ;
- type de rendu : fixe, recadrable ou 9-slice ;
- format ;
- fond de détourage ;
- prompt complet ;
- asset de référence à joindre.

## Lot 6 — Validation automatique des assets

Contrôles prévus :

- noms ;
- extensions ;
- dimensions ;
- ratios ;
- poids ;
- canal alpha ;
- marges transparentes ;
- fichiers manquants ;
- doublons.

## Lot 7 — Intégration des sprites

Objectif : appliquer les images au layout verrouillé sans modifier sa géométrie.

Ordre de diagnostic en cas de problème :

1. ratio du fichier ;
2. marges transparentes ;
3. point d’ancrage ;
4. règle `contain`, `cover` ou 9-slice ;
5. correction du fichier source.

## Lot 8 — Polish et remplacement définitif

Objectif : finaliser le vrai menu mobile.

- animations de pression ;
- transitions ;
- feedback tactile ;
- notifications ;
- préchargement ;
- accessibilité ;
- optimisation Safari ;
- tests de régression visuelle ;
- suppression des anciens menus et CSS devenus inutiles.

## Structure technique cible

```text
src/menu-v3/
  menu-v3-shell.js
  menu-v3-components.js
  menu-v3-data.js
  menu-v3-interactions.js

styles/menu-v3/
  menu-v3.tokens.css
  menu-v3.layout.css
  menu-v3.components.css
  menu-v3.responsive.css
  menu-v3.skin.css
  menu-v3.debug.css

assets/menu-v3/
  README.md
```

## Implémentation active

Version applicative : `0.32.0`

Fichiers actifs :

- `src/menu-v3/menu-v3-shell.js` ;
- `src/menu-v3/menu-v3-components.js` ;
- `src/menu-v3/menu-v3-data.js` ;
- `styles/menu-v3/menu-v3.tokens.css` ;
- `styles/menu-v3/menu-v3.layout.css` ;
- `styles/menu-v3/menu-v3.components.css` ;
- `styles/menu-v3/menu-v3.skin.css` ;
- `styles/menu-v3/menu-v3.responsive.css` ;
- `styles/menu-v3/menu-v3.debug.css` ;
- `tests/menu-v3-contract.mjs` ;
- `tests/menu-v3-components-contract.mjs` ;
- `tests/menu-v3-data-contract.mjs`.

Le shell V3 masque temporairement l’affichage V2, mais conserve celui-ci comme pont invisible pour le lancement d’un niveau et la sélection des dix niveaux. Aucun sprite Menu V3 définitif n’est utilisé.

### Lot 1 verrouillé

Le squelette mobile a été validé après quatre passes :

- grille verticale unique sans scroll ;
- scène centrale dominante ;
- sélection des niveaux compacte ;
- bouton Jouer renforcé ;
- dock à quatre onglets ;
- safe areas iOS absorbées ;
- ligne redondante `(Supérieur)` retirée du panneau de puissance ;
- géométrie protégée par un test structurel.

### Lot 2 — Composants temporaires

Implémentation réalisée :

- portrait temporaire de Jack construit uniquement en CSS ;
- nom, niveau et barre XP structurés ;
- trois capsules de ressources avec icône, valeur et bouton `+` ;
- panneaux Options et Journal avec état de notification ;
- ruban vert du monde et ornements du titre ;
- véritable cadre temporaire de carte ;
- décor médiéval lumineux provisoire construit en CSS ;
- silhouette temporaire de Jack ancrée au sol avec épée ;
- badge de difficulté ;
- panneaux puissance et récompense différenciés ;
- bouclier et coffre temporaires construits en CSS ;
- dix nodes avec états normal, terminé, disponible, verrouillé, élite, boss et sélectionné ;
- légende structurée ;
- bouton Jouer visuellement complet ;
- dock de quatre onglets avec onglet actif et notification Coffres ;
- mode debug désactivé par défaut, mais toujours accessible avec `RightboundMenuV3.setDebug(true)` ;
- aucune image chargée depuis `assets/menu-v3/` ;
- contrat CI dédié au Lot 2.

### Révisions Lot 2.1 et 2.2

Les captures réelles ont conduit aux ajustements suivants :

- espacement renforcé entre les trois capsules de ressources ;
- connecteurs décoratifs et boutons `+` réduits ;
- respiration augmentée sous le ruban `MONDE 1` ;
- personnage CSS temporaire ramené à environ 58 % de la scène ;
- icônes temporaires du dock uniformisées ;
- sélection des niveaux réduite à 74 px sur iPhone standard ;
- nodes ramenés à 32 × 40 px sur ce profil ;
- légende réduite et séparée des nodes ;
- bouton Jouer porté à 74 px sur ce même profil.

### Lot 3.1 — Données réelles

Implémentation réalisée :

- ajout de `src/menu-v3/menu-v3-data.js`, source unique des valeurs affichées dans le Menu V3 ;
- ajout d’une progression permanente du héros sauvegardée sous `rightbound-hero-progression-v1` ;
- niveau initial `1`, XP initiale `0 / 150` et courbe de seuils prête pour les futurs gains ;
- API `RightboundHeroProgression` avec lecture, écriture et ajout d’XP ;
- golds lus directement depuis `RightboundEconomy` ;
- gemmes et énergie maintenues explicitement à `0` jusqu’à la création de leurs systèmes ;
- coût d’expédition temporaire conservé à `10` sans bloquer le lancement ;
- niveau sélectionné, nom, puissance recommandée et coffre lus depuis `RightboundProgression` ;
- puissance réelle et état de préparation lus depuis `RightboundBuild` ;
- badge dynamique `SUPÉRIEUR`, `ADAPTÉ`, `UN PEU FAIBLE` ou `TRÈS FAIBLE` ;
- couleurs du badge et du panneau de puissance synchronisées avec l’état réel du build ;
- rafraîchissement automatique après changement d’économie, de progression, d’équipement, de build ou de sélection ;
- bindings HTML explicites protégés par les contrats automatiques ;
- écritures DOM conditionnelles afin d’éviter une boucle de mutations et des ralentissements Safari ;
- cache PWA aligné sur `0.32.0`.

Les états visuels des dix nodes restent provisoires jusqu’au Lot 3.2. Le bouton Jouer et les quatre onglets seront finalisés au Lot 3.3.

## Statut actuel

- [x] Feuille de route enregistrée.
- [x] Lot 1 — Squelette mobile intégral verrouillé.
- [x] Lot 2 — Composants HTML/CSS temporaires et révisions 2.1/2.2 validés.
- [x] Lot 3.1 — Valeurs réelles et synchronisation des données implémentées ; validation iPhone en attente.
- [ ] Lot 3.2 — États réels des niveaux.
- [ ] Lot 3.3 — Bouton Jouer et navigation.
- [ ] Lot 3.4 — Synchronisation complète après tous les changements de jeu.
- [ ] Lot 4 — Validation géométrique.
- [ ] Lot 5 — Production des sprites.
- [ ] Lot 6 — Validation automatique.
- [ ] Lot 7 — Intégration.
- [ ] Lot 8 — Polish final.
