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

const userEmail =
    document.getElementById("user-email");

const logoutButton =
    document.getElementById("logout-button");

const backButton =
    document.getElementById("back-button");

const gemsDisplay =
    document.getElementById("gems");

const bannersContainer =
    document.getElementById("banners-container");


// ========================================
// VARIABLES
// ========================================

let banners = [];
let userGems = 0;


// ========================================
// CHARGER LES BANNIERES
// ========================================

async function loadBanners() {
    try {
        const response =
            await fetch("banners.json");

        if (!response.ok) {
            console.error(
                "Erreur HTTP",
                response.status
            );
            return;
        }

        banners =
            await response.json();

        renderAllBanners();

    } catch (error) {
        console.error(
            "Erreur lors du chargement des bannières :",
            error
        );
    }
}


// ========================================
// AFFICHER LES BANNIERES
// ========================================

function renderAllBanners() {

    if (!bannersContainer) {
        return;
    }

    bannersContainer.innerHTML = "";

    banners.forEach(function (banner) {

        const card =
            createBannerCard(banner);

        bannersContainer.appendChild(card);
    });
}


// ========================================
// CREER UNE CARTE DE BANNIERE
// ========================================

function createBannerCard(banner) {

    const card =
        document.createElement("div");

    card.className =
        "banner-card";

    card.innerHTML =

        '<img class="banner-image" src="' +
        (banner.image || "") +
        '" alt="' +
        (banner.name || "Bannière") +
        '">' +

        '<div class="banner-content">' +

        '<h2>' +
        (banner.name || "Bannière") +
        '</h2>' +

        '<p>' +
        (banner.description || "") +
        '</p>' +

        '</div>';

    card.addEventListener(
        "click",
        function () {
            openBannerModal(banner);
        }
    );

    return card;
}


// ========================================
// MODALE DE BANNIERE
// ========================================

