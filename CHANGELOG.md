# Changelog

Toutes les modifications importantes du projet sont enregistrées ici.

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

## [0.3.0] — 2026-07-21

### Ajouté

- Nouveau menu principal mobile avec une carte de progression.
- Six emplacements de niveaux affichés sur le plateau.
- Niveau 1 accessible et niveaux 2 à 6 verrouillés.
- Fiche détaillée du niveau 1 avec ennemis, boss et durée estimée.
- Bouton de retour à la carte après une victoire ou une défaite.
- Sauvegarde locale de l’état « niveau 1 terminé ».
- Barre de vie flottante au-dessus du personnage pendant le niveau.
- Animation de la barre de vie pendant le saut.

## [0.2.1] — 2026-07-21

### Corrigé

- Correction du gel de la partie après la mort d’un ennemi.
- Conservation d’une référence locale à l’ennemi pendant la frame de combat afin d’éviter l’accès à `currentEnemy` après sa remise à `null`.

## [0.2.0] — 2026-07-21

### Ajouté

- Interface mobile en portrait.
- Zone de jeu sur environ 70 % de l’écran.
- Panneau de contrôle sur environ 30 % de l’écran.
- Inventaire rapide avec potion et emplacements futurs.
- Bouton de saut avec esquive.
- Trois compétences avec cooldowns.
- Frappe lourde, soin et onde paralysante.
- Améliorations de puissance des compétences et de réduction des cooldowns.

## [0.1.0] — 2026-07-21

### Ajouté

- Déplacement automatique vers la droite.
- Ennemis statiques et combat automatique.
- Vie, dégâts, armure, critiques, XP et pièces.
- Montées de niveau avec trois choix aléatoires.
- Ennemi élite et boss de fin.
- Écrans de victoire et de défaite.
