/* ==========================================================
   CONFIGURATION DES TAUX PAR RARETÉ (total = 100%)
   Rareté 1 = très commun ... Rareté 11 = LR (ultra rare)
   Modifie ces valeurs si tu veux changer les probabilités.
   ========================================================== */
const RARITY_RATES = {
  1: 28,
  2: 20,
  3: 15,
  4: 12,
  5: 9,
  6: 6,
  7: 4,
  8: 3,
  9: 1.7,
  10: 1,
  11: 0.3
};

const RARITY_LABELS = {
  1: "Commun",
  2: "Peu commun",
  3: "Rare",
  4: "Rare+",
  5: "Super Rare",
  6: "Super Rare+",
  7: "Épique",
  8: "Épique+",
  9: "Légendaire",
  10: "Mythique",
  11: "LR"
};

let ALL_CHARACTERS = [];
let CHARACTERS_BY_RARITY = {};
let pullCount = 0;
let unlocked = new Set();

const resultArea = document.getElementById("result-area");
const historyList = document.getElementById("history-list");
const pullCountEl = document.getElementById("pull-count");
const unlockedCountEl = document.getElementById("unlocked-count");
const legendEl = document.getElementById("legend");

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

  document.getElementById("pull-1").addEventListener("click", () => doPulls(1));
  document.getElementById("pull-10").addEventListener("click", () => doPulls(10));
  document.getElementById("reset").addEventListener("click", resetState);
}

function groupByRarity(characters) {
  const grouped = {};
  for (const c of characters) {
    if (!grouped[c.rarity]) grouped[c.rarity] = [];
    grouped[c.rarity].push(c);
  }
  return grouped;
}

/* Tire une rareté au hasard selon les taux définis, puis
   un personnage au hasard parmi ceux de cette rareté. */
function rollCharacter() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  let chosenRarity = 1;

  for (let rarity = 1; rarity <= 11; rarity++) {
    const rate = RARITY_RATES[rarity] || 0;
    cumulative += rate;
    if (roll <= cumulative) {
      chosenRarity = rarity;
      break;
    }
  }

  // Sécurité : si la rareté tirée n'a aucun personnage dans le JSON,
  // on redescend vers la rareté disponible la plus proche en dessous.
  while (
    (!CHARACTERS_BY_RARITY[chosenRarity] || CHARACTERS_BY_RARITY[chosenRarity].length === 0) &&
    chosenRarity > 1
  ) {
    chosenRarity--;
  }

  const pool = CHARACTERS_BY_RARITY[chosenRarity] || [];
  if (pool.length === 0) return null;

  const character = pool[Math.floor(Math.random() * pool.length)];
  return character;
}

function doPulls(amount) {
  const results = [];
  for (let i = 0; i < amount; i++) {
    const c = rollCharacter();
    if (c) results.push(c);
  }

  pullCount += results.length;
  renderResults(results);
  results.forEach(addToHistory);
  saveState();
  updateStats();
}

function renderResults(results) {
  resultArea.innerHTML = "";
  results.forEach(character => {
    const isNew = !unlocked.has(character.id);
    unlocked.add(character.id);

    const card = document.createElement("div");
    card.className = `card rarity-${character.rarity}${isNew ? " new" : ""}`;

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
  });
}

function addToHistory(character) {
  const li = document.createElement("li");
  li.className = `rarity-${character.rarity}`;
  li.innerHTML = `
    <span>${character.name}</span>
    <span>${RARITY_LABELS[character.rarity]} (${character.rarity})</span>
  `;
  historyList.appendChild(li);

  // Limite l'historique affiché pour ne pas surcharger le DOM
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
}
