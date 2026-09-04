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
// CREATION D'UNE CARTE DE BANNIERE
// ========================================

function createBannerCard(banner) {

    const card = document.createElement("div");
    card.className = "bannerCard";

    // ----- image de la bannière -----
    const image = document.createElement("img");
    image.className = "bannerCardImage";
    if (banner.image) {
        image.src = banner.image;
        image.referrerPolicy = "no-referrer";
    } else {
        image.style.display = "none";
    }
    card.appendChild(image);

    // ----- nom -----
    const name = document.createElement("h2");
    name.textContent = banner.name;
    card.appendChild(name);

    // ----- description -----
    const description = document.createElement("p");
    description.textContent = banner.description || "";
    card.appendChild(description);

    // ----- prix -----
    const soloPrice = document.createElement("p");
    soloPrice.textContent = `1 summon : ${banner.soloPrice} gemmes`;
    card.appendChild(soloPrice);

    const multiPrice = document.createElement("p");
    multiPrice.textContent = `10 summon : ${banner.multiPrice} gemmes`;
    card.appendChild(multiPrice);

    // ----- résultat du tirage -----
    const resultImage = document.createElement("img");
    resultImage.className = "bannerResultImage";
    resultImage.style.display = "none";
    resultImage.onclick = function () {
        resultImage.classList.toggle("enlarged");
    };
    card.appendChild(resultImage);

    const resultText = document.createElement("p");
    resultText.className = "bannerResultText";
    card.appendChild(resultText);

    // ----- boutons summon -----
    const buttonsRow = document.createElement("div");
    buttonsRow.className = "bannerCardButtons";

    const soloButton = document.createElement("button");
    soloButton.textContent = "1 summon";
    soloButton.onclick = function () {
        summon(banner, resultImage, resultText);
    };

    const multiButton = document.createElement("button");
    multiButton.textContent = "10 summon +1";
    multiButton.onclick = function () {
        multiSummon(banner, resultImage, resultText);
    };

    buttonsRow.appendChild(soloButton);
    buttonsRow.appendChild(multiButton);
    card.appendChild(buttonsRow);

    return card;

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
// AFFICHAGE D'UN RESULTAT DANS UNE CARTE
// ========================================

function displayResultInCard(character, resultImage, resultText) {

    resultText.textContent = character.name;

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
// SUMMON (x1) SUR UNE BANNIERE DONNEE
// ========================================

async function summon(banner, resultImage, resultText) {

    if (banner.characters.length === 0) {
        console.error("Cette bannière ne contient aucun personnage.");
        return;
    }

    const spent = await spendGems(banner.soloPrice);

    if (!spent) {
        alert("Pas assez de gemmes pour ce summon.");
        return;
    }

    const chosen = getRandomCharacter(banner.characters);

    if (!chosen) {
        return;
    }

    displayResultInCard(chosen, resultImage, resultText);

    const added = await addToInventory(chosen);

    if (!added) {
        console.error("Le personnage n'a pas pu être ajouté à l'inventaire.");
    }

}


// ========================================
// SUMMON (x10) SUR UNE BANNIERE DONNEE
// ========================================

async function multiSummon(banner, resultImage, resultText) {

    if (banner.characters.length === 0) {
        console.error("Cette bannière ne contient aucun personnage.");
        return;
    }

    const spent = await spendGems(banner.multiPrice);

    if (!spent) {
        alert("Pas assez de gemmes pour ce multi summon.");
        return;
    }

    const drawn = [];

    for (let i = 0; i < 10 + 1; i++) {

        const chosen = getRandomCharacter(banner.characters);

        if (chosen) {
            drawn.push(chosen);
            await addToInventory(chosen);
        }

    }

    if (drawn.length > 0) {
        displayResultInCard(drawn[drawn.length - 1], resultImage, resultText);
    }

    console.log(
        "Personnages obtenus (x10) :",
        drawn.map((c) => c.name)
    );

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