function openBannerModal(banner) {

    const overlay =
        document.createElement("div");

    overlay.className =
        "banner-modal-overlay";


    const modal =
        document.createElement("div");

    modal.className =
        "banner-modal";


    const closeButton =
        document.createElement("button");

    closeButton.className =
        "banner-modal-close";

    closeButton.textContent = "X";


    closeButton.addEventListener(
        "click",
        function () {
            overlay.remove();
        }
    );


    const image =
        document.createElement("img");

    image.className =
        "banner-modal-image";

    image.src =
        banner.image || "";

    image.alt =
        banner.name || "Bannière";


    const content =
        document.createElement("div");

    content.className =
        "banner-modal-content";


    const name =
        document.createElement("h2");

    name.textContent =
        banner.name || "Bannière";


    const description =
        document.createElement("p");

    description.textContent =
        banner.description || "";


    const dates =
        document.createElement("p");

    dates.textContent =
        "Disponible du " +
        (banner.startDate || "?") +
        " au " +
        (banner.endDate || "?");


    content.appendChild(name);
    content.appendChild(description);
    content.appendChild(dates);


    // ========================================
    // PERSONNAGE MIS EN AVANT
    // ========================================

    if (banner.character) {

        const characterInfo =
            document.createElement("div");

        characterInfo.className =
            "banner-character-info";


        const characterName =
            document.createElement("h3");

        characterName.textContent =
            banner.character.name || "";


        const characterImage =
            document.createElement("img");

        characterImage.src =
            banner.character.image || "";

        characterImage.alt =
            banner.character.name || "";


        characterInfo.appendChild(
            characterImage
        );

        characterInfo.appendChild(
            characterName
        );

        content.appendChild(
            characterInfo
        );
    }


    // ========================================
    // PROGRESSION MULTI
    // ========================================

    const multiProgress =
        document.createElement("div");

    multiProgress.className =
        "multi-progress";

    content.appendChild(
        multiProgress
    );


    // ========================================
    // BOUTON SOLO
    // ========================================

    const soloButton =
        document.createElement("button");

    soloButton.className =
        "summon-button solo-button";

    soloButton.innerHTML =
        "1x <span>" +
        (banner.soloPrice || 0) +
        " gemmes</span>";


    soloButton.addEventListener(
        "click",
        async function () {

            await summon(
                banner,
                multiProgress
            );
        }
    );


    // ========================================
    // BOUTON MULTI
    // ========================================

    const multiButton =
        document.createElement("button");

    multiButton.className =
        "summon-button multi-button";

    multiButton.innerHTML =
        "10+1x <span>" +
        (banner.multiPrice || 0) +
        " gemmes</span>";


    multiButton.addEventListener(
        "click",
        async function () {

            await multiSummon(
                banner,
                multiProgress
            );
        }
    );


    content.appendChild(
        soloButton
    );

    content.appendChild(
        multiButton
    );


    modal.appendChild(
        closeButton
    );

    modal.appendChild(
        image
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
// CHARGER LES GEMMES
// ========================================

async function loadUserGems() {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {
            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select("gems")
                .eq("id", user.id)
                .single();


        if (error) {

            console.error(
                "Erreur lors du chargement des gemmes :",
                error
            );

            return;
        }


        if (!data) {

            const {
                error: insertError
            } =
                await supabaseClient
                    .from("profiles")
                    .insert({
                        id: user.id,
                        gems: 10000
                    });


            if (insertError) {

                console.error(
                    "Erreur création profil :",
                    insertError
                );

                return;
            }

            userGems = 10000;

        } else {

            userGems =
                Number(data.gems) || 0;
        }


        updateGemsDisplay();

    } catch (error) {

        console.error(
            "Erreur gemmes :",
            error
        );
    }
}


// ========================================
// AFFICHER LES GEMMES
// ========================================

function updateGemsDisplay() {

    if (!gemsDisplay) {
        return;
    }

    gemsDisplay.textContent =
        userGems;
}


// ========================================
// DEPENSER DES GEMMES
// ========================================

async function spendGems(amount) {

    if (userGems < amount) {

        alert(
            "Vous n'avez pas assez de gemmes."
        );

        return false;
    }


    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth.getUser();


    if (!user) {
        return false;
    }


    const newAmount =
        userGems - amount;


    const {
        error
    } =
        await supabaseClient
            .from("profiles")
            .update({
                gems: newAmount
            })
            .eq("id", user.id);


    if (error) {

        console.error(
            "Erreur lors de la dépense :",
            error
        );

        return false;
    }


    userGems =
        newAmount;

    updateGemsDisplay();

    return true;
}


// ========================================
// TIRAGE ALEATOIRE PONDERE
// ========================================

function getRandomCharacter(pool) {

    if (!pool || pool.length === 0) {
        return null;
    }


    let totalWeight = 0;


    pool.forEach(
        function (character) {

            totalWeight +=
                Number(character.weight) || 0;
        }
    );


    if (totalWeight <= 0) {

        return pool[
            Math.floor(
                Math.random() *
                pool.length
            )
        ];
    }


    let random =
        Math.random() *
        totalWeight;


    for (
        let i = 0;
        i < pool.length;
        i++
    ) {

        random -=
            Number(pool[i].weight) || 0;


        if (random <= 0) {
            return pool[i];
        }
    }


    return pool[
        pool.length - 1
    ];
}


// ========================================
// AJOUT INVENTAIRE
// ========================================

async function addToInventory(character) {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user || !character) {
            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("inventory")
                .insert({
                    user_id: user.id,
                    character_id: character.id,
                    character_name: character.name,
                    character_image: character.image,
                    rarity: character.rarity
                });


        if (error) {

            console.error(
                "Erreur ajout inventaire :",
                error
            );

            return;
        }


        return data;

    } catch (error) {

        console.error(
            "Erreur inventaire :",
            error
        );
    }
}


// ========================================
// AFFICHER UN PERSONNAGE
// ========================================

function displayCharacter(
    character,
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!character) {

        container.textContent =
            "Aucun personnage";

        return;
    }


    const image =
        document.createElement("img");

    image.src =
        character.image || "";

    image.alt =
        character.name || "";


    image.className =
        "result-character-image";


    const name =
        document.createElement("h2");

    name.textContent =
        character.name || "Inconnu";


    const gems =
        document.createElement("p");

    gems.textContent =
        userGems +
        " gemmes";


    const rarity =
        document.createElement("p");

    rarity.textContent =
        "Rareté : " +
        (character.rarity || "?");


    const id =
        document.createElement("p");

    id.textContent =
        "ID : " +
        (character.id || "?");


    container.appendChild(
        image
    );

    container.appendChild(
        name
    );

    container.appendChild(
        rarity
    );

    container.appendChild(
        id
    );

    container.appendChild(
        gems
    );


    image.addEventListener(
        "click",
        function () {

            const enlarged =
                document.createElement("div");

            enlarged.className =
                "image-enlarged-overlay";


            const enlargedImage =
                document.createElement("img");

            enlargedImage.src =
                character.image || "";


            enlarged.appendChild(
                enlargedImage
            );


            enlarged.addEventListener(
                "click",
                function () {
                    enlarged.remove();
                }
            );


            document.body.appendChild(
                enlarged
            );
        }
    );
}


