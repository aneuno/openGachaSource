// ---------- State ----------

let CHARACTERS = [];
let shards = 300;

const COST_SINGLE = 100;
const COST_TEN = 900;

// Rareté fixe par personnage (identité), utilisée pour l'affichage du bandeau
// et comme pool de tirage pondéré.
const RARITY_MAP = {
  "saber": "SSR",
  "zero two": "SSR",
  "misato": "SR",
  "revy": "SR",
  "marin": "R"
};

const RARITY_WEIGHTS = [
  { tier: "SSR", weight: 5 },
  { tier: "SR", weight: 25 },
  { tier: "R", weight: 70 }
];

// ---------- DOM refs ----------

const shardCountEl = document.getElementById("shardCount");
const featuredStrip = document.getElementById("featuredStrip");
const historyList = document.getElementById("historyList");
const gate = document.getElementById("gate");
const gateParticles = document.getElementById("gateParticles");

const pullOneBtn = document.getElementById("pullOne");
const pullTenBtn = document.getElementById("pullTen");

const resultOverlay = document.getElementById("resultOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalGrid = document.getElementById("modalGrid");
const modalClose = document.getElementById("modalClose");
const modalContinue = document.getElementById("modalContinue");

// ---------- Load character data ----------

async function loadCharacters() {
  try {
    const res = await fetch("characters.json");
    if (!res.ok) throw new Error("network");
    const data = await res.json();
    CHARACTERS = data.results || [];
  } catch (err) {
    console.warn("Impossible de charger characters.json (ouverture en file:// ?). Utilisation des données de secours.", err);
    // Secours si le fichier ne peut pas être chargé via fetch (ex: ouverture directe du fichier).
    CHARACTERS = [
      { name: "saber", image: "https://res.cloudinary.com/daowtjque/image/upload/v1773661792/24a7eecb347dd7d60c050bcde3276448_x0odwo.jpg" },
      { name: "misato", image: "https://res.cloudinary.com/daowtjque/image/upload/v1773661792/24a7eecb347dd7d60c050bcde3276448_x0odwo.jpg" },
      { name: "zero two", image: "https://res.cloudinary.com/daowtjque/image/upload/v1773661792/24a7eecb347dd7d60c050bcde3276448_x0odwo.jpg" },
      { name: "revy", image: "https://res.cloudinary.com/daowtjque/image/upload/v1773661792/24a7eecb347dd7d60c050bcde3276448_x0odwo.jpg" },
      { name: "marin", image: "https://res.cloudinary.com/daowtjque/image/upload/v1773661792/24a7eecb347dd7d60c050bcde3276448_x0odwo.jpg" }
    ];
  }
  renderFeaturedStrip();
}

function renderFeaturedStrip() {
  featuredStrip.innerHTML = CHARACTERS.map(c => `
    <div class="featured-chip">
      <img src="${c.image}" alt="${c.name}" loading="lazy">
      <span>${c.name}</span>
    </div>
  `).join("");
}

// ---------- Gacha logic ----------

function pickTier() {
  const total = RARITY_WEIGHTS.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of RARITY_WEIGHTS) {
    if (roll < r.weight) return r.tier;
    roll -= r.weight;
  }
  return "R";
}

function charactersOfTier(tier) {
  const names = Object.keys(RARITY_MAP).filter(n => RARITY_MAP[n] === tier);
  const pool = CHARACTERS.filter(c => names.includes(c.name));
  return pool.length ? pool : CHARACTERS;
}

function summonOne(forceMinTier) {
  let tier = pickTier();
  if (forceMinTier && tierRank(tier) < tierRank(forceMinTier)) {
    tier = forceMinTier;
  }
  const pool = charactersOfTier(tier);
  const character = pool[Math.floor(Math.random() * pool.length)];
  return { ...character, tier };
}

function tierRank(tier) {
  return { R: 0, SR: 1, SSR: 2 }[tier] ?? 0;
}

