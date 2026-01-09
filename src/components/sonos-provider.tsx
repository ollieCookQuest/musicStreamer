"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

interface SonosContextType {
  households: any[];
  groups: any[];
  favorites: any[];
  currentGroup: any | null;
  playbackState: any | null;
  volume: number;
  isExpanded: boolean;
  currentPage: string;
  selectedZoneIds: string[];
  setIsExpanded: (expanded: boolean) => void;
  setCurrentPage: (page: string) => void;
  setCurrentGroup: (group: any) => void;
  setVolume: (volume: number) => Promise<void>;
  setSelectedZoneIds: (zoneIds: string[]) => void;
  toggleZone: (zoneId: string) => void;
  refreshState: () => Promise<void>;
}

const SonosContext = createContext<SonosContextType | undefined>(undefined);

// Helper to compare arrays/objects for equality
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

export function SonosProvider({ children }: { children: React.ReactNode }) {
  const [households, setHouseholds] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [currentGroup, setCurrentGroup] = useState<any | null>(null);
  const [playbackState, setPlaybackState] = useState<any | null>(null);
  const [volume, setVolumeState] = useState<number>(50);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>("Feed");
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
  
  const isRefreshingRef = useRef(false);
  const currentGroupIdRef = useRef<string | null>(null);
  const currentGroupRef = useRef<any | null>(null);
  const prevStateRef = useRef<{
    households: any[];
    groups: any[];
    favorites: any[];
    playbackState: any | null;
    volume: number;
  }>({
    households: [],
    groups: [],
    favorites: [],
    playbackState: null,
    volume: 50,
  });

  // Keep ref in sync with state
  useEffect(() => {
    currentGroupRef.current = currentGroup;
  }, [currentGroup]);

  // Save current zone preference
  const saveZonePreference = useCallback(async (zoneId: string) => {
    try {
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "currentZoneId", value: zoneId }),
      });
    } catch (error) {
      console.error("Failed to save zone preference:", error);
    }
  }, []);

  // Save selected zones preference
  const saveSelectedZonesPreference = useCallback(async (zoneIds: string[]) => {
    try {
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          key: "selectedZoneIds", 
          value: JSON.stringify(zoneIds) 
        }),
      });
    } catch (error) {
      console.error("Failed to save selected zones preference:", error);
    }
  }, []);

  // Load saved zone preference
  const loadZonePreference = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/preferences?key=currentZoneId");
      if (res.ok) {
        const data = await res.json();
        return data.value;
      }
    } catch (error) {
      console.error("Failed to load zone preference:", error);
    }
    return null;
  }, []);

  // Load saved selected zones preference
  const loadSelectedZonesPreference = useCallback(async (): Promise<string[]> => {
    try {
      const res = await fetch("/api/preferences?key=selectedZoneIds");
      if (res.ok) {
        const data = await res.json();
        if (data.value) {
          return JSON.parse(data.value);
        }
      }
    } catch (error) {
      console.error("Failed to load selected zones preference:", error);
    }
    return [];
  }, []);

  const refreshState = useCallback(async () => {
    // Prevent overlapping refresh calls
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      const res = await fetch("/api/sonos/state");
      if (!res.ok) return;
      const data = await res.json();
      
      // Only update households if changed
      if (!deepEqual(prevStateRef.current.households, data.households || [])) {
        setHouseholds(data.households || []);
        prevStateRef.current.households = data.households || [];
      }
      
      // Stable sort for groups to prevent jumping UI
      const sortedGroups = (data.groups || []).sort((a: any, b: any) => 
        a.name.localeCompare(b.name)
      );
      
      // Only update groups if changed
      if (!deepEqual(prevStateRef.current.groups, sortedGroups)) {
        setGroups(sortedGroups);
        prevStateRef.current.groups = sortedGroups;
      }
      
      // Stable sort for favorites
      const sortedFavorites = (data.favorites || []).sort((a: any, b: any) => 
        a.name.localeCompare(b.name)
      );
      
      // Only update favorites if changed
      if (!deepEqual(prevStateRef.current.favorites, sortedFavorites)) {
        setFavorites(sortedFavorites);
        prevStateRef.current.favorites = sortedFavorites;
      }
      
      const currentGroupValue = currentGroupRef.current;
      if (!currentGroupValue && data.groups?.length > 0) {
        // Try to load saved zone preferences first
        const savedZoneId = await loadZonePreference();
        const savedSelectedZoneIds = await loadSelectedZonesPreference();
        
        let targetGroup = null;
        
        // Try to restore saved selected zones if they exist
        if (savedSelectedZoneIds.length > 0) {
          // Filter to only include zones that still exist
          const validZoneIds = savedSelectedZoneIds.filter((id: string) => 
            data.groups.some((g: any) => g.id === id)
          );
          
          if (validZoneIds.length > 0) {
            setSelectedZoneIds(validZoneIds);
            // Set current group to first selected zone
            targetGroup = data.groups.find((g: any) => g.id === validZoneIds[0]);
          }
        }
        
        // If no saved selected zones, try saved current zone
        if (!targetGroup && savedZoneId) {
          targetGroup = data.groups.find((g: any) => g.id === savedZoneId);
        }
        
        // Use saved zone if found, otherwise use first group
        const firstGroup = targetGroup || data.groups[0];
        setCurrentGroup(firstGroup);
        // Initialize selectedZoneIds if not already set from saved preference
        if (savedSelectedZoneIds.length === 0) {
          setSelectedZoneIds([firstGroup.id]);
        }
      } else if (currentGroupValue) {
        // Update current group state from fresh groups list
        const updatedGroup = data.groups.find((g: any) => g.id === currentGroupValue.id);
        if (updatedGroup && !deepEqual(currentGroupValue, updatedGroup)) {
          setCurrentGroup(updatedGroup);
          // Ensure selectedZoneIds includes the current group
          if (!selectedZoneIds.includes(updatedGroup.id)) {
            setSelectedZoneIds([updatedGroup.id]);
          }
        } else if (!updatedGroup) {
          // Current group no longer exists, try to load saved preference or use first group
          const savedZoneId = await loadZonePreference();
          let targetGroup = null;
          
          if (savedZoneId) {
            targetGroup = data.groups.find((g: any) => g.id === savedZoneId);
          }
          
          const fallbackGroup = targetGroup || data.groups[0];
          if (fallbackGroup) {
            setCurrentGroup(fallbackGroup);
            setSelectedZoneIds([fallbackGroup.id]);
          }
        }
      }

      // Always fetch playback and volume if we have a group
      const groupId = currentGroupValue?.id;
      if (groupId) {
        // Update group ID ref if changed
        if (groupId !== currentGroupIdRef.current) {
          currentGroupIdRef.current = groupId;
        }
        
        const [pbRes, volRes] = await Promise.all([
          fetch(`/api/sonos/playback?groupId=${groupId}`),
          fetch(`/api/sonos/volume?groupId=${groupId}`)
        ]);
        
        // Handle ERROR_RESOURCE_GONE - group was modified/ungrouped
        if (pbRes.status === 410 || volRes.status === 410) {
          // Group no longer exists, refresh groups and find new current group
          const stateRes = await fetch("/api/sonos/state");
          if (stateRes.ok) {
            const stateData = await stateRes.json();
            const updatedGroups = (stateData.groups || []).sort((a: any, b: any) => 
              a.name.localeCompare(b.name)
            );
            setGroups(updatedGroups);
            
            // Try to find group by name or use first available
            const oldGroupName = currentGroupValue?.name;
            const newGroup = oldGroupName 
              ? updatedGroups.find((g: any) => g.name === oldGroupName)
              : updatedGroups[0];
            
            if (newGroup) {
              setCurrentGroup(newGroup);
              // Update selectedZoneIds to match new group
              if (selectedZoneIds.includes(currentGroupValue.id)) {
                setSelectedZoneIds([newGroup.id]);
              }
            } else if (updatedGroups.length > 0) {
              setCurrentGroup(updatedGroups[0]);
              setSelectedZoneIds([updatedGroups[0].id]);
            }
          }
          return; // Exit early, will refresh on next poll
        }
        
        if (pbRes.ok) {
          const pbData = await pbRes.json();
          // Always update playback state (don't check for changes to ensure UI updates)
          setPlaybackState(pbData);
          prevStateRef.current.playbackState = pbData;
        }
        
        if (volRes.ok) {
          const volData = await volRes.json();
          const newVolume = volData.volume || 50;
          // Always update volume state
          setVolumeState(newVolume);
          prevStateRef.current.volume = newVolume;
        }
      }
    } catch (err) {
      console.error("Failed to fetch Sonos state", err);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [loadZonePreference, loadSelectedZonesPreference]);

  const setVolume = async (newVolume: number) => {
    if (!currentGroup) return;
    setVolumeState(newVolume);
    const res = await fetch(`/api/sonos/control?groupId=${currentGroup.id}&volume=${newVolume}`, { method: "POST" });
    if (res.status === 410) {
      // Group no longer exists, refresh state
      await refreshState();
    }
  };

  // Initial load
  useEffect(() => {
    refreshState();
  }, []);

  // Set up polling interval (independent of state changes)
  useEffect(() => {
    // Poll every 10 seconds - less frequent updates
    const interval = setInterval(() => {
      refreshState();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Refresh when group changes
  useEffect(() => {
    if (currentGroup?.id) {
      refreshState();
    }
  }, [currentGroup?.id]);

  // Keep selected zones in sync with current group and save preferences
  useEffect(() => {
    if (currentGroup?.id) {
      // If no zones selected, or current group is not in selected zones, update it
      if (selectedZoneIds.length === 0 || !selectedZoneIds.includes(currentGroup.id)) {
        setSelectedZoneIds([currentGroup.id]);
      }
      // Save zone preference to database
      saveZonePreference(currentGroup.id);
    }
  }, [currentGroup?.id, saveZonePreference]);

  // Save selected zones preference whenever it changes
  useEffect(() => {
    if (selectedZoneIds.length > 0) {
      saveSelectedZonesPreference(selectedZoneIds);
    }
  }, [selectedZoneIds, saveSelectedZonesPreference]);

  const toggleZone = (zoneId: string) => {
    setSelectedZoneIds(prev => {
      if (prev.includes(zoneId)) {
        return prev.filter(id => id !== zoneId);
      } else {
        return [...prev, zoneId];
      }
    });
  };

  return (
    <SonosContext.Provider
      value={{
        households,
        groups,
        favorites,
        currentGroup,
        playbackState,
        volume,
        isExpanded,
        currentPage,
        selectedZoneIds,
        setIsExpanded,
        setCurrentPage,
        setCurrentGroup,
        setVolume,
        setSelectedZoneIds,
        toggleZone,
        refreshState,
      }}
    >
      {children}
    </SonosContext.Provider>
  );
}

export function useSonos() {
  const context = useContext(SonosContext);
  if (context === undefined) {
    throw new Error("useSonos must be used within a SonosProvider");
  }
  return context;
}
