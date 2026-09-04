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
    closeButton.onclick = function () {
        overlay.remove();
    };
    modal.appendChild(closeButton);

    // ----- image en grand -----
    const imageWrap = document.createElement("div");
    imageWrap.className = "bannerModalImageWrap";

    if (banner.image) {
        const image = document.createElement("img");
        image.className = "bannerModalImage";
        image.src = banner.image;
        image.referrerPolicy = "no-referrer";
        imageWrap.appendChild(image);
    }

    modal.appendChild(imageWrap);

    // ----- contenu détaillé -----
    const content = document.createElement("div");
    content.className = "bannerModalContent";

    const name = document.createElement("h2");
    name.textContent = banner.name;
    content.appendChild(name);

    if (banner.description) {
        const description = document.createElement("p");
        description.className = "bannerModalDescription";
        description.textContent = banner.description;
        content.appendChild(description);
    }

    if (banner.startDate || banner.endDate) {
        const dates = document.createElement("p");
        dates.textContent = `Disponible du ${banner.startDate || "?"} au ${banner.endDate || "?"}`;
        content.appendChild(dates);
    }

    // ----- résultat du tirage -----
    const resultImage = document.createElement("img");
    resultImage.className = "bannerResultImage";
    resultImage.style.display = "none";
    resultImage.onclick = function () {
        resultImage.classList.toggle("enlarged");
    };
    content.appendChild(resultImage);

    const resultText = document.createElement("p");
    resultText.className = "bannerResultText";
    content.appendChild(resultText);

    // ----- boutons de pull -----
    const buttonsRow = document.createElement("div");
    buttonsRow.className = "bannerCardButtons";

    const soloButton = document.createElement("button");
    soloButton.className = "pullButton";
    soloButton.innerHTML = `1x <span>${banner.soloPrice} 💎</span>`;
    soloButton.onclick = function () {
        summon(banner, resultImage, resultText, modal);
    };

    const multiButton = document.createElement("button");
    multiButton.className = "pullButton";
    multiButton.innerHTML = `10+1x <span>${banner.multiPrice} 💎</span>`;
    multiButton.onclick = function () {
        multiSummon(banner, resultImage, resultText, modal);
    };

    buttonsRow.appendChild(soloButton);
    buttonsRow.appendChild(multiButton);
    content.appendChild(buttonsRow);

    modal.appendChild(content);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

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
// AFFICHAGE D'UN RESULTAT DANS UNE CARTE (solo, zone permanente)
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

async function summon(banner, resultImage, resultText, modal) {

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

    const added = await addToInventory(chosen);

    if (!added) {
        console.error("Le personnage n'a pas pu être ajouté à l'inventaire.");
    }

    startSequentialReveal([chosen], modal, function () {
        displayResultInCard(chosen, resultImage, resultText);
    });

}


// ========================================
// SUMMON (x10+1) SUR UNE BANNIERE DONNEE
// ========================================

async function multiSummon(banner, resultImage, resultText, modal) {

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

    console.log(
        "Personnages obtenus (x10+1) :",
        drawn.map((c) => c.name)
    );

    if (drawn.length === 0) {
        return;
    }

    startSequentialReveal(drawn, modal, function () {
        displayResultInCard(drawn[drawn.length - 1], resultImage, resultText);
    });

}


// ========================================
// REVELATION SEQUENTIELLE (clic pour passer au suivant)
// ========================================

function startSequentialReveal(drawn, modal, onFinished) {

    let index = 0;

    const revealOverlay = document.createElement("div");
    revealOverlay.className = "revealOverlay";

    const revealCard = document.createElement("div");
    revealCard.className = "revealCard";
    revealOverlay.appendChild(revealCard);

    const revealImage = document.createElement("img");
    revealImage.className = "revealImage";
    revealCard.appendChild(revealImage);

    const revealName = document.createElement("p");
    revealName.className = "revealName";
    revealCard.appendChild(revealName);

    const revealHint = document.createElement("p");
    revealHint.className = "revealHint";
    revealOverlay.appendChild(revealHint);

    function showCurrent() {

        const character = drawn[index];

        if (character.image) {
            revealImage.referrerPolicy = "no-referrer";
            revealImage.src = character.image;
            revealImage.style.display = "block";
        } else {
            revealImage.style.display = "none";
        }

        revealName.textContent = character.name;

        revealHint.textContent = drawn.length > 1
            ? `${index + 1} / ${drawn.length} — cliquez pour continuer`
            : "cliquez pour fermer";

        // relance l'animation d'apparition à chaque personnage
        revealCard.classList.remove("revealCardEnter");
        void revealCard.offsetWidth;
        revealCard.classList.add("revealCardEnter");

    }

    revealOverlay.onclick = function () {

        index++;

        if (index >= drawn.length) {
            revealOverlay.remove();
            if (onFinished) {
                onFinished();
            }
            return;
        }

        showCurrent();

    };

    showCurrent();

    modal.appendChild(revealOverlay);

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
