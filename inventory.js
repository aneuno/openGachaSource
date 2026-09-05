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

const inventoryElement =
    document.getElementById("inventory");

const collectionCount =
    document.getElementById("collectionCount");

const backButton =
    document.getElementById("backButton");

const modalOverlay =
    document.getElementById("modalOverlay");

const modalClose =
    document.getElementById("modalClose");

const modalImage =
    document.getElementById("modalImage");

const modalName =
    document.getElementById("modalName");

const modalQuantity =
    document.getElementById("modalQuantity");

const modalRarity =
    document.getElementById("modalRarity");

const modalId =
    document.getElementById("modalId");

const modalWeight =
    document.getElementById("modalWeight");


// ========================================
// FENETRE MODALE
// ========================================

function openModal(character) {

    modalImage.src =
        character.character_image;

    modalImage.alt =
        character.character_name;

    modalName.textContent =
        character.character_name;

    modalQuantity.textContent =
        `×${character.quantity}`;

    modalRarity.textContent =
        `Rareté : ${character.character_rarity}`;

    modalId.textContent =
        `ID : ${character.character_id}`;

    modalWeight.textContent =
        `Weight : ${character.character_weight}`;

    modalOverlay.classList.add("isOpen");

}

function closeModal() {

    modalOverlay.classList.remove("isOpen");

}

modalClose.addEventListener(
    "click",
    closeModal
);

modalOverlay.addEventListener(
    "click",
    function(event) {

        if (event.target === modalOverlay) {
            closeModal();
        }

    }
);

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {
            closeModal();
        }

    }
);


// ========================================
// CHARGEMENT DE L'INVENTAIRE
// ========================================

async function loadInventory() {

    // ----------------------------
    // RECUPERATION DU JOUEUR
    // ----------------------------

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href =
            "login.html";

        return;

    }


    console.log(
        "Utilisateur :",
        user
    );


    // ----------------------------
    // RECUPERATION INVENTAIRE
    // ----------------------------

    const {
        data: inventory,
        error
    } =
        await supabaseClient
            .from("inventory")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", {
                ascending: false
            });


    // ----------------------------
    // ERREUR
    // ----------------------------

    if (error) {

        console.error(
            "Erreur inventaire :",
            error
        );

        inventoryElement.innerHTML = `
            <p id="message">
                Impossible de charger l'inventaire.
            </p>
        `;

        return;

    }


    console.log(
        "Inventaire :",
        inventory
    );


    // ----------------------------
    // INVENTAIRE VIDE
    // ----------------------------

    if (!inventory || inventory.length === 0) {

        collectionCount.textContent =
            "0 personnage";


        inventoryElement.innerHTML = `
            <p id="message">
                Ta collection est vide.
            </p>
        `;

        return;

    }


    // ----------------------------
    // COMPTEUR
    // ----------------------------

    const totalCharacters =
        inventory.reduce(

            (total, character) =>
                total + character.quantity,

            0

        );


    collectionCount.textContent =
        `${inventory.length} personnage(s) • ${totalCharacters} exemplaire(s)`;


    // ----------------------------
    // SUPPRESSION MESSAGE
    // ----------------------------

    inventoryElement.innerHTML = "";


    // ----------------------------
    // CREATION DES CARTES
    // ----------------------------

    inventory.forEach((character, index) => {

        const card =
            document.createElement("div");


        card.className =
            "characterCard";

        card.style.setProperty(
            "--i",
            index
        );

        card.tabIndex = 0;


        // ----------------------------
        // ZONE IMAGE + NOM
        // ----------------------------

        const imageWrap =
            document.createElement("div");


        imageWrap.className =
            "imageWrap";


        const image =
            document.createElement("img");


        image.src =
            character.character_image;


        image.alt =
            character.character_name;


        image.referrerPolicy =
            "no-referrer";


        const nameOverlay =
            document.createElement("div");


        nameOverlay.className =
            "nameOverlay";


        const name =
            document.createElement("p");


        name.className =
            "characterName";


        name.textContent =
            character.character_name;


        nameOverlay.appendChild(
            name
        );


        imageWrap.appendChild(
            image
        );

        imageWrap.appendChild(
            nameOverlay
        );


        // ----------------------------
        // QUANTITE
        // ----------------------------

        const quantity =
            document.createElement("span");


        quantity.className =
            "quantity";


        quantity.textContent =
            `×${character.quantity}`;


        // ----------------------------
        // ASSEMBLAGE
        // ----------------------------

        card.appendChild(
            imageWrap
        );

        card.appendChild(
            quantity
        );


        // ----------------------------
        // OUVERTURE DE LA MODALE
        // ----------------------------

        card.addEventListener(
            "click",
            function() {
                openModal(character);
            }
        );

        card.addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter" || event.key === " ") {

                    event.preventDefault();
                    openModal(character);

                }

            }
        );


        inventoryElement.appendChild(
            card
        );

    });

}


// ========================================
// RETOUR AU GACHA
// ========================================

backButton.onclick = function() {

    window.location.href =
        "index.html";

};


// ========================================
// INITIALISATION
// ========================================

loadInventory();
