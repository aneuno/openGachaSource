/* ==========================================================
   CONFIGURATION DES TAUX PAR RARETÉ (total = 100%)
   Rareté 1 = très commun ... Rareté 11 = LR (ultra rare)
   ========================================================== */
const RARITY_RATES = {
  1: 28, 2: 20, 3: 15, 4: 12, 5: 9,
  6: 6, 7: 4, 8: 3, 9: 1.7, 10: 1, 11: 0.3
};

const RARITY_LABELS = {
  1: "Commun", 2: "Peu commun", 3: "Rare", 4: "Rare+",
  5: "Super Rare", 6: "Super Rare+", 7: "Épique", 8: "Épique+",
  9: "Légendaire", 10: "Mythique", 11: "LR"
};

// Palier d'intensité visuelle selon la rareté
function tierOf(rarity) {
  if (rarity <= 3) return "low";
  if (rarity <= 5) return "mid";
  if (rarity <= 8) return "high";
  if (rarity <= 10) return "epic";
  return "lr";
}

const TIER_RING_COLOR = {
  low: "#8bc34a",
  mid: "#03a9f4",
  high: "#e040fb",
  epic: "#ffd700",
  lr: "#ff2ec2"
};

const TIER_PARTICLE_COUNT = { low: 0, mid: 6, high: 16, epic: 28, lr: 50 };
const TIER_REVEAL_DELAY = { low: 550, mid: 700, high: 950, epic: 1200, lr: 1700 };

let ALL_CHARACTERS = [];
let CHARACTERS_BY_RARITY = {};
let pullCount = 0;
let unlocked = new Set();
let skipRequested = false;

const resultArea = document.getElementById("result-area");
const historyList = document.getElementById("history-list");
const pullCountEl = document.getElementById("pull-count");
const unlockedCountEl = document.getElementById("unlocked-count");
const legendEl = document.getElementById("legend");
const fxOverlay = document.getElementById("fx-overlay");
const fxParticles = document.getElementById("fx-particles");
const collectionPanel = document.getElementById("collection-panel");
const collectionGrid = document.getElementById("collection-grid");

const pull1Btn = document.getElementById("pull-1");
const pull10Btn = document.getElementById("pull-10");

init();

async function init() {
  try {
    const res = await fetch("characters.json");
    ALL_CHARACTERS = await res.json();
  } catch (err) {
    resultArea.innerHTML = `<p class="placeholder-text">Erreur de chargement de characters.json</p>`;
    console.error(err);
    return;
  }

  CHARACTERS_BY_RARITY = groupByRarity(ALL_CHARACTERS);
  loadState();
  renderLegend();
  updateStats();

  pull1Btn.addEventListener("click", () => doPulls(1));
  pull10Btn.addEventListener("click", () => doPulls(10));
  document.getElementById("reset").addEventListener("click", resetState);
  document.getElementById("toggle-collection").addEventListener("click", toggleCollection);
}

function groupByRarity(characters) {
  const grouped = {};
  for (const c of characters) {
    if (!grouped[c.rarity]) grouped[c.rarity] = [];
    grouped[c.rarity].push(c);
  }
  return grouped;
}

function rollCharacter() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  let chosenRarity = 1;

  for (let rarity = 1; rarity <= 11; rarity++) {
    cumulative += RARITY_RATES[rarity] || 0;
    if (roll <= cumulative) {
      chosenRarity = rarity;
      break;
    }
  }

  while (
    (!CHARACTERS_BY_RARITY[chosenRarity] || CHARACTERS_BY_RARITY[chosenRarity].length === 0) &&
    chosenRarity > 1
  ) {
    chosenRarity--;
  }

  const pool = CHARACTERS_BY_RARITY[chosenRarity] || [];
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function setButtonsEnabled(enabled) {
  pull1Btn.disabled = !enabled;
  pull10Btn.disabled = !enabled;
  pull1Btn.style.opacity = enabled ? "1" : "0.5";
  pull10Btn.style.opacity = enabled ? "1" : "0.5";
}

async function doPulls(amount) {
  const results = [];
  for (let i = 0; i < amount; i++) {
    const c = rollCharacter();
    if (c) results.push(c);
  }
  if (results.length === 0) return;

  setButtonsEnabled(false);
  skipRequested = false;
  resultArea.innerHTML = "";

  const skipBtn = document.createElement("button");
  skipBtn.className = "skip-btn";
  skipBtn.textContent = "Passer l'animation ⏩";
  skipBtn.addEventListener("click", () => { skipRequested = true; });
  document.body.appendChild(skipBtn);

  for (const character of results) {
    await revealOne(character);
  }

  skipBtn.remove();
  setButtonsEnabled(true);

  pullCount += results.length;
  results.forEach(addToHistory);
  saveState();
  updateStats();
}

function revealOne(character) {
  return new Promise(resolve => {
    const tier = tierOf(character.rarity);
    const ringColor = TIER_RING_COLOR[tier];

    // Slot de "summon" avec anneau tournant
    const slot = document.createElement("div");
    slot.className = "summon-slot";
    slot.innerHTML = `<div class="summon-ring" style="--ring-color:${ringColor}"></div>`;
    resultArea.appendChild(slot);
    resultArea.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const delay = skipRequested ? 60 : TIER_REVEAL_DELAY[tier];

    setTimeout(() => {
      slot.remove();
      spawnCard(character, tier);
      resolve();
    }, delay);
  });
}

