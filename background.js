const CLIENT_ID = "44440";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => 
{
    if (request.action === "login") 
    {
        const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${CLIENT_ID}&response_type=token`;

        chrome.identity.launchWebAuthFlow(
        {
            url: authUrl,
            interactive: true 
        }, 
        (redirectUrl) => 
        {
            if (chrome.runtime.lastError || !redirectUrl) 
            {
                console.error("[Anime-Sama-AniList] Auth error:", chrome.runtime.lastError);
                sendResponse({ success: false });
                return;
            }

            const url = new URL(redirectUrl.replace('#', '?'));
            const token = url.searchParams.get('access_token');

            if (token) 
            {
                console.log("[Anime-Sama-AniList] Auth Token successfully retrieved!");
                
                chrome.storage.local.set({ anilistToken: token }, () => 
                {
                    sendResponse({ success: true, token: token });
                });
            } 
            
            else 
            {
                console.error("[Anime-Sama-AniList] No token found in URL.");
                sendResponse({ success: false });
            }
        });

        return true; 
    }
});