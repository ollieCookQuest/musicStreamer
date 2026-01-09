import { NextRequest, NextResponse } from "next/server";
import { searchMusicService, fetchHouseholds, getMusicServiceAccounts, fetchFavorites, getPlaybackStatus, fetchGroups } from "@/lib/sonos";

// Extract account info from favorites or playback state
function extractAccountFromFavorites(favorites: any[]): { accountId?: string; serviceId?: string } {
  if (!favorites || favorites.length === 0) return {};
  
  // Try to find a favorite with account/service info
  for (const favorite of favorites) {
    const itemId = favorite.itemId;
    if (itemId?.accountId && itemId?.serviceId) {
      return {
        accountId: itemId.accountId,
        serviceId: itemId.serviceId,
      };
    }
  }
  return {};
}

function extractAccountFromPlayback(playbackState: any): { accountId?: string; serviceId?: string } {
  if (!playbackState) return {};
  
  const currentItem = playbackState.currentItem;
  if (currentItem?.track?.id) {
    return {
      accountId: currentItem.track.id.accountId,
      serviceId: currentItem.track.id.serviceId,
    };
  }
  if (currentItem?.id) {
    return {
      accountId: currentItem.id.accountId,
      serviceId: currentItem.id.serviceId,
    };
  }
  return {};
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { term, accountId: providedAccountId } = body;

    if (!term || term.trim().length === 0) {
      return NextResponse.json({ error: "Missing search term" }, { status: 400 });
    }

    const householdsData = await fetchHouseholds();
    const households = householdsData.households;
    if (!households || households.length === 0) {
      return NextResponse.json({ error: "No households found" }, { status: 404 });
    }

    const householdId = households[0].id;

    // Get music service accounts
    let accountId = providedAccountId;
    let serviceId: string | undefined;

    if (!accountId) {
      // Try to get from musicServiceAccounts endpoint first
      try {
        const accounts = await getMusicServiceAccounts(householdId);
        const musicAccounts = accounts.musicServiceAccounts || [];
        
        // Prefer Spotify (serviceId "9") if available
        const spotifyAccount = musicAccounts.find((acc: any) => acc.serviceId === "9");
        if (spotifyAccount) {
          accountId = spotifyAccount.id;
          serviceId = spotifyAccount.serviceId;
        } else if (musicAccounts.length > 0) {
          // Use first available account
          accountId = musicAccounts[0].id;
          serviceId = musicAccounts[0].serviceId;
        }
      } catch (error: any) {
        // Endpoint not available, try extracting from favorites/playback
        console.log("musicServiceAccounts endpoint not available, trying fallback methods...");
        
        // Try to get from favorites
        try {
          const favoritesData = await fetchFavorites(householdId);
          const accountInfo = extractAccountFromFavorites(favoritesData.items || []);
          if (accountInfo.accountId && accountInfo.serviceId) {
            accountId = accountInfo.accountId;
            serviceId = accountInfo.serviceId;
          }
        } catch (favError) {
          console.error("Failed to get from favorites:", favError);
        }
        
        // If still no account, try playback state (need to get groups first)
        if (!accountId) {
          try {
            const groupsData = await fetchGroups(householdId);
            const groups = groupsData.groups || [];
            if (groups.length > 0) {
              const firstGroup = groups[0];
              const playbackData = await getPlaybackStatus(firstGroup.id);
              const accountInfo = extractAccountFromPlayback(playbackData);
              if (accountInfo.accountId && accountInfo.serviceId) {
                accountId = accountInfo.accountId;
                serviceId = accountInfo.serviceId;
              }
            }
          } catch (playbackError) {
            console.error("Failed to get from playback:", playbackError);
          }
        }
      }
    } else {
      // Get serviceId from account
      try {
        const accounts = await getMusicServiceAccounts(householdId);
        const account = accounts.musicServiceAccounts?.find((acc: any) => acc.id === accountId);
        serviceId = account?.serviceId;
      } catch (error) {
        // If endpoint fails, try to extract from favorites/playback
        console.log("Failed to get serviceId from accounts, trying fallback...");
        try {
          const favoritesData = await fetchFavorites(householdId);
          const favorite = favoritesData.items?.find((fav: any) => 
            fav.itemId?.accountId === accountId
          );
          if (favorite?.itemId?.serviceId) {
            serviceId = favorite.itemId.serviceId;
          }
        } catch (favError) {
          console.error("Failed to get serviceId from favorites:", favError);
        }
      }
    }

    if (!accountId || !serviceId) {
      return NextResponse.json({ 
        error: "No music service account available for search",
        details: "Please ensure a music service (like Spotify) is connected in your Sonos app and try playing some music or adding favorites first"
      }, { status: 400 });
    }

    try {
      const searchResults = await searchMusicService(householdId, accountId, term.trim(), serviceId);
      
      return NextResponse.json({
        ...searchResults,
        accountId,
        serviceId,
      });
    } catch (searchError: any) {
      console.error("Search failed:", searchError);
      
      // If search endpoint doesn't exist, return helpful error
      if (searchError?.errorCode === "ERROR_RESOURCE_NOT_FOUND" || searchError?.message?.includes("not available")) {
        return NextResponse.json({ 
          error: "Search is not available for this music service",
          details: "The Sonos Control API search endpoint may not be supported for all music services. Try browsing your favorites or currently playing content instead.",
          errorCode: searchError?.errorCode,
        }, { status: 404 });
      }
      
      throw searchError;
    }
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json({ 
      error: "Failed to search", 
      details: error.message || error.details || "Search is not available. Please ensure a music service is connected and try browsing favorites instead.",
      errorCode: error?.errorCode,
    }, { status: 500 });
  }
}