function spawnCard(character, tier) {
  const isNew = !unlocked.has(character.id);
  unlocked.add(character.id);

  const card = document.createElement("div");
  card.className = `card rarity-${character.rarity} tier-${tier} revealing${isNew ? " new" : ""}`;

  const imageHtml = character.image && character.image.trim() !== ""
    ? `<img src="${character.image}" alt="${character.name}" onerror="this.parentElement.innerHTML='Image introuvable';this.parentElement.style.color='#888';">`
    : `Pas d'image`;

  card.innerHTML = `
    <span class="rarity-badge badge-${character.rarity}">${RARITY_LABELS[character.rarity]} (${character.rarity})</span>
    <div class="image-slot">${imageHtml}</div>
    <div class="name">${character.name}</div>
    <div class="desc">${character.description || ""}</div>
  `;

  resultArea.appendChild(card);

  if (!skipRequested) {
    triggerRevealFx(tier);
  }
}

function triggerRevealFx(tier) {
  if (tier === "mid") {
    flashOverlay("flash-mid");
    spawnParticles(TIER_PARTICLE_COUNT.mid, TIER_RING_COLOR.mid);
  } else if (tier === "high") {
    flashOverlay("flash-mid");
    spawnParticles(TIER_PARTICLE_COUNT.high, TIER_RING_COLOR.high);
  } else if (tier === "epic") {
    flashOverlay("flash-big");
    spawnParticles(TIER_PARTICLE_COUNT.epic, TIER_RING_COLOR.epic);
    document.body.classList.add("shake");
    setTimeout(() => document.body.classList.remove("shake"), 550);
  } else if (tier === "lr") {
    flashOverlay("flash-big");
    spawnParticles(TIER_PARTICLE_COUNT.lr, TIER_RING_COLOR.lr);
    document.body.classList.add("shake");
    setTimeout(() => document.body.classList.remove("shake"), 550);
  }
}

function flashOverlay(className) {
  fxOverlay.classList.remove("flash-mid", "flash-big");
  void fxOverlay.offsetWidth; // reflow pour relancer l'animation
  fxOverlay.classList.add(className);
}

function spawnParticles(count, color) {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 220;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const size = 3 + Math.random() * 5;

    p.style.left = `${centerX}px`;
    p.style.top = `${centerY}px`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.background = color;
    p.style.setProperty("--dx", `${dx}px`);
    p.style.setProperty("--dy", `${dy}px`);
    p.style.animationDuration = `${0.8 + Math.random() * 0.6}s`;

    fxParticles.appendChild(p);
    setTimeout(() => p.remove(), 1600);
  }
}

function addToHistory(character) {
  const li = document.createElement("li");
  li.className = `rarity-${character.rarity}`;
  li.innerHTML = `
    <span>${character.name}</span>
    <span>${RARITY_LABELS[character.rarity]} (${character.rarity})</span>
  `;
  historyList.appendChild(li);

  while (historyList.children.length > 100) {
    historyList.removeChild(historyList.firstChild);
  }
}

function renderLegend() {
  legendEl.innerHTML = "";
  for (let rarity = 1; rarity <= 11; rarity++) {
    const rate = RARITY_RATES[rarity] || 0;
    const item = document.createElement("div");
    item.className = `legend-item rarity-${rarity}`;
    item.innerHTML = `<span>${RARITY_LABELS[rarity]} (${rarity})</span><span>${rate}%</span>`;
    legendEl.appendChild(item);
  }
}

function updateStats() {
  pullCountEl.textContent = pullCount;
  unlockedCountEl.textContent = `${unlocked.size} / ${ALL_CHARACTERS.length}`;
}

function toggleCollection() {
  collectionPanel.classList.toggle("hidden");
  if (!collectionPanel.classList.contains("hidden")) {
    renderCollection();
  }
}

function renderCollection() {
  collectionGrid.innerHTML = "";
  const sorted = [...ALL_CHARACTERS].sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));

  for (const character of sorted) {
    const isUnlocked = unlocked.has(character.id);
    const item = document.createElement("div");
    item.className = `collection-item rarity-${character.rarity}${isUnlocked ? "" : " locked"}`;
    item.innerHTML = `
      <span class="c-name">${isUnlocked ? character.name : "???"}</span>
      <span class="c-rarity">${RARITY_LABELS[character.rarity]} (${character.rarity})</span>
    `;
    collectionGrid.appendChild(item);
  }
}

/* ==========================================================
   PERSISTANCE (localStorage) — sauvegarde la progression
   ========================================================== */
function saveState() {
  localStorage.setItem("gacha_pullCount", pullCount);
  localStorage.setItem("gacha_unlocked", JSON.stringify([...unlocked]));
}

function loadState() {
  const savedPulls = localStorage.getItem("gacha_pullCount");
  const savedUnlocked = localStorage.getItem("gacha_unlocked");
  if (savedPulls) pullCount = parseInt(savedPulls, 10) || 0;
  if (savedUnlocked) {
    try {
      unlocked = new Set(JSON.parse(savedUnlocked));
    } catch {
      unlocked = new Set();
    }
  }
}

function resetState() {
  if (!confirm("Réinitialiser tous tes tirages et ta progression ?")) return;
  pullCount = 0;
  unlocked = new Set();
  localStorage.removeItem("gacha_pullCount");
  localStorage.removeItem("gacha_unlocked");
  resultArea.innerHTML = `<p class="placeholder-text">Les résultats de tes tirages apparaîtront ici.</p>`;
  historyList.innerHTML = "";
  updateStats();
  if (!collectionPanel.classList.contains("hidden")) renderCollection();
}
