# Rightbound — charte artistique officielle du Menu V3

Identifiant de style : `RIGHTBOUND_STYLE_V1`

Statut : verrouillé pour la préproduction des sprites.

Portée : Menu V3, personnages, décors, cadres, nodes, icônes, coffres et effets associés.

Cette charte remplace toute ancienne formulation orientée « semi-réaliste ». La direction officielle est désormais un **RPG fantasy médiéval 2D cartoon premium conçu pour mobile**.

## 1. Positionnement visuel

Rightbound doit donner l’impression d’un véritable RPG mobile illustré, et non d’un site web décoré ni d’une collection d’images indépendantes.

Le rendu recherché est :

- 2D cartoon premium ;
- fantasy médiévale ;
- aventureux et mystérieux ;
- légèrement usé, mais jamais sale ou illisible ;
- coloré avec contrôle ;
- lisible immédiatement sur iPhone et Android ;
- cohérent entre le personnage, les décors et l’interface.

Le style ne doit pas devenir :

- semi-réaliste ;
- photoréaliste ;
- rendu 3D ;
- vectoriel plat ;
- chibi ;
- anime ;
- cartoon enfantin ;
- grimdark horrifique ;
- concept art surchargé de textures.

## 2. Principes fondamentaux

### 2.1 Lisibilité mobile avant détail

Une forme principale doit rester reconnaissable en quelques dixièmes de seconde.

Les détails qui disparaissent à 40 px ne doivent pas porter une information essentielle. Une icône doit fonctionner avec :

- une silhouette dominante ;
- deux ou trois plans internes maximum ;
- un contraste clair entre l’objet et son fond ;
- aucun texte intégré.

Chaque asset sera contrôlé au minimum à 32 px, 40 px et 64 px.

### 2.2 Formes simples, volumes clairs

La hiérarchie visuelle cible est :

- 70 % grandes formes ;
- 20 % formes secondaires ;
- 10 % petits détails.

Les silhouettes doivent être nettes. Les angles peuvent être biseautés ou légèrement adoucis, mais les objets ne doivent pas ressembler à des jouets arrondis.

### 2.3 Cartoon adulte, pas chibi

Les personnages utilisent des proportions héroïques adultes avec une exagération modérée.

Pour Jack :

- rapport tête/corps compris entre environ 1:6,5 et 1:7 ;
- mains, bottes et équipement légèrement renforcés pour la lisibilité ;
- visage simplifié, mais adulte ;
- aucune tête surdimensionnée ;
- aucune pose comique ;
- aucune anatomie réaliste trop fine.

### 2.4 Cohérence stricte

Tous les tickets de production doivent mentionner `RIGHTBOUND_STYLE_V1`.

Les trois assets pilotes approuvés deviendront les références obligatoires de toute la suite :

1. `stage-background` ;
2. `stage-hero` ;
3. `stage-frame`.

Aucun lot massif ne sera lancé avant l’approbation de ces trois pilotes.

## 3. Dessin, contours et ombrage

### Contours

- contours colorés sombres ;
- propres et continus sur la silhouette principale ;
- épaisseur modérée ;
- plus marqués sur les personnages et les icônes ;
- plus légers dans les décors lointains ;
- jamais noirs et épais partout de façon uniforme.

### Ombrage

- deux ou trois grands groupes de valeurs ;
- transitions principalement franches ;
- adoucissement ponctuel sur les visages, le ciel et certaines matières ;
- ombres jamais complètement bouchées ;
- relief lisible même sur petit écran.

### Texture

La texture reste légère et peinte à la main. Elle sert le matériau, sans créer de bruit photographique.

Sont interdits :

- micro-rayures partout ;
- grain réaliste excessif ;
- pierre couverte de dizaines de fissures ;
- tissu saturé de coutures ;
- métal photoréaliste piqué ou rouillé.

## 4. Lumière officielle

La lumière principale vient du **haut gauche**.

- lumière principale : chaude à neutre ;
- ambiance secondaire : froide, bleu sarcelle ;
- ombres : lisibles et colorées ;
- reflets : larges et contrôlés ;
- effets magiques : noyau solide et halo limité ;
- aucun bloom néon envahissant.

