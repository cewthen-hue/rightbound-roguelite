# Changelog

Toutes les modifications importantes du projet sont enregistrées ici.

## [0.15.0] — 2026-07-22

### Profil joueur et inventaire initial

- Ajout d’un profil joueur persistant dans `src/player-profile.js`.
- Remplacement de l’ancienne sauvegarde par des instances d’objets uniques avec `uid`, identifiant de catalogue, niveau, source et date d’obtention.
- Nouvelle partie démarrant uniquement avec l’`Épée de garnison`, directement équipée dans l’emplacement Arme.
- Suppression des onze équipements et consommables provisoires autrefois injectés automatiquement dans l’inventaire.
- Sac à dos vide, emplacements de potions vides et cinq autres emplacements d’équipement vides au démarrage.
- Migration automatique et unique de l’ancien inventaire `rightbound-inventory-v3` vers le nouveau profil.
- Conservation des sauvegardes existantes de golds, coffres et progression des niveaux pendant la migration.
- Sauvegarde immédiate des déplacements et échanges d’équipements entre le sac et les emplacements du héros.
- Prise en charge future de plusieurs exemplaires du même objet grâce aux identifiants d’instance.
- Ajout d’une API centralisée pour accorder un objet, vérifier la place libre, lire l’équipement et calculer les statistiques du build.
- Recalcul de l’inventaire à partir des statistiques réelles des objets équipés.
- Mise à jour du cache PWA en version `0.15.0`.

## [0.14.0] — 2026-07-22

### Icônes et caractéristiques des équipements

- Liaison exacte des fichiers `assets/icons/1.png` à `assets/icons/48.png` avec les 48 équipements, dans l’ordre validé des prompts.
- Ajout de statistiques chiffrées à chaque fiche : dégâts, armure, PV, puissance, vitesse et bonus secondaires selon l’objet.
- Ajout d’une description de statistiques générée automatiquement et d’un score de puissance indicatif.
- Validation automatique de la présence d’une fiche de caractéristiques et du bon numéro d’image pour chaque objet.
- Affichage des PNG transparents dans les cases d’inventaire et dans la fiche de l’objet sélectionné.
- Connexion du catalogue central à l’inventaire sans ajouter automatiquement les 48 objets au sac.
- Ajout de `RightboundInventory.grantItem(itemId)` pour permettre aux coffres d’attribuer plus tard un objet et de sauvegarder sa possession.
- Conservation du comportement actuel des coffres : aucun taux de drop d’objet n’est encore activé.
- Mise à jour du cache PWA afin de charger immédiatement les nouvelles données sur mobile.

## [0.13.0] — 2026-07-22

### Catalogue d’équipements

- Ajout d’un catalogue central de 48 équipements chargé au démarrage du jeu.
- Ajout de huit objets pour chacun des six emplacements : arme, casque, armure, relique/cape, bottes et bijou.
- Répartition uniforme entre les raretés commune, rare, épique et légendaire.
- Ajout de l’Épée de Mamah31 en rareté épique et de l’Arc de Tiror en rareté rare.
- Ajout d’une description visuelle prête à servir pour la future génération des icônes.
- Déclaration d’une capacité spéciale planifiée pour chacun des douze objets légendaires.
- Préparation des champs `image` et `drop` sans attribuer encore d’illustration ni de chance d’apparition.
- Ajout d’une API globale `RightboundItemCatalog` permettant aux futurs coffres et écrans d’interroger le catalogue.
- Validation automatique du nombre d’objets par emplacement et par rareté.
- Mise à jour du cache PWA pour charger le catalogue sur mobile.

## [0.8.0] — 2026-07-21

### Géométrie de l’inventaire

- Reconstruction de la mise en page de l’inventaire sur une grille portrait stable.
- Uniformisation stricte des six emplacements d’équipement.
- Repositionnement symétrique de l’arme, du casque, du plastron, du bouclier, de l’anneau et de l’amulette autour du héros.
- Correction du badge de puissance afin que l’éclair et la valeur restent sur une seule ligne.
- Correction du sac à dos : dix-huit cases carrées visibles et six cases supplémentaires accessibles par défilement interne.
- Suppression de l’écrasement et du chevauchement des premières rangées du sac.
- Uniformisation des cases de potions, des statistiques et de la fiche de l’objet sélectionné.
- Autorisation du défilement vertical de l’écran complet lorsque les barres de Safari réduisent la hauteur disponible.
- Mise à jour du cache PWA pour forcer le chargement des nouveaux fichiers d’interface.

## [0.5.0] — 2026-07-21

### Inventaire et équipement

- Ajout d’un écran d’inventaire accessible depuis le menu principal.
- Ajout d’un avatar provisoire du personnage avec six emplacements : casque, plastron, arme, jambières, bottes et bijou.
- Ajout d’un sac à dos de douze emplacements.
- Ajout de deux emplacements rapides réservés aux potions.
- Glisser-déposer tactile des objets et des potions avec Pointer Events.
- Vérification automatique du type d’objet accepté par chaque emplacement.
- Échange de position entre deux objets lorsque les deux emplacements sont compatibles.
- Mise en évidence des emplacements valides et refus visuel des emplacements incompatibles.
- Affichage de la rareté, du niveau et des statistiques de chaque objet.
- Mise à jour instantanée des dégâts, de l’armure, de la vie et de la puissance totale.
- Sauvegarde locale automatique de la disposition de l’inventaire.

## [0.4.0] — 2026-07-21

### Refonte mobile

- Remplacement de l’apparence « site web » par un squelette visuel de jeu plein écran.
- Nouveau plateau des niveaux présenté comme une scène, avec reliefs, chemin et nœuds de progression.
- Nouvelle bannière de niveau et navigation inférieure façon jeu mobile.
- HUD de combat, inventaire et boutons tactiles retravaillés.
- Écran de lancement Rightbound et transition de chargement.
- Message dédié lorsque le téléphone est utilisé en paysage.
- Boutons d’installation et de plein écran dans le menu.
- Ajout du manifeste PWA et du service worker.
- Ajout des icônes principale et adaptative.
- Cache des ressources pour accélérer les lancements et préparer le fonctionnement hors ligne.
- Maintien de l’écran actif pendant une partie sur les appareils compatibles.
- Conservation du moteur de combat, de la progression, des améliorations et des sauvegardes existantes.
