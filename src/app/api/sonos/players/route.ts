import { NextResponse } from "next/server";
import { fetchHouseholds, fetchGroups } from "@/lib/sonos";

export async function GET() {
  try {
    const householdsData = await fetchHouseholds();
    const households = householdsData.households;

    if (!households || households.length === 0) {
      return NextResponse.json({ players: [] });
    }

    const householdId = households[0].id;
    // Players endpoint doesn't exist, extract players from groups instead
    const groupsData = await fetchGroups(householdId);
    const groups = groupsData.groups || [];
    
    // Extract unique players from all groups
    const players: any[] = [];
    const seenPlayerIds = new Set<string>();
    
    groups.forEach((group: any) => {
      // Extract coordinator/player ID from group ID (format: RINCON_xxx:timestamp)
      if (group.id && group.id.includes(':')) {
        const playerId = group.id.split(':')[0];
        if (!seenPlayerIds.has(playerId)) {
          seenPlayerIds.add(playerId);
          // Use group name only if it's not a grouped name (doesn't contain + or &)
          const isUngrouped = !group.name?.includes('+') && !group.name?.includes('&');
          players.push({
            id: playerId,
            name: isUngrouped ? group.name : `Player ${playerId.slice(-4)}`,
            coordinatorId: playerId,
          });
        }
      }
      
      // Also check for players array in group - these have individual names
      if (group.players && Array.isArray(group.players)) {
        group.players.forEach((player: any) => {
          const playerId = player.id || player.playerId || player.player?.id;
          if (playerId && !seenPlayerIds.has(playerId)) {
            seenPlayerIds.add(playerId);
            // Prefer player.name, fallback to finding matching ungrouped group name
            let playerName = player.name || player.playerName || player.displayName;
            
            // If no name, try to find an ungrouped group with this coordinator
            if (!playerName || playerName.startsWith('Player ')) {
              const matchingGroup = groups.find((g: any) => {
                const gCoordinatorId = g.coordinatorId || (g.id?.includes(':') ? g.id.split(':')[0] : g.id);
                return gCoordinatorId === playerId && !g.name?.includes('+') && !g.name?.includes('&');
              });
              if (matchingGroup) {
                playerName = matchingGroup.name;
              }
            }
            
            players.push({
              id: playerId,
              name: playerName || `Player ${playerId.slice(-4)}`,
              coordinatorId: playerId,
            });
          }
        });
      }
      
      // Also check playerIds array - these represent players in a grouped zone
      if (group.playerIds && Array.isArray(group.playerIds)) {
        group.playerIds.forEach((playerId: string) => {
          if (playerId && !seenPlayerIds.has(playerId)) {
            seenPlayerIds.add(playerId);
            // Try to find an ungrouped group with this coordinator for the name
            const matchingGroup = groups.find((g: any) => {
              const gCoordinatorId = g.coordinatorId || (g.id?.includes(':') ? g.id.split(':')[0] : g.id);
              return gCoordinatorId === playerId && !g.name?.includes('+') && !g.name?.includes('&');
            });
            
            players.push({
              id: playerId,
              name: matchingGroup?.name || `Player ${playerId.slice(-4)}`,
              coordinatorId: playerId,
            });
          }
        });
      }
    });

    return NextResponse.json({
      players: players,
    });
  } catch (error) {
    console.error("Players API error:", error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}
