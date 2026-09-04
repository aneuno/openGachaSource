```javascript
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

        console.error(
            "Erreur lors du chargement des bannières :",
            error
        );

    }

}


// ========================================
// AFFICHAGE DE TOUTES LES BANNIERES
// ========================================

function renderAllBanners() {

    bannersContainer.innerHTML = "";

    banners.forEach((banner) => {
        bannersContainer.appendChild(
            createBannerCard(banner)
        );
    });

}


// ========================================
// CREATION D'UNE CARTE DE BANNIERE
// ========================================

function createBannerCard(banner) {

    const card = document.createElement("div");

    card.className = "bannerCard";

    card.onclick = function () {
        openBannerModal(banner);
    };


    const imageWrap = document.createElement("div");

    imageWrap.className =
        "bannerCardImageWrap";


    if (banner.image) {

        const image =
            document.createElement("img");

        image.className =
            "bannerCardImage";

        image.src =
            banner.image;

        image.referrerPolicy =
            "no-referrer";

        imageWrap.appendChild(image);

    }


    card.appendChild(imageWrap);

    return card;

}


// ========================================
// OUVERTURE DE LA MODALE
// ========================================

function openBannerModal(banner) {

    const overlay =
        document.createElement("div");

    overlay.className =
        "modalOverlay";


    overlay.onclick = function (event) {

        if (event.target === overlay) {
            overlay.remove();
        }

    };


    const modal =
        document.createElement("div");

    modal.className =
        "bannerModal";


    // ====================================
    // FERMETURE
    // ====================================

    const closeButton =
        document.createElement("button");

    closeButton.className =
        "modalCloseButton";

    closeButton.textContent =
        "✕";

    closeButton.onclick = function () {
        overlay.remove();
    };

    modal.appendChild(closeButton);


    // ====================================
    // IMAGE
    // ====================================

    const imageWrap =
        document.createElement("div");

    imageWrap.className =
        "bannerModalImageWrap";


    const image =
        document.createElement("img");

    image.className =
        "bannerModalImage";

    image.referrerPolicy =
        "no-referrer";


    if (banner.image) {
        image.src = banner.image;
    }


    imageWrap.appendChild(image);

    modal.appendChild(imageWrap);


    // ====================================
    // CONTENU DROIT
    // ====================================

    const content =
        document.createElement("div");

    content.className =
        "bannerModalContent";


    const name =
        document.createElement("h2");

    name.textContent =
        banner.name;

    content.appendChild(name);


    const description =
        document.createElement("p");

    description.className =
        "bannerModalDescription";

    description.textContent =
        banner.description || "";

    content.appendChild(description);


    const dates =
        document.createElement("p");

    dates.textContent =
        `Disponible du ${banner.startDate || "?"} au ${banner.endDate || "?"}`;

    content.appendChild(dates);


    // ====================================
    // INFORMATIONS PERSONNAGE
    // ====================================

    const characterInfo =
        document.createElement("div");

    characterInfo.className =
        "characterInfo";

    characterInfo.style.display =
        "none";


    const characterRarity =
        document.createElement("p");

    characterRarity.className =
        "characterRarity";

    characterInfo.appendChild(
        characterRarity
    );


    const characterId =
        document.createElement("p");

    characterId.className =
        "characterId";

    characterInfo.appendChild(
        characterId
    );


    content.appendChild(
        characterInfo
    );


    // ====================================
    // PROGRESSION DU MULTI
    // ====================================

    const multiProgress =
        document.createElement("p");

    multiProgress.className =
        "multiProgress";

    content.appendChild(
        multiProgress
    );


    // ====================================
    // RESULTAT
    // ====================================

    const resultImage =
        image;

    resultImage.onclick =
        function () {

            resultImage.classList.toggle(
                "enlarged"
            );

        };


    // ====================================
    // BOUTONS
    // ====================================

    const buttonsRow =
        document.createElement("div");

    buttonsRow.className =
        "bannerCardButtons";


    const soloButton =
        document.createElement("button");

    soloButton.className =
        "pullButton";

    soloButton.innerHTML =
        `1x <span>${banner.soloPrice} 💎</span>`;


    const multiButton =
        document.createElement("button");

    multiButton.className =
        "pullButton";

    multiButton.innerHTML =
        `10+1x <span>${banner.multiPrice} 💎</span>`;


    soloButton.onclick =
        async function () {

            await summon(
                banner,
                resultImage,
                name,
                description,
                dates,
                characterInfo,
                characterRarity,
                characterId,
                multiProgress,
                soloButton,
                multiButton
            );

        };


    multiButton.onclick =
        async function () {

            await multiSummon(
                banner,
                resultImage,
                name,
                description,
                dates,
                characterInfo,
                characterRarity,
                characterId,
                multiProgress,
                soloButton,
                multiButton
            );

        };


    buttonsRow.appendChild(
        soloButton
    );

    buttonsRow.appendChild(
        multiButton
    );

    content.appendChild(
        buttonsRow
    );


    modal.appendChild(
        content
    );

    overlay.appendChild(
        modal
    );

    document.body.appendChild(
        overlay
    );

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

        const {
            error: insertError
        } = await supabaseClient
            .from("profiles")
            .insert({
                id: user.id,
                gems: 10000
            });


        if (insertError) {

            console.error(
                "Erreur lors de la création du profil :",
                insertError
            );

            return;

        }


        userGems = 10000;

    }

    else {

        userGems = data.gems;

    }


    updateGemsDisplay();

}


// ========================================
// AFFICHAGE DES GEMMES
// ========================================

function updateGemsDisplay() {

    if (gemsDisplay) {

        gemsDisplay.textContent =
            `${userGems} gemmes`;

    }

}


// ========================================
// DEPENSER DES GEMMES
// ========================================

async function spendGems(amount) {

    if (userGems < amount) {

        console.warn(
            "Pas assez de gemmes."
        );

        return false;

    }


    const {
        data: { user }
    } = await supabaseClient.auth.getUser();


    if (!user) {
        return false;
    }


    const newBalance =
        userGems - amount;


    const {
        error
    } = await supabaseClient
        .from("profiles")
        .update({
            gems: newBalance
        })
        .eq("id", user.id);


    if (error) {

        console.error(
            "Erreur lors de la mise à jour des gemmes :",
            error
        );

        return false;

    }


    userGems =
        newBalance;

    updateGemsDisplay();

    return true;

}


// ========================================
// TIRAGE ALEATOIRE PONDERE
// ========================================

function getRandomCharacter(pool) {

    const totalWeight =
        pool.reduce(
            (total, character) =>
                total + Number(character.weight),
            0
        );


    let random =
        Math.random() *
        totalWeight;


    for (const character of pool) {

        random -=
            Number(character.weight);


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

        console.error(
            "Erreur utilisateur :",
            userError
        );

        return false;

    }


    if (!user) {

        console.error(
            "Aucun utilisateur connecté."
        );

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

        console.error(
            "Erreur lors de la recherche dans l'inventaire :",
            selectError
        );

        return false;

    }


    if (existingCharacter) {

        const newQuantity =
            existingCharacter.quantity + 1;


        const {
            error: updateError
        } = await supabaseClient
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

            console.error(
                "Erreur lors de la mise à jour de l'inventaire :",
                updateError
            );

            return false;

        }


        return true;

    }


    const {
        error: insertError
    } = await supabaseClient
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

        console.error(
            "Erreur lors de l'ajout à l'inventaire :",
            insertError
        );

        return false;

    }


    return true;

}


// ========================================
// ANIMATION D'UN CHANGEMENT DE CONTENU
// ========================================

async function animateChange(elements, changeFunction) {

    elements.forEach((element) => {

        if (element) {
            element.classList.add(
                "contentChanging"
            );
        }

    });


    await new Promise(
        resolve =>
            setTimeout(resolve, 250)
    );


    changeFunction();


    elements.forEach((element) => {

        if (element) {

            void element.offsetWidth;

            element.classList.remove(
                "contentChanging"
            );

        }

    });

}


// ========================================
// AFFICHAGE DU PERSONNAGE
// ========================================

async function displayCharacter(
    character,
    image,
    name,
    description,
    dates,
    characterInfo,
    characterRarity,
    characterId,
    multiProgress
) {

    // ----------------------------
    // Animation de l'image
    // ----------------------------

    image.classList.add(
        "imageChanging"
    );


    // ----------------------------
    // Animation du contenu
    // ----------------------------

    const contentElements = [
        name,
        description,
        dates,
        characterInfo,
        multiProgress
    ];


    contentElements.forEach(
        element => {

            if (element) {
                element.classList.add(
                    "contentChanging"
                );
            }

        }
    );


    await new Promise(
        resolve =>
            setTimeout(resolve, 250)
    );


    // ----------------------------
    // Nouvelle image
    // ----------------------------

    if (character.image) {

        image.src =
            character.image;

        image.alt =
            character.name;

        image.style.display =
            "block";

    }


    // ----------------------------
    // Nouveau contenu
    // ----------------------------

    name.textContent =
        character.name;


    description.textContent =
        "Personnage obtenu";


    dates.textContent =
        "";


    characterRarity.textContent =
        `Rareté : ${character.rarity || "?"}`;


    characterId.textContent =
        `ID : ${character.id || "?"}`;


    characterInfo.style.display =
        "flex";


    multiProgress.classList.add(
        "visible"
    );


    // ----------------------------
    // Animation d'apparition
    // ----------------------------

    void image.offsetWidth;

    image.classList.remove(
        "imageChanging"
    );


    contentElements.forEach(
        element => {

            if (element) {

                void element.offsetWidth;

                element.classList.remove(
                    "contentChanging"
                );

            }

        }
    );

}


// ========================================
// SUMMON SOLO
// ========================================

async function summon(
    banner,
    resultImage,
    resultText,
    description,
    dates,
    characterInfo,
    characterRarity,
    characterId,
    multiProgress,
    soloButton,
    multiButton
) {

    if (
        !banner.characters ||
        banner.characters.length === 0
    ) {

        console.error(
            "Cette bannière ne contient aucun personnage."
        );

        return;

    }


    const spent =
        await spendGems(
            banner.soloPrice
        );


    if (!spent) {

        alert(
            "Pas assez de gemmes pour ce summon."
        );

        return;

    }


    const chosen =
        getRandomCharacter(
            banner.characters
        );


    if (!chosen) {
        return;
    }


    const added =
        await addToInventory(
            chosen
        );


    if (!added) {

        console.error(
            "Le personnage n'a pas pu être ajouté à l'inventaire."
        );

    }


    // Désactive temporairement les boutons
    soloButton.disabled = true;
    multiButton.disabled = true;


    multiProgress.textContent =
        "Personnage obtenu";


    await displayCharacter(
        chosen,
        resultImage,
        resultText,
        description,
        dates,
        characterInfo,
        characterRarity,
        characterId,
        multiProgress
    );


    // Réactive les boutons
    soloButton.disabled = false;
    multiButton.disabled = false;

}


// ========================================
// SUMMON MULTI
// ========================================

async function multiSummon(
    banner,
    resultImage,
    resultText,
    description,
    dates,
    characterInfo,
    characterRarity,
    characterId,
    multiProgress,
    soloButton,
    multiButton
) {

    if (
        !banner.characters ||
        banner.characters.length === 0
    ) {

        console.error(
            "Cette bannière ne contient aucun personnage."
        );

        return;

    }


    const spent =
        await spendGems(
            banner.multiPrice
        );


    if (!spent) {

        alert(
            "Pas assez de gemmes pour ce multi summon."
        );

        return;

    }


    const drawn = [];


    // ----------------------------
    // Tirage des 11 personnages
    // ----------------------------

    for (
        let i = 0;
        i < 11;
        i++
    ) {

        const chosen =
            getRandomCharacter(
                banner.characters
            );


        if (chosen) {

            drawn.push(
                chosen
            );

            await addToInventory(
                chosen
            );

        }

    }


    if (drawn.length === 0) {
        return;
    }


    console.log(
        "Personnages obtenus (x10+1) :",
        drawn.map(
            character =>
                character.name
        )
    );


    // ----------------------------
    // Désactivation des boutons
    // ----------------------------

    soloButton.disabled =
        true;

    multiButton.disabled =
        true;


    // ----------------------------
    // Révélation dans la modale
    // ----------------------------

    for (
        let index = 0;
        index < drawn.length;
        index++
    ) {

        const character =
            drawn[index];


        multiProgress.textContent =
            `${index + 1} / ${drawn.length} — cliquez pour continuer`;

        multiProgress.classList.add(
            "visible"
        );


        // Affiche le personnage
        await displayCharacter(
            character,
            resultImage,
            resultText,
            description,
            dates,
            characterInfo,
            characterRarity,
            characterId,
            multiProgress
        );


        // Attend le clic avant de continuer
        if (
            index <
            drawn.length - 1
        ) {

            await waitForClick(
                multiProgress
            );

        }

    }


    // ----------------------------
    // Fin du multi
    // ----------------------------

    multiProgress.textContent =
        "Multi terminé";


    soloButton.disabled =
        false;

    multiButton.disabled =
        false;

}


// ========================================
// ATTENDRE UN CLIC
// ========================================

function waitForClick(element) {

    return new Promise(
        resolve => {

            function clickHandler() {

                element.removeEventListener(
                    "click",
                    clickHandler
                );

                resolve();

            }


            element.style.cursor =
                "pointer";


            element.addEventListener(
                "click",
                clickHandler
            );

        }
    );

}


// ========================================
// NAVIGATION
// ========================================

backButton.onclick =
    function () {

        window.location.href =
            "index.html";

    };


// ========================================
// VERIFICATION DU COMPTE
// ========================================

async function checkUser() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();


    if (
        error ||
        !data.user
    ) {

        window.location.href =
            "login.html";

        return false;

    }


    userEmail.textContent =
        data.user.email;


    return true;

}


// ========================================
// DECONNEXION
// ========================================

logoutButton.onclick =
    async function () {

        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Erreur de déconnexion :",
                error
            );

            return;

        }


        window.location.href =
            "login.html";

    };


// ========================================
// INITIALISATION
// ========================================

async function init() {

    const loggedIn =
        await checkUser();


    if (!loggedIn) {
        return;
    }


    await loadUserGems();

    await loadBanners();

}


init();
```
