"use client";

import { useSonos } from "@/components/sonos-provider";
import { Button } from "@/components/ui/button";
import { Compass, Layout, Waves, Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: Compass, label: "Feed", page: "Feed" },
  { icon: Layout, label: "Library", page: "Library" },
];

export function ZoneSelector({ isCollapsed }: { isCollapsed: boolean }) {
  const { 
    groups, 
    currentGroup, 
    setCurrentGroup, 
    currentPage, 
    setCurrentPage,
    selectedZoneIds,
    toggleZone,
    setSelectedZoneIds,
    refreshState,
  } = useSonos();
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

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
      
      console.log("Grouping zones from sidebar:", { targetGroupId, playerIds });
      
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
      
      // Update currentGroup to the newly grouped zone
      await refreshState();
      const updatedGroups = await fetch("/api/sonos/state").then(r => r.json()).then(d => d.groups || []);
      const groupedZone = updatedGroups.find((g: any) => g.id === targetGroupId);
      if (groupedZone) {
        // Set the grouped zone as current and selected
        setCurrentGroup(groupedZone);
        setSelectedZoneIds([targetGroupId]);
        setIsMultiSelectMode(false);
      }
    } catch (error) {
      console.error("Failed to group zones:", error);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-10 py-2">
      {/* Primary Navigation */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground px-6">
          System
        </h3>
        <nav className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <Button
                key={item.label}
                variant="ghost"
                onClick={() => setCurrentPage(item.page)}
                className={cn(
                  "w-full h-12 rounded-2xl transition-all duration-300 flex items-center justify-start px-4 group relative",
                  isActive 
                    ? "bg-foreground/[0.05] text-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-500",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span className="font-black tracking-tight text-[11px] uppercase italic ml-4">
                  {item.label}
                </span>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Room Selection - Architectural Design */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            Zones
          </h3>
          {!isMultiSelectMode ? (
            <button
              onClick={() => setIsMultiSelectMode(true)}
              className="text-[8px] font-black uppercase tracking-[0.2em] text-primary hover:text-foreground transition-colors"
            >
              Select
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {selectedZoneIds.length > 1 && (
                <button
                  onClick={handleGroupZones}
                  className="text-[8px] font-black uppercase tracking-[0.2em] text-primary hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Link2 className="h-3 w-3" />
                  Group
                </button>
              )}
              <button
                onClick={() => {
                  setIsMultiSelectMode(false);
                  setSelectedZoneIds([]);
                }}
                className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-2 px-2">
          {groups.map((group) => {
            const isPlaying = group.playbackState === "PLAYBACK_STATE_PLAYING";
            const isActive = currentGroup?.id === group.id;
            const isSelected = selectedZoneIds.includes(group.id);
            
            return (
              <motion.button
                key={group.id}
                onClick={(e) => {
                  if (isMultiSelectMode) {
                    e.stopPropagation();
                    toggleZone(group.id);
                  } else {
                    // When selecting a zone normally, set it as current group AND selected zone
                    setCurrentGroup(group);
                    setSelectedZoneIds([group.id]);
                  }
                }}
                className={cn(
                  "w-full h-20 rounded-[2rem] transition-all duration-500 relative flex items-center px-4 overflow-hidden border",
                  isActive && !isMultiSelectMode
                    ? "bg-foreground/[0.06] text-foreground border-foreground/[0.1]" 
                    : isSelected && isMultiSelectMode
                    ? "bg-primary/10 text-foreground border-primary/30"
                    : "bg-transparent text-muted-foreground hover:bg-foreground/[0.02] border-transparent"
                )}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Active State Indicator - Left Edge */}
                {isActive && !isMultiSelectMode && (
                  <motion.div 
                    layoutId="active-zone-indicator"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-foreground"
                  />
                )}
                
                {/* Selection Indicator in Multi-Select Mode */}
                {isSelected && isMultiSelectMode && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md"
                  >
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </motion.div>
                )}

                {/* Icon Container */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500",
                    isActive && !isMultiSelectMode
                      ? "bg-foreground shadow-lg" 
                      : isSelected && isMultiSelectMode
                      ? "bg-primary shadow-lg"
                      : "bg-foreground/[0.05]"
                  )}>
                    <Waves className={cn(
                      "h-5 w-5 transition-colors duration-500",
                      (isActive && !isMultiSelectMode) || (isSelected && isMultiSelectMode)
                        ? "text-background" 
                        : "text-muted-foreground"
                    )} />
                  </div>
                  
                  {/* Playing Indicator Dot */}
                  {isPlaying && (
                    <motion.div 
                      layoutId={`playing-dot-${group.id}`}
                      className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background shadow-sm"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                </div>
                
                {/* Text Content */}
                <div className="flex flex-col items-start ml-4 flex-1 min-w-0">
                  <span className={cn(
                    "font-black text-sm tracking-tight uppercase italic transition-colors leading-none truncate w-full",
                    (isActive && !isMultiSelectMode) || (isSelected && isMultiSelectMode)
                      ? "text-foreground" 
                      : "text-muted-foreground opacity-60"
                  )}>
                    {group.name}
                  </span>
                  
                  {/* Status Indicator */}
                  <div className="mt-2 h-3 flex items-center">
                    {isPlaying ? (
                      <div className="flex gap-0.5 items-end h-full">
                        <motion.div 
                          animate={{ height: [3, 10, 5, 12, 3] }} 
                          transition={{ repeat: Infinity, duration: 1 }} 
                          className="w-0.5 bg-primary rounded-full" 
                        />
                        <motion.div 
                          animate={{ height: [6, 3, 10, 3, 8] }} 
                          transition={{ repeat: Infinity, duration: 0.8 }} 
                          className="w-0.5 bg-primary rounded-full" 
                        />
                        <motion.div 
                          animate={{ height: [8, 12, 3, 12, 6] }} 
                          transition={{ repeat: Infinity, duration: 1.2 }} 
                          className="w-0.5 bg-primary rounded-full" 
                        />
                      </div>
                    ) : (
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 dark:opacity-40">
                        Standby
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
