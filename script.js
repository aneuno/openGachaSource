const button = document.getElementById("summonButton");
const multiButton = document.getElementById("multiSummonButton");

const result = document.getElementById("result");
const resultImage = document.getElementById("resultImage");

let characters = [];

fetch("characters.json")
    .then(response => response.json())
    .then(data => {
        characters = data.characters;
        console.log("Personnages chargés :", characters);
    })
    .catch(error => console.error("Erreur lors du chargement :", error));

function getRandomCharacter() {
    const totalWeight = characters.reduce(
        (total, character) => total + character.weight, 0
    );

    let random = Math.random() * totalWeight;

    for (const character of characters) {
        random -= character.weight;

        if (random < 0) {
            return character;
        }
    }

    return null;
}

function summon() {
    if (characters.length === 0) return;

    const chosen = getRandomCharacter();

    if (!chosen) return;

    result.textContent = chosen.name;

    if (chosen.image) {
        resultImage.referrerPolicy = "no-referrer";
        resultImage.src = chosen.image;
        resultImage.alt = chosen.name;
        resultImage.style.display = "block";
        resultImage.classList.remove("enlarged");
    } else {
        resultImage.style.display = "none";
    }

    console.log("Personnage obtenu :", chosen.name);
    console.log("Rareté :", chosen.rarity);
    console.log("Weight :", chosen.weight);
}

button.onclick = function() {
    summon();
};

multiButton.onclick = function() {
    console.log("10 summon +1");
};

resultImage.onclick = function() {
    resultImage.classList.toggle("enlarged");
};
