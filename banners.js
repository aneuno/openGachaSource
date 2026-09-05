const SUPABASE_URL =
"https://cskeaklbzfqanzinjfxm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_bKQb420z_j9ckzdUVNxHlQ_atXD-A_M";

const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

// ========================================
// ELEMENTS HTML
// ========================================

const userEmail = document.getElementById("userEmail");
const logoutButton = document.getElementById("logoutButton");
const backButton = document.getElementById("backButton");
const gemsDisplay = document.getElementById("gemsDisplay");
const bannersContainer = document.getElementById("bannersContainer");

// ========================================
// ETAT GLOBAL
// ========================================

let banners = [];
let userGems = 0;

// ========================================
// CHARGEMENT DES BANNIERES
// ========================================

async function loadBanners() {

try {

    const response = await fetch("banners.json");

    if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
    }

    const data = await response.json();

    banners = data.banners;

    console.log("Bannières chargées :", banners);

    renderAllBanners();

}

catch (error) {
    console.error("Erreur lors du chargement des bannières :", error);
}

}

// ========================================
// AFFICHAGE DE TOUTES LES BANNIERES
// ========================================

function renderAllBanners() {

bannersContainer.innerHTML = "";

banners.forEach((banner) => {
    bannersContainer.appendChild(createBannerCard(banner));
});

}

// ========================================
// CREATION D'UNE CARTE DE BANNIERE (juste l'image)
// ========================================

function createBannerCard(banner) {

const card = document.createElement("div");
card.className = "bannerCard";
card.onclick = function () {
    openBannerModal(banner);
};

const imageWrap = document.createElement("div");
imageWrap.className = "bannerCardImageWrap";

if (banner.image) {
    const image = document.createElement("img");
    image.className = "bannerCardImage";
    image.src = banner.image;
    image.referrerPolicy = "no-referrer";
    imageWrap.appendChild(image);
}

card.appendChild(imageWrap);

return card;

}

// ========================================
// OUVERTURE DE LA FENETRE DETAIL D'UNE BANNIERE
// ========================================
//
// La fenêtre a deux "vues" qui se partagent les mêmes éléments DOM :
//  - vue "banniere" : image de la bannière + infos de la bannière + boutons
//  - vue "reveal"   : image du personnage tiré + infos du personnage
//
// On ne crée jamais de nouvelle couche par-dessus : on remplace le contenu
// des mêmes éléments (image, titre, description, dates) avec une petite
// animation à chaque changement.

function openBannerModal(banner) {

const overlay = document.createElement("div");
overlay.className = "modalOverlay";
overlay.onclick = function (event) {
    if (event.target === overlay) {
        overlay.remove();
    }
};

const modal = document.createElement("div");
modal.className = "bannerModal";

// ----- fermeture -----
const closeButton = document.createElement("button");
closeButton.className = "modalCloseButton";
closeButton.textContent = "✕";
closeButton.onclick = function (event) {
    event.stopPropagation();
    overlay.remove();
};
modal.appendChild(closeButton);

// ----- image (bannière puis, pendant le reveal, personnage) -----
const imageWrap = document.createElement("div");
imageWrap.className = "bannerModalImageWrap";

const image = document.createElement("img");
image.className = "bannerModalImage";
image.referrerPolicy = "no-referrer";

if (banner.image) {
    image.src = banner.image;
    image.alt = banner.name;
} else {
    image.style.display = "none";
}

imageWrap.appendChild(image);
modal.appendChild(imageWrap);

// ----- contenu (bannière puis, pendant le reveal, personnage) -----
const content = document.createElement("div");
content.className = "bannerModalContent";

const name = document.createElement("h2");
name.textContent = banner.name;
content.appendChild(name);

const description = document.createElement("p");
description.className = "bannerModalDescription";
description.textContent = banner.description || "";
content.appendChild(description);

const dates = document.createElement("p");
dates.className = "bannerModalDates";
dates.textContent = (banner.startDate || banner.endDate)
    ? `Disponible du ${banner.startDate || "?"} au ${banner.endDate || "?"}`
    : "";
content.appendChild(dates);

const hint = document.createElement("p");
hint.className = "bannerModalHint";
hint.style.display = "none";
content.appendChild(hint);

// ----- boutons de pull -----
const buttonsRow = document.createElement("div");
buttonsRow.className = "bannerCardButtons";

const soloButton = document.createElement("button");
soloButton.className = "pullButton";
soloButton.innerHTML = `1x <span>${banner.soloPrice} 💎</span>`;
soloButton.onclick = function (event) {
    event.stopPropagation();
    handleSummon(viewState, 1);
};

const multiButton = document.createElement("button");
multiButton.className = "pullButton";
multiButton.innerHTML = `10+1x <span>${banner.multiPrice} 💎</span>`;
multiButton.onclick = function (event) {
    event.stopPropagation();
    handleSummon(viewState, 11);
};

buttonsRow.appendChild(soloButton);
buttonsRow.appendChild(multiButton);
content.appendChild(buttonsRow);

modal.appendChild(content);
overlay.appendChild(modal);
document.body.appendChild(overlay);

// ----- état de la fenêtre -----
const viewState = {
    banner,
    image,
    name,
    description,
    dates,
    hint,
    buttonsRow,
    mode: "banner", // "banner" ou "reveal"
    queue: [],
    index: 0
};

// clic n'importe où sur la fenêtre : fait avancer le reveal (si actif)
modal.onclick = function () {
    if (viewState.mode === "reveal") {
        advanceReveal(viewState);
    }
};

}

