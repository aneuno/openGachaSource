const p = document.getElementById("p");
const oneSummonButton = document.getElementById("oneSummonButton");
const multiSummonButton = document.getElementById("multiSummonButton");
let results = [];

fetch("characters.json")
    .then(response => response.json())
    .then(data => {
        results = data.results;
    })
    .catch(error => {
        console.error("Failed to load characters.json:", error);
        p.textContent = "Failed to load character data.";
    });

function getRandomResult() {
    const randomIndex = Math.floor(Math.random() * results.length);
    return results[randomIndex];
}

function createCharacterCard(character) {
    const card = document.createElement("div");
    card.className = "character-card";

    const img = document.createElement("img");
    img.src = character.image;
    img.alt = character.name;

    const name = document.createElement("p");
    name.textContent = character.name;

    card.appendChild(img);
    card.appendChild(name);
    return card;
}

oneSummonButton.onclick = function () {
    if (results.length === 0) {
        p.textContent = "Still loading...";
        return;
    }
    p.innerHTML = "";
    p.appendChild(createCharacterCard(getRandomResult()));
};

multiSummonButton.onclick = function () {
    if (results.length === 0) {
        p.textContent = "Still loading...";
        return;
    }
    p.innerHTML = "";
    for (let j = 0; j < 10; j++) {
        p.appendChild(createCharacterCard(getRandomResult()));
    }
    const bonusCard = createCharacterCard(getRandomResult());
    bonusCard.classList.add("bonus");
    p.appendChild(bonusCard);
};
