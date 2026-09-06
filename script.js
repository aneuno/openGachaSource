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
const userEmail = document.getElementById("userEmail");
const gemsDisplay = document.getElementById("gemsDisplay");
const logoutButton = document.getElementById("logoutButton");
const bannersButton = document.getElementById("bannersButton");
const inventoryButton = document.getElementById("inventoryButton");
const usernameOverlay = document.getElementById("usernameOverlay");
const usernameInput = document.getElementById("usernameInput");
const usernameSubmit = document.getElementById("usernameSubmit");
const usernameError = document.getElementById("usernameError");
// ========================================
// EXTRACTION DE L'ID DISCORD DEPUIS LA SESSION
// ========================================
function extractDiscordId(user) {

    const discordIdentity = (user.identities || []).find(
        (identity) => identity.provider === "discord"
    );

    if (discordIdentity && discordIdentity.identity_data && discordIdentity.identity_data.id) {
        return discordIdentity.identity_data.id;
    }

    if (user.user_metadata && user.user_metadata.provider_id) {
        return user.user_metadata.provider_id;
    }

    return null;

}
// ========================================
// FENETRE PSEUDO OBLIGATOIRE
// ========================================
function requireUsername() {

    mainMenu.style.display = "none";
    usernameOverlay.classList.add("isOpen");

}

function unlockApp() {

    usernameOverlay.classList.remove("isOpen");
    mainMenu.style.display = "flex";

}

const mainMenu = document.getElementById("mainMenu");

usernameSubmit.onclick = async function () {

    const username = usernameInput.value.trim();

    if (!username) {
        usernameError.textContent = "Entre un pseudo.";
        return;
    }

    usernameError.textContent = "";

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

    if (error) {

        if (error.code === "23505") {
            usernameError.textContent = "Ce pseudo est déjà pris.";
        } else {
            usernameError.textContent = "Erreur, réessaie.";
            console.error("Erreur mise à jour pseudo :", error);
        }

        return;

    }

    userEmail.textContent = username;
    unlockApp();

};
// ========================================
// GESTION DES GEMMES + PROFIL
// ========================================
async function loadUserGems() {

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
        .from("profiles")
        .select("gems, username")
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Erreur lors de la récupération du profil :", error);
        return;
    }

    if (!data) {

        const discordId = extractDiscordId(user);

        const { error: insertError } = await supabaseClient
            .from("profiles")
            .insert({ id: user.id, gems: 10000, discord_id: discordId });

        if (insertError) {
            console.error("Erreur lors de la création du profil :", insertError);
            return;
        }

        gemsDisplay.textContent = "10000 gemmes";
        requireUsername();

    } else {

        gemsDisplay.textContent = `${data.gems} gemmes`;

        if (data.username) {
            userEmail.textContent = data.username;
        } else {
            requireUsername();
        }

    }

}
// ========================================
// NAVIGATION
// ========================================
bannersButton.onclick = function () {
    window.location.href = "banners.html";
};
inventoryButton.onclick = function () {
    window.location.href = "inventory.html";
};
// ========================================
// VERIFICATION DU COMPTE
// ========================================
async function checkUser() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        window.location.href = "login.html";
        return false;
    }

    return true;

}
// ========================================
// DECONNEXION
// ========================================
logoutButton.onclick = async function () {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("Erreur de déconnexion :", error);
        return;
    }

    window.location.href = "login.html";

};
// ========================================
// INITIALISATION
// ========================================
async function init() {

    const loggedIn = await checkUser();

    if (!loggedIn) {
        return;
    }

    await loadUserGems();

}
init();
