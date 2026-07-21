# Changelog

Toutes les modifications importantes du projet sont enregistrées ici.

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
