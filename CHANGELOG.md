# Changelog

Toutes les modifications importantes du projet sont enregistrées ici.

## [0.18.0] — 2026-07-22

### Équipements appliqués au véritable combat

- Ajout de `src/build.js`, source centrale du build équipé et des statistiques dérivées utilisées par l’inventaire, le menu des niveaux et le combat.
- Application réelle des dégâts, de l’armure et des PV fournis par les équipements au début de chaque expédition.
- Conversion des bonus secondaires en effets de combat : critique, vitesse d’attaque, vitesse de déplacement, puissance des compétences, réduction des recharges, soins et esquive passive.
- Verrouillage du build au lancement de l’expédition : changer d’équipement ne modifie pas une partie déjà commencée, mais s’applique à la suivante.
- Suppression des deux potions gratuites du prototype ; le combat démarre désormais avec le contenu réel des emplacements rapides, actuellement vides.
- Affichage dynamique de la puissance réelle du héros dans le menu, en remplacement de la valeur provisoire `83`.
- Ajout d’un indicateur comparant la puissance du build à la puissance conseillée du niveau.
- Conservation d’une formule de puissance unique entre l’inventaire et le menu afin d’éviter des valeurs contradictoires.
- Ajout d’une mise à l’échelle des PV, dégâts et vitesse d’attaque des ennemis selon le niveau sélectionné et sa puissance recommandée.
- Renforcement supplémentaire des rencontres Élite et Boss, notamment du boss du niveau 10.
- Ajout d’un retour visuel lors d’une esquive passive déclenchée par un équipement.
- Mise à jour du cache PWA en version `0.18.0`.

## [0.17.0] — 2026-07-22

### Progression des niveaux et nouvelles probabilités de coffres

- Ajout d’une progression persistante sur les dix niveaux du Monde 1.
- Un niveau terminé accorde exactement un seul coffre correspondant au niveau joué, y compris lors d’une nouvelle victoire sur un niveau déjà terminé.
- Déblocage automatique du niveau suivant après une victoire et affichage d’une coche sur les niveaux terminés.
- Les niveaux débloqués sont rejouables et les niveaux encore inaccessibles restent consultables mais verrouillés.
- Transfert de tous les golds ramassés pendant le combat vers le solde permanent en cas de victoire.
- Conservation de 25 % des golds de combat en cas de défaite, sans coffre ni déblocage.
- Ajout d’un écran de résultat détaillant les golds permanents et le coffre gagné.
- Sauvegarde transactionnelle et identifiants de récompense empêchant qu’un même combat ajoute deux fois ses golds ou son coffre.
- Mise à jour du fonctionnement des coffres : les golds sont toujours garantis, mais un équipement n’est plus systématique.
- Coffre Bronze : 80 % d’objet commun et 20 % de golds seuls, à l’exception du tout premier Bronze qui conserve le Casque du veilleur garanti.
- Coffre Argent : 70 % d’objet rare et 30 % d’objet commun.
- Coffre Or : 50 % d’objet rare, 35 % d’objet épique et 15 % d’objet commun.
- Coffre Diamant : 40 % d’objet légendaire, 30 % d’objet épique, 20 % d’objet rare et 10 % d’objet commun.
- Maintien de la protection contre les doublons à l’intérieur de la rareté effectivement tirée.
- Possibilité d’obtenir un résultat « golds uniquement » avec une révélation dédiée.
- Si un objet est tiré alors que le sac est plein, la récompense reste enregistrée en attente et le coffre n’est pas consommé.
- Mise à jour du cache PWA en version `0.17.0`.

## [0.16.0] — 2026-07-22

### Coffres et équipements réels

- Ajout de `src/loot.js`, source centrale des tables de récompenses des quatre coffres.
- Association stricte des raretés : Bronze vers Commun, Argent vers Rare, Or vers Épique et Diamant vers Légendaire.
- Chaque coffre donne désormais un véritable équipement permanent du catalogue ainsi que des golds.
- Nouveau barème : Bronze 40–80 golds, Argent 90–160, Or 180–300 et Diamant 350–550.
- Premier coffre Bronze garanti : `Casque du veilleur` accompagné de 50 golds.
- Protection contre les doublons tant qu’un objet encore inconnu existe dans la rareté du coffre.
- Ajout de l’objet obtenu comme instance unique dans la première case libre du sac.
- Blocage de l’ouverture lorsque les 24 cases du sac sont pleines, sans consommer le coffre.
- Nouvelle révélation affichant l’icône réelle, le nom, la rareté, les statistiques et les golds obtenus.
- Ajout des actions `Équiper` et `Garder` après l’ouverture.
- Mise en place d’une transaction persistante permettant de reprendre proprement une ouverture interrompue sans dupliquer la récompense.
- Conservation et migration des anciens stocks de coffres déjà sauvegardés.
- Mise à jour du cache PWA en version `0.16.0`.

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
