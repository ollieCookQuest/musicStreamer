"use client";

import { useSonos } from "@/components/sonos-provider";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Maximize2, Heart, Disc, Shuffle, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { FullScreenPlayer } from "./full-screen-player";
import { ZoneSelector } from "./zone-selector";
import { VolumeControl } from "./volume-control";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function MiniPlayer() {
  const { 
    currentGroup, 
    playbackState, 
    volume, 
    setVolume, 
    refreshState, 
    isExpanded, 
    setIsExpanded,
    groups,
    selectedZoneIds,
    toggleZone,
    setCurrentGroup,
    setSelectedZoneIds,
  } = useSonos();
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatEnabled, setRepeatEnabled] = useState(false);

  // Extract play modes from playback state - MUST be before early return
  useEffect(() => {
    if (playbackState?.playModes) {
      setShuffleEnabled(playbackState.playModes.shuffle ?? false);
      setRepeatEnabled(playbackState.playModes.repeat ?? false);
    }
  }, [playbackState?.playModes]);

  if (!currentGroup) return null;

  const track = playbackState?.currentItem?.track;
  const container = playbackState?.container;
  const metadata = track || container || playbackState?.currentItem;
  // Check multiple possible field names for playback state
  const isPlaying = 
    playbackState?.playbackState === "PLAYBACK_STATE_PLAYING" ||
    playbackState?.state === "PLAYBACK_STATE_PLAYING" ||
    playbackState?.playbackState === "PLAYING" ||
    playbackState?.state === "PLAYING";
  
  const artwork = track?.imageUrl || container?.imageUrl || metadata?.imageUrl;
  const title = track?.name || container?.name || metadata?.name || "No Music Playing";
  
  // Extract artist - Sonos API structure: currentItem.track.artist.name
  const artist = 
    track?.artist?.name || 
    track?.podcast?.name || 
    container?.name || 
    "Unknown Artist";

  const togglePlayback = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const command = isPlaying ? "pause" : "play";
    await handleMultiZoneControl(command);
  };

  const skip = async (e: React.MouseEvent, direction: "skipToNextTrack" | "skipToPreviousTrack") => {
    e.stopPropagation();
    await handleMultiZoneControl(direction);
  };


  const handleGroupZones = async () => {
    if (selectedZoneIds.length < 2) return;
    
    try {
      console.log("Selected zone IDs:", selectedZoneIds);
      console.log("Groups:", groups);

      // Get player IDs from selected groups
      // Groups contain player information - extract player IDs from group structure
      const playerIds: string[] = [];
      
      for (const zoneId of selectedZoneIds) {
        const group = groups.find((g: any) => g.id === zoneId);
        console.log(`Processing zone ${zoneId}:`, group);
        
        if (group) {
          // Method 1: Groups have a players array - extract player IDs
          if (group.players && Array.isArray(group.players)) {
            group.players.forEach((player: any) => {
              // Player ID can be in different formats
              const playerId = player.id || player.playerId || player.player?.id;
              console.log(`Found player in group.players:`, player, `ID: ${playerId}`);
              if (playerId && !playerIds.includes(playerId)) {
                playerIds.push(playerId);
              }
            });
          }
          
          // Method 2: Check for playerIds array directly
          if (group.playerIds && Array.isArray(group.playerIds)) {
            group.playerIds.forEach((pid: string) => {
              console.log(`Found playerId in group.playerIds: ${pid}`);
              if (pid && !playerIds.includes(pid)) {
                playerIds.push(pid);
              }
            });
          }
          
          // Method 3: Extract from group ID itself (group ID format: RINCON_xxx:timestamp)
          // The group ID itself contains the player ID before the colon
          if (group.id && group.id.includes(':')) {
            const groupPlayerId = group.id.split(':')[0];
            console.log(`Extracted player ID from group ID: ${groupPlayerId}`);
            if (groupPlayerId && !playerIds.includes(groupPlayerId)) {
              playerIds.push(groupPlayerId);
            }
          }
          
          // Method 4: If group has coordinator, use that
          if (group.coordinatorId && !playerIds.includes(group.coordinatorId)) {
            console.log(`Found coordinatorId: ${group.coordinatorId}`);
            playerIds.push(group.coordinatorId);
          }
        }
      }

      if (playerIds.length === 0) {
        console.error("No player IDs found for selected zones");
        return;
      }

      // Use the first selected group as the target group (this becomes the master group)
      const targetGroupId = selectedZoneIds[0];
      
      console.log("Grouping zones:", { targetGroupId, playerIds });
      
      const res = await fetch("/api/sonos/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: targetGroupId,
          playerIds: playerIds,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to parse error response" }));
        console.error("Group API error:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData
        });
        alert(`Failed to group zones: ${errorData.error || errorData.details || "Unknown error"}`);
        return;
      }

      // After grouping, refresh state to get the new group structure
      await refreshState();
      
      // Wait a bit for Sonos to update the group structure
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update currentGroup to the newly grouped zone so all controls use it
      await refreshState();
      const updatedGroups = await fetch("/api/sonos/state").then(r => r.json()).then(d => d.groups || []);
      const groupedZone = updatedGroups.find((g: any) => g.id === targetGroupId);
      if (groupedZone) {
        // Set the grouped zone as current and selected
        setCurrentGroup(groupedZone);
        setSelectedZoneIds([targetGroupId]);
      }
    } catch (error) {
      console.error("Failed to group zones:", error);
    }
  };

  const handleUngroupZones = async () => {
    // Ungroup by creating separate groups for each selected zone
    // This is a simplified approach - in reality, we'd need to split the group
    try {
      await refreshState();
    } catch (error) {
      console.error("Failed to ungroup zones:", error);
    }
  };

  const handleMultiZoneControl = async (command: "play" | "pause" | "skipToNextTrack" | "skipToPreviousTrack") => {
    // If only one zone is selected, or if zones are grouped, control the single group
    // This ensures grouped zones play the same content synchronously
    if (selectedZoneIds.length === 1 || selectedZoneIds.length === 0) {
      const groupId = selectedZoneIds[0] || currentGroup?.id;
      if (!groupId) return;
      
      const res = await fetch(`/api/sonos/control?groupId=${groupId}&command=${command}`, { method: "POST" });
      if (res.status === 410) {
        // Group no longer exists, refresh state
        await refreshState();
      } else if (res.ok) {
        await refreshState();
        setTimeout(() => refreshState(), 500);
      }
      return;
    }

    // If multiple zones are selected but NOT grouped, group them first
    // This ensures they play the same content
    if (selectedZoneIds.length > 1) {
      // Group the zones first, then control the group
      await handleGroupZones();
      // After grouping, control will use the single grouped zone
      const groupId = selectedZoneIds[0];
      if (groupId) {
        const res = await fetch(`/api/sonos/control?groupId=${groupId}&command=${command}`, { method: "POST" });
        if (res.ok) {
          await refreshState();
          setTimeout(() => refreshState(), 500);
        }
      }
    }
  };

  return (
    <>
      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setIsExpanded(true)}
        className="h-28 glass-light rounded-[3rem] p-4 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] flex items-center justify-between gap-8 border border-white/10 group cursor-pointer hover:bg-white/10 dark:hover:bg-black/40 transition-all duration-700"
      >
        {/* Track Info */}
        <div className="flex items-center gap-6 w-[35%] min-w-0">
          <div className="h-20 w-20 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-2xl relative group-hover:scale-105 transition-transform duration-700 border border-white/5 bg-secondary">
            {artwork ? (
              <img src={artwork} alt={title} className="w-full h-full object-cover saturate-125" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Disc className="h-8 w-8 text-muted-foreground opacity-20 animate-spin-slow" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                <div className="flex gap-1.5 items-end h-6">
                  <motion.div animate={{ height: [4, 16, 8, 20, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-white rounded-full" />
                  <motion.div animate={{ height: [8, 4, 16, 4, 12] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white rounded-full" />
                  <motion.div animate={{ height: [12, 16, 4, 16, 8] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-white rounded-full" />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-black text-[22px] tracking-tighter truncate uppercase italic leading-none mb-1.5">{title}</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-90 dark:opacity-80">Artist</span>
              <span className="text-[13px] font-bold text-muted-foreground truncate uppercase tracking-widest opacity-70 dark:opacity-60">{artist}</span>
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-14 w-14 text-muted-foreground hover:text-foreground transition-all group/btn"
            onClick={(e) => skip(e, "skipToPreviousTrack")}
          >
            <SkipBack className="h-8 w-8 fill-current transition-transform group-active/btn:scale-90" />
          </Button>
          
          <Button 
            variant="default" 
            size="icon" 
            className="h-20 w-20 rounded-[2rem] bg-foreground text-background hover:scale-105 active:scale-90 transition-all shadow-[0_20px_40px_-8px_rgba(0,0,0,0.3)] dark:shadow-primary/20 border-4 border-white/5" 
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-1.5" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-14 w-14 text-muted-foreground hover:text-foreground transition-all group/btn"
            onClick={(e) => skip(e, "skipToNextTrack")}
          >
            <SkipForward className="h-8 w-8 fill-current transition-transform group-active/btn:scale-90" />
          </Button>
        </div>

        {/* High-End Actions */}
        <div className="flex items-center justify-end gap-8 w-[35%]">
          <div className="hidden xl:flex items-center gap-3 pr-4" onClick={(e) => e.stopPropagation()}>
            <VolumeControl
              selectedZoneIds={selectedZoneIds.length > 0 ? selectedZoneIds : (currentGroup ? [currentGroup.id] : [])}
              compact={true}
            />
            <ZoneSelector
              selectedZoneIds={selectedZoneIds}
              onZoneToggle={toggleZone}
              onGroupZones={handleGroupZones}
              onUngroupZones={handleUngroupZones}
              compact={true}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={async (e) => {
                e.stopPropagation();
                if (!currentGroup) return;
                const newShuffle = !shuffleEnabled;
                setShuffleEnabled(newShuffle);
                try {
                  const res = await fetch(`/api/sonos/control?groupId=${currentGroup.id}&shuffle=${newShuffle}`, { method: "POST" });
                  if (res.ok) {
                    await refreshState();
                  } else {
                    setShuffleEnabled(!newShuffle);
                  }
                } catch (error) {
                  console.error("Failed to toggle shuffle:", error);
                  setShuffleEnabled(!newShuffle);
                }
              }}
              className={cn(
                "h-14 w-14 rounded-[1.75rem] glass transition-all",
                shuffleEnabled 
                  ? "bg-primary/20 text-primary" 
                  : "hover:bg-primary/10 text-muted-foreground"
              )}
            >
              <Shuffle className="h-6 w-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={async (e) => {
                e.stopPropagation();
                if (!currentGroup) return;
                const newRepeat = !repeatEnabled;
                setRepeatEnabled(newRepeat);
                try {
                  const res = await fetch(`/api/sonos/control?groupId=${currentGroup.id}&repeat=${newRepeat}`, { method: "POST" });
                  if (res.ok) {
                    await refreshState();
                  } else {
                    setRepeatEnabled(!newRepeat);
                  }
                } catch (error) {
                  console.error("Failed to toggle repeat:", error);
                  setRepeatEnabled(!newRepeat);
                }
              }}
              className={cn(
                "h-14 w-14 rounded-[1.75rem] glass transition-all",
                repeatEnabled 
                  ? "bg-primary/20 text-primary" 
                  : "hover:bg-primary/10 text-muted-foreground"
              )}
            >
              <Repeat className="h-6 w-6" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-14 w-14 rounded-[1.75rem] bg-primary text-primary-foreground hover:scale-105 transition-all shadow-lg"
              onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
            >
              <Maximize2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <FullScreenPlayer onClose={() => setIsExpanded(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
