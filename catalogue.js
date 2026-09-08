```javascript
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
// PAGINATION
// ========================================

const CHARACTERS_PER_PAGE = 12;

let currentPage = 1;


// ========================================
// ETAT
// ========================================

let characters = [];

let filteredCharacters = [];

let selectedRarity = "ALL";


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


        filteredCharacters =
            characters;


        currentPage = 1;


        renderCatalogue();


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
// FILTRAGE
// ========================================

function applyFilters() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    filteredCharacters =
        characters.filter(
            (character) => {

                // ----------------------------
                // RECHERCHE
                // ----------------------------

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


                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    id.includes(search);


                // ----------------------------
                // RARETE
                // ----------------------------

                const rarity =
                    String(
                        character.rarity || ""
                    )
                    .trim()
                    .toUpperCase();


                const matchesRarity =
                    selectedRarity === "ALL" ||
                    rarity === selectedRarity;


                return (
                    matchesSearch &&
                    matchesRarity
                );

            }
        );


    // Toujours revenir à la page 1
    // après modification des filtres

    currentPage = 1;


    renderCatalogue();
}


// ========================================
// AFFICHAGE DU CATALOGUE
// ========================================

function renderCatalogue() {

    catalogue.innerHTML = "";


    catalogueCount.textContent =
        `${filteredCharacters.length} personnage(s)`;


    // ------------------------------------
    // AUCUN RESULTAT
    // ------------------------------------

    if (
        filteredCharacters.length === 0
    ) {

        const emptyMessage =
            document.createElement("p");


        emptyMessage.id =
            "message";


        emptyMessage.textContent =
            "Aucun personnage trouvé.";


        catalogue.appendChild(
            emptyMessage
        );


        renderPagination();


        return;
    }


    // ------------------------------------
    // CALCUL DES PAGES
    // ------------------------------------

    const start =
        (currentPage - 1) *
        CHARACTERS_PER_PAGE;


    const end =
        start +
        CHARACTERS_PER_PAGE;


    const pageCharacters =
        filteredCharacters.slice(
            start,
            end
        );


    // ------------------------------------
    // AFFICHAGE DES CARTES
    // ------------------------------------

    pageCharacters.forEach(
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


    // ------------------------------------
    // PAGINATION
    // ------------------------------------

    renderPagination();
}


// ========================================
// PAGINATION
// ========================================

function renderPagination() {

    let pagination =
        document.getElementById(
            "pagination"
        );


    // Si le HTML ne contient pas encore
    // pagination, on le crée automatiquement

    if (!pagination) {

        pagination =
            document.createElement("div");

        pagination.id =
            "pagination";


        catalogue.parentElement.appendChild(
            pagination
        );

    }


    pagination.innerHTML = "";


    const totalPages =
        Math.ceil(
            filteredCharacters.length /
            CHARACTERS_PER_PAGE
        );


    // Pas de pagination nécessaire

    if (totalPages <= 1) {

        return;
    }


    // ------------------------------------
    // PRECEDENT
    // ------------------------------------

    const previousButton =
        document.createElement("button");


    previousButton.textContent =
        "‹";


    previousButton.className =
        "paginationButton";


    previousButton.disabled =
        currentPage === 1;


    previousButton.addEventListener(
        "click",
        function () {

            if (
                currentPage > 1
            ) {

                currentPage--;

                renderCatalogue();

                scrollToCatalogue();

            }

        }
    );


    pagination.appendChild(
        previousButton
    );


    // ------------------------------------
    // NUMEROS DES PAGES
    // ------------------------------------

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const pageButton =
            document.createElement("button");


        pageButton.textContent =
            page;


        pageButton.className =
            "paginationButton";


        if (
            page === currentPage
        ) {

            pageButton.classList.add(
                "active"
            );

        }


        pageButton.addEventListener(
            "click",
            function () {

                currentPage =
                    page;


                renderCatalogue();

                scrollToCatalogue();

            }
        );


        pagination.appendChild(
            pageButton
        );

    }


    // ------------------------------------
    // SUIVANT
    // ------------------------------------

    const nextButton =
        document.createElement("button");


    nextButton.textContent =
        "›";


    nextButton.className =
        "paginationButton";


    nextButton.disabled =
        currentPage === totalPages;


    nextButton.addEventListener(
        "click",
        function () {

            if (
                currentPage < totalPages
            ) {

                currentPage++;

                renderCatalogue();

                scrollToCatalogue();

            }

        }
    );


    pagination.appendChild(
        nextButton
    );
}


// ========================================
// RETOUR EN HAUT
// ========================================

function scrollToCatalogue() {

    catalogue.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ========================================
// POSITION DE L'IMAGE
// ========================================

const VALID_POSITIONS = [
    "center",
    "top",
    "bottom",
    "left",
    "right"
];


function getImagePosition(character) {

    const position =
        String(
            character.position || "center"
        )
        .trim()
        .toLowerCase();


    if (
        !VALID_POSITIONS.includes(
            position
        )
    ) {

        return "center";
    }


    return position;
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


    image.style.objectPosition =
        getImagePosition(
            character
        );


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

        applyFilters();

    }
);


// ========================================
// FILTRES DE RARETE
// ========================================

const rarityButtons =
    document.querySelectorAll(
        ".rarityFilter"
    );


rarityButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                selectedRarity =
                    button.dataset.rarity
                        .toUpperCase();


                // Retirer active de tous

                rarityButtons.forEach(
                    function (otherButton) {

                        otherButton.classList.remove(
                            "active"
                        );

                    }
                );


                // Activer le bouton choisi

                button.classList.add(
                    "active"
                );


                applyFilters();

            }
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


    modalImage.style.objectPosition =
        getImagePosition(
            character
        );


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
```

Ton JSON peut rester **exactement comme il est** : le JS utilise directement la valeur `rarity` de chaque personnage (`R`, `SR`, `SSR`, `LR`, `ULR`).
