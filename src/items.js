(() => {
  "use strict";

  const RARITIES = Object.freeze({
    common: Object.freeze({ label: "Commun", order: 1 }),
    rare: Object.freeze({ label: "Rare", order: 2 }),
    epic: Object.freeze({ label: "Épique", order: 3 }),
    legendary: Object.freeze({ label: "Légendaire", order: 4 })
  });

  const item = (id, name, type, subtype, rarity, glyph, visual, special = null) => Object.freeze({
    id, name, type, subtype, rarity, glyph, visual,
    special: special ? Object.freeze(special) : null,
    image: null,
    drop: null
  });

  const ITEMS = Object.freeze([
    item("weapon-garrison-sword", "Épée de garnison", "weapon", "sword", "common", "†", "Épée droite en fer gris, légèrement ébréchée, avec une garde courte et une poignée entourée de cuir brun."),
    item("weapon-ash-bow", "Arc de frêne", "weapon", "bow", "common", "⌁", "Arc en bois clair légèrement irrégulier, corde épaisse et extrémités renforcées par de petites pièces de fer."),
    item("helmet-watchman", "Casque du veilleur", "helmet", "helmet", "common", "⌂", "Casque rond en fer mat avec protège-nez central, surface rayée et légèrement cabossée."),
    item("helmet-tracker-hood", "Capuche du pisteur", "helmet", "hood", "common", "⌒", "Capuche en tissu vert olive, renforcée par quelques coutures de cuir brun et légèrement effilochée."),
    item("chest-recruit-breastplate", "Cuirasse de recrue", "chest", "plate", "common", "▣", "Plastron simple en fer porté sur une tunique rembourrée beige, maintenu par de larges sangles de cuir."),
    item("chest-boiled-leather", "Gilet de cuir bouilli", "chest", "leather", "common", "▤", "Armure courte composée de panneaux de cuir brun foncé, épaules renforcées et grosses boucles métalliques."),
    item("relic-traveler-cape", "Cape du voyageur", "relic", "cape", "common", "◖", "Longue cape en laine gris-bleu, usée au bas et retenue par une petite broche ronde en fer."),
    item("relic-dusty-mantle", "Mantelet poussiéreux", "relic", "cape", "common", "◗", "Cape courte couleur sable couvrant les épaules, avec plusieurs réparations et une bordure assombrie."),
    item("boots-walking", "Bottes de marche", "boots", "boots", "common", "⌄", "Bottes montantes en cuir brun, semelles épaisses, pointes marquées par les voyages et lacets simples."),
    item("boots-militia-greaves", "Grèves de milicien", "boots", "greaves", "common", "∧", "Protège-tibias en fer fixés sur des bottes de cuir par trois sangles visibles."),
    item("jewel-copper-ring", "Anneau de cuivre", "jewel", "ring", "common", "○", "Anneau épais en cuivre martelé, légèrement déformé et couvert de petites marques artisanales."),
    item("jewel-hearth-pendant", "Pendentif du foyer", "jewel", "pendant", "common", "♢", "Petit médaillon ovale en bois sombre, gravé d’une flamme simple et suspendu à une corde beige."),
    item("weapon-tiror-bow", "Arc de Tiror", "weapon", "bow", "rare", "⌁", "Arc élancé en bois d’if presque noir, parcouru d’un fil turquoise, avec extrémités argentées et motifs de plumes."),
    item("weapon-blue-rock-mace", "Masse des Roches Bleues", "weapon", "mace", "rare", "⚒", "Masse courte en acier sombre dont la tête anguleuse contient des fragments de pierre bleue."),
    item("helmet-falcon", "Heaume du Faucon", "helmet", "helmet", "rare", "♜", "Casque en acier argenté à visière pointue, prolongé par une petite crête de plumes bleu nuit."),
    item("helmet-mist-mask", "Masque de Brume", "helmet", "mask", "rare", "◉", "Demi-masque en métal pâle couvrant les yeux et le nez, laissant s’échapper une légère fumée bleutée."),
    item("chest-border-brigandine", "Brigandine des Confins", "chest", "brigandine", "rare", "▦", "Veste bleu foncé recouverte de rangées de rivets argentés, avec col et épaules bordés de cuir noir."),
    item("chest-watcher-breastplate", "Cuirasse du Guetteur", "chest", "plate", "rare", "▧", "Plastron asymétrique en acier bleui avec une grande épaulière et une écharpe turquoise usée."),
    item("relic-gale-cape", "Cape des Bourrasques", "relic", "cape", "rare", "≈", "Cape gris-bleu séparée en deux longues pointes, parcourue de spirales de vent argentées."),
    item("relic-ember-coat", "Manteau des Braises", "relic", "cape", "rare", "≋", "Cape courte rouge rouille aux bords noircis, avec de minuscules lueurs orange dans les coutures."),
    item("boots-rising-wind", "Bottes du Vent Levant", "boots", "boots", "rare", "⌄", "Bottes légères en cuir gris clair, sangles bleues et petites plumes blanches aux chevilles."),
    item("boots-depth-greaves", "Grèves des Profondeurs", "boots", "greaves", "rare", "∧", "Grèves en acier sombre à patine bleu-vert, gravées de vagues et de créatures marines."),
    item("jewel-storm-ring", "Anneau d’Orage", "jewel", "ring", "rare", "ϟ", "Anneau d’argent en forme d’éclair enroulé autour d’une petite pierre cobalt."),
    item("jewel-sap-amulet", "Amulette de Sève", "jewel", "amulet", "rare", "♧", "Goutte d’ambre dorée emprisonnée dans un entrelacement de branches en bronze."),
    item("weapon-mamah31-sword", "Épée de Mamah31", "weapon", "sword", "epic", "†", "Large épée en acier violet sombre, garde dorée en ailes anguleuses et runes « M31 » lumineuses sur la lame."),
    item("weapon-twilight-spear", "Lance du Crépuscule", "weapon", "spear", "epic", "↟", "Longue lance au manche noir, terminée par une pointe d’améthyste en croissant reflétant violet et orange."),
    item("helmet-revenant-crown", "Couronne du Revenant", "helmet", "crown", "epic", "♛", "Couronne brisée en fer noir dont plusieurs fragments flottent autour d’une flamme froide cyan."),
    item("helmet-ashen-dragon", "Heaume du Dragon Cendré", "helmet", "helmet", "epic", "♜", "Heaume massif couleur charbon, doté de deux cornes arrière et de fissures orange semblables à des braises."),
    item("chest-eclipse-armor", "Armure de l’Éclipse", "chest", "plate", "epic", "◐", "Armure noire et violette aux formes tranchantes, avec un disque d’éclipse argenté entouré d’ombres mouvantes."),
    item("chest-grey-titan", "Harnois du Titan Gris", "chest", "heavy", "epic", "▣", "Armure extrêmement épaisse mêlant acier et roche, épaulières massives et fissures lumineuses."),
    item("relic-thousand-embers", "Voile des Mille Braises", "relic", "cape", "epic", "≋", "Longue cape rouge profond dont se détachent continuellement des particules de braise sans la consumer."),
    item("relic-void-cape", "Cape du Vide", "relic", "cape", "epic", "∿", "Cape noire dont l’intérieur ressemble à un ciel étoilé et dont les extrémités se dissolvent en fumée violette."),
    item("boots-ghost-step", "Bottes du Pas-Fantôme", "boots", "boots", "epic", "⌄", "Bottes pâles à fines plaques d’argent, talons translucides laissant une traînée de brume."),
    item("boots-meteor-greaves", "Grèves de Météore", "boots", "greaves", "epic", "∧", "Grèves en acier noir parcourues de veines orange fondues, semelles brûlées et étincelles au contact du sol."),
    item("jewel-basilisk-eye", "Œil du Basilic", "jewel", "amulet", "epic", "◉", "Grande pierre verte à pupille verticale montée sur une structure en or ancien."),
    item("jewel-fallen-king-seal", "Sceau du Roi Déchu", "jewel", "ring", "epic", "♚", "Lourd anneau en or noirci portant une pierre royale rouge fissurée et un blason presque effacé."),
    item("weapon-first-dawn-blade", "Lame de l’Aube Première", "weapon", "sword", "legendary", "☀", "Épée d’ivoire et d’or dont la lame semble constituée de lumière solide et libère des particules dorées.", {"id":"dawn-surge","name":"Déferlante de l’aube","description":"Toutes les cinq attaques, libère une vague solaire traversant les ennemis.","status":"planned"}),
    item("weapon-seven-storms-bow", "Arc des Sept Orages", "weapon", "bow", "legendary", "ϟ", "Arc noir et bleu entouré de sept cristaux de foudre flottants, avec une corde formée d’un éclair permanent.", {"id":"chain-thunder","name":"Tonnerre en chaîne","description":"Chaque troisième tir frappe jusqu’à trois ennemis proches avec des éclairs secondaires.","status":"planned"}),
    item("helmet-broken-oracle", "Heaume de l’Oracle Brisé", "helmet", "helmet", "legendary", "◈", "Heaume blanc et doré avec un œil de saphir central et des fragments de visière flottants couverts de runes.", {"id":"perfect-vision","name":"Vision parfaite","description":"Après une esquive parfaite, la prochaine attaque est critique et réduit légèrement les recharges.","status":"planned"}),
    item("helmet-nameless-mask", "Masque du Sans-Nom", "helmet", "mask", "legendary", "▬", "Masque parfaitement lisse en métal noir, traversé d’une fine ouverture violette laissant échapper de la fumée.", {"id":"shadow-double","name":"Double obscur","description":"La première attaque portée à chaque nouvel ennemi est répétée par une silhouette d’ombre.","status":"planned"}),
    item("chest-thornmail", "Cotte épineuse", "chest", "mail", "legendary", "✣", "Cotte de mailles noire et vert sombre couverte d’épines de bronze et de lianes rouges pulsantes.", {"id":"thorn-retaliation","name":"Représailles épineuses","description":"Renvoie à l’attaquant une partie des dégâts directs subis.","status":"planned"}),
    item("chest-world-heart", "Cuirasse du Cœur-Monde", "chest", "plate", "legendary", "♥", "Armure de pierre, d’or ancien et de racines pétrifiées, avec un cristal vert battant au centre.", {"id":"primordial-bark","name":"Écorce primordiale","description":"Après une perte importante de vie, accorde automatiquement un bouclier proportionnel aux PV maximum.","status":"planned"}),
    item("relic-solar-cape", "Cape solaire", "relic", "cape", "legendary", "☀", "Cape blanche et dorée devenant orange lumineuse vers son extrémité, flottant sans vent avec un contour incandescent.", {"id":"solar-aura","name":"Aura solaire","description":"Inflige régulièrement des dégâts à tous les ennemis proches du héros.","status":"planned"}),
    item("relic-hungry-abyss", "Manteau de l’Abîme affamé", "relic", "cape", "legendary", "●", "Grande cape noire dont l’intérieur forme un vortex violet et laisse parfois apparaître des tentacules d’ombre.", {"id":"void-hunger","name":"Faim du néant","description":"Les ennemis éliminés créent brièvement un vortex attirant et blessant les autres ennemis.","status":"planned"}),
    item("boots-fractured-time", "Sandales du Temps fendu", "boots", "sandals", "legendary", "◷", "Sandales bleues et dorées entourées de fragments d’horloge flottants et d’images rémanentes.", {"id":"suspended-instant","name":"Instant suspendu","description":"Une esquive parfaite ralentit fortement les ennemis et leurs projectiles pendant un court instant.","status":"planned"}),
    item("boots-earthquake-king", "Grèves du Roi-Séisme", "boots", "greaves", "legendary", "⌁", "Énormes grèves en bronze et obsidienne faisant apparaître de petites fissures dorées à chaque pas.", {"id":"royal-impact","name":"Fracas royal","description":"Atterrir après un saut déclenche une onde de choc qui blesse et étourdit les ennemis proches.","status":"planned"}),
    item("jewel-phoenix-heart", "Cœur du Phénix", "jewel", "amulet", "legendary", "♦", "Rubis incandescent taillé comme un cœur entre deux ailes dorées, entouré d’une petite flamme orbitale.", {"id":"fiery-rebirth","name":"Renaissance ardente","description":"Une fois par niveau, évite une mort fatale, restaure une partie de la vie et déclenche une explosion.","status":"planned"}),
    item("jewel-infinite-echo", "Anneau de l’Écho infini", "jewel", "ring", "legendary", "∞", "Deux anneaux d’argent tournent autour d’une gemme violette en produisant de petites copies translucides.", {"id":"arcane-repeat","name":"Répétition arcanique","description":"Chaque troisième compétence utilisée est immédiatement répétée avec une puissance réduite.","status":"planned"})
  ]);

  const BY_ID = Object.freeze(Object.fromEntries(ITEMS.map((entry) => [entry.id, entry])));
  const getItem = (itemId) => BY_ID[itemId] || null;
  const getAllItems = () => [...ITEMS];
  const getItemsByType = (type) => ITEMS.filter((entry) => entry.type === type);
  const getItemsByRarity = (rarity) => ITEMS.filter((entry) => entry.rarity === rarity);

  function validateCatalog() {
    const errors = [];
    const expectedTypes = ["weapon", "helmet", "chest", "relic", "boots", "jewel"];
    if (ITEMS.length !== 48) errors.push(`48 objets attendus, ${ITEMS.length} trouvés.`);
    if (Object.keys(BY_ID).length !== ITEMS.length) errors.push("Des identifiants sont dupliqués.");
    expectedTypes.forEach((type) => {
      const count = getItemsByType(type).length;
      if (count !== 8) errors.push(`${type}: 8 objets attendus, ${count} trouvés.`);
    });
    Object.keys(RARITIES).forEach((rarity) => {
      const count = getItemsByRarity(rarity).length;
      if (count !== 12) errors.push(`${rarity}: 12 objets attendus, ${count} trouvés.`);
    });
    getItemsByRarity("legendary").forEach((entry) => {
      if (!entry.special) errors.push(`${entry.id}: capacité légendaire manquante.`);
    });
    if (errors.length) console.error("[Rightbound] Catalogue d’objets invalide", errors);
    return Object.freeze(errors);
  }

  const validationErrors = validateCatalog();
  window.RightboundItemCatalog = Object.freeze({
    version: "1.0.0", rarities: RARITIES, items: ITEMS, byId: BY_ID,
    getItem, getAllItems, getItemsByType, getItemsByRarity, validationErrors
  });

  document.dispatchEvent(new CustomEvent("rightbound:item-catalog-ready", {
    detail: { version: "1.0.0", itemCount: ITEMS.length, legendaryCount: getItemsByRarity("legendary").length }
  }));
})();
