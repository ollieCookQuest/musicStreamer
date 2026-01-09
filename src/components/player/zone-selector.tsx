"use client";

import { useSonos } from "@/components/sonos-provider";
import { Button } from "@/components/ui/button";
import { Check, X, Waves, Search, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ZoneSelectorProps {
  selectedZoneIds: string[];
  onZoneToggle: (zoneId: string) => void;
  onGroupZones: () => void;
  onUngroupZones: () => void;
  compact?: boolean;
}

export function ZoneSelector({ 
  selectedZoneIds, 
  onZoneToggle, 
  onGroupZones, 
  onUngroupZones,
  compact = false 
}: ZoneSelectorProps) {
  const { groups, currentGroup } = useSonos();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter zones based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter((group: any) => 
      group.name.toLowerCase().includes(query)
    );
  }, [groups, searchQuery]);

  // Groups are the zones themselves - each group represents a zone/room
  const hasMultipleSelected = selectedZoneIds.length > 1;
  const canGroup = hasMultipleSelected && selectedZoneIds.length > 0;
  const allSelected = selectedZoneIds.length === groups.length && groups.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all
      selectedZoneIds.forEach(id => onZoneToggle(id));
    } else {
      // Select all filtered zones
      filteredGroups.forEach((group: any) => {
        if (!selectedZoneIds.includes(group.id)) {
          onZoneToggle(group.id);
        }
      });
    }
  };

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
        <Waves className="h-4 w-4 text-foreground opacity-90" />
        <span className="font-black uppercase tracking-tight text-foreground opacity-90">
          {selectedZoneIds.length === 0 
            ? "Select Zones" 
            : `${selectedZoneIds.length} Zone${selectedZoneIds.length > 1 ? "s" : ""}`
          }
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
                  "fixed z-[301] bg-background backdrop-blur-2xl rounded-2xl border-2 border-foreground/20 shadow-2xl overflow-hidden flex flex-col",
                  compact 
                    ? "bottom-[200px] right-4 sm:right-12 lg:right-20 w-[360px] max-w-[calc(100vw-2rem)]" 
                    : "top-20 right-4 sm:right-6 md:right-8 w-[420px] max-w-[calc(100vw-2rem)]"
                )}
              >
              {/* Header */}
              <div className="p-5 pb-4 border-b border-foreground/10 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-foreground">
                      SELECT ZONES
                    </h3>
                    {selectedZoneIds.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-md"
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
                    className="h-10 w-10 text-foreground hover:bg-foreground/10 active:scale-95 transition-all rounded-xl"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search zones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-foreground/5 border-2 border-foreground/10 rounded-2xl text-base font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all touch-manipulation"
                  />
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={handleSelectAll}
                    className="h-11 px-4 text-xs font-black uppercase tracking-wider text-foreground/80 hover:text-foreground hover:bg-foreground/10 active:scale-95 transition-all rounded-xl touch-manipulation"
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    {allSelected ? "Deselect All" : "Select All"}
                  </Button>
                  {filteredGroups.length !== groups.length && (
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground px-3 py-2 bg-foreground/5 rounded-xl">
                      {filteredGroups.length} of {groups.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Zones Grid */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-5">
                {filteredGroups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Waves className="h-12 w-12 text-muted-foreground opacity-20 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No zones found</p>
                    <p className="text-xs text-muted-foreground opacity-70 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {filteredGroups.map((group: any, idx: number) => {
                      const isSelected = selectedZoneIds.includes(group.id);
                      const isPlaying = group.playbackState === "PLAYBACK_STATE_PLAYING";
                      const isCurrent = currentGroup?.id === group.id;

                      return (
                        <motion.button
                          key={group.id}
                          onClick={() => onZoneToggle(group.id)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className={cn(
                            "relative flex flex-col items-center justify-center p-5 rounded-2xl transition-all border-2 min-h-[120px] touch-manipulation",
                            isSelected
                              ? "bg-foreground text-background border-foreground shadow-lg"
                              : "bg-foreground/[0.03] border-transparent active:bg-foreground/[0.08] active:border-foreground/20 dark:active:bg-foreground/[0.12]"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {/* Selection Indicator */}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3 h-7 w-7 rounded-full bg-background flex items-center justify-center shadow-lg"
                            >
                              <Check className="h-4 w-4 text-foreground" />
                            </motion.div>
                          )}

                          {/* Icon */}
                          <div className={cn(
                            "h-14 w-14 rounded-full flex items-center justify-center mb-3 transition-all",
                            isSelected 
                              ? "bg-background/20" 
                              : "bg-foreground/[0.08] dark:bg-foreground/[0.12]"
                          )}>
                            <Waves className={cn(
                              "h-7 w-7",
                              isSelected ? "text-background" : "text-foreground opacity-70"
                            )} />
                          </div>

                          {/* Zone Name */}
                          <span className={cn(
                            "text-sm font-black uppercase tracking-tight text-center leading-tight line-clamp-2",
                            isSelected ? "text-background" : "text-foreground opacity-90"
                          )}>
                            {group.name}
                          </span>

                          {/* Status Indicators */}
                          <div className="flex items-center gap-1.5 mt-2">
                            {isPlaying && (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="h-1.5 w-1.5 rounded-full bg-primary"
                              />
                            )}
                            {isCurrent && (
                              <span className="text-[8px] font-black uppercase tracking-[0.1em] text-primary opacity-80">
                                Active
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {canGroup && (
                <div className="p-5 pt-4 border-t border-foreground/10 shrink-0">
                  <div className="flex gap-3">
                    <Button
                      variant="default"
                      onClick={() => {
                        onGroupZones();
                        setIsOpen(false);
                      }}
                      className="flex-1 h-12 text-sm font-black uppercase bg-foreground text-background hover:bg-foreground/90 active:scale-95 transition-all rounded-xl touch-manipulation"
                    >
                      Group {selectedZoneIds.length} Zones
                    </Button>
                    {hasMultipleSelected && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onUngroupZones();
                          setIsOpen(false);
                        }}
                        className="h-12 px-5 text-sm font-black uppercase text-foreground hover:bg-foreground/10 active:scale-95 transition-all rounded-xl touch-manipulation"
                      >
                        Split
                      </Button>
                    )}
                  </div>
                </div>
              )}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
