module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = /*TURBOPACK member replacement*/ __turbopack_context__.g;
const prisma = globalForPrisma.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        "query"
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/lib/sonos.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addToFavorites",
    ()=>addToFavorites,
    "browseMusicService",
    ()=>browseMusicService,
    "exchangeCode",
    ()=>exchangeCode,
    "fetchFavorites",
    ()=>fetchFavorites,
    "fetchGroups",
    ()=>fetchGroups,
    "fetchHouseholds",
    ()=>fetchHouseholds,
    "getAuthUrl",
    ()=>getAuthUrl,
    "getMusicServiceAccounts",
    ()=>getMusicServiceAccounts,
    "getMusicServiceMetadata",
    ()=>getMusicServiceMetadata,
    "getPlaybackMetadata",
    ()=>getPlaybackMetadata,
    "getPlaybackStatus",
    ()=>getPlaybackStatus,
    "getValidToken",
    ()=>getValidToken,
    "getVolume",
    ()=>getVolume,
    "loadFavorite",
    ()=>loadFavorite,
    "playItem",
    ()=>playItem,
    "searchMusicService",
    ()=>searchMusicService,
    "seek",
    ()=>seek,
    "sendControl",
    ()=>sendControl,
    "setVolume",
    ()=>setVolume
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
const CLIENT_ID = process.env.SONOS_CLIENT_ID;
const CLIENT_SECRET = process.env.SONOS_CLIENT_SECRET;
const CALLBACK_URL = process.env.SONOS_CALLBACK_URL;
const BASE_URL = "https://api.ws.sonos.com/control/api/v1";
const AUTH_URL = "https://api.sonos.com/login/v3/oauth";
const TOKEN_URL = "https://api.sonos.com/login/v3/oauth/access";
function getAuthUrl() {
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        state: "sonos-auth",
        scope: "playback-control-all",
        redirect_uri: CALLBACK_URL
    });
    return `${AUTH_URL}?${params.toString()}`;
}
async function exchangeCode(code) {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${auth}`
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: CALLBACK_URL
        })
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to exchange code: ${error}`);
    }
    const data = await response.json();
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].account.create({
        data: {
            service: "sonos",
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: new Date(Date.now() + data.expires_in * 1000)
        }
    });
    return data;
}
async function getValidToken() {
    const account = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].account.findFirst({
        where: {
            service: "sonos"
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    if (!account) return null;
    if (account.expiresAt.getTime() > Date.now() + 60000) {
        return account.accessToken;
    }
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${auth}`
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: account.refreshToken
        })
    });
    if (!response.ok) {
        throw new Error("Failed to refresh token");
    }
    const data = await response.json();
    const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].account.update({
        where: {
            id: account.id
        },
        data: {
            accessToken: data.access_token,
            refreshToken: data.refresh_token || account.refreshToken,
            expiresAt: new Date(Date.now() + data.expires_in * 1000)
        }
    });
    return updated.accessToken;
}
async function sonosRequest(endpoint, options = {}) {
    const token = await getValidToken();
    if (!token) throw new Error("No valid token");
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Sonos API error: ${error}`);
    }
    return response.json();
}
async function fetchHouseholds() {
    return sonosRequest("/households");
}
async function fetchGroups(householdId) {
    return sonosRequest(`/households/${householdId}/groups`);
}
async function fetchFavorites(householdId) {
    return sonosRequest(`/households/${householdId}/favorites`);
}
async function getPlaybackStatus(groupId) {
    return sonosRequest(`/groups/${groupId}/playback`);
}
async function getPlaybackMetadata(groupId) {
    return sonosRequest(`/groups/${groupId}/playbackMetadata`);
}
async function loadFavorite(groupId, favoriteId) {
    return sonosRequest(`/groups/${groupId}/favorites`, {
        method: "POST",
        body: JSON.stringify({
            favoriteId,
            action: "replace"
        })
    });
}
async function sendControl(groupId, command) {
    return sonosRequest(`/groups/${groupId}/playback/${command}`, {
        method: "POST"
    });
}
async function getVolume(groupId) {
    return sonosRequest(`/groups/${groupId}/groupVolume`);
}
async function setVolume(groupId, volume) {
    return sonosRequest(`/groups/${groupId}/groupVolume`, {
        method: "POST",
        body: JSON.stringify({
            volume
        })
    });
}
async function seek(groupId, positionMillis) {
    return sonosRequest(`/groups/${groupId}/playback/seek`, {
        method: "POST",
        body: JSON.stringify({
            positionMillis
        })
    });
}
async function getMusicServiceAccounts(householdId) {
    return sonosRequest(`/households/${householdId}/musicServiceAccounts`);
}
async function searchMusicService(householdId, accountId, term, serviceId) {
    return sonosRequest(`/households/${householdId}/musicServiceAccounts/${accountId}/search`, {
        method: "POST",
        body: JSON.stringify({
            term,
            serviceId
        })
    });
}
async function getMusicServiceMetadata(householdId, accountId, itemId, serviceId) {
    return sonosRequest(`/households/${householdId}/musicServiceAccounts/${accountId}/getMetadata`, {
        method: "POST",
        body: JSON.stringify({
            itemId: {
                _objectType: "universalMusicObjectId",
                serviceId,
                objectId: itemId,
                accountId
            }
        })
    });
}
async function browseMusicService(householdId, musicServiceId, accountId, containerId) {
    // Control API doesn't support direct browsing, so we'll use search instead
    // For Spotify, we can search for common categories
    if (!containerId) {
        // Return common Spotify categories
        return {
            containers: [
                {
                    name: "Your Library",
                    type: "library",
                    id: {
                        objectId: "library",
                        serviceId: musicServiceId,
                        accountId
                    }
                },
                {
                    name: "Search",
                    type: "search",
                    id: {
                        objectId: "search",
                        serviceId: musicServiceId,
                        accountId
                    }
                },
                {
                    name: "Made for You",
                    type: "made-for-you",
                    id: {
                        objectId: "made-for-you",
                        serviceId: musicServiceId,
                        accountId
                    }
                }
            ]
        };
    }
    // For specific containers, try to get metadata
    try {
        const metadata = await getMusicServiceMetadata(householdId, accountId, containerId, musicServiceId);
        return metadata;
    } catch (error) {
        // If metadata fails, return empty
        return {
            containers: [],
            items: []
        };
    }
}
async function playItem(groupId, itemId, serviceId, accountId, action = "replace") {
    return sonosRequest(`/groups/${groupId}/playback/playItem`, {
        method: "POST",
        body: JSON.stringify({
            itemId: {
                _objectType: "universalMusicObjectId",
                serviceId,
                objectId: itemId,
                accountId
            },
            action
        })
    });
}
async function addToFavorites(householdId, itemId, serviceId, accountId, name) {
    return sonosRequest(`/households/${householdId}/favorites`, {
        method: "POST",
        body: JSON.stringify({
            itemId: {
                _objectType: "universalMusicObjectId",
                serviceId,
                objectId: itemId,
                accountId
            },
            name
        })
    });
}
}),
"[project]/src/app/api/sonos/library/action/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sonos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sonos.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action"); // "play" or "favorite"
    const groupId = searchParams.get("groupId");
    try {
        const body = await request.json();
        const { itemId, serviceId, accountId, name } = body;
        if (action === "play") {
            if (!groupId || !itemId || !serviceId || !accountId) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Missing required parameters"
                }, {
                    status: 400
                });
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sonos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["playItem"])(groupId, itemId, serviceId, accountId, body.playAction || "replace");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true
            });
        } else if (action === "favorite") {
            const householdsData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sonos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchHouseholds"])();
            const households = householdsData.households;
            if (!households || households.length === 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "No households found"
                }, {
                    status: 404
                });
            }
            const householdId = households[0].id;
            if (!itemId || !serviceId || !accountId || !name) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Missing required parameters"
                }, {
                    status: 400
                });
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sonos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addToFavorites"])(householdId, itemId, serviceId, accountId, name);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true
            });
        } else {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Invalid action"
            }, {
                status: 400
            });
        }
    } catch (error) {
        console.error("Library action API error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to perform action"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__608a31ca._.js.map