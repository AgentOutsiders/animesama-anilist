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

// Parameters for tracking mode and auto timer
const trackingSelect = document.getElementById('trackingModeSelect');
const autoSettings = document.getElementById('autoSettings');
const timerInput = document.getElementById('timerInput');

chrome.storage.local.get(['trackingMode', 'autoTimerMinutes'], (result) => 
{
    const mode = result.trackingMode || 'manual';
    const minutes = result.autoTimerMinutes || 5;
    
    trackingSelect.value = mode;
    timerInput.value = minutes;
    
    if (mode === 'auto') 
    {
        autoSettings.style.display = "block";
    }
});

trackingSelect.addEventListener('change', (event) => 
{
    const selectedMode = event.target.value;
    chrome.storage.local.set({ trackingMode: selectedMode });

    if (selectedMode === 'auto') 
    {
        autoSettings.style.display = "block";
    } 
    else 
    {
        autoSettings.style.display = "none";
    }
});

timerInput.addEventListener('change', (event) => 
{
    let newTime = parseInt(event.target.value);
    
    if (newTime < 1 || isNaN(newTime)) newTime = 1; 
    
    chrome.storage.local.set({ autoTimerMinutes: newTime });
});