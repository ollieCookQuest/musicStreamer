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
"[project]/src/app/api/spotify/library/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
async function getSpotifyToken() {
    const account = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].account.findFirst({
        where: {
            service: "spotify"
        }
    });
    if (!account) {
        throw new Error("Spotify not connected");
    }
    // Check if token needs refresh
    if (account.expiresAt.getTime() <= Date.now() + 60000) {
        const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
        const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: account.refreshToken
            })
        });
        if (!response.ok) {
            throw new Error("Failed to refresh Spotify token");
        }
        const data = await response.json();
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].account.update({
            where: {
                id: account.id
            },
            data: {
                accessToken: data.access_token,
                expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000),
                refreshToken: data.refresh_token || account.refreshToken
            }
        });
        return data.access_token;
    }
    return account.accessToken;
}
async function spotifyRequest(endpoint) {
    const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Spotify API error: ${error}`);
    }
    return response.json();
}
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "playlists", "recent", "library", "search"
    const query = searchParams.get("q");
    try {
        if (type === "playlists") {
            const data = await spotifyRequest("/me/playlists?limit=50");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                items: data.items.map((playlist)=>({
                        id: {
                            objectId: playlist.uri,
                            serviceId: "9",
                            accountId: "sn_2"
                        },
                        name: playlist.name,
                        imageUrl: playlist.images?.[0]?.url,
                        images: playlist.images,
                        type: "playlist",
                        _objectType: "container",
                        description: `${playlist.tracks.total} tracks`
                    }))
            });
        }
        if (type === "recent") {
            const data = await spotifyRequest("/me/player/recently-played?limit=50");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                items: data.items.map((item)=>({
                        id: {
                            objectId: item.track.uri,
                            serviceId: "9",
                            accountId: "sn_2"
                        },
                        name: item.track.name,
                        imageUrl: item.track.album?.images?.[0]?.url,
                        images: item.track.album?.images,
                        type: "track",
                        _objectType: "track",
                        artist: {
                            name: item.track.artists.map((a)=>a.name).join(", ")
                        },
                        playedAt: item.played_at
                    }))
            });
        }
        if (type === "library") {
            const data = await spotifyRequest("/me/tracks?limit=50");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                items: data.items.map((item)=>({
                        id: {
                            objectId: item.track.uri,
                            serviceId: "9",
                            accountId: "sn_2"
                        },
                        name: item.track.name,
                        imageUrl: item.track.album?.images?.[0]?.url,
                        images: item.track.album?.images,
                        type: "track",
                        _objectType: "track",
                        artist: {
                            name: item.track.artists.map((a)=>a.name).join(", ")
                        }
                    }))
            });
        }
        if (type === "search" && query) {
            const data = await spotifyRequest(`/search?q=${encodeURIComponent(query)}&type=track,album,playlist,artist&limit=50`);
            const items = [
                ...(data.tracks?.items || []).map((track)=>({
                        id: {
                            objectId: track.uri,
                            serviceId: "9",
                            accountId: "sn_2"
                        },
                        name: track.name,
                        imageUrl: track.album?.images?.[0]?.url,
                        type: "track",
                        _objectType: "track",
                        artist: {
                            name: track.artists.map((a)=>a.name).join(", ")
                        }
                    })),
                ...(data.albums?.items || []).map((album)=>({
                        id: {
                            objectId: album.uri,
                            serviceId: "9",
                            accountId: "sn_2"
                        },
                        name: album.name,
                        imageUrl: album.images?.[0]?.url,
                        type: "album",
                        _objectType: "container",
                        artist: {
                            name: album.artists.map((a)=>a.name).join(", ")
                        }
                    })),
                ...(data.playlists?.items || []).map((playlist)=>({
                        id: {
                            objectId: playlist.uri,
                            serviceId: "9",
                            accountId: "sn_2"
                        },
                        name: playlist.name,
                        imageUrl: playlist.images?.[0]?.url,
                        type: "playlist",
                        _objectType: "container"
                    }))
            ];
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                items
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Invalid type"
        }, {
            status: 400
        });
    } catch (error) {
        console.error("Spotify API error:", error);
        if (error.message.includes("not connected")) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Spotify not connected",
                needsAuth: true
            }, {
                status: 401
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f1b57938._.js.map