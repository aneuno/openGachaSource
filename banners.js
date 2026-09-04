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

const button = document.getElementById("summonButton");
const multiButton = document.getElementById("multiSummonButton");
const result = document.getElementById("result");
const resultImage = document.getElementById("resultImage");
const userEmail = document.getElementById("userEmail");
const logoutButton = document.getElementById("logoutButton");
const backButton = document.getElementById("backButton");

const bannerList = document.getElementById("bannerList");
const bannerImage = document.getElementById("bannerImage");
const bannerName = document.getElementById("bannerName");
const bannerDescription = document.getElementById("bannerDescription");
const soloPriceLabel = document.getElementById("soloPriceLabel");
const multiPriceLabel = document.getElementById("multiPriceLabel");
const gemsDisplay = document.getElementById("gemsDisplay");


// ========================================
// ETAT GLOBAL
// ========================================

let banners = [];
let currentBanner = null;
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

        renderBannerList();

        if (banners.length > 0) {
            selectBanner(banners[0]);
        }

    }

    catch (error) {
        console.error("Erreur lors du chargement des bannières :", error);
    }

}


// ========================================
// AFFICHAGE DE LA LISTE DES BANNIERES
// ========================================

function renderBannerList() {

    bannerList.innerHTML = "";

    banners.forEach((banner) => {

        const btn = document.createElement("button");

        btn.textContent = banner.name;
        btn.dataset.bannerId = banner.id;

        btn.onclick = () => selectBanner(banner);

        bannerList.appendChild(btn);

    });

}


// ========================================
// SELECTION D'UNE BANNIERE
// ========================================

function selectBanner(banner) {

    currentBanner = banner;

    bannerName.textContent = banner.name;
    bannerDescription.textContent = banner.description || "";

    soloPriceLabel.textContent =
        `1 summon : ${banner.soloPrice} gemmes`;

    multiPriceLabel.textContent =
        `10 summon : ${banner.multiPrice} gemmes`;

    if (banner.image) {
        bannerImage.src = banner.image;
        bannerImage.style.display = "block";
    } else {
        bannerImage.style.display = "none";
    }

    [...bannerList.children].forEach((btn) => {
        btn.classList.toggle(
            "active",
            btn.dataset.bannerId === banner.id
        );
    });

    result.textContent = "";
    resultImage.style.display = "none";

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
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Erreur lors de la récupération des gemmes :", error);
        return;
    }

    if (!data) {

        const { error: insertError } = await supabaseClient
            .from("profiles")
            .insert({ user_id: user.id, gems: 10000 });

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
        .eq("user_id", user.id);

    if (error) {
        console.error("Erreur lors de la mise à jour des gemmes :", error);
        return false;
    }

    userGems = newBalance;

    updateGemsDisplay();

    return true;

}


// ========================================
// TIRAGE ALEATOIRE PONDERE (dans la bannière active)
// ========================================

function getRandomCharacter() {

    const pool = currentBanner.characters;

    const totalWeight = pool.reduce(
        (total, character) => total + character.weight,
        0
    );

    let random = Math.random() * totalWeight;

    for (const character of pool) {

        random -= character.weight;

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
// AFFICHAGE D'UN RESULTAT
// ========================================

function displayResult(character) {

    result.textContent = character.name;

    if (character.image) {

        resultImage.referrerPolicy = "no-referrer";
        resultImage.src = character.image;
        resultImage.alt = character.name;
        resultImage.style.display = "block";
        resultImage.classList.remove("enlarged");

    } else {

        resultImage.style.display = "none";

    }

}


// ========================================
// SUMMON (x1)
// ========================================

async function summon() {

    if (!currentBanner) {
        console.error("Aucune bannière sélectionnée.");
        return;
    }

    if (currentBanner.characters.length === 0) {
        console.error("Cette bannière ne contient aucun personnage.");
        return;
    }

    const spent = await spendGems(currentBanner.soloPrice);

    if (!spent) {
        alert("Pas assez de gemmes pour ce summon.");
        return;
    }

    const chosen = getRandomCharacter();

    if (!chosen) {
        return;
    }

    displayResult(chosen);

    const added = await addToInventory(chosen);

    if (!added) {
        console.error("Le personnage n'a pas pu être ajouté à l'inventaire.");
    }

}


// ========================================
// SUMMON (x10)
// ========================================

async function multiSummon() {

    if (!currentBanner) {
        console.error("Aucune bannière sélectionnée.");
        return;
    }

    if (currentBanner.characters.length === 0) {
        console.error("Cette bannière ne contient aucun personnage.");
        return;
    }

    const spent = await spendGems(currentBanner.multiPrice);

    if (!spent) {
        alert("Pas assez de gemmes pour ce multi summon.");
        return;
    }

    const drawn = [];

    for (let i = 0; i < 10; i++) {

        const chosen = getRandomCharacter();

        if (chosen) {
            drawn.push(chosen);
            await addToInventory(chosen);
        }

    }

    if (drawn.length > 0) {
        displayResult(drawn[drawn.length - 1]);
    }

    console.log(
        "Personnages obtenus (x10) :",
        drawn.map((c) => c.name)
    );

}


// ========================================
// EVENEMENTS BOUTONS
// ========================================

button.onclick = function () {
    summon();
};

multiButton.onclick = function () {
    multiSummon();
};

resultImage.onclick = function () {
    resultImage.classList.toggle("enlarged");
};

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
