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

const viewCardsButton =
    document.getElementById("viewCardsButton");

const viewBindersButton =
    document.getElementById("viewBindersButton");

const bindersView =
    document.getElementById("bindersView");

const bindersGrid =
    document.getElementById("bindersGrid");

const binderDetail =
    document.getElementById("binderDetail");

const binderDetailTitle =
    document.getElementById("binderDetailTitle");

const binderCardsGrid =
    document.getElementById("binderCardsGrid");

const binderBackButton =
    document.getElementById("binderBackButton");

const binderRenameButton =
    document.getElementById("binderRenameButton");

const binderDeleteButton =
    document.getElementById("binderDeleteButton");

const addCardOverlay =
    document.getElementById("addCardOverlay");

const addCardClose =
    document.getElementById("addCardClose");

const addCardGrid =
    document.getElementById("addCardGrid");


// ========================================
// ETAT GLOBAL
// ========================================

let inventoryItems = [];
let binders = [];
let currentBinder = null;
let currentBinderItems = [];


// ========================================
// FENETRE MODALE DETAIL PERSONNAGE
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


    inventoryItems =
        inventory || [];


    // ----------------------------
    // INVENTAIRE VIDE
    // ----------------------------

    if (inventoryItems.length === 0) {

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
        inventoryItems.reduce(

            (total, character) =>
                total + character.quantity,

            0

        );


    collectionCount.textContent =
        `${inventoryItems.length} personnage(s) • ${totalCharacters} exemplaire(s)`;


    // ----------------------------
    // SUPPRESSION MESSAGE
    // ----------------------------

    inventoryElement.innerHTML = "";


    // ----------------------------
    // CREATION DES CARTES
    // ----------------------------

    inventoryItems.forEach((character, index) => {

        const card =
            createCharacterCard(character, index);

        inventoryElement.appendChild(
            card
        );

    });

}


// ========================================
// CREATION D'UNE CARTE PERSONNAGE (vue normale)
// ========================================

function createCharacterCard(character, index) {

    const card =
        document.createElement("div");

    card.className =
        "characterCard";

    card.style.setProperty(
        "--i",
        index
    );

    card.tabIndex = 0;

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

    nameOverlay.appendChild(name);
    imageWrap.appendChild(image);
    imageWrap.appendChild(nameOverlay);

    const quantity =
        document.createElement("span");

    quantity.className =
        "quantity";

    quantity.textContent =
        `×${character.quantity}`;

    card.appendChild(imageWrap);
    card.appendChild(quantity);

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

    return card;

}


// ========================================
// SWITCH DE VUE
// ========================================

function switchView(view) {

    inventoryElement.style.display =
        view === "cards" ? "grid" : "none";

    bindersView.style.display =
        view === "binders" ? "block" : "none";

    binderDetail.style.display =
        view === "binderDetail" ? "block" : "none";

    viewCardsButton.classList.toggle(
        "isActive",
        view === "cards"
    );

    viewBindersButton.classList.toggle(
        "isActive",
        view === "binders" || view === "binderDetail"
    );

}

viewCardsButton.onclick = function() {
    switchView("cards");
};

viewBindersButton.onclick = function() {
    switchView("binders");
    loadBinders();
};


// ========================================
// CHARGEMENT DES CLASSEURS
// ========================================

async function loadBinders() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        return;
    }

    const {
        data: bindersData,
        error
    } = await supabaseClient
        .from("binders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Erreur chargement classeurs :", error);
        return;
    }

    binders = bindersData || [];

    await Promise.all(
        binders.map(loadBinderItemsInto)
    );

    renderBindersGrid();

}

async function loadBinderItemsInto(binder) {

    const {
        data: items,
        error
    } = await supabaseClient
        .from("binder_items")
        .select("*")
        .eq("binder_id", binder.id)
        .order("position", { ascending: true });

    if (error) {
        console.error("Erreur chargement contenu classeur :", error);
        binder.items = [];
        return;
    }

    binder.items = items || [];

}

function renderBindersGrid() {

    bindersGrid.innerHTML = "";

    binders.forEach((binder) => {
        bindersGrid.appendChild(createBinderCard(binder));
    });

    bindersGrid.appendChild(createNewBinderTile());

}

