(() => {
  "use strict";

  const RARITIES = Object.freeze({
    common: Object.freeze({ label: "Commun", order: 1 }),
    rare: Object.freeze({ label: "Rare", order: 2 }),
    epic: Object.freeze({ label: "Épique", order: 3 }),
    legendary: Object.freeze({ label: "Légendaire", order: 4 })
  });

  const STAT_LABELS = Object.freeze({
    damage: "dégâts",
    armor: "armure",
    hp: "PV",
    power: "puissance",
    speed: "vitesse",
    critChance: "% critique",
    attackSpeed: "% vitesse d’attaque",
    cooldownReduction: "% recharge",
    healing: "% soins",
    dodge: "% esquive"
  });

  function formatStats(stats) {
    return Object.entries(stats).map(([key, value]) => `+${value} ${STAT_LABELS[key] || key}`).join(" · ");
  }

  function calculatePowerScore(stats, rarity) {
    const score = (stats.damage || 0) * 2 + (stats.armor || 0) * 3 + (stats.hp || 0) * 0.5 +
      (stats.power || 0) * 4 + (stats.speed || 0) * 1.5 + (stats.critChance || 0) * 2 +
      (stats.attackSpeed || 0) * 1.5 + (stats.cooldownReduction || 0) * 2 +
      (stats.healing || 0) + (stats.dodge || 0) * 2;
    return Math.round(score + (RARITIES[rarity]?.order || 1) * 4);
  }

  const item = (imageIndex, id, name, type, subtype, rarity, glyph, visual, stats, special = null) => {
    const frozenStats = Object.freeze({ ...stats });
    return Object.freeze({
      id, name, type, subtype, rarity, glyph, visual, level: 1,
      stats: frozenStats,
      description: formatStats(frozenStats),
      powerScore: calculatePowerScore(frozenStats, rarity),
      special: special ? Object.freeze(special) : null,
      imageIndex,
      image: `assets/icons/${imageIndex}.png`,
      drop: null
    });
  };

  const ITEMS = Object.freeze([
    item(1, "weapon-garrison-sword", "Épée de garnison", "weapon", "sword", "common", "†", "Épée droite en fer gris, légèrement ébréchée, avec une garde courte et une poignée entourée de cuir brun.", {"damage":4}),
    item(2, "weapon-ash-bow", "Arc de frêne", "weapon", "bow", "common", "⌁", "Arc en bois clair légèrement irrégulier, corde épaisse et extrémités renforcées par de petites pièces de fer.", {"damage":3,"critChance":2}),
    item(3, "helmet-watchman", "Casque du veilleur", "helmet", "helmet", "common", "⌂", "Casque rond en fer mat avec protège-nez central, surface rayée et légèrement cabossée.", {"armor":3,"hp":5}),
    item(4, "helmet-tracker-hood", "Capuche du pisteur", "helmet", "hood", "common", "⌒", "Capuche en tissu vert olive, renforcée par quelques coutures de cuir brun et légèrement effilochée.", {"armor":2,"speed":2}),
    item(5, "chest-recruit-breastplate", "Cuirasse de recrue", "chest", "plate", "common", "▣", "Plastron simple en fer porté sur une tunique rembourrée beige, maintenu par de larges sangles de cuir.", {"armor":5,"hp":12}),
    item(6, "chest-boiled-leather", "Gilet de cuir bouilli", "chest", "leather", "common", "▤", "Armure courte composée de panneaux de cuir brun foncé, épaules renforcées et grosses boucles métalliques.", {"armor":3,"hp":18}),
    item(7, "relic-traveler-cape", "Cape du voyageur", "relic", "cape", "common", "◖", "Longue cape en laine gris-bleu, usée au bas et retenue par une petite broche ronde en fer.", {"hp":10,"speed":1}),
    item(8, "relic-dusty-mantle", "Mantelet poussiéreux", "relic", "cape", "common", "◗", "Cape courte couleur sable couvrant les épaules, avec plusieurs réparations et une bordure assombrie.", {"armor":1,"hp":12}),
    item(9, "boots-walking", "Bottes de marche", "boots", "boots", "common", "⌄", "Bottes montantes en cuir brun, semelles épaisses, pointes marquées par les voyages et lacets simples.", {"armor":1,"speed":3}),
    item(10, "boots-militia-greaves", "Grèves de milicien", "boots", "greaves", "common", "∧", "Protège-tibias en fer fixés sur des bottes de cuir par trois sangles visibles.", {"armor":3,"speed":1}),
    item(11, "jewel-copper-ring", "Anneau de cuivre", "jewel", "ring", "common", "○", "Anneau épais en cuivre martelé, légèrement déformé et couvert de petites marques artisanales.", {"armor":1,"power":1}),
    item(12, "jewel-hearth-pendant", "Pendentif du foyer", "jewel", "pendant", "common", "♢", "Petit médaillon ovale en bois sombre, gravé d’une flamme simple et suspendu à une corde beige.", {"hp":15,"healing":3}),
    item(13, "weapon-tiror-bow", "Arc de Tiror", "weapon", "bow", "rare", "⌁", "Arc élancé en bois d’if presque noir, parcouru d’un fil turquoise, avec extrémités argentées et motifs de plumes.", {"damage":7,"critChance":5,"speed":2}),
    item(14, "weapon-blue-rock-mace", "Masse des Roches Bleues", "weapon", "mace", "rare", "⚒", "Masse courte en acier sombre dont la tête anguleuse contient des fragments de pierre bleue.", {"damage":8,"armor":2}),
    item(15, "helmet-falcon", "Heaume du Faucon", "helmet", "helmet", "rare", "♜", "Casque en acier argenté à visière pointue, prolongé par une petite crête de plumes bleu nuit.", {"armor":5,"critChance":3,"speed":1}),
    item(16, "helmet-mist-mask", "Masque de Brume", "helmet", "mask", "rare", "◉", "Demi-masque en métal pâle couvrant les yeux et le nez, laissant s’échapper une légère fumée bleutée.", {"armor":3,"power":2,"dodge":4}),
    item(17, "chest-border-brigandine", "Brigandine des Confins", "chest", "brigandine", "rare", "▦", "Veste bleu foncé recouverte de rangées de rivets argentés, avec col et épaules bordés de cuir noir.", {"armor":8,"hp":20}),
    item(18, "chest-watcher-breastplate", "Cuirasse du Guetteur", "chest", "plate", "rare", "▧", "Plastron asymétrique en acier bleui avec une grande épaulière et une écharpe turquoise usée.", {"armor":7,"hp":16,"critChance":2}),
    item(19, "relic-gale-cape", "Cape des Bourrasques", "relic", "cape", "rare", "≈", "Cape gris-bleu séparée en deux longues pointes, parcourue de spirales de vent argentées.", {"speed":5,"dodge":3}),
    item(20, "relic-ember-coat", "Manteau des Braises", "relic", "cape", "rare", "≋", "Cape courte rouge rouille aux bords noircis, avec de minuscules lueurs orange dans les coutures.", {"damage":3,"hp":10,"power":4}),
    item(21, "boots-rising-wind", "Bottes du Vent Levant", "boots", "boots", "rare", "⌄", "Bottes légères en cuir gris clair, sangles bleues et petites plumes blanches aux chevilles.", {"speed":7,"dodge":3}),
    item(22, "boots-depth-greaves", "Grèves des Profondeurs", "boots", "greaves", "rare", "∧", "Grèves en acier sombre à patine bleu-vert, gravées de vagues et de créatures marines.", {"armor":6,"hp":10,"speed":2}),
    item(23, "jewel-storm-ring", "Anneau d’Orage", "jewel", "ring", "rare", "ϟ", "Anneau d’argent en forme d’éclair enroulé autour d’une petite pierre cobalt.", {"power":5,"critChance":4}),
    item(24, "jewel-sap-amulet", "Amulette de Sève", "jewel", "amulet", "rare", "♧", "Goutte d’ambre dorée emprisonnée dans un entrelacement de branches en bronze.", {"hp":25,"healing":8}),
    item(25, "weapon-mamah31-sword", "Épée de Mamah31", "weapon", "sword", "epic", "†", "Large épée en acier violet sombre, garde dorée en ailes anguleuses et runes « M31 » lumineuses sur la lame.", {"damage":12,"power":3,"critChance":7}),
    item(26, "weapon-twilight-spear", "Lance du Crépuscule", "weapon", "spear", "epic", "↟", "Longue lance au manche noir, terminée par une pointe d’améthyste en croissant reflétant violet et orange.", {"damage":11,"power":5,"attackSpeed":5}),
    item(27, "helmet-revenant-crown", "Couronne du Revenant", "helmet", "crown", "epic", "♛", "Couronne brisée en fer noir dont plusieurs fragments flottent autour d’une flamme froide cyan.", {"armor":7,"power":7,"cooldownReduction":4}),
    item(28, "helmet-ashen-dragon", "Heaume du Dragon Cendré", "helmet", "helmet", "epic", "♜", "Heaume massif couleur charbon, doté de deux cornes arrière et de fissures orange semblables à des braises.", {"damage":2,"armor":9,"hp":20}),
    item(29, "chest-eclipse-armor", "Armure de l’Éclipse", "chest", "plate", "epic", "◐", "Armure noire et violette aux formes tranchantes, avec un disque d’éclipse argenté entouré d’ombres mouvantes.", {"armor":11,"hp":30,"power":5}),
    item(30, "chest-grey-titan", "Harnois du Titan Gris", "chest", "heavy", "epic", "▣", "Armure extrêmement épaisse mêlant acier et roche, épaulières massives et fissures lumineuses.", {"armor":14,"hp":35}),
    item(31, "relic-thousand-embers", "Voile des Mille Braises", "relic", "cape", "epic", "≋", "Longue cape rouge profond dont se détachent continuellement des particules de braise sans la consumer.", {"damage":5,"power":7,"speed":3}),
    item(32, "relic-void-cape", "Cape du Vide", "relic", "cape", "epic", "∿", "Cape noire dont l’intérieur ressemble à un ciel étoilé et dont les extrémités se dissolvent en fumée violette.", {"power":9,"cooldownReduction":7,"dodge":4}),
    item(33, "boots-ghost-step", "Bottes du Pas-Fantôme", "boots", "boots", "epic", "⌄", "Bottes pâles à fines plaques d’argent, talons translucides laissant une traînée de brume.", {"speed":10,"dodge":7}),
    item(34, "boots-meteor-greaves", "Grèves de Météore", "boots", "greaves", "epic", "∧", "Grèves en acier noir parcourues de veines orange fondues, semelles brûlées et étincelles au contact du sol.", {"damage":4,"armor":8,"speed":5}),
    item(35, "jewel-basilisk-eye", "Œil du Basilic", "jewel", "amulet", "epic", "◉", "Grande pierre verte à pupille verticale montée sur une structure en or ancien.", {"power":10,"critChance":8}),
    item(36, "jewel-fallen-king-seal", "Sceau du Roi Déchu", "jewel", "ring", "epic", "♚", "Lourd anneau en or noirci portant une pierre royale rouge fissurée et un blason presque effacé.", {"damage":4,"armor":4,"power":8}),
    item(37, "weapon-first-dawn-blade", "Lame de l’Aube Première", "weapon", "sword", "legendary", "☀", "Épée d’ivoire et d’or dont la lame semble constituée de lumière solide et libère des particules dorées.", {"damage":16,"power":6,"critChance":10}, {"id":"dawn-surge","name":"Déferlante de l’aube","description":"Toutes les cinq attaques, libère une vague solaire traversant les ennemis.","status":"planned"}),
    item(38, "weapon-seven-storms-bow", "Arc des Sept Orages", "weapon", "bow", "legendary", "ϟ", "Arc noir et bleu entouré de sept cristaux de foudre flottants, avec une corde formée d’un éclair permanent.", {"damage":14,"critChance":12,"attackSpeed":8}, {"id":"chain-thunder","name":"Tonnerre en chaîne","description":"Chaque troisième tir frappe jusqu’à trois ennemis proches avec des éclairs secondaires.","status":"planned"}),
    item(39, "helmet-broken-oracle", "Heaume de l’Oracle Brisé", "helmet", "helmet", "legendary", "◈", "Heaume blanc et doré avec un œil de saphir central et des fragments de visière flottants couverts de runes.", {"armor":10,"power":10,"cooldownReduction":10}, {"id":"perfect-vision","name":"Vision parfaite","description":"Après une esquive parfaite, la prochaine attaque est critique et réduit légèrement les recharges.","status":"planned"}),
    item(40, "helmet-nameless-mask", "Masque du Sans-Nom", "helmet", "mask", "legendary", "▬", "Masque parfaitement lisse en métal noir, traversé d’une fine ouverture violette laissant échapper de la fumée.", {"armor":8,"power":5,"critChance":10,"dodge":8}, {"id":"shadow-double","name":"Double obscur","description":"La première attaque portée à chaque nouvel ennemi est répétée par une silhouette d’ombre.","status":"planned"}),
    item(41, "chest-thornmail", "Cotte épineuse", "chest", "mail", "legendary", "✣", "Cotte de mailles noire et vert sombre couverte d’épines de bronze et de lianes rouges pulsantes.", {"damage":3,"armor":16,"hp":45}, {"id":"thorn-retaliation","name":"Représailles épineuses","description":"Renvoie à l’attaquant une partie des dégâts directs subis.","status":"planned"}),
    item(42, "chest-world-heart", "Cuirasse du Cœur-Monde", "chest", "plate", "legendary", "♥", "Armure de pierre, d’or ancien et de racines pétrifiées, avec un cristal vert battant au centre.", {"armor":14,"hp":60,"healing":10}, {"id":"primordial-bark","name":"Écorce primordiale","description":"Après une perte importante de vie, accorde automatiquement un bouclier proportionnel aux PV maximum.","status":"planned"}),
    item(43, "relic-solar-cape", "Cape solaire", "relic", "cape", "legendary", "☀", "Cape blanche et dorée devenant orange lumineuse vers son extrémité, flottant sans vent avec un contour incandescent.", {"damage":7,"power":12,"speed":4}, {"id":"solar-aura","name":"Aura solaire","description":"Inflige régulièrement des dégâts à tous les ennemis proches du héros.","status":"planned"}),
    item(44, "relic-hungry-abyss", "Manteau de l’Abîme affamé", "relic", "cape", "legendary", "●", "Grande cape noire dont l’intérieur forme un vortex violet et laisse parfois apparaître des tentacules d’ombre.", {"hp":20,"power":14,"cooldownReduction":10}, {"id":"void-hunger","name":"Faim du néant","description":"Les ennemis éliminés créent brièvement un vortex attirant et blessant les autres ennemis.","status":"planned"}),
    item(45, "boots-fractured-time", "Sandales du Temps fendu", "boots", "sandals", "legendary", "◷", "Sandales bleues et dorées entourées de fragments d’horloge flottants et d’images rémanentes.", {"speed":14,"dodge":12,"cooldownReduction":6}, {"id":"suspended-instant","name":"Instant suspendu","description":"Une esquive parfaite ralentit fortement les ennemis et leurs projectiles pendant un court instant.","status":"planned"}),
    item(46, "boots-earthquake-king", "Grèves du Roi-Séisme", "boots", "greaves", "legendary", "⌁", "Énormes grèves en bronze et obsidienne faisant apparaître de petites fissures dorées à chaque pas.", {"damage":6,"armor":12,"hp":30,"speed":4}, {"id":"royal-impact","name":"Fracas royal","description":"Atterrir après un saut déclenche une onde de choc qui blesse et étourdit les ennemis proches.","status":"planned"}),
    item(47, "jewel-phoenix-heart", "Cœur du Phénix", "jewel", "amulet", "legendary", "♦", "Rubis incandescent taillé comme un cœur entre deux ailes dorées, entouré d’une petite flamme orbitale.", {"hp":50,"power":10,"healing":15}, {"id":"fiery-rebirth","name":"Renaissance ardente","description":"Une fois par niveau, évite une mort fatale, restaure une partie de la vie et déclenche une explosion.","status":"planned"}),
    item(48, "jewel-infinite-echo", "Anneau de l’Écho infini", "jewel", "ring", "legendary", "∞", "Deux anneaux d’argent tournent autour d’une gemme violette en produisant de petites copies translucides.", {"power":16,"critChance":6,"cooldownReduction":12}, {"id":"arcane-repeat","name":"Répétition arcanique","description":"Chaque troisième compétence utilisée est répétée immédiatement avec une puissance réduite.","status":"planned"})
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
    ITEMS.forEach((entry, index) => {
      if (entry.imageIndex !== index + 1 || entry.image !== `assets/icons/${index + 1}.png`) errors.push(`${entry.id}: image incorrecte.`);
      if (!entry.stats || !Object.keys(entry.stats).length) errors.push(`${entry.id}: caractéristiques manquantes.`);
      if (!entry.description) errors.push(`${entry.id}: description de statistiques manquante.`);
    });
    getItemsByRarity("legendary").forEach((entry) => {
      if (!entry.special) errors.push(`${entry.id}: capacité légendaire manquante.`);
    });
    if (errors.length) console.error("[Rightbound] Catalogue d’objets invalide", errors);
    return Object.freeze(errors);
  }

  const validationErrors = validateCatalog();
  window.RightboundItemCatalog = Object.freeze({
    version: "1.1.0", rarities: RARITIES, statLabels: STAT_LABELS, items: ITEMS, byId: BY_ID,
    getItem, getAllItems, getItemsByType, getItemsByRarity, formatStats, validationErrors
  });

  document.dispatchEvent(new CustomEvent("rightbound:item-catalog-ready", {
    detail: { version: "1.1.0", itemCount: ITEMS.length, legendaryCount: getItemsByRarity("legendary").length }
  }));
})();
