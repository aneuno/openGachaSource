// ========================================
// ELEMENTS HTML
// ========================================

const catalogue =
    document.getElementById("catalogue");

const searchInput =
    document.getElementById("searchInput");

const catalogueCount =
    document.getElementById("catalogueCount");

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

const modalRarity =
    document.getElementById("modalRarity");

const modalId =
    document.getElementById("modalId");

const modalDescription =
    document.getElementById("modalDescription");


// ========================================
// ETAT
// ========================================

let characters = [];


// ========================================
// CHARGEMENT DU JSON
// ========================================

async function loadCatalogue() {

    try {

        const response =
            await fetch(
                "characters.json"
            );


        if (!response.ok) {

            throw new Error(
                "Impossible de charger characters.json"
            );

        }


        const data =
            await response.json();


        characters =
            data.characters || [];


        renderCatalogue(
            characters
        );


    } catch (error) {

        console.error(
            "Erreur chargement catalogue :",
            error
        );


        catalogue.innerHTML = "";


        const errorMessage =
            document.createElement("p");


        errorMessage.id =
            "message";


        errorMessage.textContent =
            "Impossible de charger le catalogue.";


        catalogue.appendChild(
            errorMessage
        );

    }
}


// ========================================
// AFFICHAGE DU CATALOGUE
// ========================================

function renderCatalogue(list) {

    catalogue.innerHTML = "";


    catalogueCount.textContent =
        `${list.length} personnage(s)`;


    if (list.length === 0) {

        const emptyMessage =
            document.createElement("p");


        emptyMessage.id =
            "message";


        emptyMessage.textContent =
            "Aucun personnage trouvé.";


        catalogue.appendChild(
            emptyMessage
        );


        return;
    }


    list.forEach(
        (character, index) => {

            const card =
                createCharacterCard(
                    character,
                    index
                );


            catalogue.appendChild(
                card
            );

        }
    );
}


// ========================================
// CREATION D'UNE CARTE
// ========================================

function createCharacterCard(
    character,
    index
) {

    const card =
        document.createElement("div");


    card.className =
        "characterCard";


    card.style.setProperty(
        "--i",
        index
    );


    // ------------------------------------
    // IMAGE
    // ------------------------------------

    const imageWrap =
        document.createElement("div");


    imageWrap.className =
        "imageWrap";


    const image =
        document.createElement("img");


    image.src =
        character.image;


    image.alt =
        character.name;


    image.referrerPolicy =
        "no-referrer";


    // ------------------------------------
    // NOM
    // ------------------------------------

    const nameOverlay =
        document.createElement("div");


    nameOverlay.className =
        "nameOverlay";


    const name =
        document.createElement("p");


    name.className =
        "characterName";


    name.textContent =
        character.name;


    nameOverlay.appendChild(
        name
    );


    // ------------------------------------
    // RARETE
    // ------------------------------------

    const rarity =
        document.createElement("span");


    rarity.className =
        "rarityBadge";


    rarity.textContent =
        String(
            character.rarity
        ).toUpperCase();


    // ------------------------------------
    // ASSEMBLAGE
    // ------------------------------------

    imageWrap.appendChild(
        image
    );


    imageWrap.appendChild(
        nameOverlay
    );


    imageWrap.appendChild(
        rarity
    );


    card.appendChild(
        imageWrap
    );


    // ------------------------------------
    // CLIC SUR LA CARTE
    // ------------------------------------

    card.addEventListener(
        "click",
        function () {

            openModal(
                character
            );

        }
    );


    return card;
}


// ========================================
// RECHERCHE
// ========================================

searchInput.addEventListener(
    "input",
    function () {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        // Aucun texte
        // = afficher tout

        if (!search) {

            renderCatalogue(
                characters
            );

            return;
        }


        const filtered =
            characters.filter(
                (character) => {

                    const name =
                        String(
                            character.name || ""
                        )
                        .toLowerCase();


                    const id =
                        String(
                            character.id || ""
                        )
                        .toLowerCase();


                    return (
                        name.includes(search) ||
                        id.includes(search)
                    );

                }
            );


        renderCatalogue(
            filtered
        );

    }
);


// ========================================
// MODALE
// ========================================

function openModal(character) {

    modalImage.src =
        character.image;


    modalImage.alt =
        character.name;


    modalName.textContent =
        character.name;


    modalRarity.textContent =
        `Rareté : ${character.rarity}`;


    modalId.textContent =
        `ID : ${character.id}`;


    modalDescription.textContent =
        character.description || "";


    modalOverlay.classList.add(
        "isOpen"
    );
}


function closeModal() {

    modalOverlay.classList.remove(
        "isOpen"
    );
}


// ========================================
// FERMETURE MODALE
// ========================================

modalClose.addEventListener(
    "click",
    closeModal
);


modalOverlay.addEventListener(
    "click",
    function (event) {

        if (
            event.target === modalOverlay
        ) {

            closeModal();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


// ========================================
// RETOUR MENU
// ========================================

backButton.onclick =
    function () {

        window.location.href =
            "index.html";

    };


// ========================================
// INITIALISATION
// ========================================

loadCatalogue();
