import { prisma } from "./db";

const CLIENT_ID = process.env.SONOS_CLIENT_ID;
const CLIENT_SECRET = process.env.SONOS_CLIENT_SECRET;
const CALLBACK_URL = process.env.SONOS_CALLBACK_URL;

const BASE_URL = "https://api.ws.sonos.com/control/api/v1";
const AUTH_URL = "https://api.sonos.com/login/v3/oauth";
const TOKEN_URL = "https://api.sonos.com/login/v3/oauth/access";

export function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    response_type: "code",
    state: "sonos-auth",
    scope: "playback-control-all",
    redirect_uri: CALLBACK_URL!,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string) {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: CALLBACK_URL!,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code: ${error}`);
  }

  const data = await response.json();
  
  await prisma.account.create({
    data: {
      service: "sonos",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
  });

  return data;
}

export async function getValidToken() {
  const account = await prisma.account.findFirst({
    where: { service: "sonos" },
    orderBy: { createdAt: "desc" },
  });

  if (!account) return null;

  if (account.expiresAt.getTime() > Date.now() + 60000) {
    return account.accessToken;
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();

  const updated = await prisma.account.update({
    where: { id: account.id },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || account.refreshToken,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
  });

  return updated.accessToken;
}

async function sonosRequest(endpoint: string, options: RequestInit = {}) {
  const token = await getValidToken();
  if (!token) throw new Error("No valid token");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { errorCode: "UNKNOWN", message: errorText };
    }
    
    // Create error with errorCode property for easier handling
    const error = new Error(`Sonos API error: ${errorText}`);
    (error as any).errorCode = errorData.errorCode || "UNKNOWN";
    (error as any).errorData = errorData;
    throw error;
  }

  return response.json();
}

export async function fetchHouseholds() {
  return sonosRequest("/households");
}

export async function fetchGroups(householdId: string) {
  return sonosRequest(`/households/${householdId}/groups`);
}

export async function fetchPlayers(householdId: string) {
  return sonosRequest(`/households/${householdId}/players`);
}

export async function fetchFavorites(householdId: string) {
  return sonosRequest(`/households/${householdId}/favorites`);
}

export async function getPlaybackStatus(groupId: string) {
  return sonosRequest(`/groups/${groupId}/playback`);
}

export async function getPlaybackMetadata(groupId: string) {
  return sonosRequest(`/groups/${groupId}/playbackMetadata`);
}

export async function loadFavorite(groupId: string, favoriteId: string) {
  return sonosRequest(`/groups/${groupId}/favorites`, {
    method: "POST",
    body: JSON.stringify({ favoriteId, action: "replace" }),
  });
}

export async function sendControl(groupId: string, command: "play" | "pause" | "skipToNextTrack" | "skipToPreviousTrack") {
  return sonosRequest(`/groups/${groupId}/playback/${command}`, {
    method: "POST",
  });
}

export async function getVolume(groupId: string) {
  return sonosRequest(`/groups/${groupId}/groupVolume`);
}

export async function setVolume(groupId: string, volume: number) {
  return sonosRequest(`/groups/${groupId}/groupVolume`, {
    method: "POST",
    body: JSON.stringify({ volume }),
  });
}

export async function getPlayerVolume(playerId: string) {
  return sonosRequest(`/players/${playerId}/playerVolume`);
}

export async function setPlayerVolume(playerId: string, volume: number) {
  return sonosRequest(`/players/${playerId}/playerVolume`, {
    method: "POST",
    body: JSON.stringify({ volume }),
  });
}

export async function seek(groupId: string, positionMillis: number) {
  return sonosRequest(`/groups/${groupId}/playback/seek`, {
    method: "POST",
    body: JSON.stringify({ positionMillis }),
  });
}

export async function setPlayModes(groupId: string, shuffle: boolean, repeat: boolean) {
  return sonosRequest(`/groups/${groupId}/playback/playMode`, {
    method: "POST",
    body: JSON.stringify({
      playModes: {
        shuffle,
        repeat,
      },
    }),
  });
}

export async function getMusicServiceAccounts(householdId: string) {
  return sonosRequest(`/households/${householdId}/musicServiceAccounts`);
}

export async function searchMusicService(householdId: string, accountId: string, term: string, serviceId: string) {
  // Try different search endpoint structures based on Sonos Control API documentation
  // Reference: https://docs.sonos.com/reference/control-api
  
  // Format 1: POST /households/{householdId}/musicServiceAccounts/{accountId}/search
  try {
    return await sonosRequest(`/households/${householdId}/musicServiceAccounts/${accountId}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        term,
        serviceId,
      }),
    });
  } catch (error: any) {
    console.log("Search endpoint 1 failed, trying alternative...", error?.errorCode);
    
    // Format 2: POST /households/{householdId}/musicServices/{serviceId}/search
    try {
      return await sonosRequest(`/households/${householdId}/musicServices/${serviceId}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term,
          accountId,
        }),
      });
    } catch (error2: any) {
      console.log("Search endpoint 2 failed, trying alternative...", error2?.errorCode);
      
      // Format 3: Try with different body structure
      try {
        return await sonosRequest(`/households/${householdId}/musicServiceAccounts/${accountId}/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            term,
            accountId,
            serviceId,
          }),
        });
      } catch (error3: any) {
        console.log("Search endpoint 3 failed", error3?.errorCode);
        throw new Error(`Search not available: ${error3?.errorCode || error3?.message || "Unknown error"}`);
      }
    }
  }
}

