"use client";

import { useSonos } from "@/components/sonos-provider";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoneSelector } from "./zone-selector";
import { VolumeControl } from "./volume-control";
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Heart, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function FullScreenPlayer({ onClose }: { onClose: () => void }) {
  const { 
    currentGroup, 
    playbackState, 
    volume, 
    setVolume, 
    refreshState, 
    setIsExpanded,
    groups,
    selectedZoneIds,
    toggleZone,
    setCurrentGroup,
    setSelectedZoneIds,
  } = useSonos();
  const [currentPosition, setCurrentPosition] = useState(0);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [repeatEnabled, setRepeatEnabled] = useState(false);

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
  
  // Extract position and duration from playback state
  const positionMillis = playbackState?.positionMillis || playbackState?.playbackPositionMillis || 0;
  const durationMillis = playbackState?.durationMillis || metadata?.durationMillis || playbackState?.currentItem?.track?.durationMillis || 0;
  
  // Extract play modes from playback state
  useEffect(() => {
    if (playbackState?.playModes) {
      setShuffleEnabled(playbackState.playModes.shuffle ?? false);
      setRepeatEnabled(playbackState.playModes.repeat ?? false);
    }
  }, [playbackState?.playModes]);
  
  // Update current position when playback state changes
  useEffect(() => {
    if (positionMillis !== undefined && positionMillis !== null) {
      setCurrentPosition(positionMillis);
    }
  }, [positionMillis]);

  // Auto-update position while playing
  useEffect(() => {
    if (!isPlaying || durationMillis === 0) return;
    
    const interval = setInterval(() => {
      setCurrentPosition((prev) => {
        const next = prev + 1000;
        return next >= durationMillis ? durationMillis : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, durationMillis]);

  const progress = durationMillis > 0 ? (currentPosition / durationMillis) * 100 : 0;

  const handleClose = () => {
    setIsExpanded(false);
    onClose();
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
      if (res.ok) {
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
        if (res.status === 410) {
          // Group no longer exists, refresh state
          await refreshState();
        } else if (res.ok) {
          await refreshState();
          setTimeout(() => refreshState(), 500);
        }
      }
    }
  };

  const togglePlayback = async () => {
    const command = isPlaying ? "pause" : "play";
    await handleMultiZoneControl(command);
  };

  const skip = async (direction: "skipToNextTrack" | "skipToPreviousTrack") => {
    await handleMultiZoneControl(direction);
  };


  const handleSeek = async (value: number[]) => {
    if (!currentGroup || durationMillis === 0) return;
    const seekPercent = value[0] / 100;
    const seekPosition = Math.floor(durationMillis * seekPercent);
    setCurrentPosition(seekPosition);
    
    // Send seek command to Sonos
    try {
      const res = await fetch(`/api/sonos/seek?groupId=${currentGroup.id}&positionMillis=${seekPosition}`, { method: "POST" });
      if (res.status === 410) {
        // Group no longer exists, refresh state
        await refreshState();
      } else if (res.ok) {
        // Immediately refresh, then refresh again after a delay
        await refreshState();
        setTimeout(() => {
          refreshState();
        }, 500);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Seek failed:", errorData);
      }
    } catch (error) {
      console.error("Seek failed:", error);
    }
  };

  const toggleShuffle = async () => {
    if (!currentGroup) return;
    const newShuffle = !shuffleEnabled;
    setShuffleEnabled(newShuffle);
    try {
      const res = await fetch(`/api/sonos/control?groupId=${currentGroup.id}&shuffle=${newShuffle}`, { method: "POST" });
      if (res.ok) {
        await refreshState();
      } else {
        // Revert on error
        setShuffleEnabled(!newShuffle);
      }
    } catch (error) {
      console.error("Failed to toggle shuffle:", error);
      setShuffleEnabled(!newShuffle);
    }
  };

  const toggleRepeat = async () => {
    if (!currentGroup) return;
    const newRepeat = !repeatEnabled;
    setRepeatEnabled(newRepeat);
    try {
      const res = await fetch(`/api/sonos/control?groupId=${currentGroup.id}&repeat=${newRepeat}`, { method: "POST" });
      if (res.ok) {
        await refreshState();
      } else {
        // Revert on error
        setRepeatEnabled(!newRepeat);
      }
    } catch (error) {
      console.error("Failed to toggle repeat:", error);
      setRepeatEnabled(!newRepeat);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] bg-background flex flex-col p-6 sm:p-10 md:p-12 overflow-hidden select-none"
    >
      {/* Immersive Dynamic Background */}
      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        {artwork ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1.5 }}
            className="relative h-full w-full"
          >
            <img 
              src={artwork} 
              alt="Background" 
              className="w-full h-full object-cover blur-[120px] saturate-[1.5] brightness-[0.3] scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
          </motion.div>
        ) : (
          <div className="h-full w-full bg-secondary/10" />
        )}
      </div>

      {/* Header - Fixed Height */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-10 shrink-0 h-20 sm:h-24">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClose}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl glass hover:bg-white/10 transition-all duration-500 group"
        >
          <ChevronDown className="h-8 w-8 group-hover:translate-y-1 transition-transform" />
        </Button>
        
        <div className="text-center flex-1 flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-1 opacity-70 dark:opacity-60">Atmosphere</p>
          <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter leading-none truncate max-w-[200px] sm:max-w-md">
            {selectedZoneIds.length > 1 
              ? `${selectedZoneIds.length} Zones` 
              : currentGroup?.name || "No Zone Selected"
            }
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <ZoneSelector
            selectedZoneIds={selectedZoneIds}
            onZoneToggle={toggleZone}
            onGroupZones={handleGroupZones}
            onUngroupZones={handleUngroupZones}
            compact={false}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl glass hover:bg-white/10 transition-all duration-500"
          >
            <ListMusic className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Main Experience - Flex Growing Area */}
      <main className="w-full max-w-7xl mx-auto flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-20 z-10 py-4 sm:py-8 overflow-y-auto no-scrollbar">
        {/* Artwork - Constrained by height */}
        <div className="flex-1 flex items-center justify-center w-full min-h-0 max-h-[40vh] lg:max-h-[60vh]">
          <motion.div 
            layoutId="artwork"
            className="relative aspect-square h-full max-w-full rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 bg-secondary/20"
          >
            {artwork ? (
              <img src={artwork} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center italic">
                <span className="text-foreground/5 text-9xl font-black">S</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Info & Controls - Flex shrinkable */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-2xl text-center lg:text-left space-y-8 sm:space-y-12 shrink-0">
          <div className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2 sm:space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl 2xl:text-8xl font-black tracking-tighter italic uppercase leading-[0.9] text-balance">{title}</h1>
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-8">
                <p className="text-xl sm:text-2xl font-bold text-foreground/40 tracking-tight uppercase italic truncate">{artist}</p>
                <div className="hidden lg:block h-px w-12 bg-primary/20" />
                <div className="flex items-center justify-center gap-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 glass rounded-full text-primary border-primary/20">Ultra HD</span>
                  <Heart className="h-6 w-6 text-muted-foreground opacity-60 dark:opacity-50 hover:text-red-500 transition-colors cursor-pointer" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-8 sm:space-y-12">
            {/* Progress */}
            <div className="space-y-4 sm:space-y-6">
              <Slider 
                value={[progress]} 
                onValueChange={handleSeek}
                max={100} 
                step={0.1} 
                className="w-full h-1.5 sm:h-2 cursor-pointer" 
              />
              <div className="flex justify-between text-[10px] font-black tracking-[0.3em] text-muted-foreground opacity-70 dark:opacity-60 uppercase">
                <span>{formatTime(currentPosition)}</span>
                <span>{formatTime(durationMillis)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between lg:justify-start lg:gap-12">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleShuffle}
                className={cn(
                  "h-10 w-10 transition-all",
                  shuffleEnabled 
                    ? "text-primary opacity-100" 
                    : "text-muted-foreground opacity-70 dark:opacity-60 hover:text-primary"
                )}
              >
                <Shuffle className="h-6 w-6" />
              </Button>
              
              <div className="flex items-center gap-8 sm:gap-12">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-14 w-14 text-foreground/40 hover:text-foreground transition-all hover:scale-110 active:scale-95"
                  onClick={() => skip("skipToPreviousTrack")}
                >
                  <SkipBack className="h-10 w-10 fill-current" />
                </Button>
                
                <Button 
                  variant="default" 
                  size="icon" 
                  className="h-24 w-24 sm:h-32 sm:w-32 rounded-[2.5rem] sm:rounded-[3.5rem] bg-foreground text-background hover:scale-105 active:scale-90 transition-all shadow-2xl border-4 border-white/5 shrink-0" 
                  onClick={togglePlayback}
                >
                  {isPlaying ? <Pause className="h-10 w-10 sm:h-14 sm:w-14 fill-current" /> : <Play className="h-10 w-10 sm:h-14 sm:w-14 fill-current ml-1.5" />}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-14 w-14 text-foreground/40 hover:text-foreground transition-all hover:scale-110 active:scale-95"
                  onClick={() => skip("skipToNextTrack")}
                >
                  <SkipForward className="h-10 w-10 fill-current" />
                </Button>
              </div>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleRepeat}
                className={cn(
                  "h-10 w-10 transition-all",
                  repeatEnabled 
                    ? "text-primary opacity-100" 
                    : "text-muted-foreground opacity-70 dark:opacity-60 hover:text-primary"
                )}
              >
                <Repeat className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Fixed Height */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-10 z-10 pt-6 sm:pt-10 border-t border-white/5 shrink-0 h-32 sm:h-24 mb-4 sm:mb-0">
        <div className="flex items-center gap-3 w-full sm:w-auto px-6 py-3 glass rounded-2xl" onClick={(e) => e.stopPropagation()}>
          <VolumeControl
            selectedZoneIds={selectedZoneIds.length > 0 ? selectedZoneIds : (currentGroup ? [currentGroup.id] : [])}
            compact={false}
          />
        </div>
        
      </footer>
    </motion.div>
  );
}
