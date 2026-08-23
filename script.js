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

oneSummonButton.onclick = function () {
    if (results.length === 0) {
        p.textContent = "Still loading...";
        return;
    }
    p.textContent = getRandomResult();
};

multiSummonButton.onclick = function () {
    if (results.length === 0) {
        p.textContent = "Still loading...";
        return;
    }
    let summons = [];
    // 10 regular summons
    for (let j = 0; j < 10; j++) {
        summons.push(getRandomResult());
    }
    // +1 bonus summon
    const bonus = getRandomResult();
    summons.push(bonus + " (bonus!)");

    p.textContent = summons.join(" | ");
};
