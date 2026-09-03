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

    inventory.forEach(character => {

        const card =
            document.createElement("div");


        card.className =
            "characterCard";


        // ----------------------------
        // IMAGE
        // ----------------------------

        const image =
            document.createElement("img");


        image.src =
            character.character_image;


        image.alt =
            character.character_name;


        image.referrerPolicy =
            "no-referrer";


        // ----------------------------
        // NOM
        // ----------------------------

        const name =
            document.createElement("p");


        name.className =
            "characterName";


        name.textContent =
            character.character_name;


        // ----------------------------
        // RARETE
        // ----------------------------

        const rarity =
            document.createElement("p");


        rarity.className =
            "characterInfo";


        rarity.textContent =
            `Rareté : ${character.character_rarity}`;


        // ----------------------------
        // ID
        // ----------------------------

        const id =
            document.createElement("p");


        id.className =
            "characterInfo";


        id.textContent =
            `ID : ${character.character_id}`;


        // ----------------------------
        // WEIGHT
        // ----------------------------

        const weight =
            document.createElement("p");


        weight.className =
            "characterInfo";


        weight.textContent =
            `Weight : ${character.character_weight}`;


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
            image
        );

        card.appendChild(
            name
        );

        card.appendChild(
            rarity
        );

        card.appendChild(
            id
        );

        card.appendChild(
            weight
        );

        card.appendChild(
            quantity
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