// ========================================
// GESTION DES GEMMES
// ========================================

async function loadUserGems() {

const {
    data: { user }
} = await supabaseClient.auth.getUser();

if (!user) {
    return;
}

const {
    data,
    error
} = await supabaseClient
    .from("profiles")
    .select("gems")
    .eq("id", user.id)
    .maybeSingle();

if (error) {
    console.error(
        "Erreur lors de la récupération des gemmes :",
        error.message,
        error.details,
        error.hint,
        error.code
    );
    return;
}

if (!data) {

    const { error: insertError } = await supabaseClient
        .from("profiles")
        .insert({ id: user.id, gems: 10000 });

    if (insertError) {
        console.error("Erreur lors de la création du profil :", insertError);
        return;
    }

    userGems = 10000;

} else {

    userGems = data.gems;

}

updateGemsDisplay();

}

function updateGemsDisplay() {

if (gemsDisplay) {
    gemsDisplay.textContent = `${userGems} gemmes`;
}

}

async function spendGems(amount) {

if (userGems < amount) {
    console.warn("Pas assez de gemmes.");
    return false;
}

const {
    data: { user }
} = await supabaseClient.auth.getUser();

if (!user) {
    return false;
}

const newBalance = userGems - amount;

const { error } = await supabaseClient
    .from("profiles")
    .update({ gems: newBalance })
    .eq("id", user.id);

if (error) {
    console.error("Erreur lors de la mise à jour des gemmes :", error);
    return false;
}

userGems = newBalance;

updateGemsDisplay();

return true;

}

// ========================================
// TIRAGE ALEATOIRE PONDERE
// ========================================

function getRandomCharacter(pool) {

const totalWeight = pool.reduce(
    (total, character) => total + Number(character.weight),
    0
);

let random = Math.random() * totalWeight;

for (const character of pool) {

    random -= Number(character.weight);

    if (random < 0) {
        return character;
    }

}

return null;

}

// ========================================
// AJOUT A L'INVENTAIRE
// ========================================

async function addToInventory(character) {

const {
    data: { user },
    error: userError
} = await supabaseClient.auth.getUser();

if (userError) {
    console.error("Erreur utilisateur :", userError);
    return false;
}

if (!user) {
    console.error("Aucun utilisateur connecté.");
    return false;
}

const {
    data: existingCharacter,
    error: selectError
} = await supabaseClient
    .from("inventory")
    .select("*")
    .eq("user_id", user.id)
    .eq("character_id", character.id)
    .maybeSingle();

if (selectError) {
    console.error("Erreur lors de la recherche dans l'inventaire :", selectError);
    return false;
}

if (existingCharacter) {

    const newQuantity = existingCharacter.quantity + 1;

    const { error: updateError } = await supabaseClient
        .from("inventory")
        .update({
            quantity: newQuantity,
            character_name: character.name,
            character_image: character.image,
            character_rarity: character.rarity,
            character_weight: character.weight
        })
        .eq("user_id", user.id)
        .eq("character_id", character.id);

    if (updateError) {
        console.error("Erreur lors de la mise à jour de l'inventaire :", updateError);
        return false;
    }

    return true;

}

const { error: insertError } = await supabaseClient
    .from("inventory")
    .insert({
        user_id: user.id,
        character_id: character.id,
        character_name: character.name,
        character_image: character.image,
        character_rarity: character.rarity,
        character_weight: character.weight,
        quantity: 1
    });

if (insertError) {
    console.error("Erreur lors de l'ajout à l'inventaire :", insertError);
    return false;
}

return true;

}

