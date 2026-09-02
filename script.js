const button = document.getElementById("button");

let result = document.getElementById("result");
let characters = [];

fetch("characters.json")
    .then(response => response.json())
    .then(data => {
        characters = data.characters;
        console.log(characters);
    });

button.onclick = function() {
    let i = Math.floor(Math.random() * characters.length);
    result.textContent = characters[i].name;
}
