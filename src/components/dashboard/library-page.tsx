"use client";

import { useSonos } from "@/components/sonos-provider";
import { Button } from "@/components/ui/button";
import { Play, Heart, Music, Disc, Users, ListMusic, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
export function LibraryPage() {
  const { currentGroup, refreshState, favorites, households } = useSonos();
  const [loading, setLoading] = useState(false);
  const [browsingContainer, setBrowsingContainer] = useState<any | null>(null);
  const [containerItems, setContainerItems] = useState<any[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<any[]>([]);


  const handlePlay = async (item: any) => {
    if (!currentGroup) return;

    // Validate item
    if (!item || Object.keys(item).length === 0) {
      console.error("Cannot play empty item");
      return;
    }

    // If this is a favorite (has favoriteId), use loadFavorite
    if (item.id && !browsingContainer && !item.itemId) {
      // This is a favorite from the favorites list (not a browsed item)
      try {
        const res = await fetch(`/api/sonos/control?groupId=${currentGroup.id}&favoriteId=${item.id}`, {
          method: "POST",
        });
        if (res.ok) {
          await refreshState();
          return;
        }
      } catch (error) {
        console.error("Failed to load favorite:", error);
      }
    }
    
    // Try multiple ways to extract item ID
    const itemId = item.id?.objectId || item.objectId || item.track?.id?.objectId || item.track?.id;
    
    // Try to get serviceId and accountId from item, or fallback to browsing container
    let serviceId = item.id?.serviceId || item.serviceId || item.track?.id?.serviceId || item.track?.serviceId;
    let accountId = item.id?.accountId || item.accountId || item.track?.id?.accountId || item.track?.accountId;
    
    // If still missing and we're browsing a container, use the container's IDs
    if ((!serviceId || !accountId) && browsingContainer) {
      serviceId = serviceId || browsingContainer.id?.serviceId || browsingContainer.serviceId;
      accountId = accountId || browsingContainer.id?.accountId || browsingContainer.accountId;
    }

    if (!itemId) {
      console.error("Missing item ID:", item);
      return;
    }

    if (!serviceId || !accountId) {
      console.error("Missing serviceId or accountId. Item:", item, "Browsing container:", browsingContainer);
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
      console.error("Failed to play item:", error);
    }
  };

  const handleAddToFavorites = async (item: any) => {
    if (!currentGroup) return;
    
    const itemId = item.id?.objectId || item.objectId;
    const serviceId = item.id?.serviceId || item.serviceId;
    const accountId = item.id?.accountId || item.accountId;
    const name = item.name || item.title;

    if (!itemId || !serviceId || !accountId || !name) {
      console.error("Missing item information:", item);
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
          name,
          action: "addToFavorites",
        }),
      });

      if (res.ok) {
        await refreshState();
      }
    } catch (error) {
      console.error("Failed to add to favorites:", error);
    }
  };

  const getItemIcon = (item: any) => {
    const type = item.type || item._objectType || "";
    if (type.includes("album")) return Disc;
    if (type.includes("artist")) return Users;
    if (type.includes("playlist")) return ListMusic;
    if (type.includes("container")) return ListMusic;
    return Music;
  };

  const handleBrowseContainer = async (item: any, addToBreadcrumb: boolean = true) => {
    if (!currentGroup || !households?.[0]) return;
    
    // Validate item
    if (!item || Object.keys(item).length === 0) {
      console.error("Cannot browse empty item");
      return;
    }
    
    // For favorites, try to get containerId from the item
    let itemId = item.containerId || item.id?.objectId || item.objectId || item.track?.id?.objectId || item.track?.id;
    let serviceId = item.id?.serviceId || item.serviceId || item.track?.id?.serviceId || item.track?.serviceId;
    let accountId = item.id?.accountId || item.accountId || item.track?.id?.accountId || item.track?.accountId;

    // If this is a favorite, try to get metadata from the favorite's itemId
    if (item.id && !browsingContainer && item.itemId) {
      // Favorite has an itemId that we can use
      const favoriteItemId = item.itemId?.objectId || item.itemId;
      const favoriteServiceId = item.itemId?.serviceId || item.serviceId;
      const favoriteAccountId = item.itemId?.accountId || item.accountId;
      
      if (favoriteItemId && favoriteServiceId && favoriteAccountId) {
        itemId = favoriteItemId;
        serviceId = favoriteServiceId;
        accountId = favoriteAccountId;
      }
    }

    if (!itemId || !serviceId || !accountId) {
      console.error("Missing item information for browsing:", item);
      // If it's missing info, try to play it directly (might be a track)
      if (item.id) {
        await handlePlay(item);
      }
      return;
    }

    setLoading(true);
    setBrowsingContainer(item);
    if (addToBreadcrumb) {
      setBreadcrumb([...breadcrumb, item]);
    }

    try {
      console.log("Browsing container with:", { itemId, serviceId, accountId, item });
      
      // If this is a favorite (has item.id), try loading it first to get container info
      if (item.id && !browsingContainer) {
        console.log("This is a favorite, trying to load it first...");
        // Load the favorite to see what container it uses
        const loadRes = await fetch(`/api/sonos/control?groupId=${currentGroup.id}&favoriteId=${item.id}`, {
          method: "POST",
        });
        
        if (loadRes.ok) {
          // Wait a moment for playback to start
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get playback metadata to see the container
          const pbRes = await fetch(`/api/sonos/playback?groupId=${currentGroup.id}`);
          if (pbRes.ok) {
            const pbData = await pbRes.json();
            console.log("Playback data after loading favorite:", pbData);
            
            // Check if we can get container info from playback
            if (pbData.container?.id) {
              const containerId = pbData.container.id.objectId || pbData.container.id;
              const containerServiceId = pbData.container.id.serviceId || pbData.container.service?.id;
              const containerAccountId = pbData.container.id.accountId || accountId;
              
              console.log("Found container from playback:", { containerId, containerServiceId, containerAccountId });
              
              // Try to browse this container
              const browseRes = await fetch(`/api/sonos/library?accountId=${containerAccountId}&containerId=${encodeURIComponent(containerId)}`);
              if (browseRes.ok) {
                const data = await browseRes.json();
                console.log("Browse result:", data);
                const normalizedItems = [
                  ...(data.containers || []).map((c: any) => ({
                    ...c,
                    id: c.id || { objectId: c.objectId, serviceId: c.serviceId || containerServiceId, accountId: c.accountId || containerAccountId },
                  })),
                  ...(data.items || []).map((i: any) => ({
                    ...i,
                    id: i.id || { objectId: i.objectId, serviceId: i.serviceId || containerServiceId, accountId: i.accountId || containerAccountId },
                  })),
                ];
                setContainerItems(normalizedItems);
                setLoading(false);
                await refreshState();
                return;
              }
            }
          }
        }
      }
      
      // Try to get metadata first to see if it's a container
      console.log("Trying metadata endpoint...");
      const metadataRes = await fetch(`/api/sonos/library/metadata?accountId=${accountId}&itemId=${encodeURIComponent(itemId)}&serviceId=${serviceId}`);
      
      if (metadataRes.ok) {
        const metadata = await metadataRes.json();
        console.log("Metadata result:", metadata);
        
        // If it has containers or items, use those
        if (metadata.containers || metadata.items) {
          // Normalize items to ensure they have proper structure
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
          console.log("Setting container items from metadata:", normalizedItems);
          setContainerItems(normalizedItems);
          setLoading(false);
          return;
        }
      } else {
        const errorData = await metadataRes.json().catch(() => ({}));
        console.error("Metadata request failed:", errorData);
      }

      // Fallback: try browsing the container using the itemId
      console.log("Trying browse endpoint...");
      const browseRes = await fetch(`/api/sonos/library?accountId=${accountId}&containerId=${encodeURIComponent(itemId)}`);
      
      if (browseRes.ok) {
        const data = await browseRes.json();
        console.log("Browse result:", data);
        // Normalize items to ensure they have proper structure
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
        console.log("Setting container items from browse:", normalizedItems);
        setContainerItems(normalizedItems);
      } else {
        const errorData = await browseRes.json().catch(() => ({}));
        console.error("Browse failed:", errorData);
        // If browsing fails, try to play it directly (might be a track)
        await handlePlay(item);
        setBrowsingContainer(null);
        setBreadcrumb([]);
      }
    } catch (error) {
      console.error("Failed to browse container:", error);
      // Fallback: try to play it directly
      await handlePlay(item);
      setBrowsingContainer(null);
      setBreadcrumb([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = breadcrumb.slice(0, -1);
      const previousItem = newBreadcrumb[newBreadcrumb.length - 1];
      setBreadcrumb(newBreadcrumb);
      handleBrowseContainer(previousItem, false);
    } else {
      setBrowsingContainer(null);
      setContainerItems([]);
      setBreadcrumb([]);
    }
  };


  const renderItem = (item: any, idx: number, onClick?: () => void) => {
    // Skip empty items
    if (!item || Object.keys(item).length === 0) {
      return null;
    }

    const Icon = getItemIcon(item);
    const imageUrl = item.imageUrl || item.images?.[0]?.url || item.track?.album?.images?.[0]?.url;
    const itemName = item.name || item.title || item.track?.name;
    
    // Better container detection - check multiple indicators
    // For favorites, assume they might be containers if they have an itemId
    const isContainer = 
      item.type?.includes("container") || 
      item._objectType === "container" || 
      item.type?.includes("playlist") || 
      item.type?.includes("album") ||
      item.containerId !== undefined ||
      (item.itemId && (item.itemId.type === "container" || item.itemId._objectType === "container")) ||
      // If it's a favorite (has id but not browsing), always try to browse it first
      (item.id && item.itemId && !browsingContainer) ||
      // If name suggests it's a playlist/album
      (itemName && (itemName.toLowerCase().includes("playlist") || itemName.toLowerCase().includes("album"))) ||
      // If description suggests multiple tracks
      (item.description && item.description.toLowerCase().includes("track"));

    return (
      <motion.div
        key={item.id?.objectId || item.id || idx}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="group relative"
      >
        <div 
          className="aspect-square rounded-2xl overflow-hidden bg-foreground/[0.03] border border-foreground/[0.05] hover:border-foreground/20 transition-all cursor-pointer"
          onClick={onClick || ((e) => {
            e.stopPropagation();
            // Validate item has required information
            if (!item || Object.keys(item).length === 0) {
              console.error("Cannot interact with empty item");
              return;
            }
            
            console.log("Item clicked:", item, "isContainer:", isContainer);
            
            // For favorites in library, always try to browse first if they have itemId
            // This allows exploring playlists
            if (isContainer || (!browsingContainer && item.id && item.itemId)) {
              console.log("Attempting to browse container:", item);
              handleBrowseContainer(item);
            } else if (!browsingContainer && item.id) {
              // If it's a favorite without itemId, try to play it
              console.log("Playing favorite:", item);
              handlePlay(item);
            } else {
              // For browsed items, play them
              console.log("Playing item:", item);
              handlePlay(item);
            }
          })}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={itemName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/60 dark:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            {isContainer ? (
              <Button
                variant="default"
                size="icon"
                className="h-14 w-14 rounded-full bg-foreground text-background"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Browse button clicked for:", item);
                  handleBrowseContainer(item);
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            ) : (
              <>
                <Button
                  variant="default"
                  size="icon"
                  className="h-14 w-14 rounded-full bg-foreground text-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Play button clicked for:", item);
                    handlePlay(item);
                  }}
                >
                  <Play className="h-6 w-6 fill-current ml-0.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/20 dark:bg-white/10 text-white hover:bg-white/30 dark:hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToFavorites(item);
                  }}
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <p className="font-black text-xs uppercase italic truncate">{itemName}</p>
          {(item.artist?.name || item.track?.artists?.[0]?.name) && (
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 truncate">
              {item.artist?.name || item.track?.artists?.map((a: any) => a.name).join(", ")}
            </p>
          )}
          {isContainer && (
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
              {item.type || item._objectType || "Container"}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  // Filter out empty or invalid items
  const validFavorites = favorites.filter((item: any) => 
    item && Object.keys(item).length > 0 && (item.name || item.title || item.id)
  );
  const validContainerItems = containerItems.filter((item: any) => 
    item && Object.keys(item).length > 0 && (item.name || item.title || item.id)
  );
  const itemsToDisplay = browsingContainer ? validContainerItems : validFavorites;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
            {browsingContainer ? browsingContainer.name : "Your Library"}
          </h2>
          <p className="text-sm text-muted-foreground uppercase tracking-widest">
            {browsingContainer ? "Contents" : "Sonos Favorites"}
          </p>
        </div>
        
        {browsingContainer && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-widest">Back</span>
          </Button>
        )}
      </div>

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button 
            onClick={() => {
              setBrowsingContainer(null);
              setContainerItems([]);
              setBreadcrumb([]);
            }} 
            className="hover:text-foreground transition-colors"
          >
            Library
          </button>
          {breadcrumb.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <button
                onClick={() => {
                  const newBreadcrumb = breadcrumb.slice(0, idx + 1);
                  setBreadcrumb(newBreadcrumb);
                  if (idx < breadcrumb.length - 1) {
                    handleBrowseContainer(item, false);
                  }
                }}
                className="hover:text-foreground transition-colors truncate max-w-[200px]"
              >
                {item.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : itemsToDisplay.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {itemsToDisplay
            .filter((item) => item && Object.keys(item).length > 0 && (item.name || item.title || item.id))
            .map((item, idx) => renderItem(item, idx))
            .filter(Boolean)}
        </div>
      ) : browsingContainer ? (
        <div className="flex flex-col items-center justify-center h-64 bg-foreground/[0.02] rounded-3xl border border-foreground/[0.05]">
          <Music className="h-16 w-16 text-muted-foreground opacity-30 dark:opacity-20 mb-4" />
          <p className="text-muted-foreground uppercase tracking-widest mb-2 text-center">No Items Found</p>
          <p className="text-xs text-muted-foreground text-center max-w-md px-4">
            This container appears to be empty or cannot be browsed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-foreground/[0.02] rounded-3xl border border-foreground/[0.05]">
          <Music className="h-16 w-16 text-muted-foreground opacity-30 dark:opacity-20 mb-4" />
          <p className="text-muted-foreground uppercase tracking-widest mb-2 text-center">No Favorites Yet</p>
          <p className="text-xs text-muted-foreground text-center max-w-md px-4 mb-4">
            Add favorites in the Sonos app to see them here.
          </p>
          <div className="bg-foreground/[0.03] rounded-2xl p-4 border border-foreground/[0.05] max-w-md">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">How to Add Favorites</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside text-left">
              <li>Open the Sonos app</li>
              <li>Browse and play music</li>
              <li>Add items to favorites (heart icon)</li>
              <li>Return here to see your favorites</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