// ---------- Currency ----------

function updateShards(delta) {
  shards += delta;
  shardCountEl.textContent = shards;
}

function canAfford(cost) {
  return shards >= cost;
}

// ---------- Gate animation ----------

function playGateAnimation(duration = 1400) {
  return new Promise(resolve => {
    gate.classList.add("charging");
    const sparkInterval = setInterval(spawnSpark, 90);

    setTimeout(() => {
      clearInterval(sparkInterval);
      gate.classList.remove("charging");
      resolve();
    }, duration);
  });
}

function spawnSpark() {
  const spark = document.createElement("div");
  spark.className = "spark";
  const dx = (Math.random() - 0.5) * 140;
  spark.style.setProperty("--dx", `${dx}px`);
  spark.style.left = `calc(50% + ${(Math.random() - 0.5) * 60}px)`;
  gateParticles.appendChild(spark);
  setTimeout(() => spark.remove(), 1200);
}

// ---------- Pull handlers ----------

async function handlePull(count) {
  const cost = count === 10 ? COST_TEN : COST_SINGLE;
  if (!canAfford(cost)) {
    flashInsufficient();
    return;
  }

  setPullButtonsDisabled(true);
  updateShards(-cost);

  await playGateAnimation(count === 10 ? 1800 : 1300);

  const results = [];
  for (let i = 0; i < count; i++) {
    // Le pull x10 garantit au moins un SR ou mieux sur le dernier tirage.
    const guaranteed = (count === 10 && i === count - 1 && !results.some(r => tierRank(r.tier) >= 1));
    results.push(summonOne(guaranteed ? "SR" : null));
  }

  showResults(results);
  results.forEach(r => addHistoryEntry(r));

  setPullButtonsDisabled(false);
}

function setPullButtonsDisabled(disabled) {
  pullOneBtn.disabled = disabled;
  pullTenBtn.disabled = disabled;
}

function flashInsufficient() {
  const original = shardCountEl.parentElement.style.borderColor;
  shardCountEl.parentElement.style.borderColor = "#ff6b6b";
  shardCountEl.parentElement.style.transition = "border-color 0.2s ease";
  setTimeout(() => {
    shardCountEl.parentElement.style.borderColor = original || "";
  }, 500);
}

// ---------- Results modal ----------

function showResults(results) {
  modalTitle.textContent = results.length > 1
    ? `${results.length} âmes ont répondu à l'appel`
    : "Une âme a répondu à l'appel";

  modalGrid.innerHTML = results.map((r, i) => `
    <div class="result-card ${r.tier}" style="animation-delay:${i * 0.08}s">
      <img src="${r.image}" alt="${r.name}">
      <div class="r-tier">${r.tier}</div>
      <div class="r-name">${r.name}</div>
    </div>
  `).join("");

  resultOverlay.classList.add("open");
}

function closeModal() {
  resultOverlay.classList.remove("open");
}

// ---------- History ----------

function addHistoryEntry(result) {
  const emptyMsg = historyList.querySelector(".history-empty");
  if (emptyMsg) emptyMsg.remove();

  const row = document.createElement("div");
  row.className = "history-row";
  row.innerHTML = `
    <img src="${result.image}" alt="${result.name}">
    <span class="h-name">${result.name}</span>
    <span class="h-rarity ${result.tier}">${result.tier}</span>
    <span class="h-time">${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
  `;
  historyList.prepend(row);

  // Garde un historique raisonnable.
  const rows = historyList.querySelectorAll(".history-row");
  if (rows.length > 40) rows[rows.length - 1].remove();
}

// ---------- Events ----------

pullOneBtn.addEventListener("click", () => handlePull(1));
pullTenBtn.addEventListener("click", () => handlePull(10));
modalClose.addEventListener("click", closeModal);
modalContinue.addEventListener("click", closeModal);
resultOverlay.addEventListener("click", (e) => {
  if (e.target === resultOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ---------- Init ----------

loadCharacters();
