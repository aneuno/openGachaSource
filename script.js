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


// ========================================
// GESTION DES GEMMES (affichage uniquement)
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
        .select("gems")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Erreur lors de la récupération des gemmes :", error);
        return;
    }

    if (!data) {

        const { error: insertError } = await supabaseClient
            .from("profiles")
            .insert({ user_id: user.id, gems: 10000 });

        if (insertError) {
            console.error("Erreur lors de la création du profil :", insertError);
            return;
        }

        gemsDisplay.textContent = "10000 gemmes";

    } else {

        gemsDisplay.textContent = `${data.gems} gemmes`;

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

    userEmail.textContent = data.user.email;

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
