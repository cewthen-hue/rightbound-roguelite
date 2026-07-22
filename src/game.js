(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const gameZone = document.getElementById("gameZone");
  const overlay = document.getElementById("overlay");
  const modalContent = document.getElementById("modalContent");

  if (!canvas || !gameZone || !overlay || !modalContent) {
    console.error("[Rightbound] Le moteur de jeu ne trouve pas les éléments requis.");
    return;
  }

  const context = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true
  });

  if (!context) {
    console.error("[Rightbound] Canvas 2D indisponible.");
    return;
  }

  const ui = Object.freeze({
    hpFill: document.getElementById("hpFill"),
    xpFill: document.getElementById("xpFill"),
    hpText: document.getElementById("hpText"),
    xpText: document.getElementById("xpText"),
    levelText: document.getElementById("levelText"),
    damageText: document.getElementById("damageText"),
    armorText: document.getElementById("armorText"),
    coinsText: document.getElementById("coinsText"),
    distanceText: document.getElementById("distanceText"),
    bossHud: document.getElementById("bossHud"),
    bossText: document.getElementById("bossText"),
    bossFill: document.getElementById("bossFill"),
    potionButton: document.getElementById("potionButton"),
    potionCount: document.getElementById("potionCount"),
    jumpButton: document.getElementById("jumpButton"),
    spellButtons: [
      document.getElementById("spell1Button"),
      document.getElementById("spell2Button"),
      document.getElementById("spell3Button")
    ],
    cooldowns: [
      document.getElementById("spell1Cooldown"),
      document.getElementById("spell2Cooldown"),
      document.getElementById("spell3Cooldown")
    ],
    jumpCooldown: document.getElementById("jumpCooldown")
  });

  const TWO_PI = Math.PI * 2;
  const WORLD_LENGTH = 3300;
  const FIXED_STEP = 1 / 60;
  const MAX_FRAME_DELTA = 0.075;
  const MAX_STEPS_PER_FRAME = 4;
  const HUD_INTERVAL = 1 / 12;
  const PERFORMANCE_SAMPLE_INTERVAL = 2;
  const ENEMY_POSITIONS = Object.freeze([430, 790, 1140, 1510, 1920, 2320, 2740]);

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const random = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);
  const lerp = (from, to, alpha) => from + (to - from) * alpha;

  const qualityProfiles = Object.freeze({
    high: Object.freeze({ dpr: 1.5, maxParticles: 150, maxTexts: 26, backgroundDetail: 1 }),
    balanced: Object.freeze({ dpr: 1.25, maxParticles: 105, maxTexts: 20, backgroundDetail: 0.82 }),
    low: Object.freeze({ dpr: 1, maxParticles: 70, maxTexts: 14, backgroundDetail: 0.64 })
  });

  const performanceState = {
    requestedMode: "auto",
    activeTier: "high",
    averageFps: 60,
    frameCount: 0,
    sampleTime: 0,
    slowSamples: 0,
    fastSamples: 0,
    droppedSimulationSteps: 0,
    lastTierChange: 0
  };

  let width = 1;
  let height = 1;
  let renderDpr = 1;
  let resizeQueued = false;
  let state = "menu";
  let camera = 0;
  let previousCamera = 0;
  let shake = 0;
  let target = null;
  let boss = null;
  let enemies = [];
  let frameHandle = 0;
  let lastTimestamp = performance.now();
  let accumulator = 0;
  let hudAccumulator = HUD_INTERVAL;
  let isVisible = document.visibilityState !== "hidden";
  let backgroundLayer = null;
  let backgroundLayerContext = null;
  let backdropGradient = null;
  let progressGradient = null;

  const scenery = Array.from({ length: 38 }, (_, index) => ({
    x: 190 * index + random(-65, 65),
    heightRatio: random(0.1, 0.4),
    width: random(65, 155)
  }));

  const player = {
    x: 95,
    y: 0,
    radius: 24,
    maxHp: 100,
    hp: 100,
    damage: 12,
    armor: 0,
    attackDelay: 0.72,
    attackTimer: 0,
    critChance: 0.08,
    critDamage: 1.75,
    moveSpeed: 130,
    healOnKill: 0,
    level: 1,
    xp: 0,
    xpNext: 30,
    coins: 0,
    kills: 0,
    attackAnim: 0,
    hitFlash: 0,
    jumpTime: 0,
    jumpDuration: 0.72,
    jumpCooldown: 0,
    potions: 2,
    skillPower: 1,
    skillCooldownMultiplier: 1,
    cooldowns: [0, 0, 0],
    stunTime: 0
  };

  const upgrades = [
    { icon: "⚔️", title: "Lame aiguisée", desc: "+5 dégâts par attaque.", apply: () => { player.damage += 5; } },
    { icon: "❤️", title: "Vitalité", desc: "+25 PV maximum et soigne 25 PV.", apply: () => { player.maxHp += 25; player.hp = Math.min(player.maxHp, player.hp + 25); } },
    { icon: "⚡", title: "Frénésie", desc: "Attaque automatique 14 % plus rapidement.", apply: () => { player.attackDelay = Math.max(0.22, player.attackDelay * 0.86); } },
    { icon: "🎯", title: "Précision", desc: "+10 % de chance de coup critique.", apply: () => { player.critChance = Math.min(0.65, player.critChance + 0.1); } },
    { icon: "💥", title: "Impact critique", desc: "+45 % de dégâts critiques.", apply: () => { player.critDamage += 0.45; } },
    { icon: "🛡️", title: "Plaques renforcées", desc: "Réduit chaque attaque ennemie de 2 points.", apply: () => { player.armor += 2; } },
    { icon: "🩸", title: "Instinct prédateur", desc: "Récupère 5 PV après chaque élimination.", apply: () => { player.healOnKill += 5; } },
    { icon: "👢", title: "Marche forcée", desc: "+18 % de vitesse entre les combats.", apply: () => { player.moveSpeed *= 1.18; } },
    { icon: "🔮", title: "Maîtrise arcanique", desc: "+20 % de dégâts des compétences.", apply: () => { player.skillPower *= 1.2; } },
    { icon: "⏱️", title: "Flux accéléré", desc: "Réduit les cooldowns des compétences de 12 %.", apply: () => { player.skillCooldownMultiplier *= 0.88; } }
  ];

  const particlePool = [];
  const activeParticles = [];
  const textPool = [];
  const activeTexts = [];

  const hudCache = Object.create(null);
  const buttonCache = new Map();
  let needsRender = true;

  function currentQuality() {
    return qualityProfiles[performanceState.activeTier];
  }

  function createBufferCanvas(bufferWidth, bufferHeight) {
    if (typeof OffscreenCanvas === "function") {
      return new OffscreenCanvas(bufferWidth, bufferHeight);
    }
    const buffer = document.createElement("canvas");
    buffer.width = bufferWidth;
    buffer.height = bufferHeight;
    return buffer;
  }

  function rebuildBackgroundLayer() {
    const layerWidth = Math.max(720, Math.ceil(width * 1.7));
    const layerHeight = Math.max(1, Math.ceil(height));
    backgroundLayer = createBufferCanvas(layerWidth, layerHeight);
    backgroundLayerContext = backgroundLayer.getContext("2d", { alpha: true });
    if (!backgroundLayerContext) return;

    const layer = backgroundLayerContext;
    const groundY = height * 0.79;
    const detail = currentQuality().backgroundDetail;

    layer.clearRect(0, 0, layerWidth, layerHeight);

    const mountainColors = ["#182136", "#202a3a", "#28313e"];
    for (let row = 0; row < 3; row += 1) {
      const baseline = groundY - 105 + row * 38;
      layer.fillStyle = mountainColors[row];
      layer.beginPath();
      layer.moveTo(0, layerHeight);
      for (let x = -160; x < layerWidth + 200; x += 105) {
        const offset = (x + row * 47) % 105;
        const wave = 22 * Math.sin((x + row * 60) * 0.014);
        layer.lineTo(x + offset, baseline + wave);
      }
      layer.lineTo(layerWidth, layerHeight);
      layer.closePath();
      layer.fill();
    }

    layer.fillStyle = "#171b23";
    for (const building of scenery) {
      const x = ((building.x % layerWidth) + layerWidth) % layerWidth;
      const buildingHeight = height * building.heightRatio;
      layer.fillRect(x, groundY - buildingHeight, building.width, buildingHeight);

      if (detail > 0.7) {
        layer.fillStyle = "rgba(255, 214, 128, 0.065)";
        for (let windowIndex = 0; windowIndex < 3; windowIndex += 1) {
          layer.fillRect(x + 15 + 27 * windowIndex, groundY - buildingHeight + 22, 8, 13);
        }
        layer.fillStyle = "#171b23";
      }
    }

    layer.fillStyle = "#252a32";
    layer.fillRect(0, groundY, layerWidth, layerHeight - groundY);

    if (detail > 0.55) {
      layer.strokeStyle = "rgba(255,255,255,0.04)";
      layer.lineWidth = 1;
      for (let x = -68; x < layerWidth + 70; x += 68) {
        layer.beginPath();
        layer.moveTo(x, groundY);
        layer.lineTo(x - 62, layerHeight);
        layer.stroke();
      }
    }
  }

  function applyCanvasSize(force = false) {
    const rect = gameZone.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    const requestedDpr = Math.min(window.devicePixelRatio || 1, currentQuality().dpr);

    if (!force && nextWidth === width && nextHeight === height && Math.abs(requestedDpr - renderDpr) < 0.01) return;

    width = nextWidth;
    height = nextHeight;
    renderDpr = requestedDpr;

    canvas.width = Math.max(1, Math.round(width * renderDpr));
    canvas.height = Math.max(1, Math.round(height * renderDpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(renderDpr, 0, 0, renderDpr, 0, 0);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = performanceState.activeTier === "high" ? "high" : "medium";

    player.x = clamp(width * 0.23, 75, 105);
    player.y = height * 0.8;

    backdropGradient = context.createLinearGradient(0, 0, 0, height);
    backdropGradient.addColorStop(0, "#141a30");
    backdropGradient.addColorStop(0.62, "#2a344a");
    backdropGradient.addColorStop(1, "#171c27");

    progressGradient = context.createLinearGradient(width * 0.17, 0, width * 0.83, 0);
    progressGradient.addColorStop(0, "#60a5fa");
    progressGradient.addColorStop(1, "#f59e0b");

    rebuildBackgroundLayer();
    needsRender = true;
  }

  function scheduleResize() {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      applyCanvasSize();
    });
  }

  function createEnemy(index, worldPosition) {
    const elite = index === 4;
    const maxHp = elite ? 110 : 50 + 11 * index;
    return {
      id: `e-${index}`,
      worldPos: worldPosition,
      maxHp,
      hp: maxHp,
      damage: elite ? 14 : 7 + Math.floor(0.9 * index),
      attackDelay: elite ? 1.12 : 1.38,
      attackTimer: random(0.2, 0.8),
      radius: elite ? 30 : 24,
      elite,
      boss: false,
      dead: false,
      hitFlash: 0,
      attackAnim: 0,
      stunned: 0
    };
  }

  function createBoss() {
    return {
      id: "boss",
      worldPos: WORLD_LENGTH,
      maxHp: 350,
      hp: 350,
      damage: 19,
      attackDelay: 1.05,
      attackTimer: 0.8,
      radius: 44,
      elite: true,
      boss: true,
      dead: false,
      hitFlash: 0,
      attackAnim: 0,
      stunned: 0
    };
  }

  function releaseParticleAt(index) {
    const particle = activeParticles[index];
    const last = activeParticles.pop();
    if (index < activeParticles.length) activeParticles[index] = last;
    particlePool.push(particle);
  }

  function releaseTextAt(index) {
    const text = activeTexts[index];
    const last = activeTexts.pop();
    if (index < activeTexts.length) activeTexts[index] = last;
    textPool.push(text);
  }

  function clearEffects() {
    while (activeParticles.length) particlePool.push(activeParticles.pop());
    while (activeTexts.length) textPool.push(activeTexts.pop());
  }

  function resetRun() {
    Object.assign(player, {
      maxHp: 100,
      hp: 100,
      damage: 12,
      armor: 0,
      attackDelay: 0.72,
      attackTimer: 0,
      critChance: 0.08,
      critDamage: 1.75,
      moveSpeed: 130,
      healOnKill: 0,
      level: 1,
      xp: 0,
      xpNext: 30,
      coins: 0,
      kills: 0,
      attackAnim: 0,
      hitFlash: 0,
      jumpTime: 0,
      jumpCooldown: 0,
      potions: 2,
      skillPower: 1,
      skillCooldownMultiplier: 1,
      cooldowns: [0, 0, 0],
      stunTime: 0
    });

    camera = 0;
    previousCamera = 0;
    shake = 0;
    target = null;
    boss = null;
    enemies = [];
    clearEffects();

    ENEMY_POSITIONS.forEach((worldPosition, index) => {
      enemies.push(createEnemy(index, worldPosition));
    });
    boss = createBoss();
    enemies.push(boss);

    invalidateHud();
    syncHud(true);
    syncControls(true);
    needsRender = true;
  }

  function startGame() {
    resetRun();
    state = "playing";
    overlay.classList.add("hidden");
    lastTimestamp = performance.now();
    accumulator = 0;
    hudAccumulator = HUD_INTERVAL;
    syncControls(true);
  }

  function showEndScreen(victory) {
    if (state === "victory" || state === "dead") return;
    state = victory ? "victory" : "dead";
    overlay.classList.remove("hidden");
    syncControls(true);
    needsRender = true;
    modalContent.innerHTML = `
      <h2>${victory ? "Secteur nettoyé" : "Expédition terminée"}</h2>
      <p class="subtitle">
        ${victory
          ? "Tu as vaincu le gardien. Les prochains systèmes seront la carte des niveaux, le choix des trois sorts et les équipements permanents."
          : "Le personnage est tombé. Les améliorations de cette expédition sont perdues."}
      </p>
      <p><strong>Niveau ${player.level}</strong> · ${player.kills} ennemis · ${player.coins} pièces</p>
      <button class="primary" id="restartButton">Rejouer</button>
    `;
    document.getElementById("restartButton")?.addEventListener("click", startGame, { once: true });
  }

  function randomUpgradeChoices() {
    const indices = upgrades.map((_, index) => index);
    for (let index = indices.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const temporary = indices[index];
      indices[index] = indices[swapIndex];
      indices[swapIndex] = temporary;
    }
    return indices.slice(0, 3).map((index) => upgrades[index]);
  }

  function showUpgradeScreen() {
    state = "upgrade";
    const choices = randomUpgradeChoices();
    overlay.classList.remove("hidden");
    syncControls(true);
    needsRender = true;
    modalContent.innerHTML = `
      <h2>Niveau ${player.level}</h2>
      <p class="subtitle">Choisis une amélioration pour cette expédition.</p>
      <div class="upgrade-grid">
        ${choices.map((upgrade, index) => `
          <button class="upgrade-card" data-index="${index}">
            <span class="upgrade-icon">${upgrade.icon}</span>
            <span class="upgrade-title">${upgrade.title}</span>
            <span class="upgrade-desc">${upgrade.desc}</span>
          </button>
        `).join("")}
      </div>
    `;

    modalContent.querySelectorAll(".upgrade-card").forEach((button) => {
      button.addEventListener("click", () => {
        choices[Number(button.dataset.index)]?.apply();
        overlay.classList.add("hidden");
        state = "playing";
        invalidateHud();
        syncHud(true);
        syncControls(true);
        lastTimestamp = performance.now();
        accumulator = 0;
      }, { once: true });
    });
  }

  function emitParticles(x, y, amount, type = "hit") {
    const profile = currentQuality();
    const available = Math.max(0, profile.maxParticles - activeParticles.length);
    const count = Math.min(amount, available);

    for (let index = 0; index < count; index += 1) {
      const particle = particlePool.pop() || {};
      particle.x = x;
      particle.y = y;
      particle.vx = random(-90, 90);
      particle.vy = random(-135, -25);
      particle.life = random(0.3, 0.66);
      particle.maxLife = 0.66;
      particle.size = random(2, 6);
      particle.type = type;
      activeParticles.push(particle);
    }
  }

  function emitText(text, x, y, kind = "normal") {
    const profile = currentQuality();
    if (activeTexts.length >= profile.maxTexts) releaseTextAt(0);

    const floatingText = textPool.pop() || {};
    floatingText.text = text;
    floatingText.x = x;
    floatingText.y = y;
    floatingText.life = 0.85;
    floatingText.maxLife = 0.85;
    floatingText.kind = kind;
    activeTexts.push(floatingText);
  }

  function grantXp(amount) {
    player.xp += amount;
    if (player.xp < player.xpNext) return;

    player.xp -= player.xpNext;
    player.level += 1;
    player.xpNext = Math.round(player.xpNext * 1.36 + 8);
    invalidateHud();
    syncHud(true);
    showUpgradeScreen();
  }

  function defeatEnemy(enemy) {
    if (!enemy || enemy.dead || enemy.hp > 0) return;

    enemy.dead = true;
    target = null;
    player.kills += 1;

    const xpReward = enemy.boss ? 80 : enemy.elite ? 36 : 18;
    const coinReward = enemy.boss ? 50 : enemy.elite ? 18 : 7;

    player.coins += coinReward;
    player.hp = Math.min(player.maxHp, player.hp + player.healOnKill);
    emitParticles(player.x + 82, player.y - 25, enemy.boss ? 30 : 18, "death");
    emitText(`+${xpReward} XP  +${coinReward}◉`, player.x + 70, player.y - 95, "reward");
    grantXp(xpReward);

    if (enemy.boss) window.setTimeout(() => showEndScreen(true), 550);
    invalidateHud();
  }

  function damageEnemy(enemy, damage, options = {}) {
    if (!enemy || enemy.dead) return;

    const amount = Math.max(1, Math.round(damage));
    enemy.hp = Math.max(0, enemy.hp - amount);
    enemy.hitFlash = 0.14;
    shake = options.heavy ? 8 : 4;
    emitParticles(player.x + 72, player.y - 38, options.heavy ? 16 : 8, options.type || "hit");
    emitText(`${options.label || ""}-${amount}`, player.x + 82, player.y - 70, options.kind || "damage");
    defeatEnemy(enemy);
    invalidateHud();
  }

  function playerAutoAttack(enemy) {
    let damage = player.damage;
    const critical = Math.random() < player.critChance;
    if (critical) damage *= player.critDamage;

    player.attackAnim = 0.16;
    damageEnemy(enemy, damage, {
      heavy: critical,
      type: critical ? "crit" : "hit",
      kind: critical ? "crit" : "damage",
      label: critical ? "CRIT " : ""
    });
  }

  function enemyAttack(enemy) {
    if (player.jumpTime > 0) {
      enemy.attackAnim = 0.18;
      emitText("ESQUIVE", player.x, player.y - 82, "dodge");
      emitParticles(player.x, player.y - 20, 6, "dodge");
      return;
    }

    const damage = Math.max(1, enemy.damage - player.armor);
    player.hp = Math.max(0, player.hp - damage);
    player.hitFlash = 0.15;
    enemy.attackAnim = 0.18;
    shake = 5;
    emitParticles(player.x + 5, player.y - 25, 8, "playerHit");
    emitText(`-${damage}`, player.x - 5, player.y - 75, "playerDamage");
    invalidateHud();

    if (player.hp <= 0) window.setTimeout(() => showEndScreen(false), 360);
  }

  function jump() {
    if (state !== "playing" || player.jumpCooldown > 0 || player.jumpTime > 0) return;
    player.jumpTime = player.jumpDuration;
    player.jumpCooldown = 1.15;
    emitParticles(player.x - 5, player.y + 20, 7, "dust");
    syncControls(true);
  }

  function useSkill(index) {
    if (state !== "playing" || player.cooldowns[index] > 0) return;

    if (index === 0) {
      if (!target || target.dead) return;
      player.attackAnim = 0.25;
      damageEnemy(target, 2.35 * player.damage * player.skillPower, {
        heavy: true,
        type: "fire",
        kind: "skill",
        label: "FRAPPE "
      });
      player.cooldowns[0] = 7 * player.skillCooldownMultiplier;
    } else if (index === 1) {
      if (player.hp >= player.maxHp) return;
      const rawHeal = Math.round(0.32 * player.maxHp * player.skillPower);
      const heal = Math.min(rawHeal, player.maxHp - player.hp);
      player.hp += heal;
      emitText(`+${heal} PV`, player.x, player.y - 88, "heal");
      emitParticles(player.x, player.y - 30, 20, "heal");
      player.cooldowns[1] = 14 * player.skillCooldownMultiplier;
      invalidateHud();
    } else if (index === 2) {
      if (!target || target.dead) return;
      target.stunned = 2.4;
      damageEnemy(target, 0.75 * player.damage * player.skillPower, {
        type: "shock",
        kind: "skill",
        label: "ONDE "
      });
      emitText("ÉTOURDI", player.x + 80, player.y - 100, "stun");
      player.cooldowns[2] = 11 * player.skillCooldownMultiplier;
    }

    syncControls(true);
  }

  function usePotion() {
    if (state !== "playing" || player.potions <= 0 || player.hp >= player.maxHp) return;
    const heal = Math.min(45, player.maxHp - player.hp);
    player.hp += heal;
    player.potions -= 1;
    emitText(`+${heal} PV`, player.x, player.y - 88, "heal");
    emitParticles(player.x, player.y - 28, 15, "heal");
    invalidateHud();
    syncHud(true);
    syncControls(true);
  }

  function findNextTarget() {
    const activationDistance = width - player.x - 100;
    for (const enemy of enemies) {
      if (!enemy.dead && enemy.worldPos - camera <= activationDistance) return enemy;
    }
    return null;
  }

  function updateEffects(delta) {
    for (let index = activeParticles.length - 1; index >= 0; index -= 1) {
      const particle = activeParticles[index];
      particle.life -= delta;
      if (particle.life <= 0) {
        releaseParticleAt(index);
        continue;
      }
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += 280 * delta;
    }

    for (let index = activeTexts.length - 1; index >= 0; index -= 1) {
      const text = activeTexts[index];
      text.life -= delta;
      if (text.life <= 0) {
        releaseTextAt(index);
        continue;
      }
      text.y -= 38 * delta;
    }
  }

  function updateSimulation(delta) {
    if (state !== "playing") return;

    previousCamera = camera;

    player.attackTimer -= delta;
    player.attackAnim = Math.max(0, player.attackAnim - delta);
    player.hitFlash = Math.max(0, player.hitFlash - delta);
    player.jumpTime = Math.max(0, player.jumpTime - delta);
    player.jumpCooldown = Math.max(0, player.jumpCooldown - delta);
    for (let index = 0; index < player.cooldowns.length; index += 1) {
      player.cooldowns[index] = Math.max(0, player.cooldowns[index] - delta);
    }
    shake = Math.max(0, shake - 20 * delta);

    for (const enemy of enemies) {
      enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
      enemy.attackAnim = Math.max(0, enemy.attackAnim - delta);
      enemy.stunned = Math.max(0, enemy.stunned - delta);
    }

    if (!target) {
      target = findNextTarget();
      if (target) {
        invalidateHud();
      } else {
        camera += player.moveSpeed * delta;
      }
    }

    if (target && !target.dead) {
      const engagedEnemy = target;
      const targetScreenX = player.x + (engagedEnemy.worldPos - camera);
      if (targetScreenX > player.x + 92) {
        camera += player.moveSpeed * delta;
      } else {
        if (player.attackTimer <= 0) {
          playerAutoAttack(engagedEnemy);
          player.attackTimer = player.attackDelay;
        }

        if (!engagedEnemy.dead && engagedEnemy.stunned <= 0) {
          engagedEnemy.attackTimer -= delta;
          if (engagedEnemy.attackTimer <= 0) {
            enemyAttack(engagedEnemy);
            engagedEnemy.attackTimer = engagedEnemy.attackDelay;
          }
        }
      }
    }

    updateEffects(delta);

    hudAccumulator += delta;
    if (hudAccumulator >= HUD_INTERVAL) {
      hudAccumulator %= HUD_INTERVAL;
      syncHud();
      syncControls();
    }
  }

  function roundRectPath(x, y, rectWidth, rectHeight, radius) {
    context.beginPath();
    context.roundRect(x, y, rectWidth, rectHeight, Math.min(radius, rectWidth / 2, rectHeight / 2));
  }

  function drawBackground(renderCamera) {
    context.fillStyle = backdropGradient || "#141a30";
    context.fillRect(0, 0, width, height);

    context.fillStyle = "rgba(245, 201, 112, 0.84)";
    context.beginPath();
    context.arc(width * 0.78, height * 0.21, Math.min(width, height) * 0.07, 0, TWO_PI);
    context.fill();

    if (backgroundLayer) {
      const layerWidth = backgroundLayer.width || width;
      const parallaxOffset = -((renderCamera * 0.46) % layerWidth);
      context.drawImage(backgroundLayer, Math.round(parallaxOffset), 0, layerWidth, height);
      context.drawImage(backgroundLayer, Math.round(parallaxOffset + layerWidth), 0, layerWidth, height);
      if (parallaxOffset > -1) {
        context.drawImage(backgroundLayer, Math.round(parallaxOffset - layerWidth), 0, layerWidth, height);
      }
    }
  }

  function drawPlayer(timestamp) {
    const walking = state === "playing" && (!target || target.worldPos - camera > 92);
    const bob = walking ? 3 * Math.sin(timestamp * 0.012) : 1.2 * Math.sin(timestamp * 0.005);
    const attackOffset = player.attackAnim > 0 ? 15 * Math.sin((player.attackAnim / 0.25) * Math.PI) : 0;
    const jumpProgress = player.jumpTime > 0 ? 1 - player.jumpTime / player.jumpDuration : 0;
    const jumpOffset = player.jumpTime > 0 ? 72 * Math.sin(jumpProgress * Math.PI) : 0;
    const playerX = Math.round(player.x + attackOffset);
    const playerY = Math.round(player.y + bob - jumpOffset);

    context.save();
    context.fillStyle = `rgba(0,0,0,${0.34 - jumpOffset / 500})`;
    context.beginPath();
    context.ellipse(Math.round(player.x), Math.round(player.y + 24), 33 - 0.08 * jumpOffset, 10 - 0.02 * jumpOffset, 0, 0, TWO_PI);
    context.fill();

    if (player.hitFlash > 0) context.globalCompositeOperation = "lighter";

    context.strokeStyle = "#111827";
    context.lineWidth = 8;
    context.lineCap = "round";
    context.beginPath();
    const stride = walking ? 7 * Math.sin(timestamp * 0.012) : 0;
    context.moveTo(playerX - 8, playerY + 12);
    context.lineTo(playerX - 14 + stride, playerY + 31);
    context.moveTo(playerX + 8, playerY + 12);
    context.lineTo(playerX + 14 - stride, playerY + 31);
    context.stroke();

    context.fillStyle = player.hitFlash > 0 ? "#ffffff" : "#4f664d";
    roundRectPath(playerX - 18, playerY - 29, 36, 45, 11);
    context.fill();

    context.fillStyle = "#c79268";
    context.beginPath();
    context.arc(playerX, playerY - 41, 14, 0, TWO_PI);
    context.fill();

    context.fillStyle = "#382b26";
    context.beginPath();
    context.arc(playerX, playerY - 47, 14, Math.PI, TWO_PI);
    context.fill();

    context.strokeStyle = "#d6b38a";
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(playerX + 12, playerY - 15);
    context.lineTo(playerX + 30, playerY - 17);
    context.stroke();

    context.strokeStyle = "#d8dde8";
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(playerX + 29, playerY - 17);
    context.lineTo(playerX + 58, playerY - 21);
    context.stroke();
    context.restore();
  }

  function drawEnemy(enemy, timestamp, renderCamera) {
    if (enemy.dead) return;

    const screenX = Math.round(player.x + (enemy.worldPos - renderCamera));
    if (screenX < -110 || screenX > width + 120) return;

    const enemyY = Math.round(player.y + 2 * Math.sin(timestamp * 0.004 + enemy.worldPos));
    const attackOffset = enemy.attackAnim > 0 ? 13 * -Math.sin((enemy.attackAnim / 0.18) * Math.PI) : 0;
    const drawX = Math.round(screenX + attackOffset);

    context.save();
    context.fillStyle = "rgba(0,0,0,0.34)";
    context.beginPath();
    context.ellipse(screenX, enemyY + 27, 1.18 * enemy.radius, 9, 0, 0, TWO_PI);
    context.fill();

    if (enemy.stunned > 0) {
      context.strokeStyle = "#fde047";
      context.lineWidth = 3;
      context.beginPath();
      context.arc(screenX, enemyY - enemy.radius - 5, 0.55 * enemy.radius, 0, TWO_PI);
      context.stroke();
    }

    context.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : enemy.boss ? "#9f1239" : enemy.elite ? "#7c3aed" : "#374151";
    context.beginPath();
    context.arc(drawX, enemyY - 12, enemy.radius, 0, TWO_PI);
    context.fill();

    context.fillStyle = "#10131a";
    context.beginPath();
    context.arc(drawX - 7, enemyY - 17, 4, 0, TWO_PI);
    context.arc(drawX + 7, enemyY - 17, 4, 0, TWO_PI);
    context.fill();

    context.strokeStyle = enemy.boss ? "#fb7185" : "#9ca3af";
    context.lineWidth = enemy.boss ? 8 : 5;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(drawX - 0.6 * enemy.radius, enemyY + 8);
    context.lineTo(drawX - 0.74 * enemy.radius, enemyY + 28);
    context.moveTo(drawX + 0.6 * enemy.radius, enemyY + 8);
    context.lineTo(drawX + 0.74 * enemy.radius, enemyY + 28);
    context.stroke();

    const barWidth = enemy.boss ? 105 : 65;
    const barY = enemyY - enemy.radius - 23;
    context.fillStyle = "rgba(0,0,0,0.58)";
    roundRectPath(screenX - barWidth / 2, barY, barWidth, 7, 4);
    context.fill();

    context.fillStyle = enemy.boss ? "#fb7185" : enemy.elite ? "#a78bfa" : "#f87171";
    roundRectPath(screenX - barWidth / 2, barY, barWidth * clamp(enemy.hp / enemy.maxHp, 0, 1), 7, 4);
    context.fill();

    if (enemy.elite) {
      context.fillStyle = enemy.boss ? "#fecdd3" : "#f5d0fe";
      context.font = "900 10px 'Roboto Condensed', system-ui, sans-serif";
      context.textAlign = "center";
      context.fillText(enemy.boss ? "GARDIEN" : "ÉLITE", screenX, barY - 6);
    }

    context.restore();
  }

  function drawEffects() {
    const particleColors = {
      crit: "#fde047",
      death: "#a78bfa",
      playerHit: "#fb7185",
      heal: "#4ade80",
      fire: "#fb923c",
      shock: "#c084fc",
      dodge: "#67e8f9",
      dust: "#a8a29e",
      hit: "#e5e7eb"
    };

    for (const particle of activeParticles) {
      context.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
      context.fillStyle = particleColors[particle.type] || particleColors.hit;
      context.beginPath();
      context.arc(Math.round(particle.x), Math.round(particle.y), particle.size, 0, TWO_PI);
      context.fill();
    }
    context.globalAlpha = 1;

    const textColors = {
      crit: "#fde047",
      reward: "#67e8f9",
      playerDamage: "#fb7185",
      heal: "#4ade80",
      skill: "#fbbf24",
      stun: "#c084fc",
      dodge: "#67e8f9",
      damage: "#f8fafc"
    };

    context.textAlign = "center";
    for (const text of activeTexts) {
      context.globalAlpha = clamp(text.life / text.maxLife, 0, 1);
      context.font = ["crit", "skill"].includes(text.kind)
        ? "950 17px 'Roboto Condensed', system-ui, sans-serif"
        : "900 14px 'Roboto Condensed', system-ui, sans-serif";
      context.fillStyle = textColors[text.kind] || "#f8fafc";
      context.fillText(text.text, Math.round(text.x), Math.round(text.y));
    }
    context.globalAlpha = 1;
  }

  function drawProgress(renderCamera) {
    const barWidth = Math.min(260, width * 0.66);
    const barX = (width - barWidth) / 2;
    const barY = height - 14;
    const ratio = clamp(renderCamera / WORLD_LENGTH, 0, 1);

    context.fillStyle = "rgba(5,8,14,0.58)";
    roundRectPath(barX, barY - 8, barWidth, 7, 7);
    context.fill();

    context.fillStyle = progressGradient || "#60a5fa";
    roundRectPath(barX, barY - 8, barWidth * ratio, 7, 7);
    context.fill();
  }

  function render(timestamp, interpolation) {
    const renderCamera = lerp(previousCamera, camera, interpolation);
    context.save();

    if (shake > 0) {
      context.translate(random(-shake, shake), random(-shake, shake));
    }

    drawBackground(renderCamera);
    for (const enemy of enemies) drawEnemy(enemy, timestamp, renderCamera);
    drawPlayer(timestamp);
    drawEffects();
    drawProgress(renderCamera);
    context.restore();
  }

  function setText(cacheKey, element, value) {
    if (!element || hudCache[cacheKey] === value) return;
    hudCache[cacheKey] = value;
    element.textContent = value;
  }

  function setWidth(cacheKey, element, value) {
    if (!element || hudCache[cacheKey] === value) return;
    hudCache[cacheKey] = value;
    element.style.width = value;
  }

  function setDisplay(cacheKey, element, value) {
    if (!element || hudCache[cacheKey] === value) return;
    hudCache[cacheKey] = value;
    element.style.display = value;
  }

  function invalidateHud() {
    for (const key of Object.keys(hudCache)) delete hudCache[key];
  }

  function syncHud(force = false) {
    if (force) invalidateHud();

    const hpText = `${Math.ceil(player.hp)} / ${player.maxHp}`;
    const xpText = `${player.xp} / ${player.xpNext}`;
    const hpWidth = `${clamp((player.hp / player.maxHp) * 100, 0, 100).toFixed(1)}%`;
    const xpWidth = `${clamp((player.xp / player.xpNext) * 100, 0, 100).toFixed(1)}%`;
    const distance = `${Math.round(100 * clamp(camera / WORLD_LENGTH, 0, 1))} %`;

    setText("hpText", ui.hpText, hpText);
    setWidth("hpWidth", ui.hpFill, hpWidth);
    setText("xpText", ui.xpText, xpText);
    setWidth("xpWidth", ui.xpFill, xpWidth);
    setText("level", ui.levelText, String(player.level));
    setText("damage", ui.damageText, `⚔ ${Math.round(player.damage)}`);
    setText("armor", ui.armorText, `🛡 ${player.armor}`);
    setText("coins", ui.coinsText, `◉ ${player.coins}`);
    setText("distance", ui.distanceText, distance);
    setText("potions", ui.potionCount, String(player.potions));

    const bossActive = Boolean(boss && !boss.dead && target === boss);
    setDisplay("bossDisplay", ui.bossHud, bossActive ? "block" : "none");
    if (bossActive) {
      setText("bossText", ui.bossText, `${Math.ceil(boss.hp)} / ${boss.maxHp}`);
      setWidth("bossWidth", ui.bossFill, `${clamp((boss.hp / boss.maxHp) * 100, 0, 100).toFixed(1)}%`);
    }
  }

  function setButtonState(button, disabled, cooling, cooldownText, cooldownElement) {
    if (!button) return;
    const previous = buttonCache.get(button) || {};

    if (previous.disabled !== disabled) {
      button.disabled = disabled;
      previous.disabled = disabled;
    }
    if (previous.cooling !== cooling) {
      button.classList.toggle("cooling", cooling);
      previous.cooling = cooling;
    }
    if (cooldownElement && previous.cooldownText !== cooldownText) {
      cooldownElement.textContent = cooldownText;
      previous.cooldownText = cooldownText;
    }

    buttonCache.set(button, previous);
  }

  function syncControls(force = false) {
    if (force) buttonCache.clear();
    const playing = state === "playing";

    setButtonState(
      ui.potionButton,
      !playing || player.potions <= 0 || player.hp >= player.maxHp,
      false,
      "",
      null
    );

    const jumpCooling = player.jumpCooldown > 0.04;
    setButtonState(
      ui.jumpButton,
      !playing || player.jumpTime > 0,
      jumpCooling,
      jumpCooling ? String(Math.ceil(player.jumpCooldown)) : "",
      ui.jumpCooldown
    );

    const skillDisabled = [
      !playing || !target || target.dead,
      !playing || player.hp >= player.maxHp,
      !playing || !target || target.dead
    ];

    ui.spellButtons.forEach((button, index) => {
      const cooling = player.cooldowns[index] > 0.04;
      setButtonState(
        button,
        skillDisabled[index],
        cooling,
        cooling ? String(Math.ceil(player.cooldowns[index])) : "",
        ui.cooldowns[index]
      );
    });
  }

  function changeQualityTier(nextTier, reason = "manual") {
    if (!qualityProfiles[nextTier] || performanceState.activeTier === nextTier) return false;
    performanceState.activeTier = nextTier;
    performanceState.lastTierChange = performance.now();
    performanceState.slowSamples = 0;
    performanceState.fastSamples = 0;
    applyCanvasSize(true);
    document.dispatchEvent(new CustomEvent("rightbound:performance-tier-changed", {
      detail: { tier: nextTier, reason, averageFps: performanceState.averageFps }
    }));
    return true;
  }

  function samplePerformance(frameDelta) {
    performanceState.frameCount += 1;
    performanceState.sampleTime += frameDelta;

    if (performanceState.sampleTime < PERFORMANCE_SAMPLE_INTERVAL) return;

    performanceState.averageFps = Math.round(performanceState.frameCount / performanceState.sampleTime);
    performanceState.frameCount = 0;
    performanceState.sampleTime = 0;

    if (performanceState.requestedMode !== "auto") return;

    if (performanceState.averageFps < 47) {
      performanceState.slowSamples += 1;
      performanceState.fastSamples = 0;
    } else if (performanceState.averageFps > 57) {
      performanceState.fastSamples += 1;
      performanceState.slowSamples = 0;
    } else {
      performanceState.slowSamples = 0;
      performanceState.fastSamples = 0;
    }

    if (performanceState.slowSamples >= 2) {
      if (performanceState.activeTier === "high") changeQualityTier("balanced", "automatic-slow-frame");
      else if (performanceState.activeTier === "balanced") changeQualityTier("low", "automatic-slow-frame");
    } else if (performanceState.fastSamples >= 4) {
      if (performanceState.activeTier === "low") changeQualityTier("balanced", "automatic-recovery");
      else if (performanceState.activeTier === "balanced") changeQualityTier("high", "automatic-recovery");
    }
  }

  function frame(timestamp) {
    frameHandle = requestAnimationFrame(frame);
    if (!isVisible) return;

    const rawDelta = Math.max(0, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;

    if (state !== "playing") {
      accumulator = 0;
      if (needsRender) {
        render(timestamp, 1);
        needsRender = false;
      }
      return;
    }

    const frameDelta = Math.min(rawDelta, MAX_FRAME_DELTA);
    samplePerformance(rawDelta || FIXED_STEP);

    accumulator += frameDelta;
    let steps = 0;
    while (accumulator >= FIXED_STEP && steps < MAX_STEPS_PER_FRAME) {
      updateSimulation(FIXED_STEP);
      accumulator -= FIXED_STEP;
      steps += 1;
    }

    if (accumulator >= FIXED_STEP) {
      accumulator %= FIXED_STEP;
      performanceState.droppedSimulationSteps += 1;
    }

    render(timestamp, clamp(accumulator / FIXED_STEP, 0, 1));
    needsRender = false;
  }

  function showInitialScreen() {
    state = "menu";
    overlay.classList.remove("hidden");
    modalContent.innerHTML = `
      <h1>RIGHTBOUND</h1>
      <p class="subtitle">
        Prototype mobile en portrait : le jeu occupe la partie supérieure et les contrôles restent accessibles en bas.<br>
        Le héros avance et attaque automatiquement. Utilise le saut, les compétences et les objets au bon moment.
      </p>
      <button class="primary" id="startButton">Lancer la partie</button>
      <div class="small">Version 0.25.0 — moteur mobile optimisé</div>
    `;
    document.getElementById("startButton")?.addEventListener("click", startGame, { once: true });
  }

  ui.potionButton?.addEventListener("click", usePotion);
  ui.jumpButton?.addEventListener("click", jump);
  ui.spellButtons[0]?.addEventListener("click", () => useSkill(0));
  ui.spellButtons[1]?.addEventListener("click", () => useSkill(1));
  ui.spellButtons[2]?.addEventListener("click", () => useSkill(2));

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space") jump();
    else if (event.code === "Digit1") useSkill(0);
    else if (event.code === "Digit2") useSkill(1);
    else if (event.code === "Digit3") useSkill(2);
  });

  document.addEventListener("visibilitychange", () => {
    isVisible = document.visibilityState !== "hidden";
    lastTimestamp = performance.now();
    accumulator = 0;
  });

  window.addEventListener("resize", scheduleResize, { passive: true });
  window.addEventListener("orientationchange", () => window.setTimeout(scheduleResize, 120), { passive: true });

  if (typeof ResizeObserver === "function") {
    const resizeObserver = new ResizeObserver(scheduleResize);
    resizeObserver.observe(gameZone);
  }

  window.RightboundPerformance = Object.freeze({
    version: "1.0.0",
    getStats() {
      return Object.freeze({
        requestedMode: performanceState.requestedMode,
        activeTier: performanceState.activeTier,
        averageFps: performanceState.averageFps,
        droppedSimulationSteps: performanceState.droppedSimulationSteps,
        renderDpr,
        particles: activeParticles.length,
        floatingTexts: activeTexts.length
      });
    },
    setQuality(mode) {
      const normalized = String(mode || "auto").toLowerCase();
      if (!["auto", "high", "balanced", "low"].includes(normalized)) return false;
      performanceState.requestedMode = normalized;
      if (normalized === "auto") return true;
      return changeQualityTier(normalized, "manual");
    },
    forceResize() {
      applyCanvasSize(true);
    }
  });

  applyCanvasSize(true);
  showInitialScreen();
  syncHud(true);
  syncControls(true);
  frameHandle = requestAnimationFrame(frame);
})();