Cette direction doit rester cohérente sur Jack, les objets, les coffres, les nodes et les icônes.

## 5. Palette officielle

| Fonction | Couleur |
|---|---|
| Bleu sarcelle profond | `#071B24` |
| Bleu panneau | `#123745` |
| Vert olive | `#617F37` |
| Vert forêt | `#355A2C` |
| Or vieilli | `#D6AA4E` |
| Bronze | `#9B6B35` |
| Parchemin | `#F2E7C9` |
| Pierre froide | `#718086` |
| Cyan du ciel | `#77BFC7` |
| Élite | `#8E4BA7` |
| Boss | `#B93A3A` |
| Alerte | `#C94E3D` |

Règles :

- le bleu sarcelle domine les fonds d’interface ;
- l’or vieilli sert aux cadres, aux récompenses et au focus ;
- le vert indique les états jouables ou actifs ;
- le violet est réservé au contenu Élite ;
- le rouge est réservé aux Boss, au danger et aux erreurs ;
- le noir pur reste limité aux petites zones d’occlusion ;
- les couleurs néon sont interdites.

## 6. Langage des matériaux

### Métal

- grands reflets lisibles ;
- quelques marques d’usure seulement ;
- formes épaisses et robustes ;
- pas de corrosion réaliste détaillée.

### Bois

- deux ou trois bandes principales de veinage ;
- arêtes légèrement usées ;
- teintes brunes chaudes ;
- aucun grain photographique.

### Pierre

- blocs clairement dessinés ;
- fissures limitées ;
- mousse discrète ;
- valeurs froides bien séparées.

### Cuir

- plis larges ;
- bords bruns plus chauds ;
- quelques coutures lisibles ;
- aucune multitude de petits rivets.

### Tissu

- plis simples et directionnels ;
- grandes masses de couleur ;
- effilochage très limité ;
- texture subordonnée à la silhouette.

### Magie

- couleur solide au centre ;
- halo court ;
- forme graphique ;
- jamais de lumière néon diffuse recouvrant toute l’image.

## 7. Règles par famille d’assets

### Personnages

- vue frontale ou trois-quarts légère ;
- pose stable et immédiatement compréhensible ;
- silhouette entière non coupée ;
- expression graphique et contrôlée ;
- contours plus forts que dans le décor ;
- point d’ancrage clairement respecté.

### Décors

- composition verrouillée pour le slot prévu ;
- profondeur organisée en trois plans ;
- centre protégé pour Jack et les informations HTML ;
- formes peintes larges ;
- détails plus faibles à l’arrière-plan ;
- aucune perspective modifiée entre deux variantes du même décor.

### Cadres et panneaux

- vue parfaitement frontale ;
- symétrie obligatoire sauf indication contraire ;
- centre calme pour accueillir le texte HTML ;
- bordures conçues pour le `nine-slice` lorsque déclaré ;
- aucune inscription intégrée dans l’image.

### Icônes et nodes

- une forme dominante ;
- deux ou trois plans internes maximum ;
- priorité à la reconnaissance ;
- contraste fort ;
- aucune micro-décoration indispensable ;
- test obligatoire à la taille réelle du jeu.

### Effets

- transparence contrôlée ;
- ne masque jamais le texte ;
- ne casse jamais la silhouette de Jack ;
- couches séparables privilégiées pour l’animation.

## 8. Bloc de style canonique

Ce bloc devra être repris sans reformulation libre dans chaque prompt de production :

> Illustration 2D cartoon premium pour jeu mobile RPG fantasy médiéval. Formes nettes et immédiatement lisibles sur petit écran, silhouette forte, proportions héroïques adultes avec légère exagération, contours colorés sombres propres, ombrage simplifié en deux ou trois grandes valeurs, textures peintes légères sans bruit photoréaliste, lumière principale venant du haut gauche, ambiance aventureuse et mystérieuse mais claire, palette cohérente de bleu sarcelle profond, vert olive, bronze vieilli, or patiné et parchemin.

Chaque prompt devra aussi indiquer explicitement :

