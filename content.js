const MediaType = Object.freeze(
{
    ANIME: "ANIME",
    MANGA: "MANGA"
});

async function searchAnilist(searchTitle, searchType) 
{
    console.log(`[AnimeSama-AniList] Searching on AniList for: ${searchTitle}`);

    const query = `
    query ($search: String, $type: MediaType) {
        Media (search: $search, type: $type) {
            id
            title {
                romaji
                english
            }
        }
    }`;

    const variables = 
    {
        search: searchTitle,
        type: searchType
    };

    const options = 
    {
        method: 'POST',
        headers: 
        {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(
        {
            query: query,
            variables: variables
        })
    };

    try 
    {
        const response = await fetch('https://graphql.anilist.co', options);
        const data = await response.json();
        
        console.log("[AnimeSama-AniList] AniList Response:", data);
        
        if (data.data && data.data.Media) 
        {
            const anilistId = data.data.Media.id;
            console.log(`[AnimeSama-AniList] Found AniList ID: ${anilistId}`);
        }
    } 
    catch (error) 
    {
        console.error("[AnimeSama-AniList] API Error:", error);
    }
}

window.addEventListener('load', () => 
{
    const elementTitle = document.querySelector('#titreOeuvre'); 

    if (!elementTitle) 
    {
        console.log("No title detected, script idle.");
        return; 
    }

    const title = elementTitle.innerText.trim();
    console.log(`[AnimeSama-AniList] Œuvre detected: ${title}. Waiting for chapters/episodes to load...`);

    // loop every 500 milliseconds
    const checkInterval = setInterval(() => 
    {
        const selectEpisodes = document.querySelector('#selectEpisodes');
        const selectChapitres = document.querySelector('#selectChapitres');

        let mediaType = null;
        let textMenuSelect = "";

        if (selectEpisodes && selectEpisodes.value) 
        {
            mediaType = MediaType.ANIME;
            textMenuSelect = selectEpisodes.value;
        } 
        
        else if (selectChapitres && selectChapitres.value) 
        {
            mediaType = MediaType.MANGA;
            textMenuSelect = selectChapitres.value;
        }

        if (textMenuSelect !== "") 
        {
            clearInterval(checkInterval); 

            // overly complicated regex to extract the number from the string, but it works for both anime and manga formats
            const currentNumber = textMenuSelect.match(/\d+/)[0]; 

            console.log(`[AnimeSama-AniList] Title : ${title}`);
            console.log(`[AnimeSama-AniList] Type : ${mediaType}`);
            console.log(`[AnimeSama-AniList] Current Number : ${currentNumber}`);

            searchAnilist(title, mediaType);
        }
        
    }, 500);

    // stop checking after 10 seconds to avoid infinite loop
    setTimeout(() => 
    {
        clearInterval(checkInterval);
    }, 10000);
});