function createBinderCard(binder) {

    const card = document.createElement("div");
    card.className = "binderCard";
    card.onclick = function() {
        openBinderDetail(binder);
    };

    const cover = document.createElement("div");
    cover.className = "binderCover";

    const topThree = binder.items.slice(0, 3);

    for (let i = 0; i < 3; i++) {

        const slot = document.createElement("div");
        slot.className = "binderCoverSlot";

        const item = topThree[i];

        if (item) {

            const inv = inventoryItems.find(
                (x) => x.id === item.inventory_id
            );

            if (inv) {

                const img = document.createElement("img");
                img.src = inv.character_image;
                img.referrerPolicy = "no-referrer";
                slot.appendChild(img);

            }

        }

        cover.appendChild(slot);

    }

    const name = document.createElement("p");
    name.className = "binderName";
    name.textContent = binder.name;

    const count = document.createElement("span");
    count.className = "binderCount";
    count.textContent = `${binder.items.length} carte(s)`;

    card.appendChild(cover);
    card.appendChild(name);
    card.appendChild(count);

    return card;

}

function createNewBinderTile() {

    const tile = document.createElement("div");
    tile.className = "binderCard newBinderTile";
    tile.textContent = "+ Nouveau classeur";
    tile.onclick = createBinder;

    return tile;

}

async function createBinder() {

    const name = prompt("Nom du classeur :");

    if (!name || !name.trim()) {
        return;
    }

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
        .from("binders")
        .insert({ user_id: user.id, name: name.trim() })
        .select()
        .single();

    if (error) {
        console.error("Erreur création classeur :", error);
        alert("Impossible de créer le classeur.");
        return;
    }

    data.items = [];
    binders.push(data);
    renderBindersGrid();

}


// ========================================
// DETAIL D'UN CLASSEUR
// ========================================

async function openBinderDetail(binder) {

    currentBinder = binder;

    await loadBinderItemsInto(binder);

    currentBinderItems = binder.items
        .map((item) => ({
            ...item,
            character: inventoryItems.find(
                (x) => x.id === item.inventory_id
            )
        }))
        .filter((item) => item.character);

    binderDetailTitle.textContent = binder.name;

    switchView("binderDetail");

    renderBinderCardsGrid();

}

function renderBinderCardsGrid() {

    binderCardsGrid.innerHTML = "";

    currentBinderItems.forEach((item) => {
        binderCardsGrid.appendChild(
            createBinderItemCard(item)
        );
    });

    const addTile = document.createElement("div");
    addTile.className = "characterCard addCardTile";
    addTile.textContent = "+ Ajouter une carte";
    addTile.onclick = openAddCardPicker;

    binderCardsGrid.appendChild(addTile);

}

function createBinderItemCard(item) {

    const character = item.character;

    const card = document.createElement("div");
    card.className = "characterCard binderItemCard";
    card.dataset.binderItemId = item.id;

    const imageWrap = document.createElement("div");
    imageWrap.className = "imageWrap";

    const image = document.createElement("img");
    image.src = character.character_image;
    image.alt = character.character_name;
    image.referrerPolicy = "no-referrer";

    const nameOverlay = document.createElement("div");
    nameOverlay.className = "nameOverlay";

    const name = document.createElement("p");
    name.className = "characterName";
    name.textContent = character.character_name;

    nameOverlay.appendChild(name);
    imageWrap.appendChild(image);
    imageWrap.appendChild(nameOverlay);

    const removeButton = document.createElement("button");
    removeButton.className = "removeFromBinderButton";
    removeButton.textContent = "✕";
    removeButton.onclick = function(event) {
        event.stopPropagation();
        removeFromBinder(item);
    };

    card.appendChild(imageWrap);
    card.appendChild(removeButton);

    attachDragHandlers(card, character);

    return card;

}


// ========================================
// GLISSER-DEPOSER (APPUI LONG)
// ========================================

const LONG_PRESS_MS = 350;
const MOVE_CANCEL_THRESHOLD = 10;

const dragState = {
    active: false,
    pointerId: null,
    timer: null,
    startX: 0,
    startY: 0,
    card: null
};