- `Style ID: RIGHTBOUND_STYLE_V1` ;
- l’identifiant exact de l’asset ;
- le slot du contrat géométrique ;
- le mode `contain`, `cover` ou `nine-slice` ;
- le point d’ancrage ;
- les dimensions du canvas ;
- la taille de la zone utile ;
- les marges maximales ;
- le format final ;
- la référence visuelle jointe.

## 9. Bloc d’exclusion canonique

Chaque prompt doit interdire :

- semi-réaliste ;
- photoréalisme ;
- rendu 3D ;
- vectoriel plat ;
- chibi ;
- anime ;
- cartoon enfantin ;
- grimdark horrifique ;
- textures surchargées ;
- valeurs boueuses ;
- couleurs néon ;
- texte, chiffre ou watermark ;
- sujet coupé ;
- objets supplémentaires non demandés ;
- changement de caméra ;
- changement de direction lumineuse.

## 10. Processus de production obligatoire

### Étape 1 — Ticket technique

Un ticket unique est rédigé pour un seul asset avec :

- nom exact ;
- chemin source ;
- chemin runtime ;
- dimensions ;
- ratio ;
- mode d’affichage ;
- ancre ;
- zone utile ;
- marges ;
- prompt ;
- exclusions ;
- références ;
- critères d’acceptation.

### Étape 2 — Génération limitée

- un seul asset par ticket ;
- trois candidats maximum par round ;
- aucun sprite sheet ;
- aucun lot massif ;
- aucune génération de la série suivante avant validation.

### Étape 3 — Contrôle technique

- dimensions ;
- ratio ;
- cadrage ;
- alpha ;
- franges magenta ;
- marges transparentes ;
- poids ;
- compatibilité avec le slot.

### Étape 4 — Contrôle à taille réelle

L’asset est intégré temporairement dans son véritable emplacement et contrôlé sur téléphone.

Une image belle en grand mais illisible à sa taille runtime est refusée.

### Étape 5 — Approbation

Le fichier reçoit une note sur 10 :

| Critère | Maximum |
|---|---:|
| Cadrage et proportions | 2 |
| Cohérence avec les références | 2 |
| Lisibilité mobile | 2 |
| Qualité technique du fichier | 2 |
| Respect du ticket | 2 |

Seuls les assets obtenant **au moins 9/10** peuvent entrer dans `assets/menu-v3/runtime/`.

## 11. Rejets automatiques

Un asset est refusé immédiatement en cas de :

- sujet principal coupé ;
- mauvaise caméra ;
- perspective différente ;
- marges transparentes excessives ;
- illisibilité à la taille cible ;
- fond ou canal alpha incorrect ;
- franges magenta ;
- texte, chiffre ou watermark intégré ;
- dérive vers le semi-réaliste ;
- dérive de palette ;
- lumière venant d’une autre direction ;
- incompatibilité avec le slot géométrique.

## 12. Organisation des fichiers

```text
assets/menu-v3/
  references/
  source/
  runtime/
  geometry-contract.json
  style-contract.json
```

- `references/` contient uniquement les pilotes approuvés et les références officielles ;
- `source/` contient les versions haute résolution conservées pour les corrections ;
- `runtime/` contient uniquement les fichiers validés et optimisés chargés par le jeu ;
- les variantes rejetées ne doivent jamais entrer dans `runtime/`.

## 13. Ordre des pilotes

L’ordre est verrouillé :

1. `stage-background` ;
2. `stage-hero` ;
3. `stage-frame`.

Le décor fixe la palette et la profondeur. Jack fixe le langage des personnages. Le cadre fixe le langage des matériaux et de l’interface.

Une fois les trois pilotes approuvés, ils deviennent les références visuelles obligatoires pour les ressources, les icônes, les nodes, les coffres et le dock.

## 14. Contrôle des changements

La direction artistique ne doit pas évoluer silencieusement.

Toute modification importante exige :

- une validation explicite ;
- une nouvelle version du Style ID ;
- la mise à jour de `style-contract.json` ;
- la mise à jour de cette charte ;
- la vérification des références déjà approuvées.

La géométrie ne doit jamais être modifiée pour faire rentrer une image mal produite.
