const SUPABASE_URL =
    "https://cskeaklbzfqanzinjfxm.supabase.co";
const SUPABASE_KEY =
    "sb_publishable_bKQb420z_j9ckzdUVNxHlQ_atXD-A_M";
const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

const discordLoginButton =
    document.getElementById("discordLoginButton");

// ========================================
// CONNEXION VIA DISCORD
// ========================================

discordLoginButton.onclick = async function () {

    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "discord",
        options: {
            redirectTo: new URL("index.html", window.location.href).href
        }
    });

    if (error) {
        console.error("Erreur de connexion Discord :", error);
        alert("Impossible de se connecter avec Discord.");
    }

};

// ========================================
// SI DEJA CONNECTE, REDIRIGE DIRECTEMENT
// ========================================

(async function checkAlreadyLoggedIn() {

    const { data } = await supabaseClient.auth.getUser();

    if (data.user) {
        window.location.href = "index.html";
    }

})();