function attachDragHandlers(card, character) {

    card.addEventListener("pointerdown", function(event) {

        if (event.button !== undefined && event.button !== 0) {
            return;
        }

        dragState.pointerId = event.pointerId;
        dragState.startX = event.clientX;
        dragState.startY = event.clientY;
        dragState.card = card;
        dragState.active = false;

        dragState.timer = setTimeout(function() {
            startDrag(card, event);
        }, LONG_PRESS_MS);

    });

    card.addEventListener("pointermove", function(event) {

        if (dragState.card !== card) {
            return;
        }

        const dx = event.clientX - dragState.startX;
        const dy = event.clientY - dragState.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!dragState.active && distance > MOVE_CANCEL_THRESHOLD) {
            clearTimeout(dragState.timer);
            dragState.card = null;
            return;
        }

        if (dragState.active) {
            event.preventDefault();
            updateDragPosition(event);
        }

    });

    card.addEventListener("pointerup", function(event) {

        if (dragState.card !== card) {
            return;
        }

        clearTimeout(dragState.timer);

        if (dragState.active) {
            finishDrag();
        } else {
            openModal(character);
        }

        resetDragState();

    });

    card.addEventListener("pointercancel", function() {

        if (dragState.card === card) {
            cancelDrag();
            resetDragState();
        }

    });

}

function startDrag(card, event) {

    dragState.active = true;

    card.setPointerCapture(dragState.pointerId);
    card.classList.add("dragging");

    const rect = card.getBoundingClientRect();

    card.dataset.offsetX = event.clientX - rect.left;
    card.dataset.offsetY = event.clientY - rect.top;

    card.style.position = "fixed";
    card.style.width = rect.width + "px";
    card.style.height = rect.height + "px";
    card.style.left = rect.left + "px";
    card.style.top = rect.top + "px";
    card.style.zIndex = 1000;
    card.style.pointerEvents = "none";

}

function updateDragPosition(event) {

    const card = dragState.card;

    const offsetX = parseFloat(card.dataset.offsetX);
    const offsetY = parseFloat(card.dataset.offsetY);

    card.style.left = (event.clientX - offsetX) + "px";
    card.style.top = (event.clientY - offsetY) + "px";

    const siblings = Array.from(
        binderCardsGrid.querySelectorAll(".binderItemCard")
    ).filter((el) => el !== card);

    let target = null;

    for (const sibling of siblings) {

        const rect = sibling.getBoundingClientRect();

        if (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        ) {
            target = sibling;
            break;
        }

    }

    if (target) {

        const children = Array.from(binderCardsGrid.children);
        const cardIndex = children.indexOf(card);
        const targetIndex = children.indexOf(target);

        if (targetIndex < cardIndex) {
            binderCardsGrid.insertBefore(card, target);
        } else {
            binderCardsGrid.insertBefore(card, target.nextSibling);
        }

    }

}

function finishDrag() {

    const card = dragState.card;

    card.classList.remove("dragging");
    card.style.position = "";
    card.style.width = "";
    card.style.height = "";
    card.style.left = "";
    card.style.top = "";
    card.style.zIndex = "";
    card.style.pointerEvents = "";

    persistBinderOrder();

}

function cancelDrag() {

    const card = dragState.card;

    if (!card) {
        return;
    }

    card.classList.remove("dragging");
    card.style.position = "";
    card.style.width = "";
    card.style.height = "";
    card.style.left = "";
    card.style.top = "";
    card.style.zIndex = "";
    card.style.pointerEvents = "";

}

function resetDragState() {

    dragState.active = false;
    dragState.pointerId = null;
    dragState.card = null;
    dragState.timer = null;

}

async function persistBinderOrder() {

    const cards = Array.from(
        binderCardsGrid.querySelectorAll(".binderItemCard")
    );

    const updates = cards.map((card, index) => ({
        id: card.dataset.binderItemId,
        position: index
    }));

    currentBinderItems = updates
        .map((update) => {
            const existing = currentBinderItems.find(
                (item) => item.id === update.id
            );
            return { ...existing, position: update.position };
        })
        .sort((a, b) => a.position - b.position);

    syncBinderEntryFromCurrentItems();

    for (const update of updates) {

        const { error } = await supabaseClient
            .from("binder_items")
            .update({ position: update.position })
            .eq("id", update.id);

        if (error) {
            console.error("Erreur mise à jour position :", error);
        }

    }

}

