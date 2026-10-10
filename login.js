const SUPABASE_URL =
    "https://cskeaklbzfqanzinjfxm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_bKQb420z_j9ckzdUVNxHlQ_atXD-A_M";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const discordLoginButton =
    document.getElementById("discordLoginButton");

const emailLoginForm =
    document.getElementById("emailLoginForm");

const emailInput =
    document.getElementById("emailInput");

const emailLoginButton =
    document.getElementById("emailLoginButton");

const loginMessage =
    document.getElementById("loginMessage");

// ========================================
// CONNEXION VIA DISCORD
// ========================================

discordLoginButton.onclick = async function () {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "discord",
        options: {
            redirectTo: new URL(
                "index.html",
                window.location.href
            ).href
        }
    });

    if (error) {
        console.error("Erreur de connexion Discord :", error);
        alert("Impossible de se connecter avec Discord.");
    }
};

// ========================================
// CONNEXION VIA E-MAIL
// ========================================

emailLoginForm.onsubmit = async function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
        return;
    }

    emailLoginButton.disabled = true;
    loginMessage.textContent = "Envoi du lien de connexion...";

    const { error } = await supabaseClient.auth.signInWithOtp({
        email: email,
        options: {
            emailRedirectTo: new URL(
                "index.html",
                window.location.href
            ).href
        }
    });

    emailLoginButton.disabled = false;

    if (error) {
        console.error("Erreur de connexion par e-mail :", error);
        loginMessage.textContent =
            "Impossible d'envoyer le lien. Réessaie plus tard.";
        return;
    }

    loginMessage.textContent =
        "Si l'adresse est valide, un lien de connexion va être envoyé. Vérifie ta boîte mail.";
};

// ========================================
// SI DEJA CONNECTE, REDIRIGE DIRECTEMENT
// ========================================

(async function checkAlreadyLoggedIn() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (!error && data.user) {
        window.location.href = "index.html";
    }
})();