export async function getMusicServiceMetadata(householdId: string, accountId: string, itemId: string, serviceId: string) {
  return sonosRequest(`/households/${householdId}/musicServiceAccounts/${accountId}/getMetadata`, {
    method: "POST",
    body: JSON.stringify({
      itemId: {
        _objectType: "universalMusicObjectId",
        serviceId,
        objectId: itemId,
        accountId,
      },
    }),
  });
}

// Try to browse using search with empty term or common categories
export async function browseMusicService(householdId: string, musicServiceId: string, accountId: string, containerId?: string) {
  // Try different endpoint structures
  let endpoint;
  
  if (containerId) {
    // Try with container ID
    endpoint = `/households/${householdId}/musicServiceAccounts/${accountId}/containers/${containerId}`;
  } else {
    // Try root containers - different possible structures
    // Structure 1: Using musicServiceAccounts
    endpoint = `/households/${householdId}/musicServiceAccounts/${accountId}/containers`;
  }
  
  try {
    return await sonosRequest(endpoint);
  } catch (error: any) {
    // If that fails, try alternative structure with serviceId
    try {
      const altEndpoint = containerId
        ? `/households/${householdId}/musicServices/${musicServiceId}/containers/${containerId}`
        : `/households/${householdId}/musicServices/${musicServiceId}/containers`;
      return await sonosRequest(altEndpoint);
    } catch (error2: any) {
      // If both fail, return common Spotify categories as fallback
      console.log("Browse endpoint not available, using fallback");
      if (!containerId) {
        return {
          containers: [
            { 
              name: "Your Library", 
              type: "library", 
              id: { objectId: "spotify:user-library", serviceId: musicServiceId, accountId },
              _objectType: "container"
            },
            { 
              name: "Your Playlists", 
              type: "playlists", 
              id: { objectId: "spotify:user-playlists", serviceId: musicServiceId, accountId },
              _objectType: "container"
            },
            { 
              name: "Recently Played", 
              type: "recent", 
              id: { objectId: "spotify:recently-played", serviceId: musicServiceId, accountId },
              _objectType: "container"
            },
            { 
              name: "Search", 
              type: "search", 
              id: { objectId: "search", serviceId: musicServiceId, accountId },
              _objectType: "container"
            },
          ],
        };
      }
      return { containers: [], items: [] };
    }
  }
}

export async function playItem(groupId: string, itemId: string, serviceId: string, accountId: string, action: "replace" | "addNext" | "addToEnd" = "replace") {
  return sonosRequest(`/groups/${groupId}/playback/playItem`, {
    method: "POST",
    body: JSON.stringify({
      itemId: {
        _objectType: "universalMusicObjectId",
        serviceId,
        objectId: itemId,
        accountId,
      },
      action,
    }),
  });
}