function syncBinderEntryFromCurrentItems() {

    const binderEntry = binders.find(
        (b) => b.id === currentBinder.id
    );

    if (binderEntry) {
        binderEntry.items = currentBinderItems.map((item) => ({
            id: item.id,
            binder_id: item.binder_id,
            inventory_id: item.inventory_id,
            position: item.position
        }));
    }

}


// ========================================
// AJOUT / SUPPRESSION DE CARTES DANS UN CLASSEUR
// ========================================

function openAddCardPicker() {

    addCardGrid.innerHTML = "";

    const alreadyInBinder = new Set(
        currentBinderItems.map((item) => item.inventory_id)
    );

    inventoryItems.forEach((character) => {

        const tile = document.createElement("div");
        tile.className = "addCardOption";

        if (alreadyInBinder.has(character.id)) {
            tile.classList.add("isAdded");
        }

        const img = document.createElement("img");
        img.src = character.character_image;
        img.referrerPolicy = "no-referrer";

        const name = document.createElement("p");
        name.textContent = character.character_name;

        tile.appendChild(img);
        tile.appendChild(name);

        tile.onclick = function() {

            if (tile.classList.contains("isAdded")) {
                return;
            }

            addCharacterToBinder(character);
            tile.classList.add("isAdded");

        };

        addCardGrid.appendChild(tile);

    });

    addCardOverlay.classList.add("isOpen");

}

addCardClose.addEventListener("click", function() {
    addCardOverlay.classList.remove("isOpen");
});

addCardOverlay.addEventListener("click", function(event) {

    if (event.target === addCardOverlay) {
        addCardOverlay.classList.remove("isOpen");
    }

});

async function addCharacterToBinder(character) {

    const nextPosition = currentBinderItems.length;

    const {
        data,
        error
    } = await supabaseClient
        .from("binder_items")
        .insert({
            binder_id: currentBinder.id,
            inventory_id: character.id,
            position: nextPosition
        })
        .select()
        .single();

    if (error) {
        console.error("Erreur ajout au classeur :", error);
        return;
    }

    currentBinderItems.push({ ...data, character });

    syncBinderEntryFromCurrentItems();

    renderBinderCardsGrid();

}

async function removeFromBinder(item) {

    const { error } = await supabaseClient
        .from("binder_items")
        .delete()
        .eq("id", item.id);

    if (error) {
        console.error("Erreur suppression du classeur :", error);
        return;
    }

    currentBinderItems = currentBinderItems.filter(
        (entry) => entry.id !== item.id
    );

    currentBinderItems.forEach((entry, index) => {
        entry.position = index;
    });

    for (const entry of currentBinderItems) {

        const { error: updateError } = await supabaseClient
            .from("binder_items")
            .update({ position: entry.position })
            .eq("id", entry.id);

        if (updateError) {
            console.error("Erreur réajustement des positions :", updateError);
        }

    }

    syncBinderEntryFromCurrentItems();

    renderBinderCardsGrid();

}


// ========================================
// NAVIGATION CLASSEURS
// ========================================

binderBackButton.onclick = function() {
    currentBinder = null;
    switchView("binders");
};

binderRenameButton.onclick = async function() {

    const newName = prompt("Nouveau nom :", currentBinder.name);

    if (!newName || !newName.trim()) {
        return;
    }

    const { error } = await supabaseClient
        .from("binders")
        .update({ name: newName.trim() })
        .eq("id", currentBinder.id);

    if (error) {
        console.error("Erreur renommage classeur :", error);
        return;
    }

    currentBinder.name = newName.trim();
    binderDetailTitle.textContent = currentBinder.name;

};

binderDeleteButton.onclick = async function() {

    if (!confirm(`Supprimer le classeur "${currentBinder.name}" ?`)) {
        return;
    }

    const { error } = await supabaseClient
        .from("binders")
        .delete()
        .eq("id", currentBinder.id);

    if (error) {
        console.error("Erreur suppression classeur :", error);
        return;
    }

    binders = binders.filter((b) => b.id !== currentBinder.id);
    currentBinder = null;

    switchView("binders");
    renderBindersGrid();

};


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
