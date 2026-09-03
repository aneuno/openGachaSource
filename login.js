const SUPABASE_URL = "https://cskeaklbzfqanzinjfxm.supabase.co";
const SUPABASE_KEY = "sb_publishable_bKQb420z_j9ckzdUVNxHlQ_atXD-A_M";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

const message = document.getElementById("message");


/* ========================= */
/* CONNEXION                 */
/* ========================= */

loginButton.onclick = async function() {

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {

        message.textContent =
            "Remplis ton email et ton mot de passe.";

        return;
    }


    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({

        email: email,
        password: password

    });


    if (error) {

        message.textContent =
            error.message;

        console.error(error);

        return;
    }


    console.log(
        "Connexion réussie :",
        data.user
    );


    window.location.href =
        "index.html";
};


/* ========================= */
/* INSCRIPTION               */
/* ========================= */

registerButton.onclick = async function() {

    const username =
        usernameInput.value.trim();

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    /* ========================= */
    /* VALIDATION PSEUDO          */
    /* ========================= */

    if (!username) {

        message.textContent =
            "Le pseudo est obligatoire.";

        return;
    }


    if (username.length < 3) {

        message.textContent =
            "Le pseudo doit contenir au moins 3 caractères.";

        return;
    }


    if (username.length > 20) {

        message.textContent =
            "Le pseudo ne peut pas dépasser 20 caractères.";

        return;
    }


    /* ========================= */
    /* VALIDATION EMAIL           */
    /* ========================= */

    if (!email) {

        message.textContent =
            "L'email est obligatoire.";

        return;
    }


    /* ========================= */
    /* VALIDATION MOT DE PASSE    */
    /* ========================= */

    if (!password) {

        message.textContent =
            "Le mot de passe est obligatoire.";

        return;
    }


    if (password.length < 6) {

        message.textContent =
            "Le mot de passe doit contenir au moins 6 caractères.";

        return;
    }


    /* ========================= */
    /* CREATION DU COMPTE        */
    /* ========================= */

    message.textContent =
        "Création du compte...";


    const {
        data,
        error
    } = await supabaseClient.auth.signUp({

        email: email,

        password: password,

        options: {

            data: {

                username: username

            }

        }

    });


    if (error) {

        message.textContent =
            error.message;

        console.error(
            "Erreur inscription :",
            error
        );

        return;
    }


    console.log(
        "Compte créé :",
        data.user
    );


    /* ========================= */
    /* EMAIL DE CONFIRMATION     */
    /* ========================= */

    if (!data.session) {

        message.textContent =
            "Compte créé ! Vérifie ton email pour confirmer ton compte.";

        return;
    }


    /* ========================= */
    /* CONNEXION AUTOMATIQUE     */
    /* ========================= */

    message.textContent =
        "Compte créé !";


    window.location.href =
        "index.html";
};
