const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const statusText = document.getElementById('statusText');

chrome.storage.local.get(['anilistToken'], (result) => 
{
    if (result.anilistToken) 
    {
        showConnectedState();
    }
});

function showConnectedState() 
{
    statusText.innerText = "Statut : Connecté";
    statusText.style.color = "#16a34a"; 
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
}

function showDisconnectedState() 
{
    statusText.innerText = "Statut : Déconnecté";
    statusText.style.color = "#a3a3a3"; 
    loginBtn.style.display = "block";
    loginBtn.innerText = "Se connecter à AniList";
    logoutBtn.style.display = "none";
}


loginBtn.addEventListener('click', () => 
{
    loginBtn.innerText = "Connexion en cours...";

    chrome.runtime.sendMessage({ action: "login" }, (response) => 
    {
        if (response && response.success) 
        {
            showConnectedState();
        } 
        
        else 
        {
            loginBtn.innerText = "Erreur de connexion";
            loginBtn.style.backgroundColor = "#dc2626";
        }
    });
});

logoutBtn.addEventListener('click', () => 
{
    chrome.storage.local.remove(['anilistToken'], () => 
    {
        console.log("[Anime-Sama-AniList] Token removed.");
        showDisconnectedState();
    });
});