// ========================================
// LANCEMENT D'UN SUMMON (x1 ou x10+1)
// ========================================

async function handleSummon(viewState, count) {

const banner = viewState.banner;

if (banner.characters.length === 0) {
    console.error("Cette bannière ne contient aucun personnage.");
    return;
}

const price = count === 1 ? banner.soloPrice : banner.multiPrice;

const spent = await spendGems(price);

if (!spent) {
    alert("Pas assez de gemmes pour ce summon.");
    return;
}

const drawn = [];

for (let i = 0; i < count; i++) {

    const chosen = getRandomCharacter(banner.characters);

    if (chosen) {
        drawn.push(chosen);
        await addToInventory(chosen);
    }

}

console.log(
    `Personnages obtenus (x${count}) :`,
    drawn.map((c) => c.name)
);

if (drawn.length === 0) {
    return;
}

viewState.queue = drawn;
viewState.index = 0;
viewState.mode = "reveal";

viewState.buttonsRow.style.display = "none";
viewState.hint.style.display = "block";

showCurrentCharacter(viewState);

}

// ========================================
// AFFICHAGE ANIME DU PERSONNAGE COURANT
// ========================================

function showCurrentCharacter(viewState) {

const character = viewState.queue[viewState.index];

swapImage(viewState.image, character.image, character.name);
swapText(viewState.name, character.name);
swapText(viewState.description, character.description || "");
swapText(
    viewState.dates,
    character.rarity ? `Rareté : ${character.rarity.toUpperCase()}` : ""
);
swapText(
    viewState.hint,
    viewState.queue.length > 1
        ? `${viewState.index + 1} / ${viewState.queue.length} — cliquez pour continuer`
        : "cliquez pour continuer"
);

}

// ========================================
// PASSAGE AU PERSONNAGE SUIVANT / RETOUR
// ========================================

function advanceReveal(viewState) {

viewState.index++;

if (viewState.index >= viewState.queue.length) {
    returnToBannerView(viewState);
    return;
}

showCurrentCharacter(viewState);

}

function returnToBannerView(viewState) {

const banner = viewState.banner;

viewState.mode = "banner";
viewState.queue = [];
viewState.index = 0;

swapImage(viewState.image, banner.image, banner.name);
swapText(viewState.name, banner.name);
swapText(viewState.description, banner.description || "");
swapText(
    viewState.dates,
    (banner.startDate || banner.endDate)
        ? `Disponible du ${banner.startDate || "?"} au ${banner.endDate || "?"}`
        : ""
);
swapText(viewState.hint, "");

viewState.hint.style.display = "none";
viewState.buttonsRow.style.display = "flex";

}

// ========================================
// PETITS UTILITAIRES D'ANIMATION
// ========================================
//
// Remplace le contenu d'un élément (image ou texte) en rejouant une
// animation d'apparition à chaque changement.

function swapImage(imageElement, src, alt) {

imageElement.classList.remove("fadeSwapAnim");
void imageElement.offsetWidth; // force le reflow pour rejouer l'animation

if (src) {
    imageElement.src = src;
    imageElement.alt = alt || "";
    imageElement.style.display = "block";
} else {
    imageElement.removeAttribute("src");
    imageElement.style.display = "none";
}

imageElement.classList.add("fadeSwapAnim");

}

function swapText(element, text) {

element.classList.remove("fadeSwapAnim");
void element.offsetWidth; // force le reflow pour rejouer l'animation

element.textContent = text;

element.classList.add("fadeSwapAnim");

}

// ========================================
// NAVIGATION
// ========================================

backButton.onclick = function () {
window.location.href = "index.html";
};

// ========================================
// VERIFICATION DU COMPTE
// ========================================

async function checkUser() {

const {
    data,
    error
} = await supabaseClient.auth.getUser();

if (error || !data.user) {
    window.location.href = "login.html";
    return false;
}

userEmail.textContent = data.user.email;

return true;

}

// ========================================
// DECONNEXION
// ========================================

logoutButton.onclick = async function () {

const { error } = await supabaseClient.auth.signOut();

if (error) {
    console.error("Erreur de déconnexion :", error);
    return;
}

window.location.href = "login.html";

};

// ========================================
// INITIALISATION
// ========================================

async function init() {

const loggedIn = await checkUser();

if (!loggedIn) {
    return;
}

await loadUserGems();
await loadBanners();

}

init();
