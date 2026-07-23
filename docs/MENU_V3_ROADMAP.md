# Menu V3 — feuille de route verrouillée

Version du plan : `2.1.0`
Direction visuelle : interface mobile fantasy RPG médiévale lumineuse, lisible et premium.
Référence : nouvelle maquette validée par le projet le 23 juillet 2026.
Plateformes cibles : iPhone et Android, avec publication Android prévue sur Google Play.
Orientation cible : portrait uniquement.

Ce document est la source de vérité du chantier Menu V3. Les lots doivent être réalisés dans l’ordre ci-dessous. Un lot n’est considéré terminé qu’après validation sur une capture réelle de téléphone.

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
10. Chaque étape doit rester stable sur Safari iPhone et sur Android moderne, avec respect des safe areas.
11. Rightbound reste en portrait : aucun écran demandant de tourner le téléphone ne doit être affiché.
12. La future application Android publiée sur Google Play devra également verrouiller le portrait dans sa configuration native.
13. Une donnée modifiée hors du menu doit être réconciliée automatiquement lors du retour au menu, sans rechargement manuel.

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
- optimisation Safari et Android WebView ;
- tests de régression visuelle ;
- suppression des anciens menus et CSS devenus inutiles.

## Sortie mobile

La base HTML reste commune aux deux plateformes.

- iPhone : Safari et application web installée pendant le développement ; emballage App Store étudié après stabilisation du jeu.
- Android : navigateur, application web installée puis emballage natif pour Google Play.
- PWA : `manifest.webmanifest` demande `portrait-primary`.
- Runtime : `src/app-shell.js` tente le verrouillage portrait via Screen Orientation API lorsque la plateforme l’autorise.
- Android Google Play : le futur projet natif devra déclarer explicitement l’orientation portrait dans son manifeste Android.
- L’ancien écran « Tourne ton téléphone » est supprimé.

## Structure technique cible

