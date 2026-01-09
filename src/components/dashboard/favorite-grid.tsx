"use client";

import { useSonos } from "@/components/sonos-provider";
import { Play, MoreVertical, Heart, ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FavoriteGrid() {
  const { favorites, currentGroup, groups, refreshState, households, setCurrentPage } = useSonos();
  const [browsingFavorite, setBrowsingFavorite] = useState<any | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const playFavorite = async (favoriteId: string) => {
    // Use currentGroup if available, otherwise use the first group
    const activeGroup = currentGroup || (groups && groups.length > 0 ? groups[0] : null);
    
    if (!activeGroup) {
      console.error("No active zone available to play favorite");
      return;
    }

    try {
      const res = await fetch(`/api/sonos/control?groupId=${activeGroup.id}&favoriteId=${favoriteId}`, { 
        method: "POST" 
      });
      
      if (res.ok) {
        await refreshState();
      } else {
        const errorData = await res.json();
        console.error("Failed to play favorite:", errorData);
      }
    } catch (error) {
      console.error("Error playing favorite:", error);
    }
  };

  const browseFavorite = async (favorite: any) => {
    if (!currentGroup || !households?.[0]) return;
    
    setLoading(true);
    setBrowsingFavorite(favorite);

    try {
      // Get itemId from favorite
      const itemId = favorite.itemId?.objectId || favorite.itemId;
      const serviceId = favorite.itemId?.serviceId || favorite.serviceId;
      const accountId = favorite.itemId?.accountId || favorite.accountId;

      if (!itemId || !serviceId || !accountId) {
        console.error("Missing favorite item information:", favorite);
        // Fallback: just play it
        await playFavorite(favorite.id);
        setBrowsingFavorite(null);
        setLoading(false);
        return;
      }

      // Try to get metadata to see if it's a container
      const metadataRes = await fetch(`/api/sonos/library/metadata?accountId=${accountId}&itemId=${encodeURIComponent(itemId)}&serviceId=${serviceId}`);
      
      if (metadataRes.ok) {
        const metadata = await metadataRes.json();
        
        // If it has containers or items, use those
        if (metadata.containers || metadata.items) {
          const normalizedItems = [
            ...(metadata.containers || []).map((c: any) => ({
              ...c,
              id: c.id || { objectId: c.objectId, serviceId: c.serviceId || serviceId, accountId: c.accountId || accountId },
            })),
            ...(metadata.items || []).map((i: any) => ({
              ...i,
              id: i.id || { objectId: i.objectId, serviceId: i.serviceId || serviceId, accountId: i.accountId || accountId },
            })),
          ];
          setPlaylistTracks(normalizedItems);
          setLoading(false);
          return;
        }
      }

      // Fallback: try browsing the container
      const browseRes = await fetch(`/api/sonos/library?accountId=${accountId}&containerId=${encodeURIComponent(itemId)}`);
      
      if (browseRes.ok) {
        const data = await browseRes.json();
        const normalizedItems = [
          ...(data.containers || []).map((c: any) => ({
            ...c,
            id: c.id || { objectId: c.objectId, serviceId: c.serviceId || serviceId, accountId: c.accountId || accountId },
          })),
          ...(data.items || []).map((i: any) => ({
            ...i,
            id: i.id || { objectId: i.objectId, serviceId: i.serviceId || serviceId, accountId: i.accountId || accountId },
          })),
        ];
        setPlaylistTracks(normalizedItems);
      } else {
        // If browsing fails, just play it
        await playFavorite(favorite.id);
        setBrowsingFavorite(null);
      }
    } catch (error) {
      console.error("Failed to browse favorite:", error);
      // Fallback: just play it
      await playFavorite(favorite.id);
      setBrowsingFavorite(null);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (item: any) => {
    if (!currentGroup) return;
    
    const itemId = item.id?.objectId || item.objectId;
    const serviceId = item.id?.serviceId || item.serviceId;
    const accountId = item.id?.accountId || item.accountId;

    if (!itemId || !serviceId || !accountId) {
      console.error("Missing track information:", item);
      return;
    }

    try {
      const res = await fetch("/api/sonos/library/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: currentGroup.id,
          itemId,
          serviceId,
          accountId,
          action: "replace",
        }),
      });

      if (res.ok) {
        await refreshState();
      }
    } catch (error) {
      console.error("Failed to play track:", error);
    }
  };

  if (!favorites || favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10 animate-in fade-in zoom-in duration-1000">
        <div className="relative h-48 w-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/5 blur-[60px] rounded-full animate-pulse" />
          <Play className="h-20 w-20 text-muted-foreground opacity-10" />
        </div>
        <div className="space-y-3 max-w-sm">
          <h3 className="text-3xl font-black tracking-tight italic uppercase text-muted-foreground opacity-70 dark:opacity-60">Your Gallery is Empty</h3>
          <p className="text-muted-foreground font-bold text-sm tracking-tight leading-relaxed px-8 opacity-80 dark:opacity-70 uppercase">
            Curate your collection in the Sonos app to display your favorites here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-20">
      <div className="flex items-end justify-between border-b border-foreground/10 dark:border-white/5 pb-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">Discovery</p>
          <h2 className="text-6xl lg:text-7xl font-black tracking-tighter italic uppercase leading-none">Your Library</h2>
        </div>
        <button className="h-16 w-16 rounded-[2rem] bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-all group border border-foreground/10 dark:border-white/5">
          <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-12 gap-y-20">
        {favorites.map((favorite: any, index: number) => (
          <motion.div
            key={favorite.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => {
              e.stopPropagation();
              // Check if it might be a playlist/container
              const mightBeContainer = favorite.itemId || favorite.type?.includes("playlist") || favorite.type?.includes("container");
              if (mightBeContainer) {
                browseFavorite(favorite);
              } else {
                playFavorite(favorite.id);
              }
            }}
            className="group cursor-pointer"
          >
            {/* Massive Editorial Artwork */}
            <div className="relative aspect-[4/5] rounded-[3.5rem] lg:rounded-[4.5rem] overflow-hidden bg-secondary shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] group-hover:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.5)] transition-all duration-700 ease-[0.22,1,0.36,1]">
              {favorite.imageUrl ? (
                <img
                  src={favorite.imageUrl}
                  alt={favorite.name}
                  className="object-cover w-full h-full transition-all duration-1000 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0 saturate-[0.8] group-hover:saturate-100"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary to-background flex items-center justify-center">
                  <span className="text-foreground/5 text-9xl font-black italic select-none">ART</span>
                </div>
              )}
              
              {/* Cinematic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
              
              {/* Play Button - Always Visible */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playFavorite(favorite.id);
                }}
                className="absolute top-6 right-6 h-16 w-16 rounded-[2rem] bg-white dark:bg-foreground text-black dark:text-background flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 z-10"
                aria-label="Play favorite"
              >
                <Play className="h-8 w-8 fill-current ml-1" />
              </button>
              
              <div className="absolute inset-0 flex flex-col justify-end p-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <div className={`h-20 w-20 rounded-[2rem] bg-white/20 dark:bg-foreground/20 backdrop-blur-lg text-white flex items-center justify-center shadow-2xl mb-6 ${(favorite.itemId || favorite.type?.includes("playlist")) ? "group-hover:scale-110 cursor-pointer" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const mightBeContainer = favorite.itemId || favorite.type?.includes("playlist") || favorite.type?.includes("container");
                    if (mightBeContainer) {
                      browseFavorite(favorite);
                    }
                  }}
                >
                  {(favorite.itemId || favorite.type?.includes("playlist")) ? (
                    <ChevronRight className="h-8 w-8 fill-current" />
                  ) : (
                    <Play className="h-8 w-8 fill-current ml-1" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80 dark:text-white/90">
                    {(favorite.itemId || favorite.type?.includes("playlist")) ? "Browse Playlist" : "Press to Play"}
                  </span>
                  <p className="text-white dark:text-white text-xl font-black italic uppercase leading-tight truncate">{favorite.name}</p>
                </div>
              </div>
            </div>
            
            {/* Modern Typography Details */}
            <div className="mt-10 px-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col min-w-0">
                  <h3 className="font-black text-2xl lg:text-3xl tracking-tighter leading-none truncate uppercase italic group-hover:text-primary transition-colors duration-500">{favorite.name}</h3>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-70 dark:opacity-60 truncate">
                    {favorite.description || "Collection"}
                  </p>
                </div>
                <button className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <MoreVertical className="h-5 w-5 text-muted-foreground opacity-50 dark:opacity-40" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <div className="h-px flex-1 bg-foreground/10 dark:bg-white/5 group-hover:bg-primary/30 dark:group-hover:bg-primary/20 transition-colors duration-700" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 dark:opacity-40">Sonos Fav</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Playlist Tracks Modal/View */}
      {browsingFavorite && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-8"
          onClick={() => {
            setBrowsingFavorite(null);
            setPlaylistTracks([]);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full max-h-[80vh] overflow-y-auto no-scrollbar bg-foreground/[0.02] rounded-3xl border border-foreground/[0.05] p-8 space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">{browsingFavorite.name}</h2>
                <p className="text-sm text-muted-foreground uppercase tracking-widest">
                  {playlistTracks.length} {playlistTracks.length === 1 ? "Track" : "Tracks"}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setBrowsingFavorite(null);
                  setPlaylistTracks([]);
                }}
                className="h-12 w-12 rounded-full"
              >
                <ArrowRight className="h-6 w-6 rotate-180" />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Play className="h-8 w-8 animate-pulse text-primary" />
              </div>
            ) : playlistTracks.length > 0 ? (
              <div className="space-y-2">
                {playlistTracks.map((track, idx) => {
                  const trackName = track.name || track.title || track.track?.name;
                  const artistName = track.artist?.name || track.track?.artists?.map((a: any) => a.name).join(", ");
                  const imageUrl = track.imageUrl || track.images?.[0]?.url || track.track?.album?.images?.[0]?.url;
                  const isContainer = track.type?.includes("container") || track._objectType === "container";

                  return (
                    <motion.button
                      key={track.id?.objectId || track.id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        if (isContainer) {
                          // Could browse deeper, but for now just play
                          playTrack(track);
                        } else {
                          playTrack(track);
                        }
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-foreground/[0.03] hover:bg-foreground/[0.06] border border-foreground/[0.05] hover:border-foreground/20 transition-all group text-left"
                    >
                      <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                        {imageUrl ? (
                          <img src={imageUrl} alt={trackName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="h-6 w-6 text-muted-foreground opacity-30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm uppercase italic truncate">{trackName}</p>
                        {artistName && (
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1 truncate opacity-70">
                            {artistName}
                          </p>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-5 w-5 text-primary" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <Play className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground uppercase tracking-widest">No tracks found</p>
                <p className="text-xs text-muted-foreground mt-2">This playlist appears to be empty</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
