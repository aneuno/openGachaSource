const p = document.getElementById("p");
const oneSummonButton = document.getElementById("oneSummonButton");
const multiSummonButton = document.getElementById("multiSummonButton");

const results = [
    { name: "saber", image: "https://res.cloudinary.com/daowtjque/image/upload/v1773661792/24a7eecb347dd7d60c050bcde3276448_x0odwo.jpg" },
    { name: "misato", image: "https://res.cloudinary.com/daowtjque/image/upload/v1773661792/24a7eecb347dd7d60c050bcde3276448_x0odwo.jpg" },
    { name: "zero two", image: "https://res.cloudinary.com/daowtjque/image/upload/v1773661792/24a7eecb347dd7d60c050bcde3276448_x0odwo.jpg" },
    { name: "revy", image: "https://res.cloudinary.com/daowtjque/image/upload/v1773661792/24a7eecb347dd7d60c050bcde3276448_x0odwo.jpg" },
    { name: "marin", image: "https://res.cloudinary.com/daowtjque/image/upload/v1773661792/24a7eecb347dd7d60c050bcde3276448_x0odwo.jpg" }
];

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
    p.innerHTML = "";
    const randomResult = getRandomResult();
    p.appendChild(createCharacterCard(randomResult));
};

multiSummonButton.onclick = function () {
    p.innerHTML = "";
    for (let j = 0; j < 10; j++) {
        p.appendChild(createCharacterCard(getRandomResult()));
    }
    const bonus = getRandomResult();
    const bonusCard = createCharacterCard(bonus);
    bonusCard.classList.add("bonus");
    p.appendChild(bonusCard);
};
