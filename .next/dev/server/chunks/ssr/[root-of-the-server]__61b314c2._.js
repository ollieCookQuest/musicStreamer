module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/components/sonos-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SonosProvider",
    ()=>SonosProvider,
    "useSonos",
    ()=>useSonos
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const SonosContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
// Helper to compare arrays/objects for equality
function deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== "object" || typeof b !== "object") return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA){
        if (!keysB.includes(key)) return false;
        if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
}
function SonosProvider({ children }) {
    const [households, setHouseholds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [groups, setGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [favorites, setFavorites] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentGroup, setCurrentGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [playbackState, setPlaybackState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [volume, setVolumeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(50);
    const [isExpanded, setIsExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Feed");
    const [selectedZoneIds, setSelectedZoneIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const isRefreshingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const currentGroupIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const currentGroupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const prevStateRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        households: [],
        groups: [],
        favorites: [],
        playbackState: null,
        volume: 50
    });
    // Keep ref in sync with state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        currentGroupRef.current = currentGroup;
    }, [
        currentGroup
    ]);
    // Save current zone preference
    const saveZonePreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (zoneId)=>{
        try {
            await fetch("/api/preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    key: "currentZoneId",
                    value: zoneId
                })
            });
        } catch (error) {
            console.error("Failed to save zone preference:", error);
        }
    }, []);
    // Save selected zones preference
    const saveSelectedZonesPreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (zoneIds)=>{
        try {
            await fetch("/api/preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    key: "selectedZoneIds",
                    value: JSON.stringify(zoneIds)
                })
            });
        } catch (error) {
            console.error("Failed to save selected zones preference:", error);
        }
    }, []);
    // Load saved zone preference
    const loadZonePreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
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
    const loadSelectedZonesPreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
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
    const refreshState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
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
            const sortedGroups = (data.groups || []).sort((a, b)=>a.name.localeCompare(b.name));
            // Only update groups if changed
            if (!deepEqual(prevStateRef.current.groups, sortedGroups)) {
                setGroups(sortedGroups);
                prevStateRef.current.groups = sortedGroups;
            }
            // Stable sort for favorites
            const sortedFavorites = (data.favorites || []).sort((a, b)=>a.name.localeCompare(b.name));
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
                    const validZoneIds = savedSelectedZoneIds.filter((id)=>data.groups.some((g)=>g.id === id));
                    if (validZoneIds.length > 0) {
                        setSelectedZoneIds(validZoneIds);
                        // Set current group to first selected zone
                        targetGroup = data.groups.find((g)=>g.id === validZoneIds[0]);
                    }
                }
                // If no saved selected zones, try saved current zone
                if (!targetGroup && savedZoneId) {
                    targetGroup = data.groups.find((g)=>g.id === savedZoneId);
                }
                // Use saved zone if found, otherwise use first group
                const firstGroup = targetGroup || data.groups[0];
                setCurrentGroup(firstGroup);
                // Initialize selectedZoneIds if not already set from saved preference
                if (savedSelectedZoneIds.length === 0) {
                    setSelectedZoneIds([
                        firstGroup.id
                    ]);
                }
            } else if (currentGroupValue) {
                // Update current group state from fresh groups list
                const updatedGroup = data.groups.find((g)=>g.id === currentGroupValue.id);
                if (updatedGroup && !deepEqual(currentGroupValue, updatedGroup)) {
                    setCurrentGroup(updatedGroup);
                    // Ensure selectedZoneIds includes the current group
                    if (!selectedZoneIds.includes(updatedGroup.id)) {
                        setSelectedZoneIds([
                            updatedGroup.id
                        ]);
                    }
                } else if (!updatedGroup) {
                    // Current group no longer exists, try to load saved preference or use first group
                    const savedZoneId = await loadZonePreference();
                    let targetGroup = null;
                    if (savedZoneId) {
                        targetGroup = data.groups.find((g)=>g.id === savedZoneId);
                    }
                    const fallbackGroup = targetGroup || data.groups[0];
                    if (fallbackGroup) {
                        setCurrentGroup(fallbackGroup);
                        setSelectedZoneIds([
                            fallbackGroup.id
                        ]);
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
                        const updatedGroups = (stateData.groups || []).sort((a, b)=>a.name.localeCompare(b.name));
                        setGroups(updatedGroups);
                        // Try to find group by name or use first available
                        const oldGroupName = currentGroupValue?.name;
                        const newGroup = oldGroupName ? updatedGroups.find((g)=>g.name === oldGroupName) : updatedGroups[0];
                        if (newGroup) {
                            setCurrentGroup(newGroup);
                            // Update selectedZoneIds to match new group
                            if (selectedZoneIds.includes(currentGroupValue.id)) {
                                setSelectedZoneIds([
                                    newGroup.id
                                ]);
                            }
                        } else if (updatedGroups.length > 0) {
                            setCurrentGroup(updatedGroups[0]);
                            setSelectedZoneIds([
                                updatedGroups[0].id
                            ]);
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
        } finally{
            isRefreshingRef.current = false;
        }
    }, [
        loadZonePreference,
        loadSelectedZonesPreference
    ]);
    const setVolume = async (newVolume)=>{
        if (!currentGroup) return;
        setVolumeState(newVolume);
        const res = await fetch(`/api/sonos/control?groupId=${currentGroup.id}&volume=${newVolume}`, {
            method: "POST"
        });
        if (res.status === 410) {
            // Group no longer exists, refresh state
            await refreshState();
        }
    };
    // Initial load
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        refreshState();
    }, []);
    // Set up polling interval (independent of state changes)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Poll every 10 seconds - less frequent updates
        const interval = setInterval(()=>{
            refreshState();
        }, 10000);
        return ()=>clearInterval(interval);
    }, []);
    // Refresh when group changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (currentGroup?.id) {
            refreshState();
        }
    }, [
        currentGroup?.id
    ]);
    // Keep selected zones in sync with current group and save preferences
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (currentGroup?.id) {
            // If no zones selected, or current group is not in selected zones, update it
            if (selectedZoneIds.length === 0 || !selectedZoneIds.includes(currentGroup.id)) {
                setSelectedZoneIds([
                    currentGroup.id
                ]);
            }
            // Save zone preference to database
            saveZonePreference(currentGroup.id);
        }
    }, [
        currentGroup?.id,
        saveZonePreference
    ]);
    // Save selected zones preference whenever it changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (selectedZoneIds.length > 0) {
            saveSelectedZonesPreference(selectedZoneIds);
        }
    }, [
        selectedZoneIds,
        saveSelectedZonesPreference
    ]);
    const toggleZone = (zoneId)=>{
        setSelectedZoneIds((prev)=>{
            if (prev.includes(zoneId)) {
                return prev.filter((id)=>id !== zoneId);
            } else {
                return [
                    ...prev,
                    zoneId
                ];
            }
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SonosContext.Provider, {
        value: {
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
            refreshState
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/sonos-provider.tsx",
        lineNumber: 362,
        columnNumber: 5
    }, this);
}
function useSonos() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(SonosContext);
    if (context === undefined) {
        throw new Error("useSonos must be used within a SonosProvider");
    }
    return context;
}
}),
"[project]/src/components/device-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DeviceProvider",
    ()=>DeviceProvider,
    "useDevice",
    ()=>useDevice
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const DeviceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const DEVICE_CONFIGS = {
    theWall: {
        name: "TheWall",
        screenSize: "10.1\"",
        resolution: "1280×800",
        orientation: "landscape"
    },
    theDesk: {
        name: "TheDesk",
        screenSize: "10.1\"",
        resolution: "1280×800",
        orientation: "landscape"
    }
};
function DeviceProvider({ children }) {
    const [deviceType, setDeviceType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadDevice = async ()=>{
            try {
                const res = await fetch("/api/preferences?key=deviceType");
                if (res.ok) {
                    const data = await res.json();
                    if (data.value && (data.value === "theWall" || data.value === "theDesk")) {
                        setDeviceType(data.value);
                    }
                }
            } catch (error) {
                console.error("Failed to load device preference:", error);
            } finally{
                setIsLoading(false);
            }
        };
        loadDevice();
    }, []);
    const deviceConfig = deviceType ? DEVICE_CONFIGS[deviceType] : null;
    // Utility function to get device-specific classes
    const deviceClass = (classes)=>{
        if (!deviceType) return typeof classes === "string" ? classes : "";
        if (typeof classes === "string") {
            // If it's a string, return as-is (device-specific overrides can be added via CSS)
            return classes;
        }
        // If it's an object, return the class for the current device
        return classes[deviceType] || classes.default || "";
    };
    // Apply device-specific class to html element for CSS targeting
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (deviceType) {
            document.documentElement.setAttribute("data-device", deviceType);
        } else {
            document.documentElement.removeAttribute("data-device");
        }
    }, [
        deviceType
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DeviceContext.Provider, {
        value: {
            deviceType,
            isLoading,
            deviceConfig,
            deviceClass
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/device-provider.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
function useDevice() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(DeviceContext);
    if (context === undefined) {
        throw new Error("useDevice must be used within a DeviceProvider");
    }
    return context;
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__61b314c2._.js.map