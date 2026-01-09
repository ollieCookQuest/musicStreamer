"use client";

import { useSonos } from "@/components/sonos-provider";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, Volume2, VolumeX, Volume1, ChevronDown, ChevronRight, Split, Plus, Settings2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface VolumeControlProps {
  selectedZoneIds: string[];
  compact?: boolean;
}

interface PlayerVolume {
  playerId: string;
  name: string;
  volume: number;
}

interface ZoneVolumeData {
  groupId: string;
  groupName: string;
  groupVolume: number;
  players: PlayerVolume[];
  isPlaying: boolean;
  isExpanded: boolean;
}

export function VolumeControl({ 
  selectedZoneIds,
  compact = false 
}: VolumeControlProps) {
  const { groups, refreshState, setCurrentGroup, setSelectedZoneIds, volume: currentVolume } = useSonos();
  const [isOpen, setIsOpen] = useState(false);
  const [zoneVolumes, setZoneVolumes] = useState<Record<string, ZoneVolumeData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [selectedPlayersForEdit, setSelectedPlayersForEdit] = useState<string[]>([]);

  // Fetch volumes for all selected zones and their players
  useEffect(() => {
    if (isOpen && selectedZoneIds.length > 0) {
      fetchAllVolumes();
    }
  }, [isOpen, selectedZoneIds, currentVolume]);

  const extractPlayersFromGroup = (group: any): PlayerVolume[] => {
    const players: PlayerVolume[] = [];
    const seenPlayerIds = new Set<string>();

    console.log("Extracting players from group:", group);

    // Method 1: Extract from group.players array (most common)
    if (group.players && Array.isArray(group.players)) {
      console.log("Found group.players array:", group.players);
      group.players.forEach((player: any) => {
        const playerId = player.id || player.playerId || player.player?.id || player.playerId;
        const playerName = player.name || player.playerName || player.displayName || `Player ${playerId?.slice(-4) || 'Unknown'}`;
        
        console.log("Processing player:", player, "Extracted ID:", playerId, "Name:", playerName);
        
        if (playerId && !seenPlayerIds.has(playerId)) {
          seenPlayerIds.add(playerId);
          players.push({
            playerId,
            name: playerName,
            volume: 50, // Will be fetched
          });
        }
      });
    }

    // Method 2: Extract from group.playerIds array
    // Note: We'll update names later when we have access to allPlayers
    if (group.playerIds && Array.isArray(group.playerIds)) {
      console.log("Found group.playerIds array:", group.playerIds);
      group.playerIds.forEach((playerId: string) => {
        if (playerId && !seenPlayerIds.has(playerId)) {
          seenPlayerIds.add(playerId);
          players.push({
            playerId,
            name: `Player ${playerId.slice(-4)}`, // Temporary, will be updated
            volume: 50,
          });
        }
      });
    }

    // Method 3: Check for coordinatorId field
    if (group.coordinatorId && !seenPlayerIds.has(group.coordinatorId)) {
      console.log("Found coordinatorId:", group.coordinatorId);
      seenPlayerIds.add(group.coordinatorId);
      players.push({
        playerId: group.coordinatorId,
        name: group.name || `Player ${group.coordinatorId.slice(-4)}`,
        volume: 50,
      });
    }

    // Method 4: Extract coordinator from group ID (if no players found yet)
    if (players.length === 0 && group.id && group.id.includes(':')) {
      const coordinatorId = group.id.split(':')[0];
      console.log("Extracting coordinator from group ID:", coordinatorId);
      players.push({
        playerId: coordinatorId,
        name: group.name || `Player ${coordinatorId.slice(-4)}`,
        volume: 50,
      });
    }

    // Method 5: If group has a single player (not grouped), use the group itself
    // For grouped zones, we need to check if there are multiple players
    // If the group name contains "+" or shows multiple speakers, try to get individual players
    // For now, if we only found one player but the group name suggests multiple, 
    // we might need to fetch players separately
    
    console.log("Extracted players:", players);
    return players;
  };

  const fetchAllVolumes = async () => {
    setIsLoading(true);
    try {
      const selectedZones = groups.filter((group: any) => 
        selectedZoneIds.includes(group.id)
      );

      // First, try to fetch all players from the household
      let allPlayers: any[] = [];
      try {
        const playersRes = await fetch("/api/sonos/players");
        if (playersRes.ok) {
          const playersData = await playersRes.json();
          allPlayers = playersData.players || [];
          console.log("Fetched all players:", allPlayers);
        }
      } catch (error) {
        console.error("Failed to fetch all players:", error);
      }

      const volumeDataPromises = selectedZones.map(async (group: any) => {
        console.log("Processing group for volume:", group);
        
        // Fetch group volume - always fetch fresh from API
        let groupVolume: number | null = null;
        try {
          const res = await fetch(`/api/sonos/volume?groupId=${group.id}`);
          if (res.ok) {
            const data = await res.json();
            groupVolume = typeof data.volume === 'number' ? data.volume : null;
            console.log(`Fetched volume for group ${group.id}: ${groupVolume}`);
          } else {
            const errorText = await res.text();
            console.warn(`Failed to fetch volume for ${group.id}: ${res.status} - ${errorText}`);
          }
        } catch (error) {
          console.error(`Failed to fetch group volume for ${group.id}:`, error);
        }
        
        // Use fetched volume, or fallback to current volume from provider, or 50
        const finalGroupVolume = groupVolume ?? currentVolume ?? 50;

        // Extract players from group
        let players = extractPlayersFromGroup(group);
        
        // Check if group name suggests multiple players (e.g., "Office + 1", "Living Room + 2")
        const hasMultipleInName = group.name && (group.name.includes('+') || group.name.includes('&'));
        const nameMatch = group.name?.match(/\+ (\d+)/);
        const expectedPlayerCount = nameMatch ? parseInt(nameMatch[1]) + 1 : (hasMultipleInName ? 2 : 1);
        
        console.log(`Group "${group.name}" - Expected ${expectedPlayerCount} players, found ${players.length}`);
        
        // Get coordinator ID
        const coordinatorId = group.coordinatorId || (group.id?.includes(':') ? group.id.split(':')[0] : group.id);
        
        // If group has playerIds array, use that as the source of truth and match with allPlayers for proper names
        if (group.playerIds && Array.isArray(group.playerIds) && group.playerIds.length > 0) {
          console.log("Using group.playerIds as source of truth:", group.playerIds);
          
          // Clear existing players and rebuild from playerIds
          const newPlayers: PlayerVolume[] = [];
          
          group.playerIds.forEach((pid: string) => {
            // Try to find player in allPlayers by exact ID match first
            let player = allPlayers.find((p: any) => p.id === pid || p.coordinatorId === pid);
            
            // If not found, try to find by matching the last part of the ID
            if (!player) {
              const pidSuffix = pid.slice(-4);
              player = allPlayers.find((p: any) => {
                const pId = p.id || p.coordinatorId || '';
                return pId.includes(pidSuffix) || pid.includes(pId.slice(-4));
              });
            }
            
            // Also check if there's a matching group (ungrouped zones represent individual players)
            if (!player) {
              const matchingGroup = groups.find((g: any) => {
                const gCoordinatorId = g.coordinatorId || (g.id?.includes(':') ? g.id.split(':')[0] : g.id);
                return gCoordinatorId === pid && !g.name?.includes('+') && !g.name?.includes('&');
              });
              if (matchingGroup) {
                player = { id: pid, name: matchingGroup.name, coordinatorId: pid };
              }
            }
            
            const playerName = player?.name || `Player ${pid.slice(-4)}`;
            console.log(`Player ${pid} matched to: ${playerName}`, player);
            
            newPlayers.push({
              playerId: pid,
              name: playerName,
              volume: 50,
            });
          });
          
          players.length = 0;
          players.push(...newPlayers);
        } else {
          // If no playerIds, try to update names from allPlayers
          players.forEach((p) => {
            // Try exact match first
            let player = allPlayers.find((ap: any) => 
              ap.id === p.playerId || 
              ap.coordinatorId === p.playerId
            );
            
            // If not found, try partial match
            if (!player) {
              const pidSuffix = p.playerId.slice(-4);
              player = allPlayers.find((ap: any) => {
                const apId = ap.id || ap.coordinatorId || '';
                return apId.includes(pidSuffix) || p.playerId.includes(apId.slice(-4));
              });
            }
            
            // Also check if there's a matching ungrouped group
            if (!player) {
              const matchingGroup = groups.find((g: any) => {
                const gCoordinatorId = g.coordinatorId || (g.id?.includes(':') ? g.id.split(':')[0] : g.id);
                return gCoordinatorId === p.playerId && !g.name?.includes('+') && !g.name?.includes('&');
              });
              if (matchingGroup) {
                player = { id: p.playerId, name: matchingGroup.name, coordinatorId: p.playerId };
              }
            }
            
            if (player?.name && (p.name.startsWith('Player ') || p.name === group.name || !p.name)) {
              p.name = player.name;
              console.log(`Updated player ${p.playerId} name to: ${player.name}`);
            }
          });
        }
        
        // If we still don't have enough players, try to find them from other groups
        if (players.length < expectedPlayerCount && allPlayers.length > 0) {
          
          // If still not enough, try to find players by matching group names
          // This is a fallback - try to find players whose names match parts of the group name
          if (players.length < expectedPlayerCount && group.name) {
            const groupNameParts = group.name.split(/[\+\&]/).map((s: string) => s.trim());
            allPlayers.forEach((player: any) => {
              if (players.length >= expectedPlayerCount) return;
              
              const playerName = player.name || '';
              // Check if player name matches any part of the group name
              const matches = groupNameParts.some((part: string) => 
                playerName.toLowerCase().includes(part.toLowerCase()) || 
                part.toLowerCase().includes(playerName.toLowerCase())
              );
              
              if (matches && !players.find(p => p.playerId === player.id)) {
                players.push({
                  playerId: player.id,
                  name: player.name || `Player ${player.id.slice(-4)}`,
                  volume: 50,
                });
              }
            });
          }
          
          // Last resort: if we have coordinator but only one player, try to find other players
          // by checking if there are other groups that might be part of this group
          if (players.length === 1 && coordinatorId) {
            // Check other groups to see if they're part of this grouped zone
            groups.forEach((otherGroup: any) => {
              if (otherGroup.id === group.id) return;
              
              const otherCoordinatorId = otherGroup.coordinatorId || (otherGroup.id?.includes(':') ? otherGroup.id.split(':')[0] : otherGroup.id);
              // If the other group's coordinator is in our playerIds, it might be part of this group
              if (group.playerIds && group.playerIds.includes(otherCoordinatorId)) {
                const player = allPlayers.find((p: any) => p.id === otherCoordinatorId);
                if (player && !players.find(p => p.playerId === otherCoordinatorId)) {
                  players.push({
                    playerId: otherCoordinatorId,
                    name: otherGroup.name || player.name || `Player ${otherCoordinatorId.slice(-4)}`,
                    volume: 50,
                  });
                }
              }
            });
          }
        }
        
        console.log(`Group ${group.name} (${group.id}) has ${players.length} players:`, players);

        // Fetch individual player volumes
        const playerVolumesPromises = players.map(async (player) => {
          try {
            console.log(`Fetching volume for player ${player.playerId} (${player.name})`);
            const res = await fetch(`/api/sonos/player-volume?playerId=${player.playerId}`);
            if (res.ok) {
              const data = await res.json();
              const playerVolume = typeof data.volume === 'number' ? data.volume : finalGroupVolume;
              console.log(`Player ${player.playerId} volume: ${playerVolume}`);
              return { ...player, volume: playerVolume };
            } else {
              const errorText = await res.text();
              console.error(`Failed to fetch volume for player ${player.playerId}:`, res.status, errorText);
              // Use group volume as fallback
              return { ...player, volume: finalGroupVolume };
            }
          } catch (error) {
            console.error(`Error fetching volume for player ${player.playerId}:`, error);
            // Use group volume as fallback
            return { ...player, volume: finalGroupVolume };
          }
        });

        const playerVolumes = await Promise.all(playerVolumesPromises);

        return {
          groupId: group.id,
          groupName: group.name,
          groupVolume: finalGroupVolume,
          players: playerVolumes,
          isPlaying: group.playbackState === "PLAYBACK_STATE_PLAYING",
          isExpanded: false, // Start collapsed
        };
      });

      const volumes = await Promise.all(volumeDataPromises);
      const volumeMap: Record<string, ZoneVolumeData> = {};
      volumes.forEach((data) => {
        volumeMap[data.groupId] = data;
      });
      setZoneVolumes(volumeMap);
    } catch (error) {
      console.error("Failed to fetch volumes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupVolumeChange = async (groupId: string, value: number[]) => {
    const newVolume = value[0];
    
    // Update local state immediately for responsive UI
    setZoneVolumes(prev => ({
      ...prev,
      [groupId]: { ...prev[groupId], groupVolume: newVolume }
    }));
    
    try {
      const res = await fetch(`/api/sonos/control?groupId=${groupId}&volume=${newVolume}`, { 
        method: "POST" 
      });
      
      if (res.status === 410) {
        // Group no longer exists, refresh state but don't show loading
        await refreshState();
        // Silently update volume for this group only
        try {
          const volRes = await fetch(`/api/sonos/volume?groupId=${groupId}`);
          if (volRes.ok) {
            const data = await volRes.json();
            setZoneVolumes(prev => ({
              ...prev,
              [groupId]: { ...prev[groupId], groupVolume: data.volume || 50 }
            }));
          }
        } catch (e) {
          console.error("Failed to refresh volume after 410:", e);
        }
      } else if (!res.ok) {
        // On error, revert the optimistic update
        const errorText = await res.text();
        console.error(`Failed to set group volume: ${res.status} ${errorText}`);
        // Revert by fetching current volume
        try {
          const volRes = await fetch(`/api/sonos/volume?groupId=${groupId}`);
          if (volRes.ok) {
            const data = await volRes.json();
            setZoneVolumes(prev => ({
              ...prev,
              [groupId]: { ...prev[groupId], groupVolume: data.volume || 50 }
            }));
          }
        } catch (e) {
          console.error("Failed to revert volume:", e);
        }
      }
      // On success, state is already updated optimistically, no need to reload
    } catch (error) {
      console.error(`Failed to set group volume for ${groupId}:`, error);
      // Revert on error
      try {
        const volRes = await fetch(`/api/sonos/volume?groupId=${groupId}`);
        if (volRes.ok) {
          const data = await volRes.json();
          setZoneVolumes(prev => ({
            ...prev,
            [groupId]: { ...prev[groupId], groupVolume: data.volume || 50 }
          }));
        }
      } catch (e) {
        console.error("Failed to revert volume:", e);
      }
    }
  };

  const handlePlayerVolumeChange = async (groupId: string, playerId: string, value: number[]) => {
    const newVolume = value[0];
    
    // Update local state immediately for responsive UI
    setZoneVolumes(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        players: prev[groupId].players.map(p => 
          p.playerId === playerId ? { ...p, volume: newVolume } : p
        )
      }
    }));
    
    try {
      const res = await fetch(`/api/sonos/player-volume?playerId=${playerId}&volume=${newVolume}`, { 
        method: "POST" 
      });
      
      if (res.status === 410) {
        // Player/group no longer exists, refresh state but don't show loading
        await refreshState();
        // Silently update volume for this player only
        try {
          const volRes = await fetch(`/api/sonos/player-volume?playerId=${playerId}`);
          if (volRes.ok) {
            const data = await volRes.json();
            setZoneVolumes(prev => ({
              ...prev,
              [groupId]: {
                ...prev[groupId],
                players: prev[groupId].players.map(p => 
                  p.playerId === playerId ? { ...p, volume: data.volume || 50 } : p
                )
              }
            }));
          }
        } catch (e) {
          console.error("Failed to refresh volume after 410:", e);
        }
      } else if (!res.ok) {
        // On error, revert the optimistic update
        const errorText = await res.text();
        console.error(`Failed to set player volume: ${res.status} ${errorText}`);
        // Revert by fetching current volume
        try {
          const volRes = await fetch(`/api/sonos/player-volume?playerId=${playerId}`);
          if (volRes.ok) {
            const data = await volRes.json();
            setZoneVolumes(prev => ({
              ...prev,
              [groupId]: {
                ...prev[groupId],
                players: prev[groupId].players.map(p => 
                  p.playerId === playerId ? { ...p, volume: data.volume || 50 } : p
                )
              }
            }));
          }
        } catch (e) {
          console.error("Failed to revert volume:", e);
        }
      }
      // On success, state is already updated optimistically, no need to reload
    } catch (error) {
      console.error(`Failed to set player volume for ${playerId}:`, error);
      // Revert on error
      try {
        const volRes = await fetch(`/api/sonos/player-volume?playerId=${playerId}`);
        if (volRes.ok) {
          const data = await volRes.json();
          setZoneVolumes(prev => ({
            ...prev,
            [groupId]: {
              ...prev[groupId],
              players: prev[groupId].players.map(p => 
                p.playerId === playerId ? { ...p, volume: data.volume || 50 } : p
              )
            }
          }));
        }
      } catch (e) {
        console.error("Failed to revert volume:", e);
      }
    }
  };

  const toggleZoneExpansion = (groupId: string) => {
    setZoneVolumes(prev => ({
      ...prev,
      [groupId]: { ...prev[groupId], isExpanded: !prev[groupId].isExpanded }
    }));
  };

  const handleSplitGroup = async (groupId: string) => {
    const group = groups.find((g: any) => g.id === groupId);
    if (!group) return;

    // Get coordinator ID (first player in the group)
    const coordinatorId = group.coordinatorId || (group.id?.includes(':') ? group.id.split(':')[0] : group.id);
    
    try {
      // Split by setting group to only contain the coordinator
      const res = await fetch("/api/sonos/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: groupId,
          playerIds: [coordinatorId], // Only coordinator = ungrouped
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to parse error response" }));
        console.error("Split group error:", errorData);
        alert(`Failed to split group: ${errorData.error || errorData.details || "Unknown error"}`);
        return;
      }

      await refreshState();
      await fetchAllVolumes();
    } catch (error: any) {
      console.error("Failed to split group:", error);
      alert(`Failed to split group: ${error.message || "Unknown error"}`);
    }
  };

  const handleEditGroup = (groupId: string) => {
    const zoneData = zoneVolumes[groupId];
    if (!zoneData) return;

    // Initialize selected players with current group members (player IDs)
    setSelectedPlayersForEdit(zoneData.players.map(p => p.playerId));
    setEditingGroupId(groupId);
  };

  const handleSaveGroupEdit = async () => {
    if (!editingGroupId) return;

    try {
      const res = await fetch("/api/sonos/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: editingGroupId,
          playerIds: selectedPlayersForEdit,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to parse error response" }));
        console.error("Edit group error:", errorData);
        alert(`Failed to update group: ${errorData.error || errorData.details || "Unknown error"}`);
        return;
      }

      await refreshState();
      await fetchAllVolumes();
      setEditingGroupId(null);
      setSelectedPlayersForEdit([]);
    } catch (error: any) {
      console.error("Failed to edit group:", error);
      alert(`Failed to edit group: ${error.message || "Unknown error"}`);
    }
  };

  const handleCancelGroupEdit = () => {
    setEditingGroupId(null);
    setSelectedPlayersForEdit([]);
  };

  const togglePlayerInEdit = (playerId: string) => {
    setSelectedPlayersForEdit(prev => {
      if (prev.includes(playerId)) {
        // Don't allow removing the last player
        if (prev.length === 1) return prev;
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const getVolumeIcon = (volume: number) => {
    if (volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return Volume2;
  };

  const getVolumeLabel = (volume: number) => {
    if (volume === 0) return "Muted";
    return `${Math.round(volume)}%`;
  };

  // Get zones that are selected
  const selectedZones = groups.filter((group: any) => 
    selectedZoneIds.includes(group.id)
  );

  // Calculate average volume for display
  // Use current volume from provider if available, otherwise calculate from zone volumes
  const averageVolume = selectedZones.length > 0
    ? Math.round(
        selectedZones.reduce((sum: number, group: any) => {
          const zoneData = zoneVolumes[group.id];
          // Use zone volume if available, otherwise fall back to current volume or 50
          return sum + (zoneData?.groupVolume ?? currentVolume ?? 50);
        }, 0) / selectedZones.length
      )
    : (currentVolume ?? 50);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 transition-all text-foreground hover:bg-foreground/10",
          compact ? "h-10 px-3 text-xs" : "h-12 px-4"
        )}
      >
        <Volume2 className="h-4 w-4 text-foreground opacity-90" />
        <span className="font-black uppercase tracking-tight text-foreground opacity-90">
          {averageVolume}%
        </span>
      </Button>

      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md"
                onClick={() => setIsOpen(false)}
              />
                <motion.div
                  initial={{ opacity: 0, y: compact ? 20 : -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: compact ? 20 : -20, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "fixed z-[301] bg-background backdrop-blur-2xl rounded-3xl border-2 border-foreground/20 shadow-2xl overflow-hidden flex flex-col",
                    compact 
                      ? "bottom-[200px] right-4 sm:right-12 lg:right-20 w-[440px] max-w-[calc(100vw-2rem)] max-h-[75vh]" 
                      : "bottom-24 right-4 sm:right-6 md:right-8 w-[520px] max-w-[calc(100vw-2rem)] max-h-[80vh]"
                  )}
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-foreground/10 shrink-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                      VOLUME CONTROL
                    </h3>
                    {selectedZoneIds.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-md"
                      >
                        <span className="text-xs font-black text-primary-foreground">
                          {selectedZoneIds.length}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 text-foreground hover:bg-foreground/10 active:scale-95 transition-all rounded-xl touch-manipulation"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Zones Volume Controls */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Volume2 className="h-16 w-16 text-muted-foreground opacity-20 mb-4 animate-pulse" />
                    <p className="text-base font-medium text-muted-foreground">Loading volumes...</p>
                  </div>
                ) : selectedZones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Volume2 className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                    <p className="text-base font-medium text-muted-foreground">No zones selected</p>
                    <p className="text-sm text-muted-foreground opacity-70 mt-2">Select zones to control volume</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {selectedZones.map((group: any, idx: number) => {
                      const zoneData = zoneVolumes[group.id];
                      if (!zoneData) return null;

                      const { groupVolume, players, isPlaying, isExpanded } = zoneData;
                      const VolumeIcon = getVolumeIcon(groupVolume);
                      const hasPlayers = players.length > 0;

                      return (
                        <motion.div
                          key={group.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="space-y-4 p-5 rounded-2xl bg-foreground/[0.03] border border-foreground/10 dark:bg-foreground/[0.05]"
                        >
                          {/* Zone Header with Group Volume */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {hasPlayers && players.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 shrink-0 text-foreground hover:bg-foreground/10 active:scale-95 transition-all rounded-xl touch-manipulation"
                                    onClick={() => toggleZoneExpansion(group.id)}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-5 w-5" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5" />
                                    )}
                                  </Button>
                                )}
                                {hasPlayers && players.length === 1 && (
                                  <div className="h-11 w-11 shrink-0" />
                                )}
                                <div className={cn(
                                  "h-12 w-12 rounded-full flex items-center justify-center transition-all shrink-0",
                                  isPlaying 
                                    ? "bg-primary/20" 
                                    : "bg-foreground/[0.08] dark:bg-foreground/[0.12]"
                                )}>
                                  <VolumeIcon className={cn(
                                    "h-6 w-6",
                                    isPlaying ? "text-primary" : "text-foreground opacity-70"
                                  )} />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1 gap-1">
                                  <span className="text-sm font-black uppercase tracking-tight text-foreground truncate leading-tight">
                                    {zoneData.groupName}
                                  </span>
                                  <span className="text-xs font-medium text-muted-foreground opacity-70 leading-tight">
                                    Group: {getVolumeLabel(groupVolume)}
                                    {hasPlayers && ` • ${players.length} speaker${players.length > 1 ? 's' : ''}`}
                                  </span>
                                </div>
                              </div>
                              {isPlaying && (
                                <motion.div
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                  className="h-2.5 w-2.5 rounded-full bg-primary shrink-0"
                                />
                              )}
                            </div>

                            {/* Group Volume Slider */}
                            <div className="flex items-center gap-4 px-2">
                              <VolumeX 
                                className={cn(
                                  "h-6 w-6 shrink-0 transition-colors touch-manipulation",
                                  groupVolume === 0 
                                    ? "text-foreground" 
                                    : "text-muted-foreground opacity-50"
                                )}
                              />
                              <Slider 
                                value={[groupVolume]} 
                                onValueChange={(value) => handleGroupVolumeChange(group.id, value)}
                                max={100} 
                                step={1} 
                                className="flex-1 h-2.5 cursor-pointer touch-manipulation" 
                              />
                              <Volume2 
                                className={cn(
                                  "h-6 w-6 shrink-0 transition-colors touch-manipulation",
                                  groupVolume > 0 
                                    ? "text-foreground" 
                                    : "text-muted-foreground opacity-50"
                                )}
                              />
                            </div>

                            {/* Group Management Actions */}
                            {hasPlayers && players.length > 1 && (
                              <div className="flex items-center gap-2 pt-2 border-t border-foreground/10">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSplitGroup(group.id)}
                                  className="h-10 px-4 text-xs font-black uppercase tracking-tight text-foreground hover:bg-foreground/10 active:scale-95 transition-all rounded-xl touch-manipulation flex items-center gap-2"
                                >
                                  <Split className="h-4 w-4" />
                                  Split
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditGroup(group.id)}
                                  className="h-10 px-4 text-xs font-black uppercase tracking-tight text-foreground hover:bg-foreground/10 active:scale-95 transition-all rounded-xl touch-manipulation flex items-center gap-2"
                                >
                                  <Settings2 className="h-4 w-4" />
                                  Edit Group
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Individual Player Volumes (Expandable) */}
                          {hasPlayers && players.length > 1 && (
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="space-y-4 pt-4 border-t border-foreground/10 overflow-hidden"
                                >
                                  {players.map((player, playerIdx) => {
                                    const PlayerVolumeIcon = getVolumeIcon(player.volume);
                                    return (
                                      <motion.div
                                        key={player.playerId}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: playerIdx * 0.03 }}
                                        className="space-y-3 pl-8"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <PlayerVolumeIcon className="h-5 w-5 shrink-0 text-muted-foreground opacity-70" />
                                            <span className="text-xs font-bold uppercase tracking-tight text-foreground opacity-90 truncate">
                                              {player.name}
                                            </span>
                                          </div>
                                          <span className="text-xs font-medium text-muted-foreground opacity-70 shrink-0">
                                            {getVolumeLabel(player.volume)}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-4 px-2">
                                          <VolumeX 
                                            className={cn(
                                              "h-5 w-5 shrink-0 transition-colors touch-manipulation",
                                              player.volume === 0 
                                                ? "text-foreground" 
                                                : "text-muted-foreground opacity-50"
                                            )}
                                          />
                                          <Slider 
                                            value={[player.volume]} 
                                            onValueChange={(value) => handlePlayerVolumeChange(group.id, player.playerId, value)}
                                            max={100} 
                                            step={1} 
                                            className="flex-1 h-2 cursor-pointer touch-manipulation" 
                                          />
                                          <Volume2 
                                            className={cn(
                                              "h-5 w-5 shrink-0 transition-colors touch-manipulation",
                                              player.volume > 0 
                                                ? "text-foreground" 
                                                : "text-muted-foreground opacity-50"
                                            )}
                                          />
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}
                          
                          {/* Edit Group Mode */}
                          {editingGroupId === group.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-4 border-t border-foreground/10 space-y-4"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black uppercase tracking-tight text-foreground">
                                  Select Zones to Add
                                </h4>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelGroupEdit}
                                    className="h-9 px-3 text-xs font-black uppercase tracking-tight text-muted-foreground hover:text-foreground hover:bg-foreground/10 active:scale-95 transition-all rounded-xl touch-manipulation"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSaveGroupEdit}
                                    disabled={selectedPlayersForEdit.length === 0}
                                    className="h-9 px-4 text-xs font-black uppercase tracking-tight bg-foreground text-background hover:bg-foreground/90 active:scale-95 transition-all rounded-xl touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Save ({selectedPlayersForEdit.length})
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto no-scrollbar">
                                {groups.map((g: any) => {
                                  // Get coordinator ID for this group (this is the player ID we need)
                                  const gCoordinatorId = g.coordinatorId || (g.id?.includes(':') ? g.id.split(':')[0] : g.id);
                                  
                                  // Check if this player is already selected
                                  // We need to check if the coordinator ID matches any selected player ID
                                  const isSelected = selectedPlayersForEdit.includes(gCoordinatorId);
                                  const isCurrentGroup = g.id === group.id;
                                  
                                  // Check if this zone is already part of the group being edited
                                  const zoneData = zoneVolumes[group.id];
                                  const isAlreadyInGroup = zoneData?.players.some(p => p.playerId === gCoordinatorId);
                                  
                                  return (
                                    <motion.button
                                      key={g.id}
                                      onClick={() => togglePlayerInEdit(gCoordinatorId)}
                                      disabled={isCurrentGroup && selectedPlayersForEdit.length === 1}
                                      className={cn(
                                        "p-3 rounded-xl border-2 transition-all touch-manipulation text-left",
                                        isSelected
                                          ? "bg-foreground text-background border-foreground"
                                          : "bg-foreground/[0.03] border-transparent hover:bg-foreground/[0.08]",
                                        isCurrentGroup && selectedPlayersForEdit.length === 1
                                          ? "opacity-50 cursor-not-allowed"
                                          : "active:scale-95"
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isSelected && (
                                          <div className="h-5 w-5 rounded-full bg-background flex items-center justify-center shrink-0">
                                            <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
                                          </div>
                                        )}
                                        <span className={cn(
                                          "text-xs font-bold uppercase tracking-tight truncate",
                                          isSelected ? "text-background" : "text-foreground"
                                        )}>
                                          {g.name}
                                        </span>
                                      </div>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
