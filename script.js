const button = document.getElementById("button");

let result = document.getElementById("result");
let resultImage = document.getElementById("resultImage");

let characters = [];

fetch("characters.json")
    .then(response => response.json())
    .then(data => {
        characters = data.characters;
        console.log(characters);
    });

button.onclick = function() {
    let i = Math.floor(Math.random() * characters.length);
    let chosen = characters[i];

    result.textContent = chosen.name;

    if (chosen.image) {
        resultImage.referrerPolicy = "no-referrer";
        resultImage.src = chosen.image;
        resultImage.alt = chosen.name;
        resultImage.style.display = "block";
    } else {
        resultImage.style.display = "none";
    }
}