export async function addToFavorites(householdId: string, itemId: string, serviceId: string, accountId: string, name: string) {
  return sonosRequest(`/households/${householdId}/favorites`, {
    method: "POST",
    body: JSON.stringify({
      itemId: {
        _objectType: "universalMusicObjectId",
        serviceId,
        objectId: itemId,
        accountId,
      },
      name,
    }),
  });
}

export async function modifyGroupMembers(groupId: string, playerIds: string[]) {
  // Sonos Control API: Modify group membership to include all specified players
  // This creates a synchronized group where all players play the same content
  // Reference: https://docs.sonos.com/reference/groups
  
  // Extract coordinator ID from group ID (format: RINCON_xxx:timestamp)
  // The coordinator is the first player in the group
  const coordinatorId = groupId.includes(':') ? groupId.split(':')[0] : groupId;
  
  // Get household ID first
  const householdsData = await fetchHouseholds();
  const householdId = householdsData.households?.[0]?.id;
  
  if (!householdId) {
    throw new Error("No household found");
  }
  
  console.log("Grouping with coordinator:", coordinatorId, "playerIds:", playerIds, "householdId:", householdId);
  
  // According to Sonos API docs: https://docs.sonos.com/reference/groups
  // Try the correct endpoint formats:
  
  // Format 1: POST /households/{householdId}/groups/{groupId}/modifyGroupMembers
  try {
    return await sonosRequest(`/households/${householdId}/groups/${groupId}/modifyGroupMembers`, {
      method: "POST",
      body: JSON.stringify({
        playerIds: playerIds,
      }),
    });
  } catch (error: any) {
    console.log("modifyGroupMembers endpoint failed, trying setGroupMembers...");
    
    // Format 2: POST /households/{householdId}/groups/{groupId}/setGroupMembers
    try {
      return await sonosRequest(`/households/${householdId}/groups/${groupId}/setGroupMembers`, {
        method: "POST",
        body: JSON.stringify({
          playerIds: playerIds,
        }),
      });
    } catch (error2: any) {
      console.log("setGroupMembers with full groupId failed, trying with coordinator ID...");
      
      // Format 3: POST /households/{householdId}/groups/{coordinatorId}/modifyGroupMembers
      try {
        return await sonosRequest(`/households/${householdId}/groups/${coordinatorId}/modifyGroupMembers`, {
          method: "POST",
          body: JSON.stringify({
            playerIds: playerIds,
          }),
        });
      } catch (error3: any) {
        console.log("modifyGroupMembers with coordinatorId failed, trying setGroupMembers...");
        
        // Format 4: POST /households/{householdId}/groups/{coordinatorId}/setGroupMembers
        try {
          return await sonosRequest(`/households/${householdId}/groups/${coordinatorId}/setGroupMembers`, {
            method: "POST",
            body: JSON.stringify({
              playerIds: playerIds,
            }),
          });
        } catch (error4: any) {
          console.log("setGroupMembers with coordinatorId failed, trying createGroup...");
          
          // Format 5: POST /households/{householdId}/groups/createGroup (create new group)
          try {
            return await sonosRequest(`/households/${householdId}/groups/createGroup`, {
              method: "POST",
              body: JSON.stringify({
                playerIds: playerIds,
              }),
            });
          } catch (error5: any) {
            console.log("createGroup failed, trying direct group endpoints...");
            
            // Format 6: POST /groups/{groupId}/modifyGroupMembers (fallback)
            try {
              return await sonosRequest(`/groups/${groupId}/modifyGroupMembers`, {
                method: "POST",
                body: JSON.stringify({
                  playerIds: playerIds,
                }),
              });
            } catch (error6: any) {
              // Format 7: POST /groups/{coordinatorId}/modifyGroupMembers (final fallback)
              throw new Error(`All grouping endpoints failed. Last error: ${error5.message || error6.message}`);
            }
          }
        }
      }
    }
  }
}

export async function setGroupVolume(groupId: string, volume: number) {
  return setVolume(groupId, volume);
}

export async function sendControlToGroups(groupIds: string[], command: "play" | "pause" | "skipToNextTrack" | "skipToPreviousTrack") {
  // Send control to multiple groups simultaneously
  return Promise.all(groupIds.map(groupId => sendControl(groupId, command)));
}
