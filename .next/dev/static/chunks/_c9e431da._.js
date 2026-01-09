(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/sonos-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SonosProvider",
    ()=>SonosProvider,
    "useSonos",
    ()=>useSonos
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const SonosContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
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
    _s();
    const [households, setHouseholds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [groups, setGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [favorites, setFavorites] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentGroup, setCurrentGroup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [playbackState, setPlaybackState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [volume, setVolumeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(50);
    const [isExpanded, setIsExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentPage, setCurrentPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Feed");
    const [selectedZoneIds, setSelectedZoneIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const isRefreshingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const currentGroupIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const currentGroupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const prevStateRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        households: [],
        groups: [],
        favorites: [],
        playbackState: null,
        volume: 50
    });
    // Keep ref in sync with state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SonosProvider.useEffect": ()=>{
            currentGroupRef.current = currentGroup;
        }
    }["SonosProvider.useEffect"], [
        currentGroup
    ]);
    // Save current zone preference
    const saveZonePreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SonosProvider.useCallback[saveZonePreference]": async (zoneId)=>{
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
        }
    }["SonosProvider.useCallback[saveZonePreference]"], []);
    // Save selected zones preference
    const saveSelectedZonesPreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SonosProvider.useCallback[saveSelectedZonesPreference]": async (zoneIds)=>{
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
        }
    }["SonosProvider.useCallback[saveSelectedZonesPreference]"], []);
    // Load saved zone preference
    const loadZonePreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SonosProvider.useCallback[loadZonePreference]": async ()=>{
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
        }
    }["SonosProvider.useCallback[loadZonePreference]"], []);
    // Load saved selected zones preference
    const loadSelectedZonesPreference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SonosProvider.useCallback[loadSelectedZonesPreference]": async ()=>{
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
        }
    }["SonosProvider.useCallback[loadSelectedZonesPreference]"], []);
    const refreshState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "SonosProvider.useCallback[refreshState]": async ()=>{
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
                const sortedGroups = (data.groups || []).sort({
                    "SonosProvider.useCallback[refreshState].sortedGroups": (a, b)=>a.name.localeCompare(b.name)
                }["SonosProvider.useCallback[refreshState].sortedGroups"]);
                // Only update groups if changed
                if (!deepEqual(prevStateRef.current.groups, sortedGroups)) {
                    setGroups(sortedGroups);
                    prevStateRef.current.groups = sortedGroups;
                }
                // Stable sort for favorites
                const sortedFavorites = (data.favorites || []).sort({
                    "SonosProvider.useCallback[refreshState].sortedFavorites": (a, b)=>a.name.localeCompare(b.name)
                }["SonosProvider.useCallback[refreshState].sortedFavorites"]);
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
                        const validZoneIds = savedSelectedZoneIds.filter({
                            "SonosProvider.useCallback[refreshState].validZoneIds": (id)=>data.groups.some({
                                    "SonosProvider.useCallback[refreshState].validZoneIds": (g)=>g.id === id
                                }["SonosProvider.useCallback[refreshState].validZoneIds"])
                        }["SonosProvider.useCallback[refreshState].validZoneIds"]);
                        if (validZoneIds.length > 0) {
                            setSelectedZoneIds(validZoneIds);
                            // Set current group to first selected zone
                            targetGroup = data.groups.find({
                                "SonosProvider.useCallback[refreshState]": (g)=>g.id === validZoneIds[0]
                            }["SonosProvider.useCallback[refreshState]"]);
                        }
                    }
                    // If no saved selected zones, try saved current zone
                    if (!targetGroup && savedZoneId) {
                        targetGroup = data.groups.find({
                            "SonosProvider.useCallback[refreshState]": (g)=>g.id === savedZoneId
                        }["SonosProvider.useCallback[refreshState]"]);
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
                    const updatedGroup = data.groups.find({
                        "SonosProvider.useCallback[refreshState].updatedGroup": (g)=>g.id === currentGroupValue.id
                    }["SonosProvider.useCallback[refreshState].updatedGroup"]);
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
                            targetGroup = data.groups.find({
                                "SonosProvider.useCallback[refreshState]": (g)=>g.id === savedZoneId
                            }["SonosProvider.useCallback[refreshState]"]);
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
                            const updatedGroups = (stateData.groups || []).sort({
                                "SonosProvider.useCallback[refreshState].updatedGroups": (a, b)=>a.name.localeCompare(b.name)
                            }["SonosProvider.useCallback[refreshState].updatedGroups"]);
                            setGroups(updatedGroups);
                            // Try to find group by name or use first available
                            const oldGroupName = currentGroupValue?.name;
                            const newGroup = oldGroupName ? updatedGroups.find({
                                "SonosProvider.useCallback[refreshState]": (g)=>g.name === oldGroupName
                            }["SonosProvider.useCallback[refreshState]"]) : updatedGroups[0];
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
        }
    }["SonosProvider.useCallback[refreshState]"], [
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SonosProvider.useEffect": ()=>{
            refreshState();
        }
    }["SonosProvider.useEffect"], []);
    // Set up polling interval (independent of state changes)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SonosProvider.useEffect": ()=>{
            // Poll every 10 seconds - less frequent updates
            const interval = setInterval({
                "SonosProvider.useEffect.interval": ()=>{
                    refreshState();
                }
            }["SonosProvider.useEffect.interval"], 10000);
            return ({
                "SonosProvider.useEffect": ()=>clearInterval(interval)
            })["SonosProvider.useEffect"];
        }
    }["SonosProvider.useEffect"], []);
    // Refresh when group changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SonosProvider.useEffect": ()=>{
            if (currentGroup?.id) {
                refreshState();
            }
        }
    }["SonosProvider.useEffect"], [
        currentGroup?.id
    ]);
    // Keep selected zones in sync with current group and save preferences
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SonosProvider.useEffect": ()=>{
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
        }
    }["SonosProvider.useEffect"], [
        currentGroup?.id,
        saveZonePreference
    ]);
    // Save selected zones preference whenever it changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SonosProvider.useEffect": ()=>{
            if (selectedZoneIds.length > 0) {
                saveSelectedZonesPreference(selectedZoneIds);
            }
        }
    }["SonosProvider.useEffect"], [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SonosContext.Provider, {
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
_s(SonosProvider, "08p1xg/qwmpbibtGt/RsbEZu7zU=");
_c = SonosProvider;
function useSonos() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SonosContext);
    if (context === undefined) {
        throw new Error("useSonos must be used within a SonosProvider");
    }
    return context;
}
_s1(useSonos, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "SonosProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/device-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DeviceProvider",
    ()=>DeviceProvider,
    "useDevice",
    ()=>useDevice
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const DeviceContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
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
    _s();
    const [deviceType, setDeviceType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeviceProvider.useEffect": ()=>{
            const loadDevice = {
                "DeviceProvider.useEffect.loadDevice": async ()=>{
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
                }
            }["DeviceProvider.useEffect.loadDevice"];
            loadDevice();
        }
    }["DeviceProvider.useEffect"], []);
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DeviceProvider.useEffect": ()=>{
            if (deviceType) {
                document.documentElement.setAttribute("data-device", deviceType);
            } else {
                document.documentElement.removeAttribute("data-device");
            }
        }
    }["DeviceProvider.useEffect"], [
        deviceType
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DeviceContext.Provider, {
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
_s(DeviceProvider, "sAy9OvK4MLexTB4G1CL+IvT4+Qc=");
_c = DeviceProvider;
function useDevice() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(DeviceContext);
    if (context === undefined) {
        throw new Error("useDevice must be used within a DeviceProvider");
    }
    return context;
}
_s1(useDevice, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "DeviceProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=_c9e431da._.js.map