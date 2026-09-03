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

const button =
    document.getElementById("summonButton");

const multiButton =
    document.getElementById("multiSummonButton");

const result =
    document.getElementById("result");

const resultImage =
    document.getElementById("resultImage");

const userEmail =
    document.getElementById("userEmail");

const logoutButton =
    document.getElementById("logoutButton");

const inventoryButton =
    document.getElementById("inventoryButton");


// ========================================
// PERSONNAGES
// ========================================

let characters = [];


// ========================================
// CHARGEMENT DES PERSONNAGES
// ========================================

async function loadCharacters() {

    try {

        const response =
            await fetch("characters.json");


        if (!response.ok) {

            throw new Error(
                `Erreur HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        characters =
            data.characters;


        console.log(
            "Personnages chargés :",
            characters
        );

    }

    catch (error) {

        console.error(
            "Erreur lors du chargement des personnages :",
            error
        );

    }

}


// ========================================
// TIRAGE ALEATOIRE PONDERE
// ========================================

function getRandomCharacter() {

    const totalWeight =
        characters.reduce(

            (total, character) =>
                total + character.weight,

            0

        );


    let random =
        Math.random() * totalWeight;


    for (const character of characters) {

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

    // ----------------------------
    // RECUPERATION DU JOUEUR
    // ----------------------------

    const {
        data: {
            user
        },
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


    // ----------------------------
    // RECHERCHE DU PERSONNAGE
    // ----------------------------

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


    // ========================================
    // PERSONNAGE DEJA POSSEDE
    // ========================================

    if (existingCharacter) {

        const newQuantity =
            existingCharacter.quantity + 1;


        const {
            error: updateError

        } = await supabaseClient
            .from("inventory")
            .update({

                quantity:
                    newQuantity,

                character_name:
                    character.name,

                character_image:
                    character.image,

                character_rarity:
                    character.rarity,

                character_weight:
                    character.weight

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


        console.log(
            "Personnage déjà possédé."
        );

        console.log(
            "Nouvelle quantité :",
            newQuantity
        );


        return true;

    }


    // ========================================
    // NOUVEAU PERSONNAGE
    // ========================================

    const {
        error: insertError

    } = await supabaseClient
        .from("inventory")
        .insert({

            user_id:
                user.id,

            character_id:
                character.id,

            character_name:
                character.name,

            character_image:
                character.image,

            character_rarity:
                character.rarity,

            character_weight:
                character.weight,

            quantity:
                1

        });


    if (insertError) {

        console.error(
            "Erreur lors de l'ajout à l'inventaire :",
            insertError
        );

        return false;

    }


    console.log(
        "Nouveau personnage ajouté à l'inventaire !"
    );


    return true;

}


// ========================================
// SUMMON
// ========================================

async function summon() {

    if (characters.length === 0) {

        console.error(
            "Les personnages ne sont pas encore chargés."
        );

        return;

    }


    // ----------------------------
    // TIRAGE
    // ----------------------------

    const chosen =
        getRandomCharacter();


    if (!chosen) {

        return;

    }


    // ----------------------------
    // AFFICHAGE
    // ----------------------------

    result.textContent =
        chosen.name;


    if (chosen.image) {

        resultImage.referrerPolicy =
            "no-referrer";

        resultImage.src =
            chosen.image;

        resultImage.alt =
            chosen.name;

        resultImage.style.display =
            "block";

        resultImage.classList.remove(
            "enlarged"
        );

    }

    else {

        resultImage.style.display =
            "none";

    }


    // ----------------------------
    // AJOUT INVENTAIRE
    // ----------------------------

    const added =
        await addToInventory(chosen);


    if (!added) {

        console.error(
            "Le personnage n'a pas pu être ajouté à l'inventaire."
        );

        return;

    }


    // ----------------------------
    // DEBUG
    // ----------------------------

    console.log(
        "Personnage obtenu :",
        chosen.name
    );

    console.log(
        "ID :",
        chosen.id
    );

    console.log(
        "Rareté :",
        chosen.rarity
    );

    console.log(
        "Weight :",
        chosen.weight
    );

}


// ========================================
// 1 SUMMON
// ========================================

button.onclick = function() {

    summon();

};


// ========================================
// 10 SUMMON
// ========================================

multiButton.onclick = function() {

    console.log(
        "10 summon +1"
    );

};


// ========================================
// AGRANDIR L'IMAGE
// ========================================

resultImage.onclick = function() {

    resultImage.classList.toggle(
        "enlarged"
    );

};


// ========================================
// OUVRIR L'INVENTAIRE
// ========================================

inventoryButton.onclick = function() {

    window.location.href =
        "inventory.html";

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

        window.location.href =
            "login.html";

        return false;

    }


    userEmail.textContent =
        data.user.email;


    console.log(
        "Utilisateur connecté :",
        data.user
    );


    return true;

}


// ========================================
// DECONNEXION
// ========================================

logoutButton.onclick = async function() {

    const {
        error
    } = await supabaseClient.auth.signOut();


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


    await loadCharacters();

}


init();
