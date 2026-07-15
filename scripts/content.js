const MediaType = Object.freeze(
{
    ANIME: "ANIME",
    MANGA: "MANGA"
});

let currentAnilistId = null;
let currentNumber = null;
let userProgress = 0;
let currentToken = null;
let currentTrackingMode = 'manual';
let autoTimerMinutes = 5;
let autoTimerId = null;
let activeSelectElement = null;

async function searchAnilist(searchQuery, type)
{
    const searchOptions = 
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
        { 
            query: `query ($search: String, $type: MediaType) { Media (search: $search, type: $type) { id } }`, 
            variables: { search: searchQuery, type: type } 
        })
    };

    try 
    {
        const res = await fetch('https://graphql.anilist.co', searchOptions);
        if (!res.ok) return null;
        
        const data = await res.json();
        if (data.data && data.data.Media) 
        {
            return data.data.Media.id;
        }
    } 
    catch(e) 
    { 
        console.error("[Anime-Sama-AniList] Erreur lors de la requête de recherche :", e); 
    }
    return null;
}

// Function to fetch the user's progress for the current anime/manga
async function fetchUserProgress() 
{
    const query = `
    query ($mediaId: Int) {
        Media(id: $mediaId) {
            mediaListEntry {
                progress
            }
        }
    }`;

    const options = 
    {
        method: 'POST',
        headers: 
        {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${currentToken}` 
        },
        body: JSON.stringify({ query: query, variables: { mediaId: currentAnilistId } })
    };

    try 
    {
        const response = await fetch('https://graphql.anilist.co', options);
        const data = await response.json();
        
        if (data.data && data.data.Media && data.data.Media.mediaListEntry) 
        {
            userProgress = data.data.Media.mediaListEntry.progress;
        } 
        else 
        {
            userProgress = 0;
        }
        
        console.log(`[Anime-Sama-AniList] Progression actuelle : ${userProgress} épisodes/chapitres vus.`);
    } 
    catch (error) 
    {
        console.error("[Anime-Sama-AniList] Erreur lors de la récupération de la progression:", error);
    }
}

// Function to mark the current episode/chapter as watched/read
async function markAsWatched() 
{
    console.log(`[Anime-Sama-AniList] 🚀 ACTION : Envoi de l'épisode/chapitre ${currentNumber} à AniList...`);

    const mutation = `
    mutation ($mediaId: Int, $progress: Int) {
        SaveMediaListEntry (mediaId: $mediaId, progress: $progress) {
            id
            progress
        }
    }`;

    const options = 
    {
        method: 'POST',
        headers: 
        {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${currentToken}` 
        },
        body: JSON.stringify(
        { 
            query: mutation, 
            variables: 
            { 
                mediaId: currentAnilistId,
                progress: parseInt(currentNumber)
            } 
        })
    };

    try 
    {
        const response = await fetch('https://graphql.anilist.co', options);
        const data = await response.json();

        if (data.data && data.data.SaveMediaListEntry) 
        {
            console.log(`[Anime-Sama-AniList] ✅ SUCCÈS : Progression mise à jour à ${data.data.SaveMediaListEntry.progress} !`);
            
            userProgress = Math.max(userProgress, parseInt(currentNumber));
            
            applyTrackingLogic();
        } 
        else if (data.errors) 
        {
            console.error("[Anime-Sama-AniList] ❌ Erreur AniList :", data.errors);
            alert("Erreur lors de la mise à jour AniList. Regarde la console.");
            
            applyTrackingLogic(); 
        }
    } 
    catch (error) 
    {
        console.error("[Anime-Sama-AniList] ❌ Erreur réseau :", error);
        applyTrackingLogic();
    }
}

function clearExistingUI()
{
    if (autoTimerId) 
    {
        clearTimeout(autoTimerId);
        autoTimerId = null;
    }

    const existingBtn = document.getElementById('anilistSyncBtn');
    if (existingBtn) 
    {
        existingBtn.remove();
    }
}

function applyTrackingLogic() 
{
    clearExistingUI();

    const isAlreadyWatched = parseInt(currentNumber) <= userProgress;

    if (currentTrackingMode === 'manual' || isAlreadyWatched) 
    {
        const syncBtn = document.createElement('button');
        syncBtn.id = 'anilistSyncBtn';
        
        syncBtn.style.padding = "5px 15px";
        syncBtn.style.marginLeft = "10px";
        syncBtn.style.borderRadius = "5px";
        syncBtn.style.fontWeight = "bold";
        syncBtn.style.cursor = "pointer";
        syncBtn.style.border = "none";
        syncBtn.style.color = "white";
        syncBtn.style.display = "inline-block"; 
        syncBtn.style.verticalAlign = "middle"; 
        syncBtn.style.position = "relative"; 
        syncBtn.style.zIndex = "99999"; 
        syncBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.5)"; 

        if (isAlreadyWatched) 
        {
            const vuOuLu = activeSelectElement.id === 'selectChapitres' ? "lu" : "vu";
            syncBtn.innerText = `✓ Déjà ${vuOuLu}`;
            syncBtn.style.backgroundColor = "#16a34a"; 
            syncBtn.disabled = true;
            syncBtn.style.cursor = "default";
        }
        else 
        {
            const typeText = activeSelectElement.id === 'selectChapitres' ? "chap." : "ép.";
            syncBtn.innerText = `Valider ${typeText} ${currentNumber}`;
            syncBtn.style.backgroundColor = "#0284c7"; 
            
            syncBtn.addEventListener('click', () => 
            {
                syncBtn.innerText = "Validation...";
                markAsWatched();
            });
        }

        activeSelectElement.parentNode.insertBefore(syncBtn, activeSelectElement.nextSibling);
    }
    else if (currentTrackingMode === 'auto' && !isAlreadyWatched) 
    {
        const milliseconds = autoTimerMinutes * 60 * 1000;
        console.log(`[Anime-Sama-AniList] Mode Auto : Validation dans ${autoTimerMinutes} min...`);
        
        autoTimerId = setTimeout(() => 
        {
            markAsWatched();
        }, milliseconds);
    }
}

chrome.storage.onChanged.addListener((changes, areaName) => 
{
    if (areaName === 'local') 
    {
        let settingsChanged = false;

        if (changes.trackingMode) 
        {
            currentTrackingMode = changes.trackingMode.newValue;
            console.log(`[Anime-Sama-AniList] Mode changé en live : ${currentTrackingMode}`);
            settingsChanged = true;
        }

        if (changes.autoTimerMinutes) 
        {
            autoTimerMinutes = changes.autoTimerMinutes.newValue;
            console.log(`[Anime-Sama-AniList] Timer changé en live : ${autoTimerMinutes} min`);
            settingsChanged = true;
        }

        if (changes.anilistToken && changes.anilistToken.newValue) 
        {
            console.log("[Anime-Sama-AniList] Nouvelle connexion détectée ! Lancement du script...");
            initScraper();
        }

        if (settingsChanged && activeSelectElement && currentAnilistId) 
        {
            applyTrackingLogic();
        }
    }
});

async function initScraper()
{
    const settings = await chrome.storage.local.get(['trackingMode', 'autoTimerMinutes', 'anilistToken']);
    
    if (!settings.anilistToken) 
    {
        console.log("[Anime-Sama-AniList] En attente de connexion...");
        return;
    }

    currentToken = settings.anilistToken;
    currentTrackingMode = settings.trackingMode || 'manual';
    autoTimerMinutes = settings.autoTimerMinutes || 5;

    const elementTitle = document.querySelector('#titreOeuvre'); 
    if (!elementTitle) return; 
    let title = elementTitle.innerText.trim();

    const urlParts = window.location.pathname.split('/');
    if (urlParts.length > 3 && urlParts[3].startsWith('saison'))
    {
        const seasonMatch = urlParts[3].match(/saison(\d+)(?:-(\d+))?/);
        if (seasonMatch && !title.toLowerCase().includes('season') && !title.toLowerCase().includes('saison'))
        {
            const seasonNum = seasonMatch[1];
            const partNum = seasonMatch[2];
            
            if (seasonNum !== "1")
            {
                title += " Season " + seasonNum;
            }
            if (partNum && partNum !== "1")
            {
                title += " Part " + partNum;
            }
        }
    }

    const checkInterval = setInterval(async () => 
    {
        const selectEpisodes = document.querySelector('#selectEpisodes');
        const selectChapitres = document.querySelector('#selectChapitres');

        let mediaType = null;

        if (selectEpisodes && window.getComputedStyle(selectEpisodes).display !== 'none') 
        {
            mediaType = MediaType.ANIME;
            activeSelectElement = selectEpisodes;
        } 
        else if (selectChapitres && window.getComputedStyle(selectChapitres).display !== 'none') 
        {
            mediaType = MediaType.MANGA;
            activeSelectElement = selectChapitres;
        }

        if (activeSelectElement) 
        {
            clearInterval(checkInterval); 
            currentNumber = activeSelectElement.value.match(/\d+/)[0]; 

            let anilistId = await searchAnilist(title, mediaType);

            if (!anilistId)
            {
                if (urlParts.length > 2 && urlParts[1] === 'catalogue')
                {
                    let fallbackTitle = urlParts[2].replace(/-/g, ' ');
                    
                    if (urlParts.length > 3 && urlParts[3].startsWith('saison'))
                    {

                        // Overly complicated regex to extract season and part numbers from the URL
                        const seasonMatch = urlParts[3].match(/saison(\d+)(?:-(\d+))?/);
                        if (seasonMatch)
                        {
                            const seasonNum = seasonMatch[1];
                            const partNum = seasonMatch[2];
                            
                            if (seasonNum !== "1")
                            {
                                fallbackTitle += " Season " + seasonNum;
                            }
                            if (partNum && partNum !== "1")
                            {
                                fallbackTitle += " Part " + partNum;
                            }
                        }
                    }

                    console.log(`[Anime-Sama-AniList] Titre "${title}" introuvable. Essai de secours avec l'URL : "${fallbackTitle}"...`);
                    anilistId = await searchAnilist(fallbackTitle, mediaType);
                }
            }

            if (!anilistId)
            {
                console.error(`[Anime-Sama-AniList] ❌ L'œuvre est introuvable sur AniList (ni avec le titre de la page, ni avec l'URL).`);
                return;
            }

            currentAnilistId = anilistId;
            
            await fetchUserProgress();
            applyTrackingLogic();

            activeSelectElement.addEventListener('change', (event) => 
            {
                currentNumber = event.target.value.match(/\d+/)[0];
                console.log(`[Anime-Sama-AniList] Passage au numéro ${currentNumber}`);
                applyTrackingLogic();
            });
        }
    }, 500);
}

if (document.readyState === "complete" || document.readyState === "interactive")
{
    initScraper();
}
else
{
    document.addEventListener("DOMContentLoaded", initScraper);
    window.addEventListener("pageshow", initScraper);
}