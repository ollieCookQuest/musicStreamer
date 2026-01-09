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
    const refreshState = async ()=>{
        try {
            const res = await fetch("/api/sonos/state");
            if (!res.ok) return;
            const data = await res.json();
            setHouseholds(data.households || []);
            // Stable sort for groups to prevent jumping UI
            const sortedGroups = (data.groups || []).sort((a, b)=>a.name.localeCompare(b.name));
            setGroups(sortedGroups);
            // Stable sort for favorites
            const sortedFavorites = (data.favorites || []).sort((a, b)=>a.name.localeCompare(b.name));
            setFavorites(sortedFavorites);
            if (!currentGroup && data.groups?.length > 0) {
                setCurrentGroup(data.groups[0]);
            } else if (currentGroup) {
                // Update current group state from fresh groups list
                const updatedGroup = data.groups.find((g)=>g.id === currentGroup.id);
                if (updatedGroup) setCurrentGroup(updatedGroup);
            }
            if (currentGroup) {
                const [pbRes, volRes] = await Promise.all([
                    fetch(`/api/sonos/playback?groupId=${currentGroup.id}`),
                    fetch(`/api/sonos/volume?groupId=${currentGroup.id}`)
                ]);
                if (pbRes.ok) {
                    const pbData = await pbRes.json();
                    setPlaybackState(pbData);
                }
                if (volRes.ok) {
                    const volData = await volRes.json();
                    setVolumeState(volData.volume || 50);
                }
            }
        } catch (err) {
            console.error("Failed to fetch Sonos state", err);
        }
    };
    const setVolume = async (newVolume)=>{
        if (!currentGroup) return;
        setVolumeState(newVolume);
        await fetch(`/api/sonos/control?groupId=${currentGroup.id}&volume=${newVolume}`, {
            method: "POST"
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SonosProvider.useEffect": ()=>{
            refreshState();
            const interval = setInterval(refreshState, 5000); // Poll every 5 seconds
            return ({
                "SonosProvider.useEffect": ()=>clearInterval(interval)
            })["SonosProvider.useEffect"];
        }
    }["SonosProvider.useEffect"], [
        currentGroup?.id
    ]);
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
            setIsExpanded,
            setCurrentPage,
            setCurrentGroup,
            setVolume,
            refreshState
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/sonos-provider.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_s(SonosProvider, "+OaP0NrZ/b6N0mpzNA0tMbMPWvU=");
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
]);

//# sourceMappingURL=src_components_sonos-provider_tsx_0fee4bc1._.js.map