```text
src/menu-v3/
  menu-v3-shell.js
  menu-v3-components.js
  menu-v3-data.js
  menu-v3-interactions.js
  menu-v3-sync.js

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

Version applicative : `0.34.0`

Fichiers actifs :

- `src/menu-v3/menu-v3-shell.js` ;
- `src/menu-v3/menu-v3-components.js` ;
- `src/menu-v3/menu-v3-data.js` ;
- `src/menu-v3/menu-v3-interactions.js` ;
- `src/menu-v3/menu-v3-sync.js` ;
- `styles/menu-v3/menu-v3.tokens.css` ;
- `styles/menu-v3/menu-v3.layout.css` ;
- `styles/menu-v3/menu-v3.components.css` ;
- `styles/menu-v3/menu-v3.skin.css` ;
- `styles/menu-v3/menu-v3.responsive.css` ;
- `styles/menu-v3/menu-v3.debug.css` ;
- `tests/menu-v3-contract.mjs` ;
- `tests/menu-v3-components-contract.mjs` ;
- `tests/menu-v3-data-contract.mjs` ;
- `tests/menu-v3-interactions-contract.mjs` ;
- `tests/menu-v3-sync-contract.mjs` ;
- `tests/mobile-platform-contract.mjs`.

Le shell V3 masque temporairement l’affichage V2. Le pont invisible V2 reste utilisé uniquement pour déclencher la sélection et le lancement déjà éprouvés. Les données visibles, les interactions et la réconciliation après changement appartiennent désormais aux modules V3 dédiés. Aucun sprite Menu V3 définitif n’est utilisé.

### Lot 1 verrouillé

Le squelette mobile a été validé après quatre passes :

- grille verticale unique sans scroll ;
- scène centrale dominante ;
- sélection des niveaux compacte ;
- bouton Jouer renforcé ;
- dock à quatre onglets ;
- safe areas absorbées ;
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
- dix nodes structurés ;
- légende structurée ;
- bouton Jouer visuellement complet ;
- dock de quatre onglets avec onglet actif et notification Coffres ;
- mode debug désactivé par défaut, mais toujours accessible avec `RightboundMenuV3.setDebug(true)` ;
- aucune image chargée depuis `assets/menu-v3/`.

### Révisions Lot 2.1 et 2.2

Les captures réelles ont conduit aux ajustements suivants :

- espacement renforcé entre les trois capsules de ressources ;
- connecteurs décoratifs et boutons `+` réduits ;
- respiration augmentée sous le ruban `MONDE 1` ;
- personnage CSS temporaire ramené à environ 58 % de la scène ;
- icônes temporaires du dock uniformisées ;
- sélection des niveaux réduite à 74 px sur téléphone standard ;
- nodes ramenés à 32 × 40 px sur ce profil ;
- légende réduite et séparée des nodes ;
- bouton Jouer porté à 74 px sur ce même profil.

### Lot 3.1 — Données réelles

Implémentation réalisée :

- source unique `src/menu-v3/menu-v3-data.js` ;
- progression permanente du héros sous `rightbound-hero-progression-v1` ;
- niveau initial `1`, XP initiale `0 / 150` et courbe de seuils ;
- golds lus depuis `RightboundEconomy` ;
- gemmes et énergie maintenues à `0` ;
- coût d’expédition temporaire à `10` sans blocage ;
- niveau, puissance recommandée et coffre lus depuis `RightboundProgression` ;
- puissance réelle et préparation lues depuis `RightboundBuild` ;
- rafraîchissement automatique et écritures DOM conditionnelles.

### Lot 3.2 — États réels des niveaux

Implémentation réalisée :

- suppression définitive des états de démonstration codés en dur ;
- lecture des dix niveaux depuis `RightboundProgression.levels` ;
- calcul réel de chaque état : `completed`, `available` ou `locked` ;
- sélection réelle synchronisée avec le niveau consulté ;
- types `normal`, `elite` et `boss` issus des données du niveau ;
- textes d’accessibilité dynamiques pour chaque node ;
- consultation maintenue pour les niveaux verrouillés sans les rendre jouables ;
- niveau verrouillé sélectionné conservant une apparence verrouillée au lieu de devenir vert ;
- variantes violette Élite et rouge Boss préservées lorsqu’elles sont sélectionnées ;
- mise à jour instantanée après victoire et déblocage ;
- tests automatiques empêchant le retour des faux états du Lot 2.

### Lot 3.3 — Bouton Jouer et navigation

Implémentation réalisée :

- création de `src/menu-v3/menu-v3-interactions.js` ;
- suppression des écouteurs de clic du shell structurel afin d’éviter les doubles lancements ;
- bouton `JOUER` pour un niveau disponible ;
- bouton `REJOUER` pour un niveau terminé ;
- bouton `VERROUILLÉ` avec instruction indiquant le niveau précédent à terminer ;
- masquage du coût d’énergie lorsqu’un niveau est verrouillé ;
- lancement relié à la logique d’expédition existante sans dupliquer les runs ;
- onglet Équipement relié à l’inventaire réel ;
- onglet Coffres relié à l’écran de coffres réel ;
- notification Coffres reliée au nombre réellement disponible ;
- onglet Expédition conservé comme onglet actif ;
- onglet Boutique relié à une réponse explicite en attendant son système dédié ;
- messages cohérents pour Options, Journal et les boutons de ressources encore provisoires ;
- feedback vibratoire léger lorsqu’il est supporté par Android ;
- styles distincts pour les états disponible, rejouable et verrouillé ;
- contrat automatique dédié au Lot 3.3.

### Lot 3.4 — Réconciliation complète

Implémentation réalisée :

- création de `src/menu-v3/menu-v3-sync.js`, coordinateur unique de synchronisation ;
- détection des vues Expédition, Combat, Résultat, Équipement, Coffres, Amélioration et Dialogue ;
- mémorisation des changements effectués lorsque le menu n’est pas visible ;
- réconciliation automatique dès le retour à l’écran Expédition ;
- reprise des récompenses de run interrompues avant de rafraîchir l’interface ;
- synchronisation en deux frames afin de laisser le shell, les composants, les données et les interactions se stabiliser dans le bon ordre ;
- actualisation après victoire, défaite, golds, progression, changement d’équipement, changement de puissance, gain ou ouverture de coffre et progression permanente ;
- stock réel des coffres intégré au snapshot central ;
- partage du même snapshot entre les textes du menu, le bouton Jouer et la notification Coffres ;
- rafraîchissement après retour depuis l’inventaire ou les coffres ;
- rafraîchissement au retour dans l’application, au changement de visibilité, au focus et après une modification de sauvegarde ;
- marqueur de révision et événement `rightbound:menu-v3-sync-complete` pour diagnostiquer les synchronisations ;
- protection contre les boucles de MutationObserver et contre l’écoute du propre événement de reconstruction du shell ;
- mise à jour du cache PWA en version `0.34.0` ;
- contrat automatique dédié au Lot 3.4.

### Orientation portrait

- orientation PWA passée à `portrait-primary` ;
- tentative de verrouillage runtime au chargement, après geste utilisateur, en plein écran et au retour dans l’application ;
- suppression de l’écran demandant de tourner le téléphone ;
- contrat automatique commun iPhone/Android ajouté ;
- verrouillage natif Android réservé à la phase d’emballage Google Play.

## Statut actuel

- [x] Feuille de route enregistrée.
- [x] Lot 1 — Squelette mobile intégral verrouillé.
- [x] Lot 2 — Composants HTML/CSS temporaires et révisions 2.1/2.2 validés.
- [x] Lot 3.1 — Valeurs réelles et synchronisation des données implémentées.
- [x] Lot 3.2 — États réels des niveaux implémentés.
- [x] Lot 3.3 — Bouton Jouer et navigation implémentés.
- [x] Lot 3.4 — Synchronisation complète implémentée ; validation sur téléphone en attente.
- [ ] Lot 4 — Validation géométrique.
- [ ] Lot 5 — Production des sprites.
- [ ] Lot 6 — Validation automatique.
- [ ] Lot 7 — Intégration.
- [ ] Lot 8 — Polish final.