// ========================================
// TIRAGE SOLO
// ========================================

async function summon(
    banner,
    progressElement
) {

    const price =
        Number(banner.soloPrice) || 0;


    const success =
        await spendGems(price);


    if (!success) {
        return;
    }


    const pool =
        banner.characters || [];


    const character =
        getRandomCharacter(pool);


    if (!character) {

        alert(
            "Aucun personnage disponible."
        );

        return;
    }


    await addToInventory(
        character
    );


    displayCharacter(
        character,
        progressElement
    );
}


// ========================================
// MULTI SUMMON
// ========================================

async function multiSummon(
    banner,
    progressElement
) {

    const price =
        Number(banner.multiPrice) || 0;


    const success =
        await spendGems(price);


    if (!success) {
        return;
    }


    const pool =
        banner.characters || [];


    if (pool.length === 0) {

        alert(
            "Aucun personnage disponible."
        );

        return;
    }


    const drawn = [];


    for (
        let i = 0;
        i < 11;
        i++
    ) {

        const character =
            getRandomCharacter(pool);


        if (character) {

            drawn.push(
                character
            );

            await addToInventory(
                character
            );
        }
    }


    for (
        let index = 0;
        index < drawn.length;
        index++
    ) {

        const character =
            drawn[index];


        progressElement.textContent =
            (index + 1) +
            " / " +
            drawn.length +
            " - cliquez pour continuer";


        displayCharacter(
            character,
            progressElement
        );


        if (
            index <
            drawn.length - 1
        ) {

            await waitForClick(
                progressElement
            );
        }
    }
}


// ========================================
// ATTENDRE UN CLIC
// ========================================

function waitForClick(element) {

    return new Promise(
        function (resolve) {

            function handler() {

                element.removeEventListener(
                    "click",
                    handler
                );

                resolve();
            }


            element.addEventListener(
                "click",
                handler
            );
        }
    );
}


// ========================================
// BOUTON RETOUR
// ========================================

if (backButton) {

    backButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "index.html";
        }
    );
}


// ========================================
// VERIFIER UTILISATEUR
// ========================================

async function checkUser() {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        if (userEmail) {

            userEmail.textContent =
                user.email || "";
        }

    } catch (error) {

        console.error(
            "Erreur utilisateur :",
            error
        );
    }
}


// ========================================
// LOGOUT
// ========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            const {
                error
            } =
                await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Erreur déconnexion :",
                    error
                );

                return;
            }


            window.location.href =
                "login.html";
        }
    );
}


// ========================================
// INITIALISATION
// ========================================

async function init() {

    await checkUser();

    await loadUserGems();

    await loadBanners();
}


init();
